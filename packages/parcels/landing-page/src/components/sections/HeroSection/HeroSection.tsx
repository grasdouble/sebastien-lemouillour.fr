import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Box, Container, Stack, Text } from '@grasdouble/lufa_design-system';

import dioramaDesktop from '../../../assets/diorama-desktop.webp?inline';
import dioramaMobile from '../../../assets/diorama-mobile.webp?inline';
import sectionStyles from '../section.module.css';
import { HeroCanvas } from './HeroCanvas';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const { t } = useTranslation('landing-page');
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setShowCanvas(true));
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setShowCanvas(true), 200);
    return () => clearTimeout(id);
  }, []);

  return (
    <Box id="hero" as="section" className={styles['section-hero']}>
      {showCanvas && <HeroCanvas />}
      <Stack direction="vertical" spacing="spacious" align="center">
        <Stack direction="vertical" spacing="default" align="center">
          <img
            src={dioramaDesktop}
            srcSet={`${dioramaMobile} 320w, ${dioramaDesktop} 512w`}
            sizes="(max-width: 639px) 160px, (max-width: 767px) 192px, 256px"
            alt="Diorama"
            className={styles['hero-logo']}
            fetchPriority="high"
            loading="eager"
          />
          <Stack direction="vertical" spacing="none" align="center">
            <Text as="h1" variant="h1" weight="bold" align="center" color="primary">
              Sébastien LE MOUILLOUR
            </Text>
            <Text as="p" variant="h4" weight="medium" align="center" color="secondary">
              {t('hero.subtitle')}
            </Text>
          </Stack>
        </Stack>
        <Container size="md">
          <Stack direction="vertical" spacing="default" align="center">
            <Box className={sectionStyles['section-title-accent']} />
            <Text as="p" variant="body-large" align="center" color="secondary">
              {t('about.p1')}
            </Text>
            <Text as="p" variant="body-large" align="center" color="secondary">
              {t('about.p2')}
            </Text>
            <Text as="p" variant="body-large" align="center" color="secondary">
              <Trans
                i18nKey="about.p3"
                t={t}
                components={{
                  github1: (
                    <strong>
                      <a
                        href="https://github.com/noofreuuuh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles['hero-link']}
                      />
                    </strong>
                  ),
                  github2: (
                    <strong>
                      <a
                        href="https://github.com/smouillour"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles['hero-link']}
                      />
                    </strong>
                  ),
                  strong: <strong />,
                }}
              />
            </Text>
          </Stack>
        </Container>
      </Stack>
    </Box>
  );
}
