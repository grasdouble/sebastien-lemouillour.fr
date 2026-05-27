import { describe, expect, it } from 'vitest';

import { PARCELS } from '../parcels';

describe('PARCELS', () => {
  it('contains at least one always-active parcel', () => {
    expect(PARCELS.some((parcel) => 'alwaysActive' in parcel && parcel.alwaysActive)).toBe(true);
  });

  it('keeps the header-bar parcel always active', () => {
    expect(PARCELS).toContainEqual({ name: 'header-bar', alwaysActive: true });
  });

  it('ensures path-based parcels start with a slash', () => {
    const pathParcels = PARCELS.filter(
      (parcel): parcel is Extract<(typeof PARCELS)[number], { path: string }> => 'path' in parcel
    );

    for (const parcel of pathParcels) {
      expect(parcel.path.startsWith('/')).toBe(true);
    }
  });

  it('ensures parcel names are unique', () => {
    const names = PARCELS.map((parcel) => parcel.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('ensures alwaysActive and path are mutually exclusive', () => {
    for (const parcel of PARCELS) {
      expect('alwaysActive' in parcel && 'path' in parcel).toBe(false);
    }
  });
});
