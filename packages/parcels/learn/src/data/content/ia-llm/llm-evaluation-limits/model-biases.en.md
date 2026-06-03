---
id: model-biases
order: 13
difficulty: beginner
tags: [llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

You ask for a “good leader,” and the answer quietly turns into a man in a suit. You ask for a “typical programmer,” and suddenly the model forgets whole countries, ages, and career paths. That kind of skew is what people mean by **bias**: a repeated tilt in outputs, not one random bad answer. I think beginners should learn this early, because bias often arrives wearing a calm, helpful tone.

## Where bias starts

LLMs learn from huge collections of human writing, and human writing already carries stereotypes, gaps, and old power patterns. The paper [Stochastic Parrots](https://dl.acm.org/doi/10.1145/3442188.3445922) made the uncomfortable point plainly: when you scale language models, you also scale the patterns buried in their data.

Bias also does not stop at pretraining. The [InstructGPT](https://arxiv.org/abs/2203.02155) paper shows that behavior is shaped again through human-written demonstrations and rankings, which means later tuning choices can reinforce some preferences and soften others. A **training dataset** is the pile of examples used to teach the model. If that pile overrepresents some groups, underrepresents others, or reflects past discrimination, the model can learn those distortions as if they were ordinary.

That is why I would not reduce bias to slurs or obviously offensive phrasing. It also hides in silent assumptions: who gets treated as the default, whose background sounds "natural," which perspectives fade out without anyone noticing.

## Why polite answers can still be biased

Bias is hard to catch because the model can sound careful and still lean in one direction. A reply can avoid insults and still present some people as normal and others as exceptions. [HELM](https://arxiv.org/abs/2211.09110) includes fairness-related evaluation because raw performance scores do not tell you whether a system treats people equitably.

I would push back on the comforting story that the newest model has “fixed” bias. The [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) treats harmful bias as a risk to manage continuously, not a bug with a final patch. That is the stance I trust: ongoing checks beat one-time reassurance.

If you want the product version of the same idea, OpenAI’s [Model Spec](https://model-spec.openai.com/) shows that assistant behavior depends not only on training data, but also on explicit rules about how the system should answer.

## What I would do in practice

I would treat any answer about people, ability, culture, crime, health, or “typical” behavior as something to audit, not something to absorb passively. Ask what assumption the answer is making. Ask who is missing. Ask whether the framing changes when you swap the group being described.

One limitation matters here: a quick prompt test will not prove a model is fair. It only helps you spot obvious skews. If the use case affects hiring, education, healthcare, moderation, lending, or public services, I would raise the bar immediately, because that is where a “small” tilt can become real harm.

If you want a next step, take one prompt about a profession or social group, rewrite it three ways, and compare what changes in tone, caution, and default assumptions. My rule is simple: if the output helps rank people or distribute opportunities, one unchecked answer is already too risky.
