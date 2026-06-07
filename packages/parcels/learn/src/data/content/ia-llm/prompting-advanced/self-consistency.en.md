---
id: self-consistency
order: 8
difficulty: intermediate
tags: [prompting, reasoning, llm]
publishedAt: 2026-06-07
updatedAt: 2026-06-07
---

You finally get a reasoning prompt to behave, then production returns 42, 39, and "probably 41" for the same task. That is when self-consistency stops sounding academic and starts paying rent.

Self-consistency comes from [Wang et al.](https://arxiv.org/abs/2203.11171): instead of taking one greedy reasoning path, you sample several paths and keep the answer that appears most often. I treat it as a reliability tactic, not as a magic intelligence upgrade.

The bill arrives fast. OpenAI’s [optimization guide](https://developers.openai.com/api/docs/guides/model-optimization) says model behavior is non-deterministic and should be measured, and its [Evals guide](https://developers.openai.com/api/docs/guides/evals) shows how to do that systematically. Five samples can reduce random misses, but they also multiply tokens and latency. The [rate limits](https://platform.openai.com/docs/guides/rate-limits) matter too, because repeated calls burn RPM and TPM much faster than one request.

My blunt rule is this: vote on a normalized final answer, not on the explanation. If you need a stable field to compare, [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) is safer than scraping prose, because it enforces a schema instead of hoping the model keeps the same format.

Before you copy the pattern, notice the request shape: same task every time, enough temperature to explore alternative paths, and a tight output cap so the retry budget stays under control. The code below follows the OpenAI [text guide](https://platform.openai.com/docs/guides/text?api-mode=responses) shape for the Responses API.

```ts
import OpenAI from 'openai';

const client = new OpenAI();

const instructions = [
  'Solve the task carefully.',
  'You may reason internally.',
  'Reply with only the final answer.',
].join(' ');

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

function majorityVote(values: string[]): [string, number] | null {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  return winner ?? null;
}

async function sampleFinalAnswer(task: string): Promise<string> {
  const response = await client.responses.create({
    model: 'gpt-4.1', // Pin one production model or snapshot.
    temperature: 0.7, // Add enough randomness to explore alternate paths.
    max_output_tokens: 60, // Keep each sample cheap.
    input: [
      { role: 'developer', content: instructions },
      { role: 'user', content: task },
    ], // Keep the prompt identical across samples.
  });

  return normalizeAnswer(response.output_text);
}

const task = 'What is 27 × 14?';
const samples = await Promise.all(Array.from({ length: 5 }, () => sampleFinalAnswer(task)));

const winner = majorityVote(samples);

if (!winner || winner[1] < 3) {
  throw new Error('No stable answer. Escalate or verify deterministically.');
}

console.log(winner[0]);
```

I use this pattern for bounded tasks such as math, classification, or extraction where one bad answer is costlier than three to five extra calls. If the top answer does not clear about 60% of votes, treat the result as unresolved and escalate instead of pretending the majority is confidence.
