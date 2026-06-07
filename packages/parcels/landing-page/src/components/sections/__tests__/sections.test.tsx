import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PROJECTS } from '../../../data/projects';
import { SKILLS } from '../../../data/skills';
import { ContactSection } from '../ContactSection/ContactSection';
import { FooterSection } from '../FooterSection/FooterSection';
import { ProjectsSection } from '../ProjectsSection/ProjectsSection';
import { SkillsSection } from '../SkillsSection/SkillsSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Badge: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Box: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
  Button: ({
    children,
    href,
    'aria-label': ariaLabel,
  }: React.PropsWithChildren<{ href?: string; 'aria-label'?: string }>) => (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  ),
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Cluster: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Container: ({
    children,
    as: As = 'div',
    ...props
  }: React.PropsWithChildren<{ as?: React.ElementType } & React.HTMLAttributes<HTMLElement>>) => (
    <As {...props}>{children}</As>
  ),
  Stack: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: React.PropsWithChildren<{ as?: React.ElementType }>) => <As>{children}</As>,
}));

describe('FooterSection', () => {
  afterEach(cleanup);
  it('renders current year and i18n key', () => {
    render(<FooterSection />);

    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeTruthy();
    expect(screen.getByText('footer.built')).toBeTruthy();
  });
});

describe('SkillsSection', () => {
  afterEach(cleanup);
  it('renders all skill badges', () => {
    render(<SkillsSection />);

    expect(screen.getByText('skills.title')).toBeTruthy();
    for (const { label } of SKILLS) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});

describe('ContactSection', () => {
  afterEach(cleanup);
  it('renders contact links', () => {
    render(<ContactSection />);

    expect(screen.getByText('contact.title')).toBeTruthy();
    expect(screen.getByText('contact.linkedin')).toBeTruthy();
    expect(screen.getByText('contact.githubPersonal')).toBeTruthy();
    expect(screen.getByText('contact.githubPro')).toBeTruthy();
  });
});

describe('ProjectsSection', () => {
  afterEach(cleanup);
  it('renders all project titles and links', () => {
    render(<ProjectsSection />);

    expect(screen.getByText('projects.title')).toBeTruthy();
    for (const { title } of PROJECTS) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });
});
