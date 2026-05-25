## Qu'est-ce que l'IA générative ?

L'IA générative désigne des modèles capables de produire du contenu original (texte, images, code, audio) à partir d'une invite (prompt). Ces modèles sont entraînés sur de grandes quantités de données et apprennent à modéliser la distribution statistique de ces données.

## Les grands modèles de langage (LLMs)

Un LLM (Large Language Model) est un réseau de neurones transformer entraîné sur des milliards de tokens. GPT-4, Claude, Gemini ou Llama en sont des exemples. Ils peuvent raisonner, résumer, traduire et générer du code.

### Concepts clés

- Token : unité de base du traitement du texte (environ 4 caractères)
- Contexte (context window) : nombre maximum de tokens que le modèle peut traiter en une seule fois
- Temperature : paramètre qui contrôle la créativité du modèle (0 = déterministe, 1 = créatif)
- Prompt engineering : art de formuler des instructions efficaces

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
    messages: [{ role: 'user', content: 'Explique les LLMs en 3 phrases.' }],
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```
