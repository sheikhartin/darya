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
  const menuLangNoteEl = document.getElementById('menu-lang-note');

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
   * persists the choice in a cookie so it's remembered on the next visit
   * (unlike language, which intentionally resets every time).
   * @param {'ocean'|'beach'} theme
   */
  function applyTheme(theme) {
    const safeTheme = theme === 'beach' ? 'beach' : 'ocean';
    htmlRootEl.setAttribute('data-theme', safeTheme);
    setCookie(THEME_COOKIE_NAME, safeTheme, THEME_COOKIE_MAX_AGE_DAYS);
    themeToggleButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === safeTheme));
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
  let bookmarkIds = new Set();
  const SESSION_KEY = 'darya_scroll_pos';

  function appendMessage(sender, text) {
    const time = formatTimestamp();
    const msgId = `msg-${messageCount}`;
    transcript.push({ sender, text, time, id: msgId });
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

    // Add anchor/bookmark button for bot messages
    if (sender === 'bot') {
      const anchorBtn = document.createElement('button');
      anchorBtn.className = 'anchor-btn';
      anchorBtn.setAttribute('type', 'button');
      anchorBtn.setAttribute('aria-label', lang.ui.anchorBtnLabel);
      anchorBtn.setAttribute('data-msg-id', msgId);
      anchorBtn.textContent = '📌';
      anchorBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleBookmark(msgId, anchorBtn);
      });
      wrapper.appendChild(anchorBtn);
    }

    // Save scroll position before adding new content
    saveScrollPosition();

    row.appendChild(wrapper);
    chatEl.appendChild(row);

    scrollToBottom();
    updateAutoTitle();
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

  // --- Bookmarks ----------------------------------------------------------

  function toggleBookmark(msgId, btnEl) {
    if (bookmarkIds.has(msgId)) {
      bookmarkIds.delete(msgId);
      btnEl.classList.remove('anchor-btn--active');
      btnEl.setAttribute('aria-label', lang.ui.anchorBtnLabel);
    } else {
      bookmarkIds.add(msgId);
      btnEl.classList.add('anchor-btn--active');
      btnEl.setAttribute('aria-label', lang.ui.anchorRemoveLabel);
    }
  }

  // --- Auto-title ---------------------------------------------------------

  function updateAutoTitle() {
    if (messageCount < 5 || !engine) return;
    const topics = engine.currentTurnTopics;
    if (!topics || topics.length === 0 || currentTitle) return;
    // Generate title from the most prominent topic
    const topicLabels = {
      fa: {
        family: 'خانواده', work: 'کار', sleep: 'خواب', anxiety: 'نگرانی',
        sadness: 'غم', anger: 'خشم', joy: 'شادی', loneliness: 'تنهایی',
        self_esteem: 'اعتماد به نفس', grief: 'فقدان', motivation: 'انگیزه',
        relationship: 'رابطه', health: 'سلامتی', school: 'درس و تحصیل',
        money: 'مالی',
      },
      en: {
        family: 'Family', work: 'Work', sleep: 'Sleep', anxiety: 'Anxiety',
        sadness: 'Sadness', anger: 'Anger', joy: 'Joy', loneliness: 'Loneliness',
        self_esteem: 'Self-esteem', grief: 'Grief', motivation: 'Motivation',
        relationship: 'Relationship', health: 'Health', school: 'School',
        money: 'Money',
      },
    };
    const labels = topicLabels[lang.code] || topicLabels.en;
    const topicName = labels[topics[0]] || topics[0];
    currentTitle = topicName;
    const titleEl = document.createElement('div');
    titleEl.className = 'chat__title';
    titleEl.textContent = `${lang.ui.chatTitlePrefix}${topicName}`;
    chatEl.insertBefore(titleEl, chatEl.firstChild);
  }

  // --- Breathing exercise -------------------------------------------------

  let breatheOverlay = null;

  function showBreatheExercise() {
    if (breatheOverlay) return;
    breatheOverlay = document.createElement('div');
    breatheOverlay.className = 'breathe-overlay';
    breatheOverlay.setAttribute('role', 'dialog');
    breatheOverlay.setAttribute('aria-modal', 'true');
    breatheOverlay.setAttribute('aria-label', lang.ui.breatheTitle);

    const circle = document.createElement('div');
    circle.className = 'breathe-circle';

    const label = document.createElement('div');
    label.className = 'breathe-label';
    label.textContent = lang.ui.breatheIn;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'breathe-close';
    closeBtn.textContent = lang.ui.breatheDismiss;
    closeBtn.addEventListener('click', dismissBreathe);

    breatheOverlay.appendChild(circle);
    breatheOverlay.appendChild(label);
    breatheOverlay.appendChild(closeBtn);

    // Click anywhere on overlay to dismiss
    breatheOverlay.addEventListener('click', (e) => {
      if (e.target === breatheOverlay) dismissBreathe();
    });

    document.body.appendChild(breatheOverlay);

    // Cycle labels through breathe phases to match the 4-7-8 rhythm in the CSS animation (19s total):
    // Inhale: 0s-4s | Hold: 4s-11s | Exhale: 11s-19s
    const phases = [
      { label: lang.ui.breatheIn,  duration: 4000 },
      { label: lang.ui.breatheHold, duration: 7000 },
      { label: lang.ui.breatheOut, duration: 8000 },
    ];
    let phaseIndex = 0;
    function scheduleNextPhase() {
      if (!breatheOverlay || !document.body.contains(breatheOverlay)) return;
      phaseIndex = (phaseIndex + 1) % phases.length;
      label.textContent = phases[phaseIndex].label;
      breatheOverlay._timeout = setTimeout(scheduleNextPhase, phases[phaseIndex].duration);
    }
    label.textContent = phases[0].label;
    breatheOverlay._timeout = setTimeout(scheduleNextPhase, phases[0].duration);
  }

  function dismissBreathe() {
    if (breatheOverlay) {
      if (breatheOverlay._timeout) clearTimeout(breatheOverlay._timeout);
      breatheOverlay.remove();
      breatheOverlay = null;
    }
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
    // Unified labels: aria-label === title === visible action text
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
    if (breatheTriggerEl) {
      breatheTriggerEl.setAttribute('aria-label', lang.ui.breatheTitle);
    }
    // Update menu language-lock note
    if (menuLangNoteEl) {
      const faSpan = menuLangNoteEl.querySelector('span[lang="fa"]');
      const enSpan = menuLangNoteEl.querySelector('span[lang="en"]');
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
    bookmarkIds = new Set();
    messageCount = 0;
    currentTitle = '';
    window.scrollTo(0, 0);
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  // --- Conversation flow -------------------------------------------------------

  async function startConversation() {
    const generation = ++conversationGeneration;
    engine = new DaryaResponseEngine(lang);
    conversationEnded = false;
    transcript = [];
    chatEl.innerHTML = '';
    bookmarkIds = new Set();
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

  async function sendMessage(text) {
    const generation = conversationGeneration;
    appendMessage('user', text);
    inputEl.value = '';
    setComposerBusy(true);

    const isExit = engine.isExitCommand(text);
    const replyText = isExit ? engine.farewell() : engine.respond(text);

    const delivered = await deliverReply(replyText, generation);
    if (!delivered || generation !== conversationGeneration) return;

    if (isExit) {
      conversationEnded = true;
      inputEl.setAttribute('placeholder', lang.ui.placeholderEnded);
      hideBreatheTrigger();
    }

    setComposerBusy(false);

    if (!conversationEnded) {
      // Show breathe trigger if the engine detected distress
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
    if (currentTitle) {
      lines.push(`${lang.ui.chatTitlePrefix}${currentTitle}`);
      lines.push('');
    }
    lines.push(formatLocalizedDateTime(new Date()));
    lines.push('');
    // Add themes summary from engine memory
    if (engine && engine.memory.topicHistory.length > 0) {
      const topics = [...new Set(engine.memory.topicHistory.slice(-6).map((t) => t.topic))]
        .filter(Boolean).slice(0, 4);
      if (topics.length > 0) {
        lines.push(lang.code === 'fa'
          ? `موضوع‌های گفت‌وگو: ${topics.join('، ')}`
          : `Topics discussed: ${topics.join(', ')}`);
        lines.push('');
      }
    }
    return lines.join('\n');
  }

  function buildMarkdownTranscript() {
    const header = buildExportHeader();
    const lines = [`# ${lang.ui.exportTitle}`, '', header, '---', ''];
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

  // Breathing exercise trigger
  if (breatheTriggerEl) {
    breatheTriggerEl.addEventListener('click', () => {
      showBreatheExercise();
    });
  }

  // Save scroll position periodically
  chatEl.addEventListener('scroll', () => {
    saveScrollPosition();
  }, { passive: true });

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

  function initBeachWaveVariation() {
    const layers = document.querySelectorAll('.beach-scene__ocean');
    const ranges = [[56, 72], [42, 58], [30, 46]];
    layers.forEach((layer, index) => {
      const [min, max] = ranges[index] || ranges[ranges.length - 1];
      const duration = randomBetween(min, max);
      layer.style.setProperty('--wave-duration', `${duration.toFixed(2)}s`);
      layer.style.setProperty('--wave-delay', `-${randomBetween(0, duration).toFixed(2)}s`);
    });
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
      // A negative delay starts the animation already partway through its
      // cycle, so bubbles don't all begin rising from the bottom at once.
      bubble.style.setProperty('--delay', `-${randomBetween(0, duration).toFixed(1)}s`);
      bubble.style.setProperty('--drift', `${randomBetween(-12, 12).toFixed(0)}px`);
      bubble.style.setProperty('--peak-opacity', randomBetween(0.15, 0.45).toFixed(2));
      container.appendChild(bubble);
    }
  }

  function initBirdShadows() {
    const container = document.querySelector('.bird-shadows');
    if (!container) return;
    // Each shadow drifts across the sand band during roughly the first
    // third of its cycle, then sits invisible for the rest. With 5
    // shadows at staggered random durations, there's usually just one
    // visible at any given time -- reading as an occasional group of
    // distant birds passing overhead, casting faint moving shadows on
    // the sand below.
    const count = 5;
    for (let i = 0; i < count; i += 1) {
      const shadow = document.createElement('span');
      shadow.className = 'bird-shadow';
      const duration = randomBetween(14, 26);
      shadow.style.setProperty('--top', `${randomBetween(5, 70).toFixed(1)}%`);
      shadow.style.setProperty('--scale', randomBetween(0.6, 1.4).toFixed(2));
      shadow.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      shadow.style.setProperty('--delay', `-${randomBetween(0, duration).toFixed(1)}s`);
      shadow.style.setProperty('--peak-opacity', randomBetween(0.25, 0.50).toFixed(2));
      container.appendChild(shadow);
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
  initBeachWaveVariation();
  initBubbles();
  initBirdShadows();
  initWetPatches();
})();
