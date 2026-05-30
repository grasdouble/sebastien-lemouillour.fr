---
id: quantization
order: 13
difficulty: intermediate
tags: [LLM, quantization, optimization, BitsAndBytes, GGUF]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You loaded a 70B model, your GPU ran out of memory, and now the "cheap local inference" plan is somehow more expensive than the API bill. This is the point where quantization stops being an optimization topic and becomes a deployment decision.

My default opinion is simple: try quantization before you swap models. A lot of teams jump straight from "FP16 does not fit" to "we need a smaller model". That is often the wrong move. Keeping the same model in a lighter format usually preserves more quality than jumping to a weaker checkpoint.

The easy entry point is [bitsandbytes](https://huggingface.co/docs/bitsandbytes/). If you already load models through Transformers, 8-bit and 4-bit inference get you a fast answer with very little plumbing. I reach for 8-bit first because it is usually the boring option: good memory savings, less quality drift, fewer surprises in long prompts and tool-calling flows.

Then there is [GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md). I use it when the target is local desktop, CPU inference, or an edge device where packaging matters as much as raw quality. GGUF is less about training convenience and more about shipping a practical artifact that tools like llama.cpp can load almost anywhere.

4-bit is where tutorials get too optimistic. Yes, it can save your budget. No, it is not free. The [AWQ paper](https://arxiv.org/abs/2306.00978) is useful because it reminds you that smart quantization is about protecting the weights that matter most, not blindly crushing everything down to the same precision. That difference shows up when prompts get long, retrieval adds noise, or the agent has to preserve structured outputs across multiple steps.

The part most guides skip is evaluation scope. Do not only compare one benchmark prompt. Compare the ugly cases: long context, repeated tool calls, extraction schemas, multilingual output, and refusal behavior. Quantization regressions are often subtle. The model still answers, but it answers with less discipline.

This is the kind of loading policy I like to encode early, so hardware constraints stop leaking all over the codebase.

```typescript
type RuntimeTarget = 'gpu-server' | 'developer-laptop' | 'edge-device';

type QuantizationPlan = {
  format: 'fp16' | 'int8' | 'int4' | 'gguf-q4';
  loader: 'transformers' | 'llama.cpp';
  reason: string;
};

export function chooseQuantization(target: RuntimeTarget, availableVramGb: number): QuantizationPlan {
  if (target === 'edge-device') {
    return {
      format: 'gguf-q4',
      loader: 'llama.cpp',
      reason: 'Prefer portable local inference over training flexibility.',
    };
  }

  if (availableVramGb >= 40) {
    return {
      format: 'fp16',
      loader: 'transformers',
      reason: 'Enough VRAM, keep the highest fidelity path.',
    };
  }

  if (availableVramGb >= 24) {
    return {
      format: 'int8',
      loader: 'transformers',
      reason: 'Best compromise for server inference.',
    };
  }

  return {
    format: 'int4',
    loader: 'transformers',
    reason: 'Use only when memory is the real constraint, then validate task quality.',
  };
}
```

My rule: if 8-bit fits, ship 8-bit. If only 4-bit fits, require task-level evals before production. If 4-bit still breaks structured output or long-context behavior, stop squeezing and change the model or the hardware.
