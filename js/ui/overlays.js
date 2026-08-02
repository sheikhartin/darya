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

    document.body.appendChild(breatheOverlay);

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

  /**
   * Dismisses the new-chat confirmation dialog if one is active.
   */
  function dismissNewChatConfirm() {
    if (confirmOverlay) {
      confirmOverlay.remove();
      confirmOverlay = null;
    }
  }

  /**
   * Shows a modal confirmation dialog before resetting the conversation.
   * The `onConfirm` callback is provided by app.js (routes to showPicker).
   *
   * If a confirmation dialog is already visible, or if no language pack
   * is loaded, this function is a no-op.
   *
   * The dialog traps focus on the "No" button for accessibility.
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
      }
    });

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
  // Only one notification is visible at a time; showing a new one
  // dismisses any existing one first.
  // ========================================================================

  /** @type {Element|null} The active notification overlay element. */
  var activeNotification = null;

  /** @type {number|null} Handle for the auto-dismiss timer. */
  var notificationTimer = null;

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
    if (activeNotification) {
      activeNotification.remove();
      activeNotification = null;
    }
  }

  /**
   * Shows a notification overlay with the given severity level and message.
   *
   * If a notification is already visible, it is dismissed first so only
   * one notification is shown at a time. The notification auto-dismisses
   * after a duration that depends on severity: errors get 8 seconds,
   * warnings and info get 5 seconds. The user can also dismiss it by
   * clicking the close button or clicking outside the notification card.
   *
   * If no language pack is loaded, the method falls back to console.warn
   * rather than failing silently.
   *
   * @param {'error'|'warn'|'info'} level - The severity level
   * @param {string} message - The notification message text
   * @param {number} [duration] - Optional custom auto-dismiss duration (ms)
   * @returns {boolean} True if the notification was shown, false otherwise
   */
  function showNotification(level, message, duration) {
    // Guard: validate severity level
    var validLevel = NOTIFICATION_LEVELS.indexOf(level) !== -1 ? level : 'info';

    // Guard: ensure message is a non-empty string
    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {
      console.warn('Darya notification: empty message, not showing overlay');
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
      ]('Darya notification: ' + message);
      return false;
    }

    // Create the overlay container
    activeNotification = document.createElement('div');
    activeNotification.className = 'notification-overlay';
    activeNotification.setAttribute('role', 'alert');
    activeNotification.setAttribute('aria-live', 'assertive');
    activeNotification.setAttribute('aria-atomic', 'true');

    // Create the inner container with severity-specific class
    var container = document.createElement('div');
    container.className =
      'notification-container notification-container--' + validLevel;

    // Header row: type label + dismiss button
    var header = document.createElement('div');
    header.className = 'notification-header';

    var typeLabel = document.createElement('span');
    typeLabel.className = 'notification-type notification-type--' + validLevel;
    typeLabel.textContent =
      validLevel === 'error'
        ? 'Error'
        : validLevel === 'warn'
          ? 'Warning'
          : 'Info';

    var dismissBtn = document.createElement('button');
    dismissBtn.className = 'notification-dismiss';
    dismissBtn.textContent = '\u00D7'; // multiplication sign as close icon
    dismissBtn.setAttribute('aria-label', 'Dismiss notification');
    dismissBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      dismissNotification();
    });

    header.appendChild(typeLabel);
    header.appendChild(dismissBtn);

    // Message body
    var msgEl = document.createElement('p');
    msgEl.className = 'notification-message';
    msgEl.textContent = message;

    container.appendChild(header);
    container.appendChild(msgEl);
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

    document.body.appendChild(activeNotification);

    // Set auto-dismiss timer
    var autoDuration =
      typeof duration === 'number' && duration > 0
        ? duration
        : validLevel === 'error'
          ? NOTIFICATION_DURATION_ERROR
          : NOTIFICATION_DURATION_DEFAULT;
    notificationTimer = setTimeout(function () {
      // Only auto-dismiss if the user hasn't hovered/focused the notification
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
