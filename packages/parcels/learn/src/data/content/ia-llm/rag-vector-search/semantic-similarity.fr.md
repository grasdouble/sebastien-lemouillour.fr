---
id: semantic-similarity
order: 4
difficulty: beginner
tags: [rag, embeddings, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Votre barre de recherche fonctionne, et pourtant les utilisateurs ratent encore des réponses évidentes. Quelqu'un écrit « comment arrêter de payer ? » alors que votre contenu dit « résilier mon abonnement ». Une recherche par mots-clés peut hausser les épaules devant cette paire, alors qu'un humain voit tout de suite qu'il s'agit de la même intention. La similarité sémantique est l'outil que je choisis quand la formulation change mais pas le sens.

Le premier correctif consiste à transformer le texte en [embedding](https://platform.openai.com/docs/guides/embeddings). Un embedding est une représentation numérique d'un texte, et OpenAI décrit ces embeddings comme des vecteurs dont la distance reflète le degré de parenté. Le mot « vecteur » impressionne souvent au début, mais l'idée utile est simple : c'est une coordonnée qui place chaque phrase sur une carte du sens. Si deux phrases atterrissent près l'une de l'autre sur cette carte, elles parlent probablement de la même chose.

Une fois que vous avez ces vecteurs, il faut une manière de les comparer. La [cosine similarity](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html) mesure à quel point deux vecteurs pointent dans la même direction. Pas besoin de tomber amoureux de la formule. Pour un débutant, le bon réflexe mental est plus simple : un score de cosinus plus élevé signifie souvent un sens plus proche, même si les mots changent.

Un minuscule exemple rend tout cela beaucoup moins brumeux avant même de toucher à une base de données :

```python
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity

client = OpenAI()

def embed(text: str):
    return client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    ).data[0].embedding

documents = [
    "Cancel your subscription",
    "Update your payment method",
]
query = "How do I stop paying?"

doc_vectors = [embed(text) for text in documents]
query_vector = embed(query)

scores = cosine_similarity([query_vector], doc_vectors)[0]
best_match = documents[scores.argmax()]
print(best_match)
```

J'aime cet exemple parce qu'il montre le vrai travail : attribuer un score à plusieurs textes candidats, puis garder le plus proche. Quand vous dépassez le stade de la petite liste en mémoire, des outils comme [pgvector](https://github.com/pgvector/pgvector) peuvent stocker les vecteurs et trier les lignes par distance, et des systèmes comme [Pinecone semantic search](https://docs.pinecone.io/guides/search/semantic-search) peuvent renvoyer les enregistrements les plus proches d'une requête. « Plus proche voisin » signifie simplement : le texte stocké dont le vecteur est le plus proche de celui de votre requête.

Voilà le piège, et je préfère le dire tôt aux débutants : la similarité sémantique aide beaucoup, mais elle ne lit pas dans les pensées. Elle peut confondre des textes qui partagent du vocabulaire sans partager la même intention, et elle peut rater des identifiants exacts comme des numéros de facture, des codes produit ou des clauses juridiques. Ma règle est simple : si 2 ou 3 requêtes sur un petit lot de 10 sont des paraphrases que la recherche par mots-clés manque, la similarité sémantique commence déjà à mériter sa place. Si la formulation exacte fait foi, gardez la recherche par mots-clés dans la boucle, puis passez au guide suivant sur la recherche vectorielle pour voir comment récupérer ces voisins efficacement.
