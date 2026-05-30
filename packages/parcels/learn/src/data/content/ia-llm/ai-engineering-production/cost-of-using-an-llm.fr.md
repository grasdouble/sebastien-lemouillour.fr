---
id: cost-of-using-an-llm
order: 2
difficulty: beginner
tags: [LLM, cost, tokens, OpenAI, Anthropic]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez construit votre première fonctionnalité LLM. Puis quelqu'un pose la question qui fâche : combien ça va coûter par mois ? Vous n'en savez rien. C'est normal, parce que la tarification des LLM reste abstraite tant qu'on ne la ramène pas à une requête, un utilisateur, un mois.

La plupart des fournisseurs facturent au token. Un token, c'est un petit morceau de texte, pas un mot complet. "Bonjour tout le monde" représente quelques tokens, une longue conversation de support en représente beaucoup plus. Si vous voulez voir comment le texte est découpé, le [OpenAI tokenizer](https://platform.openai.com/tokenizer) rend cette idée très concrète.

Ensuite, le fournisseur facture deux choses : les tokens d'entrée, donc le texte que vous envoyez, et les tokens de sortie, donc le texte généré par le modèle. Regardez les tarifs actuels sur [OpenAI pricing](https://openai.com/api/pricing/) et [Anthropic pricing](https://www.anthropic.com/pricing/). Les chiffres changent avec le temps, mais l'habitude à prendre ne change pas : il faut estimer avant de lancer.

Ma règle préférée est très simple : le coût est un choix produit, pas un exercice pour la compta. Un chat qui garde tout l'historique, ajoute un énorme prompt système, récupère cinq longs documents, puis demande une réponse de 1 500 mots, dit au modèle d'être cher. La facture suit le design.

Un modèle mental aide beaucoup :

- Coût par requête = tokens d'entrée + tokens de sortie
- Coût mensuel = coût par requête × nombre de requêtes
- Coût réel = coût mensuel + retries + erreurs + expérimentations + logs

La dernière ligne est celle que les débutants oublient. Chaque fois qu'un prompt échoue et que vous recommencez, vous repayez. Chaque fois que vous envoyez du contexte inutile, vous repayez. Chaque fois que vous choisissez un plus gros modèle juste au cas où, vous repayez.

C'est pour ça que je préfère partir d'un budget, pas d'un modèle. Décidez ce qu'un utilisateur peut coûter par jour. Ensuite, remontez le calcul. Si vous ne pouvez dépenser que quelques centimes par utilisateur actif, il faudra probablement des prompts plus courts, moins de documents récupérés, des modèles plus petits, ou des limites de sortie plus serrées. Si chaque requête crée beaucoup de valeur, vous pouvez vous permettre davantage.

Un bon premier exercice consiste à mesurer trois prompts réels de votre application : court, moyen, pire cas. Comptez les tokens, estimez la longueur de la réponse, multipliez par votre trafic quotidien attendu, puis ajoutez une marge de sécurité. Le résultat restera approximatif, mais il sera déjà bien plus utile qu'un simple ressenti.

Le piège, c'est de regarder uniquement le prix du modèle et d'ignorer la forme de l'usage. Un modèle peu cher avec des prompts mal maîtrisés peut coûter plus qu'un meilleur modèle avec des entrées disciplinées.

Et ensuite ? Quand vous savez estimer le coût d'une requête sur un coin de table, passez au choix du modèle. Le prix n'a de sens qu'une fois la qualité et la latence clarifiées.
