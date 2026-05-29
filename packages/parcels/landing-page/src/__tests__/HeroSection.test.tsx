import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock('../getImageUrl', () => ({
  getImageUrl: (name: string) => `/mock/${name}.webp`,
}));

vi.mock('../components/sections/HeroSection/HeroCanvas', () => ({
  HeroCanvas: () => null,
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
  afterEach(cleanup);
  it('renders hero title and translated content', async () => {
    const { HeroSection } = await import('../components/sections/HeroSection/HeroSection');
    render(<HeroSection />);

    expect(screen.getByText('Sébastien LE MOUILLOUR')).toBeTruthy();
    expect(screen.getByText('hero.subtitle')).toBeTruthy();
    expect(screen.getByText('about.p1')).toBeTruthy();
    expect(screen.getByText('about.p2')).toBeTruthy();
    expect(screen.getByText('about.p3')).toBeTruthy();
  });

  it('renders the diorama image as decorative (aria-hidden)', async () => {
    const { HeroSection } = await import('../components/sections/HeroSection/HeroSection');
    render(<HeroSection />);

    // Image is decorative — hidden from accessibility tree, no accessible name
    const img = document.querySelector<HTMLImageElement>('img[aria-hidden="true"]');
    expect(img).toBeTruthy();
    expect(img!.alt).toBe('');
  });
});
