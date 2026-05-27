import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Experience } from '../data/experiences';
import { ExperienceCard } from '../components/ExperienceCard/ExperienceCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cluster: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: { children: React.ReactNode; as?: React.ElementType }) => <As>{children}</As>,
}));

const baseExperience: Experience = {
  company: 'Qlik',
  roleKey: 'experience.qlik-principal.role',
  startDate: '2023-09',
  endDate: null,
  location: 'Nantes, France',
  descriptionKey: 'experience.qlik-principal.description',
  skills: ['TypeScript', 'React'],
};

afterEach(() => {
  cleanup();
});

describe('ExperienceCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExperienceCard experience={baseExperience} />);

    expect(container.innerHTML).not.toBe('');
  });

  it('renders the company name', () => {
    render(<ExperienceCard experience={baseExperience} />);

    expect(screen.getByText('Qlik')).toBeTruthy();
  });

  it('renders the skills as badges', () => {
    render(<ExperienceCard experience={baseExperience} />);

    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('React')).toBeTruthy();
  });

  it('renders present when endDate is null', () => {
    render(<ExperienceCard experience={baseExperience} />);

    expect(screen.getByText(/present/)).toBeTruthy();
  });

  it('renders the formatted end date when endDate is provided', () => {
    render(<ExperienceCard experience={{ ...baseExperience, endDate: '2024-02' }} />);

    const expectedEndDate = new Date(2024, 1).toLocaleDateString('fr', {
      year: 'numeric',
      month: 'short',
    });

    expect(screen.getByText((content) => content.includes(expectedEndDate))).toBeTruthy();
  });
});
