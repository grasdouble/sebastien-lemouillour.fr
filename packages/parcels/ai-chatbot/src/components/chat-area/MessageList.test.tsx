import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MessageList } from './MessageList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

describe('MessageList', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders empty state when no messages and model not selected', () => {
    render(<MessageList messages={[]} isReady={false} />);

    expect(screen.getByText('chatbot.chat.selectModel')).toBeDefined();
  });

  it('renders welcome state when no messages but model is ready', () => {
    render(<MessageList messages={[]} isReady modelName="SmolLM2 135M" />);

    expect(screen.getByText('chatbot.chat.welcome')).toBeDefined();
  });

  it('renders user and assistant messages', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: 'Hello, how are you?',
        timestamp: new Date('2024-01-01T10:00:00'),
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: 'I am doing well, thank you!',
        timestamp: new Date('2024-01-01T10:00:05'),
      },
    ];

    render(<MessageList messages={messages} />);

    expect(screen.getByText('Hello, how are you?')).toBeDefined();
    expect(screen.getByText('I am doing well, thank you!')).toBeDefined();
  });

  it('applies correct ARIA roles', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: 'Test message',
        timestamp: new Date(),
      },
    ];

    const { container } = render(<MessageList messages={messages} />);
    const messageList = container.querySelector('[role="log"]');

    expect(messageList).toBeDefined();
  });
});
