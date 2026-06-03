import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenerationConfig, ModelConfig } from '@grasdouble/slm_shared';
import { useCapabilities, useModelLoader } from '@grasdouble/slm_shared';

import { CapabilitiesInfo } from './CapabilitiesInfo';
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

  const isReady = loadProgress.status === 'ready' && provider !== null;
  const isLoading = loadProgress.status === 'downloading' || loadProgress.status === 'loading';

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
    <div className={styles.container}>
      <CapabilitiesInfo capabilities={capabilities} />

      <ModelSelector onSelect={handleModelSelect} selectedModel={selectedModel} disabled={isLoading} />

      {isReady && (
        <>
          <div className={styles.mainPanel}>
            <div className={styles.inputSection}>
              <PromptEditor value={prompt} onChange={setPrompt} disabled={isGenerating} />

              <ParametersPanel config={config} onChange={setConfig} disabled={isGenerating} />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={styles.generateButton}
              >
                {isGenerating ? t('playground.output.streaming') : t('playground.prompt.generate')}
              </button>
            </div>

            <div className={styles.outputSection}>
              <OutputDisplay output={output} isStreaming={isGenerating} onClear={handleClear} />

              {output && <PerformanceMetrics {...metrics} />}
            </div>
          </div>
        </>
      )}

      {loadProgress.status === 'error' && <div className={styles.error}>{t('playground.loading.error')}</div>}
    </div>
  );
};
