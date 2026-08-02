/**
 * Time utility for Darya: provides current date/time using only the local
 * device clock. No external API calls are made, so the app works fully
 * offline and from file:// protocol without CORS issues.
 *
 * Design:
 *   - The engine creates one TimeFetcher and calls it when needed.
 *   - getTime() returns the current local device time.
 *   - No network requests are made (removed timeapi.io dependency to
 *     avoid CORS errors when running from file:// and to keep the app
 *     fully offline as designed).
 *
 * Privacy:
 *   No network request is made. The device clock is read locally. No
 *   user data is transmitted anywhere.
 */

(function (global) {
  'use strict';

  class TimeFetcher {
    constructor() {
      // No initialization needed; all local, no network calls.
    }

    /**
     * No-op: kept for API compatibility with callers that expect to call
     * prefetch() on startup. The local-only implementation needs no
     * prefetch.
     */
    prefetch() {
      // No network request needed. Everything is local.
    }

    /**
     * Returns the current local device time.
     *
     * @returns {{ date: Date, source: string, apiTime: null,
     *            localTime: null, discrepancy: boolean }}
     *   - date: the current local Date
     *   - source: always 'local'
     *   - apiTime: always null (no external API)
     *   - localTime: always null (only one time source)
     *   - discrepancy: always false
     */
    getTime() {
      return {
        date: new Date(),
        source: 'local',
        apiTime: null,
        localTime: null,
        discrepancy: false
      };
    }
  }

  global.DaryaTimeUtils = {
    TimeFetcher
  };
})(typeof window !== 'undefined' ? window : globalThis);
