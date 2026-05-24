import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Container, Stack, Text } from '@grasdouble/lufa_design-system';

import './i18n';

import type { Tutorial } from './data/tutorials';
import styles from './App.module.css';
import { FilterBar, TutorialCard, TutorialDetail } from './components';
import { ALL_TAGS, CATEGORY_ORDER, TUTORIALS } from './data/tutorials';

function App() {
  const { t } = useTranslation('tutorials');

  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleClear = () => {
    setSearchValue('');
    setSelectedTags([]);
  };

  const hasActiveFilters = searchValue.trim().length > 0 || selectedTags.length > 0;

  const filteredTutorials = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return TUTORIALS.filter((tutorial) => {
      const matchesTitle = query === '' || tutorial.title.toLowerCase().includes(query);
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => tutorial.tags.includes(tag));
      return matchesTitle && matchesTags;
    });
  }, [searchValue, selectedTags]);

  const groupedTutorials = useMemo(() => {
    const groups: Record<string, Tutorial[]> = {};
    for (const tutorial of filteredTutorials) {
      if (!groups[tutorial.category]) groups[tutorial.category] = [];
      groups[tutorial.category].push(tutorial);
    }
    return groups;
  }, [filteredTutorials]);

  return (
    <Box id="lufa-tutorials" className={styles['lufa-tutorials']}>
      <Container as="main" size="lg" paddingBlock="spacious">
        <Stack direction="vertical" spacing="comfortable">
          <Stack direction="vertical" spacing="compact" align="center">
            <Text as="h1" variant="h1" weight="bold" align="center" color="primary">
              {t('page.title')}
            </Text>
            <Text as="p" variant="body-large" align="center" color="secondary">
              {t('page.subtitle')}
            </Text>
          </Stack>

          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            allTags={ALL_TAGS}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClear={handleClear}
            hasActiveFilters={hasActiveFilters}
          />

          {filteredTutorials.length === 0 ? (
            <Text as="p" variant="body" color="tertiary" align="center">
              {t('filter.noResults')}
            </Text>
          ) : (
            <Stack direction="vertical" spacing="comfortable">
              <Text as="p" variant="body-small" color="tertiary">
                {t('filter.results', { count: filteredTutorials.length })}
              </Text>
              <Stack direction="vertical" spacing="spacious">
                {CATEGORY_ORDER.filter((cat) => groupedTutorials[cat]?.length > 0).map((category) => (
                  <div key={category} className={styles['category-section']}>
                    <div className={styles['category-title']}>
                      <Text as="h2" variant="h3" weight="semibold" color="primary">
                        {category}
                      </Text>
                    </div>
                    <div className={styles['tutorials-grid']}>
                      {groupedTutorials[category].map((tutorial) => (
                        <TutorialCard key={tutorial.id} tutorial={tutorial} onClick={setActiveTutorial} />
                      ))}
                    </div>
                  </div>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Container>

      {activeTutorial && <TutorialDetail tutorial={activeTutorial} onClose={() => setActiveTutorial(null)} />}
    </Box>
  );
}

export default App;
