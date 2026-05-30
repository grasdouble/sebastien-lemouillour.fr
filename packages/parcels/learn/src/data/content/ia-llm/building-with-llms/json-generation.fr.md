---
id: json-generation
order: 11
difficulty: intermediate
tags: [LLM, JSON, Prompting, validation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton parseur ne casse jamais pendant la démo. Il casse trois semaines plus tard, quand le modèle ajoute « voici le JSON » avant la première accolade et que ton job en arrière-plan commence à lancer des exceptions à 2 heures du matin.

Quand le vrai problème, c’est la parseabilité, la génération de JSON reste le contrat utile le moins cher. Le [guide JSON mode](https://platform.openai.com/docs/guides/text-generation#json-mode) d’OpenAI permet d’imposer un JSON syntaxiquement valide au lieu de simplement le demander poliment en espérant que le modèle coopère. Rien que ça enlève déjà beaucoup de nettoyage fragile au regex.

Le piège, et c’est celui qu’on découvre toujours en prod, c’est qu’un JSON valide n’est pas forcément un JSON utile. Le [guide Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) le dit clairement : le JSON mode garantit un JSON valide, pas l’adhérence à ton schéma. La réponse peut se parser sans souci tout en oubliant un champ requis ou en inventant une clé parce que le modèle s’est cru inspiré.

C’est pour ça que j’utilise la génération de JSON pour de l’extraction légère, des décisions de routage, et des métadonnées peu risquées. C’est excellent quand la forme reste petite et encore mouvante. En revanche, je ne lui confie pas des contrats qui pilotent la facturation, les permissions, ou des embranchements métier.

Voici la version que j’utilise quand je veux un petit payload JSON sans passer tout de suite à un schéma strict :

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

Même dans ce cas, je valide encore l’objet côté serveur et je limite sévèrement les retries. Le [guide de prompt engineering](https://platform.openai.com/docs/guides/prompt-engineering) revient sans cesse sur les evals et l’itération, et il a raison : les boucles de réparation sont très faciles à ajouter, puis très faciles à oublier. Mon défaut favori, c’est un retry pour un échec de parsing, un retry pour un échec de validation, puis un vrai chemin d’erreur visible.

Il y a aussi un angle sécurité que beaucoup balayent un peu vite. Le contenu JSON reste une entrée non fiable. Un champ texte peut contenir de la prompt injection, du HTML, des fragments SQL, ou n’importe quelle saleté qu’il ne faut surtout pas renvoyer dans un autre système sans contrôle.

Ma règle est simple. Utilise le JSON mode quand la parseabilité est le principal problème et que le schéma peut rester souple. Dès que le code en aval dépend de champs exacts ou d’enums, arrête de négocier avec du « JSON à peu près correct » et passe aux structured outputs.
