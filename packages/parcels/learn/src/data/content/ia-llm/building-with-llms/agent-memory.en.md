---
id: agent-memory
order: 18
difficulty: advanced
tags: [LLM, OpenAI, LangChain, memory, agents]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Without memory, the agent feels amnesiac. With bad memory, it turns into a compliance incident that answers in complete sentences.

Memory only earns its keep when it changes future decisions. Everything else is just prompt stuffing with a database attached. I split it into three buckets. Working memory belongs to the current run. Episodic memory stores what happened. Semantic memory stores stable facts that should survive sessions. [OpenAI Agents](https://platform.openai.com/docs/guides/agents) treats conversation state as a first-class concern, [LangGraph memory](https://langchain-ai.github.io/langgraph/concepts/memory/) formalizes short-term and long-term memory, and I still validate persisted records with [Pydantic](https://docs.pydantic.dev/) because corrupted memory is worse than no memory.

Most tutorials skip the hard part: write policy. Who is allowed to create a memory? What evidence is required? How long does it live? How is it deleted? If you cannot answer those four questions, do not ship memory. The product problem is not storing more facts. It is deciding which facts are worth carrying forward without poisoning future runs.

Before the code, here is the production lesson people learn late: memory needs provenance. “User likes short replies” is not enough. You need to know where that came from, when it was observed, and how confident you are.

This is the kind of record I want in storage:

```py
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from typing import Literal

class MemoryRecord(BaseModel):
    user_id: str
    kind: Literal['preference', 'profile', 'episodic']
    fact: str = Field(min_length=8, max_length=280)
    confidence: float = Field(ge=0.0, le=1.0)
    source: str  # ticket id, explicit user instruction, tool result
    created_at: datetime
    expires_at: datetime | None = None

memory = MemoryRecord(
    user_id='u_123',
    kind='preference',
    fact='Prefers concise release summaries',
    confidence=0.92,
    source='chat:turn-84',
    created_at=datetime.utcnow(),
    expires_at=datetime.utcnow() + timedelta(days=180),
)
```

What I actually watch in production is memory quality, not memory volume. Bad writes create drift, and drift is subtle. The agent sounds confident while carrying stale preferences, outdated permissions, or tool outputs that were never meant to become long-term facts. Add TTLs, deletion paths, and a way to inspect every memory used in a response. Also keep memory writes behind a stricter gate than reads, because prompt injection loves any system that stores first and questions later.

Use memory when repeated tasks genuinely benefit from continuity, for example user preferences or durable account context. If you cannot explain the retention policy to legal, support, and the user in one sentence each, keep memory off.
