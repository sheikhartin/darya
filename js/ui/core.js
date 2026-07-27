/**
 * Darya UI shared core: DOM element references, shared state variables,
 * theme/cookie utilities, formatting helpers, scroll management, and
 * message rendering. Loaded first among UI modules -- other modules
 * read shared state from `window.DaryaUI`.
 *
 * This module does not own any event wiring or conversation flow; those
 * concerns stay in app.js.
 */
(function (global) {
  'use strict';

  // ========================================================================
  // DOM element references
  // ========================================================================

  const elements = {
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
    menuExportMd: document.getElementById('menu-export-md'),
    menuExportMdLabel: document.getElementById('menu-export-md-label'),
    menuExportTxt: document.getElementById('menu-export-txt'),
    menuExportTxtLabel: document.getElementById('menu-export-txt-label'),
    menuThemeToggle: document.getElementById('menu-theme-toggle'),
    menuThemeIcon: document.getElementById('menu-theme-icon'),
    menuThemeLabel: document.getElementById('menu-theme-label'),

    breatheTrigger: document.getElementById('breathe-trigger'),
    exitConfirmBar: document.getElementById('exit-confirm-bar'),
    exitConfirmLabel: document.getElementById('exit-confirm-label'),
    exitConfirmYes: document.getElementById('exit-confirm-yes'),
    exitConfirmNo: document.getElementById('exit-confirm-no'),
  };

  // ========================================================================
  // Shared state
  // ========================================================================

  const state = {
    /** @type {object|null} Active language pack. */
    lang: null,
    /** @type {object|null} Active DaryaResponseEngine instance. */
    engine: null,
    /** @type {boolean} True after farewell. */
    conversationEnded: false,
    /** @type {boolean} True while Darya is "thinking". */
    waitingForReply: false,
    /** @type {boolean} True when exit is pending user confirmation. */
    pendingExit: false,
    /** @type {boolean} Prevents double-confirmation of exit. */
    exitConfirmBusy: false,
    /** @type {boolean} True when a conversation is actually in progress. */
    chatActive: false,
    /** @type {number} Monotonic counter to invalidate stale async replies. */
    conversationGeneration: 0,
    /** @type {Array} Conversation transcript. */
    transcript: [],
    /** @type {number} Message counter for unique DOM ids. */
    messageCount: 0,
    /** @type {string} Current page title. */
    currentTitle: '',
  };

  // ========================================================================
  // Cookie helpers
  // ========================================================================

  const THEME_COOKIE_NAME = 'darya_theme';
  const THEME_COOKIE_MAX_AGE_DAYS = 365;
  const DEFAULT_THEME = 'ocean';

  function getCookie(name) {
    try {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      return null;
    }
  }

  function setCookie(name, value, days) {
    try {
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (error) {
      // Best-effort only; theme still works per-tab.
    }
  }

  function isTouchDevice() {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches;
  }

  function focusInputUnlessTouch() {
    if (!isTouchDevice() && elements.input) {
      elements.input.focus();
    }
  }

  // ========================================================================
  // Theme
  // ========================================================================

  function updateThemeMenuItem() {
    if (!state.lang) return;
    const current = elements.htmlRoot.getAttribute('data-theme') || DEFAULT_THEME;
    const target = current === 'ocean' ? 'beach' : 'ocean';
    elements.menuThemeIcon.textContent = target === 'ocean' ? '\u{1F30A}' : '\u{1F3D6}\uFE0F';
    elements.menuThemeLabel.textContent = target === 'ocean'
      ? state.lang.ui.themeOceanLabel : state.lang.ui.themeBeachLabel;
    elements.menuThemeToggle.dataset.themeChoice = target;
    const themeTitle = target === 'ocean'
      ? state.lang.ui.themeOceanTitle : state.lang.ui.themeBeachTitle;
    elements.menuThemeToggle.setAttribute('title', themeTitle);
    elements.menuThemeLabel.setAttribute('title', themeTitle);
  }

  function applyTheme(theme) {
    const safeTheme = theme === 'beach' ? 'beach' : 'ocean';
    const current = elements.htmlRoot.getAttribute('data-theme') || DEFAULT_THEME;
    const isInitialLoad = !current || current === safeTheme;
    if (safeTheme === current) {
      elements.themeToggleButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.themeChoice === safeTheme));
      });
      updateThemeMenuItem();
      return;
    }

    const applySwitch = () => {
      elements.htmlRoot.setAttribute('data-theme', safeTheme);
      elements.themeToggleButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.themeChoice === safeTheme));
      });
      updateThemeMenuItem();
    };

    if (!isInitialLoad && typeof document.startViewTransition === 'function') {
      try { document.startViewTransition(applySwitch); } catch (e) { applySwitch(); }
    } else {
      applySwitch();
    }

    setCookie(THEME_COOKIE_NAME, safeTheme, THEME_COOKIE_MAX_AGE_DAYS);
    try { localStorage.setItem(THEME_COOKIE_NAME, safeTheme); } catch (e) { /* ignore */ }
  }

  // ========================================================================
  // Formatting helpers
  // ========================================================================

  const PERSIAN_DIGITS = ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4',
    '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9'];

  function formatTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const stamp = `${hours}:${minutes}`;
    if (!state.lang || state.lang.code !== 'fa') return stamp;
    return stamp.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
  }

  function hasForeignLetters(text) {
    if (!state.lang) return false;
    for (const char of text) {
      if (/\p{L}/u.test(char) && !state.lang.scriptRange.test(char)) {
        return true;
      }
    }
    return false;
  }

  // ========================================================================
  // Scroll management
  // ========================================================================

  const SESSION_KEY = 'darya_scroll_pos';

  function saveScrollPosition() {
    try {
      if (state.chatActive && elements.chat) {
        sessionStorage.setItem(SESSION_KEY, String(elements.chat.scrollTop));
      }
    } catch (e) { /* sessionStorage may be unavailable */ }
  }

  function restoreScrollPosition() {
    try {
      const pos = sessionStorage.getItem(SESSION_KEY);
      if (pos !== null && elements.chat) {
        requestAnimationFrame(() => {
          elements.chat.scrollTop = Number(pos);
        });
      }
    } catch (e) { /* ignore */ }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      elements.chat.scrollTop = elements.chat.scrollHeight;
    });
  }

  // ========================================================================
  // Message rendering
  // ========================================================================

  function appendMessage(sender, text) {
    const time = formatTimestamp();
    const msgId = `msg-${state.messageCount}`;
    state.transcript.push({ sender, text, time });
    state.messageCount += 1;

    const row = document.createElement('div');
    row.className = `bubble-row bubble-row--${sender}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'bubble-wrap';
    wrapper.id = msgId;

    const bubble = document.createElement('div');
    bubble.className = `bubble bubble--${sender}`;
    bubble.textContent = text;

    const meta = document.createElement('div');
    meta.className = 'bubble-meta';
    meta.textContent = time;

    wrapper.appendChild(bubble);
    wrapper.appendChild(meta);
    saveScrollPosition();
    row.appendChild(wrapper);
    elements.chat.appendChild(row);
    scrollToBottom();
  }

  // ========================================================================
  // Public API
  // ========================================================================

  global.DaryaUI = {
    elements,
    state,
    constants: {
      THEME_COOKIE_NAME,
      THEME_COOKIE_MAX_AGE_DAYS,
      DEFAULT_THEME,
      SESSION_KEY,
    },
    theme: {
      applyTheme,
      updateThemeMenuItem,
      getCookie,
      setCookie,
    },
    utils: {
      isTouchDevice,
      focusInputUnlessTouch,
      formatTimestamp,
      hasForeignLetters,
      saveScrollPosition,
      restoreScrollPosition,
      scrollToBottom,
      appendMessage,
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
