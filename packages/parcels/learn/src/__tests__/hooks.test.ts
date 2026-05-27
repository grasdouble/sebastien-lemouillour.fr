import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ALL_TAGS, CATEGORY_KEYS, DIFFICULTIES, RAW_CATALOGS, RAW_LEARN_ITEMS } from '../data/learn';
import { useCatalogs } from '../hooks/useCatalogs';
import { useLearn } from '../hooks/useLearn';

const i18nState = vi.hoisted(
  (): {
    language: string;
    resolvedLanguage: string | undefined;
  } => ({
    language: 'fr',
    resolvedLanguage: 'fr',
  })
);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated:${key}`,
    i18n: {
      language: i18nState.language,
      resolvedLanguage: i18nState.resolvedLanguage,
    },
  }),
}));

describe('learn hooks', () => {
  beforeEach(() => {
    i18nState.language = 'fr';
    i18nState.resolvedLanguage = 'fr';
  });

  it('maps catalogs and groups them by translated category', () => {
    const { result } = renderHook(() => useCatalogs());

    expect(result.current.catalogs).toHaveLength(RAW_CATALOGS.length);
    expect(Object.keys(result.current.groupedCatalogs).length).toBeGreaterThan(0);

    for (const catalog of result.current.catalogs) {
      expect(catalog.category).toBe(`translated:categories.${catalog.categoryKey}`);
      expect(catalog.title).toBe(`translated:catalogs.items.${catalog.id}.title`);
      expect(catalog.description).toBe(`translated:catalogs.items.${catalog.id}.description`);
    }

    for (const group of Object.values(result.current.groupedCatalogs)) {
      const orders = group.map((catalog) => catalog.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it('uses the resolved language content when available', () => {
    i18nState.resolvedLanguage = 'en-US';

    const { result } = renderHook(() => useLearn());

    expect(result.current.tutorials).toHaveLength(RAW_LEARN_ITEMS.length);
    expect(result.current.tutorials[0]?.content).toBe(RAW_LEARN_ITEMS[0]?.content.en);
    expect(result.current.categoryOrder).toEqual(CATEGORY_KEYS.map((key) => `translated:categories.${key}`));
    expect(result.current.allTags).toEqual(ALL_TAGS);
    expect(result.current.allDifficulties).toEqual(DIFFICULTIES);
  });

  it('falls back to french content for unsupported languages', () => {
    i18nState.language = 'es';
    i18nState.resolvedLanguage = 'es';

    const { result } = renderHook(() => useLearn());

    expect(result.current.tutorials[0]?.content).toBe(RAW_LEARN_ITEMS[0]?.content.fr);
  });
});
