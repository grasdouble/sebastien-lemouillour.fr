---
id: copilot-intro
order: 1
difficulty: beginner
tags: [copilot, ai-agents, github]
---

You're working on a project. You know exactly what you want to build, but half the time goes to looking up syntax, writing tests for logic you've already worked out in your head, copying boilerplate you know by heart. GitHub Copilot exists to absorb exactly that part of the work.

But "Copilot" actually covers several fairly different tools, and understanding which does what is the first thing to sort out.

## Three tools under one name

**Inline suggestions** are what most people picture when they hear "Copilot". You start typing, Copilot proposes a completion. It looks at the open file, your imports, your function names, and tries to guess what you're about to write. It's useful for anything repetitive: a function similar to another one, a pattern you've used before, standard boilerplate.

**Chat** is a text conversation with the model, built into your editor or terminal. The difference from inline suggestions: you control the context explicitly. Instead of Copilot guessing what you want, you explain it. You can ask it to understand a piece of code, propose a refactor, explain why a test is failing. This is where the tool starts to feel like a collaborator rather than a completer.

**Agent mode** goes a step further. Copilot can read files, run commands, modify code, create tests, and chain several actions autonomously. You describe a task; it does it. That's powerful, and it's also where context becomes critical: an agent without clear instructions about the project makes decisions that can be completely off.

## What Copilot won't do well without help

Copilot has no memory between sessions. Every conversation starts from scratch. It doesn't know your project uses `pnpm` instead of `npm`, that you never want automatic commits, that accessibility is mandatory on every component.

Tell it once, it remembers for the conversation. Don't tell it, and it makes its own choices — often very reasonable defaults for an unknown project, which means potentially very wrong for yours.

That's the problem `AGENTS.md` solves: a configuration file that Copilot agents read at startup and that gives them persistent context about the project. This guide and the ones that follow explain how to build it.

## The most common misuse

The natural temptation is to only use Copilot to speed up things you already know how to do. That's a fine start, but it undersells the tool.

The real gain comes from delegating tasks you _could_ do but that have no intellectual interest: writing tests for logic you've already designed, scaffolding a new component, documenting an API, converting types. These tasks take time, require attention, and add nothing to the thinking. Copilot handles them well.

That freed-up time goes elsewhere: to architecture, difficult decisions, the parts of the project that genuinely deserve careful thought.

## Where to start

If you're new to the tool, begin with inline suggestions in your usual editor. Watch how local context influences the proposals. Try chat to ask questions about an existing piece of code.

When you start noticing recurring mistakes (Copilot making choices that don't match your project), that's the signal it's time to set up `AGENTS.md`. The next guide covers exactly that.
