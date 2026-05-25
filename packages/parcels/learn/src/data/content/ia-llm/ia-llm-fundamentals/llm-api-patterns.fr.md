---
id: llm-api-patterns
order: 3
difficulty: intermediate
tags: [IA, LLM, API]
---

Votre premier appel à l'API OpenAI a marché du premier coup. Vous avez collé la clé dans le code, envoyé un message, reçu une réponse — cinq minutes. En local, tout fonctionne.

En production, la réalité est différente : les réseaux sont instables, les rate limits existent, les prompts dépassent parfois la fenêtre de contexte, et les factures peuvent exploser si personne ne surveille. Ce guide parcourt les patterns qui rendent une intégration LLM robuste — pas seulement fonctionnelle.

## Réponses en streaming

Le premier problème que vous rencontrez dès qu'une UX est impliquée : l'attente. Avec un appel standard, l'utilisateur fixe un spinner pendant 5 à 15 secondes avant de voir la réponse d'un coup. Le streaming résout ça en affichant les tokens au fil de l'eau, dès qu'ils sont générés — exactement ce que fait ChatGPT.

En pratique, vous envoyez `stream: true` et vous lisez des Server-Sent Events depuis le `ReadableStream` renvoyé par `fetch`. Gardez toujours la clé API côté serveur : le navigateur doit appeler votre backend, qui appelle le fournisseur. Vous protégez ainsi les secrets et vous centralisez la journalisation et les quotas.

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

Un appel LLM qui échoue sur votre laptop n'a pas de conséquence. En production, un échec non géré signifie une fonctionnalité cassée pour l'utilisateur. Les causes sont prévisibles : réseau instable, rate limit temporaire en 429, ou prompt trop large pour la fenêtre de contexte. Un client robuste les distingue et ne traite pas de la même façon une erreur transitoire et une erreur permanente.

C'est pourquoi l'exemple ci-dessous combine un timeout, des règles de retry explicites et un échec immédiat pour les requêtes qui n'ont aucune chance de réussir en l'état.

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

La facture LLM peut surprendre. Un prototype avec quelques appels manuels coûte quelques centimes. Un produit qui fait des appels LLM sur chaque action utilisateur peut coûter des milliers de dollars par mois si personne ne surveille. Les deux leviers principaux : estimer le coût avant d'envoyer, et plafonner la sortie avec `max_tokens`.

L'exemple ci-dessous montre la discipline de base : rejeter tôt les requêtes trop coûteuses, puis borner la génération avant que le fournisseur ne le fasse pour vous.

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

Certaines tâches n'ont pas besoin d'attendre : classifier un batch de tickets, enrichir une liste de produits, extraire des entités de plusieurs documents. Envoyer ces appels en parallèle réduit la latence totale — mais un fan-out non contrôlé heurte vite les rate limits. Une file à concurrence fixe est le bon compromis : vous gardez plusieurs appels en vol simultanément sans saturer le provider.

C'est pourquoi l'exemple commence par du parallélisme direct, puis ajoute une file dès que le contrôle devient plus important que la vitesse brute.

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

Le choix du modèle est un arbitrage d'ingénierie, pas une décision de marque. Vous le faites en fonction de trois variables : la latence cible, l'exigence qualité, et le budget. Les petits modèles (GPT-4o mini, Claude Haiku) conviennent très bien aux helpers à fort volume — classification, reformulation, extraction. Les plus gros modèles sont meilleurs pour le raisonnement multi-étapes, les consignes ambiguës ou les sorties dont le coût d'erreur est élevé.

Faites vos benchmarks avec vos propres prompts, car le « meilleur » modèle dépend de la route que vous optimisez, pas d'un slogan de leaderboard.

| Modèle        | Idéal pour                                                           | Latence typique  | Profil de coût |
| ------------- | -------------------------------------------------------------------- | ---------------- | -------------- |
| GPT-4o mini   | Classification, reformulation, extraction, chat UX                   | Très faible      | Faible         |
| GPT-4o        | Assistants de production, flux multimodaux, raisonnement plus solide | Faible à moyenne | Moyen          |
| Claude Haiku  | Résumés rapides, routage, tâches métier légères                      | Très faible      | Faible         |
| Claude Sonnet | Analyse plus profonde, rédaction longue, aide au code complexe       | Moyenne          | Moyen à élevé  |

Commencez avec le modèle le moins cher qui passe la barre, puis ne montez en gamme que sur les routes où un meilleur raisonnement mérite vraiment son coût.
