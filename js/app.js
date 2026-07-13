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
    menuTriggerEl.setAttribute('aria-label', lang.ui.ariaMenuLabel);
    menuNewChatLabelEl.textContent = lang.ui.menuNewChat;
    menuExportMdLabelEl.textContent = lang.ui.menuExportMd;
    menuExportTxtLabelEl.textContent = lang.ui.menuExportTxt;
    disclaimerEl.textContent = lang.ui.disclaimer;
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
    inputEl.focus();
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
      inputEl.focus();
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

  // --- Boot -----------------------------------------------------------------
  // Nothing starts automatically: the picker is shown and we simply wait
  // for a language choice.
})();
