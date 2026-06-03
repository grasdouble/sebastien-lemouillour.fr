---
id: tokens
order: 8
difficulty: beginner
tags: [tokens, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You paste one short paragraph, then the chat app says 180 tokens and suddenly the cheap request in your head feels expensive. That confusion is normal. Most beginners expect a model to read words the way people do. It does not. If I had to watch one thing first with an LLM, a **large language model** that predicts text, I would watch tokens, because tokens decide cost, speed, and how much text the model can keep in play at one time.

## Why the word count misleads you

A **token** is a chunk of text the model uses internally. Depending on the model, one token can be a full word, part of a word, punctuation, or even a space attached to the next word. [OpenAI](https://platform.openai.com/tokenizer) and [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) both explain that models count tokens, not words or characters.

That answers the first weird result: “banana” and “bananas” may not be billed the same way. French, English, emoji, and code also break apart differently. There is no universal words-to-tokens formula, because each model family has its own **tokenizer**, the tool that splits text into tokens before the model processes it.

The analogy I would keep is moving boxes. Your sentence is the stuff in your apartment. Tokens are the boxes the movers count. You pay for boxes, not for how short the sentence felt when you wrote it.

## Why tokens become a practical problem

Once you know the model counts boxes, the next question is obvious: why should you care? Because providers count the tokens you send and the tokens the model sends back. [Google AI](https://ai.google.dev/gemini-api/docs/tokens) explains the same accounting for Gemini.

That matters in three situations, and I have a clear preference here: I would only measure when the decision changes something. First, more tokens usually means more cost. Second, tokens fill the **context window**, the maximum amount of text a model can consider in one request. Third, when you push near that limit, useful instructions can get crowded out by pasted notes, logs, or transcripts.

There is one limitation beginners should hear early: token estimates are not portable across all models. A count from one tokenizer is a guide for that model family, not a law of nature.

## What I would actually do

I would not count tokens for every casual chat. That turns into busywork. I would count them when money matters, when the prompt is getting long, or when I am building a workflow I plan to repeat.

If that still feels abstract, do one concrete check next: take a prompt you reuse, run it through the tokenizer for the model you actually use, then compare the number with your guess. My rule is simple: if a prompt is reused, billable, or bigger than a few paragraphs, count before you send.
