---
id: hallucinations
order: 12
difficulty: beginner
tags: [evaluation, llm]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

You ask for a source, the model invents one, and you only notice when the article title leads nowhere. That is usually the moment beginners stop treating polished answers as proof. A **hallucination** is a response that looks confident but is false, unsupported, or made up, which is how OpenAI describes the problem in its [hallucinations guide](https://cookbook.openai.com/articles/hallucinations). If you remember one rule, make it this: smooth wording is a style signal, not a truth signal.

## Why this happens

A large language model is trained to predict likely next **tokens**, meaning small chunks of text such as words or punctuation. The [GPT-3 paper](https://arxiv.org/abs/2005.14165) is still a clear primary source for that training objective. Notice what that goal does not include: a built-in fact checker. The model learns patterns in language, not a habit of stopping to verify claims in the outside world.

That is why I do not treat hallucinations as rare glitches. I treat them as a normal failure mode of a system designed to generate plausible text first. If your prompt is vague, your context is thin, or your question needs exact facts, the model may fill the gap with something statistically likely instead of something true.

I keep the word “hallucination” because people recognize it, but I would not romanticize it. Most of the time it is just an ordinary mistake wearing a confident tone.

## What actually reduces it

The boring fixes are the ones I trust. Give the model reliable context. Ask it to quote the passage it is using. When accuracy matters, connect it to systems that can look things up instead of guessing. Anthropic’s [tool use docs](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) show how a model can call external tools, and the [RAG paper](https://arxiv.org/abs/2005.11401) explains retrieval-augmented generation, a setup where the model answers from retrieved documents rather than memory alone.

I would also test the workflow, not just admire a few good examples. OpenAI’s [evals guide](https://platform.openai.com/docs/guides/evals) makes the case for checking a system on representative tasks, and that matters because hallucinations often hide in the cases you forgot to test.

What I would not do is treat prompt wording as the main cure. Better prompts help, but they do not turn a text generator into a reliable witness.

## How I would react to a suspicious answer

I would not ask, “Is this hallucinated?” That question is too mushy to help. I would ask tighter questions instead: Which claims need checking? Which claims are backed by a quoted source? Which ones depend on current information? Which ones are the model paraphrasing from memory?

Then I would drag the answer closer to evidence. Ask for cited passages. Ask for uncertainty to be stated plainly. Ask the model to separate facts, assumptions, and open questions. If the stakes are high, treat the first answer as a draft and verify it outside the model.

If you want a next step, take one answer you were ready to trust and audit every factual claim line by line. My threshold is simple: if the cost of being wrong is high, unverified output is not acceptable.
