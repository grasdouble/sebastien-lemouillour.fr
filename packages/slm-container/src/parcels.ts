/**
 * Shared parcel configuration used by both main.ts (single-spa registration)
 * and vite.config.js (sitemap index generation).
 *
 * Keep this file free of browser-only or build-tool-only imports so both
 * runtime and build-time code can import it safely.
 */

export type ParcelConfig = { name: string; alwaysActive: true } | { name: string; path: string; pathPrefix?: boolean };

export const PARCELS: ParcelConfig[] = [
  { name: 'header-bar', alwaysActive: true },
  { name: 'landing-page', path: '/' },
  { name: 'professional-experience', path: '/experience' },
  { name: 'learn', path: '/learn', pathPrefix: true },
];
