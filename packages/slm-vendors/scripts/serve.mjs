/**
 * Minimal static file server for dist/ — used in dev and preview modes.
 * Serves vendor bundles at http://localhost:4099/<name>.mjs with proper
 * Content-Type and CORS headers so the browser import map can resolve them.
 */

import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

const PORT = 4099;
const distDir = resolve(import.meta.dirname, '..', 'dist');

const CONTENT_TYPES = {
  '.mjs': 'application/javascript; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

createServer((req, res) => {
  const filePath = join(distDir, req.url ?? '/');

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end(`Not found: ${req.url}`);
    return;
  }

  const contentType = CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`@grasdouble/slm_vendors serving dist/ at http://localhost:${PORT}`);
});
