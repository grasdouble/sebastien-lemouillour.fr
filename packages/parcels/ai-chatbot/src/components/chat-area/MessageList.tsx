import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Flex, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Message } from '../../types/message';
import { MessageContent } from './MessageContent';
import styles from './MessageList.module.css';

type MessageListProps = {
  messages: Message[];
  isReady?: boolean;
  modelName?: string;
  isGenerating?: boolean;
};

export const MessageList: FC<MessageListProps> = ({ messages, isReady, modelName, isGenerating = false }) => {
  const { t } = useTranslation('ai-chatbot');

  if (messages.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Flex direction="column" align="center" justify="center" gap="spacious">
          <Text variant="h3" align="center">
            {isReady ? t('chatbot.chat.welcome') : t('chatbot.chat.selectModel')}
          </Text>
          {isReady && modelName && (
            <>
              <Text variant="body" color="secondary" align="center">
                {t('chatbot.chat.welcomeSubtitle', { modelName })}
              </Text>
              <Box className={styles.examplesGrid}>
                <div className={styles.exampleCard}>
                  <Text variant="body" weight="medium">
                    💡 {t('chatbot.examples.creative')}
                  </Text>
                  <Text variant="caption" color="tertiary">
                    {t('chatbot.examples.creativeExample')}
                  </Text>
                </div>
                <div className={styles.exampleCard}>
                  <Text variant="body" weight="medium">
                    📝 {t('chatbot.examples.explain')}
                  </Text>
                  <Text variant="caption" color="tertiary">
                    {t('chatbot.examples.explainExample')}
                  </Text>
                </div>
                <div className={styles.exampleCard}>
                  <Text variant="body" weight="medium">
                    🔧 {t('chatbot.examples.code')}
                  </Text>
                  <Text variant="caption" color="tertiary">
                    {t('chatbot.examples.codeExample')}
                  </Text>
                </div>
              </Box>
            </>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <Box className={styles.messageListContainer}>
      <Stack direction="vertical" spacing="none" role="log" aria-live="polite" aria-atomic="false">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageRow} ${message.role === 'user' ? styles.userRow : styles.assistantRow}`}
            role="article"
            aria-label={`${message.role === 'user' ? t('chatbot.message.user') : t('chatbot.message.assistant')}`}
          >
            <Box className={styles.messageWrapper}>
              <Flex gap="default" align="start" className={styles.messageContent}>
                <div className={styles.avatar}>{message.role === 'user' ? '👤' : '🤖'}</div>
                <Stack direction="vertical" spacing="tight" style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight="medium" size="sm">
                    {message.role === 'user'
                      ? t('chatbot.message.user')
                      : modelName
                        ? `${t('chatbot.message.assistant')} (${modelName})`
                        : t('chatbot.message.assistant')}
                  </Text>
                  <MessageContent content={message.content} role={message.role} />
                </Stack>
              </Flex>
            </Box>
          </div>
        ))}
        {isGenerating && (
          <div
            className={`${styles.messageRow} ${styles.assistantRow}`}
            role="article"
            aria-label={t('chatbot.message.assistant')}
            aria-live="polite"
          >
            <Box className={styles.messageWrapper}>
              <Flex gap="default" align="start" className={styles.messageContent}>
                <div className={styles.avatar}>🤖</div>
                <Stack direction="vertical" spacing="tight" style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight="medium" size="sm">
                    {modelName ? `${t('chatbot.message.assistant')} (${modelName})` : t('chatbot.message.assistant')}
                  </Text>
                  <Text variant="body" color="secondary">
                    {t('chatbot.chat.generating')}
                  </Text>
                </Stack>
              </Flex>
            </Box>
          </div>
        )}
      </Stack>
    </Box>
  );
};
