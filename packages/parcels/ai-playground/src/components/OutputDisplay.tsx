import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Flex, Stack, Text } from '@grasdouble/lufa_design-system';

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
    <Stack direction="vertical" spacing="compact">
      <Flex direction="row" justify="between" align="center">
        <Text as="h2" weight="semibold" color="primary">
          {t('playground.output.title')}
        </Text>
        <Flex direction="row" gap="compact">
          {output && (
            <>
              <Button type="outline" variant="primary" size="sm" onClick={handleCopy}>
                {copied ? t('playground.output.copied') : t('playground.output.copy')}
              </Button>
              {onClear && (
                <Button type="outline" variant="neutral" size="sm" onClick={onClear}>
                  {t('playground.output.clear')}
                </Button>
              )}
            </>
          )}
        </Flex>
      </Flex>
      <div className={styles.outputBox}>
        {isStreaming && (
          <Badge variant="info" className={styles.streaming}>
            {t('playground.output.streaming')}
          </Badge>
        )}
        {output || (
          <Text color="secondary" className={styles.empty}>
            {t('playground.output.empty')}
          </Text>
        )}
      </div>
    </Stack>
  );
};
