import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Divider, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Catalog, Tutorial } from '../../data/learn';
import { LearnCard } from '../LearnCard';
import styles from './CatalogDetail.module.css';

type CatalogDetailProps = {
  catalog: Catalog;
  guides: Tutorial[];
  onBack: () => void;
  onOpenGuide: (tutorial: Tutorial) => void;
};

export function CatalogDetail({ catalog, guides, onBack, onOpenGuide }: CatalogDetailProps) {
  const { t } = useTranslation('learn');

  return (
    <Stack direction="vertical" spacing="comfortable">
      <Box>
        <Button type="ghost" variant="neutral" size="sm" onClick={onBack}>
          {t('catalogs.back')}
        </Button>
      </Box>

      <Stack direction="vertical" spacing="tight">
        <Text as="h1" variant="h2" weight="bold" color="primary">
          {catalog.title}
        </Text>
        <Text as="p" variant="body-large" color="secondary">
          {catalog.description}
        </Text>
        <Text as="p" variant="body-small" color="tertiary">
          {t('catalogs.guideCount', { count: guides.length })}
        </Text>
      </Stack>

      <Divider emphasis="subtle" spacing="compact" />

      <div className={styles['catalog-detail-grid']}>
        {guides.map((guide) => (
          <LearnCard key={guide.id} tutorial={guide} onClick={onOpenGuide} />
        ))}
      </div>
    </Stack>
  );
}
