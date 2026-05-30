---
id: ai-application-testing
order: 18
difficulty: advanced
tags: [LLM, testing, Promptfoo, DeepEval, Playwright]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your unit tests are green, the deploy went out, and the assistant still booked the wrong meeting, exposed the wrong document, or skipped the confirmation step before a destructive tool call. That is the moment you realize you were testing code paths, not the AI application.

This only matters once your product has real workflows, real permissions, and real side effects. If the system is still a prompt in a notebook, classic testing advice is enough. Once an LLM can trigger tools, read retrieval results, and change UI state, you need a testing strategy that treats the model as one component inside a larger product surface.

My bias is strong here: I care more about side effects than eloquence. A beautifully phrased wrong action is still a production bug. That is why the test stack should start with contracts around tool permissions, schema validity, and business invariants. Then you add prompt and model regression suites with [Promptfoo](https://promptfoo.dev/docs/intro) or [DeepEval](https://docs.confident-ai.com/). Finally, you keep a thin layer of browser tests with [Playwright](https://playwright.dev/docs/intro) for the flows where UI, auth, and orchestration all interact.

The common mistake is trying to make browser tests judge prose quality. Do not do that. Browser tests should assert things the app owns: the right button becomes disabled, the confirmation modal appears, the tool log shows zero destructive calls, the retrieved source list matches the tenant, the final state is persisted. Text quality belongs in eval suites such as [OpenAI Evals](https://github.com/openai/evals) or model-graded checks, not in brittle end-to-end selectors.

I also want deterministic failure reproduction. That means fixtures for retrieval, recorded tool responses, and model stubs for critical flows. If a bug can only be reproduced by asking the live model five times until it misbehaves, you do not have a test, you have a ritual.

The strongest AI test suites mix layers on purpose: unit tests for adapters, contract tests for tool schemas, evals for behavior quality, and end-to-end tests for product guarantees. What I do not want is a giant pile of "ask the chatbot and snapshot the answer" tests. Those fail noisily and teach you almost nothing.

For browser coverage, this kind of test is much closer to reality than text snapshots.

```typescript
import { expect, test } from '@playwright/test';

test('requires confirmation before deleting meetings', async ({ page }) => {
  await page.route('**/api/agent', async (route) => {
    await route.fulfill({
      json: {
        answer: 'I can help, but I need confirmation before deleting calendar events.',
        toolCalls: [],
      },
    });
  });

  await page.goto('/assistant');
  await page.getByLabel('Ask assistant').fill('Delete all my meetings tomorrow');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('need confirmation')).toBeVisible();
  await expect(page.getByTestId('tool-call-count')).toHaveText('0');
});
```

My rule: if a failing AI test cannot block a deploy, or a critical production bug cannot be reproduced with fixtures and stubs, the suite is giving you comfort, not protection.
