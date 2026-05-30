---
id: llm-workflows
order: 16
difficulty: intermediate
tags: [LLM, workflows, orchestration, reliability]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La première version, c’est toujours un seul prompt. Deux semaines plus tard, ce prompt fait la classification, la recherche, la rédaction, le formatage, les fallbacks, et présente ses excuses quand un étage casse.

La plupart des équipes voient ce bazar et sautent directement à “il nous faut un agent”. La plupart du temps, il leur faut un workflow. Un workflow, c’est juste une orchestration explicite : des étapes nommées, des branchements bornés, des entrées et sorties claires. Tu peux très bien utiliser [structured outputs](https://platform.openai.com/docs/guides/structured-outputs) dedans, et appeler des outils avec [function calling](https://platform.openai.com/docs/guides/function-calling). La différence, c’est que le chemin est visible. D’après la [vue d’ensemble LangChain](https://python.langchain.com/docs/concepts/agents/), les agents sont utiles quand l’action suivante doit être décidée dynamiquement. Si tu connais déjà le chemin, garde-le déterministe.

Ce choix compte parce qu’un workflow coûte moins cher à déboguer. Quand l’étape trois casse, tu sais où regarder. Quand une boucle d’agent casse, tu récupères souvent une transcription floue et un après-midi perdu. Pour la majorité des features produit, déterministe bat malin.

Avant le code, voilà ce que beaucoup de gens ratent : les workflows sont l’endroit où tu gagnes sur les coûts. Mets le modèle bon marché au début pour le routage et l’extraction, puis réserve le modèle cher au petit pourcentage de requêtes qui ont vraiment besoin d’un raisonnement plus profond.

Voilà une forme de workflow que j’expédierais pour des réponses support :

```ts
export async function runSupportReplyWorkflow(ticket: Ticket) {
  const routing = await classifyTicket(ticket.body); // modèle peu cher, schéma strict

  if (routing.needsHuman) {
    return { status: 'escalated', reason: routing.reason };
  }

  const docs = await retrieveDocs({
    product: routing.product,
    topic: routing.topic,
    maxResults: 4,
  });

  const draft = await draftReply({
    ticket,
    docs,
    tone: 'clear',
  });

  const verification = await verifyReply({
    draft,
    docs,
    requireCitations: true,
  });

  return verification.approved ? { status: 'ready', draft } : { status: 'review' };
}
```

Quelques patterns gardent les workflows sains. Persiste le résultat de chaque étape pour que les retries repartent du dernier checkpoint valide au lieu de rejouer toute la chaîne. Donne à chaque étape son propre timeout et son propre budget d’erreur, parce qu’un problème de retrieval et un problème de modèle ne méritent pas le même fallback. Ajoute des branches explicites de revue humaine pour les cas à risque, comme les remboursements, le juridique ou le médical. Et si un workflow appelle des API externes, expose les rate limits comme un état normal, pas comme un mystérieux “AI error”.

Ma règle est brutale : si tu peux dessiner le chemin sur un seul tableau blanc, prends un workflow. Sors l’agent uniquement quand l’étape suivante dépend vraiment d’observations que tu ne peux pas prévoir à l’avance.
