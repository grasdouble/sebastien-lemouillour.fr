import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './MessageList.module.css';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type MessageListProps = {
  messages: Message[];
};

export const MessageList: FC<MessageListProps> = ({ messages }) => {
  const { t } = useTranslation('ai-chatbot');

  if (messages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{t('chatbot.chat.empty')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container} role="log" aria-live="polite" aria-atomic="false">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.message} ${styles[message.role]}`}
          role="article"
          aria-label={`${message.role === 'user' ? t('chatbot.message.user') : t('chatbot.message.assistant')}`}
        >
          <div className={styles.messageHeader}>
            <span className={styles.role}>
              {message.role === 'user' ? t('chatbot.message.user') : t('chatbot.message.assistant')}
            </span>
            <span className={styles.timestamp}>{message.timestamp.toLocaleTimeString()}</span>
          </div>
          <div className={styles.content}>{message.content}</div>
        </div>
      ))}
    </div>
  );
};
