---
id: copilot-custom-agents
order: 6
difficulty: advanced
tags: [copilot, custom-agents, ai-agents]
---

Le problème ne vient pas de ce que Copilot fait. Il vient de ce qu'il essaie de faire en même temps. Dans la même session, il est censé être architecte (proposer des designs), développeur (implémenter), et revieweur (critiquer son propre code). Ces trois modes ont des priorités contradictoires : un architecte regarde à 6 mois, un développeur regarde à la prochaine PR, un revieweur cherche tout ce qui peut casser. Les faire cohabiter dans le même agent produit des réponses molles qui ne sont vraiment aucun des trois.

Les Custom Agents résolvent ça en isolant le contexte et les instructions par rôle.

## Ce qu'un Custom Agent apporte concrètement

Un Custom Agent est un agent Copilot configuré indépendamment de l'agent principal. Il peut avoir un persona distinct, un sous-ensemble du contexte du projet, des outils spécifiques, et des priorités différentes. Ce n'est pas un mode d'affichage différent : c'est un agent qui ignore activement ce qui n'est pas de son ressort.

L'agent standard lit `AGENTS.md` et connaît le projet dans son ensemble. Un Custom Agent architecte, lui, ne lit que la documentation d'architecture et les ADR. Il n'a pas accès au code applicatif parce que sa valeur vient précisément de ne pas être influencé par l'implémentation existante.

## Structure d'un agent concret

Voici un agent architecte réaliste. Le point important est ce qu'il refuse de faire autant que ce qu'il fait :

```markdown
# Agent : Architecte Système

## Identité

Tu es Winston, architecte système senior avec 15 ans d'expérience
sur des systèmes distribués en production. Tu analyses les besoins
et proposes des designs défendables à long terme.

## Contexte disponible

- `docs/architecture/` : ADR et décisions passées
- `docs/api-contracts/` : contrats d'interface entre services

## Hors périmètre

- Tu ne lis pas le code applicatif (tu n'es pas influencé par l'existant)
- Tu ne proposes pas d'implémentation
- Tu ne valides pas la syntaxe

## Comportement

- Avant tout design : demande les contraintes non fonctionnelles
  (volume, SLA, budget infra, équipe)
- Chaque proposition inclut ses trade-offs explicites
- Si la demande implique un changement de design existant :
  propose un ADR avant de continuer
- Signal d'alarme si une décision crée une dette technique silencieuse
```

La section "Hors périmètre" est souvent oubliée. C'est pourtant elle qui donne sa valeur à l'agent : un architecte qui descend dans l'implémentation n'est plus un architecte.

## Quand un Custom Agent est justifié

La plupart des besoins ne nécessitent pas un Custom Agent. Voici le gradient de complexité réel :

Une **instruction dans `AGENTS.md`** suffit quand le comportement s'applique à toutes les conversations sans changer de contexte. Règles de code, conventions de commit, outils à utiliser.

Un **Skill** suffit quand la tâche est une procédure reproductible mais que le contexte du projet reste le même. Créer un composant, générer un changeset, lancer une revue de code.

Un **Custom Agent** devient pertinent quand le rôle nécessite un contexte fondamentalement différent, ou quand le même contenu vu par deux agents différents doit produire deux types de réponses opposés (implémentation vs critique).

## Exemples qui justifient vraiment un agent distinct

**Agent Reviewer adversarial** — Son seul travail est de chercher ce qui peut casser. Il a accès au diff et aux tests existants, mais ses instructions sont orientées scepticisme : cherche les edge cases, les hypothèses implicites, les cas où la spécification est incomplète. Un agent de développement ne peut pas jouer ce rôle honnêtement parce qu'il a un biais vers la validation.

**Agent QA** — Connaît les patterns de test du projet et génère des cas de test exhaustifs. Son contexte prioritaire, c'est la spécification et les règles métier, pas l'implémentation. Si l'implémentation est dans son contexte, il teste ce qui est codé plutôt que ce qui devrait l'être.

**Agent PM** — Aide à structurer des user stories, challenge les périmètres, identifie les dépendances métier. Il n'a pas accès au code : ce serait une distraction par rapport à la valeur qu'il apporte.

## Custom Agents et BMAD

Ce projet utilise BMAD, qui fournit un système de Custom Agents pré-construits dans `.agents/` :

```
.agents/
  skills/
    ...
  agents/    (si vous utilisez des agents custom)
    ...
```

Les agents BMAD suivent la même structure : identité, périmètre, comportement, outils. L'orchestration entre agents est gérée soit manuellement (tu choisis explicitement l'agent à invoquer), soit via des déclencheurs dans les Skills.

## La question à se poser avant de créer un agent

Est-ce que ce persona est suffisamment distinct de l'agent principal pour justifier une configuration séparée ?

Si la réponse est "je pourrais obtenir le même résultat avec une instruction dans `AGENTS.md` bien formulée", alors c'est probablement plus simple. Les Custom Agents ont un coût de maintenance : ils vieillissent, dérivent du contexte réel du projet, et doivent être mis à jour quand les conventions changent.

La règle que j'applique : si le rôle nécessite d'ignorer activement une partie du contexte du projet pour être efficace, alors c'est un Custom Agent. Sinon, c'est une instruction ou un Skill.
