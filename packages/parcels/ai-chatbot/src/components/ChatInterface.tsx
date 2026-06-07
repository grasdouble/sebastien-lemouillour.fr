import type { CSSProperties, FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Container, Flex, Stack, Text } from '@grasdouble/lufa_design-system';

import type { ChatMessage, ModelConfig } from '../llm/types';
import type { Message } from '../types/message';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { useCapabilities, useModelLoader } from '../llm';
import { MessageInput } from './chat-area/MessageInput';
import { MessageList } from './chat-area/MessageList';
import styles from './ChatInterface.module.css';
import { LoadingIndicator, ModelSelector } from './model-setup';
import { CapabilitiesCheck } from './model-setup/CapabilitiesCheck';
import { ConversationSidebar } from './sidebar/ConversationSidebar';

export const ChatInterface: FC = () => {
  const { t } = useTranslation('ai-chatbot');
  const capabilities = useCapabilities();
  const { progress: loadProgress, provider, loadModel, retryLoadModel } = useModelLoader();

  const {
    conversations,
    currentConversation,
    createConversation,
    loadConversation,
    updateConversation,
    deleteConversation,
  } = useConversationHistory();

  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(0);
  const pendingMessageRef = useRef<string | null>(null);
  const isGeneratingRef = useRef(false);

  const progressPercent = loadProgress.progress;
  const loadingStatus = loadProgress.status;

  // Use current conversation messages as source of truth (memoized to avoid recreating on every render)
  const messages = useMemo(() => currentConversation?.messages ?? [], [currentConversation?.messages]);

  const handleNewConversation = useCallback(() => {
    createConversation(t('chatbot.history.defaultTitle'), selectedModel?.id);
  }, [createConversation, selectedModel?.id, t]);

  const handleLoadConversation = useCallback(
    (id: string) => {
      loadConversation(id);
    },
    [loadConversation]
  );

  const handleDeleteConversation = useCallback(
    (id: string) => {
      if (window.confirm(t('chatbot.history.confirmDelete'))) {
        deleteConversation(id);
      }
    },
    [deleteConversation, t]
  );

  const handleModelSelect = useCallback(
    (model: ModelConfig) => {
      setSelectedModel(model);

      loadModel(model).catch(() => {
        // Error is handled by loadProgress.status = 'error'
      });
    },
    [loadModel]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (provider === null || isGeneratingRef.current) return;

      // Create a new conversation if none exists
      const conversationId = currentConversation?.id;
      if (!currentConversation) {
        pendingMessageRef.current = content;
        createConversation(t('chatbot.history.defaultTitle'), selectedModel?.id);
        return;
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      updateConversation(conversationId!, updatedMessages);
      isGeneratingRef.current = true;
      setIsGenerating(true);

      // Convert UI messages to ChatMessage format for the provider
      const chatHistory: ChatMessage[] = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      provider
        .generate(chatHistory)
        .then((result) => {
          // Check if conversation still exists before updating
          if (!currentConversation) return;

          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: result.text,
            timestamp: new Date(),
          };

          updateConversation(conversationId!, [...updatedMessages, assistantMessage]);
        })
        .catch(() => {
          // Check if conversation still exists before updating
          if (!currentConversation) return;

          const errorMsg: Message = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: t('chatbot.chat.error'),
            timestamp: new Date(),
          };
          updateConversation(conversationId!, [...updatedMessages, errorMsg]);
        })
        .finally(() => {
          isGeneratingRef.current = false;
          setIsGenerating(false);
        });
    },
    [provider, messages, t, currentConversation, createConversation, selectedModel?.id, updateConversation]
  );

  const isReady = loadingStatus === 'ready' && provider !== null;

  // Cancel generation if current conversation is deleted
  useEffect(() => {
    if (!currentConversation && isGeneratingRef.current) {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, [currentConversation]);

  // Auto-send pending message when conversation is created
  useEffect(() => {
    if (pendingMessageRef.current && currentConversation && provider && !isGeneratingRef.current) {
      const content = pendingMessageRef.current;
      pendingMessageRef.current = null;
      handleSendMessage(content);
    }
  }, [currentConversation, provider, handleSendMessage]);

  useEffect(() => {
    const header = document.getElementById('lufa-header');
    if (!header) {
      return;
    }

    const updateOffset = () => {
      setHeaderOffset(Math.ceil(header.getBoundingClientRect().height));
    };

    updateOffset();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateOffset);
      return () => window.removeEventListener('resize', updateOffset);
    }

    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Container
      size="xl"
      paddingBlock="none"
      fluid
      className={styles.chatContainer}
      style={{ '--chat-header-offset': `${headerOffset}px` } as CSSProperties}
    >
      <Flex className={styles.layout}>
        {/* Sidebar with conversation history and settings */}
        <Box className={styles.sidebar} data-testid="chat-conversations-region">
          <Stack direction="vertical" spacing="none" style={{ height: '100%' }}>
            <ConversationSidebar
              conversations={conversations}
              currentConversationId={currentConversation?.id ?? null}
              onSelectConversation={handleLoadConversation}
              onDeleteConversation={handleDeleteConversation}
              onNewConversation={handleNewConversation}
            />

            <Box padding="compact" style={{ borderTop: '1px solid var(--lufa-color-border-default)' }}>
              <Stack direction="vertical" spacing="tight">
                <ModelSelector
                  onSelect={handleModelSelect}
                  selectedModel={selectedModel}
                  disabled={Boolean(isGenerating) || loadingStatus === 'downloading' || loadingStatus === 'loading'}
                />

                <CapabilitiesCheck capabilities={capabilities} minRequiredMemoryGB={selectedModel?.minMemoryGB ?? 4} />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Main chat area */}
        <Stack direction="vertical" spacing="none" className={styles.main} data-testid="chat-main-region">
          {/* Show loading indicator in place of messages during download/loading */}
          {(loadingStatus === 'downloading' || loadingStatus === 'loading') && (
            <Box className={styles.messages}>
              <Box
                padding="default"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
              >
                <LoadingIndicator
                  progress={progressPercent}
                  status={loadingStatus}
                  modelName={selectedModel?.name}
                  loadingFromCache={loadProgress.loadingFromCache ?? false}
                />
              </Box>
            </Box>
          )}

          {/* Show error state in place of messages */}
          {loadingStatus === 'error' && (
            <Box className={styles.messages}>
              <Box
                padding="default"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
              >
                <Stack direction="vertical" spacing="default" style={{ maxWidth: '32rem', textAlign: 'center' }}>
                  <Text variant="body" color="warning">
                    {t('chatbot.chat.loadError')}
                  </Text>
                  <Button variant="primary" size="md" onClick={() => retryLoadModel()}>
                    {t('chatbot.chat.retry')}
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}

          {/* Show normal chat only when not loading/error */}
          {loadingStatus !== 'downloading' && loadingStatus !== 'loading' && loadingStatus !== 'error' && (
            <>
              <Box className={styles.messages}>
                <MessageList
                  messages={messages}
                  isReady={isReady}
                  modelName={selectedModel?.name}
                  isGenerating={isGenerating}
                />
              </Box>

              <Box className={styles.inputArea}>
                <MessageInput onSend={handleSendMessage} disabled={!isReady || Boolean(isGenerating)} />
              </Box>
            </>
          )}
        </Stack>
      </Flex>
    </Container>
  );
};
