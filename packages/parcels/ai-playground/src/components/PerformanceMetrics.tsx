import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
    <div className={styles.container}>
      <h2>{t('playground.metrics.title')}</h2>
      <div className={styles.grid}>
        <div className={styles.metric}>
          <span className={styles.label}>{t('playground.metrics.tokensPerSec')}:</span>
          <span className={styles.value}>{tokensPerSecond !== undefined ? tokensPerSecond.toFixed(2) : '-'}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>{t('playground.metrics.latency')}:</span>
          <span className={styles.value}>{latencyMs !== undefined ? `${latencyMs.toFixed(0)}ms` : '-'}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>{t('playground.metrics.totalTokens')}:</span>
          <span className={styles.value}>{totalTokens ?? '-'}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>{t('playground.metrics.timeElapsed')}:</span>
          <span className={styles.value}>
            {timeElapsedMs !== undefined ? `${(timeElapsedMs / 1000).toFixed(1)}s` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
