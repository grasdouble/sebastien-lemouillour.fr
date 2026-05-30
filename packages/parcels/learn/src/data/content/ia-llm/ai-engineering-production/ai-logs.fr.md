---
id: ai-logs
order: 14
difficulty: intermediate
tags: [LLM, observability, logs, OpenTelemetry]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton agent échoue en production. Le log dit "tool call returned null". Voilà toute ta surface de debug. Tous les guides d'observabilité parlent des logs, presque aucun n'explique ce qu'il faut loguer pour un système LLM.

Ma position est assez sèche : la réponse finale est rarement la partie utile du log. Ce qu'il faut, c'est l'enveloppe d'exécution autour. Je veux savoir quel provider a répondu, quelle version du modèle a tourné, combien de tokens ont été consommés, quelle a été la raison d'arrêt, s'il y a eu un fallback, quels outils ont été tentés, et si la couche de sécurité est intervenue avant même que l'utilisateur ne voie le résultat.

La base saine, c'est [OpenTelemetry logs](https://opentelemetry.io/docs/concepts/signals/logs/), parce qu'une fois les champs structurés tu peux corréler les logs avec les traces et les métriques au lieu de greper des chaînes bancales. Ensuite, j'applique l'esprit des [conventions sémantiques](https://opentelemetry.io/docs/specs/semconv/), même pour les champs maison : noms stables, unités stables, identifiants stables. Si les noms changent tout le temps, tes dashboards et tes alertes racontent n'importe quoi.

Pour les réponses provider, je normalise le payload à la frontière de l'adaptateur. Le [response object](https://platform.openai.com/docs/api-reference/responses/object) d'OpenAI rappelle bien ce qui compte en opérationnel : response ID, usage, état de fin, et identifiants de requête. Fais ce travail une seule fois, puis émet un événement par tentative. Pas un événement par requête, un événement par tentative. C'est dans les retries et les fallbacks que la latence et le coût caché s'accumulent.

Les prompts bruts sont le piège classique. Les loguer partout semble pratique jusqu'au jour où un client colle des données sensibles. Mon choix par défaut est simple : un aperçu redacté pour le triage rapide, le payload complet dans un stockage restreint, et un hash stable pour corréler les événements sans disperser les secrets partout.

Si tu veux une interface pensée pour ce workflow, [Langfuse](https://langfuse.com/docs) fait bien le job. Je n'en ferais quand même pas ma seule source de vérité. Les dashboards éditeur sont excellents pour l'inspection. La réponse à incident, elle, a besoin de logs applicatifs normalisés que tu contrôles.

Voici la forme minimale que j'attends avant d'appeler ça de vrais logs IA.

```typescript
import { createHash } from 'node:crypto';

type LlmAttemptLog = {
  traceId: string;
  conversationId: string;
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  stopReason?: string | null;
  toolNames: string[];
  usedFallback: boolean;
  responseId?: string;
  promptPreview: string;
  promptHash: string;
};

const hashPrompt = (prompt: string) => createHash('sha256').update(prompt).digest('hex');

export function buildLlmAttemptLog(input: Omit<LlmAttemptLog, 'promptHash'>): LlmAttemptLog {
  return {
    ...input,
    promptHash: hashPrompt(input.promptPreview),
  };
}
```

Ma règle est volontairement sévère : si une seule ligne de log ne peut pas te dire quel modèle a tourné, combien il a coûté, pourquoi il s'est arrêté et quel chemin outillé il a emprunté, alors tu n'as pas encore de logs de production.
