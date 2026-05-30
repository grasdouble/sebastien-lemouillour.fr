---
id: self-consistency
order: 8
difficulty: intermediate
tags: [LLM, Prompting, reasoning, sampling]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You finally get a reasoning prompt that works, then the same request returns 42 on one run and 39 on the next. Nothing kills trust faster than a model that sounds certain while changing its mind between refreshes.

Self-consistency is my favorite fix when a task has one correct answer but several plausible reasoning paths. The [self-consistency paper](https://arxiv.org/abs/2203.11171) replaces greedy decoding with multiple sampled chains of thought, then picks the answer that appears most consistently across them. That sounds academic, but the practical idea is simple: if one run is noisy, ask for several and vote.

The trap is cost. OpenAI’s [prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering) is explicit that model outputs are non-deterministic and that you should build evals when prompts matter. Self-consistency turns that advice into an engineering pattern, but every extra sample costs tokens, time, and rate-limit budget. If a single answer costs 2,000 tokens, five samples cost 10,000 before you even aggregate.

Another thing people miss: do not vote on the reasoning, vote on the normalized final answer. The prettiest rationale is often the wrong one. I have burned too much time admiring elegant nonsense.

Here is the version I actually ship for fragile reasoning tasks:

```ts
const samples = await Promise.all(
  Array.from({ length: 5 }, async () => {
    const response = await client.responses.create({
      model: 'gpt-5.5',
      temperature: 0.7, // encourage diverse paths
      input: prompt,
    });

    return extractFinalAnswer(response.output_text);
  })
);

const answer = majorityVote(samples.map(normalizeAnswer));
```

Five samples is usually enough to tell me whether the prompt is robust or just lucky. If the vote splits 2-2-1, I do not trust the result, I treat it as uncertainty and either escalate to a stronger model or fall back to a deterministic check. That uncertainty signal is half the value.

Anthropic’s [prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) also starts with success criteria and empirical testing, which is exactly why self-consistency works well in production: it gives you a measurable confidence pattern instead of a single polished guess.

My rule is brutal on purpose. Use self-consistency when a wrong answer is expensive enough to justify three to five calls, such as financial extraction, policy checks, or math-heavy workflows. Do not spend it on generic chat copy. Majority voting is a reliability tool, not a personality feature.
