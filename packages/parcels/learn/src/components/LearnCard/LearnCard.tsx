import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Card, Cluster, Flex, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Tutorial } from '../../data/learn';
import { DIFFICULTY_I18N_KEY, DIFFICULTY_VARIANT, isPublished } from '../../data/learn';
import styles from './LearnCard.module.css';

type LearnCardProps = {
  tutorial: Tutorial;
  onClick: (tutorial: Tutorial) => void;
};

export function LearnCard({ tutorial, onClick }: LearnCardProps) {
  const { t } = useTranslation('learn');
  const { title, description, tags, difficulty, publishedAt } = tutorial;
  const published = isPublished(publishedAt);

  const handleClick = () => onClick(tutorial);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(tutorial);
    }
  };

  const cardClass = [styles['learn-card'], !published ? styles['learn-card-unpublished'] : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cardClass}
      aria-label={t('aria.openItem', { title })}
    >
      <Card>
        <Stack direction="vertical" spacing="default" grow>
          <Stack direction="vertical" spacing="tight">
            <Flex justify="between" align="start" gap="compact">
              <Stack grow>
                <Text as="h3" variant="h4" weight="semibold" color="primary">
                  {title}
                </Text>
              </Stack>
              <Cluster spacing="compact">
                {!published && (
                  <Badge variant="warning" size="sm">
                    {t('badge.draft')}
                  </Badge>
                )}
                <Badge variant={DIFFICULTY_VARIANT[difficulty]} size="sm">
                  {t(DIFFICULTY_I18N_KEY[difficulty])}
                </Badge>
              </Cluster>
            </Flex>
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
