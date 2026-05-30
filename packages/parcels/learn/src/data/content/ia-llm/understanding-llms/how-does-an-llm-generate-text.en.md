---
id: how-does-an-llm-generate-text
order: 5
difficulty: beginner
tags: [LLM, tokens]
publishedAt: 2026-05-30
updatedAt: 2026-05-31
---

A chatbot gives you an answer in seconds, so the natural guess is: it understood your question, then wrote a reply. If you are new to LLMs, I would drop that story early because it creates most of the confusion. The safer mental model is simpler: an LLM is a prediction engine that keeps guessing the next piece of text.

### It starts by chopping text into pieces

That raises the first problem. A model cannot work directly with raw sentences, so it first turns your prompt into **tokens**, small chunks of text created by a **tokenizer**, the tool that splits text into pieces such as whole words, parts of words, or punctuation. The [tokenizer docs](https://huggingface.co/docs/transformers/tokenizer_summary) explain why this subword split is useful, and the [GPT-2 docs](https://huggingface.co/docs/transformers/model_doc/gpt2) describe GPT-style models as predicting the next word from the previous ones.

### Then it makes one guess, not a full draft

Once you know the text is chopped into tokens, the streamed reply stops looking magical. A **causal** language model, meaning one that can only look at earlier tokens while generating, reads the tokens already on the page, estimates which token should come next, adds one choice, and repeats. The original [Transformer paper](https://arxiv.org/abs/1706.03762) describes the masking setup that makes each position depend only on earlier positions.

### Why it can sound sure and still be wrong

This is the point I think beginners should memorize: the model is optimizing for a plausible continuation, not for truth. That is why a polished answer can still be false, a failure OpenAI discusses in its [OpenAI paper](https://openai.com/index/why-language-models-hallucinate/). If you keep thinking “next likely token” instead of “hidden expert,” a lot of strange behavior suddenly makes sense.

### Where randomness enters

You might still wonder why the same prompt can produce different wording. During generation, the system can either take the top token or sample from several candidates, and the [generation guide](https://huggingface.co/docs/transformers/main/en/generation_strategies) walks through those choices. One important setting is **temperature**, which controls how adventurous that sampling becomes: lower temperature is steadier, higher temperature is riskier. For beginner use, I would keep temperature low whenever accuracy matters more than style.

If you want a practical next step, read the guide on temperature after this one. My rule is simple: when a question should have one correct answer, treat the model like a rough-draft machine and verify the claim yourself.
