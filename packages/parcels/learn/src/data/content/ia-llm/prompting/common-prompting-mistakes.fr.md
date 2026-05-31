---
id: common-prompting-mistakes
order: 3
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Vous avez demandé une réponse courte, et vous avez reçu une mini conférence. Puis vous avez ajouté « sois concis s'il te plaît », et la réponse suivante est devenue encore plus bizarre. Bienvenue dans le prompting débutant.

La plupart des mauvais prompts échouent pour des raisons très banales, pas pour des raisons mystérieuses. Ce qu'il y a de rassurant, c'est que la documentation officielle d'[OpenAI](https://developers.openai.com/api/docs/guides/prompting), de [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies) et d'[Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) répète la même idée : donnez au modèle une tâche claire, assez de contexte, et des contraintes qu'il peut réellement suivre.

Voici le tableau mental que j'utilise quand un prompt continue à produire du flou au lieu d'un résultat exploitable.

| Erreur                                             | Pourquoi ça rate                                                                                             | Meilleure approche                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Trop vague                                         | Le modèle doit deviner ce que « mieux » veut dire, donc il se fabrique sa propre cible.                      | Donnez un verbe d'action et un objectif : `Réécris cet email pour qu'il paraisse plus chaleureux auprès d'un prospect hésitant.` |
| Contexte absent                                    | La réponse dérive parce que le public, l'enjeu ou les contraintes ne sont jamais écrits noir sur blanc.      | Ajoutez le vrai décor : audience, échéance, ton attendu, produit, critères de décision.                                          |
| Trop de demandes à la fois                         | Des objectifs qui se battent entre eux donnent une sortie moitié résumé, moitié réécriture, moitié bouillie. | Découpez en étapes ou hiérarchisez : d'abord l'analyse, ensuite la réécriture.                                                   |
| Aucun format de sortie                             | Même une bonne réponse devient pénible si elle arrive dans la mauvaise forme.                                | Demandez dès le départ des puces, un tableau, du JSON, ou `exactement 3 suggestions`.                                            |
| Pas d'exemple                                      | Une consigne abstraite laisse beaucoup trop de place à l'interprétation.                                     | Montrez un exemple court du ton, de la structure ou du format de label attendu.                                                  |
| Rôle non défini                                    | Le modèle retombe sur une posture d'assistant générique, souvent trop large pour être utile.                 | Donnez un rôle utile : `Agis comme un assistant de triage support pour une équipe SaaS.`                                         |
| Prendre la première réponse pour la version finale | Le premier jet est souvent orienté dans la bonne direction, mais encore bancal.                              | Itérez une ou deux fois, puis réécrivez le prompt au lieu de le rafistoler sans fin.                                             |

### Erreur 1 : demander une ambiance au lieu d'une tâche

« Améliore ça » n'est pas vraiment une tâche. Mieux comment, pour qui, et selon quel critère ? Le modèle inventera volontiers un objectif si vous ne lui en donnez pas.

Je réécris presque toujours les demandes vagues sous forme de verbes. « Réécris cet email pour qu'il paraisse plus chaleureux. » « Résume cet article pour un CTO. » « Classe ces tickets par urgence. » Les verbes donnent au modèle quelque chose de concret à optimiser.

### Erreur 2 : garder le contexte important dans votre tête

Le débutant connaît le détail manquant, mais le modèle ne le connaît pas. Vous savez peut-être que la cible est un client non technique, que l'échéance est demain, ou qu'un ton juridique est obligatoire. Si vous gardez ce contexte pour vous, la sortie va dériver.

### Erreur 3 : empiler trop d'objectifs d'un coup

Un de mes prompts préférés, au sens ironique du terme, ressemble à ça : explique, résume, critique et réécris le texte, rends-le drôle, tout en restant formel. Techniquement, le modèle peut essayer. En pratique, vous obtenez de la bouillie.

Ce genre de réécriture corrige souvent plus de choses que trois messages de suivi supplémentaires.

```text
Prompt faible :
Analyse ce texte de landing page et améliore-le.

Meilleur prompt :
Analyse ce texte de landing page pour la clarté et la confiance.
Public : acheteurs SaaS débutants.
Donne exactement 3 problèmes, puis réécris le titre et le sous-titre.
Ne change pas le positionnement produit.
```

### Erreur 4 : traiter la première réponse comme une vérité finale

La première réponse est souvent un brouillon, pas un verdict. Le prompting est itératif, ce qui veut simplement dire qu'on affine l'instruction en fonction de ce qui revient. Anthropic dit la même chose dans ses [bonnes pratiques](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) : la clarté, les exemples et le contrôle du format battent les formulations prétendument malines.

En revanche, je déconseille de discuter en rond avec le modèle. Après deux réponses brouillonnes, je préfère réécrire tout le prompt depuis zéro. C'est plus rapide, et franchement moins agaçant.

### Erreur 5 : oublier le format de sortie

Si vous voulez des puces, dites-le. Si vous voulez du JSON pour du code ou de l'automatisation, demandez directement une structure. Le guide [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) d'OpenAI existe précisément pour ça. Beaucoup de gens sautent cette étape parce qu'elle leur paraît évidente. Elle est évidente pour vous, pas pour le modèle.

Ma règle est assez brutale : si un prompt produit deux réponses confuses de suite, j'arrête de le rafistoler avec des micro-corrections et je le réécris avec une tâche claire, du vrai contexte et un format explicite. Si vous voulez commencer par l'approche la plus simple, le guide suivant présente le zero-shot prompting, et c'est généralement là que je démarre.
