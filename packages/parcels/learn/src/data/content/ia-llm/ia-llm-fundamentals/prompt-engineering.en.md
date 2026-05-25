---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
---

You tried an LLM and the results are disappointing. The model answers off-topic, too vaguely, or in the wrong format. The instinct is to blame the model — but most of the time, the problem is how you talk to it.

Prompt engineering is the art of formulating instructions so the model produces something useful. It is not magic. It is a skill you build progressively, from the simplest prompt to more structured techniques.

## Zero-shot: start simple

The most direct approach is to ask for the task without giving any examples. The model has to infer what you want from the instruction alone.

```text
Classify the sentiment of this review as Positive, Neutral, or Negative:

"The battery life is disappointing, but the screen quality is excellent."
```

For a common, well-defined task, this is often enough. Where it breaks down is with specialized or ambiguous requests: the model does not have enough context to guess your standards. That is where examples become useful.

## Few-shot: guide by example

Rather than explaining at length what you expect, show it. Two or three representative examples usually calibrate the model better than a long abstract instruction.

```text
Translate from English to French:

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous ?"

English: "Thank you very much for your help."
French: "Merci beaucoup pour votre aide."

English: "I would like to book a table for two."
French:
```

Practical rule: if you can show what “good” looks like through two or three cases, show it rather than write it.

## Chain-of-thought: force the reasoning

Some tasks require multiple reasoning steps. If you ask for the final answer directly, the model can skip steps and get it wrong. Asking it to reason step by step often improves the result dramatically.

```text
Solve this problem step by step:

If a train departs at 9:00 AM travelling at 75 mph, and another train departs
from the same station at 10:00 AM in the same direction at 90 mph, at what time
will the second train catch the first?

Reasoning:
```

In practice, adding a phrase like “Think step by step” is often enough to improve math, logic, or other multi-stage tasks.

## Role prompting: provide an expertise context

A model does not answer the same way when you frame it as a teacher, an auditor, or an engineer. Giving it an explicit role helps anchor the answer in a domain. This is not just cosmetic — the model adjusts its level of detail, vocabulary, and structure based on the role.

- "You are a cybersecurity expert with 20 years of experience..."
- "You are a mathematics teacher explaining to high school students..."
- "You are a senior code reviewer looking for critical bugs..."

## System prompts: set the rules once and for all

In an application, you do not want to repeat the same constraints in every user message. The `system` prompt solves that by establishing the model's persona, limits, and expected output format for the whole conversation. In production, a good system prompt is your first line of defense: it reduces output variance, makes parsing easier, and makes undesired behaviors harder to trigger.

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

## Structured output

Asking for JSON in the system prompt helps, but it is not guaranteed — the model can still add text before or after the object. Modern APIs increasingly offer a structured output mode that enforces the format directly, which is much safer when another system needs to parse the response.

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

These techniques are not mutually exclusive. A strong production prompt often combines a clear role, a few few-shot examples, a reasoning instruction, and a structured output format. The rule is simple: start simple, measure the results, and add complexity only when it genuinely improves the output.
