---
id: chain-of-thought
order: 7
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

You've got a prompt that works right until the input sneaks in one exception and two numbers. Then the model blurts out an answer, skips the part that mattered, and you end up debugging a sentence like it just paged you at 2 a.m.

Chain-of-thought prompting exists for exactly that mess. In the original [Wei et al. paper](https://arxiv.org/abs/2201.11903), the trick was simple: show intermediate reasoning steps in the examples, not just question-answer pairs. That improved arithmetic, commonsense, and symbolic reasoning on tasks that genuinely require several hops. I still use that idea, but I treat it like a scalpel. For classification, retrieval, or plain rewriting, visible reasoning is usually expensive theater.

The paper still matters, but provider guidance has moved. OpenAI's [reasoning guide](https://platform.openai.com/docs/guides/reasoning) says reasoning models already spend internal reasoning tokens before answering, and Anthropic's [prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) tells you to define success criteria and evals before fiddling with prompt wording. Translation: before you spray “think step by step” everywhere, make sure you picked the right model and can measure whether the extra thinking helps.

I also would not make the model dump a giant monologue unless I need to inspect failure modes. OpenAI's [prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering) still rewards clear structure, and Anthropic's [effort control](https://docs.anthropic.com/en/docs/build-with-claude/effort) makes the trade-off explicit: more thinking usually means more tokens and more latency. My default is boring on purpose: keep the answer clean, ask for short checks, and only expose reasoning when those checks help me debug or review.

Here's the version I'd actually ship:

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

The real win is not the phrase. The real win is separating observation from judgment. Step 2 forces the model to copy evidence before it decides, which makes failures much easier to inspect. When the answer is wrong, you can tell whether it misread the source, skipped a calculation, or confidently invented math. Classic model behavior, sadly.

My rule is simple: if I can verify the output with code, I keep the prompt short and let code be the adult in the room. I reach for visible chain of thought only when the task keeps failing on a hidden intermediate step and I need just enough reasoning to catch it, not a novella.
