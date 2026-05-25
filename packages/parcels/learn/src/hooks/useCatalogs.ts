import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Catalog } from '../data/learn';
import { RAW_CATALOGS } from '../data/learn';

type UseCatalogsResult = {
  catalogs: Catalog[];
};

export function useCatalogs(): UseCatalogsResult {
  const { t } = useTranslation('learn');

  const catalogs = useMemo<Catalog[]>(
    () =>
      RAW_CATALOGS.map((raw) => ({
        id: raw.id,
        title: t(`catalogs.items.${raw.id}.title`),
        description: t(`catalogs.items.${raw.id}.description`),
        guideIds: raw.guideIds,
      })),
    [t]
  );

  return { catalogs };
}
