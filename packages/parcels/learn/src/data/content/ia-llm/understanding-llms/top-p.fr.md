---
id: top-p
order: 22
difficulty: intermediate
tags: [llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

Quand un modèle est globalement bon mais qu’une réponse sur quelques-unes attrape un mot bizarre et entraîne tout le ton avec lui, baisser la température donne souvent l’impression de punir toute la réponse pour un seul mauvais token de queue. C’est là que je prends le top-p.

## Le top-p coupe la queue de probabilité, pas toute l’ambiance

Le [papier Holtzman](https://arxiv.org/abs/1904.09751) a introduit le nucleus sampling pour couper la queue peu fiable de la distribution du token suivant. Dans les [docs Transformers](https://huggingface.co/docs/transformers/en/main_classes/text_generation), `top_p` conserve seulement le plus petit ensemble de tokens dont la probabilité cumulée atteint `p`, donc le pool de candidats rétrécit quand le modèle est confiant et s’élargit quand il ne l’est pas. C’est pour ça que je le préfère au top-k sur les APIs hébergées: le seuil s’adapte à l’étape au lieu de prétendre que chaque position de token mérite le même budget.

Quand je veux moins de risque dans la queue sans tuer le ton, je pars d’une requête comme celle-ci.

```ts
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Écris 5 slogans pour une application de budget.',
  temperature: 0.7, // garde un ton vivant
  top_p: 0.9, // coupe les tokens peu probables dans la queue
  max_output_tokens: 80, // limite le coût de revue
});

console.log(response.output_text);
```

## Quand je le change, et quand je le laisse tranquille

Le guide [text generation](https://platform.openai.com/docs/guides/text-generation) d’OpenAI et le [parameter guide](https://docs.anthropic.com/claude/docs/guide-to-parameters) d’Anthropic présentent tous les deux `top_p` comme un contrôle d’échantillonnage, et Anthropic recommande explicitement de modifier soit `temperature`, soit `top_p`, pas les deux. Je suis ce conseil. Si le niveau global de créativité est déjà bon, je laisse la température tranquille et j’utilise le top-p pour nettoyer les détours lexicaux bizarres ou les formulations instables. Si toute la réponse est trop folle ou trop plate, la température reste le meilleur premier levier.

| `top_p`             | Ce qui passe encore                                  | Ce que ça donne en pratique                                                    | Mon choix par rapport à la température                                                                |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `1`                 | Toute la distribution reste disponible               | Aucun filtre nucleus; seule la température façonne vraiment le ton             | Je garde ça tant que j’évalue encore le niveau global de créativité                                   |
| `0.95`–`0.9`        | On coupe surtout le bout le plus faible de la traîne | Même voix d’ensemble, avec moins de détours bizarres                           | Mon réglage par défaut quand la réponse est bonne mais qu’un mot de temps en temps part de travers    |
| `0.9`–`0.8`         | Nucleus sensiblement plus serré                      | Formulation plus tenue, moins de flottement lexical, encore un peu d’énergie   | Je tente ça avant de baisser la température si je veux garder la même ambiance                        |
| En dessous de `0.8` | Coupure agressive                                    | Sortie plus sage, plus plate, et plus susceptible de masquer un autre problème | Seulement pour un vrai problème de traîne; si toute la réponse est mauvaise, je change la température |

Ça rend aussi le débogage plus propre. Chaque retry supplémentaire consomme plus de tokens face aux [rate limits](https://platform.openai.com/docs/guides/rate-limits) du provider et ajoute du travail de revue, donc je préfère un seul changement d’échantillonnage bien contrôlé à trois réglages empilés puis une après-midi à deviner lequel a aidé.

## L’erreur que je vois encore

Beaucoup de gens traitent un `top_p` plus bas comme un interrupteur de sécurité. Ce n’est pas le cas. Ça resserre le pool de candidats, mais ça ne vérifie ni les faits, ni le contenu risqué, ni un workflow qui ne peut pas tolérer une mauvaise réponse. Si une mauvaise sortie coûte cher, gardez une modération ou une validation en aval; le [Moderation guide](https://platform.openai.com/docs/guides/moderation) existe pour une raison.

Ma position: sur les APIs hébergées, j’essaie en général `top_p: 0.9` avant de toucher à la température. Si vous avez envie de passer sous `0.8`, assurez-vous de corriger un vrai problème de queue et pas de masquer un problème de prompt, de contexte ou de sécurité.
