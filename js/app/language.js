/**
 * Darya - language selection and picker (part file).
 * Provides applyLanguage, selectLanguage, and showPicker as a factory
 * bound to the shared controller object created by index.js.
 */
(function (global) {
  'use strict';

  /**
   * Creates the language-selection functions.
   * @param {object} ctrl - Shared controller state (see app.js)
   * @returns {object} Functions for language selection and the picker
   */
  function createLanguage(ctrl) {
    const { UI, el, st } = ctrl;

    /**
     * Applies the chosen language to the entire UI: sets dir/lang attributes,
     * updates all text labels, and configures the engine.
     * @param {object} chosenLang - Language pack (DaryaLang.en or DaryaLang.fa)
     */
    function applyLanguage(chosenLang) {
      st.lang = chosenLang;

      // Sync the document-level dir and lang so the full page layout (header,
      // menu, composer, disclaimer) mirrors to match the active language.
      // Individual chat bubbles and the composer input also get per-element
      // dir/lang set later in this function and in core.js.
      el.htmlRoot.setAttribute('dir', chosenLang.dir);
      el.htmlRoot.setAttribute('lang', chosenLang.code);

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
      el.menuExportTxt.setAttribute(
        'aria-label',
        chosenLang.ui.menuExportTitle
      );
      el.menuExportTxt.setAttribute('title', chosenLang.ui.menuExportTitle);
      el.themePicker.setAttribute('aria-label', chosenLang.ui.themeGroupLabel);
      el.typingStatus.setAttribute('aria-label', chosenLang.ui.typingLabel);
      el.menuNewChatLabel.textContent = chosenLang.ui.menuNewChat;
      el.menuExportTxtLabel.textContent = chosenLang.ui.menuExportLabel;
      el.disclaimer.textContent = chosenLang.ui.disclaimer;
      UI.theme.updateThemeMenuItem();

      if (el.breatheTrigger) {
        el.breatheTrigger.setAttribute(
          'aria-label',
          chosenLang.ui.breatheTitle
        );
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
      if (typeof ctrl.DaryaAmbientSound !== 'undefined') {
        ctrl.syncSoundToggleUI(ctrl.DaryaAmbientSound.isPlaying());
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
      // Leaving the picker stops any sound-attention nudge: the language
      // click is itself a gesture that can start the sound.
      ctrl.clearSoundAttention();
      ctrl.startConversation();

      // Auto-play ambient sound if the user previously opted in, syncing
      // the toggle to the ACTUAL result: if the browser blocks the
      // automatic start, the toggle rolls back to "off" and a brief toast
      // points to the menu toggle for a gesture-based start.
      if (typeof ctrl.DaryaAmbientSound !== 'undefined') {
        var soundIntentOn = ctrl.DaryaAmbientSound.getSavedState() === true;
        ctrl.DaryaAmbientSound.autoplayIfEnabled().then(function () {
          // Sync from the ACTUAL playback state: an autoplay attempt can
          // keep the user's intent (a transient policy rejection) without
          // any audio running, and the toggle must never claim sound is
          // playing when it is not.
          var actuallyPlaying = ctrl.DaryaAmbientSound.isPlaying();
          ctrl.syncSoundToggleUI(actuallyPlaying);
          if (!actuallyPlaying && soundIntentOn) {
            ctrl.notifySoundAutoplayBlocked();
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
      ctrl.setTypingVisible(false);
      ctrl.DaryaOverlays.dismissBreathe();
      ctrl.DaryaOverlays.hideExitConfirmBar();
      st.pendingExit = false;
      st.exitConfirmBusy = false;
      el.app.hidden = true;
      el.picker.hidden = false;
      ctrl.closeMenu();
      st.lang = null;
      // Restore document-level defaults so the picker always renders in its
      // native RTL layout; the next applyLanguage() call will set the real
      // dir/lang when the user picks a language.
      el.htmlRoot.setAttribute('dir', 'rtl');
      el.htmlRoot.setAttribute('lang', 'fa');
      st.engine = null;
      st.conversationEnded = false;
      st.chatActive = false;
      st.transcript = [];
      if (el.chat) {
        el.chat.replaceChildren();
      }
      st.messageCount = 0;
      st.currentTitle = '';
      st.userSpoke = false;
      // Sync the picker sound toggle with the actual playback state so the
      // toggle shows correctly when returning to the picker, then arm the
      // attention nudge for the saved-but-silent case.
      if (typeof ctrl.DaryaAmbientSound !== 'undefined') {
        ctrl.syncSoundToggleUI(ctrl.DaryaAmbientSound.isPlaying());
      }
      ctrl.armSoundAttention();
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

    return {
      applyLanguage,
      selectLanguage,
      showPicker
    };
  }

  global.DaryaAppLanguage = {
    create: createLanguage
  };
})(typeof window !== 'undefined' ? window : globalThis);
