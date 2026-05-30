---
id: temperature
order: 20
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Quand un modèle commence à paraître instable, on adore accuser le modèle lui-même. La moitié du temps, le vrai coupable est l’échantillonnage. J’ai vu des modèles tout à fait corrects devenir erratiques, verbeux ou inutilement téméraires simplement parce que quelqu’un avait laissé `temperature: 1` en production sans vérifier combien d’aléatoire la tâche pouvait vraiment supporter.

## La température change le risque, pas l’intelligence

La température re-scale les logits avant l’échantillonnage. Des valeurs basses resserrent la distribution autour des tokens les plus probables. Des valeurs hautes l’aplatissent et laissent entrer des candidats plus faibles. Les [docs Hugging Face](https://huggingface.co/docs/transformers/en/main_classes/text_generation), la [référence API](https://platform.openai.com/docs/api-reference/chat/create) d’OpenAI et la [documentation messages](https://docs.anthropic.com/en/api/messages) d’Anthropic exposent toutes ce paramètre parce qu’il modifie directement le comportement de sortie.

Un petit changement suffit souvent:

```json
{ "temperature": 0.1 }
{ "temperature": 0.4 }
{ "temperature": 0.8 }
```

Ce que la température ne fait pas, c’est rendre soudain un modèle faible meilleur en raisonnement. Elle change le niveau d’exploration. Parfois, ça aide le modèle à sortir d’un motif trop banal. Parfois, ça laisse juste entrer plus vite de mauvaises continuations.

## Comment je choisis les valeurs

Pour l’extraction, la classification, le routage ou les appels d’outils, je démarre bas, généralement entre `0` et `0.2`. Si le schéma de sortie compte, l’aléatoire est une taxe. On la paie en retries, en validations échouées et en tickets support.

Pour un assistant généraliste, je reste le plus souvent entre `0.2` et `0.5`. Cette zone laisse encore un peu de souplesse dans la formulation sans transformer la réponse en machine à sous.

Pour du brainstorming, du naming ou du texte créatif, je ne monte la température que si j’ai aussi une boucle d’évaluation. Une température plus haute peut clairement faire émerger des options plus fraîches, mais elle augmente aussi le coût de revue. Le prix en tokens d’un appel isolé ne bouge pas forcément beaucoup, mais le coût système grimpe parce qu’on relance plus souvent, on jette davantage de sorties et on compare plus de variantes.

Le papier sur la [dégénérescence du texte neuronal](https://arxiv.org/abs/1904.09751) reste pour moi le meilleur rappel que les choix de décodage façonnent autant la qualité que les poids du modèle. Un mauvais échantillonnage peut faire paraître un bon modèle bien pire qu’il n’est.

## L’erreur que je vois le plus souvent

Les équipes touchent à la température et à `top_p` en même temps, puis ne savent plus quel bouton a réellement changé le comportement. Je fais rarement ça. Je choisis d’abord un contrôle stochastique principal, j’évalue, puis je ne touche au second que si je peux décrire précisément le mode d’échec que je cherche à corriger.

J’évite aussi de faire semblant que `temperature: 0` veut dire “parfaitement déterministe pour toujours”. En pratique, cela signifie surtout “aussi déterministe que cette stack le permet”. Des changements côté fournisseur, des différences de calcul flottant ou des détails d’implémentation peuvent encore introduire de la variation.

Ma règle: réglez la température selon le coût d’une mauvaise réponse. Si se tromper coûte cher, commencez bas et ne montez que si les évaluations prouvent que la diversité supplémentaire vaut vraiment la peine.
