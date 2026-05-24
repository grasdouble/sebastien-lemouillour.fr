---
'@grasdouble/slm_parcel_tutorials': minor
---

feat: améliore l'organisation des cards tutoriels par catégorie et niveau de difficulté.

- Ajoute les champs `category` et `difficulty` au type `Tutorial`
- Exporte `CATEGORY_ORDER` pour définir l'ordre d'affichage des catégories
- Sépare le niveau de difficulté des tags topiques (débutant/intermédiaire/avancé → beginner/intermediate/advanced)
- Groupe les cards par catégorie (IA & LLM, Tooling, Architecture) avec des en-têtes de section
- Affiche le niveau de difficulté via un badge coloré (success/warning/error) dans l'en-tête de chaque card
- Utilise les clés i18n existantes pour les labels de difficulté
- Corrige le bouton "Effacer les filtres" pour qu'il ne s'affiche que si des filtres sont actifs
