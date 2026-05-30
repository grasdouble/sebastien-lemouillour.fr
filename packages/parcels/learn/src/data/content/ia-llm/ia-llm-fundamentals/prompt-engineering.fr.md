---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

Vous avez essayé le modèle. Les résultats sont décevants. Pas cassés : juste vagues, hors sujet, mal formatés, ou d'une confiance absurde face à quelque chose d'évident. Le réflexe, c'est de blâmer le modèle. Je l'ai eu aussi. En général, le modèle va bien : c'est l'instruction qui pose problème.

Le prompt engineering, c'est simplement la discipline d'écrire de meilleures instructions. Pas de magie. Pas de jailbreaks. Juste des patterns qui font passer la sortie de « presque utile » à « vraiment utile », et quelques pièges à éviter en chemin. Le [guide prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) est utile, mais le raccourci qui a vraiment amélioré mes résultats est plus simple : partir d'un prompt banal, puis n'ajouter de la structure que là où ça casse.

## Zero-shot : le défaut qui fonctionne moins souvent qu'on le croit

L'approche la plus simple : décrire la tâche et demander le résultat, sans exemples. Le modèle est censé déduire à quoi ressemble un « bon » résultat à partir de l'instruction seule.

```text
Classe le sentiment de cette critique comme Positif, Neutre ou Négatif :

"L'autonomie de la batterie est décevante, mais la qualité de l'écran est excellente."
```

Ça fonctionne bien pour les tâches courantes que le modèle a vues des milliers de fois. Pour tout ce qui est spécialisé, ambigu, ou là où votre définition de « correct » diffère de la moyenne des données d'entraînement, ça se dégrade vite. Le zero-shot, c'est là où je commence, pas là où je reste.

## Few-shot : arrêtez d'expliquer, montrez

Plutôt que d'écrire une description plus longue de ce que vous voulez, montrez des exemples d'entrée et de sortie attendue. Deux ou trois exemples battent un paragraphe d'explication presque à chaque fois.

```text
Traduis du français vers l'anglais :

Français: "Bonjour, comment allez-vous ?"
Anglais: "Hello, how are you?"

Français: "Merci beaucoup pour votre aide."
Anglais: "Thank you very much for your help."

Français: "Je voudrais réserver une table pour deux personnes."
Anglais:
```

Les exemples font deux choses : ils montrent le format attendu, et ils calibrent le jugement du modèle sur ce que « bon » signifie pour votre cas d'usage spécifique. Si je peux montrer le résultat cible en deux ou trois cas plutôt que le décrire en prose, je choisis presque toujours la démonstration.

## Chain-of-thought : ne laissez pas le modèle sauter des étapes

Pour tout ce qui implique un raisonnement en plusieurs étapes, demander directement la réponse finale est une bonne façon d'obtenir une absurdité dite avec aplomb. Le [papier chain-of-thought](https://arxiv.org/abs/2201.11903) de Wei et al. a montré des gains mesurables quand on pousse le modèle à produire des étapes intermédiaires sur des tâches complexes. La nuance compte. Ce papier ne prouve pas qu'une formule magique résout tous les problèmes difficiles.

```text
Résous ce problème étape par étape :

Si un train part à 9h00 et roule à 120 km/h, et qu'un autre train part à 10h00
de la même gare dans la même direction à 150 km/h, à quelle heure
le second train rattrapera-t-il le premier ?

Raisonnement :
```

« Think step by step » reste un raccourci utile, et je l'essaie. Je ne le traite simplement pas comme un sort. Si la tâche est fragile, je préfère montrer la forme de raisonnement attendue plutôt que d'espérer que le modèle invente les bonnes étapes tout seul.

## Role prompting : le contexte façonne la sortie plus qu'on ne le pense

Dire au modèle qu'il est un auditeur en cybersécurité plutôt qu'un chef de produit change non seulement le vocabulaire, mais le niveau de détail, ce qu'il choisit de mettre en avant et ce qu'il omet. Ce n'est pas décoratif : j'ai vu la même question produire des sorties différentes et vraiment utiles selon le rôle.

- « You are a cybersecurity expert with 20 years of experience... »
- « You are a mathematics teacher explaining to high school students... »
- « You are a senior code reviewer looking for critical bugs... »

Choisissez le rôle qui correspond au type de jugement dont vous avez réellement besoin. Si vous voulez un retour de code review qui détecte de vraies failles de sécurité, un rôle bien choisi vous apportera plus qu'un paragraphe supplémentaire d'instructions génériques.

## Instructions de haut niveau : posez les règles une fois, ne vous répétez pas

Les anciens exemples parlent de prompt système. Dans la documentation OpenAI actuelle, ce rôle passe plutôt par `instructions` ou par un message `developer`, et la [référence Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) montre ce contrat directement dans la forme de la requête. En production, je traite cette couche comme l'accord entre mon app et le modèle : ton, contraintes, règles de sortie et limites de refus vivent là.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-5.5',
  instructions: `Tu es une API JSON uniquement. Réponds toujours avec du JSON valide.
N'inclus jamais de texte explicatif en dehors de l'objet JSON.
Schéma : { "réponse": string, "confiance": number }`,
  input: 'Quelle est la capitale du Japon ?',
});
```

Bien régler cette couche réduit la variance des sorties beaucoup plus qu'on ne l'imagine.

## Sortie structurée : imposez ce sur quoi vous ne pouvez pas compter

Demander du JSON dans le prompt est une première étape raisonnable, mais ça reste juste une demande. Le [guide Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) explicite bien la différence actuelle : le mode JSON garantit du JSON valide, tandis que `json_schema` impose vraiment un schéma. Si un autre système doit parser la réponse, je choisis d'abord le schéma strict, et je ne reviens au mode JSON que si la compatibilité du modèle m'y oblige.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-2024-08-06',
  input: [
    {
      role: 'system',
      content: "Classe l'article et renvoie des données structurées.",
    },
    { role: 'user', content: 'Classe cet article sur les hooks React.' },
  ],
  text: {
    format: {
      type: 'json_schema',
      name: 'article_classification',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
        },
        required: ['title', 'tags', 'difficulty'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
});
```

Ces techniques se combinent. Un prompt fiable mélange souvent un rôle clair, quelques exemples, une guidance étape par étape quand la tâche l'exige, et de la structure quand un parser en dépend. Ma règle reste la même : je commence en zero-shot, je regarde où ça casse, puis j'ajoute seulement la pièce suivante qui corrige l'échec. Le reste, c'est du bruit.
