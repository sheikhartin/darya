/**
 * Shared wait budgets and retry helpers for the headless-browser e2e
 * suites.
 *
 * The suites drive a real Chrome against the app served from a local
 * static server. Under heavy machine load (a full-suite run, or several
 * `npm test` invocations back-to-back), a single waitForFunction budget
 * can be missed by a wide margin: the greeting types with a delay, the
 * app moves focus on the next animation frame, and View Transitions
 * apply their DOM updates on later frames. Named budgets here keep the
 * numbers in one place, and the helpers retry once after a short settle
 * so a single slow frame never fails a healthy page.
 */

/**
 * Wait budgets in milliseconds, named by the kind of transition being
 * waited on. Generous on purpose: the tests assert behavior, not speed,
 * and a flaky timeout is a false failure.
 */
export const E2E_WAIT_MS = {
  /** Focus movement and popover visibility flips (next animation frame). */
  FOCUS: 8000,
  /** Greeting typing + composer enable after starting a chat. */
  GREETING: 20000,
  /** Theme flip through a View Transition (DOM updates a later frame). */
  THEME: 15000,
  /** Long-held waits such as the typing row disappearing. */
  LONG: 25000,
  /** Ambient-sound playback start under load (manifest + audio + fade). */
  PLAYBACK: 30000
};

/** Pause before a retry attempt, giving a busy main thread time to settle. */
const RETRY_SETTLE_MS = 250;

/** Bounded timeout for a single click action (default is 30s). */
const CLICK_TIMEOUT_MS = 10000;

/**
 * Waits for a page function, retrying once after a short settle if the
 * first attempt times out. The retry uses a HALF budget so the total
 * worst case is ~1.5x the named budget, never 2x: a few retried waits
 * must not consume the whole test-level timeout on a healthy but loaded
 * machine. The retry exists only to absorb load-induced stalls (a single
 * slow frame under a full-suite run); it never masks a genuinely broken
 * page, because the second attempt still throws on failure.
 * @param {import('@playwright/test').Page} page
 * @param {Function} fn - Function evaluated in the page context
 * @param {*} arg - Argument passed to fn (or null)
 * @param {number} timeoutMs - Budget from E2E_WAIT_MS
 * @returns {Promise<void>}
 */
export async function waitForPageFunction(page, fn, arg, timeoutMs) {
  const attempt = (budget) =>
    page.waitForFunction(fn, arg, { timeout: budget });
  try {
    await attempt(timeoutMs);
  } catch (err) {
    await page.waitForTimeout(RETRY_SETTLE_MS);
    await attempt(Math.ceil(timeoutMs / 2));
  }
}

/**
 * Clicks an element, retrying once if the first attempt fails. A failed
 * click is almost always an actionability timeout (the element was not
 * stable/visible under load), and Playwright dispatches nothing in that
 * case, so retrying cannot double-fire; the second click lands on the
 * now-stable element. The click carries a bounded timeout so a stuck
 * first attempt fails fast and the retry still fits in the test budget.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector - Playwright selector for the click target
 * @returns {Promise<void>}
 */
export async function clickWithRetry(page, selector) {
  try {
    await page.click(selector, { timeout: CLICK_TIMEOUT_MS });
  } catch (err) {
    await page.waitForTimeout(RETRY_SETTLE_MS);
    await page.click(selector, { timeout: CLICK_TIMEOUT_MS });
  }
}
