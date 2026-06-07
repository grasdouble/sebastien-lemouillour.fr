---
id: common-prompting-mistakes
order: 3
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-07
updatedAt: 2026-06-07
---

Vous avez demandé une réponse courte, et vous avez reçu un pavé. Puis vous avez demandé quelque chose de concis, et la réponse suivante est devenue encore plus étrange. Quand ça arrive, le modèle ne fait pas du théâtre, il devine.

Ce qui rassure, c'est que la documentation officielle répète presque toujours la même chose. Le [guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering), le [guide Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies) et le [guide Azure](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) recommandent tous la même habitude : donner au modèle une tâche claire, le contexte qu'il ne peut pas deviner, et des limites qu'il peut réellement suivre.

Imaginez le modèle comme un nouveau collègue qui lit un post-it. Il peut beaucoup aider, mais il ne lit pas dans votre tête.

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

« Améliore ça » semble clair dans votre tête, mais cela laisse le modèle inventer l'objectif. Améliorer pour qui ? Selon quel critère ?

Le réflexe le plus sûr consiste à transformer la demande en verbe plus cible. « Réécris ce message pour qu'il soit plus apaisant pour un client mécontent. » « Résume cet article pour un responsable non technique. » « Classe ces tickets de support par urgence. » Je choisirais cette version presque à chaque fois.

### Erreur 2 : garder le contexte utile dans votre tête

Quand on débute, on connaît souvent le détail manquant sans penser à l'écrire. Le public, l'échéance, le ton et les limites du résultat restent dans votre tête, donc la réponse dérive.

Si la tâche dépend d'un point de vue précis, nommez-le. Un rôle, c'est simplement le métier ou la posture que vous voulez faire jouer au modèle, par exemple recruteur, professeur ou agent de support. Le [guide Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) insiste lui aussi sur des instructions explicites et des exemples pour cette raison.

### Erreur 3 : demander trop de métiers d'un coup

Un prompt qui dit « explique, résume, critique, réécris et rends ça drôle » ressemble un peu à une demande faite à une seule personne pour être éditeur, humoriste et juriste dans la même minute. Le modèle peut essayer, mais le résultat finit souvent en bouillie.

Voici le genre de réécriture qui évite souvent trois messages de suivi pénibles.

```text
Prompt faible :
Analyse cette page et améliore-la.

Meilleur prompt :
Analyse ce texte de page pour la clarté et la confiance.
Public : personnes qui achètent un logiciel pour la première fois.
Donne exactement 3 problèmes.
Puis réécris le titre et le sous-titre.
Ne change pas la promesse du produit.
```

Cela fonctionne parce que la tâche est étroite, le public est nommé, et la sortie a une limite.

### Erreur 4 : oublier de nommer la forme de la réponse

Même une réponse utile devient pénible quand elle arrive dans le mauvais format. Si vous voulez des puces, demandez des puces. Si vous voulez du JSON, c'est-à-dire un format texte que d'autres outils lisent facilement, demandez du JSON. Si vous voulez exactement trois suggestions, dites exactement trois.

C'est aussi l'idée derrière [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) : quand votre application a besoin d'un schéma prévisible, c'est-à-dire d'une structure fixe avec des champs nommés, mieux vaut demander ce schéma que croiser les doigts pour que le modèle devine la bonne forme.

### Erreur 5 : traiter la première réponse comme la dernière

Le prompting est itératif, ce qui veut simplement dire qu'on regarde un premier brouillon, qu'on repère ce qui cloche, puis qu'on resserre l'instruction. C'est normal, pas le signe que vous êtes mauvais dans cet exercice.

Ma position est simple : faites une ou deux réécritures propres, puis arrêtez de rafistoler. Si le modèle rate encore la cible après la deuxième réécriture, remettez le prompt à zéro au lieu d'empiler les retouches.
