---
id: temperature
order: 20
difficulty: intermediate
tags: [llm]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Quand un flux d’extraction commence à sortir de jolies petites surprises, on accuse le prompt. Moi, j’accuse d’abord la température. J’ai vu de bons modèles avoir l’air téméraires simplement parce que quelqu’un avait laissé `temperature: 1` sur une tâche qui demandait une réponse ennuyeuse et répétable.

## La température change l’échantillonnage, pas la qualité du modèle

Dans [Transformers](https://huggingface.co/docs/transformers/en/main_classes/text_generation), la température modifie les probabilités du token suivant utilisées pour l’échantillonnage. Le guide [text generation](https://platform.openai.com/docs/guides/text-generation) d’OpenAI rappelle aussi que la sortie d’un modèle reste non déterministe, donc je traite la température comme un budget de risque, pas comme un curseur magique d’intelligence.

Des valeurs basses gardent le modèle proche de sa continuation la plus probable. Des valeurs hautes laissent entrer des candidats plus faibles. Ça peut aider pour l’idéation. Ça ne transforme pas une chaîne de raisonnement faible en bonne réponse.

Si j’ai besoin d’une sortie structurée, je commence par quelque chose comme ça.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Extract the company name and country as JSON.',
  temperature: 0.1, // garde un échantillonnage serré
  top_p: 1, // régler un seul contrôle stochastique d’abord
  max_output_tokens: 80, // laisser assez de place pour un JSON valide
});
```

## Là où je la règle vraiment

Pour l’extraction, la classification, le routage ou les appels d’outils, je pars entre `0` et `0.2`. Je veux quelque chose d’ennuyeux. L’ennui coûte moins cher que des retries, des validateurs et une sortie bizarre qui finit en production.

Pour un assistant généraliste, je reste le plus souvent entre `0.2` et `0.5`. Au-dessus, je continue seulement si la variation est le but. Le [papier Holtzman](https://arxiv.org/abs/1904.09751) reste pour moi le meilleur rappel que les choix de décodage peuvent ruiner la qualité même quand le modèle lui-même tient la route.

Pour des titres ou du brainstorming, je monte la température, mais seulement avec une boucle d’évaluation et des exemples conservés. Une température plus haute ne change pas le prix par token, mais elle augmente souvent le nombre d’échantillons qu’on compare ou qu’on jette, et les retries répétés vous rapprochent plus vite des [rate limits](https://platform.openai.com/docs/guides/rate-limits) du fournisseur. C’est un vrai coût, même si la ligne de facture paraît identique.

## L’erreur que je vois encore

Les équipes changent la température et `top_p` en même temps, puis passent l’après-midi à débattre du prompt. L’[API Messages](https://docs.anthropic.com/en/api/messages) d’Anthropic recommande explicitement de modifier soit `temperature`, soit `top_p`, pas les deux, et je trouve que ce conseil évite beaucoup de faux debugging.

Si vous voulez comparer des réglages proprement, je garderais le reste de la requête fixe comme ceci.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Give me 6 headline options for a note-taking app.',
  temperature: 0.8, // augmenter la variété volontairement
  top_p: 1, // laisser le nucleus sampling tranquille
  seed: 42, // si votre fournisseur le prend en charge
  max_output_tokens: 120, // plafonner le coût de revue
});
```

Ne confondez pas `temperature: 0` avec un déterminisme parfait. Le guide [reproducible output](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/reproducible-output) d’Azure dit que le déterminisme n’est pas garanti, même avec un seed, et cette réserve compte encore plus quand les sorties s’allongent. Je garde donc une validation côté serveur autour des appels d’outils, parce qu’une faible part d’aléatoire n’est pas un système de sécurité.

Si une mauvaise réponse coûte cher, restez entre `0` et `0.2`. Si vous ne savez pas expliquer pourquoi vous avez besoin de plus de variation, vous n’en avez probablement pas besoin.
