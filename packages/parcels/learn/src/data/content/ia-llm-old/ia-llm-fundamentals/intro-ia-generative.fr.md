---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [llm]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

Vous collez un message client agacé dans ChatGPT et, cinq secondes plus tard, vous avez déjà une réponse support présentable. Votre collègue designer tape une idée dans un générateur d'images et obtient quelque chose d'utilisable avant même que vous ayez fini votre café. Des outils différents, des résultats différents, mais le même léger vertige : un logiciel qui crée, plutôt qu'un logiciel qui obéit.

C'est précisément pour ça que l'IA générative mérite votre attention. Si vous développez, vous n'avez pas besoin des maths dès le premier jour, mais vous avez besoin d'un modèle mental fiable avant de construire quoi que ce soit de sérieux avec elle.

## Pas des règles, des patterns

Un programme classique fait exactement ce qu'on lui dit de faire. Une fonction qui valide un email ne « comprend » pas les emails : elle applique une regex. L'IA générative fonctionne autrement. Au lieu d'écrire les règles à la main, on entraîne un modèle sur d'énormes volumes d'exemples jusqu'à ce qu'il apprenne des patterns assez bien pour en produire de nouveaux.

L'analogie du musicien de jazz m'aide encore ici. Après des années d'écoute et de pratique, il n'improvise pas au hasard. Il s'appuie sur des patterns absorbés et assemble quelque chose de nouveau. Les modèles génératifs font quelque chose d'approchant avec du texte, des images, de l'audio ou du code.

## Un LLM, concrètement

Un **LLM** (Large Language Model) est la partie qui génère du texte dans des outils comme ChatGPT, Claude ou Gemini. En langage simple, il prédit en permanence quel texte devrait venir ensuite.

Si ça vous paraît encore abstrait, pas d'inquiétude. En général, tout devient plus clair quand on voit les quelques éléments qui façonnent chaque réponse.

Quatre concepts expliquent l'essentiel de ce que vous allez remarquer en pratique :

- **Token** : les modèles traitent le texte par morceaux appelés [tokens](https://developers.openai.com/api/docs/concepts). Les prompts longs coûtent plus cher parce que votre entrée et la sortie du modèle sont toutes les deux comptées.
- **Fenêtre de contexte** : c'est la quantité de texte que le modèle peut « voir » dans une requête. C'est sa mémoire de travail pour cet appel. Sur la page actuelle de [GPT-4o](https://developers.openai.com/api/docs/models/gpt-4o), OpenAI indique une fenêtre de contexte de 128K tokens.
- **Temperature** : le réglage [temperature](https://developers.openai.com/api/docs/api-reference/responses/create) contrôle le niveau d'aléa. Des valeurs basses rendent la sortie plus régulière. Des valeurs plus hautes la rendent plus variée. Pour du travail factuel ou structuré, je la garde basse.
- **Prompt** : c'est l'instruction que vous envoyez. Ça compte beaucoup plus que la plupart des débutants l'imaginent. Le même modèle avec un prompt différent peut se comporter très différemment, donc bien formuler sa demande est une vraie compétence.

## À quoi ressemble un appel API

Le plus simple pour rendre tout ça concret, c'est d'envoyer vous-même une requête. OpenAI recommande maintenant la [Responses API](https://developers.openai.com/api/docs/guides/text-generation) pour les nouvelles applications de génération de texte, donc c'est la forme que j'apprendrais en premier.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.responses.create({
  model: 'gpt-4o',
  instructions: 'You are a concise technical assistant.',
  input: 'Explain LLMs in 3 sentences.',
  temperature: 0.3,
});

console.log(response.output_text);
```

Quatre éléments comptent tout de suite ici :

- **`model`** : vous choisissez quel modèle traite la requête. Capacités, latence et prix varient beaucoup, donc je n'utiliserais pas le plus gros modèle pour tous les cas.
- **`instructions`** : c'est là que vous fixez le comportement de l'assistant.
- **`input`** : c'est la tâche ou la question réelle à traiter.
- **`temperature`** : 0,3 est un bon point de départ quand vous voulez des réponses stables. Pour du brainstorming, je la monterais davantage.

## Les points qui piègent le plus souvent

Ce sont les limites qu'on m'aurait fait gagner du temps à comprendre plus tôt.

**Pas de mémoire automatique sauf si vous la demandez.** Une requête simple repart sans mémoire. Si vous voulez de la continuité, vous devez soit renvoyer les tours précédents, soit utiliser [conversation state](https://developers.openai.com/api/docs/guides/conversation-state).

**La fraîcheur de l'info reste votre problème.** Le modèle ne va pas connaître magiquement votre dernier déploiement, la panne d'hier ou un document privé. Si vous avez besoin de faits récents ou privés, vous devez les fournir, souvent via [file search](https://developers.openai.com/api/docs/guides/tools-file-search) ou votre propre couche de retrieval, c'est-à-dire une étape qui va chercher les documents utiles pour le modèle.

**Les hallucinations sont normales, pas un cas bizarre.** Le [GPT-4 report](https://cdn.openai.com/papers/gpt-4.pdf) reste un très bon rappel : ces systèmes peuvent avoir l'air sûrs d'eux et pourtant se tromper. Je traite la sortie du modèle comme un brouillon tant que je n'ai pas vérifié ce qui compte.

## Là où j'irais ensuite

Si je commençais aujourd'hui, j'apprendrais d'abord le prompting parce que c'est le levier le moins coûteux. J'ajouterais de la retrieval dès que la fraîcheur des informations devient importante, et je ne passerais aux agents qu'au moment où un prompt simple plus de la retrieval ne suffit plus. Ma règle est simple : si le coût d'une erreur est élevé, je vérifie avant de faire confiance. Si tout ça commence à cliquer, le guide que je lirais ensuite est celui sur le prompting.
