import type { FC, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelConfig } from '@grasdouble/slm_shared';
import { Badge, Card, Flex, Stack, Text } from '@grasdouble/lufa_design-system';
import { MODEL_REGISTRY } from '@grasdouble/slm_shared';

import styles from './ModelSelector.module.css';

type ModelSelectorProps = {
  onSelect: (model: ModelConfig) => void;
  selectedModel: ModelConfig | null;
  disabled?: boolean;
};

export const ModelSelector: FC<ModelSelectorProps> = ({ onSelect, selectedModel, disabled }) => {
  const { t } = useTranslation('ai-playground');

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
        {t('playground.models.title')}
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
              <Stack direction="vertical" spacing="compact">
                <Flex direction="row" justify="between" align="center">
                  <Text as="h3" weight="semibold">
                    {model.name}
                  </Text>
                  {isSelected && <Badge variant="success">{t('playground.models.selected')}</Badge>}
                </Flex>
                <Stack direction="vertical" spacing="tight">
                  <Flex direction="row" justify="start" align="center" gap="compact">
                    <Text variant="body-small" weight="semibold" color="secondary">
                      {t('playground.models.specs.size')}:
                    </Text>
                    <Text variant="body-small" color="secondary">
                      {model.estimatedSizeGB}GB
                    </Text>
                  </Flex>
                  <Flex direction="row" justify="start" align="center" gap="compact">
                    <Text variant="body-small" weight="semibold" color="secondary">
                      {t('playground.models.specs.memory')}:
                    </Text>
                    <Text variant="body-small" color="secondary">
                      {model.minMemoryGB}GB
                    </Text>
                  </Flex>
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </div>
    </Stack>
  );
};
