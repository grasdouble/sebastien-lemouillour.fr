---
id: temperature
order: 20
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

When a model starts sounding flaky, people love to blame the model. Half the time the real culprit is sampling. I have seen perfectly capable models look unstable, verbose, or oddly reckless because somebody left `temperature: 1` in production and never checked how much randomness the task could actually tolerate.

## Temperature changes risk, not intelligence

Temperature rescales logits before sampling. Lower values sharpen the distribution around likely tokens. Higher values flatten it and let weaker candidates compete. The [Hugging Face docs](https://huggingface.co/docs/transformers/en/main_classes/text_generation), OpenAI’s [API reference](https://platform.openai.com/docs/api-reference/chat/create), and Anthropic’s [messages docs](https://docs.anthropic.com/en/api/messages) all expose the parameter because it directly changes output behavior.

A tiny change can be enough:

```json
{ "temperature": 0.1 }
{ "temperature": 0.4 }
{ "temperature": 0.8 }
```

What temperature does not do is make a weak model suddenly reason better. It changes exploration. Sometimes that helps a model escape a dull local pattern. Sometimes it just lets bad continuations through faster.

## How I choose values

For extraction, classification, routing, or tool calls, I start low, usually between `0` and `0.2`. If the output schema matters, randomness is a tax. You pay it in retries, validation failures, and support tickets.

For general assistant tasks, I usually sit between `0.2` and `0.5`. That range still allows some flexibility in wording without turning the answer into a slot machine.

For brainstorming, naming, or creative copy, I will raise temperature only if I also have an evaluation loop. Higher temperature can absolutely surface fresher options, but it also increases review cost. The token price of a single call might not change much, yet the system-level cost rises because you re-run, discard, and compare more outputs.

The [neural text degeneration](https://arxiv.org/abs/1904.09751) paper is still the best reminder that decoding choices shape quality as much as model weights do. Bad sampling can make a good model sound worse than it is.

## The mistake I see most often

Teams tweak temperature and `top_p` at the same time, then have no idea which knob actually changed behavior. I rarely do that. I pick one primary stochastic control first, evaluate, then touch the other only if I can describe the failure mode I am fixing.

I also avoid pretending `temperature: 0` means “perfectly deterministic forever.” It usually means “as deterministic as this stack allows.” Provider-side changes, floating-point differences, or sampling implementation details can still introduce variation.

My rule: set temperature according to the cost of being wrong. If a wrong answer is expensive, start low and raise it only after evals prove the extra diversity is worth paying for.
