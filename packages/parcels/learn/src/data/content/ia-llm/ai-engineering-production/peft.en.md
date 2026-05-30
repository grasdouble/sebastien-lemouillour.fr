---
id: peft
order: 9
difficulty: intermediate
tags: [LLM, PEFT, fine-tuning, adapters, quantization]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Teams often say “we need fine-tuning” when what they really need is a cheap way to keep one base model and swap behaviors without duplicating giant checkpoints. That is the problem PEFT solves, and it matters a lot once you have more than one use case.

[PEFT](https://huggingface.co/docs/peft/) is not a single technique. It is the toolbox for parameter-efficient adaptation: LoRA, prompt tuning, prefix tuning, IA3, and a few other ways to change model behavior without retraining everything. The reason I like it is not academic elegance. It is operational sanity. One base model, several small adapters, fast experiments, and storage that does not explode every time product wants a new assistant persona.

This is where many tutorials stay too abstract. The hard question is not “can I train an adapter?” The hard question is “how many variants do I need to operate?” If you have customer-specific tone, internal support workflows, and a separate coding assistant, PEFT gives you a clean boundary between shared capability and task-specific behavior. The [LoRA paper](https://arxiv.org/abs/2106.09685) is the famous example, but the broader pattern is what makes PEFT worth learning.

I usually pair PEFT with quantized loading because the whole point is to reduce cost, not move it somewhere else. [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) makes that setup practical on smaller machines, while the actual optimization loop still lives in the normal [Transformers training stack](https://huggingface.co/docs/transformers/training).

A practical setup looks like this when I want one base model and multiple adapters.

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

That pattern is boring in the best way. You keep one shared base, version small adapters independently, and deploy the behavior you need without cloning the full model every time. It also forces a healthy product conversation: what belongs in the common model, and what belongs in a task-specific layer?

The trap is using PEFT as an excuse to avoid evaluation discipline. Cheap adapters are still models that can drift, hallucinate, and overfit. If you do not maintain task-level evals for each adapter, you are just creating checkpoint sprawl with better marketing.

My cutoff is simple: if you need more than one specialized behavior and the base model is already good enough at general language tasks, PEFT is the default. I would only pay the price of a full fine-tune when one permanent variant clearly beats adapter-based approaches in evals and the operational simplicity is worth the extra weight.
