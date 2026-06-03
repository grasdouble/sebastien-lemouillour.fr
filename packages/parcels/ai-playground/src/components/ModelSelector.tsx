import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelConfig } from '@grasdouble/slm_shared';
import { MODEL_REGISTRY } from '@grasdouble/slm_shared';

import styles from './ModelSelector.module.css';

type ModelSelectorProps = {
  onSelect: (model: ModelConfig) => void;
  selectedModel: ModelConfig | null;
  disabled?: boolean;
};

export const ModelSelector: FC<ModelSelectorProps> = ({ onSelect, selectedModel, disabled }) => {
  const { t } = useTranslation('ai-playground');

  const handleSelect = useCallback(
    (model: ModelConfig) => {
      if (disabled) return;
      onSelect(model);
    },
    [onSelect, disabled]
  );

  return (
    <div className={styles.container}>
      <h2>{t('playground.models.title')}</h2>
      <div className={styles.grid}>
        {MODEL_REGISTRY.map((model) => {
          const isSelected = selectedModel?.id === model.id;
          return (
            <button
              key={model.id}
              type="button"
              className={styles.card}
              onClick={() => handleSelect(model)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              <div className={styles.header}>
                <h3>{model.name}</h3>
                {isSelected && <span className={styles.badge}>{t('playground.models.selected')}</span>}
              </div>
              <div className={styles.specs}>
                <div>
                  <span className={styles.label}>{t('playground.models.specs.size')}:</span>
                  <span>{model.estimatedSizeGB}GB</span>
                </div>
                <div>
                  <span className={styles.label}>{t('playground.models.specs.memory')}:</span>
                  <span>{model.minMemoryGB}GB</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
