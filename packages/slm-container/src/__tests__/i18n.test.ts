import { expect, it, vi } from 'vitest';

const languageChanged = vi.hoisted(() => vi.fn());
const i18n = vi.hoisted(() => ({
  language: 'fr-FR',
  use: vi.fn().mockReturnThis(),
  init: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  changeLanguage: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('i18next', () => ({ default: i18n }));
vi.mock('i18next-browser-languagedetector', () => ({ default: {} }));
vi.mock('react-i18next', () => ({ initReactI18next: {} }));

it('synchronizes the document language and handles language change requests', async () => {
  i18n.on.mockImplementation((_name: string, callback: (lng: string) => void) =>
    languageChanged.mockImplementation(callback)
  );
  await import('../i18n');
  expect(document.documentElement.lang).toBe('fr');
  languageChanged('en-US');
  expect(document.documentElement.lang).toBe('en');
  window.dispatchEvent(new CustomEvent('lufa:lang-change', { detail: { lang: 'fr' } }));
  expect(i18n.changeLanguage).toHaveBeenCalledWith('fr');
});
