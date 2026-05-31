---
id: document-cleaning
order: 13
difficulty: intermediate
tags: [rag]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Ton pipeline RAG a l'air solide sur du Markdown propre, puis un seul PDF scanné empoisonne l'index : pied de page sur chaque page, table des matières collée dans le corps, ligatures qui massacrent les mots, texte OCR dupliqué. Je traite le nettoyage de documents comme de la prévention pour la recherche, pas comme une retouche de mise en forme.

Je l'ai appris à mes dépens. Le texte brut extrait n'est pas neutre. Si tu l'indexes tel quel, le bruit devient lui aussi récupérable. Les en-têtes répétés remontent comme des réponses. Les déchets d'OCR contaminent les voisins sémantiques. Quelques semaines plus tard, tu accuses les embeddings alors que le vrai bug s'est produit à l'ingestion.

Je nettoie avant le chunking, systématiquement. [Unstructured partitioning](https://docs.unstructured.io/open-source/core-functionality/partitioning) est mon point de départ parce qu'il extrait des éléments typés au lieu d'écraser tout le document en une seule chaîne. Quand le vrai problème est la mise en page, [PyMuPDF blocks](https://pymupdf.readthedocs.io/en/latest/recipes-text.html) me donne les coordonnées et le texte par bloc pour retirer le chrome de navigation de façon déterministe. Et quand le fichier est en réalité un scan, je lance [OCRmyPDF intro](https://ocrmypdf.readthedocs.io/en/latest/introduction.html) d'abord, parce qu'une couche de texte exploitable est un prérequis, pas une finition optionnelle.

Le piège suivant, c'est de mélanger nettoyage et découpe dans la même étape floue. Je les sépare. D'abord je nettoie, ensuite je découpe avec un splitter sensible à la structure comme [LangChain splitters](https://python.langchain.com/docs/concepts/text_splitters/). Je garde aussi les métadonnées source sur chaque chunk, parce que le filtrage et la citation deviennent pénibles dès que les numéros de page disparaissent, et [Pinecone metadata](https://www.pinecone.io/learn/retrieval-augmented-generation/) rappelle bien que la qualité de la recherche ne dépend pas uniquement des embeddings.

La version que je mettrais en prod pour la plupart des équipes, c'est un nettoyage déterministe avec des seuils explicites, pas une réécriture par LLM.

```python
import re
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from unstructured.cleaners.core import clean_extra_whitespace
from unstructured.partition.pdf import partition_pdf

HEADER_FOOTER_PATTERNS = [
    re.compile(r"^page \d+ of \d+$", re.IGNORECASE),
    re.compile(r"^confidential$", re.IGNORECASE),
]


def clean_and_chunk_pdf(path: str) -> list[dict]:
    elements = partition_pdf(
        filename=path,
        strategy="hi_res",  # garde une extraction sensible à la mise en page
        infer_table_structure=True,  # évite d'écraser les tableaux en soupe de texte
    )
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,  # taille prudente pour la plupart des pipelines d'embeddings
        chunk_overlap=120,  # garde du contexte entre les frontières de chunks
    )

    seen = set()
    chunks = []

    for element in elements:
        lines = clean_extra_whitespace(str(element)).splitlines()
        kept_lines = [
            line.strip()
            for line in lines
            if line.strip()
            and not any(pattern.match(line.strip()) for pattern in HEADER_FOOTER_PATTERNS)
        ]
        text = re.sub(r"\s+", " ", " ".join(kept_lines)).strip()

        if len(text) < 40:
            continue
        if text in seen:
            continue

        seen.add(text)
        page_number = getattr(element.metadata, "page_number", None)

        for chunk in splitter.split_text(text):
            chunks.append(
                {
                    "text": chunk,
                    "metadata": {
                        "source": Path(path).name,
                        "page": page_number,
                        "element_type": type(element).__name__,
                    },
                }
            )

    return chunks
```

Je ne paie pour un nettoyage par LLM que lorsqu'une famille de documents est à la fois critique et trop irrégulière pour des regex plus des règles de mise en page, par exemple des factures fournisseurs aux gabarits très différents. Sinon, le coût API, la latence et la pression sur les rate limits font un mauvais échange. Un nettoyage déterministe coûte moins cher, se teste mieux et s'explique mieux quand une équipe juridique ou support demande pourquoi un chunk a disparu.

Ma règle est directe : si le nettoyage retire plus ou moins 20% des caractères, ou si la forme des tableaux change, je relis des échantillons avant d'indexer. Si le même bruit apparaît dans plus ou moins 5% des fichiers, j'automatise le nettoyage. Si c'est plus rare, je corrige ces documents à la main et je garde un pipeline ennuyeux.
