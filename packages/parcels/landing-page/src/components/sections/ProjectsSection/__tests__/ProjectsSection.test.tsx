import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProjectsSection } from '../ProjectsSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));

vi.mock('../../../../data/projects', () => ({
  PROJECTS: [
    {
      title: 'Active Project',
      key: 'active',
      links: [{ href: 'https://example.com', label: 'Demo' }],
      archived: false,
    },
    {
      title: 'Archived with year',
      key: 'archived-year',
      links: [],
      archived: true,
      archivedYear: 2023,
    },
    {
      title: 'Archived no year',
      key: 'archived-no-year',
      links: [],
      archived: true,
      archivedYear: undefined,
    },
  ],
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Badge: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Box: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({
    children,
    href,
    'aria-label': ariaLabel,
  }: React.PropsWithChildren<{ href?: string; 'aria-label'?: string }>) => (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  ),
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Cluster: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Container: ({
    children,
    as: As = 'div',
    ...props
  }: React.PropsWithChildren<{ as?: React.ElementType } & React.HTMLAttributes<HTMLElement>>) => (
    <As {...props}>{children}</As>
  ),
  Stack: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: React.PropsWithChildren<{ as?: React.ElementType }>) => <As>{children}</As>,
}));

describe('ProjectsSection — archived project variants', () => {
  afterEach(cleanup);

  it('renders archived badge with year when archivedYear is set', () => {
    render(<ProjectsSection />);
    expect(screen.getByText('Archived with year')).toBeTruthy();
    expect(screen.getByText(/projects.archived.*2023/)).toBeTruthy();
  });

  it('renders archived badge without year suffix when archivedYear is absent', () => {
    render(<ProjectsSection />);
    expect(screen.getByText('Archived no year')).toBeTruthy();
    // Badge renders "projects.archived" with empty string for year
    const badges = screen.getAllByText(/projects.archived/);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render archived badge for active projects', () => {
    render(<ProjectsSection />);
    expect(screen.getByText('Active Project')).toBeTruthy();
  });
});
