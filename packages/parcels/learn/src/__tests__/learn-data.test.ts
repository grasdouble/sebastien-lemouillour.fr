import { describe, expect, it } from 'vitest';

import {
  ALL_TAGS,
  CATEGORY_KEYS,
  DIFFICULTIES,
  DIFFICULTY_VARIANT,
  isPublished,
  RAW_CATALOGS,
  RAW_LEARN_ITEMS,
} from '../data/learn';

describe('learn data', () => {
  it('exposes category keys as a non-empty readonly array', () => {
    expect(Array.isArray(CATEGORY_KEYS)).toBe(true);
    expect(CATEGORY_KEYS.length).toBeGreaterThan(0);
  });

  it('contains the supported difficulties', () => {
    expect(DIFFICULTIES).toEqual(expect.arrayContaining(['beginner', 'intermediate', 'advanced']));
  });

  it('maps every difficulty to a valid badge variant', () => {
    expect(DIFFICULTY_VARIANT).toEqual({
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'danger',
    });
  });

  it('ensures raw catalogs expose the required fields', () => {
    for (const catalog of RAW_CATALOGS) {
      expect(catalog.id).toBeTruthy();
      expect(catalog.categoryKey).toBeTruthy();
      expect(typeof catalog.order).toBe('number');
      expect(Number.isFinite(catalog.order)).toBe(true);
      expect(Array.isArray(catalog.guideIds)).toBe(true);
      expect(catalog.translations.fr.title).toBeTruthy();
      expect(catalog.translations.fr.description).toBeTruthy();
      expect(catalog.translations.en.title).toBeTruthy();
      expect(catalog.translations.en.description).toBeTruthy();
    }
  });

  it('ensures every discovered catalog is listed in its category order.json', () => {
    for (const catalog of RAW_CATALOGS) {
      expect(
        Number.isFinite(catalog.order),
        `Catalog "${catalog.id}" is not listed in its category order.json — add it to content/<categoryKey>/order.json`
      ).toBe(true);
    }
  });

  it('ensures raw learn items expose the required fields', () => {
    for (const item of RAW_LEARN_ITEMS) {
      expect(item.id).toBeTruthy();
      expect(item.categoryKey).toBeTruthy();
      expect(item.catalogId).toBeTruthy();
      expect(item.difficulty).toBeTruthy();
      expect(Array.isArray(item.tags)).toBe(true);
      expect(typeof item.content.fr).toBe('string');
      expect(typeof item.content.en).toBe('string');
      expect(item.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('ensures published guides are not updated before publication', () => {
    for (const item of RAW_LEARN_ITEMS) {
      if (isPublished(item.publishedAt)) {
        expect(item.updatedAt >= item.publishedAt).toBe(true);
      }
    }
  });

  it('ensures all learn item difficulties are valid', () => {
    for (const item of RAW_LEARN_ITEMS) {
      expect(DIFFICULTIES).toContain(item.difficulty);
    }
  });

  it('sorts guide ids inside each raw catalog by learn item order', () => {
    for (const catalog of RAW_CATALOGS) {
      const orders = catalog.guideIds.map(
        (guideId) => RAW_LEARN_ITEMS.find((item) => item.id === guideId)?.order ?? Number.POSITIVE_INFINITY
      );
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it('exposes a unique sorted list of tags', () => {
    expect(ALL_TAGS.length).toBeGreaterThan(0);
    expect(ALL_TAGS).toEqual([...ALL_TAGS].sort());
    expect(new Set(ALL_TAGS).size).toBe(ALL_TAGS.length);
  });
});
