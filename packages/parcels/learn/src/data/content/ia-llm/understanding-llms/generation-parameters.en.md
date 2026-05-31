---
id: generation-parameters
order: 20
difficulty: intermediate
tags: [generation, sampling, llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

When a workflow flips from clean JSON to clipped nonsense, people rewrite the prompt. I check the decoding knobs first. I lost too many hours blaming wording for bugs that came from a random `temperature`, a tiny token cap, or a copied preset that meant something different on another provider.

## The first fix is to stop trusting defaults

Defaults are product choices, not universal best practices. In Anthropic's [Messages examples](https://docs.anthropic.com/en/api/messages-examples), Claude Opus 4.7 and later reject non-default `temperature`, `top_p`, and `top_k`, while [Transformers strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies) documents greedy decoding as the default and sampling as something you turn on deliberately.

When I need a fast decoding cheat sheet, this is the table I actually keep in mind before touching anything:

| Parameter           | Controls                     | Recommended for structured tasks                                           | Recommended for creative tasks                              |
| ------------------- | ---------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `temperature`       | Randomness of sampling       | `0` to `0.2`                                                               | `0.7` to `0.9`                                              |
| `top_p`             | Nucleus size for sampling    | `1` — I leave it untouched unless I can name a tail problem                | `1` — I change temperature first                            |
| `top_k`             | Hard cap on candidate tokens | N/A in most hosted APIs, so I do not plan around it                        | `20` to `40` only on self-hosted stacks that expose it      |
| `max_output_tokens` | Output length                | Tight enough to avoid rambling, loose enough to avoid clipping             | Generous enough to let multiple ideas finish                |
| `stop`              | Stop sequences               | Useful for format control, but I still prefer schemas for strict structure | Rarely needed unless I must cut output at a specific marker |

## Each parameter has a dedicated guide

`temperature`, `top_p`, and `top_k` each deserve a closer look. This guide sets the overall frame; the dedicated guides go into concrete settings and the cases where each parameter actually changes something.

`max_output_tokens` and `stop` do not have a separate guide, but they are not cosmetic. They decide whether the model has enough room to finish and where it is allowed to stop. A cap that is too tight silently clips the answer; a misplaced stop sequence truncates an expected format. If I need strict structure, I would rather use a schema than a clever `stop` string. OpenAI's [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) makes refusals programmatically detectable, which is safer for automations than hoping a prompt and a stop sequence always cooperate.

## One parameter at a time

If you cannot name the failure mode a parameter is fixing, leave that parameter alone. Change temperature first. Leave `top_p` at `1` unless you can see a real tail problem. Raise `top_k` only on self-hosted stacks where no other lever is enough. Longer caps and wider experiments eat into token budgets and push you toward [provider limits](https://platform.openai.com/docs/guides/rate-limits) faster than the tuning delivers value.
