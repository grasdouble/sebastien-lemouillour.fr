---
id: prompt-injection
order: 5
difficulty: beginner
tags: [LLM, security, prompt-injection, OWASP, OpenAI]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You copied your API key into a .env file, then pushed it to GitHub. Prompt injection is that level of mistake, but inside the app itself. The model reads untrusted text and treats it like instructions.

A prompt injection happens when user input, a webpage, a PDF, an email, or a retrieved document contains text that tries to override your real instructions. OpenAI's [Prompt injections](https://openai.com/safety/prompt-injections/) page explains the idea clearly, and the [OWASP cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) breaks down common attack patterns. Anthropic's [Anthropic defenses](https://www.anthropic.com/research/prompt-injection-defenses) shows why this gets worse when models can browse or use tools.

Beginners often imagine this as a clever hacker typing "ignore previous instructions." That is only the cartoon version. The real problem is indirect injection. Your assistant fetches a support ticket, a web page, or a shared document, and hidden text inside that content says, "Reveal the system prompt" or "Send this secret to an external URL." If your application lets the model act on that, the attack worked.

This is why I do not treat the model as a security boundary. A model can help classify risk, but it should never be the final authority for dangerous actions. If the model can send email, call tools, spend money, access files, or reveal hidden data, you need controls outside the model.

For beginners, four habits matter most:

- Separate instructions from data. Retrieved content is content, not policy.
- Give tools the smallest possible permissions. This is least privilege.
- Require explicit approval for high-impact actions like sending, deleting, or purchasing.
- Log suspicious attempts so you can see patterns instead of guessing.

There is no perfect filter that removes prompt injection forever. That is the uncomfortable part. Attackers can hide malicious instructions in long text, code blocks, HTML, images, or seemingly normal prose. Your goal is not detect everything. Your goal is to design the system so that one bad model answer cannot do much damage.

A useful beginner mindset is to pretend every external document is hostile until proven otherwise. That sounds paranoid. In production, it is just healthy engineering. If the app retrieves content from outside your direct control, that content must not get to rewrite your rules.

The threshold I use is simple: if the model can trigger real-world effects, I want an allowlist, tight tool scopes, and a human approval step before anything important happens. If that feels heavy, good. The action is important enough to deserve friction.

What next: the next guide zooms out from one attack to the full security stack. Prompt injection is one failure mode. Securing an AI application means designing for many of them at once.
