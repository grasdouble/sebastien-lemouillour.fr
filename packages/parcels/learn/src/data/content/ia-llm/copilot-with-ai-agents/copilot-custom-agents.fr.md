---
id: copilot-custom-agents
order: 6
difficulty: advanced
tags: [copilot, custom-agents, ai-agents]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Tu connais probablement ce moment un peu pénible : tu demandes à Copilot de penser comme un architecte, coder comme un collègue, et chipoter comme un reviewer dans le même prompt, puis tu obtiens une réponse un peu moyenne dans les trois rôles.

Les custom agents existent précisément pour ce problème. Ils te permettent de transformer un rôle récurrent en spécialiste réutilisable, pour éviter que la planification, l'implémentation, et la revue se marchent dessus.

## Un fichier d'agent, c'est juste un contrat

Dans les outils locaux comme le CLI et VS Code, un custom agent est un fichier Markdown avec l'extension `.agent.md`, un frontmatter YAML, puis un corps en Markdown. Les [custom agents VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents) ajoutent aussi des options propres à l'éditeur comme `agents`, `handoffs`, et les `hooks` en preview, ce qui compte quand tu veux un workflow complet plutôt qu'un simple persona.

La [référence de configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration), c'est celle que je garde ouverte dans un onglet à part, parce que les pièges sont là : `name` est optionnel, `description` sert à faire comprendre le rôle à Copilot, omettre `tools` ou utiliser `tools: ["*"]` active tous les outils disponibles, `tools: []` les coupe tous, `infer` est déprécié, et des champs comme `model`, `target`, `mcp-servers`, `user-invocable`, et `disable-model-invocation` changent l'endroit où l'agent tourne et qui peut l'invoquer.

Je préfère commencer par le profil le plus ennuyeux possible, parce que les fichiers ennuyeux vieillissent mieux. En général, ça suffit pour vérifier que le rôle tient debout.

```markdown
---
name: architecture-reviewer
description: Revoir des propositions d'architecture, expliquer les compromis, et éviter les détails d'implémentation
tools: ['read', 'search']
---

Tu relis des décisions d'architecture.

Règles :

- Lire seulement le code et la documentation nécessaires pour comprendre les frontières du système
- Ne pas écrire de code de production
- Pour chaque recommandation, expliquer les compromis, le coût de migration, et les modes de panne
- Signaler les contraintes manquantes avant de proposer un design
```

Si tu as déjà envie d'ajouter dix outils et trois pages d'instructions, c'est souvent le moment où l'agent cesse d'être un rôle et devient un tiroir à bazar.

## Le stockage suit la propriété

La règle côté CLI est simple : utilise `.github/agents` quand l'agent appartient au projet, utilise `~/.copilot/agents` quand il t'appartient, et garde en tête qu'un fichier utilisateur avec le même nom de fichier écrase la version du projet, comme l'explique le [guide CLI custom agents](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli).

Quand tu veux porter la même idée sur GitHub.com, le [guide cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-custom-agents) dit que le flux officiel crée les agents de dépôt dans `.github/agents`, et les agents d'organisation ou d'entreprise dans un répertoire `agents/` à la racine du dépôt `.github-private`.

## La plupart des custom agents devraient rester des prompt files ou des instructions

Le [comparatif des fonctionnalités](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) de GitHub est utile parce qu'il démonte une confusion fréquente : les custom instructions disent à Copilot comment se comporter en général, les skills décrivent comment traiter une famille de tâches, et les custom agents définissent des capacités spécialisées que l'agent principal peut déléguer à des sous-agents.

Si une règle doit se charger automatiquement dans le CLI, la [documentation instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/add-custom-instructions) te renvoie vers `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, ou `AGENTS.md`, pas vers un nouveau fichier d'agent.

Si le besoin est juste un point d'entrée réutilisable lancé à la main, un prompt file est plus léger. Les [prompt files VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files) sont des fichiers Markdown invoqués comme des slash commands, ce qui est parfait quand tu veux lancer une tâche à la demande sans inventer un coéquipier imaginaire à plein temps.

Cette distinction compte plus que le mot "expert". Beaucoup de tâches ont l'air spécialisées alors qu'elles restent de simples prompts. Le vrai seuil, c'est le moment où l'agent a besoin d'incitations différentes, d'un budget d'outils plus petit, ou d'un contexte plus étroit que l'agent par défaut.

## La facture de maintenance arrive plus tard

Un custom agent, ce n'est pas une mini constitution qu'on écrit une fois avant de l'encadrer au mur. Les noms d'outils changent, la doc dérive, la config MCP bouge, et le prompt malin d'hier devient discrètement la mauvaise habitude de demain.

Crée un custom agent seulement quand le rôle doit volontairement voir moins, faire moins, ou juger avec d'autres critères. Si tu n'arrives pas à formuler cette contrainte en une phrase, ne crée pas encore l'agent, écris d'abord un prompt file et attends de voir si la douleur revient une deuxième fois.
