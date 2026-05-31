---
id: inference
order: 10
difficulty: intermediate
tags: [LLM, inference, vLLM, latency]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

A model that feels fast in a notebook can feel broken the minute two real users hit it at once. The first token shows up late, throughput falls off a cliff, GPU memory jumps, and suddenly the expensive part is not training anymore. It is serving.

The trap I fell into was blaming the model too early. [NVIDIA's TTFT docs](https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html) spell it out: longer prompts increase prefill time, and that pushes time to first token up before you even look at decode speed. So when the product feels sluggish, I check prompt length and queueing before I ask for another GPU.

If overlap between requests is the real problem, I would start with [vLLM optimization docs](https://docs.vllm.ai/en/stable/configuration/optimization/) because the scheduler, continuous batching, and KV-cache limits are the knobs that usually move p95 latency. If the target is a laptop or a small edge box, I would rather ship [llama.cpp with GGUF](https://huggingface.co/docs/hub/gguf-llamacpp) than drag in a heavier serving stack. And when memory is the bottleneck, [bitsandbytes quantization](https://huggingface.co/docs/transformers/main/en/quantization/bitsandbytes) is the quickest way to test 8-bit or 4-bit loading before you spend more on hardware.

That is the mental model I keep: long prompts hurt first-token latency, overlapping requests punish weak batching, and VRAM limits turn into cost fast. I treat those as separate failure modes because the fix is different for each one.

Before picking an engine, I like to force the trade-off into code.

```ts
type DeploymentTarget = 'shared-gpu-api' | 'edge-device' | 'team-laptop';

type InferenceInputs = {
  target: DeploymentTarget;
  concurrentRequests: number; // Expected overlapping requests at p95.
  promptTokensP95: number; // Long prompts usually hurt first-token latency first.
  gpuMemoryGb: number; // Real usable VRAM, not the marketing number.
};

export function chooseInferencePlan({ target, concurrentRequests, promptTokensP95, gpuMemoryGb }: InferenceInputs) {
  if (target === 'shared-gpu-api' && concurrentRequests >= 8) {
    return {
      engine: 'vLLM',
      firstFix: promptTokensP95 > 4000 ? 'trim prompts' : 'tune batching',
      reason: 'continuous batching usually pays off once requests overlap',
    };
  }

  if (target === 'edge-device' || gpuMemoryGb <= 16) {
    return {
      engine: 'llama.cpp',
      firstFix: 'use a GGUF model that fits with headroom',
      reason: 'smaller boxes punish oversized runtimes before they punish the model',
    };
  }

  return {
    engine: 'quantized baseline',
    firstFix: 'load in 8-bit or 4-bit and measure again',
    reason: 'cheap iteration beats premature hardware spend',
  };
}
```

I like this kind of sketch because it forces a choice. If first-token latency is the complaint, cut prompt size and cache useless context before shopping for more GPU. If the system only falls apart under concurrency, fix batching first. I would only pay for a larger box after those two checks fail, because inference bills get silly faster than most teams expect.
