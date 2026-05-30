---
id: rlhf
order: 24
difficulty: advanced
tags: [RLHF, alignement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton modèle de base semblait impressionnant dans les prompts et les démos. Puis les vrais utilisateurs ont trouvé les parties moches : fausse assurance, flagornerie, refus évasifs, et réponses qui avaient l'air alignées tout en ratant le besoin réel. C'est pour ça que le RLHF existe. Le préentraînement donne des capacités. Il ne donne pas le contrat de comportement dont tu as besoin dans un produit.

## Ce que le RLHF ajoute vraiment

La recette canonique du [papier InstructGPT](https://arxiv.org/abs/2203.02155) n'a rien de magique : fine-tuning supervisé sur des démonstrations, modèle de récompense entraîné sur des sorties classées, puis optimisation de la politique contre cette récompense. L'optimiseur utilisé vient en général du monde [PPO paper](https://arxiv.org/abs/1707.06347), avec une pression explicite pour rester proche d'un modèle de référence afin de ne pas détruire les capacités générales pendant qu'on gagne sur les préférences.

C'est important parce que la qualité produit est remplie d'objectifs flous. « Être utile sans être trop sûr de soi. » « Refuser la requête dangereuse sans refuser la requête voisine qui est inoffensive. » « Utiliser des outils quand il faut, mais sans en abuser. » Ces objectifs sont plus faciles à exprimer sous forme de comparaisons que de labels parfaits. Le RLHF transforme cette ambiguïté en données de préférences et force le modèle à les internaliser.

## Pourquoi les équipes paient encore cette taxe

À l'échelle, le RLHF est surtout un système de réglage du comportement, plus qu'une astuce d'entraînement. Il permet d'ajuster le ton, la calibration, le style de refus et le suivi d'instructions d'une manière que le fine-tuning supervisé atteint rarement aussi bien. Si tes échecs se situent dans l'écart entre « techniquement valide » et « réellement utile », les préférences sont souvent le bon signal.

C'est aussi l'une des rares approches capables d'absorber continuellement de nouveaux jugements. Ça devient important dès que le déploiement t'apprend ce que ton évaluation interne avait raté. Un modèle bon sur des prompts statiques peut encore échouer sur la gestion d'escalade, la formulation adversariale ou la frustration subtile d'un utilisateur. Le RLHF te donne une boucle pour ça.

## Là où le RLHF devient vite coûteux

Le piège, c'est que la boucle d'entraînement optimise la récompense que tu as réussi à spécifier, pas la qualité produit que tu aurais aimé spécifier. Le reward hacking n'est pas un effet secondaire. C'est le mode d'échec par défaut quand le modèle de récompense apprend des proxys qui scorent bien mais s'effondrent dès que la distribution change. On le voit sous forme de verbosité gonflée, d'excès de prudence, de refus trop larges, ou de non-sens polis que les annotateurs ont récompensés par accident.

Le coût opérationnel est tout aussi réel. Il faut une collecte de préférences cohérente, de bonnes consignes pour les annotateurs, une analyse des désaccords, une surveillance du modèle de récompense, et des contrôles de politique après chaque ronde de réglage. Si ça ressemble à une petite organisation d'évaluation à faire tourner, c'est parce que c'en est une. Le RLHF n'a de sens que quand la qualité comportementale compte assez pour justifier cette boucle.

C'est pour ça qu'Anthropic a poussé [Constitutional AI](https://arxiv.org/abs/2212.08073) : utiliser des principes explicites et des critiques générées par le modèle pour réduire une partie de la dépendance à de gros volumes de comparaisons humaines. Je pense que ce mouvement compte, mais il ne supprime pas le problème central. Il te faut toujours un comportement cible clair, et il faut toujours surveiller les modèles qui apprennent à jouer avec le signal d'entraînement.

## Règle de décision

Choisis le RLHF quand tu as besoin d'un contrôle continu du comportement à l'échelle du produit et que tu peux financer la mécanique de données et de monitoring qui va avec. Si tu n'as qu'un jeu statique de préférences et aucune envie d'opérer une boucle de récompense en continu, évite le théâtre et regarde plutôt DPO ou un fine-tuning supervisé classique.
