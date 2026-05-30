---
id: ai-application-testing
order: 18
difficulty: advanced
tags: [LLM, testing, Promptfoo, DeepEval, Playwright]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Tes tests unitaires sont verts, le déploiement est parti, et l'assistant a quand même réservé le mauvais rendez-vous, exposé le mauvais document, ou sauté l'étape de confirmation avant un appel d'outil destructeur. C'est là que tu réalises que tu testais des chemins de code, pas l'application IA.

Ce sujet ne devient important que quand ton produit a de vrais workflows, de vraies permissions, et de vrais effets de bord. Si le système est encore un prompt dans un notebook, les conseils de test classiques suffisent. Dès qu'un LLM peut appeler des outils, lire du retrieval, et modifier l'état de l'interface, il faut une stratégie qui traite le modèle comme un composant parmi d'autres dans une surface produit plus large.

J'ai un biais assumé ici : les effets de bord comptent plus que l'élégance du texte. Une action fausse, même très bien formulée, reste un bug de production. Voilà pourquoi la pile de tests doit commencer par des contrats sur les permissions d'outils, la validité des schémas et les invariants métier. Ensuite, tu ajoutes des suites de régression prompt/modèle avec [Promptfoo](https://promptfoo.dev/docs/intro) ou [DeepEval](https://docs.confident-ai.com/). Enfin, tu gardes une fine couche de tests navigateur avec [Playwright](https://playwright.dev/docs/intro) pour les flux où interface, authentification et orchestration se croisent.

L'erreur classique, c'est d'essayer de faire juger la qualité prose par des tests navigateur. Il ne faut pas faire ça. Les tests navigateur doivent vérifier ce que l'application maîtrise réellement : le bon bouton devient inactif, la modale de confirmation apparaît, le journal d'outils indique zéro appel destructeur, la liste des sources récupérées correspond bien au tenant, l'état final est persisté. La qualité textuelle, elle, appartient aux suites d'evals comme [OpenAI Evals](https://github.com/openai/evals) ou à des checks notés par modèle, pas à des sélecteurs end-to-end fragiles.

Je veux aussi une reproduction déterministe des pannes. Ça implique des fixtures pour le retrieval, des réponses d'outils enregistrées, et des stubs modèle sur les flux critiques. Si un bug ne peut être reproduit qu'en posant cinq fois la même question au modèle live jusqu'à ce qu'il déraille, ce n'est pas un test, c'est un rituel.

Les meilleures suites de tests IA mélangent volontairement les couches : tests unitaires pour les adaptateurs, tests de contrat pour les schémas d'outils, evals pour la qualité comportementale, et end-to-end pour les garanties produit. Ce que je ne veux pas, c'est une montagne de tests du genre "on demande au chatbot et on snapshot la réponse". Ça casse bruyamment et ça n'apprend presque rien.

Pour la couverture navigateur, un test de ce genre est beaucoup plus proche de la réalité qu'un snapshot de texte.

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

Ma règle : si un test IA en échec ne peut pas bloquer un déploiement, ou si un bug critique de production ne peut pas être reproduit avec des fixtures et des stubs, alors la suite t'apporte du réconfort, pas de la protection.
