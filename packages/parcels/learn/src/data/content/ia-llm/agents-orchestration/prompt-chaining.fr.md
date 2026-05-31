---
id: prompt-chaining
order: 9
difficulty: intermediate
tags: [agents, prompting, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Un énorme prompt a l’air efficace jusqu’au moment où il doit classifier la demande, extraire des champs, appeler un outil, rédiger une réponse et se justifier dans le même appel. Ensuite, tu modifies une phrase, tout casse, et tu n’as aucune idée de l’étape qui a réellement raté.

C’est pour ça que je préfère le chaînage de prompts sur les workflows qui mélangent raisonnement et exécution. Au lieu de demander au modèle de faire cinq métiers en une fois, tu découpes le travail en petits prompts avec des entrées et sorties explicites. La [vue d’ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) recommande clairement de décomposer les tâches complexes, et le [guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) pousse la même approche via des consignes claires, des tâches séparées et des evals.

Le détail que beaucoup de tutos oublient, c’est que les frontières comptent plus que les prompts. Chaque étape doit avoir une responsabilité et un contrat. Si l’étape 2 échoue, tu dois savoir si le classifieur s’est trompé, si la recherche a ramené n’importe quoi, ou si la rédaction a ignoré la preuve. Si tu construis seulement un spaghetti prompt plus élégant, le chaînage ne t’apporte rien.

J’aime aussi cette approche parce qu’elle rend le coût visible. Un prompt géant cache le gaspillage dans un seul appel. Une chaîne te force à voir que ta “petite feature” exécute maintenant quatre appels modèle, deux retries et un passage de validation. C’est douloureux, mais c’est une douleur utile.

Voici une chaîne que je préfère largement à un méga-prompt :

```ts
const intent = await classifyTicket(ticketText); // billing | bug | sales
const context = await retrieveContext(intent, ticketText);
const draft = await draftReply({
  ticketText,
  intent,
  context,
});
const finalReply = await validateReply(draft); // ton, policy, faits manquants
```

Le point important n’est pas la syntaxe, c’est le contrat entre les étapes. Je rends en général chaque frontière vérifiable par la machine avec du JSON, parce qu’un échec typé se rattrape mieux qu’un paragraphe poli. Le [guide Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) aide beaucoup ici, même sans aller jusqu’au système full schema-first, parce qu’il te force à penser en champs, enums et données requises avant que la chaîne ne commence à mordre.

Il y a un autre piège : ne réinjecte jamais la sortie brute d’un outil dans le prompt suivant comme si c’était la vérité. Les résultats de recherche, les pages scrapées et le texte utilisateur doivent rester du contexte non fiable et clairement délimité. Le [guide guardrails](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks) le dit assez clairement : ajoute de la validation et du monitoring, sinon la prompt injection traverse ton pipeline en courant.

Ma règle est simple. Chaîne les prompts quand chaque étape peut être testée, loggée et rejouée indépendamment. Si deux étapes ratent toujours ensemble, fusionne-les. Si un seul appel foireux empoisonne tout le flux, découpe plus tôt et ajoute un contrat plus solide.
