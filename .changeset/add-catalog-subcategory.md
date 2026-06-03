---
'@grasdouble/slm_parcel_learn': minor
---

feat: add subcategory field to catalogs for hierarchical organization.

Added a new `subcategory` field to all catalog metadata (catalog.json files) with bilingual support (FR/EN). Subcategories represent a level within the parent category: "fondamentaux"/"fundamentals", "usage", "avancé"/"advanced", or "engineering".

This change distinguishes catalog subcategories from guide tags:
- **Catalog.subcategory** (string) — represents the catalog's level/purpose within its category
- **Tutorial.tags** (string[]) — represents guide-specific topics/keywords

Implementation includes:
- Updated type definitions (Catalog, CatalogTranslations) with `subcategory: string` field
- Added subcategory to all 16 catalogs across all categories (ia-llm, ia-llm-old, tooling, architecture)
- Updated data parsing logic to extract subcategory from translations
- Added comprehensive tests to ensure all catalogs have valid bilingual subcategories
- Updated CatalogCard component to display subcategory as a green badge alongside the guide count

Subcategories help users quickly identify the level and purpose of each catalog at a glance, while keeping the namespace separate from guide tags for future filtering features.
