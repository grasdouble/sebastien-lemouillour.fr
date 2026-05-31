---
id: agent-memory
order: 18
difficulty: advanced
tags: [agents, memory, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You finally get the agent to behave, then the next session forgets the user’s preferences and asks the same question again. Bolt on the wrong memory layer and you do not get a smarter product. You get a compliance incident with a cheerful tone.

Memory only earns its keep when it changes future decisions. Everything else is prompt stuffing with storage glued on the back. I split it into three buckets: working memory for the current run, episodic memory for what happened, and semantic memory for stable facts worth surviving across sessions. [LangGraph memory](https://docs.langchain.com/oss/python/concepts/memory) draws the short-term versus long-term boundary clearly, [OpenAI results and state](https://platform.openai.com/docs/guides/agents/results) makes state a runtime surface instead of a footnote, and I still validate persisted records with [Pydantic fields](https://docs.pydantic.dev/latest/concepts/fields/) because corrupted memory is worse than no memory.

Most tutorials dodge the part that actually hurts in production: write policy. Who is allowed to create a memory? What evidence is required? How long does it live? How is it deleted? If you cannot answer those four questions, do not ship memory. The real product problem is not storing more facts. It is deciding which facts are worth carrying forward without poisoning future runs.

Before the code, here is the lesson teams learn late: memory needs provenance. “User likes short replies” is not enough. You need to know where that came from, when it was observed, and how confident you are.

And yes, the timestamps should be timezone-aware because Python is explicit about the difference between naive and aware datetimes in the [datetime docs](https://docs.python.org/3/library/datetime.html#aware-and-naive-objects).

```py
from datetime import datetime, timedelta, timezone
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

now = datetime.now(timezone.utc)

memory = MemoryRecord(
    user_id='u_123',
    kind='preference',
    fact='Prefers concise release summaries',
    confidence=0.92,
    source='chat:turn-84',
    created_at=now,
    expires_at=now + timedelta(days=180),
)
```

What I actually watch in production is memory quality, not memory volume. Bad writes create drift, and drift is sneaky. The agent sounds confident while carrying stale preferences, outdated permissions, or tool outputs that never deserved promotion into long-term facts. Add TTLs, deletion paths, and a way to inspect every memory used in a response. Also keep memory writes behind a stricter gate than reads, because [OWASP prompt injection](https://owasp.org/www-community/attacks/PromptInjection) is exactly the kind of mess that loves systems which store first and ask questions later.

Turn memory on when repeated tasks genuinely benefit from continuity, like user preferences or durable account context. If you cannot explain the retention policy to legal, support, and the user in one sentence each, keep memory off.
