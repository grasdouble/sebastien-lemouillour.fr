import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Catalog } from '../data/learn';
import { isPublished, RAW_CATALOGS, RAW_LEARN_ITEMS } from '../data/learn';
import { useShowUnpublished } from './useShowUnpublished';

type UseCatalogsResult = {
  catalogs: Catalog[];
  groupedCatalogs: Record<string, Catalog[]>;
};

export function useCatalogs(): UseCatalogsResult {
  const { t } = useTranslation('learn');
  const showUnpublished = useShowUnpublished();

  const catalogs = useMemo<Catalog[]>(
    () =>
      RAW_CATALOGS.filter((raw) => {
        if (showUnpublished) return true;
        const firstGuideId = raw.guideIds[0];
        if (!firstGuideId) return false;
        const firstGuide = RAW_LEARN_ITEMS.find((item) => item.id === firstGuideId);
        return firstGuide ? isPublished(firstGuide.publishedAt) : false;
      }).map((raw) => ({
        id: raw.id,
        categoryKey: raw.categoryKey,
        category: t(`categories.${raw.categoryKey}`),
        order: raw.order,
        title: t(`catalogs.items.${raw.id}.title`),
        description: t(`catalogs.items.${raw.id}.description`),
        guideIds: raw.guideIds,
      })),
    [t, showUnpublished]
  );

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
