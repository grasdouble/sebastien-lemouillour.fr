---
id: self-consistency
order: 8
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Tu arrives enfin à stabiliser un prompt de raisonnement, puis la prod commence à renvoyer 42, 39, et « sans doute 41 » pour la même question. C’est là que tu arrêtes d’admirer le style et que tu recommences à exiger de la fiabilité.

L’auto-cohérence est la technique que je choisis quand une tâche devrait converger vers une seule réponse, même s’il existe plusieurs chemins plausibles pour y arriver. Le [papier](https://arxiv.org/abs/2203.11171) remplace le décodage glouton par plusieurs trajectoires de raisonnement échantillonnées, puis retient la réponse qui reste la plus cohérente entre elles. Dit comme ça, ça sent un peu le labo. En pratique, c’est simple : tu fais plusieurs runs et tu obliges l’accord à mériter la victoire.

Le vrai piège, c’est le coût. Le guide [model optimization](https://developers.openai.com/api/docs/guides/model-optimization) d’OpenAI est assez direct : les sorties d’un LLM sont non déterministes, et il faut des mesures pour savoir si un prompt progresse vraiment ou s’il vient juste de tomber sur un bon tirage. Si tu n’as pas construit des [evals](https://developers.openai.com/api/docs/guides/evals), l’auto-cohérence peut te rassurer tout en multipliant discrètement la facture. Une réponse à 2 000 tokens, ça passe. Cinq échantillons, ça transforme la même requête en petite réunion budgétaire.

Autre erreur que je vois souvent : voter sur le raisonnement au lieu de voter sur la réponse finale. Mauvaise idée. Vote sur une valeur finale normalisée, parce que l’explication la plus élégante de la pièce est souvent complètement fausse. Les LLM excellent à donner l’impression qu’ils ont fait les calculs.

Voici la version que je mettrais vraiment en prod pour une étape de raisonnement fragile :

```ts
const samples = await Promise.all(
  Array.from({ length: 5 }, async () => {
    const response = await client.responses.create({
      model: 'gpt-4.1',
      temperature: 0.7,
      input: prompt,
    });

    return extractFinalAnswer(response.output_text);
  })
);

const answer = majorityVote(samples.map(normalizeAnswer));
```

Cinq échantillons suffisent souvent pour voir si le prompt est robuste ou juste chanceux. Si le score tombe sur un 2-2-1, je ne fais pas confiance à la majorité. Je traite ça comme de l’incertitude et soit j’escalade vers un modèle plus fort, soit je passe par une vérification déterministe. Ce signal vaut déjà la moitié du prix d’entrée.

Le [guide de tests](https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests) d’Anthropic pousse la même idée sous un autre angle : définir des critères de réussite, construire des évaluations, puis itérer. C’est pour ça que j’aime l’auto-cohérence en production. Ce n’est pas de la poussière magique pour le raisonnement, c’est un moyen assez bon marché de rendre le désaccord visible.

Utilise l’auto-cohérence quand une mauvaise réponse coûte assez cher pour justifier trois à cinq appels, par exemple pour de l’extraction financière, des contrôles de politique, ou des workflows avec pas mal de calcul. Oublie ça pour du texte de chat générique. Si tu n’es pas capable d’expliquer quoi faire quand les votes se dispersent, tu n’es pas prêt à payer les échantillons en plus.
