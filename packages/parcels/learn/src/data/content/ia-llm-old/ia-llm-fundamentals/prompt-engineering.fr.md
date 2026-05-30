---
id: prompt-engineering
order: 2
difficulty: intermediate
tags: [IA, LLM, prompt]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

Vous avez demandé trois fois la même chose au modèle et obtenu trois réponses différentes. L'une est vague, l'autre trop sûre d'elle, la troisième presque exploitable mais impossible à parser. Le piège, c'est d'empiler les adjectifs. Je l'ai fait aussi. Le correctif le plus rapide est souvent plus simple : partir d'une instruction claire, puis n'ajouter de la structure qu'à l'endroit exact où la sortie casse.

[OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering), [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) et [Google](https://ai.google.dev/gemini-api/docs/prompting-strategies) répètent au fond la même chose : être explicite, montrer des exemples quand la tâche est ambiguë, et contraindre la sortie quand un autre système en dépend. Ma position est nette : commencez par la version ennuyeuse. Les prompts sophistiqués sont souvent juste de la confusion plus chère.

## Zero-shot : la base, pas la ligne d'arrivée

Le zero-shot reste la façon la moins chère de tester une tâche. Si la tâche est courante et que le critère de réussite est évident, ça peut déjà suffire.

Avant d'ajouter quoi que ce soit, essayez le plus petit prompt capable de fonctionner.

```text
Classe le sentiment de cette critique comme Positif, Neutre ou Négatif :

"L'autonomie de la batterie est décevante, mais la qualité de l'écran est excellente."
```

Quand la sortie dérive, la vraie question est simple : est-ce que le modèle a mal compris la tâche, ou est-ce qu'il a mal compris votre définition de ce qui est bon ?

## Few-shot : dépensez les exemples là où ça dérive

Quand la tâche est ambiguë, les exemples battent la prose plus longue parce qu'ils montrent le format, les cas limites et le niveau d'exigence. Le [guide de cohérence](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency) d'Anthropic le dit encore plus directement : contraignez avec des exemples quand vous voulez une sortie fiable. Je commence quand même avec deux ou trois exemples, pas plus. Chaque exemple en plus brûle des tokens, et la plupart des problèmes de prompt n'ont pas besoin d'une cérémonie en six shots.

Avant d'écrire un paragraphe de plus, montrez une ou deux fois le pattern attendu.

```text
Traduis de l'anglais vers le français :

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous ?"

English: "Thank you very much for your help."
French: "Merci beaucoup pour votre aide."

English: "I would like to book a table for two."
French:
```

Si un exemple corrige la sortie, arrêtez-vous là. Si trois exemples ne suffisent toujours pas, j'arrête d'affiner le prompt et je change quelque chose de plus profond : le modèle, le workflow, ou le contexte que je fournis.

## Étapes intermédiaires : demandez des points de contrôle vérifiables

Pour les tâches fragiles en plusieurs étapes, demander uniquement la réponse finale masque l'endroit où ça casse. J'obtiens de meilleurs résultats quand je demande un petit nombre de points de contrôle visibles plutôt qu'un bloc de raisonnement interminable. J'ai alors quelque chose à vérifier sans transformer la réponse en roman.

Avant de faire confiance au résultat, forcez le modèle à montrer la partie que vous devez contrôler.

```text
Résous ce problème étape par étape et montre les points de contrôle :

Si un train part à 9h00 et roule à 120 km/h, et qu'un autre train part à 10h00
de la même gare dans la même direction à 150 km/h, à quelle heure
le second train rattrapera-t-il le premier ?

Retourne :
1. Distance d'avance
2. Vitesse relative
3. Temps de rattrapage
4. Réponse finale
```

Je ne demande pas un raisonnement verbeux par défaut. Je demande la structure intermédiaire minimale qui me permet d'attraper un mauvais saut logique.

## Role prompting : choisissez le jugement dont vous avez besoin

Le role prompting devient utile quand la tâche dépend de ce que le modèle doit prioriser, pas seulement de ce qu'il doit dire. Le guide de Google traite les instructions système comme un vrai levier de pilotage, et ça colle à mon expérience : « sois utile » est trop faible, alors que « relis ceci comme un auditeur sécurité senior et ne remonte que les risques matériels » change ce que le modèle remarque.

Avant de lancer la tâche, dites au modèle quel type de jugement il est censé appliquer.

```text
You are a senior security reviewer.
Focus on authentication, authorization, and data exposure.
Review this API design and list only issues that would matter in production.
```

Choisissez le rôle qui correspond à la décision que vous devez prendre. Si vous voulez une classification concise, oubliez le personnage théâtral. Si vous avez besoin d'arbitrages d'expert, un rôle précis aide vraiment.

## Instructions de haut niveau : placez les règles durables au-dessus de la demande

Dans l'API OpenAI actuelle, cette couche passe par [`instructions`](https://developers.openai.com/api/docs/guides/text) ou par des messages `developer`, avec une priorité des instructions développeur sur les messages utilisateur. C'est là que je mets le ton, les limites de refus et les contraintes de sortie, parce que répéter ces règles dans chaque prompt utilisateur est la meilleure façon de réintroduire de la dérive.

Avant d'empiler plus de texte utilisateur, remontez les règles durables dans la requête elle-même.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-5.5', // Bon défaut pour itérer sur un prompt
  instructions: `You are a JSON-only API.
Return valid JSON and nothing else.
Schema: { "answer": string, "confidence": number }`, // Règles qui doivent survivre à un message utilisateur
  input: 'What is the capital of Japan?', // Tâche réelle pour cet appel
});
```

Il y a une nuance importante en production : si vous voulez ces règles sur l'appel suivant aussi, il faut les renvoyer. Ce sont des instructions au niveau de la requête, pas une mémoire partagée.

## Sortie structurée : imposez le schéma quand du code attend derrière

Si un autre service doit consommer la réponse, « renvoie du JSON » n'est pas un plan de fiabilité. Le guide [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) le dit clairement : le mode JSON garantit un JSON valide, tandis que `json_schema` est l'option plus stricte qui impose le schéma. Pour un humain, un bon formatage dans le prompt peut suffire. Pour une machine, je choisis l'imposition du schéma. Là, je ne transige pas.

Avant de brancher la réponse dans du code, rendez le contrat explicite.

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-2024-08-06', // Snapshot compatible avec structured outputs
  instructions: 'Classify the article and return structured data.', // Règles durables de la tâche
  input: 'Classify this article about React hooks.', // Contenu réel à analyser
  text: {
    format: {
      type: 'json_schema',
      name: 'article_classification',
      strict: true, // On impose le schéma au lieu d'espérer
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
        },
        required: ['title', 'tags', 'difficulty'],
        additionalProperties: false,
      },
    },
  },
});
```

Ma règle est simple : si la réponse est vague, resserrez la tâche ; si le format dérive, ajoutez des exemples ; si du code doit parser le résultat, imposez le schéma ; si vous êtes encore en train de retoucher le même prompt après trois vraies tentatives, arrêtez le prompt tuning et changez le workflow.
