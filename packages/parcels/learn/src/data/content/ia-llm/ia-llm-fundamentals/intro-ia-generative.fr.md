---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [IA, LLM]
---

Un développeur rédige une réponse de FAQ support en quelques secondes. Un designer génère une maquette rapide à partir d'un prompt texte. Les résultats paraissent différents, mais l'idée de fond est la même : un logiciel capable de produire du contenu nouveau au lieu de seulement appliquer des règles fixes.

## Qu'est-ce que l'IA générative ?

L'IA générative désigne des systèmes capables de créer du contenu original : texte, image, code, audio. Ce qui les distingue des programmes classiques, c'est qu'ils n'exécutent pas de règles définies à l'avance — ils ont _appris_ à partir de milliards d'exemples.

Imaginez un musicien qui a écouté des milliers de morceaux : il n'improvise pas au hasard, mais s'appuie sur tout ce qu'il a intégré. Les modèles génératifs fonctionnent sur le même principe, avec du texte plutôt que des notes.

## Les modèles de langage (LLMs)

Un **LLM** (Large Language Model) est le type de modèle derrière ChatGPT, Claude ou Gemini. Entraîné sur des milliards de textes (livres, articles, code source), il a appris à prédire et générer du langage de façon cohérente.

### Quatre concepts à retenir

- **Token** — le texte est découpé en petits morceaux appelés tokens (environ un mot ou une syllabe). C'est l'unité de traitement du modèle.
- **Fenêtre de contexte** — la quantité de texte que le modèle peut « voir » en même temps. Au-delà, il oublie. GPT-4o peut traiter l'équivalent d'environ 300 pages en une seule requête.
- **Temperature** — un curseur entre précision et créativité. À 0, le modèle est très prévisible ; à 1, il est plus inventif mais moins fiable.
- **Prompt** — le message que vous envoyez pour donner une tâche au modèle. La façon dont vous le formulez a un impact direct sur la qualité de la réponse.

Ces quatre idées expliquent l'essentiel de ce que vous observez en pratique : pourquoi les prompts comptent, pourquoi les longues conversations coûtent plus cher, et pourquoi une même question peut produire des réponses légèrement différentes.

## Comment interagir avec un LLM ?

La manière la plus directe d'interagir avec un LLM consiste à appeler l'API d'un fournisseur. Vous envoyez un message structuré, vous recevez une réponse texte — voici à quoi cela ressemble :

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a concise technical assistant.' },
      { role: 'user', content: 'Explain LLMs in 3 sentences.' },
    ],
    temperature: 0.3,
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

Trois paramètres clés à comprendre :

- **`model`** — le modèle à utiliser (chaque modèle a ses propres capacités et coûts)
- **`messages`** — la conversation : `system` définit le comportement du modèle, `user` contient votre demande
- **`temperature`** — ici à 0.3 pour des réponses cohérentes et factuelles

## Les limites à connaître

Les LLMs sont puissants, mais ils ont des contraintes importantes qu'il faut anticiper :

- **Pas de mémoire persistante** — chaque appel API repart de zéro ; si votre chatbot a besoin de l'historique de la conversation, vous devez le renvoyer à chaque requête.
- **Données gelées** — le modèle ne sait que ce qui existait au moment de son entraînement ; il ne peut donc pas répondre sur votre dernière page de tarifs ou sur un incident d'hier sauf si vous lui fournissez ces informations ou un outil.
- **Hallucinations** — le modèle peut générer des informations plausibles mais fausses, ce qui signifie qu'une réponse assurée ne suffit pas quand le résultat affecte un client, un paiement ou une décision technique.

## Et ensuite ?

Les guides suivants de ce catalogue approfondissent ces sujets :

- **Prompt engineering** — comment formuler des instructions efficaces pour obtenir de meilleurs résultats
- **RAG** — comment connecter un LLM à vos propres données pour dépasser la limite des données gelées
- **Agents** — comment donner des outils et de l'autonomie à un LLM pour qu'il agisse dans le monde réel
