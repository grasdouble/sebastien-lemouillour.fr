import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { EXPERIENCES } from '../data/experiences';

const { usePageSeo } = vi.hoisted(() => ({
  usePageSeo: vi.fn(),
}));

vi.mock('../i18n', () => ({}));
vi.mock('@grasdouble/slm_shared', () => ({
  usePageSeo,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));
vi.mock('@grasdouble/lufa_design-system', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Box: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cluster: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Container: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: { children: React.ReactNode; as?: React.ElementType }) => <As>{children}</As>,
}));

describe('App', () => {
  beforeEach(() => {
    usePageSeo.mockReset();
  });

  it('renders the page title, experiences and seo metadata', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'page.title' })).toBeTruthy();
    expect(screen.getByText(EXPERIENCES[0].company)).toBeTruthy();
    expect(screen.getByText(EXPERIENCES[0].roleKey)).toBeTruthy();
    expect(usePageSeo).toHaveBeenCalledWith({
      title: 'page.title | sebastien-lemouillour.fr',
      description: 'seo.description',
      url: 'https://sebastien-lemouillour.fr/experience',
    });
  });
});
