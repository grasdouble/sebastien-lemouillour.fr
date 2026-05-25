## Qu'est-ce que l'IA générative ?

L'IA générative désigne des modèles capables de produire du contenu original (texte, images, code, audio) à partir d'une invite (prompt). Ces modèles sont entraînés sur de grandes quantités de données et apprennent à modéliser la distribution statistique de ces données. Contrairement aux systèmes basés sur des règles, ils n'exécutent pas d'instructions explicites — ils inférent des patterns à partir d'exemples.

## Les grands modèles de langage (LLMs)

Un LLM (Large Language Model) est un réseau de neurones transformer entraîné sur des milliards de tokens. GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro ou Llama 3 en sont des exemples. Ils peuvent raisonner, résumer, traduire et générer du code.

### Concepts clés

- **Token** : unité de base du traitement du texte (environ 4 caractères ou ¾ d'un mot)
- **Contexte (context window)** : nombre maximum de tokens que le modèle peut traiter en une seule fois (ex. 128 k tokens pour GPT-4o)
- **Temperature** : paramètre qui contrôle la créativité du modèle (0 = déterministe, 1 = créatif)
- **Top-p / Top-k** : stratégies d'échantillonnage qui contraignent l'ensemble des tokens candidats à chaque étape
- **Prompt engineering** : art de formuler des instructions efficaces pour guider le modèle
- **Inférence** : processus d'exécution d'un modèle entraîné pour générer un résultat

## Comment fonctionne un transformer ?

Un transformer repose sur un mécanisme d'auto-attention : chaque token de l'entrée peut « s'attendre » à tous les autres tokens, permettant au modèle de capturer des dépendances à longue portée. Le modèle traite tous les tokens en parallèle (contrairement aux RNNs qui les traitent séquentiellement), ce qui explique à la fois sa rapidité et sa capacité à gérer de longs contextes.

## Exemple : appeler un LLM via API

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
      { role: 'system', content: 'Tu es un assistant technique concis.' },
      { role: 'user', content: 'Explique les LLMs en 3 phrases.' },
    ],
    temperature: 0.3,
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

## Embeddings et RAG

Les LLMs sont sans état — ils ne retiennent pas d'informations entre les appels. Pour leur donner accès à vos propres données, deux patterns courants existent :

- **Fine-tuning** : ré-entraîner le modèle sur votre jeu de données (coûteux, rarement nécessaire)
- **RAG (Retrieval-Augmented Generation)** : au moment de la requête, récupérer les documents pertinents d'une base de données vectorielle et les injecter dans le contexte

```text
Requête → Embedder la requête → Chercher dans la DB vectorielle → Injecter les K meilleurs chunks → LLM → Réponse
```

Bases de données vectorielles populaires : Pinecone, Weaviate, pgvector (extension PostgreSQL).
