---
id: structure-of-a-good-prompt
order: 2
difficulty: beginner
tags: [prompting, tokens, llm]
publishedAt: 2026-06-07
updatedAt: 2026-06-07
---

La boîte vide du chat est trompeuse. Elle vous pousse à écrire un paragraphe flou, puis le modèle, c'est-à-dire l'IA qui répond, traite surtout la version qu'il a devinée au lieu de celle que vous aviez en tête.

Un **prompt**, c'est l'instruction que vous envoyez à ce modèle. Pour un réflexe simple de débutant, je recommande quatre blocs : la **tâche**, le **contexte**, les **contraintes** et la **sortie**. Ce n'est pas une loi officielle, juste un raccourci pratique aligné avec le [guide OpenAI](https://developers.openai.com/api/docs/guides/prompt-guidance) : décrire l'objectif, partager la matière utile, poser les contraintes et dire ce que la réponse finale doit contenir. Avec ça, le prompting ressemble moins à un jeu de devinette et plus à un petit bon de commande.

### 1. Commencez par la tâche

La **tâche**, c'est le travail à accomplir. Mettez-la en premier. Le [guide Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) revient souvent à des instructions claires, et c'est important parce que les modèles suivent souvent la demande telle qu'elle est formulée.

J'aime écrire la tâche sous forme de verbe : expliquer, comparer, résumer, classer, réécrire. « Aide-moi avec ça » sonne gentiment, mais ça laisse trop de place au hasard. Si vous hésitez sur le bon verbe, demandez-vous simplement ce que la réponse finale doit vous permettre de faire.

Ça règle une première source de flou, mais un verbe clair ne dit pas encore dans quelle situation vous vous trouvez.

### 2. Ajoutez le contexte sur lequel il doit s'appuyer

Si la tâche dit quoi faire, le **contexte** dit sur quoi s'appuyer. Le [guide Azure](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/prompt-engineering) sépare les instructions du contenu sur lequel le modèle doit travailler, et c'est un modèle mental très utile quand on débute.

Dites pour qui la réponse est écrite, sur quel matériau le modèle doit s'appuyer et dans quelle situation vous êtes. Si vous sautez cette étape, le modèle remplit les trous avec des suppositions plausibles. Parfois ce n'est pas grave, mais dès que la demande compte, c'est souvent là que la confusion commence.

Ça retire beaucoup de suppositions, mais il reste encore de la place pour des réponses trop longues, trop vagues ou trop risquées.

### 3. Posez les contraintes avant que le modèle improvise

Les **contraintes**, ce sont les garde-fous : longueur, ton, points obligatoires, choses interdites, ou limites du type « n'invente pas de données ». Le [guide Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies) commence par des instructions claires et précises, donc je recommande vraiment d'annoncer vos limites et le format attendu dès qu'ils comptent.

Cette structure améliore la clarté, pas la vérité. Si votre texte source est faible ou absent, un prompt bien rangé peut quand même produire une erreur bien rangée.

Avant d'écrire la demande complète, ce mini squelette vous donne simplement les cases à remplir :

```text
Tâche :
Contexte :
Contraintes :
Sortie :
```

Quand je veux éviter les erreurs prévisibles, j'élargis mentalement ce squelette. Tâche, contexte, contraintes et sortie font l'essentiel du travail. Le rôle et les exemples sont facultatifs, mais c'est souvent ce qui fait la différence entre une réponse correcte et une que vous pouvez vraiment réutiliser.

| Composant     | Objectif                                                                 | Mauvais exemple                     | Bon exemple                                                               |
| ------------- | ------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------- |
| Rôle          | Définir l'angle du modèle quand l'expertise ou le positionnement compte. | « Sois intelligent. »               | « Agis comme un ingénieur senior qui relit une pull request. »            |
| Tâche         | Dire quel travail doit être fait, idéalement avec un verbe.              | « Aide-moi avec la mise en cache. » | « Explique ce qu'est la mise en cache à un développeur frontend junior. » |
| Contexte      | Fournir les faits que le modèle ne peut pas deviner de façon fiable.     | « Tu connais déjà l'app. »          | « C'est une SPA React avec des pages produit lentes et aucun CDN. »       |
| Contraintes   | Poser les garde-fous avant que le modèle improvise.                      | « Rends ça bien. »                  | « Moins de 150 mots, sans jargon, et n'invente pas de métriques. »        |
| Format sortie | Demander la forme de la réponse attendue.                                | « Réponds comme tu veux. »          | « Un court paragraphe puis 3 puces. »                                     |
| Exemples      | Montrer le motif quand la cohérence compte plus que la créativité.       | « Tu vois l'idée. »                 | « Utilise ce format : problème → cause probable → prochaine action. »     |

### 4. Demandez une sortie précise

Même une bonne réponse devient pénible si elle arrive dans une forme que vous ne pouvez pas réutiliser. La **sortie**, c'est la forme de la réponse que vous voulez récupérer : un paragraphe, un tableau ou du JSON, c'est-à-dire un format texte avec des champs nommés et des valeurs. J'ai un avis assez net ici : si vous savez déjà comment vous allez utiliser la réponse, nommez le format. Le petit effort au départ fait gagner bien plus de temps ensuite.

Avant d'utiliser ce schéma dans un vrai cas, ça aide de voir un exemple déjà rempli :

```text
Tâche : Explique ce qu'est la mise en cache.
Contexte : Le lecteur est un développeur web junior qui n'a jamais étudié la performance.
Contraintes : Utilise moins de 150 mots, évite le jargon, ajoute une analogie du quotidien et n'invente pas de métriques.
Sortie : Un paragraphe court suivi de deux puces intitulées « Pourquoi c'est utile ».
```

Ma règle est simple : dès qu'un prompt dépasse vraiment ces quatre blocs ou qu'il commence à être copié partout, arrêtez de le polir et transformez-le en template.
