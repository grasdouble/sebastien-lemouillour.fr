---
id: json-generation
order: 11
difficulty: intermediate
tags: [prompting, evaluation, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Ton parseur ne casse jamais pendant la démo. Il casse trois semaines plus tard, quand le modèle ajoute « bien sûr, voici le JSON » avant la première accolade et que ton job en arrière-plan commence à lancer des exceptions à 2 heures du matin.

Quand le vrai problème, c’est la parseabilité, la génération de JSON reste le contrat utile le moins cher. Le [guide JSON mode](https://platform.openai.com/docs/guides/text-generation#json-mode) d’OpenAI permet d’imposer un JSON syntaxiquement valide au lieu de simplement le demander poliment en espérant que le modèle coopère. Rien que ça enlève déjà beaucoup de code de nettoyage fragile.

Le piège, et c’est celui qu’on découvre toujours en prod, c’est qu’un JSON valide n’est pas forcément un JSON utile. Le [guide Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) le dit clairement : le JSON mode garantit un JSON valide, pas l’adhérence à ton schéma. La réponse peut se parser sans souci tout en oubliant un champ requis ou en inventant une clé parce que le modèle s’est cru inspiré.

C’est pour ça que j’utilise la génération de JSON pour de l’extraction légère, des indices de routage, et des métadonnées peu risquées. C’est excellent quand la forme reste petite et encore mouvante. En revanche, je ne lui confie pas de contrats qui pilotent la facturation, les permissions, ou des embranchements métier, sauf si j’ai envie de déboguer des bêtises évitables.

Quand je veux un petit payload JSON et que la forme bouge encore, c’est ce pattern que je prends en pratique :

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: [
    {
      role: 'developer',
      content: 'Extract sentiment, urgency, and product from the user message. Return JSON only.',
    },
    { role: 'user', content: ticketText },
  ],
  text: {
    format: { type: 'json_object' }, // JSON valide, pas validation de schéma
  },
});

const payload = JSON.parse(response.output_text);
```

Même dans ce cas, je valide encore l’objet côté serveur et je limite sévèrement les retries. Le [guide des evals](https://platform.openai.com/docs/guides/evals) a raison d’insister sur l’itération et la mesure, parce que les boucles de réparation sont ridiculement faciles à ajouter et péniblement faciles à laisser tourner pour toujours. Mon réglage par défaut, c’est un retry pour un échec de parsing, un retry pour un échec de validation, puis un vrai chemin d’erreur visible.

Si tu bosses sans validation stricte par schéma, le [guide Anthropic sur la consistance](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency) rappelle utilement que préremplir la réponse de l’assistant et donner des exemples réduit les préambules polis. Je traite quand même ça comme un pansement, pas comme un contrat.

Ma règle est simple. Utilise le JSON mode quand la parseabilité est le principal problème et que le schéma peut rester souple. Si une mauvaise clé peut déclencher un mouvement d’argent, un contrôle de permission, ou une automatisation, arrête de négocier et passe aux structured outputs dès le premier jour.
