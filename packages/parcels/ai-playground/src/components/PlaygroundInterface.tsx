import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenerationConfig, ModelConfig } from '@grasdouble/slm_shared';
import { Box, Button, Container, Divider, Stack } from '@grasdouble/lufa_design-system';
import { useCapabilities, useModelLoader } from '@grasdouble/slm_shared';

import { CapabilitiesInfo } from './CapabilitiesInfo';
import { LoadingIndicator } from './LoadingIndicator';
import { ModelSelector } from './ModelSelector';
import { OutputDisplay } from './OutputDisplay';
import { ParametersPanel } from './ParametersPanel';
import { PerformanceMetrics } from './PerformanceMetrics';
import styles from './PlaygroundInterface.module.css';
import { PromptEditor } from './PromptEditor';

export const PlaygroundInterface: FC = () => {
  const { t } = useTranslation('ai-playground');
  const capabilities = useCapabilities();
  const { progress: loadProgress, provider, loadModel } = useModelLoader();

  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<GenerationConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 256,
  });
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState<{
    tokensPerSecond?: number;
    latencyMs?: number;
    totalTokens?: number;
    timeElapsedMs?: number;
  }>({});

  const progressPercent = loadProgress.progress;
  const loadingStatus = loadProgress.status;
  const isReady = loadingStatus === 'ready' && provider !== null;
  const isLoading = loadingStatus === 'downloading' || loadingStatus === 'loading';

  const handleModelSelect = useCallback(
    (model: ModelConfig) => {
      setSelectedModel(model);

      loadModel(model).catch(() => {
        // Error is handled by loadProgress.status = 'error'
      });
    },
    [loadModel]
  );

  const handleGenerate = useCallback(() => {
    if (!provider || isGenerating || !prompt.trim()) return;

    setIsGenerating(true);
    setOutput('');
    setMetrics({});

    const startTime = Date.now();

    provider
      .generate(prompt, config)
      .then((result) => {
        setOutput(result.text);
        setMetrics({
          tokensPerSecond: result.tokensPerSecond,
          latencyMs: result.timeMs,
          totalTokens: result.tokensGenerated,
          timeElapsedMs: Date.now() - startTime,
        });
      })
      .catch(() => {
        setOutput(t('playground.errors.generationFailed'));
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [provider, isGenerating, prompt, config, t]);

  const handleClear = useCallback(() => {
    setOutput('');
    setMetrics({});
  }, []);

  return (
    <Container size="xl">
      <Stack direction="vertical" spacing="comfortable">
        <CapabilitiesInfo capabilities={capabilities} />

        <Divider spacing="comfortable" />

        <ModelSelector onSelect={handleModelSelect} selectedModel={selectedModel} disabled={isLoading} />

        {(loadingStatus === 'downloading' || loadingStatus === 'loading') && (
          <LoadingIndicator progress={progressPercent} status={loadingStatus} modelName={selectedModel?.name} />
        )}

        {isReady && (
          <>
            <Divider spacing="comfortable" />

            <div className={styles.mainPanel}>
              <Stack direction="vertical" spacing="comfortable" className={styles.inputSection}>
                <PromptEditor value={prompt} onChange={setPrompt} disabled={isGenerating} />

                <ParametersPanel config={config} onChange={setConfig} disabled={isGenerating} />

                <Button
                  type="solid"
                  variant="primary"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? t('playground.output.streaming') : t('playground.prompt.generate')}
                </Button>
              </Stack>

              <Stack direction="vertical" spacing="comfortable" className={styles.outputSection}>
                <OutputDisplay output={output} isStreaming={isGenerating} onClear={handleClear} />

                {output && <PerformanceMetrics {...metrics} />}
              </Stack>
            </div>
          </>
        )}

        {loadProgress.status === 'error' && (
          <Box backgroundColor="muted" padding="default" className={styles.error}>
            {t('playground.loading.error')}
          </Box>
        )}
      </Stack>
    </Container>
  );
};
