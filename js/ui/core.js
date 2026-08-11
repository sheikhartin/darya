/**
 * Darya - core UI state and shared elements.
 * Owns the shared state object (st), element lookups, and UI helpers that
 * the other ui modules and app controllers depend on. Classic script version.
 */

(function (global) {
  'use strict';

  // ========================================================================
  // DOM element references
  // ========================================================================

  var elements = {
    htmlRoot: document.getElementById('html-root'),
    pageTitle: document.getElementById('page-title'),
    pageDescription: document.getElementById('page-description'),

    picker: document.getElementById('picker'),
    pickerFa: document.getElementById('picker-fa'),
    pickerEn: document.getElementById('picker-en'),
    pickerLangLock: document.getElementById('picker-lang-lock'),
    themeToggleButtons: document.querySelectorAll('[data-theme-choice]'),
    themePicker: document.getElementById('theme-picker'),

    app: document.getElementById('app'),
    headerTitle: document.getElementById('header-title'),
    chat: document.getElementById('chat'),
    typingRow: document.getElementById('typing-row'),
    hint: document.getElementById('input-hint'),
    composer: document.getElementById('composer'),
    input: document.getElementById('composer-input'),
    sendButton: document.getElementById('composer-send'),
    disclaimer: document.getElementById('disclaimer-text'),
    typingStatus: document.getElementById('typing-row'),

    menuTrigger: document.getElementById('menu-trigger'),
    menuPopover: document.getElementById('menu-popover'),
    menuNewChat: document.getElementById('menu-new-chat'),
    menuNewChatLabel: document.getElementById('menu-new-chat-label'),
    menuExportTxt: document.getElementById('menu-export-txt'),
    menuExportTxtLabel: document.getElementById('menu-export-txt-label'),
    menuThemeToggle: document.getElementById('menu-theme-toggle'),
    menuThemeLabel: document.getElementById('menu-theme-label'),

    menuSoundToggle: document.getElementById('menu-sound-toggle'),
    menuSoundLabel: document.getElementById('menu-sound-label'),
    pickerSoundToggle: document.getElementById('picker-sound-toggle'),
    breatheTrigger: document.getElementById('breathe-trigger'),
    exitConfirmBar: document.getElementById('exit-confirm-bar'),
    exitConfirmLabel: document.getElementById('exit-confirm-label'),
    exitConfirmYes: document.getElementById('exit-confirm-yes'),
    exitConfirmNo: document.getElementById('exit-confirm-no')
  };

  // ========================================================================
  // Shared state
  // ========================================================================

  var state = {
    /** @type {object|null} Active language pack (DaryaLang.en or DaryaLang.fa). */
    lang: null,
    /** @type {object|null} Active DaryaResponseEngine instance. */
    engine: null,
    /** @type {boolean} True after farewell, preventing new messages. */
    conversationEnded: false,
    /** @type {boolean} True while Darya is generating a reply. */
    waitingForReply: false,
    /** @type {boolean} True when exit is pending user confirmation. */
    pendingExit: false,
    /** @type {boolean} Prevents double-confirmation of exit. */
    exitConfirmBusy: false,
    /** @type {boolean} True once an exit confirmation has been shown this
     * conversation. A second farewell command ("بدرود" then "بای") then
     * goes straight to goodbye instead of asking again: the user has
     * already been asked once, and re-asking reads as Darya not letting
     * them leave (a real-transcript complaint). Reset when the user
     * cancels the exit or starts a new chat. */
    exitConfirmShown: false,
    /** @type {boolean} True when a conversation is actually in progress. */
    chatActive: false,
    /** @type {number} Monotonic counter to invalidate stale async replies. */
    conversationGeneration: 0,
    /** @type {Array} Conversation transcript entries. */
    transcript: [],
    /** @type {number} Message counter for unique DOM ids. */
    messageCount: 0,
    /** @type {string} Current page title. */
    currentTitle: '',
    /** @type {boolean} True while the proactive idle opener is armed. */
    idleOpenerPending: false,
    /** @type {number|null} Handle for the pending idle-opener timer. */
    idleOpenerTimer: null,
    /** @type {boolean} True once the user has sent their first message.
     * The idle opener only speaks while this is false; it never
     * interrupts an engaged user. (messageCount cannot serve this
     * purpose because it counts the greeting too.) */
    userSpoke: false
  };

  // ========================================================================
  // Cookie helpers
  // ========================================================================

  /** Name of the cookie used to persist the selected theme. */
  var THEME_COOKIE_NAME = 'darya_theme';
  /** Number of days until the theme cookie expires. */
  var THEME_COOKIE_MAX_AGE_DAYS = 365;
  /** Default theme applied when no stored preference is found. */
  var DEFAULT_THEME = 'ocean';

  /**
   * Reads a cookie value by name. Returns null if the cookie is not found
   * or if cookies are inaccessible (e.g. in sandboxed iframes).
   * @param {string} name
   * @returns {string|null}
   */
  function getCookie(name) {
    try {
      var match = document.cookie.match(
        new RegExp('(?:^|; )' + name + '=([^;]*)')
      );
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      // document.cookie may throw in some restrictive environments
      return null;
    }
  }

  /**
   * Sets a cookie with the given name, value, and max-age in days.
   * Best-effort only; failures are silently ignored so that the app
   * still works per-session even if cookies are blocked.
   * @param {string} name
   * @param {string} value
   * @param {number} days
   */
  function setCookie(name, value, days) {
    try {
      var expires = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      ).toUTCString();
      document.cookie =
        name +
        '=' +
        encodeURIComponent(value) +
        '; expires=' +
        expires +
        '; path=/; SameSite=Lax';
    } catch (error) {
      // Best-effort only; theme still works per-tab.
    }
  }

  /**
   * Returns true if the device has a coarse pointer (touch primary input),
   * which implies an on-screen keyboard rather than a physical one.
   * Used to avoid auto-focusing the text input on touch devices, where
   * it would trigger the on-screen keyboard over the picker.
   * @returns {boolean}
   */
  function isTouchDevice() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  /**
   * Focuses the composer input, unless the device uses touch input
   * (where focusing an input would immediately show the virtual keyboard).
   */
  function focusInputUnlessTouch() {
    if (!isTouchDevice() && elements.input) {
      elements.input.focus();
    }
  }

  // ========================================================================
  // Theme
  // ========================================================================

  /**
   * Updates the theme toggle menu item to show the opposite theme.
   * For example, if the current theme is 'ocean', the menu item shows
   * 'Switch to beach theme' with the beach icon. Called automatically
   * whenever the theme changes.
   */
  function updateThemeMenuItem() {
    if (!state.lang) {
      return;
    }
    var current = elements.htmlRoot.getAttribute('data-theme') || DEFAULT_THEME;
    var target = current === 'ocean' ? 'beach' : 'ocean';

    // The menu icon is CSS-driven: html[data-theme] reveals the opposite
    // theme's glyph (ocean waves or beach sun), so only the label swaps.
    elements.menuThemeLabel.textContent =
      target === 'ocean'
        ? state.lang.ui.themeOceanLabel
        : state.lang.ui.themeBeachLabel;

    elements.menuThemeToggle.dataset.themeChoice = target;
    var themeTitle =
      target === 'ocean'
        ? state.lang.ui.themeOceanTitle
        : state.lang.ui.themeBeachTitle;
    elements.menuThemeToggle.setAttribute('title', themeTitle);
    elements.menuThemeLabel.setAttribute('title', themeTitle);
  }

  /**
   * Applies the given theme ('ocean' or 'beach') to the application.
   * Updates the data-theme attribute on <html>, aria-pressed on toggle
   * buttons, the menu item, and persists the choice to cookie + localStorage.
   *
   * If the theme is already active, this is a no-op (only updates
   * accessibility states to ensure consistency).
   *
   * Supports the View Transition API for smooth animated theme changes
   * when available and this is not the initial load.
   * @param {string} theme - 'ocean' or 'beach'
   */
  function applyTheme(theme) {
    var safeTheme = theme === 'beach' ? 'beach' : 'ocean';
    var current = elements.htmlRoot.getAttribute('data-theme') || DEFAULT_THEME;

    if (safeTheme === current) {
      // Theme hasn't changed, but still update aria-pressed for consistency
      elements.themeToggleButtons.forEach(function (button) {
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.themeChoice === safeTheme)
        );
      });
      updateThemeMenuItem();
      return;
    }

    var applySwitch = function () {
      elements.htmlRoot.setAttribute('data-theme', safeTheme);
      elements.themeToggleButtons.forEach(function (button) {
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.themeChoice === safeTheme)
        );
      });
      updateThemeMenuItem();
    };

    // Use the View Transition API for smooth animated theme changes when
    // it is available; fall back to a direct switch otherwise.
    if (typeof document.startViewTransition === 'function') {
      try {
        document.startViewTransition(applySwitch);
      } catch (e) {
        applySwitch();
      }
    } else {
      applySwitch();
    }

    // Persist the theme preference
    setCookie(THEME_COOKIE_NAME, safeTheme, THEME_COOKIE_MAX_AGE_DAYS);
    try {
      localStorage.setItem(THEME_COOKIE_NAME, safeTheme);
    } catch (e) {
      // localStorage may be disabled or full; theme still works per-session
    }

    // Notify the ambient sound system so it crossfades to the new theme
    if (typeof global.DaryaAmbientSound !== 'undefined') {
      global.DaryaAmbientSound.onThemeChange(safeTheme);
    }
  }

  // ========================================================================
  // Formatting helpers
  // ========================================================================

  /** Persian (Eastern Arabic) digit characters for number localization. */
  var PERSIAN_DIGITS = [
    '\u06F0',
    '\u06F1',
    '\u06F2',
    '\u06F3',
    '\u06F4',
    '\u06F5',
    '\u06F6',
    '\u06F7',
    '\u06F8',
    '\u06F9'
  ];

  /**
   * Returns a localized HH:MM timestamp suitable for the chat bubble meta.
   * For Persian language, uses Persian (Eastern Arabic) digits.
   * @returns {string}
   */
  function formatTimestamp() {
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var stamp = hours + ':' + minutes;
    if (!state.lang || state.lang.code !== 'fa') {
      return stamp;
    }
    return stamp.replace(/[0-9]/g, function (digit) {
      return PERSIAN_DIGITS[Number(digit)];
    });
  }

  /**
   * Checks whether the given text contains characters from a foreign script
   * (i.e. characters outside the active language's defined script range).
   * Used to detect mixed-language input and show a validation hint.
   * @param {string} text
   * @returns {boolean}
   */
  function hasForeignLetters(text) {
    if (!state.lang) {
      return false;
    }
    for (var ci = 0; ci < text.length; ci += 1) {
      var char = text[ci];
      if (/\p{L}/u.test(char) && !state.lang.scriptRange.test(char)) {
        return true;
      }
    }
    return false;
  }

  // ========================================================================
  // Scroll management
  // ========================================================================

  /** Session storage key for persisting scroll position across page reloads. */
  var SESSION_KEY = 'darya_scroll_pos';

  /**
   * Saves the current scroll position of the chat container to sessionStorage.
   * Best-effort only; failures are silently ignored.
   */
  function saveScrollPosition() {
    try {
      if (state.chatActive && elements.chat) {
        sessionStorage.setItem(SESSION_KEY, String(elements.chat.scrollTop));
      }
    } catch (e) {
      // sessionStorage may be disabled or full
    }
  }

  /**
   * Restores a previously saved scroll position, if one exists.
   * Uses requestAnimationFrame to wait for DOM layout to settle.
   */
  function restoreScrollPosition() {
    try {
      var pos = sessionStorage.getItem(SESSION_KEY);
      if (pos !== null && elements.chat) {
        requestAnimationFrame(function () {
          elements.chat.scrollTop = Number(pos);
        });
      }
    } catch (e) {
      // sessionStorage may be disabled
    }
  }

  /**
   * Scrolls the chat container to the bottom, revealing the latest message.
   * Uses requestAnimationFrame to wait for the DOM to update first.
   */
  function scrollToBottom() {
    requestAnimationFrame(function () {
      if (elements.chat) {
        elements.chat.scrollTop = elements.chat.scrollHeight;
      }
    });
  }

  // ========================================================================
  // Message rendering
  // ========================================================================

  /**
   * Appends a message bubble to the chat container with the given sender
   * and text content. The message is timestamped and added to the internal
   * transcript array. A user message also clears any quick-reply chips
   * from the previous turn: typing (or tapping a chip) dismisses them.
   * @param {string} sender - 'user' or 'bot'
   * @param {string} text - Message text content
   */
  function appendMessage(sender, text) {
    var time = formatTimestamp();
    var msgId = 'msg-' + state.messageCount;
    state.transcript.push({ sender: sender, text: text, time: time });
    state.messageCount += 1;

    if (sender === 'user') {
      clearQuickReplies();
    }

    var row = document.createElement('div');
    row.className = 'bubble-row bubble-row--' + sender;

    var wrapper = document.createElement('div');
    wrapper.className = 'bubble-wrap';
    wrapper.id = msgId;

    var bubble = document.createElement('div');
    bubble.className = 'bubble bubble--' + sender;
    bubble.textContent = text;
    // The page root stays RTL regardless of the active language (so the
    // picker layout never shifts), so each bubble declares its own text
    // direction: English bubbles lay out LTR while Persian ones stay RTL.
    if (state.lang) {
      bubble.dir = state.lang.dir;
      bubble.lang = state.lang.code;
    }

    var meta = document.createElement('div');
    meta.className = 'bubble-meta';
    meta.textContent = time;

    wrapper.appendChild(bubble);
    wrapper.appendChild(meta);
    saveScrollPosition();
    row.appendChild(wrapper);
    elements.chat.appendChild(row);
    scrollToBottom();
  }

  /**
   * Removes any quick-reply chip row from the chat. Safe to call when
   * none exists.
   */
  function clearQuickReplies() {
    if (elements.chat) {
      var old = elements.chat.querySelector('.quick-replies');
      if (old) {
        old.remove();
      }
    }
  }

  /**
   * Renders tappable quick-reply chips after the latest bot message
   * (exercise yes/no answers, mood scale ratings). Each chip is a real
   * button with a 44px hit target; tapping it calls the provided pick
   * callback with the chip's label, which the app routes through
   * sendMessage so the engine sees it as a normal user turn. A stale
   * chip row from a previous turn is removed first.
   * @param {string[]} chips - Labels to render
   * @param {function(string): void} onPick - Called with the chosen label
   */
  function renderQuickReplies(chips, onPick) {
    clearQuickReplies();
    if (!elements.chat || !chips || chips.length === 0) {
      return;
    }
    var row = document.createElement('div');
    row.className = 'quick-replies';
    var groupLabel =
      state.lang && state.lang.ui
        ? state.lang.ui.quickRepliesLabel
        : 'Quick replies';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', groupLabel);
    chips.forEach(function (label) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-reply';
      chip.textContent = label;
      chip.addEventListener('click', function () {
        onPick(label);
      });
      row.appendChild(chip);
    });
    elements.chat.appendChild(row);
    scrollToBottom();
  }

  const DaryaUI = {
    elements: elements,
    state: state,
    constants: {
      THEME_COOKIE_NAME: THEME_COOKIE_NAME,
      THEME_COOKIE_MAX_AGE_DAYS: THEME_COOKIE_MAX_AGE_DAYS,
      DEFAULT_THEME: DEFAULT_THEME,
      SESSION_KEY: SESSION_KEY
    },
    theme: {
      applyTheme: applyTheme,
      updateThemeMenuItem: updateThemeMenuItem,
      getCookie: getCookie,
      setCookie: setCookie
    },
    utils: {
      isTouchDevice: isTouchDevice,
      focusInputUnlessTouch: focusInputUnlessTouch,
      formatTimestamp: formatTimestamp,
      hasForeignLetters: hasForeignLetters,
      saveScrollPosition: saveScrollPosition,
      restoreScrollPosition: restoreScrollPosition,
      scrollToBottom: scrollToBottom,
      appendMessage: appendMessage,
      clearQuickReplies: clearQuickReplies,
      renderQuickReplies: renderQuickReplies
    }
  };

  global.DaryaUI = DaryaUI;
})(typeof window !== 'undefined' ? window : globalThis);
