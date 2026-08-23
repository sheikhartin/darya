/**
 * Tests for the hardware back navigation (js/app/backbutton.js, the
 * onHardwareBack/leaveApp plumbing in js/app/native.js, and the
 * ShellPlugin wiring on the Android side).
 *
 * Android's back button walks the app's own surface stack, one surface
 * per press: the menu popover, then the new-chat dialog, then the
 * breathing overlay, then the pending farewell bar (cancel), then the
 * active conversation (confirm-before-ending), then the ended
 * conversation (back to the picker), and only on the picker itself
 * does back leave the app.
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
 * Loads native.js into a sandbox with a fake injected Capacitor bridge.
 * @param {object} shell - Fake Shell plugin (or null to omit it)
 * @returns {{ sandbox: object, shellCalls: object }}
 */
function loadNativeModule(shell) {
  const shellCalls = { listeners: [], exitCalls: 0 };
  const sandbox = {
    console,
    navigator: {},
    Capacitor: {
      isNativePlatform: () => true,
      Plugins: shell
        ? {
            Shell: {
              addListener(event, handler) {
                shellCalls.listeners.push({ event, handler });
              },
              exitApp() {
                shellCalls.exitCalls += 1;
              }
            }
          }
        : {}
    }
  };
  vm.runInContext(read('js/app/native.js'), vm.createContext(sandbox), {
    filename: 'js/app/native.js'
  });
  return { sandbox, shellCalls };
}

/**
 * Loads backbutton.js with a fake DaryaNative and app controller and
 * returns the pieces the assertions need.
 * @param {object} [overrides] - State overrides (chatActive, and so on)
 * @param {boolean} [withNative] - Whether DaryaNative exists at all
 * @returns {object} Records and controls for the assertions
 */
function loadBackButtonModule(overrides = {}, withNative = true) {
  const records = {
    closeMenu: [],
    confirmExitNo: 0,
    dismissNewChatConfirm: 0,
    dismissBreathe: 0,
    showExitConfirmBar: 0,
    showPicker: 0,
    leaveApp: 0,
    backHandler: null
  };
  const ctrl = {
    el: {
      menuPopover: { hidden: true },
      exitConfirmBar: { hidden: true }
    },
    st: {
      chatActive: false,
      conversationEnded: false,
      pendingExit: false,
      exitConfirmShown: false,
      ...overrides
    },
    closeMenu(restoreFocus) {
      records.closeMenu.push(restoreFocus);
    },
    confirmExitNo() {
      records.confirmExitNo += 1;
    },
    showPicker() {
      records.showPicker += 1;
    },
    DaryaOverlays: {
      isConfirmVisible: () => overrides.confirmVisible === true,
      isBreatheVisible: () => overrides.breatheVisible === true,
      dismissNewChatConfirm() {
        records.dismissNewChatConfirm += 1;
      },
      dismissBreathe() {
        records.dismissBreathe += 1;
      },
      showExitConfirmBar() {
        records.showExitConfirmBar += 1;
      }
    }
  };
  const fakeNative = {
    onHardwareBack(handler) {
      records.backHandler = handler;
    },
    leaveApp() {
      records.leaveApp += 1;
    }
  };
  const sandbox = withNative
    ? { console, DaryaNative: fakeNative }
    : { console };
  vm.runInContext(read('js/app/backbutton.js'), vm.createContext(sandbox), {
    filename: 'js/app/backbutton.js'
  });
  sandbox.DaryaAppBackButton.create(ctrl);
  return { records, ctrl };
}

/** Invokes the registered back handler once. */
const pressBack = (fixture) => fixture.records.backHandler();

// ======================================================================
// The native plumbing (js/app/native.js)
// ======================================================================

test('onHardwareBack subscribes to the shell plugin backButton event', () => {
  const { sandbox, shellCalls } = loadNativeModule(true);
  const handler = () => {};
  sandbox.DaryaNative.onHardwareBack(handler);
  assert.equal(shellCalls.listeners.length, 1);
  assert.equal(shellCalls.listeners[0].event, 'backButton');
  assert.equal(shellCalls.listeners[0].handler, handler);
});

test('onHardwareBack and leaveApp are no-ops without the plugin', () => {
  const { sandbox, shellCalls } = loadNativeModule(false);
  assert.equal(shellCalls.exitCalls, 0);
  sandbox.DaryaNative.onHardwareBack(() => {});
  sandbox.DaryaNative.leaveApp();
  assert.equal(shellCalls.exitCalls, 0);
});

test('leaveApp exits through the shell plugin', () => {
  const { sandbox, shellCalls } = loadNativeModule(true);
  sandbox.DaryaNative.leaveApp();
  assert.equal(shellCalls.exitCalls, 1);
});

// ======================================================================
// The surface-stack policy (js/app/backbutton.js)
// ======================================================================

test('back on the picker leaves the app', () => {
  const fixture = loadBackButtonModule({ chatActive: false });
  pressBack(fixture);
  assert.equal(fixture.records.leaveApp, 1);
  assert.equal(fixture.records.showExitConfirmBar, 0);
});

test('back during a conversation asks before ending it', () => {
  const fixture = loadBackButtonModule({ chatActive: true });
  pressBack(fixture);
  assert.equal(fixture.records.showExitConfirmBar, 1);
  assert.equal(fixture.ctrl.st.pendingExit, true);
  assert.equal(fixture.ctrl.st.exitConfirmShown, true);
  assert.equal(fixture.records.leaveApp, 0);
});

test('back after the conversation ended returns to the picker', () => {
  const fixture = loadBackButtonModule({
    chatActive: true,
    conversationEnded: true
  });
  pressBack(fixture);
  assert.equal(fixture.records.showPicker, 1);
  assert.equal(fixture.records.showExitConfirmBar, 0);
  assert.equal(fixture.records.leaveApp, 0);
});

test('back with the farewell bar visible cancels it and stays', () => {
  const fixture = loadBackButtonModule({ chatActive: true });
  fixture.ctrl.el.exitConfirmBar.hidden = false;
  pressBack(fixture);
  assert.equal(fixture.records.confirmExitNo, 1);
  assert.equal(fixture.records.showExitConfirmBar, 0);
  assert.equal(fixture.records.leaveApp, 0);
});

test('back closes the open menu before touching the conversation', () => {
  const fixture = loadBackButtonModule({ chatActive: true });
  fixture.ctrl.el.menuPopover.hidden = false;
  pressBack(fixture);
  assert.deepEqual(fixture.records.closeMenu, [true]);
  assert.equal(fixture.records.showExitConfirmBar, 0);
});

test('back closes the new-chat dialog and the breathing overlay', () => {
  const dialog = loadBackButtonModule(
    { chatActive: true, confirmVisible: true },
    true
  );
  pressBack(dialog);
  assert.equal(dialog.records.dismissNewChatConfirm, 1);
  assert.equal(dialog.records.showExitConfirmBar, 0);

  const breathe = loadBackButtonModule(
    { chatActive: true, breatheVisible: true },
    true
  );
  pressBack(breathe);
  assert.equal(breathe.records.dismissBreathe, 1);
  assert.equal(breathe.records.showExitConfirmBar, 0);
});

test('the policy only registers when the native plumbing exists', () => {
  const fixture = loadBackButtonModule({ chatActive: false }, false);
  assert.equal(fixture.records.backHandler, null);
});

// ======================================================================
// The shell stays wired together
// ======================================================================

test('the shell plugin owns the back press and the web policy owns it once subscribed', () => {
  const plugin = read(
    'android/app/src/main/java/com/darya/companion/ShellPlugin.java'
  );
  // Back reaches the web policy only when it subscribed; the platform
  // default (leave) applies otherwise instead of swallowing the press.
  assert.match(plugin, /hasListeners\(EVENT_BACK_BUTTON\)/u);
  assert.match(plugin, /getActivity\(\)\.finish\(\)/u);
  assert.match(plugin, /notifyListeners\(EVENT_BACK_BUTTON/u);
  assert.match(plugin, /public void exitApp\(PluginCall call\)/u);
  const main = read(
    'android/app/src/main/java/com/darya/companion/MainActivity.java'
  );
  assert.match(main, /registerPlugin\(ShellPlugin\.class\)/u);
});

test('the back policy is wired into the shell and the overlays expose visibility', () => {
  assert.match(read('index.html'), /js\/app\/backbutton\.js/u);
  assert.match(read('sw.js'), /'\.\/js\/app\/backbutton\.js'/u);
  assert.match(read('js/app/index.js'), /DaryaAppBackButton\.create\(ctrl\)/u);
  const overlays = read('js/ui/overlays.js');
  assert.match(overlays, /isBreatheVisible: breathe\.isBreatheVisible/u);
  assert.match(overlays, /isConfirmVisible: confirm\.isConfirmVisible/u);
});
