import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Card, Cluster, Text } from '@grasdouble/lufa_design-system';

import type { Difficulty, Tutorial } from '../../data/learn';
import styles from './LearnCard.module.css';

type LearnCardProps = {
  tutorial: Tutorial;
  onClick: (tutorial: Tutorial) => void;
};

const DIFFICULTY_VARIANT: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

const DIFFICULTY_I18N_KEY: Record<Difficulty, string> = {
  beginner: 'difficulty.beginner',
  intermediate: 'difficulty.intermediate',
  advanced: 'difficulty.advanced',
};

export function LearnCard({ tutorial, onClick }: LearnCardProps) {
  const { t } = useTranslation('learn');
  const { title, description, tags, difficulty } = tutorial;

  const handleClick = () => onClick(tutorial);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(tutorial);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={styles['learn-card']}
      aria-label={t('aria.openItem', { title })}
    >
      <Card>
        <div className={styles['learn-card-body']}>
          <div className={styles['learn-card-main']}>
            <div className={styles['learn-card-header']}>
              <Text as="h3" variant="h4" weight="semibold" color="primary">
                {title}
              </Text>
              <Badge variant={DIFFICULTY_VARIANT[difficulty]} size="sm">
                {t(DIFFICULTY_I18N_KEY[difficulty])}
              </Badge>
            </div>
            <Text as="p" variant="body" color="secondary">
              {description}
            </Text>
          </div>

          {tags.length > 0 && (
            <Cluster spacing="compact">
              {tags.map((tag) => (
                <Badge key={tag} variant="info" size="sm">
                  {tag}
                </Badge>
              ))}
            </Cluster>
          )}
        </div>
      </Card>
    </div>
  );
}
