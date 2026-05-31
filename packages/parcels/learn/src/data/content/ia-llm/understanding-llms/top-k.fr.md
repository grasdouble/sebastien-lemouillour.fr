---
id: top-k
order: 22
difficulty: intermediate
tags: [llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

On baisse la température, le modèle sort quand même un token absurde, et d’un coup le bug prend un air paranormal. Je tombe plus souvent sur ce problème avec des petits modèles auto-hébergés, donc je prends le top-k avant de faire semblant d’être subtil.

## Le top-k répond au problème “il y a trop de mauvaises options”

Le top-k ne garde que les `k` tokens suivants les plus probables. Un `top_k` à `1`, c’est pratiquement du décodage glouton, et des valeurs plus hautes élargissent le pool pas à pas, comme l’expliquent les [docs Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/adjust-parameter-values). J’aime ce réglage parce qu’il est volontairement brutal: le décodeur n’a tout simplement plus le droit de fouiller toute la traîne.

Cette brutalité compte quand “moins d’aléatoire” n’est pas assez précis. Dans [Transformers](https://huggingface.co/docs/transformers/en/main_classes/text_generation), `top_k` est un paramètre d’échantillonnage, donc il ne sert à quelque chose que si l’on active `do_sample=True`. Oubliez ce détail et vous pouvez perdre dix minutes à régler un bouton qui ne fait strictement rien.

Avant d’aller plus loin, je pars souvent d’un réglage comme celui-ci.

```py
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")
model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")

inputs = tokenizer("Explain photosynthesis in one paragraph.", return_tensors="pt")
outputs = model.generate(
    **inputs,
    do_sample=True,     # top-k ne s'applique qu'en sampling
    temperature=0.7,    # garde un peu de variété
    top_k=40,           # plafond dur sur les tokens candidats
    max_new_tokens=120, # borne coût et latence
)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

| `top_k`               | Pool de candidats               | Ce que je vois en général                                                           | Quand je l’utilise                                                       |
| --------------------- | ------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `1`                   | Un seul token, le plus probable | Décodage quasi glouton, très rigide, presque sans surprise                          | Extraction, routage strict, sortie sensible au format                    |
| `10`–`20`             | Shortlist très étroite          | Sortie surtout prévisible, avec de rares petits écarts                              | Petits modèles qui ont surtout besoin de structure                       |
| `20`–`40`             | Shortlist intermédiaire         | Bon équilibre entre contrôle et variation utile                                     | Mon point de départ par défaut sur un modèle instruct auto-hébergé       |
| `50`–`100`            | Shortlist large                 | Plus d’aisance, mais aussi plus de chances de laisser revenir des déchets de traîne | Modèles locaux plus gros ou plus stables qui peuvent encaisser davantage |
| `0` ou `-1` dans vLLM | Aucun plafond                   | Top-k désactivé, donc un autre réglage d’échantillonnage doit faire le travail      | Seulement si je veux m’appuyer sur `top_p` ou la température à la place  |

## Pourquoi je le préfère sur les modèles auto-hébergés

Quand un petit modèle part sans cesse dans le décor, je veux un plafond fixe avant de commencer à débattre de masse de probabilité. Les [sampling params de vLLM](https://docs.vllm.ai/en/latest/api/vllm/sampling_params.html) permettent même de désactiver le filtre avec `top_k=0` ou `-1`, ce qui raconte très bien l’intention du réglage: soit on borne l’ensemble des candidats, soit on ne le borne pas.

Cette préférence vient aussi d’un vrai mode d’échec. Le [papier de Holtzman](https://arxiv.org/abs/1904.09751) montre que la stratégie de décodage, à elle seule, peut changer fortement la qualité du texte, et les queues de distribution fragiles sont souvent l’endroit où commencent les continuations répétitives ou bizarres. Sur un modèle nerveux, je préfère clôturer la traîne plutôt que d’espérer qu’elle se comporte bien.

## Là où on le survend

Je ne vendrais pas le top-k comme un bouton universel des API. La [référence Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/reference) expose `temperature` et `top_p`, mais pas `top_k`, donc je traite le top-k d’abord comme un outil d’auto-hébergement, ensuite comme une attente éventuelle côté API hébergée.

Je ne le vendrais pas non plus comme un contrôle de sécurité. Les recommandations [Responsible AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/responsible-ai) de Google donnent le bon réflexe: filtres de sécurité, tests et monitoring pour les sorties risquées. Le top-k peut rendre une génération moins chaotique, mais il peut très bien laisser des candidats dangereux dans l’ensemble restant.

Si vous appelez un modèle hébergé en boucle, les retries mangent quand même votre quota et votre budget de rate limits, comme le rappelle la page [Azure OpenAI quotas](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/quotas-limits). Si le modèle est petit, local ou juste pénible à stabiliser, commencez autour de `top_k: 20` à `40`, et ne bougez que si vous savez nommer la panne que vous corrigez.
