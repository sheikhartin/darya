/**
 * Tests for the dependency-free dev server (scripts/serve.mjs).
 *
 * The server exists to send the cache headers an offline-first PWA
 * needs during development: no-store for sw.js (so worker updates are
 * always noticed) and no-cache everywhere else (cheap revalidation
 * via Last-Modified). These tests pin that contract and the basics
 * every static server owes its users: directory index, content
 * types, 404s, traversal protection, and 304 revalidation.
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRequestHandler } from '../scripts/serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Starts the handler on an ephemeral port and returns its base URL.
 * @returns {Promise<{server: http.Server, baseUrl: string}>}
 */
async function startServer() {
  const server = http.createServer(createRequestHandler(ROOT));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

test('dev server serves the worker with no-store so updates are noticed', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const response = await fetch(`${baseUrl}/sw.js`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(
      response.headers.get('content-type') || '',
      /text\/javascript/
    );
    const body = await response.text();
    assert.ok(body.startsWith('/**'), 'sw.js body starts with its docblock');
  } finally {
    server.close();
  }
});

test('dev server serves shell files with no-cache and correct types', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const page = await fetch(`${baseUrl}/`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('cache-control'), 'no-cache');
    assert.match(page.headers.get('content-type') || '', /text\/html/);
    assert.ok(page.headers.has('last-modified'));
    assert.match(await page.text(), /<!doctype html>/u);

    const styles = await fetch(`${baseUrl}/css/style.css`);
    assert.equal(styles.status, 200);
    assert.match(styles.headers.get('content-type') || '', /text\/css/);

    const icon = await fetch(`${baseUrl}/assets/icons/favicon-32x32.png`);
    assert.equal(icon.status, 200);
    assert.equal(icon.headers.get('content-type'), 'image/png');
  } finally {
    server.close();
  }
});

test('dev server answers not-modified for revalidation requests', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const first = await fetch(`${baseUrl}/index.html`);
    const lastModified = first.headers.get('last-modified');
    assert.ok(lastModified, 'first response carries Last-Modified');

    const revalidated = await fetch(`${baseUrl}/index.html`, {
      headers: { 'If-Modified-Since': lastModified }
    });
    assert.equal(revalidated.status, 304);
    assert.equal(await revalidated.text(), '');
  } finally {
    server.close();
  }
});

test('dev server rejects unknown paths and traversal attempts', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const missing = await fetch(`${baseUrl}/no-such-file.txt`);
    assert.equal(missing.status, 404);

    // Encoded ../ segments must never escape the served root. fetch
    // normalizes dot segments client-side, so this needs a raw HTTP
    // request that leaves the encoded path untouched.
    const traversalStatus = await new Promise((resolve, reject) => {
      const request = http.request(
        {
          host: '127.0.0.1',
          port: new URL(baseUrl).port,
          path: '/%2e%2e/%2e%2e/etc/passwd',
          method: 'GET'
        },
        (response) => {
          response.resume();
          resolve(response.statusCode);
        }
      );
      request.on('error', reject);
      request.end();
    });
    // Encoded ../ segments must never escape the served root: the
    // URL parser collapses them, and the path guard is the second
    // line of defense. Either rejection status is correct; what must
    // never happen is a 200 carrying outside content.
    assert.ok(
      traversalStatus === 403 || traversalStatus === 404,
      `traversal attempt answered ${traversalStatus}, expected a rejection`
    );
  } finally {
    server.close();
  }
});
