---
id: rag-fundamentals
order: 4
difficulty: intermediate
tags: [IA, LLM, RAG, embeddings]
---

## Pourquoi les LLMs ont besoin de vos données

Un LLM est puissant, mais il a un angle mort : ses connaissances sont figées au moment de l'entraînement. Il ne connaît pas votre catalogue produit, votre wiki interne, vos procédures support ou le PDF ajouté hier par votre équipe. Si vous lui demandez « quelle est notre politique de remboursement pour les clients enterprise ? », le modèle ne peut que deviner tant que vous ne lui fournissez pas l'information.

C'est exactement l'idée du **Retrieval-Augmented Generation (RAG)** : avant de demander au modèle de répondre, on récupère d'abord les informations pertinentes dans vos propres données, puis on injecte ces informations dans le prompt.

Une bonne analogie est celle d'un consultant expert. Le consultant est intelligent et sait bien formuler ses réponses, mais il a quand même besoin d'accéder à votre documentation pour répondre à des questions propres à votre entreprise. Le RAG donne cette documentation au modèle au bon moment.

C'est souvent plus adapté qu'un fine-tuning pour des connaissances qui changent souvent. Le fine-tuning modifie le comportement du modèle ; le RAG modifie le contexte qu'il reçoit. Si votre documentation évolue chaque semaine, la récupération de contexte est souvent l'option la plus simple et la plus sûre.

## Que sont les embeddings ?

Pour retrouver les bons passages, il faut pouvoir comparer le sens d'un texte, pas seulement des mots-clés. C'est le rôle des **embeddings**. Un embedding est une liste de nombres qui représente le sens d'un texte.

Imaginez des coordonnées GPS, mais pour le sens au lieu de la géographie. Deux adresses proches sur une carte sont probablement dans le même quartier. Deux embeddings proches dans l'espace vectoriel parlent probablement du même sujet.

C'est pour cela qu'une recherche sur « politique de congés » peut retrouver un chunk qui contient « règles de vacances payées », même si les mots exacts ne correspondent pas.

La **similarité cosinus** est la mesure la plus courante pour évaluer cette proximité. Pas besoin de retenir la formule : elle indique si deux vecteurs pointent dans une direction sémantique similaire. Une similarité cosinus élevée signifie en pratique « ces textes veulent probablement dire des choses proches ».

Voici à quoi ressemble un appel à l'API OpenAI pour générer un embedding :

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

En pratique, on stocke ce vecteur à côté du chunk de texte original pour pouvoir le rechercher plus tard.

## Le pipeline RAG

Un flux RAG minimal ressemble à ceci :

```text
Document -> Chunk -> Embed -> Store
Query -> Embed -> Search -> Top-K -> LLM -> Answer
```

Chaque étape a un rôle précis :

- **Document** — vos sources : Markdown, PDF, pages Notion, tickets, documentation produit.
- **Chunk** — découper les gros documents en passages plus petits pour garder une recherche précise et rester dans la fenêtre de contexte.
- **Embed** — convertir chaque chunk en vecteur.
- **Store** — sauvegarder le texte et son vecteur en mémoire, en base ou dans un vector store.
- **Query** — la question de l'utilisateur.
- **Embed** — convertir aussi cette question en vecteur.
- **Search** — comparer le vecteur de la question avec les vecteurs stockés.
- **Top-K** — garder les meilleures correspondances, souvent 3 à 5 chunks.
- **LLM** — construire un prompt avec la question et le contexte récupéré.
- **Answer** — générer une réponse fondée sur ce contexte.

L'idée clé est simple : la récupération réduit l'espace de recherche, puis la génération transforme les faits récupérés en réponse utile.

## Stratégies de chunking

On évite en général d'embedder des documents entiers tels quels. Les gros documents diluent le sens, dépassent les limites de contexte et rendent la recherche moins précise. Le chunking crée des unités plus petites, donc plus faciles à faire correspondre.

L'overlap compte aussi. Si une idée traverse la frontière entre deux chunks, un léger chevauchement permet de conserver la continuité.

| Stratégie             | Fonctionnement                                              | Forces                     | Faiblesses                             | Bon choix par défaut pour                 |
| --------------------- | ----------------------------------------------------------- | -------------------------- | -------------------------------------- | ----------------------------------------- |
| Taille fixe           | Découpe tous les N caractères ou tokens                     | Simple, rapide, prévisible | Peut couper au milieu d'une idée       | Prototypes rapides                        |
| Basée sur les phrases | Regroupe des phrases complètes jusqu'à une limite de taille | Chunks plus lisibles       | La longueur des phrases varie beaucoup | FAQ, articles, guides                     |
| Sémantique            | Coupe sur les changements de sujet ou les titres            | Meilleure cohérence        | Plus difficile à implémenter           | Grosses bases de connaissance structurées |

Un bon point de départ consiste à utiliser un découpage à taille fixe ou basé sur les phrases, avec 10 à 20 % d'overlap. Ensuite, on évalue avec de vraies questions utilisateur.

## Implémenter un RAG en TypeScript

L'exemple ci-dessous montre tout le flux : indexer des documents en mémoire, récupérer les chunks les plus proches, puis les envoyer à un LLM. Pour apprendre, un tableau en mémoire suffit. En production, vous remplacerez cela par un stockage persistant.

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

Remarquez les trois phases distinctes :

1. **Indexation** — préparer la base de connaissance une fois.
2. **Récupération** — trouver les chunks les plus pertinents pour une nouvelle question.
3. **Génération** — demander au LLM de répondre uniquement à partir de ces chunks.

Cette séparation est importante : l'indexation coûte cher et se fait en amont, tandis que la récupération et la génération se produisent au moment de la requête.

## Choisir une base vectorielle

Quand les données ne tiennent plus en mémoire, il faut utiliser une base vectorielle ou une base relationnelle avec support vectoriel.

| Option   | Idéal pour                                                              | Hébergement                    | Profil de coût  |
| -------- | ----------------------------------------------------------------------- | ------------------------------ | --------------- |
| pgvector | Les équipes déjà sur Postgres                                           | Postgres self-hosted ou managé | Faible à modéré |
| Pinecone | Une recherche vectorielle managée avec peu d'opérations                 | SaaS entièrement managé        | Modéré à élevé  |
| Weaviate | La recherche hybride et des fonctionnalités de connaissance plus riches | Self-hosted ou cloud managé    | Modéré          |
| Chroma   | Le développement local et les prototypes légers                         | Local ou self-hosted           | Faible          |

Règle pratique :

- Commencez par **un tableau en mémoire** pour apprendre.
- Passez à **pgvector** si votre stack utilise déjà Postgres.
- Choisissez **Pinecone** si vous voulez le moins d'overhead opérationnel.
- Regardez **Weaviate** pour des fonctions de retrieval plus avancées.
- Utilisez **Chroma** pour expérimenter et faire des démos locales.

Le RAG n'a rien de magique. C'est un pipeline : préparer de bons chunks, récupérer le bon contexte, puis demander au modèle de rester ancré dans ce contexte. Si ces trois briques sont solides, vous avez déjà un système minimal utile.
