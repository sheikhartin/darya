/**
 * Darya — front-end chat controller for the static (GitHub Pages) build.
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

  const appEl = document.getElementById('app');
  const headerTitleEl = document.getElementById('header-title');
  const chatEl = document.getElementById('chat');
  const typingRowEl = document.getElementById('typing-row');
  const hintEl = document.getElementById('input-hint');
  const composerEl = document.getElementById('composer');
  const inputEl = document.getElementById('composer-input');
  const sendButtonEl = document.getElementById('composer-send');
  const disclaimerEl = document.getElementById('disclaimer-text');

  const menuTriggerEl = document.getElementById('menu-trigger');
  const menuPopoverEl = document.getElementById('menu-popover');
  const menuNewChatEl = document.getElementById('menu-new-chat');
  const menuNewChatLabelEl = document.getElementById('menu-new-chat-label');
  const menuExportMdEl = document.getElementById('menu-export-md');
  const menuExportMdLabelEl = document.getElementById('menu-export-md-label');
  const menuExportTxtEl = document.getElementById('menu-export-txt');
  const menuExportTxtLabelEl = document.getElementById('menu-export-txt-label');
  const menuThemeToggleEl = document.getElementById('menu-theme-toggle');
  const menuThemeIconEl = document.getElementById('menu-theme-icon');
  const menuThemeLabelEl = document.getElementById('menu-theme-label');

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
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Writes a cookie that persists across visits (used only for the theme
   * preference; no conversation content or personal data is ever stored).
   * @param {string} name
   * @param {string} value
   * @param {number} days
   */
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
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
    return window.matchMedia('(pointer: coarse)').matches;
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
   * persists the choice in a cookie so it's remembered on the next visit
   * (unlike language, which intentionally resets every time).
   * @param {'ocean'|'beach'} theme
   */
  function applyTheme(theme) {
    htmlRootEl.setAttribute('data-theme', theme);
    setCookie(THEME_COOKIE_NAME, theme, THEME_COOKIE_MAX_AGE_DAYS);
    themeToggleButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
    updateThemeMenuItem();
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

  function appendMessage(sender, text) {
    const time = formatTimestamp();
    transcript.push({ sender, text, time });

    const row = document.createElement('div');
    row.className = `bubble-row bubble-row--${sender}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'bubble-wrap';

    const bubble = document.createElement('div');
    bubble.className = `bubble bubble--${sender}`;
    bubble.textContent = text;

    const meta = document.createElement('div');
    meta.className = 'bubble-meta';
    meta.textContent = time;

    wrapper.appendChild(bubble);
    wrapper.appendChild(meta);
    row.appendChild(wrapper);
    chatEl.appendChild(row);

    scrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatEl.scrollTop = chatEl.scrollHeight;
    });
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

  async function deliverReply(replyText) {
    setTypingVisible(true);
    await new Promise((resolve) => setTimeout(resolve, randomReplyDelay()));
    setTypingVisible(false);
    appendMessage('bot', replyText);
  }

  // --- Language selection --------------------------------------------------

  /**
   * Applies every piece of static UI copy for the given language pack:
   * document direction/lang, fonts (via the lang attribute in CSS),
   * title/description, placeholders, aria labels, menu text, disclaimer.
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
    sendButtonEl.setAttribute('aria-label', lang.ui.ariaSendLabel);
    sendButtonEl.setAttribute('title', lang.ui.sendButtonTitle);
    menuTriggerEl.setAttribute('aria-label', lang.ui.ariaMenuLabel);
    menuTriggerEl.setAttribute('title', lang.ui.menuTriggerTitle);
    pickerFaEl.setAttribute('title', lang.ui.pickerFaTitle);
    pickerEnEl.setAttribute('title', lang.ui.pickerEnTitle);
    themeToggleButtons.forEach((button) => {
      button.setAttribute('title', button.dataset.themeChoice === 'ocean'
        ? lang.ui.themeOceanTitle
        : lang.ui.themeBeachTitle);
    });
    menuNewChatEl.setAttribute('title', lang.ui.newChatTitle);
    menuExportMdEl.setAttribute('title', lang.ui.exportMdTitle);
    menuExportTxtEl.setAttribute('title', lang.ui.exportTxtTitle);
    menuNewChatLabelEl.textContent = lang.ui.menuNewChat;
    menuExportMdLabelEl.textContent = lang.ui.menuExportMd;
    menuExportTxtLabelEl.textContent = lang.ui.menuExportTxt;
    disclaimerEl.textContent = lang.ui.disclaimer;
    updateThemeMenuItem();
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
   * language: the picker button ("گفتگوی تازه" / "New chat" in the menu)
   * routes here rather than silently reusing whatever language was
   * active before, since starting fresh is deliberately the sole way to
   * switch languages. Scrolls the window back to the top so the picker
   * is immediately visible without the person needing to scroll up to
   * find it.
   */
  function showPicker() {
    appEl.hidden = true;
    pickerEl.hidden = false;
    closeMenu();
    lang = null;
    engine = null;
    conversationEnded = false;
    chatActive = false;
    transcript = [];
    chatEl.innerHTML = '';
    window.scrollTo(0, 0);
  }

  // --- Conversation flow -------------------------------------------------------

  async function startConversation() {
    engine = new DaryaResponseEngine(lang);
    conversationEnded = false;
    transcript = [];
    chatEl.innerHTML = '';
    setHint('');
    inputEl.setAttribute('placeholder', lang.ui.placeholderDefault);
    setComposerBusy(true);

    await deliverReply(engine.greeting());

    setComposerBusy(false);
    focusInputUnlessTouch();
  }

  async function sendMessage(text) {
    appendMessage('user', text);
    inputEl.value = '';
    setComposerBusy(true);

    const isExit = engine.isExitCommand(text);
    const replyText = isExit ? engine.farewell() : engine.respond(text);

    await deliverReply(replyText);

    if (isExit) {
      conversationEnded = true;
      inputEl.setAttribute('placeholder', lang.ui.placeholderEnded);
    }

    setComposerBusy(false);

    if (!conversationEnded) {
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

  function buildMarkdownTranscript() {
    const lines = [`# ${lang.ui.exportTitle}`, '', `_${formatLocalizedDateTime(new Date())}_`, '', '---', ''];
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
    const lines = [lang.ui.exportTitle, formatLocalizedDateTime(new Date()), '', lang.ui.exportDivider, ''];
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
  }

  function closeMenu() {
    menuPopoverEl.hidden = true;
    menuTriggerEl.setAttribute('aria-expanded', 'false');
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

  // On mobile, opening the virtual keyboard shrinks the visible viewport
  // and can push the most recent message out of view right as someone
  // taps in to reply, which is jarring early in a conversation when
  // there's little else on screen to anchor to. Standard practice in
  // chat apps is to keep the latest message visible above the keyboard;
  // `visualViewport`'s resize event fires once the keyboard animation
  // settles and is the reliable signal for this (a plain focus listener
  // fires too early, before the keyboard has actually opened).
  inputEl.addEventListener('focus', () => scrollToBottom());
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => scrollToBottom());
  }

  menuTriggerEl.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', (event) => {
    if (!menuPopoverEl.hidden && !menuPopoverEl.contains(event.target) && event.target !== menuTriggerEl) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menuPopoverEl.hidden) {
      closeMenu();
      menuTriggerEl.focus();
    }
  });

  // "New chat" returns to the language picker: starting a new chat is
  // explicitly the only point at which the language may change.
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

  // --- Refresh / close guard -------------------------------------------------
  //
  // Reloading or closing the tab mid-conversation would silently lose the
  // whole chat (nothing is persisted, by design). Browsers no longer allow
  // a custom message in this dialog (all of them show their own generic
  // "leave site?" wording regardless of what string is set here), but
  // triggering the native confirmation at all is still the useful part:
  // if the person confirms, the page reloads and naturally lands back on
  // the language picker, since no state survives a real reload anyway.

  window.addEventListener('beforeunload', (event) => {
    if (!chatActive) return undefined;
    event.preventDefault();
    event.returnValue = '';
    return '';
  });

  // --- Ambient scene particles ------------------------------------------------
  //
  // Bubbles (ocean) and wind gusts (beach) are generated here, each with
  // independently randomized position/size/timing, rather than living as
  // static markup driven by a repeating CSS formula -- a fixed formula is
  // exactly what made the earlier layout read as a sequential row of
  // identical bubbles instead of something organic. Both sets are built
  // once at load and simply left in the DOM; CSS shows only the active
  // theme's set via `display`, so no regeneration is needed on toggle.

  /**
   * Returns a random float in [min, max).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function initBubbles() {
    const container = document.querySelector('.bubbles');
    if (!container) return;
    const count = 10;
    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement('span');
      bubble.className = 'bubble-particle';
      const size = randomBetween(4, 19);
      const duration = randomBetween(11, 26);
      bubble.style.setProperty('--left', `${randomBetween(2, 96).toFixed(1)}%`);
      bubble.style.setProperty('--size', `${size.toFixed(1)}px`);
      bubble.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      // A negative delay starts the animation already partway through its
      // cycle, so bubbles don't all begin rising from the bottom at once.
      bubble.style.setProperty('--delay', `-${randomBetween(0, duration).toFixed(1)}s`);
      bubble.style.setProperty('--drift', `${randomBetween(-24, 24).toFixed(0)}px`);
      bubble.style.setProperty('--peak-opacity', randomBetween(0.22, 0.55).toFixed(2));
      container.appendChild(bubble);
    }
  }

  function initWindGusts() {
    const container = document.querySelector('.wind-gusts');
    if (!container) return;
    // Each gust only actually drifts across during roughly the first
    // third of its own cycle (see the CSS keyframe), then sits invisible
    // for the rest -- so even with a handful running, gusts still feel
    // occasional rather than constant, while being frequent enough
    // together to keep the scene feeling alive.
    const count = 4;
    const svgNs = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < count; i += 1) {
      const gust = document.createElementNS(svgNs, 'svg');
      gust.setAttribute('class', 'wind-gust');
      gust.setAttribute('viewBox', '0 0 100 40');
      gust.innerHTML =
        '<path d="M5,20 Q30,7 60,14 Q76,17.5 95,15" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M0,29 Q24,21 48,25" stroke="rgba(255,255,255,0.35)" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
      const duration = randomBetween(11, 20);
      gust.style.setProperty('--top', `${randomBetween(4, 46).toFixed(1)}vh`);
      gust.style.setProperty('--scale', randomBetween(0.5, 0.95).toFixed(2));
      gust.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      gust.style.setProperty('--delay', `-${randomBetween(0, duration).toFixed(1)}s`);
      gust.style.setProperty('--peak-opacity', randomBetween(0.2, 0.4).toFixed(2));
      container.appendChild(gust);
    }
  }

  function initWetPatches() {
    const container = document.querySelector('.beach-scene__wet-patches');
    if (!container) return;
    const count = 6;
    for (let i = 0; i < count; i += 1) {
      const patch = document.createElement('span');
      patch.className = 'wet-patch';
      const size = randomBetween(46, 130);
      const duration = randomBetween(7, 16);
      patch.style.setProperty('--left', `${randomBetween(0, 92).toFixed(1)}%`);
      // Weighted toward the top of the sand band, closer to the waterline,
      // so patches thin out (and dry sand becomes more likely) further
      // from the water -- like a real shoreline.
      patch.style.setProperty('--top', `${randomBetween(2, 55).toFixed(1)}%`);
      patch.style.setProperty('--size', `${size.toFixed(0)}px`);
      patch.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      patch.style.setProperty('--delay', `-${randomBetween(0, duration).toFixed(1)}s`);
      patch.style.setProperty('--peak-opacity', randomBetween(0.3, 0.6).toFixed(2));
      container.appendChild(patch);
    }
  }

  // --- Offline support ---------------------------------------------------
  //
  // Registers the service worker that precaches the whole app shell (see
  // sw.js) so the app keeps working with no network at all after the
  // first successful load. Registration only runs where the browser
  // actually supports it, and a failure here (e.g. running over plain
  // HTTP somewhere that isn't localhost, where service workers are
  // blocked for security reasons) is caught rather than left as an
  // unhandled rejection -- the app works fine online either way, it
  // simply won't have offline caching in that case.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('Service worker registration failed (app still works online):', error);
      });
    });
  }

  // --- Boot -----------------------------------------------------------------
  // Nothing about the conversation starts automatically: the picker is
  // shown and we simply wait for a language choice. The saved theme,
  // however, is restored immediately so returning visitors see their
  // chosen look right away.
  applyTheme(getCookie(THEME_COOKIE_NAME) || DEFAULT_THEME);
  initBubbles();
  initWindGusts();
  initWetPatches();
})();
