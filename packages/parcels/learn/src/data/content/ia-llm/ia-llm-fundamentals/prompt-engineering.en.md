---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
publishedAt: 2026-05-25
updatedAt: 2026-05-29
---

You've tried the model. The results are bad. Not broken-bad: just vague, off-topic, weirdly formatted, or confidently wrong about something obvious. Your first instinct is to blame the model. I had that instinct too. Usually, the model is fine: the instruction is the problem.

Prompt engineering is just the discipline of writing better instructions. No magic. No jailbreaks. Just patterns that reliably move output from "almost useful" to "actually useful", and a few traps to avoid along the way.

## Zero-shot: the default that works less often than you'd think

The simplest approach: describe the task and ask for the output, no examples. The model is supposed to infer what "good" looks like from the instruction alone.

```text
Classify the sentiment of this review as Positive, Neutral, or Negative:

"The battery life is disappointing, but the screen quality is excellent."
```

This works well for common tasks the model has seen a thousand times. For anything specialized, ambiguous, or where your definition of "correct" differs from the training data's average: it breaks down fast. Zero-shot is where I start, not where I stay.

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

The examples do two things: they show the format you expect, and they calibrate the model's judgment about what "good" means for your specific use case. If you can demonstrate the desired output in two or three cases rather than describe it in prose, you should almost always choose demonstration.

## Chain-of-thought: don't let the model skip steps

For anything involving multi-step reasoning (math, logic, complex classification), asking for the final answer directly is a mistake. The model can generate a plausible-sounding answer by pattern-matching, without actually working through the problem. Adding a simple instruction to show its reasoning changes everything.

```text
Solve this problem step by step:

If a train departs at 9:00 AM travelling at 75 mph, and another train departs
from the same station at 10:00 AM in the same direction at 90 mph, at what time
will the second train catch the first?

Reasoning:
```

"Think step by step" is the four-word version that works in most situations. It sounds almost too simple, but the accuracy improvement on multi-step problems is real and measurable. The reason it works is because generating the steps forces the model to build intermediate results it then actually uses, rather than guessing the answer directly.

## Role prompting: context shapes output more than you expect

Telling the model it's a cybersecurity auditor versus a product manager changes not just the vocabulary, but the level of detail, what it decides to emphasize, and what it omits. This isn't decorative: I've seen the same question produce genuinely different useful outputs depending on the role.

- "You are a cybersecurity expert with 20 years of experience..."
- "You are a mathematics teacher explaining to high school students..."
- "You are a senior code reviewer looking for critical bugs..."

Pick the role that matches the kind of judgment you actually need. If you want code review feedback that would catch real security issues, "experienced engineer" will do more for you than a generic prompt.

## System prompts: set the rules once, don't repeat yourself

In a real application, repeating your constraints in every user message is a maintenance nightmare and inflates token usage. The `system` prompt exists to define the model's persona, constraints, and output format for the entire session. In production, I treat it as the contract between my application and the model: it defines what the model is allowed to do, what format it must respond in, and what it should refuse.

```typescript
const messages = [
  {
    role: 'system',
    content: `You are a JSON-only API. Always respond with valid JSON.
Never include explanatory text outside the JSON object.
Schema: { "answer": string, "confidence": number }`,
  },
  { role: 'user', content: 'What is the capital of Japan?' },
];
```

A good system prompt significantly reduces output variance (which matters a lot more in production than it does when you're experimenting).

## Structured output: enforce what you can't rely on

Asking for JSON in the prompt is a reasonable first step, but the model can still decide to add a little explanation before the object or after it, which breaks your parser. Modern APIs offer a structured output mode that enforces the format at the API level, not just through instruction. Use it whenever another system needs to parse the response: it's one fewer failure mode to debug at 2am.

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Return JSON with fields: title (string), tags (string[]), difficulty (beginner|intermediate|advanced).',
      },
      { role: 'user', content: 'Classify this article about React hooks.' },
    ],
  }),
});
```

These techniques stack. A production prompt that works reliably usually combines a clear role, two or three examples, a step-by-step instruction for complex tasks, and a structured output constraint. But here's the actual rule: start with zero-shot, measure where it fails, and add the next layer only when the previous one isn't enough. Complexity you add without a specific reason to add it is just noise.
