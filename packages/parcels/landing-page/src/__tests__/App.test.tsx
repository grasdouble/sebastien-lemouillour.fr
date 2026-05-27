import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const usePageSeo = vi.fn();

vi.mock('./i18n', () => ({}));
vi.mock('../i18n', () => ({}));
vi.mock('@grasdouble/slm_shared', () => ({ usePageSeo }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@grasdouble/lufa_design-system', () => ({
  Box: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
  DotNav: () => <nav aria-label="dot-nav" />,
  useScrollSpy: () => ({ activeId: 'hero', scrollTo: vi.fn() }),
}));
vi.mock('../components/sections/HeroSection/HeroSection', () => ({
  HeroSection: () => <section data-testid="hero-section" />,
}));
vi.mock('../components/sections/SectionDivider/SectionDivider', () => ({
  SectionDivider: () => <hr />,
}));
vi.mock('../components/sections/SkillsSection/SkillsSection', () => ({
  SkillsSection: () => <section data-testid="skills-section" />,
}));
vi.mock('../components/sections/ProjectsSection/ProjectsSection', () => ({
  ProjectsSection: () => <section data-testid="projects-section" />,
}));
vi.mock('../components/sections/ContactSection/ContactSection', () => ({
  ContactSection: () => <section data-testid="contact-section" />,
}));
vi.mock('../components/sections/FooterSection/FooterSection', () => ({
  FooterSection: () => <footer data-testid="footer-section" />,
}));

describe('App', () => {
  afterEach(cleanup);
  beforeEach(() => {
    usePageSeo.mockReset();
  });

  it('renders all main sections', async () => {
    const { default: App } = await import('../App');
    render(<App />);

    expect(screen.getByTestId('hero-section')).toBeTruthy();
    expect(screen.getByTestId('skills-section')).toBeTruthy();
    expect(screen.getByTestId('projects-section')).toBeTruthy();
    expect(screen.getByTestId('contact-section')).toBeTruthy();
    expect(screen.getByTestId('footer-section')).toBeTruthy();
  });

  it('calls usePageSeo with the correct metadata', async () => {
    const { default: App } = await import('../App');
    render(<App />);

    expect(usePageSeo).toHaveBeenCalledWith({
      title: 'sebastien-lemouillour.fr',
      description: 'seo.description',
      url: 'https://sebastien-lemouillour.fr',
    });
  });

  it('renders the dot navigation', async () => {
    const { default: App } = await import('../App');
    render(<App />);

    expect(screen.getByRole('navigation', { name: 'dot-nav' })).toBeTruthy();
  });
});
