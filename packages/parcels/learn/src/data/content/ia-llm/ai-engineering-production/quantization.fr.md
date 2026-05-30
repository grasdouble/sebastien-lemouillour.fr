---
id: quantization
order: 13
difficulty: intermediate
tags: [LLM, quantization, optimization, BitsAndBytes, GGUF]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Tu charges un modèle 70B, ton GPU sature, et ton plan de "petite inférence locale pas chère" finit par coûter plus qu'un appel API. C'est exactement le moment où la quantification cesse d'être un détail d'optimisation pour devenir un vrai choix de déploiement.

Ma position est simple : j'essaie la quantification avant de changer de modèle. Beaucoup d'équipes passent trop vite de "le FP16 ne rentre pas" à "il nous faut un plus petit modèle". C'est souvent une mauvaise réaction. Garder le même modèle dans un format plus léger conserve généralement plus de qualité que de basculer vers un checkpoint moins capable.

Le point d'entrée le plus pratique reste [bitsandbytes](https://huggingface.co/docs/bitsandbytes/). Si tu charges déjà tes modèles via Transformers, l'inférence en 8 bits ou 4 bits te donne une réponse rapide avec très peu de plomberie supplémentaire. Je commence presque toujours par le 8 bits, parce que c'est la version ennuyeuse dans le bon sens : bon gain mémoire, dérive qualité limitée, et moins de mauvaises surprises sur les prompts longs ou les agents avec outils.

Ensuite, il y a [GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md). Je le choisis quand la cible est un poste local, de l'inférence CPU, ou un device edge où le packaging compte autant que la qualité brute. GGUF n'est pas là pour le confort d'entraînement. Il est là pour produire un artefact concret que des outils comme llama.cpp savent charger presque partout.

Le 4 bits, c'est l'endroit où les tutoriels deviennent trop optimistes. Oui, ça peut sauver ton budget. Non, ce n'est pas gratuit. Le papier [AWQ](https://arxiv.org/abs/2306.00978) est utile parce qu'il rappelle qu'une bonne quantification consiste à protéger les poids qui comptent vraiment, pas à écraser uniformément tout le modèle. La différence apparaît vite quand les prompts s'allongent, que le retrieval injecte du bruit, ou que l'agent doit tenir un format structuré sur plusieurs étapes.

Le point que beaucoup de guides ratent, c'est le périmètre d'évaluation. Ne compare pas un seul prompt vitrine. Compare les cas moches : contexte long, appels d'outils répétés, schémas d'extraction, sortie multilingue, comportement de refus. Les régressions liées à la quantification sont souvent discrètes. Le modèle répond encore, mais il répond avec moins de rigueur.

J'aime encoder cette politique de chargement tôt dans le projet, pour éviter que les contraintes matérielles fuient partout dans le code.

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

Ma règle : si le 8 bits rentre, je mets le 8 bits en prod. Si seul le 4 bits rentre, j'exige des evals au niveau des tâches avant publication. Si le 4 bits casse encore les sorties structurées ou le comportement en contexte long, j'arrête de compresser et je change le modèle ou le hardware.
