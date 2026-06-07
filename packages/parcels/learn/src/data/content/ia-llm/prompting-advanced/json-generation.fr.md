---
id: json-generation
order: 11
difficulty: intermediate
tags: [prompting, evaluation, llm]
publishedAt: 2026-06-07
updatedAt: 2026-06-07
---

Ton parseur ne casse pas pendant la démo. Il casse quand une phrase trop polie se glisse avant la première accolade et qu’un cron commence à s’étouffer à 2 heures du matin.

Pour éviter ça, je sépare deux besoins. Si je veux seulement une sortie parseable, je peux encore demander du JSON ou utiliser le [JSON mode](https://platform.openai.com/docs/guides/text-generation#json-mode) d’OpenAI avec `text.format: { type: 'json_object' }`. Ce mode plus ancien reste utile pour de l’extraction légère, mais OpenAI est clair : il garantit un JSON valide, pas le respect d’un schéma.

Quand une mauvaise clé peut déclencher une automatisation, j’arrête de négocier avec le modèle. OpenAI recommande les [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs), Anthropic explique dans ses [conseils de consistance](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency) qu’il faut quitter les rustines de prompt quand tu as besoin de garanties, et Gemini expose une [sortie structurée](https://ai.google.dev/gemini-api/docs/structured-output). Le bon réflexe est simple : le prompting et le JSON mode réduisent les dérives de format ; les API à schéma servent de contrat.

Quand la forme bouge encore, ce pattern plus léger suffit souvent :

```ts
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-mini', // modèle peu coûteux pour une extraction légère
  input: [
    {
      role: 'developer',
      content: 'Extract sentiment, urgency, and product. Return JSON only.', // consigne de sortie
    },
    { role: 'user', content: ticketText }, // message brut de l’utilisateur
  ],
  text: {
    format: { type: 'json_object' }, // JSON valide uniquement, sans contrainte de schéma
  },
});

const payload = JSON.parse(response.output_text);
```

Même sur cette voie bon marché, le parsing ne suffit pas. Valide les enums et les champs requis côté serveur, puis coupe vite les retries. Chaque boucle de réparation consomme des tokens et du budget de requêtes, donc une extraction minuscule peut vite devenir un problème de coût et de [rate limits](https://platform.openai.com/docs/guides/rate-limits).

Quand le payload va piloter du code, passe à un schéma au lieu d’ajouter encore du texte au prompt. Claude utilise maintenant les [structured outputs](https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs) via `output_config.format`, Anthropic signale que `output_format` correspond à l’ancienne forme bêta, et la même doc précise que la garantie repose sur du constrained decoding. Gemini applique la même idée avec `application/json` plus un schéma, exposé en `responseFormat` en JavaScript et en `response_format` en Python.

Avant cet appel plus strict, je veux que le schéma fasse lui-même la police :

```ts
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-mini', // famille de modèles compatible Structured Outputs
  input: [
    {
      role: 'developer',
      content: 'Classify the ticket and return only the requested fields.', // définition de la tâche
    },
    { role: 'user', content: ticketText }, // message brut à analyser
  ],
  text: {
    format: {
      type: 'json_schema',
      name: 'ticket_triage', // nom de schéma utile pour le suivi
      strict: true, // impose la forme attendue
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          sentiment: {
            type: 'string',
            enum: ['positive', 'neutral', 'negative'],
          },
          urgency: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
          product: { type: 'string' },
        },
        required: ['sentiment', 'urgency', 'product'],
      },
    },
  },
});

const payload = JSON.parse(response.output_text);
```

Une règle de sécurité survit à tous les fournisseurs : un JSON parsé reste une entrée non fiable. Utilise des listes autorisées pour les actions aval, garde des schémas petits, et supprime les champs que tu n’as pas demandés. Mon seuil est simple : si un humain peut relire avant que ça compte, un JSON souple suffit ; si la sortie peut dépenser de l’argent, changer des permissions, ou déclencher des effets de bord, pose un schéma avant la mise en prod.
