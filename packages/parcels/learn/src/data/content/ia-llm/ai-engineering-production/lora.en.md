---
id: lora
order: 8
difficulty: intermediate
tags: [LLM, LoRA, fine-tuning, adapters]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

You want a model that speaks your domain better, then full fine-tuning immediately blows up the budget: huge checkpoints, expensive GPUs, and training runs where one bad experiment wastes real money. That is the moment where I stop dreaming about perfect control and reach for LoRA first.

LoRA comes from the [original paper](https://arxiv.org/abs/2106.09685): freeze the base model, inject small trainable low-rank matrices into selected layers, and update only those. The practical win is the part I care about: training gets cheaper, most of the base model stays untouched, and you ship an adapter instead of a whole new checkpoint. For most product teams, that trade-off is the one worth testing first.

My recommendation is simple: pick LoRA before full fine-tuning unless you already know the base model is close enough and you have the budget to retrain much more of it. The current [PEFT LoRA docs](https://huggingface.co/docs/peft/package_reference/lora) also make an important detail explicit: `target_modules` can be inferred for known architectures, but unknown ones still need you to set them deliberately. I prefer being explicit once evals matter, because silent defaults are a bad surprise when you are comparing runs.

The trap I fell into early was thinking LoRA makes dataset quality less important. It does not. Bad examples still teach bad behavior, only faster and more cheaply. The second trap is pushing rank too high because you are nervous about underfitting. A large adapter can still overfit hard, so I start small, keep evals close, and only spend more parameters when the misses are consistent.

When I want a baseline that is cheap enough to iterate on, I start here.

```python
from peft import LoraConfig, TaskType, get_peft_model

lora_config = LoraConfig(
    r=16,  # adapter rank, start small before scaling up
    lora_alpha=32,  # common first scaling choice for r=16
    lora_dropout=0.05,  # useful regularization on smaller datasets
    target_modules=["q_proj", "v_proj"],  # good first pass for many Llama-like decoder models
    bias="none",  # default, and usually the least surprising option
    task_type=TaskType.CAUSAL_LM,
)

model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
```

If the frozen model still barely fits, I reach for [bitsandbytes quantization](https://huggingface.co/docs/transformers/quantization/bitsandbytes) next so the base weights load in 8-bit or 4-bit precision instead of forcing a bigger machine. The usual [Trainer flow](https://huggingface.co/docs/transformers/trainer) still works after that, which is why LoRA is the shortcut I recommend when the real bottleneck is iteration speed, not academic purity.

One more shortcut: do not spray adapters across every projection just because one example repo did. PEFT can auto-select modules for common architectures, but once you care about reliable comparisons, I would rather start with the attention projections that matter for the model family, run task evals, and expand only when the failures point to missing capacity. That keeps cost down and makes the next experiment easier to explain.

My decision rule is boring on purpose: if LoRA with clean data and targeted evals still misses badly, I do not blame LoRA first. I check the base model choice, then whether retrieval, tools, or prompt work would solve the problem with less risk. Full fine-tuning is the move I keep for the cases where those cheaper levers have already failed.
