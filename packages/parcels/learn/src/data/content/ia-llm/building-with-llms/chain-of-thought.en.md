---
id: chain-of-thought
order: 7
difficulty: intermediate
tags: [LLM, Prompting, reasoning]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your prompt works until the input contains one exception and two numbers. Then the model jumps straight to an answer, skips the middle step, and you end up debugging an adjective like it was a production outage.

That is where chain of thought becomes useful. The original [chain-of-thought paper](https://arxiv.org/abs/2201.11903) showed that giving the model intermediate reasoning examples can improve complex reasoning, especially on arithmetic, commonsense, and symbolic tasks. I still use the idea, but only when the task is genuinely multi-step. For classification, retrieval, or simple rewriting, extra reasoning text often buys you latency and token cost, not quality.

The thing most tutorials skip is that chain of thought is not magic, it is scaffolding. You are telling the model where to pause, what evidence to collect, and when to commit. OpenAI’s [prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering) and Anthropic’s [prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) both push the same lesson in modern form: define success clearly, structure the task, and test prompts empirically instead of trusting vibes.

I also avoid asking for a giant visible monologue unless I truly need it. Verbose reasoning burns tokens, can leak business rules into logs, and makes evals noisy. My default is: reason briefly, answer cleanly. If I need auditability, I ask for short numbered checks, not a diary entry.

A practical pattern looks like this:

```txt
You are validating invoice line items.

Task:
1. Read the invoice text.
2. Extract quantities, prices, and discounts.
3. Check whether subtotal, tax, and total are mathematically consistent.
4. If one value is missing, return "missing_data".
5. Return:
   - reasoning: max 4 short bullet points
   - verdict: valid | invalid | missing_data
   - corrected_total: number or null

Invoice text:
"""{{invoice_text}}"""
```

The real win is not the label. The real win is separating observation from judgment. Step 2 forces the model to copy evidence before it decides, which makes failures much easier to inspect. When the answer is wrong, you can see whether it misread the source, skipped a calculation, or simply hallucinated confidence.

I still would not use this pattern everywhere. If the task can be checked with a deterministic function after the answer, keep the prompt short and let code do the verification. If the task fails because the model keeps skipping a hidden intermediate step, add chain of thought and cap the reasoning budget before it turns into paid improv.
