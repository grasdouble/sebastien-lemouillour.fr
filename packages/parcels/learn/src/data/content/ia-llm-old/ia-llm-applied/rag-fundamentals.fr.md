---
id: rag-fundamentals
order: 2
difficulty: intermediate
tags: [IA, LLM, RAG, embeddings]
publishedAt: 2026-05-30
updatedAt: 2026-05-30
---

## La réponse est dans le document, mais le modèle la rate quand même

Vous avez branché un LLM sur votre produit. En démo, ça brille. Puis quelqu'un demande « quelle est notre politique de remboursement pour les comptes enterprise ? » et le modèle répond avec aplomb, mais avec le mauvais paragraphe ou sans paragraphe du tout. Pas parce que le modèle est mauvais. Parce que votre politique a changé le mois dernier, et qu'il ne peut pas lire par magie le fichier mis à jour hier.

C'est exactement le vide que comble le **Retrieval-Augmented Generation (RAG)**. Avant que le modèle réponde, on récupère les passages qui comptent vraiment dans vos propres données et on les injecte dans le contexte. Le modèle n'est pas plus intelligent. Il lit enfin la bonne page.

Je choisirais le RAG plutôt que le fine-tuning dès que la connaissance bouge. Le fine-tuning sert au comportement. Le RAG sert aux faits frais. Si votre documentation change toutes les semaines, c'est en général l'option la moins chère et la moins risquée.

## Les embeddings : comparer le sens sans les mots-clés

Le premier problème de retrieval est banal et pénible : les utilisateurs ne cherchent pas avec les mêmes mots que vos documents. Quelqu'un tape « politique de congés » alors que le handbook dit « règles de vacances payées ». La recherche par mots-clés exacts passe à côté.

Le bon point d'appui ici, c'est le [guide des embeddings](https://developers.openai.com/api/docs/guides/embeddings) d'OpenAI : `text-embedding-3-small` renvoie 1536 dimensions par défaut, `text-embedding-3-large` en renvoie 3072, et les modèles v3 permettent de réduire la taille du vecteur avec `dimensions` quand le stockage commence à coûter cher.

Chaque chunk embeddé est facturé au token, donc retirez les doublons évidents avant d'indexer. Et n'envoyez pas de secrets ni de PII brutes vers une API d'embeddings juste parce que le chemin de code est pratique.

Un appel minimal ressemble à ça :

```typescript
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small', // bon défaut quand le coût compte
    input: 'Our invoices are archived for 7 years.',
    encoding_format: 'float', // simple à inspecter et à stocker
    dimensions: 512, // optionnel : vecteurs plus petits, stockage moins cher
  }),
});

if (!response.ok) {
  throw new Error(`Embedding request failed: ${response.status}`);
}

const data = await response.json();
const vector = data.data[0].embedding;
console.log(vector.length);
```

On stocke ce vecteur à côté du texte source. C'est le pont entre les documents et la recherche sémantique.

## Le pipeline RAG

Un flux RAG minimal ressemble toujours à ceci :

```text
Document -> Chunk -> Embed -> Store
Query -> Embed -> Search -> Top-K -> LLM -> Answer
```

L'indexation est la partie offline : on découpe les documents, on embede chaque chunk, on stocke les vecteurs, et on paie ce coût une fois par mise à jour de contenu. La récupération et la génération se jouent au moment de la requête : on embede la question avec le même modèle, on classe les chunks les plus proches, puis on n'envoie au LLM que les meilleures preuves.

Si vous voulez qu'OpenAI héberge la couche de retrieval, [file search](https://developers.openai.com/api/docs/guides/tools-file-search) sait chercher dans des fichiers envoyés vers des vector stores. C'est pratique, mais ça veut aussi dire que vos documents vivent dans un service managé, donc traitez ce choix comme n'importe quelle décision de sécurité et de conformité.

## Stratégies de chunking

Pourquoi ne pas embedder des documents entiers et s'arrêter là ? Parce qu'un document long mélange trop de sujets dans un seul vecteur, et que les fenêtres de contexte restent finies. Envoyer dix pages quand un seul paragraphe répond à la question, c'est exactement le genre de gaspillage qui passe en prototype et qui pique en production.

| Stratégie     | Fonctionnement                              | Forces                     | Faiblesses                       | Bon choix par défaut pour     |
| ------------- | ------------------------------------------- | -------------------------- | -------------------------------- | ----------------------------- |
| Taille fixe   | Découpe tous les N caractères ou tokens     | Simple, rapide, prévisible | Peut couper au milieu d'une idée | Prototypes rapides            |
| Basée phrases | Regroupe des phrases jusqu'à une taille max | Chunks plus lisibles       | La longueur des phrases varie    | FAQ, articles, guides         |
| Sémantique    | Coupe aux changements de sujet ou de titre  | Meilleure cohérence        | Plus difficile à implémenter     | Grosses bases de connaissance |

Mon choix par défaut, c'est un découpage par phrases avec 15 % d'overlap. La taille fixe fait le travail pour un premier passage, mais elle adore couper une phrase exactement là où le sens tourne. Le chunking sémantique gagne souvent plus tard, une fois que vous avez prouvé que le reste du pipeline vaut l'effort.

## Implémenter un RAG en TypeScript

L'exemple ci-dessous tourne entièrement en mémoire. C'est volontaire. Avant d'ajouter une base vectorielle, vous voulez savoir si le chunking, le ranking et la construction du prompt font déjà leur travail.

Pour une nouvelle intégration, je partirais sur la [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses) plutôt que sur Chat Completions. Chat Completions fonctionne encore, mais OpenAI recommande Responses pour les nouveaux projets.

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

Gardez les phases séparées. L'indexation est la partie coûteuse que vous refaites lors des mises à jour. La récupération décide si le modèle voit ou non la bonne preuve. La génération transforme cette preuve en langage, mais elle ne sauvera pas une mauvaise récupération.

## Choisir une base vectorielle

Un tableau en mémoire suffit pour apprendre la mécanique et déboguer le ranking. Dès que l'index a besoin de persistance, de filtres, ou d'une recherche plus rapide que ce qu'un seul process gère confortablement, passez à un vrai store.

| Option                                           | Idéal pour                                                        | Hébergement                    | Profil de coût  |
| ------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------ | --------------- |
| [pgvector](https://github.com/pgvector/pgvector) | Les équipes déjà sur Postgres                                     | Postgres self-hosted ou managé | Faible à modéré |
| [Pinecone docs](https://docs.pinecone.io/)       | Une recherche vectorielle managée avec peu d'opérations           | SaaS entièrement managé        | Modéré à élevé  |
| [Weaviate docs](https://docs.weaviate.io/)       | La recherche hybride et des capacités de connaissance plus riches | Self-hosted ou cloud managé    | Modéré          |
| [Chroma docs](https://docs.trychroma.com/)       | Le développement local et les prototypes légers                   | Local ou self-hosted           | Faible          |

Ma règle de décision est volontairement sobre : si vous êtes déjà sur Postgres, commencez par pgvector. Ajoutez Pinecone quand vous voulez moins d'opérations et que le budget suit. Allez vers Weaviate quand la recherche hybride est un vrai besoin, pas parce que la fiche produit est séduisante. Gardez Chroma pour les expériences locales et les petits outils internes.

Si votre benchmark de retrieval rate plus d'environ 1 question évidente sur 10, ne touchez pas encore au modèle. Corrigez d'abord le chunking, l'overlap, les métadonnées ou le ranking.
