---
id: chain-of-thought
order: 7
difficulty: intermediate
tags: [LLM, Prompting, reasoning]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton prompt marche jusqu’au moment où l’entrée contient une exception et deux nombres. Là, le modèle saute directement à la réponse, oublie l’étape du milieu, et tu te retrouves à déboguer un adjectif comme si c’était une panne de prod.

C’est là que le chain of thought devient utile. Le [papier fondateur](https://arxiv.org/abs/2201.11903) montre que fournir des exemples avec étapes intermédiaires améliore les tâches de raisonnement complexes, notamment en arithmétique, en bon sens et en raisonnement symbolique. J’utilise encore cette idée, mais seulement quand la tâche est vraiment multi-étapes. Pour de la classification, de la recherche d’info ou une simple réécriture, ajouter du raisonnement visible apporte souvent surtout de la latence et de la facture.

Le point que la plupart des tutos zappent, c’est que le chain of thought n’a rien de magique, c’est un échafaudage. Tu indiques au modèle où s’arrêter, quelles preuves relever, et à quel moment se prononcer. Le [guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) et la [vue d’ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) racontent la même chose avec des mots plus récents : définis clairement la réussite, structure la tâche, et teste tes prompts au lieu de faire confiance à ton ressenti du vendredi soir.

J’évite aussi de demander un énorme monologue visible sauf si j’en ai un vrai besoin. Un raisonnement verbeux consomme des tokens, peut exposer des règles métier dans les logs, et rend les evals pénibles à lire. Mon défaut préféré est donc : raisonne brièvement, réponds proprement. Si j’ai besoin d’auditabilité, je demande quelques vérifications numérotées, pas un journal intime.

Un pattern pratique ressemble à ça :

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

Le vrai gain n’est pas l’étiquette. Le vrai gain, c’est la séparation entre observation et jugement. L’étape 2 force le modèle à recopier la preuve avant de décider, ce qui rend les échecs beaucoup plus lisibles. Quand la réponse est fausse, tu vois vite s’il a mal lu la source, sauté un calcul, ou simplement halluciné avec beaucoup d’assurance.

Je n’utiliserais quand même pas ce pattern partout. Si la réponse peut être vérifiée par une fonction déterministe après coup, garde un prompt court et laisse le code contrôler. Si le modèle échoue parce qu’il saute toujours une étape implicite, ajoute du chain of thought et limite le budget de raisonnement avant que ça se transforme en impro payante.
