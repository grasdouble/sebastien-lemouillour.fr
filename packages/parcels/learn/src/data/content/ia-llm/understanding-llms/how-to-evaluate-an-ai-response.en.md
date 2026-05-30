---
id: how-to-evaluate-an-ai-response
order: 15
difficulty: beginner
tags: [LLM, évaluation]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

The usual beginner mistake is accepting the first AI answer that sounds calm, polished, and confident. A smooth paragraph can still be wrong, incomplete, or useless for the job in front of you. If I had to teach one habit first, it would be this: stop asking whether the answer sounds smart. Ask whether it helps you make the next decision safely.

## Start with the decision, not the response

An **evaluation** is a way to judge whether an output is good enough for a specific task. The [OpenAI evals guide](https://platform.openai.com/docs/guides/evals) describes the same pattern in more formal language: define the task, prepare test cases, then inspect the results with clear checks.

That changes the first question. It is not “Is this a good answer?” It is “Good enough for what?” A study note, a customer reply, and a medical summary do not deserve the same standard.

## Write a tiny rubric before you read

If that still feels vague, write a **rubric** first. A rubric is just a short scoring grid: the two or three things you care about most. For a beginner, I would pick accuracy, task fit, and clarity. Not ten criteria. Not a spreadsheet with fifty rows. Small rubrics are easier to apply the same way every time, which matters more than sounding sophisticated.

This is also why [HELM](https://arxiv.org/abs/2211.09110) is such a useful benchmark, meaning a standard test used to compare systems. It treats model quality as several dimensions instead of one magic score. That is the stance I would copy.

## Check hard facts before style

Once you have a rubric, the next problem appears: confidence can still fool you. The fix is to separate **hard checks** from **soft checks**. Hard checks are things you can verify, such as a calculation, a quoted source, a required format, or whether the answer actually followed the instruction. Soft checks are things like tone, helpfulness, or flow.

Hard checks go first. I feel strongly about that order because clear nonsense is still nonsense. If you have a trusted reference answer or source, use it as your comparison point. If you do not, use observable signals you can still inspect.

That is also the warning behind [G-Eval](https://arxiv.org/abs/2303.16634): even when an LLM helps judge another LLM, the rubric still decides what “good” means. A judge without a clear rubric is just another confident answer.

## Test the failure you actually fear

Random spot checks feel productive, but they miss the failures that matter most. A better beginner move is to name one failure on purpose, then test for it on purpose. If you fear invented citations, use prompts that require citations. If you fear biased advice, use prompts about sensitive situations. If you fear skipped instructions, use prompts with a strict format.

That risk-first approach matches the [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework), which frames evaluation as part of managing harm and uncertainty, not as a search for the prettiest average score.

## The rule I would use every time

Score in this order: accuracy first, task fit second, clarity third. If accuracy fails, stop there.

A practical threshold is enough to get started: if two out of five answers fail the same hard check, treat that task as unreliable until you change the prompt, the model, or the process around it. Next, learn when to add human review or automated evals, because the moment your spot checks stop catching surprises, your process needs a second layer.
