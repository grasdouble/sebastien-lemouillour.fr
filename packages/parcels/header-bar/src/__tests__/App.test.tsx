import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from '../App';

vi.mock('../i18n', () => ({}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}));
vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      aria-label={ariaLabel as string | undefined}
      aria-expanded={ariaExpanded as boolean | undefined}
    >
      {children}
    </button>
  ),
  Cluster: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Container: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Divider: () => <hr />,
  Flex: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: React.PropsWithChildren<{ as?: React.ElementType }>) => <As>{children}</As>,
  useTheme: () => ({
    theme: 'ocean',
    mode: 'dark',
    setTheme: vi.fn(),
    setMode: vi.fn(),
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);

    expect(screen.getByText('SL')).toBeTruthy();
  });
});
