import type { ChangeEvent, FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Label, Stack, Text } from '@grasdouble/lufa_design-system';

import type { ModelConfig } from '../../../llm/types';
import { MODEL_REGISTRY } from '../../../llm/model-registry';
import styles from './ModelSelector.module.css';

export type ModelSelectorProps = {
  onSelect: (model: ModelConfig) => void;
  selectedModel: ModelConfig | null;
  disabled?: boolean;
};

export const ModelSelector: FC<ModelSelectorProps> = ({ onSelect, selectedModel, disabled }) => {
  const { t } = useTranslation('ai-chatbot-llm');

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (disabled) return;
      const model = MODEL_REGISTRY.find((m) => m.id === e.target.value);
      if (model) {
        onSelect(model);
      }
    },
    [onSelect, disabled]
  );

  return (
    <Stack direction="vertical" spacing="compact">
      <Label htmlFor="model-select">
        <Text as="h2" weight="semibold" color="primary">
          {t('models.title')}
        </Text>
      </Label>
      <select
        id="model-select"
        value={selectedModel?.id ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className={styles.select}
        aria-label={t('models.select')}
      >
        <option value="" disabled>
          {t('models.select')}
        </option>
        {MODEL_REGISTRY.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} — {model.estimatedSizeGB}GB • {model.minMemoryGB}GB RAM
            {model.description ? ` • ${model.description}` : ''}
          </option>
        ))}
      </select>
    </Stack>
  );
};
