---
id: fine-tuning
order: 7
difficulty: intermediate
tags: [LLM, fine-tuning, OpenAI, Transformers]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your prompt works for most requests, then fails on the cases people actually remember: domain jargon, strict output format, tone that has to sound like your company and not like a generic chatbot. Fine-tuning can help, but it is also the fastest way to spend money on the wrong problem.

My opinion is blunt: I do not fine-tune until prompting, retrieval, and evals are already boring. Every fine-tuning tutorial obsesses over epochs and learning rates. Most of them barely talk about dataset quality, and that is where the work really is. If your examples contradict each other, copy old mistakes, or overrepresent happy-path demos, training will lock those problems into the model.

There are two sane routes. If you want managed infrastructure and quick iteration, [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning) is the shortest path from dataset to production endpoint. If you need control over the training loop, checkpoints, and adapters, the [HF training guide](https://huggingface.co/docs/transformers/training) is the reference worth following. Either way, hardware becomes real very quickly, and [NVIDIA](https://developer.nvidia.com/deep-learning) is a useful reminder that VRAM and memory bandwidth usually decide whether your plan is practical.

The shortcut I use is to write down the exact repeated failure before touching code. “Be better at support” is not trainable. “Answer plan questions in our escalation format, cite contract limits correctly, and ask one clarification question when account state is missing” is trainable.

The dataset I want on day one looks closer to this than to a giant unfiltered export.

```json
{"messages":[{"role":"system","content":"You are a B2B SaaS support copilot."},{"role":"user","content":"Is SSO included in the Pro plan?"},{"role":"assistant","content":"SSO is available on the Enterprise plan. Mention that clearly, offer the upgrade path, and ask whether they already use SAML."}]}
{"messages":[{"role":"system","content":"You are a B2B SaaS support copilot."},{"role":"user","content":"Can you confirm our data retention period?"},{"role":"assistant","content":"State the exact retention window from policy, avoid guessing, and ask for the workspace region if the policy depends on residency."}]}
```

I would rather have 400 clean examples like that than 40,000 messy ones. Split train and eval early. Keep a small holdout set full of ugly cases, not marketing examples. If the model only improves on polished prompts, you do not have a training success, you have a benchmark illusion.

When the hardware budget is tight, this is where [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) starts earning its place because lower-precision loading and training make smaller teams competitive. That still does not rescue a weak dataset. Fine-tuning is leverage, not magic.

My decision rule is simple: if you have fewer than a few hundred high-quality examples, or if your prompt and RAG stack are still moving every week, do not fine-tune yet. If the same failure shows up across hundreds of labeled conversations and the base model choice is already stable, then fine-tuning finally becomes the cheap option.
