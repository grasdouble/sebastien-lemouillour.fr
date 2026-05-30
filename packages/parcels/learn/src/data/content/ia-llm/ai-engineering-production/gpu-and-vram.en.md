---
id: gpu-and-vram
order: 12
difficulty: intermediate
tags: [LLM, GPU, VRAM, quantization, CUDA]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You load a model that supposedly “fits on a 24 GB card”, then the first real request crashes with out-of-memory. That is the moment most developers learn the annoying truth: VRAM budget is not the model file size.

The weights are only the first line of the bill. You also pay for activations during training, KV cache during inference, framework overhead, batch size, and context length. Hardware vendors like [NVIDIA](https://developer.nvidia.com/deep-learning) talk a lot about compute, but in practice VRAM is usually the first hard limit you hit when working with LLMs. This is why a model that loads successfully can still fail under concurrency or longer prompts.

My default stance is conservative. I would rather run a slightly smaller model with headroom than squeeze a larger one until every deployment becomes fragile. Quantization helps a lot here. [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) makes reduced-precision loading practical in the Hugging Face stack, and [llama.cpp](https://github.com/ggerganov/llama.cpp) with GGUF is often the cleanest route for local or edge boxes. On the serving side, [vLLM](https://docs.vllm.ai/) matters because memory-efficient KV-cache handling changes what “fits” under real traffic.

The estimate I make first is deliberately rough, because a rough estimate early beats a perfect estimate after an outage.

```ts
type Precision = 'fp16' | 'int8' | 'int4';

export function estimateVramGb(
  paramsBillions: number,
  precision: Precision,
  concurrency: number,
  contextTokens: number
) {
  const bytesPerParam = precision === 'fp16' ? 2 : precision === 'int8' ? 1 : 0.5;
  const weightGb = (paramsBillions * 1e9 * bytesPerParam) / 1024 ** 3;
  const kvCacheGb = (concurrency * contextTokens * 16) / 1024 ** 2; // rough per-token cache budget in KB
  const runtimeOverheadGb = 2; // framework, allocator fragmentation, misc buffers

  return weightGb + kvCacheGb + runtimeOverheadGb;
}
```

That number is not precise enough for a paper, but it is good enough to reject bad ideas quickly. A 7B model in fp16 already burns a serious chunk of VRAM just for weights. Add longer context, bigger batches, or multiple users, and the KV cache starts eating the rest. This is why people get surprised when “the model loads” but “the service falls over”. They measured the wrong thing.

My practical rule is to leave at least 15 to 20 percent headroom after your rough estimate. If you cannot do that, the model does not fit, even if you can force it to start once. Quantize sooner, shorten context, or choose a smaller model before you waste time debugging memory errors that are really budgeting errors.
