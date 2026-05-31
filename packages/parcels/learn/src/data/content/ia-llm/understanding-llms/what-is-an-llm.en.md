---
id: what-is-an-llm
order: 4
difficulty: beginner
tags: [llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You open a chatbot because the blank page is winning. It gives you a polished email in ten seconds, and then you hit the annoying part: everyone calls this magic "an LLM" and moves on. If that acronym feels vague, good. It usually hides the one idea that actually matters.

### An LLM is a text machine first

I would explain **LLM** this way: it is a **model**, meaning a mathematical system whose behavior comes from learned **parameters**, or adjustable numerical values; it works on **language**, meaning text; and it is **large** because that system can contain billions of parameters. The [GPT-3 paper](https://arxiv.org/abs/2005.14165) gives a concrete scale point: GPT-3 had 175 billion parameters.

That still sounds abstract, so the next useful question is simple: what is such a big text machine trained to do? Not "know everything." Its core job is much narrower.

### It learns by guessing the next piece of text

During training, an LLM learns to predict the next piece of text from the context that came before it, the basic language modeling setup described in [Attention Is All You Need](https://arxiv.org/abs/1706.03762). The unit it predicts is a **token**, a small chunk of text that can be a whole word, part of a word, or punctuation. OpenAI's [Tokenizer](https://platform.openai.com/tokenizer) makes that visible in a few seconds.

This is the part beginners often underestimate. By getting very good at next-token prediction across huge datasets, the model picks up grammar, style, common facts, and many patterns about how language fits together. That is why the same tool can draft an email, rewrite a paragraph, or explain a concept in simpler words without switching brains.

### Why it feels smart

The Transformer architecture matters because it helps the model use context instead of treating each word in isolation. My preferred mental model is not "tiny person in a box" or "search engine with opinions." It is "extremely powerful autocomplete." That comparison is useful because it explains both the impressive part and the dangerous part.

### The rule I would use

If your task is mostly about shaping language, start with an LLM. If your task is mostly about verified facts, recent events, or high-stakes decisions, treat the LLM as a first draft and bring in a trusted source before you believe it. The reason is simple: the model is trained to produce a plausible continuation, not to verify facts. The next guide on token-by-token generation explains that mechanism and shows why these systems stop feeling mystical once you have seen it.
