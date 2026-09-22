import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

vi.mock('../i18n', () => ({}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@grasdouble/slm_shared', () => ({ usePageSeo: vi.fn() }));
vi.mock('../hooks/useCatalogs', () => ({
  useCatalogs: () => ({
    catalogs: [
      { id: 'catalog-a', guideIds: ['guide-a'] },
      { id: 'catalog-b', guideIds: [] },
    ],
    groupedCatalogs: {},
  }),
}));
vi.mock('../hooks/useLearn', () => ({
  useLearn: () => ({
    tutorials: [{ id: 'guide-a', catalogId: 'catalog-a', title: 'Guide A' }],
    allTags: [],
    allDifficulties: [],
    categoryOrder: [],
  }),
}));
vi.mock('../components', () => ({
  LearnDetail: () => <h1>Guide A</h1>,
  CatalogDetail: () => <h1>Catalog</h1>,
  CatalogCard: () => null,
  LearnCard: () => null,
  FilterBar: () => null,
}));

afterEach(cleanup);

describe('Learn routes', () => {
  it.each([
    '/learn/missing',
    '/learn/catalog-a/missing',
    '/learn/catalog-b/guide-a',
    '/learn/missing/guide-a',
    '/learn/catalog-a/guide-a/extra',
  ])('shows a not-found page for %s', async (path) => {
    window.history.replaceState({}, '', path);
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'notFound.title' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Guide A' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'detail.backToList' }));
    expect(await screen.findByRole('heading', { name: 'page.title' })).toBeTruthy();
  });

  it('renders a guide only under its own catalog', async () => {
    window.history.replaceState({}, '', '/learn/catalog-a/guide-a');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Guide A' })).toBeTruthy();
  });
});
