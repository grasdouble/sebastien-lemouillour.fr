---
id: continuous-evaluation
order: 17
difficulty: advanced
tags: [LLM, evaluation, CI, Braintrust, DeepEval]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your chatbot was fine on Friday. On Monday, after a prompt tweak, a model version change, and one retrieval config update, it now answers refund questions with the wrong policy. Nobody noticed until support tickets arrived. This is exactly why continuous evaluation exists.

This only makes sense if you are shipping AI to real users. If you are still prototyping, come back later. Evaluation has a maintenance cost, and you should only pay it once prompt changes, model swaps, and retrieval updates happen often enough to create real regression risk.

The main thing I care about is turning vague quality talk into a release gate. "It felt better in staging" is not a process. A living eval suite tied to production failure modes is a process. That means every bad incident should either create a new test case or strengthen an existing one. If your eval set is disconnected from incidents, it will slowly become a vanity benchmark.

I do not want one giant score. I want slices: factuality, policy adherence, structured output validity, tool choice, multilingual behavior, and latency or cost budgets. [OpenAI Evals](https://github.com/openai/evals) is useful for understanding benchmark structure. [Braintrust](https://www.braintrust.dev/docs) is excellent when you want experiment tracking and dataset versioning around those benchmarks. [DeepEval](https://docs.confident-ai.com/) is the tool I reach for when I want code-first assertions in CI. [Promptfoo](https://promptfoo.dev/docs/intro) is great when I need to compare prompt and model matrices without building a platform first.

The trap is over-automating subjective judgments too early. Use model-graded evals where they are cheap and stable, but keep a narrow human-reviewed set for high-impact flows like pricing, legal language, or permission boundaries. A noisy auto-grader is still useful if it catches drift on the same dimension every day. It is useless if teams treat it like absolute truth.

I also separate fast evals from slow evals. Fast checks run on every pull request. Slower, richer suites run before release or after major provider changes. If everything takes 45 minutes, engineers will stop trusting the gate and start clicking around it.

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

My rule: if a prompt or model change cannot name the eval slice it is expected to improve, and the rollback threshold if it degrades, it is not ready for production traffic.
