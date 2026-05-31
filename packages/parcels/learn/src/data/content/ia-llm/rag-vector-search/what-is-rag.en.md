---
id: what-is-rag
order: 1
difficulty: beginner
tags: [rag, embeddings, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You've shipped a chatbot. It sounds sure of itself, then invents an answer about a pricing rule you changed yesterday. That kind of miss is enough to make people doubt the whole feature.

The answer to that problem is what the original [RAG paper](https://arxiv.org/abs/2005.11401) calls **Retrieval-Augmented Generation**. The name sounds academic, but the idea is practical: before the model answers, the system looks up relevant passages in an external source and places them in the prompt. **Retrieval** is the lookup step. **Generation** is the writing step that follows. I would explain it as an open-book exam: the model still writes the answer, but it gets to open the right pages first.

To make that lookup possible, many teams use [embeddings](https://platform.openai.com/docs/guides/embeddings), numerical vectors that place similar pieces of text near one another. The question is turned into an embedding too. A search library such as [FAISS](https://faiss.ai/) can then compare those vectors and return the nearest chunks, meaning small slices of documents, instead of scanning every paragraph one by one.

This is the beginner mistake I see all the time: people expect the model to "know" a new document right after they upload it. It does not work that way. RAG does not retrain the model. It gives the model relevant context at answer time. If what you really need is a model that follows a house style or a fixed output format more consistently, I would look at [fine-tuning](https://platform.openai.com/docs/guides/fine-tuning). If what you need is access to changing documents, I would pick RAG first almost every time.

The tricky part, and yes, this is the part tutorials love to skip, is that RAG only helps when retrieval is good. If the system pulls the wrong chunk, the model can still produce a polished wrong answer. That is why chunking, metadata, permissions, and source quality matter early. Chunking means splitting a long document into smaller pieces. Metadata means labels such as title, product area, or date. Permissions decide which documents a given user is allowed to retrieve. None of that is glamorous, but that is where trust is won or lost.

My rule of thumb is blunt: use RAG when the answer should come from documents that change, stay private, or need to be cited. Skip it when five short, stable facts already fit cleanly in the prompt. If you want the next step, read the guide on why teams use RAG in real products, because that is where the decision gets practical.
