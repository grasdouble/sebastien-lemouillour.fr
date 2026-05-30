---
id: different-types-of-ai-models
order: 6
difficulty: beginner
tags: [IA, LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Si vous débutez, tous les modèles IA finissent par se ressembler. On voit passer des mots comme classificateur, modèle génératif, modèle de diffusion, modèle de langage, système de recommandation, et on a vite l'impression d'un catalogue sans logique. Le bon réflexe n'est pas de mémoriser une liste. C'est de comprendre qu'un type de modèle se définit avant tout par la tâche qu'il résout.

### Première séparation : prédire, classer, générer

Je commencerais par trois grandes familles. Un **modèle de classification** range une entrée dans une catégorie : spam ou non spam, chat ou non chat, avis positif ou négatif. Un **modèle de régression** prédit une valeur numérique, un prix, une durée, une probabilité. Un **modèle génératif** produit un nouveau contenu : du texte, une image, de l'audio. Les [Google ML docs](https://developers.google.com/machine-learning/problem-framing/categorical-data) et [IBM](https://www.ibm.com/think/topics/machine-learning-models) utilisent cette distinction de base parce qu'elle aide immédiatement à choisir une approche.

Pour un débutant, c'est déjà très utile. Si votre but est de ranger, vous ne cherchez pas le même outil que si votre but est de créer.

### Quelques familles que vous rencontrerez souvent

Les **arbres de décision** prennent des décisions par étapes, comme une suite de questions, ils sont souvent plus faciles à expliquer qu'un réseau de neurones. Les **réseaux de neurones** sont des modèles composés de couches de calcul capables d'apprendre des motifs complexes. Les **Transformers** sont un type particulier de réseau de neurones très efficace pour le langage et, de plus en plus, pour d'autres modalités, comme décrit dans le papier fondateur [Transformer](https://arxiv.org/abs/1706.03762). Les **modèles de diffusion** apprennent à générer des images en retirant progressivement du bruit, une idée popularisée par les [Google DeepMind docs](https://deepmind.google/technologies/diffusion/).

Vous croiserez aussi des **modèles multimodaux**, des systèmes capables de traiter plusieurs types de données ensemble, par exemple texte et image. Les [Gemini docs](https://ai.google.dev/gemini-api/docs/models) en donnent un bon exemple.

### Le meilleur modèle n'existe pas

C'est un point que je trouve essentiel : il n'y a pas un "meilleur modèle IA" dans l'absolu. Il y a un modèle plus adapté à une tâche, à une contrainte de coût, à une exigence d'explicabilité ou à un type de données. Un petit arbre de décision peut être préférable à un grand réseau de neurones si vous avez peu de données et besoin d'expliquer chaque décision à un utilisateur ou à un auditeur.

À l'inverse, pour générer du texte naturel ou comprendre des images complexes, les architectures modernes comme les Transformers sont souvent le bon choix. Le piège classique au début est de choisir le modèle le plus célèbre au lieu de choisir celui qui correspond au problème réel.

### La règle qui aide à choisir

Quand vous voyez le nom d'un modèle, ne demandez pas d'abord s'il est à la mode. Demandez : **quelle entrée reçoit-il, quelle sortie produit-il, et quelle erreur me coûterait cher ?** Cette triple question élimine beaucoup de confusion. Si votre prochain doute porte sur le choix entre modèles ouverts et services hébergés, l'étape logique suivante est la comparaison entre open-source et modèles propriétaires.
