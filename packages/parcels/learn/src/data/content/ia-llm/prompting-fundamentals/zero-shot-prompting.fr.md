---
id: zero-shot-prompting
order: 4
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-07
updatedAt: 2026-06-07
---

Vous demandez un label court, et le modèle vous renvoie un mini essai avec des opinions que vous n'avez jamais demandées. Ce genre d'écart est courant quand on débute, et le zero-shot prompting est le premier correctif que j'essaierais.

Le **zero-shot prompting** consiste à demander à un modèle d'accomplir une tâche avec des instructions seules, sans exemple résolu dans le prompt, ce qui correspond à la présentation de [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies). Quand on débute, c'est souvent le point de départ le plus calme, parce qu'on voit mieux ce que l'instruction fait réellement.

### Pourquoi le zero-shot est le point de départ

Pour des tâches courantes comme résumer, extraire des champs, réécrire un ton ou classer un sentiment évident, une instruction claire suffit souvent déjà. [OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering) explique que les modèles GPT profitent d'instructions explicites sur la manière d'accomplir une tâche, donc je préfère travailler d'abord la clarté avant de collectionner des exemples.

Le piège est simple : zero-shot ne veut **pas** dire zéro contexte. La [vue d'ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) recommande de définir les critères de réussite avant d'ajuster les prompts, et ce conseil évite beaucoup de frustration aux débutants. Si vous ne dites pas pour qui la réponse est écrite, quoi inclure et quelle forme la sortie doit prendre, le modèle remplit les blancs tout seul.

### À quoi ressemble un bon prompt zero-shot

Un **label**, c'est simplement le nom court de la catégorie attendue, comme `positif` ou `négatif`. J'aime le zero-shot parce qu'il reste lisible. Vous pouvez le montrer à un collègue et reconnaître encore une consigne normale, pas un tas d'astuces de prompting.

Avant que le modèle respecte un format, il faut nommer ce format avec des mots simples.

```text
Classe le sentiment de ce message client comme positif, neutre ou négatif.
Réponds avec un seul label.

Message :
"Le nouveau dashboard est plus simple à utiliser, mais les exports échouent encore une fois sur deux."
```

Cela fonctionne parce que la tâche est étroite, les labels autorisés sont explicites et le format de sortie est contraint. La [recherche sur les stratégies de prompting](https://arxiv.org/abs/2102.07350) montre que des définitions claires de tâches améliorent la fiabilité des modèles, et ce prompt le fait exactement.

### Quand le zero-shot commence à vaciller

Le zero-shot devient fragile quand la tâche dépend d'un style subtil, de labels maison ou de cas limites, c'est-à-dire des cas gênants qui tombent près de la frontière entre deux réponses. « Classe ce ticket en P1, P2 ou P3 » a l'air simple jusqu'au moment où vous remarquez que chaque équipe définit ces labels un peu à sa façon.

J'ai une position très nette là-dessus : n'étirez pas le zero-shot quand il commence à rater le même motif. Et ensuite : passez au one-shot prompting si un seul exemple propre suffirait à fixer le format, puis au few-shot prompting, où l'on fournit quelques exemples, si le modèle rate deux fois le même type de cas limite.
