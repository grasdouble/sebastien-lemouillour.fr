import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Card, Flex, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Catalog } from '../../data/learn';
import styles from './CatalogCard.module.css';

type CatalogCardProps = {
  catalog: Catalog;
  onClick: (catalog: Catalog) => void;
};

export function CatalogCard({ catalog, onClick }: CatalogCardProps) {
  const { t } = useTranslation('learn');
  const { title, description, guideIds } = catalog;

  const handleClick = () => onClick(catalog);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(catalog);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={styles['catalog-card']}
      aria-label={t('aria.openCatalog', { title })}
    >
      <Card>
        <Stack direction="vertical" spacing="default" grow>
          <Flex justify="between" align="start" gap="compact">
            <Text as="h3" variant="h4" weight="semibold" color="primary">
              {title}
            </Text>
            <Badge variant="info" size="sm">
              {t('catalogs.guideCount', { count: guideIds.length })}
            </Badge>
          </Flex>
          <Text as="p" variant="body" color="secondary">
            {description}
          </Text>
        </Stack>
      </Card>
    </div>
  );
}
