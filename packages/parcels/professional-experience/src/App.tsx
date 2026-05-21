import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Container, Stack, Text } from '@grasdouble/lufa_design-system';

import './i18n';

import styles from './App.module.css';
import { ExperienceCard } from './components';
import { EXPERIENCES } from './data/experiences';

function App() {
  const { t } = useTranslation();

  return (
    <Box id="lufa-professional-experience" className={styles['lufa-professional-experience']}>
      <Container as="main" size="lg" paddingBlock="spacious">
        <Stack direction="vertical" spacing="comfortable">
          <Stack direction="vertical" spacing="compact" align="center">
            <Text as="h1" variant="h1" weight="bold" align="center" color="primary">
              {t('page.title')}
            </Text>
          </Stack>
          <Stack direction="vertical" spacing="default">
            {EXPERIENCES.map((experience) => (
              <ExperienceCard key={`${experience.company}-${experience.startDate}`} experience={experience} />
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
