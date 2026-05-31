---
id: self-consistency
order: 8
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

You get a reasoning prompt to behave, then production starts returning 42, 39, and "probably 41" for the same question. That is when you stop caring about eloquence and start caring about reliability.

Self-consistency is the trick I reach for when a task should converge on one answer even if there are several plausible ways to get there. The [paper](https://arxiv.org/abs/2203.11171) replaces greedy decoding with several sampled reasoning paths, then picks the answer that stays consistent across them. Academic phrasing aside, the move is simple: run the model a few times and make agreement earn the win.

The catch is cost. OpenAI’s [model optimization](https://developers.openai.com/api/docs/guides/model-optimization) guide is blunt: LLM output is non-deterministic, and you need measurements to know whether a prompt is improving or just rolling high. If you have not built [evals](https://developers.openai.com/api/docs/guides/evals), self-consistency can feel reassuring while quietly multiplying your bill. One response at 2,000 tokens is fine. Five samples turns the same request into a small budget meeting.

Another mistake I see all the time: people vote on the reasoning instead of the final answer. Bad idea. Vote on a normalized final value, because the most elegant explanation in the room is often complete nonsense. LLMs are very talented at sounding like they did the math.

Here is the version I would actually ship for a fragile reasoning step:

```ts
const samples = await Promise.all(
  Array.from({ length: 5 }, async () => {
    const response = await client.responses.create({
      model: 'gpt-4.1',
      temperature: 0.7,
      input: prompt,
    });

    return extractFinalAnswer(response.output_text);
  })
);

const answer = majorityVote(samples.map(normalizeAnswer));
```

Five samples is usually enough to tell me whether the prompt is robust or just lucky. If the split lands at 2-2-1, I do not trust the majority. I treat that as uncertainty and either escalate to a stronger model or run a deterministic check. That signal is half the point.

Anthropic’s [testing guide](https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests) makes the same call from a different angle: define success criteria, build evaluations, then iterate. That is why I like self-consistency in production. It is not magic reasoning dust, it is a cheap way to turn disagreement into a visible metric.

Use self-consistency when a wrong answer is expensive enough to justify three to five calls, like financial extraction, policy checks, or math-heavy workflows. Skip it for generic chat copy. If you cannot explain what you will do when the votes split, you are not ready to pay for the extra samples.
