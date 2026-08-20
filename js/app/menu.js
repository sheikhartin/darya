/**
 * Darya - chat menu (part file).
 * Provides the menu popover keyboard/pointer behavior as a factory bound
 * to the shared controller object created by index.js.
 */
(function (global) {
  'use strict';

  /**
   * Creates the menu functions.
   * @param {object} ctrl - Shared controller state (see app.js)
   * @returns {object} Functions for the chat menu
   */
  function createMenu(ctrl) {
    const { el } = ctrl;

    /**
     * Opens the menu popover and focuses the first menu item.
     */
    function openMenu() {
      el.menuPopover.hidden = false;
      el.menuTrigger.setAttribute('aria-expanded', 'true');
      // Reflect the honest sound state when the menu opens so a rare
      // silent failure can never leave a stale "on" icon.
      if (typeof ctrl.DaryaAmbientSound !== 'undefined') {
        ctrl.syncSoundToggleUI(ctrl.DaryaAmbientSound.isPlaying());
      }
      ctrl.menuFocusIndex = 0;
      var items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      requestAnimationFrame(function () {
        if (items[ctrl.menuFocusIndex]) {
          items[ctrl.menuFocusIndex].focus();
        }
      });
    }

    /**
     * Closes the menu popover, optionally restoring focus to the trigger.
     * @param {boolean} restoreFocus
     */
    function closeMenu(restoreFocus) {
      el.menuPopover.hidden = true;
      el.menuTrigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        el.menuTrigger.focus();
      }
    }

    /**
     * Moves the menu focus by a given step (1 = next, -1 = previous).
     * Wraps around at the first and last items.
     * @param {number} step
     */
    function moveMenuFocus(step) {
      var items = [...el.menuPopover.querySelectorAll('[role="menuitem"]')];
      if (items.length === 0) {
        return;
      }
      ctrl.menuFocusIndex =
        (ctrl.menuFocusIndex + step + items.length) % items.length;
      if (items[ctrl.menuFocusIndex]) {
        items[ctrl.menuFocusIndex].focus();
      }
    }

    /**
     * Toggles menu visibility.
     */
    function toggleMenu() {
      if (el.menuPopover.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    }

    /**
     * Moves focus to the visible focusable element before or after the menu
     * trigger. Used when Tab closes the open menu: the popover is hidden by
     * then, so this resolves the document tab order cleanly and hands focus
     * to the next real control instead of dropping it on <body>.
     * @param {number} step - 1 for next, -1 for previous
     */
    function focusMenuTriggerSibling(step) {
      var focusables = [
        ...document.querySelectorAll(
          'a[href]:not([tabindex="-1"]), ' +
            'button:not([disabled]):not([tabindex="-1"]), ' +
            'input:not([disabled]):not([tabindex="-1"]), ' +
            'textarea:not([disabled]):not([tabindex="-1"]), ' +
            'select:not([disabled]):not([tabindex="-1"]), ' +
            '[tabindex]:not([tabindex="-1"])'
        )
      ].filter(function (node) {
        // Keep only elements that are actually rendered and in the real
        // tab order. Hidden picker/menu items are excluded via offsetParent
        // being null (display: none); the breathe trigger and the
        // jump-to-latest pill collapse via visibility:hidden, which keeps
        // them out of the tab order even though their offsetParent stays
        // non-null, so they are filtered on computed visibility here.
        if (node.offsetParent === null) {
          return false;
        }
        return global.getComputedStyle(node).visibility !== 'hidden';
      });
      var index = focusables.indexOf(el.menuTrigger);
      if (index === -1) {
        return;
      }
      var target = focusables[index + step];
      if (target) {
        target.focus();
      }
    }

    return {
      openMenu,
      closeMenu,
      moveMenuFocus,
      toggleMenu,
      focusMenuTriggerSibling
    };
  }

  global.DaryaAppMenu = {
    create: createMenu
  };
})(typeof window !== 'undefined' ? window : globalThis);
