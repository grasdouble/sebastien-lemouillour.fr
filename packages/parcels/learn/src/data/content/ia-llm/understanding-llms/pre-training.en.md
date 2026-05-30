---
id: pre-training
order: 18
difficulty: intermediate
tags: [LLM, entraînement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

A lot of teams reach for fine-tuning first because it feels concrete. You have examples, you run a job, you expect behavior to improve. Then the model still misses obvious domain facts, invents terminology, or writes in a tone that never really sounds native. That is usually the moment you realize the expensive part was decided earlier, during pre-training.

## Pre-training is where priors are built

Pre-training is where a model learns the broad statistical structure of language and knowledge from raw corpora. The objective can look almost boring, like next-token prediction in [GPT-3](https://arxiv.org/abs/2005.14165), but the effect is huge: vocabulary familiarity, style coverage, latent world knowledge, multilingual balance, and robustness to messy text all get shaped here.

This is why I treat pre-training as the place where you buy priors, not polish. If the base model has weak priors for your domain, no amount of polite prompting will fully compensate. You can steer the model later, but you are steering what was already learned.

## Data quality beats romantic ideas about “more data”

The easy mistake is to imagine pre-training as a brute-force race for more tokens. The [Chinchilla](https://arxiv.org/abs/2203.15556) result is the correction I keep coming back to: for a fixed compute budget, many large models were undertrained, and better performance came from training on more data rather than only adding parameters. Quantity matters, but compute-optimal training and curation matter more than bragging rights.

If I had to choose between a slightly smaller model trained on cleaner, more diverse, deduplicated text and a larger model trained on noisy web sludge, I would take the cleaner corpus almost every time. The downstream failure modes are better. You get fewer weird repetitions, less brittle domain transfer, and less accidental memorization.

That is also why domain pre-training can work so well. [BloombergGPT](https://arxiv.org/abs/2303.17564) is a good example: when the target domain has its own vocabulary, document structure, and style, continued pre-training can do more than a thin instruction layer ever will.

## When continued pre-training is worth it

I would only pay the pre-training bill when the gap is actually about knowledge or language exposure. Think specialized jargon, legal phrasing, biomedical syntax, or internal document formats that look nothing like the open web. In those cases, continued causal language-model training, as shown in the [Hugging Face docs](https://huggingface.co/docs/transformers/en/tasks/language_modeling), can be the right lever.

When the gap is mostly behavioral, pre-training is usually overkill. If you need better formatting, tool use, shorter answers, or a safer refusal style, instruction tuning or retrieval augmentation is cheaper and faster.

Security matters here too. Raw corpora can leak private or copyrighted material into the model’s parameters, and memorization is not theoretical. The extraction work from [Carlini et al.](https://arxiv.org/abs/2012.07805) is the paper I cite whenever someone suggests “just scrape everything.” If you cannot describe your data sourcing, deduplication, filtering, and retention story clearly, you are not ready to pre-train.

My rule: use continued pre-training when the gap is in language exposure or domain knowledge; use prompting, RAG, or instruction tuning when the gap is mainly in behavior.
