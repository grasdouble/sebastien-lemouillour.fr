---
id: chain-of-thought
order: 7
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-06-10
updatedAt: 2026-06-10
---

Your prompt looks solid until one exception and two totals land in the same input. Then the model jumps to a verdict, skips the arithmetic, and hands you a polished wrong answer.

Chain-of-thought earns its keep in that exact situation. In [Wei et al. 2022](https://arxiv.org/abs/2201.11903), the gain came from few-shot examples that included intermediate reasoning, which improved arithmetic, commonsense, and symbolic tasks when the model had to make several linked steps.

My stance: in 2026, visible chain-of-thought is not the default. OpenAI's [reasoning guide](https://platform.openai.com/docs/guides/reasoning) says reasoning models already spend internal reasoning tokens, exposes effort controls such as `low` to `xhigh`, and defaults `gpt-5.5` to `medium`. Anthropic's [overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) makes the same practical point from another angle: define success criteria and evals before tuning wording, because latency and cost are often a model-choice problem before they are a prompt problem.

So I start with short, inspectable reasoning, not a diary. OpenAI's [prompt guide](https://platform.openai.com/docs/guides/prompt-engineering) also reminds you that Responses output can contain reasoning-related items in addition to text. That is one more reason to keep the customer-facing answer clean, validate the final result in code, and avoid dumping long traces into logs unless you truly need them.

When I need a reasoning trace that a human can review quickly, I use a prompt like this:

```ts
import OpenAI from 'openai';

const client = new OpenAI();

async function checkInvoice(invoiceText: string) {
  return client.responses.create({
    model: 'gpt-5.5', // reasoning model for multi-step checks
    reasoning: { effort: 'low' }, // raise only if evals show a real gain
    input: [
      {
        role: 'user',
        content: `
You are validating invoice totals.

Steps:
1. Extract quantities, unit prices, discounts, subtotal, tax, and total.
2. Verify the math.
3. If a required value is missing, return "missing_data".

Return JSON with:
- evidence: up to 3 short bullets
- verdict: "valid" | "invalid" | "missing_data"
- correctedTotal: number | null

Invoice:
"""${invoiceText}"""
        `,
      },
    ],
  });
}
```

What makes this work is not the phrase "think step by step". It is the structure. The model gathers evidence before judging, the reasoning trace is capped, and your app still owns the final check. That keeps token spend and rate-limit pressure lower than a full scratchpad, while leaving enough trail to debug the failures that actually matter.

If you truly need raw reasoning for debugging, Anthropic's [extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking) can return `thinking` blocks, and its latest Claude docs recommend adaptive thinking on newer models while manual `budget_tokens` modes are deprecated or rejected on some versions. Use that sparingly, and never as the only guardrail.

Use chain-of-thought when the task fails because of a missing intermediate step you can inspect. Skip it for classification, retrieval, or any flow where code can verify the answer cheaply. If three short evidence bullets are not enough, fix the task design before you ask for a novel.
