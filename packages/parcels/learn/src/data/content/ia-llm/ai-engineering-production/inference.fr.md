---
id: inference
order: 10
difficulty: intermediate
tags: [LLM, inference, vLLM, latency]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Un modèle qui paraît excellent dans un notebook peut devenir pénible dès que deux vrais utilisateurs l'appellent en même temps. Le premier token arrive trop tard, le débit s'écroule, la mémoire GPU grimpe, et d'un coup le problème de « qualité du modèle » devient surtout un problème d'inférence.

C'est la partie que beaucoup d'équipes sous-estiment. L'inférence, ce n'est pas simplement « exécuter le modèle après l'entraînement ». C'est le moment où la latence, le batching, la longueur de contexte et le comportement mémoire se transforment en expérience produit. L'erreur classique consiste à acheter un modèle plus gros avant de mesurer où le temps part vraiment. Très souvent, la douleur vient de prompts trop longs, d'un batching mal géré, ou d'un runtime qui gaspille le hardware déjà payé.

Si j'ai besoin d'un service GPU avec du débit, je commence par la doc [vLLM](https://docs.vllm.ai/) parce que le continuous batching et la gestion efficace du KV-cache changent vite l'équation. Si j'ai besoin d'un setup local léger ou orienté edge, [llama.cpp](https://github.com/ggerganov/llama.cpp) et GGUF sont souvent plus pratiques. Et si la machine est assez petite pour que chaque gigaoctet compte, [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) fait partie des premiers leviers que j'essaie pour charger le modèle en précision réduite. Rien de ça ne remplace les bases matérielles, d'où l'intérêt de garder [NVIDIA](https://developer.nvidia.com/deep-learning) en tête quand on cherche à comprendre l'écart entre débit théorique et débit réel.

Le modèle mental que je garde est simple : la phase de prefill coûte cher, la phase de decode se répète, et la concurrence punit tout ce qui gère mal le cache. C'est pour ça qu'une démo en contexte 32k peut impressionner seule et décevoir en production.

Avant de choisir un runtime, j'aime forcer le compromis dans un peu de code.

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

Ce code paraît simpliste, et c'est volontaire. La plupart des erreurs d'inférence viennent d'un oubli des contraintes évidentes : nombre d'utilisateurs concurrents, taille des prompts, longueur des réponses, budget mémoire. Mesurez les tokens par seconde, le time to first token et la latence p95 avant de toucher au choix du modèle. Sinon, vous optimisez la mauvaise couche.

Ma règle est pratique : si vos utilisateurs se plaignent d'attendre le premier token, raccourcissez les prompts et réduisez le contexte avant d'acheter plus de GPU. S'ils se plaignent surtout sous charge, corrigez le batching et la stratégie de serving avant de conclure que le modèle est trop lent.
