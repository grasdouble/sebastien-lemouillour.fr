---
id: pre-training
order: 18
difficulty: intermediate
tags: [LLM, entraînement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Beaucoup d’équipes foncent d’abord vers le fine-tuning parce que c’est visible. On a des exemples, on lance un job, on s’attend à voir le comportement s’améliorer. Puis le modèle continue à rater des faits évidents du domaine, invente du vocabulaire, ou adopte un ton qui ne sonne jamais vraiment juste. C’est généralement là qu’on réalise que la partie coûteuse a été décidée bien plus tôt, pendant le pré-entraînement.

## C’est là que se construisent les priors

Le pré-entraînement est la phase où le modèle apprend la structure générale du langage et du savoir à partir de corpus bruts. L’objectif peut sembler presque banal, comme la prédiction du token suivant dans [GPT-3](https://arxiv.org/abs/2005.14165), mais l’effet est énorme: familiarité avec le vocabulaire, couverture des styles, connaissances latentes sur le monde, équilibre multilingue et robustesse face au texte bruité se décident ici.

C’est pour ça que je vois le pré-entraînement comme l’endroit où l’on achète des priors, pas comme un simple polissage. Si le modèle de base a de mauvais priors pour votre domaine, aucun prompt bien formulé ne compensera totalement. On peut orienter le modèle ensuite, mais on oriente quelque chose qui a déjà été appris.

## La qualité des données bat l’obsession du “toujours plus”

L’erreur facile consiste à imaginer le pré-entraînement comme une simple course au volume. Le résultat [Chinchilla](https://arxiv.org/abs/2203.15556) est la correction à laquelle je reviens sans cesse: à budget de calcul fixé, beaucoup de grands modèles étaient sous-entraînés, et de meilleures performances venaient d’un entraînement sur davantage de données plutôt que d’une simple augmentation du nombre de paramètres. La quantité compte, mais l’entraînement optimal en calcul et la curation comptent davantage que le prestige du plus gros chiffre.

Si je devais choisir entre un modèle un peu plus petit entraîné sur un corpus plus propre, plus diversifié et dédupliqué, et un modèle plus gros entraîné sur une boue de web non filtrée, je prendrais presque toujours le corpus propre. Les échecs en aval sont meilleurs. On obtient moins de répétitions absurdes, moins de transfert fragile vers un domaine spécialisé, et moins de mémorisation accidentelle.

C’est aussi pour cette raison que le pré-entraînement de domaine peut très bien fonctionner. [BloombergGPT](https://arxiv.org/abs/2303.17564) est un bon exemple: quand le domaine cible possède son propre vocabulaire, ses propres structures de documents et son propre style, un pré-entraînement continu peut apporter bien plus qu’une simple couche d’instruction.

## Quand le pré-entraînement continu vaut le coût

Je ne paierais la facture du pré-entraînement que si l’écart vient réellement d’un manque d’exposition au langage ou aux connaissances du domaine. Pensez jargon spécialisé, style juridique, syntaxe biomédicale, ou formats documentaires internes qui ne ressemblent pas du tout au web ouvert. Dans ces cas-là, poursuivre l’entraînement causal, comme le montrent les [docs Hugging Face](https://huggingface.co/docs/transformers/en/tasks/language_modeling), peut être le bon levier.

Quand l’écart est surtout comportemental, le pré-entraînement est généralement excessif. Si vous voulez surtout un meilleur format de sortie, un usage d’outils plus fiable, des réponses plus courtes ou un style de refus plus sûr, l’instruction tuning ou la récupération augmentée sont moins chers et plus rapides.

La sécurité compte aussi ici. Des corpus bruts peuvent faire fuiter des données privées ou protégées dans les paramètres du modèle, et la mémorisation n’est pas théorique. Le travail d’extraction de [Carlini et al.](https://arxiv.org/abs/2012.07805) est le papier que je cite dès que quelqu’un propose de “tout aspirer”. Si vous n’êtes pas capable d’expliquer clairement la provenance des données, la déduplication, le filtrage et la rétention, vous n’êtes pas prêt pour le pré-entraînement.

Ma règle: utilisez le pré-entraînement continu quand l’écart concerne l’exposition au langage ou la connaissance du domaine; utilisez le prompting, le RAG ou l’instruction tuning quand l’écart est surtout comportemental.
