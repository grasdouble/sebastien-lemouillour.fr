---
id: semantic-similarity
order: 4
difficulty: beginner
tags: [RAG, LLM, embeddings, similarity]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Un utilisateur écrit « comment arrêter de payer ? » alors que votre centre d'aide contient un article intitulé « résilier mon abonnement ». Une recherche par mots-clés peut rater ce lien, alors qu'un humain comprend immédiatement que l'idée est presque la même. La similarité sémantique sert précisément à combler cet écart.

**Sémantique** renvoie au sens. **Similarité** renvoie à la proximité. La similarité sémantique, c'est donc une manière d'estimer si deux textes expriment des idées voisines, même s'ils n'utilisent pas les mêmes mots. Pour un système de retrieval, c'est beaucoup plus important qu'on ne le croit au début, parce que les vrais utilisateurs ne formulent presque jamais leurs questions comme l'équipe qui rédige la documentation.

L'astuce la plus courante consiste à transformer les phrases en vecteurs grâce au [embeddings guide](https://platform.openai.com/docs/guides/embeddings). Un vecteur, ici, n'est qu'une liste de nombres. Dit comme ça, cela paraît abstrait, et c'est normal. Ce qui compte, c'est le rôle de ces nombres : ils placent chaque phrase dans un espace mathématique où les sens proches se retrouvent près les uns des autres. Des bibliothèques et familles de modèles comme [Sentence Transformers](https://www.sbert.net/) ont justement été conçues pour rendre exploitable ce niveau de sens à l'échelle de la phrase.

Une fois les textes représentés sous forme de vecteurs, on peut les comparer avec une mesure comme la [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity). Les formules ont l'air impressionnantes au premier regard, mais l'intuition est plutôt douce : si deux vecteurs pointent presque dans la même direction, les textes sous-jacents parlent probablement d'un sujet voisin. Vous n'avez pas besoin d'aimer l'algèbre linéaire pour comprendre l'idée. Chez moi, le déclic est venu quand j'ai cessé de regarder les nombres pour penser à des couples comme « remboursement » et « argent rendu », ou « congés payés » et « vacation policy ».

Un bon [Pinecone guide](https://www.pinecone.io/learn/vector-search/) montre bien la conséquence pratique : la recherche sémantique se soucie moins de la formulation exacte que de la proximité conceptuelle. C'est pour cela qu'elle fonctionne si bien dans un système RAG. L'utilisateur formule sa question d'une manière, la documentation emploie d'autres mots, et le système a quand même une chance réaliste de retrouver les bons passages.

La difficulté, que beaucoup de tutoriels évitent poliment, c'est que la similarité sémantique n'est pas de la télépathie. Des mots proches peuvent porter des intentions différentes, et le vocabulaire métier change tout. Dans une application médicale, « positif » peut être une bonne nouvelle ou une très mauvaise. Dans la facturation, « charge » peut désigner des frais ou une accusation. C'est pour cela que je préfère toujours tester la retrieval avec dix vraies requêtes un peu sales d'utilisateurs plutôt qu'avec dix exemples impeccables écrits par l'équipe.

Mon conseil par défaut tient en une phrase : si les utilisateurs et les documents décrivent la même idée avec des formulations différentes, la similarité sémantique mérite d'être comprise tôt. Si votre contenu dépend d'identifiants exacts, de codes produit ou de formulations juridiques strictes, combinez-la avec une recherche par mots-clés au lieu d'en faire une religion. Le guide suivant transforme cette idée de proximité en mécanisme concret : la recherche vectorielle.
