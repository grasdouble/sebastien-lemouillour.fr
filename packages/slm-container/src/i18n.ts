import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

/**
 * Initializes the shared i18next singleton for the entire app.
 * Resources are NOT loaded here — each parcel registers its own namespace
 * via addResourceBundle() in its own i18n module.
 */

const syncDocumentLang = (lng: string) => {
  document.documentElement.lang = lng.split('-')[0];
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    interpolation: { escapeValue: false },
  })
  .then(() => {
    syncDocumentLang(i18n.language);
  });

i18n.on('languageChanged', syncDocumentLang);

window.addEventListener('lufa:lang-change', (e) => {
  const { lang } = (e as CustomEvent<{ lang: string }>).detail;
  void i18n.changeLanguage(lang);
});

export default i18n;
