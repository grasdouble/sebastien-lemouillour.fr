import type { ChangeEvent, FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenerationConfig } from '@grasdouble/slm_shared';

import styles from './ParametersPanel.module.css';

type ParametersPanelProps = {
  config: GenerationConfig;
  onChange: (config: GenerationConfig) => void;
  disabled?: boolean;
};

export const ParametersPanel: FC<ParametersPanelProps> = ({ config, onChange, disabled }) => {
  const { t } = useTranslation('ai-playground');

  const handleChange = useCallback(
    (key: keyof GenerationConfig, value: number) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange]
  );

  return (
    <div className={styles.container}>
      <h2>{t('playground.parameters.title')}</h2>
      <div className={styles.controls}>
        <div className={styles.control}>
          <label>
            <span className={styles.label}>{t('playground.parameters.temperature.label')}</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature ?? 0.7}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('temperature', parseFloat(e.target.value))}
              disabled={disabled}
              aria-label={t('playground.parameters.temperature.label')}
            />
            <span className={styles.value}>{(config.temperature ?? 0.7).toFixed(1)}</span>
          </label>
          <p className={styles.hint}>{t('playground.parameters.temperature.hint')}</p>
        </div>

        <div className={styles.control}>
          <label>
            <span className={styles.label}>{t('playground.parameters.topP.label')}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.topP ?? 0.9}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('topP', parseFloat(e.target.value))}
              disabled={disabled}
              aria-label={t('playground.parameters.topP.label')}
            />
            <span className={styles.value}>{(config.topP ?? 0.9).toFixed(2)}</span>
          </label>
          <p className={styles.hint}>{t('playground.parameters.topP.hint')}</p>
        </div>

        <div className={styles.control}>
          <label>
            <span className={styles.label}>{t('playground.parameters.maxTokens.label')}</span>
            <input
              type="number"
              min="1"
              max="4096"
              value={config.maxTokens ?? 256}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('maxTokens', parseInt(e.target.value, 10))}
              disabled={disabled}
              aria-label={t('playground.parameters.maxTokens.label')}
            />
          </label>
          <p className={styles.hint}>{t('playground.parameters.maxTokens.hint')}</p>
        </div>
      </div>
    </div>
  );
};
