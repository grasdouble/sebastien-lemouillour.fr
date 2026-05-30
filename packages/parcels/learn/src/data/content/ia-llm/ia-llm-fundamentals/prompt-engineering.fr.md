---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Vous avez essayé le modèle. Les résultats sont décevants. Pas cassés: juste vagues, hors sujet, mal formatés, ou d'une confiance absurde face à quelque chose d'évident. Le réflexe, c'est de blâmer le modèle. Je l'ai eu aussi. En général, le modèle va bien : c'est l'instruction qui pose problème.

Le prompt engineering, c'est simplement la discipline d'écrire de meilleures instructions. Pas de magie. Juste des patterns qui font passer la sortie de « presque utile » à « vraiment utile », et quelques pièges à éviter en chemin.

## Zero-shot : le défaut qui fonctionne moins souvent qu'on le croit

L'approche la plus simple : décrire la tâche et demander le résultat, sans exemples. Le modèle est censé déduire à quoi ressemble un « bon » résultat à partir de l'instruction seule.

```text
Classe le sentiment de cette critique comme Positif, Neutre ou Négatif :

"L'autonomie de la batterie est décevante, mais la qualité de l'écran est excellente."
```

Ça fonctionne bien pour les tâches courantes que le modèle a vues des milliers de fois. Pour tout ce qui est spécialisé, ambigu, ou là où votre définition de « correct » diffère de la moyenne des données d'entraînement : ça se dégrade vite. Le zero-shot, c'est là où je commence, pas là où je reste.

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

Les exemples font deux choses : ils montrent le format attendu, et ils calibrent le jugement du modèle sur ce que « bon » signifie pour votre cas d'usage spécifique. Si vous pouvez démontrer le résultat souhaité en deux ou trois cas plutôt que le décrire en prose, choisissez presque toujours la démonstration.

## Chain-of-thought : ne laissez pas le modèle sauter des étapes

Pour tout ce qui implique un raisonnement en plusieurs étapes (maths, logique, classification complexe), demander directement la réponse finale est une erreur. Le modèle peut générer une réponse qui sonne plausible par reconnaissance de patterns, sans réellement travailler le problème. Ajouter une instruction simple pour montrer son raisonnement change tout.

```text
Résous ce problème étape par étape :

Si un train part à 9h00 et roule à 120 km/h, et qu'un autre train part à 10h00
de la même gare dans la même direction à 150 km/h, à quelle heure
le second train rattrapera-t-il le premier ?

Raisonnement :
```

« Think step by step » est la version en quatre mots qui fonctionne dans la plupart des situations. Ça semble presque trop simple, mais l'amélioration de précision sur les problèmes en plusieurs étapes est réelle et mesurable. La raison pour laquelle ça fonctionne : générer les étapes force le modèle à construire des résultats intermédiaires qu'il utilise ensuite réellement, plutôt que de deviner directement la réponse.

## Role prompting : le contexte façonne la sortie plus qu'on ne le pense

Dire au modèle qu'il est un auditeur en cybersécurité plutôt qu'un chef de produit change non seulement le vocabulaire, mais le niveau de détail, ce qu'il choisit de mettre en avant et ce qu'il omet. Ce n'est pas décoratif : j'ai vu la même question produire des sorties différentes et vraiment utiles selon le rôle.

- « You are a cybersecurity expert with 20 years of experience... »
- « You are a mathematics teacher explaining to high school students... »
- « You are a senior code reviewer looking for critical bugs... »

Choisissez le rôle qui correspond au type de jugement dont vous avez réellement besoin. Si vous voulez un retour de code review qui détecterait de vraies failles de sécurité, « experienced engineer » vous apportera bien plus qu'un prompt générique.

## Prompts système : posez les règles une fois, ne vous répétez pas

Dans une vraie application, répéter vos contraintes dans chaque message utilisateur est un cauchemar de maintenance et gonfle l'utilisation des tokens. Le prompt `system` existe pour définir la persona du modèle, ses contraintes et son format de sortie pour toute la session. En production, je le traite comme le contrat entre mon application et le modèle : il définit ce que le modèle est autorisé à faire, dans quel format il doit répondre, et ce qu'il doit refuser.

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

Un bon prompt système réduit significativement la variance des sorties (ce qui compte bien plus en production que lors des expérimentations).

## Sortie structurée : imposez ce sur quoi vous ne pouvez pas compter

Demander du JSON dans le prompt est une première étape raisonnable, mais le modèle peut quand même décider d'ajouter une petite explication avant l'objet ou après, ce qui casse votre parser. Les APIs modernes offrent un mode de sortie structurée qui impose le format au niveau de l'API, pas seulement via instruction. Utilisez-le chaque fois qu'un autre système doit parser la réponse : c'est un mode de défaillance de moins à déboguer à 2h du matin.

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

Ces techniques s'accumulent. Un prompt de production qui fonctionne de manière fiable combine généralement un rôle clair, deux ou trois exemples, une instruction étape par étape pour les tâches complexes, et une contrainte de sortie structurée. Mais voici la vraie règle : commencez par le zero-shot, mesurez où ça échoue, et ajoutez la couche suivante seulement quand la précédente ne suffit pas. La complexité ajoutée sans raison spécifique n'est que du bruit.
