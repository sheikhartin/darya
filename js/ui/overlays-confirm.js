/**
 * Darya - confirmation dialogs (new chat + exit bar).
 * Part file: owns the new-chat reset confirmation dialog and the exit
 * confirmation bar as a factory. The main overlays.js assembles the
 * public API from this part plus the breathe and notification parts.
 */
(function (global) {
  'use strict';

  const UI = global.DaryaUI;
  const el = UI.elements;
  const st = UI.state;

  /**
   * Creates the confirmation-dialog functions.
   * @returns {{dismissNewChatConfirm: Function, showNewChatConfirm: Function,
   *   showExitConfirmBar: Function, hideExitConfirmBar: Function}}
   */
  function createConfirm() {
    /** @type {Element|null} The active confirmation overlay element. */
    var confirmOverlay = null;

    /** @type {Element|null} The element focused before the overlay opened. */
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

    return {
      dismissNewChatConfirm,
      showNewChatConfirm,
      showExitConfirmBar,
      hideExitConfirmBar
    };
  }

  global.DaryaOverlaysConfirm = {
    create: createConfirm
  };
})(typeof window !== 'undefined' ? window : globalThis);
