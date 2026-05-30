---
id: context-window
order: 10
difficulty: beginner
tags: [LLM, contexte]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You paste a long document, ask a question about page one, and the model answers with something that only reflects the last few paragraphs. That is not you being bad at prompting. It is usually a context problem. A **context window** is the maximum number of tokens a model can consider in one request. If you treat it like infinite memory, you will eventually get confusing answers.

## What fits inside the window

The important beginner detail is this: the window is shared space. Your instructions, the pasted document, the chat history, and the model’s reply all compete for room. Anthropic’s [token counting](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) and Google’s [Gemini tokens](https://ai.google.dev/gemini-api/docs/tokens) both frame context in terms of token budgets, not page counts or word counts.

That means a model with a large context window is not just “better at remembering.” It simply has a bigger working area for the current request. A **working area** is my favorite mental model here. Think of a desk. A larger desk lets you spread out more papers, but it does not guarantee you will notice the most important sentence on page three.

This matters because transformers, the model architecture introduced in [Attention Is All You Need](https://arxiv.org/abs/1706.03762), process relationships across tokens using **attention**, a mechanism that helps the model weigh which parts of the input matter for the next prediction. More room helps, but attention is not magic.

## Why long prompts still fail

Many beginners assume that if a model accepts a long input, it will use every part equally well. I would not make that assumption. Research like [Lost in the Middle](https://arxiv.org/abs/2307.03172) shows that models can miss or underuse information placed in the middle of long contexts.

So there are really two limits to respect. The first is the hard limit, the maximum number of tokens allowed. The second is the soft limit, the point where the prompt still fits but becomes harder for the model to use reliably.

That is why giant prompts often disappoint. They feel thorough to the human writing them, but they mix critical instructions with clutter, repeated context, logs, examples, and irrelevant background. Bigger context windows reduce pressure, yet they do not remove the need to prioritize.

## What I would do instead

I would treat context like a budget, not a dumping ground. Put the task first, the essential evidence second, and supporting material only if it changes the answer. If a document is long, I would not paste it raw unless I had no better option. I would segment it, summarize it, or retrieve only the relevant parts.

A simple rule works well: if the model’s answer depends on one exact passage, make that passage impossible to miss. Quote it, label it, and keep it near the question. Your next step is to take one overlong prompt you already use, cut it by a third, and compare the answer quality. Most people learn faster from that experiment than from memorizing token limits.
