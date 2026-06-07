import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CATEGORY_KEYS, DIFFICULTIES, isPublished, RAW_CATALOGS, RAW_LEARN_ITEMS } from '../../data/learn';
import { useCatalogs } from '../useCatalogs';
import { useLearn } from '../useLearn';

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
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01'));
    sessionStorage.clear();
    i18nState.language = 'fr';
    i18nState.resolvedLanguage = 'fr';
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('maps catalogs and groups them by translated category', () => {
    const { result } = renderHook(() => useCatalogs());

    const publishedCatalogs = RAW_CATALOGS.filter((raw) => {
      const firstGuide = RAW_LEARN_ITEMS.find((item) => item.id === raw.guideIds[0]);
      return firstGuide ? isPublished(firstGuide.publishedAt) : false;
    });
    expect(result.current.catalogs).toHaveLength(publishedCatalogs.length);
    expect(Object.keys(result.current.groupedCatalogs).length).toBeGreaterThan(0);

    for (const catalog of result.current.catalogs) {
      const raw = RAW_CATALOGS.find((r) => r.id === catalog.id)!;
      expect(catalog.category).toBe(`translated:categories.${catalog.categoryKey}`);
      expect(catalog.title).toBe(raw.translations.fr.title);
      expect(catalog.description).toBe(raw.translations.fr.description);
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

    const firstItem = publishedItems[0];
    const catalog = RAW_CATALOGS.find((c) => c.id === firstItem?.catalogId)!;
    expect(result.current.tutorials[0]?.title).toBe(catalog.translations.en.guides[firstItem.id]?.title);
    expect(result.current.tutorials[0]?.description).toBe(catalog.translations.en.guides[firstItem.id]?.description);

    expect(result.current.categoryOrder).toEqual(CATEGORY_KEYS.map((key) => `translated:categories.${key}`));
    expect(result.current.allTags).toEqual(expectedTags);
    expect(result.current.allDifficulties).toEqual(DIFFICULTIES);
  });

  it('uses english catalog metadata for en-US locale', () => {
    i18nState.language = 'en-US';
    i18nState.resolvedLanguage = 'en-US';

    const { result } = renderHook(() => useCatalogs());

    for (const catalog of result.current.catalogs) {
      const raw = RAW_CATALOGS.find((r) => r.id === catalog.id)!;
      expect(catalog.title).toBe(raw.translations.en.title);
      expect(catalog.description).toBe(raw.translations.en.description);
    }
  });

  it('falls back to french catalog metadata for unsupported languages', () => {
    i18nState.language = 'es';
    i18nState.resolvedLanguage = 'es';

    const { result } = renderHook(() => useCatalogs());

    for (const catalog of result.current.catalogs) {
      const raw = RAW_CATALOGS.find((r) => r.id === catalog.id)!;
      expect(catalog.title).toBe(raw.translations.fr.title);
      expect(catalog.description).toBe(raw.translations.fr.description);
    }
  });

  it('falls back to french content for unsupported languages', () => {
    i18nState.language = 'es';
    i18nState.resolvedLanguage = 'es';

    const { result } = renderHook(() => useLearn());

    const firstItem = RAW_LEARN_ITEMS[0];
    const catalog = RAW_CATALOGS.find((c) => c.id === firstItem?.catalogId)!;
    expect(result.current.tutorials[0]?.content).toBe(firstItem.content.fr);
    expect(result.current.tutorials[0]?.title).toBe(catalog.translations.fr.guides[firstItem.id]?.title);
    expect(result.current.tutorials[0]?.description).toBe(catalog.translations.fr.guides[firstItem.id]?.description);
  });
});

describe('useCatalogs — publishing filter', () => {
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

  it('hides catalogs whose first guide has a future publishedAt', () => {
    vi.setSystemTime(new Date('2000-01-01'));

    const { result } = renderHook(() => useCatalogs());

    expect(result.current.catalogs).toHaveLength(0);
  });

  it('shows all catalogs when sessionStorage learn.dev is true', () => {
    vi.setSystemTime(new Date('2000-01-01'));
    sessionStorage.setItem('learn.dev', 'true');

    const { result } = renderHook(() => useCatalogs());

    expect(result.current.catalogs).toHaveLength(RAW_CATALOGS.length);
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

  it('shows all guides when sessionStorage learn.dev is true', () => {
    vi.setSystemTime(new Date('2000-01-01'));
    sessionStorage.setItem('learn.dev', 'true');

    const { result } = renderHook(() => useLearn());

    expect(result.current.tutorials).toHaveLength(RAW_LEARN_ITEMS.length);
  });

  it('allTags reflects only visible tutorials', () => {
    vi.setSystemTime(new Date('2000-01-01'));

    const { result } = renderHook(() => useLearn());

    expect(result.current.allTags).toHaveLength(0);
  });
});

describe('useDevMode — URL query param ?dev', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01'));
    sessionStorage.clear();
    i18nState.language = 'fr';
    i18nState.resolvedLanguage = 'fr';
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    window.history.pushState({}, '', window.location.pathname);
  });

  it('sets sessionStorage and shows all tutorials when ?dev=true', () => {
    window.history.pushState({}, '', '?dev=true');

    const { result } = renderHook(() => useLearn());

    expect(sessionStorage.getItem('learn.dev')).toBe('true');
    expect(result.current.tutorials).toHaveLength(RAW_LEARN_ITEMS.length);
  });

  it('activates when ?dev has no value', () => {
    window.history.pushState({}, '', '?dev');

    const { result } = renderHook(() => useLearn());

    expect(sessionStorage.getItem('learn.dev')).toBe('true');
    expect(result.current.tutorials).toHaveLength(RAW_LEARN_ITEMS.length);
  });

  it('deactivates and clears sessionStorage when ?dev=false', () => {
    sessionStorage.setItem('learn.dev', 'true');
    window.history.pushState({}, '', '?dev=false');

    const { result } = renderHook(() => useLearn());

    expect(sessionStorage.getItem('learn.dev')).toBeNull();
    expect(result.current.tutorials).toHaveLength(0);
  });

  it('shows all catalogs when ?dev=true', () => {
    window.history.pushState({}, '', '?dev=true');

    const { result } = renderHook(() => useCatalogs());

    expect(result.current.catalogs).toHaveLength(RAW_CATALOGS.length);
  });

  it('does not set sessionStorage when param is absent', () => {
    const { result } = renderHook(() => useLearn());

    expect(sessionStorage.getItem('learn.dev')).toBeNull();
    expect(result.current.tutorials).toHaveLength(0);
  });
});
