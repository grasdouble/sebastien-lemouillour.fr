---
id: data-privacy
order: 4
difficulty: beginner
tags: [LLM, privacy, security, OpenAI, Anthropic]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

A customer pastes a passport scan or a medical note into your AI feature and suddenly the nice demo feels risky. That is the moment I stop thinking about AI magic and start thinking about data movement.

For a beginner, I would translate privacy into three plain questions: where does the text go, how long is it kept, and who can see it? The moment you call an external model API, you cross a trust boundary, which simply means the data leaves the system you directly control. [OpenAI data controls](https://platform.openai.com/docs/guides/your-data) explain that API data is not used for training by default, while abuse monitoring logs can still be retained for up to 30 days and some features can store application state.

My default rule is strict: treat every prompt as sensitive until you have proved otherwise. Once a feature becomes useful, people paste names, invoices, contracts, support tickets, and sometimes things they really should not paste. That is why I would choose data minimization first. Send the smallest useful slice, then redact, meaning hide or remove identifiers such as names, emails, account numbers, and addresses.

I also would not trust one catchy policy sentence from a vendor deck. [Anthropic data usage](https://docs.anthropic.com/en/docs/claude-code/data-usage) shows why: consumer and commercial terms differ, commercial use keeps the no-training default unless you opt in, and standard retention is documented separately from zero data retention options. That sounds fussy, but it is exactly the kind of detail that saves you from making a bad promise to legal or security.

Sometimes the safest answer is local execution. [Ollama privacy](https://ollama.com/privacy) says local runs stay on your device, which can reduce exposure, but local does not mean carefree because logs, backups, and access control still exist. I would also keep the bigger risk map in view: [OWASP LLM Top 10](https://genai.owasp.org/llm-top-10/) treats sensitive information disclosure as a core LLM application risk, so I recommend classifying data before you ship anything: public, internal, sensitive, restricted.

If you cannot answer three questions for one prompt path, do not ship that path for sensitive data yet: what leaves your system, how long it stays, and who can retrieve it. Next, read the prompt injection guide, because a private system can still be manipulated by untrusted input.
