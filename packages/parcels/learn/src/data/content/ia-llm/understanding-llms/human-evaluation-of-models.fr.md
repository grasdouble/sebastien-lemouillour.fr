---
id: human-evaluation-of-models
order: 29
difficulty: advanced
tags: [evaluation, llm]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Quand la qualité compte vraiment, les évaluations automatisées cessent d'être suffisantes très vite. Elles ratent le ton, l'utilité réelle, la sûreté, et cette catégorie pénible de réponses que les utilisateurs décrivent comme « techniquement correctes, mais mauvaises ». L'évaluation humaine sert précisément à voir cet écart. Elle devient aussi du déchet dès que l'opérationnel est bâclé. Une mauvaise évaluation humaine, c'est du bruit coûteux avec une apparence d'autorité.

## Commence par la grille, pas par les annotateurs

La plupart des échecs d'évaluation commencent avant même qu'une personne lise un exemple. Si la grille est vague, les annotateurs improvisent. Si les consignes mélangent plusieurs critères, les scores se transforment en impression générale. De bonnes guidelines d'annotation définissent chaque critère, donnent des exemples positifs et négatifs, et expliquent les cas de départage. Des conseils pratiques comme le [guide Label Studio](https://labelstud.io/guide/quality.html) vont dans ce sens : la qualité commence par des consignes claires et des boucles de revue, pas par l'espoir que tout le monde partage la même intuition.

Mon biais est de garder des rubriques plus étroites que ce que les équipes veulent au départ. Sépare la factualité de l'utilité. Sépare la conformité aux politiques du ton. Sépare la qualité de la réponse finale de la qualité du processus. Plus tu entasses de dimensions dans une seule question, moins le score reste interprétable.

## Choisis l'échelle adaptée au jugement

Beaucoup d'équipes prennent des notes de 1 à 5 parce que c'est familier. L'[échelle de Likert](https://archive.org/details/likert-1932-technique-for-measurement-of-attitudes) d'origine fonctionne pour des jugements scalaires rapides quand le critère est simple et les ancres explicites. Ce n'est pas mon premier choix quand les différences sont subtiles ou que deux sorties sont proches en qualité.

Pour classer des sorties de modèles nuancées, la comparaison par paires est souvent meilleure. Elle réduit l'hésitation des annotateurs et force une préférence concrète. Des modèles statistiques comme [Bradley-Terry](https://projecteuclid.org/euclid.aoms/1177729694) existent pour une raison : les jugements comparatifs sont souvent plus stables que les jugements absolus. Si la vraie décision produit est « quelle réponse met-on en ligne », le format par paires est généralement plus honnête.

## L'accord sert de diagnostic, pas de trophée

Les équipes adorent afficher l'accord inter-annotateurs comme si un grand chiffre prouvait que l'évaluation est bonne. Ce n'est pas le cas. L'accord dit surtout si la grille produit des jugements cohérents, pas si ces jugements sont les bons. Des mesures comme le [kappa de Cohen](https://www.jstor.org/stable/2529310) et [alpha](https://repository.upenn.edu/asc_papers/43/) sont utiles parce qu'elles révèlent l'ambiguïté, la dérive des annotateurs et les critères qu'il faut réécrire.

Le mode d'échec classique, c'est d'utiliser l'accord comme un outil punitif. Si des annotateurs ne sont pas d'accord, la première question devrait être de savoir si les exemples ou la grille sont sous-spécifiés. Un certain désaccord est sain quand les prompts sont réellement ambigus. Forcer le consensus peut effacer précisément les cas limites que tu as besoin de comprendre.

## Ce qu'il faut pour une évaluation humaine digne de la production

Les revues à l'aveugle comptent. L'ordre aléatoire compte. L'échantillonnage compte. Si les annotateurs savent quel modèle a produit quelle réponse, ou si tu ne fais relire que des prompts faciles, tu construis un récit de performance, pas une évaluation. Les sessions de calibration comptent aussi plus que beaucoup d'équipes ne veulent l'admettre. Une courte revue hebdomadaire des désaccords peut améliorer la qualité des données davantage que l'embauche de nouveaux annotateurs.

Je garderais aussi un petit jeu arbitré qui ne change pas à la légère. Pas parce qu'il serait sacré, mais parce que les courbes de tendance ont besoin d'un minimum de stabilité. Ensuite, je renouvellerais agressivement l'échantillon plus large pour que l'évaluation reste connectée au comportement utilisateur actuel.

## Règle de décision

Utilise l'évaluation humaine dès qu'une décision de release dépend de qualités que les machines scorent encore mal : utilité, nuance, ton, jugement de sécurité, ou préférence comparative. Si tu ne peux pas financer des revues à l'aveugle, des rubriques claires et des vérifications régulières de l'accord, ne prétends pas avoir une évaluation de référence. Tu as des anecdotes dans un tableur.
