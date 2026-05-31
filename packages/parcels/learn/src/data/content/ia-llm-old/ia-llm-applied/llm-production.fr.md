---
id: llm-production
order: 4
difficulty: advanced
tags: [security, observability, llm]
publishedAt: 2026-05-30
updatedAt: 2026-05-30
---

Votre MVP marche. Puis les vrais utilisateurs arrivent, la latence grimpe, la facture cesse d'être mignonne, et une panne silencieuse du modèle vous brûle une demi-journée d'incident. Un appel LLM en production n'est pas un appel de fonction. C'est un domaine de panne avec des conséquences de coût, de sécurité et de SLO.

## Observabilité

Le premier incident de prod avec un LLM a toujours la même odeur : quelque chose casse, et vous êtes incapable de dire si le problème vient du modèle, du prompt, du réseau, de la couche outils ou de votre adaptateur. Voilà ce que signifie piloter à l'aveugle.

Loguez l'enveloppe d'exécution complète, pas seulement le texte produit. En incident, ce qui compte est le [response object](https://developers.openai.com/api/docs/api-reference/chat/object) ou son équivalent une fois normalisé : provider, modèle, usage de tokens, latence, response ID, request ID, raison d'arrêt, retries, et présence éventuelle d'outils ou de retrieval. Pour les payloads sensibles, gardez les prompts bruts dans un stockage restreint et n'envoyez dans les logs généraux qu'un aperçu redacté plus un hash stable. Corrélez tout ça avec [OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/traces/), sinon vous continuez à deviner.

Normalisez ça une fois à la frontière de l'adaptateur, puis émettez un événement de succès et un événement d'échec.

```typescript
import { createHash } from 'node:crypto';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type NormalizedLlmResponse = {
  responseId: string;
  model: string;
  outputText: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string | null;
  requestId?: string;
};

type Pricing = {
  inputUsdPer1kTokens: number;
  outputUsdPer1kTokens: number;
};

type ProviderCall = (messages: ChatMessage[]) => Promise<NormalizedLlmResponse>;
type Logger = (event: Record<string, unknown>) => void;

const estimateCostUsd = (pricing: Pricing, usage: NormalizedLlmResponse['usage']) => {
  return Number(
    (
      (usage.inputTokens / 1000) * pricing.inputUsdPer1kTokens +
      (usage.outputTokens / 1000) * pricing.outputUsdPer1kTokens
    ).toFixed(6)
  );
};

const promptFingerprint = (messages: ChatMessage[]) =>
  createHash('sha256').update(JSON.stringify(messages)).digest('hex');

const promptPreview = (messages: ChatMessage[]) =>
  messages.map(({ role, content }) => `${role}: ${content.slice(0, 300)}`).join('\n');

export const withObservability = (
  provider: string,
  model: string,
  pricing: Pricing,
  call: ProviderCall,
  logger: Logger
): ProviderCall => {
  return async (messages) => {
    const startedAt = Date.now();

    try {
      const response = await call(messages);

      logger({
        type: 'llm_call',
        status: 'success',
        provider,
        model,
        prompt_preview: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        tokens_input: response.usage.inputTokens,
        tokens_output: response.usage.outputTokens,
        latency_ms: Date.now() - startedAt,
        cost_usd: estimateCostUsd(pricing, response.usage),
        stop_reason: response.stopReason,
        response_id: response.responseId,
        request_id: response.requestId,
      });

      return response;
    } catch (error) {
      logger({
        type: 'llm_call',
        status: 'error',
        provider,
        model,
        prompt_preview: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        latency_ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
};
```

LangSmith ou Helicone peuvent se greffer par-dessus si vous voulez une inspection plus native au monde LLM. La marque de l'outil compte moins que le niveau de preuve disponible pour expliquer la panne sans rejouer du trafic de prod.

## Sécurité : prompt injection

La prompt injection reste le piège que la plupart des équipes sous-estiment. Ce n'est pas un exploit de parseur classique. C'est un exploit de la couche d'instructions, et [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) est très clair sur le point sale : la direct injection n'est que la moitié du problème. L'indirect injection arrive via les documents, pages web, tickets ou emails que votre système récupère puis injecte dans le contexte.

Le bon réflexe par défaut, c'est la séparation. Traitez le contenu récupéré comme une donnée non fiable, jamais comme une politique. Gardez les instructions système structurellement distinctes du contenu utilisateur et du contenu récupéré. Validez les inputs avant qu'ils atteignent les outils. Sandboxez les outils avec des allowlists, des credentials éphémères et des permissions réseau étroites. Supposez malgré tout que certaines injections passeront. Le design de prod concerne le blast radius, pas la pureté.

## Optimisation des coûts

La facture paraît inoffensive pendant le développement. Puis le trafic monte, l'historique de conversation continue de grossir, le retrieval devient bruyant, et une feature qui semblait peu chère à l'échelle du prototype se transforme en fuite de marge.

Le [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) côté provider fait gagner de l'argent sur les préfixes répétés, mais ce n'est pas un substitut à votre propre cache. Les caches provider sont sensibles au préfixe et spécifiques à chaque provider. Commencez par un cache applicatif sur des prompts normalisés. Ensuite, résumez l'historique au lieu de l'empiler pour toujours, routez classification et extraction vers des modèles plus petits, réservez le raisonnement coûteux aux appels qui en ont besoin, batcher le travail offline quand la latence le permet, et plafonnez explicitement le budget de tokens en sortie.

Construisez ça d'abord, puis décidez si le semantic caching mérite vraiment sa complexité opérationnelle.

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

## Résilience et multi-provider

Les architectures mono-provider ont l'air solides jusqu'au quota saturé, à la dégradation régionale ou au changement de politique qui coupe un chemin de revenu. Si la feature compte, écrivez la politique de fallback avant que l'incident ne l'écrive à votre place.

Mon réglage par défaut pour un flux interactif est brutal : timeout de 2 à 3 secondes, un retry sur erreur transitoire, puis failover. Les jobs batch peuvent attendre plus longtemps. Les parcours user-facing ne le devraient généralement pas. Les circuit breakers comptent parce que les tempêtes de retries sont la façon la plus simple de transformer une panne provider en panne chez vous.

Écrivez cette politique dans le code pour que l'astreinte n'improvise pas à 3 heures du matin.

```typescript
type ProviderResult = {
  provider: string;
  text: string;
  stopReason: string | null;
};

type Provider = {
  name: string;
  generate: (prompt: string, signal: AbortSignal) => Promise<ProviderResult>;
};

type ProviderError = Error & {
  status?: number;
  code?: string;
};

const isTransientError = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  const providerError = error as ProviderError;

  return (
    error.name === 'AbortError' ||
    providerError.status === 429 ||
    (typeof providerError.status === 'number' && providerError.status >= 500)
  );
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

        if (!isTransientError(error) || attempt === retries) {
          break;
        }
      }
    }
  }

  throw new Error(`All providers failed: ${errors.join(' | ')}`);
}
```

Le fallback n'est pas gratuit. Les providers diffèrent sur le tool calling, les garanties de sortie structurée, les limites de contexte et le comportement des filtres de sécurité. Ne normalisez pas tout. Normalisez seulement les capacités dont vous avez réellement besoin, gardez des prompts portables, exécutez les mêmes golden cases sur les deux providers, et mesurez la dérive de qualité pendant le failover au lieu de supposer l'équivalence.

## Sélection du modèle

Le choix du modèle est une décision d'ingénierie, pas une préférence de marque. Je commencerais par le modèle le moins cher qui passe les evals sur la tâche, puis je ne monterais en gamme que si la qualité est prouvée comme goulot d'étranglement.

| Contrainte                   | Recommandation par défaut                                                                            | Pourquoi                                     | Tradeoff principal                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Latence < 500 ms             | Plus petit modèle qui passe les evals                                                                | Meilleure chance de protéger le budget UX    | Moins de marge sur le raisonnement           |
| Qualité maximale             | Modèle flagship                                                                                      | Meilleure synthèse et meilleure fiabilité    | Coût et latence plus élevés                  |
| Pression sur les coûts       | Routing par paliers                                                                                  | Rend les appels chers rares                  | Plus de logique de routing et de QA          |
| Frontière de données stricte | Stack self-hosted avec [Ollama](https://docs.ollama.com/) ou [vLLM](https://docs.vllm.ai/en/stable/) | Garde l'inférence dans votre périmètre infra | Vous portez l'uptime, les GPU et la capacité |

Tenez compte des SLAs, de la disponibilité régionale, du comportement des quotas, des evals sur votre domaine et des clauses contractuelles de rétention des données. Ma règle est simple : si la feature ne tient pas ses cibles de latence, de qualité et de coût unitaire avec un chemin de fallback documenté, elle n'est pas prête pour la production.
