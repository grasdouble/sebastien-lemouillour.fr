---
id: graph-rag
order: 18
difficulty: advanced
tags: [RAG, architecture, graph, GraphRAG]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La recherche plate casse d'une manière très précise : la réponse existe, mais seulement si tu peux traverser des relations entre plusieurs documents. « Quels fournisseurs dépendent de la même région que le composant tombé en panne le trimestre dernier ? » n'est pas un problème de similarité entre chunks. C'est un problème de graphe. C'est pour ça que le Graph RAG existe, et c'est aussi pour ça qu'on le voit trop souvent dans des slides avant d'en avoir besoin.

Je n'y touche pas tant que la recherche sémantique, les filtres de métadonnées et une récupération en plusieurs passes n'ont pas déjà échoué sur de vraies questions multi-sauts. [Microsoft GraphRAG](https://microsoft.github.io/graphrag/) est une proposition sérieuse, avec extraction d'entités, détection de communautés et résumés basés sur le graphe. La leçon importante n'est pas que les graphes sont magiques. C'est qu'il faut déjà disposer d'une structure exploitable avant qu'un graphe mérite d'être maintenu.

La charge de maintenance est la partie que les tutoriels adoucissent trop. Il faut de la qualité d'extraction d'entités, de la qualité de relations, des identifiants stables, une base graphe et un moyen d'expliquer pourquoi une traversée a renvoyé tel résultat. Des bases comme [Neo4j](https://neo4j.com/developer/generative-ai/) sont très bonnes pour le stockage et la traversée. Des outils comme [LlamaIndex knowledge graphs](https://docs.llamaindex.ai/en/stable/examples/index_structs/knowledge_graph/KnowledgeGraphDemo/) peuvent aider à relier ingestion et retrieval. Rien de tout ça ne change la contrainte centrale : si ton corpus est surtout composé de prose désordonnée sans entités durables ni arêtes fiables, tu fabriques surtout de la complexité.

L'architecture à laquelle je fais confiance garde la recherche graphe observable et séparée de la génération :

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

Ce `maxDepth: 2` est exactement le genre de garde-fou banal qui sauve un vrai système. Une traversée sans borne a l'air brillante en démo et finit en pics de latence, avec des preuves hors sujet, en production. Je journalise aussi le nombre de nœuds, le nombre d'arêtes, la profondeur de traversée et la part des citations finales qui viennent réellement du graphe plutôt que d'une recherche documentaire classique. Si le chemin graphe n'apporte jamais une preuve décisive, il n'a rien à faire dans le hot path.

Il y a malgré tout un cas où cette approche mérite du respect : répondre à des questions qui dépendent du voisinage d'entités, pas seulement d'un passage local. C'est pour ça qu'elle colle mieux aux organigrammes, aux chaînes d'approvisionnement, aux réseaux de citations et aux mappings de conformité qu'à une base de support générique. Des outils comme [LangChain graph QA](https://python.langchain.com/docs/integrations/graphs/) montrent l'interface, mais la difficulté réelle reste la qualité des données.

Ma règle est sévère parce que le coût opérationnel l'est aussi. Je construis un Graph RAG seulement quand mon jeu d'évaluation contient des échecs multi-sauts répétés, impossibles à corriger avec un meilleur chunking, de meilleurs filtres ou une deuxième passe de retrieval. Si tu ne peux pas montrer l'arête manquante ou l'entité absente qui explique l'échec, tu n'es probablement pas prêt pour un graphe. Tu es surtout prêt pour une meilleure hygiène de retrieval.
