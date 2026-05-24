import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Stack, Text } from '@grasdouble/lufa_design-system';

import styles from './FilterBar.module.css';

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  allTags: readonly string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles['search-icon']}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function FilterBar({
  searchValue,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  const { t } = useTranslation('tutorials');

  return (
    <div className={styles['filter-bar']}>
      <Stack direction="vertical" spacing="default">
        {/* Search */}
        <div className={styles['search-wrapper']}>
          <SearchIcon />
          <input
            id="tutorial-search"
            type="search"
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder={t('filter.searchPlaceholder')}
            className={styles['search-input']}
            aria-label={t('filter.searchLabel')}
          />
          {searchValue && (
            <button
              type="button"
              className={styles['search-clear']}
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tags */}
        <Stack direction="vertical" spacing="tight">
          <div className={styles['tags-header']}>
            <Text as="span" variant="label" color="secondary">
              {t('filter.tagsLabel')}
            </Text>
            {hasActiveFilters && (
              <Button type="ghost" variant="secondary" size="sm" onClick={onClear}>
                {t('filter.clearFilters')}
              </Button>
            )}
          </div>
          <div className={styles['tags-list']} role="group" aria-label={t('filter.tagsLabel')}>
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onTagToggle(tag)}
                  aria-pressed={isSelected}
                  className={`${styles['tag-chip']} ${isSelected ? styles['tag-chip--active'] : ''}`}
                >
                  {isSelected && <span className={styles['tag-chip-dot']} aria-hidden="true" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </Stack>
      </Stack>
    </div>
  );
}
