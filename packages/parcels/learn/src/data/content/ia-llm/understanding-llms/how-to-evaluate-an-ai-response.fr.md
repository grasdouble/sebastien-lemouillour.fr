---
id: how-to-evaluate-an-ai-response
order: 15
difficulty: beginner
tags: [LLM, évaluation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le piège le plus facile, c’est de lire une réponse IA, de se sentir rassuré parce qu’elle est bien formulée, puis de passer à autre chose. Ça m’est déjà arrivé, et c’est exactement comme ça que de mauvais résultats finissent dans du travail réel. S’il ne fallait garder qu’une règle de débutant, ce serait celle-ci : ne demandez pas si une réponse « sonne bien ». Demandez si elle est bonne pour un travail précis.

## Partir du besoin, pas de l’impression

Une **évaluation** est une manière structurée de juger si une sortie répond à un besoin. Le [guide evals](https://platform.openai.com/docs/guides/evals) d’OpenAI l’explique de façon plus formelle : on définit une tâche, on exécute des cas de test, puis on inspecte les résultats.

La première question n’est donc jamais « Est-ce que c’est une bonne réponse ? » La vraie première question est « Bonne pour quoi ? » Un brouillon marketing, un résumé juridique, une réponse support, ou une explication pédagogique ne se jugent pas avec la même grille.

Je commencerais par écrire seulement deux ou trois critères. Un **critère** est une règle utilisée pour noter la réponse, par exemple l’exactitude factuelle, la complétude, le ton, ou la qualité des citations. Beaucoup de débutants fabriquent des checklists énormes. Je pense que c’est une erreur. Les petites grilles s’appliquent plus régulièrement.

## S’appuyer sur des preuves, pas sur une impression générale

Certaines tâches peuvent être comparées à une **vérité de référence**, c’est-à-dire une réponse correcte ou une source fiable déjà connue. Si vous l’avez, servez-vous-en. Si vous ne l’avez pas, définissez des signaux observables : est-ce que la réponse cite le bon document ? Respecte-t-elle le format demandé ? Évite-t-elle les affirmations non étayées ?

Des cadres d’évaluation plus larges comme [HELM](https://arxiv.org/abs/2211.09110) sont utiles parce qu’ils montrent que la qualité d’un modèle a plusieurs dimensions, pas un score magique unique. Le [papier G-Eval](https://arxiv.org/abs/2303.16634) rappelle aussi une chose importante : même quand l’IA aide à évaluer l’IA, la grille d’évaluation reste décisive.

En pratique, je séparerais les contrôles en deux groupes. Les contrôles durs sont ceux qu’on peut vérifier, comme les calculs, les citations, les champs obligatoires, ou des contraintes de politique interne. Les contrôles souples concernent la clarté, l’utilité, ou le ton. Les contrôles durs passent en premier. Une réponse brillante qui échoue sur un contrôle dur reste une mauvaise réponse.

## Tester les échecs qui vous inquiètent vraiment

L’évaluation progresse énormément quand on arrête d’échantillonner des prompts au hasard pour viser les vrais risques. Si vous craignez des sources inventées, testez des tâches riches en citations. Si vous craignez des biais nocifs, testez des prompts sensibles. Le [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) est précieux ici parce qu’il traite l’évaluation comme une partie de la gestion du risque, pas comme un concours d’élégance.

Je comparerais aussi des versions entre elles. Une seule réponse apprend peu. Cinq réponses comparables, notées avec la même grille, apprennent beaucoup plus.

## La règle que j’utiliserais à chaque fois

J’évaluerais une réponse IA dans cet ordre : d’abord l’exactitude, ensuite l’adéquation à la tâche, puis la clarté. Cet ordre compte. Une absurdité très claire reste une absurdité.

Si vous ne gardez qu’une habitude, prenez celle-ci : avant d’accepter une réponse, écrivez une phrase qui dit comment elle pourrait échouer. Puis cherchez volontairement cet échec. Votre prochaine étape peut être simple et très utile : choisissez une tâche IA récurrente, définissez trois critères, notez cinq réponses, puis regardez où votre confiance initiale vous a trompé. C’est à ce moment-là que l’évaluation cesse d’être un mot abstrait pour devenir une vraie compétence.
