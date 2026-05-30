---
id: choosing-a-model
order: 3
difficulty: beginner
tags: [LLM, evaluation, latency, OpenAI, HuggingFace]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous ouvrez une liste de modèles et, d'un coup, tous les noms ressemblent à du marketing : mini, turbo, instruct, 70B, Sonnet, latest. Les débutants cherchent souvent le meilleur modèle. En réalité, il n'y a pas de gagnant absolu. Il y a seulement le meilleur modèle pour une tâche, un budget, et un délai que l'utilisateur accepte.

Un modèle, c'est le moteur qui transforme votre prompt en réponse. Les gros modèles raisonnent souvent mieux, mais ils coûtent généralement plus cher et répondent plus lentement. Les petits modèles sont moins coûteux et plus rapides, ce qui compte énormément dans un vrai produit. C'est pour ça que mon réflexe n'est pas de prendre le modèle le plus intelligent. Je commence par le plus petit modèle qui passe vos tests de manière fiable.

Si vous explorez les modèles open, le hub [Hugging Face](https://huggingface.co/models) montre la taille, la licence, et quelques signaux utiles de la communauté. Si vous voulez faire tourner des modèles open-weight sur votre machine, [Ollama](https://ollama.com/) réduit beaucoup la friction. Côté API, les tarifs de [OpenAI pricing](https://openai.com/api/pricing/) et [Anthropic pricing](https://www.anthropic.com/pricing/) rappellent vite qu'un choix de modèle n'est jamais seulement une affaire de qualité.

Pour débuter, je reviens toujours à trois questions.

Première question : de quoi la tâche a-t-elle vraiment besoin ? La classification, l'extraction, la réécriture simple, et les résumés courts passent souvent très bien sur des modèles moins chers. Le raisonnement long, les instructions ambiguës, ou l'utilisation d'outils en plusieurs étapes poussent plus souvent vers des modèles plus solides.

Deuxième question : à quel point l'erreur est-elle grave ? Si une erreur produit juste une phrase un peu maladroite, un petit modèle suffit souvent. Si une erreur change le sens d'un contenu juridique, d'une facture, ou de la relation de confiance avec le client, je deviens prudent très vite.

Troisième question : combien de temps l'utilisateur peut-il attendre ? La latence, c'est simplement le délai de réponse. On pardonne plus facilement quelques secondes à un assistant de recherche qu'à un champ d'autocomplétion. Si la fonctionnalité vit dans un flux rapide, gagner une seconde change vraiment l'expérience.

Le point que je défends le plus, c'est celui-ci : ne choisissez pas au ressenti. Prenez cinq à dix exemples réalistes de votre cas d'usage et faites-les tourner sur deux ou trois modèles candidats. Ce petit jeu d'évaluation vous apprendra plus qu'un classement public. Un modèle brillant sur un benchmark peut rester médiocre pour vos prompts à vous.

Si vous êtes bloqué, commencez avec un petit modèle payant ou un modèle open raisonnable, fixez une barre claire de réussite, puis ne montez en gamme que quand cette barre n'est pas atteinte. Beaucoup de débutants font l'inverse : ils commencent avec le plus gros modèle, adorent les réponses, puis paniquent quand la latence ou le coût apparaissent.

Et ensuite ? Une fois le modèle pressenti, la vraie question suivante n'est plus la vitesse ni le prix. C'est la confidentialité des données, donc ce que vous envoyez, où cela part, et qui peut le voir.
