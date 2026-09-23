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
    'lufa_design-system': 'packages/parcels/learn/node_modules/@grasdouble/lufa_design-system',
    ...Object.fromEntries(
      ['header-bar', 'landing-page', 'professional-experience', 'learn', 'ai-chatbot'].map((name) => [
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

test('renders unknown Learn routes and can return to the catalog list', async ({ page }) => {
  await page.goto('/learn/missing-catalog');
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour à la liste' }).click();
  await expect(page.getByRole('heading', { name: 'Guides', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/learn\/?$/);
});

test('mounts the experience parcel on direct navigation', async ({ page }) => {
  await page.goto('/experience');
  await expect(page.locator('#lufa-container h1')).toBeVisible();
  await expect(page.locator('#startup-error')).toBeHidden();
});

test('loads a real guide and rejects an unrelated catalog', async ({ page }) => {
  const manifest = JSON.parse(
    await readFile(resolve(root, 'packages/parcels/learn/dist/sitemap-publishedAt-filter.json'), 'utf8')
  );
  const guide = manifest.urls.find(({ loc }) => loc.split('/').length === 4);
  await page.goto(`${guide.loc}?dev=true`);
  await expect(page.locator('#learn-detail-title')).toBeVisible();
  const guideId = guide.loc.split('/').at(-1);
  await page.goto(`/learn/missing-catalog/${guideId}?dev=true`);
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  await expect(page.locator('#learn-detail-title')).toHaveCount(0);
});

test('mounts the chatbot without downloading a model', async ({ page }) => {
  await page.goto('/ai/chat');
  await expect(page.getByTestId('chat-main-region')).toBeVisible();
  await expect(page.locator('textarea')).toBeDisabled();
  await expect(page.locator('#startup-error')).toBeHidden();
});
