---
id: self-consistency
order: 8
difficulty: intermediate
tags: [LLM, Prompting, reasoning, sampling]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Tu finis enfin par obtenir un prompt de raisonnement qui marche, puis la même requête renvoie 42 sur un run et 39 sur le suivant. Rien ne casse la confiance plus vite qu’un modèle qui a l’air sûr de lui tout en changeant d’avis à chaque refresh.

L’auto-cohérence est ma rustine préférée quand une tâche a une seule bonne réponse, mais plusieurs chemins de raisonnement plausibles. Le [papier sur la méthode](https://arxiv.org/abs/2203.11171) remplace le décodage glouton par plusieurs chaînes de raisonnement échantillonnées, puis choisit la réponse la plus cohérente entre elles. Dit comme ça, ça sent le labo. En pratique, l’idée est très terre à terre : si un run est bruité, tu en demandes plusieurs et tu fais voter.

Le piège, c’est le coût. Le [guide de prompt engineering d’OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) rappelle clairement que les sorties sont non déterministes et qu’il faut des evals quand le prompt compte vraiment. L’auto-cohérence transforme ce conseil en pattern d’ingénierie, mais chaque échantillon supplémentaire consomme des tokens, du temps, et du budget de rate limit. Si une réponse coûte 2 000 tokens, cinq essais en coûtent 10 000 avant même l’agrégation.

Autre détail que beaucoup ratent : on ne vote pas sur le raisonnement, on vote sur la réponse finale normalisée. La justification la plus élégante est très souvent la mauvaise. J’ai déjà perdu trop de temps à admirer du non-sens bien rédigé.

Voici la version que je mets réellement en prod sur les tâches fragiles :

```ts
const samples = await Promise.all(
  Array.from({ length: 5 }, async () => {
    const response = await client.responses.create({
      model: 'gpt-5.5',
      temperature: 0.7, // encourage des chemins différents
      input: prompt,
    });

    return extractFinalAnswer(response.output_text);
  })
);

const answer = majorityVote(samples.map(normalizeAnswer));
```

Cinq échantillons suffisent souvent à voir si le prompt est robuste ou juste chanceux. Si le vote finit en 2-2-1, je ne fais pas semblant d’y croire : je traite ça comme de l’incertitude et j’escalade vers un modèle plus fort, ou je repasse par une vérification déterministe. Ce signal d’incertitude représente déjà la moitié de la valeur.

La [vue d’ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) commence elle aussi par les critères de réussite et les tests empiriques, et c’est exactement pour ça que l’auto-cohérence fonctionne bien en production : elle te donne un motif de confiance mesurable au lieu d’une seule réponse bien coiffée.

Ma règle est volontairement sévère. Utilise l’auto-cohérence quand une mauvaise réponse coûte assez cher pour justifier trois à cinq appels, par exemple pour de l’extraction financière, des contrôles de politique, ou des workflows avec pas mal de calcul. Ne dépense pas ça pour écrire un texte de chat sympa. Le vote majoritaire est un outil de fiabilité, pas une fonction cosmétique.
