---
id: tokenization
order: 9
difficulty: beginner
tags: [LLM, tokenisation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You change one emoji, add a line break, and suddenly the token count jumps. That feels unfair until you realize the model is doing a conversion step before it can read anything. That step is **tokenization**, the process that splits raw text into tokens. Beginners often ignore it because it sounds low-level, but I think it is worth understanding early. When prompts behave strangely, tokenization is often the invisible reason.

## What tokenization actually does

A model cannot ingest text as human-looking sentences. It first turns text into smaller units called tokens, then into numbers it can process. The splitting part is tokenization. Hugging Face’s [tokenizer summary](https://huggingface.co/docs/transformers/tokenizer_summary) explains why modern models usually break text into **subwords**, pieces that sit somewhere between full words and individual characters.

Why not just split on spaces? Because language is messy. Names, typos, rare words, punctuation, URLs, emojis, and code would explode the vocabulary. A **vocabulary** is the fixed list of pieces a model knows how to represent. Subword methods keep that list manageable while still letting the model build unfamiliar words from familiar parts.

Two common approaches show up often. **Byte Pair Encoding**, or BPE, merges frequent pieces step by step, while [SentencePiece](https://github.com/google/sentencepiece) can train tokenizers without relying on spaces at all. OpenAI’s [tiktoken](https://github.com/openai/tiktoken) is another practical example of how tokenizers are implemented for real models.

## Why the same sentence can split differently

This is the part that surprises most people: tokenization is not universal. Different models use different vocabularies and different tokenization rules. The same sentence can be cheap for one model and expensive for another.

Spacing matters too. In many tokenizers, a leading space is part of the token. That means “hello” and “ hello” are not necessarily the same unit. Punctuation matters. So do accented characters, file paths, and repeated symbols.

This is why copy-pasting from a PDF, a chat app, or a code editor can change your token count without changing the visible meaning very much. The text looks similar to you, but the model’s tokenizer may see a different pattern of pieces.

## Why I think beginners should care

You do not need to become a tokenizer expert. I would not spend hours studying merge tables unless you are building tools around LLMs. But I would learn one habit early: inspect tokenization when limits, cost, or weird behavior matter.

If a prompt is unexpectedly expensive, if a language seems to use more room than another, or if a model struggles with oddly formatted input, tokenization is a strong suspect. Your next step is practical: open a tokenizer viewer for one of your recurring prompts, then test three tiny edits, such as removing extra spacing, cleaning punctuation, or replacing pasted text from a PDF. You will quickly see which formatting problems are worth fixing and which ones are noise.
