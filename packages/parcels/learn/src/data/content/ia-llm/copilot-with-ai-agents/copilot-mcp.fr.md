---
id: copilot-mcp
order: 5
difficulty: intermediate
tags: [copilot, mcp, tools]
---

Tu es en train de demander à Copilot d'analyser un bug signalé dans une issue GitHub. Il te répond avec des généralités parce qu'il n'a pas accès à cette issue. Tu dois copier-coller le contenu à la main dans le chat. Ce n'est pas bloquant, mais c'est exactement le genre de friction qui te fait penser que l'outil n'est "pas encore prêt".

Les MCP résolvent ce problème.

## Le Model Context Protocol en une phrase

Le **Model Context Protocol (MCP)** est un standard open source créé par Anthropic et adopté par les principaux outils AI (GitHub Copilot, Claude Code, Cursor…). Il définit comment un agent peut appeler des outils externes de façon standardisée : lire une issue, interroger une base de données, rechercher sur le web.

La différence avec un Skill : un Skill est une procédure écrite en texte que l'agent suit. Un MCP est une connexion à un système externe qui fournit des données ou exécute des actions en temps réel.

## Cas d'usage concrets

**MCP GitHub** — l'agent peut lire des issues, créer des PRs, consulter l'historique de commits, lire des fichiers dans des repos distants. Sans MCP, il ne peut accéder qu'aux fichiers locaux.

**MCP base de données** — l'agent interroge directement ta base : "combien d'utilisateurs actifs ce mois-ci ?" sans que tu aies à copier-coller les résultats.

**MCP recherche web** — l'agent recherche sur le web et injecte les résultats dans sa réponse. Utile pour les questions sur des bibliothèques récentes ou des erreurs très spécifiques.

**MCP maison** — tu écris ton propre serveur pour exposer des données spécifiques à ton contexte : un système interne, une API propriétaire, des métadonnées d'infrastructure. C'est là que les MCP deviennent vraiment puissants.

## Configuration dans VS Code

Pour qu'un MCP soit disponible dans Copilot, il faut déclarer le serveur dans `.vscode/mcp.json`. Voici à quoi ça ressemble avec le MCP GitHub officiel :

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

La plupart des MCP standards se lancent avec `npx` (ou `pnpm dlx`). Le serveur tourne localement et communique avec l'agent via stdio. VS Code te demandera la valeur de `githubToken` au lancement.

## Sécurité : deux règles non négociables

Les MCP ont accès à des systèmes potentiellement sensibles. Deux règles à respecter sans exception :

Ne jamais commiter de tokens dans `.vscode/mcp.json`. Utilise la syntaxe `${input:nomDuSecret}` pour que VS Code te le demande, ou des variables d'environnement configurées en dehors du dépôt.

Limite les permissions du token au strict nécessaire. Un token en lecture seule suffit pour 90% des cas d'usage. Ce n'est pas de la paranoïa : un serveur MCP tiers malveillant peut exfiltrer des données si le token a trop de droits.

## Écrire ton propre serveur MCP

Quand aucun MCP existant ne couvre ton cas, le SDK TypeScript te permet d'en écrire un en quelques dizaines de lignes. Ce code expose un outil `get_deploy_status` que l'agent peut appeler pour connaître l'état de ton infrastructure :

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'mon-mcp', version: '1.0.0' },
  {
    capabilities: { tools: {} },
  }
);

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'get_deploy_status',
      description: "Retourne l'état du dernier déploiement en production",
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler('tools/call', async (req) => {
  if (req.params.name === 'get_deploy_status') {
    const status = await fetchDeployStatus();
    return { content: [{ type: 'text', text: JSON.stringify(status) }] };
  }
  throw new Error('Outil inconnu');
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

C'est utile quand tu veux que l'agent accède à des données internes (métriques, états de déploiement, données métier) sans les copier manuellement dans chaque conversation. Un investissement de deux heures pour supprimer une friction quotidienne.
