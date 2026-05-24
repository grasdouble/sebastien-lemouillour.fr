import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Cluster, Portal, Stack, Text } from '@grasdouble/lufa_design-system';

import type { ContentBlock, Tutorial } from '../../data/tutorials';
import styles from './TutorialDetail.module.css';

type TutorialDetailProps = {
  tutorial: Tutorial;
  onClose: () => void;
};

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        <Text key={index} as={`h${block.level}`} variant={`h${block.level}`} weight="semibold" color="primary">
          {block.text}
        </Text>
      );
    case 'paragraph':
      return (
        <Text key={index} as="p" variant="body" color="secondary">
          {block.text}
        </Text>
      );
    case 'code':
      return (
        <div key={index} className={styles['code-block']} aria-label={`Code ${block.language}`}>
          <div className={styles['code-lang']}>{block.language}</div>
          <pre className={styles['code-pre']}>
            <code>{block.text}</code>
          </pre>
        </div>
      );
    case 'list':
      return (
        <ul key={index} className={styles['content-list']}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Text as="span" variant="body" color="secondary">
                {item}
              </Text>
            </li>
          ))}
        </ul>
      );
  }
}

export function TutorialDetail({ tutorial, onClose }: TutorialDetailProps) {
  const { t } = useTranslation('tutorials');
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
          aria-labelledby="tutorial-detail-title"
          className={styles.modal}
        >
          <div className={styles['modal-header']}>
            <Text as="h2" id="tutorial-detail-title" variant="h3" weight="bold" color="primary">
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
            <Stack direction="vertical" spacing="comfortable">
              {tutorial.content.map((block, i) => renderBlock(block, i))}
            </Stack>
          </div>
        </div>
      </div>
    </Portal>
  );
}
