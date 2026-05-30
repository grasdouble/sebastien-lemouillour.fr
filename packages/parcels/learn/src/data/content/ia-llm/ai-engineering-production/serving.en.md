---
id: serving
order: 11
difficulty: intermediate
tags: [LLM, serving, vLLM, Ollama, deployment]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The demo works from your laptop, then production asks boring questions that the demo never had to answer: how do we restart safely, limit abuse, roll out a new model version, and keep latency stable when traffic spikes? That gap is serving, and it is where many good model experiments quietly die.

My bias here is simple: start with a boring model server before you invent platform architecture. If you need high-throughput GPU endpoints with OpenAI-compatible APIs, [vLLM](https://docs.vllm.ai/) gets you far very quickly. If you need a local service for developer machines or small internal tools, [Ollama](https://ollama.com/) is hard to beat on convenience. And if you want a lightweight runtime that also works well with GGUF-based deployments, [llama.cpp](https://github.com/ggerganov/llama.cpp) stays relevant for a reason.

What most tutorials skip is that serving is not only about loading weights. It is about queueing, timeouts, health probes, auth, structured logs, version pinning, and sane defaults for context and max tokens. If you leave those decisions implicit, your “AI endpoint” turns into a slow mystery box that nobody wants to be on call for.

I also try very hard not to couple serving and application logic too early. A thin wrapper around an existing model server is usually enough for the first version. The temptation to build a custom gateway, router, prompt registry, and multi-model failover layer on day one is strong. Most teams would be better served by metrics first, architecture later.

A tiny client abstraction already buys a lot of safety.

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

That pattern is not glamorous, but it forces you to think about health and failure before users do. Add request IDs, latency logs, token usage, and model version tags next. Once you have those, scaling decisions stop being philosophical and start being measurable.

My threshold is blunt: if you have one model and fewer than roughly ten requests per second, keep serving architecture boring. Use an off-the-shelf server, put a thin API in front of it, and wait for real queueing pain before you build routers, caches, and multi-cluster cleverness.
