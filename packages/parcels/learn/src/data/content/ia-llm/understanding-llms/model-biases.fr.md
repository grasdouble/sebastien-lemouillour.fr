---
id: model-biases
order: 13
difficulty: beginner
tags: [LLM, biais]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous demandez des exemples de « bon leadership », et la réponse penche discrètement vers des figures masculines. Vous demandez le portrait d’un « développeur type », et le texte se rétrécit autour d’une seule culture, d’un seul âge, d’un seul parcours. Ce n’est pas une petite maladresse de formulation. C’est souvent un signe de **biais**, c’est-à-dire une inclinaison systématique des réponses, et pas juste une erreur isolée. Il faut apprendre ça tôt, parce que les sorties biaisées paraissent normales quand elles collent à des stéréotypes familiers.

## D’où vient le biais

Les LLMs apprennent à partir d’énormes corpus de langage humain, et le langage humain transporte des habitudes, des oublis et des préjugés. Des travaux comme [Stochastic Parrots](https://dl.acm.org/doi/10.1145/3442188.3445922) ont très tôt rappelé qu’en augmentant l’échelle des modèles, on augmente aussi l’échelle des motifs sociaux présents dans les données.

Le biais ne vient pas seulement du pré-entraînement. Il peut aussi apparaître dans les choix de filtrage, les consignes données aux annotateurs, les réglages de sécurité, et les décisions produit sur le type de réponse que le système doit privilégier. Un **jeu de données d’entraînement** est l’ensemble d’exemples utilisé pour apprendre au modèle. Si cet ensemble surreprésente certains groupes, en rend d’autres invisibles, ou reflète des discriminations historiques, le modèle peut reproduire ces déformations.

Le biais ne se réduit pas aux sorties offensantes. Il peut aussi prendre la forme d’une absence, d’une hypothèse par défaut, ou d’une qualité inégale selon les langues et les communautés.

## Pourquoi c’est difficile à repérer

Le biais est piégeux parce qu’un modèle peut sembler poli tout en restant très orienté. Une réponse peut éviter les insultes et continuer malgré tout à traiter certaines personnes comme la norme et d’autres comme des exceptions. Des évaluations larges comme [HELM](https://arxiv.org/abs/2211.09110) incluent des dimensions liées à l’équité précisément parce que la performance brute ne dit pas si un système se comporte de manière juste.

Je me méfierais aussi de l’idée rassurante selon laquelle « le dernier modèle a réglé le problème ». Il n’existe pas de correctif final pour le biais. Des cadres comme le [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) le traitent comme un problème de gestion du risque qui demande des mesures continues, de la gouvernance, et du jugement selon le contexte.

Même les règles de comportement comptent. Des documents comme la [Model Spec](https://modelspec.openai.com/) d’OpenAI montrent que le comportement d’un assistant dépend non seulement de ses données d’entraînement, mais aussi de règles explicites sur la manière dont il doit répondre.

## Ce que j’en ferais en pratique

Je traiterais toute réponse qui parle de personnes, de capacité, de risque, de culture, ou de comportement « typique » comme quelque chose à auditer, pas comme un texte à absorber passivement. Demandez quelles hypothèses la réponse fait. Demandez quel point de vue manque. Demandez si le cadrage changerait si la personne ou le groupe changeait.

Si le cas d’usage touche au recrutement, à l’éducation, à la santé, à la modération ou aux services publics, je monterais tout de suite le niveau d’exigence. C’est exactement là qu’un « petit » décalage devient un dommage réel.

Une règle pratique aide beaucoup : plus la sortie sert à juger des humains ou à répartir des opportunités, moins le « ça a l’air correct » est acceptable. Votre prochaine étape peut être très simple : prenez un prompt qui décrit un métier, une personnalité ou un groupe social, reformulez-le de trois façons, puis comparez les glissements de ton et d’hypothèses. C’est souvent le moyen le plus rapide de voir un biais qu’on aurait sinon laissé passer.
