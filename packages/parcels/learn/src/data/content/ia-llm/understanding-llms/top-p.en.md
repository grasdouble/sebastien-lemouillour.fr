---
id: top-p
order: 21
difficulty: intermediate
tags: [llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

When a model is mostly good but every few answers it grabs one weird word and drags the whole reply off course, lowering temperature can feel like punishing the whole response for one bad tail token. I reach for top-p in that situation.

## Top-p trims the probability tail, not the whole mood

The [Holtzman paper](https://arxiv.org/abs/1904.09751) introduced nucleus sampling to cut the unreliable tail of the next-token distribution. In the [Transformers docs](https://huggingface.co/docs/transformers/en/main_classes/text_generation), `top_p` keeps only the smallest set of tokens whose cumulative probability reaches `p`, so the candidate pool shrinks when the model is confident and expands when it is not. That is why I prefer it over top-k on hosted models: the cutoff adapts to the step instead of pretending every token position deserves the same budget.

If I want less tail risk without making the answer sound dead, I start with a request like this.

```ts
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: 'Write 5 taglines for a budgeting app.',
  temperature: 0.7, // keep the overall tone lively
  top_p: 0.9, // trim low-probability tail tokens
  max_output_tokens: 80, // cap review cost
});

console.log(response.output_text);
```

## When I change it, and when I leave it alone

OpenAI’s [text generation](https://platform.openai.com/docs/guides/text-generation) guide and Anthropic’s [parameter guide](https://docs.anthropic.com/claude/docs/guide-to-parameters) both treat `top_p` as a sampling control, and Anthropic explicitly recommends changing either `temperature` or `top_p`, not both. I follow that advice. If the model is already at the right creativity level, I leave temperature alone and use top-p to clean up odd lexical detours or unstable phrasing. If the whole answer is too wild or too dull, temperature is the better first move.

| `top_p`      | What gets through                  | What it feels like                                               | My move vs temperature                                                                  |
| ------------ | ---------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `1`          | Full distribution stays available  | No nucleus filter at all; only temperature is shaping tone       | Use this when I am still judging overall creativity                                     |
| `0.95`–`0.9` | Only the weakest tail gets trimmed | Same general voice, fewer weird token detours                    | My default when the answer is fine but one word every so often goes off-course          |
| `0.9`–`0.8`  | A noticeably smaller nucleus       | Tighter phrasing, less lexical wobble, still some energy         | I use this before lowering temperature if I want to keep the same mood                  |
| Below `0.8`  | Aggressive cutoff                  | Safer-sounding, flatter, and more likely to hide another problem | Only for a named tail issue; if the whole answer is wrong, I change temperature instead |

That also keeps debugging cleaner. Every extra retry burns more tokens against provider [rate limits](https://platform.openai.com/docs/guides/rate-limits) and adds review work, so I would rather make one controlled sampling change than stack three knobs and guess which one helped.

## The mistake I still see

People treat lower `top_p` like a safety switch. It is not. It narrows the candidate pool, but it does not verify facts, block unsafe content, or protect a workflow that cannot tolerate a bad answer. If a bad output is expensive, keep moderation or downstream validation in place; the [Moderation guide](https://platform.openai.com/docs/guides/moderation) exists for a reason.

My stance: on hosted APIs, I would usually try `top_p: 0.9` before I touch temperature. If you feel tempted to go below `0.8`, make sure you are fixing a specific tail problem and not hiding a prompt, context, or safety problem.
