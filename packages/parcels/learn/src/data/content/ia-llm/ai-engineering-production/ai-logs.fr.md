---
id: ai-logs
order: 14
difficulty: intermediate
tags: [observability, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Ton agent explose à 02:00 et le seul indice dit "tool call returned null". C'est là que des logs applicatifs génériques ne suffisent plus pour un système IA.

Mon biais est simple : j'optimise les logs pour le deuxième incident, pas pour la première démo. La réponse finale est rarement la partie utile. Ce qu'il me faut, c'est l'enveloppe d'exécution autour : provider, modèle demandé, modèle réellement servi s'il a changé, tokens, latence, statut de réponse, chemin de retry ou de fallback, appels d'outils, et éventuel blocage par une politique de sécurité avant affichage côté utilisateur.

Je pars de [OpenTelemetry logs](https://opentelemetry.io/docs/concepts/signals/logs/) et je structure chaque enregistrement pour le corréler avec traces et métriques. Pour les champs spécifiques à l'IA, je m'alignerais sur les [GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) parce qu'elles donnent déjà un vocabulaire commun pour les providers, les modèles et les tokens. Si les noms de champs dérivent selon les services, l'alerte qui marchait la semaine dernière meurt en silence.

À la frontière du provider, j'aplatis chaque réponse en un log de tentative. L'[OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create) montre exactement les champs qui m'intéressent en production : `id`, `status`, `usage`, `error` et `incomplete_details`. Émets un événement par tentative, pas par requête utilisateur. C'est dans les retries, les fallbacks et les boucles d'outils que se cachent la latence et le coût.

Le piège dans lequel je suis déjà tombé, c'est de logger les prompts bruts partout. L'[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) remet bien l'église au milieu du village : il faut assez d'information pour enquêter, mais pas au prix d'arroser tous les sinks avec des données sensibles. Je garde un aperçu caviardé dans le chemin chaud, je stocke le prompt complet dans un stockage restreint, et je hash le prompt complet pour corréler les incidents sans copier les secrets dans les index de recherche.

Si tu veux une interface pour fouiller les traces, [Langfuse](https://langfuse.com/docs) est un bon complément. Je ne le laisserais quand même pas devenir la seule source de vérité. Les outils éditeur sont pratiques pour l'inspection ; la réponse à incident a encore besoin de logs normalisés que tu contrôles.

Avant le code, voici le raccourci que j'aurais aimé avoir plus tôt : calcule l'aperçu et le hash une seule fois, exactement là où tu normalises la réponse provider, pour que chaque retry et chaque fallback réutilise la même forme.

```typescript
import { createHash } from 'node:crypto';

type LlmAttemptLog = {
  traceId: string; // Corrèle les logs avec traces et spans.
  conversationId: string; // Identifiant de session ou de thread côté app.
  provider: string; // openai, anthropic, bedrock, etc.
  requestedModel: string; // Modèle demandé par ton code.
  actualModel?: string; // Modèle qui a réellement servi la réponse.
  latencyMs: number; // Latence bout en bout de la tentative.
  inputTokens?: number; // Tokens d'entrée reportés par le provider.
  outputTokens?: number; // Tokens de sortie reportés par le provider.
  responseStatus: string; // completed, incomplete, failed, etc.
  stopReason?: string | null; // Raison d'arrêt ou d'incomplétude côté provider.
  toolNames: string[]; // Outils touchés pendant cette tentative.
  usedFallback: boolean; // Vrai si un chemin de secours a pris le relais.
  safetyIntervention: boolean; // Vrai si une politique ou un filtre a modifié le résultat.
  responseId?: string; // Identifiant de réponse provider.
  errorCode?: string; // Pratique pour les 429 et autres erreurs provider.
  promptPreview: string; // Aperçu caviardé pour le triage rapide uniquement.
  promptHash: string; // SHA-256 du texte complet du prompt.
};

const redactPreview = (prompt: string, maxLength = 160) => prompt.replace(/\s+/g, ' ').slice(0, maxLength);

const hashPrompt = (prompt: string) => createHash('sha256').update(prompt).digest('hex');

export function buildLlmAttemptLog(
  input: Omit<LlmAttemptLog, 'promptPreview' | 'promptHash'> & { rawPrompt: string }
): LlmAttemptLog {
  const promptPreview = redactPreview(input.rawPrompt);

  return {
    ...input,
    promptPreview,
    promptHash: hashPrompt(input.rawPrompt),
  };
}
```

Ma règle est volontairement exigeante : si un log de tentative ne peut pas te dire quel modèle a tourné, s'il y a eu retry ou fallback, combien ça a coûté, et si tu as protégé correctement les entrées sensibles, alors tu débugues encore à l'aveugle.
