---
id: rag-fundamentals
order: 2
difficulty: intermediate
tags: [IA, LLM, RAG, embeddings]
publishedAt: 2026-05-30
updatedAt: 2026-05-30
---

## The answer is in the doc, but the model still misses it

You've connected an LLM to your product. It looks great in a demo. Then someone asks "What's our refund policy for enterprise accounts?" and the model answers confidently, with the wrong paragraph or no paragraph at all. Not because the model is bad. Because your policy changed last month, and the model cannot magically read the file you updated yesterday.

That's the gap **Retrieval-Augmented Generation (RAG)** fills. Before the model answers, you fetch the passages that actually matter from your own data and pass them in as context. The model is not smarter. It's just finally reading the right page.

I'd reach for RAG over fine-tuning whenever the knowledge changes. Fine-tuning is for behavior. RAG is for fresh facts. If your documentation moves every week, RAG is usually the cheaper and safer default.

## Embeddings: comparing meaning without keywords

The first retrieval problem is boring and painful: users do not search with the same words your documents use. Someone types "holiday policy" while the handbook says "paid vacation rules." Exact keyword search misses that match.

OpenAI's [Embeddings guide](https://developers.openai.com/api/docs/guides/embeddings) is the reference that matters here: `text-embedding-3-small` returns 1536 dimensions by default, `text-embedding-3-large` returns 3072, and the v3 models let you reduce vector size with `dimensions` when storage starts to hurt.

Every chunk you embed is billed per token, so remove obvious duplicates before you index them. And do not send secrets or raw PII to an embedding API just because the code path is convenient.

A bare request looks like this:

```typescript
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small', // good default when cost matters
    input: 'Our invoices are archived for 7 years.',
    encoding_format: 'float', // easy to inspect and store
    dimensions: 512, // optional: smaller vectors, lower storage cost
  }),
});

if (!response.ok) {
  throw new Error(`Embedding request failed: ${response.status}`);
}

const data = await response.json();
const vector = data.data[0].embedding;
console.log(vector.length);
```

You store that vector next to the source text. That's the bridge between documents and semantic search.

## The RAG pipeline

A minimal RAG flow still looks like this:

```text
Document -> Chunk -> Embed -> Store
Query -> Embed -> Search -> Top-K -> LLM -> Answer
```

Indexing is the offline part: split documents, embed each chunk, store the vectors, and pay that cost once per content update. Retrieval and generation happen at request time: embed the question with the same model, rank the closest chunks, and send only the best evidence to the LLM.

If you want OpenAI to host the retrieval layer, [file search](https://developers.openai.com/api/docs/guides/tools-file-search) can search uploaded files inside vector stores. That's convenient, but it also means your documents live in a managed service, so treat it like any other security and compliance decision.

## Chunking strategies

Why not embed whole documents and call it a day? Because one long document blurs too many topics into one vector, and context windows are still finite. Sending ten pages when one paragraph answers the question is the kind of waste that makes a prototype look fine and production feel expensive.

| Strategy       | How it works                                | Strengths               | Weaknesses                       | Good default for                  |
| -------------- | ------------------------------------------- | ----------------------- | -------------------------------- | --------------------------------- |
| Fixed-size     | Split every N characters or tokens          | Easy, fast, predictable | Can cut in the middle of an idea | Quick prototypes                  |
| Sentence-based | Group complete sentences until a size limit | More readable chunks    | Sentence lengths vary a lot      | FAQs, articles, guides            |
| Semantic       | Split on topic changes or headings          | Best coherence          | Harder to implement              | Large, structured knowledge bases |

My default is sentence-based chunking with 15% overlap. Fixed-size is fine for a first pass, but it loves cutting a sentence exactly where the meaning turns. Semantic chunking usually wins later, once you've proved the rest of the pipeline is worth the effort.

## Implementing RAG in TypeScript

The example below runs entirely in memory. That's intentional. Before you add a vector database, you want to know whether chunking, ranking, and prompt construction are doing their job.

For new integrations, I'd start with the [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses) instead of Chat Completions. Chat Completions still works, but OpenAI recommends Responses for new projects.

```typescript
type IndexedChunk = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE_URL = 'https://api.openai.com';

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const documents = [
  {
    source: 'handbook.md',
    text: `Employees can work remotely up to three days per week. Travel expenses must be submitted within 30 days. Invoices are archived for 7 years.`,
  },
  {
    source: 'support.md',
    text: `Priority support is available for enterprise customers 24/7. Response time target is 1 hour for critical incidents.`,
  },
  {
    source: 'security.md',
    text: `Production access requires SSO and multi-factor authentication. Audit logs are retained for 90 days.`,
  },
];

function chunkText(text: string, size = 120, overlap = 30): string[] {
  const chunks: string[] = [];

  for (let start = 0; start < text.length; start += size - overlap) {
    const chunk = text.slice(start, start + size).trim();
    if (chunk) chunks.push(chunk);
  }

  return chunks;
}

async function embed(text: string): Promise<number[]> {
  const response = await fetch(`${OPENAI_API_BASE_URL}/v1/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function indexDocuments(): Promise<IndexedChunk[]> {
  const index: IndexedChunk[] = [];

  for (const document of documents) {
    const chunks = chunkText(document.text);

    for (const [chunkNumber, chunk] of chunks.entries()) {
      index.push({
        id: `${document.source}#${chunkNumber}`,
        source: document.source,
        text: chunk,
        embedding: await embed(chunk),
      });
    }
  }

  return index;
}

async function retrieve(query: string, index: IndexedChunk[], topK = 3): Promise<IndexedChunk[]> {
  const queryEmbedding = await embed(query);

  return [...index]
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk);
}

async function generateAnswer(question: string, matches: IndexedChunk[]): Promise<string> {
  const context = matches.map((match, index) => `Source ${index + 1} (${match.source}): ${match.text}`).join('\\n');

  const response = await fetch(`${OPENAI_API_BASE_URL}/v1/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      instructions:
        'Answer only from the provided context. If the answer is missing, say that the context does not contain it.',
      input: `Question: ${question}\n\nContext:\n${context}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Response request failed: ${response.status}`);
  }

  const data = await response.json();
  const message = data.output.find((item: { type: string }) => item.type === 'message');
  const text = message?.content.find((item: { type: string }) => item.type === 'output_text')?.text;

  if (!text) {
    throw new Error('No answer text returned');
  }

  return text as string;
}

async function main(): Promise<void> {
  const index = await indexDocuments();
  const question = 'How long are invoices archived?';
  const matches = await retrieve(question, index);
  const answer = await generateAnswer(question, matches);

  console.log('Retrieved chunks:', matches);
  console.log('Answer:', answer);
}

main().catch(console.error);
```

Keep the phases separate. Indexing is the expensive part you redo on document updates. Retrieval is the part that decides whether the model even sees the right evidence. Generation turns that evidence into language, but it cannot rescue bad retrieval.

## Choosing a vector database

An in-memory array is enough to learn the mechanics and debug ranking. Once the index needs persistence, filtering, or faster search than one process can comfortably handle, move to a real store.

| Option                                           | Best for                                     | Hosting                         | Cost profile     |
| ------------------------------------------------ | -------------------------------------------- | ------------------------------- | ---------------- |
| [pgvector](https://github.com/pgvector/pgvector) | Teams already using Postgres                 | Self-hosted or managed Postgres | Low to moderate  |
| [Pinecone docs](https://docs.pinecone.io/)       | Fast managed vector search with minimal ops  | Fully managed SaaS              | Moderate to high |
| [Weaviate docs](https://docs.weaviate.io/)       | Hybrid search and richer knowledge features  | Self-hosted or managed cloud    | Moderate         |
| [Chroma docs](https://docs.trychroma.com/)       | Local development and lightweight prototypes | Local or self-hosted            | Low              |

My rule of thumb is boring on purpose: if you're already on Postgres, start with pgvector. Add Pinecone when you want less operational work and can pay for it. Reach for Weaviate when hybrid search is a real requirement, not because the feature list looks impressive. Keep Chroma for local experiments and small internal tools.

If your retrieval benchmark misses more than about 1 obvious question out of 10, don't touch the model yet. Fix chunking, overlap, metadata, or ranking first.
