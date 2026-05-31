---
id: overlap
order: 12
difficulty: intermediate
tags: [rag, evaluation]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

You ship RAG, ask a question you know is answered in the source, and retrieval still misses it because one sentence was split across two chunks. That is when overlap earns its keep. I use it to protect meaning at chunk edges, not to make the pipeline look clever.

I start with a small overlap because zero is the fastest way to lose boundary context, while a huge overlap fills the index with near-duplicates. Both [LangChain splitters](https://python.langchain.com/docs/concepts/text_splitters/) and [LlamaIndex node parsers](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) expose overlap as a first-class setting for that reason. I keep the [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) guide in mind while tuning: repeated tokens are still input tokens, so they raise embedding cost and storage volume before you even look at retrieval quality.

My default is 10 to 15 percent of chunk size. That is enough for docs where one idea spills into the next paragraph, but still small enough that search results do not come back as clones. I go lower when the document already has strong structure, such as headings, API sections, or clear speaker turns. I go higher only for messy OCR or transcripts where boundaries are unreliable. If you need a huge overlap on clean content, I would fix the splitter before I touch the percentage again.

That leads to the trap most guides skip: deduplication after retrieval. Overlap can lift recall, but it also increases the odds that your top results are four versions of the same passage. I would rather dedupe overlapping hits before prompt assembly than crank `topK` and pay for repeated context.

Here is the helper I reach for when overlap starts producing clones.

```ts
type RetrievedChunk = {
  id: string;
  sourceId: string; // original document identifier
  start: number; // inclusive character or token offset
  end: number; // exclusive character or token offset
};

export function dedupeOverlappingChunks(
  chunks: RetrievedChunk[],
  maxOverlapRatio = 0.6 // drop later chunks that overlap more than 60%
) {
  return chunks.filter((chunk, index, all) => {
    return !all.slice(0, index).some((prev) => {
      if (prev.sourceId !== chunk.sourceId) return false;

      const sharedSpan = Math.max(0, Math.min(prev.end, chunk.end) - Math.max(prev.start, chunk.start));
      const smallerSpan = Math.min(prev.end - prev.start, chunk.end - chunk.start);

      return smallerSpan > 0 && sharedSpan / smallerSpan > maxOverlapRatio;
    });
  });
}
```

I run that after retrieval and before prompt assembly, so overlap still protects recall without bloating the final context window. If your vector store already returns passage offsets, this is cheap to add. If it does not, hash the normalized text instead and drop near-identical neighbors there.

My rule: start at 10 percent, use zero only when documents have strong natural boundaries, and get suspicious above 20 percent. If retrieval needs more than that to work, the real problem is usually chunking quality, not overlap.
