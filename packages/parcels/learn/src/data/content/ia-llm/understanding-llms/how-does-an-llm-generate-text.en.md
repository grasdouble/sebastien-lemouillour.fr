---
id: how-does-an-llm-generate-text
order: 5
difficulty: beginner
tags: [LLM, tokens]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You ask a chatbot a question, and a few seconds later it streams back a coherent paragraph. It feels like the model "thought" about your question and wrote an answer. That feeling is almost entirely misleading, and understanding what is really happening will make you a much better judge of when to trust the output and when to be skeptical.

### One Token at a Time

An LLM does not write a complete sentence and then show it to you. It generates text one **token** at a time, where a token is a small chunk of text, often a word or part of a word. The word "running" might be a single token; "unbelievably" might be split into several fragments. [OpenAI's tokenizer tool](https://platform.openai.com/tokenizer) lets you see exactly how text is split for their models.

At each step, the model looks at all the text so far (your prompt plus everything it has generated) and produces a probability distribution over its entire vocabulary. It picks one token from that distribution, appends it to the context, and repeats. This process is called **autoregressive generation**. The full paragraph you receive is the result of thousands of these individual token decisions chained together.

### Probability, Not Truth

Here is the key insight: the model is not consulting facts. It is predicting which token is most likely to come next given everything before it. This distinction is crucial. The model produces text that is statistically coherent with its training data, and if that data contained errors or biases, those flow through into the output.

This is the deep cause of **hallucinations**, the phenomenon where an LLM states something false with complete confidence. The model generates the next token that fits the pattern, not the one that happens to be correct. A confident tone is not evidence of accuracy. [Hugging Face's guide to generation strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies) explains in practical detail how these sampling decisions can be tuned.

### How Randomness Enters the Picture

If the model always picked the single most probable next token, every response to the same prompt would be identical, and often quite bland. To introduce variety, a parameter called **temperature** (a value usually between 0 and 1, sometimes higher) scales the probability distribution before sampling. High temperature makes unlikely tokens more probable, producing more creative but less reliable text. Low temperature concentrates probability on the top choices, producing more predictable output.

The foundational architecture underlying virtually every modern LLM is the Transformer, described in the paper [Attention Is All You Need](https://arxiv.org/abs/1706.03762) by Vaswani et al. (2017). Reading that paper is not required for everyday use, but it is the primary reference if you ever want to go deeper into the mechanics.

### Why This Changes How You Prompt

Knowing that generation is probabilistic and sequential has practical consequences. The order and phrasing of your prompt matters: the model is pattern-matching against everything it sees, so a well-structured prompt produces better-structured output. If an answer seems wrong, rephrasing the question often works better than asking again verbatim, because you are steering the probability distribution in a different direction.

Most importantly, never treat a single LLM response as ground truth on anything consequential. Generate multiple responses, compare them, and verify specific factual claims through a primary source.
