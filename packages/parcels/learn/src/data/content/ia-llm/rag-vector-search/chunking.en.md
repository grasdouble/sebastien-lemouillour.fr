---
id: chunking
order: 10
difficulty: intermediate
tags: [RAG, chunking, LangChain, LlamaIndex]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your vector search returns results. Wrong results. Not because the model is dumb, but because you sliced the document in places no human would. Every chunking tutorial shows the happy path with neat paragraphs. Real documents have headings, tables, bullet lists, code fences, footnotes, and PDF extraction scars.

My stance is simple: chunk by structure first, by token count second. If a heading, table, or code block defines meaning, keep it intact as long as you can. Only fall back to recursive splitting when the section is still too large. The [LangChain splitters](https://python.langchain.com/docs/concepts/text_splitters/) docs and [LlamaIndex docs](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) both support this idea with parser-based and recursive strategies. The [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) guide is the reminder that token budget is still real, so structure alone cannot be your only rule.

The mistake I see most often is treating all source formats the same. Markdown docs, API references, call transcripts, and OCR text should not be chunked with one universal function. Tables are the classic failure case: one splitter keeps rows together but exceeds your target size, another splitter breaks rows apart and makes retrieval useless. The right answer is usually to normalize first, then chunk.

This is the minimal dispatcher I like before I touch any framework abstractions.

```ts
export function chunkDocument(input: { type: 'markdown' | 'html' | 'transcript'; text: string }) {
  if (input.type === 'markdown') {
    return chunkMarkdownByHeading(input.text, {
      maxTokens: 400,
      keepHeading: true,
      preserveCodeBlocks: true,
    });
  }

  if (input.type === 'transcript') {
    return chunkTranscriptBySpeaker(input.text, {
      maxTokens: 300,
      mergeShortTurns: true,
    });
  }

  return recursiveChunk(input.text, {
    maxTokens: 350,
    separators: ['\n\n', '\n', '. ', ' '],
  });
}
```

Notice the order: format-aware logic first, generic recursion last. That one choice usually improves retrieval more than switching embedding models.

I also keep parent context close to the chunk. A heading, section title, or speaker label often matters as much as the body text, so I prepend it during indexing instead of hoping metadata filters will rescue the search later.

My rule of thumb: if a human would say “that sentence only makes sense with the line above it,” your chunker needs more structure. If your first splitter for every document is “split every 500 tokens,” you are optimizing for convenience, not retrieval quality.
