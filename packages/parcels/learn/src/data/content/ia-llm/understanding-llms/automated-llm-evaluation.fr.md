---
id: automated-llm-evaluation
order: 28
difficulty: advanced
tags: [evaluation, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Si tu ne relis que dix sorties à la main, des régressions partent en prod. Si tu remplaces ça par un score de juge automatique et que tu appelles ça de la science, des régressions partent quand même. Une évaluation automatisée ne commence à payer que quand le volume grimpe et que le rythme de release compte. Mal utilisée, elle industrialise juste la fausse confiance.

## Commence par les contrôles durs

Pour tout ce qui touche à une barrière de release, je commencerais par des contrôles déterministes. [OpenAI Evals](https://platform.openai.com/docs/guides/evals) est conçu autour de jeux de données rejouables et d'exécutions répétables, et [OpenAI graders](https://platform.openai.com/docs/guides/graders) pose clairement la différence entre vérifications exactes, similarité textuelle et juges par modèle. C'est le bon ordre. Utilise d'abord des contrôles de chaîne, de schéma et d'appel d'outils pour les exigences dures. Ne sors un juge LLM qu'après avoir déjà filtré les échecs objectifs et bon marché.

## Les juges LLM ont besoin de rubriques, pas d'intuition

Si les équipes utilisent autant le pattern LLM-as-judge, c'est simple : l'utilité, le respect des instructions et la qualité comparative se scorent mal avec des règles brutes. [G-Eval](https://arxiv.org/abs/2303.16634) reste la preuve la plus propre qu'une grille structurée améliore l'alignement avec les notes humaines. La leçon, ce n'est pas que le juge est intelligent. La leçon, c'est que la rubrique fait une partie du vrai travail. Si tu ne peux pas écrire une grille qu'un autre reviewer suivrait de la même façon, n'automatise pas encore ce jugement.

## Le pairwise bat les notes absolues

Dès qu'un juge entre dans la boucle, je choisirais une comparaison par paires plutôt qu'une note de 1 à 5 presque à chaque fois. [MT-Bench](https://arxiv.org/abs/2306.05685) montre que des juges puissants peuvent suivre assez correctement la préférence humaine, tout en exposant des biais de position, de verbosité et d'auto-préférence. C'est précisément pour ça qu'un pairwise avec ordre des réponses inversé est plus sûr qu'un joli dashboard scalaire. Un match nul avec une raison écrite vaut plus qu'un 4,2 faussement précis.

## Le RAG est l'endroit où les mauvaises evals mentent

Un système RAG casse à deux endroits : la récupération et la génération de réponse. Si tu écrases ça dans un score unique, tu n'apprends presque rien. [Ragas metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/) sépare la pertinence de la réponse, la précision du contexte, le rappel du contexte et la fidélité parce que ces modes d'échec sont différents et utiles en exploitation. Je suivrais les métriques de retrieval et les métriques de réponse côte à côte, puis j'inspecterais les désaccords au lieu de les moyenner dans un chiffre taillé pour un slide.

## En production, la suite pourrit

L'eval elle-même dérive. Les prompts changent, les modèles juges sont mis à jour, le dataset vieillit, et l'équipe apprend discrètement à plaire à la métrique. Donc garde un jeu figé et arbitré pour les tendances, un jeu tournant issu des échecs récents, et un minimum d'observabilité sur le taux de réussite par tâche, le taux de désaccord du juge et les variations de score après chaque changement de modèle ou de prompt. Si tu ne regardes pas ces trois signaux, le dashboard est un décor.

## Règle de décision

Automatise tout ce que tu peux rejouer à faible coût et expliquer clairement. Utilise des juges LLM seulement quand une rubrique écrite existe, que l'ordre des réponses est randomisé et que des humains auditent encore un échantillon. Si tu ne peux pas dire quel mode d'échec a bougé et pourquoi, l'eval n'est pas prête à protéger un SLA.
