import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Container, Divider, Stack, Text } from '@grasdouble/lufa_design-system';

import './i18n';

import { usePageSeo } from '@grasdouble/slm_shared';

import type { Difficulty, Tutorial } from './data/learn';
import styles from './App.module.css';
import { FilterBar, LearnCard, LearnDetail } from './components';
import { useLearn } from './hooks/useLearn';

const SITE_NAME = 'sebastien-lemouillour.fr';
const BASE_URL = 'https://sebastien-lemouillour.fr/learn';

const GUIDE_PARAM = 'guide';

function getGuideIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get(GUIDE_PARAM);
}

function App() {
  const { t } = useTranslation('learn');
  const { tutorials, allTags, allDifficulties, categoryOrder } = useLearn();

  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [activeGuideId, setActiveGuideId] = useState<string | null>(getGuideIdFromUrl);

  const activeGuide = useMemo(
    () => (activeGuideId ? (tutorials.find((t) => t.id === activeGuideId) ?? null) : null),
    [activeGuideId, tutorials]
  );

  const seoConfig = activeGuide
    ? {
        title: `${activeGuide.title} | ${SITE_NAME}`,
        description: activeGuide.description,
        url: `${BASE_URL}?guide=${activeGuide.id}`,
      }
    : {
        title: `${t('page.title')} | ${SITE_NAME}`,
        description: t('seo.description'),
        url: BASE_URL,
      };

  usePageSeo(seoConfig);

  const openGuide = useCallback((tutorial: Tutorial) => {
    const url = new URL(window.location.href);
    url.searchParams.set(GUIDE_PARAM, tutorial.id);
    history.pushState({ guideId: tutorial.id }, '', url.toString());
    setActiveGuideId(tutorial.id);
  }, []);

  const closeGuide = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(GUIDE_PARAM);
    history.pushState({}, '', url.toString());
    setActiveGuideId(null);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveGuideId(getGuideIdFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty]
    );
  };

  const handleClear = () => {
    setSearchValue('');
    setSelectedTags([]);
    setSelectedDifficulties([]);
  };

  const hasActiveFilters = searchValue.trim().length > 0 || selectedTags.length > 0 || selectedDifficulties.length > 0;

  const filteredGuides = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return tutorials.filter((tutorial) => {
      const matchesTitle = query === '' || tutorial.title.toLowerCase().includes(query);
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => tutorial.tags.includes(tag));
      const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(tutorial.difficulty);
      return matchesTitle && matchesTags && matchesDifficulty;
    });
  }, [tutorials, searchValue, selectedTags, selectedDifficulties]);

  const groupedGuides = useMemo(() => {
    const groups: Record<string, Tutorial[]> = {};
    for (const guide of filteredGuides) {
      if (!groups[guide.category]) groups[guide.category] = [];
      groups[guide.category].push(guide);
    }
    return groups;
  }, [filteredGuides]);

  return (
    <Box id="lufa-learn" className={styles['lufa-learn']}>
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
            allDifficulties={allDifficulties}
            selectedDifficulties={selectedDifficulties}
            onDifficultyToggle={handleDifficultyToggle}
            onClear={handleClear}
            hasActiveFilters={hasActiveFilters}
          />

          {filteredGuides.length === 0 ? (
            <Text as="p" variant="body" color="tertiary" align="center">
              {t('filter.noResults')}
            </Text>
          ) : (
            <Stack direction="vertical" spacing="comfortable">
              <Text as="p" variant="body-small" color="tertiary">
                {t('filter.results', { count: filteredGuides.length })}
              </Text>
              <Stack direction="vertical" spacing="spacious">
                {categoryOrder
                  .filter((cat) => groupedGuides[cat]?.length > 0)
                  .map((category) => (
                    <Stack key={category} direction="vertical" spacing="default">
                      <Stack direction="vertical" spacing="none">
                        <Box paddingBottom="compact">
                          <Text as="h2" variant="h3" weight="semibold" color="primary">
                            {category}
                          </Text>
                        </Box>
                        <Divider emphasis="subtle" spacing="compact" />
                      </Stack>
                      <div className={styles['learn-grid']}>
                        {groupedGuides[category].map((guide) => (
                          <LearnCard key={guide.id} tutorial={guide} onClick={openGuide} />
                        ))}
                      </div>
                    </Stack>
                  ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Container>

      {activeGuide && <LearnDetail tutorial={activeGuide} onClose={closeGuide} />}
    </Box>
  );
}

export default App;
