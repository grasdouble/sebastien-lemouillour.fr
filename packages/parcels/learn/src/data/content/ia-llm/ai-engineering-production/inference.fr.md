---
id: inference
order: 10
difficulty: intermediate
tags: [LLM, inference, vLLM, latency]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Un modèle qui paraît rapide dans un notebook peut donner l'impression d'être cassé dès que deux vrais utilisateurs arrivent en même temps. Le premier token met une éternité, le débit tombe d'un coup, la mémoire GPU grimpe, et la partie vraiment coûteuse n'est plus l'entraînement. C'est le serving.

Le piège dans lequel je suis déjà tombé, c'est d'accuser le modèle trop tôt. La [doc NVIDIA sur le TTFT](https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html) le dit clairement : des prompts plus longs augmentent le temps de prefill, donc le time to first token monte avant même qu'on parle de vitesse de decode. Quand le produit paraît lent, je vérifie donc la taille des prompts et la file d'attente avant de réclamer un autre GPU.

Si le vrai problème vient du chevauchement entre requêtes, je commencerais par la [doc d'optimisation vLLM](https://docs.vllm.ai/en/stable/configuration/optimization/) parce que le scheduler, le continuous batching et les limites du KV-cache sont souvent les leviers qui font bouger la latence p95. Si la cible est un laptop ou une petite machine edge, je préfère livrer [llama.cpp avec GGUF](https://huggingface.co/docs/hub/gguf-llamacpp) plutôt que de traîner une stack de serving plus lourde. Et quand la mémoire est le vrai plafond, la [quantization bitsandbytes](https://huggingface.co/docs/transformers/main/en/quantization/bitsandbytes) reste le test le plus rapide pour essayer un chargement en 8 bits ou en 4 bits avant de dépenser plus en hardware.

C'est le modèle mental que je garde : les prompts longs font mal à la latence du premier token, les requêtes qui se chevauchent punissent un batching faible, et les limites de VRAM se transforment très vite en coût. Je traite ces trois pannes séparément parce que la correction n'est pas la même.

Avant de choisir un moteur, j'aime forcer le compromis dans un peu de code.

```ts
type DeploymentTarget = 'shared-gpu-api' | 'edge-device' | 'team-laptop';

type InferenceInputs = {
  target: DeploymentTarget;
  concurrentRequests: number; // Volume de requêtes simultanées attendu au p95.
  promptTokensP95: number; // Les prompts longs abîment souvent d'abord le premier token.
  gpuMemoryGb: number; // VRAM réellement disponible, pas le chiffre marketing.
};

export function chooseInferencePlan({ target, concurrentRequests, promptTokensP95, gpuMemoryGb }: InferenceInputs) {
  if (target === 'shared-gpu-api' && concurrentRequests >= 8) {
    return {
      engine: 'vLLM',
      firstFix: promptTokensP95 > 4000 ? 'réduire les prompts' : 'régler le batching',
      reason: 'le continuous batching paie souvent dès que les requêtes se chevauchent',
    };
  }

  if (target === 'edge-device' || gpuMemoryGb <= 16) {
    return {
      engine: 'llama.cpp',
      firstFix: 'choisir un modèle GGUF qui garde de la marge',
      reason: 'les petites machines sanctionnent le runtime trop gros avant même le modèle',
    };
  }

  return {
    engine: 'quantized baseline',
    firstFix: 'charger en 8 bits ou en 4 bits puis mesurer à nouveau',
    reason: "itérer à petit coût vaut mieux qu'acheter du hardware trop tôt",
  };
}
```

J'aime ce genre de sketch parce qu'il oblige à choisir. Si la plainte porte sur le premier token, coupez la taille des prompts et supprimez le contexte inutile avant d'acheter plus de GPU. Si le système casse seulement sous concurrence, corrigez d'abord le batching. Je ne paierais une machine plus grosse qu'après l'échec de ces deux vérifications, parce que la facture d'inférence devient ridicule beaucoup plus vite que prévu.
