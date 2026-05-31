---
id: generation-parameters
order: 20
difficulty: intermediate
tags: [llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

Quand un workflow passe d'un JSON propre à un résultat coupé ou absurde, beaucoup réécrivent le prompt. Moi, je regarde d'abord les paramètres de décodage. J'ai perdu trop d'heures à accuser le wording alors que le vrai bug venait d'une `temperature` laissée au hasard, d'une limite de tokens minuscule, ou d'un preset copié qui ne voulait pas dire la même chose chez un autre fournisseur.

## La première correction, c'est d'arrêter de faire confiance aux défauts

Les valeurs par défaut sont des choix produit, pas des bonnes pratiques universelles. Dans les [Messages examples](https://docs.anthropic.com/en/api/messages-examples) d'Anthropic, Claude Opus 4.7 et les versions suivantes refusent `temperature`, `top_p` et `top_k` hors valeur par défaut, alors que [Transformers strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies) documente le décodage greedy comme comportement par défaut et l'échantillonnage comme quelque chose qu'on active volontairement.

Quand j'ai besoin d'un pense-bête rapide sur le décodage, c'est ce tableau que je garde en tête avant de toucher à quoi que ce soit :

| Paramètre           | Ce qu'il contrôle                          | Recommandé pour les tâches structurées                                                                 | Recommandé pour les tâches créatives                                         |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `temperature`       | Le niveau d'aléatoire de l'échantillonnage | `0` à `0.2`                                                                                            | `0.7` à `0.9`                                                                |
| `top_p`             | La taille du noyau de sampling             | `1` — je n'y touche pas tant que je ne peux pas nommer un vrai problème de queue                       | `1` — je change d'abord la température                                       |
| `top_k`             | Le nombre maximum de tokens candidats      | N/A sur la plupart des API hébergées, donc je n'en fais pas un levier de base                          | `20` à `40` seulement sur des stacks auto-hébergées qui l'exposent           |
| `max_output_tokens` | La longueur de la sortie                   | Assez serré pour éviter de bavarder, assez large pour éviter la coupe                                  | Assez large pour laisser plusieurs idées se terminer                         |
| `stop`              | Les séquences d'arrêt                      | Utile pour garder le contrôle du format, mais je préfère toujours un schéma pour une structure stricte | Rarement nécessaire, sauf si je dois couper la sortie sur un marqueur précis |

## Chaque paramètre a son guide dédié

La `temperature`, le `top_p` et le `top_k` méritent chacun un examen plus attentif. Ce guide pose le cadre général ; les guides dédiés entrent dans les réglages concrets et les cas où chaque paramètre change vraiment quelque chose.

`max_output_tokens` et `stop` n'ont pas de guide séparé, mais ils ne sont pas des détails cosmétiques. Ils décident si le modèle a assez de place pour terminer et à quel endroit il peut s'arrêter. Une limite trop basse coupe silencieusement la réponse ; une séquence `stop` mal placée tronque un format attendu. Si j'ai besoin d'une structure stricte, je préfère un schéma à une séquence `stop` soi-disant astucieuse. Les [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) d'OpenAI rendent les refus détectables par programme, ce qui est plus sûr pour les automatisations que d'espérer qu'un prompt et une séquence d'arrêt coopèrent toujours.

## Un seul paramètre à la fois

Si tu ne peux pas nommer le problème précis qu'un paramètre corrige, ne touche pas à ce paramètre. Change la température en premier. Laisse `top_p` à `1` sauf si tu vois un vrai problème de queue. Monte `top_k` seulement sur des stacks auto-hébergées où aucun autre levier ne suffit. Des caps plus longs et des expériences plus larges mangent ton budget de tokens et te rapprochent des [limites fournisseurs](https://platform.openai.com/docs/guides/rate-limits) plus vite que le tuning n'apporte de valeur.
