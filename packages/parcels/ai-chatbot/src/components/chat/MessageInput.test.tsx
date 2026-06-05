import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MessageInput } from './MessageInput';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

describe('MessageInput', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders textarea and send button', () => {
    const mockOnSend = vi.fn();
    render(<MessageInput onSend={mockOnSend} disabled={false} />);

    expect(screen.getByPlaceholderText('chatbot.chat.input.placeholder')).toBeDefined();
    expect(screen.getByLabelText('chatbot.chat.input.send')).toBeDefined();
  });

  it('calls onSend with message when button clicked', () => {
    const mockOnSend = vi.fn();
    render(<MessageInput onSend={mockOnSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText('chatbot.chat.input.placeholder');
    const sendButton = screen.getByLabelText('chatbot.chat.input.send');

    fireEvent.change(textarea, { target: { value: 'Hello AI!' } });
    fireEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Hello AI!');
  });

  it('disables input when disabled prop is true', () => {
    const mockOnSend = vi.fn();
    render(<MessageInput onSend={mockOnSend} disabled />);

    const textarea = screen.getByPlaceholderText('chatbot.chat.input.placeholder');
    const sendButton = screen.getByLabelText('chatbot.chat.input.send');

    expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
    expect((sendButton as HTMLButtonElement).disabled).toBe(true);
  });
});
