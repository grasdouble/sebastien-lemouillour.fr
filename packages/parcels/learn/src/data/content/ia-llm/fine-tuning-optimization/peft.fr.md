---
id: peft
order: 9
difficulty: intermediate
tags: [fine-tuning, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

La douleur arrive quand un checkpoint 7B se transforme en cinq copies parce que le support, le juridique et le commercial veulent chacun leur comportement. Je suis déjà tombé dans ce piège. La facture n'était pas le temps d'entraînement. C'était le stockage, la VRAM et un déploiement pénible.

[PEFT](https://huggingface.co/docs/peft/index) est le terme parapluie pour des méthodes efficaces en paramètres comme LoRA, le prompt tuning, le prefix tuning et IA3. Ce n'est pas un synonyme de LoRA. Le raccourci utile, c'est simple : garder un seul modèle de base, publier de petits adapters, puis changer de comportement sans réécrire tout le modèle.

Le [papier LoRA](https://arxiv.org/abs/2106.09685) reste la référence que tout le monde cite, mais la leçon opérationnelle compte plus que les maths. Si le modèle de base gère déjà bien le langage général, les adapters vous laissent séparer la capacité partagée du comportement spécifique à une tâche. Les expérimentations coûtent moins cher et les retours arrière deviennent presque ennuyeux.

Je combine presque toujours PEFT avec un chargement en 4 bits, parce qu'économiser sur les paramètres entraînables tout en gardant le modèle complet en mémoire haute précision rate la cible. La [doc de quantization](https://huggingface.co/docs/transformers/quantization/bitsandbytes) couvre le chemin `BitsAndBytesConfig`, et le [quicktour PEFT](https://huggingface.co/docs/peft/quicktour) montre le flux avec adapters. Gardez le vrai caveat en tête : le support de la quantization dépend encore de votre accélérateur et des fonctions exposées par le backend.

Voici la configuration que je réutilise :

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

quant_config = BitsAndBytesConfig(
    load_in_4bit=True,  # Réduit la VRAM du modèle de base figé.
)

base_model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",  # N'importe quel causal LM à adapter.
    quantization_config=quant_config,
    device_map="auto",  # Laisse Accelerate placer les couches sur le matériel disponible.
)

support_model = PeftModel.from_pretrained(
    base_model,
    "your-org/support-adapter",  # Adapter entraîné pour les réponses support.
)

billing_model = PeftModel.from_pretrained(
    base_model,
    "your-org/billing-adapter",  # Adapter séparé, mêmes poids de base.
)
```

Vous versionnez les adapters séparément, vous ne chargez que ce dont vous avez besoin, et les retours arrière restent peu coûteux. L'entraînement passe toujours par la [Trainer API](https://huggingface.co/docs/transformers/trainer) ou une boucle équivalente, donc le vrai travail porte surtout sur la curation des données, les evals et le cycle de vie des adapters.

Voici le piège que j'éviterais : des adapters bon marché peuvent quand même surapprendre, dériver et reproduire des données toxiques. PEFT ne crée pas de frontière de sécurité. Un adapter bâclé peut toujours pousser le modèle vers un comportement dangereux, donc les evals par adapter sont obligatoires.

Ma règle est simple : choisissez PEFT quand vous avez besoin d'au moins deux comportements durables à partir d'un bon modèle de base, ou quand les fine-tunes complets sont trop lourds à stocker et à servir. Je ne paierais un fine-tuning complet qu'après des evals montrant qu'une variante permanente gagne assez nettement pour justifier le poids supplémentaire du checkpoint.
