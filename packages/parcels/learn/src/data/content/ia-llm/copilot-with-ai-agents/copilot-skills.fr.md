---
id: copilot-skills
order: 4
difficulty: intermediate
tags: [copilot, skills, ai-agents]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Tu connais le moment : tu as tapé trois fois le même prompt de revue cette semaine, Copilot a encore oublié une étape, et tu te demandes si la solution consiste à grossir `AGENTS.md`. J'ai appris ça à la dure. Transformer un raccourci de deux minutes en règle toujours active, c'est une très bonne façon d'agacer mon moi du futur.

## Le premier piège, c'est de tout mettre dans les instructions

La réponse commence avec les [custom instructions VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions). Elles couvrent deux usages différents : les règles toujours actives dans `.github/copilot-instructions.md` et `AGENTS.md`, plus les fichiers ciblés `.github/instructions/**/*.instructions.md` qui s'appliquent quand les fichiers ou la tâche correspondent. Leur rôle est d'orienter le comportement dans la durée, pas de stocker une checklist que tu ne veux sortir que dans un cas précis.

Cette distinction compte encore plus parce que le support n'est pas identique partout. GitHub publie une [matrice de support GitHub Copilot](https://docs.github.com/en/copilot/reference/custom-instructions-support), et ça vaut le coup de la vérifier avant de supposer que les custom instructions se comportent pareil dans VS Code, sur GitHub.com, dans le CLI et sur toutes les autres surfaces Copilot.

Donc si ton vrai problème est : « je veux une commande réutilisable pour une tâche qui revient souvent », les instructions ne sont pas le bon outil. Il te faut quelque chose que tu déclenches volontairement.

## Les prompt files sont la réponse la plus légère

Pour ce problème, les [prompt files VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files) restent la plus petite unité utile. Dans VS Code, ce sont des fichiers Markdown avec l'extension `.prompt.md`, généralement stockés dans `.github/prompts/` pour l'espace de travail. Pour un usage personnel, VS Code les stocke dans les données utilisateur de ton profil. Tu les lances manuellement comme des slash commands, via **Chat: Run Prompt**, ou avec le bouton play dans l'éditeur. Le frontmatter peut définir `description`, `name`, `argument-hint`, `agent`, `model` et `tools`.

Voici le plus petit prompt file que je garderais vraiment :

```markdown
---
name: prepare-pr
description: Préparer un brouillon de pull request pour le changement en cours
agent: agent
---

Passe en revue le changement courant avant d'ouvrir une pull request.

1. Identifie le changement visible côté utilisateur.
2. Résume-le en trois puces.
3. Liste les risques, les migrations et la suite du travail.
4. Rédige :
   - un titre de pull request
   - une description courte
   - une checklist de vérification
```

Je préfère les prompt files quand le workflow tient encore dans une seule interaction de chat. C'est rapide à écrire, facile à tester, et pas grave à jeter quand le rituel se révèle moins utile que prévu.

## Les skills sont souvent ce que les gens veulent vraiment

Le problème des prompt files, c'est qu'ils restent des prompts. Si tu as besoin de scripts, de templates, d'exemples ou d'un usage réutilisable entre plusieurs agents compatibles, les [Agent Skills VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills) sont un meilleur choix. Un skill est un dossier avec un fichier `SKILL.md` et toutes les ressources de support qu'il référence. VS Code peut charger les skills projet depuis `.github/skills/`, `.claude/skills/` ou `.agents/skills/`, et les skills personnels depuis les dossiers équivalents dans ton répertoire utilisateur. Les champs `name` et `description` sont obligatoires, `user-invocable` vaut `true` par défaut, `disable-model-invocation` vaut `false` par défaut, et `context: fork` est encore expérimental.

Quand le sujet mérite un skill, le dossier commence par un `SKILL.md` comme celui-ci :

```markdown
---
name: review-pr
description: Relire une pull request pour repérer les risques et préparer les notes de version. Utilise ce skill quand on te demande de préparer ou relire une PR.
user-invocable: true
disable-model-invocation: false
---

# Skill de revue de PR

1. Inspecte le diff en cours.
2. Regroupe les changements par impact utilisateur.
3. Signale les migrations, les hypothèses risquées et les tests manquants.
4. Rédige les notes de version en langage simple.
5. Si besoin, réutilise la checklist dans [release-template](./release-template.md).
```

À partir de là, j'arrête d'appeler ça un « prompt sauvegardé ». Si Copilot a besoin de fichiers en plus pour bien faire le travail, tu es face à un problème en forme de skill.

## Les custom agents règlent un autre problème

Parfois, le vrai souci n'est pas la répétition. Parfois, tu veux que Copilot se comporte comme un planificateur, un relecteur ou un débogueur avec une boîte à outils précise. C'est le rôle des [custom agents VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents). Ils utilisent des fichiers `.agent.md`, peuvent limiter les outils, choisir un modèle ou une liste de modèles, et définir des handoffs. Je n'irais pas vers ça juste pour éviter de retaper un prompt. J'y vais quand le rôle lui-même doit rester stable.

## Choisir le bon fichier sans en faire un drame

Ma règle est un peu terne, mais elle m'a fait gagner du temps. Utilise les custom instructions pour les règles qui doivent se faire oublier. Utilise un prompt file quand la tâche tient dans une commande de chat explicite. Utilise un skill quand le workflow a besoin de fichiers, de scripts ou d'être portable entre plusieurs agents. Si tu as encore envie de faire rentrer ce workflow dans des instructions toujours actives, c'est souvent le seuil où un skill ou un agent coûte moins cher qu'une règle permanente de plus.
