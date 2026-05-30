---
id: generation-parameters
order: 23
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

If you have ever watched the same prompt swing from perfect to useless, you already know the trap: people blame the model when the decoding settings are doing the damage. I made that mistake early on. I kept rewriting prompts for outputs that were actually caused by a sloppy temperature, an over-tight token cap, or two sampling knobs fighting each other.

## The trap is trusting defaults

Defaults are not neutral. They differ across providers and libraries, and they often reflect a generic product goal, not your task. The sampling controls exposed by [OpenAI docs](https://platform.openai.com/docs/guides/text?api-mode=responses), [Anthropic docs](https://docs.anthropic.com/en/api/messages), and [Transformers docs](https://huggingface.co/docs/transformers/main/en/generation_strategies) all aim at the same problem: deciding which next token is allowed to win.

My rule is simple: treat generation parameters as part of the application contract. If you are building extraction, classification, or tool calling, randomness is a bug unless you can justify it. If you are building ideation, copy variants, or synthetic data exploration, some randomness is useful, but only on purpose.

## Parameters that actually matter

### Temperature

Temperature changes how sharply the model prefers high-probability tokens. Lower values make outputs more conservative. Higher values make the model explore more of the tail. For extraction or formatting, I would usually start around `0` to `0.3`. For brainstorming, I would rather push `0.7` to `1.0` than pretend a creative task should be deterministic.

### top_p

`top_p` keeps only the smallest token set whose cumulative probability crosses a threshold. It is useful, but people overuse it. My default is `top_p: 1` and then I tune temperature first. If you aggressively tune both, you make failures harder to reason about because two different filters are shaping the same distribution.

### max_output_tokens and stop

These are budget and control knobs, not cosmetic ones. A short cap forces concise answers, but it also truncates reasoning or structured output. Stop sequences are better when you know where the answer should end, especially in templates, JSON-ish output, or multi-turn pipelines.

### Repetition penalties

Frequency or presence penalties can help when the model loops, but I would not add them by default. They are repair tools. If the model repeats itself, first check whether the prompt or context is inviting repetition.

## Practical presets

For a deterministic extraction flow, I would start here:

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Extract the company name and country as JSON.',
  temperature: 0.2,
  top_p: 1,
  max_output_tokens: 120,
  stop: ['\n\n'],
});
```

For idea generation, I would loosen only the knobs that help variation:

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Give me 8 landing page headline options for a privacy-first note app.',
  temperature: 0.9,
  top_p: 1,
  max_output_tokens: 220,
});
```

Notice what stays stable: I am not touching everything at once. That is the pattern that saves time. Change one variable, look at failures, then decide whether you need more diversity, more control, or just a better prompt.

## Decision rule

If the task has one correct shape, start with low temperature, `top_p: 1`, and a token cap large enough to avoid clipping. If the task benefits from variation, raise temperature before touching anything else. Only add `top_p`, stop sequences, or repetition penalties when you can name the exact failure mode they are fixing.
