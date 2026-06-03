---
id: long-context-vs-rag
order: 20
difficulty: advanced
tags: [rag]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Votre équipe a enfin fait tourner la démo au million de tokens, et maintenant chaque question difficile se règle en collant plus de fichiers dans le prompt. Puis le SLA glisse, le coût par requête explose, et personne ne sait dire si le modèle a raté la réponse ou si vous lui avez juste envoyé les mauvaises 400 pages.

Moi, je livrerais RAG en premier. Les [modèles Claude](https://docs.anthropic.com/en/docs/about-claude/models/overview) et le [long contexte Gemini](https://ai.google.dev/gemini-api/docs/long-context) montrent que les très grandes fenêtres de contexte sont réelles en production, mais plus de contexte n'est pas une stratégie de sélection. Si la preuve utile est clairsemée, payer le modèle pour tout relire est une architecture paresseuse.

Le long contexte gagne seulement quand l'ensemble documentaire est déjà borné avant l'inférence. Si un humain ou un workflow amont a déjà réduit la requête à quelques documents, le raisonnement sur document complet peut battre la récupération par chunks. C'est le cas rare où j'arrête de me battre pour la recherche et je laisse le modèle lire.

La plupart des systèmes n'ont pas ce luxe. La couche de retrieval existe parce que l'[API Retrieval](https://platform.openai.com/docs/guides/retrieval) renvoie des chunks scorés avec leur fichier d'origine, donc quelque chose qu'on peut inspecter, régler et faire respecter avec les frontières d'ACL. Cette observabilité compte plus que l'élégance de l'architecture dès que les revues d'incident commencent.

Le prompt caching amortit le coût des longs prompts, mais il ne sauve pas de mauvaises décisions de pertinence. Le [cache OpenAI](https://platform.openai.com/docs/guides/prompt-caching) exige un préfixe identique et fonctionne surtout quand le contenu statique reste au début; le [cache Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) documente la même logique avec des points de cache. C'est utile pour des préfixes répétés, pas pour décider quelles preuves doivent entrer dans la requête.

Si quelqu'un veut le comparatif sans le discours, voilà celui que j'ai en tête:

| Dimension                           | Long contexte                                                                                      | RAG                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Coût                                | Devient vite cher parce que chaque requête repaie la relecture de documents entiers                | En général moins cher, car l'embedding se paie surtout à l'ingestion et l'inférence ne voit qu'une shortlist               |
| Latence                             | Plus élevée et moins prévisible à mesure que le prompt grossit                                     | Plus basse si le retrieval est propre, même si le reranking ajoute parfois une étape                                       |
| Fraîcheur                           | Correcte seulement si le prompt est reconstruit à partir de sources fraîches à chaque requête      | Plus robuste par défaut, car on peut réindexer ou requêter des données qui changent sans refaire tout le contrat de prompt |
| Précision sur de gros documents     | Bonne si les bons documents sont déjà connus, faible si la réponse est noyée dans une grosse masse | Meilleure quand la preuve est clairsemée, parce que la sélection est faite avant la génération                             |
| Dépendance à la fenêtre de contexte | Dépend entièrement de la taille de fenêtre et du pricing du modèle                                 | Beaucoup moins dépendant, car le retrieval réduit la charge avant la génération                                            |
| Scalabilité                         | S'écroule dès que le corpus ou le nombre de documents par requête continue de grossir              | Passe mieux à l'échelle, car la recherche réduit le corpus avant de payer le raisonnement du modèle                        |

Quand je dois trancher vite, je réduis la décision à cette règle:

```yaml
ship_long_context_if:
  - documents_are_known_before_inference
  - analysts_need_full_document_reasoning
  - per-request_corpus_is_small_and_stable
ship_rag_if:
  - evidence_is_sparse
  - corpus_changes_daily
  - citations_acl_or_debuggability_matter
ship_hybrid_if:
  - retrieval_finds_candidates_reliably
  - final_answer_requires_full_document_reads
```

Je choisis l'hybride plus souvent que les équipes ne l'imaginent. On récupère d'abord, puis on promeut deux à cinq documents complets dans l'étape finale de synthèse. Ça garde le retrieval mesurable et ça préserve la seule chose que le long contexte fait vraiment bien: comparer des documents entiers sans couture approximative entre chunks.

Ma règle est brutale: si vous ne pouvez pas nommer l'ensemble exact de documents avant que le retrieval s'exécute, ne livrez pas un pur long context. Commencez par RAG. Ne payez la synthèse en long contexte qu'après avoir laissé le retrieval réduire le corpus.
