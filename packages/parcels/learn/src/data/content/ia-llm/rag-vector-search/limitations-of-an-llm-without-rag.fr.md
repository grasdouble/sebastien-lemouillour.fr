---
id: limitations-of-an-llm-without-rag
order: 3
difficulty: beginner
tags: [RAG, LLM, hallucinations, knowledge]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Vous demandez au modèle la dernière politique de remboursement, sans rien coller d'autre, et il répond comme s'il venait d'ouvrir le manuel il y a cinq secondes. Ce n'est pas le cas. Si ce genre d'erreur très sûre d'elle vous met mal à l'aise, vous avez raison : un grand modèle de langage (LLM), sans retrieval-augmented generation (RAG), n'a aucun moyen fiable d'aller consulter votre vrai document de référence.

Ce comportement gênant vient de la façon dont un LLM seul fonctionne. Il génère à partir de motifs stockés dans ses paramètres entraînés, pas à partir d'une consultation en direct de vos documents. [GPT-3](https://arxiv.org/abs/2005.14165) a rendu cette famille de modèles célèbre, et le [RAG paper](https://arxiv.org/abs/2005.11401) reste la meilleure explication du fossé : le modèle possède une mémoire paramétrique, ce qu'il a appris pendant l'entraînement, mais pas un accès garanti aux faits externes qui vous intéressent aujourd'hui.

Voilà pourquoi le premier problème, c'est la **connaissance figée**. Si votre documentation a changé hier, le modèle ne le sait pas par magie. Si la réponse vit dans une base privée qu'il n'a jamais vue, il ne peut rien vérifier. Les débutants s'attendent souvent à un « je ne sais pas » bien sage. En pratique, on obtient souvent une meilleure imitation de certitude, et c'est amusant seulement jusqu'au moment où quelqu'un la croit.

Le réflexe suivant consiste souvent à bourrer le prompt avec plus de texte. Je comprends très bien la tentation. Des fournisseurs comme Anthropic expliquent les [context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows) : la fenêtre de contexte, c'est la quantité de texte que le modèle peut prendre en compte dans une requête. Une grande fenêtre aide à transporter plus de matière, mais ce n'est pas un système de recherche. Elle ne choisit pas le bon paragraphe, ne garde pas votre contenu à jour, et passe mal à l'échelle dès que vos documents ne tiennent plus dans un seul prompt.

Il manque donc la pièce décisive : le retrieval, c'est-à-dire l'étape qui cherche dans vos documents avant que le modèle réponde. Une architecture courante transforme des morceaux de texte en vecteurs appelés embeddings, des représentations numériques qui placent côte à côte les contenus au sens proche. Le [guide OpenAI sur les embeddings](https://platform.openai.com/docs/guides/embeddings) est un bon premier repère. Moi, je choisirais presque toujours le retrieval plutôt que des prompts toujours plus longs, parce qu'une recherche en amont coûte moins cher, se met à jour plus facilement, et se laisse beaucoup mieux raisonner.

Le retrieval répare aussi un problème que les débutants remarquent rarement au premier jour : la **traçabilité**. Quand le système ramène des passages source, vous pouvez montrer ce qu'il a utilisé, vérifier s'il a récupéré le mauvais extrait, et déboguer le système sans essayer de lire dans l'esprit du modèle, loisir que je recommande assez peu. Sans cette étape, on juge surtout une réponse à l'impression générale.

Ma règle est simple : si un humain devrait vérifier une source avant de répondre, le modèle devrait la vérifier lui aussi. Gardez l'approche sans retrieval pour les démos, les toutes petites bases statiques, ou les tâches ponctuelles où vous préparez vous-même le contexte. Dès que la réponse doit résister à des documents qui changent ou à la confiance d'un utilisateur, passez au retrieval, puis allez lire le guide suivant sur la similarité sémantique, la technique qui aide le système à retrouver un texte de même sens même quand les mots changent.
