import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Cluster, Flex, Icon, Input, Stack, Text } from '@grasdouble/lufa_design-system';

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  allTags: readonly string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  const { t } = useTranslation('learn');

  return (
    <Box padding="comfortable">
      <Stack direction="vertical" spacing="default">
        <Flex align="center" gap="compact">
          <Icon name="search" size="sm" color="muted" />
          <Input
            id="tutorial-search"
            type="search"
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder={t('filter.searchPlaceholder')}
            aria-label={t('filter.searchLabel')}
            fullWidth
          />
          {searchValue && (
            <Button
              type="ghost"
              variant="neutral"
              size="sm"
              radius="full"
              iconLeft="x"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            />
          )}
        </Flex>

        <Stack direction="vertical" spacing="tight">
          <Flex justify="between" align="center" gap="compact">
            <Text as="span" variant="label" color="secondary">
              {t('filter.tagsLabel')}
            </Text>
            {hasActiveFilters && (
              <Button type="ghost" variant="neutral" size="sm" onClick={onClear}>
                {t('filter.clearFilters')}
              </Button>
            )}
          </Flex>
          <Cluster spacing="tight" role="group" aria-label={t('filter.tagsLabel')}>
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
        </Stack>
      </Stack>
    </Box>
  );
}
