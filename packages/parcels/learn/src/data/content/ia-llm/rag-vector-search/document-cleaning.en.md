---
id: document-cleaning
order: 13
difficulty: intermediate
tags: [RAG, preprocessing, OCR]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your RAG pipeline looks solid on clean Markdown. Then someone uploads a scanned PDF with a footer on every page, a table of contents pasted into the body, and ligatures that turn “office” into nonsense. Document cleaning is the step people postpone until retrieval quality collapses.

The mistake I made early was treating parsing as a solved problem. It is not. If you embed raw extraction output, the noise becomes part of the index. Repeated headers start ranking like real content. Broken OCR tokens pollute semantic neighbors. By the time you notice, you are debugging retrieval when the damage happened during ingestion.

I clean before chunking, always. Tools like [Unstructured](https://docs.unstructured.io/open-source/core-functionality/partitioning) help because they preserve document structure instead of flattening everything into one string. When PDFs get weird, [PyMuPDF](https://pymupdf.readthedocs.io/en/latest/recipes-text.html) gives you lower-level access to blocks and coordinates, which is often what you need to strip navigation chrome instead of guessing from text alone. And if the source is a scan, run OCR deliberately with something like [OCRmyPDF](https://ocrmypdf.readthedocs.io/en/latest/introduction.html), because bad text extraction is not a retrieval problem you can fix later with a smarter embedding model.

What I actually clean is boring, and that is why it works:

- repeated headers and footers
- page numbers and legal boilerplate
- broken whitespace and line wraps
- duplicated text from OCR layers
- tables that turned into unreadable text soup

The contract I like at indexing time looks like this:

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

This is intentionally simple. Most teams jump too fast to LLM-based cleaning. I only reach for an LLM when the document class is messy and high value, for example invoices with vendor-specific layouts. Heuristics are cheaper, deterministic, and easier to test.

The thing most tutorials skip is measurement. Track how much text you remove, how many chunks disappear, and which patterns you strip. If a cleaning pass removes 30% of a contract corpus, I want to inspect samples before I trust it. My rule is blunt: if the same junk appears on more than a few percent of documents, clean it offline before indexing. If it is rare, do not build a fragile pipeline around one ugly PDF.
