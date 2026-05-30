---
id: ai-benchmarks
order: 27
difficulty: advanced
tags: [LLM, évaluation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

A model jumps three points on a leaderboard and suddenly the room acts like the decision is made. Then the same model misses your extraction task, breaks your tool workflow, or fails a painfully ordinary user query. Benchmarks are useful. Ranking worship is not. The mistake is treating benchmark scores as product truth instead of compressed evidence with very sharp blind spots.

## What the popular benchmarks are actually good at

[MMLU paper](https://arxiv.org/abs/2009.03300) is useful for broad academic and professional knowledge under multiple-choice pressure. It tells you something about coverage and recall, but not much about multi-turn behavior, groundedness, or whether the model stays useful when the prompt is messy.

[HumanEval paper](https://arxiv.org/abs/2107.03374) is excellent for code synthesis in a narrow sense: can the model generate a function that passes hidden unit tests, often summarized with pass@k. That is valuable, but it still lives in a controlled sandbox. It says far less about editing large codebases, navigating ambiguity, or avoiding subtle regressions.

[HELM paper](https://arxiv.org/abs/2211.09110) is more honest about evaluation as a matrix of trade-offs. It compares models across scenarios and metrics instead of pretending one number can represent quality. I trust that framing more because real systems care about robustness, calibration, efficiency, and fairness at the same time.

[Chatbot Arena](https://arxiv.org/abs/2403.04132) is useful for human preference in open-ended chat. It captures conversational taste better than static academic benchmarks, especially when users compare outputs head to head. The catch is that it measures what Arena users reward, which is not automatically what your users reward.

## Where benchmarks mislead teams

First, benchmarks saturate. Once enough models cluster near the top, tiny score changes create a fake sense of meaningful separation. Second, prompt formatting matters. A benchmark result often reflects not just model ability, but the exact evaluation harness, system instructions, decoding setup, and answer extraction logic.

Third, benchmarks rarely match the economics of production. They usually hide latency, tool-call reliability, cost per request, observability, fallback behavior, and policy compliance. A model that wins on knowledge questions may still be the wrong choice if it is too slow, too expensive, or too unstable for your actual surface.

The last trap is contamination. When benchmark items leak into training or tuning data, the score becomes less about generalization and more about recall. You do not always know when that happened, which means every leaderboard should be read with some suspicion.

## How to use benchmarks without fooling yourself

Use public benchmarks to shortlist candidates and to understand shape, not to make the final call. I like them for answering questions such as: is this model unusually strong at coding, general knowledge, or chat preference? I do not trust them to answer: will this model improve my product next quarter?

The winning pattern is boring and effective. Start with public benchmarks for market scan, then build private evaluations that mirror your prompts, your constraints, your failure modes, and your acceptance bar. If the public scores and your private results disagree, trust your task.

## Decision rule

Use benchmarks to narrow the search space, never to outsource judgment. If a benchmark measures the same task shape, risk profile, and user expectation you actually have, give it real weight. If it does not, treat it as background signal and move on.
