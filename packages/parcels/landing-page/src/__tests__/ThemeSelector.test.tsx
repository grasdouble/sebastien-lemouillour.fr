import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const setTheme = vi.fn();
const setMode = vi.fn();

vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
  }: React.PropsWithChildren<{
    onClick?: () => void;
    'aria-label'?: string;
    'aria-expanded'?: boolean;
    'aria-pressed'?: boolean;
  }>) => (
    <button onClick={onClick} aria-label={ariaLabel} aria-expanded={ariaExpanded} aria-pressed={ariaPressed}>
      {children}
    </button>
  ),
  useTheme: () => ({
    theme: 'ocean',
    mode: 'dark',
    setTheme,
    setMode,
  }),
}));

describe('ThemeSelector', () => {
  afterEach(cleanup);
  it('renders the theme and mode toggle buttons', async () => {
    const { ThemeSelector } = await import('../components/ThemeSelector/ThemeSelector');
    render(<ThemeSelector />);

    expect(screen.getByRole('button', { name: 'Open theme selector' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Switch color mode/ })).toBeTruthy();
  });

  it('opens the theme panel when clicking the theme button', async () => {
    const { ThemeSelector } = await import('../components/ThemeSelector/ThemeSelector');
    render(<ThemeSelector />);

    const openBtn = screen.getByRole('button', { name: 'Open theme selector' });
    fireEvent.click(openBtn);

    expect(screen.getByRole('button', { name: 'Select Default theme' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Select Ocean theme' })).toBeTruthy();
  });

  it('selects a theme and closes the panel', async () => {
    const { ThemeSelector } = await import('../components/ThemeSelector/ThemeSelector');
    render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button', { name: 'Open theme selector' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Forest theme' }));

    expect(setTheme).toHaveBeenCalledWith('forest');
    expect(screen.queryByRole('button', { name: 'Select Forest theme' })).toBeNull();
  });

  it('cycles mode when clicking the mode button', async () => {
    const { ThemeSelector } = await import('../components/ThemeSelector/ThemeSelector');
    render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button', { name: /Switch color mode/ }));

    expect(setMode).toHaveBeenCalledWith('auto');
  });
});
