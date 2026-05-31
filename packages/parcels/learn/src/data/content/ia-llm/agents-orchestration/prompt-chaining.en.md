---
id: prompt-chaining
order: 9
difficulty: intermediate
tags: [agents, prompting, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

One giant prompt feels efficient until it has to classify the request, extract fields, call a tool, draft a response, and explain itself in one shot. Then one tiny change breaks everything and you have no clue which part actually failed.

That is why I prefer prompt chaining for workflows that mix reasoning and execution. Instead of asking the model to do five jobs at once, you split the work into smaller prompts with explicit inputs and outputs. Anthropic’s [prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) explicitly recommends breaking complex tasks into steps, and OpenAI’s [prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering) pushes the same idea through clear instructions, decomposed tasks, and evaluation.

The trick most tutorials skip is that the boundaries matter more than the prompts. Every step should have one responsibility and one contract. If step 2 fails, you should know whether the classifier was wrong, the retriever returned junk, or the drafter ignored evidence. If all you build is a prettier spaghetti prompt, chaining buys you nothing.

I also like chaining because it makes cost visible. A single bloated prompt hides waste inside one request. A chain makes you notice that your “quick feature” now does four model calls, two retries, and one validation pass. That is painful, but useful pain.

Here is a chain I trust more than a mega-prompt:

```ts
const intent = await classifyTicket(ticketText); // billing | bug | sales
const context = await retrieveContext(intent, ticketText);
const draft = await draftReply({
  ticketText,
  intent,
  context,
});
const finalReply = await validateReply(draft); // tone, policy, missing facts
```

The important part is not the syntax, it is the contract between steps. I usually make each boundary machine-checkable with JSON, because a typed failure is easier to recover from than a polite paragraph. OpenAI’s [structured outputs guide](https://platform.openai.com/docs/guides/structured-outputs) is useful here even if you are not building a full schema-first system, because it forces you to think about fields, enums, and required data before the chain grows teeth.

There is one more trap: never feed raw tool output back into the next prompt like it is trusted truth. Search results, scraped pages, and user text should be clearly delimited and treated as untrusted context. Anthropic’s [guardrail guide](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks) is pretty direct on this: layer validation and monitoring, because prompt injection will happily walk straight through a sloppy pipeline.

My rule is simple. Chain prompts when each step can be tested, logged, and retried independently. If two steps always fail together, merge them. If one bad call poisons the rest of the flow, split earlier and add a stronger contract.
