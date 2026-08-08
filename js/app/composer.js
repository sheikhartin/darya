/**
 * Darya - composer and reply state (part file).
 * Provides the typing indicator, composer hint, send-button state, and
 * reply delivery helpers as a factory bound to the shared controller
 * object created by index.js.
 */
(function (global) {
  'use strict';

  /**
   * Creates the composer/reply functions.
   * @param {object} ctrl - Shared controller state (see app.js)
   * @returns {object} Functions for the composer and reply flow
   */
  function createComposer(ctrl) {
    const { UI, el, st } = ctrl;

    /**
     * Shows or hides the typing indicator (three animated dots).
     * Automatically scrolls to bottom when the indicator becomes visible.
     * @param {boolean} visible
     */
    function setTypingVisible(visible) {
      if (el.typingRow) {
        el.typingRow.hidden = !visible;
      }
      if (visible) {
        UI.utils.scrollToBottom();
      }
    }

    /**
     * Sets the composer hint message (validation warning). An empty or
     * undefined message hides the hint.
     * @param {string|null|undefined} message
     */
    function setHint(message) {
      if (!message) {
        if (el.hint) {
          el.hint.hidden = true;
          el.hint.textContent = '';
        }
        return;
      }
      el.hint.textContent = message;
      el.hint.hidden = false;
    }

    /**
     * Refreshes the composer send button state based on the current input
     * value: enables the button when there is valid text, disables when
     * empty or when a conversation is ended or a reply is pending.
     * Also checks for foreign script input and shows a hint if detected.
     */
    function refreshComposerState() {
      el.input.style.height = 'auto';
      el.input.style.height = el.input.scrollHeight + 'px';

      var text = el.input.value.trim();

      if (text && UI.utils.hasForeignLetters(text)) {
        setHint(st.lang.ui.foreignScriptHint);
        el.sendButton.disabled = true;
        return;
      }

      setHint('');
      el.sendButton.disabled =
        st.conversationEnded || st.waitingForReply || text.length === 0;
    }

    // Expose for the overlays module to call after dismissing the exit bar
    UI.refreshComposerState = refreshComposerState;

    /**
     * Sets the composer busy state, disabling input during reply generation.
     * @param {boolean} busy
     */
    function setComposerBusy(busy) {
      st.waitingForReply = busy;
      el.input.disabled = busy || st.conversationEnded;
      refreshComposerState();
    }

    /**
     * Returns a random delay within the configured reply range.
     * @returns {number} Milliseconds
     */
    function randomReplyDelay() {
      return (
        ctrl.MIN_REPLY_DELAY_MS +
        Math.random() * (ctrl.MAX_REPLY_DELAY_MS - ctrl.MIN_REPLY_DELAY_MS)
      );
    }

    /**
     * Shows the typing indicator, waits for a delay proportional to response
     * length, then appends the bot's reply. Returns true if the reply was
     * delivered, false if the conversation generation changed (stale reply).
     * @param {string} replyText
     * @param {number} generation
     * @returns {Promise<boolean>}
     */
    async function deliverReply(replyText, generation) {
      setTypingVisible(true);
      var baseDelay = randomReplyDelay();
      var extraDelay = Math.min(replyText.length * 2, 600);
      await new Promise(function (resolve) {
        return setTimeout(resolve, baseDelay + extraDelay);
      });
      setTypingVisible(false);
      if (generation !== st.conversationGeneration) {
        return false;
      }
      UI.utils.appendMessage('bot', replyText);
      return true;
    }

    return {
      setTypingVisible,
      setHint,
      refreshComposerState,
      setComposerBusy,
      randomReplyDelay,
      deliverReply
    };
  }

  global.DaryaAppComposer = {
    create: createComposer
  };
})(typeof window !== 'undefined' ? window : globalThis);
