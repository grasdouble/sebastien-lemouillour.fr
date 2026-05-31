---
id: copilot-mcp
order: 5
difficulty: intermediate
tags: [tools, copilot]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

Tu demandes à Copilot pourquoi un job CI a raté, et la réponse est planquée dans GitHub Actions, dans un autre tableau de bord, ou dans une API que personne n'a envie d'interroger à la main avant le café. Alors tu colles des liens, des logs, puis un bout de JSON. Copilot n'est pas paresseux, il lui manque juste la pièce.

Le MCP règle ça.

## Quand le chat a besoin d'un vrai outil

La [spécification MCP](https://modelcontextprotocol.io/specification) décrit un protocole JSON-RPC 2.0 avec des hôtes, des clients et des serveurs. Les serveurs peuvent exposer des outils, des ressources et des prompts. Les clients peuvent, eux, prendre en charge le sampling. L'idée utile est plus simple : au lieu d'entasser plus de contexte dans le prompt, tu laisses Copilot appeler le système qui sait déjà.

C'est aussi pour ça qu'un MCP n'est pas la même chose qu'un prompt file ou qu'une instruction personnalisée. Les instructions cadrent le comportement. Le MCP donne au modèle un outil appelable ou une ressource lisible. Je préfère penser comme ça, parce que ça garde le cas d'usage honnête : si aucun système externe n'est en jeu, tu n'as probablement pas besoin de MCP.

## Où Copilot le prend en charge aujourd'hui

Les [docs VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) expliquent que tu peux installer des serveurs depuis la galerie avec `@mcp`, ou les configurer à la main dans `.vscode/mcp.json` pour un workspace et `mcp.json` dans ton profil utilisateur. Les [docs GitHub](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/extend-copilot-chat-with-mcp?tool=vscode) ajoutent les deux limites qui comptent en pratique : MCP dans Copilot demande VS Code 1.99 ou plus, et une organisation sur Copilot Business ou Copilot Enterprise peut le désactiver avec une politique.

Si tu vis dans VS Code, c'est ce passage qui compte : MCP n'est plus une bidouille exotique. Les outils arrivent là où tu discutes déjà avec Copilot, donc la friction devient enfin assez basse pour que ça vaille le coup.

## Le setup GitHub par lequel je commencerais

Les docs du [serveur distant](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md) couvrent le serveur GitHub hébergé, la contrainte VS Code 1.101 ou plus pour le flux OAuth dans VS Code, et les variantes `/readonly` pour chaque URL de toolset. J'aime beaucoup ce choix, parce que commencer en lecture seule fait partie des rares réflexes de sécurité qui ne te ridiculisent jamais plus tard.

Voici la config distante minimale à garder en tête.

```jsonc
{
  "servers": {
    "github": {
      "type": "http", // Serveur MCP distant
      "url": "https://api.githubcopilot.com/mcp/readonly", // Lecture seule par défaut
    },
  },
}
```

Si ton hôte ne peut pas utiliser le serveur distant, le stdio local marche encore très bien. La [référence config](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration) est la page à garder ouverte, parce qu'elle documente les champs obligatoires comme `type`, puis `inputs`, `envFile` et `sandboxEnabled`.

Commence avec des variables d'entrée, pas avec des secrets en dur.

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
      "type": "stdio", // Processus local
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_pat}", // Saisi au démarrage
      },
    },
  },
}
```

## Deux détails de sécurité que beaucoup sautent

Cette référence de configuration est claire sur la partie ennuyeuse mais importante : pas de secret en dur, des variables d'entrée ou un fichier d'environnement pour les valeurs sensibles, et la sandbox pour les serveurs stdio locaux sur macOS et Linux. Ce dernier point est facile à ignorer jusqu'au moment où un serveur demande plus d'accès disque ou réseau que prévu.

Je préfère des permissions étroites, un serveur en lecture seule quand c'est possible, et la sandbox pour tout serveur local qui parle au réseau. Pense aussi au fait que chaque appel d'outil devient un vrai saut réseau ou processus. Si ton serveur se met devant une API avec des limites serrées, la démo joyeuse devient vite bancale.

## Écrire ton propre serveur MCP

S'il existe déjà un serveur officiel pour le système dont tu as besoin, commence par ça. Écrire son propre serveur, c'est amusant comme refaire sa cuisine est amusant : satisfaisant, plein de quêtes secondaires, et très facile à sous-estimer.

Le [README SDK](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/README.md) actuel montre le nouveau package `@modelcontextprotocol/server` sur `main`, mais il prévient aussi que `main` correspond encore à une v2 pré-alpha et recommande toujours v1.x pour la production. C'est exactement pour ça que je prototyperais avec l'API du README, puis que je figerais une branche stable avant de promettre quoi que ce soit à une équipe.

Si tu veux quand même un petit serveur juste pour sentir la forme du truc, voilà le motif actuel.

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
      branch: z.string(), // nom de branche
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

Le motif compte plus que la fausse API de build : valide l'entrée, appelle un seul système que tu connais déjà, et rends les erreurs d'auth ou de quota évidentes.

Si tu colles le même contexte dans Copilot plus de deux fois par semaine, installe un serveur MCP. Si le workflow peut modifier des données, commence quand même en lecture seule et n'ouvre plus large qu'au moment où tu touches une vraie limite.
