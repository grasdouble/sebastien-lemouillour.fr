---
id: llm-limitations
order: 14
difficulty: beginner
tags: [llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

The frustrating part is not that an LLM gives bad answers all the time. It is that it can sound calm, helpful, and convincing right before it gets something important wrong. A **large language model (LLM)** is trained to predict likely next tokens, which are small chunks of text, one step at a time ([GPT-3 paper](https://arxiv.org/abs/2005.14165)). That training makes it excellent at producing language. It does not make it a built-in fact checker.

## Fluent is not the same as reliable

That gap explains why beginners get surprised. If a model writes smoothly, we start treating it like a knowledgeable person. I would not do that. The [GPT-4 report](https://arxiv.org/abs/2303.08774) shows strong capabilities, but it also documents inaccurate and unreliable outputs. When a model invents a source or states a wrong fact with confidence, the problem is not attitude. The system is doing language generation, not guaranteed verification.

That is why I would split tasks early. Drafting an email, rephrasing notes, or brainstorming titles are good fits. Tax advice, medical questions, exact calculations, or anything that must be current are not tasks I would trust without another check.

## More context helps, but only up to a point

Once people learn this first limit, the next instinct is to paste more material. Sometimes that helps, especially if you also give the model tools. Anthropic’s [tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) shows how a model can call external systems instead of guessing, and the [RAG paper](https://arxiv.org/abs/2005.11401) describes retrieval-augmented generation, or **RAG**, where the model answers from documents you provide.

I still would not assume a huge prompt solves the problem. A **context window** is the amount of tokenized text the model can work with in one request. Even when the text fits, the model may still use some parts badly. [Lost in the Middle](https://arxiv.org/abs/2307.03172) found that long-context models often use information near the beginning or end better than information buried in the middle. My preference is smaller evidence, clearly labeled, over one giant paste.

## Small prompt changes can change the result

That leads to the last beginner shock: you ask twice and get two noticeably different answers. This behavior is common enough that providers themselves recommend testing prompts on real examples. The [OpenAI prompting](https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt) guide recommends testing and iterating on prompts instead of assuming one wording is always best. So I would test the exact use case I care about, rather than trusting a model's reputation or a demo that succeeded under ideal conditions.

## What I would choose in practice

I would use an LLM as a fast first-draft engine and a patient explainer. I would not use it alone for high-stakes facts. My rule is simple: if being wrong would cost trust, money, or safety, the model should not be working without a source, a tool, or a human review.
