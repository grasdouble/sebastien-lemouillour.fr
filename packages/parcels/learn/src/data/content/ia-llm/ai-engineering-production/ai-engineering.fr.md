---
id: ai-engineering
order: 21
difficulty: advanced
tags: [LLM, architecture, evaluation, observability]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le prototype marche le vendredi. Le lundi, la récupération est périmée, le prompt a grossi de 40 %, la latence a doublé, et personne ne sait si le gain de qualité vient du changement de modèle ou du tweak sur le ranking. C'est exactement la frontière entre bricoler des prompts et faire de l'ingénierie IA.

Je vois l'ingénierie IA comme du design d'interfaces sous incertitude. Le modèle est la dépendance la moins stable de la pile, donc le code produit ne doit pas lui être marié. Les [patterns d'architecture de Martin Fowler](https://martinfowler.com/articles/building-with-genai.html) le montrent bien : séparer l'orchestration de la logique métier, et isoler tout ce qui parle au modèle. Chip Huyen's book on ML systems design pousse vers la même discipline, surtout après quelques expériences qui ont fui en production.

Mon biais est simple : rendre explicites quatre frontières, récupération, passerelle de modèles, évaluation, décision métier. La récupération apporte des documents. La passerelle choisit et appelle les modèles. L'évaluation mesure si un changement est acceptable. Le code métier décide ce que l'utilisateur peut réellement faire. Si tout se mélange, chaque expérimentation devient un refactor.

Il faut aussi une abstraction honnête sur la variabilité. Les fournisseurs n'exposent pas les mêmes comportements sur les outils, les limites de contexte ou les modes d'échec. Une passerelle comme [LiteLLM](https://docs.litellm.ai/) est utile parce qu'elle centralise le routage, les retries et la visibilité sur la dépense. Des piles de serving auto-hébergées comme [vLLM](https://docs.vllm.ai/) deviennent pertinentes quand le débit ou la localisation des données deviennent des sujets d'architecture, pas parce que l'auto-hébergement serait à la mode.

Voilà le genre de contrat que je veux voir dans le code avant même que l'équipe ajoute un deuxième modèle.

```ts
type AiRequest = { task: 'support' | 'search'; input: string; tenantId: string };
type AiResult = { answer: string; citations: string[]; traceId: string };

export async function runAiTask(req: AiRequest): Promise<AiResult> {
  const docs = await retrieval.fetch(req);
  const completion = await modelGateway.generate({ req, docs });
  await evaluations.record({ req, completion });
  return decisionLayer.format(completion);
}
```

Ce contrat a l'air banal, et c'est précisément l'objectif. Des contrats banals permettent de changer les prompts, la stratégie de ranking ou le vendor sans apprendre à chaque équipe produit comment fonctionne l'inférence.

Le pattern d'échec que je vois le plus souvent, c'est des équipes qui optimisent les prompts avant de stabiliser les interfaces. Les prompts changent toutes les semaines. Les contrats doivent tenir le trimestre. Si changer de fournisseur vous oblige à retoucher les écrans produit, les workers de queue et la logique de permissions, vous n'avez pas encore de l'ingénierie IA, vous avez du câblage de prompts avec une facture en plus.
