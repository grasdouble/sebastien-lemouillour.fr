import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';

const NAMESPACE = 'learn';

const syncDocumentLang = (lng: string) => {
  document.documentElement.lang = lng.split('-')[0];
};

if (i18n.isInitialized) {
  i18n.addResourceBundle('fr', NAMESPACE, fr, true, true);
  i18n.addResourceBundle('en', NAMESPACE, en, true, true);
} else {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { fr: { [NAMESPACE]: fr }, en: { [NAMESPACE]: en } },
      fallbackLng: 'fr',
      supportedLngs: ['fr', 'en'],
      interpolation: { escapeValue: false },
    })
    .then(() => {
      syncDocumentLang(i18n.language);
    });

  i18n.on('languageChanged', syncDocumentLang);
}

window.addEventListener('lufa:lang-change', (e) => {
  const { lang } = (e as CustomEvent<{ lang: string }>).detail;
  void i18n.changeLanguage(lang);
});

export default i18n;
