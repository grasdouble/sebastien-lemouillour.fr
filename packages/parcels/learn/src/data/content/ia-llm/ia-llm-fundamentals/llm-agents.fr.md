---
id: llm-agents
order: 5
difficulty: advanced
tags: [IA, LLM, agents, function-calling]
---

## Quand un seul appel API ne suffit plus

Vous avez construit un workflow support. Il commence par un message utilisateur, et pendant un temps, un seul appel LLM fait le travail : lire le message, générer une réponse. Puis arrive une demande qui nécessite des données de compte. Vous ajoutez une requête. Puis une autre qui demande l'historique de paiement. Puis un croisement avec un log d'incident. Et vous vous retrouvez à écrire du code conditionnel pour chaque combinaison, et le workflow est plus long que pertinent.

Un agent est la réponse à ce type de croissance combinatoire, mais pas de la façon dont ça se vend habituellement. La valeur n'est pas dans l'autonomie. Elle est dans la boucle de contrôle : observer l'état courant, choisir une action, l'exécuter, voir ce que ça donne, puis décider si c'est terminé ou si une étape supplémentaire est nécessaire. C'est cette boucle qui permet au système de s'adapter à ce qu'il découvre, plutôt que d'exiger qu'on code à l'avance chaque chemin possible.

Le tradeoff est réel, cependant. Un agent est plus difficile à tester, plus coûteux à faire tourner, et nettement plus difficile à déboguer qu'une fonction déterministe. Si votre workflow a une forme prévisible (même complexe), du code explicite est généralement la bonne réponse. Je choisis un agent quand l'environnement est réellement inconnu à l'exécution, et que l'action suivante dépend de ce que la précédente a retourné.

## Appels de fonctions / utilisation d'outils

La première chose qui rend un agent possible, c'est de donner au modèle un moyen d'agir sur le monde. Pas en exécutant du code lui-même : le modèle retourne une décision structurée (un nom de fonction et des arguments), et votre application valide et exécute l'appel réel. Le résultat est réinjecté dans la conversation, et le modèle continue.

Le schéma d'outil est là où la plupart des équipes sous-investissent. Ce n'est pas du boilerplate : c'est un contrat. `properties` définit ce que le modèle peut demander. `required` supprime l'ambiguïté. `enum` l'empêche d'inventer des valeurs. Les descriptions servent d'indices de routage. Un schéma précis réduit radicalement l'espace de ce que le modèle peut faire de travers avant même de prendre une étape.

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

Un appel de fonction unique est déjà utile en soi : récupération structurée, dispatch déterministe, résultats typés. La boucle vient ensuite.

## Le modèle ReAct

Un appel de fonction donne au modèle une action. ReAct (Reason + Act) lui donne une boucle de raisonnement : le modèle décompose la tâche en une suite d'étapes pensée → action → observation, ajustant son plan en fonction de ce que chaque étape retourne.

La valeur n'est pas dans « une IA plus intelligente » : c'est dans l'explicitation. On peut regarder la trace et voir pourquoi l'agent a vérifié les déploiements avant les métriques, quelle observation a modifié le plan, et à quel endroit il s'est bloqué. C'est vraiment utile pour le débogage, et pour construire la confiance que le système fait bien ce qu'on pense qu'il fait.

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

Le coût est réel : plus de tokens par requête, et le risque que la boucle passe des cycles à raisonner sans converger. Un plan fixe (où on connaît les étapes à l'avance) est presque toujours moins cher et plus sûr. ReAct gagne sa place quand le plan lui-même ne peut pas être écrit à l'avance.

## Construire une boucle d'agent minimale

La boucle n'est qu'une machine à états bornée. Ce qui compte en production, ce n'est pas l'élégance : ce sont les garde-fous : un plafond d'itérations explicite, un dispatch d'outils strict, une propagation d'erreur structurée, et un log à chaque étape. Sans ça, déboguer un échec d'agent devient de la divination.

L'exemple ci-dessous parse les arguments d'outils directement depuis JSON. En production, validez-les contre votre schéma avant le dispatch : le modèle finira par envoyer des arguments qui violent vos règles métier, et vous voulez que ça apparaisse comme une erreur d'outil, pas comme un bug silencieux.

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

`max_iterations` est le premier garde-fou que tout le monde ajoute et le premier que tout le monde sous-estime. Un agent peut rester dans son plafond tout en produisant zéro information utile : appeler le même outil avec des arguments légèrement reformulés, obtenir le même résultat, et continuer quand même. La télémétrie au niveau de la boucle, la détection des actions dupliquées et des conditions d'arrêt progressives comptent autant que le plafond lui-même.

L'hallucination d'arguments d'outils est l'autre mode d'échec dont personne ne parle avant de l'avoir vécu. Le modèle invente des valeurs enum non supportées, omet des champs requis, ou envoie des combinaisons sémantiquement invalides. La correction n'est pas du prompt engineering : c'est de la validation à la frontière de l'outil. Validez avant l'exécution, retournez une erreur structurée que le modèle peut lire, et la boucle se corrige souvent d'elle-même.

Le coût dans les agents multi-tours s'accumule vite. Chaque itération rejoue l'historique complet des messages (raisonnements précédents, appels d'outils, observations), donc la facture croît avec la profondeur, pas seulement avec le nombre d'appels. Budgétisez en conséquence, et loggez suffisamment pour expliquer pourquoi un agent a tourné douze itérations plutôt que trois quand ça arrive inévitablement.

Ma recommandation honnête : si le workflow peut s'exprimer en code déterministe, exprimez-le en code déterministe. Les agents sont vraiment puissants pour des tâches ouvertes, qui demandent des branchements conditionnels sur des données temps réel, et où on ne peut pas énumérer les branches à l'avance. Pour tout le reste, l'overhead opérationnel n'en vaut pas la peine.
