---
id: llm-api-patterns
order: 1
difficulty: intermediate
tags: [llm]
publishedAt: 2026-05-12
updatedAt: 2026-05-30
---

La démo vous ment. Un prompt, une réponse, tout le monde est content. Puis le vrai trafic arrive : les utilisateurs fixent un écran vide, un 429 tombe au milieu d'un parcours critique, une pièce jointe géante explose le budget tokens, et la facture mensuelle devient soudain le problème de quelqu'un.

Si vous démarrez aujourd'hui, je partirais sur la [Responses API](https://developers.openai.com/api/reference/responses/overview) au lieu de lancer une nouvelle intégration sur des formats plus anciens. Une seule interface pour la génération de texte, les appels d'outils et les données d'usage, c'est déjà assez de choses en moins à surveiller.

## Afficher le premier token

Le premier bug UX, c'est le silence. Si le modèle met quelques secondes, les gens pensent que le bouton a raté. OpenAI documente le streaming HTTP dans le [guide streaming](https://developers.openai.com/api/docs/guides/streaming-responses), mais le raccourci opérationnel est plus simple : streamez depuis votre serveur, jamais depuis un navigateur avec une clé provider brute.

Réutilisez ce client dans les snippets suivants.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

async function streamAnswer(prompt: string): Promise<string> {
  const stream = await client.responses.create({
    model: 'gpt-5-mini', // défaut peu cher pour une UX conversationnelle
    input: prompt, // même format réutilisable pour les logs et les tests
    stream: true, // émet des événements au lieu d'attendre la réponse complète
  });

  let fullText = '';

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') {
      process.stdout.write(event.delta);
      fullText += event.delta;
    }

    if (event.type === 'error') {
      throw new Error(event.error?.message ?? 'Streaming failed');
    }
  }

  return fullText;
}

await streamAnswer('Explain SSE streaming for LLM APIs in 3 bullet points.');
```

J'active le streaming sur toute route où un utilisateur attend. L'animation façon machine à écrire est optionnelle ; le progrès visible ne l'est pas.

## Ne retry que les bons échecs

Une fois l'UX vivante, le piège suivant consiste à faire comme si chaque échec était temporaire. OpenAI publie à la fois les [rate limits](https://developers.openai.com/api/docs/guides/rate-limits) et les principaux [error codes](https://developers.openai.com/api/docs/guides/error-codes). Ma règle est volontairement banale : retry sur les timeouts, les 429 et les 5xx ; échec immédiat sur les 400, 401 et 403.

Avant de brancher ça dans une route, rendez la politique explicite.

```typescript
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetriableStatus(status?: number): boolean {
  return status === 429 || (status !== undefined && status >= 500);
}

function backoffMs(attempt: number): number {
  const base = 500 * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

async function createAnswer(prompt: string): Promise<string> {
  const maxRetries = 4;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await client.responses.create({
        model: 'gpt-5-mini',
        input: prompt,
        max_output_tokens: 300, // garde chaque retry sous contrôle
      });

      return response.output_text;
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: number }).status)
          : undefined;

      if (attempt < maxRetries && isRetriableStatus(status)) {
        await sleep(backoffMs(attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Retries exhausted');
}

console.log(await createAnswer('Summarize HTTP caching in 5 lines.'));
```

Si une requête échoue parce que le prompt est trop gros, les retries sont du théâtre. Réduisez le payload, résumez l'ancien contexte, ou routez le job vers un modèle avec une fenêtre plus large.

## Mettre les budgets dans le code, pas dans un tableur

Le problème suivant, c'est la dérive des coûts. Compter les caractères et faire confiance à son intuition devient mauvais dès que des outils, des images ou un long historique entrent dans la requête. Pour un comptage exact avant envoi, utilisez [Token counting](https://developers.openai.com/api/docs/guides/token-counting). Pour les tarifs actuels par token, regardez la page de pricing du provider et gardez les chiffres dans la config, pas dans le handler. Je garde ces limites dans le code pour qu'un chemin critique ne puisse pas coûter plus cher en silence.

Utilisez exactement le même payload pour compter puis générer, sinon votre estimation raconte n'importe quoi.

```typescript
type RouteBudget = {
  maxInputTokens: number;
  maxOutputTokens: number;
};

const summaryBudget: RouteBudget = {
  maxInputTokens: 2_000,
  maxOutputTokens: 250,
};

async function createBudgetedSummary(prompt: string): Promise<string> {
  const inputCount = await client.responses.inputTokens.count({
    model: 'gpt-5-mini',
    input: prompt,
  });

  if (inputCount.input_tokens > summaryBudget.maxInputTokens) {
    throw new Error(`Prompt too large: ${inputCount.input_tokens} input tokens.`);
  }

  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: prompt,
    max_output_tokens: summaryBudget.maxOutputTokens,
  });

  console.log(response.usage);

  return response.output_text;
}

console.log(await createBudgetedSummary('Write a concise release note for a caching feature.'));
```

N'attendez pas que la finance vous dise quelle route coûte cher. Loggez `usage`, agrégez-le par fonctionnalité, et alertez-vous avant que la facture mensuelle ne le fasse.

## Paralléliser avec retenue

Quand les appels unitaires sont stables, le batch devient la tentation suivante. Classification, enrichissement et extraction se parallélisent bien, mais un fan-out non contrôlé est la meilleure façon de découvrir la page des rate limits à la dure. Commencez petit, puis montez la concurrence seulement quand votre télémétrie reste calme.

Cette file est ennuyeuse, et c'est précisément pour ça que je l'aime.

```typescript
async function classifyTicket(text: string): Promise<string> {
  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: [
      {
        role: 'developer',
        content: 'Return one label: bug, feature, billing, or other.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    max_output_tokens: 20, // un label n'a pas besoin d'une dissertation
  });

  return response.output_text.trim().toLowerCase();
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => runWorker()));
  return results;
}

const tickets = [
  'The API returns 500 when uploading a PDF.',
  'Can you add SSO for enterprise customers?',
  'My invoice is missing last month charges.',
  'Where can I change my avatar?',
];

console.log(await runWithConcurrency(tickets, 2, classifyTicket));
```

Si vous ne connaissez pas encore votre concurrence sûre, partez sur 2, mettez en prod, et laissez les vrais 429 plaider pour 4 plus tard.

## Choisir le plus petit modèle qui tient face au réel

Le choix du modèle est l'endroit où les équipes brûlent du budget pour se rassurer. La page [OpenAI models](https://platform.openai.com/docs/models) pousse logiquement ses modèles les plus capables pour le raisonnement complexe, tandis que la page [Claude models](https://docs.anthropic.com/en/docs/about-claude/models/overview) pose le même arbitrage avec Haiku, Sonnet et Opus. Moi, je pars toujours du côté rapide et peu cher, puis je ne monte que les routes qui échouent aux evals ou à la revue humaine.

Si une route casse quand vous la rétrogradez vers le plus petit modèle, payez le plus gros. Si elle passe avec le plus petit, gardez le moins cher et dépensez le budget là où l'utilisateur le sent vraiment.
