---
id: chunk-size
order: 11
difficulty: intermediate
tags: [RAG, chunking, context, OpenAI]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Big chunks feel smart in demos. You retrieve fewer items, each one looks rich, and the prompt seems full of context. Then production happens: answers quote the wrong subsection, latency creeps up, and your top results drag useless text into every prompt.

Chunk size is not about what the model can technically accept. It is about the smallest unit that still answers the question users actually ask. That is why I start from the answer shape, not from the context window. The [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) guide is the reminder that you pay for tokens you embed, and the [LangChain splitters](https://python.langchain.com/docs/concepts/text_splitters/) plus [LlamaIndex docs](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) make it clear that chunk size is a tuning parameter, not a sacred constant.

My default for prose documentation is usually 250 to 450 tokens. For API references, I often go smaller because one endpoint description should not be glued to three unrelated ones. For transcripts, I care less about token count and more about keeping one speaker turn or one exchange together. The number matters, but the semantic unit matters more.

Instead of arguing about one magic value, I like to measure what my corpus is doing.

```ts
const chunkConfig = {
  docs: { targetTokens: 350, maxTokens: 450 },
  api: { targetTokens: 220, maxTokens: 300 },
  transcript: { targetTokens: 280, maxTokens: 360 },
};

export function selectChunkProfile(kind: keyof typeof chunkConfig) {
  return chunkConfig[kind];
}

export function shouldResplit(chunk: { tokenCount: number; headingDepth: number }) {
  return chunk.tokenCount > 450 || chunk.headingDepth > 3;
}
```

I resplit oversized chunks before indexing, because large chunks poison retrieval quietly. They often rank well because they contain many relevant words, but they force the model to sift through extra material and make citation harder. Small chunks have the opposite failure mode: better precision, worse recall, and too many near-duplicates in the final context.

The shortcut I trust is this: run evaluation with real user questions, then inspect the retrieved chunks, not just the final answer. If the right answer regularly needs only one paragraph but your retriever keeps returning whole pages, shrink the chunks. If you need `topK=10` just to assemble one useful passage, your chunks are probably too small. Start with 300 to 400 tokens for docs and move only when the retrieval logs give you a reason.
