import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelConfig } from '@grasdouble/slm_shared';
import { Badge, Card, Flex, Stack, Text } from '@grasdouble/lufa_design-system';
import { MODEL_REGISTRY } from '@grasdouble/slm_shared';

import styles from './ModelSelector.module.css';

export type ModelSelectorProps = {
  onSelect: (model: ModelConfig) => void;
  selectedModel: ModelConfig | null;
  disabled?: boolean;
};

export function ModelSelector({ onSelect, selectedModel, disabled }: ModelSelectorProps) {
  const { t } = useTranslation('ai-chatbot');

  return (
    <Stack direction="vertical" spacing="default">
      <Text as="h2" variant="h3" weight="semibold">
        {t('chatbot.model.title')}
      </Text>

      <div className={styles.modelGrid}>
        {MODEL_REGISTRY.map((model) => {
          const isSelected = selectedModel?.id === model.id;

          return (
            <Card
              key={model.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-pressed={isSelected}
              aria-disabled={disabled}
              onClick={() => !disabled && onSelect(model)}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelect(model);
                }
              }}
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                outline: isSelected ? '2px solid var(--lufa-semantic-ui-border-focus)' : undefined,
                outlineOffset: '2px',
              }}
            >
              <Stack direction="vertical" spacing="compact">
                <Flex justify="between" align="center" gap="default">
                  <Text variant="body" weight="semibold">
                    {model.name}
                  </Text>
                  <Badge variant="info" size="sm">
                    {model.parameterCount}
                  </Badge>
                </Flex>

                <Stack direction="vertical" spacing="tight">
                  <Text variant="body-small" color="secondary">
                    {t('chatbot.model.info.size')}: {model.estimatedSizeGB}GB
                  </Text>
                  <Text variant="body-small" color="secondary">
                    {t('chatbot.model.info.minMemory')}: {model.minMemoryGB}GB
                  </Text>
                  {model.requiresWebGPU && (
                    <Badge variant="warning" size="sm">
                      {t('chatbot.model.info.requiresWebGPU')}
                    </Badge>
                  )}
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </div>

      {!selectedModel && (
        <Text variant="body-small" color="tertiary" aria-live="polite">
          {t('chatbot.model.select')}
        </Text>
      )}
    </Stack>
  );
}
