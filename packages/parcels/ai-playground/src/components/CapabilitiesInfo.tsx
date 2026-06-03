import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { BrowserCapabilities } from '@grasdouble/slm_shared';

import styles from './CapabilitiesInfo.module.css';

type CapabilitiesInfoProps = {
  capabilities: BrowserCapabilities;
};

export const CapabilitiesInfo: FC<CapabilitiesInfoProps> = ({ capabilities }) => {
  const { t } = useTranslation('ai-playground');

  return (
    <div className={styles.container}>
      <h2>{t('playground.capabilities.title')}</h2>
      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.label}>{t('playground.capabilities.webgpu')}:</span>
          <span className={capabilities.hasWebGPU ? styles.supported : styles.notSupported}>
            {capabilities.hasWebGPU
              ? t('playground.capabilities.supported')
              : t('playground.capabilities.notSupported')}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>{t('playground.capabilities.memory')}:</span>
          <span>{capabilities.deviceMemoryGB}GB</span>
        </div>
      </div>
    </div>
  );
};
