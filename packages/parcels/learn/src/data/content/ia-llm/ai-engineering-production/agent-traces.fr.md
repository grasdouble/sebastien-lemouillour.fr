---
id: agent-traces
order: 15
difficulty: intermediate
tags: [LLM, observability, tracing, LangSmith, Langfuse]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

L'utilisateur te dit que ton agent "s'est arrêté au hasard après deux recherches". Les logs montrent un timeout et une réponse 200. Ça ne raconte toujours pas ce qui s'est passé. Les systèmes agentiques cassent entre les étapes, pas seulement à l'intérieur d'un appel API, et c'est précisément pour ça que les traces comptent.

Une trace donne l'histoire d'exécution : étape de planification, retrieval, appel d'outil, retry, guardrail, réponse finale. Sans cette chaîne, tu reconstruis le comportement à partir d'horodatages et d'hypothèses. Je considère qu'un agent n'est pas débuggable tant que je ne peux pas ouvrir une requête et voir le chemin complet entre l'input utilisateur et l'effet de bord.

La base portable, c'est [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/). Même si tu ajoutes ensuite une interface plus agréable, partir de spans et d'attributs garde ton instrumentation réutilisable. Ensuite, tu peux brancher des outils comme [LangSmith](https://docs.smith.langchain.com/) ou [Langfuse](https://langfuse.com/docs) quand tu veux une inspection étape par étape pensée pour les workflows LLM.

L'erreur que je vois partout, c'est de tracer trop peu. Des équipes créent un seul span `agent.run`, y accrochent la latence totale, puis appellent ça de l'observabilité. C'est décoratif. Je veux des spans enfants pour la planification, chaque appel modèle, chaque appel d'outil, chaque hop de retrieval et chaque couche de validation. Je veux aussi des attributs qui expliquent la surface de décision : outil choisi, nombre de retries, usage de tokens, estimation de coût, et aperçu sûr des inputs et outputs. Garde ces aperçus courts : le texte complet des prompts fait exploser ton volume d'export et peut déclencher les limites de débit de ton backend de traces plus vite que tu ne le penses. Pour le nommage des attributs, les [conventions sémantiques GenAI](https://opentelemetry.io/docs/specs/semconv/gen-ai/) (encore en développement) définissent un schéma standard pour les spans modèle et agent ; les adopter maintenant garantit que tes dashboards survivent à un changement de backend.

Ça devient encore plus important dès que tu ajoutes des fallbacks. Un appel modèle qui semble sain pris seul peut très bien faire partie d'une trace cassée parce que l'agent a choisi le mauvais outil, a retry avec un contexte périmé, puis a renvoyé une jolie réponse fausse. Les logs capturent des fragments. Les traces capturent la séquence.

J'aime modéliser les spans au plus près du workflow, pour que l'instrumentation reflète réellement le graphe de l'agent au lieu de vivre dans un wrapper HTTP générique.

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('agent-runtime');

export async function runSupportAgent(question: string) {
  return tracer.startActiveSpan('agent.run', async (agentSpan) => {
    agentSpan.setAttribute('agent.name', 'support-agent');
    agentSpan.setAttribute('user.question.preview', question.slice(0, 120)); // tronqué : ne jamais logger le prompt complet

    const plan = await tracer.startActiveSpan('llm.plan', async (planSpan) => {
      const tool = question.includes('invoice') ? 'billing.search' : 'docs.search';
      planSpan.setAttribute('agent.selected_tool', tool); // capture la décision de routage
      planSpan.end();
      return tool;
    });

    const toolResult = await tracer.startActiveSpan(`tool.${plan}`, async (toolSpan) => {
      toolSpan.setAttribute('tool.name', plan);
      toolSpan.setAttribute('tool.retry_count', 0); // incrémente à chaque retry pour détecter les retry storms
      const result = await searchKnowledgeBase(question, plan);
      toolSpan.setAttribute('tool.result_count', result.length); // un résultat vide est un signal, pas juste une valeur
      toolSpan.end();
      return result;
    });

    agentSpan.setAttribute('agent.tool_result_count', toolResult.length);
    agentSpan.end(); // clôturer le span racine en dernier, après tous les enfants

    return toolResult;
  });
}
```

Mon seuil est simple : si une trace ne peut pas te montrer la dernière étape réussie et la dépendance suivante qui a cassé en moins de 30 secondes, c'est une télémétrie jolie, pas une télémétrie utile.
