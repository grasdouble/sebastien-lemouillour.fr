import fs from 'fs';
import path from 'path';

/**
 * Resolves an import map from either an inline object or a JSON file path.
 * Returns an empty object if the value is empty or the file is missing.
 */
function resolveImportMap(value, label) {
  if (value !== null && typeof value === 'object') {
    return value;
  }
  if (typeof value === 'string' && value !== '') {
    const filePath = path.resolve(process.cwd(), value);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    console.warn(`[vite-plugin-importmap-injector] ⚠️ import-map for ${label} not found: ${filePath}`);
  }
  return {};
}

export default function importMapPlugin({
  prodImportMap = 'importMap.json',
  devImportMap = 'importMap.dev.json',
  previewImportMap = 'importMap.preview.json',
} = {}) {
  let runtime = {
    command: 'build',
    mode: 'production',
    isPreview: false,
  };

  return {
    name: 'vite-plugin-importmap',
    configResolved(config) {
      runtime = {
        command: config.command,
        mode: config.mode,
        isPreview: config.mode === 'preview',
      };
    },
    transformIndexHtml(html) {
      const isDev = runtime.command === 'serve';
      const isPreviewBuild = runtime.command === 'build' && runtime.isPreview;
      const isProdBuild = runtime.command === 'build' && !runtime.isPreview;

      const prodImportMapContent = resolveImportMap(prodImportMap, 'production');
      const devImportMapContent = isDev ? resolveImportMap(devImportMap, 'development') : {};
      const previewImportMapContent = isPreviewBuild ? resolveImportMap(previewImportMap, 'preview') : {};

      const mergedImportMap = {
        imports: {
          ...(isProdBuild ? prodImportMapContent.imports || {} : {}),
          ...(isDev ? devImportMapContent.imports || {} : {}),
          // Preview = prod entries as a base, overridden by preview-specific entries
          // (e.g. point the home MFE to localhost while keeping CDN URLs for the DS)
          ...(isPreviewBuild ? prodImportMapContent.imports || {} : {}),
          ...(isPreviewBuild ? previewImportMapContent.imports || {} : {}),
        },
      };

      const importMapScripts = [];

      if (isDev || isPreviewBuild || isProdBuild) {
        importMapScripts.push(
          `<script type="importmap" overridable="true">${JSON.stringify(mergedImportMap, null, 2)}</script>`
        );
      }

      return html.replace('</head>', `${importMapScripts.join('\n')}\n</head>`);
    },
  };
}
