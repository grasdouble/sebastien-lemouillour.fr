---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
---

## Zero-shot prompting

Zero-shot prompting is the simplest form: ask the model to perform a task without providing any examples. The model relies entirely on its pre-trained knowledge.

```text
Classify the sentiment of this review as Positive, Neutral, or Negative:

"The battery life is disappointing, but the screen quality is excellent."
```

This works well for tasks the model has seen during training. For niche or ambiguous tasks, few-shot prompting is more reliable.

## Few-shot prompting

Few-shot prompting consists of providing examples in the prompt to guide the model. The more representative the examples, the more precise the result.

```text
Translate from English to French:

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous ?"

English: "Thank you very much for your help."
French: "Merci beaucoup pour votre aide."

English: "I would like to book a table for two."
French:
```

## Chain-of-thought (CoT)

CoT asks the model to reason step by step before giving its final answer. This significantly improves performance on complex tasks. Adding "Think step by step" or "Let's reason step by step" to a prompt often suffices.

```text
Solve this problem step by step:

If a train departs at 9:00 AM travelling at 75 mph, and another train departs
from the same station at 10:00 AM in the same direction at 90 mph, at what time
will the second train catch the first?

Reasoning:
```

## Role prompting

Assigning a role to the model improves the quality and consistency of responses in a specific domain.

- "You are a cybersecurity expert with 20 years of experience..."
- "You are a mathematics teacher explaining to high school students..."
- "You are a senior code reviewer looking for critical bugs..."

## System prompts

Most modern LLM APIs support a `system` message, which is prepended before the conversation. System prompts establish the model's persona, constraints and output format persistently across the conversation.

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

For production use, instruct the model to return structured data (JSON, YAML) to make parsing reliable. Many APIs now support `response_format: { type: 'json_object' }`.

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
