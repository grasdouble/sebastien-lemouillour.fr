import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Badge, Box, Button, Cluster, Divider, Flex, Link, Stack, Text } from '@grasdouble/lufa_design-system';

import type { Tutorial } from '../../data/learn';
import { MermaidBlock } from '../MermaidBlock/MermaidBlock';
import styles from './LearnDetail.module.css';

type LearnDetailProps = {
  tutorial: Tutorial;
  onBack: () => void;
};

function formatDate(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(`${iso}T00:00:00`)
  );
}

export function LearnDetail({ tutorial, onBack }: LearnDetailProps) {
  const { t, i18n } = useTranslation('learn');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <Stack direction="vertical" spacing="comfortable">
      <Box>
        <Button type="ghost" variant="neutral" size="sm" onClick={onBack}>
          {t('detail.backToList')}
        </Button>
      </Box>

      <Stack direction="vertical" spacing="default">
        <Stack direction="vertical" spacing="tight">
          <Text as="h1" id="learn-detail-title" variant="h2" weight="bold" color="primary">
            {tutorial.title}
          </Text>

          {tutorial.tags.length > 0 && (
            <Cluster spacing="compact">
              {tutorial.tags.map((tag) => (
                <Badge key={tag} variant="info" size="sm">
                  {tag}
                </Badge>
              ))}
            </Cluster>
          )}
        </Stack>

        <Flex gap="compact" wrap="wrap" align="center">
          <Text as="span" variant="caption" color="secondary">
            {t('detail.publishedAt')}{' '}
            <time dateTime={tutorial.publishedAt}>
              {formatDate(tutorial.publishedAt, i18n.resolvedLanguage ?? i18n.language)}
            </time>
          </Text>
          {tutorial.publishedAt !== tutorial.updatedAt && (
            <>
              <Text as="span" variant="caption" color="secondary" aria-hidden="true">
                |
              </Text>
              <Text as="span" variant="caption" color="secondary">
                {t('detail.updatedAt')}{' '}
                <time dateTime={tutorial.updatedAt}>
                  {formatDate(tutorial.updatedAt, i18n.resolvedLanguage ?? i18n.language)}
                </time>
              </Text>
            </>
          )}
        </Flex>
      </Stack>

      <Divider emphasis="subtle" spacing="compact" />

      <div className={styles['markdown-body']}>
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
              const language = className?.replace('language-', '') ?? '';
              if (language === 'mermaid') {
                return (
                  <div data-testid="mermaid-wrapper" className={styles['mermaid-wrapper']}>
                    <MermaidBlock chart={typeof children === 'string' ? children : ''} />
                  </div>
                );
              }
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
            a: ({ children, href }) => {
              const isExternal = href != null && (href.startsWith('http://') || href.startsWith('https://'));
              return (
                <Link
                  href={href ?? '#'}
                  target={isExternal ? '_blank' : '_self'}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  variant="underline"
                  color="primary"
                >
                  {children}
                </Link>
              );
            },
          }}
        >
          {tutorial.content}
        </ReactMarkdown>
      </div>
    </Stack>
  );
}
