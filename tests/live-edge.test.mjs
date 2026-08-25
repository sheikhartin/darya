/**
 * Live-edge and composer-availability regressions found on a real
 * Android phone (Samsung A03, Samsung keyboard):
 *
 * 1. The jump-to-latest pill surfaced for readers who never scrolled:
 *    opening the on-screen keyboard shrinks the chat viewport and the
 *    browser clamps the pinned bottom by exactly that delta; the old
 *    handler treated every scroll that was not near the bottom as
 *    reading intent, so tapping the composer or Darya's reply
 *    arriving flipped follow mode off and the pill appeared.
 *
 * 2. Sending a message disabled the focused input mid-reply, which
 *    detached the phone's virtual keyboard (the space bar was left
 *    stale and white on the Samsung IME) and forced the reader to tap
 *    the composer again to keep typing. The send path is already
 *    guarded by waitingForReply and the disabled send button, so the
 *    input must stay enabled while Darya composes.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');

// ---------------------------------------------------------------------------
// core.js (scroll / jump pill) in a minimal fake DOM
// ---------------------------------------------------------------------------

/** Generic stand-in for a DOM element core.js only references. */
function makeStub(key) {
  const classes = new Set();
  return {
    _key: key,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      toggle: (name, force) => {
        if (force === undefined) {
          if (classes.has(name)) {
            classes.delete(name);
          } else {
            classes.add(name);
          }
        } else if (force) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
      },
      contains: (name) => classes.has(name)
    },
    style: {},
    hidden: false,
    textContent: '',
    value: '',
    disabled: false,
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    appendChild() {},
    insertBefore() {},
    replaceChildren() {},
    scrollTo() {},
    querySelector: () => null
  };
}

/**
 * Loads js/ui/core.js into a sandbox whose document returns the given
 * registered elements by id/selector and generic stubs for the rest.
 * @param {object} registry - Map of id/selector to element stand-in
 * @returns {{ sandbox: object, rafQueue: Function[] }}
 */
function loadCore(registry) {
  const stubs = new Map();
  const lookup = (key) => {
    if (registry[key]) {
      return registry[key];
    }
    if (!stubs.has(key)) {
      stubs.set(key, makeStub(key));
    }
    return stubs.get(key);
  };
  const document = {
    getElementById: (id) => lookup(id),
    querySelector: (sel) => lookup(sel),
    querySelectorAll: () => [],
    createElement: (tag) => makeStub('created-' + tag),
    cookie: ''
  };
  const rafQueue = [];
  const sandbox = {
    document,
    requestAnimationFrame: (fn) => {
      rafQueue.push(fn);
      return rafQueue.length;
    },
    setTimeout: () => 0,
    clearTimeout: () => {},
    console
  };
  vm.createContext(sandbox);
  vm.runInContext(read('js/ui/core.js'), sandbox, {
    filename: 'js/ui/core.js'
  });
  return { sandbox, rafQueue };
}

/**
 * Builds the chat and jump-button stand-ins for the follow-mode tests:
 * the chat grows its scrollHeight as rows are inserted and records
 * class changes on the jump control.
 * @returns {{ chat: object, jump: object }}
 */
function makeLiveEdgeDom() {
  const chat = makeStub('chat');
  chat.clientHeight = 400;
  chat.scrollHeight = 1000;
  // Browsers clamp scrollTop to [0, scrollHeight - clientHeight] on
  // every assignment; the fake must do the same so the pinned-bottom
  // math matches a real container.
  let storedTop = 0;
  Object.defineProperty(chat, 'scrollTop', {
    get: () => storedTop,
    set: (value) => {
      const max = Math.max(0, chat.scrollHeight - chat.clientHeight);
      storedTop = Math.min(Math.max(0, value), max);
    },
    configurable: true
  });
  storedTop = 600; // pinned at the bottom: 1000 - 400
  chat.insertBefore = (row) => {
    chat.scrollHeight += 200;
  };
  chat.appendChild = () => {
    chat.scrollHeight += 200;
  };
  const jump = makeStub('chat-jump');
  return { chat, jump };
}

/** Dispatches a scroll event the way index.js wires it. */
function fireScroll(core) {
  core.DaryaUI.utils.handleChatScroll();
}

/** Runs the queued animation frames (the pinned-bottom rAF). */
function flushRaf(rafQueue) {
  while (rafQueue.length > 0) {
    const fn = rafQueue.shift();
    fn();
  }
}

function isPillVisible(jump) {
  return jump.classList.contains('chat-jump--show');
}

test('keyboard resize that clamps the pinned bottom never shows the jump pill', () => {
  const { chat, jump } = makeLiveEdgeDom();
  const { sandbox, rafQueue } = loadCore({
    chat: chat,
    'chat-jump': jump
  });
  const { DaryaUI } = sandbox;
  DaryaUI.state.chatActive = true;

  // Baseline: the reader sits at the live edge with the keyboard closed.
  fireScroll(sandbox);
  assert.equal(sandbox.DaryaUI.state.followingLatest, true);
  assert.equal(isPillVisible(jump), false);

  // The on-screen keyboard opens: the viewport shrinks by 60px and the
  // browser clamps the pinned bottom by exactly that delta. The old
  // handler read the transient "not near bottom" state as the reader
  // scrolling away and raised the pill.
  chat.clientHeight = 340;
  chat.scrollTop = 540;
  fireScroll(sandbox);
  assert.equal(
    sandbox.DaryaUI.state.followingLatest,
    true,
    'a resize clamp must not end follow mode'
  );
  assert.equal(
    isPillVisible(jump),
    false,
    'the jump pill must stay hidden for a reader who never scrolled'
  );
  void rafQueue;
});

test('a real reader scroll up shows the pill; returning to the bottom hides it', () => {
  const { chat, jump } = makeLiveEdgeDom();
  const { sandbox, rafQueue } = loadCore({
    chat: chat,
    'chat-jump': jump
  });
  sandbox.DaryaUI.state.chatActive = true;
  fireScroll(sandbox);

  // The reader swipes up to re-read (height unchanged, offset moves).
  chat.scrollTop = 300;
  fireScroll(sandbox);
  assert.equal(sandbox.DaryaUI.state.followingLatest, false);
  assert.equal(isPillVisible(jump), true, 'pill must appear on real scroll up');

  // A new bot message while reading: position preserved, pill stays.
  sandbox.DaryaUI.utils.appendMessage(
    'bot',
    'A new message arrived while reading.'
  );
  flushRaf(rafQueue);
  assert.equal(chat.scrollTop, 300, 'reading position must be preserved');
  assert.equal(sandbox.DaryaUI.state.followingLatest, false);
  assert.equal(isPillVisible(jump), true);

  // The reader swipes back down to the live edge: follow re-arms.
  chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  fireScroll(sandbox);
  assert.equal(sandbox.DaryaUI.state.followingLatest, true);
  assert.equal(isPillVisible(jump), false);
});

test('bot output follows the live edge while the reader is following', () => {
  const { chat, jump } = makeLiveEdgeDom();
  const { sandbox, rafQueue } = loadCore({
    chat: chat,
    'chat-jump': jump
  });
  sandbox.DaryaUI.state.chatActive = true;
  fireScroll(sandbox);

  // Keyboard open and clamp, as on the phone, while still following.
  chat.clientHeight = 340;
  chat.scrollTop = 540;
  fireScroll(sandbox);

  // Darya's reply lands: it must pin the view and keep the pill hidden.
  sandbox.DaryaUI.utils.appendMessage(
    'bot',
    'A reply arrives with the keyboard open.'
  );
  flushRaf(rafQueue);
  assert.equal(
    chat.scrollHeight - chat.scrollTop - chat.clientHeight,
    0,
    'the reply must stay pinned at the live edge'
  );
  assert.equal(sandbox.DaryaUI.state.followingLatest, true);
  assert.equal(isPillVisible(jump), false, 'no pill for a following reader');
});

// ---------------------------------------------------------------------------
// composer.js (input availability during reply generation)
// ---------------------------------------------------------------------------

/**
 * Instantiates the composer factory with fake elements and state.
 * @returns {{ composer: object, input: object, sendButton: object, st: object }}
 */
function loadComposer() {
  const input = makeStub('composer-input');
  input.scrollHeight = 24;
  input.clientHeight = 24;
  const typingRow = makeStub('typing-row');
  const hint = makeStub('input-hint');
  const sendButton = makeStub('composer-send');
  const st = {
    waitingForReply: false,
    conversationEnded: false,
    lang: null
  };
  const UI = {
    utils: {
      scrollToBottom: () => {},
      scrollToBottomIfNear: () => {},
      hasForeignLetters: () => false
    }
  };
  const ctrl = {
    UI,
    el: { input, typingRow, hint, sendButton },
    st,
    MIN_REPLY_DELAY_MS: 0,
    MAX_REPLY_DELAY_MS: 0,
    EXTRA_DELAY_PER_CHAR_MS: 0,
    EXTRA_DELAY_MAX_MS: 0,
    sendMessage: () => {}
  };
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(read('js/app/composer.js'), sandbox, {
    filename: 'js/app/composer.js'
  });
  const composer = sandbox.DaryaAppComposer.create(ctrl);
  return { composer, input, sendButton, st };
}

test('the composer stays enabled (keyboard alive) while a reply is pending', () => {
  const { composer, input, sendButton, st } = loadComposer();

  input.value = 'next message already typed';
  composer.refreshComposerState();
  assert.equal(input.disabled, false);

  // Darya starts composing: the field must not be disabled, or the
  // phone keyboard detaches mid-gesture (white space bar on Samsung).
  composer.setComposerBusy(true);
  assert.equal(st.waitingForReply, true);
  assert.equal(
    input.disabled,
    false,
    'disabling the focused input drops the on-screen keyboard'
  );
  assert.equal(
    sendButton.disabled,
    true,
    'the send button still blocks sending while a reply is pending'
  );

  // The reply arrives: with the draft already typed, sending re-opens.
  composer.setComposerBusy(false);
  assert.equal(st.waitingForReply, false);
  assert.equal(input.disabled, false);
  assert.equal(sendButton.disabled, false);

  // A finished conversation does disable the field (terminal state).
  st.conversationEnded = true;
  composer.setComposerBusy(false);
  assert.equal(input.disabled, true);
});

test('the submit path rechecks the busy state without relying on disabled', () => {
  // The send guard lives in the submit handler (js/app/index.js): a
  // draft typed while a reply is pending must be refused by
  // waitingForReply, not by a disabled input.
  const app = read('js/app/index.js');
  assert.match(
    app,
    /st\.waitingForReply \|\|[\s\S]{0,120}hasForeignLetters/u,
    'submit guard must still check waitingForReply'
  );
});
