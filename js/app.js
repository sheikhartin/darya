/**
 * Darya - front-end chat controller for the static (GitHub Pages) build.
 * Runs entirely client-side against `window.DaryaEngine` and the active
 * `window.DaryaLang` pack (fa or en).
 *
 * Flow:
 *   1. A language picker is shown first. Nothing else is initialized
 *      until a language is chosen.
 *   2. Once chosen, the whole page (dir, lang, fonts, every UI string)
 *      switches to that language, an engine is created with the matching
 *      language pack, and Darya speaks first after a short delay.
 *   3. The language is then locked for the rest of the conversation --
 *      "New chat" in the menu returns to the picker rather than silently
 *      reusing the previous language, since starting a new chat is
 *      explicitly the only way to switch languages.
 *
 * See js/darya-engine.js for the conversation engine itself and
 * js/languages/{fa,en}.js for all language-specific content.
 */

(() => {
  'use strict';

  const { DaryaResponseEngine } = window.DaryaEngine;

  // Every one of Darya's replies (including the opening greeting) is
  // delayed by a fresh random amount in this range. Short enough that the
  // conversation never feels sluggish, long enough to still read as a
  // real reply rather than an instant lookup.
  const MIN_REPLY_DELAY_MS = 1500;
  const MAX_REPLY_DELAY_MS = 2300;

  const htmlRootEl = document.getElementById('html-root');
  const pageTitleEl = document.getElementById('page-title');
  const pageDescriptionEl = document.getElementById('page-description');

  const pickerEl = document.getElementById('picker');
  const pickerFaEl = document.getElementById('picker-fa');
  const pickerEnEl = document.getElementById('picker-en');
  const themeToggleButtons = document.querySelectorAll('[data-theme-choice]');
  const themePickerEl = document.getElementById('theme-picker');

  const appEl = document.getElementById('app');
  const headerTitleEl = document.getElementById('header-title');
  const chatEl = document.getElementById('chat');
  const typingRowEl = document.getElementById('typing-row');
  const hintEl = document.getElementById('input-hint');
  const composerEl = document.getElementById('composer');
  const inputEl = document.getElementById('composer-input');
  const sendButtonEl = document.getElementById('composer-send');
  const disclaimerEl = document.getElementById('disclaimer-text');
  const typingStatusEl = document.getElementById('typing-row');

  const menuTriggerEl = document.getElementById('menu-trigger');
  const menuPopoverEl = document.getElementById('menu-popover');
  const menuItemElements = [...menuPopoverEl.querySelectorAll('[role="menuitem"]')];
  let menuFocusIndex = 0;
  const menuNewChatEl = document.getElementById('menu-new-chat');
  const menuNewChatLabelEl = document.getElementById('menu-new-chat-label');
  const menuExportMdEl = document.getElementById('menu-export-md');
  const menuExportMdLabelEl = document.getElementById('menu-export-md-label');
  const menuExportTxtEl = document.getElementById('menu-export-txt');
  const menuExportTxtLabelEl = document.getElementById('menu-export-txt-label');
  const menuThemeToggleEl = document.getElementById('menu-theme-toggle');
  const menuThemeIconEl = document.getElementById('menu-theme-icon');
  const menuThemeLabelEl = document.getElementById('menu-theme-label');
  const breatheTriggerEl = document.getElementById('breathe-trigger');
  const pickerLangLockEl = document.getElementById('picker-lang-lock');

  // --- Cookie helpers (used only for the persisted theme preference) -------

  const THEME_COOKIE_NAME = 'darya_theme';
  const THEME_COOKIE_MAX_AGE_DAYS = 365;
  const DEFAULT_THEME = 'ocean';

  /**
   * Reads a cookie value by name.
   * @param {string} name
   * @returns {string|null}
   */
  function getCookie(name) {
    try {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Writes a cookie that persists across visits (used only for the theme
   * preference; no conversation content or personal data is ever stored).
   * @param {string} name
   * @param {string} value
   * @param {number} days
   */
  function setCookie(name, value, days) {
    try {
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (error) {
      // Cookie access can be blocked in private or embedded contexts. Theme
      // selection still works for this tab; persistence is best effort.
    }
  }

  /**
   * True on touch/coarse-pointer devices (phones, tablets). Used to skip
   * programmatic auto-focus of the message input: calling `.focus()` on
   * mobile reliably pops the virtual keyboard open, which is intrusive
   * right after a reply arrives. On mice/trackpads, auto-focus keeps the
   * cursor ready to type, same as before.
   * @returns {boolean}
   */
  function isTouchDevice() {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches;
  }

  /** Focuses the message input, but only on non-touch (mouse/trackpad) devices. */
  function focusInputUnlessTouch() {
    if (!isTouchDevice()) {
      inputEl.focus();
    }
  }

  // --- Theme -----------------------------------------------------------------

  /**
   * Applies a visual theme ("ocean" or "beach") by setting it as a
   * `data-theme` attribute on the root element; every theme-dependent
   * color and animation is defined in CSS against that attribute. Also
   * persists the choice in a cookie (and localStorage as fallback) so it
   * is remembered on the next visit (unlike language, which intentionally
   * resets every time).
   *
   * The theme switches instantly with no overlay or fade. The body's CSS
   * transition on `background` provides a subtle, graceful color morph
   * between the old and new gradient, while content elements (bubbles,
   * beach scene) snap cleanly with no intermediate overlap.
   * @param {'ocean'|'beach'} theme
   */
  function applyTheme(theme) {
    const safeTheme = theme === 'beach' ? 'beach' : 'ocean';
    const current = htmlRootEl.getAttribute('data-theme') || DEFAULT_THEME;
    const isInitialLoad = !current || current === safeTheme;
    if (safeTheme === current) {
      // Even if the theme is already set, sync the picker aria-pressed
      // states so they reflect the correct saved theme on initial load.
      themeToggleButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.themeChoice === safeTheme));
      });
      updateThemeMenuItem();
      return;
    }

    // Use View Transitions API for a smooth crossfade when available.
    // Falls back to a simple attribute swap with CSS transitions.
    const applySwitch = () => {
      htmlRootEl.setAttribute('data-theme', safeTheme);
      themeToggleButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.themeChoice === safeTheme));
      });
      updateThemeMenuItem();
    };

    if (!isInitialLoad && typeof document.startViewTransition === 'function') {
      try {
        document.startViewTransition(applySwitch);
      } catch (e) {
        applySwitch();
      }
    } else {
      applySwitch();
    }

    // Persist the choice in both cookie and localStorage for robustness.
    setCookie(THEME_COOKIE_NAME, safeTheme, THEME_COOKIE_MAX_AGE_DAYS);
    try { localStorage.setItem(THEME_COOKIE_NAME, safeTheme); } catch (e) { /* ignore */ }
  }

  /**
   * Updates the in-chat menu's theme item to describe the *other* theme
   * (the one clicking it would switch to), matching how "New chat" and
   * the export items read as destinations rather than current state.
   * No-ops before a language has been chosen, since the menu isn't
   * visible yet at that point.
   */
  function updateThemeMenuItem() {
    if (!lang) return;
    const current = htmlRootEl.getAttribute('data-theme') || DEFAULT_THEME;
    const target = current === 'ocean' ? 'beach' : 'ocean';
    menuThemeIconEl.textContent = target === 'ocean' ? '🌊' : '🏖️';
    menuThemeLabelEl.textContent = target === 'ocean' ? lang.ui.themeOceanLabel : lang.ui.themeBeachLabel;
    menuThemeToggleEl.dataset.themeChoice = target;
    const themeTitle = target === 'ocean' ? lang.ui.themeOceanTitle : lang.ui.themeBeachTitle;
    menuThemeToggleEl.setAttribute('title', themeTitle);
    menuThemeLabelEl.setAttribute('title', themeTitle);
  }

  /** @type {object|null} The active language pack (window.DaryaLang.fa/en). */
  let lang = null;

  /** @type {InstanceType<typeof DaryaResponseEngine>|null} */
  let engine = null;

  /** @type {boolean} True once the conversation has ended (farewell said). */
  let conversationEnded = false;

  /** @type {boolean} True while Darya is "thinking" (delay in progress). */
  let waitingForReply = false;

  /**
   * True whenever a conversation is actually in progress (a language has
   * been chosen and the picker isn't showing). Used to gate the
   * refresh/close confirmation prompt below, so it never appears on the
   * picker screen itself, where there's nothing to lose.
   * @type {boolean}
   */
  let chatActive = false;

  /**
   * @typedef {{ sender: 'user'|'bot', text: string, time: string }} TranscriptEntry
   * @type {TranscriptEntry[]}
   */
  let transcript = [];

  // Invalidates delayed replies when New chat is chosen while Darya is
  // thinking, so an old response can never appear in the fresh conversation.
  let conversationGeneration = 0;

  // --- Timing / formatting helpers -----------------------------------------

  function randomReplyDelay() {
    return MIN_REPLY_DELAY_MS + Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS);
  }

  const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  /**
   * Formats the current time as a short HH:MM string, using Persian
   * digits for the Persian UI and ordinary digits for English.
   * @returns {string}
   */
  function formatTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const stamp = `${hours}:${minutes}`;
    if (lang.code !== 'fa') return stamp;
    return stamp.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
  }

  /**
   * Checks whether a message contains any alphabetic character outside
   * the active language's expected script. Digits, punctuation, and
   * emoji are always allowed. This mirrors the engine's own (more
   * tolerant) check, but fires immediately as the person types instead of
   * only once a whole sentence is judged.
   * @param {string} text
   * @returns {boolean}
   */
  function hasForeignLetters(text) {
    for (const char of text) {
      if (/\p{L}/u.test(char) && !lang.scriptRange.test(char)) {
        return true;
      }
    }
    return false;
  }

  // --- Rendering -------------------------------------------------------------

  let messageCount = 0;
  let currentTitle = '';
  const SESSION_KEY = 'darya_scroll_pos';

  function appendMessage(sender, text) {
    const time = formatTimestamp();
    const msgId = `msg-${messageCount}`;
    transcript.push({ sender, text, time });
    messageCount += 1;

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

    // Save scroll position before adding new content
    saveScrollPosition();

    row.appendChild(wrapper);
    chatEl.appendChild(row);

    scrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatEl.scrollTop = chatEl.scrollHeight;
    });
  }

  // --- Scroll memory ------------------------------------------------------

  function saveScrollPosition() {
    try {
      if (chatActive && chatEl) {
        sessionStorage.setItem(SESSION_KEY, String(chatEl.scrollTop));
      }
    } catch (e) { /* sessionStorage may be unavailable */ }
  }

  function restoreScrollPosition() {
    try {
      const pos = sessionStorage.getItem(SESSION_KEY);
      if (pos !== null && chatEl) {
        requestAnimationFrame(() => {
          chatEl.scrollTop = Number(pos);
        });
      }
    } catch (e) { /* ignore */ }
  }

  // --- Breathing exercise -------------------------------------------------
  // Uses box breathing (square breathing): 4 seconds in, 4 hold, 4 out, 4 hold.
  // This is a widely recognized pattern used by military, first responders,
  // and meditation practices. The countdown timer shows remaining seconds
  // so the user knows exactly how long each phase lasts.

  let breatheOverlay = null;
  let breatheCountdownTimer = null;

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
    if (breatheOverlay) return;

    breatheOverlay = document.createElement('div');
    breatheOverlay.className = 'breathe-overlay';
    breatheOverlay.setAttribute('role', 'dialog');
    breatheOverlay.setAttribute('aria-modal', 'true');
    breatheOverlay.setAttribute('aria-label', lang.ui.breatheTitle);

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
    closeBtn.textContent = lang.ui.breatheDismiss;
    closeBtn.addEventListener('click', dismissBreathe);

    container.appendChild(circle);
    container.appendChild(label);
    container.appendChild(countdown);
    container.appendChild(closeBtn);
    breatheOverlay.appendChild(container);

    // Click anywhere on overlay background to dismiss
    breatheOverlay.addEventListener('click', (e) => {
      if (e.target === breatheOverlay) dismissBreathe();
    });

    document.body.appendChild(breatheOverlay);

    // Box breathing: In -> Hold -> Out -> Hold (4 seconds each)
    const phases = [
      { action: 'breatheIn', circle: 'grow' },
      { action: 'breatheHoldIn', circle: 'grow' },
      { action: 'breatheOut', circle: 'shrink' },
      { action: 'breatheHoldOut', circle: 'shrink' },
    ];

    let phaseIndex = 0;
    let countdownValue = 4;

    function getPhaseLabel(action) {
      switch (action) {
        case 'breatheIn': return lang.ui.breatheIn;
        case 'breatheHoldIn': return lang.ui.breatheHold;
        case 'breatheOut': return lang.ui.breatheOut;
        case 'breatheHoldOut': return lang.ui.breatheHold;
        default: return '';
      }
    }

    function updateDisplay() {
      const phase = phases[phaseIndex];
      label.textContent = getPhaseLabel(phase.action);
      countdown.textContent = String(countdownValue);

      // Apply circle animation class
      circle.classList.remove('breathe-circle--grow', 'breathe-circle--shrink');
      // Force reflow
      void circle.offsetWidth;
      if (phase.circle === 'grow') {
        circle.classList.add('breathe-circle--grow');
      } else {
        circle.classList.add('breathe-circle--shrink');
      }
    }

    function startCountdown() {
      countdownValue = 4;
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
        countdown.textContent = String(countdownValue);
      }, 1000);
    }

    function advancePhase() {
      if (!breatheOverlay || !document.body.contains(breatheOverlay)) return;
      phaseIndex = (phaseIndex + 1) % phases.length;
      startCountdown();
    }

    // Start the exercise
    startCountdown();
  }

  function setTypingVisible(visible) {
    typingRowEl.hidden = !visible;
    if (visible) scrollToBottom();
  }

  function setHint(message) {
    if (!message) {
      hintEl.hidden = true;
      hintEl.textContent = '';
      return;
    }
    hintEl.textContent = message;
    hintEl.hidden = false;
  }

  function refreshComposerState() {
    inputEl.style.height = 'auto';
    inputEl.style.height = `${inputEl.scrollHeight}px`;

    const text = inputEl.value.trim();

    if (text && hasForeignLetters(text)) {
      setHint(lang.ui.foreignScriptHint);
      sendButtonEl.disabled = true;
      return;
    }

    setHint('');
    sendButtonEl.disabled = conversationEnded || waitingForReply || text.length === 0;
  }

  function setComposerBusy(busy) {
    waitingForReply = busy;
    inputEl.disabled = busy || conversationEnded;
    refreshComposerState();
  }

  async function deliverReply(replyText, generation = conversationGeneration) {
    setTypingVisible(true);
    // Variable delay: base random + extra per response character length
    const baseDelay = randomReplyDelay();
    const extraDelay = Math.min(replyText.length * 2, 600);
    await new Promise((resolve) => setTimeout(resolve, baseDelay + extraDelay));
    setTypingVisible(false);
    if (generation !== conversationGeneration) return false;
    appendMessage('bot', replyText);
    return true;
  }

  // --- Language selection --------------------------------------------------

  /**
   * Applies every piece of static UI copy for the given language pack:
   * document direction/lang, fonts (via the lang attribute in CSS),
   * title/description, placeholders, aria labels, menu text, disclaimer,
   * and all tooltip/title attributes.
   * @param {object} chosenLang
   */
  function applyLanguage(chosenLang) {
    lang = chosenLang;

    htmlRootEl.setAttribute('lang', lang.code);
    htmlRootEl.setAttribute('dir', lang.dir);

    pageTitleEl.textContent = lang.ui.appTitle;
    pageDescriptionEl.setAttribute('content', lang.ui.appDescription);

    headerTitleEl.textContent = lang.botName;
    inputEl.setAttribute('placeholder', lang.ui.placeholderDefault);
    inputEl.setAttribute('aria-label', lang.ui.ariaInputLabel);
    inputEl.setAttribute('dir', lang.dir);
    inputEl.setAttribute('lang', lang.code);
    sendButtonEl.setAttribute('aria-label', lang.ui.sendButtonTitle);
    sendButtonEl.setAttribute('title', lang.ui.sendButtonTitle);
    menuTriggerEl.setAttribute('aria-label', lang.ui.menuTriggerTitle);
    menuTriggerEl.setAttribute('title', lang.ui.menuTriggerTitle);
    pickerFaEl.setAttribute('aria-label', lang.ui.pickerFaTitle);
    pickerFaEl.setAttribute('title', lang.ui.pickerFaTitle);
    pickerEnEl.setAttribute('aria-label', lang.ui.pickerEnTitle);
    pickerEnEl.setAttribute('title', lang.ui.pickerEnTitle);
    themeToggleButtons.forEach((button) => {
      const title = button.dataset.themeChoice === 'ocean'
        ? lang.ui.themeOceanTitle
        : lang.ui.themeBeachTitle;
      button.setAttribute('aria-label', title);
      button.setAttribute('title', title);
    });
    menuNewChatEl.setAttribute('aria-label', lang.ui.newChatTitle);
    menuNewChatEl.setAttribute('title', lang.ui.newChatTitle);
    menuExportMdEl.setAttribute('aria-label', lang.ui.exportMdTitle);
    menuExportMdEl.setAttribute('title', lang.ui.exportMdTitle);
    menuExportTxtEl.setAttribute('aria-label', lang.ui.exportTxtTitle);
    menuExportTxtEl.setAttribute('title', lang.ui.exportTxtTitle);
    themePickerEl.setAttribute('aria-label', lang.ui.themeGroupLabel);
    typingStatusEl.setAttribute('aria-label', lang.ui.typingLabel);
    menuNewChatLabelEl.textContent = lang.ui.menuNewChat;
    menuExportMdLabelEl.textContent = lang.ui.menuExportMd;
    menuExportTxtLabelEl.textContent = lang.ui.menuExportTxt;
    disclaimerEl.textContent = lang.ui.disclaimer;
    updateThemeMenuItem();

    // Set the breathing trigger icon and tooltip per the active language.
    // The icon changes to a more breath-specific symbol (lungs) that is
    // universally recognized regardless of language.
    if (breatheTriggerEl) {
      breatheTriggerEl.setAttribute('aria-label', lang.ui.breatheTitle);
      breatheTriggerEl.setAttribute('title', lang.ui.breatheTitle);
      breatheTriggerEl.querySelector('svg').setAttribute('aria-label', lang.ui.breatheTitle);
    }
    // Update picker language-lock note
    if (pickerLangLockEl) {
      const faSpan = pickerLangLockEl.querySelector('.picker__lang-lock-fa');
      const enSpan = pickerLangLockEl.querySelector('.picker__lang-lock-en');
      if (lang.code === 'fa') {
        if (faSpan) faSpan.hidden = false;
        if (enSpan) enSpan.hidden = true;
      } else {
        if (faSpan) faSpan.hidden = true;
        if (enSpan) enSpan.hidden = false;
      }
    }
  }

  /**
   * Handles the person choosing a language from the picker: applies the
   * language, reveals the chat UI, and starts the conversation.
   * @param {object} chosenLang
   */
  function selectLanguage(chosenLang) {
    applyLanguage(chosenLang);
    pickerEl.hidden = true;
    appEl.hidden = false;
    chatActive = true;
    startConversation();
  }

  /**
   * Returns to the language picker, hiding the chat UI and clearing all
   * conversation state. This is the *only* path back to choosing a
   * language: the picker button ("گفت‌وگوی تازه" / "New chat" in the menu)
   * routes here rather than silently reusing whatever language was
   * active before, since starting fresh is deliberately the sole way to
   * switch languages. Scrolls the window back to the top so the picker
   * is immediately visible without the person needing to scroll up to
   * find it.
   */
  function showPicker() {
    conversationGeneration += 1;
    setTypingVisible(false);
    dismissBreathe();
    appEl.hidden = true;
    pickerEl.hidden = false;
    closeMenu();
    lang = null;
    engine = null;
    conversationEnded = false;
    chatActive = false;
    transcript = [];
    chatEl.innerHTML = '';
    messageCount = 0;
    currentTitle = '';
    // Reset picker language-lock spans so both languages show again
    if (pickerLangLockEl) {
      const faSpan = pickerLangLockEl.querySelector('.picker__lang-lock-fa');
      const enSpan = pickerLangLockEl.querySelector('.picker__lang-lock-en');
      if (faSpan) faSpan.hidden = false;
      if (enSpan) enSpan.hidden = false;
    }
    window.scrollTo(0, 0);
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  // --- Conversation flow -------------------------------------------------------

  async function startConversation() {
    const generation = ++conversationGeneration;
    // Re-randomize ocean wave drift speeds so each fresh conversation
    // gets a unique, organic water motion.
    initBeachWaveVariation();
    engine = new DaryaResponseEngine(lang);
    conversationEnded = false;
    transcript = [];
    chatEl.innerHTML = '';
    messageCount = 0;
    currentTitle = '';
    setHint('');
    inputEl.setAttribute('placeholder', lang.ui.placeholderDefault);
    setComposerBusy(true);
    hideBreatheTrigger();

    const delivered = await deliverReply(engine.greeting(), generation);
    if (!delivered || generation !== conversationGeneration) return;

    setComposerBusy(false);
    // Restore scroll position if returning to this session
    if (chatEl.children.length > 0) {
      restoreScrollPosition();
    }
    focusInputUnlessTouch();
  }

  function showBreatheTrigger() {
    if (breatheTriggerEl) breatheTriggerEl.hidden = false;
  }

  function hideBreatheTrigger() {
    if (breatheTriggerEl) breatheTriggerEl.hidden = true;
  }

  const EXTRA_REPLIES = 0; // 0 = single reply (default), 1 = two replies, 2 = three replies

  async function sendMessage(text) {
    const generation = conversationGeneration;
    appendMessage('user', text);
    inputEl.value = '';
    setComposerBusy(true);

    const isExit = engine.isExitCommand(text);
    const replyText = isExit ? engine.farewell() : engine.respond(text);

    const delivered = await deliverReply(replyText, generation);
    if (!delivered || generation !== conversationGeneration) return;

    if (!isExit && EXTRA_REPLIES > 0) {
      for (let i = 0; i < EXTRA_REPLIES; i += 1) {
        const extra = engine.respond(text);
        const extraDelivered = await deliverReply(extra, generation);
        if (!extraDelivered || generation !== conversationGeneration) return;
      }
    }

    if (isExit) {
      conversationEnded = true;
      inputEl.setAttribute('placeholder', lang.ui.placeholderEnded);
      hideBreatheTrigger();
    }

    setComposerBusy(false);

    if (!conversationEnded) {
      if (engine && engine.lastTurnNeedsCare) {
        showBreatheTrigger();
      } else {
        hideBreatheTrigger();
      }
      focusInputUnlessTouch();
    }
  }

  // --- Export --------------------------------------------------------------

  function formatLocalizedDateTime(date) {
    try {
      return new Intl.DateTimeFormat(lang.ui.dateLocale, { dateStyle: 'full', timeStyle: 'short' }).format(date);
    } catch (error) {
      return date.toISOString();
    }
  }

  function buildExportHeader() {
    const lines = [];
    lines.push(formatLocalizedDateTime(new Date()));
    return lines.join('\n');
  }

  function buildMarkdownTranscript() {
    const header = buildExportHeader();
    const lines = [`# ${lang.ui.exportTitle}`, '', header, '', '---', ''];
    for (const entry of transcript) {
      const label = entry.sender === 'user' ? lang.ui.exportYouLabel : lang.botName;
      lines.push(`**${label}** _(${entry.time})_`);
      lines.push('');
      lines.push(entry.text);
      lines.push('');
    }
    return lines.join('\n');
  }

  function buildPlainTextTranscript() {
    const header = buildExportHeader();
    const lines = [lang.ui.exportTitle, '', header, '', lang.ui.exportDivider, ''];
    for (const entry of transcript) {
      const label = entry.sender === 'user' ? lang.ui.exportYouLabel : lang.botName;
      lines.push(`${label} (${entry.time}):`);
      lines.push(entry.text);
      lines.push('');
    }
    return lines.join('\n');
  }

  function downloadTextFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportTimestamp() {
    return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  }

  function exportMarkdown() {
    if (!lang || transcript.length === 0) return;
    downloadTextFile(`darya-chat-${lang.code}-${exportTimestamp()}.md`, buildMarkdownTranscript(), 'text/markdown');
  }

  function exportPlainText() {
    if (!lang || transcript.length === 0) return;
    downloadTextFile(`darya-chat-${lang.code}-${exportTimestamp()}.txt`, buildPlainTextTranscript(), 'text/plain');
  }

  // --- Menu ------------------------------------------------------------------

  function openMenu() {
    menuPopoverEl.hidden = false;
    menuTriggerEl.setAttribute('aria-expanded', 'true');
    menuFocusIndex = 0;
    requestAnimationFrame(() => menuItemElements[menuFocusIndex]?.focus());
  }

  function closeMenu(restoreFocus = false) {
    menuPopoverEl.hidden = true;
    menuTriggerEl.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuTriggerEl.focus();
  }

  function moveMenuFocus(step) {
    if (menuItemElements.length === 0) return;
    menuFocusIndex = (menuFocusIndex + step + menuItemElements.length) % menuItemElements.length;
    menuItemElements[menuFocusIndex].focus();
  }

  function toggleMenu() {
    if (menuPopoverEl.hidden) openMenu();
    else closeMenu();
  }

  // --- Event wiring -------------------------------------------------------

  pickerFaEl.addEventListener('click', () => selectLanguage(window.DaryaLang.fa));
  pickerEnEl.addEventListener('click', () => selectLanguage(window.DaryaLang.en));

  themeToggleButtons.forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.themeChoice));
  });

  composerEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = inputEl.value.trim();
    if (!text || conversationEnded || waitingForReply || hasForeignLetters(text)) return;
    sendMessage(text);
  });

  inputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      composerEl.requestSubmit();
    }
  });

  inputEl.addEventListener('input', refreshComposerState);

  inputEl.addEventListener('focus', () => scrollToBottom());
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => scrollToBottom());
  }

  menuTriggerEl.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  menuPopoverEl.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveMenuFocus(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveMenuFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      menuFocusIndex = 0;
      menuItemElements[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      menuFocusIndex = menuItemElements.length - 1;
      menuItemElements.at(-1)?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (!menuPopoverEl.hidden && !menuPopoverEl.contains(event.target) && event.target !== menuTriggerEl) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menuPopoverEl.hidden) {
      closeMenu(true);
    }
  });

  menuNewChatEl.addEventListener('click', () => {
    closeMenu();
    showPicker();
  });

  menuExportMdEl.addEventListener('click', () => {
    closeMenu();
    exportMarkdown();
  });

  menuExportTxtEl.addEventListener('click', () => {
    closeMenu();
    exportPlainText();
  });

  menuThemeToggleEl.addEventListener('click', () => {
    applyTheme(menuThemeToggleEl.dataset.themeChoice);
    closeMenu();
  });

  if (breatheTriggerEl) {
    breatheTriggerEl.addEventListener('click', () => {
      showBreatheExercise();
    });
  }

  chatEl.addEventListener('scroll', () => {
    saveScrollPosition();
  }, { passive: true });

  // --- Refresh / close guard -------------------------------------------------

  window.addEventListener('beforeunload', (event) => {
    if (!chatActive) return undefined;
    event.preventDefault();
    event.returnValue = '';
    return '';
  });

  // --- Ambient scene particles ------------------------------------------------

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function initBeachWaveVariation() {
    const layers = document.querySelectorAll('.beach-scene__ocean');
    const ranges = [[56, 72], [42, 58], [30, 46]];
    const durations = [];
    layers.forEach((layer, index) => {
      const [min, max] = ranges[index] || ranges[ranges.length - 1];
      const duration = randomBetween(min, max);
      durations.push(duration);
      layer.style.setProperty('--wave-duration', `${duration.toFixed(2)}s`);
      layer.style.setProperty('--wave-delay', `-${randomBetween(0, duration).toFixed(2)}s`);
    });
    // Store average wave duration for bird shadow speed calculation
    const avgWave = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 48;
    document.documentElement.style.setProperty('--avg-wave-duration', String(avgWave));
  }

  function initBubbles() {
    const container = document.querySelector('.bubbles');
    if (!container) return;
    const count = 8;
    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement('span');
      bubble.className = 'bubble-particle';
      const size = randomBetween(4, 14);
      const duration = randomBetween(14, 22);
      bubble.style.setProperty('--left', `${randomBetween(2, 96).toFixed(1)}%`);
      bubble.style.setProperty('--size', `${size.toFixed(1)}px`);
      bubble.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      bubble.style.setProperty('--delay', `-${randomBetween(0, duration).toFixed(1)}s`);
      bubble.style.setProperty('--drift', `${randomBetween(-12, 12).toFixed(0)}px`);
      bubble.style.setProperty('--peak-opacity', randomBetween(0.15, 0.45).toFixed(2));
      container.appendChild(bubble);
    }
  }

  function initBirdShadows() {
    const container = document.querySelector('.bird-shadows');
    if (!container) return;
    // Link bird speed to average wave duration for a natural balance.
    // Birds fly faster (shorter duration) than waves drift, but the
    // ratio between them stays consistent so the scene feels harmonious.
    // A slight random variance prevents perfect syncing.
    const avgWaveDuration = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--avg-wave-duration').trim()
    ) || 48;
    const flockCount = 2 + Math.floor(Math.random() * 3);
    for (let f = 0; f < flockCount; f += 1) {
      const birdsInFlock = 3 + Math.floor(Math.random() * 3);
      // Bird speed is wave speed * a factor (0.35 to 0.60) with added
      // variance so it never exactly matches the wave timing.
      const waveFactor = randomBetween(0.35, 0.60);
      const flockDuration = avgWaveDuration * waveFactor + randomBetween(-3, 3);
      const clampedDuration = Math.max(14, Math.min(40, flockDuration));
      const flockDelay = -randomBetween(0, clampedDuration);
      const baseTop = randomBetween(8, 65);
      const baseScale = randomBetween(0.7, 1.2);
      for (let b = 0; b < birdsInFlock; b += 1) {
        const shadow = document.createElement('span');
        shadow.className = 'bird-shadow';
        shadow.style.setProperty('--top', `${(baseTop + randomBetween(-6, 8)).toFixed(1)}%`);
        shadow.style.setProperty('--scale', (baseScale * randomBetween(0.85, 1.15)).toFixed(2));
        shadow.style.setProperty('--duration', `${clampedDuration.toFixed(1)}s`);
        shadow.style.setProperty('--delay', `${flockDelay.toFixed(1)}s`);
        shadow.style.setProperty('--peak-opacity', randomBetween(0.25, 0.50).toFixed(2));
        shadow.style.setProperty('--flock-offset', `${randomBetween(-25, 25).toFixed(0)}px`);
        container.appendChild(shadow);
      }
    }
  }

  // --- Offline support ---------------------------------------------------

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Service worker registration failed (app still works online):', error);
      });
    });
  }

  // --- Boot -----------------------------------------------------------------
  // Try localStorage as fallback if cookies are blocked (private browsing,
  // embedded contexts, strict privacy settings).
  let storedTheme = getCookie(THEME_COOKIE_NAME);
  if (!storedTheme && typeof window.localStorage === 'object') {
    try { storedTheme = localStorage.getItem(THEME_COOKIE_NAME); } catch (e) { /* ignore */ }
  }
  // Apply the saved theme (or default) and sync the picker buttons.
  // The inline <head> script already set data-theme for FOUC prevention,
  // but we still call applyTheme to sync aria-pressed on the picker.
  applyTheme(storedTheme || DEFAULT_THEME);
  initBeachWaveVariation();
  initBubbles();
  initBirdShadows();
})();
