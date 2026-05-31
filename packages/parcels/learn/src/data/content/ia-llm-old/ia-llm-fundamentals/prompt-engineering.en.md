---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [prompting, llm]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

You've asked the model the same thing three times and got three different answers. One is vague, one is overconfident, one is almost usable but impossible to parse. The trap is to keep piling on adjectives. I did that too. The faster fix is usually simpler: start with one clear instruction, then add structure only where the output fails.

[OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering), [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices), and [Google](https://ai.google.dev/gemini-api/docs/prompting-strategies) all keep pushing the same basics: be explicit, show examples when the task is ambiguous, and constrain the output when another system depends on it. My stance is blunt: do the boring version first. Fancy prompts are often just expensive confusion.

## Zero-shot: use it as the baseline, not the finish line

Zero-shot is still the cheapest way to probe a task. If the task is common and the success criteria are obvious, it may already be enough.

Before you add anything else, try the smallest prompt that can possibly work.

```text
Classify the sentiment of this review as Positive, Neutral, or Negative:

"The battery life is disappointing, but the screen quality is excellent."
```

When that output drifts, the next question is simple: did the model misunderstand the task, or did it misunderstand your definition of good?

## Few-shot: spend examples where the output drifts

When the task is ambiguous, examples beat longer prose because they show format, edge cases, and taste. Anthropic's [consistency guide](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency) says the same thing more directly: constrain with examples when you need reliable output. I still start with only two or three. Every extra example burns tokens, and most prompt problems do not need a six-shot ceremony.

Before you write another paragraph, show the pattern you want once or twice.

```text
Translate from English to French:

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous ?"

English: "Thank you very much for your help."
French: "Merci beaucoup pour votre aide."

English: "I would like to book a table for two."
French:
```

If one example fixes the output, stop there. If three examples still do not fix it, I stop tuning the prompt and change something bigger: the model, the workflow, or the context I provide.

## Intermediate steps: ask for checkpoints you can inspect

For brittle multi-step tasks, asking only for the final answer hides the failure. I get better results when I ask for a small set of visible checkpoints instead of a wall of reasoning. That gives me something I can verify without turning the response into a novel.

Before you trust the answer, make the model expose the part you need to check.

```text
Solve this problem step by step and show the checkpoints:

If a train departs at 9:00 AM travelling at 75 mph, and another train departs
from the same station at 10:00 AM in the same direction at 90 mph, at what time
will the second train catch the first?

Return:
1. Head start distance
2. Relative speed
3. Catch-up time
4. Final answer
```

I do not ask for verbose reasoning by default. I ask for the minimum intermediate structure that lets me catch a bad jump.

## Role prompting: pick the judgment you want

Role prompting is useful when the task depends on what the model should prioritize, not just what it should say. Google's guide treats system instructions as a real steering tool, and that matches my experience: "be helpful" is weak, but "review this as a senior security auditor and only flag material risks" changes what the model notices.

Before the task starts, tell the model what kind of judgment it is supposed to apply.

```text
You are a senior security reviewer.
Focus on authentication, authorization, and data exposure.
Review this API design and list only issues that would matter in production.
```

Pick the role that matches the decision you need to make. If you need concise classification, skip the theatrical persona. If you need expert trade-offs, a precise role helps.

## High-level instructions: put durable rules above the user request

In the current OpenAI API, this layer lives in [`instructions`](https://developers.openai.com/api/docs/guides/text) or `developer` messages, with developer instructions taking priority over user messages. That is where I put tone, refusal boundaries, and output constraints, because repeating those rules inside every user prompt is how drift sneaks back in.

Before you stack more user text on top, move the durable rules into the request itself.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-5.5', // Good default for prompt iteration
  instructions: `You are a JSON-only API.
Return valid JSON and nothing else.
Schema: { "answer": string, "confidence": number }`, // Rules that should outlive one user message
  input: 'What is the capital of Japan?', // Actual task for this call
});
```

One caveat matters in production: if you want those rules on the next call too, send them again. They are request-level instructions, not shared memory.

## Structured outputs: use schema enforcement when code is waiting

If another service has to consume the answer, "please return JSON" is not a reliability plan. The [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) is explicit: JSON mode guarantees valid JSON, while `json_schema` is the stricter option that enforces the schema. I use plain prompt formatting for humans and schema enforcement for machines. Hard line.

Before you wire the response into code, make the contract explicit.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-2024-08-06', // Snapshot with structured outputs support
  instructions: 'Classify the article and return structured data.', // Durable task rules
  input: 'Classify this article about React hooks.', // Actual content to analyze
  text: {
    format: {
      type: 'json_schema',
      name: 'article_classification',
      strict: true, // Enforce the schema instead of hoping
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
        },
        required: ['title', 'tags', 'difficulty'],
        additionalProperties: false,
      },
    },
  },
});
```

My rule is simple: if the answer is vague, tighten the task; if the format keeps drifting, add examples; if code has to parse the result, use schema enforcement; if you are still tweaking the same prompt after three serious tries, stop prompt-tuning and change the workflow.
