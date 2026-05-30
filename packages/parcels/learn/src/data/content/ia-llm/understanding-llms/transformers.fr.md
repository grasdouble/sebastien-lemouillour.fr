---
id: transformers
order: 16
difficulty: intermediate
tags: [Transformer, LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La première fois qu’on balance un long document à un ancien modèle séquentiel, l’échec est presque vexant. La réponse démarre bien, puis oublie le contexte, mélange les références et perd le fil trois paragraphes plus loin. C’est précisément le problème que les transformers ont assez bien résolu pour que presque tous les LLM modernes héritent désormais du design du [papier fondateur](https://arxiv.org/abs/1706.03762).

## Pourquoi la récurrence a plafonné

Avant les transformers, les modèles récurrents lisaient le texte token par token. Sur le papier, ça semble naturel. En pratique, c’est lent à entraîner, fragile sur les dépendances longues, et la distance entre deux tokens éloignés augmente avec la longueur de la séquence. Le papier des transformers a posé le bon échange: remplacer la récurrence par l’auto-attention pour que chaque token puisse regarder tous les autres dans une même couche, en parallèle, sur du matériel accéléré.

C’est cette parallélisation qui a fait gagner les transformers. Pas juste l’élégance mathématique. C’est ce qui a permis à l’entraînement de passer à l’échelle sur GPU et TPU au lieu de buter sur un traitement purement séquentiel. Ensuite, les familles de modèles se sont clarifiées: les modèles encodeur seul comme [BERT](https://arxiv.org/abs/1810.04805) pour les tâches de compréhension, les modèles décodeur seul comme [GPT-3](https://arxiv.org/abs/2005.14165) pour la génération auto-régressive, et les modèles encodeur-décodeur comme [T5](https://arxiv.org/abs/1910.10683) quand on veut une vraie transformation entrée-sortie.

## Ce que ça change en pratique

Le calcul central reste compact:

```txt
Attention(Q, K, V) = softmax(QKᵀ / √d_k) V
```

Chaque token produit des requêtes, des clés et des valeurs. Au lieu de pousser un unique état caché au fil du temps, le modèle apprend quels autres tokens méritent l’attention maintenant. L’ordre revient via l’information positionnelle, parce qu’une attention pure ne sait pas ce que signifient avant, après ou suivant. La [documentation Hugging Face](https://huggingface.co/docs/transformers/en/model_summary) est utile ici, car elle montre à quel point le même squelette réapparaît sous des noms différents.

Pour un utilisateur de LLM, l’important n’est pas la formule en elle-même. L’important, c’est le comportement qu’elle débloque: meilleur suivi des références, meilleure exploitation des prompts longs, et séparation nette entre parallélisme à l’entraînement et génération à l’inférence.

## Ce que je vérifie avant de faire confiance à un modèle

Quand quelqu’un me dit qu’un modèle est “un transformer”, je pose trois questions derrière.

D’abord: décodeur seul, encodeur seul, ou encodeur-décodeur ? Ça dit immédiatement si le modèle est optimisé pour générer, représenter, ou transformer proprement une entrée en sortie.

Ensuite: que se passe-t-il quand le contexte s’allonge ? L’auto-attention classique grossit à peu près quadratiquement avec la longueur de séquence d’après le [papier](https://arxiv.org/abs/1706.03762), donc une grande fenêtre de contexte n’est jamais gratuite. La latence monte, la pression mémoire monte, et la facture du prompt monte aussi.

Enfin: le service utilise-t-il un [cache KV](https://huggingface.co/docs/transformers/en/cache_explanation) ? En génération auto-régressive, mettre en cache les clés et valeurs passées change tout entre un streaming acceptable et un modèle qui semble avancer dans du ciment.

Pour les assistants et la génération de contenu, je choisirais encore en premier un bon transformer décodeur seul parce que l’outillage, les habitudes d’évaluation et l’infrastructure de serving sont bien meilleurs. Pour le ranking, la recherche et la classification, je trouve les transformers encodeurs encore sous-estimés, parce que des représentations stables comptent plus qu’une prose élégante.

Ma règle: quand vous comparez des LLM, demandez le type de transformer, le comportement sur long contexte et la stratégie de cache avant de regarder le nombre de paramètres.
