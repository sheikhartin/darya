/**
 * Darya classic script.
 */

(function (global) {
  'use strict';

  var DaryaUI = global.DaryaUI;

  const UI = DaryaUI;
  const el = UI.elements;
  const st = UI.state;

  // ========================================================================
  // Breathing exercise (4-7-8 pattern, Dr. Andrew Weil)
  // ========================================================================

  /** @type {Element|null} The active breathe overlay element. */
  var breatheOverlay = null;

  /** @type {Element|null} The element focused before the overlay opened. */
  var breatheFocusTarget = null;

  /** @type {number|null} Handle for the active breathe countdown interval. */
  var breatheCountdownTimer = null;

  /** Number of full 4-7-8 cycles to run before completing. */
  var BREATHE_MAX_ROUNDS = 3;

  /**
   * Dismisses the breathing exercise overlay if one is active.
   * Safely handles repeated calls by checking for existing elements.
   * Stops the countdown timer before removing the element.
   */
  function dismissBreathe() {
    if (breatheCountdownTimer) {
      clearInterval(breatheCountdownTimer);
      breatheCountdownTimer = null;
    }
    if (breatheOverlay) {
      breatheOverlay.remove();
      breatheOverlay = null;
    }
    // WAI-ARIA dialog pattern: return focus to the invoking control when
    // it is still part of the document.
    if (breatheFocusTarget && document.body.contains(breatheFocusTarget)) {
      breatheFocusTarget.focus();
    }
    breatheFocusTarget = null;
  }

  /**
   * Shows the guided 4-7-8 breathing exercise overlay.
   * The exercise cycles through inhale (4s), hold (7s), and exhale (8s)
   * phases, repeated BREATHE_MAX_ROUNDS times. A countdown timer shows
   * the remaining seconds per phase. After completion, a calm message is
   * appended to the conversation.
   *
   * If an exercise is already active, or if no language pack is loaded,
   * this function is a no-op (prevents duplicate overlays).
   */
  function showBreatheExercise() {
    if (breatheOverlay || !st.lang) {
      return;
    }

    breatheOverlay = document.createElement('div');
    breatheOverlay.className = 'breathe-overlay';
    breatheOverlay.setAttribute('role', 'dialog');
    breatheOverlay.setAttribute('aria-modal', 'true');
    breatheOverlay.setAttribute('aria-label', st.lang.ui.breatheTitle);

    var container = document.createElement('div');
    container.className = 'breathe-container';

    var circle = document.createElement('div');
    circle.className = 'breathe-circle';

    var label = document.createElement('div');
    label.className = 'breathe-label';

    var countdown = document.createElement('div');
    countdown.className = 'breathe-countdown';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'breathe-close';
    closeBtn.textContent = st.lang.ui.breatheDismiss;
    closeBtn.addEventListener('click', dismissBreathe);

    container.appendChild(circle);
    container.appendChild(label);
    container.appendChild(countdown);
    container.appendChild(closeBtn);
    breatheOverlay.appendChild(container);

    // Clicking on the backdrop (outside the container) also dismisses
    breatheOverlay.addEventListener('click', function (e) {
      if (e.target === breatheOverlay) {
        dismissBreathe();
      }
    });

    // Keyboard contract for the modal dialog: Escape dismisses, and Tab
    // stays inside the overlay (Close is its only focusable element, so
    // focus is contained there) so background content stays inert.
    breatheOverlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissBreathe();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        closeBtn.focus();
      }
    });

    breatheFocusTarget = document.activeElement;
    document.body.appendChild(breatheOverlay);

    // Move focus into the dialog so keyboard and screen-reader users land
    // on the dismiss control instead of behind the overlay.
    requestAnimationFrame(function () {
      closeBtn.focus();
    });

    var phases = [
      { action: 'breatheIn', duration: 4, circle: 'grow' },
      { action: 'breatheHold', duration: 7, circle: 'grow' },
      { action: 'breatheOut', duration: 8, circle: 'shrink' }
    ];

    var phaseIndex = 0;
    var totalPhasesCompleted = 0;
    var countdownValue = 0;

    /**
     * Returns the localized label for the given phase action.
     * @param {string} action - 'breatheIn', 'breatheHold', or 'breatheOut'
     * @returns {string}
     */
    function getPhaseLabel(action) {
      switch (action) {
        case 'breatheIn':
          return st.lang.ui.breatheIn;
        case 'breatheHold':
          return st.lang.ui.breatheHold;
        case 'breatheOut':
          return st.lang.ui.breatheOut;
        default:
          return '';
      }
    }

    /**
     * Converts a numeric value to a localized string using Persian digits
     * when the active language is Persian.
     * @param {number} value
     * @returns {string}
     */
    function toLocalizedNum(value) {
      var str = String(value);
      if (st.lang.code !== 'fa') {
        return str;
      }
      return str.replace(/[0-9]/g, function (digit) {
        return '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'[
          Number(digit)
        ];
      });
    }

    /**
     * Smoothly updates the countdown display with a brief scale animation.
     * Avoids redundant DOM updates when the value hasn't changed.
     * @param {number} value
     */
    function updateCountdownDisplay(value) {
      var text = toLocalizedNum(value);
      if (countdown.textContent === text) {
        return;
      }
      countdown.style.opacity = '0';
      countdown.style.transform = 'scale(0.85)';
      requestAnimationFrame(function () {
        countdown.textContent = text;
        requestAnimationFrame(function () {
          countdown.style.opacity = '1';
          countdown.style.transform = 'scale(1)';
        });
      });
    }

    /**
     * Updates the UI for the current phase: label, countdown, and circle
     * animation state.
     */
    function updateDisplay() {
      var phase = phases[phaseIndex];
      label.textContent = getPhaseLabel(phase.action);
      countdown.textContent = toLocalizedNum(countdownValue);
      countdown.style.opacity = '1';
      countdown.style.transform = 'scale(1)';
      circle.style.transition =
        'transform ' + phase.duration + 's cubic-bezier(0.37, 0, 0.24, 1)';
      circle.classList.remove('breathe-circle--grow', 'breathe-circle--shrink');
      // Force a reflow to restart the CSS transition
      // eslint-disable-next-line no-void
      void circle.offsetWidth;
      circle.classList.add(
        phase.circle === 'grow'
          ? 'breathe-circle--grow'
          : 'breathe-circle--shrink'
      );
    }

    /**
     * Handles the completion of the entire breathing exercise.
     * Dismisses the overlay and appends a calm completion message.
     */
    function completeExercise() {
      dismissBreathe();
      var calmMessage =
        st.lang.code === 'fa'
          ? '\u0622\u0641\u0631\u06CC\u0646. \u062A\u0645\u0631\u06CC\u0646 \u062A\u0646\u0641\u0633 \u062A\u0645\u0627\u0645 \u0634\u062F. \u0647\u0631 \u0648\u0642\u062A \u0622\u0645\u0627\u062F\u0647 \u0628\u0627\u0634\u06CC\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u0645 \u06AF\u0641\u062A\u06AF\u0648 \u0631\u0627 \u0627\u062F\u0627\u0645\u0647 \u062F\u0647\u06CC\u0645.'
          : 'Good job. The breathing exercise is complete. Take your time, and whenever you are ready, we can continue our conversation.';
      UI.utils.appendMessage('bot', calmMessage);
      UI.utils.scrollToBottom();
    }

    /**
     * Starts the countdown timer for the current phase. Decrements every
     * second and advances to the next phase when the countdown reaches 0.
     */
    function startCountdown() {
      var phase = phases[phaseIndex];
      countdownValue = phase.duration;
      updateDisplay();

      // Clear any stale timer from a previous phase
      if (breatheCountdownTimer) {
        clearInterval(breatheCountdownTimer);
      }

      breatheCountdownTimer = setInterval(function () {
        countdownValue -= 1;
        if (countdownValue < 1) {
          clearInterval(breatheCountdownTimer);
          breatheCountdownTimer = null;
          advancePhase();
          return;
        }
        updateCountdownDisplay(countdownValue);
      }, 1000);
    }

    /**
     * Advances to the next phase of the exercise. If all rounds are
     * complete, triggers the completion flow.
     */
    function advancePhase() {
      // Guard: if the overlay was dismissed externally, stop advancing
      if (!breatheOverlay || !document.body.contains(breatheOverlay)) {
        return;
      }

      totalPhasesCompleted += 1;
      if (totalPhasesCompleted >= phases.length * BREATHE_MAX_ROUNDS) {
        completeExercise();
        return;
      }
      phaseIndex = (phaseIndex + 1) % phases.length;
      startCountdown();
    }

    startCountdown();
  }

  // ========================================================================
  // New chat confirmation dialog
  // ========================================================================

  /** @type {Element|null} The active confirmation overlay element. */
  var confirmOverlay = null;
  var confirmFocusTarget = null;

  /**
   * Dismisses the new-chat confirmation dialog if one is active.
   */
  function dismissNewChatConfirm() {
    if (confirmOverlay) {
      confirmOverlay.remove();
      confirmOverlay = null;
    }
    // WAI-ARIA dialog pattern: return focus to the invoking control when
    // it is still part of the document and visible. The menu item that
    // opened the dialog is hidden once the menu closes, so fall back to
    // the menu trigger that sits behind it.
    var target = confirmFocusTarget;
    if (
      !target ||
      !document.body.contains(target) ||
      target.offsetParent === null
    ) {
      target =
        el.menuTrigger && el.menuTrigger.offsetParent !== null
          ? el.menuTrigger
          : null;
    }
    if (target) {
      target.focus();
    }
    confirmFocusTarget = null;
  }

  /**
   * Shows a modal confirmation dialog before resetting the conversation.
   * The `onConfirm` callback is provided by app.js (routes to showPicker).
   *
   * If a confirmation dialog is already visible, or if no language pack
   * is loaded, this function is a no-op.
   *
   * The dialog keeps Tab focus inside itself, cycling between its two
   * action buttons, and restores focus to the invoking control on
   * dismiss.
   * @param {Function} onConfirm - Called when user confirms the reset.
   */
  function showNewChatConfirm(onConfirm) {
    if (confirmOverlay || !st.lang) {
      return;
    }

    confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'confirm-overlay';
    confirmOverlay.setAttribute('role', 'alertdialog');
    confirmOverlay.setAttribute('aria-modal', 'true');
    confirmOverlay.setAttribute('aria-label', st.lang.ui.newChatConfirmTitle);

    var container = document.createElement('div');
    container.className = 'confirm-container';

    var title = document.createElement('p');
    title.className = 'confirm-title';
    title.textContent = st.lang.ui.newChatConfirmTitle;

    var desc = document.createElement('p');
    desc.className = 'confirm-desc';
    desc.textContent = st.lang.ui.newChatConfirmDesc;

    var actions = document.createElement('div');
    actions.className = 'confirm-actions';

    var yesBtn = document.createElement('button');
    yesBtn.className = 'confirm-btn confirm-btn--yes';
    yesBtn.textContent = st.lang.ui.newChatConfirmYes;
    yesBtn.addEventListener('click', function () {
      dismissNewChatConfirm();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
    yesBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dismissNewChatConfirm();
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
      }
    });

    var noBtn = document.createElement('button');
    noBtn.className = 'confirm-btn confirm-btn--no';
    noBtn.textContent = st.lang.ui.newChatConfirmNo;
    noBtn.addEventListener('click', dismissNewChatConfirm);
    noBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dismissNewChatConfirm();
      }
    });

    actions.appendChild(yesBtn);
    actions.appendChild(noBtn);
    container.appendChild(title);
    container.appendChild(desc);
    container.appendChild(actions);
    confirmOverlay.appendChild(container);

    confirmOverlay.addEventListener('click', function (e) {
      if (e.target === confirmOverlay) {
        dismissNewChatConfirm();
      }
    });
    confirmOverlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissNewChatConfirm();
      } else if (e.key === 'Tab') {
        // Modal dialog pattern: keep focus cycling inside the dialog
        // between its two action buttons so background content stays
        // inert for keyboard users. With two buttons the forward and
        // backward cycles coincide, but honor Shift+Tab explicitly so a
        // future third focusable stays ordered correctly.
        e.preventDefault();
        var current = document.activeElement;
        var next = e.shiftKey
          ? current === noBtn
            ? yesBtn
            : noBtn
          : current === yesBtn
            ? noBtn
            : yesBtn;
        next.focus();
      }
    });

    // Remember who opened the dialog so focus can return there on
    // dismiss (the menu item itself is hidden by then).
    confirmFocusTarget = document.activeElement;
    document.body.appendChild(confirmOverlay);

    // Focus the "No" button for accessibility and to prevent accidental
    // confirmation via keyboard navigation.
    requestAnimationFrame(function () {
      noBtn.focus();
    });
  }

  // ========================================================================
  // Exit confirmation bar
  // ========================================================================

  /**
   * Shows the exit confirmation bar above the composer, prompting the
   * user to confirm or cancel a farewell. Disables the composer input
   * while visible to prevent conflicting input.
   * Falls back silently if the required DOM elements are missing.
   */
  function showExitConfirmBar() {
    if (
      !el.exitConfirmBar ||
      !el.exitConfirmLabel ||
      !el.exitConfirmYes ||
      !el.exitConfirmNo
    ) {
      return;
    }

    el.exitConfirmLabel.textContent = st.lang.ui.exitConfirmBarLabel;
    el.exitConfirmYes.textContent = st.lang.ui.exitConfirmBarYes;
    el.exitConfirmYes.setAttribute('title', st.lang.ui.exitConfirmBarYes);
    el.exitConfirmNo.textContent = st.lang.ui.exitConfirmBarNo;
    el.exitConfirmNo.setAttribute('title', st.lang.ui.exitConfirmBarNo);
    el.exitConfirmBar.hidden = false;
    el.exitConfirmBar.setAttribute(
      'aria-label',
      st.lang.ui.exitConfirmBarLabel
    );

    // alertdialog pattern: move focus to the safe default (cancel) so
    // keyboard users do not lose focus when the composer is disabled.
    requestAnimationFrame(function () {
      if (el.exitConfirmNo) {
        el.exitConfirmNo.focus();
      }
    });

    // Disable the composer to prevent typing during the confirmation
    if (el.input) {
      el.input.disabled = true;
    }
    if (el.sendButton) {
      el.sendButton.disabled = true;
    }
  }

  /**
   * Hides the exit confirmation bar and re-enables the composer input
   * if the conversation has not ended.
   */
  function hideExitConfirmBar() {
    if (!el.exitConfirmBar) {
      return;
    }
    el.exitConfirmBar.hidden = true;
    if (!st.conversationEnded) {
      if (el.input) {
        el.input.disabled = false;
      }
      // Trigger a composer state refresh if the function is available
      if (typeof UI.refreshComposerState === 'function') {
        UI.refreshComposerState();
      }
    }
  }

  // ========================================================================
  // Notification overlay
  //
  // A lightweight toast-style notification banner that appears at the top
  // of the viewport to surface non-blocking messages (errors, warnings,
  // and info). Auto-dismisses after a configurable duration, or the user
  // can dismiss it manually via the close button or backdrop click.
  //
  // Three severity levels are supported:
  //   - 'error': red-accented banner for failures that need attention
  //   - 'warn':  amber-accented banner for recoverable issues
  //   - 'info':  teal-accented banner for informational messages
  //
  // Each level pairs its accent color with a matching inline SVG icon
  // (exclamation ring, alert triangle, info disc) so the severity is
  // legible without reading the label, in both themes.
  //
  // Only one notification is visible at a time; showing a new one
  // dismisses any existing one first.
  // ========================================================================

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
    var validLevel = NOTIFICATION_LEVELS.indexOf(level) !== -1 ? level : 'info';

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
    typeLabel.className = 'notification-type notification-type--' + validLevel;
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
    activeNotification.addEventListener('mouseleave', resumeNotificationTimer);
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

  const DaryaOverlays = {
    dismissBreathe,
    showBreatheExercise,
    dismissNewChatConfirm,
    showNewChatConfirm,
    showExitConfirmBar,
    hideExitConfirmBar,
    dismissNotification,
    showNotification
  };

  global.DaryaOverlays = DaryaOverlays;
})(typeof window !== 'undefined' ? window : globalThis);
