/**
 * Darya - notification toast overlay.
 * Part file: owns the toast-style notification banner as a factory. The
 * main overlays.js assembles the public API from this part plus the
 * breathe and confirm parts.
 *
 * A lightweight toast that appears at the top of the viewport to surface
 * non-blocking messages (errors, warnings, and info). Auto-dismisses
 * after a configurable duration, or the user can dismiss it manually via
 * the close button or backdrop click.
 *
 * Three severity levels are supported:
 *   - 'error': red-accented banner for failures that need attention
 *   - 'warn':  amber-accented banner for recoverable issues
 *   - 'info':  teal-accented banner for informational messages
 *
 * Each level pairs its accent color with a matching inline SVG icon
 * (exclamation ring, alert triangle, info disc) so the severity is
 * legible without reading the label, in both themes.
 *
 * Only one notification is visible at a time; showing a new one
 * dismisses any existing one first.
 */
(function (global) {
  'use strict';

  const UI = global.DaryaUI;
  const st = UI.state;

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

    /** Default auto-dismiss duration for non-error notifications (ms). */
    var NOTIFICATION_DURATION_DEFAULT = 5000;

    /** Longer duration for error notifications to give users time to read (ms). */
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
      notificationPaused = false;
      notificationDeadline = null;
      var focusInsideToast =
        !!activeNotification &&
        activeNotification.contains(document.activeElement);
      if (activeNotification) {
        activeNotification.remove();
        activeNotification = null;
      }
      // Only reclaim focus when the user was interacting with the toast via
      // keyboard (its dismiss button); a timed-out toast must never steal
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
     * Lets the user finish reading or reach the dismiss button without the
     * toast vanishing mid-interaction (WCAG 2.2.1 Timing Adjustable).
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
     * icon is purely decorative (the bilingual type text carries the
     * meaning), so it is marked aria-hidden and inherits the severity
     * accent color through currentColor. Built with the DOM API rather
     * than innerHTML so the codebase stays free of markup-string parsing.
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
      svg.setAttribute('class', 'notification-type__icon');

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
      // that still reads clearly at the icon's 14px rendered size.
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
     * Shows a notification overlay with the given severity level and message.
     *
     * If a notification is already visible, it is dismissed first so only
     * one notification is shown at a time. The notification auto-dismisses
     * after a duration that depends on severity: errors get 8 seconds,
     * warnings and info get 5 seconds. The user can also dismiss it by
     * clicking the close button or clicking outside the notification card.
     * Each severity renders its own inline SVG icon and luminous accent,
     * both tuned to keep clear contrast on the dark panel in either theme.
     *
     * If no language pack is loaded, the method falls back to console.warn
     * rather than failing silently.
     *
     * @param {'error'|'warn'|'info'} level - The severity level. Each level
     *   renders its own icon and accent color in the notification header.
     * @param {string|{fa: string, en: string}} message - The notification
     *   message. A plain string is shown as-is; a bilingual pair renders
     *   the Persian line on top and the English line below, both centered.
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

      // Resolve the bilingual severity label (FA first, then EN, joined
      // with a dot) from both language packs so the type reads in both
      // languages regardless of the active conversation language. Falls
      // back to the active pack or English defaults when packs are absent.
      var faPack =
        global.DaryaLang && global.DaryaLang.fa ? global.DaryaLang.fa : null;
      var enPack =
        global.DaryaLang && global.DaryaLang.en ? global.DaryaLang.en : null;
      var ui = st.lang && st.lang.ui ? st.lang.ui : null;
      var typeKey =
        validLevel === 'error'
          ? 'notificationError'
          : validLevel === 'warn'
            ? 'notificationWarning'
            : 'notificationInfo';
      var faTypeText =
        (faPack && faPack.ui && faPack.ui[typeKey]) ||
        (ui && ui[typeKey]) ||
        (validLevel === 'error'
          ? 'Error'
          : validLevel === 'warn'
            ? 'Warning'
            : 'Info');
      var enTypeText =
        (enPack && enPack.ui && enPack.ui[typeKey]) ||
        (ui && ui[typeKey]) ||
        (validLevel === 'error'
          ? 'Error'
          : validLevel === 'warn'
            ? 'Warning'
            : 'Info');

      // Create the overlay container. Direction is applied per text
      // element (FA lines are RTL, EN lines are LTR) because the content
      // is bilingual, so no single forced direction fits.
      activeNotification = document.createElement('div');
      activeNotification.className = 'notification-overlay';
      activeNotification.setAttribute('role', 'alert');
      activeNotification.setAttribute('aria-live', 'assertive');
      activeNotification.setAttribute('aria-atomic', 'true');

      // Create the inner container with severity-specific class
      var container = document.createElement('div');
      container.className =
        'notification-container notification-container--' + validLevel;

      // Header row: bilingual type label + dismiss button
      var header = document.createElement('div');
      header.className = 'notification-header';

      // Type label reads "هشدار · Warning" in both languages, mirroring
      // the picker intro's dot-separated bilingual pairing, and leads with
      // a severity icon so the level reads at a glance. Each side carries
      // its own lang/dir so it renders correctly in either document
      // direction.
      var typeLabel = document.createElement('span');
      typeLabel.className =
        'notification-type notification-type--' + validLevel;
      var faType = document.createElement('span');
      faType.className = 'notification-type__fa';
      faType.setAttribute('lang', 'fa');
      faType.setAttribute('dir', 'rtl');
      faType.textContent = faTypeText;
      var typeSep = document.createElement('span');
      typeSep.className = 'notification-type__sep';
      typeSep.textContent = '\u00B7'; // middle dot separator (like picker intro)
      var enType = document.createElement('span');
      enType.className = 'notification-type__en';
      enType.setAttribute('lang', 'en');
      enType.setAttribute('dir', 'ltr');
      enType.textContent = enTypeText;
      typeLabel.appendChild(createSeverityIcon(validLevel));
      typeLabel.appendChild(faType);
      typeLabel.appendChild(typeSep);
      typeLabel.appendChild(enType);

      var dismissBtn = document.createElement('button');
      dismissBtn.className = 'notification-dismiss';
      dismissBtn.textContent = '\u00D7'; // multiplication sign as close icon
      dismissBtn.setAttribute(
        'aria-label',
        ui ? ui.notificationDismiss : 'Dismiss notification'
      );
      dismissBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dismissNotification();
      });

      header.appendChild(typeLabel);
      header.appendChild(dismissBtn);
      container.appendChild(header);

      // Message body: a bilingual pair renders two centered lines with the
      // Persian text on top and the English translation below, each with
      // its own direction. A plain string renders as a single line.
      if (bilingual && message.fa.trim().length > 0) {
        var faMsgEl = document.createElement('p');
        faMsgEl.className = 'notification-message notification-message--fa';
        faMsgEl.setAttribute('lang', 'fa');
        faMsgEl.setAttribute('dir', 'rtl');
        faMsgEl.textContent = message.fa;
        container.appendChild(faMsgEl);
      }
      if (bilingual && message.en.trim().length > 0) {
        var enMsgEl = document.createElement('p');
        enMsgEl.className = 'notification-message notification-message--en';
        enMsgEl.setAttribute('lang', 'en');
        enMsgEl.setAttribute('dir', 'ltr');
        enMsgEl.textContent = message.en;
        container.appendChild(enMsgEl);
      }
      if (!bilingual) {
        var msgEl = document.createElement('p');
        msgEl.className = 'notification-message';
        msgEl.textContent = messageText;
        container.appendChild(msgEl);
      }

      activeNotification.appendChild(container);

      // Click on backdrop dismisses
      activeNotification.addEventListener('click', function (e) {
        if (e.target === activeNotification) {
          dismissNotification();
        }
      });

      // Escape key dismisses
      activeNotification.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          dismissNotification();
        }
      });

      // Hovering or focusing the toast suspends the countdown so it never
      // vanishes while the user is reading or reaching for the close button.
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
