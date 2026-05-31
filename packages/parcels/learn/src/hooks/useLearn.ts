import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Difficulty, Tutorial } from '../data/learn';
import { CATEGORY_KEYS, DIFFICULTIES, isPublished, RAW_CATALOGS, RAW_LEARN_ITEMS } from '../data/learn';
import { useShowUnpublished } from './useShowUnpublished';

type UseLearnResult = {
  tutorials: Tutorial[];
  allTags: readonly string[];
  allDifficulties: readonly Difficulty[];
  categoryOrder: string[];
};

export function useLearn(): UseLearnResult {
  const { t, i18n } = useTranslation('learn');
  const showUnpublished = useShowUnpublished();

  const tutorials = useMemo<Tutorial[]>(() => {
    const lang = (i18n.resolvedLanguage ?? i18n.language).split('-')[0] as 'fr' | 'en';

    return RAW_LEARN_ITEMS.filter((raw) => showUnpublished || isPublished(raw.publishedAt)).map((raw) => {
      const catalog = RAW_CATALOGS.find((c) => c.id === raw.catalogId);
      const guideTranslations = catalog?.translations[lang]?.guides[raw.id] ?? catalog?.translations.fr.guides[raw.id];

      return {
        id: raw.id,
        categoryKey: raw.categoryKey,
        catalogId: raw.catalogId,
        difficulty: raw.difficulty,
        tags: raw.tags,
        order: raw.order,
        publishedAt: raw.publishedAt,
        updatedAt: raw.updatedAt,
        title: guideTranslations?.title ?? raw.id,
        description: guideTranslations?.description ?? '',
        category: t(`categories.${raw.categoryKey}`),
        content: raw.content[lang] ?? raw.content.fr ?? raw.content.en ?? '',
      };
    });
  }, [t, i18n.language, i18n.resolvedLanguage, showUnpublished]);

  const allTags = useMemo<string[]>(() => [...new Set(tutorials.flatMap((tut) => tut.tags))].sort(), [tutorials]);

  const categoryOrder = useMemo<string[]>(() => CATEGORY_KEYS.map((key) => t(`categories.${key}`)), [t]);

  return { tutorials, allTags, allDifficulties: DIFFICULTIES, categoryOrder };
}
