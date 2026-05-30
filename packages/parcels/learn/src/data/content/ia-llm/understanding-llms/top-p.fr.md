---
id: top-p
order: 21
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

J’ai déjà vu des équipes baisser la température, s’attendre à des sorties plus sûres, et obtenir malgré tout des choix de tokens franchement étranges dans la queue de distribution. La raison est simple: la température change la forme globale de la distribution, mais elle ne décide pas quelle quantité de déchets improbables on accepte encore dans le pool de candidats. C’est là que le top-p devient utile.

## Le top-p coupe la queue de manière dynamique

Le top-p, aussi appelé nucleus sampling, conserve le plus petit ensemble de candidats au token suivant dont la probabilité cumulée atteint un seuil `p`. Le papier sur le [nucleus sampling](https://arxiv.org/abs/1904.09751) explique bien pourquoi c’est utile: les queues de faible probabilité sont souvent l’endroit où la dégénérescence apparaît.

Un petit changement peut avoir un effet visible:

```json
{ "top_p": 0.95 }
{ "top_p": 0.9 }
{ "top_p": 0.8 }
```

Contrairement au top-k, l’ensemble de candidats n’est pas fixe. Si le modèle est très confiant, le nucleus sampling peut ne garder que quelques tokens. S’il est incertain, il peut en garder davantage. J’aime ce comportement parce qu’il s’adapte à la vraie forme de la distribution au lieu de prétendre que chaque étape de décodage mérite le même seuil.

Le paramètre est exposé dans la [référence API](https://platform.openai.com/docs/api-reference/chat/create) d’OpenAI, la [documentation messages](https://docs.anthropic.com/en/api/messages) d’Anthropic et les [docs Hugging Face](https://huggingface.co/docs/transformers/en/main_classes/text_generation), ce qui dit bien que ce n’est plus un réglage obscur réservé aux papiers de recherche.

## Quand je l’utilise

Si j’aime déjà le niveau global de créativité d’un modèle mais que je veux supprimer des tokens bizarres en queue de distribution, le top-p est souvent le correctif le plus propre. Baisser la température peut rendre toute la réponse plus terne. Baisser le top-p coupe la queue plus directement.

Ça rend le top-p utile pour la génération de texte, la synthèse et le chat général quand le modèle est globalement bon mais fait parfois un détour lexical étrange. C’est moins utile quand le vrai problème est la factualité ou un manque de contexte. Le top-p peut réduire une partie du non-sens, mais il ne peut pas inventer une preuve que le modèle n’a pas.

Il y a aussi un angle coût. Le top-p ne change pas la facturation des tokens du prompt, mais il peut réduire le coût système indirect. Un meilleur échantillonnage veut dire moins de retries, moins de revue humaine, et moins de situations du type “pourquoi il a dit ça d’un coup ?”.

## Le piège: en faire un simple curseur de créativité

Je ne considère pas le top-p comme un simple réglage de créativité. Je le vois comme une gestion de la queue de distribution. C’est pour ça que je règle en général d’abord la température pour le comportement global, puis le top-p uniquement si je peux nommer le problème de queue que je cherche à corriger: choix de mots étrange, formulation instable, ou déraillements occasionnels.

J’évite aussi de combiner des réglages agressifs comme `temperature: 1.0` et `top_p: 1.0` sauf si je veux explicitement un maximum de variation. C’est amusant en démo et pénible dans un produit.

Ma règle: utilisez le top-p quand vous voulez couper les queues improbables sans aplatir toute la distribution. Si vous ne savez pas décrire le problème de queue à corriger, laissez-le proche de la valeur par défaut.
