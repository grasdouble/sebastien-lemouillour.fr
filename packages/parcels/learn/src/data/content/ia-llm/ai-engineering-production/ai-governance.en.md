---
id: ai-governance
order: 20
difficulty: advanced
tags: [LLM, governance, compliance, NIST]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Nobody asks about your prompt chain during a pilot. They ask after procurement, legal, or the first security review: who approved this use case, what data touches the model, and how do we turn it off fast if behavior drifts? That is the moment most teams discover they have an AI demo, not AI governance.

Real governance is not a committee collecting slides. It is decision rights wired into delivery. The [EU AI Act](https://artificialintelligenceact.eu/) forces risk-based obligations depending on the system and use case. The [NIST AI RMF](https://www.nist.gov/system/files/documents/2023/01/26/AI%20RMF%201.0.pdf) gives a practical structure: map, measure, manage, govern. Those frameworks matter because they force ownership. Somebody has to own the model class, the data boundary, the evaluation standard, and the kill switch.

My preference is a small review group with delegated authority, not a monthly architecture circus. Product owns the user impact. Security owns abuse scenarios. Legal or compliance owns regulated constraints. Platform owns model access and logging. They should review model families, data categories, automation levels, and irreversible actions. They should not spend their week approving prompt wording changes.

The policy only becomes real when it appears in configuration and logs. A model registry is boring, which is exactly why it works.

```yaml
use_case: support-triage
owner: customer-platform
risk_level: medium
allowed_models:
  - gpt-4.1-mini
  - mistral-large
data_classes:
  - public
  - customer-account-metadata
human_review_required: false
tool_actions:
  - create_ticket
kill_switch: support-triage-disabled
```

You also need governance for provider behavior. If your assistant can generate harmful content or automate a prohibited flow, your internal review does not override [usage policies](https://openai.com/policies/usage-policies). And if your system accepts tool calls or untrusted retrieval content, the threat model from the [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) belongs in the governance process, not only in security testing.

The part most teams skip is evidence. Every important output should be tied to a model version, a prompt version, an evaluation result, and an owner. Without lineage, you cannot answer the only question leadership cares about during an incident: what changed.

Use this decision rule: if a team cannot tell you, in under one minute, which model is running, what data class it sees, who owns it, and how to disable it, that feature is not governed enough to ship.
