/**
 * Darya - cursor-tracked glass glint.
 *
 * A whisper-light specular highlight that follows the pointer across the
 * interactive glass surfaces, so the material reads as lit from the
 * user's hand rather than a flat texture. The highlight itself is a
 * pointer-events:none pseudo-element positioned at the --glint-x /
 * --glint-y custom properties this module writes; see the glint section
 * of css/style.css.
 *
 * The tracking is decorative and strictly optional: it is skipped on
 * touch-primary devices (no pointer to track) and under
 * prefers-reduced-motion, and it never reads or writes anything but the
 * two custom properties on the hovered element, so it cannot affect the
 * conversation or assistive technology.
 */
(function (global) {
  'use strict';

  // Elements that carry the glint. Kept in sync with the ::after /
  // ::before selectors at the end of css/style.css. Menu items and the
  // picker options are listed here and matched via closest() so the
  // highlight follows the pointer even when it is over a child node
  // (an icon or a label span) rather than the element itself.
  const GLINT_SELECTOR = [
    '.picker__option',
    '.theme-picker__option',
    '.menu__item',
    '.menu__popover',
    '.quick-reply',
    '.confirm-container',
    '.picker__sound-toggle',
    '.menu__trigger',
    '.breathe-trigger'
  ].join(', ');

  function reducedMotion() {
    return (
      typeof global.matchMedia === 'function' &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function initGlint() {
    if (reducedMotion() || typeof global.document === 'undefined') {
      return;
    }
    // A coarse pointer (touch) has no hovering cursor, and a synthetic
    // tap mousemove should not flash the highlight.
    if (
      typeof global.matchMedia === 'function' &&
      global.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }
    global.document.addEventListener(
      'mousemove',
      function (event) {
        const target =
          event.target && typeof event.target.closest === 'function'
            ? event.target.closest(GLINT_SELECTOR)
            : null;
        if (!target) {
          return;
        }
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--glint-x', event.clientX - rect.left + 'px');
        target.style.setProperty('--glint-y', event.clientY - rect.top + 'px');
      },
      { passive: true }
    );
  }

  global.DaryaGlint = { init: initGlint };
})(typeof window !== 'undefined' ? window : globalThis);
