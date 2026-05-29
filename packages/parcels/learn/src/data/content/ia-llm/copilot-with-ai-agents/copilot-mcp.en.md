---
id: copilot-mcp
order: 5
difficulty: intermediate
tags: [copilot, mcp, tools]
---

You're asking Copilot to analyse a bug reported in a GitHub issue. It responds with generalities because it doesn't have access to that issue. You have to copy-paste the content into the chat manually. Not a blocker, but exactly the kind of friction that makes you feel the tool "isn't ready yet".

MCPs fix this.

## The Model Context Protocol in one sentence

The **Model Context Protocol (MCP)** is an open-source standard created by Anthropic and adopted by the major AI tools (GitHub Copilot, Claude Code, Cursor…). It defines how an agent can call external tools in a standardised way: reading an issue, querying a database, searching the web.

The difference from a Skill: a Skill is a text-written procedure the agent follows. An MCP is a connection to an external system that provides data or executes actions in real time.

## Concrete use cases

**GitHub MCP** — the agent can read issues, create PRs, check commit history, read files in remote repos. Without MCP, it can only access local files.

**Database MCP** — the agent queries your database directly: "how many active users this month?" without you having to copy-paste the results.

**Web search MCP** — the agent searches the web and injects results into its response. Useful for questions about recent libraries or very specific errors.

**Custom MCP** — you write your own server to expose data specific to your context: an internal system, a proprietary API, infrastructure metadata. This is where MCPs become genuinely powerful.

## Configuration in VS Code

To make an MCP available in Copilot, declare the server in `.vscode/mcp.json`. Here's what it looks like with the official GitHub MCP:

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:githubToken}"
      }
    }
  }
}
```

Most standard MCPs launch via `npx` (or `pnpm dlx`). The server runs locally and communicates with the agent via stdio. VS Code will ask you for the value of `githubToken` on startup.

## Security: two non-negotiable rules

MCPs have access to potentially sensitive systems. Two rules to follow without exception:

Never commit tokens into `.vscode/mcp.json`. Use the `${input:secretName}` syntax so VS Code asks for it, or environment variables configured outside the repo.

Limit token permissions to the minimum needed. A read-only token covers 90% of use cases. This isn't paranoia: a malicious third-party MCP server can exfiltrate data if the token has too many rights.

## Writing your own MCP server

When no existing MCP covers your case, the TypeScript SDK lets you write one in a few dozen lines. This code exposes a `get_deploy_status` tool the agent can call to know the state of your infrastructure:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'my-mcp', version: '1.0.0' },
  {
    capabilities: { tools: {} },
  }
);

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'get_deploy_status',
      description: 'Returns the status of the last production deployment',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler('tools/call', async (req) => {
  if (req.params.name === 'get_deploy_status') {
    const status = await fetchDeployStatus();
    return { content: [{ type: 'text', text: JSON.stringify(status) }] };
  }
  throw new Error('Unknown tool');
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

This is useful when you want the agent to access internal data (metrics, deployment states, business data) without manually copying it into every conversation. A two-hour investment to remove a daily friction.
