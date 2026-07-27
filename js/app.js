/**
 * Darya - front-end chat controller for the static (GitHub Pages) build.
 *
 * Runs entirely client-side against the shared DaryaUI state, the
 * DaryaResponseEngine, and the active language pack. UI-specific modules
 * (ambient.js, core.js, overlays.js, export.js) handle isolated concerns;
 * this file owns event wiring, conversation flow, language selection,
 * menu management, and the boot sequence.
 *
 * Flow:
 *   1. A language picker is shown first. Nothing else is initialized
 *      until a language is chosen.
 *   2. Once chosen, the whole page (dir, lang, fonts, every UI string)
 *      switches to that language, an engine is created with the matching
 *      language pack, and Darya speaks first after a short delay.
 *   3. The language is then locked for the rest of the conversation --
 *      "New chat" in the menu returns to the picker rather than silently
 *      reusing the previous language.
 */

(() => {
  'use strict';

  const { DaryaResponseEngine } = window.DaryaEngine;
  const UI = window.DaryaUI;
  const el = UI.elements;
  const st = UI.state;

  const MIN_REPLY_DELAY_MS = 1500;
  const MAX_REPLY_DELAY_MS = 2300;

  let menuFocusIndex = 0;

  // ========================================================================
  // Composer / Reply state
  // ========================================================================

  function setTypingVisible(visible) {
    el.typingRow.hidden = !visible;
    if (visible) UI.utils.scrollToBottom();
  }

  function setHint(message) {
    if (!message) {
      el.hint.hidden = true;
      el.hint.textContent = '';
      return;
    }
    el.hint.textContent = message;
    el.hint.hidden = false;
  }

  function refreshComposerState() {
    el.input.style.height = 'auto';
    el.input.style.height = `${el.input.scrollHeight}px`;

    const text = el.input.value.trim();

    if (text && UI.utils.hasForeignLetters(text)) {
      setHint(st.lang.ui.foreignScriptHint);
      el.sendButton.disabled = true;
      return;
    }

    setHint('');
    el.sendButton.disabled = st.conversationEnded || st.waitingForReply || text.length === 0;
  }

  // Expose for overlays module to call
  UI.refreshComposerState = refreshComposerState;

  function setComposerBusy(busy) {
    st.waitingForReply = busy;
    el.input.disabled = busy || st.conversationEnded;
    refreshComposerState();
  }

  function randomReplyDelay() {
    return MIN_REPLY_DELAY_MS + Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS);
  }

  async function deliverReply(replyText, generation = st.conversationGeneration) {
    setTypingVisible(true);
    const baseDelay = randomReplyDelay();
    const extraDelay = Math.min(replyText.length * 2, 600);
    await new Promise((resolve) => setTimeout(resolve, baseDelay + extraDelay));
    setTypingVisible(false);
    if (generation !== st.conversationGeneration) return false;
    UI.utils.appendMessage('bot', replyText);
    return true;
  }

  // ========================================================================
  // Language selection
  // ========================================================================

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
    el.themeToggleButtons.forEach((button) => {
      const title = button.dataset.themeChoice === 'ocean'
        ? chosenLang.ui.themeOceanTitle : chosenLang.ui.themeBeachTitle;
      button.setAttribute('aria-label', title);
      button.setAttribute('title', title);
    });
    el.menuNewChat.setAttribute('aria-label', chosenLang.ui.newChatTitle);
    el.menuNewChat.setAttribute('title', chosenLang.ui.newChatTitle);
    el.menuExportMd.setAttribute('aria-label', chosenLang.ui.exportMdTitle);
    el.menuExportMd.setAttribute('title', chosenLang.ui.exportMdTitle);
    el.menuExportTxt.setAttribute('aria-label', chosenLang.ui.exportTxtTitle);
    el.menuExportTxt.setAttribute('title', chosenLang.ui.exportTxtTitle);
    el.themePicker.setAttribute('aria-label', chosenLang.ui.themeGroupLabel);
    el.typingStatus.setAttribute('aria-label', chosenLang.ui.typingLabel);
    el.menuNewChatLabel.textContent = chosenLang.ui.menuNewChat;
    el.menuExportMdLabel.textContent = chosenLang.ui.menuExportMd;
    el.menuExportTxtLabel.textContent = chosenLang.ui.menuExportTxt;
    el.disclaimer.textContent = chosenLang.ui.disclaimer;
    UI.theme.updateThemeMenuItem();

    if (el.breatheTrigger) {
      el.breatheTrigger.setAttribute('aria-label', chosenLang.ui.breatheTitle);
      el.breatheTrigger.setAttribute('title', chosenLang.ui.breatheTitle);
      const svg = el.breatheTrigger.querySelector('svg');
      if (svg) svg.setAttribute('aria-label', chosenLang.ui.breatheTitle);
    }
    if (el.pickerLangLock) {
      const faSpan = el.pickerLangLock.querySelector('.picker__lang-lock-fa');
      const enSpan = el.pickerLangLock.querySelector('.picker__lang-lock-en');
      if (chosenLang.code === 'fa') {
        if (faSpan) faSpan.hidden = false;
        if (enSpan) enSpan.hidden = true;
      } else {
        if (faSpan) faSpan.hidden = true;
        if (enSpan) enSpan.hidden = false;
      }
    }
  }

  function selectLanguage(chosenLang) {
    applyLanguage(chosenLang);
    el.picker.hidden = true;
    el.app.hidden = false;
    st.chatActive = true;
    startConversation();
  }

  function showPicker() {
    st.conversationGeneration += 1;
    setTypingVisible(false);
    window.DaryaOverlays.dismissBreathe();
    window.DaryaOverlays.hideExitConfirmBar();
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
    el.chat.innerHTML = '';
    st.messageCount = 0;
    st.currentTitle = '';
    if (el.pickerLangLock) {
      const faSpan = el.pickerLangLock.querySelector('.picker__lang-lock-fa');
      const enSpan = el.pickerLangLock.querySelector('.picker__lang-lock-en');
      if (faSpan) faSpan.hidden = false;
      if (enSpan) enSpan.hidden = false;
    }
    window.scrollTo(0, 0);
    try { sessionStorage.removeItem(UI.constants.SESSION_KEY); } catch (e) { /* ignore */ }
  }

  // ========================================================================
  // Conversation flow
  // ========================================================================

  async function startConversation() {
    const generation = ++st.conversationGeneration;
    window.DaryaAmbient.initBeachWaveVariation();
    st.engine = new DaryaResponseEngine(st.lang);
    st.conversationEnded = false;
    st.transcript = [];
    el.chat.innerHTML = '';
    st.messageCount = 0;
    st.currentTitle = '';
    setHint('');
    el.input.setAttribute('placeholder', st.lang.ui.placeholderDefault);
    setComposerBusy(true);
    hideBreatheTrigger();

    const delivered = await deliverReply(st.engine.greeting(), generation);
    if (!delivered || generation !== st.conversationGeneration) return;

    setComposerBusy(false);
    if (el.chat.children.length > 0) {
      UI.utils.restoreScrollPosition();
    }
    UI.utils.focusInputUnlessTouch();
  }

  function showBreatheTrigger() {
    if (el.breatheTrigger) el.breatheTrigger.hidden = false;
  }

  function hideBreatheTrigger() {
    if (el.breatheTrigger) el.breatheTrigger.hidden = true;
  }

  function confirmExitYes() {
    if (st.exitConfirmBusy || !st.engine) return;
    st.exitConfirmBusy = true;
    window.DaryaOverlays.hideExitConfirmBar();
    const generation = st.conversationGeneration;
    const replyText = st.engine.farewell();
    setComposerBusy(true);
    deliverReply(replyText, generation).then((delivered) => {
      if (!delivered || generation !== st.conversationGeneration) return;
      st.conversationEnded = true;
      st.pendingExit = false;
      el.input.setAttribute('placeholder', st.lang.ui.placeholderEnded);
      hideBreatheTrigger();
      setComposerBusy(false);
      st.exitConfirmBusy = false;
    });
  }

  function confirmExitNo() {
    st.pendingExit = false;
    window.DaryaOverlays.hideExitConfirmBar();
    UI.utils.focusInputUnlessTouch();
  }

  async function sendMessage(text) {
    const generation = st.conversationGeneration;
    UI.utils.appendMessage('user', text);
    el.input.value = '';
    setComposerBusy(true);

    const isExit = st.engine.isExitCommand(text);

    if (isExit && st.pendingExit) {
      const replyText = st.engine.farewell();
      const delivered = await deliverReply(replyText, generation);
      if (!delivered || generation !== st.conversationGeneration) return;
      st.conversationEnded = true;
      st.pendingExit = false;
      el.input.setAttribute('placeholder', st.lang.ui.placeholderEnded);
      hideBreatheTrigger();
      setComposerBusy(false);
      return;
    }

    if (isExit && !st.pendingExit) {
      const replyText = st.engine.exitConfirmation();
      const delivered = await deliverReply(replyText, generation);
      if (!delivered || generation !== st.conversationGeneration) return;
      st.pendingExit = true;
      setComposerBusy(false);
      window.DaryaOverlays.showExitConfirmBar();
      return;
    }

    st.pendingExit = false;
    window.DaryaOverlays.hideExitConfirmBar();
    const replyText = st.engine.respond(text);

    const delivered = await deliverReply(replyText, generation);
    if (!delivered || generation !== st.conversationGeneration) return;

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

  function openMenu() {
    el.menuPopover.hidden = false;
    el.menuTrigger.setAttribute('aria-expanded', 'true');
    menuFocusIndex = 0;
    const items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
    requestAnimationFrame(() => items[menuFocusIndex]?.focus());
  }

  function closeMenu(restoreFocus = false) {
    el.menuPopover.hidden = true;
    el.menuTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) el.menuTrigger.focus();
  }

  function moveMenuFocus(step) {
    const items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
    if (items.length === 0) return;
    menuFocusIndex = (menuFocusIndex + step + items.length) % items.length;
    items[menuFocusIndex].focus();
  }

  function toggleMenu() {
    if (el.menuPopover.hidden) openMenu();
    else closeMenu();
  }

  // ========================================================================
  // Event wiring
  // ========================================================================

  el.pickerFa.addEventListener('click', () => selectLanguage(window.DaryaLang.fa));
  el.pickerEn.addEventListener('click', () => selectLanguage(window.DaryaLang.en));

  el.themeToggleButtons.forEach((button) => {
    button.addEventListener('click', () => UI.theme.applyTheme(button.dataset.themeChoice));
  });

  el.composer.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = el.input.value.trim();
    if (!text || st.conversationEnded || st.waitingForReply || UI.utils.hasForeignLetters(text)) return;
    sendMessage(text);
  });

  el.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      el.composer.requestSubmit();
    }
  });

  el.input.addEventListener('input', refreshComposerState);
  el.input.addEventListener('focus', () => UI.utils.scrollToBottom());

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => UI.utils.scrollToBottom());
  }

  el.menuTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  el.menuPopover.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveMenuFocus(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveMenuFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      menuFocusIndex = 0;
      const items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      menuFocusIndex = items.length - 1;
      items.at(-1)?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (!el.menuPopover.hidden
      && !el.menuPopover.contains(event.target)
      && event.target !== el.menuTrigger) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !el.menuPopover.hidden) {
      closeMenu(true);
    }
  });

  el.menuNewChat.addEventListener('click', () => {
    closeMenu();
    if (st.chatActive) {
      window.DaryaOverlays.showNewChatConfirm(showPicker);
    } else {
      window.DaryaOverlays.dismissNewChatConfirm();
      showPicker();
    }
  });

  el.menuExportMd.addEventListener('click', () => {
    closeMenu();
    window.DaryaExport.exportMarkdown();
  });

  el.menuExportTxt.addEventListener('click', () => {
    closeMenu();
    window.DaryaExport.exportPlainText();
  });

  el.menuThemeToggle.addEventListener('click', () => {
    UI.theme.applyTheme(el.menuThemeToggle.dataset.themeChoice);
    closeMenu();
  });

  if (el.breatheTrigger) {
    el.breatheTrigger.addEventListener('click', () => {
      window.DaryaOverlays.showBreatheExercise();
    });
  }

  if (el.exitConfirmYes) {
    el.exitConfirmYes.addEventListener('click', confirmExitYes);
    el.exitConfirmYes.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        confirmExitYes();
      }
    });
  }
  if (el.exitConfirmNo) {
    el.exitConfirmNo.addEventListener('click', confirmExitNo);
    el.exitConfirmNo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        confirmExitNo();
      }
    });
  }
  if (el.exitConfirmBar) {
    el.exitConfirmBar.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        confirmExitNo();
      }
    });
  }

  el.chat.addEventListener('scroll', () => {
    UI.utils.saveScrollPosition();
  }, { passive: true });

  // ========================================================================
  // Refresh / close guard
  // ========================================================================

  window.addEventListener('beforeunload', (event) => {
    if (!st.chatActive) return undefined;
    event.preventDefault();
    event.returnValue = '';
    return '';
  });

  // ========================================================================
  // Offline support
  // ========================================================================

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Service worker registration failed (app still works online):', error);
      });
    });
  }

  // ========================================================================
  // Boot
  // ========================================================================

  let storedTheme = UI.theme.getCookie(UI.constants.THEME_COOKIE_NAME);
  if (!storedTheme && typeof window.localStorage === 'object') {
    try { storedTheme = localStorage.getItem(UI.constants.THEME_COOKIE_NAME); } catch (e) { /* ignore */ }
  }
  UI.theme.applyTheme(storedTheme || UI.constants.DEFAULT_THEME);
  window.DaryaAmbient.initBeachWaveVariation();
  window.DaryaAmbient.initBubbles();
  window.DaryaAmbient.initBirdShadows();
})();
