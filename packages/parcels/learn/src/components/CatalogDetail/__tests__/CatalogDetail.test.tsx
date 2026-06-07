import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Catalog } from '../../../data/learn';
import { CatalogDetail } from '../CatalogDetail';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', resolvedLanguage: 'fr' },
  }),
}));

const baseCatalog: Catalog = {
  id: 'test-catalog',
  categoryKey: 'test',
  category: 'Test Category',
  order: 0,
  title: 'Test Catalog',
  description: 'A test catalog.',
  subcategory: '',
  guideIds: [],
};

describe('CatalogDetail — coming soon', () => {
  afterEach(cleanup);

  it('shows coming soon message when guides list is empty', () => {
    render(<CatalogDetail catalog={baseCatalog} guides={[]} onBack={vi.fn()} onOpenGuide={vi.fn()} />);

    expect(screen.getByText('catalogs.comingSoon.title')).toBeTruthy();
    expect(screen.getByText('catalogs.comingSoon.subtitle')).toBeTruthy();
  });

  it('does not show coming soon message when guides are present', () => {
    const guides = [
      {
        id: 'g1',
        title: 'Guide 1',
        description: 'Desc',
        category: 'Test',
        categoryKey: 'test',
        catalogId: 'test-catalog',
        difficulty: 'beginner' as const,
        tags: [],
        content: '',
        publishedAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ];

    render(<CatalogDetail catalog={baseCatalog} guides={guides} onBack={vi.fn()} onOpenGuide={vi.fn()} />);

    expect(screen.queryByText('catalogs.comingSoon')).toBeNull();
  });
});
