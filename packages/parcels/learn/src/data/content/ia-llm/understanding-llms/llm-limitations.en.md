---
id: llm-limitations
order: 14
difficulty: beginner
tags: [LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The roughest beginner moment is realizing the model can sound brilliant and still fail at things you assumed were easy. It can explain a concept beautifully, then miscount, miss a key sentence, or invent a citation. That does not mean LLMs are useless. It means they have limits, and I think using them well starts with respecting those limits instead of pretending they are temporary quirks.

## They generate language, not guaranteed truth

An LLM is a system trained to predict likely text. That makes it strong at drafting, paraphrasing, summarizing, and pattern-matching across language. It does not automatically make it a source of verified truth. The [GPT-4 report](https://arxiv.org/abs/2303.08774) documents impressive capabilities, but it also discusses limitations and unreliable behavior.

This is the first limitation I would memorize: a good answer is not the same thing as a correct answer. If the task depends on facts, sources, calculations, or current events, the model may need external help.

That help often comes from tools or retrieval. Anthropic’s [tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) shows how a model can call external systems instead of guessing, and the [RAG paper](https://arxiv.org/abs/2005.11401) explains retrieval-augmented generation, where the model answers from supplied documents.

## They are limited by context and attention

Even before a model gets something factually wrong, it can simply lose track of what matters. A **context window** is the amount of tokenized text the model can consider in one request. Long windows help, but they do not solve everything. [Lost in the Middle](https://arxiv.org/abs/2307.03172) shows that information buried inside long inputs can be underused.

This creates a beginner trap. People paste everything because they are afraid to leave out something important. I would usually do the opposite. I would reduce, label, and prioritize. Models often perform better with cleaner evidence than with bigger piles of text.

## They are uneven, not uniformly bad

Another limitation is inconsistency. The same model can give an excellent answer once and a weak one on the next try. Small wording changes can alter the result. Some tasks are easy for one model and awkward for another. This does not mean evaluation is hopeless. It means you should test the exact behavior you care about instead of relying on reputation.

I also would not expect one model to be equally good at reasoning, multilingual nuance, formatting, safety, retrieval, and domain knowledge. “General purpose” is useful marketing language, but real systems still have distinct strengths and weak spots.

## What I would do with that knowledge

I would sort tasks into two buckets. Bucket one: low-risk drafting, brainstorming, rephrasing, and summarizing. LLMs shine there. Bucket two: high-stakes facts, decisions, compliance, math, medicine, law, or anything where being wrong costs real money or trust. There I would assume the model needs verification, grounding, or a different tool entirely.

A concrete rule helps: before trusting an answer, ask what failure mode would hurt you most. If you can name the failure mode, you can usually design a check for it. Your next step is to choose one task you currently hand to AI without thinking, then write down the exact limitation most likely to break it. That habit is much more valuable than memorizing a list of generic caveats.
