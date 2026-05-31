---
id: structure-of-a-good-prompt
order: 2
difficulty: beginner
tags: [prompting, tokens, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

La boîte vide du chat est un piège. Elle donne l'impression qu'un paragraphe brouillon suffira, puis on se retrouve avec une réponse sûre d'elle à une question qu'on n'a même pas vraiment formulée.

Si je devais donner un réflexe simple à un débutant, je prendrais presque toujours quatre blocs : la **tâche**, le **contexte**, les **contraintes** et la **sortie**. Ce n'est pas une religion, mais on est très proche de ce que [le guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) recommande quand on veut des réponses plus fiables. Beaucoup de tutoriels sautent cette structure pour parler tout de suite d'astuces de formulation, et c'est exactement pour ça que le prompting paraît aléatoire au début.

### 1. Commencez par la tâche

Mettez le travail à faire en premier. Si le modèle doit deviner si vous voulez une explication, une réécriture, une checklist ou un avis, vous avez déjà compliqué le problème inutilement.

J'aime écrire la tâche sous forme de verbe : expliquer, comparer, résumer, classer, réécrire, brainstormer. Les verbes forcent la clarté. « Aide-moi avec ça » paraît sympa, mais ça n'apprend presque rien au modèle. [Les bonnes pratiques d'Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) disent la même chose avec plus de diplomatie : soyez explicite sur la portée, parce que le modèle suit généralement ce que vous avez vraiment demandé, au pied de la lettre.

### 2. Ajoutez le contexte qu'il ne peut pas inventer proprement

Le contexte, c'est l'information de fond sur laquelle le modèle doit s'appuyer : le public, le domaine, le texte source, l'objectif métier, ou tout autre élément qui change ce qu'on considère comme une bonne réponse. [La décomposition d'Azure](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) distingue les instructions du contenu sur lequel le modèle doit travailler, et je trouve ce découpage très utile.

Si vous demandez du contenu, dites pour qui il est écrit. Si vous demandez du code, précisez le langage et l'environnement. Si vous demandez un retour critique, expliquez ce que « bon » veut dire. Le modèle peut combler les blancs, bien sûr, mais c'est justement la partie risquée : il les remplit avec des suppositions plausibles.

### 3. Posez les contraintes avant que le modèle improvise

Les contraintes sont vos garde-fous : longueur, ton, points obligatoires, choses à éviter, ou limites du type « n'invente pas de données ». Les débutants les ajoutent souvent seulement après une mauvaise réponse. Je préfère les annoncer dès le départ et m'épargner plusieurs allers-retours.

Voici le squelette ultra simple que je réutilise le plus souvent.

```text
Tâche :
Contexte :
Contraintes :
Sortie :
```

### 4. Demandez une sortie précise

Si vous connaissez la forme de la réponse, demandez-la. Un paragraphe, une liste à puces, un tableau, du JSON, trois options classées par confiance, peu importe, tant que cela vous aide à utiliser le résultat rapidement. [L'intro Gemini](https://ai.google.dev/gemini-api/docs/prompting-intro) recommande elle aussi d'indiquer les contraintes et le format de réponse, et je suivrais ce conseil presque à chaque fois sauf si la forme m'est complètement égale.

Voici à quoi ressemble cette structure dans un prompt concret et accessible.

```text
Tâche : Explique ce qu'est le caching.
Contexte : Le lecteur est un développeur frontend junior.
Contraintes : Utilise moins de 150 mots, évite le jargon, ajoute une analogie.
Sortie : Un paragraphe court suivi de deux puces intitulées « Pourquoi c'est utile ».
```

Ma règle est simple : si la demande compte ou si vous savez qu'une réponse floue va vous agacer, écrivez les quatre blocs. Si c'est un prompt jetable, soyez volontairement paresseux et acceptez le bazar.
