import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Card, Cluster, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Difficulty, Tutorial } from '../../data/tutorials';
import styles from './TutorialCard.module.css';

type TutorialCardProps = {
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

export function TutorialCard({ tutorial, onClick }: TutorialCardProps) {
  const { t } = useTranslation('tutorials');
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
      className={styles['tutorial-card']}
      aria-label={`Ouvrir le tutoriel : ${title}`}
    >
      <Card>
        <Stack direction="vertical" spacing="default">
          <Stack direction="vertical" spacing="tight">
            <div className={styles['tutorial-card-header']}>
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
          </Stack>

          {tags.length > 0 && (
            <Cluster spacing="compact">
              {tags.map((tag) => (
                <Badge key={tag} variant="info" size="sm">
                  {tag}
                </Badge>
              ))}
            </Cluster>
          )}
        </Stack>
      </Card>
    </div>
  );
}
