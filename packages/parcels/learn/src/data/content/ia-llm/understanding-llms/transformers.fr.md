---
id: transformers
order: 16
difficulty: intermediate
tags: [Transformer, LLM]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Balancez un long brief à un ancien modèle séquentiel et vous retrouvez le même échec agaçant: la réponse démarre avec assurance, puis oublie qui a fait quoi, perd les références et part ailleurs juste avant la partie utile. Les transformers ont réglé ce problème assez bien pour que les LLM modernes héritent encore de l’idée centrale du [papier](https://arxiv.org/abs/1706.03762).

## Pourquoi la récurrence a plafonné

Les modèles récurrents lisent un token après l’autre. L’intuition semble propre jusqu’au moment où il faut entraîner ou servir ça à l’échelle. Le chemin entre deux tokens éloignés s’allonge, les dépendances longues deviennent fragiles, et le matériel accéléré passe trop de temps à attendre un traitement séquentiel. Le papier des transformers a pris le choix le plus direct: utiliser l’auto-attention pour que chaque token puisse regarder les autres dans la même couche, en parallèle.

Ça a réglé le goulot d’étranglement à l’entraînement, mais ça a créé la vraie question pratique: quel type de transformer avez-vous en main ? La famille s’est découpée en formes vraiment utiles: les modèles encodeur seul comme [BERT](https://arxiv.org/abs/1810.04805) pour le travail de représentation, les modèles décodeur seul comme [GPT-3](https://arxiv.org/abs/2005.14165) pour la génération du prochain token, et les modèles encodeur-décodeur comme [T5](https://arxiv.org/abs/1910.10683) quand le problème se formule mieux comme une transformation entrée-sortie.

## Ce que je vérifie avant de croire l’étiquette

Cette taxonomie aide, mais “c’est un transformer” reste trop vague pour prendre une décision produit. J’en vérifie quatre.

D’abord, je veux le variant. Si le travail consiste à générer du texte libre, je pars sur du décodeur seul parce que l’outillage et le chemin de serving sont plus mûrs. Si le travail consiste à classer, faire du ranking ou de la recherche, je préfère démarrer avec un encodeur plutôt que forcer un modèle de chat à jouer au modèle de scoring.

Ensuite, je veux savoir comment le modèle reste rapide pendant la génération. En décodage auto-régressif, réutiliser les clés et valeurs passées n’est pas une micro-optimisation. La doc [HF cache](https://huggingface.co/docs/transformers/en/cache_explanation) montre pourquoi le cache KV coupe le travail d’attention répété à l’inférence. Si le serving désactive ce cache ou le gère mal, le streaming paraît cassé bien avant que la qualité devienne le vrai problème.

Troisième vérification, le budget prompt, parce que le storytelling d’architecture ne paie pas la facture. Le papier original montre déjà où ça coince: l’auto-attention devient chère quand le contexte grossit. Les API hébergées limitent aussi les tokens, et certaines exposent des plafonds séparés pour les requêtes long contexte, comme l’explique [OpenAI](https://platform.openai.com/docs/guides/rate-limits).

Quatrième vérification, la frontière de confiance. Un transformer donne un contexte partagé, pas une isolation des instructions. Si vous versez des pages web, des e-mails ou des PDF récupérés dans le même prompt, le modèle peut quand même suivre du texte malveillant caché dedans tant que votre application n’ajoute pas de garde-fous et de validation. C’est exactement l’alerte prompt injection décrite par [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

Voici le test de bon sens le plus rapide que j’utilise avant de faire confiance à un checkpoint:

```python
from transformers import AutoConfig, AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "gpt2"  # petit checkpoint décodeur seul pour des essais locaux
prompt = "Alice gave Bob the key because"

config = AutoConfig.from_pretrained(model_id)
print("model_type:", config.model_type)
print("max_position_embeddings:", getattr(config, "max_position_embeddings", "unknown"))
print("use_cache:", getattr(config, "use_cache", "unknown"))

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

inputs = tokenizer(prompt, return_tensors="pt")

with torch.inference_mode():
    output_ids = model.generate(
        **inputs,
        max_new_tokens=40,  # borne la latence et le coût en tokens
        do_sample=False,    # run déterministe pour déboguer
        use_cache=True,     # réutilise les clés et valeurs passées au décodage
    )

print(tokenizer.decode(output_ids[0], skip_special_tokens=True))
```

Si `use_cache` vaut false, ou si la limite de contexte du checkpoint est plus petite que vos vrais documents, je traite ça comme un avertissement de déploiement, pas comme une note de bas de page. Et si la tâche relève de la classification ou de la recherche, je change de famille de modèles au lieu d’étirer un décodeur seul vers un travail qu’il n’avait jamais envie de faire.
