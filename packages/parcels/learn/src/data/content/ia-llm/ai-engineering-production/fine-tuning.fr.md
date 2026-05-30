---
id: fine-tuning
order: 7
difficulty: intermediate
tags: [LLM, fine-tuning, OpenAI, Transformers]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Votre prompt marche sur la majorité des requêtes, puis s'effondre précisément sur celles dont les gens se souviennent : jargon métier, format de sortie strict, ton qui doit ressembler à votre boîte et pas à un chatbot générique. Le fine-tuning peut corriger ça, mais c'est aussi la manière la plus rapide de dépenser du budget sur le mauvais problème.

Ma position est assez nette : je ne fine-tune rien tant que le prompting, le retrieval et les evals ne sont pas devenus ennuyeux. Tous les tutoriels parlent des epochs et du learning rate. Très peu parlent vraiment de la qualité du dataset, alors que c'est là que le temps passe. Si vos exemples se contredisent, recopient d'anciennes erreurs ou ne montrent que des cas propres, l'entraînement va surtout figer ces défauts dans le modèle.

Il y a deux chemins sérieux. Si vous voulez une infra managée et des itérations rapides, [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning) est le trajet le plus court entre un dataset et un endpoint de prod. Si vous avez besoin de contrôler la boucle d'entraînement, les checkpoints et les adapters, le [guide Transformers](https://huggingface.co/docs/transformers/training) est la référence à garder ouverte. Dans les deux cas, le hardware rattrape vite le sujet, et [NVIDIA](https://developer.nvidia.com/deep-learning) rappelle bien que la VRAM et la bande passante mémoire décident souvent si votre idée tient en vrai.

Le raccourci que j'utilise consiste à formuler l'échec répétitif avant d'écrire une ligne de code. « Être meilleur en support » n'est pas entraînable. « Répondre aux questions sur les plans dans notre format d'escalade, citer correctement les limites contractuelles et poser une question de clarification quand l'état du compte manque » l'est.

Le genre de dataset que je veux au départ ressemble davantage à ça qu'à un export massif non trié.

```json
{"messages":[{"role":"system","content":"You are a B2B SaaS support copilot."},{"role":"user","content":"Is SSO included in the Pro plan?"},{"role":"assistant","content":"SSO is available on the Enterprise plan. Mention that clearly, offer the upgrade path, and ask whether they already use SAML."}]}
{"messages":[{"role":"system","content":"You are a B2B SaaS support copilot."},{"role":"user","content":"Can you confirm our data retention period?"},{"role":"assistant","content":"State the exact retention window from policy, avoid guessing, and ask for the workspace region if the policy depends on residency."}]}
```

Je préfère 400 exemples propres comme ceux-là à 40 000 exemples brouillons. Séparez train et eval tout de suite. Gardez un petit holdout rempli de cas moches, pas d'exemples marketing. Si le modèle ne progresse que sur des prompts vitrine, vous n'avez pas un succès d'entraînement, vous avez une illusion de benchmark.

Quand le budget matériel est serré, c'est là que [bitsandbytes](https://huggingface.co/docs/bitsandbytes/) devient utile, parce que le chargement et l'entraînement en précision réduite remettent des petites équipes dans la course. Ça ne sauvera toujours pas un mauvais dataset. Le fine-tuning est un levier, pas de la magie.

Ma règle de décision est simple : si vous n'avez pas quelques centaines d'exemples de haute qualité, ou si votre pile prompt plus RAG bouge encore chaque semaine, ne fine-tunez pas. Si le même échec revient sur des centaines de conversations labellisées et que le choix du modèle de base est déjà stable, alors le fine-tuning devient enfin l'option économique.
