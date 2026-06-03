---
id: llm-limitations
order: 14
difficulty: beginner
tags: [llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

Le plus agaçant, ce n’est pas qu’un LLM donne de mauvaises réponses tout le temps. C’est qu’il peut paraître calme, utile et convaincant juste avant de se tromper sur quelque chose d’important. Un **grand modèle de langage (LLM)** est entraîné à prédire les tokens probables suivants, c’est-à-dire de petits morceaux de texte, un pas après l’autre ([GPT-3 paper](https://arxiv.org/abs/2005.14165)). Cet entraînement le rend très bon pour produire du langage. Il n’en fait pas un vérificateur de faits intégré.

## La fluidité ne garantit pas la fiabilité

C’est cet écart qui surprend les débutants. Quand un modèle écrit avec aisance, on commence à le traiter comme une personne qui sait. Moi, je ne ferais pas ça. Le [rapport GPT-4](https://arxiv.org/abs/2303.08774) montre des capacités fortes, mais documente aussi des sorties inexactes et peu fiables. Quand un modèle invente une source ou affirme un fait faux avec assurance, le problème n’est pas son ton. Le système génère du langage, il ne vérifie pas automatiquement la réalité.

C’est pour ça que je séparerais vite les usages. Rédiger un mail, reformuler des notes ou chercher des idées de titres, oui. Un conseil fiscal, une question médicale, un calcul exact ou un sujet qui dépend d’informations à jour, non, pas sans autre vérification.

## Plus de contexte aide, mais jusqu’à un certain point

Une fois cette première limite comprise, le réflexe suivant consiste souvent à coller plus de matière. Parfois, ça aide, surtout si on donne aussi des outils au modèle. La documentation [Anthropic tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) montre comment un modèle peut appeler des systèmes externes au lieu de deviner, et le [papier RAG](https://arxiv.org/abs/2005.11401) décrit la génération augmentée par récupération, ou **RAG**, où le modèle répond à partir de documents fournis.

Je ne partirais quand même pas du principe qu’un énorme prompt règle le problème. Une **fenêtre de contexte** est la quantité de texte tokenisé qu’un modèle peut traiter dans une requête. Même quand tout tient, certaines parties peuvent être mal utilisées. [Lost in the Middle](https://arxiv.org/abs/2307.03172) a montré que les modèles à long contexte exploitent souvent mieux l’information placée au début ou à la fin que celle enfouie au milieu. Ma préférence va à des preuves plus petites, bien étiquetées, plutôt qu’à un énorme collage.

## De petits changements de prompt peuvent changer le résultat

C’est le dernier choc classique quand on débute : on pose presque deux fois la même question et on obtient deux réponses sensiblement différentes. Ce comportement est suffisamment courant pour que les fournisseurs eux-mêmes recommandent de tester les prompts sur des exemples concrets. Le guide [OpenAI prompting](https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt) recommande de tester et d’itérer sur les prompts au lieu de supposer qu’une seule formulation sera toujours la bonne. Je testerais donc le cas précis qui m'intéresse, plutôt que de me fier à la réputation du modèle ou à une démonstration réussie en conditions idéales.

## Ce que je choisirais en pratique

J'utiliserais un LLM comme moteur de premier brouillon et comme explicateur patient. Je ne l'utiliserais pas seul pour des faits à fort enjeu. Ma règle est simple : si le prix d'une erreur, c'est de la confiance, de l'argent ou de la sécurité, le modèle ne devrait pas travailler sans source, sans outil ou sans relecture humaine.
