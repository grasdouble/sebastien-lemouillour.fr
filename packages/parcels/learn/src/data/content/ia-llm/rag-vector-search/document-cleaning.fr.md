---
id: document-cleaning
order: 13
difficulty: intermediate
tags: [RAG, preprocessing, OCR]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton pipeline RAG a l'air propre sur du Markdown nickel. Puis quelqu'un balance un PDF scanné avec un pied de page sur chaque page, une table des matières collée dans le corps et des ligatures qui transforment le texte en bouillie. Le nettoyage de documents, c'est l'étape que tout le monde remet à plus tard jusqu'au moment où la recherche devient médiocre.

L'erreur que j'ai faite au début, c'était de traiter l'extraction comme un problème déjà réglé. Ce n'est pas le cas. Si tu embarques le texte brut dans l'index, le bruit devient une donnée à part entière. Les en-têtes répétés remontent comme du vrai contenu. Les tokens d'OCR cassés polluent les voisins sémantiques. Quand tu t'en rends compte, tu débogues la recherche alors que le problème vient de l'ingestion.

Je nettoie avant le chunking, systématiquement. Des outils comme [Unstructured](https://docs.unstructured.io/open-source/core-functionality/partitioning) sont utiles parce qu'ils gardent la structure du document au lieu d'écraser tout en une seule chaîne. Quand les PDF partent en vrille, [PyMuPDF](https://pymupdf.readthedocs.io/en/latest/recipes-text.html) donne accès aux blocs et aux coordonnées, ce qui permet de supprimer le chrome de navigation sans deviner à partir du texte. Et si la source est scannée, il faut faire l'OCR proprement avec un outil comme [OCRmyPDF](https://ocrmypdf.readthedocs.io/en/latest/introduction.html), parce qu'une mauvaise extraction ne se rattrape pas ensuite avec un meilleur modèle d'embeddings.

Ce que je nettoie vraiment est assez banal, et c'est précisément pour ça que ça marche :

- les en-têtes et pieds de page répétés
- les numéros de page et le boilerplate juridique
- les retours à la ligne cassés et les espaces absurdes
- le texte dupliqué à cause des couches OCR
- les tableaux transformés en soupe de texte

Le contrat que j'aime à l'indexation ressemble à ça :

```python
from unstructured.partition.pdf import partition_pdf
from unstructured.cleaners.core import clean_extra_whitespace


def normalize_document(path: str) -> list[str]:
    elements = partition_pdf(
        filename=path,
        strategy="hi_res",
        infer_table_structure=True,
    )

    cleaned_chunks = []
    seen = set()

    for element in elements:
        text = clean_extra_whitespace(str(element))
        text = text.replace("Page 1 of 12", "")
        text = text.replace("Confidential", "")
        text = text.strip()

        if len(text) < 40:
            continue
        if text in seen:
            continue

        seen.add(text)
        cleaned_chunks.append(text)

    return cleaned_chunks
```

C'est volontairement simple. Beaucoup d'équipes passent trop vite au nettoyage par LLM. Je ne le fais que pour des classes de documents sales et vraiment importantes, par exemple des factures avec des mises en page spécifiques à chaque fournisseur. Les heuristiques coûtent moins cher, restent déterministes et se testent beaucoup mieux.

Le point que la plupart des tutoriels sautent, c'est la mesure. Il faut suivre la quantité de texte supprimée, le nombre de chunks éliminés et les motifs retirés. Si un nettoyage enlève 30% d'un corpus de contrats, je veux inspecter des échantillons avant de lui faire confiance. Ma règle est simple : si le même bruit apparaît sur plus de quelques pourcents des documents, nettoie-le hors ligne avant l'indexation. Si c'est rare, ne construis pas un pipeline fragile à cause d'un seul PDF mal fichu.
