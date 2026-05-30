---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

You've tried the model. The results are bad. Not broken-bad: just vague, off-topic, weirdly formatted, or confidently wrong about something obvious. Your first instinct is to blame the model. I had that instinct too. Usually, the model is fine: the instruction is the problem.

Prompt engineering is just the discipline of writing better instructions. No magic. No jailbreaks. Just patterns that reliably move output from "almost useful" to "actually useful", and a few traps to avoid along the way. The [prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering) is useful, but the shortcut that actually changed my results was simpler: start boring, then add structure only where the prompt really fails.

## Zero-shot: the default that works less often than you'd think

The simplest approach: describe the task and ask for the output, no examples. The model is supposed to infer what "good" looks like from the instruction alone.

```text
Classify the sentiment of this review as Positive, Neutral, or Negative:

"The battery life is disappointing, but the screen quality is excellent."
```

This works well for common tasks the model has seen a thousand times. For anything specialized, ambiguous, or where your definition of "correct" differs from the training data's average, it breaks down fast. Zero-shot is where I start, not where I stay.

## Few-shot: stop explaining, start showing

Instead of writing a longer description of what you want, show examples of input and expected output. Two or three examples beat a paragraph of explanation almost every time.

```text
Translate from English to French:

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous ?"

English: "Thank you very much for your help."
French: "Merci beaucoup pour votre aide."

English: "I would like to book a table for two."
French:
```

The examples do two things: they show the format you expect, and they calibrate the model's judgment about what "good" means for your specific use case. If I can demonstrate the target output in two or three cases instead of describing it in prose, I pick demonstration almost every time.

## Chain-of-thought: don't let the model skip steps

For anything involving multi-step reasoning, asking for the final answer directly is a good way to get confident nonsense. The [chain-of-thought paper](https://arxiv.org/abs/2201.11903) by Wei et al. showed measurable gains when models were prompted with intermediate reasoning steps on complex tasks. That nuance matters. The paper is not proof that one magic sentence fixes every hard problem.

```text
Solve this problem step by step:

If a train departs at 9:00 AM travelling at 75 mph, and another train departs
from the same station at 10:00 AM in the same direction at 90 mph, at what time
will the second train catch the first?

Reasoning:
```

"Think step by step" is still a useful shortcut, and I do try it. I just don't treat it like a spell. If the task is brittle, I would rather show the reasoning shape I want than hope the model invents the right steps on its own.

## Role prompting: context shapes output more than you expect

Telling the model it's a cybersecurity auditor versus a product manager changes not just the vocabulary, but the level of detail, what it decides to emphasize, and what it omits. This isn't decorative: I've seen the same question produce genuinely different useful outputs depending on the role.

- "You are a cybersecurity expert with 20 years of experience..."
- "You are a mathematics teacher explaining to high school students..."
- "You are a senior code reviewer looking for critical bugs..."

Pick the role that matches the kind of judgment you actually need. If you want code review feedback that would catch real security issues, a sharply chosen role does more for you than another paragraph of generic instructions.

## High-level instructions: set the rules once, don't repeat yourself

Older examples call this a system prompt. In OpenAI's current docs, the same job is usually handled with `instructions` or a `developer` message, and the [Responses API reference](https://developers.openai.com/api/docs/api-reference/responses/create) shows that contract directly in the request shape. In production, I treat that layer as the agreement between my app and the model: tone, constraints, output rules, and refusal boundaries all live there.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-5.5',
  instructions: `You are a JSON-only API. Always respond with valid JSON.
Never include explanatory text outside the JSON object.
Schema: { "answer": string, "confidence": number }`,
  input: 'What is the capital of Japan?',
});
```

Getting that layer right reduces output variance a lot more than most people expect.

## Structured output: enforce what you can't rely on

Asking for JSON in the prompt is a reasonable first step, but it is still just a request. The [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) makes the current split explicit: JSON mode gives you valid JSON, while `json_schema` is the stricter option that enforces a schema. If another system has to parse the response, I pick schema enforcement first and fall back to JSON mode only when model compatibility forces it.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-2024-08-06',
  input: [
    {
      role: 'system',
      content: 'Classify the article and return structured data.',
    },
    { role: 'user', content: 'Classify this article about React hooks.' },
  ],
  text: {
    format: {
      type: 'json_schema',
      name: 'article_classification',
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
      strict: true,
    },
  },
});
```

These techniques stack. A prompt that works reliably usually combines a clear role, a few examples, step-by-step guidance when the task needs it, and structure where a parser depends on it. My rule is still the same, though: start with zero-shot, watch where it breaks, and add only the next piece that fixes the failure. Anything extra is noise.
