#!/usr/bin/env node

/**
 * Dependency-free static file server for local development and hosted
 * previews.
 *
 * python3 -m http.server sends no cache directives at all, so browsers
 * applied heuristic freshness to sw.js and index.html and kept serving
 * stale shells during development, which made service-worker updates
 * arrive late or never. This server sends the headers an offline-first
 * PWA actually needs:
 *
 *   - /sw.js:          Cache-Control: no-store, so the worker script
 *                      is always re-fetched and updates are noticed.
 *   - everything else: Cache-Control: no-cache, so the browser always
 *                      revalidates with Last-Modified and gets free
 *                      304 responses for unchanged files.
 *
 * Usage: node scripts/serve.mjs [port]     (default: 8080)
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_PORT = 8080;
const SW_PATHNAME = '/sw.js';
const DIRECTORY_INDEX = 'index.html';

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2'
};

/**
 * Resolves a URL pathname to a file inside the root, appending the
 * directory index for trailing-slash requests. Returns null for any
 * path that escapes the root.
 * @param {string} root - absolute directory to serve from
 * @param {string} pathname - decoded URL pathname
 * @returns {string|null} absolute file path, or null when unsafe
 */
function resolveWithinRoot(root, pathname) {
  const withIndex = pathname.endsWith('/')
    ? pathname + DIRECTORY_INDEX
    : pathname;
  const target = path.resolve(root, `.${withIndex}`);
  if (target !== root && !target.startsWith(root + path.sep)) {
    return null;
  }
  return target;
}

/**
 * Builds the request handler. Exported for the test suite.
 * @param {string} root - absolute directory to serve from
 * @returns {(request: http.IncomingMessage,
 *            response: http.ServerResponse) => void}
 */
export function createRequestHandler(root) {
  return function handle(request, response) {
    let target;
    try {
      const { pathname } = new URL(request.url, 'http://localhost');
      target = resolveWithinRoot(root, decodeURIComponent(pathname));
    } catch (error) {
      response.statusCode = 400;
      response.end('Bad request');
      return;
    }
    if (target === null) {
      response.statusCode = 403;
      response.end('Forbidden');
      return;
    }
    if (!existsSync(target) || !statSync(target).isFile()) {
      response.statusCode = 404;
      response.end('Not found');
      return;
    }

    const stats = statSync(target);
    const extension = path.extname(target).toLowerCase();
    const isServiceWorker =
      new URL(request.url, 'http://localhost').pathname === SW_PATHNAME;

    response.setHeader(
      'Cache-Control',
      isServiceWorker ? 'no-store' : 'no-cache'
    );
    response.setHeader(
      'Content-Type',
      CONTENT_TYPES[extension] || 'application/octet-stream'
    );

    // HTTP dates have one-second resolution, so compare on the same
    // granularity: a not-modified answer requires the header to cover
    // the file's full (truncated) modification second.
    const modifiedMs = Math.floor(stats.mtimeMs / 1000) * 1000;
    const lastModified = new Date(modifiedMs).toUTCString();
    response.setHeader('Last-Modified', lastModified);

    const ifModifiedSince = request.headers['if-modified-since'];
    if (ifModifiedSince && Date.parse(ifModifiedSince) >= modifiedMs) {
      response.statusCode = 304;
      response.end();
      return;
    }

    response.statusCode = 200;
    createReadStream(target).pipe(response);
  };
}

/**
 * Starts the server on the port given as the first CLI argument.
 */
function main() {
  const port = Number(process.argv[2]) || DEFAULT_PORT;
  const server = http.createServer(createRequestHandler(ROOT));
  server.listen(port, '0.0.0.0', () => {
    console.log(`Darya dev server listening on http://0.0.0.0:${port}`);
    console.log(`Serving ${ROOT} (sw.js: no-store, rest: no-cache)`);
  });
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  main();
}
