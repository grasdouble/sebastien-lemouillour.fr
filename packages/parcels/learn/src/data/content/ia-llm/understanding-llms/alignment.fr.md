---
id: alignment
order: 26
difficulty: advanced
tags: [alignement]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Le modèle a l'air brillant en démo, puis il cède quand il devrait résister, bloque quand il devrait aider, et part de travers sur les cas limites que personne n'a scorés. Ce n'est pas un problème de prompt à retoucher. C'est de la dette d'alignement, et elle coûte cher dès que de vrais utilisateurs testent le périmètre.

## L'alignement est d'abord un problème de politique

On parle souvent de l'alignement comme s'il existait un curseur unique appelé « sécurité ». Non. En pratique, l'alignement consiste à faire coller le comportement du modèle à des normes, contraintes et compromis explicites sur l'aide, le refus, l'honnêteté, la confidentialité et l'escalade. Le [Model Spec](https://platform.openai.com/docs/model-spec) dit la même chose en langage plus formel : le comportement vient d'une politique, pas d'une magie héritée du préentraînement.

C'est pour ça que les débats sur l'alignement sont souvent des débats sur l'objectif déguisés en débats techniques. Une requête limite mérite-t-elle une aide partielle, un refus ou une redirection ? Faut-il se montrer prudent sous incertitude ou répondre franchement ? Si ton équipe n'arrive pas à trancher ces questions de façon cohérente, entraîner davantage relève du théâtre.

## Trois approches qui comptent vraiment

La manœuvre industrielle classique, c'est le RLHF façon [InstructGPT](https://arxiv.org/abs/2203.02155) : collecter des démonstrations et des comparaisons classées, puis optimiser vers le comportement préféré. Ça reste utile parce que les préférences par paires capturent mieux un jugement produit brouillon que des labels statiques.

Une deuxième voie, c'est [Constitutional AI](https://arxiv.org/abs/2212.08073) : écrire des principes, faire critiquer et réviser les sorties par le modèle contre ces principes, puis apprendre à partir de ces révisions ou de ces préférences. J'opterais pour ça seulement quand les principes résistent à un audit ligne par ligne. Une constitution floue, c'est juste une politique floue avec un meilleur packaging.

Une troisième voie, c'est [DPO](https://arxiv.org/abs/2305.18290) et les méthodes proches de préférence directe. C'est souvent mon choix par défaut pour du réglage de préférences hors ligne, parce que ça réduit la lourdeur opérationnelle par rapport à une pipeline RLHF complète. Ça ne sauve pas des données de préférence médiocres, et ça ne règle certainement pas des désaccords de politique non résolus.

## Ce qui compte en production

Les tolérances au risque ne sont pas portables. Un assistant de code, un assistant de triage médical et un chatbot grand public ne devraient pas partager la même politique de refus juste parce qu'ils reposent tous sur un LLM. Le [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) aide bien ici, parce qu'il force la question ennuyeuse mais nécessaire : nuisible pour qui, dans quel contexte, et avec quel impact ?

Il faut aussi séparer les échecs de capacité des échecs d'alignement. Si le modèle n'a pas les connaissances ou les outils pour bien répondre, aucun réglage de refus plus poli ne corrigera ça. S'il a compris la requête et choisit quand même la mauvaise politique, là c'est de l'alignement. Les équipes mélangent ces deux seaux en permanence et perdent des mois à tuner la mauvaise couche.

Mon avis est simple : commence par écrire la politique et l'évaluation avant de toucher à l'optimiseur. Si tu ne peux pas décrire le comportement attendu sur les cas limites sales et le scorer de façon cohérente, tu n'as pas encore de stratégie d'alignement.

## Règle de décision

Utilise la méthode la plus légère capable de faire respecter de manière fiable le contrat de comportement dont tu as réellement besoin. Arrête-toi aux prompts et aux contraintes produit si l'enjeu reste faible et les modes d'échec observables. Passe au réglage par préférences quand le comportement doit tenir sous pression. Si l'équipe se dispute encore sur ce que veut dire « bon », gèle l'entraînement et tranche la politique d'abord.
