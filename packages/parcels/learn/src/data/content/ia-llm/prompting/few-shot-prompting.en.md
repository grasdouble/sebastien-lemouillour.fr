---
id: few-shot-prompting
order: 6
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-08
updatedAt: 2026-06-08
---

You wrote one clean example, and the model still gets the neighboring cases wrong. That is usually the moment to stop polishing the wording and start teaching by example.

**Few-shot prompting** means giving the model several worked examples before the real task. A **worked example** is one input paired with the output you want back. Google explains that few-shot examples help control output format, phrasing, scope, and broader response patterns, should stay consistent in format, and should be tested carefully because too many examples can make the model cling too closely to the samples you showed, a problem called **overfitting** ([Google few-shot](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/few-shot-examples)).

### Why beginners reach for it

Few-shot is most useful when the boundary between answers is fuzzy. A **label** is the short category name you want back, such as `Praise` or `Problem`. An **edge case** is an awkward example that sits near the line between two labels. OpenAI says GPT models do better with explicit instructions, and examples are one practical way to make those instructions concrete when plain wording still leaves room for guessing ([OpenAI prompting](https://developers.openai.com/api/docs/guides/prompt-engineering)).

Anthropic recommends defining success criteria and testing prompts against them before you keep tuning. That advice matters here because a longer prompt is only better if it improves results on new cases, not just on the examples you pasted into it ([Anthropic guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices)).

### What good few-shot examples look like

When I review a beginner prompt, I look for these signals first.

| Pattern                     | Example                                                             | Why it works / Why it fails                                                                                    |
| --------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Good: consistent format     | `Example 1: Message ... Label ...` repeated the same way each time  | Works because the model learns one stable structure instead of reverse-engineering a new layout on every shot. |
| Good: varied cases          | Clear praise, clear problem, clear question, then one mixed case    | Works because the set shows the rule and its boundary, not one repeated phrasing pattern.                      |
| Good: labels stated clearly | `Label: Problem` rather than a full answer sentence                 | Works because the target output is obvious and easy to copy.                                                   |
| Bad: mixed wrappers         | First example is prose, second is bullets, third is JSON            | Fails because the model spends attention guessing the wrapper instead of the task.                             |
| Bad: near-duplicates        | Five examples that all say the same thing with tiny wording changes | Fails because the prompt gets longer without teaching a new boundary.                                          |
| Bad: wrong labels           | An obviously broken login message labeled `Praise`                  | Fails because one bad example can teach the wrong rule.                                                        |

I would hand a beginner something this plain before adding anything fancier.

```text
Classify each customer message as Praise, Problem, or Question.
Reply with only one label.

Example 1:
Message: "The onboarding was clear and I got set up in five minutes."
Label: Praise

Example 2:
Message: "I can't reset my password because the email never arrives."
Label: Problem

Example 3:
Message: "Do you support SSO on the starter plan?"
Label: Question

Now classify this message:
"The interface is clean, but I still can't export my invoices."
```

This prompt stays readable because every example uses the same shape, each label is explicit, and the final message is slightly mixed instead of being an obvious copy of a previous case.

### The limit to respect

More examples are not free. Each one adds **tokens**, the chunks of text the model reads, so the prompt gets longer, more expensive, and harder to maintain. OpenAI describes improvement as a loop of evals, prompt engineering, and, for some use cases, fine-tuning, which is the right next step once adding examples stops changing real results ([OpenAI tuning](https://platform.openai.com/docs/guides/fine-tuning)).

My rule is simple: if each new example only fixes its own tiny corner case, stop growing the prompt. Next, measure the behavior with evals, and only look at fine-tuning if repeated tests show few-shot has clearly plateaued.
