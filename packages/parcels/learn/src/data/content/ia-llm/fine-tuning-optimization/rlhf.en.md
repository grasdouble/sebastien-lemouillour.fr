---
id: rlhf
order: 24
difficulty: advanced
tags: [fine-tuning]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Your assistant looked polished in evals, then customers used it for a week and filed the same complaint three different ways: too agreeable to bad requests, too rigid on harmless ones, and weirdly verbose the moment confidence dropped. That is the mess RLHF tries to clean up. Pretraining buys capability. It does not buy a behavior contract.

## What RLHF actually adds

The recipe in the [InstructGPT paper](https://arxiv.org/abs/2203.02155) is simple: supervised fine-tuning on demonstrations, a reward model trained on ranked outputs, then policy optimization. That last step usually leans on ideas from the [PPO paper](https://arxiv.org/abs/1707.06347) with a KL penalty toward a reference policy, because the whole point is to move behavior without wiping out general usefulness.

That structure answers the real product problem. Most painful failures are preference failures. "Helpful but calibrated." "Refuse the dangerous request, not the harmless adjacent one." "Use tools when they help, not to show off." Pairwise judgments capture those tradeoffs better than pretending you have perfect labels.

## Why teams still pay the RLHF tax

Once the model is in production, static datasets stop being enough. New abuse patterns show up, refusal style drifts, and raters find edge cases your offline evals never touched. RLHF gives you a loop to turn those judgments into behavior updates. If you care about safety SLAs, escalation handling, or tool-use discipline, that loop is the product, not a training detail.

That is also why I would not start here by default. RLHF is powerful, but it is ops-heavy on purpose. You need stable preference collection, rater calibration, disagreement reviews, reward-model drift checks, and rollback criteria after each tuning round. If you cannot run that machinery, you do not have an RLHF program. You have a one-off experiment.

## Where RLHF gets expensive fast

The ugly part is objective misspecification. The policy optimizes the reward you managed to encode, not the product quality you meant. Treat reward hacking as the default threat model: verbosity inflation, fake nuance, refusal overreach, or polished nonsense that raters accidentally scored well. If you are not watching those patterns in production, the training win is probably fake.

That is why [Constitutional AI](https://arxiv.org/abs/2212.08073) matters. It replaces much of the human-comparison burden with explicit principles and model-generated critiques. I like that direction because it attacks labeling cost directly. It does not remove the core problem, though. You still need a target behavior that survives contact with users, and you still need monitoring strong enough to catch models gaming the signal.

## Decision rule

I would choose [DPO paper](https://arxiv.org/abs/2305.18290) first when the target behavior is stable and the preference data is already good. Choose RLHF only when behavior has to keep moving after launch and you can afford the monitoring loop. If you are not prepared to run preference collection and post-tuning rollback checks as an ongoing function, skip RLHF.
