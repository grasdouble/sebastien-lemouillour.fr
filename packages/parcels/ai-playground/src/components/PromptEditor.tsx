import type { ChangeEvent, FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
    <div className={styles.container}>
      <h2>{t('playground.prompt.title')}</h2>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        placeholder={t('playground.prompt.placeholder')}
        disabled={disabled}
        aria-label={t('playground.prompt.title')}
        rows={6}
      />
    </div>
  );
};
