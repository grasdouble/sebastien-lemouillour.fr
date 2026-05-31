---
id: document-cleaning
order: 13
difficulty: intermediate
tags: [rag]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Your RAG pipeline looks great on neat Markdown, then one scanned PDF poisons the index: footer on every page, table of contents pasted into the body, ligatures that mangle words, duplicated OCR text. I treat document cleaning as retrieval prevention work, not as formatting polish.

I learned that the hard way. Raw extraction output is not neutral. If you embed it as-is, the noise becomes searchable. Repeated headers rank like answers. OCR garbage contaminates semantic neighbors. Weeks later, you blame embeddings when the real bug happened during ingestion.

I clean before chunking, always. [Unstructured partitioning](https://docs.unstructured.io/open-source/core-functionality/partitioning) is my default because it extracts typed elements instead of flattening everything into one string. When layout is the real issue, [PyMuPDF blocks](https://pymupdf.readthedocs.io/en/latest/recipes-text.html) gives me coordinates and block-level text so I can remove navigation chrome deterministically. And when the file is really a scan, I run [OCRmyPDF intro](https://ocrmypdf.readthedocs.io/en/latest/introduction.html) first, because searchable text layers are a prerequisite, not an optional cleanup pass.

The next trap is mixing cleaning and splitting into one blurry step. I keep them separate. Clean first, then split with a structure-aware splitter such as [LangChain splitters](https://python.langchain.com/docs/concepts/text_splitters/). I also keep source metadata on every chunk because filtering and citation get harder once page numbers disappear, and [Pinecone metadata](https://www.pinecone.io/learn/retrieval-augmented-generation/) is a good reminder that retrieval quality is not just about embeddings.

The version I would ship for most teams is a deterministic pass with explicit thresholds, not an LLM rewrite.

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
        strategy="hi_res",  # keep layout-aware extraction for messy PDFs
        infer_table_structure=True,  # avoid flattening tables into text soup
    )
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,  # conservative size for most embedding pipelines
        chunk_overlap=120,  # preserve context across chunk boundaries
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

I only pay for LLM-based cleaning when a document family is both high value and too irregular for regex plus layout rules, for example vendor invoices with wildly different templates. Otherwise the extra API cost, latency, and rate-limit pressure are a bad trade. Deterministic cleaning is cheaper, easier to test, and easier to explain when legal or support teams ask why a chunk vanished.

My threshold is blunt: if cleaning removes more than about 20% of characters, or if table content changes shape, I review samples before indexing. If the same junk shows up in more than roughly 5% of files, automate the cleanup. If it is rarer than that, fix those documents manually and keep the pipeline boring.
