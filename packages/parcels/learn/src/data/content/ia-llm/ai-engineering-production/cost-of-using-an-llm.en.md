---
id: cost-of-using-an-llm
order: 2
difficulty: beginner
tags: [LLM, cost, tokens, OpenAI, Anthropic]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You've built your first LLM feature. Now someone asks: how much will this cost per month? You have no idea. That is normal, because LLM pricing feels abstract until you translate it into one request, one user, one month.

Most providers charge per token. A token is a small chunk of text, not a word. "Hello world" is a couple of tokens, a long support conversation is many more. If you want to see how text gets split, the [OpenAI tokenizer](https://platform.openai.com/tokenizer) makes it concrete very quickly.

Then the provider bills two things: input tokens, the text you send, and output tokens, the text the model generates. Check the current rates on [OpenAI pricing](https://openai.com/api/pricing/) and [Anthropic pricing](https://www.anthropic.com/pricing/). The exact numbers change over time, but the habit you need does not: estimate before launch.

My rule is boring and useful: cost is a product decision, not a finance spreadsheet. A chat that keeps the whole history, adds a huge system prompt, retrieves five long documents, and asks for a 1,500-word answer is telling the model to be expensive. The bill follows the design.

A simple mental model helps:

- Cost per request = input tokens + output tokens
- Monthly cost = cost per request × number of requests
- Real cost = monthly cost + retries + failures + experiments + logging

That last line is the one beginners miss. Every time a prompt fails and you try again, you pay again. Every time you send unnecessary context, you pay again. Every time you choose a bigger model just to be safe, you pay again.

This is why I prefer to start with a budget, not a model. Decide what one user can cost per day. Then work backward. If you can afford only a few cents per active user, you probably need shorter prompts, fewer retrieved documents, smaller models, or tighter output limits. If the product creates high value per request, you can spend more.

A good first exercise is to measure three real prompts from your app: short, average, and worst case. Count their tokens, estimate the answer length, multiply by your expected daily traffic, and add a safety margin. That number will still be rough, but it will be more useful than guessing.

The trap is obsessing over the model price and ignoring usage shape. A cheap model with wasteful prompts can cost more than a better model with disciplined inputs.

What next: once you can estimate request cost on a napkin, move to choosing a model. Price only matters after you know what quality and latency the feature needs.
