---
id: mcp-model-context-protocol
order: 23
difficulty: advanced
tags: [MCP, protocol, security, portability, negotiation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Votre stack d'agents marche, jusqu'au jour où il faut réutiliser les mêmes outils dans deux hosts ou deux runtimes de modèles. Là, les rustines débarquent : un adaptateur pour les fichiers locaux, un autre pour les API internes, un troisième pour la recherche, puis un quatrième parce qu'un SDK voulait une forme différente. Ce tas vieillit mal.

C'est pour ça que je prends MCP au sérieux. Anthropic l'a lancé comme un standard ouvert pour connecter les assistants IA à des systèmes externes, et le vrai gain n'est pas “plus d'outils”. Le vrai gain, c'est d'échapper à la taxe d'intégration imposée par un seul vendeur. Si je veux que ma couche outils survive à un framework, je préfère miser sur un protocole plutôt que sur un SDK pratique mais jetable. [Annonce Anthropic](https://www.anthropic.com/news/model-context-protocol)

L'architecture est plus propre aussi : un host possède un client par serveur, les serveurs exposent tools, resources et prompts, et les transports restent séparés du modèle de données. C'est cette séparation que je défendrais, parce qu'elle vous donne un contrat observable et remplaçable au lieu d'un bloc de magie de framework. [Architecture MCP](https://modelcontextprotocol.io/docs/learn/architecture)

Là où les équipes deviennent brouillonnes, c'est à l'initialisation. MCP est stateful, commence par `initialize`, négocie la version du protocole et les capacités, puis ne passe en régime normal qu'après `notifications/initialized`. Ce handshake n'est pas de la paperasse. C'est ce qui permet à des composants anciens et nouveaux de dialoguer sans faire semblant de supporter la même surface. [Spec lifecycle](https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle)

Si je devais démarrer aujourd'hui, je commencerais par un petit serveur stdio, local, avec la même forme `FastMCP(...); mcp.run(transport="stdio")` que dans le quickstart officiel, qui rappelle aussi de ne jamais écrire des logs sur stdout en stdio. [Quickstart serveur](https://modelcontextprotocol.io/quickstart/server)

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

Cet exemple est volontairement banal. Le sujet difficile n'est pas le décorateur. Le sujet difficile, c'est de refuser de mélanger les contraintes de transport avec la logique métier, et de refuser de masquer les ruptures de contrat derrière un “chez moi ça marche”.

Le choix du transport, c'est le moment où la production rappelle qu'elle existe. Stdio est mon choix par défaut pour du local parce que c'est plus simple et que la spec recommande explicitement que les clients le supportent. Je ne passe à Streamable HTTP que si j'ai besoin de déploiement distant, d'infrastructure partagée ou de plusieurs clients sur un même serveur, et là je le traite comme un vrai service réseau : validation de `Origin`, binding local quand c'est approprié, et authentification sérieuse. La spec transport est très claire là-dessus, et elle a raison. [Spec transport](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)

Ma règle est simple et un peu sèche : prenez MCP quand la même surface d'outils doit survivre à plus d'un host, plus d'un runtime de modèle, ou à un vrai SLA. Si vous avez une seule app et deux fonctions utilitaires, évitez le cérémonial. Si la portabilité, l'observabilité et les contrats au niveau protocole comptent, adoptez MCP avant que le tas d'adaptateurs ne devienne votre problème principal.

## Resources

- [Intro MCP](https://modelcontextprotocol.io/introduction)
- [Spec latest](https://modelcontextprotocol.io/specification/latest)
