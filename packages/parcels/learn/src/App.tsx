import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Box, Button, Container, Divider, Stack, Text } from '@grasdouble/lufa_design-system';

import './i18n';

import { usePageSeo } from '@grasdouble/slm_shared';

import type { Catalog, Difficulty, Tutorial } from './data/learn';
import styles from './App.module.css';
import { CatalogCard, CatalogDetail, FilterBar, LearnCard, LearnDetail } from './components';
import sharedStyles from './components/shared.module.css';
import { RAW_CATALOGS } from './data/learn';
import { useCatalogs } from './hooks/useCatalogs';
import { useLearn } from './hooks/useLearn';

const SITE_NAME = 'sebastien-lemouillour.fr';
const BASE_URL = 'https://sebastien-lemouillour.fr/learn';

function AppContent() {
  const { t } = useTranslation('learn');
  const { tutorials, allTags, allDifficulties, categoryOrder } = useLearn();
  const { catalogs, groupedCatalogs } = useCatalogs();
  const navigate = useNavigate();

  // Read current route params from the matched routes (catalog and guide params may both be present)
  const routerState = useRouterState();
  const routeParams = routerState.matches.reduce<Record<string, string>>(
    (acc, m) => ({ ...acc, ...(m.params as Record<string, string>) }),
    {}
  );
  const activeCatalogId = routeParams.catalogId ?? null;
  const activeGuideId = routeParams.guideId ?? null;

  const [activeView, setActiveView] = useState<'catalogs' | 'guides'>(RAW_CATALOGS.length > 0 ? 'catalogs' : 'guides');
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const VIEWS = useMemo<('catalogs' | 'guides')[]>(
    () => (catalogs.length > 0 ? ['catalogs', 'guides'] : ['guides']),
    [catalogs.length]
  );

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = VIEWS.indexOf(activeView);
      if (e.key === 'ArrowRight') {
        const next = VIEWS[(currentIndex + 1) % VIEWS.length];
        setActiveView(next);
        tabRefs.current[next]?.focus();
      } else if (e.key === 'ArrowLeft') {
        const prev = VIEWS[(currentIndex - 1 + VIEWS.length) % VIEWS.length];
        setActiveView(prev);
        tabRefs.current[prev]?.focus();
      }
    },
    [activeView, VIEWS]
  );
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);

  const activeGuide = useMemo(
    () => (activeGuideId ? (tutorials.find((t) => t.id === activeGuideId) ?? null) : null),
    [activeGuideId, tutorials]
  );

  const activeCatalog = useMemo(
    () => (activeCatalogId ? (catalogs.find((c) => c.id === activeCatalogId) ?? null) : null),
    [activeCatalogId, catalogs]
  );

  const catalogGuides = useMemo<Tutorial[]>(() => {
    if (!activeCatalog) return [];
    return activeCatalog.guideIds
      .map((id) => tutorials.find((t) => t.id === id))
      .filter((t): t is Tutorial => t !== undefined);
  }, [activeCatalog, tutorials]);

  const seoConfig =
    activeCatalog && activeGuide
      ? {
          title: `${activeGuide.title} | ${SITE_NAME}`,
          description: activeGuide.description,
          url: `${BASE_URL}/${activeCatalog.id}/${activeGuide.id}`,
        }
      : activeCatalog
        ? {
            title: `${activeCatalog.title} | ${SITE_NAME}`,
            description: activeCatalog.description,
            url: `${BASE_URL}/${activeCatalog.id}`,
          }
        : {
            title: `${t('page.title')} | ${SITE_NAME}`,
            description: t('seo.description'),
            url: BASE_URL,
          };

  usePageSeo(seoConfig);

  // Always navigate to /$catalogId/$guideId so the URL includes full catalog context.
  const openGuide = (tutorial: Tutorial) => {
    void navigate({ to: guideRoute.to, params: { catalogId: tutorial.catalogId, guideId: tutorial.id } });
  };

  const closeGuide = () => {
    void navigate(activeCatalog ? { to: catalogRoute.to, params: { catalogId: activeCatalog.id } } : { to: '/' });
  };

  const openCatalog = (catalog: Catalog) => {
    void navigate({ to: catalogRoute.to, params: { catalogId: catalog.id } });
  };

  const closeCatalog = () => {
    void navigate({ to: '/' });
  };

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

  const catalogOrderMap = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>();
    catalogs.forEach((c) => map.set(c.id, c.order));
    return map;
  }, [catalogs]);

  const groupedGuides = useMemo(() => {
    const groups: Record<string, Tutorial[]> = {};
    for (const guide of filteredGuides) {
      if (!groups[guide.category]) groups[guide.category] = [];
      groups[guide.category].push(guide);
    }
    for (const guides of Object.values(groups)) {
      guides.sort((a, b) => {
        const catOrderA = catalogOrderMap.get(a.catalogId) ?? Infinity;
        const catOrderB = catalogOrderMap.get(b.catalogId) ?? Infinity;
        if (catOrderA !== catOrderB) return catOrderA - catOrderB;
        return (a.order ?? Infinity) - (b.order ?? Infinity);
      });
    }
    return groups;
  }, [filteredGuides, catalogOrderMap]);

  return (
    <Box id="lufa-learn" className={styles['lufa-learn']}>
      <Container as="main" size="lg" paddingBlock="spacious">
        {activeGuide ? (
          <LearnDetail tutorial={activeGuide} onBack={closeGuide} />
        ) : activeCatalog ? (
          <CatalogDetail catalog={activeCatalog} guides={catalogGuides} onBack={closeCatalog} onOpenGuide={openGuide} />
        ) : (
          <Stack direction="vertical" spacing="comfortable">
            <Stack direction="vertical" spacing="compact" align="center">
              <Text as="h1" variant="h1" weight="bold" align="center" color="primary">
                {t('page.title')}
              </Text>
              <Text as="p" variant="body-large" align="center" color="secondary">
                {t('page.subtitle')}
              </Text>
            </Stack>

            {catalogs.length > 0 && (
              <div
                role="tablist"
                aria-label={t('view.label')}
                className={styles['view-tabs']}
                onKeyDown={handleTabKeyDown}
              >
                <Button
                  id="tab-catalogs"
                  ref={(el) => {
                    tabRefs.current.catalogs = el;
                  }}
                  type={activeView === 'catalogs' ? 'solid' : 'ghost'}
                  variant={activeView === 'catalogs' ? 'primary' : 'neutral'}
                  size="sm"
                  onClick={() => setActiveView('catalogs')}
                  role="tab"
                  aria-selected={activeView === 'catalogs'}
                  aria-controls="tabpanel-view"
                  tabIndex={activeView === 'catalogs' ? 0 : -1}
                >
                  {t('view.catalogs')}
                </Button>
                <Button
                  id="tab-guides"
                  ref={(el) => {
                    tabRefs.current.guides = el;
                  }}
                  type={activeView === 'guides' ? 'solid' : 'ghost'}
                  variant={activeView === 'guides' ? 'primary' : 'neutral'}
                  size="sm"
                  onClick={() => setActiveView('guides')}
                  role="tab"
                  aria-selected={activeView === 'guides'}
                  aria-controls="tabpanel-view"
                  tabIndex={activeView === 'guides' ? 0 : -1}
                >
                  {t('view.guides')}
                </Button>
              </div>
            )}

            <div
              id="tabpanel-view"
              role="tabpanel"
              aria-labelledby={activeView === 'catalogs' ? 'tab-catalogs' : 'tab-guides'}
            >
              {activeView === 'catalogs' ? (
                <Stack direction="vertical" spacing="spacious">
                  {categoryOrder
                    .filter((cat) => groupedCatalogs[cat]?.length > 0)
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
                        <div className={sharedStyles['learn-grid']}>
                          {groupedCatalogs[category].map((catalog) => (
                            <CatalogCard key={catalog.id} catalog={catalog} onClick={openCatalog} />
                          ))}
                        </div>
                      </Stack>
                    ))}
                </Stack>
              ) : (
                <Stack direction="vertical" spacing="comfortable">
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
                              <div className={sharedStyles['learn-grid']}>
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
              )}
            </div>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

// Router definition — AppContent is a function declaration so it's hoisted and available here.
const rootRoute = createRootRoute({ component: AppContent });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' });
const catalogRoute = createRoute({ getParentRoute: () => rootRoute, path: '$catalogId' });
const guideRoute = createRoute({ getParentRoute: () => catalogRoute, path: '$guideId' });

const routeTree = rootRoute.addChildren([indexRoute, catalogRoute.addChildren([guideRoute])]);
const router = createRouter({ routeTree, basepath: '/learn' });

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- required by TanStack Router's module augmentation API
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
