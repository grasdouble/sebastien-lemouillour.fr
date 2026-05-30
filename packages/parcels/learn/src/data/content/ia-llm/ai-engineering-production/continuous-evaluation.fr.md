---
id: continuous-evaluation
order: 17
difficulty: advanced
tags: [LLM, evaluation, CI, Braintrust, DeepEval]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton chatbot marchait bien vendredi. Lundi, après un ajustement de prompt, un changement de version modèle et une modif de config retrieval, il répond maintenant faux sur la politique de remboursement. Personne ne l'a vu avant l'arrivée des tickets support. C'est exactement pour ça que l'évaluation continue existe.

Ça n'a de sens que si tu livres de l'IA à de vrais utilisateurs. Si tu es encore en prototype, reviens plus tard. L'évaluation a un coût d'entretien, et il faut le payer seulement quand les changements de prompt, de modèle et de retrieval arrivent assez souvent pour créer un vrai risque de régression.

Ce qui m'intéresse avant tout, c'est de transformer la qualité floue en porte de release. "En staging ça avait l'air mieux" n'est pas un process. Une suite d'evals vivante, reliée aux pannes de production, c'est un process. Concrètement, chaque incident important devrait créer un nouveau cas de test ou renforcer un cas existant. Si ton jeu d'evals est déconnecté des incidents, il finira en benchmark décoratif.

Je ne veux pas d'un score géant unique. Je veux des coupes : factualité, respect des politiques, validité des sorties structurées, choix d'outil, comportement multilingue, et budgets de latence ou de coût. [OpenAI Evals](https://github.com/openai/evals) est utile pour comprendre la structure d'un benchmark. [Braintrust](https://www.braintrust.dev/docs) est excellent quand tu veux du suivi d'expériences et du versioning de datasets autour de ces benchmarks. [DeepEval](https://docs.confident-ai.com/) est ce que je prends quand je veux des assertions pilotées par le code dans la CI. [Promptfoo](https://promptfoo.dev/docs/intro) est très bon quand il faut comparer des matrices prompt/modèle sans construire une plateforme maison.

Le piège, c'est de sur-automatiser trop tôt les jugements subjectifs. Utilise des evals notées par modèle quand elles sont peu coûteuses et assez stables, mais garde un jeu réduit revu par des humains pour les flux à fort impact comme le pricing, le juridique ou les frontières d'autorisation. Un auto-grader bruité reste utile s'il détecte une dérive sur la même dimension tous les jours. Il devient inutile dès que l'équipe le traite comme une vérité absolue.

Je sépare aussi les evals rapides des evals lentes. Les rapides tournent sur chaque pull request. Les suites plus lentes et plus riches tournent avant release ou après un gros changement provider. Si tout prend 45 minutes, les ingénieurs finiront par contourner la porte au lieu de lui faire confiance.

Voici le contrat de release que j'aime rendre explicite.

```yaml
evaluation-gates:
  pull-request:
    - name: structured-output
      threshold: 0.98
    - name: tool-selection
      threshold: 0.95
    - name: safety-refusal
      threshold: 1.00

  pre-release:
    - name: multilingual-support
      threshold: 0.90
    - name: policy-adherence
      threshold: 0.95
    - name: cost-per-task
      threshold: 0.35
```

Ma règle : si un changement de prompt ou de modèle ne peut pas nommer la tranche d'eval qu'il est censé améliorer, ainsi que le seuil de rollback s'il dégrade le résultat, alors il n'est pas prêt pour du trafic de production.
