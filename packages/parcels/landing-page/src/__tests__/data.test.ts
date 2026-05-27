import { describe, expect, it } from 'vitest';

import { SECTION_LABEL_KEY, SECTIONS } from '../constants';
import { PROJECTS } from '../data/projects';
import { SKILLS } from '../data/skills';

describe('landing page data', () => {
  it('keeps section ids and label keys in sync', () => {
    expect(SECTIONS.length).toBeGreaterThan(0);
    expect(Object.keys(SECTION_LABEL_KEY)).toEqual([...SECTIONS]);

    for (const section of SECTIONS) {
      expect(SECTION_LABEL_KEY[section]).toBeTruthy();
    }
  });

  it('defines projects with the required metadata', () => {
    expect(PROJECTS.length).toBeGreaterThan(0);

    for (const project of PROJECTS) {
      expect(project.title).toBeTruthy();
      expect(project.key).toBeTruthy();
      expect(project.links.length).toBeGreaterThan(0);

      for (const link of project.links) {
        expect(link.href).toMatch(/^https?:\/\//);
        expect(link.label).toBeTruthy();
        expect(link.type).toBeTruthy();
        expect(link.variant).toBeTruthy();
      }

      if (project.archived) {
        expect(project.archivedYear).toBeTypeOf('number');
      } else {
        expect(project.archivedYear).toBeUndefined();
      }
    }
  });

  it('defines skills with known variants', () => {
    expect(SKILLS.length).toBeGreaterThan(0);

    const allowedVariants = new Set(['info', 'danger', 'success', 'warning', 'default']);

    for (const skill of SKILLS) {
      expect(skill.label).toBeTruthy();
      expect(allowedVariants.has(skill.variant)).toBe(true);
    }
  });
});
