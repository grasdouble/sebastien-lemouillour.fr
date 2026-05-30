---
id: overlap
order: 12
difficulty: intermediate
tags: [RAG, chunking, recall, LangChain]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You ask a good question, the answer exists in the source, and retrieval still misses it because the key sentence got cut in half between two chunks. That is the real job of overlap. Not to make chunks look sophisticated, but to protect meaning at the edges.

I keep overlap small by default. Most teams either set it to zero and lose boundary context, or crank it up so high that the store fills with near-duplicates. Both choices hurt. The [LangChain splitters](https://python.langchain.com/docs/concepts/text_splitters/) and [LlamaIndex docs](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) both expose overlap for a reason: it improves recall when meaning spills across chunk boundaries. But every repeated token is also one more token to embed, store, rank, and possibly send to the model, which is why the [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) cost profile should stay in your head while tuning it.

My default is usually 10 to 15 percent of chunk size. Enough to preserve continuity, not enough to flood search results with clones. I go lower for well-structured docs with headings, and higher for messy transcripts or OCR text where boundaries are unreliable. If your chunker already respects sections and speaker turns, overlap becomes a small safety net. If your chunker is crude, overlap turns into an expensive bandage.

The part tutorials skip is deduplication. Overlap improves recall, but it also increases the chance that top results are five versions of the same passage. I would rather dedupe after retrieval than blindly increase `topK` and hope the model sorts it out.

Here is the post-retrieval cleanup I add almost every time.

```ts
export function dedupeOverlappingChunks(chunks: Array<{ id: string; sourceId: string; start: number; end: number }>) {
  return chunks.filter((chunk, index, all) => {
    return !all.slice(0, index).some((prev) => {
      const sameSource = prev.sourceId === chunk.sourceId;
      const overlaps = Math.max(0, Math.min(prev.end, chunk.end) - Math.max(prev.start, chunk.start));
      const smallerSpan = Math.min(prev.end - prev.start, chunk.end - chunk.start);

      return sameSource && overlaps / smallerSpan > 0.6;
    });
  });
}
```

That one pass keeps the safety of overlap without stuffing the final prompt with repeated context.

My decision rule: start at 10 percent overlap, use zero only when your documents have strong natural boundaries, and get suspicious above 20 percent. If you need more than that to save retrieval, the problem is usually chunk structure, not overlap itself.
