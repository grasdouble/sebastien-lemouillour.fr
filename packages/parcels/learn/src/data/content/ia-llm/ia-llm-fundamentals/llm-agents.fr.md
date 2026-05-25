---
id: llm-agents
order: 5
difficulty: advanced
tags: [IA, LLM, agents, function-calling]
---

## Qu'est-ce qu'un agent ?

Un agent n'est pas « un LLM avec un prompt plus long ». En production, c'est une boucle de contrôle qui combine quatre capacités : un LLM pour sélectionner une politique d'action, des outils pour produire des effets de bord, une mémoire pour transporter l'état utile, et une boucle de planification ou d'itération qui décide de l'étape suivante à partir des résultats intermédiaires. Un simple appel API fait une transformation entrée → sortie en un seul passage. Un agent inspecte l'état courant, choisit une action, l'exécute, observe le résultat, puis décide si une étape supplémentaire est nécessaire.

Cette distinction est architecturale. Un simple appel API est plus facile à borner, à tester et à modéliser en coût. Un agent devient pertinent quand la tâche est ouverte, exige du branchement conditionnel ou dépend de systèmes externes : workflow de support multi-étapes, investigation sur plusieurs sources de données, orchestration entre APIs internes, ou remédiation autonome sous contraintes. Si le workflow est déjà connu, déterministe et sensible à la latence, un agent est souvent la mauvaise abstraction. Le prix à payer se mesure en tokens, en code d'orchestration, en observabilité et en complexité de débogage. Utilisez des agents quand l'environnement est partiellement inconnu à l'exécution ; n'en utilisez pas pour remplacer un pipeline déjà exprimable en code explicite.

## Appels de fonctions / utilisation d'outils

L'appel de fonctions permet au modèle de choisir parmi un ensemble d'outils décrits par un schéma JSON. Le modèle n'exécute jamais le code lui-même. Il retourne un nom de fonction et des arguments, votre application valide et exécute l'appel, puis réinjecte le résultat dans la conversation pour que le modèle puisse continuer. La description d'outil joue donc à la fois le rôle de contrat d'API et de frontière de sécurité.

Le schéma compte davantage que beaucoup d'équipes ne l'anticipent. `properties` expose la surface appelable, `required` réduit l'ambiguïté, `enum` évite la dérive sur les valeurs bornées, et les descriptions servent d'indices de routage. Un bon schéma réduit l'espace d'action et diminue les hallucinations sur les arguments.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function lookupWeather(city: string, unit: 'celsius' | 'fahrenheit') {
  return JSON.stringify({
    city,
    unit,
    temperature: unit === 'celsius' ? 18 : 64,
    conditions: 'windy',
  });
}

async function main() {
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'lookup_weather',
        description: 'Get the current weather for a city.',
        parameters: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'City name, for example Paris or Tokyo.',
            },
            unit: {
              type: 'string',
              enum: ['celsius', 'fahrenheit'],
              description: 'Temperature unit expected by the user.',
            },
          },
          required: ['city', 'unit'],
          additionalProperties: false,
        },
      },
    },
  ];

  const messages = [
    { role: 'system' as const, content: 'You may use tools when needed. Be precise.' },
    { role: 'user' as const, content: 'What is the weather in Paris in celsius?' },
  ];

  const first = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools,
  });

  const message = first.choices[0]?.message;
  const toolCall = message?.tool_calls?.[0];

  if (!toolCall || toolCall.function.name !== 'lookup_weather') {
    throw new Error('Model did not call the expected tool.');
  }

  const args = JSON.parse(toolCall.function.arguments) as {
    city: string;
    unit: 'celsius' | 'fahrenheit';
  };

  const toolResult = await lookupWeather(args.city, args.unit);

  const final = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...messages,
      message,
      {
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: toolResult,
      },
    ],
    tools,
  });

  console.log(final.choices[0]?.message?.content);
}

main().catch(console.error);
```

## Le modèle ReAct

ReAct signifie Reason + Act. Le modèle décompose la tâche en une suite d'étapes de raisonnement, d'appels d'outils et d'observations. En pratique, l'intérêt n'est pas une autonomie « magique », mais un état intermédiaire explicite. Vous pouvez inspecter pourquoi l'agent a interrogé le système A avant le système B, quelle observation a modifié le plan, et à quel endroit il s'est bloqué. Avec les fournisseurs qui n'exposent pas la chaîne de raisonnement privée, persistez plutôt des résumés de décision concis ou des justifications d'action que le raisonnement interne brut.

```text
User: Find why checkout latency increased after the last deployment.
Thought: I need to compare recent deploys with current service health and latency signals.
Action: get_recent_deployments(service="checkout", limit=3)
Observation: v2025.09.14 was deployed 42 minutes ago.
Thought: I should verify whether the latency regression started after that deployment.
Action: query_metrics(metric="checkout_p95_latency", window="2h")
Observation: p95 jumped from 420ms to 1.8s 35 minutes ago.
Thought: The timing aligns. I need an error signal to distinguish load from a bad release.
Action: query_metrics(metric="checkout_error_rate", window="2h")
Observation: error rate is flat.
Thought: Errors are flat, so this looks like a performance regression rather than an outage.
Action: summarize_findings()
Observation: likely regression introduced by v2025.09.14; rollback or profile DB calls.
```

En architecture, ReAct est utile car il améliore l'auditabilité et le débogage. Vous pouvez persister chaque paire action/observation, reconstruire les décisions après incident, et placer des garde-fous à la frontière des outils. Son coût est un surcroît de tokens et le risque de déléguer trop de raisonnement à une boucle alors qu'un plan fixe aurait été moins cher et plus sûr.

## Construire une boucle d'agent minimale

Une boucle d'agent minimale n'est qu'une machine à états bornée. Les éléments réellement importants en production sont : une limite d'itérations explicite, un dispatch d'outils strict, une propagation d'erreur structurée et des logs à chaque étape. Pour rester compact, l'exemple parse directement les arguments JSON ; en production, validez-les contre le même schéma à l'exécution avant le dispatch.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_ITERATIONS = 8;

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'search_docs',
      description: 'Search internal documentation for a technical topic.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Precise search query.' },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_service_status',
      description: 'Fetch the current status of a production service.',
      parameters: {
        type: 'object',
        properties: {
          service: { type: 'string', description: 'Service identifier.' },
        },
        required: ['service'],
        additionalProperties: false,
      },
    },
  },
];

const handlers: Record<string, (args: Record<string, unknown>) => Promise<string>> = {
  async search_docs(args) {
    return JSON.stringify({
      query: args.query,
      hits: ['Runbook: Checkout latency', 'Playbook: Database pool saturation'],
    });
  },
  async get_service_status(args) {
    return JSON.stringify({
      service: args.service,
      status: 'degraded',
      p95LatencyMs: 1800,
    });
  },
};

async function runAgent(userRequest: string) {
  const messages = [
    {
      role: 'system' as const,
      content:
        'You are an ops investigation agent. Use tools when needed, cite evidence, and stop when you can answer confidently.',
    },
    { role: 'user' as const, content: userRequest },
  ];

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
      temperature: 0,
    });

    const choice = response.choices[0];
    const message = choice?.message;

    if (!message) {
      throw new Error('Missing assistant message.');
    }

    console.log(`[agent] iteration=${iteration} finish_reason=${choice.finish_reason}`);
    messages.push(message);

    if (choice.finish_reason === 'stop') {
      return message.content ?? '';
    }

    const toolCalls = message.tool_calls ?? [];

    for (const toolCall of toolCalls) {
      const handler = handlers[toolCall.function.name];

      if (!handler) {
        messages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` }),
        });
        continue;
      }

      try {
        const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
        const result = await handler(args);

        messages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: result,
        });
      } catch (error) {
        messages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: error instanceof Error ? error.message : 'Tool execution failed',
          }),
        });
      }
    }
  }

  throw new Error(`Agent stopped after reaching max iterations (${MAX_ITERATIONS}).`);
}

runAgent('Investigate whether checkout is degraded and explain why.')
  .then((answer) => console.log(answer))
  .catch((error) => console.error(error));
```

## Arbitrages et modes d'échec

Le premier mode d'échec est la boucle infinie ou à faible valeur. `max_iterations` est obligatoire, mais insuffisant ; il faut aussi de la télémétrie de boucle, de la détection d'actions dupliquées et des règles d'arrêt progressives quand l'agent interroge le même outil avec de légères variantes de prompt. Deuxième risque : les hallucinations sur les arguments d'outils. Le modèle peut inventer des valeurs `enum` non supportées, omettre des champs obligatoires ou produire des requêtes sémantiquement invalides. Validez avant exécution et retournez des erreurs d'outil lisibles par machine pour permettre l'auto-correction.

Troisième point : les agents multi-tours coûtent cher. Chaque itération rejoue les messages précédents et les résultats d'outils. Le coût n'est pas seulement financier ; c'est aussi de la latence, de la pression sur les files d'attente et plus de points de panne partielle. Quatrième point : le débogage exige des journaux complets à chaque étape : version du prompt, version du schéma d'outil, arguments demandés, résultat d'exécution, durée, nouvelles tentatives et réponse finale. Sans cela, les postmortems deviennent spéculatifs.

L'arbitrage final oppose autonomie et contrôle. Si la tâche peut être encodée comme une machine à états déterministe, un moteur de workflow ou un pipeline de recherche documentaire, préférez cela. Les agents excellent dans la prise de décision locale sous incertitude, pas dans le remplacement d'une logique métier claire. Un bon design de production contraint l'agent à la plus petite surface où le jugement du modèle apporte une vraie valeur, et garde tout le reste explicite, typé et observable.
