import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoadingIndicator } from '../components/LoadingIndicator';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

describe('LoadingIndicator', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('does not render when progress is 0', () => {
    const { container } = render(<LoadingIndicator progress={0} status="idle" />);

    expect(container.firstChild).toBeNull();
  });

  it('displays progress bar when loading', () => {
    render(<LoadingIndicator progress={50} status="loading" modelName="Phi-3 Mini" />);

    expect(screen.getByRole('progressbar')).toBeDefined();
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('shows model name when provided', () => {
    render(<LoadingIndicator progress={75} status="loading" modelName="TinyLlama" />);

    const modelNameElement = screen.getByText(/TinyLlama/);
    expect(modelNameElement).toBeDefined();
  });

  it('displays correct status message', () => {
    render(<LoadingIndicator progress={30} status="downloading" />);

    expect(screen.getByText('chatbot.loading.downloading')).toBeDefined();
  });
});
