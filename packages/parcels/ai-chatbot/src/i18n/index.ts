import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { sharedI18nEn, sharedI18nFr } from '@grasdouble/slm_shared';

import en from './en.json';
import fr from './fr.json';

const NAMESPACE = 'ai-chatbot';

const syncDocumentLang = (lng: string) => {
  document.documentElement.lang = lng.split('-')[0];
};

if (i18n.isInitialized) {
  i18n.addResourceBundle('fr', NAMESPACE, fr, true, true);
  i18n.addResourceBundle('en', NAMESPACE, en, true, true);
  i18n.addResourceBundle('fr', 'slm-shared', sharedI18nFr, true, true);
  i18n.addResourceBundle('en', 'slm-shared', sharedI18nEn, true, true);
} else {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        fr: { [NAMESPACE]: fr, 'slm-shared': sharedI18nFr },
        en: { [NAMESPACE]: en, 'slm-shared': sharedI18nEn },
      },
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
