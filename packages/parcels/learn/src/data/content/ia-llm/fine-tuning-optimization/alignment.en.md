---
id: alignment
order: 26
difficulty: advanced
tags: [fine-tuning]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

The model looks sharp in a demo, then folds when it should resist, stonewalls when it should help, and goes off the rails on the edge cases nobody scored. That is not a prompt tweak problem. That is alignment debt, and it gets expensive the minute real users start testing the perimeter.

## Alignment is a policy problem first

People talk about alignment as if it were one slider called "safety." It is not. In practice, alignment is the job of making model behavior match explicit norms, constraints, and trade-offs around help, refusal, honesty, privacy, and escalation. The [Model Spec](https://platform.openai.com/docs/model-spec) makes the same point in more formal language: behavior is governed by policy, not magically inherited from pretraining.

That is why alignment debates are usually objective debates wearing a technical costume. Should the assistant answer borderline requests with partial help, a refusal, or a redirect? Should it defer under uncertainty or push back? If your team cannot answer those questions consistently, training harder is theater.

## Three approaches that actually matter

The classic industrial move is [InstructGPT](https://arxiv.org/abs/2203.02155)-style RLHF: collect demonstrations and ranked comparisons, then optimize toward preferred behavior. It remains useful because pairwise preferences capture messy product judgment better than static labels.

A second path is [Constitutional AI](https://arxiv.org/abs/2212.08073): write principles, have the model critique and revise outputs against them, then learn from those revisions or preferences. I would choose this only when the principles can survive audit line by line. A vague constitution is just vague policy with better branding.

A third path is [DPO](https://arxiv.org/abs/2305.18290) and related direct preference methods. This is often my default for offline preference tuning because it cuts operational drag versus a full RLHF pipeline. It does not rescue bad preference data, and it definitely does not settle unresolved policy fights.

## What matters in production

Risk tolerances are not portable. A coding assistant, a medical triage assistant, and a consumer chatbot should not share the same refusal policy just because they all sit on top of an LLM. The [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) is useful here because it forces the boring but necessary question: harmful for whom, in what context, and with what impact.

You also need to separate capability failures from alignment failures. If the model lacks the knowledge or tools to answer correctly, no amount of nicer refusal tuning fixes that. If it understood the request and still chose the wrong policy, that is alignment. Teams blur those two buckets all the time and burn months tuning the wrong layer.

My stance is simple: start with written policy and evaluation before touching the optimizer. If you cannot describe the expected behavior on ugly edge cases and score it consistently, you do not have an alignment strategy yet.

## Decision rule

Use the lightest method that reliably enforces the behavior contract you actually need. Stop at prompts and product constraints if the stakes are low and the failure modes are observable. Move to preference tuning when the behavior has to hold under pressure. If the team still argues about what "good" looks like, freeze training and settle policy first.
