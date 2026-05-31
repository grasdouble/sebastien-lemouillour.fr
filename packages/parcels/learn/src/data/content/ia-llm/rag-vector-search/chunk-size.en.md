---
id: chunk-size
order: 11
difficulty: intermediate
tags: [rag, tokens]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Big chunks look great in a demo. You retrieve fewer rows, every match feels rich, and the prompt looks packed with context. Then real traffic lands, and the answer cites the wrong subsection, your prompt budget disappears, and one noisy page keeps outranking the paragraph users actually needed.

My first bad instinct was to size chunks from the model limit. I do the opposite now. OpenAI bills embeddings by input token in the [embeddings guide](https://platform.openai.com/docs/guides/embeddings), so I count the corpus with the [tokenizer](https://platform.openai.com/tokenizer) before I pick any thresholds. The better question is simple: what is the smallest passage that can answer one user question without borrowing half the document?

That is why I choose the semantic unit first. Cohere's [chunking guide](https://docs.cohere.com/page/chunking-strategies) splits the problem into content-independent and content-dependent strategies, and that matches production nicely. API references usually want small sections. Transcripts usually need one speaker turn, or one short exchange, kept together. I only go larger when the answer genuinely spans more than one unit.

Here is the profile map I would wire in before indexing a mixed corpus.

```ts
type ChunkProfile = {
  targetTokens: number; // average size to aim for
  maxTokens: number; // hard stop before resplitting
  overlapTokens: number; // keep local context without cloning pages
  splitOn: string[]; // prefer semantic boundaries first
};

const chunkProfiles = {
  docs: {
    targetTokens: 320,
    maxTokens: 420,
    overlapTokens: 40,
    splitOn: ['\n## ', '\n### ', '\n\n'],
  },
  api: {
    targetTokens: 180,
    maxTokens: 260,
    overlapTokens: 24,
    splitOn: ['\n### ', '\n\n', '.\n'],
  },
  transcript: {
    targetTokens: 260,
    maxTokens: 340,
    overlapTokens: 32,
    splitOn: ['\nSpeaker ', '\n\n'],
  },
} satisfies Record<string, ChunkProfile>;

export function shouldResplit(chunk: { tokenCount: number }) {
  return chunk.tokenCount > 420;
}

export function canMerge(left: { accessScope: string }, right: { accessScope: string }) {
  return left.accessScope === right.accessScope;
}
```

Two shortcuts save me time. First, I keep overlap small on purpose. Enough to preserve a reference, not enough to repeat the same answer five times. Second, I never merge text across access boundaries. If public and restricted content land in the same chunk, retrieval can surface the wrong passage later even when your document-level permissions look correct.

For implementation, I prefer splitters that expose structure and overlap directly instead of hiding everything behind one integer. LlamaIndex [node parsers](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) are a good example because they let you switch between sentence-aware and token-aware splitting without rewriting the ingestion pipeline.

The operational trap is re-embedding a whole corpus with oversized chunks and calling it done. If you use OpenAI for embeddings, larger chunks burn more money and eat through [rate limits](https://platform.openai.com/docs/guides/rate-limits) faster during bulk re-indexing. I batch by chunk profile, keep retries idempotent, and inspect failed queries before I touch the entire dataset.

My rule is blunt: start around 300 to 400 tokens for prose, 150 to 250 for API references, and keep transcript chunks to one speaker turn unless the answer routinely spans two. If the right answer needs `topK > 6`, go a bit bigger. If one retrieved chunk keeps containing two unrelated answers, cut it down.
