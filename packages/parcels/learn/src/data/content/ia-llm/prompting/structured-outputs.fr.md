---
id: structured-outputs
order: 12
difficulty: intermediate
tags: [prompting, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Un JSON valide ressemble à une victoire jusqu’au moment où un enum manquant fait tomber le service d’après. Je l’ai appris de la façon agaçante : le parseur était content, TypeScript aussi, et la règle métier explosait quand même parce que `"priority": "urgent-ish"` n’était une valeur prise en charge par personne.

Les structured outputs, c’est ce que je choisis quand le backend dépend de la forme, pas seulement de la syntaxe. Le [guide Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) d’OpenAI permet d’attacher un schéma JSON Schema et de demander au modèle une sortie qui le respecte. Le gain n’est pas cosmétique. Tu déplaces le contrat depuis un prompt flou vers une interface vérifiable par la machine.

Ça change aussi la manière de penser le prompting. La [présentation de JSON Schema](https://json-schema.org/overview/what-is-jsonschema) mérite vraiment la lecture, parce qu’à partir du moment où tu définis des enums, des propriétés requises et des objets imbriqués, tu n’es plus “juste en train d’écrire un prompt”. Tu es en train de concevoir une frontière d’API, et les erreurs de schéma vivent souvent beaucoup plus longtemps que la formulation du prompt.

Le détail que beaucoup oublient, c’est la branche de refus. Les structured outputs n’obligent pas le modèle à répondre à une demande dangereuse ou impossible, donc ton code a toujours besoin d’un vrai chemin de repli. Un autre détail opérationnel des docs compte en production : la première requête avec un nouveau schéma peut ajouter de la latence pendant le traitement du schéma. C’est acceptable sur un outil interne, beaucoup moins drôle sur un hot path que personne n’a préchauffé.

Voici le genre d’appel que j’utilise quand un payload typé n’est pas négociable :

```ts
const response = await client.responses.create({
  model: 'gpt-4.1',
  input: 'Classify this lead based on the transcript.',
  text: {
    format: {
      type: 'json_schema',
      name: 'lead_classifier',
      strict: true,
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          segment: { type: 'string', enum: ['startup', 'agency', 'enterprise'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          needs_demo: { type: 'boolean' },
        },
        required: ['segment', 'priority', 'needs_demo'],
      },
    },
  },
});
```

Je garde quand même le prompt lui-même très sobre et très explicite. Le [guide de prompt engineering](https://platform.openai.com/docs/guides/prompt-engineering) reste valable : des consignes claires et de bons exemples comptent toujours, même quand la sortie est typée. Un schéma empêche la dérive structurelle, pas la bêtise sémantique.

La comparaison utile, c’est le [guide JSON mode](https://platform.openai.com/docs/guides/text-generation#json-mode). Le JSON mode résout la parseabilité. Les structured outputs résolvent la parseabilité plus l’adhérence au schéma. Cette garantie supplémentaire coûte un peu de setup et un peu de dépendance au provider, mais elle fait gagner beaucoup de code défensif dès que ton système dépend de champs exacts.

Mon seuil est très simple. Dès que le code en aval branche sur des clés, des enums ou des champs requis, paie la taxe du schéma tout de suite. Le texte libre est amusant pour les démos. Les contrats, eux, survivent à la production.
