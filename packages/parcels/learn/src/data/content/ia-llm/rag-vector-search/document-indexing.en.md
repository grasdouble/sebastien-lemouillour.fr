---
id: document-indexing
order: 8
difficulty: intermediate
tags: [RAG, indexing, embeddings, OpenAI]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your search returns results. Wrong results. Not because the model is bad, but because your index is stale, duplicated, or missing half the document tree. Most RAG bugs I see are indexing bugs wearing a retrieval costume.

I treat indexing like a build pipeline, not a background chore. Read the source, normalize it, split it, embed it, upsert it, delete what disappeared, and record exactly which source version produced which chunks. If any one of those steps is hand-wavy, your answers will drift.

The official guides all give you one piece of the pipeline. [LangChain splitters](https://python.langchain.com/docs/concepts/text_splitters/) cover chunk creation, [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) cover vector generation, and your store handles upserts and deletes, whether you use [Qdrant docs](https://qdrant.tech/documentation/) or [Pinecone docs](https://docs.pinecone.io/). The part people skip is the glue: stable ids and content hashes.

I want indexing to be idempotent. If a document did not change, skip it. If one paragraph changed, only replace the affected chunks. If the source disappeared, remove its vectors. Rebuilding everything on every deploy feels safe until the corpus grows, costs spike, and you hit rate limits for no good reason.

This is the pattern I keep coming back to in production.

```ts
import { createHash } from 'node:crypto';

type SourceDoc = { id: string; title: string; text: string; url: string; updatedAt: string };

export async function indexDocument(doc: SourceDoc, vectorStore: VectorStore) {
  const contentHash = createHash('sha256').update(doc.text).digest('hex');
  const existing = await vectorStore.getDocumentVersion(doc.id);

  if (existing?.contentHash === contentHash) {
    return { skipped: true };
  }

  const chunks = splitDocument(doc.text, {
    chunkSize: 400, // target tokens, not characters
    overlap: 40,
  });

  const embeddings = await embedBatch(chunks.map((chunk) => chunk.text));

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

  await vectorStore.saveDocumentVersion(doc.id, { contentHash, chunkCount: chunks.length });
  return { skipped: false, chunkCount: chunks.length };
}
```

Notice what is not optional here: `contentHash`, stable chunk ids, and document-level version tracking. Without those three, re-indexing turns into guesswork and cleanup becomes manual.

My decision rule is harsh on purpose: if your indexer cannot answer “what changed?” and “what should be deleted?” without scanning the whole corpus, it is not ready for production. Fix that before you tune retrieval prompts, because stale context beats prompt quality every time.
