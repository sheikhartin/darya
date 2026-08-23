/**
 * Darya - chat scrollbar reveal (part file).
 *
 * The chat's scrollbar is quiet by design (see the scrollbar block in
 * css/style.css): on touch devices it is hidden entirely, matching chat
 * app convention, and on pointer devices it is invisible at rest and
 * appears only while the reader is actually scrolling.
 *
 * This part toggles the .chat--scrolling modifier from real reader
 * input only: wheel or trackpad movement, touch movement, and the
 * scroll keys. The app's own programmatic autoscroll (typing replies,
 * the jump-to-latest pill) must never flash the bar, so plain scroll
 * events are deliberately ignored: they also fire for every
 * scrollTop assignment the app makes while following the live edge.
 */
(function (global) {
  'use strict';

  /** How long after the last scroll input the bar hides again (ms). */
  var SCROLL_IDLE_MS = 700;

  /** Keys that scroll the chat and therefore reveal the bar. */
  var SCROLL_KEYS = [
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' '
  ];

  /**
   * Wires the scrollbar reveal to the chat container.
   * @param {HTMLElement} chat - The scrollable chat container
   * @param {number} [idleMs] - Idle timeout override, for tests
   */
  function createScrollbarReveal(chat, idleMs) {
    var idleDelay = typeof idleMs === 'number' ? idleMs : SCROLL_IDLE_MS;
    var hideTimer = null;

    /** Reveals the bar and (re)arms the idle timer that hides it. */
    function revealScrollbar() {
      chat.classList.add('chat--scrolling');
      if (hideTimer !== null) {
        clearTimeout(hideTimer);
      }
      hideTimer = setTimeout(function () {
        hideTimer = null;
        chat.classList.remove('chat--scrolling');
      }, idleDelay);
    }

    chat.addEventListener('wheel', revealScrollbar, { passive: true });
    chat.addEventListener('touchmove', revealScrollbar, { passive: true });
    chat.addEventListener('keydown', function (event) {
      if (SCROLL_KEYS.indexOf(event.key) !== -1) {
        revealScrollbar();
      }
    });
  }

  const DaryaScrollbar = {
    create: createScrollbarReveal
  };

  global.DaryaScrollbar = DaryaScrollbar;
})(typeof window !== 'undefined' ? window : globalThis);
