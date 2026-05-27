/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion */
import { describe, expect, it } from 'vitest';

import reactPreamblePlugin from '../index.mjs';

function getTransformHandler(plugin: ReturnType<typeof reactPreamblePlugin>) {
  return plugin.transformIndexHtml as { handler: (html: string) => string | { html: string; tags: unknown[] } };
}

describe('reactPreamblePlugin', () => {
  it('returns the html unchanged in production mode', () => {
    const plugin = reactPreamblePlugin();
    plugin.configResolved!({ env: { MODE: 'production' } } as never);

    const html = '<html><head></head><body></body></html>';
    expect(getTransformHandler(plugin).handler(html)).toBe(html);
  });

  it('returns an object with html and tags in dev mode', () => {
    const plugin = reactPreamblePlugin();
    plugin.configResolved!({ env: { MODE: 'development' } } as never);

    const html = '<html><head></head><body></body></html>';
    const result = getTransformHandler(plugin).handler(html);

    expect(result).toEqual(
      expect.objectContaining({
        html,
        tags: expect.any(Array),
      })
    );
  });

  it('injects the react refresh preamble script in dev mode', () => {
    const plugin = reactPreamblePlugin();
    plugin.configResolved!({ env: { MODE: 'development' } } as never);

    const result = getTransformHandler(plugin).handler('<html><head></head><body></body></html>');

    expect(result).toEqual(
      expect.objectContaining({
        tags: expect.arrayContaining([
          expect.objectContaining({
            tag: 'script',
            children: expect.stringContaining("import RefreshRuntime from 'http://localhost:4101/@react-refresh'"),
          }),
        ]),
      })
    );
  });

  it('injects the vite client script in dev mode', () => {
    const plugin = reactPreamblePlugin();
    plugin.configResolved!({ env: { MODE: 'development' } } as never);

    const result = getTransformHandler(plugin).handler('<html><head></head><body></body></html>');

    expect(result).toEqual(
      expect.objectContaining({
        tags: expect.arrayContaining([
          expect.objectContaining({
            tag: 'script',
            attrs: expect.objectContaining({
              src: 'http://localhost:4101/@vite/client',
            }),
          }),
        ]),
      })
    );
  });
});
