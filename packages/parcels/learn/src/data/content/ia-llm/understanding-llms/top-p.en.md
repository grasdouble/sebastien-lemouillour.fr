---
id: top-p
order: 21
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

I have seen teams lower temperature, expect safer outputs, and still get bizarre token choices in the tail. The reason is simple: temperature changes the shape of the whole distribution, but it does not decide how much improbable junk you are willing to keep in the candidate pool. That is where top-p becomes useful.

## Top-p cuts the tail dynamically

Top-p, also called nucleus sampling, keeps the smallest set of next-token candidates whose cumulative probability reaches a threshold `p`. The original [nucleus sampling](https://arxiv.org/abs/1904.09751) paper explains why this matters: low-probability tails are often where degeneration lives.

A small change can have a visible effect:

```json
{ "top_p": 0.95 }
{ "top_p": 0.9 }
{ "top_p": 0.8 }
```

Unlike top-k, the candidate set is not fixed. If the model is very confident, nucleus sampling may keep only a few tokens. If the model is uncertain, it can keep more. I like that behavior because it adapts to the actual shape of the distribution instead of pretending every decoding step deserves the same cutoff.

The parameter is exposed in OpenAI’s [API reference](https://platform.openai.com/docs/api-reference/chat/create), Anthropic’s [messages docs](https://docs.anthropic.com/en/api/messages), and the [Hugging Face docs](https://huggingface.co/docs/transformers/en/main_classes/text_generation), which is a hint that it is not an obscure research knob anymore.

## When I use it

If I already like the overall creativity level of a model but want to suppress weird long-tail tokens, top-p is often the cleaner fix. Lowering temperature can make the whole answer dull. Lowering top-p trims the tail more directly.

That makes top-p useful for copy generation, summarization, and general chat when the model is mostly good but occasionally takes an odd lexical detour. It is less useful when the real problem is factuality or missing context. Top-p can reduce some nonsense, but it cannot conjure evidence the model does not have.

There is also a cost angle. Top-p does not change prompt token billing, but it can change system cost indirectly. Better sampling means fewer retries, less human review, and fewer “why did it suddenly say that?” incidents.

## The trap: treating it like a creativity slider

I do not think of top-p as a pure creativity knob. I think of it as tail management. That is why I usually tune temperature first for broad behavior, then top-p only if I can point to a tail problem: strange word choice, unstable phrasing, or occasional derailments.

I also avoid combining aggressive settings like `temperature: 1.0` and `top_p: 1.0` unless I explicitly want maximum variation. That combination is fun in demos and annoying in products.

My rule: use top-p when you want to cut improbable tails without flattening the whole distribution. If you cannot describe the tail problem you are fixing, leave it near the default.
