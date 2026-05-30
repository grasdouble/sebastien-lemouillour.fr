---
id: ai-benchmarks
order: 27
difficulty: advanced
tags: [LLM, évaluation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Un modèle gagne trois points sur un leaderboard et, tout à coup, la salle se comporte comme si la décision était prise. Puis ce même modèle rate ton extraction, casse ton workflow d'outils, ou échoue sur une requête utilisateur d'une banalité affligeante. Les benchmarks sont utiles. Le culte du classement ne l'est pas. L'erreur consiste à traiter les scores comme une vérité produit alors qu'ils ne sont qu'un signal compressé avec d'énormes angles morts.

## À quoi servent vraiment les benchmarks populaires

Le [papier MMLU](https://arxiv.org/abs/2009.03300) est utile pour mesurer une large couverture de connaissances académiques et professionnelles sous forme de questions à choix multiple. Ça dit quelque chose sur l'étendue et le rappel, mais presque rien sur le comportement multi-tour, l'ancrage dans des sources, ou la capacité à rester utile quand le prompt devient sale.

Le [papier HumanEval](https://arxiv.org/abs/2107.03374) est excellent pour la synthèse de code dans un sens étroit : est-ce que le modèle peut générer une fonction qui passe des tests unitaires cachés, souvent résumés avec pass@k ? C'est précieux, mais ça reste un bac à sable contrôlé. Ça dit beaucoup moins sur l'édition de grosses bases de code, la gestion de l'ambiguïté, ou l'évitement de régressions subtiles.

Le [papier HELM](https://arxiv.org/abs/2211.09110) est plus honnête sur ce qu'est vraiment l'évaluation : une matrice de compromis. Il compare les modèles à travers plusieurs scénarios et plusieurs métriques au lieu de prétendre qu'un seul nombre peut représenter la qualité. Je fais plus confiance à cette approche parce qu'un vrai système doit gérer en même temps la robustesse, la calibration, l'efficacité et l'équité.

[Chatbot Arena](https://arxiv.org/abs/2403.04132) est utile pour mesurer la préférence humaine dans le chat ouvert. Il capte mieux le goût conversationnel que des benchmarks académiques statiques, surtout quand des utilisateurs comparent deux sorties face à face. Le piège, c'est qu'il mesure ce que les utilisateurs d'Arena récompensent, pas forcément ce que tes utilisateurs à toi récompensent.

## Là où les benchmarks trompent les équipes

D'abord, les benchmarks saturent. Quand suffisamment de modèles se retrouvent au sommet, de petites variations de score créent une fausse impression de séparation significative. Ensuite, le format du prompt compte énormément. Un résultat de benchmark reflète souvent non seulement la capacité du modèle, mais aussi le harness exact d'évaluation, les instructions système, le réglage de décodage, et la logique d'extraction de réponse.

Ensuite, les benchmarks collent rarement à l'économie réelle de la production. Ils cachent souvent la latence, la fiabilité des appels d'outils, le coût par requête, l'observabilité, les comportements de repli et la conformité aux politiques. Un modèle qui gagne sur des questions de connaissances peut rester un mauvais choix s'il est trop lent, trop cher ou trop instable pour ton produit.

Le dernier piège, c'est la contamination. Quand des items de benchmark fuient dans les données d'entraînement ou de tuning, le score mesure moins la généralisation que le rappel pur. On ne sait pas toujours quand c'est arrivé, donc chaque leaderboard mérite d'être lu avec un peu de méfiance.

## Comment les utiliser sans te mentir

Utilise les benchmarks publics pour présélectionner et pour comprendre la forme générale d'un modèle, pas pour trancher seul. Je les aime bien pour répondre à des questions du type : ce modèle est-il particulièrement fort en code, en connaissances générales ou en préférence conversationnelle ? Je ne leur fais pas confiance pour répondre à : ce modèle va-t-il améliorer mon produit le trimestre prochain ?

Le bon pattern est banal, mais efficace. Commence par les benchmarks publics pour scanner le marché, puis construis des évaluations privées qui reproduisent tes prompts, tes contraintes, tes modes d'échec et ton niveau d'exigence. Si les scores publics et tes résultats privés se contredisent, fais confiance à ta tâche.

## Règle de décision

Utilise les benchmarks pour réduire l'espace de recherche, jamais pour déléguer ton jugement. Si un benchmark mesure réellement la même forme de tâche, le même niveau de risque et la même attente utilisateur que ton produit, donne-lui du poids. Sinon, traite-le comme un signal de contexte et passe à autre chose.
