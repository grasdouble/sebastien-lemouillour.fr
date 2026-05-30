---
id: structure-of-a-good-prompt
order: 2
difficulty: beginner
tags: [LLM, prompting, instructions, context]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La boîte vide du chat est un piège. Elle donne l'impression qu'un paragraphe brouillon suffira, puis on s'étonne que la réponse parte dans tous les sens.

Un bon prompt a généralement besoin de quatre éléments : la **tâche** à accomplir, le **contexte** dont le modèle a besoin, les **contraintes** qui le gardent sur les rails, et le **format de sortie** attendu. Cette logique rejoint le [guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering), la [documentation Azure](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) et la [vue d'ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview). Beaucoup de tutoriels sautent cette structure pour parler tout de suite d'astuces de formulation, et c'est exactement pour ça que le prompting semble aléatoire au début.

### 1. Commencez par la tâche

Mettez le travail à faire en premier. Si le modèle doit deviner si vous voulez une explication, une réécriture, une checklist ou un avis, vous avez déjà compliqué le problème inutilement.

J'aime écrire la tâche sous forme de verbe : expliquer, comparer, résumer, classer, réécrire, brainstormer. Les verbes forcent la clarté. « Aide-moi avec ça » paraît sympathique, mais n'apprend presque rien au modèle.

### 2. Ajoutez le contexte qu'il ne peut pas inventer proprement

Le contexte, c'est l'information de fond sur laquelle le modèle doit s'appuyer : le public, le domaine, le texte source, l'objectif métier, ou tout autre élément qui change ce qu'on considère comme une bonne réponse. C'est la partie que la plupart des gens sous-écrivent.

Si vous demandez du contenu, dites pour qui il est écrit. Si vous demandez du code, précisez le langage et l'environnement. Si vous demandez un retour critique, expliquez ce que « bon » veut dire. Le modèle peut compléter les blancs, mais c'est précisément le souci : il va les inventer, pas les découvrir.

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

Si vous connaissez la forme de la réponse, demandez-la. Un paragraphe, une liste à puces, un tableau, du JSON, trois options classées par confiance, peu importe, tant que cela vous aide à utiliser le résultat rapidement. Le format de sortie paraît moins sexy que les « hacks de prompt », mais c'est souvent lui qui gagne.

Voici à quoi ressemble cette structure dans un prompt concret et accessible.

```text
Tâche : Explique ce qu'est le caching.
Contexte : Le lecteur est un développeur frontend junior.
Contraintes : Utilise moins de 150 mots, évite le jargon, ajoute une analogie.
Sortie : Un paragraphe court suivi de deux puces intitulées « Pourquoi c'est utile ».
```

Vous n'avez pas besoin des quatre éléments à chaque fois, mais quand un prompt échoue en boucle, c'est la première checklist que je prends. Ma règle : si la demande compte vraiment, rendez visibles la tâche, le contexte, les contraintes et la sortie. Si vous voulez voir ce qui se passe quand une de ces pièces manque, le guide suivant passe en revue les erreurs qu'on fait tous au début.
