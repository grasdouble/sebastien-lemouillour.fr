---
id: model-biases
order: 13
difficulty: beginner
tags: [LLM, biais]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Vous demandez un « bon leader », et la réponse glisse doucement vers un homme en costume. Vous demandez le portrait d’un « développeur type », et le modèle oublie d’un coup des pays entiers, des âges, et des parcours pro. Ce genre de décalage, c’est ce qu’on appelle un **biais** : une inclinaison répétée des réponses, pas juste une mauvaise sortie isolée. Je pense qu’il faut l’apprendre tôt, parce que le biais arrive souvent avec un ton calme et serviable.

## Là où le biais commence

Les LLMs apprennent sur d’immenses collections de textes humains, et ces textes transportent déjà des stéréotypes, des angles morts, et de vieux rapports de force. Le papier [Stochastic Parrots](https://dl.acm.org/doi/10.1145/3442188.3445922) l’a dit sans détour : quand on augmente l’échelle des modèles de langage, on augmente aussi l’échelle des motifs enfouis dans les données.

Le biais ne s’arrête pas au pré-entraînement. Le papier [InstructGPT](https://arxiv.org/abs/2203.02155) montre que le comportement est aussi remodelé par des démonstrations et des classements rédigés par des humains, ce qui veut dire que les choix de réglage ultérieurs peuvent renforcer certaines préférences et en adoucir d’autres. Un **jeu de données d’entraînement** est l’ensemble d’exemples utilisé pour apprendre au modèle. Si cet ensemble surreprésente certains groupes, en rend d’autres moins visibles, ou reflète des discriminations passées, le modèle peut apprendre ces déformations comme si elles étaient ordinaires.

C’est pour ça que je ne réduirais pas le biais aux insultes ou aux formulations ouvertement offensantes. Il peut aussi se voir dans qui est traité comme la norme, dans quel parcours paraît « normal », ou dans quelles perspectives disparaissent sans bruit.

## Pourquoi une réponse polie peut rester biaisée

Le biais est difficile à repérer parce qu’un modèle peut sembler prudent tout en penchant dans une direction. Une réponse peut éviter les insultes et continuer à présenter certaines personnes comme la norme et d’autres comme des exceptions. [HELM](https://arxiv.org/abs/2211.09110) inclut des évaluations liées à l’équité précisément parce que de bons scores bruts ne disent pas si un système traite les personnes de manière équitable.

Je me méfie du récit rassurant selon lequel le dernier modèle aurait « réglé » le biais. Le [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) traite le biais nocif comme un risque à gérer en continu, pas comme un bug avec un correctif final. C’est la position à laquelle je fais confiance : des contrôles réguliers valent mieux qu’un grand soupir de soulagement.

Si vous voulez la version produit de cette idée, la [Model Spec](https://model-spec.openai.com/) d’OpenAI montre que le comportement d’un assistant dépend non seulement des données d’entraînement, mais aussi de règles explicites sur la manière dont le système doit répondre.

## Ce que je ferais en pratique

Je traiterais toute réponse qui parle de personnes, de capacité, de culture, de crime, de santé, ou de comportement « typique » comme quelque chose à auditer, pas comme un texte à absorber passivement. Demandez quelle hypothèse la réponse fait. Demandez qui manque. Demandez si le cadrage change quand on remplace le groupe décrit.

Il y a une limite importante : un test rapide au prompt ne prouve pas qu’un modèle est juste. Il aide seulement à repérer des décalages flagrants. Si le cas d’usage touche au recrutement, à l’éducation, aux soins, à la modération, au crédit, ou aux services publics, je monterais tout de suite le niveau d’exigence, parce que c’est exactement là qu’un « petit » biais peut devenir un vrai dommage.

Si vous voulez une prochaine étape, prenez un prompt sur un métier ou un groupe social, reformulez-le de trois façons, puis comparez ce qui change dans le ton, la prudence, et les hypothèses par défaut. Ma règle est simple : si la sortie sert à classer des personnes ou à distribuer des opportunités, une seule réponse non contrôlée est déjà trop risquée.
