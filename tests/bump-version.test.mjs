import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

// The bump script resolves its project root from its own file location,
// so copying it next to throwaway fixtures exercises the real write
// path without ever touching this repository.
const SCRIPT_SOURCE = await readFile(
  new URL('../scripts/bump-version.mjs', import.meta.url),
  'utf8'
);

const FIXTURE_VERSION = '1.3.0';

/**
 * Builds a throwaway project layout (scripts/ plus the four version
 * files) in a fresh temp dir and returns its path.
 * @param {object} [options]
 * @param {boolean} [options.staleLock] - Seed the lock file with an old
 *   root version, the drift a hand edit can leave behind.
 * @returns {Promise<string>}
 */
async function makeFixture(options = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'darya-bump-'));
  await mkdir(path.join(dir, 'scripts'), { recursive: true });
  await mkdir(path.join(dir, 'android', 'app'), { recursive: true });
  await writeFile(path.join(dir, 'scripts', 'bump-version.mjs'), SCRIPT_SOURCE);
  const lockVersion = options.staleLock ? '1.2.3' : FIXTURE_VERSION;
  await writeFile(
    path.join(dir, 'package.json'),
    `${JSON.stringify(
      { name: 'darya', version: FIXTURE_VERSION, private: true },
      null,
      2
    )}\n`
  );
  await writeFile(
    path.join(dir, 'package-lock.json'),
    `${JSON.stringify(
      {
        name: 'darya',
        version: lockVersion,
        lockfileVersion: 3,
        packages: {
          '': { name: 'darya', version: lockVersion },
          // A dependency versioned like the app, to prove only the darya
          // root entries are ever rewritten.
          'node_modules/queue-microtask': {
            version: '1.3.0',
            resolved:
              'https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.3.0.tgz'
          }
        }
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    path.join(dir, 'manifest.json'),
    `${JSON.stringify({ name: 'Darya', version: FIXTURE_VERSION }, null, 2)}\n`
  );
  await writeFile(
    path.join(dir, 'android', 'app', 'build.gradle'),
    [
      'android {',
      '    defaultConfig {',
      '        // Local build defaults; the CI workflow stamps these from the git',
      '        // tag (1.3.0 -> versionCode 130, versionName "1.3.0").',
      '        versionCode 130',
      '        versionName "1.3.0"',
      '    }',
      '}',
      ''
    ].join('\n')
  );
  return dir;
}

async function runScript(dir, ...args) {
  const scriptPath = path.join(dir, 'scripts', 'bump-version.mjs');
  try {
    const { stdout } = await execFileAsync(process.execPath, [
      scriptPath,
      ...args
    ]);
    return { code: 0, stdout };
  } catch (error) {
    return {
      code: typeof error.code === 'number' ? error.code : 1,
      stdout: String(error.stdout ?? '')
    };
  }
}

async function readFixture(dir) {
  return {
    packageJson: await readFile(path.join(dir, 'package.json'), 'utf8'),
    lock: await readFile(path.join(dir, 'package-lock.json'), 'utf8'),
    manifest: await readFile(path.join(dir, 'manifest.json'), 'utf8'),
    gradle: await readFile(
      path.join(dir, 'android', 'app', 'build.gradle'),
      'utf8'
    )
  };
}

test('bump_1_3_1_syncs_all_four_files_and_keeps_dependency_entries', async () => {
  const dir = await makeFixture();
  try {
    const result = await runScript(dir, '1.3.1');
    assert.equal(result.code, 0);
    const files = await readFixture(dir);
    assert.equal(JSON.parse(files.packageJson).version, '1.3.1');
    const lock = JSON.parse(files.lock);
    assert.equal(lock.version, '1.3.1');
    assert.equal(lock.packages[''].version, '1.3.1');
    assert.equal(
      lock.packages['node_modules/queue-microtask'].version,
      '1.3.0'
    );
    assert.equal(JSON.parse(files.manifest).version, '1.3.1');
    assert.match(files.gradle, /^(\s*)versionCode 131$/m);
    assert.match(files.gradle, /^(\s*)versionName "1\.3\.1"$/m);
    assert.match(
      files.gradle,
      /\/\/ tag \(1\.3\.1 -> versionCode 131, versionName "1\.3\.1"\)\./
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('dry_run_reports_the_change_without_writing', async () => {
  const dir = await makeFixture();
  try {
    const result = await runScript(dir, '1.3.1', '--dry-run');
    assert.equal(result.code, 0);
    assert.match(result.stdout, /would update/);
    const files = await readFixture(dir);
    assert.equal(JSON.parse(files.packageJson).version, FIXTURE_VERSION);
    assert.equal(JSON.parse(files.lock).version, FIXTURE_VERSION);
    assert.equal(JSON.parse(files.manifest).version, FIXTURE_VERSION);
    assert.match(files.gradle, /versionCode 130/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('invalid_version_is_rejected_without_writing', async () => {
  const dir = await makeFixture();
  try {
    const result = await runScript(dir, 'banana');
    assert.notEqual(result.code, 0);
    assert.equal(
      JSON.parse((await readFixture(dir)).packageJson).version,
      FIXTURE_VERSION
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('downgrade_is_rejected_without_writing', async () => {
  const dir = await makeFixture();
  try {
    const result = await runScript(dir, '1.2.9');
    assert.notEqual(result.code, 0);
    assert.equal(
      JSON.parse((await readFixture(dir)).packageJson).version,
      FIXTURE_VERSION
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('stale_lock_version_is_resynced_to_the_new_version', async () => {
  const dir = await makeFixture({ staleLock: true });
  try {
    const result = await runScript(dir, '1.3.1');
    assert.equal(result.code, 0);
    const lock = JSON.parse((await readFixture(dir)).lock);
    assert.equal(lock.version, '1.3.1');
    assert.equal(lock.packages[''].version, '1.3.1');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
