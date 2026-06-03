import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelConfig } from '@grasdouble/slm_shared';
import { MODEL_REGISTRY } from '@grasdouble/slm_shared';

import styles from './ModelSelector.module.css';

export type ModelSelectorProps = {
  onSelect: (model: ModelConfig) => void;
  selectedModel: ModelConfig | null;
  disabled?: boolean;
};

export function ModelSelector({ onSelect, selectedModel, disabled }: ModelSelectorProps) {
  const { t } = useTranslation('ai-chatbot');

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t('chatbot.model.title')}</h3>

      <div className={styles.modelGrid}>
        {MODEL_REGISTRY.map((model) => {
          const isSelected = selectedModel?.id === model.id;

          return (
            <button
              key={model.id}
              type="button"
              className={`${styles.modelCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelect(model)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              <div className={styles.modelHeader}>
                <span className={styles.modelName}>{model.name}</span>
                <span className={styles.modelSize}>{model.parameterCount}</span>
              </div>

              <div className={styles.modelInfo}>
                <span className={styles.infoItem}>
                  {t('chatbot.model.info.size')}: {model.estimatedSizeGB}GB
                </span>
                <span className={styles.infoItem}>
                  {t('chatbot.model.info.minMemory')}: {model.minMemoryGB}GB
                </span>
                {model.requiresWebGPU && (
                  <span className={styles.infoItem}>{t('chatbot.model.info.requiresWebGPU')}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!selectedModel && (
        <p className={styles.hint} aria-live="polite">
          {t('chatbot.model.select')}
        </p>
      )}
    </div>
  );
}
