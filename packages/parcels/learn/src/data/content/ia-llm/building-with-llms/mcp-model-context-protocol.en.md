---
id: mcp-model-context-protocol
order: 23
difficulty: advanced
tags: [MCP, protocol, security, portability, negotiation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Every agent stack eventually grows the same ugly layer: custom adapters for files, search, internal APIs, and databases, all wired to one framework in one very specific way. Then the team swaps model vendors or adds a second runtime, and the whole tool layer becomes technical debt overnight.

That is exactly the problem [MCP](https://modelcontextprotocol.io/) is trying to solve. It standardizes how clients discover tools, resources, and prompts so you stop rewriting the same adapter logic for every model stack. The important idea is not convenience. It is portability. Tooling should survive a framework change.

The [Anthropic announcement](https://www.anthropic.com/news/model-context-protocol) made the design goal explicit: shared protocol, not shared framework. That distinction matters. Framework abstractions tend to trap you inside one ecosystem. Protocols give you an interface contract you can reuse across clients.

What matters in production is capability negotiation. A client asks what the server supports, then chooses which capabilities it will use. That means you can add a new tool to a server without breaking older clients, provided they respect the advertised contract instead of assuming the world. If you are already building tool-heavy agents with patterns from the [OpenAI Agents guide](https://platform.openai.com/docs/guides/agents), MCP gives you a cleaner boundary between the agent runtime and the tool surface.

This is the kind of server shape I want teams to think in:

```python
from mcp.server import MCPServer

server = MCPServer(name="docs-search", version="1.0.0")

@server.tool(name="search_docs")
async def search_docs(query: str, max_results: int = 5) -> list[dict]:
    return await docs_index.search(query, limit=max_results)

server.run()
```

The code itself is not the interesting part. The contract is. Once the tool is exposed through a standard interface, any compatible client can discover it without a one-off adapter.

Do not confuse protocol with security. MCP does not magically make your tools safe. You still need authentication, per-client authorization, rate limits, and invocation logs with enough detail to audit misuse. Treat an MCP server like a microservice with teeth, not like a helper function hiding inside your app.

My decision rule is simple: if you have more than two independent tool servers, or more than one model runtime that needs the same tools, MCP starts paying for itself. Before that, direct integration is cheaper. After that, direct integration gets expensive fast.
