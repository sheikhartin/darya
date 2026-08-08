/**
 * Darya - overlay module (main file).
 *
 * Assembles the public DaryaOverlays API from three feature part files:
 *   - overlays-breathe.js: the guided 4-7-8 breathing exercise
 *   - overlays-confirm.js: the new-chat reset confirmation dialog and
 *     the exit confirmation bar
 *   - overlays-notify.js: the toast-style notification banner
 *
 * Each part registers a factory (global.DaryaOverlays*, .create) that
 * owns its own closure state. Load order: core.js (DaryaUI), then the
 * three part files, then this assembler.
 */
(function (global) {
  'use strict';

  const breathe = global.DaryaOverlaysBreathe.create();
  const confirm = global.DaryaOverlaysConfirm.create();
  const notify = global.DaryaOverlaysNotify.create();

  const DaryaOverlays = {
    dismissBreathe: breathe.dismissBreathe,
    showBreatheExercise: breathe.showBreatheExercise,
    dismissNewChatConfirm: confirm.dismissNewChatConfirm,
    showNewChatConfirm: confirm.showNewChatConfirm,
    showExitConfirmBar: confirm.showExitConfirmBar,
    hideExitConfirmBar: confirm.hideExitConfirmBar,
    dismissNotification: notify.dismissNotification,
    showNotification: notify.showNotification
  };

  global.DaryaOverlays = DaryaOverlays;
})(typeof window !== 'undefined' ? window : globalThis);
