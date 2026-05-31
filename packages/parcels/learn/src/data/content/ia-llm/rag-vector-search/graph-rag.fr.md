---
id: graph-rag
order: 18
difficulty: advanced
tags: [RAG, architecture, graph, GraphRAG]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

La recherche plate échoue d'une manière que les architectes détestent : la réponse est dans le corpus, mais elle se cache derrière deux ou trois relations que ton retriever ne parcourt jamais. « Quel fournisseur partage la même région que le composant tombé en panne le trimestre dernier, et quels contrats mentionnent cette dépendance ? » n'est pas un échec de ranking de chunks. C'est un échec relationnel.

Je ne passe au Graph RAG que quand la recherche sémantique, les filtres de métadonnées et une deuxième passe de retrieval perdent déjà sur un vrai jeu d'eval. [Microsoft GraphRAG](https://microsoft.github.io/graphrag/) repose sur l'extraction d'entités et de relations, leur regroupement en communautés, puis l'usage de ces structures au moment de la requête. Ça ne paie que quand les échecs sont vraiment multi-sauts. Sinon, tu construis un graphe pour masquer une hygiène de retrieval médiocre.

La partie sale, c'est l'ingestion, pas le prompting. Si tu ne peux pas garder des identifiants d'entités stables, contraindre l'extraction des relations et réindexer sans transformer un seul client en trois quasi-doublons, le graphe va pourrir plus vite que les documents dont il vient. [PropertyGraphIndex](https://docs.llamaindex.ai/en/stable/module_guides/indexing/lpg_index_guide/) est utile parce qu'il expose les `kg_extractors`, la validation stricte du schéma et plusieurs retrievers au lieu de faire semblant que l'extraction est réglée. Pour le stockage et la récupération, je préfère une pile graphe maintenue par l'éditeur plutôt que d'en bricoler une, et [Neo4j GraphRAG](https://neo4j.com/docs/neo4j-graphrag-python/current/) détaille clairement ses composants RAG et knowledge-graph builder.

Quand je le mets en prod, le chemin d'exécution reste banal et mesurable :

```ts
async function answerWithGraph(question: string) {
  const entities = await extractEntities(question);
  const subgraph = await graphStore.expand({
    entities,
    maxDepth: 2,
    edgeTypes: ['owns', 'depends_on', 'located_in'],
  });

  const evidence = await rankSubgraphFacts(question, subgraph);
  return generator.answer({ question, evidence: evidence.slice(0, 12) });
}
```

Ce `maxDepth: 2` n'est pas un choix de style. C'est un contrôle de SLA. Les [query modes](https://microsoft.github.io/graphrag/query/overview/) de Microsoft gardent la recherche graphe à côté d'un chemin Basic Search simple parce que certaines questions doivent rester bon marché. En production, je journalise la profondeur de traversée, le nombre de nœuds, le nombre d'arêtes, le volume de faits récupérés et le fait que la réponse finale utilise réellement ou non des preuves issues du graphe. Si la traversée ne change pas la qualité de réponse, elle sort du hot path.

Je ne valide un Graph RAG que quand au moins environ 10 % des échecs d'eval proches de la prod sont clairement relationnels : arête manquante, mauvais saut ou entité orpheline. En dessous, corrige le chunking, les filtres, le reranking, ou ajoute une passe de retrieval. Les graphes servent à traiter des échecs relationnels répétés, pas à rendre une démo de RAG basique artificiellement plus chère.
