---
id: tokenization
order: 9
difficulty: beginner
tags: [tokens, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You swap one emoji, add one line break, and the token count jumps for no obvious reason. That usually feels unfair the first time. The annoying part is that the model is not reading your text the way you do. It starts with **tokenization**, a conversion step that chops text into smaller pieces before the model can process it.

## What the model sees first

A model does not work directly on sentences as humans see them. It first turns text into **tokens**, then into numeric IDs it can process, as explained by [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/ai/conceptual/understanding-tokens). A token can be a whole word, part of a word, punctuation, or even a space attached to the next word.

That design solves a practical problem. If a model stored every possible word exactly as written, the **vocabulary**, meaning the fixed list of pieces it knows, would become huge and brittle. So modern tokenizers often use **subwords**, pieces smaller than full words but larger than single characters. In the original [BPE paper](https://aclanthology.org/P16-1162/), frequent pieces are merged step by step so common chunks stay compact while rare words can still be built from smaller parts.

Another family, [SentencePiece](https://github.com/google/sentencepiece), can train directly from raw sentences instead of depending on spaces first. That matters because some languages do not separate words with spaces in the same way English does, and even in English, pasted text can carry odd spacing the eye barely notices.

## Why tiny edits change the count

This is the part I would learn early: tokenization is model-specific. I would choose model-specific counting tools over character estimates every time. OpenAI’s [token counting](https://developers.openai.com/api/docs/guides/token-counting) guide explicitly warns that exact counts depend on the full payload the model receives and that local shortcuts miss details such as files, images, tools, and model-specific behavior.

That is why the same sentence can be cheap for one model and more expensive for another. A leading space, a newline, smart quotes copied from a PDF, or repeated punctuation can produce different pieces internally. To you, the text still looks almost the same. To the tokenizer, it is a different pattern.

## What I would actually do

I would not memorize merge tables unless I were building tokenizer tooling. For a beginner, one habit is enough: inspect tokens when cost, limits, or strange behavior start to matter. A **context window** is the maximum number of tokens a model can handle in one request, and tokenization is often the hidden reason a prompt hits that limit sooner than expected.

There is one limitation to keep in mind. Tokenization tells you how text is chopped and counted, not whether your prompt is clear or useful. If you want a next step, paste one real prompt into a token viewer and try three edits: remove decorative line breaks, replace weird copied punctuation, and shorten boilerplate. If the prompt is still small and cheap, move on. If it is near the model limit or the count changes in surprising ways, inspect tokenization before rewriting the whole prompt.
