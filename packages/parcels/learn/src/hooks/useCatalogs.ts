import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Catalog } from '../data/learn';
import { isPublished, RAW_CATALOGS, RAW_LEARN_ITEMS } from '../data/learn';
import { useDevMode } from './useDevMode';

type UseCatalogsResult = {
  catalogs: Catalog[];
  groupedCatalogs: Record<string, Catalog[]>;
};

export function useCatalogs(): UseCatalogsResult {
  const { t, i18n } = useTranslation('learn');
  const devMode = useDevMode();

  const catalogs = useMemo<Catalog[]>(() => {
    const lang = (i18n.resolvedLanguage ?? i18n.language).split('-')[0] as 'fr' | 'en';

    return RAW_CATALOGS.filter((raw) => {
      if (devMode) return true;
      const firstGuideId = raw.guideIds[0];
      if (!firstGuideId) return false;
      const firstGuide = RAW_LEARN_ITEMS.find((item) => item.id === firstGuideId);
      return firstGuide ? isPublished(firstGuide.publishedAt) : false;
    }).map((raw) => {
      const localizedTranslations = raw.translations[lang] ?? raw.translations.fr;
      return {
        id: raw.id,
        categoryKey: raw.categoryKey,
        category: t(`categories.${raw.categoryKey}`),
        order: raw.order,
        title: localizedTranslations.title,
        description: localizedTranslations.description,
        subcategory: localizedTranslations.subcategory,
        guideIds: raw.guideIds,
      };
    });
  }, [t, i18n.language, i18n.resolvedLanguage, devMode]);

  const groupedCatalogs = useMemo<Record<string, Catalog[]>>(() => {
    const groups: Record<string, Catalog[]> = {};
    for (const catalog of catalogs) {
      if (!groups[catalog.category]) groups[catalog.category] = [];
      groups[catalog.category].push(catalog);
    }
    for (const group of Object.values(groups)) {
      group.sort((a, b) => a.order - b.order);
    }
    return groups;
  }, [catalogs]);

  return { catalogs, groupedCatalogs };
}
