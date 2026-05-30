import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CATEGORY_KEYS, DIFFICULTIES, isPublished, RAW_CATALOGS, RAW_LEARN_ITEMS } from '../data/learn';
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

    const publishedItems = RAW_LEARN_ITEMS.filter((item) => isPublished(item.publishedAt));
    const expectedTags = [...new Set(publishedItems.flatMap((item) => item.tags))].sort();
    expect(result.current.tutorials).toHaveLength(publishedItems.length);
    expect(result.current.tutorials[0]?.content).toBe(publishedItems[0]?.content.en);
    expect(result.current.categoryOrder).toEqual(CATEGORY_KEYS.map((key) => `translated:categories.${key}`));
    expect(result.current.allTags).toEqual(expectedTags);
    expect(result.current.allDifficulties).toEqual(DIFFICULTIES);
  });

  it('falls back to french content for unsupported languages', () => {
    i18nState.language = 'es';
    i18nState.resolvedLanguage = 'es';

    const { result } = renderHook(() => useLearn());

    expect(result.current.tutorials[0]?.content).toBe(RAW_LEARN_ITEMS[0]?.content.fr);
  });
});

describe('useLearn — publishing filter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    i18nState.language = 'fr';
    i18nState.resolvedLanguage = 'fr';
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('hides guides with a future publishedAt', () => {
    vi.setSystemTime(new Date('2000-01-01'));

    const { result } = renderHook(() => useLearn());

    expect(result.current.tutorials).toHaveLength(0);
  });

  it('shows all guides when sessionStorage learn.showUnpublished is true', () => {
    vi.setSystemTime(new Date('2000-01-01'));
    sessionStorage.setItem('learn.showUnpublished', 'true');

    const { result } = renderHook(() => useLearn());

    expect(result.current.tutorials).toHaveLength(RAW_LEARN_ITEMS.length);
  });

  it('allTags reflects only visible tutorials', () => {
    vi.setSystemTime(new Date('2000-01-01'));

    const { result } = renderHook(() => useLearn());

    expect(result.current.allTags).toHaveLength(0);
  });
});
