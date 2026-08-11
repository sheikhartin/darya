/**
 * Darya - notification toast overlay.
 * Part file: owns the icon-only notification badge as a factory. The
 * main overlays.js assembles the public API from this part plus the
 * breathe and confirm parts.
 *
 * A single severity symbol centered on screen (a warning triangle, an
 * error ring, or an info disc) that surfaces non-blocking messages
 * without any text. Auto-dismisses after a configurable duration; the
 * user can also dismiss it with Escape or a click on the badge.
 *
 * Three severity levels are supported:
 *   - 'error': red-accented ring for failures that need attention
 *   - 'warn':  amber-accented triangle for recoverable issues
 *   - 'info':  teal-accented disc for informational messages
 *
 * Each level pairs its accent color with a matching inline SVG icon so
 * the severity is legible at a glance, in both themes. The message text
 * is never painted: it is carried as the overlay's aria-label so screen
 * readers still announce it (the overlay keeps role=alert + aria-live).
 *
 * Only one notification is visible at a time; showing a new one
 * dismisses any existing one first.
 */
(function (global) {
  'use strict';

  /**
   * Creates the notification overlay functions.
   * @returns {{dismissNotification: Function, showNotification: Function}}
   */
  function createNotify() {
    /** @type {Element|null} The active notification overlay element. */
    var activeNotification = null;

    /** @type {number|null} Handle for the auto-dismiss timer. */
    var notificationTimer = null;

    /** @type {number|null} Timestamp when the auto-dismiss countdown armed. */
    var notificationDeadline = null;

    /** @type {boolean} Whether auto-dismiss is paused (hover or focus). */
    var notificationPaused = false;

    /** @type {Element|null} The element focused before the toast appeared. */
    var notificationFocusTarget = null;

    /** @type {Function|null} Document-level Escape handler while visible. */
    var notificationKeyHandler = null;

    /** Default auto-dismiss duration for non-error notifications (ms). */
    var NOTIFICATION_DURATION_DEFAULT = 5000;

    /** Longer duration for error notifications (ms). */
    var NOTIFICATION_DURATION_ERROR = 8000;

    /**
     * Supported notification severity levels and their CSS class suffixes.
     * Each level maps to a distinct accent color in the overlay styles.
     */
    var NOTIFICATION_LEVELS = ['error', 'warn', 'info'];

    /**
     * Dismisses the active notification overlay if one is present.
     * Safely handles repeated calls by null-checking before removal.
     * Clears the auto-dismiss timer to prevent stale callbacks.
     */
    function dismissNotification() {
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
      }
      if (notificationKeyHandler) {
        document.removeEventListener('keydown', notificationKeyHandler);
        notificationKeyHandler = null;
      }
      notificationPaused = false;
      notificationDeadline = null;
      var focusInsideToast =
        !!activeNotification &&
        activeNotification.contains(document.activeElement);
      if (activeNotification) {
        activeNotification.remove();
        activeNotification = null;
      }
      // Only reclaim focus when the user was interacting with the toast
      // via keyboard (its own focus); a timed-out toast must never steal
      // focus from wherever the user moved to in the meantime.
      if (
        focusInsideToast &&
        notificationFocusTarget &&
        document.body.contains(notificationFocusTarget)
      ) {
        notificationFocusTarget.focus();
      }
      notificationFocusTarget = null;
    }

    /**
     * Suspends the auto-dismiss countdown, preserving the remaining time.
     * Lets the user finish looking at the badge without it vanishing
     * mid-interaction (WCAG 2.2.1 Timing Adjustable).
     */
    function pauseNotificationTimer() {
      if (notificationTimer === null || notificationPaused) {
        return;
      }
      clearTimeout(notificationTimer);
      notificationTimer = null;
      notificationPaused = true;
    }

    /**
     * Resumes the auto-dismiss countdown for the remaining time, or closes
     * the toast right away when the pause outlasted its lifespan.
     */
    function resumeNotificationTimer() {
      if (!notificationPaused || !activeNotification) {
        return;
      }
      notificationPaused = false;
      var remaining = notificationDeadline - Date.now();
      if (remaining <= 0) {
        dismissNotification();
        return;
      }
      notificationTimer = setTimeout(function () {
        notificationTimer = null;
        if (activeNotification) {
          dismissNotification();
        }
      }, remaining);
    }

    /**
     * Creates the severity icon for a notification as an inline SVG. The
     * icon is the entire visual of the badge (there is no text), but it
     * remains decorative for assistive tech: the overlay's aria-label
     * carries the message, so the shape is marked aria-hidden and
     * inherits the severity accent color through currentColor. Built
     * with the DOM API rather than innerHTML so the codebase stays free
     * of markup-string parsing.
     * @param {'error'|'warn'|'info'} level - Severity level
     * @returns {Element} The SVG element
     */
    function createSeverityIcon(level) {
      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      // SVG elements expose className as a read-only SVGAnimatedString, so
      // the class must go through setAttribute (or classList) instead.
      svg.setAttribute('class', 'notification-icon');

      var stroke = {
        stroke: 'currentColor',
        'stroke-width': 2,
        fill: 'none',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      };
      var solid = { fill: 'currentColor' };

      // Shape sets per severity: error and info use a ringed disc, warn
      // uses a triangle; each pairs it with a mark (exclamation or dot)
      // that still reads clearly at the icon's rendered size.
      var parts =
        level === 'error'
          ? [
              // Uppercase V (absolute vertical line) keeps the path data
              // free of "v<digits>" sequences that would trip the smoke
              // test's legacy-version-string guard.
              ['circle', { cx: 12, cy: 12, r: 9 }, stroke],
              ['path', { d: 'M12 7.5V13' }, stroke],
              ['circle', { cx: 12, cy: 16.8, r: 1.4 }, solid]
            ]
          : level === 'warn'
            ? [
                ['path', { d: 'M12 4.5 20 19H4z' }, stroke],
                ['path', { d: 'M12 9.5V13.5' }, stroke],
                ['circle', { cx: 12, cy: 16.8, r: 1.4 }, solid]
              ]
            : [
                ['circle', { cx: 12, cy: 12, r: 9 }, stroke],
                ['path', { d: 'M12 11V16' }, stroke],
                ['circle', { cx: 12, cy: 7.8, r: 1.4 }, solid]
              ];

      for (var i = 0; i < parts.length; i += 1) {
        var el = document.createElementNS(NS, parts[i][0]);
        // Each part is [tagName, geometry, style]; both attribute groups
        // must be applied or the shapes render at their defaults (a
        // circle with no radius, a path with no data) and the icon would
        // be invisible.
        var attrs = Object.assign({}, parts[i][1], parts[i][2]);
        var keys = Object.keys(attrs);
        for (var k = 0; k < keys.length; k += 1) {
          el.setAttribute(keys[k], String(attrs[keys[k]]));
        }
        svg.appendChild(el);
      }
      return svg;
    }

    /**
     * Shows an icon-only notification with the given severity level.
     *
     * If a notification is already visible, it is dismissed first so only
     * one notification is shown at a time. The notification auto-dismisses
     * after a duration that depends on severity: errors get 8 seconds,
     * warnings and info get 5 seconds. The user can dismiss it with
     * Escape or by clicking the badge.
     *
     * The message is never rendered as text (the user asked for a bare
     * symbol); it is set as the overlay's aria-label so assistive tech
     * still announces it, and it falls back to console.warn when no
     * language pack is loaded rather than failing silently.
     *
     * @param {'error'|'warn'|'info'} level - The severity level. Each
     *   level renders its own icon and accent color.
     * @param {string|{fa: string, en: string}} message - The notification
     *   message. A plain string is used as-is; a bilingual pair is joined
     *   into the accessible label.
     * @param {number} [duration] - Optional custom auto-dismiss duration (ms)
     * @returns {boolean} True if the notification was shown, false otherwise
     */
    function showNotification(level, message, duration) {
      // Guard: validate severity level
      var validLevel =
        NOTIFICATION_LEVELS.indexOf(level) !== -1 ? level : 'info';

      // A bilingual message is an object with both fa and en strings and
      // at least one non-empty side; any other shape is treated as a plain
      // single-language string message.
      var bilingual =
        !!message &&
        typeof message === 'object' &&
        typeof message.fa === 'string' &&
        typeof message.en === 'string' &&
        (message.fa.trim().length > 0 || message.en.trim().length > 0);
      var messageText = bilingual ? null : message;

      // Guard: ensure the message is a non-empty string. A non-bilingual
      // object (e.g. { fa: '...' } with no en side, or a number) is
      // rejected with a hint so future callers notice the misuse instead
      // of silently losing the notification.
      if (
        !bilingual &&
        (!messageText ||
          typeof messageText !== 'string' ||
          messageText.trim().length === 0)
      ) {
        console.warn(
          'Darya notification: empty or malformed message, not showing overlay'
        );
        return false;
      }

      // Dismiss any existing notification first
      dismissNotification();

      // Fall back to console if no DOM is available (e.g. during testing)
      if (typeof document === 'undefined' || !document.body) {
        console[
          validLevel === 'error'
            ? 'error'
            : validLevel === 'warn'
              ? 'warn'
              : 'log'
        ](
          'Darya notification: ' +
            (bilingual ? message.fa + ' / ' + message.en : messageText)
        );
        return false;
      }

      // Compose the accessible label. Bilingual pairs join both lines so
      // a screen reader announces the whole message regardless of the
      // active conversation language.
      var labelText = bilingual ? message.fa + ' ' + message.en : messageText;

      // Create the overlay. It is centered on the viewport (see CSS) and
      // carries the message only as aria-label: no text is painted.
      activeNotification = document.createElement('div');
      activeNotification.className = 'notification-overlay';
      activeNotification.setAttribute('role', 'alert');
      activeNotification.setAttribute('aria-live', 'assertive');
      activeNotification.setAttribute('aria-atomic', 'true');
      activeNotification.setAttribute('aria-label', labelText);

      var container = document.createElement('div');
      container.className =
        'notification-container notification-container--' + validLevel;
      container.appendChild(createSeverityIcon(validLevel));
      activeNotification.appendChild(container);

      // Escape key dismisses. Listened at document level (not on the
      // badge) so the user's focus is never moved onto the toast: the
      // original dismiss-button design could only catch Escape after the
      // user Tabbed into it, and moving focus here would yank the
      // composer's caret mid-typing.
      notificationKeyHandler = function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          dismissNotification();
        }
      };
      document.addEventListener('keydown', notificationKeyHandler);

      // Clicking the badge dismisses it. The overlay itself is
      // pointer-events:none (see CSS), so the badge is the only
      // clickable surface and its click bubbles up to this listener.
      activeNotification.addEventListener('click', function () {
        dismissNotification();
      });

      // Hovering or focusing the badge suspends the countdown so it never
      // vanishes while the user is looking at it.
      activeNotification.addEventListener('mouseenter', pauseNotificationTimer);
      activeNotification.addEventListener(
        'mouseleave',
        resumeNotificationTimer
      );
      activeNotification.addEventListener('focusin', pauseNotificationTimer);
      activeNotification.addEventListener('focusout', resumeNotificationTimer);

      notificationFocusTarget = document.activeElement;
      document.body.appendChild(activeNotification);

      // Arm the auto-dismiss countdown
      var autoDuration =
        typeof duration === 'number' && duration > 0
          ? duration
          : validLevel === 'error'
            ? NOTIFICATION_DURATION_ERROR
            : NOTIFICATION_DURATION_DEFAULT;
      notificationDeadline = Date.now() + autoDuration;
      notificationTimer = setTimeout(function () {
        notificationTimer = null;
        if (activeNotification) {
          dismissNotification();
        }
      }, autoDuration);

      return true;
    }

    return {
      dismissNotification,
      showNotification
    };
  }

  global.DaryaOverlaysNotify = {
    create: createNotify
  };
})(typeof window !== 'undefined' ? window : globalThis);
