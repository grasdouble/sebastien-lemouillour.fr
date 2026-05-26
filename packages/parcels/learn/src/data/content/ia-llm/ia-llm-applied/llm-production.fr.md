---
id: llm-production
order: 4
difficulty: advanced
tags: [IA, LLM, production, security, observability]
---

Votre MVP fonctionne. Plutôt bien, en fait : vous l'avez montré à l'équipe, l'ambiance est bonne, et maintenant il faut passer en production. C'est là que vous découvrez qu'un appel LLM n'est pas juste un appel de fonction. C'est un point de concentration de latences qui piquent, de coûts imprévisibles, de surface d'attaque sécuritaire, et d'échecs silencieux qui ne lancent pas d'exceptions. Le code qui marchait impeccablement sur votre laptop demande maintenant un niveau de soin radicalement différent.

## Observabilité

Le premier incident en production avec un LLM suit souvent le même schéma : quelque chose ne va pas, vous ne savez pas si c'est le modèle, le prompt, l'infrastructure ou votre code, et vous n'avez aucun log qui vous le dirait. C'est là que vous réalisez que vous pilotiez à l'aveugle.

Il faut loguer l'enveloppe d'exécution complète, pas seulement « la réponse ». Ce qui aide vraiment en incident : quel prompt a été envoyé, à quel provider, avec quel modèle, combien de tokens sont entrés et sortis, combien de temps l'appel a pris, combien il a coûté, comment il s'est terminé (`finish_reason`), s'il y a eu des retries, quel request ID est revenu, et si des outils ou du retrieval étaient impliqués. Pour des payloads sensibles, gardez le prompt brut dans un stockage restreint et n'envoyez dans les logs généraux qu'un aperçu redacté plus un hash stable.

Le middleware ci-dessous est le point de départ minimum viable : un événement structuré en succès, un autre en échec, tous deux corrélés aux traces applicatives.

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

De là, LangSmith et Helicone offrent une inspection plus native au monde LLM. OpenTelemetry garde tout dans votre pipeline existant. La marque de l'outil compte moins que d'avoir suffisamment de preuves pour expliquer ce qui s'est passé (après coup, sans avoir à rejouer la scène).

## Sécurité : prompt injection

La prompt injection est le vecteur d'attaque qui surprend presque toutes les équipes la première fois. Ce n'est pas un buffer overflow ni un contournement d'auth : c'est une manipulation de la couche d'instructions. Un utilisateur colle du texte piégé, un PDF partenaire contient une instruction cachée, un chunk RAG récupéré depuis une page web dit au modèle d'ignorer la politique système et d'exfiltrer des données. Le modèle, n'ayant aucun moyen de distinguer « instructions du développeur » de « instructions embarquées dans du contenu récupéré », peut s'exécuter.

La direct injection est évidente une fois qu'on sait la chercher. L'indirect injection (qui arrive via des données externes que votre système va chercher et injecte dans le prompt) est plus pernicieuse. La défense principale est la séparation : traitez le contenu récupéré comme une donnée non fiable, jamais comme une politique d'exécution. Gardez les instructions système structurellement distinctes du contenu utilisateur. Validez les inputs avant qu'ils atteignent les outils. Sandboxez les outils d'agents avec des allowlists, des credentials éphémères et des restrictions réseau. Et supposez que certaines injections passeront. Concevez pour un blast radius limité quand elles passent, pas pour une prévention parfaite.

## Optimisation des coûts

La facture semble raisonnable pendant le développement. Puis le trafic augmente, et ce qui paraissait peu cher à l'échelle du prototype se compose en une vraie dépense. Le problème est rarement un seul prompt gonflé : c'est généralement une accumulation : des historiques de conversation qui grandissent sans limite, un retrieval trop généreux, le mauvais modèle pour la tâche, aucun cache.

Commencez par le cache. Un cache exact-match sur des prompts normalisés est peu coûteux à implémenter et élimine les appels redondants sur les questions fréquentes. Le semantic caching réutilise des réponses pour des questions équivalentes même formulées différemment, mais nécessite des embeddings : c'est une deuxième étape, pas la première.

Ensuite, attaquez les leviers structurels : retirez les consignes dupliquées, résumez l'historique au lieu de l'accumuler indéfiniment, routez classification et extraction vers des petits modèles et réservez les coûteux pour la synthèse ou le raisonnement difficile, batchez le travail offline quand la latence le permet, et plafonnez `max_tokens` pour que le modèle ne rembourre pas silencieusement chaque réponse.

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

Les architectures mono-provider ont une propriété cachée : elles fonctionnent très bien jusqu'au jour où elles ne fonctionnent plus. Une indisponibilité, un quota saturé, une dégradation régionale, un changement de politique : n'importe lequel de ces événements peut faire tomber une fonctionnalité LLM-dépendante sans prévenir. La solution est de construire une interface agnostique du provider par-dessus vos adaptateurs réels, puis de définir explicitement la politique de fallback plutôt que de la découvrir pendant un incident.

Ma politique préférée : timeout agressif (2–3 secondes), un retry sur les erreurs transitoires, puis bascule vers un provider secondaire. Les circuit breakers empêchent les tempêtes de retries de transformer le problème d'un provider en problème de vos SLOs.

Le fallback n'est pas gratuit. Les providers diffèrent sur le mode JSON, le tool calling, les limites de contexte et les safety filters. Ne normalisez pas tout : normalisez uniquement les capacités dont vous avez réellement besoin. Gardez des prompts portables, maintenez des golden test cases qui tournent sur les deux providers, et mesurez la dérive de qualité pendant le failover plutôt que d'assumer que les sorties seront équivalentes.

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

## Sélection du modèle

Le choix du modèle est une décision d'ingénierie, pas une préférence de marque. Le bon modèle pour une tâche est celui qui satisfait votre budget de contraintes (latence, qualité, coût, résidence des données), pas le plus impressionnant sur un benchmark. Je choisirais le modèle le moins cher qui peut faire le travail de façon fiable, et je monterais en gamme uniquement quand j'ai des preuves que la qualité est le goulot d'étranglement.

| Contrainte           | Recommandation par défaut | Pourquoi                                                                 | Tradeoff principal                             |
| -------------------- | ------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| Latence < 500 ms     | Haiku / GPT-4o mini       | Meilleure probabilité de tenir un budget UX interactif                   | Raisonnement moins profond                     |
| Qualité maximale     | GPT-4o / Claude Sonnet    | Meilleure synthèse, meilleur tool use, meilleure fiabilité long contexte | Coût et latence plus élevés                    |
| Coût < $0.01/requête | Small models              | Passe mieux à l'échelle sous forte charge                                | Plus de travail de routing et de QA            |
| Données sensibles    | Ollama / vLLM on-premise  | Meilleur contrôle des données et de la résidence                         | Vous portez l'uptime, le coût GPU et le tuning |

Au-delà de la matrice : tenez compte des SLAs, de la disponibilité régionale, du comportement des quotas, des résultats d'evals sur votre domaine réel, et des clauses contractuelles sur la rétention et l'entraînement des données. Le « meilleur » modèle en production est celui qui satisfait simultanément votre error budget, votre frontière de confidentialité et votre économie unitaire, pas celui qui impressionne le plus en démo.
