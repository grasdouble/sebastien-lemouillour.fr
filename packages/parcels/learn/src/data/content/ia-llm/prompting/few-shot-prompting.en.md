---
id: few-shot-prompting
order: 6
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

One example fixed the easy case, then the model face-planted on the weird ones. That is your signal that the task needs more than a hint.

**Few-shot prompting** means giving the model several examples of input-output pairs before asking it to solve a new case. In prompting jargon, a **shot** is just one example. Providers like [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies), [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview), and [OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) all describe examples as a core way to steer model behavior. When one-shot is shaky, few-shot is the next thing I try.

### Why a few examples beat one perfect paragraph

Some tasks are hard to define in abstract words. Custom labels, moderation policies, support triage, extraction rules, and house style often live in examples more naturally than in definitions.

Few-shot works because it teaches the model the boundaries of the pattern. One example says, "do something like this." Several examples say, "here is the line, and here is where it bends." That is much more useful when the edge cases matter.

### What makes good few-shot examples

The examples should be consistent in format and varied in content. Consistent format teaches the structure. Varied content teaches the rule. If every example is too similar, the model may memorize surface wording instead of the actual pattern.

When I review a few-shot prompt, I usually sanity-check it with a table like this before I obsess over wording.

| Pattern                     | Example                                                                      | Why it works / Why it fails                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Good: consistent format     | `Example 1: Message ... Label ...` repeated the same way each time           | Works because the model learns one stable structure instead of reverse-engineering a new layout on every shot. |
| Good: diverse examples      | Praise, complaint, question, and mixed-signal customer messages              | Works because variety teaches the boundary of the rule instead of one narrow wording pattern.                  |
| Good: labels stated clearly | `Label: Problem` rather than a vague answer sentence                         | Works because the target output is obvious and easy to imitate.                                                |
| Bad: inconsistent format    | First example is prose, second is bullets, third is JSON                     | Fails because the model spends attention guessing the wrapper instead of the task.                             |
| Bad: too many examples      | 15 tiny shots for a task that should stabilize after 3 to 5                  | Fails because prompt length grows, maintenance gets worse, and signal starts turning into noise.               |
| Bad: biased examples        | Every “problem” example sounds angry, every “praise” example sounds cheerful | Fails because the model may learn tone stereotypes instead of the actual classification rule.                  |
| Bad: wrong labels           | An obviously negative message is labeled `Praise`                            | Fails because one mislabeled shot can poison the whole pattern.                                                |

This is the kind of setup I like for a beginner-friendly classification task.

```text
Classify each customer message as Praise, Problem, or Question.
Reply with only one label.

Example 1:
Message: "The onboarding flow was clear and I got set up in five minutes."
Label: Praise

Example 2:
Message: "I can't reset my password because the email never arrives."
Label: Problem

Example 3:
Message: "Do you support SSO on the starter plan?"
Label: Question

Now classify this message:
"The design is clean, but I still can't export my invoices."
```

Notice what these examples do. They are short, they use the same layout, and they cover different cases. That variety is the whole point.

### The trade-off nobody tells beginners clearly enough

Few-shot prompts are powerful, but they also get longer. Longer prompts take more room in the context window and more effort to maintain. If you keep stuffing examples into the prompt, you may eventually be compensating for a task definition that is still unclear.

My threshold is practical: if three to five examples still do not stabilize the behavior, I stop piling on shots and consider a more systematic approach such as better evaluation or [fine-tuning](https://platform.openai.com/docs/guides/fine-tuning). After this guide, that is where I would look next, because once a prompt starts needing a tiny textbook, the real problem is usually bigger than wording.
