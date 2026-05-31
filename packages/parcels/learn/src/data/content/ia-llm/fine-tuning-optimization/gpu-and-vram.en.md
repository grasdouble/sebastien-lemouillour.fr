---
id: gpu-and-vram
order: 12
difficulty: intermediate
tags: [fine-tuning, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You pick a model for a 24 GB GPU, it boots once, then the first real prompt crashes with out-of-memory. I fall into this trap whenever I estimate from the download size instead of the memory that shows up at runtime.

During training, [GPU memory](https://huggingface.co/docs/transformers/main/model_memory_anatomy) also goes to activations and temporary tensors, and during inference the [KV cache](https://huggingface.co/docs/transformers/main/cache_explanation) grows with tokens and concurrent requests. That is why “the weights fit” is not the same as “the service fits”.

I default to boring choices here because boring survives traffic. If a model only fits after heroic tuning, I would usually quantize it first with [bitsandbytes](https://huggingface.co/docs/transformers/main/quantization/bitsandbytes) in the Hugging Face stack, or move to [llama.cpp](https://github.com/ggml-org/llama.cpp) and GGUF for a local or edge box before I start blaming CUDA.

The first estimate I trust is rough on purpose, and I keep the cache term explicit because it changes with architecture, cache dtype, and serving settings. If you use [vLLM](https://docs.vllm.ai/en/latest/configuration/optimization/) or tune [engine args](https://docs.vllm.ai/en/latest/configuration/engine_args.html), this is the line that decides whether you get steady throughput or preemption under load.

Before I touch allocator flags, I run a back-of-the-envelope estimate like this:

```ts
type Precision = 'fp16' | 'int8' | 'int4';

const BYTES_PER_PARAM: Record<Precision, number> = {
  fp16: 2,
  int8: 1,
  int4: 0.5,
};

type VramInput = {
  paramsBillions: number; // 7 for a 7B model
  precision: Precision; // weight precision after quantization
  contextTokens: number; // prompt + generation budget kept in cache
  concurrentRequests: number; // peak simultaneous sequences
  kvCacheKbPerToken: number; // measured or estimated for your engine
  runtimeOverheadGb?: number; // kernels, allocator slack, framework buffers
  safetyMargin?: number; // keep 0.2 for 20% headroom
};

export function estimateVramGb({
  paramsBillions,
  precision,
  contextTokens,
  concurrentRequests,
  kvCacheKbPerToken,
  runtimeOverheadGb = 2,
  safetyMargin = 0.2,
}: VramInput) {
  const weightGb = (paramsBillions * 1e9 * BYTES_PER_PARAM[precision]) / 1024 ** 3;
  const kvCacheGb = (concurrentRequests * contextTokens * kvCacheKbPerToken) / 1024 ** 2;
  const baseGb = weightGb + kvCacheGb + runtimeOverheadGb;

  return {
    breakdown: { weightGb, kvCacheGb, runtimeOverheadGb },
    baseGb,
    recommendedGb: baseGb * (1 + safetyMargin),
  };
}
```

That output is good enough to kill a bad deployment plan early. If `recommendedGb` lands above your card size, I would shorten context or reduce concurrency before hunting for “memory leaks”. If you only fit after dropping the safety margin below 20 percent, assume you do not really fit.
