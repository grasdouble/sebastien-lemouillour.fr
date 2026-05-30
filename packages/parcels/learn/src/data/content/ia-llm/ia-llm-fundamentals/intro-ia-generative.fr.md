---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [IA, LLM]
publishedAt: 2026-05-29
updatedAt: 2026-05-29
---

Vous collez un message client agacé dans ChatGPT et en cinq secondes vous avez une réponse support présentable. Votre collègue designer tape une description dans Midjourney et obtient quelque chose de mieux que ce qu'il aurait produit en trois heures sous Figma. Des outils différents, des résultats différents, mais le même sentiment un peu déstabilisant : un logiciel qui crée, plutôt qu'un logiciel qui obéit.

C'est ça, l'IA générative. Et si vous développez, ça vaut la peine de comprendre ce qui se passe vraiment avant de commencer à construire dessus.

## Un programme qui apprend

Un programme classique fait exactement ce qu'on lui dit de faire. Une fonction qui valide un email ne « comprend » pas les emails : elle fait correspondre une regex. L'IA générative fonctionne différemment : au lieu d'encoder des règles, on entraîne un modèle sur des quantités massives d'exemples jusqu'à ce qu'il apprenne des patterns suffisamment bien pour en produire de nouveaux.

L'analogie classique, c'est le musicien de jazz. Après des années d'écoute et de pratique, il n'improvise pas au hasard : il puise dans des milliers de patterns absorbés et crée quelque chose de nouveau à partir d'eux. Les modèles génératifs font la même chose, avec des tokens plutôt que des notes, à une échelle qui rend l'analogie presque naïve.

## Un LLM, concrètement

Un **LLM** (Large Language Model) est le moteur derrière ChatGPT, Claude, Gemini, et la plupart de ce avec quoi vous allez réellement travailler. Il a été entraîné sur un corpus énorme : livres, articles, code source, pages web, et a appris une seule chose : étant donné du texte, qu'est-ce qui vient ensuite ?

Ça semble trompeusement simple. Ce ne l'est pas.

Quatre concepts expliquent 80% de ce qu'on observe quand on travaille avec ces modèles :

- **Token**: les modèles ne traitent pas des caractères ou des mots, ils traitent des tokens (environ un mot, parfois une syllabe, parfois de la ponctuation). Tout a un coût en tokens, c'est pourquoi les prompts longs deviennent vite onéreux.
- **Fenêtre de contexte**: la quantité de texte que le modèle peut « voir » en une seule requête. C'est sa mémoire de travail. Dépassez la limite et le contenu ancien disparaît. GPT-4o peut traiter environ 300 pages à la fois, ce qui semble beaucoup jusqu'au moment où vous essayez de lui donner toute une codebase.
- **Temperature**: le curseur de créativité. À 0, le modèle choisit à chaque fois le token le plus probable (prévisible, légèrement ennuyeux). À 1, il prend plus de risques (intéressant, parfois faux). Pour tout ce qui est factuel ou structuré, je reste en dessous de 0,5.
- **Prompt**: l'instruction que vous envoyez. Celui-là compte plus que les gens ne l'imaginent. Le même modèle avec un prompt différent produit des résultats radicalement différents, c'est pourquoi il existe toute une discipline dédiée à ça.

## À quoi ressemble un appel API

La meilleure façon de comprendre les LLMs, c'est d'en appeler un directement plutôt que de passer par une interface de chat. Vous envoyez un message structuré, vous recevez une réponse texte. Voici la version minimale :

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

Trois choses à remarquer ici :

- **`model`**: vous choisissez quel modèle traite la requête. Les capacités et le prix varient significativement entre les modèles ; n'utilisez pas le plus puissant par défaut pour tout.
- **`messages`**: la conversation est une liste. Le message `system` est votre instruction permanente ; le message `user` est ce que quelqu'un (ou votre code) demande.
- **`temperature`**: 0,3 ici parce que je veux des réponses factuelles et cohérentes. Pour des tâches créatives, je monterais plus haut.

## Ce qui va vous surprendre

C'est la section que j'aurais aimé lire avant de livrer ma première feature LLM.

**Pas de mémoire entre les appels.** Chaque appel API repart de zéro. Si vous construisez un chatbot, vous devez renvoyer tout l'historique de la conversation à chaque requête. Le modèle ne se souvient pas du dernier message : il ne peut littéralement pas, par conception. Ça devient coûteux et demande une gestion soigneuse à mesure que les conversations s'allongent.

**Des données d'entraînement gelées.** Le modèle ne sait rien après sa date de coupure d'entraînement. Il ne peut pas vous parler de votre dernière mise à jour produit, de la panne d'hier, ni de quoi que ce soit qui s'est passé après son entraînement. Si votre cas d'usage a besoin d'informations actuelles, vous devrez les injecter (c'est pour ça que le RAG existe).

**Les hallucinations sont réelles et dangereuses.** Le modèle génère la suite la plus plausible de votre prompt. « Plausible » et « vrai » ne sont pas la même chose. Une réponse confiante et bien formatée peut quand même être complètement fausse. Ce n'est pas un bug qu'on va corriger : c'est une propriété fondamentale de fonctionnement de ces modèles. Concevez votre système en conséquence.

## La suite

Les guides qui suivent s'appuient sur ces bases :

- **Prompt engineering**: la plus grande partie de la variance en qualité de sortie vient de comment vous formulez l'instruction. Celui-là vaut votre temps.
- **RAG**: comment connecter un LLM à vos propres données pour que la date de coupure gelée cesse d'être un bloquant.
- **Agents**: comment donner des outils à un LLM et lui permettre d'agir, pas seulement de produire du texte.
