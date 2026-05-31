---
id: pre-training
order: 18
difficulty: intermediate
tags: [fine-tuning, llm]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Vous faites un fine-tuning propre, l’éval a l’air correcte, et pourtant le modèle cale encore sur le vocabulaire que votre métier utilise tous les jours. J’ai déjà vu des équipes accuser le prompting à ce stade, mais le piège est plus tôt: si le modèle de base n’a jamais absorbé vos formes de langage pendant le pré-entraînement, vous demandez aux étapes suivantes de compenser un manque d’exposition.

## Le pré-entraînement achète les réflexes du modèle

Le pré-entraînement est la phase où le modèle apprend la structure statistique générale du texte à partir de corpus bruts. L’objectif peut sembler presque banal, comme la prédiction du token suivant dans [GPT-3](https://arxiv.org/abs/2005.14165), mais c’est là que se jouent la familiarité avec le vocabulaire, l’amplitude de style, l’équilibre multilingue et une bonne partie des connaissances latentes sur le monde.

C’est pour ça que je vois le pré-entraînement comme l’endroit où l’on achète des réflexes, pas comme un simple polissage. Si le modèle de base a de mauvais priors pour votre domaine, aucun prompt bien tourné ne le sauvera complètement. On peut orienter ensuite, mais on oriente toujours ce que le modèle a déjà appris à remarquer.

## Des données plus propres battent de plus gros titres

L’erreur facile consiste à imaginer le pré-entraînement comme une simple course au volume. Le résultat [Chinchilla](https://arxiv.org/abs/2203.15556) est la correction à laquelle je reviens sans cesse: à budget de calcul fixé, beaucoup de grands modèles étaient surtout sous-entraînés, et de meilleures performances venaient d’un meilleur équilibre entre taille du modèle et volume de données, pas d’une inflation des paramètres.

Si je devais choisir entre un modèle un peu plus petit entraîné sur un corpus plus propre, plus diversifié et dédupliqué, et un modèle plus gros entraîné sur une boue de web non filtrée, je prendrais presque toujours le corpus propre. On obtient en général moins de répétitions absurdes, moins de transfert fragile et moins de mémorisation accidentelle.

C’est aussi pour cette raison que le pré-entraînement de domaine peut payer. [BloombergGPT](https://arxiv.org/abs/2303.17564) est un bon exemple: mélanger un gros corpus généraliste avec un vrai corpus métier a amélioré les tâches financières sans casser les performances générales. Ma préférence est claire ici: si l’écart vient du vocabulaire métier, donnez d’abord au modèle un meilleur texte avant de lui demander de mieux obéir.

## Commencez par un pré-entraînement continu, pas par un projet lunaire

Un pré-entraînement complet coûte à l’échelle d’une entreprise. Le pré-entraînement continu est le premier mouvement pratique quand l’écart vient vraiment d’un manque d’exposition au langage: style juridique, syntaxe biomédicale, logs de support, ou formats documentaires de niche qu’on croise à peine sur le web ouvert. Les [docs Transformers](https://huggingface.co/docs/transformers/en/tasks/language_modeling) montrent le même geste de base que pour un modèle causal classique: on change le corpus, pas l’objectif.

Si vous voulez tester cette hypothèse sans brûler le budget, commencez par un tout petit run et regardez si la perplexité et les évaluations métier progressent ensemble.

Voici le plus petit essai que je lancerais avant d’approuver un budget plus large.

```python
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    DataCollatorForLanguageModeling,
    Trainer,
    TrainingArguments,
)

model_name = "distilgpt2"
dataset = load_dataset("text", data_files={"train": "domain-corpus.txt"})

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token


def tokenize(batch):
    return tokenizer(
        batch["text"],
        truncation=True,
        max_length=512,  # garde l’essai peu coûteux et comparable
    )


train_dataset = dataset["train"].map(
    tokenize,
    batched=True,
    remove_columns=["text"],
)

model = AutoModelForCausalLM.from_pretrained(model_name)
collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

args = TrainingArguments(
    output_dir="artifacts/pretraining-check",
    per_device_train_batch_size=4,  # démarre petit pour estimer le coût mémoire
    gradient_accumulation_steps=8,  # augmente le batch effectif à moindre coût
    learning_rate=2e-5,  # taux prudent pour du pré-entraînement continu
    num_train_epochs=1,  # suffisant pour détecter un signal avant de surpayer
    logging_steps=20,
    save_strategy="no",  # évite de remplir le disque pendant ce run test
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=train_dataset,
    data_collator=collator,
)

trainer.train()
```

## N’utilisez pas le pré-entraînement pour corriger un problème de comportement

Quand l’écart est surtout comportemental, le pré-entraînement est souvent le mauvais luxe. Si vous avez surtout besoin d’un meilleur format de réponse, d’un meilleur suivi des instructions ou de faits plus frais avec leur provenance, [InstructGPT](https://arxiv.org/abs/2203.02155) et [RAG](https://arxiv.org/abs/2005.11401) pointent vers des leviers moins chers: on ajuste le comportement, ou on récupère la connaissance au moment de la génération, au lieu d’essayer de tout cuire dans les poids.

C’est sur le coût et la sécurité que les équipes deviennent imprudentes. [Carlini et al.](https://arxiv.org/abs/2012.07805) ont montré que de grands modèles de langage peuvent faire ressortir des exemples mémorisés, y compris des données personnelles. Donc avant même de parler GPU, j’exigerais une histoire écrite sur la licence, le consentement, la déduplication, la rétention et l’évaluation. Si cette histoire est floue, je ne validerais pas le run.

Règle de décision: payez un pré-entraînement continu seulement si les évaluations montrent un manque de connaissances métier ou d’exposition au langage que le prompting, l’instruction tuning ou le RAG n’arrivent pas à combler pour moins cher.
