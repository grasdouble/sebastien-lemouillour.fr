---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [IA, LLM]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

Vous collez un message client agacé dans ChatGPT et en cinq secondes vous avez une réponse support présentable. Votre collègue designer tape une description dans Midjourney et obtient quelque chose de mieux que ce qu'il aurait produit en trois heures sous Figma. Des outils différents, des résultats différents, mais le même sentiment un peu déstabilisant : un logiciel qui crée, plutôt qu'un logiciel qui obéit.

C'est précisément pour ça que l'IA générative mérite votre attention. Si vous développez, vous n'avez pas besoin de maîtriser les maths dès le premier jour, mais vous gagnez beaucoup à comprendre le type de machine que vous utilisez avant de construire dessus.

## Pas des règles, des patterns

Un programme classique fait exactement ce qu'on lui dit de faire. Une fonction qui valide un email ne « comprend » pas les emails : elle applique une regex. L'IA générative fonctionne autrement. Au lieu d'écrire les règles à la main, on entraîne un modèle sur d'énormes volumes d'exemples jusqu'à ce qu'il apprenne des patterns assez bien pour en produire de nouveaux.

L'analogie du musicien de jazz m'aide encore ici. Après des années d'écoute et de pratique, il n'improvise pas au hasard. Il s'appuie sur des patterns absorbés et assemble quelque chose de nouveau. Les modèles génératifs font quelque chose d'approchant avec du texte, des images, de l'audio ou du code.

## Un LLM, concrètement

Un **LLM** (Large Language Model) est le moteur derrière [ChatGPT](https://openai.com/chatgpt/overview/), [Claude](https://docs.anthropic.com/en/docs/intro-to-claude), [Gemini](https://ai.google.dev/gemini-api/docs/models), et la plupart de ce avec quoi vous allez réellement travailler. Il a été entraîné sur un énorme corpus de texte et a appris une tâche trompeusement simple : étant donné du texte, quel est le morceau suivant le plus probable ?

Si ça vous paraît encore un peu abstrait, pas d'inquiétude. En général, tout devient plus clair quand on voit les quelques éléments qui façonnent chaque réponse.

Quatre concepts expliquent l'essentiel de ce que vous allez observer en pratique :

- **Token** : les modèles ne traitent pas des caractères ou des mots entiers, ils traitent des morceaux appelés tokens. Le [tokenizer OpenAI](https://platform.openai.com/tokenizer) permet de le voir concrètement. Tout a un coût en tokens, c'est pourquoi les prompts longs deviennent vite onéreux.
- **Fenêtre de contexte** : c'est la quantité de texte que le modèle peut « voir » dans une requête. C'est sa mémoire de travail pour cet appel. La page [modèles OpenAI](https://platform.openai.com/docs/models) indique que GPT-4o dispose d'une fenêtre de 128K tokens, soit un ordre de grandeur de quelques centaines de pages de texte brut. Ça paraît énorme jusqu'au jour où vous essayez d'y faire rentrer toute une codebase.
- **Temperature** : c'est le curseur de créativité. À 0, le modèle reste plus près du token suivant le plus probable. Des valeurs plus hautes rendent la sortie plus variée. Pour des tâches factuelles ou structurées, je la garde généralement basse.
- **Prompt** : c'est l'instruction que vous envoyez. Ça compte beaucoup plus que la plupart des débutants l'imaginent. Le même modèle avec un prompt différent peut se comporter très différemment, donc bien formuler sa demande est une vraie compétence.

## À quoi ressemble un appel API

La façon la plus rapide de rendre tout ça concret, c'est d'appeler un modèle vous-même au lieu de rester dans une interface de chat. La [Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) suffit pour voir la structure : vous envoyez des messages structurés, vous récupérez du texte.

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a concise technical assistant.' },
      { role: 'user', content: 'Explain LLMs in 3 sentences.' },
    ],
    temperature: 0.3,
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

Trois éléments comptent tout de suite ici :

- **`model`** : vous choisissez quel modèle traite la requête. Capacités, latence et prix varient beaucoup, donc je n'utiliserais pas le plus gros modèle pour tous les cas.
- **`messages`** : la conversation est une liste. Le message `system` fixe le comportement. Le message `user` contient ce que quelqu'un, ou votre code, demande.
- **`temperature`** : 0,3 est un bon point de départ quand vous voulez des réponses stables. Pour du brainstorming, je la monterais davantage.

## Les points qui piègent le plus souvent

Ce sont les limites qu'on m'aurait fait gagner du temps à comprendre plus tôt.

**Pas de mémoire intégrée entre des appels API simples.** Chaque requête repart de ce que vous lui envoyez dans cette requête. Si vous construisez un chatbot, vous devez généralement renvoyer l'historique vous-même. Ça coûte de plus en plus cher à mesure que la conversation s'allonge.

**La fraîcheur de l'info est votre problème.** Le modèle ne peut pas connaître votre dernier changement produit, la panne d'hier, ou un document privé si cette information n'est ni dans ses données d'entraînement ni dans le contexte que vous lui fournissez via prompt, couche de retrieval ou outil.

**Les hallucinations sont normales, pas un cas bizarre.** Le [rapport technique GPT-4](https://cdn.openai.com/papers/gpt-4.pdf) rappelle bien que ces systèmes peuvent produire des réponses confiantes mais fausses. Je traite les réponses du modèle comme un premier jet tant que je n'ai pas vérifié ce qui compte.

## Là où j'irais ensuite

Si je commençais aujourd'hui, j'apprendrais d'abord le prompting parce que c'est le levier le moins coûteux. J'ajouterais du RAG dès que la fraîcheur des informations devient importante, et je ne passerais aux agents qu'au moment où un prompt simple plus de la retrieval ne suffit plus. Ma règle est simple : si le coût d'une erreur est élevé, je vérifie avant de faire confiance.
