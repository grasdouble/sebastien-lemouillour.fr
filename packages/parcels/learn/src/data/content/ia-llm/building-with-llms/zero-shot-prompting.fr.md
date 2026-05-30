---
id: zero-shot-prompting
order: 4
difficulty: beginner
tags: [LLM, prompting, zero-shot, instructions]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Parfois, vous avez juste besoin que le modèle arrête de faire le malin et fasse le boulot. Pas de dataset, pas d'exemples bien propres, pas une après-midi entière à peaufiner le prompt. Le zero-shot, c'est le premier réflexe que j'aurais.

Le **zero-shot prompting**, c'est tout simplement demander au modèle d'exécuter une tâche à partir des seules instructions, sans mettre d'exemple résolu dans le prompt, ce que présente très clairement le [guide Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies). Si vous débutez, c'est souvent le choix le moins pénible pour commencer.

### Pourquoi le zero-shot est le point de départ

Pour des tâches courantes comme résumer, extraire des champs, réécrire un ton ou classer un sentiment évident, une instruction claire va déjà étonnamment loin. Ce n'est pas juste une impression : OpenAI explique noir sur blanc dans son [guide OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering) que les modèles GPT profitent d'instructions plus explicites sur la manière d'accomplir une tâche.

Le piège, c'est que zero-shot ne veut **pas** dire zéro contexte. Anthropic recommande de définir les critères de réussite avant de commencer à bricoler les prompts dans sa [vue d'ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview), et ce conseil compte énormément ici. Si vous oubliez le public, la contrainte ou le format de sortie, le modèle improvisera. Parfois c'est utile. Parfois c'est juste du chaos avec une cravate.

### À quoi ressemble un bon prompt zero-shot

J'aime le zero-shot parce qu'il reste lisible. Vous pouvez montrer le prompt à un collègue et il ressemble encore à une consigne normale, pas à une formule magique déterrée d'un forum en 2023.

Voici le genre de prompt que j'enverrais en premier.

```text
Classe le sentiment de ce message client comme positif, neutre ou négatif.
Réponds avec un seul label.

Message :
"Le nouveau dashboard est plus simple à utiliser, mais les exports échouent encore une fois sur deux."
```

Cela fonctionne parce que la tâche est étroite, les labels autorisés sont explicites et le format de sortie est contraint. Les [bonnes pratiques Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) disent la même chose de façon plus sage : la clarté et des consignes de sortie concrètes font déjà une grosse partie du travail avant même d'ajouter des exemples.

### Quand le zero-shot commence à vaciller

Le zero-shot devient fragile quand la tâche dépend d'un style subtil, de labels maison, de cas limites pénibles ou de règles qui n'ont de sens que dans votre équipe. « Classe ce ticket en P1, P2 ou P3 » a l'air simple jusqu'au moment où vous découvrez que chaque entreprise a inventé sa propre religion autour des niveaux de priorité.

Ma règle est simple : commencez en zero-shot pour les tâches courantes, puis passez en few-shot dès que vous avez des labels maison, un ton maison, ou que le modèle rate deux fois le même cas limite. C'est généralement le moment où garder un prompt court cesse d'être une bonne idée.
