import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MessageContent } from '../MessageContent';

vi.mock('../../hooks/useStylesheet', () => ({
  useStylesheet: vi.fn(),
}));

describe('MessageContent', () => {
  afterEach(cleanup);

  it('renders user messages as plain text', () => {
    render(<MessageContent role="user" content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('renders assistant messages as markdown', () => {
    render(<MessageContent role="assistant" content="**Bold text**" />);
    // ReactMarkdown wraps bold in <strong>
    expect(document.querySelector('strong')).toBeTruthy();
  });

  it('renders inline code in assistant messages', () => {
    render(<MessageContent role="assistant" content="use `myFunc()` here" />);
    expect(document.querySelector('code')).toBeTruthy();
    expect(screen.getByText('myFunc()')).toBeTruthy();
  });

  it('renders fenced code blocks in assistant messages', () => {
    render(<MessageContent role="assistant" content={'```javascript\nconst x = 1;\n```'} />);
    // Block code renders inside a <pre><code> structure
    const preEl = document.querySelector('pre');
    expect(preEl).toBeTruthy();
  });

  it('renders markdown lists', () => {
    render(<MessageContent role="assistant" content={'- item one\n- item two'} />);
    const list = document.querySelector('ul');
    expect(list).toBeTruthy();
  });

  it('renders markdown paragraphs', () => {
    render(<MessageContent role="assistant" content={'Paragraph one\n\nParagraph two'} />);
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });
});
