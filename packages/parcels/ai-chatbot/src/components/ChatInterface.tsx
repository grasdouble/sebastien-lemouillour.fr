import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelConfig } from '@grasdouble/slm_shared';
import { useCapabilities, useModelLoader } from '@grasdouble/slm_shared';

import type { Message } from './MessageList';
import { CapabilitiesWarning } from './CapabilitiesWarning';
import styles from './ChatInterface.module.css';
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
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('chatbot.title')}</h1>
        <p className={styles.subtitle}>{t('chatbot.subtitle')}</p>
      </header>

      <CapabilitiesWarning capabilities={capabilities} minRequiredMemoryGB={selectedModel?.minMemoryGB ?? 4} />

      <div className={styles.modelSection}>
        <ModelSelector
          onSelect={handleModelSelect}
          selectedModel={selectedModel}
          disabled={Boolean(isGenerating) || loadingStatus === 'downloading' || loadingStatus === 'loading'}
        />
      </div>

      {(loadingStatus === 'downloading' || loadingStatus === 'loading') && (
        <LoadingIndicator progress={progressPercent} status={loadingStatus} modelName={selectedModel?.name} />
      )}

      <div className={styles.chatSection}>
        <MessageList messages={messages} />
      </div>

      <div className={styles.inputSection}>
        <MessageInput onSend={handleSendMessage} disabled={!isReady || Boolean(isGenerating)} />
      </div>
    </div>
  );
};
