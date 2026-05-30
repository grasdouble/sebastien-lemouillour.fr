---
id: function-calling
order: 14
difficulty: intermediate
tags: [LLM, OpenAI, function-calling, schema]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La version gênante du function calling, c’est quand le modèle dit “j’ai réservé le rendez-vous” alors qu’il n’a absolument rien fait.

Le function calling existe pour couper court à cette comédie. Avec le [function calling](https://platform.openai.com/docs/guides/function-calling), le modèle n’exécute pas l’action lui-même. Il renvoie une demande structurée disant quelle fonction il veut appeler et avec quels arguments. Ton code garde l’exécution, les permissions, les retries et la gestion d’erreur. Toute la valeur est dans cette séparation.

Ce que la plupart des tutos conçoivent mal, c’est le schéma. Si ton outil prend `query: string`, `options: object` et `metadata: any`, tu n’as pas défini une fonction, tu as donné un lance-flammes au modèle. Traite le schéma comme un contrat d’API. Plus il est simple et serré, moins tu débogueras d’appels absurdes plus tard. Les règles de [JSON Schema](https://json-schema.org/understanding-json-schema/) sont utiles ici, parce qu’elles t’obligent à expliciter les enums, les champs requis et les objets imbriqués. Si tu veux que le modèle reste vraiment dans les rails, combine la définition de l’outil avec des [strict schemas](https://platform.openai.com/docs/guides/structured-outputs).

Avant le code, voilà le piège dans lequel je suis tombé : le function calling rend les démos magiques, donc les gens laissent le modèle choisir trop de choses. En prod, je veux qu’il choisisse parmi quelques opérations sûres, pas qu’il invente un mini langage de requête pour mon backend.

Voilà le type de définition que je considère fiable :

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

Quelques règles rendent ça robuste. Ne laisse jamais les arguments d’outil partir directement vers du SQL, du shell ou des API tierces sans une nouvelle validation. Accroche l’auth et les contrôles de tenant en dehors de la boucle du modèle, parce que le modèle ne sait pas qui a le droit de faire quoi. Anticipe aussi la latence supplémentaire : chaque appel d’outil implique souvent un autre aller-retour modèle, donc il faut le budgéter et afficher des états de chargement côté UI.

J’utilise le function calling quand le modèle doit choisir dans un petit menu d’actions. Si tu te retrouves à ajouter vingt fonctions vaguement similaires, arrête-toi. C’est souvent le moment où la surface d’outil cache en réalité un problème de design produit.
