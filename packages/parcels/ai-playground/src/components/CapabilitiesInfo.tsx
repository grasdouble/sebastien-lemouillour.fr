import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { BrowserCapabilities } from '@grasdouble/slm_shared';
import { Badge, Box, Flex, Text } from '@grasdouble/lufa_design-system';

import styles from './CapabilitiesInfo.module.css';

type CapabilitiesInfoProps = {
  capabilities: BrowserCapabilities;
};

export const CapabilitiesInfo: FC<CapabilitiesInfoProps> = ({ capabilities }) => {
  const { t } = useTranslation('ai-playground');

  return (
    <Box backgroundColor="muted" padding="default" className={styles.container}>
      <Text as="h2" weight="semibold" color="primary">
        {t('playground.capabilities.title')}
      </Text>
      <div className={styles.grid}>
        <Flex direction="row" justify="between" align="center">
          <Text weight="semibold">{t('playground.capabilities.webgpu')}:</Text>
          <Badge variant={capabilities.hasWebGPU ? 'success' : 'danger'}>
            {capabilities.hasWebGPU
              ? t('playground.capabilities.supported')
              : t('playground.capabilities.notSupported')}
          </Badge>
        </Flex>
        <Flex direction="row" justify="between" align="center">
          <Text weight="semibold">{t('playground.capabilities.memory')}:</Text>
          <Text>{capabilities.deviceMemoryGB}GB</Text>
        </Flex>
      </div>
    </Box>
  );
};
