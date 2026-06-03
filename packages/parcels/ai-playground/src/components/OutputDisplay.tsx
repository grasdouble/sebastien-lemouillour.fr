import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './OutputDisplay.module.css';

type OutputDisplayProps = {
  output: string;
  isStreaming?: boolean;
  onClear?: () => void;
};

export const OutputDisplay: FC<OutputDisplayProps> = ({ output, isStreaming, onClear }) => {
  const { t } = useTranslation('ai-playground');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(output)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Ignore clipboard errors
      });
  }, [output]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{t('playground.output.title')}</h2>
        <div className={styles.actions}>
          {output && (
            <>
              <button type="button" onClick={handleCopy} className={styles.button}>
                {copied ? t('playground.output.copied') : t('playground.output.copy')}
              </button>
              {onClear && (
                <button type="button" onClick={onClear} className={styles.button}>
                  {t('playground.output.clear')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.outputBox}>
        {isStreaming && <div className={styles.streaming}>{t('playground.output.streaming')}</div>}
        {output || <div className={styles.empty}>{t('playground.output.empty')}</div>}
      </div>
    </div>
  );
};
