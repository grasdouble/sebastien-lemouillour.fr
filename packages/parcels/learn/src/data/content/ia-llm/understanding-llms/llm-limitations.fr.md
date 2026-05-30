---
id: llm-limitations
order: 14
difficulty: beginner
tags: [LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le moment le plus rude quand on débute, c’est souvent celui où l’on découvre qu’un modèle peut sembler brillant tout en échouant sur des choses qu’on croyait faciles. Il peut expliquer un concept, puis mal compter, oublier une phrase importante, ou inventer une référence. Cela ne veut pas dire que les LLMs sont inutiles. Cela veut dire qu’ils ont des limites, et qu’on les utilise bien seulement quand on les respecte au lieu de les traiter comme des défauts provisoires.

## Ils génèrent du langage, pas une vérité garantie

Un LLM est un système entraîné à prédire du texte probable. Cela le rend fort pour rédiger, reformuler, résumer et repérer des motifs dans le langage. En revanche, cela n’en fait pas automatiquement une source de vérité vérifiée. Le [rapport GPT-4](https://arxiv.org/abs/2303.08774) documente des capacités impressionnantes, mais il parle aussi de limites et de comportements peu fiables.

C’est la première limite que je retiendrais : une bonne réponse n’est pas la même chose qu’une réponse correcte. Si la tâche dépend de faits, de sources, de calculs, ou d’informations à jour, le modèle peut avoir besoin d’aide extérieure.

Cette aide vient souvent d’outils ou de récupération documentaire. La documentation [tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) d’Anthropic montre comment un modèle peut appeler des systèmes externes au lieu de deviner, et le [papier RAG](https://arxiv.org/abs/2005.11401) explique la génération augmentée par récupération de documents, où le modèle répond à partir de sources fournies.

## Ils sont limités par le contexte et l’attention

Même avant de se tromper sur le fond, un modèle peut simplement perdre le fil de ce qui compte. Une **fenêtre de contexte** est la quantité de texte tokenisé qu’un modèle peut prendre en compte dans une requête. Les longues fenêtres aident, mais ne règlent pas tout. [Lost in the Middle](https://arxiv.org/abs/2307.03172) montre que des informations enfouies dans de longs contextes peuvent être moins bien exploitées.

C’est un piège fréquent chez les débutants. On colle tout parce qu’on a peur d’oublier un détail important. Moi, je ferais plutôt l’inverse : réduire et hiérarchiser. Les modèles s’en sortent souvent mieux avec des preuves plus propres qu’avec une pile de texte plus grande.

## Ils sont inégaux, pas uniformément mauvais

Une autre limite, c’est l’inconstance. Le même modèle peut produire une excellente réponse une fois, puis une réponse médiocre juste après. De petites variations de formulation peuvent changer le résultat. Certaines tâches sont faciles pour un modèle et maladroites pour un autre. Il faut donc tester précisément le comportement qui vous intéresse au lieu de se fier à sa réputation générale.

Je n’attendrais pas non plus d’un seul modèle qu’il soit aussi bon partout : raisonnement, nuances multilingues, formatage, sécurité, récupération d’information, connaissance métier. L’étiquette « généraliste » est pratique, mais les systèmes réels gardent des angles morts.

## Ce que je ferais avec cette idée en tête

Je classerais les tâches en deux groupes. Premier groupe : brouillons à faible risque, idées, reformulations, résumés. Deuxième groupe : faits à fort enjeu, décisions, conformité, mathématiques, médecine, droit, ou tout contexte où une erreur coûte de l’argent ou de la confiance. Là, je partirais du principe qu’il faut vérifier ou utiliser un autre outil.

Une règle aide : avant de faire confiance à une réponse, demandez-vous quel mode d’échec vous ferait le plus de tort. Si vous savez nommer ce risque, vous pouvez souvent concevoir un contrôle adapté. Votre prochaine étape peut être simple : choisissez une tâche que vous confiez aujourd’hui à l’IA presque automatiquement, puis notez la limitation la plus susceptible de la faire dérailler. Cette habitude vaut bien plus qu’une liste abstraite de précautions.
