---
id: copilot-intro
order: 1
difficulty: beginner
tags: [copilot, ai-agents, github]
---

Tu travailles sur un projet. Tu sais exactement ce que tu veux construire, mais la moitié du temps passe à chercher la bonne syntaxe, à écrire des tests pour du code que tu as déjà conçu dans ta tête, à copier-coller du boilerplate que tu connais par cœur. GitHub Copilot existe pour absorber exactement cette partie du travail.

Mais "Copilot" recouvre plusieurs outils assez différents, et comprendre lequel fait quoi est la première chose à clarifier.

## Trois outils sous le même nom

**Les suggestions inline** sont ce à quoi la plupart des gens pensent quand ils entendent "Copilot". Tu commences à taper, Copilot propose une suite. Il regarde le fichier ouvert, tes imports, le nom de tes fonctions, et tente de deviner ce que tu vas écrire. C'est utile pour tout ce qui est répétitif : une fonction similaire à une autre, un pattern que tu as déjà utilisé, du boilerplate standard.

**Le chat** est une conversation textuelle avec le modèle, intégré dans ton éditeur ou dans le terminal. La différence avec les suggestions inline : tu contrôles le contexte explicitement. Au lieu que Copilot devine ce que tu veux, tu lui expliques. Tu peux lui demander de comprendre un bout de code, de proposer une refactorisation, d'expliquer pourquoi un test échoue. C'est là que l'outil commence à ressembler à un collaborateur plutôt qu'à un compléteur.

**Le mode agent** est une étape au-dessus encore. Copilot peut lire des fichiers, exécuter des commandes, modifier du code, créer des tests, et enchaîner plusieurs actions de façon autonome. Tu lui décris une tâche ; il la fait. C'est puissant, et c'est aussi là où le contexte devient critique : un agent sans instructions claires sur le projet prend des décisions qui peuvent être complètement à côté de la plaque.

## Ce que Copilot ne fera pas bien sans aide

Copilot n'a aucune mémoire d'une session à l'autre. À chaque conversation, il repart de zéro. Il ne sait pas que ton projet utilise `pnpm` plutôt que `npm`, que tu ne veux jamais de commits automatiques, que l'accessibilité est obligatoire sur tous les composants.

Si tu lui dis une fois, il s'en souvient le temps de la conversation. Si tu ne lui dis pas, il fait ses propres choix, qui sont souvent des choix génériques très raisonnables pour un projet inconnu — et donc potentiellement très mauvais pour le tien.

C'est le problème que `AGENTS.md` résout : un fichier de configuration que les agents Copilot lisent au démarrage et qui leur donne un contexte persistant sur le projet. Ce guide et les suivants t'expliquent comment le construire.

## La mauvaise utilisation la plus fréquente

La tentation naturelle est de n'utiliser Copilot que pour accélérer ce qu'on sait déjà faire. C'est un bon début, mais c'est sous-utiliser l'outil.

Le vrai gain vient quand on commence à déléguer des tâches qu'on _pourrait_ faire mais qui n'ont aucun intérêt intellectuel : écrire des tests pour une logique déjà pensée, générer la structure d'un nouveau composant, documenter une API, convertir des types. Ce sont des tâches qui prennent du temps, demandent de l'attention, et n'apportent rien à la réflexion. Copilot les fait bien.

Ce temps libéré va ailleurs : à l'architecture, aux décisions difficiles, aux parties du projet qui méritent vraiment qu'on y réfléchisse.

## Par où commencer

Si tu découvres l'outil, commence par les suggestions inline dans ton éditeur habituel. Observe comment le contexte local influence les propositions. Teste le chat pour poser des questions sur un bout de code existant.

Quand tu commences à voir des erreurs récurrentes (Copilot qui fait des choix qui ne correspondent pas à ton projet), c'est le signe qu'il est temps de mettre en place `AGENTS.md`. Le guide suivant couvre exactement ça.
