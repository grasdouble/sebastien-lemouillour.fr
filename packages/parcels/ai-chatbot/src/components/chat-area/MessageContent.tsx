import type { FC } from 'react';
import React from 'react';
import type { Components } from 'react-markdown';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import { useStylesheet } from '../../hooks/useStylesheet';
import styles from './MessageContent.module.css';

// Highlight.js CSS theme URL (served from slm-vendors)
// In dev: localhost:4099, in prod: CDN
const HIGHLIGHT_CSS_URL =
  import.meta.env.MODE === 'development' || import.meta.env.MODE === 'preview'
    ? 'http://localhost:4099/styles/atom-one-dark.css'
    : 'https://cdn.sebastien-lemouillour.fr/@grasdouble/slm-vendors@1.0.1/styles/atom-one-dark.css';

// Configure highlighting with only supported languages to prevent module resolution errors
const highlightLanguages = {
  bash,
  css,
  javascript,
  json,
  markdown,
  python,
  typescript,
  xml,
  html: xml, // alias
};

type MessageContentProps = {
  content: string;
  role: 'user' | 'assistant';
};

export const MessageContent: FC<MessageContentProps> = ({ content, role }) => {
  // Load highlight.js CSS theme dynamically
  useStylesheet(HIGHLIGHT_CSS_URL);

  // User messages are plain text, assistant messages support markdown
  if (role === 'user') {
    return <p className={styles.plainText}>{content}</p>;
  }

  const components: Components = {
    // Customize code blocks
    code: ({ className, children, ...props }) => {
      const isInline = !className;
      return isInline ? (
        <code className={styles.inlineCode} {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Customize paragraphs
    p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
    // Customize lists
    ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
    ol: ({ children }) => <ol className={styles.list}>{children}</ol>,
  };

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, [rehypeHighlight, { languages: highlightLanguages }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
