import type { FC, FormEvent, KeyboardEvent } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Stack } from '@grasdouble/lufa_design-system';

import styles from './MessageInput.module.css';

type MessageInputProps = {
  onSend: (message: string) => void;
  disabled: boolean;
};

export const MessageInput: FC<MessageInputProps> = ({ onSend, disabled }) => {
  const { t } = useTranslation('ai-chatbot');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleSendClick = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSend(message.trim());
        setMessage('');
      }
    }
  };

  return (
    <Box padding="default">
      <form onSubmit={handleSubmit}>
        <Stack direction="horizontal" spacing="compact" align="end">
          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatbot.chat.input.placeholder')}
            disabled={disabled}
            rows={3}
            aria-label={t('chatbot.chat.input.label')}
          />
          <Button
            type="solid"
            variant="primary"
            size="lg"
            disabled={disabled || !message.trim()}
            onClick={handleSendClick}
            aria-label={t('chatbot.chat.input.send')}
          >
            {t('chatbot.chat.input.send')}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
