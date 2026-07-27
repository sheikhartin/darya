/**
 * Darya UI overlays: breathing exercise, new-chat confirmation dialog,
 * and exit confirmation bar. Uses shared state and elements from DaryaUI.
 */
(function (global) {
  'use strict';

  const UI = global.DaryaUI;
  const el = UI.elements;
  const st = UI.state;

  // ========================================================================
  // Breathing exercise (4-7-8 pattern, Dr. Andrew Weil)
  // ========================================================================

  let breatheOverlay = null;
  let breatheCountdownTimer = null;
  const BREATHE_MAX_ROUNDS = 3;

  function dismissBreathe() {
    if (breatheOverlay) {
      if (breatheCountdownTimer) {
        clearInterval(breatheCountdownTimer);
        breatheCountdownTimer = null;
      }
      breatheOverlay.remove();
      breatheOverlay = null;
    }
  }

  function showBreatheExercise() {
    if (breatheOverlay || !st.lang) return;

    breatheOverlay = document.createElement('div');
    breatheOverlay.className = 'breathe-overlay';
    breatheOverlay.setAttribute('role', 'dialog');
    breatheOverlay.setAttribute('aria-modal', 'true');
    breatheOverlay.setAttribute('aria-label', st.lang.ui.breatheTitle);

    const container = document.createElement('div');
    container.className = 'breathe-container';

    const circle = document.createElement('div');
    circle.className = 'breathe-circle';

    const label = document.createElement('div');
    label.className = 'breathe-label';

    const countdown = document.createElement('div');
    countdown.className = 'breathe-countdown';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'breathe-close';
    closeBtn.textContent = st.lang.ui.breatheDismiss;
    closeBtn.addEventListener('click', dismissBreathe);

    container.appendChild(circle);
    container.appendChild(label);
    container.appendChild(countdown);
    container.appendChild(closeBtn);
    breatheOverlay.appendChild(container);

    breatheOverlay.addEventListener('click', (e) => {
      if (e.target === breatheOverlay) dismissBreathe();
    });

    document.body.appendChild(breatheOverlay);

    const phases = [
      { action: 'breatheIn', duration: 4, circle: 'grow' },
      { action: 'breatheHold', duration: 7, circle: 'grow' },
      { action: 'breatheOut', duration: 8, circle: 'shrink' },
    ];

    let phaseIndex = 0;
    let totalPhasesCompleted = 0;
    let countdownValue = 0;

    function getPhaseLabel(action) {
      switch (action) {
        case 'breatheIn': return st.lang.ui.breatheIn;
        case 'breatheHold': return st.lang.ui.breatheHold;
        case 'breatheOut': return st.lang.ui.breatheOut;
        default: return '';
      }
    }

    function toLocalizedNum(value) {
      const str = String(value);
      if (st.lang.code !== 'fa') return str;
      return str.replace(/[0-9]/g, (digit) => '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'[Number(digit)]);
    }

    function updateCountdownDisplay(value) {
      const text = toLocalizedNum(value);
      if (countdown.textContent === text) return;
      countdown.style.opacity = '0';
      countdown.style.transform = 'scale(0.85)';
      requestAnimationFrame(() => {
        countdown.textContent = text;
        requestAnimationFrame(() => {
          countdown.style.opacity = '1';
          countdown.style.transform = 'scale(1)';
        });
      });
    }

    function updateDisplay() {
      const phase = phases[phaseIndex];
      label.textContent = getPhaseLabel(phase.action);
      countdown.textContent = toLocalizedNum(countdownValue);
      countdown.style.opacity = '1';
      countdown.style.transform = 'scale(1)';
      circle.style.transition = `transform ${phase.duration}s cubic-bezier(0.37, 0, 0.24, 1)`;
      circle.classList.remove('breathe-circle--grow', 'breathe-circle--shrink');
      void circle.offsetWidth;
      circle.classList.add(phase.circle === 'grow' ? 'breathe-circle--grow' : 'breathe-circle--shrink');
    }

    function completeExercise() {
      dismissBreathe();
      const calmMessage = st.lang.code === 'fa'
        ? '\u0622\u0641\u0631\u06CC\u0646. \u062A\u0645\u0631\u06CC\u0646 \u062A\u0646\u0641\u0633 \u062A\u0645\u0627\u0645 \u0634\u062F. \u0647\u0631 \u0648\u0642\u062A \u0622\u0645\u0627\u062F\u0647 \u0628\u0627\u0634\u06CC\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u0645 \u06AF\u0641\u062A\u06AF\u0648 \u0631\u0627 \u0627\u062F\u0627\u0645\u0647 \u062F\u0647\u06CC\u0645.'
        : 'Good job. The breathing exercise is complete. Take your time, and whenever you are ready, we can continue our conversation.';
      UI.utils.appendMessage('bot', calmMessage);
      UI.utils.scrollToBottom();
    }

    function startCountdown() {
      const phase = phases[phaseIndex];
      countdownValue = phase.duration;
      updateDisplay();
      if (breatheCountdownTimer) clearInterval(breatheCountdownTimer);
      breatheCountdownTimer = setInterval(() => {
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

    function advancePhase() {
      if (!breatheOverlay || !document.body.contains(breatheOverlay)) return;
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

  let confirmOverlay = null;

  function dismissNewChatConfirm() {
    if (confirmOverlay) {
      confirmOverlay.remove();
      confirmOverlay = null;
    }
  }

  /**
   * Shows a modal confirmation dialog before resetting the conversation.
   * The `onConfirm` callback is provided by app.js (routes to showPicker).
   * @param {Function} onConfirm - Called when user confirms the reset.
   */
  function showNewChatConfirm(onConfirm) {
    if (confirmOverlay || !st.lang) return;

    confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'confirm-overlay';
    confirmOverlay.setAttribute('role', 'alertdialog');
    confirmOverlay.setAttribute('aria-modal', 'true');
    confirmOverlay.setAttribute('aria-label', st.lang.ui.newChatConfirmTitle);

    const container = document.createElement('div');
    container.className = 'confirm-container';

    const title = document.createElement('p');
    title.className = 'confirm-title';
    title.textContent = st.lang.ui.newChatConfirmTitle;

    const desc = document.createElement('p');
    desc.className = 'confirm-desc';
    desc.textContent = st.lang.ui.newChatConfirmDesc;

    const actions = document.createElement('div');
    actions.className = 'confirm-actions';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'confirm-btn confirm-btn--yes';
    yesBtn.textContent = st.lang.ui.newChatConfirmYes;
    yesBtn.addEventListener('click', () => {
      dismissNewChatConfirm();
      if (typeof onConfirm === 'function') onConfirm();
    });
    yesBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dismissNewChatConfirm();
        if (typeof onConfirm === 'function') onConfirm();
      }
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'confirm-btn confirm-btn--no';
    noBtn.textContent = st.lang.ui.newChatConfirmNo;
    noBtn.addEventListener('click', dismissNewChatConfirm);
    noBtn.addEventListener('keydown', (e) => {
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

    confirmOverlay.addEventListener('click', (e) => {
      if (e.target === confirmOverlay) dismissNewChatConfirm();
    });
    confirmOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissNewChatConfirm();
      }
    });

    document.body.appendChild(confirmOverlay);
    requestAnimationFrame(() => noBtn.focus());
  }

  // ========================================================================
  // Exit confirmation bar
  // ========================================================================

  function showExitConfirmBar() {
    if (!el.exitConfirmBar || !el.exitConfirmLabel || !el.exitConfirmYes || !el.exitConfirmNo) return;
    el.exitConfirmLabel.textContent = st.lang.ui.exitConfirmBarLabel;
    el.exitConfirmYes.textContent = st.lang.ui.exitConfirmBarYes;
    el.exitConfirmYes.setAttribute('title', st.lang.ui.exitConfirmBarYes);
    el.exitConfirmNo.textContent = st.lang.ui.exitConfirmBarNo;
    el.exitConfirmNo.setAttribute('title', st.lang.ui.exitConfirmBarNo);
    el.exitConfirmBar.hidden = false;
    el.input.disabled = true;
    el.sendButton.disabled = true;
    el.exitConfirmBar.setAttribute('aria-label', st.lang.ui.exitConfirmBarLabel);
  }

  function hideExitConfirmBar() {
    if (!el.exitConfirmBar) return;
    el.exitConfirmBar.hidden = true;
    if (!st.conversationEnded) {
      el.input.disabled = false;
      // Trigger a composer state refresh if available
      if (typeof UI.refreshComposerState === 'function') {
        UI.refreshComposerState();
      }
    }
  }

  // ========================================================================
  // Public API
  // ========================================================================

  global.DaryaOverlays = {
    dismissBreathe,
    showBreatheExercise,
    dismissNewChatConfirm,
    showNewChatConfirm,
    showExitConfirmBar,
    hideExitConfirmBar,
  };
})(typeof window !== 'undefined' ? window : globalThis);
