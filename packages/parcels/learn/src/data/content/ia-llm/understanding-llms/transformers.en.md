---
id: transformers
order: 16
difficulty: intermediate
tags: [Transformer, LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The first time you throw a long document at an older sequence model, the failure feels insulting. The answer starts well, then forgets the setup, mangles references, and loses track of what happened three paragraphs earlier. That is the problem transformers solved well enough that nearly every modern LLM now inherits the design from the original [paper](https://arxiv.org/abs/1706.03762).

## Why recurrence hit a ceiling

Before transformers, recurrent models processed text token by token. That sounds natural until you try to train at scale. Serial computation is slow, long-range dependencies are fragile, and the path between two distant tokens gets longer as the sequence grows. The transformer paper made the tradeoff explicit: replace recurrence with self-attention so every token can look at every other token in one layer, in parallel, on accelerator hardware.

That parallelism is the boring reason transformers won. It is not just elegance. It is the reason training finally scaled on GPUs and TPUs instead of fighting the sequential bottleneck. Once that happened, model families split into useful patterns: encoder-only models such as [BERT](https://arxiv.org/abs/1810.04805) for understanding tasks, decoder-only models such as [GPT-3](https://arxiv.org/abs/2005.14165) for next-token generation, and encoder-decoder models such as [T5](https://arxiv.org/abs/1910.10683) when you want a clean input-output transformation.

## What changed in practice

The core computation is still compact:

```txt
Attention(Q, K, V) = softmax(QKᵀ / √d_k) V
```

Each token produces queries, keys, and values. Instead of pushing one hidden state forward through time, the model learns which other tokens deserve focus right now. Order is reintroduced through positional information, because pure attention alone has no notion of first, next, or previous. The [Hugging Face docs](https://huggingface.co/docs/transformers/en/model_summary) are useful here because they show how the same backbone keeps reappearing under different names.

What matters for an LLM user is not the formula itself. It is the behavior it enables: sharper reference tracking, better conditioning on long prompts, and a clean separation between training-time parallelism and inference-time generation.

## What I check before trusting a model

When someone tells me a model is “a transformer,” I ask three follow-up questions.

First: is it decoder-only, encoder-only, or encoder-decoder? That tells you whether the model is optimized for generation, representation, or structured transformation.

Second: what happens when context gets long? Vanilla self-attention grows roughly quadratically with sequence length according to the original [paper](https://arxiv.org/abs/1706.03762), so a huge context window is never free. Latency climbs, memory pressure climbs, and prompt costs climb with it.

Third: does the serving stack use a [KV cache](https://huggingface.co/docs/transformers/en/cache_explanation)? During autoregressive generation, caching past keys and values is the difference between tolerable streaming and a model that feels stuck in wet cement.

For assistants and content generation, I would still choose a strong decoder-only transformer first because the tooling, eval habits, and serving infrastructure are far better. For ranking, retrieval, and classification, I still think encoder-style transformers are underrated because stable representations matter more than eloquent prose.

My rule: when you compare LLMs, ask about transformer variant, context behavior, and cache strategy before you ask about parameter count.
