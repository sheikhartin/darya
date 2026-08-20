/**
 * Darya - breathing exercise overlay.
 * Part file: owns the 4-7-8 guided breathing overlay (Dr. Andrew Weil
 * pattern) as a factory. The main overlays.js assembles the public API
 * from this part plus the confirm and notification parts.
 *
 * State stays private to this module: nothing outside calls into the
 * exercise except the assembled dismissBreathe/showBreatheExercise
 * methods.
 */
(function (global) {
  'use strict';

  const UI = global.DaryaUI;
  const st = UI.state;

  /**
   * Creates the breathing-exercise overlay functions.
   * @returns {{dismissBreathe: Function, showBreatheExercise: Function}}
   */
  function createBreathe() {
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

      // The exercise is dismissed only through the close button or
      // Escape. A backdrop click is deliberately NOT wired: a stray click
      // during a calming exercise should not end it, and the dimmed
      // backdrop must not advertise a click with a pointer cursor.

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
          'transform ' +
          phase.duration +
          's cubic-bezier(0.37, 0, 0.24, 1), box-shadow ' +
          phase.duration +
          's cubic-bezier(0.37, 0, 0.24, 1)';
        circle.classList.remove(
          'breathe-circle--grow',
          'breathe-circle--shrink'
        );
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

    return {
      dismissBreathe,
      showBreatheExercise
    };
  }

  global.DaryaOverlaysBreathe = {
    create: createBreathe
  };
})(typeof window !== 'undefined' ? window : globalThis);
