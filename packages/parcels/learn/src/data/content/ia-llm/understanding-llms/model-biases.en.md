---
id: model-biases
order: 13
difficulty: beginner
tags: [LLM, biais]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You ask for examples of a “good leader,” and the answer quietly leans male. You ask for a “typical programmer,” and the description narrows to one culture, one age, one kind of background. That is not a small wording accident. It is often a sign of **bias**, meaning a systematic tilt in outputs rather than a one-off mistake. I think beginners should learn this early because biased outputs feel normal when they match familiar stereotypes.

## Where bias comes from

LLMs learn from large datasets made of human language, and human language carries patterns, omissions, and prejudice. Papers like [Stochastic Parrots](https://dl.acm.org/doi/10.1145/3442188.3445922) warned early that scaling language models also scales the social patterns inside the data.

Bias does not come only from pretraining. It can also appear in filtering choices, annotation guidelines, safety tuning, and product decisions about what kinds of answers the system should prefer. A **training dataset** is the collection of examples used to teach the model. If that collection overrepresents some groups, underrepresents others, or reflects historic discrimination, the model can reproduce those distortions.

This is why bias is not just about offensive outputs. It can also show up as invisibility, default assumptions, different levels of caution, or uneven quality across languages and communities.

## Why it is hard to spot

Bias is tricky because the model can sound polite and still be skewed. A response can avoid slurs yet still present some people as the default and others as exceptions. Broad evaluations such as [HELM](https://arxiv.org/abs/2211.09110) include fairness-related measurements precisely because performance alone does not tell you whether a system behaves equitably.

I would also resist the comforting idea that “the latest model has solved bias.” There is no final patch for this. Frameworks like the [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) treat bias and harm as risk management problems that require ongoing measurement, governance, and context-specific judgment.

Even behavior policies matter. Documents like OpenAI’s [Model Spec](https://modelspec.openai.com/) show that system behavior is shaped not only by raw training data, but also by explicit rules about how the assistant should respond.

## How I would use this in practice

I would treat any answer about people, ability, risk, culture, or “typical” behavior as something to audit, not absorb passively. Ask what assumptions the answer is making. Ask whose perspective is missing. Ask whether the framing would change if the person or group changed.

If the use case affects hiring, education, health, moderation, or public services, I would raise the bar immediately. Those are exactly the places where a “small” skew becomes a real-world harm.

A practical rule helps: the closer the output gets to judging humans or allocating opportunities, the less acceptable “probably fine” becomes. Your next step is simple: take one prompt that describes a role, a personality, or a social group, then rewrite it three ways and compare the shifts in tone and assumptions. That comparison is often the fastest way to notice bias you would otherwise read past.
