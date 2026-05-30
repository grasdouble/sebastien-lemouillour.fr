---
id: what-is-rag
order: 1
difficulty: beginner
tags: [RAG, LLM, retrieval, embeddings]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You've built a chatbot. It gives fluent, confident answers. Half of them are wrong because the model doesn't know your docs, your product changes, or the policy update from last Tuesday. That is the moment RAG stops sounding like jargon and starts sounding useful.

[RAG paper](https://arxiv.org/abs/2005.11401) stands for **Retrieval-Augmented Generation**. The name is technical, but the idea is simple: before the LLM answers, the system fetches relevant information from an external source, then asks the model to answer with that material in context. **Retrieval** means finding the right passages. **Generation** means writing the final response.

I think the best mental model is an open-book exam. A plain LLM answers from its internal memory, the numerical patterns stored in its parameters during training. A RAG system lets it open the right pages first. The model is still generating text, but it is no longer guessing in the dark.

In practice, many RAG systems rely on [embeddings guide](https://platform.openai.com/docs/guides/embeddings), which convert text into vectors, ordered lists of numbers that represent meaning. When a user asks a question, the question is embedded too. A similarity engine such as [FAISS](https://faiss.ai/) can then retrieve the nearest chunks quickly. If you want a beginner-friendly way to think about that step, [Sentence Transformers](https://www.sbert.net/) is one of the clearest references because it focuses on sentence-level meaning rather than exact keyword overlap.

That workflow matters because it separates two jobs that beginners often mix up. The LLM is good at producing readable language. Retrieval is good at bringing fresh or private knowledge into the prompt. If your company handbook changes every month, I would choose RAG long before I would choose fine-tuning. Fine-tuning changes model behavior. RAG changes what information the model can access at answer time.

The part most tutorials skip is that RAG is only as good as what it retrieves. If the wrong chunk comes back, the model will confidently write the wrong answer with beautiful grammar. Bad retrieval poisons good generation. That is why chunking, metadata, permissions, and source quality matter much earlier than most people expect.

My rule is simple: if the answer should come from documents that live outside the model's training data, use RAG. If the knowledge is tiny, static, and already fits in a prompt, keep it simpler. The next guide is where that trade-off becomes practical: why teams reach for RAG in real products instead of just admiring the acronym.
