---
id: zero-shot-prompting
order: 4
difficulty: beginner
tags: [LLM, prompting, zero-shot, instructions]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Parfois, vous n'avez ni exemple, ni dataset, ni patience. Vous avez juste besoin d'une réponse utile dans les 30 prochaines secondes. C'est précisément là que le zero-shot prompting devient précieux.

Le **zero-shot prompting** consiste à demander au modèle d'exécuter une tâche à partir des seules instructions, sans exemple résolu dans le prompt. C'est un schéma classique décrit dans les [stratégies Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies), le [guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) et la [vue d'ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview). Si vous débutez, c'est presque toujours par là que je commencerais.

### Pourquoi le zero-shot est le point de départ

Les modèles de langage modernes savent déjà suivre des instructions de manière assez correcte. Pour des tâches courantes comme résumer un texte, extraire les points clés, réécrire un ton ou classer un sentiment évident, une instruction propre suffit souvent.

L'astuce, et c'est la partie que beaucoup de tutoriels oublient, c'est que zero-shot ne veut pas dire **zéro contexte**. Vous devez quand même expliquer au modèle à quoi ressemble une bonne réponse. Si vous oubliez le public, les limites ou le format, il comblera les trous avec des suppositions.

### À quoi ressemble un bon prompt zero-shot

J'aime le zero-shot parce qu'il reste lisible. On peut le partager à un collègue et il ressemble encore à du langage normal, pas à une formule ésotérique.

Voici un exemple très concret.

```text
Classe le sentiment de ce message client comme positif, neutre ou négatif.
Réponds avec un seul label.

Message :
"Le nouveau dashboard est plus simple à utiliser, mais les exports échouent encore une fois sur deux."
```

Cela fonctionne parce que la tâche est précise, les labels autorisés sont explicites et le format de sortie est serré. Si le modèle répond avec un roman malgré ça, c'est en général que l'instruction restait trop floue, pas que le zero-shot « ne marche pas ».

### Quand le zero-shot commence à montrer ses limites

Le zero-shot tient moins bien quand la tâche dépend d'un style subtil, de labels maison, de cas limites ou de règles propres à une entreprise. Par exemple, « classe ce ticket support en P1, P2 ou P3 » a l'air simple, mais ces labels n'ont pas exactement la même signification selon les équipes. Sans exemples, le modèle doit deviner votre définition locale.

C'est pour cela que je traite le zero-shot comme le premier mouvement, pas comme la solution universelle. C'est rapide, peu coûteux en longueur de prompt, et souvent largement suffisant. Quand il échoue, son échec est utile : il vous montre précisément quelle définition ou quel exemple manquait.

Ma règle de décision est simple : commencez en zero-shot sauf si le vocabulaire, les labels ou le ton sont vraiment spécifiques. Quand le modèle est presque juste mais dérive encore, c'est le signal du guide suivant, parce qu'un seul bon exemple peut faire gagner un temps franchement ridicule.
