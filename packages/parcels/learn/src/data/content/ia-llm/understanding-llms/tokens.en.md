---
id: tokens
order: 8
difficulty: beginner
tags: [LLM, tokens]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You paste a paragraph that feels short, then the chat app warns you about 180 tokens. That mismatch frustrates nearly everyone at first. Most beginners assume a model reads words the way humans do. It does not. If I had to pick one unit to watch when using an LLM, a **large language model** that predicts text, I would watch tokens before anything else, because tokens control price, speed, and how much the model can remember at once.

## Why words are not enough

A **token** is a chunk of text the model uses internally. Sometimes one token is a whole word. Sometimes it is part of a word, a punctuation mark, or even a leading space. OpenAI’s [tiktoken](https://github.com/openai/tiktoken) and Anthropic’s [token counting](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) docs both show the same big idea: models count text in tokens, not in words or characters.

That is why “banana” and “bananas” may not cost the same. It is also why French, English, emoji, and code can expand differently. A short sentence with lots of punctuation or rare terms can use more tokens than you expect. A longer sentence with common words can use fewer.

I find it helpful to picture tokens as the model’s packing boxes. Your sentence is the luggage, but the airline bills you by the number of boxes, not by how natural the sentence feels.

## Why tokens matter in practice

Every prompt uses tokens, and every answer uses tokens too. Providers count both when they talk about limits and usage. Google’s [Gemini tokens](https://ai.google.dev/gemini-api/docs/tokens) page explains token accounting the same way: tokens are the budget for both what you send and what the model returns.

This has three practical effects.

First, tokens affect cost. More tokens usually means a higher bill.

Second, tokens affect the **context window**, which is the maximum amount of text the model can consider in one request. If your prompt is too large, something must be shortened, dropped, or refused.

Third, tokens affect reliability. When you are close to a model’s limit, important instructions can get squeezed by long pasted notes, logs, or transcripts.

## What I would do

I would not obsess over token counts for every casual prompt. That becomes busywork fast. I would count tokens in exactly three situations: when money matters, when you are near a model limit, or when you are building a repeatable workflow.

If you are anywhere near those cases, use a tokenizer or counting tool before guessing. A rough mental rule is fine for everyday use, but guessing is a bad habit when limits are tight. Your next step is simple: take one prompt you use often, run it through a token counter, and compare the result with your intuition. That one check will fix a lot of future confusion.
