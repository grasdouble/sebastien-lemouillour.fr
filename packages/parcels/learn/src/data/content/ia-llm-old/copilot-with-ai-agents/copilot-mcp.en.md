---
id: copilot-mcp
order: 5
difficulty: intermediate
tags: [tools, copilot]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

You're asking Copilot why a CI run failed, and the answer is sitting in GitHub Actions, another dashboard, or some API nobody wants to query by hand before coffee. So you paste links, logs, and half a JSON blob into chat. Copilot is not lazy, it is missing the room.

MCP is the fix.

## When chat needs a real tool

The [MCP spec](https://modelcontextprotocol.io/specification) describes a JSON-RPC 2.0 protocol with hosts, clients, and servers. Servers can expose tools, resources, and prompts. Clients can optionally support sampling. The useful part is simpler: instead of stuffing more context into the prompt, you let Copilot call the system that already knows.

That is why MCP is not the same thing as a prompt file or a custom instruction. Instructions shape behavior. MCP gives the model a callable tool or a readable resource. I prefer thinking about it that way because it keeps the use case honest: if no external system is involved, you probably do not need MCP.

## Where Copilot supports it today

The [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) say you can install servers from the gallery with `@mcp`, or configure them manually in `.vscode/mcp.json` for a workspace and `mcp.json` in your user profile. The [GitHub docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/extend-copilot-chat-with-mcp?tool=vscode) add the two limits that matter in practice: MCP in Copilot needs VS Code 1.99 or later, and organizations on Copilot Business or Copilot Enterprise can disable it with policy.

If you live in VS Code, this is the part that matters: MCP is not a side quest anymore. The tools show up where you already chat with Copilot, so the friction is finally low enough to be worth it.

## The GitHub setup I would start with

The [remote server](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md) docs cover the hosted GitHub server, the VS Code 1.101 or later requirement for the VS Code OAuth flow, and the `/readonly` variants for each toolset URL. I like that a lot because read-only first is one of the few security habits that never makes you look silly later.

This is the smallest remote config worth memorizing.

```jsonc
{
  "servers": {
    "github": {
      "type": "http", // Remote MCP server
      "url": "https://api.githubcopilot.com/mcp/readonly", // Read-only by default
    },
  },
}
```

If your host cannot use the remote server, local stdio still works. The [config reference](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration) is the page to keep open because it documents required fields like `type`, plus `inputs`, `envFile`, and `sandboxEnabled`.

Start with input variables, not hardcoded secrets.

```jsonc
{
  "inputs": [
    {
      "type": "promptString",
      "id": "github_pat",
      "description": "GitHub Personal Access Token",
      "password": true,
    },
  ],
  "servers": {
    "github": {
      "type": "stdio", // Local process
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_pat}", // Prompt at startup
      },
    },
  },
}
```

## Two security details people skip

That configuration reference is clear about the boring but important part: do not hardcode secrets, use input variables or an environment file for sensitive values, and remember that sandboxing exists for local stdio servers on macOS and Linux. That last one is easy to ignore until a server wants more file system or network access than you expected.

I prefer narrow permissions, a read-only server when possible, and sandboxing for anything local that talks to the network. Also remember that every tool call is now a real process or network hop. If your server sits in front of an API with tight rate limits, the cheerful demo turns flaky fast.

## Writing your own MCP server

If an official server already covers the system you need, use it first. Writing your own server is fun in the same way redoing your kitchen is fun: satisfying, full of side quests, and very easy to underestimate.

The current [SDK README](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/README.md) shows the new `@modelcontextprotocol/server` package on `main`, but it also warns that `main` is v2 pre-alpha and still recommends v1.x for production. That is exactly why I would prototype with the README API, then pin a stable branch before I promise anything to a team.

If you still want a tiny server to feel the shape of it, this is the current pattern.

```ts
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod';

const server = new McpServer({
  name: 'build-status',
  version: '1.0.0',
});

server.registerTool(
  'get_build_status',
  {
    description: 'Return the latest CI status for a branch',
    inputSchema: z.object({
      repository: z.string(), // owner/repo
      branch: z.string(), // branch name
    }),
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
      content: [{ type: 'text', text: JSON.stringify(status, null, 2) }],
    };
  }
);

await server.connect(new StdioServerTransport());
```

The pattern matters more than the fake build API: validate input, call one system you already trust, and make auth or rate-limit failures obvious.

If you paste the same context into Copilot more than twice a week, install an MCP server. If the workflow can change data, start read-only anyway and only widen permissions after you hit a real limit.
