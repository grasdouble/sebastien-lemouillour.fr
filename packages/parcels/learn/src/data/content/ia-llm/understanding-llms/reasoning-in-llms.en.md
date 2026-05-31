---
id: reasoning-in-llms
order: 19
difficulty: intermediate
tags: [reasoning, llm]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

The most annoying LLM failure mode is not nonsense. It is a polished, step-by-step answer that feels convincing and is still wrong. That is why I do not treat “reasoning” as a vibe or a marketing badge. I treat it as a capability you have to buy, prompt, and verify carefully.

## Reasoning is budget, not magic

A model reasons well when three things line up: the base model has the latent capability, the prompt exposes the task structure, and the runtime budget leaves enough room for intermediate steps. The original [Chain-of-Thought](https://arxiv.org/abs/2201.11903) paper showed that large models can improve on multi-step tasks when prompted to produce intermediate reasoning. That result mattered, but it also trained people into a bad reflex: asking every model to “think step by step” even when the task is trivial.

I would not do that by default. OpenAI’s [reasoning guide](https://platform.openai.com/docs/guides/reasoning) says higher reasoning effort trades speed and token usage for quality, and Anthropic’s [extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking) docs describe the same tradeoff with thinking depth and token budgets. If the task is short or easy to verify, extra thinking is often just a slower invoice.

## When I would pay for it

Prompting starts to earn its keep when the task is genuinely multi-step and the final answer can be checked. The [self-consistency](https://arxiv.org/abs/2203.11171) paper is the clearest version of that idea: sample multiple reasoning paths, then keep the consensus answer. I would reserve that for math, symbolic tasks, or expensive decisions because you are literally buying several attempts to get one answer.

That still leaves the harder problem: what if the model is missing facts, not deliberation? In that case I would stop asking it to think harder and switch to tools. The [ReAct](https://arxiv.org/abs/2210.03629) paper got this right: reason a little, fetch evidence, continue. That pattern is usually more reliable than a long monologue trying to infer data it does not have.

## A practical default

I start with low or medium reasoning, require citations or tool output, and only raise the budget after I see failures that look like missing deliberation rather than missing data. This is also where throughput gets ugly: OpenAI’s [rate limits](https://platform.openai.com/docs/guides/rate-limits) are tracked on both requests and tokens, so a “safer” prompt can still kill capacity if it expands the response too much.

Here is the kind of baseline I would actually ship before paying for more thinking:

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",  # reasoning-capable model
    reasoning={"effort": "low"},  # start cheap, raise only after evals fail
    input=[
        {
            "role": "user",
            "content": "Compute the VAT due on €420 at 20%. Return only the number.",
        }
    ],
    max_output_tokens=80,  # cap cost and keep the answer terse
)

print(response.output_text)
```

If prompts can contain secrets, customer data, or internal policy text, I would not expose raw reasoning to end users just because the provider can return it. Anthropic exposes thinking as separate content blocks, which is exactly why I treat it as something to gate, log carefully, or omit.

My rule is simple: pay for extra reasoning only when the task is multi-step, externally checkable, and costly enough that a slower answer is still cheaper than a wrong one.
