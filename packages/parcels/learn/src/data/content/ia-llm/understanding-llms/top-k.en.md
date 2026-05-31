---
id: top-k
order: 22
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

You lower temperature, the model still blurts out a weird token, and suddenly the bug feels haunted. I hit that wall more often on smaller self-hosted models, which is why I reach for top-k before I get clever.

## Top-k solves the “too many bad options” problem

Top-k keeps only the `k` most likely next tokens. A `top_k` of `1` is basically greedy decoding, and higher values widen the pool step by step, as the [Vertex AI docs](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/adjust-parameter-values) describe. I like it because the rule is blunt on purpose: the decoder never gets to rummage through the whole tail.

That bluntness matters when “less randomness” is not specific enough. In [Transformers](https://huggingface.co/docs/transformers/en/main_classes/text_generation), `top_k` is a sampling parameter, so it only matters when sampling is enabled with `do_sample=True`. If you forget that, you can waste ten minutes tuning a knob that is doing exactly nothing.

Before I tune it further, I usually start from something like this.

```py
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")
model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")

inputs = tokenizer("Explain photosynthesis in one paragraph.", return_tensors="pt")
outputs = model.generate(
    **inputs,
    do_sample=True,     # top-k only applies during sampling
    temperature=0.7,    # keep some variation
    top_k=40,           # hard cap on candidate tokens
    max_new_tokens=120, # bound cost and latency
)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

## Why I prefer it on self-hosted models

When a smaller model keeps wandering into junk, I want a fixed ceiling before I start debating probability mass. The [vLLM params](https://docs.vllm.ai/en/latest/api/vllm/sampling_params.html) even let you disable the filter with `top_k=0` or `-1`, which tells you exactly what this knob is for: you either cap the candidate set or you do not.

That preference is also a reaction to a real failure mode. The [Holtzman paper](https://arxiv.org/abs/1904.09751) showed that decoding strategy alone can change text quality a lot, and weak tails are often where repetitive or bizarre continuations start. On a shaky model, I would rather fence off the tail than hope it behaves.

## Where people oversell it

I would not sell top-k as a universal API knob. The [Azure OpenAI reference](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/reference) exposes `temperature` and `top_p`, but not `top_k`, which is why I treat top-k as a self-hosting tool first and a hosted-API expectation second.

I also would not sell it as a safety control. Google’s [Responsible AI guidance](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/responsible-ai) is the better mental model here: use safety filters, testing, and monitoring for risky outputs. Top-k can make generations less chaotic, but it can still leave unsafe candidates inside the surviving set.

If you are calling a hosted model in a loop, retries still chew through quota and rate-limit budget, as the [Azure OpenAI quotas](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/quotas-limits) page makes painfully clear. If the model is small, local, or annoyingly erratic, start around `top_k: 20` to `40` and move only if you can name the failure you are fixing.
