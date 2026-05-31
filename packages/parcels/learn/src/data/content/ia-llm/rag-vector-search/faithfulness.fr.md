---
id: faithfulness
order: 23
difficulty: advanced
tags: [rag, evaluation]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

La réponse semble soignée, cite le bon document, et glisse quand même une affirmation non fondée qui peut mettre votre équipe en difficulté. C'est le mode d'échec qu'on appelle vaguement « hallucination ». Dans un système RAG, je préfère un mot plus précis : fidélité.

La fidélité (_faithfulness_) demande si les affirmations contenues dans la réponse sont réellement soutenues par les preuves récupérées. Pas vaguement alignées, pas émotionnellement plausibles — soutenues. C'est pour ça que je ne fais pas confiance aux validations globales de type pouce-levé. Elles ratent exactement ce qui casse les systèmes en production : une phrase confiante que le contexte n'a jamais justifiée.

Le meilleur modèle mental que je connaisse vient de [FactScore](https://arxiv.org/abs/2305.14251), qui décompose une génération en faits atomiques et vérifie si chacun est soutenu par une source fiable. C'est la bonne granularité. Une réponse peut être globalement utile et contenir quand même une affirmation inacceptable. Si vous ne scorez que la réponse en bloc, vous ne la verrez pas.

Pour les boucles automatisées, la [métrique Ragas faithfulness](https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/faithfulness/) est un bon point de départ car elle fournit des métriques de type fidélité que vous pouvez exécuter de manière répétée, et [TruLens](https://www.trulens.org/) est utile quand vous voulez lier la solidité des réponses aux traces et au contexte récupéré. J'utilise les deux de la même façon : juger le support au niveau de l'affirmation, puis inspecter les échecs avec les chunks originaux sous les yeux.

Ce que la plupart des tutoriels passent sous silence : les citations ne sont pas des preuves. Un modèle peut mentionner un ID de source et quand même fabriquer l'affirmation réelle. Formater une citation est facile. L'alignement avec les preuves, c'est la partie difficile.

C'est pourquoi j'impose un contrat de réponse plus strict avant de mettre en production :

```yaml
generation_policy:
  allow_inference_beyond_context: false
  sentence_level_citations: true
  answer_unknown_when_evidence_missing: true
verification:
  split_into_atomic_claims: true
  mark_unsupported_claims: true
  fail_if_unsupported_claim_rate_gt: 0.03
```

Cette politique semble sévère jusqu'à ce qu'on travaille dans un domaine où les erreurs ont des conséquences. Les outils de connaissance interne peuvent parfois tolérer un peu de dérive. Les systèmes juridiques, médicaux, financiers et de politique client ne le peuvent pas.

Mon seuil est volontairement brutal : si les affirmations non soutenues dépassent quelques pourcents sur vos flux critiques, vous n'êtes pas « presque là ». Vous entraînez vos utilisateurs à ne plus faire confiance au produit, et ce dommage est bien plus difficile à réparer que la latence ou l'interface.
