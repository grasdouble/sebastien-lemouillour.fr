---
id: serving
order: 11
difficulty: intermediate
tags: [LLM, serving, vLLM, Ollama, deployment]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La démo marche sur votre laptop, puis la production pose des questions très terre-à-terre auxquelles la démo n'avait jamais à répondre : comment redémarrer proprement, limiter les abus, déployer une nouvelle version du modèle, et garder une latence stable quand le trafic monte ? Cet écart, c'est le serving, et c'est là que beaucoup de bonnes expérimentations IA meurent en silence.

Mon biais est simple : commencez par un serveur de modèles ennuyeux avant d'inventer une architecture de plateforme. Si vous avez besoin d'endpoints GPU avec débit et API compatible OpenAI, [vLLM](https://docs.vllm.ai/) va déjà très loin très vite. Si vous voulez un service local pour les machines de dev ou de petits outils internes, [Ollama](https://ollama.com/) est difficile à battre en confort. Et si vous cherchez un runtime léger qui colle bien aux déploiements basés sur GGUF, [llama.cpp](https://github.com/ggerganov/llama.cpp) reste pertinent pour de bonnes raisons.

Le point que la plupart des tutos sautent, c'est que le serving ne consiste pas seulement à charger des poids. Il faut aussi gérer les files d'attente, les timeouts, les health checks, l'auth, les logs structurés, le versioning, et des limites par défaut raisonnables pour le contexte et les max tokens. Si vous laissez tout ça implicite, votre « endpoint IA » devient une boîte noire lente dont personne ne veut assurer l'astreinte.

J'essaie aussi de ne pas coupler trop tôt le serving et la logique applicative. Une fine couche autour d'un serveur existant suffit généralement pour la première version. La tentation de construire dès le départ un gateway custom, un routeur, un registre de prompts et une couche de failover multi-modèles est forte. La plupart des équipes gagneraient à commencer par les métriques, puis seulement après par l'architecture sophistiquée.

Une petite abstraction côté client apporte déjà beaucoup de sécurité.

```ts
const providers = [
  { name: 'primary', baseURL: 'http://vllm:8000/v1', timeoutMs: 12_000 },
  { name: 'fallback', baseURL: 'http://ollama:11434/v1', timeoutMs: 20_000 },
];

export async function pickHealthyProvider() {
  for (const provider of providers) {
    const response = await fetch(`${provider.baseURL}/models`, { signal: AbortSignal.timeout(provider.timeoutMs) });

    if (response.ok) return provider;
  }

  throw new Error('No healthy model provider available');
}
```

Ce pattern n'a rien de spectaculaire, mais il vous oblige à penser à la santé du service et aux pannes avant que les utilisateurs le fassent à votre place. Ajoutez ensuite des request IDs, des logs de latence, la consommation de tokens, et le tag de version du modèle. À partir de là, les décisions de scaling cessent d'être philosophiques et deviennent mesurables.

Mon seuil est assez brutal : si vous n'avez qu'un modèle et moins d'une dizaine de requêtes par seconde, gardez un serving ennuyeux. Prenez un serveur existant, mettez une fine API devant, et attendez une vraie douleur de queueing avant de construire des routeurs, des caches et de la complexité multi-cluster.
