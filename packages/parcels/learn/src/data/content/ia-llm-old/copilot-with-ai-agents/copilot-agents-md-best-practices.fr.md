---
id: copilot-agents-md-best-practices
order: 3
difficulty: intermediate
tags: [agents, copilot]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Tu as écrit `AGENTS.md`, ajouté une règle sur les tests, et l'agent fonce quand même dans le code comme s'il allait rater son train. En général, ça veut dire que le fichier porte le mauvais type d'instruction, pas que le modèle a soudain oublié de lire.

## Choisir le fichier avant d'écrire la règle

GitHub documente trois types d'instructions de dépôt sur GitHub.com : le fichier global `.github/copilot-instructions.md`, les fichiers ciblés `.github/instructions/*.instructions.md`, et les instructions d'agent comme `AGENTS.md` ([Guide GitHub des instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot), [Types d’instructions pris en charge](https://docs.github.com/en/copilot/reference/custom-instructions-support)). Cette matrice de prise en charge montre aussi pourquoi le choix du fichier compte : sur GitHub.com, Copilot Chat lit les instructions globales du dépôt, alors que Copilot cloud agent lit aussi les instructions ciblées et les instructions d'agent. `AGENTS.md` peut vivre n'importe où dans le dépôt, le fichier le plus proche dans l'arborescence prenant le dessus pour le travail d'agent. Je préfère choisir le bon fichier avant tout le reste, parce que tout verser dans `AGENTS.md` est la meilleure façon de fabriquer un fourre-tout avec des titres.

Voici la répartition que j'utiliserais dans un projet générique :

```text
my-app/
├─ .github/copilot-instructions.md
├─ .github/instructions/frontend.instructions.md
├─ packages/web/AGENTS.md
└─ packages/api/AGENTS.md
```

Utilise `copilot-instructions.md` pour les règles qui doivent suivre tout le dépôt, utilise `.instructions.md` pour les règles qui n'ont de sens que sur une partie de l'arborescence, et garde `AGENTS.md` pour les contraintes de fonctionnement que l'agent doit respecter pendant son travail.

## Écrire des règles que le modèle peut vraiment auditer

GitHub explique que les instructions personnalisées fonctionnent mieux sous forme d'énoncés courts et autonomes, rappelle que Copilot reste non déterministe, et précise que Copilot code review ne lit que les 4 000 premiers caractères d'un fichier d'instructions personnalisées ([Personnalisation des réponses](https://docs.github.com/en/copilot/concepts/prompting/response-customization)). C'est pour ça que les règles vagues échouent deux fois : elles sont difficiles à suivre et impossibles à vérifier.

Voici le genre de bloc `AGENTS.md` auquel je fais confiance :

```markdown
## Validation

Exécute la suite de tests concernée avant de terminer le travail.

- ✅ Lance `pnpm test --filter my-package`
- ✅ Signale la commande en échec si la validation ne passe pas
- ❌ Marque la tâche comme terminée sans lancer les tests
```

"Fais attention à la sécurité" sonne sérieux, mais ça ne force aucune décision. "Ne copie jamais des valeurs de `.env` dans le code, les exemples ou les logs" est bien meilleur, parce que tu peux vérifier si la règle a été respectée.

## Garder les règles locales dans des fichiers locaux

J'aime `AGENTS.md` pour les instructions qui ont des conséquences, validation obligatoire, actions Git interdites, gestion des secrets, obligations de documentation, habitudes de revue que les outils ne feront pas à ta place. Si la règle concerne surtout un dossier, un langage ou un framework, un fichier d'instructions ciblé reste beaucoup plus propre. VS Code documente les fichiers `.instructions.md` avec une frontmatter `applyTo`, la prise en charge automatique de `.github/copilot-instructions.md` à l'échelle du workspace, et la prise en charge de `AGENTS.md` pour Copilot Chat, tandis que les `AGENTS.md` imbriqués y restent expérimentaux ([Instructions VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)).

Voici le genre de fichier ciblé que je prendrais en premier :

```markdown
---
applyTo: 'packages/web/**/*.{ts,tsx}'
---

# Règles React

- Préfère le HTML sémantique avant d'ajouter des rôles ARIA
- Teste les changements d'état visibles avec React Testing Library
```

Il y a un piège facile à manquer : sur GitHub.com, ce type de règle ciblée aide Copilot cloud agent et Copilot code review, pas Copilot Chat classique.

## Transformer une douleur répétée en règle

Les recommandations générales de GitHub sur Copilot restent la réponse la plus banale et la plus juste : donner un meilleur contexte, vérifier la sortie, puis itérer ([Bonnes pratiques Copilot](https://docs.github.com/en/copilot/using-github-copilot/best-practices-for-using-github-copilot)). Donc quand la même erreur revient deux fois, n'ajoute pas un slogan motivant. Ajoute la plus petite règle qui aurait évité l'erreur, avec la manière la plus simple de la vérifier.

Si je devais fixer un seuil, ce serait celui-ci : mets quelque chose dans `AGENTS.md` uniquement si l'erreur est coûteuse, répétable, et pas déjà imposée par tes outils.
