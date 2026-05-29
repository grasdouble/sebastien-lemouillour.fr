---
id: copilot-agents-md-best-practices
order: 3
difficulty: intermediate
tags: [copilot, agents-md, best-practices]
---

Tu as mis en place `AGENTS.md`. Tu as ajouté quelques règles. Et pourtant, l'agent continue de faire des choses que tu n'attendais pas. Le problème n'est presque jamais le nombre de règles : c'est leur formulation.

## La règle des règles : observable ou inutile

Une instruction que tu ne peux pas vérifier ne change rien au comportement de l'agent.

Teste-toi sur ces exemples :

- "Sois attentif à la sécurité" — Comment saurais-tu si l'agent l'a respectée ?
- "Utilise de bonnes pratiques" — Lesquelles exactement ?
- "Pense à la performance" — Cette phrase peut vouloir dire cent choses selon le contexte.

Ces formulations semblent raisonnables. Elles ne fonctionnent pas parce qu'elles n'encodent pas de décision. Un comportement observable, lui, te permet de vérifier après coup :

- ✅ "Never call `tsc` directly. Use `pnpm typecheck` instead."
- ✅ "Never run `git add` or `git commit`. Leave all staging to the user."
- ✅ "Every decorative SVG must have `aria-hidden=\"true\"`."

Pour chacune de ces règles, tu peux regarder ce que l'agent a fait et voir immédiatement si elle a été respectée. C'est le critère.

## Le format qui fonctionne

Les titres de section sous la forme "sujet — directive" sont particulièrement efficaces parce qu'ils communiquent l'essentiel avant même que le corps soit lu :

```markdown
## Package Manager — Always use pnpm

## Git — No commits, no staging

## TypeScript — Never call tsc directly

## Accessibility — Non-negotiable
```

Pour le corps de chaque règle, ajoute une phrase qui explique le _pourquoi_ quand ce n'est pas évident. L'agent comprend mieux les contraintes quand il comprend leur origine. Voici un exemple complet pour une règle où le "pourquoi" change vraiment ce qu'on attend :

```markdown
## TypeScript — Never call tsc directly

The tsconfig files have `declaration: true`. Running tsc without `--noEmit`
emits .js, .d.ts and .map files into src/. Always use the project scripts.

- ✅ `pnpm typecheck`
- ✅ `ide-get_diagnostics`
- ❌ `tsc`, `pnpm tsc`, `tsc -p tsconfig.json`
```

Sans l'explication, l'interdiction semble arbitraire. Avec, l'agent comprend le risque concret qu'il doit éviter.

## Ce qui appartient au fichier et ce qui n'y a pas sa place

Une confusion fréquente : `AGENTS.md` n'est pas un fichier de documentation du projet ni un doublon de la config ESLint.

**À mettre dans `AGENTS.md` :**

- Les choix d'outils que l'agent ne peut pas deviner (package manager, builder, scripts de validation)
- Les comportements git qui lui sont interdits
- Les conventions de projet non encodées dans les outils (naming, structure de dossiers, règles de changeset)
- Les règles d'accessibilité que tu veux systématiques
- La structure du monorepo si elle n'est pas standard

**À ne pas mettre dans `AGENTS.md` :**

- Les règles déjà couvertes par ESLint ou Prettier — l'agent les respectera via les outils, inutile de doubler
- Les préférences stylistiques (indentation, quotes) — c'est le rôle de Prettier
- Les instructions spécifiques à une tâche unique ("pour cette PR, utilise ce message") — ces informations sont éphémères et n'ont pas leur place ici
- La documentation fonctionnelle du projet

## Capitaliser sur les erreurs réelles

C'est le point que les gens oublient le plus souvent, et c'est pourtant le plus important.

Chaque fois que l'agent fait quelque chose que tu dois corriger, pose-toi la question : est-ce que cette règle manquait dans `AGENTS.md` ? Si oui, ajoute-la dans la même session. Pas plus tard. Maintenant.

Un fichier `AGENTS.md` bien entretenu ne se construit pas en essayant d'anticiper tous les cas possibles au départ. Il se construit en observant les comportements réels et en codifiant ce qui manquait. Trois mois de travail avec Copilot produisent un `AGENTS.md` bien plus utile que deux heures de réflexion anticipée.
