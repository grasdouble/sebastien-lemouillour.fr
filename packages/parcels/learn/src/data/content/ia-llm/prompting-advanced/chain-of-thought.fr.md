---
id: chain-of-thought
order: 7
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-06-08
updatedAt: 2026-06-08
---

Ton prompt a l’air solide jusqu’au moment où une exception et deux totaux débarquent dans la même entrée. Là, le modèle saute sur un verdict, oublie l’arithmétique, et te livre une réponse fausse avec beaucoup trop d’assurance.

Le chain-of-thought devient utile précisément dans ce cas. Dans [Wei et al. 2022](https://arxiv.org/abs/2201.11903), le gain venait d’exemples few-shot avec des étapes intermédiaires explicites, ce qui améliore les tâches d’arithmétique, de bon sens et de raisonnement symbolique quand plusieurs étapes doivent s’enchaîner.

Ma position : en 2026, le chain-of-thought visible n’est pas le réglage par défaut. Le [reasoning guide](https://platform.openai.com/docs/guides/reasoning) d’OpenAI explique que les reasoning models utilisent déjà des reasoning tokens internes, expose des niveaux d’effort comme `low` à `xhigh`, et indique que `gpt-5.5` part par défaut sur `medium`. L’[overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) d’Anthropic pousse la même logique sous un autre angle : pose d’abord des critères de réussite et des evals, parce que la latence et le coût se règlent souvent en choisissant le bon modèle avant de retoucher le prompt.

Du coup, je pars sur un raisonnement court et inspectable, pas sur un journal intime. Le [prompt guide](https://platform.openai.com/docs/guides/prompt-engineering) d’OpenAI rappelle aussi que la sortie Responses peut contenir des éléments liés au raisonnement en plus du texte. Raison de plus pour garder la réponse visible propre, valider le résultat final dans le code, et éviter de déverser de longues traces dans les logs si tu n’en as pas vraiment besoin.

Quand je veux une trace de raisonnement qu’un humain peut relire vite, j’utilise un prompt de ce genre :

```ts
import OpenAI from 'openai';

const client = new OpenAI();

async function checkInvoice(invoiceText: string) {
  return client.responses.create({
    model: 'gpt-5.5', // modèle de raisonnement pour une vérification multi-étapes
    reasoning: { effort: 'low' }, // à augmenter seulement si les evals prouvent le gain
    input: [
      {
        role: 'user',
        content: `
You are validating invoice totals.

Steps:
1. Extract quantities, unit prices, discounts, subtotal, tax, and total.
2. Verify the math.
3. If a required value is missing, return "missing_data".

Return JSON with:
- evidence: up to 3 short bullets
- verdict: "valid" | "invalid" | "missing_data"
- correctedTotal: number | null

Invoice:
"""${invoiceText}"""
        `,
      },
    ],
  });
}
```

Ce qui marche ici, ce n’est pas la formule "think step by step". C’est la structure. Le modèle rassemble d’abord des preuves, la trace de raisonnement reste plafonnée, et ton application garde le contrôle sur la vérification finale. Tu dépenses donc moins de tokens et tu mets moins de pression sur les rate limits qu’avec un scratchpad complet, tout en gardant assez de signal pour déboguer les vrais ratés.

Si tu as vraiment besoin d’un raisonnement brut pour du debug, l’[extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking) d’Anthropic peut renvoyer des blocs `thinking`, et la doc récente recommande l’adaptive thinking sur les nouveaux modèles Claude alors que les modes manuels avec `budget_tokens` sont dépréciés ou refusés selon les versions. À utiliser avec parcimonie, jamais comme unique garde-fou.

Utilise le chain-of-thought quand la tâche échoue à cause d’une étape intermédiaire manquante que tu peux inspecter. Oublie-le pour la classification, la recherche, ou n’importe quel flux où du code peut vérifier la réponse à faible coût. Si trois bullets de preuve ne suffisent pas, le vrai problème vient du design de la tâche, pas d’un manque de prose.
