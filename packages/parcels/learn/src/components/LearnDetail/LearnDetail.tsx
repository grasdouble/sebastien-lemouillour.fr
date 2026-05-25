import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Badge, Cluster, Portal, Text } from '@grasdouble/lufa_design-system';

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
          <div className={styles['modal-header']}>
            <Text as="h2" id="learn-detail-title" variant="h3" weight="bold" color="primary">
              {tutorial.title}
            </Text>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className={styles['close-btn']}
              aria-label={t('detail.close')}
            >
              ✕
            </button>
          </div>

          {tutorial.tags.length > 0 && (
            <Cluster spacing="compact" className={styles['modal-tags']}>
              {tutorial.tags.map((tag) => (
                <Badge key={tag} variant="info" size="sm">
                  {tag}
                </Badge>
              ))}
            </Cluster>
          )}

          <div className={styles['modal-content']}>
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
                    const isBlock = className?.startsWith('language-');
                    if (isBlock) {
                      const language = className?.replace('language-', '') ?? '';
                      return (
                        <div className={styles['code-block']} aria-label={`Code ${language}`}>
                          {language && <div className={styles['code-lang']}>{language}</div>}
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
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
