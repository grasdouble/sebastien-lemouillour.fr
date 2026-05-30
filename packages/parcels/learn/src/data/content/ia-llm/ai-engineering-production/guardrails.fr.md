---
id: guardrails
order: 19
difficulty: advanced
tags: [LLM, security, guardrails, OWASP]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Votre fonctionnalité IA marche. Les utilisateurs adorent. Puis un utilisateur comprend comment lui faire ignorer le prompt système, exposer les instructions internes et appeler un outil avec des paramètres absurdes. Les garde-fous, c'est le travail que personne ne veut financer avant l'incident. L'erreur classique consiste à les traiter comme une couche de modération ajoutée à la fin. En production, les garde-fous sont des points de contrôle autour de tout le cycle de requête.

Le [Top 10 OWASP LLM](https://owasp.org/www-project-top-10-for-large-language-model-applications/) est un meilleur point de départ que la plupart des schémas d'architecture, parce qu'il nomme les vraies pannes qui vous coûtent cher : prompt injection, fuite de données sensibles, sorties dangereuses. Cette liste doit changer votre design. Je ne fais pas confiance à un seul classifieur posé devant le modèle. Je veux trois rails : validation d'entrée avant l'inférence, contraintes sur les outils pendant l'exécution, validation de sortie avant que la réponse quitte le système.

C'est pour ça que j'aime [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) et [Guardrails AI](https://www.guardrailsai.com/docs). Ce ne sont pas des baguettes magiques, et ça ne rattrape pas une mauvaise décision produit, mais ces frameworks vous obligent à rendre les règles explicites. Explicite bat implicite, à chaque fois. Si un modèle peut chercher, envoyer un email ou appeler une API interne, le garde-fou doit vivre au niveau de cette capacité, pas dans un paragraphe poli caché dans le prompt système.

Un flux de prod minimal ressemble plus à une passerelle qu'à un wrapper de chat. Mettez le contrat dans le code, puis laissez le modèle évoluer à l'intérieur.

```python
policy = {
    "max_prompt_chars": 12000,
    "blocked_topics": ["credentials", "payment card data"],
    "tool_allowlist": ["search_docs", "create_ticket"],
}

user_input = validate_input(message, policy)
response = llm.generate(user_input, tools=policy["tool_allowlist"])
validated = validate_output(response, schema=AnswerSchema)

if validated.escalate:
    return route_to_human(validated.reason)

return validated.answer
```

Regardez surtout ce qui manque : des listes de mots-clés qui prétendent régler l'abus. Les vrais garde-fous sont contextuels. Ils savent quels outils sont disponibles, quelles classes de données sont présentes et quel mode d'échec mérite une escalade plutôt qu'un refus silencieux. Ils doivent aussi rester alignés avec les règles du fournisseur, par exemple les [usage policies d'OpenAI](https://openai.com/policies/usage-policies), parce que votre politique interne et celle du vendor sont deux barrières différentes.

L'opérationnel compte plus que le framework choisi. Journalisez chaque action bloquée, chaque override, chaque échec de schéma. Revoyez les faux positifs toutes les semaines. Si des utilisateurs déclenchent un rail et que personne ne sait expliquer pourquoi, vous avez construit du théâtre, pas de la sécurité.

Mon seuil est simple : si le modèle peut agir au nom d'un utilisateur, les garde-fous sont obligatoires. S'il peut toucher à l'argent, à des données privées ou à des systèmes de production, des étapes d'approbation déterministes valent mieux que des prompts ingénieux.
