import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Difficulty, Tutorial } from '../data/learn';
import { CATEGORY_KEYS, DIFFICULTIES, isPublished, RAW_LEARN_ITEMS } from '../data/learn';

type UseLearnResult = {
  tutorials: Tutorial[];
  allTags: readonly string[];
  allDifficulties: readonly Difficulty[];
  categoryOrder: string[];
};

export function useLearn(): UseLearnResult {
  const { t, i18n } = useTranslation('learn');
  const showUnpublished = sessionStorage.getItem('learn.showUnpublished') === 'true';

  const tutorials = useMemo<Tutorial[]>(
    () =>
      RAW_LEARN_ITEMS.filter((raw) => showUnpublished || isPublished(raw.publishedAt)).map((raw) => {
        const lang = (i18n.resolvedLanguage ?? i18n.language).split('-')[0];

        return {
          id: raw.id,
          categoryKey: raw.categoryKey,
          catalogId: raw.catalogId,
          difficulty: raw.difficulty,
          tags: raw.tags,
          order: raw.order,
          publishedAt: raw.publishedAt,
          updatedAt: raw.updatedAt,
          title: t(`items.${raw.id}.title`),
          description: t(`items.${raw.id}.description`),
          category: t(`categories.${raw.categoryKey}`),
          content: raw.content[lang as 'fr' | 'en'] ?? raw.content.fr ?? raw.content.en ?? '',
        };
      }),
    [t, i18n.language, i18n.resolvedLanguage, showUnpublished]
  );

  const allTags = useMemo<string[]>(() => [...new Set(tutorials.flatMap((tut) => tut.tags))].sort(), [tutorials]);

  const categoryOrder = useMemo<string[]>(() => CATEGORY_KEYS.map((key) => t(`categories.${key}`)), [t]);

  return { tutorials, allTags, allDifficulties: DIFFICULTIES, categoryOrder };
}
