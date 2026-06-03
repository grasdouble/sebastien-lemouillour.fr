import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Box, Card, Flex, Stack, Text } from '@grasdouble/lufa_design-system';

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
      <Box
        padding="spacious"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}
      >
        <Text variant="body" color="tertiary" style={{ fontStyle: 'italic' }}>
          {t('chatbot.chat.empty')}
        </Text>
      </Box>
    );
  }

  return (
    <Box padding="default">
      <Stack direction="vertical" spacing="default" role="log" aria-live="polite" aria-atomic="false">
        {messages.map((message) => (
          <div
            key={message.id}
            className={styles[message.role]}
            role="article"
            aria-label={`${message.role === 'user' ? t('chatbot.message.user') : t('chatbot.message.assistant')}`}
          >
            <Card>
              <Stack direction="vertical" spacing="tight">
                <Flex justify="between" align="center" gap="default">
                  <Badge variant={message.role === 'user' ? 'info' : 'default'} size="sm">
                    {message.role === 'user' ? t('chatbot.message.user') : t('chatbot.message.assistant')}
                  </Badge>
                  <Text variant="caption" color="tertiary">
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
                </Flex>
                <Text variant="body" className={styles.messageContent}>
                  {message.content}
                </Text>
              </Stack>
            </Card>
          </div>
        ))}
      </Stack>
    </Box>
  );
};
