import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Card, Cluster, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Experience } from '../../data/experiences';
import styles from './ExperienceCard.module.css';

type ExperienceCardProps = {
  experience: Experience;
};

function formatDate(dateStr: string, lang: string): string {
  const [year, month] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString(lang, { year: 'numeric', month: 'short' });
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const { t, i18n } = useTranslation();
  const { company, roleKey, startDate, endDate, location, descriptionKey, skills } = experience;

  const start = formatDate(startDate, i18n.language);
  const end = endDate ? formatDate(endDate, i18n.language) : t('present');

  return (
    <Card>
      <Stack direction="vertical" spacing="default">
        <div className={styles['card-header']}>
          <Stack direction="vertical" spacing="tight">
            <Text as="h3" variant="h4" weight="semibold" color="primary">
              {t(roleKey)}
            </Text>
            <Text as="p" variant="body" weight="medium" color="secondary">
              {company}
            </Text>
          </Stack>
          <div className={styles['card-meta']}>
            <Text as="p" variant="caption" color="tertiary">
              {start} — {end}
            </Text>
            <Text as="p" variant="caption" color="tertiary">
              {location}
            </Text>
          </div>
        </div>

        <Text as="p" variant="body" color="secondary">
          {t(descriptionKey)}
        </Text>

        {skills.length > 0 && (
          <Cluster spacing="compact">
            {skills.map((skill) => (
              <Badge key={skill} variant="info" size="sm">
                {skill}
              </Badge>
            ))}
          </Cluster>
        )}
      </Stack>
    </Card>
  );
}
