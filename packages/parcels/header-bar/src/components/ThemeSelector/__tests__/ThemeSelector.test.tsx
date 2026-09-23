import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import type * as DesignSystem from '@grasdouble/lufa_design-system';

import { ThemeSelector } from '../ThemeSelector';

const setMode = vi.hoisted(() => vi.fn());

vi.mock('@grasdouble/lufa_design-system', async (importOriginal) => ({
  ...(await importOriginal<typeof DesignSystem>()),
  useTheme: () => ({ theme: 'ocean', mode: 'high-contrast', setTheme: vi.fn(), setMode }),
}));

afterEach(cleanup);

it('displays a restored high-contrast mode and lets the user return to light mode', () => {
  render(<ThemeSelector />);

  const button = screen.getByRole('button', { name: 'Switch color mode (current: high-contrast)' });
  expect(button.textContent?.trim()).not.toBe('');
  fireEvent.click(button);
  expect(setMode).toHaveBeenCalledWith('light');
});
