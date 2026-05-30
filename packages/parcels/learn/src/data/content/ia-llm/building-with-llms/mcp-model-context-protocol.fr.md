---
id: mcp-model-context-protocol
order: 23
difficulty: advanced
tags: [MCP, protocol, security, portability, negotiation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Chaque stack d'agents finit par accumuler la même couche disgracieuse : des adaptateurs maison pour les fichiers, la recherche, les API internes et les bases de données, tous câblés à un framework précis d'une manière très précise. Puis l'équipe change de fournisseur de modèle ou ajoute un second runtime, et toute la couche outils se transforme en dette technique du jour au lendemain.

C'est exactement le problème que [MCP](https://modelcontextprotocol.io/) essaie de résoudre. Le protocole standardise la découverte des tools, resources et prompts pour éviter de réécrire la même logique d'adaptation pour chaque stack de modèles. Le sujet important n'est pas le confort. C'est la portabilité. La couche outils doit survivre à un changement de framework.

L'[annonce Anthropic](https://www.anthropic.com/news/model-context-protocol) formulait l'objectif clairement : un protocole partagé, pas un framework partagé. Cette distinction compte. Les abstractions de framework ont tendance à vous enfermer dans un écosystème. Les protocoles vous donnent un contrat d'interface réutilisable entre clients.

En production, la vraie fonctionnalité qui paie est la négociation de capacités. Le client demande ce que le serveur supporte, puis choisit ce qu'il utilisera. Vous pouvez donc ajouter un outil sur le serveur sans casser les anciens clients, tant qu'ils respectent le contrat annoncé au lieu de supposer l'univers. Si vous construisez déjà des agents outillés avec les patterns du [guide OpenAI Agents](https://platform.openai.com/docs/guides/agents), MCP vous donne une frontière plus propre entre le runtime agentique et la surface des outils.

C'est cette forme de serveur que je veux voir dans les têtes :

```python
from mcp.server import MCPServer

server = MCPServer(name="docs-search", version="1.0.0")

@server.tool(name="search_docs")
async def search_docs(query: str, max_results: int = 5) -> list[dict]:
    return await docs_index.search(query, limit=max_results)

server.run()
```

Le code lui-même n'est pas la partie intéressante. Le contrat, si. Une fois l'outil exposé via une interface standard, n'importe quel client compatible peut le découvrir sans adaptateur spécifique.

Il ne faut pas confondre protocole et sécurité. MCP ne rend pas vos outils sûrs par magie. Il faut toujours de l'authentification, de l'autorisation par client, du rate limiting, et des logs d'invocation assez détaillés pour auditer les abus. Traitez un serveur MCP comme un microservice qui peut faire des dégâts, pas comme une fonction utilitaire cachée dans l'application.

Ma règle de décision est simple : à partir de plus de deux serveurs d'outils indépendants, ou dès que plusieurs runtimes de modèles ont besoin des mêmes outils, MCP commence à rentabiliser sa complexité. Avant ça, l'intégration directe est moins chère. Après ça, elle devient chère très vite.
