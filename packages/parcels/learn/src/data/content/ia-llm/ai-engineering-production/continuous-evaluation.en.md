---
id: continuous-evaluation
order: 17
difficulty: advanced
tags: [LLM, evaluation, CI, Braintrust, DeepEval]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Your chatbot was fine on Friday. On Monday, after a prompt tweak, a model swap, and one retrieval config change, it answers refund questions with the wrong policy. Nobody noticed until support tickets landed. This is when continuous evaluation stops sounding smart and starts paying rent.

This only makes sense if you are shipping AI to real users. If you are still prototyping, ignore it for now. Evaluation is operational overhead, and you should only pay that bill once prompt changes, model swaps, and retrieval updates happen often enough to create real regression risk.

I care about turning vague quality talk into a release gate. [OpenAI Evals](https://platform.openai.com/docs/guides/evals) is explicit about the point: test outputs against named criteria, especially when you change prompts or upgrade models. Treat every production incident as fuel for that suite. If an incident does not become a case, you are volunteering to relearn it in prod.

I do not want one giant score. I want slices: factuality, policy adherence, structured output validity, tool choice, multilingual behavior, and latency or cost budgets. For the workflow, I would pick [Braintrust](https://www.braintrust.dev/docs/workflow) when the team needs traces, human annotation, datasets, and evals in one loop. I would pick [DeepEval](https://docs.confident-ai.com/) when the team wants pytest-native assertions in CI. I would pick [Promptfoo CI](https://promptfoo.dev/docs/integrations/github-action/) when the job is before-versus-after prompt comparisons on pull requests and nothing more.

The tricky part is grading. Model-graded evals are useful when the signal is stable and the failure is cheap. I still keep a small human-reviewed set for pricing, legal language, or permission boundaries because that is where a confident wrong answer becomes an incident, not a metric blip. If you fully automate those flows on day one, you are not moving faster. You are hiding review debt under a dashboard.

I also split fast evals from slow evals. Fast checks run on every pull request. Slower and richer suites run before release or after a major model, provider, or retrieval change. If every gate takes 45 minutes, engineers stop believing in it and start routing around it.

This is the release contract I like to make explicit.

```yaml
evaluation-gates:
  pull-request:
    - name: structured-output
      threshold: 0.98
    - name: tool-selection
      threshold: 0.95
    - name: safety-refusal
      threshold: 1.00

  pre-release:
    - name: multilingual-support
      threshold: 0.90
    - name: policy-adherence
      threshold: 0.95
    - name: cost-per-task
      threshold: 0.35
```

My rule is blunt: if a prompt or model change cannot name the eval slice it should improve, the rollback threshold if it regresses, and the owner who will look at failures, it is not ready for production traffic. Below a few hundred production calls a day, keep this lean. Above that, stop arguing and wire the gate.
