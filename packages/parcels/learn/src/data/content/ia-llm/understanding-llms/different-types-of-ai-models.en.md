---
id: different-types-of-ai-models
order: 6
difficulty: beginner
tags: [IA, LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You've read about "AI" and "machine learning," but when you try to choose a tool for a specific problem, you hit a wall of model names and jargon. What is the difference between a classification model and a generative model? Why does the type matter? This guide maps the main families so you can make informed decisions.

### Models That Predict a Category or Number

The oldest and most widely deployed AI models are **supervised learning** models. You give them labeled examples (input-output pairs) and they learn to predict the output for new inputs.

**Classification models** predict which category an input belongs to: spam or not spam, benign or malignant, cat or dog. These run invisibly in your bank's fraud detection, your email inbox, and your social media feed every day.

**Regression models** predict a continuous value rather than a category: tomorrow's temperature, the expected price of a house, the probable delivery time of a package. Both classification and regression have been in production for decades and are among the most well-understood forms of AI.

### Models That Find Structure Without Labels

**Unsupervised learning** models, including **clustering** algorithms, work without labeled data. They find natural groupings or patterns in raw data. A retailer might cluster customers by purchasing behavior without knowing in advance what the groups will look like. These models are less about prediction and more about discovery.

A related family is **dimensionality reduction**: techniques like [PCA (Principal Component Analysis)](https://en.wikipedia.org/wiki/Principal_component_analysis) or embeddings that compress high-dimensional data into a smaller space while preserving meaningful relationships. Embeddings in particular are a building block of modern LLMs and power semantic search.

### Models That Learn Through Interaction

**Reinforcement Learning (RL)** models learn by taking actions in an environment and receiving rewards or penalties. This is how [DeepMind's AlphaGo](https://deepmind.google/research/breakthroughs/alphago/) learned to play Go at a superhuman level. It is also a core technique used to fine-tune LLMs to follow instructions, through the process called RLHF.

### Generative and Multimodal Models

Generative models learn the distribution of training data well enough to produce new samples: text, images, audio, video. This is the family that includes LLMs, image generators, and music generation systems. They attract the most press attention right now, but they are one category among many.

**Multimodal models** go further by accepting and producing multiple types of input and output together, mixing images, audio, and text in a single model. [GPT-4o](https://openai.com/index/hello-gpt-4o/) and [Gemini](https://deepmind.google/technologies/gemini/) are prominent examples.

### How to Pick the Right Type

The rule I'd apply: match the model type to the structure of your problem, not to what is currently trending. If you have labeled historical data and want to predict a binary outcome, a classification model will likely outperform a generative one, cost far less to run, and be much easier to explain to stakeholders. Generative models are genuinely transformative for open-ended tasks, but they are overkill, and often worse, for structured prediction problems.

Start with the simplest model type that could plausibly solve your problem. Add complexity only when you have evidence that it is needed.
