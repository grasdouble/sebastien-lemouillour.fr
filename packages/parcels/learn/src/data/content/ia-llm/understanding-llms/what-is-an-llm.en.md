---
id: what-is-an-llm
order: 4
difficulty: beginner
tags: [LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

When someone says "I use AI to write my emails," what they almost always mean is "I use a Large Language Model." The abbreviation LLM shows up everywhere, in news articles, product descriptions, and job listings, usually without explanation. This guide breaks it down so you can understand what is actually happening when you talk to one.

### The Three Words in "Large Language Model"

Start with **Model**: a mathematical function with millions or billions of numerical parameters (adjustable values) trained to map inputs to outputs. Think of it as a machine with an enormous number of dials, all tuned through exposure to data.

Add **Language**: the input and output are human language, specifically text. The model learned to work with language by being exposed to vast amounts of it, including books, websites, code, and research papers.

Now add **Large**: modern LLMs have billions of parameters. [GPT-3](https://arxiv.org/abs/2005.14165), released by OpenAI in 2020, had 175 billion parameters. [Meta's Llama 3](https://ai.meta.com/blog/meta-llama-3/) family ranges from 8 billion to over 70 billion. "Large" matters because past a certain scale, models exhibit qualitatively new behaviors: they start following instructions, reasoning across topics, and generalizing to tasks they were never explicitly trained for.

### How an LLM Learns Language

LLMs are trained through a process called **pre-training**: the model reads vast quantities of text and learns to predict the next word, or more precisely, the next [token](https://platform.openai.com/tokenizer) (a chunk of text roughly corresponding to part of a word). Over billions of predictions, the model adjusts its parameters to get better and better at this task. It is not memorizing the internet; it is building a compressed, probabilistic model of how language works.

This is why an LLM can write in the style of a historical author, explain quantum physics in plain language, or translate between dozens of languages: it has internalized statistical patterns across all these domains.

After pre-training, most deployed models go through additional fine-tuning to make them helpful, honest, and safe. This typically involves **RLHF (Reinforcement Learning from Human Feedback)**, where human raters score model outputs and those scores steer further training.

### What an LLM Is Not

An LLM is not a database. It does not retrieve stored facts; it generates text that is statistically consistent with its training data. This matters enormously: it can be wrong, even confidently wrong. It also cannot tell you what happened yesterday unless it was trained on data that includes yesterday.

An LLM is also not a search engine. A search engine returns links. An LLM generates prose. These are useful for different things, and conflating them leads to misplaced trust.

### Choosing Which LLM to Use

My recommendation: match model size to your task. For simple drafting and summarization, a smaller, cheaper model is often just as good as a frontier model and costs a fraction. For complex reasoning, coding, or long documents, the quality difference becomes worth paying for. [Hugging Face's Open LLM Leaderboard](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard) is one of the most transparent places to compare models across standardized benchmarks before committing.

The next guide explains the mechanism by which an LLM actually produces its output, which will make it far easier to understand why it sometimes fails.
