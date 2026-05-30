---
id: tool-calling
order: 15
difficulty: intermediate
tags: [LLM, Anthropic, OpenAI, tools, orchestration]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Un outil, c’est malin. Trois outils, deux retries et un timeout plus tard, tu réalises que tu as construit un mini système distribué à l’intérieur d’une feature de chat.

C’est pour ça que je sépare function calling et tool calling. Le function calling, c’est le format du payload. Le tool calling, c’est la boucle d’exécution autour. Le modèle demande un outil, ton application décide si cet appel est autorisé, l’exécute, puis renvoie le résultat. Anthropic documente cette boucle dans [tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use), OpenAI emballe la même idée dans son guide [Agents](https://platform.openai.com/docs/guides/agents), et l’ancien guide [function calling](https://platform.openai.com/docs/guides/function-calling) reste encore le plus clair pour comprendre la forme des arguments.

Le point important n’est pas le JSON. Le point important, c’est qui contrôle la boucle. Ça doit être ton runtime, pas le modèle. Le modèle peut suggérer l’action suivante. Il ne doit jamais décider des budgets, des effets de bord ou du fait qu’un quatrième retry serait une excellente idée.

Avant le code, voilà le raccourci que j’aurais aimé recevoir plus tôt : traite chaque outil comme une dépendance réseau peu fiable, même si aujourd’hui ce n’est “que” une fonction locale. Cet état d’esprit t’oblige à ajouter des timeouts, de l’idempotence et des logs avant que la prod te fasse la facture.

Voilà la boucle de contrôle que je garderais vraiment dans une application :

```ts
const MAX_TOOL_HOPS = 4;

for (let hop = 0; hop < MAX_TOOL_HOPS; hop += 1) {
  const response = await callModel(messages, tools);
  const toolRequest = extractToolRequest(response);

  if (!toolRequest) return response;

  assertAllowedTool(toolRequest.name); // allowlist
  const args = validateArgs(toolRequest.name, toolRequest.input); // validation du schéma

  const result = await runWithTimeout(
    () => executeTool(toolRequest.name, args),
    4_000 // millisecondes
  );

  messages.push(response);
  messages.push({
    role: 'tool',
    tool_call_id: toolRequest.id,
    content: JSON.stringify(result),
  });
}

throw new Error('Tool loop exceeded max hops');
```

Quelques habitudes de prod comptent tout de suite. Mets une limite dure sur le nombre de sauts d’outils, sinon un modèle confus tournera en rond avec ton budget. Rends les opérations d’écriture idempotentes, parce qu’un même appel peut être rejoué après un échec partiel. Loggue le nom de l’outil, sa latence et son résultat à chaque saut, parce que “l’agent a été bizarre” n’est pas un rapport d’incident exploitable. Et si un outil peut toucher à de l’argent, à des emails ou à des données client, ajoute une approbation humaine avant exécution.

J’utilise le tool calling quand le modèle a vraiment besoin d’un état externe pour finir la tâche. Si le résultat de l’outil ne change pas la décision suivante, saute la boucle et appelle directement le service. Tu auras le même résultat avec moins de pièces mobiles.
