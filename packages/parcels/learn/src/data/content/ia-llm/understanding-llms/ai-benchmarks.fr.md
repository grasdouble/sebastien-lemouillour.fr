---
id: ai-benchmarks
order: 27
difficulty: advanced
tags: [evaluation, llm]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Un modèle gagne trois points sur un leaderboard et, soudain, tout le monde veut signer. Puis il rate ton extraction structurée, laisse tomber un appel d'outil, ou explose le budget de latence. Voilà le piège. Les benchmarks publics sont utiles pour faire le tri. Ils sont mauvais pour prendre la décision finale à ta place en production.

## Ce que chaque benchmark achète vraiment

[MMLU](https://arxiv.org/abs/2009.03300) reste utile pour une seule chose : la connaissance générale en format QCM. Si je veux une lecture rapide du rappel académique et professionnel, je le regarde. Si je veux prédire un vrai travail multi-tour un peu sale, je l'ignore.

[HumanEval](https://arxiv.org/abs/2107.03374) est celui que je prends au sérieux pour la synthèse de code au sens étroit, parce que le pass@k mesure si des solutions échantillonnées passent des tests cachés. Ça ne dit toujours presque rien sur l'édition d'une base de code vivante sous ambiguïté.

[HELM](https://arxiv.org/abs/2211.09110) est le cadre auquel je fais le plus confiance parce qu'il traite l'évaluation comme une combinaison de scénario, de métrique et d'adaptation, pas comme un nombre magique. C'est beaucoup plus proche de la manière dont les vrais systèmes cassent en production.

[Chatbot Arena](https://arxiv.org/abs/2403.04132) devient utile quand la préférence conversationnelle compte vraiment, puisqu'il classe les modèles à partir de votes humains en face à face agrégés avec un score de type Elo. Je n'achèterais quand même pas un modèle sur Arena seul, sauf si mon produit est presque uniquement du chat ouvert.

## Pourquoi les victoires au leaderboard ratent la production

Le premier problème, c'est la sensibilité du harness. HELM le pose noir sur blanc : les résultats dépendent du scénario, des métriques et de la procédure d'adaptation, donc le format du prompt et le setup d'évaluation peuvent bouger le score. Les petits écarts sur un leaderboard ont l'air précis bien après avoir cessé d'être utiles pour décider.

Le deuxième problème, c'est l'exploitation réelle. Les benchmarks publics disent rarement si le modèle tient un SLA, garde des appels d'outils fiables, ou reste assez bon marché à ton niveau de trafic. Le [guide latence](https://developers.openai.com/api/docs/guides/latency-optimization) existe précisément parce que les contraintes de déploiement sont un problème différent d'une victoire sur benchmark. Si tu portes la latence, le budget d'erreur ou la marge, cette omission compte plus qu'une décimale de plus sur MMLU.

Le troisième problème, c'est la contamination. Le [rapport GPT-4](https://arxiv.org/abs/2303.08774) traite le recouvrement de données comme un vrai risque d'évaluation, parce que des items de benchmark peuvent fuiter dans l'entraînement et gonfler artificiellement la capacité apparente. Lis donc chaque leaderboard comme un résultat potentiellement partiellement mémorisé tant que le contraire n'est pas établi.

## Ce que je ferais à la place

Utilise les benchmarks publics pour réduire le marché à une short list. Ensuite, construis des évaluations privées qui collent à tes prompts, à tes modes d'échec et à tes seuils d'acceptation. Le [guide OpenAI Evals](https://platform.openai.com/docs/guides/evals) pousse exactement cette habitude : évalue la tâche que tu possèdes vraiment, pas celle qu'un leaderboard public a rendue commode.

Je suivrais deux familles de métriques : la réussite de tâche pour ce que l'utilisateur paie réellement, et les métriques opérationnelles pour ce que ton équipe doit garder vivant. Si les deux racontent des histoires différentes, le réalisme de la tâche gagne.

## Règle de décision

Fais confiance à un benchmark en proportion de sa proximité avec ta forme de tâche, ton niveau de risque et tes contraintes d'exploitation. S'il est à plus d'une couche d'abstraction de la production, utilise-le pour filtrer et rien de plus.
