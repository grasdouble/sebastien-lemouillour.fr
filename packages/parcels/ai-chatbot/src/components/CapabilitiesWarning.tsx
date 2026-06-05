import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Box, Stack, Text } from '@grasdouble/lufa_design-system';

import type { BrowserCapabilities } from '../llm/types';

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
    <Box
      padding="default"
      style={{ backgroundColor: 'var(--lufa-semantic-ui-background-warning-subtle)' }}
      role="alert"
      aria-live="polite"
    >
      <Stack direction="vertical" spacing="default">
        <Stack direction="horizontal" spacing="compact" align="center">
          <Badge variant="warning" size="md">
            ⚠️
          </Badge>
          <Text variant="body" weight="semibold">
            {t('chatbot.capabilities.title')}
          </Text>
        </Stack>

        <Stack direction="vertical" spacing="comfortable">
          {!hasWebGPU && (
            <Stack direction="vertical" spacing="tight">
              <Text variant="body" weight="semibold" color="warning">
                {t('chatbot.capabilities.noWebGPU.title')}
              </Text>
              <Text variant="body-small" color="secondary">
                {t('chatbot.capabilities.noWebGPU.description')}
              </Text>
              <Text variant="body-small" color="tertiary" style={{ fontStyle: 'italic' }}>
                {t('chatbot.capabilities.noWebGPU.fallback')}
              </Text>
            </Stack>
          )}

          {!hasEnoughMemory && (
            <Stack direction="vertical" spacing="tight">
              <Text variant="body" weight="semibold" color="warning">
                {t('chatbot.capabilities.lowMemory.title')}
              </Text>
              <Text variant="body-small" color="secondary">
                {t('chatbot.capabilities.lowMemory.description', {
                  current: capabilities.deviceMemoryGB,
                  required: minRequiredMemoryGB,
                })}
              </Text>
              <Text variant="body-small" color="tertiary" style={{ fontStyle: 'italic' }}>
                {t('chatbot.capabilities.lowMemory.suggestion')}
              </Text>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
