import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Difficulty, Tutorial } from '../data/learn';
import { ALL_TAGS, CATEGORY_KEYS, DIFFICULTIES, RAW_LEARN_ITEMS } from '../data/learn';

type UseLearnResult = {
  tutorials: Tutorial[];
  allTags: readonly string[];
  allDifficulties: readonly Difficulty[];
  categoryOrder: string[];
};

export function useLearn(): UseLearnResult {
  const { t, i18n } = useTranslation('learn');

  const tutorials = useMemo<Tutorial[]>(
    () =>
      RAW_LEARN_ITEMS.map((raw) => ({
        id: raw.id,
        categoryKey: raw.categoryKey,
        difficulty: raw.difficulty,
        tags: raw.tags,
        title: t(`items.${raw.id}.title`),
        description: t(`items.${raw.id}.description`),
        category: t(`categories.${raw.categoryKey}`),
        content: raw.content[i18n.language as 'fr' | 'en'] ?? raw.content.fr,
      })),
    [t, i18n.language]
  );

  const categoryOrder = useMemo<string[]>(() => CATEGORY_KEYS.map((key) => t(`categories.${key}`)), [t]);

  return { tutorials, allTags: ALL_TAGS, allDifficulties: DIFFICULTIES, categoryOrder };
}
