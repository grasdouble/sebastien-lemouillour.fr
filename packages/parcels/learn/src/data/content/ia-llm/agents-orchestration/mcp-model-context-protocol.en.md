---
id: mcp-model-context-protocol
order: 23
difficulty: advanced
tags: [security, tools]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Your agent stack works, right up to the day you need the same tools in two hosts or two model runtimes. Then the hacks show up: one adapter for local files, another for internal APIs, a third for search, and a fourth because some SDK wanted a different shape. That pile rots fast.

That is why I take MCP seriously. Anthropic introduced it as an open standard for connecting AI assistants to external systems, and the real win is not “more tools”. It is escaping one vendor-shaped integration tax. If I expect my tool layer to outlive one framework, I would rather bet on a protocol than another convenience SDK. [Anthropic announcement](https://www.anthropic.com/news/model-context-protocol)

The architecture is cleaner too: a host owns one client per server, servers expose tools, resources, and prompts, and transports stay separate from the data model. That separation is the bit I would fight to keep, because it gives you a contract you can observe and replace instead of a blob of framework magic. [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture)

Where teams usually get sloppy is initialization. MCP is stateful, starts with `initialize`, negotiates protocol version and capabilities, then moves to normal operation only after `notifications/initialized`. That handshake is not paperwork. It is what lets old and new components talk without pretending they support the same surface. [Lifecycle spec](https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle)

If I were starting today, I would begin with a tiny stdio server, keep it local, and use the same `FastMCP(...); mcp.run(transport="stdio")` shape as the official quickstart, which also warns you not to write logs to stdout on stdio. [Server quickstart](https://modelcontextprotocol.io/quickstart/server)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("docs-search")


@mcp.tool()
async def search_docs(query: str) -> str:
    """Search internal docs."""
    return f"results for: {query}"


if __name__ == "__main__":
    mcp.run(transport="stdio")
```

That example is intentionally plain. The hard part is not the decorator. The hard part is refusing to leak transport concerns into business logic and refusing to hide contract changes behind “it still works on my machine”.

Transport choice is where production reality starts. Stdio is the default I would pick for local integrations because it is simpler and the spec explicitly recommends client support for it. I move to Streamable HTTP only when I need remote deployment, shared infrastructure, or many clients on one server, and then I treat it like a real network service: validate `Origin`, bind locally when appropriate, and add proper auth. The transport spec is very explicit here for good reason. [Transport spec](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)

My rule is blunt: use MCP when the same tool surface must survive more than one host, more than one model runtime, or an actual SLA. If you have one app and a couple of helper functions, skip the ceremony. If portability, observability, and protocol-level contracts matter, adopt MCP before your adapter pile becomes a career-limiting event.

## Resources

- [MCP intro](https://modelcontextprotocol.io/introduction)
- [Latest spec](https://modelcontextprotocol.io/specification/latest)
