---
id: prompt-engineering
difficulty: intermediate
tags: [IA, LLM, prompt]
---

## Zero-shot prompting

Le zero-shot prompting est la forme la plus simple : demander au modèle d'effectuer une tâche sans fournir d'exemples. Le modèle s'appuie entièrement sur ses connaissances pré-entraînées.

```text
Classe le sentiment de cette critique comme Positif, Neutre ou Négatif :

"L'autonomie de la batterie est décevante, mais la qualité de l'écran est excellente."
```

Cela fonctionne bien pour les tâches que le modèle a vues à l'entraînement. Pour des tâches de niche ou ambiguës, le few-shot prompting est plus fiable.

## Few-shot prompting

Le few-shot prompting consiste à fournir des exemples dans le prompt pour guider le modèle. Plus les exemples sont représentatifs, plus le résultat est précis.

```text
Traduis du français vers l'anglais :

Français: "Bonjour, comment allez-vous ?"
Anglais: "Hello, how are you?"

Français: "Merci beaucoup pour votre aide."
Anglais: "Thank you very much for your help."

Français: "Je voudrais réserver une table pour deux personnes."
Anglais:
```

## Chain-of-thought (CoT)

Le CoT demande au modèle de raisonner étape par étape avant de donner sa réponse finale. Cela améliore significativement les performances sur les tâches complexes. Ajouter « Raisonne étape par étape » ou « Think step by step » à un prompt suffit souvent.

```text
Résous ce problème étape par étape :

Si un train part à 9h00 et roule à 120 km/h, et qu'un autre train part à 10h00
de la même gare dans la même direction à 150 km/h, à quelle heure
le second train rattrapera-t-il le premier ?

Raisonnement :
```

## Role prompting

Assigner un rôle au modèle améliore la qualité et la cohérence des réponses dans un domaine spécifique.

- "Tu es un expert en cybersécurité avec 20 ans d'expérience..."
- "Tu es un professeur de mathématiques qui explique à des lycéens..."
- "Tu es un code reviewer senior qui cherche des bugs critiques..."

## System prompts

La plupart des APIs LLM modernes supportent un message `system`, qui est placé avant la conversation. Les system prompts établissent la persona, les contraintes et le format de sortie du modèle de façon persistante dans toute la conversation.

```typescript
const messages = [
  {
    role: 'system',
    content: `Tu es une API JSON uniquement. Réponds toujours avec du JSON valide.
N'inclus jamais de texte explicatif en dehors de l'objet JSON.
Schéma : { "réponse": string, "confiance": number }`,
  },
  { role: 'user', content: 'Quelle est la capitale du Japon ?' },
];
```

## Structured output

Pour un usage en production, instruire le modèle à retourner des données structurées (JSON, YAML) rend le parsing fiable. De nombreuses APIs supportent désormais `response_format: { type: 'json_object' }`.

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Retourne du JSON avec les champs : title (string), tags (string[]), difficulty (beginner|intermediate|advanced).',
      },
      { role: 'user', content: 'Classe cet article sur les hooks React.' },
    ],
  }),
});
```
