---
id: temperature
order: 21
difficulty: intermediate
tags: [llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

When an extraction flow starts returning cute little surprises, people blame the prompt. I blame temperature first. I have watched good models look reckless because somebody left `temperature: 1` on a task that needed one predictable, repeatable answer.

## Temperature changes sampling, not model quality

In [Transformers](https://huggingface.co/docs/transformers/en/main_classes/text_generation), temperature changes the next-token probabilities used for sampling. OpenAI’s [text generation](https://platform.openai.com/docs/guides/text-generation) guide also reminds you that model output is non-deterministic, which is why I treat temperature as a risk budget, not a magic intelligence slider.

Lower values keep the model closer to its most likely continuation. Higher values let weaker candidates compete. That can help with ideation. It does not turn a weak reasoning chain into a strong one.

If I need structured output, I start with something like this.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Extract the company name and country as JSON.',
  temperature: 0.1, // keep sampling tight
  top_p: 1, // tune one stochastic control first
  max_output_tokens: 80, // leave room for valid JSON
});
```

## Where I actually set it

For extraction, classification, routing, or tool calls, I start between `0` and `0.2`. I want predictable. Predictable is cheap when the alternative is retries, validators, and one incoherent answer hitting production.

For a general assistant, I usually stay between `0.2` and `0.5`. Above that, I only continue if variation is the point. The [Holtzman paper](https://arxiv.org/abs/1904.09751) is still the best reminder that decoding choices can wreck quality even when the model itself is fine.

For headlines or brainstorming, I will raise temperature, but only with an eval loop and stored examples. Higher temperature does not change the per-token price, but it usually increases how many samples you compare or discard, and repeated retries push you toward provider [rate limits](https://platform.openai.com/docs/guides/rate-limits). That is real cost, even when the invoice line item looks the same.

| Range       | What I usually get                                         | Good fit                                                   | Risk level |
| ----------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| `0`–`0.2`   | Very narrow, repetitive, validator-friendly output         | Extraction, classification, routing, tool calls            | ✅ Low     |
| `0.2`–`0.5` | Slight wording variation without much drift                | General assistant work, summarisation, rewrite tasks       | 🟡 Medium  |
| `0.5`–`0.8` | Noticeably more variation and occasional speculative leaps | Creative assistance, headline drafts, ideation with review | 🟠 Higher  |
| `0.8`–`1`   | Big swings between great hits and obvious junk             | Brainstorming only, with ranking or eval loops             | 🔴 High    |

## The mistake I still see

Teams change temperature and `top_p` together, then spend an afternoon arguing about prompts. Anthropic’s [Messages API](https://docs.anthropic.com/en/api/messages) explicitly recommends changing one of `temperature` or `top_p`, not both, and I think that advice saves a lot of fake debugging.

If you want to compare settings cleanly, I would keep the rest of the request fixed like this.

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Give me 6 headline options for a note-taking app.',
  temperature: 0.8, // raise variety on purpose
  top_p: 1, // leave nucleus sampling alone
  seed: 42, // if your provider supports it
  max_output_tokens: 120, // cap review cost
});
```

Do not confuse `temperature: 0` with perfect determinism. Azure’s [reproducible output](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/reproducible-output) guide says determinism is not guaranteed even with a seed, and that caveat matters more as outputs get longer. I still keep server-side validation around tool calls, because low randomness is not a safety system.

If a wrong answer is expensive, stay at `0` to `0.2`. If you cannot explain why you need more variation, you probably do not need it.
