---
id: pre-training
order: 18
difficulty: intermediate
tags: [fine-tuning, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

You do a neat fine-tuning run, the eval looks decent, and the model still blanks on the vocabulary your field uses every day. I have seen people blame prompting at that point, but the trap is earlier: if the base model never absorbed your language patterns during pre-training, you are asking later stages to compensate for missing exposure.

## Pre-training is where the model buys its reflexes

Pre-training is where a model learns the broad statistical structure of text from raw corpora. The objective can look almost boring, like next-token prediction in [GPT-3](https://arxiv.org/abs/2005.14165), but that stage is where vocabulary familiarity, style range, multilingual balance, and a big chunk of latent world knowledge get shaped.

That is why I treat pre-training as the place where you buy reflexes, not polish. If the base model has weak priors for your domain, no amount of polite prompting will fully rescue it. You can steer later, but you are still steering what the model already learned to notice.

## Cleaner data beats bigger headlines

The easy mistake is to imagine pre-training as a brute-force race for more tokens. The [Chinchilla](https://arxiv.org/abs/2203.15556) result is the correction I keep coming back to: under a fixed compute budget, many big models were simply undertrained, and better performance came from scaling data with model size instead of only inflating parameters.

If I had to choose between a slightly smaller model trained on cleaner, more diverse, deduplicated text and a larger model trained on noisy web sludge, I would take the cleaner corpus almost every time. You usually get fewer weird repetitions, less brittle transfer, and less accidental memorization.

That is also why domain pre-training can pay off. [BloombergGPT](https://arxiv.org/abs/2303.17564) is a good example: mixing large general corpora with a serious domain corpus improved finance tasks without wrecking general performance. My bias here is clear: if the gap is domain vocabulary, feed the model better text before you ask it to follow better instructions.

## Start with continued pre-training, not a moonshot

Full pre-training is a company-scale bill. Continued pre-training is the practical first move when the gap is really about language exposure: legal phrasing, biomedical syntax, support logs, or niche document formats that barely appear on the open web. The [Transformers docs](https://huggingface.co/docs/transformers/en/tasks/language_modeling) show the same underlying move as ordinary causal language modeling; you change the corpus, not the objective.

If you want to test that hypothesis cheaply, start with a tiny run and watch whether perplexity and downstream evals move together.

This is the smallest experiment I would run before approving a larger budget.

```python
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    DataCollatorForLanguageModeling,
    Trainer,
    TrainingArguments,
)

model_name = "distilgpt2"
dataset = load_dataset("text", data_files={"train": "domain-corpus.txt"})

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token


def tokenize(batch):
    return tokenizer(
        batch["text"],
        truncation=True,
        max_length=512,  # keep the probe run cheap and comparable
    )


train_dataset = dataset["train"].map(
    tokenize,
    batched=True,
    remove_columns=["text"],
)

model = AutoModelForCausalLM.from_pretrained(model_name)
collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

args = TrainingArguments(
    output_dir="artifacts/pretraining-check",
    per_device_train_batch_size=4,  # start small to estimate memory cost
    gradient_accumulation_steps=8,  # raise effective batch size cheaply
    learning_rate=2e-5,  # gentle rate for continued pre-training
    num_train_epochs=1,  # enough to detect signal before overspending
    logging_steps=20,
    save_strategy="no",  # avoid filling disk during a probe run
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=train_dataset,
    data_collator=collator,
)

trainer.train()
```

## Do not use pre-training to fix a behavior problem

When the gap is mostly behavioral, pre-training is usually the expensive wrong tool. If you need better answer formatting, stronger instruction following, or fresher facts with provenance, [InstructGPT](https://arxiv.org/abs/2203.02155) and [RAG](https://arxiv.org/abs/2005.11401) point to cheaper levers: tune behavior, or retrieve knowledge at generation time, instead of trying to bake everything into weights.

Security and cost are where people get reckless. [Carlini et al.](https://arxiv.org/abs/2012.07805) showed that large language models can leak memorized training examples, including personal data. So before you even discuss GPUs, I would require a written story for licensing, consent, deduplication, retention, and evaluation. If that story is vague, I would not greenlight the run.

Decision rule: pay for continued pre-training only when evals show a domain-knowledge or language-exposure gap that prompting, instruction tuning, or RAG cannot close at lower cost.
