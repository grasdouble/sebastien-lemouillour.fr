---
id: choosing-a-model
order: 3
difficulty: beginner
tags: [LLM, evaluation, latency, OpenAI, HuggingFace]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Vous ouvrez un catalogue de modèles, et les noms ressemblent à des paquets de céréales : mini, turbo, instruct, 70B, Sonnet, latest. Le piège, c'est de croire qu'il existe un meilleur modèle dans l'absolu. Moi, je ne chercherais pas le « meilleur ». Je choisirais le modèle le moins cher qui reste assez bon pour le travail, parce qu'un choix de modèle est toujours un compromis entre qualité, latence, et prix.

Un modèle, c'est le système qui transforme votre prompt, donc votre instruction, en réponse. Les tableaux de comparaison des fournisseurs montrent toujours la même tendance : les petits modèles sont souvent plus rapides et moins chers, tandis que les gros s'en sortent mieux sur les tâches de raisonnement difficiles, donc [Anthropic overview](https://docs.anthropic.com/en/docs/about-claude/models/overview) est un bon rappel quand le nommage devient flou.

Il reste pourtant un problème très concret : où comparer les options sans vous perdre ? Si vous explorez des modèles open-weight, [Hugging Face Models](https://huggingface.co/models) aide à filtrer par tâche, taille, et licence. Si vous voulez en exécuter un en local, donc sur votre propre machine, [Ollama](https://ollama.com/) donne une façon simple de récupérer et servir les modèles pris en charge.

Quand un débutant me demande par où commencer, je reviens à trois questions, et je les prends dans cet ordre.

Première question : de quoi la tâche a-t-elle vraiment besoin ? La classification, l'extraction, la réécriture simple, et les résumés courts passent souvent sur des modèles moins chers. La planification en plusieurs étapes, les instructions confuses, ou le raisonnement long demandent plus souvent un modèle plus solide. Si la tâche a l'air simple, je commencerais petit et je laisserais le modèle prouver qu'il mérite une montée en gamme.

Deuxième question : combien coûte une erreur ? Si le pire résultat possible est une phrase un peu maladroite, je teste volontiers un petit modèle en premier. Si une erreur peut toucher l'argent, le sens juridique, la sécurité, ou la confiance, je paierais plus tôt pour avoir de la marge. C'est le point que les débutants sous-estiment le plus : le risque du modèle est aussi une décision produit, pas seulement une décision technique.

Troisième question : combien de temps l'utilisateur peut-il attendre ? La latence, c'est le délai de réponse. Le [guide OpenAI sur la latence](https://platform.openai.com/docs/guides/latency-optimization) explique pourquoi les petits modèles répondent souvent plus vite et pourquoi la longueur de la sortie compte aussi. Dans un assistant de chat, quelques secondes de plus peuvent passer. Dans de l'autocomplétion ou un flux répété très souvent, une seconde peut sembler énorme.

Une fois la tâche, le risque, et le budget de patience clarifiés, il reste un dernier piège : les scores de benchmark ne disent toujours pas si vos prompts vont fonctionner. Voilà pourquoi je construirais d'abord un tout petit jeu d'évaluation. Le [guide OpenAI sur les evals](https://platform.openai.com/docs/guides/evals) recommande de tester les modèles sur des entrées représentatives, et c'est l'habitude à laquelle je fais le plus confiance. Cinq à dix exemples réalistes de votre propre cas d'usage valent mieux qu'un classement public très brillant.

Ma règle est simple : commencez par le plus petit modèle qui passe vos evals, puis montez seulement quand vous pouvez nommer l'échec clairement. Et ensuite ? Dès que vous pouvez formuler en une phrase votre niveau de qualité attendu et votre délai maximal acceptable, passez à la confidentialité des données, parce que la prochaine vraie décision sur le modèle concerne surtout ce que vous pouvez envoyer et l'endroit où ces données sont traitées.
