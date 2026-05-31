import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Cluster } from '@grasdouble/lufa_design-system';

export const LANG_CHANGE_EVENT = 'lufa:lang-change';

export function LangSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const changeLang = (lang: string) => {
    void i18n.changeLanguage(lang);
    window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: { lang } }));
  };

  return (
    <Cluster>
      <Button
        type={currentLang === 'fr' ? 'solid' : 'outline'}
        variant="neutral"
        size="sm"
        data-active={currentLang === 'fr'}
        onClick={() => changeLang('fr')}
        aria-label="Switch language to French"
      >
        🇫🇷
      </Button>
      <Button
        type={currentLang === 'en' ? 'solid' : 'outline'}
        variant="neutral"
        size="sm"
        data-active={currentLang === 'en'}
        onClick={() => changeLang('en')}
        aria-label="Switch language to English"
      >
        🇬🇧
      </Button>
    </Cluster>
  );
}
