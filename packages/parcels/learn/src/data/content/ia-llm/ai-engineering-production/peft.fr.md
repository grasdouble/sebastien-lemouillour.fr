---
id: peft
order: 9
difficulty: intermediate
tags: [LLM, PEFT, fine-tuning, adapters, quantization]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Beaucoup d'équipes disent « il nous faut du fine-tuning » alors qu'elles ont surtout besoin d'un moyen bon marché pour garder un seul modèle de base et échanger des comportements sans dupliquer d'énormes checkpoints. C'est exactement le problème que PEFT résout, et ça devient crucial dès qu'il y a plus d'un cas d'usage.

[PEFT](https://huggingface.co/docs/peft/) n'est pas une seule technique. C'est la boîte à outils de l'adaptation efficace en paramètres : LoRA, prompt tuning, prefix tuning, IA3, et d'autres variantes pour modifier le comportement du modèle sans tout réentraîner. Si j'aime cette approche, ce n'est pas pour son élégance théorique. C'est pour la tranquillité opérationnelle qu'elle apporte. Un modèle de base, plusieurs petits adapters, des expérimentations rapides, et un stockage qui n'explose pas à chaque nouvelle idée de persona côté produit.

C'est là que beaucoup de tutoriels restent trop abstraits. La vraie question n'est pas « est-ce que je peux entraîner un adapter ? ». La vraie question est « combien de variantes dois-je exploiter ? ». Si vous avez un ton spécifique par client, des workflows de support internes, et en plus un assistant dédié au code, PEFT pose une frontière propre entre la capacité partagée et le comportement spécifique à une tâche. Le [papier LoRA](https://arxiv.org/abs/2106.09685) est l'exemple le plus connu, mais c'est le motif global qui rend PEFT intéressant.

Je combine presque toujours PEFT avec un chargement quantifié, parce que le but est de réduire le coût, pas de le déplacer ailleurs. [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) rend cette approche praticable sur des machines plus modestes, tandis que la boucle d'optimisation reste dans la pile classique de [Transformers](https://huggingface.co/docs/transformers/training).

Voici à quoi ressemble une configuration pratique quand je veux un modèle de base unique avec plusieurs adapters.

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

quant_config = BitsAndBytesConfig(load_in_4bit=True)
base_model = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-v0.1",
    quantization_config=quant_config,
)

support_model = PeftModel.from_pretrained(base_model, "acme/support-adapter")
legal_model = PeftModel.from_pretrained(base_model, "acme/legal-adapter")
```

Ce pattern est ennuyeux dans le bon sens du terme. Vous gardez une base commune, vous versionnez de petits adapters indépendamment, et vous déployez le comportement voulu sans cloner le modèle complet à chaque fois. Ça force aussi une conversation produit saine : qu'est-ce qui appartient au modèle commun, et qu'est-ce qui relève d'une couche spécifique à une tâche ?

Le piège, c'est d'utiliser PEFT comme excuse pour relâcher la discipline d'évaluation. Des adapters bon marché restent des modèles qui peuvent dériver, halluciner et surapprendre. Sans evals dédiées pour chaque adapter, vous fabriquez surtout du checkpoint sprawl avec un meilleur emballage.

Mon seuil est simple : si vous avez besoin de plusieurs comportements spécialisés et que le modèle de base fait déjà correctement le travail général, PEFT devient le choix par défaut. Je ne paierais le prix d'un fine-tuning complet que si une variante permanente bat clairement les approches par adapters dans les evals et que la simplicité d'exploitation compense vraiment le poids supplémentaire.
