/**
 * Darya - front-end chat controller (classic script entry point, main file).
 *
 * Creates the shared controller object (ctrl) that carries the module
 * dependencies and mutable state, assembles the five feature part files
 * onto it, wires the DOM events, and runs the boot sequence.
 *
 * Part files (load before this file, in order):
 *   - composer.js:     typing indicator, hints, send-button state
 *   - language.js:     applyLanguage, selectLanguage, showPicker
 *   - conversation.js: startConversation, exit flow, sendMessage
 *   - menu.js:         menu popover keyboard/pointer behavior
 *   - sound.js:        sound toggle sync, attention nudge, autoplay
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

  // Shared controller object: every part file binds its functions to this
  // object, so cross-part calls resolve through ctrl at call time.
  const ctrl = {
    UI,
    el,
    st,
    DaryaResponseEngine,
    DaryaOverlays,
    DaryaExport,
    DaryaLogger,
    DaryaAmbient,
    DaryaAmbientSound,
    DaryaLang,

    MIN_REPLY_DELAY_MS: 1500,
    MAX_REPLY_DELAY_MS: 2300,

    /** Delay before the picker sound toggle draws attention (ms). */
    SOUND_ATTENTION_DELAY_MS: 3000,

    /** Proactive idle opener delay range (ms): Darya speaks first after
     * the greeting if the user stays silent. Randomized per conversation
     * so it never feels scripted. */
    IDLE_OPENER_MIN_MS: 8000,
    IDLE_OPENER_MAX_MS: 20000,

    /** @type {number|null} Handle for the pending sound-attention timer. */
    soundAttentionTimer: null,

    /** @type {number} Index of the focused menu item in the popover. */
    menuFocusIndex: 0,

    /** True once a blocked-autoplay toast has been shown this session. */
    soundBlockedToastShown: false
  };

  Object.assign(
    ctrl,
    global.DaryaAppComposer.create(ctrl),
    global.DaryaAppLanguage.create(ctrl),
    global.DaryaAppConversation.create(ctrl),
    global.DaryaAppMenu.create(ctrl),
    global.DaryaAppSound.create(ctrl)
  );

  // ========================================================================
  // Event wiring
  // ========================================================================

  el.pickerFa.addEventListener('click', function () {
    ctrl.selectLanguage(DaryaLang.fa);
  });
  el.pickerEn.addEventListener('click', function () {
    ctrl.selectLanguage(DaryaLang.en);
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
    ctrl.sendMessage(text);
  });

  el.input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      el.composer.requestSubmit();
    }
  });

  el.input.addEventListener('input', function () {
    // Typing counts as engagement: the proactive idle opener no longer
    // needs to break the silence.
    ctrl.clearIdleOpener();
    ctrl.refreshComposerState();
  });
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
    ctrl.toggleMenu();
  });

  el.menuPopover.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      ctrl.moveMenuFocus(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      ctrl.moveMenuFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      ctrl.menuFocusIndex = 0;
      var items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      if (items[0]) {
        items[0].focus();
      }
    } else if (event.key === 'End') {
      event.preventDefault();
      items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      ctrl.menuFocusIndex = items.length - 1;
      var lastItem = items[items.length - 1];
      if (lastItem) {
        lastItem.focus();
      }
    } else if (event.key === 'Tab') {
      // WAI-ARIA menu-button pattern: Tab leaves the menu, closes it,
      // and continues the page tab order from just after the trigger.
      event.preventDefault();
      ctrl.closeMenu();
      ctrl.focusMenuTriggerSibling(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      ctrl.closeMenu(true);
    }
  });

  document.addEventListener('click', function (event) {
    if (
      !el.menuPopover.hidden &&
      !el.menuPopover.contains(event.target) &&
      event.target !== el.menuTrigger
    ) {
      ctrl.closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !el.menuPopover.hidden) {
      ctrl.closeMenu(true);
    }
  });

  el.menuNewChat.addEventListener('click', function () {
    ctrl.closeMenu();
    if (st.chatActive) {
      DaryaOverlays.showNewChatConfirm(ctrl.showPicker);
    } else {
      DaryaOverlays.dismissNewChatConfirm();
      ctrl.showPicker();
    }
  });

  el.menuExportTxt.addEventListener('click', function () {
    DaryaExport.exportPlainText();
    // Return focus to the trigger (WAI-ARIA menu-button pattern); the
    // download itself needs no focus target of its own.
    ctrl.closeMenu(true);
  });

  el.menuThemeToggle.addEventListener('click', function () {
    UI.theme.applyTheme(el.menuThemeToggle.dataset.themeChoice);
    ctrl.closeMenu(true);
  });

  if (el.breatheTrigger) {
    el.breatheTrigger.addEventListener('click', function () {
      DaryaOverlays.showBreatheExercise();
    });
  }

  if (el.exitConfirmYes) {
    el.exitConfirmYes.addEventListener('click', ctrl.confirmExitYes);
    el.exitConfirmYes.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctrl.confirmExitYes();
      }
    });
  }
  if (el.exitConfirmNo) {
    el.exitConfirmNo.addEventListener('click', ctrl.confirmExitNo);
    el.exitConfirmNo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctrl.confirmExitNo();
      }
    });
  }
  if (el.exitConfirmBar) {
    // Escape cancels the pending farewell, mirroring the cancel button.
    el.exitConfirmBar.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        ctrl.confirmExitNo();
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
  // Sound toggle event wiring (menu + picker)
  // ========================================================================

  if (el.menuSoundToggle) {
    el.menuSoundToggle.addEventListener('click', function () {
      DaryaAmbientSound.toggle().then(function () {
        // Settle the toggle to the state the audio system actually
        // reached: a blocked or failed start shows "off", never a
        // silent "on".
        ctrl.syncSoundToggleUI(DaryaAmbientSound.isPlaying());
        ctrl.closeMenu(true);
      });
    });
  }

  if (el.pickerSoundToggle) {
    el.pickerSoundToggle.addEventListener('click', function () {
      // The tap is the gesture that starts the sound: stop the nudge.
      ctrl.clearSoundAttention();
      DaryaAmbientSound.toggle().then(function () {
        ctrl.syncSoundToggleUI(DaryaAmbientSound.isPlaying());
      });
    });
  }

  // When the tab returns to the foreground, the ambient-sound module may
  // have started playback on its own (its visibility handler retries
  // autoplay). If sound is genuinely playing now, the picker nudge has
  // served its purpose and must not keep pulsing over a live sound.
  document.addEventListener('visibilitychange', function () {
    if (
      !document.hidden &&
      typeof DaryaAmbientSound !== 'undefined' &&
      DaryaAmbientSound.isPlaying()
    ) {
      ctrl.clearSoundAttention();
    }
  });

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

  // Initialize both sound toggles from the ACTUAL playback state, not
  // the saved preference. At boot nothing can be playing yet (browsers
  // block audible autoplay until the user has interacted with the page;
  // see the MDN autoplay guide), so the toggles start honestly "off"
  // even when the user previously enabled sound. The saved preference
  // is still honored by the first-gesture autoplay retry and by the
  // picker attention nudge, which invites the tap that starts it.
  if (el.pickerSoundToggle && typeof DaryaAmbientSound !== 'undefined') {
    ctrl.syncSoundToggleUI(DaryaAmbientSound.isPlaying());
  }

  // The welcome screen is shown first: if the saved preference wants
  // sound but the browser has not allowed autoplay yet, nudge the user
  // toward the toggle after a short delay.
  ctrl.armSoundAttention();

  ctrl.initAutoplayGesture();

  // The menu sound toggle starts honest: the HTML default is "off" and
  // nothing is playing yet (browsers require a user gesture before audio
  // can start). The first interaction re-syncs the toggle from the
  // actual playback result via autoplayIfEnabled().then(...).
})(typeof window !== 'undefined' ? window : globalThis);
