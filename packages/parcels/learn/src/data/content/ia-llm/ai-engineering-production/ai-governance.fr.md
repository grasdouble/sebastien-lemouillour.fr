---
id: ai-governance
order: 20
difficulty: advanced
tags: [LLM, governance, compliance, NIST]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Personne ne vous interroge sur votre chaîne de prompts pendant un pilote. Les questions arrivent après le passage achats, juridique ou la première revue sécurité : qui a approuvé ce cas d'usage, quelles données touchent le modèle, et comment on l'éteint vite si le comportement dérive ? C'est là que beaucoup d'équipes découvrent qu'elles ont une démo IA, pas une gouvernance IA.

La vraie gouvernance, ce n'est pas un comité qui collectionne des slides. Ce sont des droits de décision branchés dans la livraison. L'[AI Act européen](https://artificialintelligenceact.eu/) impose des obligations fondées sur le niveau de risque et le cas d'usage. Le [NIST AI RMF](https://www.nist.gov/system/files/documents/2023/01/26/AI%20RMF%201.0.pdf) donne une structure praticable : cartographier, mesurer, piloter, gouverner. Ces cadres sont utiles parce qu'ils forcent l'attribution claire des responsabilités. Quelqu'un doit posséder la classe de modèle, la frontière de données, le standard d'évaluation et le kill switch.

Ma préférence va à un petit groupe de revue avec une vraie délégation, pas à un cirque d'architecture mensuel. Le produit porte l'impact utilisateur. La sécurité porte les scénarios d'abus. Le juridique ou la conformité portent les contraintes réglementaires. La plateforme porte l'accès aux modèles et la journalisation. Ce groupe doit revoir les familles de modèles, les catégories de données, les niveaux d'automatisation et les actions irréversibles. Il ne doit pas perdre sa semaine à approuver des reformulations de prompts.

La politique n'existe vraiment que lorsqu'elle apparaît dans la configuration et dans les logs. Un registre de modèles, c'est banal, et c'est précisément pour ça que ça fonctionne.

```yaml
use_case: support-triage
owner: customer-platform
risk_level: medium
allowed_models:
  - gpt-4.1-mini
  - mistral-large
data_classes:
  - public
  - customer-account-metadata
human_review_required: false
tool_actions:
  - create_ticket
kill_switch: support-triage-disabled
```

Il faut aussi une gouvernance du comportement fournisseur. Si votre assistant peut générer un contenu nocif ou automatiser un flux interdit, votre revue interne n'annule pas les [usage policies](https://openai.com/policies/usage-policies). Et si votre système accepte des tool calls ou du contenu de récupération non fiable, le modèle de menace du [Top 10 OWASP LLM](https://owasp.org/www-project-top-10-for-large-language-model-applications/) doit entrer dans la gouvernance, pas seulement dans les tests sécurité.

La partie que la plupart des équipes sautent, c'est la preuve. Chaque sortie importante devrait être rattachée à une version de modèle, une version de prompt, un résultat d'évaluation et un owner. Sans lignage, vous ne pouvez pas répondre à la seule question qui compte pendant un incident : qu'est-ce qui a changé ?

Ma règle de décision est brutale : si une équipe ne peut pas vous dire en moins d'une minute quel modèle tourne, quelle classe de données il voit, qui en est responsable et comment le désactiver, cette fonctionnalité n'est pas assez gouvernée pour être mise en ligne.
