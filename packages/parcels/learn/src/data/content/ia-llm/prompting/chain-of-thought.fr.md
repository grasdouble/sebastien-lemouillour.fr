---
id: chain-of-thought
order: 7
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Ton prompt tient la route jusqu’au moment où l’entrée glisse une exception et deux nombres. Là, le modèle balance une réponse trop vite, saute l’étape qui comptait, et tu te retrouves à déboguer une phrase comme à 2 h du matin.

Le chain of thought sert exactement à ce genre de galère. Dans le [papier Wei et al.](https://arxiv.org/abs/2201.11903), l’idée est simple : montrer des étapes intermédiaires dans les exemples, pas seulement une question et une réponse. Ça améliore les tâches d’arithmétique, de bon sens et de raisonnement symbolique quand il y a vraiment plusieurs sauts à faire. J’utilise encore cette idée, mais comme un scalpel. Pour de la classification, de la recherche d’info ou une réécriture banale, du raisonnement visible, c’est souvent du théâtre facturé.

Le papier reste utile, mais les docs des fournisseurs ont bougé. Le [guide reasoning](https://platform.openai.com/docs/guides/reasoning) d’OpenAI dit que les reasoning models dépensent déjà des reasoning tokens internes avant de répondre, et la [vue Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) te dit de poser des critères de réussite et des evals avant de tripoter le prompt. Traduction : avant de coller « think step by step » partout, vérifie que tu as choisi le bon modèle et que tu sais mesurer si cette réflexion supplémentaire sert vraiment à quelque chose.

Je ne ferais pas non plus sortir un énorme monologue au modèle sauf si j’ai besoin d’inspecter ses ratés. Le [guide prompting](https://platform.openai.com/docs/guides/prompt-engineering) d’OpenAI récompense toujours une structure claire, et l’[effort Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/effort) rend le compromis très explicite : plus de réflexion veut souvent dire plus de tokens et plus de latence. Mon réglage par défaut est volontairement banal : une réponse propre, quelques vérifications courtes, et du raisonnement visible seulement quand ces vérifications m’aident à déboguer ou à relire.

Voici la version que j’enverrais vraiment :

```txt
You are validating invoice line items.

Task:
1. Read the invoice text.
2. Extract quantities, prices, and discounts.
3. Check whether subtotal, tax, and total are mathematically consistent.
4. If one value is missing, return "missing_data".
5. Return:
   - reasoning: max 4 short bullet points
   - verdict: valid | invalid | missing_data
   - corrected_total: number or null

Invoice text:
"""{{invoice_text}}"""
```

Le vrai gain n’est pas l’expression. Le vrai gain, c’est de séparer l’observation du jugement. L’étape 2 force le modèle à recopier la preuve avant de décider, donc les ratés deviennent beaucoup plus lisibles. Quand la réponse est fausse, tu vois s’il a mal lu la source, sauté un calcul, ou inventé des maths avec aplomb. Son petit côté artiste, quoi.

Ma règle est simple : si je peux vérifier la sortie avec du code, je garde un prompt court et je laisse le code jouer l’adulte dans la pièce. Je sors le chain of thought visible seulement quand la tâche rate toujours sur une étape intermédiaire implicite et que j’ai besoin d’assez de raisonnement pour attraper l’erreur, pas d’un roman.
