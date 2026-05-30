---
id: copilot-mcp
order: 5
difficulty: intermediate
tags: [copilot, mcp, tools]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

You're asking Copilot why a CI run failed, and the answer is sitting in GitHub Actions, another dashboard, or some API nobody wants to query by hand before coffee. So you paste links, logs, and half a JSON blob into chat. Copilot is not lazy, it is missing the room.

MCP is the fix.

## When chat needs a real tool

The [Model Context Protocol specification](https://modelcontextprotocol.io/specification/2025-03-26) defines MCP as a JSON-RPC 2.0 protocol with hosts, clients, and servers. Servers can expose tools, resources, and prompts, and clients can optionally support sampling. That sounds abstract, but the practical bit is simple: instead of stuffing more context into the prompt, you let Copilot ask the system that already knows.

That is why MCP is not the same thing as a prompt file or a custom instruction. Instructions shape behavior. MCP gives the model a callable tool or a readable resource. I prefer thinking about it that way because it keeps the use case honest: if no external system is involved, you probably do not need MCP.

## Where Copilot actually supports it today

The [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) say you can install servers from the MCP gallery with `@mcp`, or configure them manually in `.vscode/mcp.json` for a workspace or `mcp.json` in your user profile. The [GitHub MCP docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/extend-copilot-chat-with-mcp) add two practical constraints: MCP in Copilot needs VS Code 1.99 or later, and organizations on Copilot Business or Copilot Enterprise can disable MCP with policy.

If you spend your time in VS Code, this is the part that matters: MCP is no longer a weird side quest. It is built into the editor, into Agent mode, and into the tool picker.

## The GitHub setup I would start with

The [GitHub MCP Server docs](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md) document the hosted remote server, the VS Code 1.101 or later requirement for the VS Code OAuth flow, and the toolset URLs with `/readonly` variants. I like that a lot because read-only first is one of the few security habits that never makes you look silly later.

This is the smallest remote configuration worth memorizing.

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/readonly"
    }
  }
}
```

If your host cannot use the remote server, a local Docker setup still works. The [VS Code MCP reference](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration) says `type` is required for stdio servers, and it documents `inputs`, `envFile`, and `sandboxEnabled` for the cases that get messy fast.

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "github_mcp_pat",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "github": {
      "type": "stdio",
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_mcp_pat}"
      }
    }
  }
}
```

## Two security details people skip

That configuration reference is clear about the boring but important part: do not hardcode secrets, use input variables or an environment file for sensitive values, and remember that sandboxing exists for local stdio servers on macOS and Linux. That last one is easy to ignore until a server wants more file system or network access than you expected.

I prefer narrow permissions, a read-only server when possible, and sandboxing for anything local that talks to the network. It is less glamorous than a demo screenshot, but it is also how you avoid turning helpful assistant into surprisingly adventurous process.

## Writing your own MCP server

If an official server already covers the system you need, use it first. Writing your own server is fun in the same way redoing your kitchen is fun: satisfying, expensive in side quests, and very easy to underestimate.

This example uses the [TypeScript SDK README](https://github.com/modelcontextprotocol/typescript-sdk), because the SDK team still marks v2 as pre-alpha there and recommends v1.x for production use. In that line of the SDK, you import `McpServer` from `@modelcontextprotocol/sdk/server/mcp.js` and register tools with `registerTool`.

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';

const server = new McpServer({ name: 'build-status', version: '1.0.0' });

server.registerTool(
  'get_build_status',
  {
    title: 'Build status',
    description: 'Return the latest CI status for a repository branch',
    inputSchema: {
      repository: z.string(),
      branch: z.string(),
    },
  },
  async ({ repository, branch }) => {
    const response = await fetch(
      `${process.env.BUILD_API_BASE_URL}/status?repository=${encodeURIComponent(repository)}&branch=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BUILD_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Build API request failed with ${response.status}`);
    }

    const status = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }
);

await server.connect(new StdioServerTransport());
```

The pattern matters more than the fake build API: declare the tool, validate the input, call one system you already trust, and return plain text the model can use without guessing.

If you paste the same context into Copilot more than twice a week, install an MCP server. If you are still experimenting, choose read-only and stdio first. You can always get fancier once the boring version saves you time.
