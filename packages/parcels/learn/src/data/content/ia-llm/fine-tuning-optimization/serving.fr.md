---
id: serving
order: 11
difficulty: intermediate
tags: [production, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

La démo marche sur ton laptop, puis la production pose les questions qui gâchent un vendredi après-midi : comment redémarrer proprement, empêcher des pods cassés de reprendre du trafic, éviter qu'un seul client brûle tout le budget GPU, et déployer une nouvelle version du modèle sans croiser les doigts ? C'est exactement l'écart que le serving doit combler, et c'est là qu'une bonne partie des projets LLM prometteurs cale en silence.

Mon biais est volontairement ennuyeux : commence par un serveur de modèles existant avant d'inventer une architecture de plateforme. Si j'ai besoin d'un endpoint GPU avec bon débit et surface HTTP façon OpenAI, je choisis d'abord [vLLM server](https://docs.vllm.ai/en/latest/serving/online_serving.html). Si j'ai besoin d'un service local pour des machines de dev ou un petit outil interne, je prends [Ollama API](https://docs.ollama.com/openai). Si je veux un runtime léger autour de modèles GGUF, [llama.cpp](https://github.com/ggml-org/llama.cpp) reste un pari très pratique.

Ce choix ne règle pourtant que le premier problème : obtenir une réponse HTTP. Le piège suivant, c'est de faire comme si un modèle chargé équivalait à un service sain. Les [Kubernetes probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) existent précisément parce qu'un process peut être vivant tout en étant une très mauvaise cible pour le trafic. Je borne aussi très tôt la taille des prompts et des sorties, parce que des valeurs par défaut trop généreuses sont le moyen le plus rapide d'acheter de mauvaises surprises sur la facture GPU et une latence de fin de file pénible.

J'évite aussi de coupler trop tôt le serving et la logique applicative. Une fine couche autour d'un serveur existant suffit généralement pour la première version, et les serveurs qui suivent la [Models API](https://platform.openai.com/docs/api-reference/models/list) me permettent de commencer par un health check peu coûteux avant d'ajouter une vraie sonde de génération. C'est beaucoup moins sexy que de construire d'entrée de jeu un gateway custom, un routeur, un registre de prompts et une couche de failover multi-modèles, mais c'est la voie que je choisirais tant que le trafic ne me prouve pas le contraire.

Je commence en général par le plus petit check qui prouve que le process répond vite et que mon wrapper peut basculer sans drame.

```ts
const providers = [
  {
    name: 'primary',
    baseURL: 'http://vllm:8000/v1', // préfixe compatible OpenAI
    timeoutMs: 12_000, // plus serré que le timeout côté utilisateur
  },
  {
    name: 'fallback',
    baseURL: 'http://ollama:11434/v1',
    timeoutMs: 20_000, // on laisse un peu plus d'air au secours
  },
];

export async function pickHealthyProvider() {
  for (const provider of providers) {
    const response = await fetch(`${provider.baseURL}/models`, {
      signal: AbortSignal.timeout(provider.timeoutMs),
    });

    if (response.ok) return provider;
  }

  throw new Error('No healthy model provider available');
}
```

Ce pattern n'a rien de spectaculaire, mais il force les questions pénibles à entrer tôt dans le code : budget de timeout, sens exact du mot « healthy », et fallback réellement acceptable quand le primaire tombe. Juste après, j'ajoute des request IDs, des logs de latence, la consommation de tokens et la version exacte du modèle servi. Si je suis incapable de répondre à « quel modèle a servi cette requête lente ? » en une minute, je considère que mon serving n'est pas encore sous contrôle.

Ma règle de décision est assez brutale : avec un seul modèle et moins d'une dizaine de requêtes par seconde, garde une couche de serving ennuyeuse tant que tu ne vois pas une vraie douleur de queueing ou un problème de noisy neighbor en production. Je préfère investir ce temps dans de bonnes limites, de l'auth et de l'observabilité plutôt que dans des routeurs, des caches et une complexité multi-cluster dont je n'aurai peut-être jamais besoin.
