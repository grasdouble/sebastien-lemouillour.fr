---
id: few-shot-prompting
order: 6
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-08
updatedAt: 2026-06-08
---

Vous avez écrit un exemple propre, et le modèle se trompe encore sur les cas voisins. C'est souvent le moment d'arrêter de polir la formulation et de commencer à enseigner par l'exemple.

Le **few-shot prompting** consiste à donner au modèle plusieurs exemples résolus avant la vraie tâche. Un **exemple résolu** associe une entrée à la sortie attendue. Google explique que ces exemples servent à cadrer le format de sortie, la formulation, la portée et le motif général de la réponse, qu'ils doivent garder un format cohérent et qu'il faut tester leur nombre, car trop d'exemples peuvent faire coller le modèle de trop près aux cas montrés, un phénomène appelé **surapprentissage** ([guide Google](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/few-shot-examples)).

### Pourquoi les débutants y viennent

Le few-shot devient utile quand la frontière entre deux réponses reste floue. Un **label** est le nom court de la catégorie attendue, comme `Satisfaction` ou `Problème`. Un **cas limite** est un exemple gênant qui tombe près de la ligne entre deux labels. OpenAI explique que les modèles GPT profitent d'instructions explicites, et les exemples sont justement un moyen très concret de rendre ces instructions moins ambiguës quand les mots seuls laissent encore de la place au doute ([guide OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering)).

Anthropic recommande de définir des critères de réussite et de tester les prompts avant de continuer à les retoucher. Ce conseil compte ici, parce qu'un prompt plus long n'est utile que s'il améliore les résultats sur de nouveaux cas, pas seulement sur les exemples que vous avez collés dedans ([guide Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices)).

### À quoi ressemblent de bons exemples few-shot

Quand je relis un prompt débutant, je vérifie d'abord ces signaux.

| Motif                       | Exemple                                                              | Pourquoi ça marche / pourquoi ça rate                                                                                   |
| --------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Bon : format cohérent       | `Exemple 1 : Message ... Label ...` répété de la même manière        | Ça marche parce que le modèle apprend une structure stable au lieu de devoir deviner un nouvel emballage à chaque shot. |
| Bon : cas variés            | Satisfaction claire, problème clair, question claire, puis cas mixte | Ça marche parce que l'ensemble montre la règle et sa frontière, pas une seule tournure répétée.                         |
| Bon : labels explicites     | `Label : Problème` plutôt qu'une phrase de réponse complète          | Ça marche parce que la sortie cible est évidente et facile à copier.                                                    |
| Mauvais : habillages mixtes | Premier exemple en prose, deuxième en puces, troisième en JSON       | Ça rate parce que le modèle dépense son attention à deviner l'emballage au lieu de la tâche.                            |
| Mauvais : quasi doublons    | Cinq exemples qui disent presque la même chose                       | Ça rate parce que le prompt s'allonge sans enseigner une nouvelle frontière.                                            |
| Mauvais : labels erronés    | Un message de connexion cassée étiqueté `Satisfaction`               | Ça rate parce qu'un seul mauvais exemple peut enseigner la mauvaise règle.                                              |

Je donnerais quelque chose d'aussi simple à un débutant avant d'ajouter quoi que ce soit de plus sophistiqué.

```text
Classe chaque message client comme Satisfaction, Problème ou Question.
Réponds avec un seul label.

Exemple 1 :
Message : "Le parcours d'inscription était clair et j'ai tout configuré en cinq minutes."
Label : Satisfaction

Exemple 2 :
Message : "Je ne peux pas réinitialiser mon mot de passe parce que l'email n'arrive jamais."
Label : Problème

Exemple 3 :
Message : "Est-ce que vous gérez le SSO sur l'offre starter ?"
Label : Question

Classe maintenant ce message :
"L'interface est propre, mais je n'arrive toujours pas à exporter mes factures."
```

Ce prompt reste lisible parce que chaque exemple garde la même forme, que chaque label est explicite et que le dernier message est un peu mixte au lieu d'être une copie évidente d'un cas précédent.

### La limite à respecter

Ajouter des exemples n'est pas gratuit. Chaque exemple ajoute des **tokens**, c'est-à-dire les morceaux de texte que le modèle lit, donc le prompt devient plus long, plus coûteux et plus pénible à maintenir. OpenAI présente l'amélioration comme une boucle entre évaluation, prompt engineering et, pour certains cas, fine-tuning, ce qui en fait la bonne étape suivante quand ajouter des exemples ne change plus les résultats réels ([guide OpenAI tuning](https://platform.openai.com/docs/guides/fine-tuning)).

Ma règle est simple : si chaque nouvel exemple ne corrige que son minuscule coin de problème, arrêtez d'allonger le prompt. La suite logique consiste à mesurer le comportement avec des évaluations, puis à regarder le fine-tuning seulement si les tests répétés montrent clairement que le few-shot a plafonné.
