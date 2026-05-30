---
id: chunking
order: 10
difficulty: intermediate
tags: [RAG, chunking, LangChain, LlamaIndex]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Your vector search still returns something. Usually the wrong paragraph. The failure is rarely the embedding model. It is the moment you separated a heading from its table, chopped a speaker label away from the answer, or split a code fence in half.

I would chunk by document structure first and token budget second. For Markdown, I reach for [MarkdownHeaderTextSplitter](https://docs.langchain.com/oss/python/integrations/splitters/markdown_header_metadata_splitter) because it groups content by headers and keeps that hierarchy in metadata. When the source has already lost its shape, [RecursiveCharacterTextSplitter](https://docs.langchain.com/oss/python/integrations/splitters/recursive_text_splitter) is my fallback because it tries larger separators before smaller ones instead of shredding the text immediately.

The trap I fell into was treating Markdown, HTML, transcripts, and OCR text as one generic blob. They are not. [LlamaIndex node parsers](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) inherit document attributes into child nodes, so format-aware chunking is already part of the ingestion model. I normalize first, then pick the cheapest splitter that still preserves the boundary a human cares about.

That choice is easier to enforce with one tiny dispatcher before I wire in any framework abstraction.

```ts
type SourceKind = 'markdown' | 'html' | 'transcript' | 'plain';

export function chunkDocument(input: { kind: SourceKind; text: string }) {
  if (input.kind === 'markdown') {
    return chunkMarkdownByHeading(input.text, {
      maxTokens: 400, // leave room for titles and retrieval prompts
      keepHeading: true, // the heading usually carries the meaning
      preserveCodeBlocks: true, // splitting fenced code too early hurts search
    });
  }

  if (input.kind === 'html') {
    return chunkHtmlBySection(input.text, {
      allowedTags: ['h1', 'h2', 'h3', 'p', 'li', 'pre'],
      maxTokens: 400, // recurse only inside a section that is still too large
    });
  }

  if (input.kind === 'transcript') {
    return chunkTranscriptBySpeaker(input.text, {
      maxTokens: 300, // shorter turns, but speaker labels must stay attached
      mergeShortTurns: true, // avoid one-line chunks with no standalone meaning
    });
  }

  return recursiveChunk(input.text, {
    maxTokens: 350,
    overlapTokens: 40, // enough continuity without paying twice for everything
    separators: ['\n\n', '\n', '. ', ' '],
  });
}
```

Once the boundaries look sane, I still make every chunk explain itself. [LlamaIndex parser modules](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/modules/) point out that surrounding context can live in metadata and that some window metadata is not visible to the LLM or embedding model, so I prepend the parent heading or speaker label to the text I embed instead of trusting metadata alone.

This is also where cost, rate limits, and security become concrete. [OpenAI's embeddings guide](https://platform.openai.com/docs/guides/embeddings) says embeddings are billed per input token and capped by max input size, so aggressive overlap is not free. More tiny chunks also mean more requests, which makes provider quotas show up sooner. And because the full chunk text is what you send to the embeddings API, I redact secrets, API keys, and customer identifiers before indexing.

If I have to choose quickly, I start with section-aware chunks around 300 to 500 tokens, keep overlap under roughly 10%, and recurse only when one section still blows the budget. The moment you need 20% overlap to rescue answer quality, stop tuning models and fix your boundaries first.
