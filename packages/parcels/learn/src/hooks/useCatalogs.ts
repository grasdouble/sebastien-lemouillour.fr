import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Catalog } from '../data/learn';
import { RAW_CATALOGS } from '../data/learn';

type UseCatalogsResult = {
  catalogs: Catalog[];
  groupedCatalogs: Record<string, Catalog[]>;
};

export function useCatalogs(): UseCatalogsResult {
  const { t } = useTranslation('learn');

  const catalogs = useMemo<Catalog[]>(
    () =>
      RAW_CATALOGS.map((raw) => ({
        id: raw.id,
        categoryKey: raw.categoryKey,
        category: t(`categories.${raw.categoryKey}`),
        title: t(`catalogs.items.${raw.id}.title`),
        description: t(`catalogs.items.${raw.id}.description`),
        guideIds: raw.guideIds,
      })),
    [t]
  );

  const groupedCatalogs = useMemo<Record<string, Catalog[]>>(() => {
    const groups: Record<string, Catalog[]> = {};
    for (const catalog of catalogs) {
      if (!groups[catalog.category]) groups[catalog.category] = [];
      groups[catalog.category].push(catalog);
    }
    return groups;
  }, [catalogs]);

  return { catalogs, groupedCatalogs };
}
