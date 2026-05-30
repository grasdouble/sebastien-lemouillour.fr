---
id: how-to-evaluate-an-ai-response
order: 15
difficulty: beginner
tags: [LLM, évaluation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The easiest trap is reading an AI answer, feeling relieved because it sounds polished, and moving on. I have done that too, and it is exactly how bad output sneaks into real work. If you want one beginner rule to keep, keep this one: do not ask whether a response sounds good. Ask whether it is good for a specific job.

## Start with the job, not the vibe

An **evaluation** is a structured way to judge whether an output meets a need. OpenAI’s [evals guide](https://platform.openai.com/docs/guides/evals) makes the same point in more formal terms: you define the task, run test cases, and inspect the results.

That means the first question is never “Is this a strong answer?” The first question is “Strong for what?” A marketing draft, a legal summary, a support reply, and a tutoring explanation should not be judged the same way.

I would start by writing down two or three criteria only. A **criterion** is a rule you use to score the answer, such as factual accuracy, completeness, tone, or citation quality. Beginners often create giant checklists. I think that is a mistake. Short rubrics are easier to apply consistently.

## Use evidence, not impressions

Some tasks can be checked against a **ground truth**, meaning a trusted correct answer or source. If you have that, use it. If you do not, define observable signals: Does the answer quote the right document? Does it follow the requested format? Does it avoid unsupported claims?

Broader evaluation efforts such as [HELM](https://arxiv.org/abs/2211.09110) are useful because they show that model quality has many dimensions, not one master score. The [G-Eval paper](https://arxiv.org/abs/2303.16634) is also a helpful reminder that even when AI helps judge AI, the rubric still matters.

In practice, I would separate checks into two groups. Hard checks are things you can verify, like calculations, citations, required fields, or policy constraints. Soft checks are things like clarity, usefulness, or tone. Hard checks come first. A beautiful answer that fails a hard check is still a bad answer.

## Test the failures you actually fear

Evaluation gets much better when you stop sampling random prompts and start targeting real risks. If you worry about hallucinated sources, test source-heavy prompts. If you worry about harmful bias, test sensitive prompts. The [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) is valuable here because it treats evaluation as part of risk management, not as a beauty contest.

I would also compare versions. One answer in isolation tells you very little. Five comparable answers scored with the same rubric tell you much more.

## The rule I would use every time

I would evaluate an AI response in this order: first accuracy, then task fit, then clarity. That order matters. Clear nonsense is still nonsense.

If you only adopt one habit, make it this: before accepting a response, write one sentence that says how it could fail. Then check for that failure on purpose. Your next step is simple and useful: pick one recurring AI task, define three criteria, score five answers, and see where your confidence was misplaced. That is when evaluation stops being a theory word and starts becoming a real skill.
