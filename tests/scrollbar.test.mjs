/**
 * Tests for the chat scrollbar reveal (js/app/scrollbar.js) and the
 * quiet-scrollbar CSS policy.
 *
 * The chat scrollbar is hidden entirely on touch devices and invisible
 * at rest on pointer devices: it appears only while the reader is
 * actually scrolling, driven by the .chat--scrolling modifier, and
 * hides again after a short idle. Programmatic autoscroll (the app
 * following the live edge while typing replies) must never reveal it,
 * which is why only wheel, touch, and scroll-key input toggle the
 * modifier and plain scroll events are ignored.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');

/**
 * A stand-in for the chat container that records class changes and
 * event listeners.
 * @returns {{ element: object, handlers: object, classes: Set<string> }}
 */
function fakeChat() {
  const handlers = {};
  const classes = new Set();
  const element = {
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      }
    },
    addEventListener(type, handler) {
      handlers[type] = handler;
    }
  };
  return { element, handlers, classes };
}

/**
 * Loads scrollbar.js into a sandbox that exposes the fake chat global
 * environment, then wires it to the fake element.
 * @param {number} idleMs - Idle timeout override for fast tests
 * @returns {Promise<{ element: object, handlers: object, classes: Set<string> }>}
 */
async function wireScrollbar(idleMs) {
  const chat = fakeChat();
  const sandbox = { setTimeout, clearTimeout, console };
  const context = vm.createContext(sandbox);
  vm.runInContext(read('js/app/scrollbar.js'), context, {
    filename: 'js/app/scrollbar.js'
  });
  sandbox.DaryaScrollbar.create(chat.element, idleMs);
  return chat;
}

/** Waits long enough for timers with the given budget to fire. */
const waitOut = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms + 20);
  });

test('wheel input reveals the bar, then hides it after the idle delay', async () => {
  const chat = await wireScrollbar(30);
  chat.handlers.wheel();
  assert.ok(chat.classes.has('chat--scrolling'), 'revealed on wheel');
  await waitOut(30);
  assert.equal(
    chat.classes.has('chat--scrolling'),
    false,
    'hidden again after idling'
  );
});

test('repeated input keeps the bar visible until input stops', async () => {
  const chat = await wireScrollbar(60);
  chat.handlers.wheel();
  await waitOut(30);
  chat.handlers.wheel();
  await waitOut(30);
  // The second wheel reset the timer: 60ms after the first event the
  // bar must still be up.
  assert.ok(chat.classes.has('chat--scrolling'));
  await waitOut(60);
  assert.equal(chat.classes.has('chat--scrolling'), false);
});

test('touch movement reveals the bar', async () => {
  const chat = await wireScrollbar(30);
  chat.handlers.touchmove();
  assert.ok(chat.classes.has('chat--scrolling'));
  await waitOut(30);
});

test('scroll keys reveal the bar, other keys do not', async () => {
  const chat = await wireScrollbar(30);
  chat.handlers.keydown({ key: 'a' });
  assert.equal(chat.classes.has('chat--scrolling'), false, 'letter key');
  chat.handlers.keydown({ key: 'PageUp' });
  assert.ok(chat.classes.has('chat--scrolling'), 'PageUp reveals');
  await waitOut(30);
  chat.handlers.keydown({ key: 'ArrowDown' });
  assert.ok(chat.classes.has('chat--scrolling'), 'ArrowDown reveals');
  await waitOut(30);
  chat.handlers.keydown({ key: 'Enter' });
  assert.equal(chat.classes.has('chat--scrolling'), false, 'Enter key');
});

test('the reveal is wired only to input events, never plain scroll', () => {
  const chat = fakeChat();
  const sandbox = { setTimeout, clearTimeout, console };
  const context = vm.createContext(sandbox);
  vm.runInContext(read('js/app/scrollbar.js'), context, {
    filename: 'js/app/scrollbar.js'
  });
  const listeners = [];
  const chatWithRecorder = {
    classList: chat.element.classList,
    addEventListener(type) {
      listeners.push(type);
    }
  };
  sandbox.DaryaScrollbar.create(chatWithRecorder);
  assert.deepEqual(listeners.sort(), ['keydown', 'touchmove', 'wheel']);
});

// ======================================================================
// The CSS stays on the quiet-scrollbar policy
// ======================================================================

test('the chat scrollbar is fully hidden on touch devices', () => {
  const css = read('css/style.css');
  const coarseBlock = css.match(/@media \(pointer: coarse\) \{[\s\S]*?\n\}/u);
  assert.ok(coarseBlock, 'a pointer: coarse block exists');
  assert.match(coarseBlock[0], /scrollbar-width: none/u);
  assert.match(coarseBlock[0], /-webkit-scrollbar[\s\S]*?width: 0/u);
});

test('the chat scrollbar is transparent at rest and themed while scrolling', () => {
  const css = read('css/style.css');
  const fineBlock = css.match(/@media \(pointer: fine\) \{[\s\S]*?\n\}\n/u);
  assert.ok(fineBlock, 'a pointer: fine block exists');
  // Invisible at rest...
  assert.match(fineBlock[0], /scrollbar-color: transparent transparent/u);
  assert.match(
    fineBlock[0],
    /-webkit-scrollbar-thumb \{[^}]*background: transparent/u
  );
  // ...and carrying the theme color only under the scrolling modifier.
  assert.match(
    fineBlock[0],
    /\.chat--scrolling \{[^}]*--color-tide-soft/u,
    'ocean scrolling thumb uses the theme token'
  );
  assert.match(
    fineBlock[0],
    /data-theme='beach'\] \.chat--scrolling/u,
    'beach theme has its own scrolling thumb'
  );
});

test('the scrollbar part is wired into the shell', () => {
  assert.match(read('index.html'), /js\/app\/scrollbar\.js/u);
  assert.match(read('sw.js'), /'\.\/js\/app\/scrollbar\.js'/u);
  assert.match(read('js/app/index.js'), /DaryaScrollbar\.create\(el\.chat\)/u);
});
