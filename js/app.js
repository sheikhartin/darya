/**
 * Darya - front-end chat controller (classic script entry point).
 */
(function (global) {
  'use strict';

  var DaryaResponseEngine = global.DaryaResponseEngine;
  var DaryaUI = global.DaryaUI;
  var DaryaOverlays = global.DaryaOverlays;
  var DaryaExport = global.DaryaExport;
  var DaryaLogger = global.DaryaLogger;
  var DaryaAmbient = global.DaryaAmbient;
  var DaryaAmbientSound = global.DaryaAmbientSound;
  var DaryaLang = global.DaryaLang;

  const UI = DaryaUI;
  const el = UI.elements;
  const st = UI.state;

  var MIN_REPLY_DELAY_MS = 1500;
  var MAX_REPLY_DELAY_MS = 2300;

  var menuFocusIndex = 0;

  // ========================================================================
  // Composer / Reply state
  // ========================================================================

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

  // Expose for overlays module to call after dismissing the exit bar
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
      MIN_REPLY_DELAY_MS +
      Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS)
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

  // ========================================================================
  // Language selection
  // ========================================================================

  /**
   * Applies the chosen language to the entire UI: sets dir/lang attributes,
   * updates all text labels, and configures the engine.
   * @param {object} chosenLang - Language pack (DaryaLang.en or DaryaLang.fa)
   */
  function applyLanguage(chosenLang) {
    st.lang = chosenLang;

    el.htmlRoot.setAttribute('lang', chosenLang.code);
    el.htmlRoot.setAttribute('dir', chosenLang.dir);

    el.pageTitle.textContent = chosenLang.ui.appTitle;
    el.pageDescription.setAttribute('content', chosenLang.ui.appDescription);

    el.headerTitle.textContent = chosenLang.botName;
    el.input.setAttribute('placeholder', chosenLang.ui.placeholderDefault);
    el.input.setAttribute('aria-label', chosenLang.ui.ariaInputLabel);
    el.input.setAttribute('dir', chosenLang.dir);
    el.input.setAttribute('lang', chosenLang.code);
    el.sendButton.setAttribute('aria-label', chosenLang.ui.sendButtonTitle);
    el.sendButton.setAttribute('title', chosenLang.ui.sendButtonTitle);
    el.menuTrigger.setAttribute('aria-label', chosenLang.ui.menuTriggerTitle);
    el.menuTrigger.setAttribute('title', chosenLang.ui.menuTriggerTitle);
    el.pickerFa.setAttribute('aria-label', chosenLang.ui.pickerFaTitle);
    el.pickerFa.setAttribute('title', chosenLang.ui.pickerFaTitle);
    el.pickerEn.setAttribute('aria-label', chosenLang.ui.pickerEnTitle);
    el.pickerEn.setAttribute('title', chosenLang.ui.pickerEnTitle);
    el.themeToggleButtons.forEach(function (button) {
      var title =
        button.dataset.themeChoice === 'ocean'
          ? chosenLang.ui.themeOceanTitle
          : chosenLang.ui.themeBeachTitle;
      button.setAttribute('aria-label', title);
      button.setAttribute('title', title);
    });
    el.menuNewChat.setAttribute('aria-label', chosenLang.ui.newChatTitle);
    el.menuNewChat.setAttribute('title', chosenLang.ui.newChatTitle);
    el.menuExportTxt.setAttribute('aria-label', chosenLang.ui.menuExportTitle);
    el.menuExportTxt.setAttribute('title', chosenLang.ui.menuExportTitle);
    el.themePicker.setAttribute('aria-label', chosenLang.ui.themeGroupLabel);
    el.typingStatus.setAttribute('aria-label', chosenLang.ui.typingLabel);
    el.menuNewChatLabel.textContent = chosenLang.ui.menuNewChat;
    el.menuExportTxtLabel.textContent = chosenLang.ui.menuExportLabel;
    el.disclaimer.textContent = chosenLang.ui.disclaimer;
    UI.theme.updateThemeMenuItem();

    if (el.breatheTrigger) {
      el.breatheTrigger.setAttribute('aria-label', chosenLang.ui.breatheTitle);
      el.breatheTrigger.setAttribute('title', chosenLang.ui.breatheTitle);
      var breathSvg = el.breatheTrigger.querySelector('svg');
      if (breathSvg) {
        breathSvg.setAttribute('aria-label', chosenLang.ui.breatheTitle);
      }
    }

    // Initialize the sound toggle from the ACTUAL playback state. Audio
    // cannot start before a user gesture, so this shows "off" until the
    // autoplay attempt (started right after this call) settles and
    // re-syncs the toggle from the real result.
    if (typeof DaryaAmbientSound !== 'undefined') {
      syncSoundToggleUI(DaryaAmbientSound.isPlaying());
    }

    if (el.pickerLangLock) {
      var faSpan = el.pickerLangLock.querySelector('.picker__lang-lock-fa');
      var enSpan = el.pickerLangLock.querySelector('.picker__lang-lock-en');
      if (chosenLang.code === 'fa') {
        if (faSpan) {
          faSpan.hidden = false;
        }
        if (enSpan) {
          enSpan.hidden = true;
        }
      } else {
        if (faSpan) {
          faSpan.hidden = true;
        }
        if (enSpan) {
          enSpan.hidden = false;
        }
      }
    }
  }

  /**
   * Selects a language and starts the conversation, hiding the picker.
   * @param {object} chosenLang
   */
  function selectLanguage(chosenLang) {
    applyLanguage(chosenLang);
    el.picker.hidden = true;
    el.app.hidden = false;
    st.chatActive = true;
    startConversation();

    // Auto-play ambient sound if the user previously opted in, syncing
    // the toggle to the ACTUAL result: if the browser blocks the
    // automatic start, the toggle rolls back to "off" and a brief toast
    // points to the menu toggle for a gesture-based start.
    if (typeof DaryaAmbientSound !== 'undefined') {
      var soundIntentOn = DaryaAmbientSound.getSavedState() === true;
      DaryaAmbientSound.autoplayIfEnabled().then(function (enabled) {
        syncSoundToggleUI(enabled);
        if (!enabled && soundIntentOn) {
          notifySoundAutoplayBlocked();
        }
      });
    }
  }

  /**
   * Returns to the language picker, resetting all conversation state.
   * Preserves the theme selection across sessions.
   */
  function showPicker() {
    st.conversationGeneration += 1;
    setTypingVisible(false);
    DaryaOverlays.dismissBreathe();
    DaryaOverlays.hideExitConfirmBar();
    st.pendingExit = false;
    st.exitConfirmBusy = false;
    el.app.hidden = true;
    el.picker.hidden = false;
    closeMenu();
    st.lang = null;
    st.engine = null;
    st.conversationEnded = false;
    st.chatActive = false;
    st.transcript = [];
    if (el.chat) {
      el.chat.replaceChildren();
    }
    st.messageCount = 0;
    st.currentTitle = '';
    if (el.pickerLangLock) {
      var faSpan = el.pickerLangLock.querySelector('.picker__lang-lock-fa');
      var enSpan = el.pickerLangLock.querySelector('.picker__lang-lock-en');
      if (faSpan) {
        faSpan.hidden = false;
      }
      if (enSpan) {
        enSpan.hidden = false;
      }
    }
    window.scrollTo(0, 0);
    try {
      sessionStorage.removeItem(UI.constants.SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
    // Move focus to the first language option so keyboard users land on
    // a sensible control after choosing "New chat".
    if (el.pickerFa) {
      el.pickerFa.focus();
    }
  }

  // ========================================================================
  // Conversation flow
  // ========================================================================

  /**
   * Starts a new conversation: increments generation, creates a new engine
   * instance, and delivers the opening greeting after a brief typing delay.
   * Wave timings stay fixed for the page session; re-randomizing them here
   * would restart the running CSS animations and cause visible jumps.
   */
  async function startConversation() {
    var generation = ++st.conversationGeneration;
    st.engine = new DaryaResponseEngine(st.lang);
    st.conversationEnded = false;
    st.transcript = [];
    if (el.chat) {
      el.chat.replaceChildren();
    }
    st.messageCount = 0;
    st.currentTitle = '';
    setHint('');
    el.input.setAttribute('placeholder', st.lang.ui.placeholderDefault);
    setComposerBusy(true);
    hideBreatheTrigger();

    var delivered = await deliverReply(st.engine.greeting(), generation);
    if (!delivered || generation !== st.conversationGeneration) {
      return;
    }

    setComposerBusy(false);
    if (el.chat && el.chat.children.length > 0) {
      UI.utils.restoreScrollPosition();
    }
    UI.utils.focusInputUnlessTouch();
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
    st.exitConfirmBusy = true;
    DaryaOverlays.hideExitConfirmBar();
    var generation = st.conversationGeneration;
    var replyText = st.engine.farewell();
    setComposerBusy(true);
    deliverReply(replyText, generation).then(function (delivered) {
      if (!delivered || generation !== st.conversationGeneration) {
        return;
      }
      st.conversationEnded = true;
      st.pendingExit = false;
      el.input.setAttribute('placeholder', st.lang.ui.placeholderEnded);
      hideBreatheTrigger();
      setComposerBusy(false);
      st.exitConfirmBusy = false;
    });
  }

  /**
   * Cancels the pending exit and re-enables the composer.
   */
  function confirmExitNo() {
    st.pendingExit = false;
    DaryaOverlays.hideExitConfirmBar();
    UI.utils.focusInputUnlessTouch();
  }

  /**
   * Sends the user's message, processes the response, and updates the UI.
   * @param {string} text - The user's message
   */
  async function sendMessage(text) {
    var generation = st.conversationGeneration;
    UI.utils.appendMessage('user', text);
    el.input.value = '';
    setComposerBusy(true);

    var isExit = st.engine.isExitCommand(text);

    if (isExit && st.pendingExit) {
      var replyText = st.engine.farewell();
      var delivered = await deliverReply(replyText, generation);
      if (!delivered || generation !== st.conversationGeneration) {
        return;
      }
      st.conversationEnded = true;
      st.pendingExit = false;
      el.input.setAttribute('placeholder', st.lang.ui.placeholderEnded);
      hideBreatheTrigger();
      setComposerBusy(false);
      return;
    }

    if (isExit && !st.pendingExit) {
      replyText = st.engine.exitConfirmation();
      delivered = await deliverReply(replyText, generation);
      if (!delivered || generation !== st.conversationGeneration) {
        return;
      }
      st.pendingExit = true;
      setComposerBusy(false);
      DaryaOverlays.showExitConfirmBar();
      return;
    }

    st.pendingExit = false;
    DaryaOverlays.hideExitConfirmBar();

    // Defensive guard: wrap the engine respond call to catch unexpected
    // errors that could crash the conversation flow. If the engine throws,
    // show a user-friendly notification and recover gracefully.
    // replyText is already declared in the enclosing function scope.
    try {
      replyText = st.engine.respond(text);
    } catch (error) {
      var errorMsg = error && error.message ? error.message : String(error);
      if (typeof DaryaLogger !== 'undefined') {
        DaryaLogger.error('Engine respond failed:', errorMsg);
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
      // Surface a localized notification to the user about the issue
      if (
        typeof DaryaOverlays !== 'undefined' &&
        typeof DaryaOverlays.showNotification === 'function'
      ) {
        var warnMsg =
          st.lang && st.lang.ui && st.lang.ui.engineErrorHint
            ? st.lang.ui.engineErrorHint
            : 'A minor issue occurred. The conversation can continue.';
        DaryaOverlays.showNotification('warn', warnMsg, 4000);
      }
    }

    delivered = await deliverReply(replyText, generation);
    if (!delivered || generation !== st.conversationGeneration) {
      return;
    }

    setComposerBusy(false);

    if (st.engine && st.engine.lastTurnNeedsCare) {
      showBreatheTrigger();
    } else {
      hideBreatheTrigger();
    }
    UI.utils.focusInputUnlessTouch();
  }

  // ========================================================================
  // Menu
  // ========================================================================

  /**
   * Opens the menu popover and focuses the first menu item.
   */
  function openMenu() {
    el.menuPopover.hidden = false;
    el.menuTrigger.setAttribute('aria-expanded', 'true');
    // Always present the honest sound state when the menu opens, so a
    // rare silent failure (e.g. a theme-change playback that got blocked
    // or a tab-resume that failed) can never leave a stale "on" icon.
    if (typeof DaryaAmbientSound !== 'undefined') {
      syncSoundToggleUI(DaryaAmbientSound.isPlaying());
    }
    menuFocusIndex = 0;
    var items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
    requestAnimationFrame(function () {
      if (items[menuFocusIndex]) {
        items[menuFocusIndex].focus();
      }
    });
  }

  /**
   * Closes the menu popover, optionally restoring focus to the trigger.
   * @param {boolean} restoreFocus
   */
  function closeMenu(restoreFocus) {
    el.menuPopover.hidden = true;
    el.menuTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) {
      el.menuTrigger.focus();
    }
  }

  /**
   * Moves the menu focus by a given step (1 = next, -1 = previous).
   * Wraps around at the first and last items.
   * @param {number} step
   */
  function moveMenuFocus(step) {
    var items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
    if (items.length === 0) {
      return;
    }
    menuFocusIndex = (menuFocusIndex + step + items.length) % items.length;
    if (items[menuFocusIndex]) {
      items[menuFocusIndex].focus();
    }
  }

  /**
   * Toggles menu visibility.
   */
  function toggleMenu() {
    if (el.menuPopover.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  /**
   * Moves focus to the visible focusable element before or after the menu
   * trigger. Used when Tab closes the open menu: the popover is hidden by
   * then, so this resolves the document tab order cleanly and hands focus
   * to the next real control instead of dropping it on <body>.
   * @param {number} step - 1 for next, -1 for previous
   */
  function focusMenuTriggerSibling(step) {
    var focusables = [
      ...document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ].filter(function (node) {
      // Keep only visible elements; hidden picker/menu items are
      // excluded via offsetParent being null.
      return node.offsetParent !== null;
    });
    var index = focusables.indexOf(el.menuTrigger);
    if (index === -1) {
      return;
    }
    var target = focusables[index + step];
    if (target) {
      target.focus();
    }
  }

  // ========================================================================
  // Event wiring
  // ========================================================================

  el.pickerFa.addEventListener('click', function () {
    selectLanguage(DaryaLang.fa);
  });
  el.pickerEn.addEventListener('click', function () {
    selectLanguage(DaryaLang.en);
  });

  el.themeToggleButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      UI.theme.applyTheme(button.dataset.themeChoice);
    });
  });

  el.composer.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = el.input.value.trim();
    if (
      !text ||
      st.conversationEnded ||
      st.waitingForReply ||
      UI.utils.hasForeignLetters(text)
    ) {
      return;
    }
    sendMessage(text);
  });

  el.input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      el.composer.requestSubmit();
    }
  });

  el.input.addEventListener('input', refreshComposerState);
  el.input.addEventListener('focus', function () {
    UI.utils.scrollToBottom();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () {
      UI.utils.scrollToBottom();
    });
  }

  el.menuTrigger.addEventListener('click', function (event) {
    event.stopPropagation();
    toggleMenu();
  });

  el.menuPopover.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveMenuFocus(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveMenuFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      menuFocusIndex = 0;
      var items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      if (items[0]) {
        items[0].focus();
      }
    } else if (event.key === 'End') {
      event.preventDefault();
      items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      menuFocusIndex = items.length - 1;
      var lastItem = items[items.length - 1];
      if (lastItem) {
        lastItem.focus();
      }
    } else if (event.key === 'Tab') {
      // WAI-ARIA menu-button pattern: Tab leaves the menu, closes it,
      // and continues the page tab order from just after the trigger.
      event.preventDefault();
      closeMenu();
      focusMenuTriggerSibling(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
    }
  });

  document.addEventListener('click', function (event) {
    if (
      !el.menuPopover.hidden &&
      !el.menuPopover.contains(event.target) &&
      event.target !== el.menuTrigger
    ) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !el.menuPopover.hidden) {
      closeMenu(true);
    }
  });

  el.menuNewChat.addEventListener('click', function () {
    closeMenu();
    if (st.chatActive) {
      DaryaOverlays.showNewChatConfirm(showPicker);
    } else {
      DaryaOverlays.dismissNewChatConfirm();
      showPicker();
    }
  });

  el.menuExportTxt.addEventListener('click', function () {
    DaryaExport.exportPlainText();
    // Return focus to the trigger (WAI-ARIA menu-button pattern); the
    // download itself needs no focus target of its own.
    closeMenu(true);
  });

  el.menuThemeToggle.addEventListener('click', function () {
    UI.theme.applyTheme(el.menuThemeToggle.dataset.themeChoice);
    closeMenu(true);
  });

  if (el.breatheTrigger) {
    el.breatheTrigger.addEventListener('click', function () {
      DaryaOverlays.showBreatheExercise();
    });
  }

  if (el.exitConfirmYes) {
    el.exitConfirmYes.addEventListener('click', confirmExitYes);
    el.exitConfirmYes.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        confirmExitYes();
      }
    });
  }
  if (el.exitConfirmNo) {
    el.exitConfirmNo.addEventListener('click', confirmExitNo);
    el.exitConfirmNo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        confirmExitNo();
      }
    });
  }
  if (el.exitConfirmBar) {
    // Escape cancels the pending farewell, mirroring the cancel button.
    el.exitConfirmBar.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        confirmExitNo();
      }
    });
  }

  if (el.chat) {
    el.chat.addEventListener(
      'scroll',
      function () {
        UI.utils.saveScrollPosition();
      },
      { passive: true }
    );
  }

  // ========================================================================
  // Sound toggle event wiring (menu item)
  // ========================================================================

  if (el.menuSoundToggle) {
    el.menuSoundToggle.addEventListener('click', function () {
      DaryaAmbientSound.toggle().then(function (enabled) {
        syncSoundToggleUI(enabled);
        // Return focus to the trigger after toggling, like the theme
        // toggle does.
        closeMenu(true);
      });
    });
  }

  /**
   * Syncs the menu sound toggle's visible state (aria-pressed, title, and
   * label) with the ACTUAL ambient playback state, so the icon never
   * shows "on" while silence plays. Falls back to hardcoded Persian when
   * no language pack is active yet (the app shell defaults to Persian).
   * @param {boolean} enabled - True when ambient sound is really playing.
   */
  function syncSoundToggleUI(enabled) {
    if (!el.menuSoundToggle) {
      return;
    }
    var onLabel = st.lang ? st.lang.ui.soundOnTitle : 'پخش صدای محیطی: روشن';
    var offLabel = st.lang ? st.lang.ui.soundOffTitle : 'پخش صدای محیطی: خاموش';
    var label = enabled ? onLabel : offLabel;
    el.menuSoundToggle.setAttribute('aria-pressed', String(enabled));
    el.menuSoundToggle.setAttribute('title', label);
    if (el.menuSoundLabel) {
      el.menuSoundLabel.textContent = label;
    }
  }

  /** True once a blocked-autoplay toast has been shown this session. */
  var soundBlockedToastShown = false;

  /**
   * Explains, once per session, that ambient sound could not start
   * automatically and points to the menu toggle. Called by both autoplay
   * paths - the language picker and the global first-gesture listener -
   * with a one-shot flag so a single click that triggers both never
   * shows the toast twice.
   */
  function notifySoundAutoplayBlocked() {
    if (soundBlockedToastShown) {
      return;
    }
    soundBlockedToastShown = true;
    var blockedMsg =
      (st.lang && st.lang.ui.soundAutoplayBlockedMsg) ||
      'Ambient sound could not start automatically.';
    DaryaOverlays.showNotification('warn', blockedMsg, 6000);
  }

  // ========================================================================
  // Refresh / close guard
  // ========================================================================

  window.addEventListener('beforeunload', function (event) {
    if (!st.chatActive) {
      return undefined;
    }
    event.preventDefault();
    event.returnValue = '';
    return '';
  });

  // ========================================================================
  // Offline support
  // ========================================================================

  // Service worker registration: only attempt on http/https protocols.
  // The file:// protocol (local file open) does not support service
  // workers and throws a TypeError if we try, which confuses users.
  // GitHub Pages and other HTTP-based deployments work normally.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function (error) {
        console.warn(
          'Darya: service worker registration failed (app still works online):',
          error
        );
      });
    });
  }

  // ========================================================================
  /**
   * Initializes a one-time global user gesture listener. The very first
   * interaction anywhere on the screen (click, tap, or key) will trigger
   * ambient sound playback if the user has it enabled in their settings.
   */
  function initAutoplayGesture() {
    var startSound = function () {
      if (
        typeof DaryaAmbientSound !== 'undefined' &&
        DaryaAmbientSound.getSavedState() === true
      ) {
        DaryaAmbientSound.autoplayIfEnabled().then(function (enabled) {
          syncSoundToggleUI(enabled);
          if (!enabled) {
            notifySoundAutoplayBlocked();
          }
        });
      }
      document.removeEventListener('click', startSound);
      document.removeEventListener('keydown', startSound);
      document.removeEventListener('touchstart', startSound);
    };
    document.addEventListener('click', startSound, { passive: true });
    document.addEventListener('keydown', startSound, { passive: true });
    document.addEventListener('touchstart', startSound, { passive: true });
  }

  // Boot
  // ========================================================================

  var storedTheme = UI.theme.getCookie(UI.constants.THEME_COOKIE_NAME);
  if (!storedTheme && typeof window.localStorage === 'object') {
    try {
      storedTheme = localStorage.getItem(UI.constants.THEME_COOKIE_NAME);
    } catch (e) {
      /* ignore */
    }
  }
  UI.theme.applyTheme(storedTheme || UI.constants.DEFAULT_THEME);
  DaryaAmbient.initBeachWaveVariation();
  DaryaAmbient.initBubbles();
  DaryaAmbient.initOceanParticles();
  DaryaAmbient.initBirdShadows();
  initAutoplayGesture();

  // The menu sound toggle starts honest: the HTML default is "off" and
  // nothing is playing yet (browsers require a user gesture before audio
  // can start). The first interaction re-syncs the toggle from the
  // actual playback result via autoplayIfEnabled().then(...).
})(typeof window !== 'undefined' ? window : globalThis);
