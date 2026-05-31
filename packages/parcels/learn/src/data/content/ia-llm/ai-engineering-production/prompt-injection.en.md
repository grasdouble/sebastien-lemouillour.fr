---
id: prompt-injection
order: 5
difficulty: beginner
tags: [security, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You connect a helpful assistant to email or search, then it suddenly obeys a random sentence buried in a document. That feels less like a bug and more like letting a stranger grab the steering wheel at a red light.

A prompt injection happens when untrusted text is treated like instructions instead of plain data. [OpenAI's guide](https://platform.openai.com/docs/guides/prompt-injections/understanding-prompt-injections) explains why this happens: the model reads instructions and content in the same context, so a malicious sentence can compete with your real rules.

That definition matters because the beginner trap is focusing only on the obvious attack, "ignore previous instructions." The version I worry about more is indirect injection. [Anthropic's research](https://www.anthropic.com/research/prompt-injection-defenses) shows how a web page, email, or shared file can hide instructions that ask an agent to reveal hidden prompts or take actions on the user's behalf.

Once you see that, the design choice gets clearer: do not treat the model as a security boundary. [OWASP's cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) recommends separating instructions from retrieved data, limiting tool permissions, requiring approval for high-impact actions, and logging suspicious attempts. I would start there before trying to invent a clever detector, because limits on what the model can do are more reliable than hoping it never gets fooled.

Two terms are worth learning early. [NIST's glossary](https://csrc.nist.gov/glossary/term/least_privilege) defines least privilege as giving each user or process only the minimum access needed to do its job. [NIST's allowlist term](https://csrc.nist.gov/glossary/term/allowlist) describes an allowlist as a documented set of things the system is allowed to accept. In practice, that means pre-approving actions, destinations, or commands instead of trusting the model to improvise safely.

There is still a frustrating caveat: I would not bet a real workflow on a perfect filter. The safer goal is damage reduction, not perfect detection.

My rule of thumb is simple: if the model can send, spend, delete, or share, put a human approval step in front of it, then read the next guide to decide which other security layers belong around that action.
