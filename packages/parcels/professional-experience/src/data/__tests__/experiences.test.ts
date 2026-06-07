import { describe, expect, it } from 'vitest';

import { EXPERIENCES } from '../experiences';

const YEAR_MONTH = /^\d{4}-\d{2}$/;

describe('EXPERIENCES', () => {
  it('contains the expected number of entries', () => {
    expect(EXPERIENCES).toHaveLength(8);
  });

  it('ensures every entry has the required fields', () => {
    for (const experience of EXPERIENCES) {
      expect(experience.company).toBeTruthy();
      expect(experience.roleKey).toBeTruthy();
      expect(experience.startDate).toBeTruthy();
      expect('endDate' in experience).toBe(true);
      expect(experience.location).toBeTruthy();
      expect(experience.descriptionKey).toBeTruthy();
      expect(experience.skills).toBeDefined();
    }
  });

  it('uses the YYYY-MM format for start and end dates', () => {
    for (const experience of EXPERIENCES) {
      expect(experience.startDate).toMatch(YEAR_MONTH);
      if (experience.endDate !== null) {
        expect(experience.endDate).toMatch(YEAR_MONTH);
      }
    }
  });

  it('keeps Qlik as the current experience', () => {
    const qlikExperience = EXPERIENCES.find((experience) => experience.company === 'Qlik');

    expect(qlikExperience?.endDate).toBeNull();
  });

  it('ensures skills arrays are non-empty', () => {
    for (const experience of EXPERIENCES) {
      expect(experience.skills.length).toBeGreaterThan(0);
    }
  });

  it('uses the experience translation key prefix for all roles', () => {
    for (const experience of EXPERIENCES) {
      expect(experience.roleKey).toContain('experience.');
    }
  });
});
