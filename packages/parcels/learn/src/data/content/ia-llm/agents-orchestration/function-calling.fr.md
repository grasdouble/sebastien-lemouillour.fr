---
id: function-calling
order: 14
difficulty: intermediate
tags: [prompting, tools, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Tu connais la version pénible des features IA : le modèle annonce fièrement “c’est fait”, et ton app n’a absolument rien fait.

Le function calling existe pour tuer ce mensonge. Chez [OpenAI](https://platform.openai.com/docs/guides/function-calling), [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) et [Gemini](https://ai.google.dev/gemini-api/docs/function-calling), la boucle de base reste la même : le modèle renvoie une demande d’outil structurée, ton application exécute l’action, puis tu peux renvoyer le résultat pour obtenir la réponse finale. J’aime ce pattern parce que la partie dangereuse, les vrais effets de bord, reste dans du code normal, là où l’auth, les retries et les logs d’audit ont leur place.

Là où la plupart des tutos se ratent, c’est le schéma. Si ton outil prend `query: string`, `options: object` et `metadata: any`, tu n’as pas défini une fonction, tu as donné un lance-flammes au modèle. Traite le schéma comme un contrat d’API. Les détails chiants de [JSON Schema](https://json-schema.org/understanding-json-schema/) comptent plus que le prompt, parce que les enums, les champs requis et `additionalProperties: false` sont ce qui t’évite des appels absurdes à 2 h du matin. Si tu bosses avec OpenAI, j’activerais aussi les [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) avec des schémas stricts au lieu d’espérer que le modèle respecte ton format par magie.

Voilà le piège dans lequel je suis tombé : le function calling rend les démos plus intelligentes que le produit réel, donc les gens laissent le modèle choisir trop de choses. En prod, je veux un tout petit menu d’actions sûres, pas une aire de jeu en forme de backend.

En syntaxe façon OpenAI, voilà le genre de définition que je considère fiable :

```ts
const tools = [
  {
    type: 'function',
    function: {
      name: 'lookup_order',
      description: 'Fetch a customer order by public order number.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          orderNumber: {
            type: 'string',
            description: 'Human-facing order number, for example ORD-1042.',
          },
          includeRefundStatus: {
            type: 'boolean',
            description: 'Set true only when the user explicitly asks about refunds.',
          },
        },
        required: ['orderNumber', 'includeRefundStatus'],
        additionalProperties: false,
      },
    },
  },
];
```

Ensuite, garde les garde-fous. Revalide les arguments d’outil avant qu’ils touchent du SQL, du shell ou des API tierces. Garde l’auth et les contrôles de tenant hors de la boucle du modèle, parce que le modèle n’a aucune idée de qui a le droit de faire quoi. Et pense à la latence : le flux standard avec outils se fait en plusieurs étapes, donc un appel d’outil peut très bien ajouter un tour de modèle avant que l’utilisateur voie la réponse finale.

Ma règle est simple : j’utilise le function calling quand le modèle doit juste choisir parmi quelques opérations bien nommées. Si tu ajoutes des outils quasi identiques pour compenser un flou produit, arrête-toi et revois le workflow d’abord.
