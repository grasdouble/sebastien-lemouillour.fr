---
id: llm-production
order: 6
difficulty: advanced
tags: [IA, LLM, production, security, observability]
---

## Observability

En production, un appel LLM est une surface de latence, de coût et de fiabilité. Il faut journaliser toute l'enveloppe d'exécution : prompt input, modèle, tokens d'entrée/sortie, latence, coût, `finish_reason`, retries, provider, request ID, et présence éventuelle d'outils ou de retrieval. Pour des charges sensibles, gardez le prompt brut dans un stockage plus restreint et n'envoyez dans les logs généraux qu'un aperçu redacted plus un hash stable.

Le middleware ci-dessous représente le minimum viable : un événement structuré en succès, un autre en échec, tous deux corrélés aux traces applicatives. LangSmith et Helicone accélèrent l'inspection LLM ; OpenTelemetry garde ces signaux dans votre pipeline d'observabilité global.

```typescript
import { createHash } from 'node:crypto';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type LlmResponse = {
  id: string;
  model: string;
  outputText: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: string;
  raw: unknown;
};

type ProviderCall = (messages: ChatMessage[]) => Promise<LlmResponse>;
type Logger = (event: Record<string, unknown>) => void;

const pricingUsdPer1kTokens: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'claude-3-5-haiku-latest': { input: 0.0008, output: 0.004 },
};

const estimateCostUsd = (model: string, usage: LlmResponse['usage']) => {
  const pricing = pricingUsdPer1kTokens[model];
  if (!pricing) return null;

  return Number(((usage.inputTokens / 1000) * pricing.input + (usage.outputTokens / 1000) * pricing.output).toFixed(6));
};

const promptFingerprint = (messages: ChatMessage[]) =>
  createHash('sha256').update(JSON.stringify(messages)).digest('hex');

const promptPreview = (messages: ChatMessage[]) =>
  messages.map(({ role, content }) => `${role}: ${content.slice(0, 300)}`).join('\n');

export const withObservability = (
  provider: string,
  model: string,
  call: ProviderCall,
  logger: Logger
): ProviderCall => {
  return async (messages) => {
    const startedAt = Date.now();

    try {
      const response = await call(messages);
      const latencyMs = Date.now() - startedAt;

      logger({
        type: 'llm_call',
        status: 'success',
        provider,
        model,
        prompt_input: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        tokens_input: response.usage.inputTokens,
        tokens_output: response.usage.outputTokens,
        latency_ms: latencyMs,
        cost_usd: estimateCostUsd(model, response.usage),
        finish_reason: response.finishReason,
        response_id: response.id,
      });

      return response;
    } catch (error) {
      logger({
        type: 'llm_call',
        status: 'error',
        provider,
        model,
        prompt_input: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        latency_ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
};
```

## Security: prompt injection

La prompt injection est une attaque sur la couche d'instructions : un input utilisateur, ou une donnée récupérée par le modèle, tente de modifier le comportement attendu. La direct injection est explicite ; l'indirect injection est plus insidieuse, car elle arrive via une page web, un PDF ou un chunk RAG. Le contenu récupéré doit donc être traité comme une donnée non fiable, jamais comme une politique d'exécution.

La défense principale est la séparation. Isolez les instructions system et developer du contenu utilisateur, validez les inputs avant qu'ils atteignent les outils, et sandboxez les outils d'agents avec allowlists, credentials éphémères et restrictions réseau. N'exposez jamais les system prompts, ne placez jamais de secrets dans les prompts et ajoutez une validation de sortie pour les actions sensibles. Il faut supposer qu'une partie des injections passera et limiter le blast radius.

## Cost optimization

À l'échelle, le coût ne baisse presque jamais en ne réduisant qu'un prompt. Commencez par le caching : le semantic caching réutilise des réponses pour des questions équivalentes, même si beaucoup d'équipes démarrent avec un cache exact-match ou un prompt normalisé avant d'ajouter des embeddings. Ensuite, compressez les prompts : retirez les consignes dupliquées, résumez l'historique et n'injectez que les passages de retrieval réellement pertinents.

Le model routing est souvent le levier principal. Envoyez classification, extraction et guardrails vers des petits modèles ; gardez les modèles premium pour la synthèse ou le raisonnement difficile. Batcher les traitements offline quand la latence le permet et plafonnez `max_tokens`.

L'exemple ci-dessous montre un cache exact-match basé sur un hash du prompt. Il est volontairement simple, mais sûr pour la production et utile avant un semantic cache.

```typescript
import { createHash } from 'node:crypto';

type Resolver<T> = () => Promise<T>;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const completionCache = new Map<string, CacheEntry<string>>();

const normalizePrompt = (prompt: string) => prompt.trim().replace(/\s+/g, ' ');

const hashPrompt = (model: string, prompt: string) =>
  createHash('sha256')
    .update(`${model}:${normalizePrompt(prompt)}`)
    .digest('hex');

export async function cachedCompletion(
  model: string,
  prompt: string,
  ttlMs: number,
  resolver: Resolver<string>
): Promise<string> {
  const key = hashPrompt(model, prompt);
  const cached = completionCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await resolver();

  completionCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  return value;
}
```

## Resilience and multi-provider

Une architecture mono-provider introduit un single point of failure caché : outage, quota saturé, dégradation régionale ou changement de politique peuvent faire tomber le produit. Il faut séparer une interface agnostique du provider de ses adaptateurs spécifiques, puis définir explicitement la politique de fallback : timeout agressif, un retry sur erreur transitoire, puis bascule d'OpenAI vers Anthropic. Les circuit breakers évitent qu'une tempête de retries détruise vos SLOs de latence.

Le fallback n'est pas gratuit. Les providers diffèrent sur le mode JSON, le tool calling, les limites de contexte et les safety filters ; normalisez donc uniquement les capacités réellement nécessaires. Gardez des prompts portables, maintenez des golden test cases multi-provider et mesurez la dérive de qualité pendant le failover.

```typescript
type ProviderResult = {
  provider: string;
  text: string;
  finishReason: string;
};

type Provider = {
  name: string;
  generate: (prompt: string, signal: AbortSignal) => Promise<ProviderResult>;
};

async function withTimeout<T>(timeoutMs: number, operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateWithFallback(
  prompt: string,
  providers: Provider[],
  timeoutMs = 2500,
  retries = 1
): Promise<ProviderResult> {
  const errors: string[] = [];

  for (const provider of providers) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await withTimeout(timeoutMs, (signal) => provider.generate(prompt, signal));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${provider.name} attempt ${attempt + 1}: ${message}`);
      }
    }
  }

  throw new Error(`All providers failed: ${errors.join(' | ')}`);
}
```

## Model selection framework

Choisissez les modèles avec une matrice de décision explicite, pas par fidélité de marque. Pour un parcours inférieur à 500 ms, privilégiez des classes rapides comme Claude Haiku ou GPT-4o mini. Pour de la synthèse visible par le client ou de l'analyse à fort enjeu, payez pour GPT-4o ou Claude Sonnet et compensez la latence avec du caching et une UX asynchrone. Si vous devez rester sous $0.01 par requête, les petits modèles avec routing et plafonds de sortie deviennent la base. Pour des données sensibles ou régulées, un serving on-premise avec Ollama ou vLLM peut être préférable aux APIs publiques malgré le coût opérationnel.

| Contrainte           | Recommandation par défaut | Pourquoi                                                                 | Tradeoff principal                             |
| -------------------- | ------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| Latence < 500 ms     | Haiku / GPT-4o mini       | Meilleure probabilité de tenir un budget UX interactif                   | Raisonnement moins profond                     |
| Qualité maximale     | GPT-4o / Claude Sonnet    | Meilleure synthèse, meilleur tool use, meilleure fiabilité long contexte | Coût et latence plus élevés                    |
| Coût < $0.01/requête | Small models              | Passe mieux à l'échelle sous forte charge                                | Plus de travail de routing et de QA            |
| Données sensibles    | Ollama / vLLM on-premise  | Meilleur contrôle des données et de la résidence                         | Vous portez l'uptime, le coût GPU et le tuning |

Le choix d'un provider doit aussi intégrer les SLAs, la disponibilité régionale, le comportement des quotas et les résultats d'évaluation sur votre domaine. En production, le meilleur modèle est celui qui respecte simultanément votre error budget, votre frontière de confidentialité et votre économie unitaire.
