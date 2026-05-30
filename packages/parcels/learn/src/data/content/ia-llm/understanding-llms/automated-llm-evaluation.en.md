---
id: automated-llm-evaluation
order: 28
difficulty: advanced
tags: [LLM, évaluation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

If you only read ten outputs by hand, regressions will ship. If you trust one aggregate score from an automated judge, regressions will also ship. That is the uncomfortable truth. Automated evaluation is necessary once volume grows, but it is dangerously easy to automate the wrong taste and then call it rigor.

## What automation is good at

Automation is excellent at regression detection, coverage expansion, and repeatability. If you know the failure you care about, a machine can check it more consistently and more often than a human review ritual ever will. That is why I like a layered setup: exact-match or schema checks for hard requirements, task-specific heuristics for partial structure, and model-based judges only for the fuzzy residue.

This is also the philosophy behind [OpenAI Evals](https://github.com/openai/evals): define test cases, run them repeatedly, and compare models or prompts under a harness you can version. The value is not the framework itself. The value is that evaluation becomes part of the product loop instead of a last-minute screenshot exercise.

## LLM-as-judge is powerful and slippery

The LLM-as-judge pattern became popular because many quality criteria are hard to score mechanically. Tone, completeness, faithfulness to instructions, and comparative usefulness all benefit from model-based judging. But judge models are not neutral referees. The [G-Eval paper](https://arxiv.org/abs/2303.16634) showed that structured criteria and chain-of-thought style judging can improve correlation with humans, which is useful. It did not magically remove bias.

That caveat matters. The [MT-Bench paper](https://arxiv.org/abs/2306.05685) showed how strong LLM judges can be for pairwise comparison, but also exposed position bias, verbosity bias, and self-preference effects. So my default is pairwise judging with explicit rubrics whenever possible. Absolute 1-to-5 scoring looks neat in dashboards and turns messy very quickly in practice.

## RAG needs its own metrics

Retrieval-augmented systems are where weak automation gets especially misleading. A final answer can look polished while being grounded in the wrong chunks, or a retrieval stage can be solid while the answer synthesis fails. Those are different failures and should not be merged into one score.

That is why tools inspired by [RAGAS paper](https://arxiv.org/abs/2309.15217) matter. They separate dimensions such as answer relevance, context precision, context recall, and faithfulness. I would still validate those metrics against human judgment before trusting them, but they are far better than pretending a single correctness score captures the pipeline.

## The production trap

Automation drifts. Prompts change, judge models change, datasets get stale, and teams quietly optimize for the metric because the metric is visible. Once that happens, your eval suite stops measuring user value and starts measuring compliance with yesterday's test set.

The fix is not less automation. The fix is adversarial automation plus periodic human calibration. Keep a small reviewed set, refresh edge cases, inspect disagreements, and treat large score jumps with suspicion until you can explain them.

## Decision rule

Automate everything that can be stated clearly and repeated cheaply. Use LLM judges only where rubrics exist and human spot checks keep them honest. If an automated score cannot tell you why a model won, it is not ready to be a release gate.
