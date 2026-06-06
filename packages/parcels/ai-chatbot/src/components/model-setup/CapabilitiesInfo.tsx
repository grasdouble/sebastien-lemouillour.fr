import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Box, Flex, Text } from '@grasdouble/lufa_design-system';

import type { BrowserCapabilities } from '../../llm/types';
import styles from './CapabilitiesInfo.module.css';

export type CapabilitiesInfoProps = {
  capabilities: BrowserCapabilities;
};

export const CapabilitiesInfo: FC<CapabilitiesInfoProps> = ({ capabilities }) => {
  const { t } = useTranslation('ai-chatbot-llm');

  return (
    <Box backgroundColor="muted" padding="default" className={styles.container}>
      <Text as="h2" weight="semibold" color="primary">
        {t('capabilities.title')}
      </Text>
      <div className={styles.grid}>
        <Flex direction="row" justify="between" align="center">
          <Text weight="semibold">{t('capabilities.webgpu')}:</Text>
          <Badge variant={capabilities.hasWebGPU ? 'success' : 'danger'}>
            {capabilities.hasWebGPU ? t('capabilities.supported') : t('capabilities.notSupported')}
          </Badge>
        </Flex>
        <Flex direction="row" justify="between" align="center">
          <Text weight="semibold">{t('capabilities.memory')}:</Text>
          <Text>{capabilities.deviceMemoryGB}GB</Text>
        </Flex>
      </div>
    </Box>
  );
};
