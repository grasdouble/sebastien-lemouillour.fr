import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, DotNav, useScrollSpy } from '@grasdouble/lufa_design-system';

import './i18n';

import { usePageSeo } from '@grasdouble/slm_shared';

import styles from './App.module.css';
import {
  ContactSection,
  FooterSection,
  HeroSection,
  ProjectsSection,
  SectionDivider,
  SkillsSection,
} from './components';
import { SECTION_LABEL_KEY, SECTIONS } from './constants';

function App() {
  const { t } = useTranslation('landing-page');

  usePageSeo({
    title: 'sebastien-lemouillour.fr',
    description: t('seo.description'),
    url: 'https://sebastien-lemouillour.fr',
  });

  const sectionIds = [...SECTIONS];
  const navSections = SECTIONS.map((id) => ({ id, label: t(SECTION_LABEL_KEY[id]) }));

  const { activeId, scrollTo } = useScrollSpy({ ids: sectionIds });

  return (
    <Box id="lufa-home" className={styles['lufa-home']}>
      <DotNav sections={navSections} activeId={activeId} onSelect={scrollTo} position="right" />

      <main>
        <HeroSection />
        <SectionDivider />
        <SkillsSection />
        <SectionDivider />
        <ProjectsSection />
        <SectionDivider />
        <ContactSection />
      </main>
      <FooterSection />
    </Box>
  );
}

export default App;
