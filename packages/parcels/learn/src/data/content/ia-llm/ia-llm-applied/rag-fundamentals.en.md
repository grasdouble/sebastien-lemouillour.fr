---
id: rag-fundamentals
order: 2
difficulty: intermediate
tags: [IA, LLM, RAG, embeddings]
---

## The model that can't answer your own questions

You've connected an LLM to your product. Impressive in demos. Then someone asks "What's our refund policy for enterprise accounts?" and the model answers confidently (and completely wrong). Not because the model is bad. Because it genuinely has no idea. Its knowledge stopped at training time. Your refund policy, your internal wiki, the PDF your team uploaded yesterday: none of that exists for it.

That's the gap **Retrieval-Augmented Generation (RAG)** fills. Before the model answers, you fetch the relevant passages from your own data and inject them into the prompt. The model isn't smarter: it's just finally reading the right document.

I'd reach for RAG over fine-tuning whenever the knowledge changes. Fine-tuning bakes behavior into the weights, which means re-training every time your documentation evolves. RAG is just a query at runtime. If your data updates weekly, that alone should settle the debate.

## Embeddings: comparing meaning without keywords

The problem with retrieval is that people don't search the way documents are written. A user asks "holiday policy"; your handbook says "paid vacation rules." Exact keyword search fails here.

Embeddings solve this. An embedding is a vector (a list of numbers) that encodes the meaning of a piece of text rather than its literal words. Think of GPS coordinates for semantics: two pieces of text that mean similar things end up close in vector space, the same way two buildings in the same neighborhood are close on a map.

**Cosine similarity** measures that closeness: whether two vectors point in the same semantic direction. You don't need the math. What matters is that a high score means "these texts probably talk about the same thing," even when they share no words.

Here's what an embedding call looks like:

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

You store that vector next to the original text chunk. That's the bridge between your documents and semantic search.

## The RAG pipeline

A minimal RAG flow looks like this:

```text
Document -> Chunk -> Embed -> Store
Query -> Embed -> Search -> Top-K -> LLM -> Answer
```

Two different tempos hiding behind that diagram. Indexing is offline, upstream work: you chunk your documents, embed each piece, and store the results before anyone asks a question. This is the expensive part (and you only do it once per document update).

At request time, retrieval and generation take over. The user's question gets embedded using the same model, compared against everything you indexed, and the closest matches get forwarded to the LLM. The model doesn't see your entire knowledge base: just the three or five passages most likely to contain the answer.

- **Document / Chunk / Embed / Store**: build the knowledge base once, ahead of time.
- **Query / Embed / Search / Top-K**: narrow it down to what's relevant for this specific question.
- **LLM / Answer**: turn retrieved evidence into a usable response.

## Chunking strategies

Why not embed whole documents and be done with it? Two reasons. First, a long document dilutes the embedding: it's representing everything at once, which makes it harder to match against a specific question. Second, context windows have limits, and dumping a whole document into the prompt is wasteful when only one paragraph actually answers the question.

Chunking creates smaller, more focused units. Overlap matters here: if one idea spans the boundary between two chunks, a small overlap preserves that continuity.

| Strategy       | How it works                                | Strengths               | Weaknesses                       | Good default for                  |
| -------------- | ------------------------------------------- | ----------------------- | -------------------------------- | --------------------------------- |
| Fixed-size     | Split every N characters or tokens          | Easy, fast, predictable | Can cut in the middle of an idea | Quick prototypes                  |
| Sentence-based | Group complete sentences until a size limit | More readable chunks    | Sentence lengths vary a lot      | FAQs, articles, guides            |
| Semantic       | Split on topic changes or headings          | Best coherence          | Harder to implement              | Large, structured knowledge bases |

My default: sentence-based chunking with 15% overlap. Fixed-size is fine for prototyping but has a bad habit of slicing sentences mid-thought, which hurts both readability and retrieval. Semantic chunking gives the best results but takes more effort; I'd add it once the system is working, not as a starting point.

## Implementing RAG in TypeScript

The example below runs entirely in memory (no vector database needed). That's intentional. Getting the three phases right in a self-contained environment is more valuable than adding infrastructure complexity before you understand the fundamentals.

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

The three phases are intentionally separate, and that separation matters more than it looks:

1. **Indexing**: the expensive upfront work. Do it once per document update.
2. **Retrieval**: fast, happens at request time. The quality of this step determines everything downstream.
3. **Generation**: the model answers from evidence, not from memory. That's what prevents confident hallucinations.

If retrieval brings back the wrong chunks, generation will still sound confident and still be wrong. The weak link is almost always chunking and retrieval, not the model.

## Choosing a vector database

An in-memory array is good enough to understand the fundamentals and prototype on real data. Once you need persistence, or your index grows beyond what comfortably lives in process memory, you need something that persists between restarts.

| Option   | Best for                                     | Hosting                         | Cost profile     |
| -------- | -------------------------------------------- | ------------------------------- | ---------------- |
| pgvector | Teams already using Postgres                 | Self-hosted or managed Postgres | Low to moderate  |
| Pinecone | Fast managed vector search with minimal ops  | Fully managed SaaS              | Moderate to high |
| Weaviate | Hybrid search and richer knowledge features  | Self-hosted or managed cloud    | Moderate         |
| Chroma   | Local development and lightweight prototypes | Local or self-hosted            | Low              |

My honest decision path: if you're already on Postgres, start with pgvector (it's one extension, no new infra). If operational overhead is a real concern and budget allows, Pinecone is genuinely low-friction. I'd only add Weaviate if you need hybrid search or more advanced knowledge graph features. Chroma is my go-to for local experiments.

One last thing worth saying plainly: retrieval quality degrades gracefully, but it degrades. If your chunks are too large, too small, or poorly overlapped, the model will receive mediocre context and return mediocre answers. Spend real time evaluating retrieval with actual user questions before assuming the problem is the model.
