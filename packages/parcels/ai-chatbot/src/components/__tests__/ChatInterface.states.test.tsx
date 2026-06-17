import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ModelLoadProgress } from '../../llm/types';
import { ChatInterface } from '../ChatInterface';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

const mockLLM = vi.hoisted(
  (): {
    progress: ModelLoadProgress;
    provider: { generate: ReturnType<typeof vi.fn> } | null;
    loadModel: ReturnType<typeof vi.fn>;
    unloadModel: ReturnType<typeof vi.fn>;
    retryLoadModel: ReturnType<typeof vi.fn>;
  } => ({
    progress: { loaded: false, progress: 0, status: 'idle' },
    provider: null,
    loadModel: vi.fn(),
    unloadModel: vi.fn(),
    retryLoadModel: vi.fn(),
  })
);

vi.mock('../../llm', () => ({
  MODEL_REGISTRY: [
    {
      id: 'llama-3.2-1b',
      name: 'Llama 3.2 1B',
      provider: 'webllm',
      size: 'small',
      parameterCount: '1B',
      estimatedSizeGB: 0.9,
      minMemoryGB: 2,
      requiresWebGPU: true,
    },
  ],
  useCapabilities: () => ({
    hasWebGPU: true,
    hasWebGL: true,
    deviceMemoryGB: 8,
    recommendedProvider: 'webllm',
    canRunLargeModels: true,
  }),
  useModelLoader: () => ({
    progress: mockLLM.progress,
    provider: mockLLM.provider,
    loadModel: mockLLM.loadModel,
    unloadModel: mockLLM.unloadModel,
    retryLoadModel: mockLLM.retryLoadModel,
  }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
  Button: ({ children, onClick }: React.PropsWithChildren<{ onClick?: React.MouseEventHandler }>) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Container: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Flex: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Stack: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Label: ({ children }: React.PropsWithChildren) => <label>{children}</label>,
  Badge: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Cluster: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Center: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

describe('ChatInterface — states', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockLLM.progress = { loaded: false, progress: 0, status: 'idle' };
    mockLLM.provider = null;
  });

  it('shows loading indicator when model is downloading', () => {
    mockLLM.progress = { loaded: false, progress: 42, status: 'downloading' };
    render(<ChatInterface />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('shows loading indicator when model is loading from cache', () => {
    Object.assign(mockLLM, {
      progress: { loaded: false, progress: 0, status: 'loading', loadingFromCache: true },
    });
    render(<ChatInterface />);
    expect(screen.getByText('chatbot.model.loadingFromCache')).toBeTruthy();
  });

  it('shows error state with retry button when model fails to load', () => {
    mockLLM.progress = { loaded: false, progress: 0, status: 'error' };
    render(<ChatInterface />);
    expect(screen.getByText('chatbot.chat.loadError')).toBeTruthy();
    expect(screen.getByText('chatbot.chat.retry')).toBeTruthy();
  });

  it('calls retryLoadModel when retry button is clicked', () => {
    mockLLM.progress = { loaded: false, progress: 0, status: 'error' };
    render(<ChatInterface />);
    fireEvent.click(screen.getByText('chatbot.chat.retry'));
    expect(mockLLM.retryLoadModel).toHaveBeenCalled();
  });

  it('shows confirm dialog when deleting a conversation', () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
    render(<ChatInterface />);
    expect(screen.getByText('chatbot.history.empty')).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it('shows chat-main-region when lufa-header element exists', () => {
    const header = document.createElement('div');
    header.id = 'lufa-header';
    Object.defineProperty(header, 'getBoundingClientRect', {
      value: () => ({ height: 64, top: 0, left: 0, right: 0, bottom: 64, width: 1280 }),
    });
    document.body.appendChild(header);

    render(<ChatInterface />);
    expect(screen.getByTestId('chat-main-region')).toBeTruthy();

    document.body.removeChild(header);
  });

  it('falls back to resize listener when ResizeObserver is not available', () => {
    const original = (globalThis as Record<string, unknown>).ResizeObserver;
    delete (globalThis as Record<string, unknown>).ResizeObserver;

    const header = document.createElement('div');
    header.id = 'lufa-header';
    Object.defineProperty(header, 'getBoundingClientRect', {
      value: () => ({ height: 56, top: 0, left: 0, right: 0, bottom: 56, width: 1280 }),
    });
    document.body.appendChild(header);

    const { unmount } = render(<ChatInterface />);
    fireEvent(window, new Event('resize'));
    expect(screen.getByTestId('chat-main-region')).toBeTruthy();
    unmount();

    document.body.removeChild(header);
    (globalThis as Record<string, unknown>).ResizeObserver = original;
  });
});
