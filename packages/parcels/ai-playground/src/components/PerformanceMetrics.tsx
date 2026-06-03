import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Stack, Text } from '@grasdouble/lufa_design-system';

import styles from './PerformanceMetrics.module.css';

type PerformanceMetricsProps = {
  tokensPerSecond?: number;
  latencyMs?: number;
  totalTokens?: number;
  timeElapsedMs?: number;
};

export const PerformanceMetrics: FC<PerformanceMetricsProps> = ({
  tokensPerSecond,
  latencyMs,
  totalTokens,
  timeElapsedMs,
}) => {
  const { t } = useTranslation('ai-playground');

  return (
    <Box backgroundColor="muted" padding="default" className={styles.container}>
      <Text as="h2" weight="semibold" color="primary">
        {t('playground.metrics.title')}
      </Text>
      <div className={styles.grid}>
        <Stack direction="vertical" spacing="tight">
          <Text variant="body-small" color="secondary">
            {t('playground.metrics.tokensPerSec')}:
          </Text>
          <Text className={styles.value}>{tokensPerSecond !== undefined ? tokensPerSecond.toFixed(2) : '-'}</Text>
        </Stack>
        <Stack direction="vertical" spacing="tight">
          <Text variant="body-small" color="secondary">
            {t('playground.metrics.latency')}:
          </Text>
          <Text className={styles.value}>{latencyMs !== undefined ? `${latencyMs.toFixed(0)}ms` : '-'}</Text>
        </Stack>
        <Stack direction="vertical" spacing="tight">
          <Text variant="body-small" color="secondary">
            {t('playground.metrics.totalTokens')}:
          </Text>
          <Text className={styles.value}>{totalTokens ?? '-'}</Text>
        </Stack>
        <Stack direction="vertical" spacing="tight">
          <Text variant="body-small" color="secondary">
            {t('playground.metrics.timeElapsed')}:
          </Text>
          <Text className={styles.value}>
            {timeElapsedMs !== undefined ? `${(timeElapsedMs / 1000).toFixed(1)}s` : '-'}
          </Text>
        </Stack>
      </div>
    </Box>
  );
};
