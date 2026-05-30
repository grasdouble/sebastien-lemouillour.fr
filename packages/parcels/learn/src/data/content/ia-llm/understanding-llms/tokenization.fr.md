---
id: tokenization
order: 9
difficulty: beginner
tags: [LLM, tokenisation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous changez un emoji, vous ajoutez un saut de ligne, et le nombre de tokens grimpe d’un coup. Tant qu’on ne voit pas ce qui se passe avant la lecture par le modèle, ça paraît injuste. Cette étape s’appelle la **tokenisation** : c’est le processus qui découpe le texte brut en tokens. Beaucoup de débutants l’ignorent parce que ça sonne très technique, mais je pense que c’est une notion à comprendre tôt. Quand un prompt réagit bizarrement, la tokenisation est souvent la cause invisible.

## Ce que fait vraiment la tokenisation

Un modèle ne lit pas directement des phrases comme nous. Il commence par transformer le texte en petites unités appelées tokens, puis en nombres qu’il peut manipuler. La partie qui découpe le texte, c’est la tokenisation. Le [tokenizer summary](https://huggingface.co/docs/transformers/tokenizer_summary) de Hugging Face explique pourquoi les modèles modernes utilisent souvent des **sous-mots**, c’est-à-dire des morceaux situés entre le mot entier et le caractère isolé.

Pourquoi ne pas couper simplement sur les espaces ? Parce que la langue est désordonnée. Les noms propres, les fautes de frappe, les mots rares, la ponctuation, les URL, les emoji et le code feraient exploser la taille du dictionnaire. Un **vocabulaire**, ici, c’est la liste fixe des morceaux qu’un modèle sait représenter. Les méthodes par sous-mots gardent cette liste à une taille raisonnable tout en permettant de reconstruire des mots inconnus à partir de morceaux connus.

Deux approches reviennent souvent. **Byte Pair Encoding**, ou BPE, fusionne progressivement les morceaux fréquents, tandis que [SentencePiece](https://github.com/google/sentencepiece) peut entraîner un tokenizer sans dépendre des espaces. La bibliothèque [tiktoken](https://github.com/openai/tiktoken) d’OpenAI donne aussi un exemple concret de la façon dont ces tokenizers existent dans des modèles réels.

## Pourquoi une même phrase peut être découpée autrement

C’est souvent la surprise du début : la tokenisation n’est pas universelle. Des modèles différents utilisent des vocabulaires différents et des règles différentes. Une même phrase peut être peu coûteuse pour un modèle et plus chère pour un autre.

Les espaces comptent aussi. Dans beaucoup de tokenizers, un espace placé avant un mot fait partie du token. Cela veut dire que « bonjour » et « bonjour » précédé d’un espace ne correspondent pas forcément à la même unité interne. La ponctuation compte. Les accents aussi. Les chemins de fichiers et les symboles répétés également.

C’est pour ça qu’un copier-coller depuis un PDF, une messagerie ou un éditeur de code peut changer le nombre de tokens sans modifier beaucoup le sens visible. Pour vous, le texte paraît presque identique. Pour le tokenizer, le motif interne a changé.

## Pourquoi je pense que ça vaut le détour

Vous n’avez pas besoin de devenir spécialiste des tokenizers. Je ne passerais pas des heures à étudier leurs tables internes sauf si vous construisez des outils autour des LLMs. En revanche, j’adopterais tôt une habitude simple : inspecter la tokenisation dès que les limites, le coût ou un comportement étrange deviennent importants.

Si un prompt coûte plus cher que prévu, si une langue prend plus de place qu’une autre, ou si un modèle se comporte mal face à une mise en forme bizarre, la tokenisation est un très bon suspect. Votre prochaine étape peut rester très concrète : ouvrez un visualiseur de tokens avec un prompt que vous utilisez souvent, puis testez trois micro-changements, par exemple supprimer des espaces inutiles, nettoyer la ponctuation, ou remplacer un copier-coller issu d’un PDF. Vous verrez vite quels détails de forme méritent vraiment votre attention.
