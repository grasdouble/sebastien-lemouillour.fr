---
id: prompt-injection
order: 5
difficulty: beginner
tags: [security, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Vous branchez un assistant utile sur un email ou sur la recherche web, puis il se met soudain à obéir à une phrase cachée dans un document. Ce moment ressemble moins à un bug qu'à un inconnu qui attrape le volant au feu rouge.

Une prompt injection se produit quand du texte non fiable est traité comme une instruction et non comme une simple donnée. Le [guide d'OpenAI](https://platform.openai.com/docs/guides/prompt-injections/understanding-prompt-injections) explique pourquoi : le modèle lit les consignes et le contenu dans le même contexte, donc une phrase malveillante peut rivaliser avec vos vraies règles.

Cette définition compte, parce que le piège classique au début consiste à ne penser qu'à l'attaque évidente, "ignore les instructions précédentes". La version qui m'inquiète davantage est l'injection indirecte. La [recherche d'Anthropic](https://www.anthropic.com/research/prompt-injection-defenses) montre comment une page web, un email, ou un fichier partagé peut cacher des instructions qui demandent à un agent de révéler des prompts cachés ou d'agir au nom de l'utilisateur.

Une fois cela compris, le choix de conception devient plus net : ne considérez pas le modèle comme une frontière de sécurité. La [cheat sheet d'OWASP](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) recommande de séparer les instructions des données récupérées, de limiter les permissions des outils, d'exiger une validation pour les actions à fort impact, et de journaliser les tentatives suspectes. C'est par là que je commencerais, avant d'inventer un détecteur malin, parce que limiter ce que le modèle peut faire reste plus fiable qu'espérer qu'il ne se fera jamais piéger.

Deux termes méritent d'être appris tôt. Le [glossaire du NIST](https://csrc.nist.gov/glossary/term/least_privilege) définit le moindre privilège comme le fait d'accorder à chaque utilisateur ou processus seulement l'accès minimal nécessaire pour faire son travail. Le [terme allowlist du NIST](https://csrc.nist.gov/glossary/term/allowlist) décrit une liste d'autorisation comme un ensemble documenté d'éléments que le système est autorisé à accepter. En pratique, cela revient à pré-approuver les actions, destinations, ou commandes, au lieu de faire confiance au modèle pour improviser en toute sécurité.

Il reste une difficulté frustrante : je ne miserais pas un vrai flux de travail sur un filtre parfait. L'objectif le plus sûr est de réduire les dégâts, pas de viser une détection parfaite.

Ma règle pratique est simple : si le modèle peut envoyer, dépenser, supprimer, ou partager, placez une validation humaine devant, puis lisez le guide suivant pour choisir les autres couches de sécurité à ajouter autour de cette action.
