---
id: limitations-of-an-llm-without-rag
order: 3
difficulty: beginner
tags: [RAG, LLM, hallucinations, knowledge]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous demandez au modèle la politique de remboursement de votre entreprise, et il répond avec beaucoup d'assurance en décrivant une règle qui n'existe pas. Au début, c'est déroutant. Le texte sonne juste. Le problème, en réalité, est beaucoup plus simple : sans RAG, le modèle n'a aucun moyen fiable d'aller vérifier votre vraie politique.

Un LLM seul répond à partir de ce qui est stocké dans ses paramètres, les poids numériques appris pendant l'entraînement. Des travaux comme [GPT-3](https://arxiv.org/abs/2005.14165) ont popularisé cette famille de modèles, et le [RAG paper](https://arxiv.org/abs/2005.11401) a formulé très clairement la limite en opposant mémoire paramétrique, ce qui vit dans le modèle, et mémoire non paramétrique, l'information récupérée depuis une source externe.

Cela crée une première limite majeure : une **connaissance figée**. Le modèle ne sait que ce qui a été appris pendant l'entraînement et ce que vous lui donnez dans le prompt. Si votre documentation a changé hier, ou si la réponse se trouve dans un wiki privé qu'il n'a jamais vu, le modèle ne refuse pas d'aider. Il improvise avec beaucoup de style.

La deuxième limite, c'est l'absence d'**accès natif à vos données**. Beaucoup de débutants imaginent qu'un modèle va deviner les faits propres à leur entreprise à partir d'une consigne vague. Ce n'est pas le cas. Si vous voulez qu'il utilise votre contenu, il faut une couche de retrieval qui transforme les documents en représentations recherchables, souvent via le [embeddings guide](https://platform.openai.com/docs/guides/embeddings), puis qui récupère les bons passages au moment de répondre.

La troisième limite, c'est une **traçabilité faible**. Sans passages récupérés depuis une source, le modèle peut bien produire une réponse, mais il devient difficile de vérifier d'où elle vient. Cette faiblesse compte plus qu'on ne l'imagine. Si un utilisateur demande « d'où sors-tu ça ? », un système basé uniquement sur le prompt n'a souvent rien de convaincant à montrer.

Il y a aussi un malentendu fréquent autour des prompts très longs. Des fenêtres de contexte plus larges sont utiles, et Anthropic en parle dans [context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows), mais une grande fenêtre de contexte n'est pas la même chose qu'une couche de retrieval. Elle permet d'emporter plus de texte dans une requête. Elle ne permet pas de retrouver automatiquement le bon texte, de le tenir à jour, ni de respecter facilement des droits d'accès document par document.

Mon avis est assez tranché : si l'exactitude dépend de faits qui vivent en dehors du modèle, une approche sans retrieval reste un raccourci fragile. Elle peut suffire pour une démo, une petite base de connaissance stable, ou une tâche ponctuelle où un humain prépare lui-même le contexte. Ce n'est pas un bon choix par défaut pour le support, les assistants internes, ou tout système auquel les utilisateurs risquent de faire confiance.

J'utilise une règle simple : si vous seriez vous-même mal à l'aise de répondre sans vérifier une source, votre modèle devrait probablement vérifier une source lui aussi. Le guide suivant introduit l'idée qui rend cette vérification possible à grande échelle : la similarité sémantique.
