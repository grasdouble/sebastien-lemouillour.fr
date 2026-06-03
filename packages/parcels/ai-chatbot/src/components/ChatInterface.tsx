import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelConfig } from '@grasdouble/slm_shared';
import { Box, Container, Divider, Stack, Text } from '@grasdouble/lufa_design-system';
import { useCapabilities, useModelLoader } from '@grasdouble/slm_shared';

import type { Message } from './MessageList';
import { CapabilitiesWarning } from './CapabilitiesWarning';
import { LoadingIndicator } from './LoadingIndicator';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { ModelSelector } from './ModelSelector';

export const ChatInterface: FC = () => {
  const { t } = useTranslation('ai-chatbot');
  const capabilities = useCapabilities();
  const { progress: loadProgress, provider, loadModel } = useModelLoader();

  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const progressPercent = loadProgress.progress;
  const loadingStatus = loadProgress.status;

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
      if (provider === null || isGenerating) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);

      provider
        .generate(content)
        .then((result) => {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: result.text,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        })
        .catch(() => {
          const errorMsg: Message = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: t('chatbot.chat.error'),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    },
    [provider, isGenerating, t]
  );

  const isReady = loadingStatus === 'ready' && provider !== null;

  return (
    <Container size="xl" paddingBlock="none" fluid>
      <Stack direction="vertical" spacing="none" style={{ minHeight: '100vh' }}>
        <Box
          padding="comfortable"
          style={{ backgroundColor: 'var(--lufa-semantic-ui-background-brand)', textAlign: 'center' }}
        >
          <Stack direction="vertical" spacing="tight">
            <Text as="h1" variant="h1" weight="bold" color="inverse">
              {t('chatbot.title')}
            </Text>
            <Text variant="body-small" color="inverse">
              {t('chatbot.subtitle')}
            </Text>
          </Stack>
        </Box>

        <CapabilitiesWarning capabilities={capabilities} minRequiredMemoryGB={selectedModel?.minMemoryGB ?? 4} />

        <Box padding="default">
          <ModelSelector
            onSelect={handleModelSelect}
            selectedModel={selectedModel}
            disabled={Boolean(isGenerating) || loadingStatus === 'downloading' || loadingStatus === 'loading'}
          />
        </Box>

        <Divider spacing="compact" />

        {(loadingStatus === 'downloading' || loadingStatus === 'loading') && (
          <LoadingIndicator progress={progressPercent} status={loadingStatus} modelName={selectedModel?.name} />
        )}

        <Box style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <MessageList messages={messages} />
        </Box>

        <Divider spacing="compact" />

        <Box>
          <MessageInput onSend={handleSendMessage} disabled={!isReady || Boolean(isGenerating)} />
        </Box>
      </Stack>
    </Container>
  );
};
