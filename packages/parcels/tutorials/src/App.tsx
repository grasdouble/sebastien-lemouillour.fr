import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Container, Stack, Text } from '@grasdouble/lufa_design-system';

import './i18n';

import { usePageSeo } from '@grasdouble/slm_shared';

import type { Tutorial } from './data/tutorials';
import styles from './App.module.css';
import { FilterBar, TutorialCard, TutorialDetail } from './components';
import { useTutorials } from './hooks/useTutorials';

const SITE_NAME = 'sebastien-lemouillour.fr';
const BASE_URL = 'https://sebastien-lemouillour.fr/tutorials';

const TUTORIAL_PARAM = 'tutorial';

function getTutorialIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get(TUTORIAL_PARAM);
}

function App() {
  const { t } = useTranslation('tutorials');
  const { tutorials, allTags, categoryOrder } = useTutorials();

  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(getTutorialIdFromUrl);

  const activeTutorial = useMemo(
    () => (activeTutorialId ? (tutorials.find((t) => t.id === activeTutorialId) ?? null) : null),
    [activeTutorialId, tutorials]
  );

  const seoConfig = activeTutorial
    ? {
        title: `${activeTutorial.title} | ${SITE_NAME}`,
        description: activeTutorial.description,
        url: `${BASE_URL}?tutorial=${activeTutorial.id}`,
      }
    : {
        title: `${t('page.title')} | ${SITE_NAME}`,
        description: t('seo.description'),
        url: BASE_URL,
      };

  usePageSeo(seoConfig);

  const openTutorial = useCallback((tutorial: Tutorial) => {
    const url = new URL(window.location.href);
    url.searchParams.set(TUTORIAL_PARAM, tutorial.id);
    history.pushState({ tutorialId: tutorial.id }, '', url.toString());
    setActiveTutorialId(tutorial.id);
  }, []);

  const closeTutorial = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(TUTORIAL_PARAM);
    history.pushState({}, '', url.toString());
    setActiveTutorialId(null);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTutorialId(getTutorialIdFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    return tutorials.filter((tutorial) => {
      const matchesTitle = query === '' || tutorial.title.toLowerCase().includes(query);
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => tutorial.tags.includes(tag));
      return matchesTitle && matchesTags;
    });
  }, [tutorials, searchValue, selectedTags]);

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
            allTags={allTags}
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
                {categoryOrder
                  .filter((cat) => groupedTutorials[cat]?.length > 0)
                  .map((category) => (
                    <div key={category} className={styles['category-section']}>
                      <div className={styles['category-title']}>
                        <Text as="h2" variant="h3" weight="semibold" color="primary">
                          {category}
                        </Text>
                      </div>
                      <div className={styles['tutorials-grid']}>
                        {groupedTutorials[category].map((tutorial) => (
                          <TutorialCard key={tutorial.id} tutorial={tutorial} onClick={openTutorial} />
                        ))}
                      </div>
                    </div>
                  ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Container>

      {activeTutorial && <TutorialDetail tutorial={activeTutorial} onClose={closeTutorial} />}
    </Box>
  );
}

export default App;
