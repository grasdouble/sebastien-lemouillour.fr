---
id: ai-application-testing
order: 18
difficulty: advanced
tags: [llm, testing]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Your tests pass, the release ships, and the assistant still deletes the wrong record or cites data from the wrong customer workspace. That is the failure that forces a grown-up test strategy: your bug is no longer bad text, it is an unsafe product action.

This only matters once the system has real permissions and side effects. If you are not shipping tools, retrieval, or state changes, keep the stack simple. Once those pieces land, I would start with contracts around tool permissions, [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) validation, and business invariants, because a fluent answer that triggers the wrong action is still a production defect.

The next problem is attribution. When a run goes wrong, you need to know whether the failure came from prompting, retrieval, orchestration, or the UI. I would instrument those paths with [OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/gen-ai/) before adding more tests, because a red build without usable traces is just theater.

After that, split the suite by ownership. Prompt and model regressions belong in [Promptfoo](https://promptfoo.dev/docs/intro) or [DeepEval](https://docs.confident-ai.com/), where you can compare outputs and score behavior across fixtures. Product guarantees belong in [Playwright](https://playwright.dev/docs/intro), which is good at asserting what your app actually owns: a button is disabled, a confirmation modal appears, the tool log stays empty, the retrieved source list matches the authorized workspace, the final state is persisted.

Do not ask browser tests to judge prose quality. That job belongs in eval systems such as [OpenAI Evals](https://platform.openai.com/docs/guides/evals), or whatever model-graded checks you already trust in CI. Browser selectors should decide whether the product enforced policy and preserved invariants. If you let end-to-end tests grade wording, you will burn time on flaky failures and still miss the destructive call that mattered.

The other non-negotiable is deterministic replay. Use retrieval fixtures, recorded tool responses, and model stubs for critical flows. If you need five live runs before the model slips, you do not have a test suite yet; you have a superstition.

For browser coverage, I would rather ship a test like this than another snapshot of assistant prose.

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

My cutoff is simple: if a failing AI test cannot stop a deploy, or a Sev-1 bug cannot be replayed from fixtures and traces, the suite is too soft for production.
