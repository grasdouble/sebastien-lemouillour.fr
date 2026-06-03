import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './LoadingIndicator.module.css';

type LoadingIndicatorProps = {
  progress: number;
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'error';
  modelName?: string;
  error?: string;
};

export const LoadingIndicator: FC<LoadingIndicatorProps> = ({ progress, status, modelName, error }) => {
  const { t } = useTranslation('ai-chatbot');

  // Don't render anything if not loading
  if (progress === 0 || status === 'idle' || status === 'ready') {
    return null;
  }

  const getStatusMessage = () => {
    if (status === 'error' && error) {
      return error;
    }
    return t(`chatbot.loading.${status}`);
  };

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.content}>
        {modelName && (
          <div className={styles.modelName}>
            {t('chatbot.loading.model')}: {modelName}
          </div>
        )}
        <div className={styles.status}>{getStatusMessage()}</div>
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.percentage}>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};
