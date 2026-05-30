---
id: attention-mechanism
order: 17
difficulty: intermediate
tags: [Transformer, attention]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Si vous avez déjà caché la phrase la plus importante au milieu d’un long prompt pour voir le modèle répondre à tout sauf à elle, vous avez déjà vu le vrai rôle de l’attention. L’attention n’est pas de la compréhension magique. C’est un système de récupération appris qui décide ce qui mérite de la bande passante maintenant.

## L’attention comme récupération apprise

Le [papier](https://arxiv.org/abs/1706.03762) des transformers a transformé cette idée en primitive centrale des LLM modernes. Chaque token est projeté en requêtes, clés et valeurs, puis comparé au reste de la séquence:

```txt
weights = softmax((Q @ Kᵀ) / √d_k)
output = weights @ V
```

Si vous lisez ça comme “je cherche dans le contexte, puis j’agrège ce qui compte”, c’est à peu près ça. La [documentation PyTorch](https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html) expose maintenant directement la scaled dot-product attention, parce que cette opération n’est plus un détail académique. C’est le moteur.

L’attention multi-tête compte parce qu’une seule vue de la pertinence est trop fragile. Une tête peut suivre la syntaxe, une autre les références d’entités, une autre encore des motifs positionnels. On n’obtient pas des rôles propres et lisibles pour chaque tête, mais on obtient un modèle capable d’observer plusieurs axes en même temps.

## Pourquoi les prompts longs coûtent cher

La partie souvent passée sous silence, c’est le coût. L’attention complète compare chaque token à tous les autres, donc le calcul et la mémoire augmentent vite avec la longueur de séquence d’après le [papier](https://arxiv.org/abs/1706.03762). C’est pour ça qu’un prompt long coûte deux fois: il consomme plus de tokens en entrée et il met davantage de pression sur l’infrastructure de serving. Même avant d’atteindre une limite de débit chez un fournisseur, on le sent déjà dans la latence.

C’est exactement pour cette raison que les stacks d’inférence utilisent des optimisations comme [FlashAttention](https://arxiv.org/abs/2205.14135) et des ajustements architecturaux comme la [grouped-query attention](https://arxiv.org/abs/2305.13245). Pendant la génération, un [cache KV](https://huggingface.co/docs/transformers/en/cache_explanation) évite de recalculer les clés et valeurs passées, ce qui explique pourquoi le premier token généré est souvent bien plus lent que les cent suivants.

## Le piège: lire l’attention comme une explication

Je n’utiliserais pas une carte d’attention comme preuve qu’un modèle a correctement raisonné. Le résultat [attention is not explanation](https://arxiv.org/abs/1902.10186) est le bon antidote contre l’excès de confiance. Les poids d’attention sont des signaux utiles. Ce ne sont pas une explication fiable a posteriori du choix final du modèle.

Ça change ma manière d’écrire les prompts. Si une preuve est critique, je ne compte pas sur le modèle pour la découvrir au milieu d’un mur de texte bruité. Je raccourcis le contexte, je sépare l’information utile, ou je la récupère explicitement. L’attention est puissante, mais c’est quand même un mécanisme sous contrainte, en compétition sur une masse de probabilité limitée et un budget de calcul fini.

Ma règle: considérez l’attention comme un budget de récupération. Si le fait dont vous avez besoin est difficile à retrouver dans le contexte, corrigez le prompt ou la stratégie de retrieval au lieu d’espérer que le modèle devienne soudain plus attentif.
