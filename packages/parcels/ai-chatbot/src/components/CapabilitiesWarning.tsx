import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { BrowserCapabilities } from '@grasdouble/slm_shared';

import styles from './CapabilitiesWarning.module.css';

type CapabilitiesWarningProps = {
  capabilities: BrowserCapabilities;
  minRequiredMemoryGB?: number;
};

export const CapabilitiesWarning: FC<CapabilitiesWarningProps> = ({ capabilities, minRequiredMemoryGB = 4 }) => {
  const { t } = useTranslation('ai-chatbot');

  const hasWebGPU = capabilities.hasWebGPU;
  const hasEnoughMemory = capabilities.deviceMemoryGB >= minRequiredMemoryGB;

  // No warning needed if all capabilities are met
  if (hasWebGPU && hasEnoughMemory) {
    return null;
  }

  return (
    <div className={styles.container} role="alert" aria-live="polite">
      {!hasWebGPU && (
        <div className={styles.warning}>
          <h3 className={styles.title}>{t('chatbot.capabilities.noWebGPU.title')}</h3>
          <p className={styles.description}>{t('chatbot.capabilities.noWebGPU.description')}</p>
          <p className={styles.fallback}>{t('chatbot.capabilities.noWebGPU.fallback')}</p>
        </div>
      )}

      {!hasEnoughMemory && (
        <div className={styles.warning}>
          <h3 className={styles.title}>{t('chatbot.capabilities.lowMemory.title')}</h3>
          <p className={styles.description}>
            {t('chatbot.capabilities.lowMemory.description', {
              current: capabilities.deviceMemoryGB,
              required: minRequiredMemoryGB,
            })}
          </p>
          <p className={styles.suggestion}>{t('chatbot.capabilities.lowMemory.suggestion')}</p>
        </div>
      )}
    </div>
  );
};
