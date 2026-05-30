---
id: top-k
order: 22
difficulty: intermediate
tags: [LLM, paramètres]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le top-p attire plus l’attention parce qu’il sonne plus élégant. Puis on héberge soi-même un petit modèle, on le voit osciller entre choix de tokens corrects et choix franchement bizarres, et d’un coup un outil plus brutal devient séduisant. Cet outil, c’est le top-k.

## Le top-k impose un plafond dur aux candidats

Le top-k conserve uniquement les `k` tokens suivants les plus probables, puis échantillonne à l’intérieur de cet ensemble. Avec `top_k: 1`, on est pratiquement en décodage glouton. Avec `top_k: 40`, le modèle ne peut choisir qu’entre ses quarante meilleures options à chaque étape.

```json
{ "top_k": 1 }
{ "top_k": 20 }
{ "top_k": 40 }
```

Les [docs Hugging Face](https://huggingface.co/docs/transformers/en/main_classes/text_generation), la documentation [Text Generation Inference](https://huggingface.co/docs/text-generation-inference/en/reference/launcher) et les [sampling params](https://docs.vllm.ai/en/latest/api/vllm/sampling_params.html) de vLLM exposent tous le top-k, justement parce que ce réglage reste très pratique quand on pilote sa propre stack.

Ce que j’aime dans le top-k, c’est sa prévisibilité. Le seuil est fixe. On ne demande pas au décodeur d’estimer combien de masse de probabilité est “suffisante” à chaque étape. On lui dit simplement: quoi qu’il arrive, ne regarde pas au-delà de ce nombre de candidats.

## Quand je le choisis

J’utilise surtout le top-k sur des modèles auto-hébergés ou open weight, en particulier les plus petits. Leurs distributions de tokens sont parfois moins bien calibrées que celles des modèles hébergés de pointe, et un plafond dur est parfois la manière la plus rapide d’empêcher des excursions étranges dans la longue traîne.

Il est aussi utile quand on veut un style très stable sans passer en mode totalement glouton. Un réglage du type `temperature: 0.7, top_k: 40` peut conserver un peu de variété tout en empêchant le décodeur de trop dériver. C’est l’une des raisons pour lesquelles le papier sur la [dégénérescence du texte neuronal](https://arxiv.org/abs/1904.09751) reste pertinent: la stratégie de décodage modifie énormément la qualité de sortie, même à modèle identique.

Il y a aussi un angle opérationnel. Le top-k ne réduit pas la facture des tokens du prompt, mais sur une stack auto-hébergée, il rend souvent le comportement plus facile à diagnostiquer. Si un modèle dérive sans cesse vers du bruit avec `top_k: 200`, resserrer à `40` ou `20` donne une intervention claire et testable. Moins de sorties absurdes, c’est moins de retries et moins de filtrage manuel.

## Là où on le maltraite

L’erreur classique consiste à traiter le top-k comme un contrôle universel des API hébergées. Beaucoup d’API commerciales ne l’exposent pas du tout, ou mettent surtout en avant la température et le top-p. C’est pour ça que je considère d’abord le top-k comme un réglage d’auto-hébergement.

L’autre erreur consiste à le mettre trop bas puis à s’étonner que le modèle devienne répétitif. Un pool de candidats minuscule peut surcontraindre la formulation, surtout sur les générations longues. À l’inverse, une valeur trop haute sur un modèle faible laisse revenir le bruit.

Si je devais choisir entre top-k et top-p, je prendrais en général le top-p pour des modèles hébergés bien calibrés, et le top-k pour des modèles auto-hébergés plus petits ou moins stables quand je veux un plafond dur sur le chaos.

Ma règle: utilisez le top-k quand vous contrôlez l’inférence et que vous avez besoin d’une borne prévisible sur les tokens candidats. Si vous ne savez pas expliquer pourquoi un cutoff dur aiderait votre modèle, laissez-le tranquille ou préférez le top-p.
