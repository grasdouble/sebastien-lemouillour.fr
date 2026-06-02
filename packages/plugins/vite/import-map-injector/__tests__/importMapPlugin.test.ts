/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import importMapPlugin from '../index.mjs';

const HTML = '<html><head></head><body></body></html>';
const cwd = process.cwd();

function setFiles(files: Record<string, unknown>) {
  vi.spyOn(fs, 'existsSync').mockImplementation((filePath) => Object.hasOwn(files, filePath as string));
  vi.spyOn(fs, 'readFileSync').mockImplementation((filePath) => JSON.stringify(files[filePath as string]));
}

describe('importMapPlugin', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('injects external and production import maps in production mode', () => {
    setFiles({
      [`${cwd}/importMapExternal.json`]: { imports: { react: 'https://cdn.example.com/react.js' } },
      [`${cwd}/importMap.json`]: { imports: { '@app/root': '/assets/root.js' } },
    });

    const plugin = importMapPlugin();
    plugin.configResolved!({ command: 'build', mode: 'production' } as never);

    const result = plugin.transformIndexHtml!(HTML);

    expect(result).toContain('<script type="importmap">');
    expect(result).toContain('https://cdn.example.com/react.js');
    expect(result).toContain('<script type="importmap" overridable="true">');
    expect(result).toContain('"@app/root": "/assets/root.js"');
  });

  it('injects external and development import maps in dev mode', () => {
    setFiles({
      [`${cwd}/importMapExternal.json`]: { imports: { react: 'https://cdn.example.com/react.js' } },
      [`${cwd}/importMap.dev.json`]: { imports: { '@app/root': 'http://localhost:4101/root.js' } },
    });

    const plugin = importMapPlugin();
    plugin.configResolved!({ command: 'serve', mode: 'development' } as never);

    const result = plugin.transformIndexHtml!(HTML);

    expect(result).toContain('https://cdn.example.com/react.js');
    expect(result).toContain('"@app/root": "http://localhost:4101/root.js"');
  });

  it('warns when expected import map files are missing', () => {
    setFiles({});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const plugin = importMapPlugin();
    plugin.configResolved!({ command: 'serve', mode: 'development' } as never);
    plugin.transformIndexHtml!(HTML);

    expect(warnSpy).toHaveBeenCalledWith(
      `[vite-plugin-importmap-injector] ⚠️ import-map for externals not found: ${cwd}/importMapExternal.json`
    );
    expect(warnSpy).toHaveBeenCalledWith(
      `[vite-plugin-importmap-injector] ⚠️ import-map for production not found: ${cwd}/importMap.json`
    );
    expect(warnSpy).toHaveBeenCalledWith(
      `[vite-plugin-importmap-injector] ⚠️ import-map for development not found: ${cwd}/importMap.dev.json`
    );
  });

  it('accepts extImportMap as an inline object in dev mode', () => {
    setFiles({
      [`${cwd}/importMap.dev.json`]: { imports: { '@app/root': 'http://localhost:4101/root.js' } },
    });

    const plugin = importMapPlugin({
      extImportMap: { imports: { react: '/vendor/react-bundle.mjs' } },
    });
    plugin.configResolved!({ command: 'serve', mode: 'development' } as never);

    const result = plugin.transformIndexHtml!(HTML);

    expect(result).toContain('"/vendor/react-bundle.mjs"');
    expect(result).not.toContain('esm.sh');
  });

  it('accepts extImportMap as an inline object in production mode', () => {
    setFiles({
      [`${cwd}/importMap.json`]: { imports: { '@app/root': '/assets/root.js' } },
    });

    const plugin = importMapPlugin({
      extImportMap: { imports: { react: '/vendor/react-bundle.mjs' } },
    });
    plugin.configResolved!({ command: 'build', mode: 'production' } as never);

    const result = plugin.transformIndexHtml!(HTML);

    expect(result).toContain('"/vendor/react-bundle.mjs"');
    expect(result).not.toContain('esm.sh');
  });

  it('merges preview import maps on top of production entries', () => {
    setFiles({
      [`${cwd}/importMapExternal.json`]: { imports: { react: 'https://cdn.example.com/react.js' } },
      [`${cwd}/importMap.json`]: { imports: { '@app/root': '/assets/root.js', shared: '/assets/shared.js' } },
      [`${cwd}/importMap.preview.json`]: { imports: { '@app/root': 'http://localhost:4101/root.js' } },
    });

    const plugin = importMapPlugin();
    plugin.configResolved!({ command: 'build', mode: 'preview' } as never);

    const result = plugin.transformIndexHtml!(HTML);

    expect(result).toContain('"shared": "/assets/shared.js"');
    expect(result).toContain('"@app/root": "http://localhost:4101/root.js"');
  });
});
