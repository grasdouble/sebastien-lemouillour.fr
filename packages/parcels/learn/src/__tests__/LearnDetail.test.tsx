import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as DesignSystem from '@grasdouble/lufa_design-system';

import type { Tutorial } from '../data/learn';
import { LearnDetail } from '../components/LearnDetail/LearnDetail';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', resolvedLanguage: 'fr' },
  }),
}));

vi.mock('@grasdouble/lufa_design-system', async () => {
  const actual = await vi.importActual<typeof DesignSystem>('@grasdouble/lufa_design-system');
  return {
    ...actual,
    Link: ({
      children,
      href,
      target,
      rel,
    }: {
      children: React.ReactNode;
      href: string;
      target?: string;
      rel?: string;
    }) => (
      <a data-testid="ds-link" href={href} target={target} rel={rel}>
        {children}
      </a>
    ),
  };
});

vi.mock('@grasdouble/slm_shared', () => ({
  LangSwitcher: () => <div data-testid="lang-switcher" />,
}));

vi.mock('../components/MermaidBlock/MermaidBlock', () => ({
  MermaidBlock: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid-block" data-chart={chart} role="img" aria-label="Diagram" />
  ),
}));

const baseTutorial: Tutorial = {
  id: 'test-id',
  title: 'Test Tutorial',
  description: 'A test tutorial.',
  category: 'Test Category',
  categoryKey: 'test',
  catalogId: 'test-catalog',
  difficulty: 'beginner',
  tags: [],
  content: 'No links here.',
  publishedAt: '2025-01-15',
  updatedAt: '2025-01-15',
};

describe('LearnDetail — dates', () => {
  afterEach(cleanup);

  it('shows only the published date when publishedAt equals updatedAt', () => {
    render(<LearnDetail tutorial={baseTutorial} onClose={vi.fn()} />);

    const times = document.querySelectorAll('time');
    expect(times).toHaveLength(1);
    expect(times[0].getAttribute('dateTime')).toBe('2025-01-15');
  });

  it('shows both dates when publishedAt differs from updatedAt', () => {
    const tutorial: Tutorial = { ...baseTutorial, updatedAt: '2025-06-01' };
    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    const times = document.querySelectorAll('time');
    expect(times).toHaveLength(2);
    expect(times[0].getAttribute('dateTime')).toBe('2025-01-15');
    expect(times[1].getAttribute('dateTime')).toBe('2025-06-01');
  });

  it('shows a | separator between dates when they differ', () => {
    const tutorial: Tutorial = { ...baseTutorial, updatedAt: '2025-06-01' };
    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    expect(document.body.textContent).toContain('|');
  });
});

describe('LearnDetail — link rendering', () => {
  afterEach(cleanup);

  it('renders markdown links using the DS Link component', () => {
    const tutorial: Tutorial = {
      ...baseTutorial,
      content: 'Check [this link](https://example.com) for more.',
    };

    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    const link = screen.getByTestId('ds-link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('sets correct link text', () => {
    const tutorial: Tutorial = {
      ...baseTutorial,
      content: '[Read more](https://example.com)',
    };

    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    const link = screen.getByTestId('ds-link');
    expect(link.textContent).toBe('Read more');
  });

  it('opens external links in a new tab with rel="noopener noreferrer"', () => {
    const tutorial: Tutorial = {
      ...baseTutorial,
      content: '[External](https://example.com)',
    };

    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    const link = screen.getByTestId('ds-link');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

describe('LearnDetail — language switcher', () => {
  afterEach(cleanup);

  it('renders the LangSwitcher component in the header', () => {
    render(<LearnDetail tutorial={baseTutorial} onClose={vi.fn()} />);
    expect(screen.getByTestId('lang-switcher')).toBeTruthy();
  });
});

describe('LearnDetail — code block rendering', () => {
  afterEach(cleanup);

  it('renders a fenced code block inside a code-block container', () => {
    const tutorial: Tutorial = {
      ...baseTutorial,
      content: '```js\nconsole.log("hello");\n```',
    };

    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    expect(document.querySelector('pre')).not.toBeNull();
    expect(document.querySelector('code')).not.toBeNull();
  });

  it('renders a mermaid block using the MermaidBlock component', async () => {
    const tutorial: Tutorial = {
      ...baseTutorial,
      content: '```mermaid\ngraph TD\nA-->B\n```',
    };

    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-block')).toBeTruthy();
    });
  });

  it('wraps the mermaid block in a centered container', async () => {
    const tutorial: Tutorial = {
      ...baseTutorial,
      content: '```mermaid\ngraph TD\nA-->B\n```',
    };

    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-wrapper')).toBeTruthy();
    });
  });
});

describe('LearnDetail — table rendering', () => {
  afterEach(cleanup);

  it('renders a GFM table as an HTML table element', () => {
    const tutorial: Tutorial = {
      ...baseTutorial,
      content: '| A | B |\n|---|---|\n| 1 | 2 |',
    };

    render(<LearnDetail tutorial={tutorial} onClose={vi.fn()} />);

    expect(document.querySelector('table')).not.toBeNull();
  });
});
