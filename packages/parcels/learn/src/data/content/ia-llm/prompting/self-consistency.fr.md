---
id: self-consistency
order: 8
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

Tu finis par stabiliser un prompt de raisonnement, puis la prod renvoie 42, 39, et « sans doute 41 » pour la même tâche. C’est à ce moment-là que l’auto-cohérence arrête de sentir le labo et commence à devenir utile.

L’auto-cohérence vient de [Wang et al.](https://arxiv.org/abs/2203.11171) : au lieu de garder une seule trajectoire de raisonnement gloutonne, tu en échantillonnes plusieurs et tu retiens la réponse qui revient le plus souvent. Je la traite comme une tactique de fiabilité, pas comme un bonus d’intelligence magique.

La facture arrive vite. Le [guide d’optimisation](https://developers.openai.com/api/docs/guides/model-optimization) d’OpenAI rappelle que le comportement d’un modèle est non déterministe et doit être mesuré, et son [guide Evals](https://developers.openai.com/api/docs/guides/evals) montre comment le faire proprement. Cinq échantillons peuvent réduire les ratés aléatoires, mais ils multiplient aussi les tokens et la latence. Les [rate limits](https://platform.openai.com/docs/guides/rate-limits) comptent aussi, parce que des appels répétés consomment bien plus vite le RPM et le TPM qu’une seule requête.

Ma règle est simple : vote sur une réponse finale normalisée, pas sur l’explication. Si tu as besoin d’un champ stable à comparer, [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) est plus sûr que gratter de la prose, parce que le schéma est imposé au lieu d’espérer que le modèle garde le même format.

Avant de recopier le pattern, regarde bien la forme de la requête : la même tâche à chaque fois, assez de température pour explorer des chemins alternatifs, et une limite de sortie serrée pour garder le budget sous contrôle. Le code ci-dessous reprend la forme du [guide texte](https://platform.openai.com/docs/guides/text?api-mode=responses) d’OpenAI pour la Responses API.

```ts
import OpenAI from 'openai';

const client = new OpenAI();

const instructions = [
  'Solve the task carefully.',
  'You may reason internally.',
  'Reply with only the final answer.',
].join(' ');

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

function majorityVote(values: string[]): [string, number] | null {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  return winner ?? null;
}

async function sampleFinalAnswer(task: string): Promise<string> {
  const response = await client.responses.create({
    model: 'gpt-4.1', // Épingle un modèle ou un snapshot en production.
    temperature: 0.7, // Laisse assez d'aléa pour explorer d'autres chemins.
    max_output_tokens: 60, // Garde chaque échantillon peu coûteux.
    input: [
      { role: 'developer', content: instructions },
      { role: 'user', content: task },
    ], // Garde exactement le même prompt à chaque essai.
  });

  return normalizeAnswer(response.output_text);
}

const task = 'What is 27 × 14?';
const samples = await Promise.all(Array.from({ length: 5 }, () => sampleFinalAnswer(task)));

const winner = majorityVote(samples);

if (!winner || winner[1] < 3) {
  throw new Error('No stable answer. Escalate or verify deterministically.');
}

console.log(winner[0]);
```

J’utilise ce pattern pour des tâches bornées comme le calcul, la classification, ou l’extraction, quand une mauvaise réponse coûte plus cher que trois à cinq appels de plus. Si la meilleure réponse ne dépasse pas environ 60 % des votes, traite le résultat comme non résolu et escalade au lieu de faire semblant d’avoir de la confiance.
