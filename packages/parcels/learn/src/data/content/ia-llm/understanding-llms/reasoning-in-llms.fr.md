---
id: reasoning-in-llms
order: 19
difficulty: intermediate
tags: [reasoning, llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

Le mode d’échec le plus agaçant d’un LLM, ce n’est pas le non-sens complet. C’est la réponse propre, détaillée, convaincante, et pourtant fausse. C’est pour ça que je ne traite pas le “raisonnement” comme une ambiance ou un badge marketing. Je le traite comme une capacité qu’il faut acheter, déclencher et vérifier avec soin.

## Le raisonnement, c’est un budget, pas de la magie

Un modèle raisonne bien quand trois choses s’alignent: le modèle de base possède la capacité latente, le prompt expose correctement la structure de la tâche, et le budget d’inférence laisse assez de place pour des étapes intermédiaires. Le papier [Chain-of-Thought](https://arxiv.org/abs/2201.11903) a montré que de grands modèles peuvent mieux réussir sur des tâches multi-étapes quand on leur demande de produire un raisonnement intermédiaire. Le résultat était important, mais il a aussi appris aux gens un mauvais réflexe: demander à tous les modèles de “penser étape par étape”, même quand la tâche est triviale.

Je ne ferais pas ça par défaut. Le [guide OpenAI](https://platform.openai.com/docs/guides/reasoning) explique qu’un effort de raisonnement plus élevé échange vitesse et consommation de tokens contre de la qualité, et la doc [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking) décrit le même compromis avec la profondeur de réflexion et les budgets de tokens. Si la tâche est courte ou facile à vérifier, ce supplément de raisonnement ressemble souvent à une facture plus lente.

## Quand je paierais pour ça

Le prompting commence à valoir son prix quand la tâche est vraiment multi-étapes et que la réponse finale peut être vérifiée. Le papier [self-consistency](https://arxiv.org/abs/2203.11171) est la meilleure version de cette idée: on échantillonne plusieurs chemins de raisonnement, puis on garde la réponse de consensus. Je réserverais ça aux maths, aux tâches symboliques ou aux décisions coûteuses, parce qu’on paie littéralement plusieurs tentatives pour n’en garder qu’une.

Il reste alors le vrai problème: et si le modèle manque surtout d’informations, pas de réflexion ? Dans ce cas, j’arrête de lui demander de “réfléchir plus fort” et je passe aux outils. Le papier [ReAct](https://arxiv.org/abs/2210.03629) a vu juste: un peu de raisonnement, une preuve externe, puis on continue. Ce schéma est généralement plus fiable qu’un long monologue qui essaie d’inventer des données qu’il n’a pas.

## Mon réglage par défaut

Je commence avec un niveau de raisonnement low ou medium, j’exige des citations ou une sortie d’outil, et je n’augmente le budget qu’après avoir vu des échecs qui ressemblent à un manque de délibération plutôt qu’à un manque de données. C’est aussi là que le débit se dégrade vite: les [rate limits](https://platform.openai.com/docs/guides/rate-limits) d’OpenAI suivent à la fois les requêtes et les tokens, donc un prompt “plus prudent” peut quand même casser la capacité s’il gonfle trop la réponse.

Voici le point de départ que je mettrais réellement en production avant de payer pour plus de réflexion:

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",  # modèle capable de raisonner
    reasoning={"effort": "low"},  # commencer peu cher, augmenter après les evals
    input=[
        {
            "role": "user",
            "content": "Calcule la TVA due sur 420 € à 20 %. Retourne seulement le nombre.",
        }
    ],
    max_output_tokens=80,  # plafonner le coût et éviter une réponse verbeuse
)

print(response.output_text)
```

Si les prompts peuvent contenir des secrets, des données client ou des règles internes, je n’exposerais pas le raisonnement brut aux utilisateurs finaux juste parce que le fournisseur sait le renvoyer. Anthropic renvoie la réflexion dans des blocs distincts, donc je la traite comme quelque chose à filtrer, journaliser avec prudence, ou ne pas afficher du tout.

Ma règle est simple: je paie pour plus de raisonnement seulement quand la tâche est multi-étapes, vérifiable de l’extérieur, et assez coûteuse pour qu’une réponse plus lente reste moins chère qu’une réponse fausse.
