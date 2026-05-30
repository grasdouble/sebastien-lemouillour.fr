---
id: copilot-mcp
order: 5
difficulty: intermediate
tags: [copilot, mcp, tools]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Tu demandes à Copilot pourquoi un job CI a raté, et la réponse est planquée dans GitHub Actions, dans un autre tableau de bord, ou dans une API que personne n'a envie d'interroger à la main avant le café. Alors tu colles des liens, des logs, puis un bout de JSON. Copilot n'est pas paresseux, il lui manque juste la pièce.

Le MCP règle ça.

## Quand le chat a besoin d'un vrai outil

La [spécification du Model Context Protocol](https://modelcontextprotocol.io/specification/2025-03-26) décrit MCP comme un protocole JSON-RPC 2.0 avec des hôtes, des clients et des serveurs. Les serveurs peuvent exposer des outils, des ressources et des prompts, et les clients peuvent prendre en charge le sampling. Dit comme ça, c'est assez abstrait, mais l'idée utile tient en une ligne : au lieu d'entasser plus de contexte dans le prompt, tu laisses Copilot interroger le système qui sait déjà.

C'est aussi pour ça qu'un MCP n'est pas la même chose qu'un prompt file ou qu'une instruction personnalisée. Les instructions cadrent le comportement. Le MCP donne au modèle un outil appelable ou une ressource lisible. Je préfère penser comme ça, parce que ça évite de sortir le marteau-piqueur quand un tournevis suffit.

## Où Copilot le prend vraiment en charge aujourd'hui

La [documentation MCP de VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) explique que tu peux installer des serveurs depuis la galerie MCP avec `@mcp`, ou les configurer à la main dans `.vscode/mcp.json` pour un workspace, ou dans `mcp.json` dans ton profil utilisateur. Les [GitHub MCP docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/extend-copilot-chat-with-mcp) ajoutent deux détails pratiques : MCP dans Copilot demande VS Code 1.99 ou plus, et une organisation sur Copilot Business ou Copilot Enterprise peut désactiver MCP via une politique.

Si tu passes ta journée dans VS Code, c'est ce passage qui compte : MCP n'est plus une bidouille exotique. C'est intégré à l'éditeur, au mode Agent, et au sélecteur d'outils.

## Le setup GitHub par lequel je commencerais

La [documentation du GitHub MCP Server](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md) documente le serveur distant hébergé, la contrainte VS Code 1.101 ou plus pour le flux OAuth dans VS Code, ainsi que les URLs par toolset avec les variantes `/readonly`. J'aime beaucoup ce choix, parce que commencer en lecture seule fait partie des rares réflexes de sécurité qui ne te ridiculisent jamais plus tard.

Voici la configuration distante minimale à garder en tête.

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

Si ton hôte ne peut pas utiliser le serveur distant, un setup local avec Docker fonctionne toujours. La [référence MCP VS Code](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration) précise que `type` est obligatoire pour les serveurs stdio, et elle documente `inputs`, `envFile` et `sandboxEnabled` pour les moments où la configuration devient vite pénible.

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

## Deux détails de sécurité que beaucoup sautent

Cette référence de configuration est claire sur la partie ennuyeuse mais importante : pas de secret en dur, des variables d'entrée ou un fichier d'environnement pour les valeurs sensibles, et la sandbox pour les serveurs stdio locaux sur macOS et Linux. Ce dernier point est facile à ignorer jusqu'au moment où un serveur demande plus d'accès disque ou réseau que prévu.

Je préfère des permissions étroites, un serveur en lecture seule quand c'est possible, et la sandbox pour tout serveur local qui parle au réseau. C'est moins sexy qu'une démo qui clignote, mais c'est aussi comme ça qu'on évite de transformer un assistant utile en processus beaucoup trop enthousiaste.

## Écrire ton propre serveur MCP

S'il existe déjà un serveur officiel pour le système dont tu as besoin, commence par ça. Écrire son propre serveur, c'est amusant comme refaire sa cuisine est amusant : satisfaisant, plein de quêtes secondaires, et très facile à sous-estimer.

Cet exemple utilise le [README du SDK TypeScript](https://github.com/modelcontextprotocol/typescript-sdk), parce que l'équipe y présente encore v2 comme pré-alpha et recommande v1.x pour la production. Sur cette ligne du SDK, tu importes `McpServer` depuis `@modelcontextprotocol/sdk/server/mcp.js` et tu déclares les outils avec `registerTool`.

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

Le motif compte plus que la fausse API de build : déclarer l'outil, valider l'entrée, appeler un système que tu connais déjà, puis renvoyer du texte que le modèle peut exploiter sans deviner.

Si tu colles le même contexte dans Copilot plus de deux fois par semaine, installe un serveur MCP. Si tu es encore en phase d'essai, prends lecture seule et stdio d'abord. Tu auras tout le temps de compliquer les choses une fois que la version ennuyeuse t'aura vraiment fait gagner du temps.
