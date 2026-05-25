import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Badge, Box, Button, Card, Cluster, Divider, Flex, Portal, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Tutorial } from '../../data/learn';
import styles from './LearnDetail.module.css';

type LearnDetailProps = {
  tutorial: Tutorial;
  onClose: () => void;
};

export function LearnDetail({ tutorial, onClose }: LearnDetailProps) {
  const { t } = useTranslation('learn');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Portal>
      <div className={styles.overlay} onClick={handleOverlayClick} aria-hidden="false">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="learn-detail-title"
          className={styles.modal}
        >
          <Card>
            <Stack direction="vertical" spacing="none" className={styles['modal-stack']}>
              <Box padding="comfortable">
                <Flex justify="between" align="start" gap="compact">
                  <Text as="h2" id="learn-detail-title" variant="h3" weight="bold" color="primary">
                    {tutorial.title}
                  </Text>
                  <Button
                    ref={closeButtonRef}
                    type="ghost"
                    variant="neutral"
                    size="sm"
                    radius="full"
                    iconLeft="x"
                    onClick={onClose}
                    aria-label={t('detail.close')}
                  />
                </Flex>
              </Box>

              <Divider emphasis="subtle" spacing="compact" />

              {tutorial.tags.length > 0 && (
                <>
                  <Box padding="comfortable">
                    <Cluster spacing="compact">
                      {tutorial.tags.map((tag) => (
                        <Badge key={tag} variant="info" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </Cluster>
                  </Box>
                  <Divider emphasis="subtle" spacing="compact" />
                </>
              )}

              <Box className={styles['modal-content']} padding="comfortable">
                <Stack direction="vertical" spacing="default">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <Text as="h1" variant="h1" weight="semibold" color="primary">
                          {children}
                        </Text>
                      ),
                      h2: ({ children }) => (
                        <Text as="h2" variant="h2" weight="semibold" color="primary">
                          {children}
                        </Text>
                      ),
                      h3: ({ children }) => (
                        <Text as="h3" variant="h3" weight="semibold" color="primary">
                          {children}
                        </Text>
                      ),
                      p: ({ children }) => (
                        <Text as="p" variant="body" color="secondary">
                          {children}
                        </Text>
                      ),
                      ul: ({ children }) => <ul className={styles['content-list']}>{children}</ul>,
                      ol: ({ children }) => <ol className={styles['content-list-ordered']}>{children}</ol>,
                      li: ({ children }) => (
                        <li>
                          <Text as="span" variant="body" color="secondary">
                            {children}
                          </Text>
                        </li>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.startsWith('language-');
                        if (isBlock) {
                          const language = className?.replace('language-', '') ?? '';
                          return (
                            <div className={styles['code-block']} aria-label={`Code ${language}`}>
                              {language && (
                                <>
                                  <Box padding="tight">
                                    <Text as="span" variant="caption" transform="uppercase" color="secondary">
                                      {language}
                                    </Text>
                                  </Box>
                                  <Divider emphasis="subtle" spacing="compact" />
                                </>
                              )}
                              <pre className={styles['code-pre']}>
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        }
                        return <code className={styles['inline-code']}>{children}</code>;
                      },
                      pre: ({ children }) => <>{children}</>,
                    }}
                  >
                    {tutorial.content}
                  </ReactMarkdown>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </div>
      </div>
    </Portal>
  );
}
