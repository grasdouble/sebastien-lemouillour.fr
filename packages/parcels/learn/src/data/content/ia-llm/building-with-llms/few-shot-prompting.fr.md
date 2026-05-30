---
id: few-shot-prompting
order: 6
difficulty: beginner
tags: [LLM, prompting, few-shot, examples]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Un exemple a corrigé le cas facile, puis le modèle s'est complètement emmêlé sur les cas bizarres. C'est le signal que la tâche a besoin de plus qu'un simple indice.

Le **few-shot prompting** consiste à donner au modèle plusieurs paires entrée-sortie avant de lui demander de résoudre un nouveau cas. Dans le jargon du prompting, un **shot** n'est rien d'autre qu'un exemple. Des fournisseurs comme [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies), [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) et [OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) décrivent tous les exemples comme un moyen central d'orienter le comportement du modèle. Quand le one-shot vacille, c'est la chose que j'essaie juste après.

### Pourquoi quelques exemples battent un paragraphe parfait

Certaines tâches sont difficiles à définir avec des mots abstraits. Les labels métier, les politiques de modération, le tri de tickets support, les règles d'extraction ou un style maison vivent souvent plus naturellement dans des exemples que dans des définitions.

Le few-shot marche parce qu'il apprend au modèle où se trouvent les limites du motif. Un exemple dit : « fais quelque chose comme ça ». Plusieurs exemples disent : « voilà la ligne, et voilà comment elle se courbe ». C'est bien plus utile quand les cas limites comptent vraiment.

### Ce qui fait de bons exemples few-shot

Les exemples doivent être cohérents dans leur format et variés dans leur contenu. La cohérence du format enseigne la structure. La variété du contenu enseigne la règle. Si tous les exemples se ressemblent trop, le modèle risque de mémoriser des formulations de surface au lieu du vrai motif.

C'est le genre de configuration que j'aime pour une tâche de classification accessible aux débutants.

```text
Classe chaque message client comme Praise, Problem ou Question.
Réponds avec un seul label.

Exemple 1 :
Message : "Le parcours d'onboarding était clair et j'ai tout configuré en cinq minutes."
Label : Praise

Exemple 2 :
Message : "Je ne peux pas réinitialiser mon mot de passe parce que l'email n'arrive jamais."
Label : Problem

Exemple 3 :
Message : "Est-ce que vous gérez le SSO sur l'offre starter ?"
Label : Question

Classe maintenant ce message :
"Le design est propre, mais je n'arrive toujours pas à exporter mes factures."
```

Regardez ce que font réellement ces exemples. Ils sont courts, ils utilisent tous la même mise en forme, et ils couvrent des cas différents. Toute l'utilité est là.

### Le compromis qu'on explique rarement assez clairement

Les prompts few-shot sont puissants, mais ils deviennent aussi plus longs. Des prompts plus longs prennent plus de place dans la fenêtre de contexte et demandent plus d'entretien. Si vous continuez à empiler des exemples, il est possible que vous compensiez en réalité une définition de tâche qui reste floue.

Mon seuil est très pratique : si trois à cinq exemples ne stabilisent toujours pas le comportement, j'arrête d'ajouter des shots et j'envisage une approche plus systématique, comme une meilleure évaluation ou le [fine-tuning](https://platform.openai.com/docs/guides/fine-tuning). Après ce guide, c'est là que j'irais voir, parce qu'à partir du moment où un prompt commence à ressembler à un mini manuel scolaire, le vrai problème dépasse souvent la simple formulation.
