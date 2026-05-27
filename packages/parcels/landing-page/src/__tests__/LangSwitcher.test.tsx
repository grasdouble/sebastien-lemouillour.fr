import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const changeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage },
  }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: React.PropsWithChildren<{ onClick?: () => void; 'aria-label'?: string }>) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

describe('LangSwitcher', () => {
  afterEach(cleanup);
  it('renders French and English buttons', async () => {
    const { LangSwitcher } = await import('../components/LangSwitcher/LangSwitcher');
    render(<LangSwitcher />);

    expect(screen.getByRole('button', { name: 'Switch language to French' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Switch language to English' })).toBeTruthy();
  });

  it('calls changeLanguage when clicking English button', async () => {
    const { LangSwitcher } = await import('../components/LangSwitcher/LangSwitcher');
    render(<LangSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'Switch language to English' }));

    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('calls changeLanguage when clicking French button', async () => {
    const { LangSwitcher } = await import('../components/LangSwitcher/LangSwitcher');
    render(<LangSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'Switch language to French' }));

    expect(changeLanguage).toHaveBeenCalledWith('fr');
  });
});
