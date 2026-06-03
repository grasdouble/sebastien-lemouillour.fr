---
id: data-privacy
order: 4
difficulty: beginner
tags: [security, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Un client colle un scan de passeport ou une note médicale dans votre fonctionnalité IA, et d'un coup la jolie démo commence à sentir le risque. C'est le moment où j'arrête de penser magie et où je commence à regarder le trajet des données.

Pour débuter, je traduirais la confidentialité en trois questions très simples : où part le texte, combien de temps est-il conservé, et qui peut le voir ? Dès que vous appelez une API de modèle externe, vous franchissez une frontière de confiance, c'est-à-dire que les données quittent le système que vous contrôlez directement. Les [contrôles de données OpenAI](https://platform.openai.com/docs/guides/your-data) expliquent que les données envoyées à l'API ne servent pas à l'entraînement par défaut, tout en précisant que des journaux de surveillance des abus peuvent être conservés jusqu'à 30 jours et que certaines fonctionnalités peuvent stocker un état applicatif.

Ma règle de base est stricte : traitez chaque prompt comme une donnée sensible tant que vous n'avez pas prouvé le contraire. Dès qu'une fonctionnalité devient utile, les gens collent des noms, des factures, des contrats, des tickets de support, et parfois des choses qu'ils ne devraient vraiment pas coller. C'est pour ça que je choisirais d'abord la minimisation des données. Envoyez le plus petit extrait utile, puis masquez les identifiants, c'est-à-dire les noms, emails, numéros de compte, et adresses.

Je ne ferais pas non plus confiance à une phrase rassurante sortie d'un slide fournisseur. La [politique d'usage des données d'Anthropic](https://docs.anthropic.com/en/docs/claude-code/data-usage) montre pourquoi : les règles diffèrent entre usages grand public et commerciaux, l'usage commercial garde l'absence d'entraînement par défaut sauf opt-in, et la rétention standard est documentée séparément des options de zero data retention. Oui, c'est un peu pointilleux, mais c'est exactement le genre de détail qui vous évite une mauvaise promesse à l'équipe juridique ou sécurité.

Parfois, la réponse la plus sûre est l'exécution en local. La [politique de confidentialité d'Ollama](https://ollama.com/privacy) indique que les exécutions locales restent sur votre machine, ce qui peut réduire l'exposition, mais local ne veut pas dire sans souci, parce que les logs, les sauvegardes, et les droits d'accès existent toujours. Je garderais aussi la vue d'ensemble en tête : l'[OWASP LLM Top 10](https://genai.owasp.org/llm-top-10/) considère la divulgation d'informations sensibles comme un risque central des applications LLM, donc je recommande de classer les données avant toute mise en production : public, interne, sensible, restreint.

Si vous ne pouvez pas répondre à trois questions pour un seul trajet de prompt, ne mettez pas encore ce trajet en production pour des données sensibles : ce qui sort de votre système, combien de temps cela reste, et qui peut le récupérer.
