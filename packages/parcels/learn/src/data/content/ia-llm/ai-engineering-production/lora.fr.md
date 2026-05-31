---
id: lora
order: 8
difficulty: intermediate
tags: [LLM, LoRA, fine-tuning, adapters]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Vous voulez un modèle qui parle mieux votre domaine, puis le fine-tuning complet explose immédiatement le budget : checkpoints énormes, GPU coûteux, et runs d'entraînement où une seule mauvaise expérience brûle de l'argent réel. C'est à ce moment-là que j'arrête de viser le contrôle parfait et que je commence par LoRA.

LoRA vient du [papier d'origine](https://arxiv.org/abs/2106.09685) : on fige le modèle de base, on injecte de petites matrices entraînables de faible rang dans certaines couches, puis on n'optimise que ça. Le gain pratique est celui qui m'intéresse vraiment : l'entraînement coûte moins cher, presque tout le modèle de base reste intact, et vous livrez un adapter au lieu d'un checkpoint complet. Pour la plupart des équipes produit, c'est le compromis qu'il faut tester en premier.

Ma recommandation tient en une ligne : choisissez LoRA avant le fine-tuning complet, sauf si vous savez déjà que le modèle de base est assez proche et que vous avez le budget pour réentraîner bien plus de poids. La [doc LoRA de PEFT](https://huggingface.co/docs/peft/package_reference/lora) rappelle aussi un détail important : `target_modules` peut être déduit pour les architectures connues, mais les architectures moins standard demandent encore un choix explicite. Dès que je compare des evals sérieusement, je préfère l'écrire noir sur blanc, parce que les valeurs implicites deviennent vite un mauvais piège.

Le piège dans lequel je suis tombé au début, c'est de croire que LoRA rend la qualité du dataset secondaire. Pas du tout. De mauvais exemples enseignent toujours un mauvais comportement, simplement plus vite et à moindre coût. Le deuxième piège, c'est de monter le rang trop haut par peur du sous-apprentissage. Un gros adapter peut tout à fait surapprendre, donc je commence petit, je garde les evals proches, puis j'ajoute des paramètres seulement quand les ratés sont vraiment cohérents.

Quand je veux une base de départ assez bon marché pour itérer vite, je pars de ceci.

```python
from peft import LoraConfig, TaskType, get_peft_model

lora_config = LoraConfig(
    r=16,  # rang de l'adapter, commence petit avant de grossir
    lora_alpha=32,  # premier choix courant pour r=16
    lora_dropout=0.05,  # régularisation utile sur les petits datasets
    target_modules=["q_proj", "v_proj"],  # bon premier choix sur beaucoup de modèles decoder-only de type Llama
    bias="none",  # valeur par défaut, et souvent l'option la plus prévisible
    task_type=TaskType.CAUSAL_LM,
)

model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
```

Si le modèle figé rentre tout juste en mémoire, je passe ensuite à la [quantification bitsandbytes](https://huggingface.co/docs/transformers/quantization/bitsandbytes) pour charger les poids de base en 8 bits ou 4 bits au lieu de louer une machine plus grosse. Le [flux Trainer](https://huggingface.co/docs/transformers/trainer) continue de fonctionner après ça, ce qui explique pourquoi LoRA est le raccourci que je recommande quand le vrai goulet d'étranglement, c'est la vitesse d'itération, pas la pureté académique.

Autre raccourci utile : n'arrosez pas toutes les projections avec des adapters juste parce qu'un repo d'exemple l'a fait. PEFT sait auto-sélectionner des modules sur les architectures courantes, mais dès que je veux des comparaisons fiables, je préfère partir des projections d'attention qui comptent pour la famille de modèles, lancer des evals métier, puis élargir seulement quand les échecs pointent vers un manque de capacité. Vous gardez les coûts plus bas et vous pouvez expliquer l'expérience suivante sans raconter une histoire compliquée.

Ma règle de décision est volontairement terre à terre : si LoRA avec de bonnes données et des evals ciblées rate encore franchement, je n'accuse pas LoRA en premier. Je vérifie d'abord le choix du modèle de base, puis si du retrieval, des outils, ou un meilleur prompting résoudraient le problème avec moins de risque. Le fine-tuning complet, je le garde pour les cas où ces leviers moins chers ont déjà échoué.
