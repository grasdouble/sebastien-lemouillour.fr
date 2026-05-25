---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
---

Vous avez essayé un LLM pour la première fois, et les résultats sont tièdes. Le modèle répond à côté, trop vaguement, dans le mauvais format. Le réflexe naturel est de blâmer le modèle — mais la plupart du temps, le problème vient de la façon dont vous lui parlez.

Le prompt engineering, c'est l'art de formuler vos instructions pour obtenir des réponses utiles. Ce n'est pas de la magie : c'est une compétence qui se construit progressivement, du cas le plus simple au plus sophistiqué.

## Zero-shot : commencer simple

La forme la plus directe consiste à demander sans exemples. Le modèle s'appuie sur tout ce qu'il a appris pendant l'entraînement pour inférer ce que vous attendez.

```text
Classe le sentiment de cette critique comme Positif, Neutre ou Négatif :

"L'autonomie de la batterie est décevante, mais la qualité de l'écran est excellente."
```

Pour une tâche courante et bien définie, c'est souvent suffisant. Là où ça devient fragile, c'est face à des tâches spécialisées ou ambiguës — le modèle n'a pas assez de contexte pour deviner ce que vous voulez vraiment. C'est là qu'entrent les exemples.

## Few-shot : guider par l'exemple

Plutôt que d'expliquer longuement ce que vous attendez, montrez-le. Deux ou trois exemples représentatifs calibrent le modèle bien mieux qu'une longue instruction abstraite.

```text
Traduis du français vers l'anglais :

Français: "Bonjour, comment allez-vous ?"
Anglais: "Hello, how are you?"

Français: "Merci beaucoup pour votre aide."
Anglais: "Thank you very much for your help."

Français: "Je voudrais réserver une table pour deux personnes."
Anglais:
```

La règle pratique : si vous pouvez montrer ce que « bon » ressemble à travers deux ou trois cas, montrez-le plutôt que de l'écrire.

## Chain-of-thought : forcer le raisonnement

Certaines tâches exigent plusieurs étapes de réflexion. Si vous demandez directement la réponse finale, le modèle peut sauter des étapes et se tromper. Lui demander de raisonner étape par étape améliore souvent le résultat de façon spectaculaire.

```text
Résous ce problème étape par étape :

Si un train part à 9h00 et roule à 120 km/h, et qu'un autre train part à 10h00
de la même gare dans la même direction à 150 km/h, à quelle heure
le second train rattrapera-t-il le premier ?

Raisonnement :
```

En pratique, ajouter « Raisonne étape par étape » ou « Think step by step » à un prompt suffit souvent à améliorer les tâches mathématiques, logiques ou plus généralement multi-étapes.

## Role prompting : donner un contexte d'expertise

Le contexte professionnel change le registre, la profondeur et la précision des réponses. Assigner un rôle explicite aide le modèle à ancrer ses réponses dans un domaine. Ce n'est pas juste cosmétique — le modèle ajuste son niveau de détail, son vocabulaire et la structure de ses réponses en fonction du rôle :

- "Tu es un expert en cybersécurité avec 20 ans d'expérience..."
- "Tu es un professeur de mathématiques qui explique à des lycéens..."
- "Tu es un code reviewer senior qui cherche des bugs critiques..."

## System prompts : fixer les règles une fois pour toutes

Dans une application, vous ne voulez pas répéter les mêmes contraintes à chaque message utilisateur. Le message `system` résout cela en définissant pour toute la conversation la persona du modèle, ses limites et le format de sortie attendu. En production, un bon system prompt est votre première ligne de défense : il réduit la variance des réponses, facilite le parsing et rend les comportements indésirables plus difficiles à déclencher.

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

## Structured output : rendre le parsing fiable

Demander du JSON dans le system prompt aide, mais ce n'est pas garanti — le modèle peut encore ajouter du texte avant ou après. Les APIs modernes proposent de plus en plus un mode de sortie structurée qui impose directement le format, ce qui est bien plus sûr quand un autre système doit parser la réponse.

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

Ces techniques ne sont pas mutuellement exclusives — un bon prompt de production combine souvent un rôle clair, des exemples few-shot, une instruction de raisonnement et un format de sortie structuré. La règle est de commencer simple, mesurer les résultats, et ajouter de la complexité seulement là où ça améliore vraiment les sorties.
