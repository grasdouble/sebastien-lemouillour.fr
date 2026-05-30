---
id: data-privacy
order: 4
difficulty: beginner
tags: [LLM, privacy, security, OpenAI, Anthropic]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

A teammate pastes customer data into your AI feature and suddenly the prototype feels different. That is the moment data privacy stops being legal jargon and becomes product design.

Data privacy, here, means a simple question: when you send text to a model, where does it go, how long does it stay there, and who inside or outside your company can access it? If you use an external API, you are crossing a trust boundary. Read the provider terms, not marketing snippets. Start with [OpenAI privacy](https://openai.com/enterprise-privacy/) and [Anthropic privacy](https://www.anthropic.com/legal/privacy/).

My default rule is strict: assume every prompt can contain sensitive data unless you have actively prevented that. Users paste names, invoices, contracts, medical notes, or internal strategy documents the minute the feature becomes useful. The app does not care whether the leak was intentional. The damage is the same.

That is why privacy work starts before encryption checklists. First, minimize what you send. If the model only needs an order status, do not send the full CRM record. Second, redact personal data when possible. Redaction means removing or masking details like names, emails, account numbers, and addresses. Third, decide what should never leave your infrastructure. The [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) exists because AI systems create new ways to mishandle sensitive data, not because old security rules stopped mattering.

Sometimes the right answer is local execution. If policy or common sense says the text should stay inside your environment, running a model yourself through [Ollama](https://ollama.com/) or another self-hosted stack can reduce exposure. It does not magically solve privacy, because logs, backups, and access control still exist, but it keeps the data boundary closer to you.

The beginner mistake is asking, "Does this provider train on my data?" as if that were the only issue. It matters, but it is not the whole story. Retention, support access, audit logs, and internal access are all part of the privacy picture. So is your own app. If you log raw prompts in plain text, you can create a privacy problem even when the model provider behaves perfectly.

A healthy rule is to classify data before you integrate AI: public, internal, sensitive, restricted. Then decide which classes can go to which model route. That one habit prevents a surprising number of messy conversations later.

What next: privacy answers where data goes. The next guide, on prompt injection, answers a different problem, what happens when the data itself tries to manipulate your app.
