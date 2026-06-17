import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoadingIndicator } from '../LoadingIndicator';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
  Center: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Stack: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>) => (
    <span {...props}>{children}</span>
  ),
}));

describe('LoadingIndicator', () => {
  afterEach(cleanup);

  it('renders nothing when status is idle', () => {
    const { container } = render(<LoadingIndicator progress={0} status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when status is ready', () => {
    const { container } = render(<LoadingIndicator progress={0} status="ready" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows preparing message when status is downloading and progress is 0', () => {
    render(<LoadingIndicator progress={0} status="downloading" />);
    expect(screen.getByText('chatbot.model.preparing')).toBeTruthy();
  });

  it('shows loadingFromCache message when progress is 0 and loadingFromCache is true', () => {
    render(<LoadingIndicator progress={0} status="loading" loadingFromCache />);
    expect(screen.getByText('chatbot.model.loadingFromCache')).toBeTruthy();
  });

  it('shows model name when provided and progress is 0', () => {
    render(<LoadingIndicator progress={0} status="downloading" modelName="Llama 3.2" />);
    expect(screen.getByText('Llama 3.2')).toBeTruthy();
  });

  it('shows progress bar with correct value when progress > 0', () => {
    render(<LoadingIndicator progress={42} status="downloading" />);
    const bar = document.querySelector('[role="progressbar"]');
    expect(bar).toBeTruthy();
    expect(bar?.getAttribute('aria-valuenow')).toBe('42');
  });

  it('shows rounded percentage text when progress > 0', () => {
    render(<LoadingIndicator progress={66.7} status="loading" />);
    expect(screen.getByText('67%')).toBeTruthy();
  });

  it('shows model name and loading text when progress > 0', () => {
    render(<LoadingIndicator progress={50} status="loading" modelName="SmolLM2" />);
    expect(screen.getByText(/SmolLM2/)).toBeTruthy();
    expect(screen.getByText(/chatbot.model.loading/)).toBeTruthy();
  });

  it('shows loadingFromCache message when progress > 0 and loadingFromCache is true', () => {
    render(<LoadingIndicator progress={50} status="loading" loadingFromCache modelName="SmolLM2" />);
    expect(screen.getByText(/chatbot.model.loadingFromCache/)).toBeTruthy();
  });

  it('has aria-live polite for screen readers', () => {
    render(<LoadingIndicator progress={0} status="downloading" />);
    const region = document.querySelector('[aria-live="polite"]');
    expect(region).toBeTruthy();
  });
});
