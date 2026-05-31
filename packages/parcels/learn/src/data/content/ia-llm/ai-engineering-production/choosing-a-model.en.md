---
id: choosing-a-model
order: 3
difficulty: beginner
tags: [LLM, evaluation, latency, OpenAI, HuggingFace]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You open a model catalog, and the names feel like cereal boxes: mini, turbo, instruct, 70B, Sonnet, latest. The trap is thinking there must be one best model. I would not hunt for “best.” I would pick the cheapest model that is still good enough for the job, because model choice is always a trade between quality, latency, and price.

A model is the system that turns your prompt, meaning your instruction, into an answer. Provider comparison tables keep showing the same pattern: smaller models are usually faster and cheaper, while larger ones are better for harder reasoning tasks, so [Anthropic overview](https://docs.anthropic.com/en/docs/about-claude/models/overview) is a useful reality check when the naming gets confusing.

That still leaves a practical problem: where do you compare options without getting lost? If you are exploring open-weight models, [Hugging Face Models](https://huggingface.co/models) helps you filter by task, size, and license. If you want to run one locally, meaning on your own machine, [Ollama](https://ollama.com/) gives you a simple way to pull and serve supported models.

When beginners ask me where to start, I use three questions, and I would answer them in this order.

First, what does the task really need? Classification, extraction, simple rewriting, and short summaries often work on cheaper models. Multi-step planning, messy instructions, or long reasoning usually need a stronger one. If the task looks simple, I would start small and force the model to prove it deserves an upgrade.

Second, how expensive is a mistake? If the worst outcome is an awkward sentence, I am comfortable testing a small model first. If an error could affect money, legal meaning, safety, or trust, I would pay for more headroom sooner. This is the part beginners underestimate: model risk is a product decision, not only a technical one.

Third, how long can the user wait? Latency means response delay. The [OpenAI latency guide](https://platform.openai.com/docs/guides/latency-optimization) explains why smaller models usually respond faster and why output length matters too. In a chat assistant, a few extra seconds may be acceptable. In autocomplete or a tightly repeated workflow, one second can feel huge.

Once you know the task, the risk, and the patience budget, one last problem remains: benchmark scores still do not tell you whether your prompts will work. That is why I would build a tiny eval set first. The [OpenAI evals guide](https://platform.openai.com/docs/guides/evals) recommends testing models against representative inputs, and that is the habit I trust most. Five to ten realistic examples from your own use case beat a flashy public leaderboard every time.

My rule of thumb is simple: start with the smallest model that passes your evals, then move up only when you can name the failure clearly. What next: once you can state your quality bar and your maximum acceptable delay in one sentence, move to data privacy, because the next model decision is really about what data you can send and where it is processed.
