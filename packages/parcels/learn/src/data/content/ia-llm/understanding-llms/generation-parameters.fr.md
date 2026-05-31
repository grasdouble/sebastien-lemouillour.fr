---
id: generation-parameters
order: 23
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Quand un workflow passe d’un JSON propre à un résultat coupé ou absurde, beaucoup réécrivent le prompt. Moi, je regarde d’abord les paramètres de décodage. J’ai perdu trop d’heures à accuser le wording alors que le vrai bug venait d’une `temperature` laissée au hasard, d’une limite de tokens minuscule, ou d’un preset copié qui ne voulait pas dire la même chose chez un autre fournisseur.

## La première correction, c’est d’arrêter de faire confiance aux défauts

Les valeurs par défaut sont des choix produit, pas des bonnes pratiques universelles. Dans les [Messages examples](https://docs.anthropic.com/en/api/messages-examples) d’Anthropic, Claude Opus 4.7 et les versions suivantes refusent `temperature`, `top_p` et `top_k` hors valeur par défaut, alors que [Transformers strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies) documente le décodage greedy comme comportement par défaut et l’échantillonnage comme quelque chose qu’on active volontairement.

C’est pour ça que je traite les paramètres de génération comme une partie du contrat de l’application. Si la tâche sert à extraire, router ou appeler des outils, je veux une requête ennuyeuse volontairement. Si la tâche sert à produire des idées, alors j’achète de la variation consciemment au lieu de la laisser entrer par défaut.

## Régler un seul bouton d’aléatoire avant le reste

Ma position est simple : je change d’abord `temperature` et je laisse `top_p` à `1` tant que je ne peux pas décrire un vrai problème de queue de distribution. L’[API Responses](https://platform.openai.com/docs/api-reference/responses/create) d’OpenAI documente `temperature`, `top_p`, `max_output_tokens` et `stop`, et présente `top_p` comme une alternative à la température, pas comme son compagnon obligatoire.

Pour de l’extraction, de la classification ou des appels d’outils, je démarre autour de `0` à `0.2`. Pour explorer des variantes marketing, je peux monter vers `0.7` ou `0.9`, mais seulement si je suis prêt à relire plusieurs candidats.

C’est le genre de requête avec lequel je commencerais pour une tâche structurée.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Extract the company name and country as JSON.',
  temperature: 0.1, // garder un échantillonnage serré
  top_p: 1, // régler un seul contrôle d’aléatoire d’abord
  max_output_tokens: 120, // assez de place pour une sortie valide
});
```

## Contrôler la longueur avant d’accuser le style

`max_output_tokens` et `stop` ne sont pas des détails cosmétiques. Ils décident si le modèle a assez de place pour terminer et à quel endroit il a le droit de s’arrêter. Je vois souvent des équipes débattre de créativité alors qu’une limite trop basse coupe silencieusement la réponse.

Si j’ai besoin d’une structure stricte, je préfère un schéma à une séquence `stop` soi-disant astucieuse. Les [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) d’OpenAI disent qu’une sortie basée sur JSON Schema peut faire respecter le schéma et rendre les refus détectables par programme, ce qui est plus sûr pour les automatisations que d’espérer qu’un prompt et une séquence d’arrêt coopèrent toujours.

C’est le pattern que je préfère quand la variation est le but mais que la forme doit rester bornée.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Give me 8 landing page headline options for a privacy-first note app.',
  temperature: 0.8, // ajouter de la variation volontairement
  top_p: 1, // laisser le nucleus sampling neutre pour mieux débugger
  max_output_tokens: 220, // plafonner le coût de revue
});
```

## Les contrôles de répétition sont des outils de réparation

Transformers explique que le décodage greedy finit souvent par se répéter sur les sorties longues, alors que l’échantillonnage est ce qu’on active quand on veut un texte plus divers. C’est pour ça que je ne commence pas par les pénalités de répétition. Si le modèle boucle, je regarde d’abord la tâche, le contexte et la limite avant d’empiler des rustines.

## Les coûts et les limites punissent les réglages brouillons

Des caps plus longs, plus de retries et des expériences plus larges ne changent pas seulement le ton. Ils mangent votre budget de tokens et vous rapprochent des limites du fournisseur. Le [guide rate limits](https://platform.openai.com/docs/guides/rate-limits) d’OpenAI suit les RPM, TPM, RPD et TPD, et c’est un bon rappel qu’un tuning désordonné a un coût opérationnel bien avant que la finance le remarque.

Ma règle de décision est ennuyeuse volontairement : si la tâche a une seule bonne forme, commence avec une température basse, `top_p: 1`, et une limite assez large pour éviter la coupe. Si la tâche a besoin de variation, monte d’abord la température. Si tu ne peux pas nommer le problème précis qu’un paramètre corrige, ne touche pas à ce paramètre.
