---
id: generation-parameters
order: 23
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Si tu as déjà vu le même prompt passer d'excellent à inutilisable, tu connais déjà le piège : on accuse le modèle alors que ce sont les réglages de décodage qui font les dégâts. J'ai fait cette erreur au début. Je réécrivais mes prompts alors que le vrai problème venait d'une température mal choisie, d'une limite de tokens trop serrée, ou de deux paramètres d'échantillonnage qui se marchaient dessus.

## Le piège, c'est de faire confiance aux réglages par défaut

Les valeurs par défaut ne sont pas neutres. Elles changent selon les fournisseurs et les bibliothèques, et elles reflètent souvent un objectif produit générique, pas ton cas d'usage. Les contrôles exposés dans la [doc OpenAI](https://platform.openai.com/docs/guides/text?api-mode=responses), la [doc Anthropic](https://docs.anthropic.com/en/api/messages) et la [doc Transformers](https://huggingface.co/docs/transformers/main/en/generation_strategies) visent le même problème : décider quel token suivant a le droit de gagner.

Ma règle est simple : traite les paramètres de génération comme une partie du contrat de l'application. Si tu construis de l'extraction, de la classification ou du tool calling, l'aléatoire est un bug tant que tu n'as pas une bonne raison de le garder. Si tu construis de l'idéation, des variantes marketing ou de l'exploration de données synthétiques, un peu d'aléatoire aide, mais seulement volontairement.

## Les paramètres qui comptent vraiment

### Température

La température change à quel point le modèle préfère fortement les tokens les plus probables. Des valeurs basses rendent les sorties plus prudentes. Des valeurs hautes poussent le modèle à explorer davantage la queue de distribution. Pour de l'extraction ou du formatage, je partirais généralement entre `0` et `0.3`. Pour du brainstorming, je préfère monter entre `0.7` et `1.0` plutôt que de faire semblant qu'une tâche créative devrait être déterministe.

### top_p

`top_p` conserve seulement le plus petit ensemble de tokens dont la probabilité cumulée dépasse un seuil. C'est utile, mais beaucoup de gens en abusent. Mon réglage par défaut, c'est `top_p: 1`, puis j'ajuste la température d'abord. Si tu ajustes fortement les deux, les échecs deviennent plus difficiles à comprendre, parce que deux filtres différents façonnent la même distribution.

### max_output_tokens et stop

Ce sont des leviers de budget et de contrôle, pas des détails cosmétiques. Une limite courte force des réponses concises, mais elle coupe aussi du raisonnement ou des sorties structurées. Les séquences d'arrêt sont meilleures quand tu sais où la réponse doit se terminer, surtout dans des templates, des sorties pseudo-JSON ou des pipelines multi-étapes.

### Les pénalités de répétition

Les pénalités de fréquence ou de présence peuvent aider quand le modèle boucle, mais je ne les activerais pas par défaut. Ce sont des outils de réparation. Si le modèle se répète, commence par vérifier si le prompt ou le contexte l'y pousse.

## Réglages pratiques

Pour un flux d'extraction déterministe, je commencerais comme ça :

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Extract the company name and country as JSON.',
  temperature: 0.2,
  top_p: 1,
  max_output_tokens: 120,
  stop: ['\n\n'],
});
```

Pour de la génération d'idées, je ne desserrerais que les paramètres utiles à la variation :

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Give me 8 landing page headline options for a privacy-first note app.',
  temperature: 0.9,
  top_p: 1,
  max_output_tokens: 220,
});
```

Observe ce qui reste stable : je ne touche pas à tout en même temps. C'est ce pattern qui fait gagner du temps. Tu changes une variable, tu regardes les échecs, puis tu décides s'il te faut plus de diversité, plus de contrôle, ou simplement un meilleur prompt.

## Règle de décision

Si la tâche a une seule bonne forme de sortie, pars avec une température basse, `top_p: 1`, et une limite de tokens assez large pour éviter la coupe. Si la tâche profite de la variation, monte la température avant de toucher au reste. N'ajoute `top_p`, des séquences `stop` ou des pénalités de répétition que quand tu peux nommer précisément le problème qu'ils corrigent.
