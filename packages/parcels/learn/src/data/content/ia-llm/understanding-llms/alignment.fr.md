---
id: alignment
order: 26
difficulty: advanced
tags: [alignement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le modèle a l'air excellent en démo, puis il devient trop accommodant quand il devrait résister, trop rigide quand il devrait aider, et dangereux sur les cas limites que personne n'a pris la peine de tester. Ce n'est pas un problème de prompt. C'est de la dette d'alignement. On peut la repousser un moment, mais la facture arrive dès que de vrais utilisateurs commencent à pousser le produit dans ses limites.

## L'alignement n'est pas une seule chose

On parle souvent d'alignement comme s'il existait un axe unique appelé « sécurité ». Ce n'est pas le cas. En pratique, l'alignement consiste à faire correspondre le comportement du modèle aux normes, contraintes et compromis que tu vises. Ça inclut la sécurité, mais aussi l'honnêteté, la calibration, le style de refus, le niveau de déférence, l'usage d'outils, les frontières de confidentialité, et le moment où le modèle doit demander une clarification. Des documents comme le [Model Spec](https://model-spec.openai.com/) le montrent bien : un comportement aligné est un choix de politique, pas une propriété naturelle d'un modèle préentraîné.

C'est pour ça que les débats sur l'alignement sont souvent en réalité des débats sur les objectifs. Veux-tu un assistant maximalement utile, ou conservateur quand l'incertitude monte ? Faut-il répondre aux requêtes limites avec une aide partielle, un refus, ou une redirection ? Si ton équipe n'arrive pas à répondre clairement à ces questions, aucune méthode d'entraînement ne viendra sauver la situation.

## Les grandes familles d'approches

La réponse industrielle classique, c'est le RLHF à la [papier InstructGPT](https://arxiv.org/abs/2203.02155) : collecter des démonstrations et des comparaisons classées, puis optimiser le modèle vers le comportement préféré. Ça fonctionne parce que les préférences par paires encodent mieux les jugements produit flous que des labels statiques.

Une deuxième voie, c'est [Constitutional AI](https://arxiv.org/abs/2212.08073) : définir des principes, laisser le modèle critiquer et réviser ses propres sorties, puis utiliser ces révisions comme supervision ou signal de préférence. J'aime bien cette approche quand le comportement cible peut être formulé clairement, parce qu'elle rend la politique plus inspectable. Le piège est évident : une mauvaise constitution fait passer un mauvais jugement à l'échelle.

Une troisième voie, c'est le réglage de préférences façon [papier DPO](https://arxiv.org/abs/2305.18290) sans toute la stack RLHF. C'est attractif quand tu veux un ajustement hors ligne moins coûteux à partir de paires choisi-versus-rejeté. C'est plus simple à opérer, mais ça hérite quand même des biais de tes données et de l'ambiguïté de tes objectifs.

## Ce qui compte en production

Le plus dur n'est pas de choisir une méthode. Le plus dur, c'est de définir quel échec tu essaies réellement d'empêcher. Les cibles d'alignement bougent selon le domaine, la juridiction, le niveau de risque et la maturité des utilisateurs. Un assistant de code, un assistant de triage médical et un chatbot grand public ne devraient pas partager la même politique de refus juste parce qu'ils utilisent tous un LLM.

Il faut aussi séparer les échecs de capacité des échecs d'alignement. Si le modèle invente des faits parce qu'il manque de connaissance, plus d'alignement ne corrigera pas ça. Si le modèle suit avec assurance une requête nuisible qu'il a pourtant bien comprise, là oui. Les équipes confondent ces deux familles d'échecs en permanence, puis s'étonnent que l'entraînement coûte cher sans corriger le bon problème.

Mon avis est direct : le travail d'alignement commence par l'écriture des politiques et la conception de l'évaluation, pas par le choix de l'optimiseur. Si tu ne peux pas décrire le comportement attendu dans les cas limites et le scorer de manière cohérente, ta « stratégie d'alignement » relève surtout du branding.

## Règle de décision

Choisis la méthode d'alignement la plus légère capable de faire respecter de manière fiable le contrat de comportement qui compte pour ton produit. Si des règles de prompt et des contraintes produit suffisent à contenir le risque, arrête-toi là. Si le comportement doit tenir sous pression, passe à un réglage fondé sur les préférences. Si ton équipe n'arrive toujours pas à se mettre d'accord sur ce à quoi ressemble la bonne réponse, n'entraîne rien pour l'instant. Le problème, c'est l'objectif, pas l'algorithme.
