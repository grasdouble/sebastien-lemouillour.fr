import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { URL } from 'node:url';
import { expect, test } from '@playwright/test';

const root = resolve(import.meta.dirname, '../../..');
const cdn = 'https://cdn.sebastien-lemouillour.fr';

// Exercise production URLs and the real built modules without relying on a live CDN.
async function serveBuild(route) {
  const pathname = new URL(route.request().url()).pathname;
  if (pathname === '/importMap.json') {
    await route.fulfill({
      path: resolve(root, 'packages/slm-container/public/importMap.json'),
      contentType: 'application/json',
    });
    return;
  }
  const match = /^\/@grasdouble\/([^@/]+)@[^/]+(?:\/(.*))?$/.exec(pathname);
  if (!match) return route.abort();
  const [, name, asset] = match;
  const packages = {
    'slm-vendors': 'packages/slm-vendors',
    'lufa_design-system': 'packages/parcels/header-bar/node_modules/@grasdouble/lufa_design-system',
    ...Object.fromEntries(
      ['header-bar', 'landing-page', 'professional-experience'].map((name) => [
        `slm_parcel_${name}`,
        `packages/parcels/${name}`,
      ])
    ),
  };
  if (!packages[name]) return route.abort();
  const packageRoot = resolve(root, packages[name]);
  const pkg = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
  const file = asset ? `dist/${asset}` : pkg.exports['.'].import;
  const path = resolve(packageRoot, file);
  if (!path.startsWith(`${packageRoot}${sep}`)) return route.abort();
  await route.fulfill({ path, contentType: path.endsWith('.css') ? 'text/css' : 'application/javascript' });
}

test.beforeEach(async ({ page }) => {
  await page.route(`${cdn}/**`, serveBuild);
});

test('starts the production application without enabling devtools', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#lufa-container h1')).toBeVisible();
  expect(await page.evaluate(() => globalThis.localStorage.getItem('devtools'))).toBeNull();
  await expect(page.locator('#startup-error')).toBeHidden();
  expect(errors).toEqual([]);
});

test('still starts when localStorage is denied', async ({ page }) => {
  await page.addInitScript(() => {
    globalThis.Storage.prototype.setItem = () => {
      throw new globalThis.DOMException('Denied', 'SecurityError');
    };
  });
  await page.goto('/');
  await expect(page.locator('#lufa-container h1')).toBeVisible();
});

test('offers a working retry after a CDN outage', async ({ page }) => {
  let unavailable = true;
  await page.route(`${cdn}/importMap.json`, (route) =>
    unavailable ? route.fulfill({ status: 503, body: 'Unavailable' }) : serveBuild(route)
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('chargée');
  unavailable = false;
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(page.locator('#lufa-container h1')).toBeVisible();
});

test('shows the error fallback when a parcel cannot be downloaded', async ({ page }) => {
  await page.route(`${cdn}/@grasdouble/slm_parcel_landing-page@*`, (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('#startup-error')).toBeVisible();
});

test('does not expose retired sections in the portfolio menu or sitemap', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('#lufa-container h1')).toBeVisible();
  await expect(page.locator('a[href="/experience"]')).toBeVisible();
  await expect(page.locator('a[href^="/learn"], a[href*="handbook.grasdouble.fr"]')).toHaveCount(0);
  await expect(page.locator('a[href="/ai/chat"]')).toHaveCount(0);

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).not.toContain('/learn/sitemap.xml');
  expect(xml).not.toContain('/ai-chatbot/sitemap.xml');
});

test('mounts the experience parcel on direct navigation', async ({ page }) => {
  await page.goto('/experience');
  await expect(page.locator('#lufa-container h1')).toBeVisible();
  await expect(page.locator('#startup-error')).toBeHidden();
});
