---
id: query-expansion
order: 16
difficulty: intermediate
tags: [RAG, retrieval, HyDE, reformulation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Users rarely ask in the vocabulary your docs use. They type “login hangs after SSO” while the relevant page says “authentication timeout during federated redirect.” When retrieval misses for that reason, better embeddings help a bit, but they do not close every language gap. Query expansion is the fix I use when the issue is recall, not ranking.

There are three families worth knowing. Multi-query retrieval generates a few alternate phrasings and searches each one. Query rewriting produces one better version of the original prompt. [HyDE](https://arxiv.org/abs/2212.10496) goes one step further: it asks a model to draft a hypothetical answer, embeds that synthetic text, and retrieves against it. Frameworks such as [LlamaIndex query transforms](https://docs.llamaindex.ai/en/stable/examples/query_transformations/query_transform_cookbook/) expose these patterns directly, while work like [Query2doc](https://arxiv.org/abs/2303.07678) shows why pseudo-documents can improve recall.

The trap is over-expansion. Five rewrites feel safer than one until you inspect the result set and realize you just multiplied retrieval cost, widened the candidate pool, and pulled in tangential pages. Query expansion is easy to overuse because bad retrieval and bad ranking can look similar in a demo. If the right chunk is already in the top 10, expansion is usually the wrong tool. Use reranking instead.

When I do expand, I keep the contract small and auditable:

```ts
async function expandedSearch(question: string) {
  const variants = await llm.generate([
    `Rewrite for exact terms: ${question}`,
    `Rewrite for product language: ${question}`,
    `Write a likely answer paragraph: ${question}`,
  ]);

  const queries = dedupe([question, ...variants]).slice(0, 4);
  const hits = await Promise.all(queries.map((q) => vectorIndex.search(q, { topK: 6 })));

  return reciprocalRankFusion(hits).slice(0, 8);
}
```

That cap on variants is not cosmetic. I want enough diversity to bridge vocabulary gaps, not enough creativity to invent a new search problem. I also log which expansion actually retrieved the winning chunk. Without that, you cannot tell whether HyDE helped or whether one basic rewrite did all the work.

The thing most tutorials skip is failure analysis. Expansion can drift into nearby topics and silently hurt precision. If your corpus contains adjacent concepts, like billing, authentication, and provisioning, a loose rewrite can mix them. My rule is simple: reach for expansion only after you have evidence that single-query retrieval misses relevant documents because of wording mismatch. If your evaluation set shows the answer is present but poorly ordered, do not add more queries. Add a better ranking stage and keep retrieval boring.
