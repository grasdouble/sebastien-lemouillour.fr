---
id: gpu-and-vram
order: 12
difficulty: intermediate
tags: [LLM, GPU, VRAM, quantization, CUDA]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Vous choisissez un modèle pour un GPU de 24 Go, il démarre une fois, puis le premier vrai prompt finit en out-of-memory. Je tombe dans ce piège chaque fois que j'estime à partir de la taille du téléchargement au lieu de la mémoire qui apparaît vraiment à l'exécution.

Pendant l'entraînement, la [mémoire GPU](https://huggingface.co/docs/transformers/main/model_memory_anatomy) part aussi dans les activations et les tenseurs temporaires, et pendant l'inférence le [KV cache](https://huggingface.co/docs/transformers/main/cache_explanation) grossit avec les tokens et les requêtes concurrentes. C'est pour ça que « les poids tiennent » ne veut pas dire « le service tient ».

Je préfère les choix un peu ennuyeux, parce que les choix ennuyeux survivent au trafic. Si un modèle ne tient qu'après des réglages héroïques, je le quantize d'abord avec [bitsandbytes](https://huggingface.co/docs/transformers/main/quantization/bitsandbytes) dans la pile Hugging Face, ou je bascule vers [llama.cpp](https://github.com/ggml-org/llama.cpp) et GGUF pour une machine locale ou edge avant d'accuser CUDA.

La première estimation à laquelle je fais confiance reste volontairement grossière, et je garde le terme du cache explicite parce qu'il dépend de l'architecture, du type de cache, et des réglages de serving. Si vous utilisez [vLLM](https://docs.vllm.ai/en/latest/configuration/optimization/) ou ses [engine args](https://docs.vllm.ai/en/latest/configuration/engine_args.html), c'est cette ligne qui décide si vous obtenez un débit stable ou de la préemption sous charge.

Avant de toucher aux flags de l'allocator, je pose une estimation de coin de table comme celle-ci :

```ts
type Precision = 'fp16' | 'int8' | 'int4';

const BYTES_PER_PARAM: Record<Precision, number> = {
  fp16: 2,
  int8: 1,
  int4: 0.5,
};

type VramInput = {
  paramsBillions: number; // 7 pour un modèle 7B
  precision: Precision; // précision des poids après quantization
  contextTokens: number; // budget prompt + génération gardé en cache
  concurrentRequests: number; // nombre maximal de séquences simultanées
  kvCacheKbPerToken: number; // valeur mesurée ou estimée pour votre moteur
  runtimeOverheadGb?: number; // kernels, marge allocator, buffers framework
  safetyMargin?: number; // gardez 0.2 pour 20 % de marge
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

Ce résultat suffit pour tuer tôt un mauvais plan de déploiement. Si `recommendedGb` dépasse la taille de votre carte, je réduirais le contexte ou la concurrence avant de partir à la chasse aux « fuites mémoire ». Si ça ne tient qu'en descendant la marge sous 20 %, partez du principe que ça ne tient pas vraiment.
