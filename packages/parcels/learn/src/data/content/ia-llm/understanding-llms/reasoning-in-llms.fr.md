---
id: reasoning-in-llms
order: 19
difficulty: intermediate
tags: [LLM, raisonnement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le mode d’échec le plus agaçant d’un LLM, ce n’est pas le non-sens complet. C’est la réponse propre, détaillée, convaincante, et pourtant fausse. C’est pour ça que je ne traite pas le “raisonnement” comme une ambiance ou un badge marketing. Je le traite comme une capacité qu’il faut acheter, déclencher et vérifier avec soin.

## Le raisonnement n’est pas un simple interrupteur

Un modèle raisonne bien quand trois choses s’alignent: le modèle de base possède la capacité latente, le prompt expose correctement la structure de la tâche, et le budget d’inférence laisse assez de place pour explorer des étapes intermédiaires. Le papier sur le [chain-of-thought](https://arxiv.org/abs/2201.11903) a montré que de grands modèles peuvent mieux réussir sur des tâches multi-étapes quand on leur demande de produire un raisonnement intermédiaire. Le résultat était important, mais il a aussi créé une mauvaise habitude: demander à tous les modèles de “penser étape par étape”, même quand la tâche n’en a pas besoin.

Je ne ferais pas ça par défaut. Un raisonnement visible et long augmente la consommation de tokens, la latence et le coût de revue. Sur les API où les tokens de sortie sont fortement facturés, le coût est immédiat. Sur des workflows sensibles, cela peut aussi exposer des étapes intermédiaires qu’on n’avait pas forcément envie de stocker ou d’afficher.

## Ce que le prompting apporte réellement

Le prompting aide surtout quand la tâche se décompose bien et que la réponse peut être vérifiée. Le résultat [self-consistency](https://arxiv.org/abs/2203.11171) en est un bon exemple: on échantillonne plusieurs chemins de raisonnement, puis on retient la réponse de consensus. Cher ? Oui. Utile pour les maths, les tâches symboliques et les problèmes de décision structurés ? Oui aussi.

Quand la tâche demande des preuves externes ou une action, je préfère le schéma [ReAct](https://arxiv.org/abs/2210.03629) à un raisonnement purement interne. Le modèle réfléchit un peu, appelle un outil, inspecte le résultat, puis continue. C’est généralement plus fiable que de payer pour un long monologue déconnecté du réel.

Le comportement du fournisseur compte aussi. Le [guide OpenAI](https://platform.openai.com/docs/guides/reasoning) sur le raisonnement et la [documentation Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking) sur l’extended thinking posent le compromis noir sur blanc: plus de budget de raisonnement peut améliorer la qualité, mais augmente aussi la latence et le coût. Ça colle très bien à l’usage réel. Sur des charges à fort volume, on sent vite la taxe.

## Ce que je choisirais en pratique

En production, je préfère des réponses visibles courtes, combinées soit à un support de raisonnement caché côté fournisseur, soit à un usage explicite d’outils que je peux auditer. Je ne demande un long raisonnement en langage naturel que lorsque ce raisonnement fait partie du livrable lui-même, par exemple pour du tutorat ou un exemple corrigé.

Je ne confonds pas non plus raisonnement et connaissance. Un modèle ne peut pas raisonner jusqu’à un fait qu’il ne possède pas. Si la réponse dépend d’un prix à jour, d’un changement de politique ou d’une ligne en base de données, la bonne solution est la récupération d’information ou l’accès à un outil, pas un prompt plus sophistiqué pour “réfléchir plus fort”.

Ma règle: payez du raisonnement supplémentaire seulement sur des tâches vraiment multi-étapes et vérifiables de l’extérieur. Sinon, on paie souvent des suppositions plus longues, pas de meilleures décisions.
