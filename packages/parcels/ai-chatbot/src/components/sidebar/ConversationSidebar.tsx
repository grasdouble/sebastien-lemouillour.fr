import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Card, Flex, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Conversation } from '../../types/conversation';
import styles from './ConversationSidebar.module.css';

type ConversationSidebarProps = {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
};

export const ConversationSidebar: FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
}) => {
  const { t, i18n } = useTranslation('ai-chatbot');

  const formatDate = (date: Date): string => {
    const locale = i18n.language;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={styles.conversationHistory}>
      <div className={styles.conversationList}>
        {conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <Text variant="body" color="tertiary" style={{ fontStyle: 'italic' }}>
              {t('chatbot.history.empty')}
            </Text>
          </div>
        ) : (
          <Stack direction="vertical" spacing="tight">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${
                  conversation.id === currentConversationId ? styles.active : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
                role="button"
                tabIndex={0}
                aria-label={`${t('chatbot.history.load')} ${conversation.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectConversation(conversation.id);
                  }
                }}
              >
                <Card className={styles.conversationCard}>
                  <Flex justify="between" align="start" gap="compact">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="body" className={styles.conversationTitle}>
                        {conversation.title}
                      </Text>
                      <Flex gap="tight" align="center" style={{ marginTop: '4px' }}>
                        <Text variant="caption" className={styles.conversationMeta}>
                          {conversation.messages.length} {t('chatbot.history.messages')}
                        </Text>
                        <Text variant="caption" className={styles.conversationMeta}>
                          •
                        </Text>
                        <Text variant="caption" className={styles.conversationMeta}>
                          {formatDate(conversation.updatedAt)}
                        </Text>
                      </Flex>
                    </Box>
                    <Button
                      variant="secondary"
                      size="sm"
                      className={styles.deleteButton}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                      aria-label={t('chatbot.history.delete')}
                    >
                      🗑️
                    </Button>
                  </Flex>
                </Card>
              </div>
            ))}
          </Stack>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" size="sm" fullWidth onClick={onNewConversation}>
          + {t('chatbot.history.new')}
        </Button>
      </div>
    </div>
  );
};
