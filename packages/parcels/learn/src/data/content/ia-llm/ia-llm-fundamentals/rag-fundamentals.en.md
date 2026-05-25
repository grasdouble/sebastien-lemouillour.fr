---
id: rag-fundamentals
order: 4
difficulty: intermediate
tags: [IA, LLM, RAG, embeddings]
---

## Why LLMs need your data

An LLM can sound incredibly confident, but it still has a blind spot: its knowledge is frozen at training time. It does not know your product catalog, your internal wiki, your support procedures, or the PDF your team uploaded yesterday. If you ask, "What is our refund policy for enterprise customers?", the model can only guess unless you provide the answer in the request.

That is the core idea behind **Retrieval-Augmented Generation (RAG)**: before asking the model to answer, you first retrieve relevant information from your own data, then inject that information into the prompt.

A useful analogy is an expert consultant. The consultant is smart and articulate, but they still need access to your documentation to answer company-specific questions. RAG gives the model that documentation at the right moment.

This is usually better than fine-tuning for frequently changing knowledge. Fine-tuning changes the model's behavior; RAG changes the context it receives. If your documentation updates every week, retrieval is often the simpler and safer option.

## What are embeddings?

To retrieve relevant content, you need a way to compare meaning, not just keywords. That is what **embeddings** do. An embedding is a list of numbers representing the meaning of a piece of text.

Think of it like GPS coordinates, but for meaning instead of geography. Two addresses close on a map are probably in the same neighborhood. Two embeddings close in vector space are probably about the same topic.

That is why a search for "holiday policy" can still find a chunk containing "paid vacation rules" even if the exact words do not match. Once you have that mental model, the next step is straightforward: you need a way to measure how close two meaning-coordinates are.

**Cosine similarity** is the common way to measure that closeness. You do not need the full math intuition: it tells you whether two vectors point in a similar semantic direction. High cosine similarity means "these texts probably mean related things."

Here is what an embedding request looks like with the OpenAI API:

```typescript
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: 'Our invoices are archived for 7 years.',
  }),
});

const data = await response.json();
const vector = data.data[0].embedding;
console.log(vector.length);
```

You usually store that vector next to the original text chunk so you can search it later.

## The RAG pipeline

A minimal RAG flow looks like this:

```text
Document -> Chunk -> Embed -> Store
Query -> Embed -> Search -> Top-K -> LLM -> Answer
```

The diagram looks simple, but it really describes two different tempos. Indexing happens ahead of time: you prepare documents, split them, embed them, and store the results before any user asks a question. That part is the expensive setup work.

Later, at request time, retrieval and generation take over. A user question is embedded, compared against what you indexed earlier, and only the best matching chunks are sent to the LLM. Retrieval narrows the search space; generation turns the retrieved facts into a useful answer.

If you break it down, each phase has a specific role:

- **Document / Chunk / Embed / Store** — build the searchable knowledge base once, upstream.
- **Query / Embed / Search / Top-K** — find the few passages that matter for this specific question.
- **LLM / Answer** — turn those passages into a grounded response.

## Chunking strategies

Why not just embed the whole document once and be done with it? Because full documents dilute meaning, exceed context limits, and make retrieval less precise. Chunking creates smaller units that are easier to match to a real question.

Overlap matters too. If one idea spans the boundary between two chunks, a small overlap preserves continuity.

| Strategy       | How it works                                | Strengths               | Weaknesses                       | Good default for                  |
| -------------- | ------------------------------------------- | ----------------------- | -------------------------------- | --------------------------------- |
| Fixed-size     | Split every N characters or tokens          | Easy, fast, predictable | Can cut in the middle of an idea | Quick prototypes                  |
| Sentence-based | Group complete sentences until a size limit | More readable chunks    | Sentence lengths vary a lot      | FAQs, articles, guides            |
| Semantic       | Split on topic changes or headings          | Best coherence          | Harder to implement              | Large, structured knowledge bases |

A practical starting point is fixed-size or sentence-based chunking with 10–20% overlap. Then evaluate with real user questions.

## Implementing RAG in TypeScript

The example below shows the full flow in a self-contained way: index documents in memory, retrieve the closest chunks, then send them to an LLM. For learning, an in-memory array is enough. In production, you'll replace this with persistent storage.

```typescript
type IndexedChunk = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
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
  const context = matches.map((match, index) => `Source ${index + 1} (${match.source}): ${match.text}`).join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'Answer only from the provided context. If the answer is missing, say that the context does not contain it.',
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nContext:\n${context}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
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

Notice the three distinct phases:

1. **Indexing** — prepare your knowledge base once.
2. **Retrieval** — find the most relevant chunks for a new question.
3. **Generation** — ask the LLM to answer using only those chunks.

This separation is important: indexing is expensive and done upfront, while retrieval and generation happen at request time.

## Choosing a vector database

When your data no longer fits in memory — or when you need persistence across restarts — you need a vector database or a relational database with vector support.

| Option   | Best for                                     | Hosting                         | Cost profile     |
| -------- | -------------------------------------------- | ------------------------------- | ---------------- |
| pgvector | Teams already using Postgres                 | Self-hosted or managed Postgres | Low to moderate  |
| Pinecone | Fast managed vector search with minimal ops  | Fully managed SaaS              | Moderate to high |
| Weaviate | Hybrid search and richer knowledge features  | Self-hosted or managed cloud    | Moderate         |
| Chroma   | Local development and lightweight prototypes | Local or self-hosted            | Low              |

A good rule of thumb:

- Start with **an in-memory array** for learning.
- Move to **pgvector** if your stack already uses Postgres.
- Choose **Pinecone** if you want the least operational overhead.
- Look at **Weaviate** for more advanced retrieval features.
- Use **Chroma** for experimentation and local demos.

RAG is not magic, but it is dependable when the foundations are solid: good chunks, good retrieval, and a model forced to answer from that evidence. Those three bricks are how you build trust between your data and the model.
