import type { FC, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, Flex, Icon, Stack, Text } from '@grasdouble/lufa_design-system';

import type { ModelConfig } from '../../llm/types';
import { MODEL_REGISTRY } from '../../llm/model-registry';
import styles from './ModelSelector.module.css';

export type ModelSelectorProps = {
  onSelect: (model: ModelConfig) => void;
  selectedModel: ModelConfig | null;
  disabled?: boolean;
};

export const ModelSelector: FC<ModelSelectorProps> = ({ onSelect, selectedModel, disabled }) => {
  const { t } = useTranslation('slm-shared');

  const handleSelect = useCallback(
    (model: ModelConfig) => {
      if (disabled) return;
      onSelect(model);
    },
    [onSelect, disabled]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, model: ModelConfig) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(model);
      }
    },
    [disabled, handleSelect]
  );

  return (
    <Stack direction="vertical" spacing="compact">
      <Text as="h2" weight="semibold" color="primary">
        {t('models.title')}
      </Text>
      <div className={styles.grid}>
        {MODEL_REGISTRY.map((model) => {
          const isSelected = selectedModel?.id === model.id;
          return (
            <Card
              key={model.id}
              as="button"
              role="button"
              onClick={() => handleSelect(model)}
              onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => handleKeyDown(e, model)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={styles.card}
            >
              <Stack direction="vertical" spacing="none">
                <Flex direction="row" justify="start" align="center" gap="tight">
                  <Text as="h3" weight="semibold" size="small">
                    {model.name}
                  </Text>
                  {isSelected && <Icon name="check-circle" size="sm" color="success" />}
                </Flex>
                <Flex direction="row" justify="start" align="center" gap="tight">
                  <Text variant="body-small" color="secondary">
                    {model.estimatedSizeGB}GB
                  </Text>
                  <Text variant="body-small" color="tertiary">
                    •
                  </Text>
                  <Text variant="body-small" color="secondary">
                    {model.minMemoryGB}GB RAM
                  </Text>
                </Flex>
              </Stack>
            </Card>
          );
        })}
      </div>
    </Stack>
  );
};
