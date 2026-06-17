import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HeroSection } from '../HeroSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock('../../../getImageUrl', () => ({
  getImageUrl: (name: string) => `/mock/${name}.webp`,
}));

vi.mock('../HeroCanvas', () => ({
  HeroCanvas: () => <div data-testid="hero-canvas" />,
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({
    children,
    as: As = 'div',
    ...props
  }: React.PropsWithChildren<{ as?: React.ElementType } & React.HTMLAttributes<HTMLElement>>) => (
    <As {...props}>{children}</As>
  ),
  Container: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Stack: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: React.PropsWithChildren<{ as?: React.ElementType }>) => <As>{children}</As>,
}));

describe('HeroSection', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders hero title and translated content', () => {
    render(<HeroSection />);

    expect(screen.getByText('Sébastien LE MOUILLOUR')).toBeTruthy();
    expect(screen.getByText('hero.subtitle')).toBeTruthy();
    expect(screen.getByText('about.p1')).toBeTruthy();
    expect(screen.getByText('about.p2')).toBeTruthy();
    expect(screen.getByText('about.p3')).toBeTruthy();
  });

  it('renders the diorama image as decorative (aria-hidden)', () => {
    render(<HeroSection />);

    // Image is decorative — hidden from accessibility tree, no accessible name
    const img = document.querySelector<HTMLImageElement>('img[aria-hidden="true"]');
    expect(img).toBeTruthy();
  });

  it('uses requestIdleCallback when available and cancels on unmount', () => {
    let capturedCallback: (() => void) | null = null;
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((cb: () => void) => {
        capturedCallback = cb;
        return 42;
      })
    );
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback);

    const { unmount } = render(<HeroSection />);
    expect(window.requestIdleCallback as ReturnType<typeof vi.fn>).toHaveBeenCalled();

    // Invoke the idle callback — triggers setShowCanvas(true) and renders HeroCanvas
    act(() => {
      capturedCallback?.();
    });
    expect(screen.getByTestId('hero-canvas')).toBeTruthy();

    unmount();
    expect(cancelIdleCallback).toHaveBeenCalledWith(42);
  });
});
