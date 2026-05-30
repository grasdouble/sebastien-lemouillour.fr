---
id: output-validation
order: 13
difficulty: intermediate
tags: [LLM, Zod, Pydantic, validation, schema]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le modèle renvoie du JSON 95 % du temps. Les 5 % restants, il l’enveloppe dans un petit paragraphe poli, et ton worker tombe avant le lever du jour.

J’ai arrêté d’essayer de “mieux prompter” ce problème il y a longtemps. Si la sortie alimente une écriture en base, un webhook ou une décision visible par un client, le modèle n’a pas le droit d’improviser la forme. Des fonctions comme [structured outputs](https://platform.openai.com/docs/guides/structured-outputs) aident énormément parce qu’elles contraignent la génération à un schéma. Ça supprime toute une classe de bugs de format. Ça ne supprime pas les contrôles métier de ton application.

Cette deuxième couche compte parce qu’un JSON valide n’est pas la même chose qu’une donnée métier valide. Un modèle peut renvoyer `"priority": "urgent"` alors que ton système n’accepte que `low | medium | high`. En JavaScript, je prends [Zod](https://zod.dev/) parce que j’ai le parsing et des erreurs lisibles au même endroit. En Python, [Pydantic](https://docs.pydantic.dev/) remplit le même rôle. Le nom de la lib m’importe moins que le fait d’avoir un contrat unique que tous les appels respectent.

Le point que la plupart des tutos sautent, c’est le flux de contrôle. La validation n’est pas un bonus agréable après la génération, c’est elle qui décide de la suite. Est-ce que tu retentes une fois avec l’erreur de validation ? Est-ce que tu répares localement certains champs ? Est-ce que tu jettes la réponse et tu alertes ? Si tu ne fais rien de tout ça, tu n’as pas construit un pipeline, tu as construit un pile ou face avec un super branding.

Voilà la forme que j’expédierais en TypeScript :

```ts
import { z } from 'zod';

const TicketSummary = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  // Garde des catégories étroites, les enums larges dérivent vite.
  category: z.enum(['billing', 'bug', 'feature', 'account']),
  // Borne le texte libre pour faire échouer les mauvaises sorties tôt.
  summary: z.string().min(20).max(280),
  needsHuman: z.boolean(),
});

export async function parseTicketSummary(rawText: string) {
  const parsed = TicketSummary.safeParse(JSON.parse(rawText));

  if (parsed.success) return parsed.data;

  throw new Error(
    `Invalid LLM output: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`
  );
}
```

Quelques règles m’ont évité de gaspiller de l’argent. Garde des schémas plus étroits que ton instinct ne le voudrait. Limite les retries à une ou deux tentatives, parce que chaque “essaie encore” brûle des tokens et te rapproche des rate limits. Loggue la réponse brute quand le parsing échoue, mais nettoie les secrets avant que ça parte dans l’observabilité. Et si tu as besoin de champs optionnels partout, c’est souvent le signe que ton prompt ou ton découpage de tâche est bancal.

Ma règle est simple : si la sortie déclenche une action, valide-la. Si elle sert seulement à aider un humain à réfléchir, tu peux être plus souple. À partir du moment où une mauvaise réponse peut te réveiller à 3 h du matin, la validation par schéma n’est plus optionnelle.
