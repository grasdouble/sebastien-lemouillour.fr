import type { ChangeEvent, FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenerationConfig } from '@grasdouble/slm_shared';
import { Input, Stack, Text } from '@grasdouble/lufa_design-system';

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
    <Stack direction="vertical" spacing="compact">
      <Text as="h2" weight="semibold" color="primary">
        {t('playground.parameters.title')}
      </Text>
      <Stack direction="vertical" spacing="comfortable">
        <div className={styles.control}>
          <label>
            <Text as="span" weight="semibold" className={styles.label}>
              {t('playground.parameters.temperature.label')}
            </Text>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature ?? 0.7}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('temperature', parseFloat(e.target.value))}
              disabled={disabled}
              aria-label={t('playground.parameters.temperature.label')}
              className={styles.rangeInput}
            />
            <span className={styles.value}>{(config.temperature ?? 0.7).toFixed(1)}</span>
          </label>
          <Text as="p" variant="body-small" color="secondary" className={styles.hint}>
            {t('playground.parameters.temperature.hint')}
          </Text>
        </div>

        <div className={styles.control}>
          <label>
            <Text as="span" weight="semibold" className={styles.label}>
              {t('playground.parameters.topP.label')}
            </Text>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.topP ?? 0.9}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('topP', parseFloat(e.target.value))}
              disabled={disabled}
              aria-label={t('playground.parameters.topP.label')}
              className={styles.rangeInput}
            />
            <span className={styles.value}>{(config.topP ?? 0.9).toFixed(2)}</span>
          </label>
          <Text as="p" variant="body-small" color="secondary" className={styles.hint}>
            {t('playground.parameters.topP.hint')}
          </Text>
        </div>

        <div className={styles.control}>
          <label>
            <Text as="span" weight="semibold" className={styles.label}>
              {t('playground.parameters.maxTokens.label')}
            </Text>
            <Input
              type="number"
              min={1}
              max={4096}
              value={config.maxTokens ?? 256}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('maxTokens', parseInt(e.target.value, 10))}
              disabled={disabled}
              aria-label={t('playground.parameters.maxTokens.label')}
            />
          </label>
          <Text as="p" variant="body-small" color="secondary" className={styles.hint}>
            {t('playground.parameters.maxTokens.hint')}
          </Text>
        </div>
      </Stack>
    </Stack>
  );
};
