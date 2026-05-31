---
id: context-window
order: 10
difficulty: beginner
tags: [tokens, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You paste a long document, ask about the first page, and the model answers as if it only noticed the ending. That is not you being clumsy. It usually means the prompt asked the model to hold too much at once. A **context window** is the amount of text a model can use as its working memory for one response, and that space includes the reply it is about to generate, not just what you pasted in [Anthropic context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows).

## Why the window feels smaller than you expected

The missing piece for beginners is that models count **tokens**, not pages. A **token** is a chunk of text, such as a word, part of a word, or punctuation, and providers measure prompts with token budgets rather than human-friendly page counts [Anthropic token counting](https://docs.anthropic.com/en/docs/build-with-claude/token-counting).

That is why a huge context window can still disappoint. I would picture it as a desk, not a brain. A bigger desk lets you spread out more papers, but it does not force you to look at the right sentence.

## Why fitting is not the same as understanding

That desk analogy matters because transformer models were built around **attention**, the mechanism that helps the model weigh which tokens matter for the next prediction [Attention Is All You Need](https://arxiv.org/abs/1706.03762). Attention is useful, but it is not a guarantee that every part of a long prompt will be used equally well.

This answers the next frustration people hit: “If the text fits, why did the model still miss the key detail?” I would assume overload before I assume mystery. The hard limit is the maximum size that fits at all. The softer limit is the point where the prompt still fits, but the model starts using it less reliably.

## What I would choose in practice

I would choose a smaller, labeled prompt over a giant paste almost every time. That is not minimalism for its own sake. It is a reliability choice. When the important sentence is buried in the middle of a long context, models can underuse it, which is exactly the pattern studied in [Lost in the Middle](https://arxiv.org/abs/2307.03172).

So if a document is long, I would not drop the whole thing into the chat unless I had no better option. I would keep the task first, quote the exact passage that matters, and trim everything that does not change the answer. If you want the next concept after this, read the guide on embeddings, because that is another fundamental way models represent text, and it explains a lot of behavior that otherwise feels like magic. My rule is simple: if the answer depends on one passage, make that passage obvious, and if the prompt contains several goals at once, split it before you send it.
