---
id: document-indexing
order: 8
difficulty: intermediate
tags: [rag, embeddings]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Your search returns results. Wrong results. Usually the model is innocent. The real mess is upstream: stale chunks, duplicate vectors, or documents that were never indexed after the last edit. I keep seeing teams blame retrieval quality when the indexer is the part quietly lying to them.

I treat indexing as change detection first. OpenAI bills embeddings by input token and caps how much text you can send in one request in the [embeddings guide](https://platform.openai.com/docs/guides/embeddings), so re-embedding unchanged text is just paying twice for the same mistake.

That pushes me toward a boring pipeline on purpose: normalize the source, hash it, split it, embed only what changed, then upsert with stable IDs. I also batch conservatively because [rate limits](https://platform.openai.com/docs/guides/rate-limits) apply to both requests and tokens per minute. When people fan out every chunk at once, they usually build their own throttling problem.

Stable IDs are not optional. [Qdrant points](https://qdrant.tech/documentation/manage-data/points/) accept explicit point IDs, and [Pinecone upserts](https://docs.pinecone.io/guides/data/upsert-data) overwrite existing records with the same ID while letting metadata come back in search results. That is why I keep metadata useful but boring: `documentId`, source URL, timestamps, and content hashes. I would never put secrets, raw tokens, or private notes there.

Here is the smallest version I would ship before touching chunk-level diffs.

```ts
import { createHash } from 'node:crypto';

type SourceDoc = {
  id: string;
  title: string;
  text: string;
  url: string;
  updatedAt: string;
};

export async function indexDocument(doc: SourceDoc, vectorStore: VectorStore) {
  const normalizedText = normalizeWhitespace(doc.text);
  const contentHash = createHash('sha256').update(normalizedText).digest('hex');
  const previousVersion = await vectorStore.getDocumentVersion(doc.id);

  if (previousVersion?.contentHash === contentHash) {
    return { skipped: true, reason: 'unchanged' };
  }

  const chunks = splitDocument(normalizedText, {
    maxTokens: 400, // stays below common embedding input limits
    overlapTokens: 40, // keeps context when a sentence crosses chunks
  });

  const embeddings = await embedBatch(
    chunks.map((chunk) => chunk.text),
    {
      batchSize: 100, // reduce if your provider starts throttling
    }
  );

  await vectorStore.deleteByDocumentId(doc.id); // removes chunks from the previous version

  await vectorStore.upsert(
    chunks.map((chunk, index) => ({
      id: `${doc.id}:${index}`,
      vector: embeddings[index],
      metadata: {
        documentId: doc.id,
        title: doc.title,
        url: doc.url,
        updatedAt: doc.updatedAt,
        contentHash,
      },
      text: chunk.text,
    }))
  );

  await vectorStore.saveDocumentVersion(doc.id, {
    contentHash,
    chunkCount: chunks.length,
    indexedAt: new Date().toISOString(),
  });

  return { skipped: false, chunkCount: chunks.length };
}
```

I start with document-level versioning first because it is easier to debug and already removes most wasted embedding calls. I only add chunk-level hashes when indexing spend becomes visible or the embedding queue keeps brushing against the rate limit.

My threshold is simple: if rerunning the same corpus still calls the embedding API for unchanged documents, the indexer is not done. Fix that before you spend another hour tuning retrieval prompts.
