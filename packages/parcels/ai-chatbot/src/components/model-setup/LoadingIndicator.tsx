import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Center, Stack, Text } from '@grasdouble/lufa_design-system';

import styles from './LoadingIndicator.module.css';

export type LoadingIndicatorProps = {
  progress: number;
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'error';
  modelName?: string;
  loadingFromCache?: boolean;
};

export const LoadingIndicator: FC<LoadingIndicatorProps> = ({ progress, status, modelName, loadingFromCache }) => {
  const { t } = useTranslation('ai-chatbot');

  // Don't render anything if not loading
  if (status === 'idle' || status === 'ready') {
    return null;
  }

  // Show preparing message when progress is 0
  if (progress === 0) {
    return (
      <Box padding="spacious" role="status" aria-live="polite">
        <Center>
          <Stack direction="vertical" spacing="default" style={{ width: '100%', maxWidth: '500px' }}>
            <Text variant="body" weight="semibold" align="center">
              {loadingFromCache ? t('chatbot.model.loadingFromCache') : t('chatbot.model.preparing')}
            </Text>
            {modelName && (
              <Text variant="body-small" align="center">
                {modelName}
              </Text>
            )}
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box padding="spacious" role="status" aria-live="polite">
      <Center>
        <Stack direction="vertical" spacing="default" style={{ width: '100%', maxWidth: '500px' }}>
          {modelName && (
            <Text variant="body" weight="semibold" align="center">
              {loadingFromCache ? t('chatbot.model.loadingFromCache') : t('chatbot.model.loading')}: {modelName}
            </Text>
          )}

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
