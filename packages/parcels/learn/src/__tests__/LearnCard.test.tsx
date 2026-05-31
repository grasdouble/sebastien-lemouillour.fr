import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as DesignSystem from '@grasdouble/lufa_design-system';

import type { Tutorial } from '../data/learn';
import { LearnCard } from '../components/LearnCard/LearnCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'fr', resolvedLanguage: 'fr' },
  }),
}));

vi.mock('@grasdouble/lufa_design-system', async () => {
  const actual = await vi.importActual<typeof DesignSystem>('@grasdouble/lufa_design-system');
  return { ...actual };
});

const futureDate = '2099-01-01';
const pastDate = '2020-01-01';

const baseTutorial: Tutorial = {
  id: 'test-id',
  title: 'Test Tutorial',
  description: 'A test tutorial.',
  category: 'Test Category',
  categoryKey: 'test',
  catalogId: 'test-catalog',
  difficulty: 'beginner',
  tags: [],
  content: '',
  publishedAt: pastDate,
  updatedAt: pastDate,
};

describe('LearnCard — unpublished state', () => {
  afterEach(cleanup);

  it('does not have the unpublished class when the guide is published', () => {
    const { container } = render(<LearnCard tutorial={{ ...baseTutorial, publishedAt: pastDate }} onClick={vi.fn()} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toMatch(/unpublished/);
  });

  it('has the unpublished class when the guide is not yet published', () => {
    const { container } = render(
      <LearnCard tutorial={{ ...baseTutorial, publishedAt: futureDate }} onClick={vi.fn()} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/unpublished/);
  });

  it('shows a "draft" badge when the guide is not yet published', () => {
    const { getByText } = render(
      <LearnCard tutorial={{ ...baseTutorial, publishedAt: futureDate }} onClick={vi.fn()} />
    );
    expect(getByText('badge.draft')).toBeTruthy();
  });

  it('does not show a "draft" badge when the guide is published', () => {
    const { queryByText } = render(
      <LearnCard tutorial={{ ...baseTutorial, publishedAt: pastDate }} onClick={vi.fn()} />
    );
    expect(queryByText('badge.draft')).toBeNull();
  });
});
