---
id: copilot-agents-md-setup
order: 2
difficulty: beginner
tags: [copilot, agents-md, configuration]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Tu as probablement déjà vécu ça : Copilot réussit une tâche, puis ouvre le fichier suivant et agit comme s'il n'avait jamais vu ton projet. Il oublie la commande de test, invente une convention de nommage, puis modifie la mauvaise couche avec un aplomb presque insultant.

Les instructions de dépôt servent à régler ce problème. GitHub les répartit aujourd'hui en trois familles : `.github/copilot-instructions.md` pour les règles globales du dépôt, les fichiers `.instructions.md` pour les règles ciblées par chemin, et les fichiers d'instructions pour agents comme `AGENTS.md`, `CLAUDE.md` ou `GEMINI.md` [GitHub Docs][gh-response]. Pour un usage orienté agents, je préfère `AGENTS.md` parce que l'agent cloud de GitHub et Copilot CLI reconnaissent tous les deux ce nom de fichier [matrice de support GitHub][gh-support].

## Ce que `AGENTS.md` fait vraiment

`AGENTS.md` donne à un agent le contexte pénible mais indispensable avant même ton prompt : comment tester, ce qu'il ne faut pas toucher, et quelles conventions sont réellement en vigueur. VS Code rappelle aussi une limite importante : les instructions personnalisées influencent le chat et les flux agentiques, pas les complétions inline dans l'éditeur [documentation VS Code][vscode-custom].

La conversation change alors de ton. Au lieu de retaper « lance la commande de test documentée » ou « demande avant d'ajouter une dépendance », tu poses la règle une fois et tu arrêtes de surveiller le prompt comme un parent fatigué.

## Commencer avec un seul fichier à la racine

Le point de départ le plus sûr, c'est un unique `AGENTS.md` à la racine du dépôt. GitHub indique que les agents Copilot peuvent utiliser des fichiers `AGENTS.md` n'importe où dans un dépôt et choisir le plus proche, mais le même guide de configuration précise que, dans VS Code, la prise en charge des `AGENTS.md` en sous-dossiers est encore désactivée par défaut aujourd'hui [guide de configuration GitHub][gh-setup].

Donc je ne compliquerais pas le sujet dès le premier jour. Un fichier à la racine apporte déjà l'essentiel, et tu pourras le découper plus tard si une zone du projet a vraiment besoin d'autres règles.

## Rendre le fichier portable

C'est là que le sujet devient un peu agaçant. Codex lit directement les fichiers `AGENTS.md` et fusionne les règles générales avec les surcharges plus proches [documentation OpenAI][openai-agents]. Claude Code, lui, ne lit pas `AGENTS.md` tout seul. Sa documentation recommande un `CLAUDE.md` qui importe `AGENTS.md`, ou un lien symbolique si tu n'as pas besoin de notes spécifiques à Claude [documentation Claude Code][claude-memory].

Je préfère l'import. C'est moins malin qu'un lien symbolique, et « moins malin » vieillit souvent beaucoup mieux.

Voici le plus petit `AGENTS.md` que je mettrais réellement en place.

```markdown
# AGENTS.md

## Règles de travail

- Lance la commande de test documentée avant de terminer une modification.
- Demande avant d'ajouter une nouvelle dépendance d'exécution.
- Mets à jour la documentation quand un comportement public change.
```

Si tu utilises aussi Claude Code, ajoute un minuscule fichier de compatibilité pour que les deux outils lisent la même source de vérité.

```markdown
# CLAUDE.md

@AGENTS.md

## Claude Code

- Utilise le mode plan pour les refactors de plus grande taille.
```

## Quoi écrire dedans

Anthropic recommande de garder `CLAUDE.md` concis et lisible par un humain, et ce conseil s'applique très bien ici aussi [guide Anthropic][anthropic-claude-md]. Un bon `AGENTS.md` doit ressembler à des consignes qu'un collègue senior laisserait à ton toi du futur, pas à une affiche de valeurs collée dans une salle de réunion.

Ce modèle reste volontairement générique, pour que tu puisses reprendre la forme sans récupérer les manies de quelqu'un d'autre.

```markdown
# AGENTS.md

## Carte du projet

- Le code de l'application vit dans `packages/my-app`.
- Les utilitaires partagés vivent dans `packages/my-shared`.

## Règles de code

- Préfère les imports depuis `@my/shared` au copier-coller de helpers.
- Garde les fonctions ciblées et nomme-les d'après ce qu'elles renvoient ou modifient.

## Workflow

- Lance `pnpm --filter my-app test` après un changement de comportement dans `packages/my-app`.
- Demande avant d'introduire une nouvelle dépendance d'exécution.

## Définition de terminé

- Mets à jour les tests quand le comportement change.
- Mets à jour la documentation quand l'installation ou le comportement public change.
```

Si une règle ne concerne qu'un morceau du dépôt, c'est le signal pour utiliser un fichier d'instructions ciblé par chemin ou un `AGENTS.md` imbriqué, pas pour transformer le fichier racine en fourre-tout.

## Resources

- [GitHub Docs sur la personnalisation des réponses Copilot][gh-response]
- [GitHub Docs sur les instructions de dépôt et les matrices de support][gh-support]
- [Documentation VS Code sur les instructions personnalisées][vscode-custom]
- [Documentation OpenAI sur `AGENTS.md` dans Codex][openai-agents]
- [Documentation Claude Code sur la mémoire et `CLAUDE.md`][claude-memory]
- [Guide Anthropic sur `CLAUDE.md`][anthropic-claude-md]

[gh-response]: https://docs.github.com/en/copilot/concepts/about-customizing-github-copilot-chat-responses
[gh-support]: https://docs.github.com/en/copilot/reference/custom-instructions-support
[vscode-custom]: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
[gh-setup]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide?tool=vscode
[openai-agents]: https://developers.openai.com/codex/guides/agents-md
[claude-memory]: https://code.claude.com/docs/en/memory
[anthropic-claude-md]: https://claude.com/blog/using-claude-md-files
