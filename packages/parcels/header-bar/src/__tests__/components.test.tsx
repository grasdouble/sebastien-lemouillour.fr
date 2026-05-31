import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LANG_CHANGE_EVENT, LangSwitcher } from '@grasdouble/slm_shared';

import { NavBar, ThemeSelector } from '../components';

const mockState = vi.hoisted(
  (): {
    changeLanguage: ReturnType<typeof vi.fn>;
    setMode: ReturnType<typeof vi.fn>;
    setTheme: ReturnType<typeof vi.fn>;
    language: string;
    mode: 'light' | 'dark' | 'auto';
    theme: string;
  } => ({
    changeLanguage: vi.fn(),
    setMode: vi.fn(),
    setTheme: vi.fn(),
    language: 'fr',
    mode: 'dark',
    theme: 'ocean',
  })
);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: mockState.language,
      changeLanguage: mockState.changeLanguage,
    },
  }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  Button: ({
    children,
    onClick,
    className,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button
      type="button"
      className={className as string | undefined}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      aria-label={ariaLabel as string | undefined}
      aria-expanded={ariaExpanded as boolean | undefined}
      aria-pressed={ariaPressed as boolean | undefined}
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
    theme: mockState.theme,
    mode: mockState.mode,
    setTheme: mockState.setTheme,
    setMode: mockState.setMode,
  }),
}));

describe('header-bar components', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockState.changeLanguage.mockReset();
    mockState.setMode.mockReset();
    mockState.setTheme.mockReset();
    mockState.language = 'fr';
    mockState.mode = 'dark';
    mockState.theme = 'ocean';
    window.history.pushState(null, '', '/');
  });

  it('dispatches a language change event when switching languages', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    render(<LangSwitcher />);
    fireEvent.click(screen.getByLabelText('Switch language to English'));

    expect(mockState.changeLanguage).toHaveBeenCalledWith('en');
    expect(dispatchSpy).toHaveBeenCalled();

    const event = dispatchSpy.mock.calls.at(-1)?.[0] as CustomEvent;
    expect(event.type).toBe(LANG_CHANGE_EVENT);
    expect(event.detail).toEqual({ lang: 'en' });

    dispatchSpy.mockRestore();
  });

  it('cycles color mode and lets users select a theme', () => {
    render(<ThemeSelector />);

    fireEvent.click(screen.getByLabelText('Switch color mode (current: dark)'));
    expect(mockState.setMode).toHaveBeenCalledWith('auto');

    fireEvent.click(screen.getByLabelText('Open theme selector'));
    fireEvent.click(screen.getByLabelText('Select Forest theme'));

    expect(mockState.setTheme).toHaveBeenCalledWith('forest');
  });

  it('closes the theme panel on outside clicks', () => {
    render(<ThemeSelector />);

    fireEvent.click(screen.getByLabelText('Open theme selector'));
    expect(screen.getByLabelText('Select Ocean theme')).toBeTruthy();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByLabelText('Select Ocean theme')).toBeNull();
  });

  it('opens the mobile menu and navigates to another route', () => {
    render(<NavBar />);

    fireEvent.click(screen.getByLabelText('aria.openMenu'));
    expect(screen.getByLabelText('aria.closeMenu')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('link', { name: 'nav.learn' })[0]);

    expect(window.location.pathname).toBe('/learn');
    expect(screen.getByLabelText('aria.openMenu')).toBeTruthy();
  });

  it('responds to single-spa routing events by syncing the current route', () => {
    render(<NavBar />);

    fireEvent.click(screen.getByLabelText('aria.openMenu'));
    window.history.pushState(null, '', '/experience');
    fireEvent(window, new Event('single-spa:routing-event'));

    expect(screen.getByLabelText('aria.openMenu')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'nav.experience' }).length).toBe(1);
  });
});
