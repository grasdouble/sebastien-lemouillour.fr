---
id: rag-fundamentals
order: 4
difficulty: intermediate
tags: [IA, LLM, RAG, embeddings]
---

## Pourquoi les LLMs ont besoin de vos données

Un LLM est puissant, mais il a un angle mort : ses connaissances sont figées au moment de l'entraînement. Il ne connaît pas votre catalogue produit, votre wiki interne, vos procédures support ou le PDF ajouté hier par votre équipe. Si vous lui demandez « quelle est notre politique de remboursement pour les clients enterprise ? », le modèle ne peut que deviner tant que vous ne lui fournissez pas l'information.

C'est exactement l'idée du **Retrieval-Augmented Generation (RAG)** : avant de demander au modèle de répondre, on récupère d'abord les informations pertinentes dans vos propres données, puis on injecte ces informations dans le prompt. Autrement dit, on ne rend pas le modèle plus intelligent ; on lui évite surtout de répondre dans le vide.

Une bonne analogie est celle d'un consultant expert. Le consultant est intelligent et sait bien formuler ses réponses, mais il a quand même besoin d'accéder à votre documentation pour répondre à des questions propres à votre entreprise. Le RAG donne cette documentation au modèle au bon moment.

C'est souvent plus adapté qu'un fine-tuning pour des connaissances qui changent souvent. Le fine-tuning modifie le comportement du modèle ; le RAG modifie le contexte qu'il reçoit. Si votre documentation évolue chaque semaine, la récupération de contexte est souvent l'option la plus simple et la plus sûre.

## Que sont les embeddings ?

Pour que ce mécanisme fonctionne, il faut maintenant résoudre un problème très concret : comment retrouver les bons passages sans compter uniquement sur des mots-clés exacts ? C'est le rôle des **embeddings**. Un embedding est une liste de nombres qui représente le sens d'un texte.

Imaginez des coordonnées GPS, mais pour le sens au lieu de la géographie. Deux adresses proches sur une carte sont probablement dans le même quartier. Deux embeddings proches dans l'espace vectoriel parlent probablement du même sujet. Cette analogie est utile, parce qu'elle rappelle qu'on ne cherche pas une égalité parfaite, mais une proximité.

C'est pour cela qu'une recherche sur « politique de congés » peut retrouver un chunk qui contient « règles de vacances payées », même si les mots exacts ne correspondent pas. Une fois ce modèle mental acquis, l'étape suivante devient naturelle : il faut maintenant mesurer à quel point deux coordonnées de sens sont proches.

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

En pratique, on stocke ce vecteur à côté du chunk de texte original pour pouvoir le rechercher plus tard. C'est ce pont entre texte et espace vectoriel qui rend la récupération sémantique possible.

## Le pipeline RAG

Une fois cette brique comprise, le reste du pipeline devient beaucoup plus lisible. Un flux RAG minimal ressemble à ceci :

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

On peut résumer ce pipeline en trois phases distinctes. D'abord, **l'indexation** prépare la base de connaissance : on découpe les documents, on calcule leurs embeddings et on les stocke. Ensuite, **la récupération** prend une nouvelle question, la projette dans le même espace vectoriel et retrouve les chunks les plus proches. Enfin, **la génération** transforme ces faits récupérés en une réponse utile.

Cette séparation est importante, parce que chaque phase a un rythme et un coût différents. L'indexation coûte cher mais se fait en amont. La récupération doit être rapide au moment de la question. La génération, elle, dépend de la qualité du contexte envoyé. Si vous mélangez tout, vous rendez le système plus difficile à optimiser, à tester et à faire évoluer.

## Stratégies de chunking

Pourquoi ne pas embedder chaque document en entier, une seule fois, et s'arrêter là ? Parce qu'un document complet dilue le sens, dépasse plus facilement les limites de contexte et rend la récupération moins précise. Le chunking crée des unités plus petites, donc plus faciles à faire correspondre à une vraie question utilisateur.

L'overlap compte aussi. Si une idée traverse la frontière entre deux chunks, un léger chevauchement permet de conserver la continuité.

| Stratégie             | Fonctionnement                                              | Forces                     | Faiblesses                             | Bon choix par défaut pour                 |
| --------------------- | ----------------------------------------------------------- | -------------------------- | -------------------------------------- | ----------------------------------------- |
| Taille fixe           | Découpe tous les N caractères ou tokens                     | Simple, rapide, prévisible | Peut couper au milieu d'une idée       | Prototypes rapides                        |
| Basée sur les phrases | Regroupe des phrases complètes jusqu'à une limite de taille | Chunks plus lisibles       | La longueur des phrases varie beaucoup | FAQ, articles, guides                     |
| Sémantique            | Coupe sur les changements de sujet ou les titres            | Meilleure cohérence        | Plus difficile à implémenter           | Grosses bases de connaissance structurées |

Un bon point de départ consiste à utiliser un découpage à taille fixe ou basé sur les phrases, avec 10 à 20 % d'overlap. Ensuite, on évalue avec de vraies questions utilisateur.

## Implémenter un RAG en TypeScript

Maintenant que le pipeline est clair, le code ci-dessous montre comment ces trois phases s'enchaînent concrètement : indexer des documents en mémoire, récupérer les chunks les plus proches, puis les envoyer à un LLM. Pour apprendre, un tableau en mémoire suffit. En production, vous remplacerez cela par un stockage persistant.

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

Cette séparation est importante : l'indexation coûte cher et se fait en amont, tandis que la récupération et la génération se produisent au moment de la requête. En pratique, c'est aussi ce qui permet d'optimiser, de tester et de faire évoluer chaque phase sans rendre l'ensemble du système opaque.

## Choisir une base vectorielle

Tant que vous apprenez, un tableau en mémoire fait très bien l'affaire. Mais dès que vos données ne tiennent plus confortablement en mémoire — ou que vous avez besoin de persistance entre deux redémarrages — cette approche atteint ses limites. À ce stade, il faut utiliser une base vectorielle ou une base relationnelle avec support vectoriel.

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

Le RAG n'est pas magique, mais il devient fiable quand les fondations sont solides : de bons chunks, un bon retrieval et un modèle obligé de répondre à partir de ces preuves. Ces trois briques sont ce qui permet de construire la confiance entre vos données et le modèle.
