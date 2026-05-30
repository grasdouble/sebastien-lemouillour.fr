---
id: data-privacy
order: 4
difficulty: beginner
tags: [LLM, privacy, security, OpenAI, Anthropic]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Un collègue colle des données client dans votre fonctionnalité IA, et tout à coup le prototype ne fait plus joujou. C'est le moment où la confidentialité des données cesse d'être du jargon légal pour devenir une question de produit.

Ici, la confidentialité revient à une question très concrète : quand vous envoyez du texte à un modèle, où part-il, combien de temps reste-t-il quelque part, et qui, dans ou hors de votre entreprise, peut y accéder ? Si vous utilisez une API externe, vous franchissez une frontière de confiance. Il faut lire les conditions du fournisseur, pas juste le vernis marketing. Commencez par [OpenAI privacy](https://openai.com/enterprise-privacy/) et [Anthropic privacy](https://www.anthropic.com/legal/privacy/).

Ma règle de base est stricte : partez du principe que chaque prompt peut contenir des données sensibles tant que vous n'avez pas prouvé le contraire. Les utilisateurs collent des noms, des factures, des contrats, des notes médicales, ou des documents internes dès que la fonctionnalité devient utile. L'application, elle, ne fait pas la différence entre une fuite volontaire et une fuite accidentelle. Le résultat reste une fuite.

C'est pour ça que le travail de confidentialité commence avant les checklists de chiffrement. D'abord, minimisez ce que vous envoyez. Si le modèle n'a besoin que du statut d'une commande, n'envoyez pas toute la fiche CRM. Ensuite, masquez les données personnelles quand c'est possible. La pseudonymisation ou la redaction consiste à retirer ou cacher des éléments comme les noms, emails, numéros de compte, et adresses. Enfin, décidez ce qui ne doit jamais sortir de votre infrastructure. Le [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) existe parce que les systèmes IA créent de nouvelles façons de mal manipuler des données sensibles, pas parce que les anciennes règles de sécurité ont disparu.

Parfois, la bonne réponse est de rester en local. Si la politique interne, ou simplement le bon sens, dit que le texte doit rester chez vous, faire tourner un modèle via [Ollama](https://ollama.com/) ou une autre pile auto-hébergée peut réduire l'exposition. Cela ne résout pas la confidentialité par magie, parce que les logs, les sauvegardes, et les droits d'accès existent toujours, mais la frontière des données se rapproche de vous.

L'erreur fréquente chez les débutants, c'est de demander : "Est-ce que ce fournisseur entraîne ses modèles sur mes données ?" C'est une bonne question, mais ce n'est pas la seule. La rétention, l'accès du support, les traces d'audit, et les accès internes font aussi partie du tableau. Votre propre application compte tout autant. Si vous enregistrez les prompts bruts en clair, vous pouvez créer un problème de confidentialité même si le fournisseur se comporte parfaitement.

Une habitude saine consiste à classer les données avant d'intégrer l'IA : public, interne, sensible, restreint. Ensuite, décidez quelles classes peuvent passer par quelles routes de modèles. Cette seule discipline évite déjà beaucoup de discussions pénibles.

Et ensuite ? La confidentialité répond à la question de l'endroit où vont les données. Le guide suivant, sur la prompt injection, répond à un autre problème : que se passe-t-il quand les données elles-mêmes essaient de manipuler votre application ?
