/**
 * Darya - conversation flow (part file).
 * Provides the conversation lifecycle (start, exit confirmation, message
 * send) and the breathe-trigger visibility helpers as a factory bound to
 * the shared controller object created by index.js.
 */
(function (global) {
  'use strict';

  /**
   * Creates the conversation-flow functions.
   * @param {object} ctrl - Shared controller state (see app.js)
   * @returns {object} Functions for the conversation lifecycle
   */
  function createConversation(ctrl) {
    const { UI, el, st } = ctrl;

    /**
     * Starts a new conversation: increments generation, creates a new engine
     * instance, and delivers the opening greeting after a brief typing delay.
     * Wave timings stay fixed for the page session; re-randomizing them here
     * would restart the running CSS animations and cause visible jumps.
     */
    async function startConversation() {
      var generation = ++st.conversationGeneration;
      st.engine = new ctrl.DaryaResponseEngine(st.lang);
      st.conversationEnded = false;
      st.exitConfirmShown = false;
      st.transcript = [];
      if (el.chat) {
        el.chat.replaceChildren();
      }
      st.messageCount = 0;
      st.currentTitle = '';
      st.userSpoke = false;
      ctrl.setHint('');
      el.input.setAttribute('placeholder', st.lang.ui.placeholderDefault);
      ctrl.setComposerBusy(true);
      hideBreatheTrigger();

      var delivered = await ctrl.deliverReply(st.engine.greeting(), generation);
      if (!delivered || generation !== st.conversationGeneration) {
        return;
      }

      ctrl.setComposerBusy(false);
      if (el.chat && el.chat.children.length > 0) {
        UI.utils.restoreScrollPosition();
      }
      UI.utils.focusInputUnlessTouch();
      // If the user stays silent after the greeting, Darya gently opens
      // the conversation herself after a short, randomized pause (the
      // proactive opener). Typing or sending a message cancels it.
      ctrl.armIdleOpener(generation);
    }

    /**
     * Arms the proactive idle opener: a single gentle question delivered
     * after a random 8-20 second pause, only while the user has not typed
     * anything yet. Cancelled by user input, a new conversation, or exit.
     * @param {number} generation - Conversation generation to guard against
     * stale replies after a new chat starts.
     */
    function armIdleOpener(generation) {
      clearIdleOpener();
      if (!st.lang.idleOpeners || st.lang.idleOpeners.length === 0) {
        return;
      }
      st.idleOpenerPending = true;
      var delay =
        ctrl.IDLE_OPENER_MIN_MS +
        Math.random() * (ctrl.IDLE_OPENER_MAX_MS - ctrl.IDLE_OPENER_MIN_MS);
      st.idleOpenerTimer = setTimeout(function () {
        st.idleOpenerTimer = null;
        if (!st.idleOpenerPending) {
          return;
        }
        st.idleOpenerPending = false;
        if (
          generation !== st.conversationGeneration ||
          st.conversationEnded ||
          st.waitingForReply ||
          st.userSpoke
        ) {
          return;
        }
        var opener =
          st.lang.idleOpeners[
            Math.floor(Math.random() * st.lang.idleOpeners.length)
          ];
        ctrl.deliverReply(opener, generation);
      }, delay);
    }

    /**
     * Cancels the pending proactive idle opener.
     */
    function clearIdleOpener() {
      st.idleOpenerPending = false;
      if (st.idleOpenerTimer !== null && st.idleOpenerTimer !== undefined) {
        clearTimeout(st.idleOpenerTimer);
        st.idleOpenerTimer = null;
      }
    }

    /**
     * Shows the breathe trigger button (available after emotionally heavy
     * conversational moments).
     */
    function showBreatheTrigger() {
      if (el.breatheTrigger) {
        el.breatheTrigger.hidden = false;
      }
    }

    /**
     * Hides the breathe trigger button.
     */
    function hideBreatheTrigger() {
      if (el.breatheTrigger) {
        el.breatheTrigger.hidden = true;
      }
    }

    /**
     * Confirms exit: sends the farewell message and marks the conversation
     * as ended. Guards against double-triggering via exitConfirmBusy.
     */
    function confirmExitYes() {
      if (st.exitConfirmBusy || !st.engine) {
        return;
      }
      clearIdleOpener();
      st.exitConfirmBusy = true;
      ctrl.DaryaOverlays.hideExitConfirmBar();
      var generation = st.conversationGeneration;
      var replyText = st.engine.farewell();
      ctrl.setComposerBusy(true);
      ctrl.deliverReply(replyText, generation).then(function (delivered) {
        if (!delivered || generation !== st.conversationGeneration) {
          return;
        }
        st.conversationEnded = true;
        st.pendingExit = false;
        el.input.setAttribute('placeholder', st.lang.ui.placeholderEnded);
        hideBreatheTrigger();
        ctrl.setComposerBusy(false);
        st.exitConfirmBusy = false;
      });
    }

    /**
     * Cancels the pending exit and re-enables the composer.
     */
    function confirmExitNo() {
      st.pendingExit = false;
      st.exitConfirmShown = false;
      ctrl.DaryaOverlays.hideExitConfirmBar();
      UI.utils.focusInputUnlessTouch();
    }

    /**
     * Sends the user's message, processes the response, and updates the UI.
     * @param {string} text - The user's message
     */
    async function sendMessage(text) {
      // Any user message cancels the pending proactive idle opener.
      clearIdleOpener();
      st.userSpoke = true;
      var generation = st.conversationGeneration;
      UI.utils.appendMessage('user', text);
      el.input.value = '';
      ctrl.setComposerBusy(true);

      var isExit = st.engine.isExitCommand(text);

      // Once an exit confirmation has been shown in this conversation,
      // a later farewell command goes straight to goodbye: the user has
      // already been asked once, and re-asking would read as Darya not
      // letting them leave ("بدرود" then "بای" both getting "are you
      // sure?" was a real-transcript complaint).
      if (isExit && (st.pendingExit || st.exitConfirmShown)) {
        var replyText = st.engine.farewell();
        var delivered = await ctrl.deliverReply(replyText, generation);
        if (!delivered || generation !== st.conversationGeneration) {
          return;
        }
        st.conversationEnded = true;
        st.pendingExit = false;
        el.input.setAttribute('placeholder', st.lang.ui.placeholderEnded);
        hideBreatheTrigger();
        ctrl.setComposerBusy(false);
        return;
      }

      if (isExit && !st.pendingExit) {
        replyText = st.engine.exitConfirmation();
        delivered = await ctrl.deliverReply(replyText, generation);
        if (!delivered || generation !== st.conversationGeneration) {
          return;
        }
        st.pendingExit = true;
        st.exitConfirmShown = true;
        ctrl.setComposerBusy(false);
        ctrl.DaryaOverlays.showExitConfirmBar();
        return;
      }

      st.pendingExit = false;
      ctrl.DaryaOverlays.hideExitConfirmBar();

      // Defensive guard: wrap the engine respond call to catch unexpected
      // errors that could crash the conversation flow. If the engine throws,
      // show a user-friendly notification and recover gracefully.
      // replyText is already declared in the enclosing function scope.
      try {
        replyText = st.engine.respond(text);
      } catch (error) {
        var errorMsg = error && error.message ? error.message : String(error);
        if (typeof ctrl.DaryaLogger !== 'undefined') {
          ctrl.DaryaLogger.error('Engine respond failed:', errorMsg);
        } else {
          console.error('Darya engine error:', errorMsg);
        }
        // Fall back to a localized safe response so the conversation continues.
        // Uses engineErrorReply (semantically correct for processing errors)
        // rather than emptyInputReply (which implies the user stopped typing).
        replyText =
          st.lang && st.lang.engineErrorReply
            ? st.lang.engineErrorReply
            : 'I need a moment to process. Could you repeat that?';
        // Surface a bilingual notification to the user about the issue
        if (
          typeof ctrl.DaryaOverlays !== 'undefined' &&
          typeof ctrl.DaryaOverlays.showNotification === 'function'
        ) {
          var warnMsg = ctrl.getBilingualUiText(
            'engineErrorHint',
            'A minor issue occurred. The conversation can continue.'
          );
          ctrl.DaryaOverlays.showNotification('warn', warnMsg, 4000);
        }
      }

      delivered = await ctrl.deliverReply(replyText, generation);
      if (!delivered || generation !== st.conversationGeneration) {
        return;
      }

      ctrl.setComposerBusy(false);

      if (st.engine && st.engine.lastTurnNeedsCare) {
        showBreatheTrigger();
      } else {
        hideBreatheTrigger();
      }
      UI.utils.focusInputUnlessTouch();
    }

    return {
      startConversation,
      armIdleOpener,
      clearIdleOpener,
      showBreatheTrigger,
      hideBreatheTrigger,
      confirmExitYes,
      confirmExitNo,
      sendMessage
    };
  }

  global.DaryaAppConversation = {
    create: createConversation
  };
})(typeof window !== 'undefined' ? window : globalThis);
