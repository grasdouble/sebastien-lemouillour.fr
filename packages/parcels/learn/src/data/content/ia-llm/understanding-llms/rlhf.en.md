---
id: rlhf
order: 24
difficulty: advanced
tags: [RLHF, alignement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your base model looked impressive in prompts and demos. Then real users found the ugly parts: fake confidence, sycophancy, evasive refusals, and answers that sounded aligned while missing the point. That gap is why RLHF exists. Pretraining gives you capability. It does not give you the behavior contract you need in a product.

## What RLHF actually adds

The canonical recipe from the [InstructGPT paper](https://arxiv.org/abs/2203.02155) is not mysterious: supervised fine-tuning on demonstrations, a reward model trained on ranked outputs, then policy optimization against that reward. The usual optimizer is [PPO paper](https://arxiv.org/abs/1707.06347) territory, with an explicit pressure to stay close to a reference model so you do not destroy general capabilities while chasing preference gains.

That matters because product quality is full of fuzzy targets. "Helpful but not overconfident." "Refuse the dangerous request, but do not refuse the harmless adjacent one." "Use tools when needed, but do not spam them." Those are easier to express as comparisons than as gold labels. RLHF turns that ambiguity into pairwise preference data and forces the model to internalize it.

## Why teams still pay the RLHF tax

At scale, RLHF is a behavior-shaping system more than a training trick. It lets you tune tone, calibration, refusal style, and task-following in ways plain supervised fine-tuning usually cannot match. If your failures live in the gap between "technically valid" and "actually useful," preferences are often the right signal.

It is also one of the few approaches that can continuously absorb new judgments. That becomes important once deployment teaches you what your internal evaluation missed. A model that is good on static prompts can still fail on escalation handling, adversarial phrasing, or subtle user frustration. RLHF gives you a loop for that.

## Where RLHF gets expensive fast

The catch is that the training loop optimizes for the reward you managed to specify, not for the product quality you wish you had specified. Reward hacking is not a side effect. It is the default failure mode when the reward model learns proxies that score well but do not hold up under distribution shift. You see this as verbosity inflation, hedging, refusal overreach, or polished nonsense that raters accidentally rewarded.

The operational cost is just as real. You need consistent preference collection, good rater instructions, disagreement analysis, reward-model monitoring, and policy checks after every tuning round. If that sounds like running a mini evaluation organization, that is because it is. RLHF only makes sense when behavior quality matters enough to justify that loop.

This is why Anthropic pushed [Constitutional AI](https://arxiv.org/abs/2212.08073): use explicit principles and model-generated critiques to reduce some dependence on large volumes of human comparisons. I think that move is important, but it does not remove the core problem. You still need a clear target behavior, and you still need to watch for models gaming the training signal.

## Decision rule

Use RLHF when you need ongoing behavior control at product scale and you can afford the data and monitoring machinery that comes with it. If you only have a static preference dataset and no appetite for running a continuous reward pipeline, skip the theater and look at DPO or plain supervised tuning instead.
