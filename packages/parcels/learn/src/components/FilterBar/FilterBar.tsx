import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Cluster, Flex, Icon, Input, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Difficulty } from '../../data/learn';
import { DIFFICULTY_I18N_KEY, DIFFICULTY_VARIANT } from '../../data/learn';
import styles from './FilterBar.module.css';

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  allTags: readonly string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allDifficulties: readonly Difficulty[];
  selectedDifficulties: Difficulty[];
  onDifficultyToggle: (difficulty: Difficulty) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  allDifficulties,
  selectedDifficulties,
  onDifficultyToggle,
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  const { t } = useTranslation('learn');

  return (
    <Box padding="comfortable">
      <Stack direction="vertical" spacing="default">
        <Flex align="center" gap="compact">
          <div className={styles['search-wrapper']}>
            <span className={styles['search-icon']} aria-hidden="true">
              <Icon name="search" size="sm" color="muted" />
            </span>
            <Input
              id="tutorial-search"
              type="search"
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              placeholder={t('filter.searchPlaceholder')}
              aria-label={t('filter.searchLabel')}
              className={styles['search-input']}
              fullWidth
            />
          </div>
          {searchValue && (
            <Button
              type="ghost"
              variant="neutral"
              size="sm"
              radius="full"
              iconLeft="x"
              onClick={() => onSearchChange('')}
              aria-label={t('filter.clearSearch')}
            />
          )}
        </Flex>

        <div className={styles['filters-row']}>
          <div className={styles['filter-group']}>
            <Text as="span" variant="label" color="secondary">
              {t('filter.difficultyLabel')}
            </Text>
            <Cluster spacing="compact" role="group" aria-label={t('filter.difficultyLabel')}>
              {allDifficulties.map((difficulty) => {
                const isSelected = selectedDifficulties.includes(difficulty);
                return (
                  <Button
                    key={difficulty}
                    type={isSelected ? 'solid' : 'outline'}
                    variant={isSelected ? DIFFICULTY_VARIANT[difficulty] : 'neutral'}
                    size="sm"
                    radius="full"
                    onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
                    onClick={() => onDifficultyToggle(difficulty)}
                    aria-pressed={isSelected}
                  >
                    {t(DIFFICULTY_I18N_KEY[difficulty])}
                  </Button>
                );
              })}
            </Cluster>
          </div>

          <div className={styles['filter-group']}>
            <Text as="span" variant="label" color="secondary">
              {t('filter.tagsLabel')}
            </Text>
            <Cluster spacing="compact" role="group" aria-label={t('filter.tagsLabel')}>
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Button
                    key={tag}
                    type={isSelected ? 'solid' : 'outline'}
                    variant={isSelected ? 'primary' : 'neutral'}
                    size="sm"
                    radius="full"
                    onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
                    onClick={() => onTagToggle(tag)}
                    aria-pressed={isSelected}
                  >
                    {tag}
                  </Button>
                );
              })}
            </Cluster>
          </div>

          <div className={styles['clear-btn']} aria-hidden={!hasActiveFilters}>
            <Button
              type="ghost"
              variant="danger"
              size="sm"
              onClick={onClear}
              tabIndex={hasActiveFilters ? 0 : -1}
              style={{ visibility: hasActiveFilters ? 'visible' : 'hidden' }}
            >
              {t('filter.clearFilters')}
            </Button>
          </div>
        </div>
      </Stack>
    </Box>
  );
}
