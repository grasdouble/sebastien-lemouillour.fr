---
id: choosing-a-model
order: 3
difficulty: beginner
tags: [LLM, evaluation, latency, OpenAI, HuggingFace]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You open a model list and suddenly every name sounds made up: mini, turbo, instruct, 70B, Sonnet, latest. Beginners expect one best model. There is no single winner. There is only the best model for a job, a budget, and a delay users can tolerate.

A model is the engine that turns your prompt into an answer. Bigger models often reason better, but they usually cost more and can respond more slowly. Smaller models are cheaper and faster, which matters a lot in real products. That is why my default is not pick the smartest model. It is pick the smallest model that reliably passes your tests.

If you are browsing open models, the [Hugging Face](https://huggingface.co/models) hub shows size, license, and community signals. If you want to run open-weight models on your own machine, [Ollama](https://ollama.com/) lowers the friction. On the API side, the rates on [OpenAI pricing](https://openai.com/api/pricing/) and [Anthropic pricing](https://www.anthropic.com/pricing/) are a good reminder that model choice is never just about quality.

For beginners, I use three questions.

First, what does the task actually need? Classification, extraction, simple rewriting, and short summaries often work fine on cheaper models. Long-form reasoning, messy instructions, or multi-step tool use usually push you toward stronger models.

Second, how wrong can the model be? If a mistake only creates a slightly awkward sentence, a small model is often fine. If a mistake changes legal meaning, billing, or customer trust, I become more conservative very quickly.

Third, how long can the user wait? Latency means response delay. People are more patient with a research assistant than with an autocomplete box. If the feature sits inside a fast workflow, shaving one second matters.

This is the part I care about most: do not choose from vibes. Build five to ten realistic examples from your own use case and run them through two or three candidate models. That tiny evaluation set will teach you more than a leaderboard. A model that looks impressive in public benchmarks can still be bad for your exact prompts.

If you feel stuck, start with a smaller paid model or a practical open model, set a clear pass or fail bar, and only move up when it misses that bar. Beginners often do the opposite: they start with the biggest model, love the answers, then panic when latency or cost shows up.

What next: once you have a candidate model, the next adult question is not speed or price. It is data privacy, meaning what information you send, where it goes, and who can see it.
