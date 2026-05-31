---
id: generation-parameters
order: 23
difficulty: intermediate
tags: [llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

When a workflow flips from clean JSON to clipped nonsense, people rewrite the prompt. I check the decoding knobs first. I lost too many hours blaming wording for bugs that came from a random `temperature`, a tiny token cap, or a copied preset that meant something different on another provider.

## The first fix is to stop trusting defaults

Defaults are product choices, not universal best practices. In Anthropic’s [Messages examples](https://docs.anthropic.com/en/api/messages-examples), Claude Opus 4.7 and later reject non-default `temperature`, `top_p`, and `top_k`, while [Transformers strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies) documents greedy decoding as the default and sampling as something you turn on deliberately.

That is why I treat generation parameters as part of the app contract. If the task is extraction, routing, or tool calling, I want a boring request on purpose. If the task is ideation, then I buy variation knowingly instead of letting a default sneak it in.

## Tune one randomness knob before anything else

My stance is simple: change `temperature` first and leave `top_p` at `1` unless you can describe a tail problem. OpenAI’s [Responses API](https://platform.openai.com/docs/api-reference/responses/create) documents `temperature`, `top_p`, `max_output_tokens`, and `stop`, and it frames `top_p` as an alternative to temperature, not a mandatory companion.

For extraction, classification, or tool calls, I start around `0` to `0.2`. For copy exploration, I will go closer to `0.7` or `0.9`, but only if I am ready to review multiple candidates.

This is the kind of request I would start with for a structured task.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Extract the company name and country as JSON.',
  temperature: 0.1, // keep sampling tight
  top_p: 1, // tune one randomness control first
  max_output_tokens: 120, // enough room for valid output
});
```

## Control length before you blame style

`max_output_tokens` and `stop` are not cosmetic. They decide whether the model has enough room to finish and where it is allowed to stop. I see teams obsess over creativity settings while a tiny cap is silently clipping the answer.

If I need strict structure, I would rather use a schema than a clever `stop` string. OpenAI [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) says schema-based output can enforce JSON Schema and make refusals programmatically detectable, which is safer for automations than hoping a prompt and a stop sequence will always cooperate.

This is the pattern I prefer when variation is the goal and the shape is still bounded.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Give me 8 landing page headline options for a privacy-first note app.',
  temperature: 0.8, // add variation on purpose
  top_p: 1, // keep nucleus sampling neutral for easier debugging
  max_output_tokens: 220, // cap review cost
});
```

## Repetition controls are repair tools

Transformers explains that greedy decoding tends to break down on longer outputs and repeat itself, while sampling is what you enable when you want more diverse text. That is why I do not reach for repetition penalties first. If the model is looping, I check the task, the context, and the cap before I start piling on penalties.

## Costs and limits punish messy tuning

Longer caps, more retries, and wider experiments do not just change tone. They eat into token budgets and push you toward provider limits. OpenAI’s [rate limits guide](https://platform.openai.com/docs/guides/rate-limits) tracks RPM, TPM, RPD, and TPD, which is a good reminder that sloppy experimentation has an operational cost even before finance notices it.

My decision rule is boring on purpose: if the task has one correct shape, start with low temperature, `top_p: 1`, and a cap large enough to avoid clipping. If the task needs variation, raise temperature first. If you cannot name the failure mode a parameter is fixing, leave that parameter alone.
