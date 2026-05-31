---
id: ai-application-testing
order: 18
difficulty: advanced
tags: [llm, testing]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Tes tests passent, la mise en prod part, et l'assistant supprime quand même le mauvais enregistrement ou cite des données du mauvais espace client. C'est ce genre d'échec qui impose une vraie stratégie de test : ton bug n'est plus un texte médiocre, c'est une action produit dangereuse.

Ce sujet n'a d'intérêt que quand le système a de vraies permissions et de vrais effets de bord. Si tu ne livres ni outils, ni retrieval, ni changements d'état, garde une pile simple. Dès que ces briques arrivent, je commencerais par des contrats sur les permissions d'outils, la validation [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) et les invariants métier, parce qu'une réponse fluide qui déclenche la mauvaise action reste un défaut de production.

Le problème suivant, c'est l'attribution. Quand une exécution tourne mal, il faut savoir si l'échec vient du prompting, du retrieval, de l'orchestration ou de l'interface. J'instrumenterais ces chemins avec [OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/gen-ai/) avant d'ajouter plus de tests, parce qu'un build rouge sans traces exploitables n'est qu'une mise en scène.

Ensuite, sépare la suite par responsabilité. Les régressions prompt/modèle ont leur place dans [Promptfoo](https://promptfoo.dev/docs/intro) ou [DeepEval](https://docs.confident-ai.com/), où tu peux comparer des sorties et noter le comportement sur des fixtures. Les garanties produit, elles, relèvent de [Playwright](https://playwright.dev/docs/intro), qui sait vérifier ce que l'application maîtrise vraiment : un bouton est désactivé, une modale de confirmation apparaît, le journal d'outils reste vide, la liste des sources récupérées correspond à l'espace autorisé, l'état final est persisté.

N'utilise pas les tests navigateur pour juger la prose. Ce boulot appartient à des systèmes d'evals comme [OpenAI Evals](https://platform.openai.com/docs/guides/evals), ou aux checks notés par modèle auxquels tu fais déjà confiance dans la CI. Les sélecteurs navigateur doivent décider si le produit a bien appliqué la politique et préservé les invariants. Si tu laisses l'end-to-end noter le wording, tu perdras du temps dans des échecs instables et tu rateras quand même l'appel destructeur qui comptait.

L'autre exigence non négociable, c'est le rejeu déterministe. Utilise des fixtures de retrieval, des réponses d'outils enregistrées et des stubs modèle sur les flux critiques. S'il faut cinq exécutions live avant que le modèle dérape, tu n'as pas encore une suite de tests ; tu as une superstition.

Pour la couverture navigateur, je préfère livrer un test comme celui-ci plutôt qu'un snapshot de prose d'assistant en plus.

```typescript
import { expect, test } from '@playwright/test';

test('requires confirmation before deleting meetings', async ({ page }) => {
  await page.route('**/api/agent', async (route) => {
    await route.fulfill({
      json: {
        answer: "Je peux aider, mais j'ai besoin d'une confirmation avant de supprimer des événements calendrier.",
        toolCalls: [],
      },
    });
  });

  await page.goto('/assistant');
  await page.getByLabel('Ask assistant').fill('Supprime tous mes rendez-vous demain');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText("besoin d'une confirmation")).toBeVisible();
  await expect(page.getByTestId('tool-call-count')).toHaveText('0');
});
```

Mon seuil est simple : si un test IA en échec ne peut pas bloquer un déploiement, ou si un bug de prod Sev-1 ne peut pas être rejoué à partir de fixtures et de traces, alors la suite est trop molle pour la production.
