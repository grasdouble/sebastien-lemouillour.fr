---
id: alignment
order: 26
difficulty: advanced
tags: [alignement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The model looks great in a demo, then turns agreeable when it should push back, rigid when it should help, and unsafe on the edge cases nobody bothered to test. That is not a prompting problem. That is alignment debt. You can postpone it for a while, but the bill shows up the moment real users start poking at the boundaries of your product.

## Alignment is not one thing

People talk about alignment as if it were a single axis called "safety." It is not. In practice, alignment is the discipline of making model behavior match your intended norms, constraints, and trade-offs. That includes safety, but also honesty, calibration, refusal style, deference, tool use, privacy boundaries, and when the model should ask for clarification. Documents like the [Model Spec](https://model-spec.openai.com/) make this explicit: aligned behavior is a policy choice, not a natural property of a pretrained model.

That is why alignment arguments are usually really arguments about objectives. Do you want the assistant to be maximally helpful, or conservative under uncertainty? Should it answer borderline requests with partial help, a refusal, or a redirect? If your team cannot answer those questions clearly, no training method will rescue you.

## The main families of approaches

The classic industrial answer is [InstructGPT paper](https://arxiv.org/abs/2203.02155)-style RLHF: collect demonstrations and ranked comparisons, then optimize the model toward preferred behavior. It works because pairwise preferences can encode fuzzy product judgments better than static labels.

A second path is [Constitutional AI](https://arxiv.org/abs/2212.08073): specify principles, let the model critique and revise its own outputs, and use those revisions as supervision or preference signal. I like this approach when the target behavior can be articulated clearly, because it makes the policy more inspectable. The catch is obvious: a bad constitution scales bad judgment very efficiently.

A third path is [DPO paper](https://arxiv.org/abs/2305.18290)-style preference optimization without the full RLHF stack. This is attractive when you want cheaper offline tuning from chosen-versus-rejected pairs. It is simpler operationally, but it still inherits your data bias and your objective ambiguity.

## What matters in production

The hardest part is not choosing a method. The hardest part is defining what failure you are actually trying to prevent. Alignment targets move with domain, jurisdiction, risk level, and user maturity. A coding assistant, a medical triage assistant, and a consumer chatbot should not share the same refusal policy just because they all use an LLM.

You also need to separate capability failures from alignment failures. If the model invents facts because it lacks knowledge, that is not solved by more alignment tuning. If it confidently follows a harmful request it clearly understood, that is. Teams mix these up constantly and then wonder why training gets expensive without fixing the right thing.

My view is blunt: alignment work starts with policy writing and evaluation design, not with optimizer choice. If you cannot describe the desired behavior in edge cases and score it consistently, your "alignment strategy" is mostly branding.

## Decision rule

Pick the lightest alignment method that can reliably enforce the behavior contract you care about. If prompt rules and product constraints handle the risk, stop there. If behavior needs to hold under pressure, graduate to preference-based tuning. If your team still cannot agree on what the right answer looks like, do not train yet. You are missing the objective, not the algorithm.
