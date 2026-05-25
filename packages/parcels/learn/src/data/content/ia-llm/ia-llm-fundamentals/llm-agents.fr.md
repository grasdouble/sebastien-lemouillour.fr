---
id: llm-agents
order: 5
difficulty: advanced
tags: [IA, LLM, agents, function-calling]
---

## Qu'est-ce qu'un agent ?

Imaginez un ticket support qui commence par « le checkout est lent depuis ce matin ». Un simple appel LLM peut reformuler le message ou proposer des hypothèses, mais il ne peut pas, à lui seul, comparer les derniers déploiements, interroger vos métriques, lire un runbook interne, puis changer de stratégie selon ce qu'il découvre. Dès que la réponse dépend de plusieurs sources et de résultats intermédiaires, vous n'êtes plus dans une simple transformation entrée → sortie.

C'est là qu'un agent devient utile. En production, ce n'est pas « un LLM avec un prompt plus long », mais une boucle de contrôle qui combine quatre capacités : un LLM pour choisir l'étape suivante, des outils pour produire des effets de bord, une mémoire pour transporter l'état utile, et une boucle de planification ou d'itération qui décide quoi faire après chaque observation. L'agent inspecte l'état courant, choisit une action, l'exécute, observe le résultat, puis décide si une étape supplémentaire est nécessaire.

La nuance compte, parce qu'elle a un coût architectural. Un simple appel API est plus facile à borner, à tester et à chiffrer. Un agent devient pertinent quand la tâche est ouverte, exige du branchement conditionnel ou dépend de systèmes externes : workflow de support multi-étapes, investigation sur plusieurs sources de données, orchestration entre APIs internes, ou remédiation autonome sous contraintes. Si le workflow est déjà connu, déterministe et sensible à la latence, un agent est souvent la mauvaise abstraction. Le prix à payer se mesure en tokens, en code d'orchestration, en observabilité et en complexité de débogage.

## Appels de fonctions / utilisation d'outils

Pour comprendre comment on arrive à cette boucle, il faut commencer par la brique la plus simple : permettre au modèle d'agir sur autre chose que du texte. L'appel de fonctions permet justement au modèle de choisir parmi un ensemble d'outils décrits par un schéma JSON. Le modèle n'exécute jamais le code lui-même. Il retourne un nom de fonction et des arguments, votre application valide et exécute l'appel, puis réinjecte le résultat dans la conversation pour que le modèle puisse continuer.

Autrement dit, le schéma d'outil est à la fois un contrat d'API et une frontière de sécurité. `properties` expose la surface appelable, `required` réduit l'ambiguïté, `enum` évite la dérive sur les valeurs bornées, et les descriptions servent d'indices de routage. Un bon schéma réduit l'espace d'action et diminue les hallucinations sur les arguments. Avant même de parler d'agent, c'est déjà une manière de faire passer le modèle d'un rôle de rédacteur à un rôle de coordinateur.

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

Une fois que les outils existent, le problème suivant est la coordination. Le modèle a désormais des moyens d'agir sur le monde, mais il lui faut encore un pattern pour décider quand appeler quel outil et comment exploiter le résultat.

## Le modèle ReAct

Une fois que le modèle peut appeler un outil, le problème suivant apparaît vite : comment enchaîner plusieurs actions sans coder à la main toutes les branches possibles ? C'est là qu'intervient ReAct, pour Reason + Act. Le modèle décompose la tâche en une suite d'étapes de raisonnement, d'appels d'outils et d'observations.

L'intérêt n'est pas une autonomie « magique », mais un état intermédiaire explicite. Vous pouvez inspecter pourquoi l'agent a interrogé le système A avant le système B, quelle observation a modifié le plan, et à quel endroit il s'est bloqué. Avec les fournisseurs qui n'exposent pas la chaîne de raisonnement privée, persistez plutôt des résumés de décision concis ou des justifications d'action que le raisonnement interne brut.

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

Vu comme ça, ReAct n'est pas un produit fini, mais un patron d'orchestration. Il améliore l'auditabilité et le débogage, parce que vous pouvez persister chaque paire action/observation, reconstruire les décisions après incident, et placer des garde-fous à la frontière des outils. En échange, vous acceptez un surcroît de tokens et le risque de déléguer trop de raisonnement à une boucle alors qu'un plan fixe aurait été moins cher et plus sûr.

## Construire une boucle d'agent minimale

Une boucle d'agent minimale n'est qu'une machine à états bornée. Ce qui compte vraiment en production : une limite d'itérations explicite, un dispatch d'outils strict, une propagation d'erreur structurée et des logs à chaque étape. Pour rester bref, l'exemple parse directement les arguments d'outils en JSON ; en production, validez-les contre le même schéma d'exécution avant le dispatch.

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

Le premier mode d'échec, ce sont les boucles infinies ou à faible valeur. `max_iterations` est obligatoire, mais insuffisant. Une fois un vrai agent déployé, vous découvrez qu'il peut rappeler le même outil avec des formulations légèrement différentes sans produire d'information nouvelle. C'est pourquoi la télémétrie au niveau de la boucle, la détection des actions dupliquées et des règles d'arrêt progressives comptent autant.

Ensuite arrive le deuxième problème : les hallucinations sur les arguments d'outils. Le modèle invente des valeurs `enum` non supportées, omet des champs obligatoires ou envoie des requêtes sémantiquement invalides. Si vous validez avant exécution et retournez des erreurs d'outil lisibles par machine, la boucle peut souvent se corriger au lieu d'échouer en silence.

Puis vient le coût. Les agents multi-tours rejouent les messages précédents et les résultats d'outils à chaque itération, donc la facture ne se limite pas au modèle : il faut aussi compter la latence, la pression sur les files d'attente et davantage d'occasions de panne partielle. Enfin, le débogage devient un besoin système à part entière : version du prompt, version du schéma d'outil, arguments demandés, résultat d'exécution, durée, retries et réponse finale doivent tous être journalisés si vous voulez des postmortems fondés sur des preuves plutôt que sur des suppositions.

Le dernier arbitrage oppose autonomie et contrôle. Si la tâche peut être encodée comme une machine à états déterministe, un moteur de workflow ou un pipeline de recherche documentaire, préférez cela. Les agents excellent dans la prise de décision locale sous incertitude — pas dans le remplacement d'une logique métier claire.
