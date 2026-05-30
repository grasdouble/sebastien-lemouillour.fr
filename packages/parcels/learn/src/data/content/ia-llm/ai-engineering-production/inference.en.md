---
id: inference
order: 10
difficulty: intermediate
tags: [LLM, inference, vLLM, latency]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

A model that feels great in a notebook can feel terrible the moment two real users hit it at once. The first response arrives late, throughput collapses, GPU memory spikes, and suddenly the “model quality” problem is really an inference problem.

This is the part many teams underestimate. Inference is not just “run the model after training”. It is where latency, batching, context length, and memory behavior turn into product experience. The mistake I see all the time is buying a larger model before measuring where time is actually spent. Very often the pain comes from long prompts, poor batching, or a runtime that wastes the hardware you already paid for.

If I need high-throughput GPU serving, I start by reading the [vLLM docs](https://docs.vllm.ai/) because continuous batching and efficient KV-cache handling change the economics quickly. If I need a lightweight local or edge setup, [llama.cpp](https://github.com/ggerganov/llama.cpp) and GGUF are often the more practical route. And if the box is small enough that every gigabyte matters, [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) is one of the first places I look for lower-precision loading. None of that replaces hardware basics, which is why [NVIDIA](https://developer.nvidia.com/deep-learning) still matters when you are trying to understand the gap between theoretical and real throughput.

The mental model I keep is simple: prefill is expensive, decode is repetitive, and concurrency punishes sloppy cache management. That is why a 32k context demo can be impressive in isolation and disappointing in production.

Before choosing a runtime, I like to force the trade-off into code.

```ts
type Target = 'prod-api' | 'edge-box' | 'developer-laptop';

export function chooseInferenceEngine(target: Target, concurrentUsers: number) {
  if (target === 'prod-api' && concurrentUsers > 8) {
    return { engine: 'vLLM', reason: 'continuous batching helps under load' };
  }

  if (target === 'edge-box') {
    return { engine: 'llama.cpp', reason: 'GGUF is easier to fit on smaller machines' };
  }

  return { engine: 'local quantized model', reason: 'optimize for cheap iteration first' };
}
```

That looks simplistic, and that is the point. Most inference mistakes come from skipping the obvious constraints: concurrent users, prompt length, output length, and memory budget. Measure tokens per second, time to first token, and p95 latency before you touch model choice. Otherwise you are tuning the wrong layer.

My rule is practical: if your users complain about waiting for the first token, shorten prompts and reduce context before shopping for more GPU. If they complain under concurrency, fix batching and serving strategy before you assume the model itself is too slow.
