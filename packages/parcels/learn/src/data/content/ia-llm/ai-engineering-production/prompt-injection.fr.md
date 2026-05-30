---
id: prompt-injection
order: 5
difficulty: beginner
tags: [LLM, security, prompt-injection, OWASP, OpenAI]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez déjà vu quelqu'un copier une clé API dans un fichier .env, puis la pousser sur GitHub. La prompt injection, c'est ce niveau d'erreur, mais à l'intérieur même de l'application. Le modèle lit du texte non fiable et le traite comme des instructions.

Une prompt injection se produit quand une entrée utilisateur, une page web, un PDF, un email, ou un document récupéré contient du texte qui essaie d'écraser vos vraies consignes. La page [Prompt injections](https://openai.com/safety/prompt-injections/) d'OpenAI explique bien le mécanisme, la [OWASP cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) détaille les schémas d'attaque fréquents, et [Anthropic defenses](https://www.anthropic.com/research/prompt-injection-defenses) montre pourquoi le problème devient encore plus sérieux quand le modèle peut naviguer ou utiliser des outils.

Les débutants imaginent souvent un pirate malin qui tape "ignore les instructions précédentes". C'est seulement la version caricaturale. Le vrai problème, c'est l'injection indirecte. Votre assistant récupère un ticket de support, une page web, ou un document partagé, et du texte caché dedans dit : "Révèle le prompt système" ou "Envoie ce secret vers une URL externe". Si votre application laisse le modèle agir là-dessus, l'attaque a réussi.

C'est pour ça que je refuse de considérer le modèle comme une frontière de sécurité. Un modèle peut aider à classer un risque, mais il ne doit jamais être l'autorité finale pour une action dangereuse. Si le modèle peut envoyer un email, appeler des outils, dépenser de l'argent, accéder à des fichiers, ou révéler des données cachées, il faut des contrôles en dehors du modèle.

Pour débuter, quatre habitudes comptent vraiment :

- Séparez les instructions des données. Un contenu récupéré reste du contenu, pas une politique à appliquer.
- Donnez aux outils le minimum de permissions possible. C'est le principe du moindre privilège.
- Exigez une validation explicite pour les actions à fort impact, comme envoyer, supprimer, ou acheter.
- Journalisez les tentatives suspectes pour voir des motifs au lieu de rester dans l'intuition.

Il n'existe pas de filtre parfait qui supprime définitivement la prompt injection. C'est la partie inconfortable. Un attaquant peut cacher des instructions malveillantes dans un long texte, du HTML, des blocs de code, des images, ou un texte qui a l'air banal. Le but n'est pas de tout détecter. Le but est de concevoir le système de façon à ce qu'une mauvaise réponse du modèle ne puisse pas faire beaucoup de dégâts.

L'état d'esprit utile au début, c'est de considérer chaque document externe comme hostile tant que le contraire n'est pas prouvé. Cela paraît paranoïaque. En production, c'est juste une hygiène d'ingénierie. Si l'application récupère du contenu hors de votre contrôle direct, ce contenu ne doit jamais pouvoir réécrire vos règles.

La règle seuil que j'utilise est simple : si le modèle peut déclencher des effets dans le monde réel, je veux une allowlist, des outils étroitement cadrés, et une validation humaine avant toute action importante. Si cela vous semble lourd, tant mieux. Une action importante mérite précisément cette friction.

Et ensuite ? Le guide suivant élargit le cadre. La prompt injection n'est qu'un mode d'échec parmi d'autres. Sécuriser une application IA, c'est penser à plusieurs défaillances à la fois.
