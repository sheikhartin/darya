/**
 * Tests for the TimeFetcher utility (local-only implementation).
 *
 * Since the time-utils module uses only the local device clock and makes
 * no external API calls, the tests are simple: verify that getTime()
 * returns a valid Date, that the source is 'local', and that no
 * discrepancy or API fields are set.
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import { TimeFetcher } from './helpers.mjs';

// ============================================================================
// Basic local-time behavior
// ============================================================================

test('getTime returns local time with source=local', () => {
  const tf = new TimeFetcher();
  const result = tf.getTime();

  assert.ok(result.date instanceof Date, 'date should be a Date object');
  assert.equal(result.source, 'local', 'should use local time source');
  assert.equal(result.apiTime, null, 'apiTime should be null (no API)');
  assert.equal(
    result.localTime,
    null,
    'localTime should be null (no discrepancy)'
  );
  assert.equal(
    result.discrepancy,
    false,
    'no discrepancy when using local time'
  );
});

test('getTime date is close to Date.now()', () => {
  const tf = new TimeFetcher();
  const beforeMs = Date.now();
  const result = tf.getTime();
  const afterMs = Date.now();
  const resultMs = result.date.getTime();

  assert.ok(
    resultMs >= beforeMs && resultMs <= afterMs + 100,
    `returned time ${resultMs} should be between ${beforeMs} and ${afterMs}`
  );
});

// ============================================================================
// Prefetch is a no-op (local-only implementation)
// ============================================================================

test('prefetch is idempotent and does not throw', () => {
  const tf = new TimeFetcher();

  tf.prefetch();
  tf.prefetch();
  tf.prefetch();

  const result = tf.getTime();
  assert.ok(result.date instanceof Date, 'date should still be valid');
  assert.equal(result.source, 'local', 'should still use local time');
});

test('prefetch does not attempt any network request', () => {
  const tf = new TimeFetcher();

  // Install a fetch stub that would throw if called.
  const savedFetch = global.fetch;
  global.fetch = () => {
    throw new Error('fetch must not be called in local-only mode');
  };

  try {
    tf.prefetch();
  } finally {
    if (savedFetch === undefined) {
      delete global.fetch;
    } else {
      global.fetch = savedFetch;
    }
  }

  const result = tf.getTime();
  assert.ok(result.date instanceof Date, 'date should still be valid');
  assert.equal(result.source, 'local', 'should use local time');
});

// ============================================================================
// Constructor initializes cleanly (no internal API state)
// ============================================================================

test('TimeFetcher constructor initializes without internal state', () => {
  const tf = new TimeFetcher();
  // The local-only implementation has no _apiTimestamp, _apiReceivedAt,
  // _fetchCompleted, or _fetchInFlight fields. Verify they are undefined.
  assert.equal(tf._apiTimestamp, undefined, 'apiTimestamp should be undefined');
  assert.equal(
    tf._apiReceivedAt,
    undefined,
    'apiReceivedAt should be undefined'
  );
  assert.equal(
    tf._fetchCompleted,
    undefined,
    'fetchCompleted should be undefined'
  );
  assert.equal(
    tf._fetchInFlight,
    undefined,
    'fetchInFlight should be undefined'
  );
});
