import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Box, Center, Stack, Text } from '@grasdouble/lufa_design-system';

import styles from './LoadingIndicator.module.css';

export type LoadingIndicatorProps = {
  progress: number;
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'error';
  modelName?: string;
  error?: string;
};

export const LoadingIndicator: FC<LoadingIndicatorProps> = ({ progress, status, modelName, error }) => {
  const { t } = useTranslation('ai-chatbot-llm');

  // Don't render anything if not loading
  if (progress === 0 || status === 'idle' || status === 'ready') {
    return null;
  }

  const getStatusMessage = () => {
    if (status === 'error' && error) {
      return error;
    }
    return t(`loading.${status}`);
  };

  const getStatusVariant = () => {
    if (status === 'error') return 'danger';
    if (status === 'downloading') return 'info';
    if (status === 'loading') return 'warning';
    return 'default';
  };

  return (
    <Box padding="spacious" role="status" aria-live="polite">
      <Center>
        <Stack direction="vertical" spacing="default" style={{ width: '100%', maxWidth: '500px' }}>
          {modelName && (
            <Text variant="body" weight="semibold" align="center">
              {t('loading.model')}: {modelName}
            </Text>
          )}

          <Center>
            <Badge variant={getStatusVariant()} size="md">
              {getStatusMessage()}
            </Badge>
          </Center>

          <Stack direction="horizontal" spacing="compact" align="center">
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ flex: 1 }}
            >
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <Text variant="body-small" weight="semibold" style={{ minWidth: '3rem', textAlign: 'right' }}>
              {Math.round(progress)}%
            </Text>
          </Stack>
        </Stack>
      </Center>
    </Box>
  );
};
