---
id: llm-agents
order: 3
difficulty: advanced
tags: [agents, tools, llm]
publishedAt: 2026-05-12
updatedAt: 2026-05-30
---

## Quand un seul appel API ne suffit plus

Vous partez avec un prompt et une réponse. Puis le workflow réclame des données de compte, une vérification de facturation, un accès aux logs, parfois une recherche web. À ce stade, la logique de branchement devient plus grosse que le problème métier, et chaque cas limite finit dans du code applicatif que personne ne veut vraiment maintenir.

C'est le moment où il faut envisager un agent. Pas parce que « l'autonomie » fait vendre, mais parce qu'une boucle de contrôle coûte moins cher que coder à la main chaque branche runtime. La bonne définition reste la plus banale : un modèle observe l'état, choisit un outil, reçoit le résultat, puis décide d'arrêter ou de continuer. OpenAI documente exactement cette boucle dans son guide [function calling](https://platform.openai.com/docs/guides/function-calling), et Anthropic décrit le même contrat avec les blocs `tool_use` et `tool_result` dans sa documentation [Anthropic docs](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview).

Le tradeoff est rude. Les agents sont plus difficiles à tester, plus difficiles à borner, et beaucoup plus difficiles à expliquer pendant un incident. Si le workflow a une forme connue, écrivez du code explicite. Je ne choisis un agent que lorsque l'étape suivante dépend de données impossibles à connaître avant le début de l'exécution.

## La fiabilité commence dans le schéma d'outil

La plupart des équipes perdent du temps sur les prompts et sous-investissent dans les schémas. C'est l'inverse qu'il faut faire. `required` enlève l'ambiguïté, `enum` bloque les valeurs inventées, `additionalProperties: false` coupe le bruit, et l'application stricte du schéma déplace l'échec à la frontière de l'outil au lieu de le laisser contaminer l'état métier.

Voici la plus petite boucle qui mérite d'aller en staging.

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
      name: 'lookup_weather',
      description: 'Get the current weather for a city.',
      strict: true,
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
  ];

  const input: any[] = [{ role: 'user', content: 'What is the weather in Paris in celsius?' }];

  const first = await client.responses.create({
    model: 'gpt-5',
    tools,
    input,
  });

  input.push(...first.output);

  for (const item of first.output) {
    if (item.type !== 'function_call' || item.name !== 'lookup_weather') {
      continue;
    }

    const args = JSON.parse(item.arguments) as {
      city: string;
      unit: 'celsius' | 'fahrenheit';
    };

    input.push({
      type: 'function_call_output',
      call_id: item.call_id,
      output: await lookupWeather(args.city, args.unit),
    });
  }

  const final = await client.responses.create({
    model: 'gpt-5',
    tools,
    input,
  });

  console.log(final.output_text);
}

main().catch(console.error);
```

Un appel d'outil unique est déjà utile : dispatch déterministe, entrées typées, échec observable. La partie agentique ne commence que lorsque vous laissez la boucle continuer.

## ReAct reste utile, mais le raisonnement caché n'est pas votre interface

L'idée ReAct reste pertinente parce qu'elle donne une forme exploitable : inspecter l'état, prendre une action, inspecter le résultat, puis choisir à nouveau. LangChain utilise presque exactement cette définition des agents dans sa documentation [LangChain agents](https://docs.langchain.com/oss/javascript/langchain/agents). En revanche, bâtir l'architecture sur l'exposition de la chaîne de pensée du modèle est une erreur. Certains fournisseurs exposent des éléments de raisonnement, d'autres les masquent, et aucun de ces détails n'est un contrat fiable pour vos politiques de production.

Prenez la trace suivante comme un support pédagogique, pas comme quelque chose que votre système doit persister mot pour mot.

```text
User: Find why checkout latency increased after the last deployment.
Plan: Compare the latest deploy with current latency and error signals.
Action: get_recent_deployments(service="checkout", limit=3)
Observation: v2026.05.30 was deployed 42 minutes ago.
Decision: Check whether the latency jump starts after that deploy.
Action: query_metrics(metric="checkout_p95_latency", window="2h")
Observation: p95 jumped from 420ms to 1.8s 35 minutes ago.
Decision: Separate load from a bad release.
Action: query_metrics(metric="checkout_error_rate", window="2h")
Observation: error rate is flat.
Decision: Likely performance regression, not a broad outage.
Action: summarize_findings()
Observation: probable regression introduced by v2026.05.30; rollback or profile database calls.
```

Si vous connaissez déjà le plan complet avant le premier appel, oubliez ReAct et codez le graphe directement. La boucle ne mérite son coût que lorsque les observations changent réellement l'action suivante.

## Construisez la boucle comme une machine à états bornée

Les agents de production échouent moins parce que le modèle serait plus intelligent, et davantage parce que le runtime est plus strict : plafond de pas, log à chaque étape, rejet des outils inconnus, validation des arguments, et erreurs structurées que le modèle peut corriger.

Voilà à quoi ressemble cette boucle quand on arrête de faire semblant que le modèle est déterministe.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_STEPS = 8;

const tools = [
  {
    type: 'function' as const,
    name: 'search_runbooks',
    description: 'Search runbooks for a technical issue.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Precise search query.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'get_service_status',
    description: 'Fetch current latency and availability for a service.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Service identifier.' },
      },
      required: ['service'],
      additionalProperties: false,
    },
  },
];

const handlers: Record<string, (args: Record<string, unknown>) => Promise<string>> = {
  async search_runbooks(args) {
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
  const input: any[] = [
    {
      role: 'system',
      content:
        'You investigate service issues. Use tools when needed, cite evidence, and stop as soon as the answer is defensible.',
    },
    { role: 'user', content: userRequest },
  ];

  for (let step = 1; step <= MAX_STEPS; step += 1) {
    const response = await client.responses.create({
      model: 'gpt-5',
      tools,
      input,
    });

    input.push(...response.output);

    const toolCalls = response.output.filter(
      (item): item is Extract<(typeof response.output)[number], { type: 'function_call' }> =>
        item.type === 'function_call'
    );

    console.log(`[agent] step=${step} tool_calls=${toolCalls.length}`);

    if (toolCalls.length === 0) {
      return response.output_text;
    }

    for (const toolCall of toolCalls) {
      const handler = handlers[toolCall.name];

      if (!handler) {
        input.push({
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify({ error: `Unknown tool: ${toolCall.name}` }),
        });
        continue;
      }

      try {
        const args = JSON.parse(toolCall.arguments) as Record<string, unknown>;
        const result = await handler(args);

        input.push({
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: result,
        });
      } catch (error) {
        input.push({
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify({
            error: error instanceof Error ? error.message : 'Tool execution failed',
          }),
        });
      }
    }
  }

  throw new Error(`Agent stopped after reaching max steps (${MAX_STEPS}).`);
}

runAgent('Investigate whether checkout is degraded and explain why.')
  .then((answer) => console.log(answer))
  .catch((error) => console.error(error));
```

Une fois cette boucle stable, demandez-vous si vous avez vraiment besoin d'un framework. OpenAI expose déjà des capacités hébergées et des serveurs MCP distants via le paramètre `tools` dans son guide [built-in tools](https://platform.openai.com/docs/guides/tools). MCP est désormais une couche publique d'interopérabilité, pas une rumeur marketing, et la documentation officielle [MCP](https://modelcontextprotocol.io/docs/getting-started/intro) est l'endroit où vérifier ce que signifie vraiment « accès standardisé aux outils » avant d'acheter n'importe quel récit vendeur.

## Les modes d'échec qui comptent en production

`MAX_STEPS` est le garde-fou évident, et il est insuffisant. Un agent peut rester sous le plafond tout en faisant un travail inutile : même outil, même résultat, formulation à peine différente. Mesurez les actions dupliquées, les observations répétées, la latence par étape, et le coût par résultat utile. Si vous êtes incapable d'expliquer pourquoi une requête a pris sept étapes alors que la précédente en a pris deux, vous n'avez pas encore un système d'agents. Vous avez une machine à sous avec des logs.

L'hallucination d'arguments d'outils est l'autre panne chronique. Le modèle invente des valeurs d'enum, oublie des champs requis, ou envoie des combinaisons que votre logique métier ne peut pas accepter. La correction n'est pas dans plus de poésie de prompt. La correction est dans la validation à la frontière de l'outil et dans des payloads d'erreur qui permettent au modèle de retenter avec de meilleurs arguments.

Le coût, lui aussi, grimpe plus vite que la plupart des équipes ne l'anticipent. Chaque étape ajoute de l'état, des sorties d'outils, et de nouvelles surfaces de retry. Si le workflow peut être dessiné comme un graphe fini avant d'écrire du code, construisez le graphe et oubliez l'agent. Gardez l'agent pour les cas où le graphe n'apparaît qu'après le premier résultat d'outil.
