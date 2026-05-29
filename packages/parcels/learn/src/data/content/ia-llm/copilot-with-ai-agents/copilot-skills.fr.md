---
id: copilot-skills
order: 4
difficulty: intermediate
tags: [copilot, skills, ai-agents]
---

Tu as un workflow que tu répètes souvent : créer un nouveau composant dans le bon répertoire, avec les bons fichiers, dans le bon ordre, sans oublier de mettre à jour le barrel. Tu pourrais l'écrire dans `AGENTS.md`. Mais une procédure en sept étapes avec des conditions, des fichiers à créer, des validations à lancer — ça ne tient pas dans trois lignes. C'est là que les Skills deviennent utiles.

## Qu'est-ce qu'un Skill

Un Skill est un fichier markdown qui décrit une procédure complète que l'agent doit suivre. Là où `AGENTS.md` code des règles permanentes ("toujours utiliser pnpm"), un Skill code un workflow : une suite d'étapes ordonnées pour accomplir une tâche précise.

Concrètement, un Skill est un fichier `.md` dans un répertoire que Copilot peut découvrir (selon l'outil utilisé : `_skills/`, `_bmad/`, ou `.agents/skills/`). L'agent le lit et l'exécute comme une procédure.

## Quand écrire un Skill plutôt qu'une instruction

La distinction clé est entre **règle** et **procédure**. Voici le test pratique :

Si tu peux exprimer l'instruction en une ou deux lignes avec des exemples ✅/❌, c'est une règle : ça va dans `AGENTS.md`.

Si l'instruction implique plusieurs étapes dans un ordre précis, des fichiers à créer selon des patterns, ou des conditions à vérifier, c'est une procédure : ça va dans un Skill.

Exemples qui appartiennent à `AGENTS.md` :

- "Always use pnpm"
- "Never commit"
- "Add aria-hidden on decorative SVGs"

Exemples qui méritent un Skill :

- Créer un nouveau composant React avec sa structure de fichiers complète
- Générer un changeset en vérifiant les packages modifiés
- Effectuer une revue de code structurée en plusieurs passes

## Structure d'un Skill bien écrit

Un Skill ressemble à une procédure opérationnelle. Le contexte d'abord, pour que l'agent comprenne la situation. Les étapes ensuite, dans l'ordre où elles doivent être exécutées. Les déclencheurs enfin, pour que l'agent sache quand utiliser ce Skill sans qu'on lui demande explicitement.

Voici un exemple complet pour illustrer le pattern :

```markdown
# Skill : Créer un composant Design System

## Contexte

Ce Skill guide la création d'un composant React dans le Design System.
Il assure que la structure de fichiers et les conventions sont respectées.

## Déclencheurs

Utilise ce Skill quand l'utilisateur demande :

- "crée un composant <Nom>"
- "ajoute un composant dans le DS"

## Étapes

### 1. Créer la structure de fichiers

- `src/components/<Name>/index.ts` (barrel, re-export uniquement)
- `src/components/<Name>/<Name>.tsx` (implémentation)
- `src/components/<Name>/<Name>.module.css`
- `src/components/<Name>/__tests__/<Name>.test.tsx`

### 2. Écrire le test en premier (TDD)

Le test doit décrire le comportement attendu avant d'implémenter le composant.

### 3. Implémenter le composant

Implémentation minimale qui fait passer le test.

### 4. Mettre à jour le barrel global

Ajouter l'export dans `src/components/index.ts`.

### 5. Valider

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
```

## Les déclencheurs

La section "Déclencheurs" est ce qui rend les Skills vraiment efficaces : l'agent reconnaît les situations où il doit appliquer le Skill sans que tu aies à lui dire "utilise le Skill X". En pratique, ça ressemble à de la compréhension, même si c'est du matching de patterns.

Un bon déclencheur est une phrase naturelle que tu écrirais dans le chat. Pas un mot-clé artificiel.

## Organisation dans le projet

```
_skills/
  create-component.md
  create-parcel.md
  generate-changeset.md
  run-code-review.md
```

Un fichier par Skill, nommé en kebab-case de façon descriptive. Si le projet utilise BMAD (comme ce site), les Skills se trouvent dans `_bmad/` avec un format légèrement différent. Dans tous les cas, le principe reste identique : un fichier markdown par workflow reproductible.
