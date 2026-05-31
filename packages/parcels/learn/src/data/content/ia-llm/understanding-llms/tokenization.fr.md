---
id: tokenization
order: 9
difficulty: beginner
tags: [tokens, llm]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Vous remplacez un emoji, vous ajoutez un saut de ligne, et le nombre de tokens grimpe sans raison visible. La première fois, ça donne surtout l’impression que le modèle triche. Le point agaçant, c’est qu’il ne lit pas votre texte comme vous. Il commence par une étape de conversion appelée **tokenisation**, qui découpe le texte en petits morceaux avant tout le reste.

## Ce que le modèle voit en premier

Un modèle ne travaille pas directement sur des phrases telles que nous les lisons. Il transforme d’abord le texte en **tokens**, puis en identifiants numériques, comme l’explique [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/ai/conceptual/understanding-tokens). Un token peut être un mot entier, un morceau de mot, un signe de ponctuation, ou même un espace collé au mot suivant.

Cette idée répond à un vrai problème. Si un modèle stockait chaque mot possible tel quel, le **vocabulaire**, c’est-à-dire la liste fixe des morceaux qu’il connaît, deviendrait immense et fragile. Les tokenizers modernes utilisent donc souvent des **sous-mots**, des morceaux plus petits qu’un mot entier mais plus grands qu’un caractère isolé. Dans le [papier BPE](https://aclanthology.org/P16-1162/), les morceaux fréquents sont fusionnés progressivement pour garder les formes courantes compactes tout en permettant de reconstruire les mots rares à partir de parties plus petites.

Une autre famille, [SentencePiece](https://github.com/google/sentencepiece), peut s’entraîner directement à partir de phrases brutes au lieu de dépendre d’abord des espaces. C’est utile parce que certaines langues ne séparent pas les mots comme l’anglais, et même en français, un texte collé depuis un PDF peut embarquer des espaces bizarres que l’œil remarque à peine.

## Pourquoi de minuscules changements font bouger le compteur

C’est le point que j’apprendrais tôt : la tokenisation dépend du modèle. Je choisirais toujours les outils de comptage propres au modèle plutôt que des estimations au nombre de caractères. Le guide [token counting](https://developers.openai.com/api/docs/guides/token-counting) d’OpenAI précise que le compte exact dépend du contenu réellement envoyé au modèle et que les raccourcis locaux ratent des détails comme les fichiers, les images, les outils et certains comportements propres au modèle.

Voilà pourquoi une même phrase peut être bon marché pour un modèle et plus coûteuse pour un autre. Un espace en tête, un retour à la ligne, des guillemets copiés depuis un PDF, ou une ponctuation répétée peuvent produire d’autres morceaux en interne. Pour vous, le texte semble presque identique. Pour le tokenizer, le motif a changé.

## Ce que je ferais vraiment

Je n’essaierais pas d’apprendre par cœur les tables de fusion sauf si je construisais des outils autour des tokenizers. Pour débuter, une seule habitude suffit : inspecter les tokens dès que le coût, les limites, ou un comportement étrange commencent à compter. Une **fenêtre de contexte**, c’est le nombre maximal de tokens qu’un modèle peut traiter dans une seule requête, et la tokenisation explique souvent pourquoi cette limite arrive plus vite que prévu.

Il faut garder une limite en tête. La tokenisation vous dit comment le texte est découpé et compté, pas si votre prompt est clair ou utile. Si vous voulez une suite concrète, collez un vrai prompt dans un visualiseur de tokens et testez trois retouches : supprimer les sauts de ligne décoratifs, remplacer une ponctuation étrange issue d’un copier-coller, et raccourcir le texte de remplissage. Si le prompt reste petit et peu coûteux, passez à autre chose. S’il approche de la limite du modèle ou que le compteur réagit de façon surprenante, inspectez la tokenisation avant de réécrire tout le prompt.
