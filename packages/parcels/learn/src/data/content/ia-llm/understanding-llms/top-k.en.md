---
id: top-k
order: 22
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Top-p gets most of the attention because it sounds elegant. Then you self-host a smaller model, watch it wobble between decent and bizarre token choices, and suddenly a blunt instrument starts looking attractive. That blunt instrument is top-k.

## Top-k puts a hard ceiling on candidates

Top-k sampling keeps only the `k` most likely next tokens, then samples inside that set. If `top_k: 1`, you are effectively doing greedy decoding. If `top_k: 40`, the model can only choose among its forty best options at each step.

```json
{ "top_k": 1 }
{ "top_k": 20 }
{ "top_k": 40 }
```

The [Hugging Face docs](https://huggingface.co/docs/transformers/en/main_classes/text_generation), [Text Generation Inference docs](https://huggingface.co/docs/text-generation-inference/en/reference/launcher), and [vLLM sampling params](https://docs.vllm.ai/en/latest/api/vllm/sampling_params.html) all expose top-k because it is still a practical control when you run your own stack.

What I like about top-k is its predictability. The cutoff is fixed. You are not asking the decoder to estimate how much probability mass is “enough” on each step. You are saying: whatever happens, do not look past this many candidates.

## When I reach for it

I use top-k mostly on self-hosted or open-weight models, especially smaller ones. Their token distributions can be less well-calibrated than frontier hosted models, and a hard cap is sometimes the fastest way to stop weird long-tail excursions.

It is also useful when you need very stable style without going fully greedy. A setup like `temperature: 0.7, top_k: 40` can keep variation alive while preventing the decoder from wandering too far. That balance is one reason the [neural text degeneration](https://arxiv.org/abs/1904.09751) paper remains relevant: decoding strategy changes output quality dramatically, even with the same model.

There is a practical ops angle too. Top-k does not lower prompt-token billing, but on self-hosted systems it can make behavior easier to debug. If a model keeps drifting into junk with `top_k: 200`, tightening to `40` or `20` gives you a clear, testable intervention. Fewer bizarre outputs means fewer retries and less manual filtering.

## Where people misuse it

The common mistake is treating top-k like a universal hosted-API control. Many commercial APIs do not expose it at all, or they focus instead on temperature and top-p. That is why I think of top-k as a self-hosting knob first.

The other mistake is setting it too low and wondering why the model sounds repetitive. A tiny candidate pool can overconstrain phrasing, especially on longer generations. Set it too high on a weak model, and you invite the noise back in.

If I had to choose between top-k and top-p, I would usually pick top-p for well-calibrated hosted models and top-k for smaller or less stable self-hosted models where I want a hard ceiling on chaos.

My rule: use top-k when you control inference and need a predictable bound on candidate tokens. If you cannot explain why a hard cutoff helps your model, leave it alone or use top-p instead.
