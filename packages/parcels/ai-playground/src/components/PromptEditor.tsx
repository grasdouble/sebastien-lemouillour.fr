import type { ChangeEvent, FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Stack, Text } from '@grasdouble/lufa_design-system';

import styles from './PromptEditor.module.css';

type PromptEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const PromptEditor: FC<PromptEditorProps> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation('ai-playground');

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <Stack direction="vertical" spacing="compact">
      <Text as="h2" weight="semibold" color="primary">
        {t('playground.prompt.title')}
      </Text>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        placeholder={t('playground.prompt.placeholder')}
        disabled={disabled}
        aria-label={t('playground.prompt.title')}
        rows={6}
      />
    </Stack>
  );
};
