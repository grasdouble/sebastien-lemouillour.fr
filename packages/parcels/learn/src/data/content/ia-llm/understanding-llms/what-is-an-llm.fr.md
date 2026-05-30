---
id: what-is-an-llm
order: 4
difficulty: beginner
tags: [LLM]
publishedAt: 2026-05-30
updatedAt: 2026-05-31
---

Vous ouvrez un chatbot parce que la page blanche est en train de gagner. Il vous rend un email correct en dix secondes, puis arrive la partie agaçante : tout le monde appelle cette magie « un LLM » et passe à autre chose. Si cet acronyme vous semble flou, tant mieux. Il cache souvent la seule idée qui compte vraiment.

### Un LLM est d'abord une machine à texte

Voici la définition que je choisirais : un **LLM** est un **modèle**, c'est-à-dire un système mathématique dont le comportement vient de **paramètres** appris, des valeurs numériques ajustables ; il travaille sur le **langage**, donc sur du texte ; et il est **large** parce que ce système peut contenir des milliards de paramètres. L'article sur [GPT-3](https://arxiv.org/abs/2005.14165) donne un ordre de grandeur concret : GPT-3 avait 175 milliards de paramètres.

Cette définition reste abstraite, donc la bonne question suivante est simple : qu'est-ce qu'une aussi grosse machine à texte apprend vraiment à faire ? Pas à « tout savoir ». Sa tâche centrale est bien plus étroite.

### Il apprend en devinant la suite du texte

Pendant l'entraînement, un LLM apprend à prédire le morceau de texte suivant à partir du contexte précédent, le principe de base décrit dans [Attention Is All You Need](https://arxiv.org/abs/1706.03762). L'unité qu'il prédit s'appelle un **token**, un petit morceau de texte qui peut être un mot entier, un fragment de mot ou un signe de ponctuation. Le [Tokenizer](https://platform.openai.com/tokenizer) d'OpenAI permet de le voir en quelques secondes.

C'est le point que les débutants sous-estiment souvent. En devenant très bon à la prédiction du token suivant sur d'immenses corpus, le modèle apprend la grammaire, le style, des faits fréquents et beaucoup de régularités du langage. C'est pour cela que le même outil peut rédiger un email, réécrire un paragraphe ou expliquer une notion plus simplement sans changer de cerveau.

### Pourquoi cela donne une impression d'intelligence

L'architecture Transformer compte parce qu'elle aide le modèle à utiliser le contexte au lieu de traiter chaque mot séparément. Le modèle mental que je préfère n'est ni « une petite personne dans une boîte » ni « un moteur de recherche avec des opinions ». C'est « une autocomplétion extrêmement puissante ». Cette comparaison est utile parce qu'elle explique à la fois la partie impressionnante et la partie risquée.

### Pourquoi il peut avoir l'air sûr de lui et se tromper

Une fois cette idée d'autocomplétion en tête, le problème suivant devient plus clair. Le modèle est entraîné à produire une suite plausible, pas à s'arrêter pour vérifier une affirmation dans le monde réel. La plupart des systèmes de chat sont aussi ajustés après le pré-entraînement pour mieux suivre les consignes, souvent avec des méthodes de retour humain comme celle décrite dans [InstructGPT](https://arxiv.org/abs/2203.02155). Cela les rend plus utiles, mais pas plus proches d'une machine à vérité.

C'est pour cela que j'utiliserais un LLM avec confiance pour rédiger, résumer, traduire ou réorganiser du texte, et avec prudence pour la médecine, le droit, la finance ou tout sujet qui dépend de faits récents. La fluidité est une vraie compétence. Ce n'est pas une preuve.

### La règle que j'utiliserais

Si votre tâche consiste surtout à façonner du langage, commencez par un LLM. Si elle repose surtout sur des faits vérifiés, des événements récents ou des décisions à fort enjeu, traitez le LLM comme un premier brouillon et allez chercher une source fiable avant d'y croire. Ensuite, lisez le guide suivant sur la génération token par token, parce que c'est à ce moment-là que ces systèmes cessent d'avoir l'air mystiques et deviennent plus prévisibles.
