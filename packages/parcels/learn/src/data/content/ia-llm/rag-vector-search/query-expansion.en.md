---
id: query-expansion
order: 16
difficulty: intermediate
tags: [RAG, retrieval, HyDE, reformulation]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Your retriever looks broken when a user types "login hangs after SSO" and the useful chunk says "authentication timeout during federated redirect." If that wording gap keeps pushing the right chunk out of the candidate set, I do not touch the generator first. I fix retrieval recall with query expansion.

The first decision is whether you really have a recall problem. If the winning chunk already shows up somewhere in the top 10, expansion is usually wasted spend. Query rewriting is for wording gaps, not for bad ordering. Managed search stacks now ship [query rewrite](https://learn.microsoft.com/en-us/azure/search/semantic-how-to-query-rewrite) for exactly that case.

Once the failure mode is clear, I pick the lightest expansion that can close it. [LlamaIndex transforms](https://docs.llamaindex.ai/en/stable/examples/query_transformations/query_transform_cookbook/) show the usual ladder: one rewrite for cleaner wording, a few rewrites for multi-query retrieval, then heavier patterns when the corpus language is far from the user's phrasing. The [HyDE paper](https://arxiv.org/abs/2212.10496) is the jump I use sparingly: ask the model for a short hypothetical answer, embed that text, and search from it. The [Query2doc paper](https://arxiv.org/abs/2303.07678) points in the same direction, pseudo-documents can lift recall, but only when the extra text stays close to the domain.

When wording mismatch is real, this is the production pattern I trust:

```ts
async function expandedSearch(question: string) {
  const variants = await llm.generate([
    `Rewrite as an exact search query: ${question}`, // recover precise product terms
    `Rewrite with likely domain wording: ${question}`, // bridge user language to corpus language
    `Write a short likely answer paragraph: ${question}`, // HyDE-style synthetic seed
  ]);

  const queries = dedupe([question, ...variants]).slice(0, 4); // cap model cost and latency
  const hits = await Promise.all(
    queries.map((q) => vectorIndex.search(q, { topK: 6 })) // keep fan-out small enough to inspect
  );

  return reciprocalRankFusion(hits).slice(0, 8); // hand a tight set to reranking or generation
}
```

I keep the cap low on purpose. Every extra rewrite is another model call, another rate-limit consumer, and another chance to pull in adjacent topics. Cache expansions by normalized query, log which variant found the winning chunk, and strip emails, ticket dumps, or secrets before you send raw user text to the expansion model.

I also fuse by rank, not by raw score. The [Elastic RRF docs](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion) make the practical case well: RRF combines result sets without pretending their score scales mean the same thing. My threshold is blunt: if two to four total queries do not move missed documents into the candidate set, I stop expanding and fix chunking, metadata, or reranking instead.
