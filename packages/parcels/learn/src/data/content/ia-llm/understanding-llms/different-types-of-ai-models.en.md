---
id: different-types-of-ai-models
order: 6
difficulty: beginner
tags: [llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You open one AI tool and see “classifier.” You open another and see “LLM,” short for **large language model**. A third promises “multimodal reasoning.” It feels like shopping in a hardware store where every box is labeled in a language you do not speak yet. The fastest way to calm that down is not to memorize model names. It is to ask one question first: what kind of output do you actually need?

### Start With The Output

If you need a model to choose a label such as “spam” or “not spam,” you are in **classification**. Google defines classification as predicting which class, meaning category, an example belongs to ([Google classification](https://developers.google.com/machine-learning/crash-course/classification)). If you need a number such as a price or delivery time, you are in **regression**, which predicts a numerical value from data ([Google regression](https://developers.google.com/machine-learning/crash-course/linear-regression)).

Both usually sit inside **supervised learning**, which means the model learns from examples that already include the right answer. If I had clean labeled data and a clear success metric, I would start here before touching a generative model. It is cheaper, easier to debug, and usually easier to explain.

### What If You Do Not Have The Right Answers Yet?

Sometimes you have data but no labels, which means nobody has tagged each example with the correct category. Then you move to **unsupervised learning**. The most common beginner example is **clustering**, which groups similar unlabeled examples together ([Google clustering](https://developers.google.com/machine-learning/clustering/overview)).

That solves one problem, but not the next one. Real datasets can have too many **dimensions**, meaning too many numerical features to compare comfortably. **Embeddings** are compact numerical representations that place similar things closer together in a smaller space, which is why they are so useful for search and recommendations ([Google embeddings](https://developers.google.com/machine-learning/crash-course/embeddings/video-lecture)).

### What If The System Must Learn By Trial And Error?

Some problems are less like sorting email and more like learning a game. In **reinforcement learning**, or **RL**, the model improves by taking actions and receiving rewards or penalties. The classic mental picture is a player getting points for good moves. DeepMind’s [AlphaGo](https://www.nature.com/articles/nature16961) is the famous example: it learned Go through reinforcement learning and self-play rather than from a neat table of correct answers.

I would not reach for RL unless the task truly is interactive, because it is much harder to train and evaluate than basic supervised learning.

### When Do Generative And Multimodal Models Matter?

If the job is to produce new text, images, or audio, you are in **generative AI**. A **multimodal** model goes one step further and handles more than one kind of data, such as text plus image, in the same system. Google’s [Gemini docs](https://ai.google.dev/gemini-api/docs/models) describe models that work across text, images, audio, and video, which is the practical beginner meaning of multimodal.

This is where the hype lives, but I would treat it as a last stop, not a default. If your task has one right answer that you can score, a classifier or regressor is usually the saner first bet.

If I had to translate all that theory into actual product choices, this is the comparison table I would keep nearby:

| Model type                  | What it outputs                                                     | Typical inputs                                                 | Example use cases                                              |
| --------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| Classification model        | One label from a fixed set                                          | Structured features, text, or signals paired with known labels | Spam detection, fraud flags, ticket routing                    |
| Regression model            | One numerical value                                                 | Historical examples with measurable outcomes                   | Price estimation, delivery-time prediction, demand forecasting |
| Clustering model            | Groups or segments                                                  | Unlabeled examples described by comparable features            | Customer segmentation, anomaly grouping, dataset exploration   |
| Embedding model             | A numerical vector                                                  | Text, images, or other content you want to compare by meaning  | Semantic search, recommendations, deduplication                |
| Text generation model (LLM) | New text                                                            | Prompts, instructions, conversation history, documents         | Drafting, summarization, rewriting, extraction with guardrails |
| Image generation model      | New images                                                          | Text prompts, reference images, style cues                     | Concept art, marketing visuals, mockups                        |
| Multimodal model            | Text, structured answers, or actions grounded in several modalities | A mix of text, images, audio, or video                         | Image Q&A, document understanding, visual agents               |

Here is a summary of the six families to keep the full picture in view:

| Family                 | Output type               | Concrete example      | When to choose                                                         |
| ---------------------- | ------------------------- | --------------------- | ---------------------------------------------------------------------- |
| Classification         | Discrete label            | Spam filter           | The answer is one category from a fixed set                            |
| Regression             | Numerical value           | Price estimate        | The answer is a continuous number                                      |
| Clustering             | Groups                    | Customer segmentation | No labels, you are looking for hidden structure                        |
| Embeddings             | Numerical vector          | Semantic search       | Similarity, recommendation, dimension reduction                        |
| Reinforcement learning | Action in an environment  | AlphaGo               | The task is interactive with rewards and penalties                     |
| Generative AI          | New text, image, or audio | ChatGPT, DALL-E       | The output is open-ended and cannot be scored against one right answer |

If your next question is less "which family?" and more "which provider?", read the guide on open-source vs proprietary models next. My threshold is simple: if success can be measured with a clear correct answer, start with classification or regression; only jump to a generator when the job is truly open-ended.
