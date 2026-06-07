import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LANG_CHANGE_EVENT, LangSwitcher } from '../LangSwitcher';

const mockState = vi.hoisted(
  (): {
    changeLanguage: ReturnType<typeof vi.fn>;
    language: string;
  } => ({
    changeLanguage: vi.fn(),
    language: 'fr',
  })
);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: mockState.language,
      changeLanguage: mockState.changeLanguage,
    },
  }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    'data-active': dataActive,
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button
      type="button"
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      aria-label={ariaLabel as string | undefined}
      data-active={String(dataActive)}
    >
      {children}
    </button>
  ),
  Cluster: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

describe('LangSwitcher', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockState.changeLanguage.mockReset();
    mockState.language = 'fr';
  });

  it('exports LANG_CHANGE_EVENT constant', () => {
    expect(LANG_CHANGE_EVENT).toBe('lufa:lang-change');
  });

  it('renders FR and EN buttons', () => {
    render(<LangSwitcher />);
    expect(screen.getByLabelText('Switch language to French')).toBeTruthy();
    expect(screen.getByLabelText('Switch language to English')).toBeTruthy();
  });

  it('shows FR as active when language is French', () => {
    mockState.language = 'fr';
    render(<LangSwitcher />);
    const frBtn = screen.getByLabelText('Switch language to French');
    const enBtn = screen.getByLabelText('Switch language to English');
    expect(frBtn.getAttribute('data-active')).toBe('true');
    expect(enBtn.getAttribute('data-active')).toBe('false');
  });

  it('shows EN as active when language is English', () => {
    mockState.language = 'en';
    render(<LangSwitcher />);
    const frBtn = screen.getByLabelText('Switch language to French');
    const enBtn = screen.getByLabelText('Switch language to English');
    expect(frBtn.getAttribute('data-active')).toBe('false');
    expect(enBtn.getAttribute('data-active')).toBe('true');
  });

  it('calls changeLanguage and dispatches event when clicking EN', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    render(<LangSwitcher />);
    fireEvent.click(screen.getByLabelText('Switch language to English'));

    expect(mockState.changeLanguage).toHaveBeenCalledWith('en');
    const event = dispatchSpy.mock.calls.at(-1)?.[0] as CustomEvent;
    expect(event.type).toBe(LANG_CHANGE_EVENT);
    expect(event.detail).toEqual({ lang: 'en' });
    dispatchSpy.mockRestore();
  });

  it('calls changeLanguage and dispatches event when clicking FR', () => {
    mockState.language = 'en';
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    render(<LangSwitcher />);
    fireEvent.click(screen.getByLabelText('Switch language to French'));

    expect(mockState.changeLanguage).toHaveBeenCalledWith('fr');
    const event = dispatchSpy.mock.calls.at(-1)?.[0] as CustomEvent;
    expect(event.type).toBe(LANG_CHANGE_EVENT);
    expect(event.detail).toEqual({ lang: 'fr' });
    dispatchSpy.mockRestore();
  });
});
