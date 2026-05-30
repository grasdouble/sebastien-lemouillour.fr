---
id: gpu-and-vram
order: 12
difficulty: intermediate
tags: [LLM, GPU, VRAM, quantization, CUDA]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous chargez un modèle censé « tenir sur une carte 24 Go », puis la première vraie requête tombe en out-of-memory. C'est généralement à ce moment-là qu'on apprend la vérité agaçante : le budget VRAM ne se résume pas à la taille du fichier du modèle.

Les poids ne sont que la première ligne de la facture. Il faut aussi payer les activations pendant l'entraînement, le KV cache pendant l'inférence, l'overhead du framework, la taille de batch, et la longueur du contexte. Des acteurs comme [NVIDIA](https://developer.nvidia.com/deep-learning) parlent beaucoup de compute, mais dans la pratique la VRAM est souvent la première limite dure qu'on rencontre avec les LLM. C'est pour ça qu'un modèle peut se charger correctement et échouer dès qu'on augmente la concurrence ou la taille des prompts.

Mon réflexe par défaut est conservateur. Je préfère faire tourner un modèle un peu plus petit avec de la marge plutôt que d'étrangler un gros modèle jusqu'à rendre chaque déploiement fragile. La quantization aide énormément. [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) rend le chargement en précision réduite viable dans la pile Hugging Face, et [llama.cpp](https://github.com/ggerganov/llama.cpp) avec GGUF est souvent la voie la plus propre pour des machines locales ou edge. Côté serving, [vLLM](https://docs.vllm.ai/) compte aussi, parce qu'une gestion mémoire plus efficace du KV cache change concrètement ce qui « tient » sous trafic réel.

L'estimation que je fais en premier est volontairement approximative, parce qu'une approximation tôt vaut mieux qu'une précision parfaite après une panne.

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
  const kvCacheGb = (concurrency * contextTokens * 16) / 1024 ** 2; // budget approximatif du cache par token en KB
  const runtimeOverheadGb = 2; // framework, fragmentation mémoire, buffers divers

  return weightGb + kvCacheGb + runtimeOverheadGb;
}
```

Ce chiffre n'est pas assez précis pour un papier, mais il suffit largement pour rejeter rapidement une mauvaise idée. Un modèle 7B en fp16 consomme déjà une part sérieuse de VRAM rien qu'avec les poids. Ajoutez un contexte plus long, des batches plus gros, ou plusieurs utilisateurs, et le KV cache dévore le reste. C'est exactement pour ça que tant d'équipes se font surprendre par « le modèle se charge » mais « le service s'écroule ». Elles ont mesuré la mauvaise chose.

Ma règle pratique est de garder au moins 15 à 20 % de marge après cette estimation grossière. Si vous n'y arrivez pas, le modèle ne tient pas, même si vous pouvez forcer un démarrage une fois. Quantifiez plus tôt, réduisez le contexte, ou choisissez un modèle plus petit avant de perdre du temps à déboguer des erreurs mémoire qui sont en réalité des erreurs de budget.
