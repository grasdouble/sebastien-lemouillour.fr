---
id: copilot-custom-agents
order: 6
difficulty: advanced
tags: [copilot, custom-agents, ai-agents]
---

The problem isn't what Copilot does. It's what it tries to do at the same time. In the same session, it's expected to be an architect (propose designs), a developer (implement), and a reviewer (critique its own code). These three modes have contradictory priorities: an architect looks 6 months ahead, a developer looks at the next PR, a reviewer looks for everything that can break. Having them coexist in the same agent produces lukewarm responses that are none of the three.

Custom Agents solve this by isolating context and instructions per role.

## What a Custom Agent actually brings

A Custom Agent is a Copilot agent configured independently from the main agent. It can have a distinct persona, a subset of the project context, specific tools, and different priorities. This is not a different display mode: it's an agent that actively ignores what is outside its scope.

The standard agent reads `AGENTS.md` and knows the project as a whole. A Custom Architect Agent, on the other hand, only reads the architecture documentation and ADRs. It has no access to the application code, because its value comes precisely from not being influenced by the existing implementation.

## Structure of a real agent

Here is a realistic architect agent. The important point is what it refuses to do, as much as what it does:

```markdown
# Agent: System Architect

## Identity

You are Winston, a senior system architect with 15 years of experience
on distributed systems in production. You analyse requirements and
propose designs that are defensible over the long term.

## Available context

- `docs/architecture/`: ADRs and past decisions
- `docs/api-contracts/`: interface contracts between services

## Out of scope

- You do not read application code (you are not influenced by existing implementation)
- You do not propose implementation details
- You do not validate syntax

## Behaviour

- Before any design: ask for non-functional constraints
  (volume, SLA, infra budget, team size)
- Every proposal includes explicit trade-offs
- If a request implies a change to an existing design:
  propose an ADR before proceeding
- Raise an alert if a decision creates silent technical debt
```

The "Out of scope" section is often forgotten. Yet it is what gives the agent its value: an architect who descends into implementation is no longer an architect.

## When a Custom Agent is justified

Most needs don't require a Custom Agent. Here is the real complexity gradient:

An **instruction in `AGENTS.md`** is enough when the behaviour applies to all conversations without a context shift. Code rules, commit conventions, tools to use.

A **Skill** is enough when the task is a reproducible procedure but the project context stays the same. Creating a component, generating a changeset, running a code review.

A **Custom Agent** becomes relevant when the role needs a fundamentally different context, or when the same content seen by two different agents must produce two opposite types of response (implementation vs critique).

## Examples that actually justify a distinct agent

**Adversarial Reviewer Agent** — Its only job is to find what can break. It has access to the diff and existing tests, but its instructions are oriented toward scepticism: find edge cases, implicit assumptions, places where the specification is incomplete. A development agent cannot play this role honestly because it has a bias toward validation.

**QA Agent** — Knows the project's test patterns and generates exhaustive test cases. Its primary context is the specification and business rules, not the implementation. If the implementation is in its context, it tests what is coded rather than what should be.

**PM Agent** — Helps structure user stories, challenges scope, identifies business dependencies. No access to code: that would be a distraction from the value it brings.

## Custom Agents and BMAD

This project uses BMAD, which provides a system of pre-built Custom Agents in `.agents/`:

```
.agents/
  skills/
    ...
  agents/    (if you use custom agents)
    ...
```

BMAD agents follow the same structure: identity, scope, behaviour, tools. Orchestration between agents is handled either manually (you explicitly choose which agent to invoke) or via triggers in Skills.

## The question to ask before creating an agent

Is this persona distinct enough from the main agent to justify a separate configuration?

If the answer is "I could get the same result with a well-worded instruction in `AGENTS.md`", then it's probably simpler. Custom Agents have a maintenance cost: they age, drift from the actual project context, and need to be updated when conventions change.

The rule I apply: if the role needs to actively ignore part of the project context to be effective, it's a Custom Agent. Otherwise, it's an instruction or a Skill.
