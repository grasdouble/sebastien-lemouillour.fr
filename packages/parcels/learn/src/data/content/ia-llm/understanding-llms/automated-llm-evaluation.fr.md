---
id: automated-llm-evaluation
order: 28
difficulty: advanced
tags: [LLM, évaluation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Si tu ne lis que dix sorties à la main, des régressions finiront en production. Si tu fais confiance à un score agrégé produit par un juge automatique, des régressions finiront aussi en production. C'est la vérité inconfortable. L'évaluation automatisée devient indispensable dès que le volume monte, mais il est très facile d'automatiser le mauvais goût et d'appeler ça de la rigueur.

## Ce que l'automatisation fait bien

L'automatisation est excellente pour détecter les régressions, élargir la couverture et répéter les contrôles. Si tu connais l'échec que tu veux détecter, une machine peut le vérifier plus souvent et plus régulièrement qu'un rituel de revue humaine. C'est pour ça que j'aime une approche en couches : vérifications exactes ou de schéma pour les exigences dures, heuristiques spécifiques à la tâche pour la structure partielle, et juges LLM seulement pour le résidu flou.

C'est aussi la philosophie de [OpenAI Evals](https://github.com/openai/evals) : définir des cas de test, les rejouer en continu, et comparer des modèles ou des prompts dans un harness versionnable. La valeur n'est pas le framework en lui-même. La valeur, c'est que l'évaluation entre dans la boucle produit au lieu de rester un exercice de capture d'écran de dernière minute.

## Le pattern LLM-as-judge est puissant et glissant

Le pattern LLM-as-judge s'est imposé parce que beaucoup de critères de qualité sont difficiles à scorer mécaniquement. Le ton, la complétude, la fidélité aux instructions et l'utilité comparative profitent tous d'un jugement par modèle. Mais les modèles juges ne sont pas des arbitres neutres. Le [papier G-Eval](https://arxiv.org/abs/2303.16634) a montré qu'une grille structurée et un raisonnement explicité peuvent améliorer la corrélation avec les humains, ce qui est utile. Ça n'a pas supprimé les biais comme par magie.

Et ce point compte. Le [papier MT-Bench](https://arxiv.org/abs/2306.05685) a montré que des juges LLM puissants peuvent très bien marcher en comparaison par paires, tout en exposant des biais de position, de verbosité et d'auto-préférence. Du coup, mon réglage par défaut, c'est le jugement par paires avec des rubriques explicites dès que possible. Les notes absolues de 1 à 5 donnent de jolis dashboards et deviennent très vite bancales dans la pratique.

## Le RAG a besoin de ses propres métriques

Les systèmes augmentés par récupération sont l'endroit où une mauvaise automatisation devient particulièrement trompeuse. Une réponse finale peut sembler propre tout en étant ancrée sur les mauvais passages, ou l'étape de récupération peut être bonne pendant que la synthèse finale échoue. Ce sont des échecs différents et ils ne devraient pas être fusionnés dans un seul score.

C'est pour ça que des outils inspirés du [papier RAGAS](https://arxiv.org/abs/2309.15217) comptent. Ils séparent des dimensions comme la pertinence de la réponse, la précision du contexte, le rappel du contexte et la fidélité. Je validerais quand même ces métriques contre du jugement humain avant de leur faire confiance, mais elles sont bien meilleures que l'idée qu'un seul score de correction résume toute la pipeline.

## Le piège de la production

L'automatisation dérive. Les prompts changent, les modèles juges changent, les datasets vieillissent, et les équipes finissent par optimiser la métrique parce qu'elle est visible. À ce moment-là, la suite d'évaluation ne mesure plus la valeur utilisateur. Elle mesure la conformité au jeu de tests d'hier.

La réponse n'est pas moins d'automatisation. La réponse, c'est une automatisation adversariale complétée par des recalibrages humains réguliers. Garde un petit jeu relu manuellement, renouvelle les cas limites, inspecte les désaccords, et traite toute grosse variation de score avec méfiance tant que tu ne peux pas l'expliquer.

## Règle de décision

Automatise tout ce qui peut être formulé clairement et rejoué à faible coût. Utilise des juges LLM uniquement là où une vraie rubrique existe et où des contrôles humains ponctuels les gardent honnêtes. Si un score automatisé ne peut pas t'expliquer pourquoi un modèle a gagné, il n'est pas prêt à servir de barrière de release.
