---
id: lora
order: 8
difficulty: intermediate
tags: [LLM, LoRA, fine-tuning, adapters]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You want a model that speaks your domain better, but the second you read about full fine-tuning you hit the hardware wall: huge checkpoints, expensive GPUs, and training runs that make a small mistake feel very expensive. This is why I reach for LoRA first.

LoRA comes from the [original paper](https://arxiv.org/abs/2106.09685): freeze the base model, inject small trainable low-rank matrices into a few layers, and update only those. The practical consequence is what matters: you keep most of the base model intact, training gets cheaper, and the resulting adapter is tiny compared with a full checkpoint. For most product teams, that trade-off is excellent.

My opinion is stronger than the average tutorial: choose LoRA over full fine-tuning unless you have a lot of GPUs and a very good reason not to. Most teams are not trying to rewrite the whole model. They are trying to nudge style, domain vocabulary, and task behavior. LoRA is usually enough for that, and the [PEFT docs](https://huggingface.co/docs/peft/) make the setup much less painful than it used to be.

The trap is assuming LoRA makes data quality less important. It does not. Garbage examples still produce garbage behavior, only faster. The other trap is pushing rank too high because you are nervous. A giant adapter can overfit just as enthusiastically as a full fine-tune. I usually start with modest settings, then move only if evals justify it.

This is the configuration shape I use as a default starting point.

```python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,  # adapter rank, start small before scaling up
    lora_alpha=32,  # effective scaling of adapter updates
    lora_dropout=0.05,  # regularization, useful on smaller datasets
    target_modules=["q_proj", "v_proj"],  # common first target for decoder models
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
```

If the base model is still too large, [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) is the next lever I pull so the frozen weights fit in lower precision. The training loop itself still follows the usual [Transformers flow](https://huggingface.co/docs/transformers/training), which is why LoRA feels approachable once the dataset is ready.

What tutorials skip is target-module choice. Updating every possible projection because a repo did it once is lazy. Start with the attention projections that matter for your model family, run task evals, and expand only when the misses are specific enough to justify extra parameters.

My rule is simple: if LoRA with clean data cannot fix the behavior, the first suspect is not “LoRA is weak”. The first suspect is that you picked the wrong base model, or that the problem should have been solved with retrieval, tools, or better prompts.
