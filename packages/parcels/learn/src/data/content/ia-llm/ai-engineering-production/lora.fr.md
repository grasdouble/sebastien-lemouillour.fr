---
id: lora
order: 8
difficulty: intermediate
tags: [LLM, LoRA, fine-tuning, adapters]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous voulez un modèle qui parle mieux votre domaine, puis vous lisez deux tutos sur le fine-tuning complet et vous heurtez immédiatement le mur du hardware : checkpoints énormes, GPU coûteux, et runs d'entraînement où la moindre erreur devient hors de prix. C'est exactement pour ça que je commence par LoRA.

LoRA vient du [papier d'origine](https://arxiv.org/abs/2106.09685) : on fige le modèle de base, on injecte de petites matrices entraînables de faible rang dans certaines couches, puis on n'optimise que ça. La conséquence pratique est le vrai sujet : on garde presque tout le modèle intact, l'entraînement coûte moins cher, et l'adapter final est minuscule comparé à un checkpoint complet. Pour la majorité des équipes produit, ce compromis est excellent.

Ma position est plus tranchée que celle de la plupart des tutos : choisissez LoRA plutôt qu'un fine-tuning complet, sauf si vous avez beaucoup de GPU et une très bonne raison de faire autrement. La plupart des équipes n'essaient pas de réécrire tout le modèle. Elles veulent surtout ajuster le style, le vocabulaire métier et certains comportements. LoRA suffit souvent, et la doc [PEFT](https://huggingface.co/docs/peft/) rend la mise en place bien moins pénible qu'avant.

Le piège, c'est de croire que LoRA rend la qualité des données secondaire. Pas du tout. Des exemples médiocres produisent toujours un comportement médiocre, simplement plus vite. L'autre piège, c'est de monter le rang trop haut par nervosité. Un adapter trop gros peut surapprendre avec autant d'enthousiasme qu'un fine-tuning complet. Je pars presque toujours de réglages modestes, puis je ne bouge que si les evals le justifient.

La forme de configuration ci-dessous me sert de point de départ par défaut.

```python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,  # rang de l'adapter, commence petit avant de grossir
    lora_alpha=32,  # facteur d'échelle des mises à jour
    lora_dropout=0.05,  # régularisation utile sur les petits datasets
    target_modules=["q_proj", "v_proj"],  # premier choix fréquent sur les modèles decoder-only
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
```

Si le modèle de base reste trop gros, [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) est le levier suivant que j'utilise pour charger les poids figés en précision réduite. La boucle d'entraînement suit ensuite le flux classique de [Transformers](https://huggingface.co/docs/transformers/training), ce qui explique pourquoi LoRA devient assez accessible une fois le dataset prêt.

Le point que beaucoup de tutoriels sautent, c'est le choix des modules cibles. Mettre à jour toutes les projections possibles parce qu'un repo l'a fait une fois, c'est paresseux. Commencez par les projections d'attention qui comptent pour votre famille de modèles, lancez des evals métier, puis n'élargissez que si les échecs observés justifient vraiment des paramètres supplémentaires.

Ma règle est simple : si LoRA avec de bonnes données ne corrige pas le comportement, mon premier soupçon n'est pas « LoRA est trop faible ». Mon premier soupçon, c'est que le mauvais modèle de base a été choisi, ou que le problème relevait plutôt du retrieval, des outils, ou d'un meilleur prompting.
