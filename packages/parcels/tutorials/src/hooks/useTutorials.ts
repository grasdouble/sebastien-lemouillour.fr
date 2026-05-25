import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Tutorial } from '../data/tutorials';
import { ALL_TAGS, CATEGORY_KEYS, RAW_TUTORIALS } from '../data/tutorials';

type UseTutorialsResult = {
  tutorials: Tutorial[];
  allTags: readonly string[];
  categoryOrder: string[];
};

export function useTutorials(): UseTutorialsResult {
  const { t, i18n } = useTranslation('tutorials');

  const tutorials = useMemo<Tutorial[]>(
    () =>
      RAW_TUTORIALS.map((raw) => ({
        id: raw.id,
        categoryKey: raw.categoryKey,
        difficulty: raw.difficulty,
        tags: raw.tags,
        title: t(`tutorials.${raw.id}.title`),
        description: t(`tutorials.${raw.id}.description`),
        category: t(`categories.${raw.categoryKey}`),
        content: raw.content[i18n.language as 'fr' | 'en'] ?? raw.content.fr,
      })),
    [t, i18n.language]
  );

  const categoryOrder = useMemo<string[]>(() => CATEGORY_KEYS.map((key) => t(`categories.${key}`)), [t]);

  return { tutorials, allTags: ALL_TAGS, categoryOrder };
}
