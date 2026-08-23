/**
 * Darya - hardware back navigation (part file).
 *
 * Android's back gesture/button follows the app's navigation stack,
 * and in the native shell that stack is the app's own surfaces, not
 * page history. Back unwinds one surface at a time, outermost first:
 *
 *   1. the open menu popover closes;
 *   2. the new-chat confirmation dialog closes;
 *   3. the breathing overlay closes;
 *   4. the pending end-of-conversation bar cancels (stay chatting);
 *   5. an active conversation asks for confirmation before ending,
 *      exactly like saying goodbye does;
 *   6. an already-ended conversation returns to the picker;
 *   7. on the picker itself, back leaves the app to the device home
 *      screen.
 *
 * The shell plugin (ShellPlugin.java) emits the backButton event only
 * when this policy subscribed, so a page that never boots keeps the
 * platform default. In browsers this part is inert.
 */
(function (global) {
  'use strict';

  var DaryaNative = global.DaryaNative;

  /**
   * Wires the back policy to the app state.
   * @param {object} ctrl - Shared controller state (see index.js)
   */
  function createBackButton(ctrl) {
    var el = ctrl.el;
    var st = ctrl.st;

    /**
     * Runs one back press through the surface stack.
     */
    function handleHardwareBack() {
      if (el.menuPopover && !el.menuPopover.hidden) {
        ctrl.closeMenu(true);
        return;
      }
      if (ctrl.DaryaOverlays.isConfirmVisible()) {
        ctrl.DaryaOverlays.dismissNewChatConfirm();
        return;
      }
      if (ctrl.DaryaOverlays.isBreatheVisible()) {
        ctrl.DaryaOverlays.dismissBreathe();
        return;
      }
      if (el.exitConfirmBar && !el.exitConfirmBar.hidden) {
        // Mirrors Escape on the bar: cancel the pending farewell.
        ctrl.confirmExitNo();
        return;
      }
      if (st.chatActive && !st.conversationEnded) {
        // Same state the conversational goodbye flow sets, so the Yes
        // and No buttons keep their exact semantics.
        st.pendingExit = true;
        st.exitConfirmShown = true;
        ctrl.DaryaOverlays.showExitConfirmBar();
        return;
      }
      if (st.chatActive && st.conversationEnded) {
        ctrl.showPicker();
        return;
      }
      DaryaNative.leaveApp();
    }

    if (
      DaryaNative &&
      typeof DaryaNative.onHardwareBack === 'function' &&
      typeof DaryaNative.leaveApp === 'function'
    ) {
      DaryaNative.onHardwareBack(handleHardwareBack);
    }
  }

  global.DaryaAppBackButton = {
    create: createBackButton
  };
})(typeof window !== 'undefined' ? window : globalThis);
