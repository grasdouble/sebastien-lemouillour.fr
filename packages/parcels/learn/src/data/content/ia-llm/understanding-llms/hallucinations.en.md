---
id: hallucinations
order: 12
difficulty: beginner
tags: [LLM, fiabilité]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You ask for a source, the model gives you a citation, and five minutes later you discover the paper title does not exist. That experience is memorable for all the wrong reasons. In LLM work, a **hallucination** is an answer that sounds plausible but is false, unsupported, or invented. If you are new to AI, the most important mindset shift is this: fluency is not proof.

## Why hallucinations happen

A large language model is trained to predict likely next tokens from patterns in data. The [GPT-3 paper](https://arxiv.org/abs/2005.14165) is one of the clearest primary sources for that framing. Notice what is missing from that objective: a built-in truth checker. The model is rewarded for producing likely continuations, not for opening a browser, checking a database, or admitting uncertainty unless it has been specifically trained or prompted to do so.

That is why hallucinations are not just random glitches. They are a predictable failure mode of systems optimized for language generation. When the prompt is vague, the context is missing, or the answer requires exact facts, the model may fill gaps with something that statistically looks right.

I think the word “hallucination” is useful, but slightly dangerous, because it can sound rare or dramatic. In practice, many hallucinations are ordinary mistakes delivered with too much confidence.

## What reduces them

The best fixes are boring, which is good news. Give the model reliable context. Ask for quotes or evidence. Connect it to tools when current or exact information matters. Anthropic’s [tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) docs show how models can call external systems instead of guessing, and the [RAG paper](https://arxiv.org/abs/2005.11401) explains retrieval-augmented generation, a pattern where a model answers using retrieved documents rather than memory alone.

Evaluation matters too. OpenAI’s [evals guide](https://platform.openai.com/docs/guides/evals) is a good reminder that reliability improves when you test the system against representative tasks instead of trusting a few impressive examples.

What does not work well is blind confidence in prompt wording. Better prompts help, but they do not magically turn a generator into an authority.

## How I would respond to a suspicious answer

I would not ask, “Is this hallucinated?” That question is too fuzzy. I would ask narrower questions: Which claims need verification? Which ones are quoted from a source? Which ones depend on up-to-date facts? Which ones are just the model’s phrasing?

Then I would force the answer closer to evidence. Ask for cited passages. Ask for uncertainty to be stated. Ask the model to separate facts, assumptions, and open questions. If the task is high stakes, use external verification and assume the first answer is only a draft.

A simple decision rule works well: the more costly it would be to be wrong, the less you should accept from the model without checking. Your next step is to take one answer you already trust a little too quickly and audit every factual claim line by line. That exercise changes how you use LLMs more than any slogan about hallucinations.
