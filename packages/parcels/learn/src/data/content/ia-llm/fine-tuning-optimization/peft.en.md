---
id: peft
order: 9
difficulty: intermediate
tags: [fine-tuning, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

The pain shows up when one 7B checkpoint turns into five copies because support, legal, and sales each want their own behavior. I fell into that trap once. The bill was not training time. It was storage, GPU RAM, and deployment mess.

[PEFT](https://huggingface.co/docs/peft/index) is the umbrella for parameter-efficient methods such as LoRA, prompt tuning, prefix tuning, and IA3. It is not a synonym for LoRA. The shortcut is simple: keep one base model, ship small adapters, and swap behavior without rewriting the whole model.

The [LoRA paper](https://arxiv.org/abs/2106.09685) is still the reference people quote, but the operational lesson matters more than the math. If the base model already handles general language well, adapters let you separate shared capability from task-specific behavior. That keeps experiments cheap and rollback boring.

I usually pair PEFT with 4-bit loading because saving trainable parameters while keeping the full base model in higher precision memory misses the point. The [Transformers quantization docs](https://huggingface.co/docs/transformers/quantization/bitsandbytes) cover the `BitsAndBytesConfig` path, and the [PEFT quicktour](https://huggingface.co/docs/peft/quicktour) shows the adapter workflow. Watch the hardware caveat: quantization support still depends on your accelerator and the features exposed by the backend.

A setup I reuse looks like this:

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

quant_config = BitsAndBytesConfig(
    load_in_4bit=True,  # Reduce VRAM for the frozen base model.
)

base_model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",  # Any causal LM you want to adapt.
    quantization_config=quant_config,
    device_map="auto",  # Let Accelerate place layers on available hardware.
)

support_model = PeftModel.from_pretrained(
    base_model,
    "your-org/support-adapter",  # Adapter trained for support replies.
)

billing_model = PeftModel.from_pretrained(
    base_model,
    "your-org/billing-adapter",  # Separate adapter, same base weights.
)
```

You version adapters separately, load only what you need, and keep rollback cheap. Training still happens with the usual [Trainer API](https://huggingface.co/docs/transformers/trainer), so the new work is mostly data curation, evals, and adapter lifecycle management.

Here is the trap I would avoid: cheap adapters still overfit, drift, and reproduce bad data. PEFT does not give you a security boundary. A sloppy adapter can still push the model toward unsafe behavior, so per-adapter evals are mandatory.

My rule is simple: choose PEFT when you need at least two durable behaviors from one good base model or when full fine-tunes are too heavy to store and serve. Pay for a full fine-tune only after evals show one permanent variant wins by enough to justify the extra checkpoint weight.
