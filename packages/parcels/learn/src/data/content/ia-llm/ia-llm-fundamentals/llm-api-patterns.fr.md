---
id: llm-api-patterns
order: 3
difficulty: intermediate
tags: [IA, LLM, API]
---

## Réponses en streaming

Le streaming améliore la latence perçue, car vous affichez les tokens au fil de l'eau au lieu d'attendre la réponse complète. En pratique, vous envoyez `stream: true` et vous lisez des Server-Sent Events depuis le `ReadableStream` renvoyé par `fetch`. C'est particulièrement utile pour une interface de chat, un résumé en direct ou une génération de code où le feedback rapide compte.

Gardez toujours la clé API côté serveur, même si votre frontend affiche le flux. Le navigateur doit appeler votre backend, puis votre backend doit appeler le fournisseur LLM. Vous protégez ainsi les secrets et vous centralisez la journalisation, les quotas et la modération.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

async function streamChatCompletion(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a concise technical assistant.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data: ')) continue;

        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          return fullText;
        }

        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };

        const token = json.choices?.[0]?.delta?.content ?? '';
        if (token) {
          process.stdout.write(token);
          fullText += token;
        }
      }
    }
  }

  return fullText;
}

await streamChatCompletion('Explain SSE streaming for LLM APIs in 3 bullet points.');
```

Paramètres clés : `model` pilote la qualité et le coût, `stream: true` active la livraison incrémentale, et `temperature` stabilise la réponse. Prévoyez toujours le cas où le flux s'arrête trop tôt ou renvoie un chunk mal formé.

## Gestion des erreurs

En production, les intégrations LLM échouent pour des raisons normales : réseau lent, rate limit temporaire en 429, ou requête trop large pour la fenêtre de contexte du modèle. Un client robuste doit définir un timeout, distinguer les erreurs réessayables, puis réessayer avec un exponential backoff. Il doit aussi arrêter de réessayer sur les erreurs permanentes comme des identifiants invalides ou un prompt trop gros.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

type ChatCompletion = {
  choices: Array<{ message: { content: string } }>;
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createCompletionWithRetry(userPrompt: string): Promise<string> {
  const maxRetries = 4;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 300,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = (await response.json()) as ChatCompletion;

      if (response.ok) {
        return data.choices[0]?.message.content ?? '';
      }

      if (response.status === 400 && /token|context length/i.test(data.error?.message ?? '')) {
        throw new Error('Prompt too large for the selected model. Trim context or choose a larger context window.');
      }

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1_000 : 0;
        const backoffMs = Math.max(retryAfterMs, 500 * 2 ** attempt);
        await sleep(backoffMs);
        continue;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        await sleep(500 * 2 ** attempt);
        continue;
      }

      throw new Error(data.error?.message ?? `Request failed with status ${response.status}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError' && attempt < maxRetries) {
        await sleep(500 * 2 ** attempt);
        continue;
      }

      throw error;
    }
  }

  throw new Error('Retries exhausted');
}

const answer = await createCompletionWithRetry('Summarize HTTP caching in 5 lines.');
console.log(answer);
```

Journalisez les codes de statut, le nombre de retries et le modèle utilisé, mais jamais les secrets bruts ni des prompts privés, sauf si votre politique l'autorise explicitement. Si une requête dépasse souvent la limite de tokens, corrigez le payload plutôt que de masquer le problème avec plus de retries.

## Gestion des coûts

Le coût d'un LLM dépend surtout des tokens : les input tokens pour ce que vous envoyez, les output tokens pour ce que le modèle génère. Vous devez estimer le coût avant d'envoyer des prompts chers, puis limiter la sortie avec `max_tokens` pour éviter qu'une mauvaise requête ne fasse exploser la facture. L'estimation reste approximative, mais elle suffit pour bloquer tôt les requêtes trop volumineuses.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const pricing = {
  inputPerMillion: 0.15,
  outputPerMillion: 0.6,
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateCost(inputText: string, maxOutputTokens: number): number {
  const inputTokens = estimateTokens(inputText);
  return (inputTokens / 1_000_000) * pricing.inputPerMillion + (maxOutputTokens / 1_000_000) * pricing.outputPerMillion;
}

async function createBudgetedCompletion(prompt: string): Promise<void> {
  const maxTokens = 250;
  const estimatedCost = estimateCost(prompt, maxTokens);

  if (estimatedCost > 0.02) {
    throw new Error(`Estimated request cost too high: $${estimatedCost.toFixed(4)}`);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    choices: Array<{ message: { content: string } }>;
  };

  console.log(data.choices[0]?.message.content ?? '');
  console.log('Usage:', data.usage);
}

await createBudgetedCompletion('Write a concise release note for a caching feature.');
```

Dans un vrai produit, définissez des budgets par fonctionnalité, suivez la consommation par utilisateur ou par workspace, et préférez des prompts plus courts à un `max_tokens` trop généreux. Si vous pouvez résumer du contexte avant de le réutiliser, vous économisez souvent plus que par de petits réglages de paramètres.

## Requêtes parallèles

Le parallélisme est utile pour la classification, l'extraction ou l'enrichissement par lot. `Promise.all` donne la plus faible latence pour un petit batch, mais un fan-out non contrôlé finit vite par heurter les rate limits. Une file à concurrence fixe suffit souvent : vous gardez un nombre limité de requêtes en vol et vous ne lancez la suivante que lorsqu'une autre se termine.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

async function classifyPrompt(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 50,
      temperature: 0,
      messages: [
        { role: 'system', content: 'Return one label: bug, feature, billing, or other.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message.content.trim() ?? 'other';
}

const prompts = [
  'The API returns 500 when uploading a PDF.',
  'Can you add SSO for enterprise customers?',
  'My invoice is missing last month charges.',
  'Where can I change my avatar?',
];

const directResults = await Promise.all(prompts.map((prompt) => classifyPrompt(prompt)));
console.log('Direct:', directResults);

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

const queuedResults = await runWithConcurrency(prompts, 2, classifyPrompt);
console.log('Queued:', queuedResults);
```

Ce pattern est simple, prévisible et agnostique au fournisseur. Commencez avec une faible concurrence, observez les 429 dans votre télémétrie, puis augmentez uniquement quand les mesures montrent que c'est sûr.

## Choisir le bon modèle

Le choix du modèle est un arbitrage d'ingénierie, pas une décision de marque. Les petits modèles conviennent très bien aux helpers à fort volume, tandis que les plus gros sont meilleurs pour le raisonnement multi-étapes, les consignes ambiguës ou les sorties dont le coût d'erreur est élevé. Faites vos benchmarks avec vos propres prompts, car le « meilleur » modèle dépend de votre cible de latence, de votre exigence qualité et de votre budget.

| Modèle        | Idéal pour                                                           | Latence typique  | Profil de coût |
| ------------- | -------------------------------------------------------------------- | ---------------- | -------------- |
| GPT-4o mini   | Classification, reformulation, extraction, chat UX                   | Très faible      | Faible         |
| GPT-4o        | Assistants de production, flux multimodaux, raisonnement plus solide | Faible à moyenne | Moyen          |
| Claude Haiku  | Résumés rapides, routage, tâches métier légères                      | Très faible      | Faible         |
| Claude Sonnet | Analyse plus profonde, rédaction longue, aide au code complexe       | Moyenne          | Moyen à élevé  |

Un bon défaut consiste à démarrer avec un modèle mini ou de classe Haiku, mesurer les échecs, puis n'améliorer que les routes qui ont réellement besoin de meilleure qualité. Revalidez régulièrement les tarifs des fournisseurs, car la latence et le coût évoluent plus vite que la plupart des applications.
