---
id: dpo
order: 25
difficulty: advanced
tags: [fine-tuning]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Si ton plan d'alignement commence encore par « on va d'abord entraîner un modèle de récompense », tu attaques probablement le mauvais goulot d'étranglement. La plupart des équipes ne plantent pas parce qu'il leur manque du RL malin. Elles plantent parce que les données de préférences sont sales et que la boucle d'entraînement coûte trop cher à itérer. C'est pour ça que je testerais DPO avant le RLHF presque à chaque fois.

## Ce que DPO achète vraiment

Le sujet du [papier DPO](https://arxiv.org/abs/2305.18290), ce n'est pas que l'alignement devient soudain facile. Le sujet, c'est que le pipeline modèle de récompense plus RL popularisé par [InstructGPT](https://arxiv.org/abs/2203.02155) peut être remplacé, pour beaucoup de travaux de post-entraînement, par un objectif direct sur des complétions préférées versus rejetées par rapport à un modèle de référence. Opérationnellement, c'est un vrai gain. Moins de pièces mobiles, c'est moins de façons de perdre une semaine sur la plomberie d'entraînement au lieu d'améliorer le comportement.

C'est précisément pour ça que j'aime DPO pour des équipes déjà mûres et un comportement cible clair. Il te faut toujours un modèle de référence et il faut toujours choisir jusqu'où t'en éloigner, mais au moins tu arrêtes de faire semblant que plus de complexité de pipeline achète automatiquement un meilleur alignement.

Si je devais résumer l'arbitrage sur un seul écran, je le poserais comme ça.

| Dimension                 | DPO                                                                                                                   | RLHF                                                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Exigences de données      | Des paires de préférences explicites, avec une qualité qui compte plus que le volume                                  | Des préférences, puis assez de rollouts ou de comparaisons pour entraîner et entretenir un modèle de récompense                             |
| Modèle de récompense      | Inutile                                                                                                               | Obligatoire, et c'est souvent le premier composant qui se dégrade                                                                           |
| Complexité d'entraînement | Un objectif direct contre un modèle de référence, donc une boucle relativement courte                                 | Un pipeline en plusieurs étages avec modèle de récompense, optimisation de politique et plus de plomberie opérationnelle                    |
| Stabilité                 | En général plus simple à régler, mais toujours cassant si les paires sont bruitées ou périmées                        | Davantage de réglages et davantage de manières de partir en vrille ; le gain potentiel n'existe que si l'équipe maîtrise vraiment la boucle |
| Qualité d'alignement      | Excellente quand le comportement cible est déjà bien capturé par des paires choisie/rejetée propres                   | Forte quand il faut un façonnage de récompense plus riche que ce que des paires statiques savent exprimer                                   |
| Recommandé quand          | Tu as déjà des paires choisie/rejetée propres, tu veux itérer vite et tu peux suivre de près la séparation des paires | Tu as besoin d'une optimisation itérative, de plus d'exploration, ou d'un comportement qui ne se laisse pas enfermer proprement hors ligne  |

## Pourquoi la qualité des données devient tout le sujet

Le piège est brutal : DPO rend les mauvaises préférences impossibles à cacher. Les [docs OpenAI](https://developers.openai.com/api/docs/guides/direct-preference-optimization) et la [doc TRL](https://huggingface.co/docs/trl/main/en/dpo_trainer) supposent toutes deux des sorties préférées et non préférées explicites, et OpenAI entraîne actuellement le DPO sur des exemples en un seul tour. Si la réponse choisie n'est que marginalement meilleure que la rejetée, ou si les deux sont loin du trafic réel, le modèle apprend l'hésitation, pas le jugement.

Je préfère largement livrer 20k paires impeccables que 200k paires bruitées. DPO est assez peu coûteux pour que beaucoup oublient que la partie chère s'est simplement déplacée en amont vers l'annotation, la revue et le rafraîchissement du jeu de données. Ce n'est pas un défaut de la méthode. C'est la méthode qui te montre où le vrai travail se cachait.

## Ce qu'il faut surveiller en production

Une fois l'entraînement lancé, arrête de fixer la loss comme si elle suffisait. TRL expose les marges de récompense, les accuracies de récompense, les log-probabilités choisi versus rejeté, et l'entropie. Ce sont ces signaux qui te disent si le modèle sépare réellement la paire ou s'il devient juste plus confiant partout. Si les marges montent pendant que les refus explosent, que la verbosité s'effondre ou que le ton devient bizarre, ton beta est probablement trop agressif pour les données que tu as collectées.

Mon tableau de bord tient en peu de choses : pour DPO, je regarde la marge de récompense, l'accuracy de récompense, l'écart de log-probabilité entre choisi et rejeté, le taux de refus et la dérive de ton. Pour du RLHF, j'ajouterais la dérive du modèle de récompense et les emballements de KL, parce que la boucle supplémentaire ajoute aussi des angles morts.

C'est aussi là que naissent la plupart des plaintes du type « DPO est instable ». L'optimiseur n'est généralement pas le premier problème. Les mauvaises paires, les paires périmées et l'absence d'évals le sont. Si tu tiens à des SLA, traite le rafraîchissement des préférences et les évals post-entraînement comme une partie de la boucle produit, pas comme le ménage après la mise en ligne.

## Là où DPO cesse d'être un bon choix

DPO est un optimiseur de préférences hors ligne, pas un moteur de découverte. Il affine le signal de classement que tu as déjà capturé. Si ton comportement cible change chaque semaine, ou si ta posture de sécurité dépend de nouveaux abus qui arrivent sans arrêt, la boucle d'entraînement bon marché cesse d'être bon marché parce que la maintenance du dataset devient tout le produit.

C'est pour ça que des variantes comme le [papier IPO](https://arxiv.org/abs/2310.12036) continuent d'apparaître. Le domaine se bat encore avec l'overfitting, les mises à jour trop conservatrices et la faiblesse des paires. Donc oui, j'achète l'argument selon lequel DPO est plus simple que le RLHF complet. Je n'achète pas la version paresseuse de cet argument où plus simple voudrait dire indulgent.

## Règle de décision

Choisis DPO quand tu as déjà des paires de préférences stables, un processus de revue assez strict pour jeter les labels limites, et une cible comportementale capable de survivre à un cycle de release sans changer de forme. Évite-le quand tes labels sont bruités ou quand ta cible bouge plus vite que ta boucle d'annotation. Si tu ne peux pas garder ton dataset de paires assez frais jusqu'à la prochaine release, DPO va fossiliser tes erreurs.
