---
id: cost-of-using-an-llm
order: 2
difficulty: beginner
tags: [production, tokens, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Vous mettez en ligne une petite fonctionnalité LLM, quelques personnes la testent, et la question gênante tombe tout de suite : on parle de monnaie de poche ou du budget café du mois prochain ? Ne vous inquiétez pas si ça vous paraît encore abstrait, moi aussi j'ai vraiment compris le sujet le jour où j'ai arrêté de chiffrer « l'IA » en bloc pour chiffrer une vraie requête.

C'est le réflexe que je recommande presque à chaque fois. Une facture mensuelle, c'est juste un coût par requête répété encore et encore, avec quelques surprises agaçantes qui s'ajoutent au passage.

Pour chiffrer une requête, il vous faut un mot nouveau : token. Un token, c'est un petit morceau de texte, pas un mot entier, et le guide Anthropic sur le [comptage des tokens](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) montre bien comment les fournisseurs les comptent. Si vous voulez que l'idée arrête de ressembler à de la magie, le [tokenizer OpenAI](https://platform.openai.com/tokenizer) vous laisse coller du texte et voir immédiatement comment il est découpé.

Une fois les tokens compris, la surprise suivante arrive avec la facturation. La plupart des API distinguent les tokens d'entrée, le texte que vous envoyez, et les tokens de sortie, le texte généré en retour, et la [tarification OpenAI](https://developers.openai.com/api/docs/pricing) comme la [tarification Anthropic](https://docs.anthropic.com/en/docs/about-claude/pricing) montrent vite pourquoi c'est souvent la sortie qui pique en premier. C'est pour ça que je raccourcirais les réponses avant de toucher à autre chose.

Le modèle mental que j'utilise tient en trois phrases. Le coût par requête, c'est le coût d'entrée plus le coût de sortie. La base mensuelle, c'est ce coût multiplié par le nombre de requêtes. Le vrai coût mensuel, c'est cette base plus les nouvelles tentatives automatiques, les essais ratés et le pic de trafic que personne n'avait mentionné pendant le cadrage.

Quand je dois expliquer la facture à une équipe produit, je la ramène d'abord à ce tableau.

| Poste de coût    | Formule                                                                                       | Ordre de grandeur typique                                                                             | Levier d'optimisation                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tokens d'entrée  | `(tokens_entrée / 1M) × prix_entrée`                                                          | Souvent peu coûteux par requête, jusqu'au moment où prompt, historique et contexte retrieval gonflent | Raccourcir le prompt système, plafonner les chunks récupérés et mettre en cache les préfixes réutilisables |
| Tokens de sortie | `(tokens_sortie / 1M) × prix_sortie`                                                          | C'est souvent la ligne qui pique en premier dès que les réponses s'allongent                          | Baisser le max tokens, demander des formats plus serrés et couper la génération dès que la réponse suffit  |
| Embeddings       | `(tokens_embeddés / 1M) × prix_embedding`                                                     | Généralement modéré à l'appel, mais visible lors des gros chantiers d'indexation                      | Dédupliquer les documents, chunker proprement et ré-embedder seulement le contenu modifié                  |
| Fine-tuning      | `tokens_d'entraînement × prix_d'entraînement` plus stockage ou hébergement si facturés à part | Dépense ponctuelle ou périodique, pas une taxe constante par requête                                  | Ne fine-tunez qu'après avoir déjà assaini prompts et retrieval                                             |
| Hébergement      | `tarif horaire du endpoint ou du GPU × durée d'activation`                                    | Devient dominant dès que vous auto-hébergez ou gardez des endpoints chauds 24/7                       | Autoscaler agressivement, prévoir des périodes froides et ajuster la taille du modèle                      |

Les débutants sous-estiment presque toujours cette troisième ligne. Un prompt qui échoue puis repart n'est pas « juste un nouvel essai », c'est un appel payant de plus. Un énorme prompt système renvoyé à chaque requête n'est pas de la plomberie invisible, c'est une dépense répétée. Les deux pages de tarification montrent aussi des tarifs réduits pour certains tokens d'entrée mis en cache, ce qui veut dire que des préfixes de prompt réutilisés peuvent coûter moins cher, mais je ne compterais pas là-dessus pour sauver un design brouillon. Des prompts plus courts et des réponses plus petites restent des habitudes bien plus fiables.

Alors, par où commencer ? Moi, je partirais d'un budget par utilisateur actif, pas d'un modèle favori. Si un utilisateur actif ne peut coûter que quelques centimes par jour, il faudra sans doute des prompts plus courts, moins de documents récupérés ou un modèle plus petit. Si une réponse fait gagner un vrai temps de travail ou protège un vrai revenu, vous pouvez vous permettre un modèle plus capable et une réponse plus longue.

Une première estimation simple suffit largement. Prenez un prompt court, un prompt moyen et un pire cas franchement moche de votre application. Comptez les tokens d'entrée, estimez une longueur de réponse réaliste, appliquez les tarifs du fournisseur, puis multipliez par le trafic quotidien attendu. Ajoutez ensuite une marge de sécurité légèrement frustrante. Si le chiffre reste confortable après ça, vous êtes probablement dans la bonne zone.

Ma mise en garde tient en une idée. Ne comparez pas les modèles avant d'avoir comparé la manière réelle dont la fonctionnalité est utilisée. Un modèle moins cher avec des prompts gonflés peut perdre face à un meilleur modèle utilisé avec discipline. Si votre estimation grossière dépasse déjà la valeur de l'action utilisateur, coupez d'abord le contexte ou la longueur de sortie.
