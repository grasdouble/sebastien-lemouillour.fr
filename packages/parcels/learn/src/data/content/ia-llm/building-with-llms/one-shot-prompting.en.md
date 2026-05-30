---
id: one-shot-prompting
order: 5
difficulty: beginner
tags: [LLM, prompting, one-shot, examples]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You have probably seen this annoying situation: the model nearly gets it. The structure is close, the tone is almost right, and yet the answer still feels off by 15 percent. That is exactly when one-shot prompting shines.

**One-shot prompting** means giving the model one example of the kind of input and output you want before asking it to handle a new case. Official docs from [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies), [OpenAI](https://platform.openai.com/docs/guides/prompt-engineering), and [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) all recommend examples when instructions alone leave too much room for interpretation.

### Why one example helps so much

A single example does something plain instructions often fail to do: it demonstrates taste. "Be concise" is vague. "Answer like this" is concrete. That makes one-shot prompting especially useful for tone, formatting, labeling, and any task where the model keeps choosing the wrong pattern even though it understands the topic.

I would reach for one-shot when zero-shot is close but slippery. If zero-shot is failing completely, one example may not be enough. If zero-shot is 85 percent there, one-shot can feel almost unfair.

### What one-shot looks like in practice

The example should be short, clean, and representative. It is not there to impress the model. It is there to anchor the pattern.

This is the kind of prompt I would use.

```text
Classify each support message as Bug, Billing, or Feature Request.
Reply with only the label.

Example:
Message: "I was charged twice for my subscription this month."
Label: Billing

Now classify this message:
"Dark mode looks great, but the mobile app crashes when I open settings."
```

That example teaches more than the instruction alone. It shows the exact output format, the level of brevity, and the style of labeling.

### The trap beginners fall into

Many people choose an example that is too fancy, too long, or too specific. Then the model copies accidental details instead of the pattern you meant to teach. If your example contains jokes, extra commentary, or weird formatting, do not be surprised when those come back.

I prefer boring examples. Boring examples teach the rule better.

### When to stop at one shot

Use one-shot when you need a nudge, not a whole curriculum. If the model still struggles on edge cases after one example, that is not failure. It simply means the pattern needs more coverage.

My rule is this: when the output is almost right and you can show one clean example of the missing pattern, use one-shot. If one example fixes one case but not the neighboring ones, the next guide is where you go, because few-shot prompting is basically the moment you stop hinting and start teaching.
