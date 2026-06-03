---
id: what-is-rag
order: 1
difficulty: beginner
tags: [rag, embeddings, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Vous avez mis en ligne un chatbot. Il répond avec aplomb, puis il invente une règle tarifaire modifiée hier. Ce genre d'erreur suffit à faire douter de toute la fonctionnalité.

La réponse à ce problème, c'est ce que le [RAG paper](https://arxiv.org/abs/2005.11401) appelle le **Retrieval-Augmented Generation**. Le nom fait un peu universitaire, mais l'idée est très concrète : avant que le modèle réponde, le système va chercher des passages pertinents dans une source externe et les place dans le prompt. La **retrieval**, c'est l'étape de recherche. La **generation**, c'est l'étape d'écriture qui vient juste après. L'image que je choisirais, c'est celle d'un examen avec documents autorisés : le modèle rédige toujours la réponse, mais il peut ouvrir les bonnes pages avant de parler.

Pour rendre cette recherche possible, beaucoup d'équipes utilisent des [embeddings](https://platform.openai.com/docs/guides/embeddings), des vecteurs numériques qui placent les textes proches de sens près les uns des autres. La question de l'utilisateur est transformée de la même façon. Une bibliothèque de recherche comme [FAISS](https://faiss.ai/) peut alors comparer ces vecteurs et renvoyer les chunks les plus proches, c'est-à-dire de petits morceaux de documents, au lieu de relire chaque paragraphe un par un.

C'est l'erreur de débutant que je vois tout le temps : croire que le modèle va "connaître" un nouveau document dès qu'on l'a importé. Ce n'est pas comme ça que ça marche. Le RAG ne réentraîne pas le modèle. Il lui donne le bon contexte au moment de répondre. Si votre vrai besoin est d'obtenir un modèle qui respecte mieux un ton ou un format de sortie précis, j'irais regarder du côté du [fine-tuning](https://platform.openai.com/docs/guides/fine-tuning). Si votre besoin est d'accéder à des documents qui changent, je choisirais du RAG presque à chaque fois.

La partie délicate, et oui, c'est exactement celle que les tutos escamotent, c'est que le RAG n'aide que si la retrieval est bonne. Si le système remonte le mauvais chunk, le modèle peut quand même produire une réponse fausse avec beaucoup d'assurance. C'est pour cela que le chunking, les métadonnées, les droits d'accès et la qualité des sources comptent très tôt. Le chunking consiste à découper un long document en morceaux plus petits. Les métadonnées sont des étiquettes comme un titre, une zone produit ou une date. Les droits d'accès déterminent quels documents un utilisateur donné a le droit de récupérer. Rien de tout cela n'est très glamour, mais c'est là que la confiance se gagne ou se perd.

Ma règle de base est assez nette : utilisez du RAG quand la réponse doit venir de documents qui changent, restent privés ou doivent pouvoir être cités. Évitez-le quand cinq faits courts et stables tiennent déjà proprement dans le prompt.
