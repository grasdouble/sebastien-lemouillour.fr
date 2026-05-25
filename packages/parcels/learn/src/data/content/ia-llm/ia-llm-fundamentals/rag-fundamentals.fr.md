---
id: rag-fundamentals
order: 4
difficulty: intermediate
tags: [IA, LLM, RAG, embeddings]
---

## Le modèle qui ne connaît pas vos propres données

Vous avez branché un LLM sur votre produit. Bluffant en démo. Puis quelqu'un demande « quelle est notre politique de remboursement pour les comptes enterprise ? » et le modèle répond avec aplomb (et complètement à côté). Pas parce que le modèle est mauvais. Parce qu'il n'a littéralement aucune idée. Ses connaissances se sont arrêtées au moment de l'entraînement. Votre politique de remboursement, votre wiki interne, le PDF uploadé hier par votre équipe : rien de tout ça n'existe pour lui.

C'est exactement le vide que comble le **Retrieval-Augmented Generation (RAG)**. Avant que le modèle réponde, on va chercher les passages pertinents dans vos propres données et on les injecte dans le prompt. Le modèle n'est pas plus intelligent : il lit enfin les bons documents.

Je choisirais le RAG plutôt que le fine-tuning pour tout ce qui change. Le fine-tuning inscrit le comportement dans les poids, ce qui impose un réentraînement à chaque évolution de la documentation. Le RAG, c'est une requête au moment de l'exécution. Si vos données évoluent chaque semaine, ça tranche le débat.

## Les embeddings : comparer le sens sans les mots-clés

Le problème avec la récupération, c'est que les gens ne cherchent pas comme les documents sont rédigés. Un utilisateur demande « politique de congés » ; le handbook dit « règles de vacances payées ». La recherche par mots-clés exacts échoue ici.

Les embeddings règlent ça. Un embedding est un vecteur (une liste de nombres) qui encode le sens d'un texte plutôt que ses mots littéraux. Le modèle mental que j'utilise : des coordonnées GPS pour la sémantique. Deux textes qui veulent dire des choses proches finissent proches dans l'espace vectoriel, exactement comme deux adresses dans le même quartier sont proches sur une carte.

La **similarité cosinus** mesure cette proximité : si deux vecteurs pointent dans la même direction sémantique. Inutile d'assimiler les maths. Ce qui compte : un score élevé signifie « ces textes parlent probablement du même sujet », même quand ils ne partagent aucun mot.

Voici à quoi ressemble un appel d'embedding :

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

On stocke ce vecteur à côté du texte original. C'est le pont entre vos documents et la recherche sémantique.

## Le pipeline RAG

Un flux RAG minimal ressemble à ceci :

```text
Document -> Chunk -> Embed -> Store
Query -> Embed -> Search -> Top-K -> LLM -> Answer
```

Deux rythmes bien distincts derrière ce schéma. L'indexation est un travail offline, en amont : on découpe les documents, on embede chaque fragment, on stocke les résultats avant que quelqu'un pose une question. C'est la partie coûteuse (et on ne la fait qu'une fois par mise à jour).

Au moment de la requête, la récupération et la génération prennent le relais. La question de l'utilisateur est embeddée avec le même modèle, comparée à tout ce qu'on a indexé, et les correspondances les plus proches sont envoyées au LLM. Le modèle ne voit pas toute la base de connaissance : seulement les trois ou cinq passages les plus susceptibles de contenir la réponse.

- **Document / Chunk / Embed / Store**: construire la base de connaissance une fois, en amont.
- **Query / Embed / Search / Top-K**: la réduire à ce qui est pertinent pour cette question précise.
- **LLM / Answer**: transformer les preuves récupérées en réponse utilisable.

## Stratégies de chunking

Pourquoi ne pas embedder des documents entiers et en rester là ? Deux raisons. D'abord, un document long dilue l'embedding : il représente tout en même temps, ce qui le rend plus difficile à faire correspondre à une question précise. Ensuite, les fenêtres de contexte ont des limites, et injecter un document entier dans le prompt est inutilement coûteux quand un seul paragraphe répond réellement à la question.

Le chunking crée des unités plus petites, plus focalisées. L'overlap compte : si une idée traverse la frontière entre deux chunks, un léger chevauchement préserve la continuité.

| Stratégie             | Fonctionnement                                              | Forces                     | Faiblesses                             | Bon choix par défaut pour                 |
| --------------------- | ----------------------------------------------------------- | -------------------------- | -------------------------------------- | ----------------------------------------- |
| Taille fixe           | Découpe tous les N caractères ou tokens                     | Simple, rapide, prévisible | Peut couper au milieu d'une idée       | Prototypes rapides                        |
| Basée sur les phrases | Regroupe des phrases complètes jusqu'à une limite de taille | Chunks plus lisibles       | La longueur des phrases varie beaucoup | FAQ, articles, guides                     |
| Sémantique            | Coupe sur les changements de sujet ou les titres            | Meilleure cohérence        | Plus difficile à implémenter           | Grosses bases de connaissance structurées |

Mon point de départ : découpage par phrases avec 15 % d'overlap. La taille fixe fonctionne pour prototyper mais a le mauvais réflexe de couper les phrases en plein milieu, ce qui nuit à la fois à la lisibilité et à la récupération. Le chunking sémantique donne les meilleurs résultats mais demande plus d'effort ; je l'ajoute une fois que le système fonctionne, pas comme point de départ.

## Implémenter un RAG en TypeScript

L'exemple ci-dessous tourne entièrement en mémoire (pas de base vectorielle nécessaire). C'est intentionnel. Comprendre les trois phases dans un environnement auto-suffisant vaut plus que d'ajouter de l'infrastructure avant de maîtriser les fondamentaux.

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

Les trois phases sont intentionnellement séparées, et cette séparation compte plus qu'il n'y paraît :

1. **Indexation**: le travail coûteux fait une fois par mise à jour de document.
2. **Récupération**: rapide, au moment de la requête. La qualité de cette étape détermine tout ce qui suit.
3. **Génération**: le modèle répond sur preuves, pas de mémoire. C'est ce qui prévient les hallucinations confiantes.

Si la récupération ramène les mauvais chunks, la génération restera confiante et restera fausse. Le maillon faible est presque toujours le chunking et la récupération, pas le modèle.

## Choisir une base vectorielle

Un tableau en mémoire suffit pour comprendre les fondamentaux et prototyper sur de vraies données. Dès que vous avez besoin de persistance, ou que votre index dépasse ce qui tient confortablement en mémoire de processus, il faut autre chose.

| Option   | Idéal pour                                                              | Hébergement                    | Profil de coût  |
| -------- | ----------------------------------------------------------------------- | ------------------------------ | --------------- |
| pgvector | Les équipes déjà sur Postgres                                           | Postgres self-hosted ou managé | Faible à modéré |
| Pinecone | Une recherche vectorielle managée avec peu d'opérations                 | SaaS entièrement managé        | Modéré à élevé  |
| Weaviate | La recherche hybride et des fonctionnalités de connaissance plus riches | Self-hosted ou cloud managé    | Modéré          |
| Chroma   | Le développement local et les prototypes légers                         | Local ou self-hosted           | Faible          |

Mon chemin de décision honnête : si vous êtes déjà sur Postgres, commencez par pgvector (c'est une extension, pas de nouvelle infra). Si l'overhead opérationnel est une vraie contrainte et que le budget le permet, Pinecone est genuinement peu contraignant. Je n'ajouterais Weaviate que si vous avez besoin de recherche hybride ou de fonctionnalités de graphe de connaissance plus avancées. Chroma est mon outil de prédilection pour les expériences locales.

Une dernière chose qu'il faut dire franchement : la qualité de la récupération se dégrade progressivement, mais elle se dégrade. Des chunks trop grands, trop petits ou mal chevauchés donnent au modèle un contexte médiocre et produisent des réponses médiocres. Passez du vrai temps à évaluer la récupération sur des questions utilisateur réelles avant de supposer que le problème vient du modèle.
