---
id: guardrails
order: 19
difficulty: advanced
tags: [LLM, security, guardrails, OWASP]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your AI feature works. Users love it. Then one user figures out how to make it ignore the system prompt, expose internal instructions, and call a tool with garbage arguments. Guardrails are the work nobody wants to fund until after the incident. The mistake is treating them like a moderation checkbox glued on top. In production, guardrails are control points around the whole request lifecycle.

The [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) is a better starting point than most architecture diagrams because it names the failures that actually hurt you: prompt injection, sensitive data disclosure, insecure output handling. That list should change your design. I do not trust a single classifier sitting before the model. I want three rails: input validation before inference, tool constraints during execution, and output validation before the answer leaves the system.

That is why I like [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) and [Guardrails AI](https://www.guardrailsai.com/docs). They are not magic, and they will not save a bad product decision, but they force you to make policies explicit. Explicit beats implicit every time. If a model can search, send email, or hit an internal API, the rail should live next to that capability, not inside a polite paragraph in the system prompt.

A minimal production flow looks more like a gateway than a chat wrapper. Put the contract in code, then let the model operate inside it.

```python
policy = {
    "max_prompt_chars": 12000,
    "blocked_topics": ["credentials", "payment card data"],
    "tool_allowlist": ["search_docs", "create_ticket"],
}

user_input = validate_input(message, policy)
response = llm.generate(user_input, tools=policy["tool_allowlist"])
validated = validate_output(response, schema=AnswerSchema)

if validated.escalate:
    return route_to_human(validated.reason)

return validated.answer
```

Notice what is missing: keyword blacklists pretending to solve abuse. Real guardrails are contextual. They know which tools are available, which data classes are present, and what failure mode deserves escalation instead of silent refusal. They also need product alignment with provider rules such as [OpenAI's usage policies](https://openai.com/policies/usage-policies), because your internal policy and your vendor policy are two separate gates.

The operational part matters more than the framework choice. Log every blocked action, every override, every schema failure. Review false positives weekly. If users can trigger a rail but nobody can explain why it fired, you built theatre, not safety.

Here is the threshold I use: if the model can take action on behalf of a user, guardrails are mandatory. If it can touch money, private data, or production systems, deterministic approval steps beat clever prompting every time.
