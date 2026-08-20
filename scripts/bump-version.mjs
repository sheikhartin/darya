#!/usr/bin/env node

/**
 * Bumps the Darya version in every file that carries it so they stay in
 * sync: package.json, package-lock.json, manifest.json, and the Android
 * local build defaults in android/app/build.gradle (versionCode,
 * versionName, and the explanatory comment above them).
 *
 * Usage:
 *   node scripts/bump-version.mjs 1.3.1 [--dry-run]
 *
 * The new version must be a valid major.minor.patch string and higher
 * than the current version. versionCode is derived exactly like the CI
 * tag stamping does (digits only: 1.3.0 -> 130), so local and CI builds
 * always agree. CHANGELOG.md is intentionally left untouched: its
 * entries are hand-written prose that no script can invent.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEMVER = /^\d+\.\d+\.\d+$/;
const DRY_RUN_FLAG = '--dry-run';

/**
 * Parses the CLI arguments. The version is the first argument that looks
 * like a semver string; everything else is treated as flags.
 */
function parseArgs(argv) {
  const newVersion = argv.find((arg) => SEMVER.test(arg));
  if (!newVersion) {
    console.error(
      `Usage: node scripts/bump-version.mjs <major.minor.patch> [${DRY_RUN_FLAG}]`
    );
    process.exit(1);
  }
  return { newVersion, dryRun: argv.includes(DRY_RUN_FLAG) };
}

/** Compares two semver strings numerically; negative when a is older. */
function compareVersions(a, b) {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < partsA.length; i++) {
    if (partsA[i] !== partsB[i]) {
      return partsA[i] - partsB[i];
    }
  }
  return 0;
}

/**
 * Derives the Android versionCode from a version, using the same rule as
 * the CI tag stamping in build-android.yml (digits only: 1.3.0 -> 130)
 * so local builds and CI never disagree.
 */
function toVersionCode(version) {
  return version.replace(/\D/g, '');
}

/**
 * Replaces the single match of `pattern` in `content` with `replacer`.
 * Throws when the pattern matches zero or multiple times, so a change in
 * a file's shape fails loudly instead of silently drifting.
 */
function replaceOnce(content, pattern, replacer, what) {
  const globalPattern = new RegExp(pattern.source, `${pattern.flags}g`);
  const count = [...content.matchAll(globalPattern)].length;
  if (count !== 1) {
    throw new Error(`Expected exactly one ${what}, found ${count}`);
  }
  return content.replace(pattern, replacer);
}

/** Sets the single top-level "version" field of a JSON document. */
function bumpJson(content, newVersion) {
  return replaceOnce(
    content,
    /"version": "[^"]+"/,
    () => `"version": "${newVersion}"`,
    '"version" field'
  );
}

/** Matches the name/version pair of a package root entry. */
function lockRootPattern(packageName) {
  return new RegExp(
    `"name": "${packageName}",\\n(\\s*)"version": "[^"]+"`,
    'g'
  );
}

/**
 * Updates both darya root version entries in package-lock.json: the
 * top-level one and the packages[""] one. Dependency entries never match
 * because they carry no "name": "darya" line.
 */
function bumpLock(content, newVersion, packageName) {
  const pattern = lockRootPattern(packageName);
  const count = [...content.matchAll(pattern)].length;
  if (count !== 2) {
    throw new Error(
      `Expected the two darya root entries in package-lock.json, found ${count}`
    );
  }
  return content.replace(
    pattern,
    (match, indent) =>
      `"name": "${packageName}",\n${indent}"version": "${newVersion}"`
  );
}

/** Bumps the shipped-version constant in the offline engine. */
function bumpJsConstant(content, newVersion) {
  return replaceOnce(
    content,
    /const DARYA_VERSION = '[^']+';/,
    () => `const DARYA_VERSION = '${newVersion}';`,
    'DARYA_VERSION constant'
  );
}

/** Bumps the Android local build defaults and their comment. */
function bumpGradle(content, newVersion, versionCode) {
  let updated = replaceOnce(
    content,
    /^(\s*)versionCode \d+/m,
    (match, indent) => `${indent}versionCode ${versionCode}`,
    'versionCode line'
  );
  updated = replaceOnce(
    updated,
    /^(\s*)versionName "[^"]+"/m,
    (match, indent) => `${indent}versionName "${newVersion}"`,
    'versionName line'
  );
  return replaceOnce(
    updated,
    /\/\/ tag \([0-9.]+ -> versionCode \d+, versionName "[^"]+"\)\./,
    () =>
      `// tag (${newVersion} -> versionCode ${versionCode}, versionName "${newVersion}").`,
    'local-defaults comment'
  );
}

async function main() {
  const { newVersion, dryRun } = parseArgs(process.argv.slice(2));

  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  const currentVersion = pkg.version;
  if (typeof currentVersion !== 'string' || !SEMVER.test(currentVersion)) {
    console.error(
      `package.json does not carry a valid version (found ${currentVersion})`
    );
    process.exit(1);
  }
  if (compareVersions(newVersion, currentVersion) <= 0) {
    console.error(
      `Refusing to bump: ${newVersion} is not higher than the current version ${currentVersion}`
    );
    process.exit(1);
  }

  const versionCode = toVersionCode(newVersion);

  const files = [
    {
      relPath: 'package.json',
      extractOld: (content) => JSON.parse(content).version,
      update: (content) => bumpJson(content, newVersion)
    },
    {
      relPath: 'package-lock.json',
      extractOld: (content) => {
        const m = content.match(
          new RegExp(`"name": "${pkg.name}",\\n\\s*"version": "([^"]+)"`)
        );
        if (!m) {
          throw new Error('No darya root entry found in package-lock.json');
        }
        return m[1];
      },
      update: (content) => bumpLock(content, newVersion, pkg.name)
    },
    {
      relPath: 'manifest.json',
      extractOld: (content) => JSON.parse(content).version,
      update: (content) => bumpJson(content, newVersion)
    },
    {
      relPath: 'js/engine/utils-constants.js',
      extractOld: (content) => {
        const m = content.match(/const DARYA_VERSION = '([^']+)';/);
        if (!m) {
          throw new Error(
            'No DARYA_VERSION constant found in utils-constants.js'
          );
        }
        return m[1];
      },
      update: (content) => bumpJsConstant(content, newVersion)
    },
    {
      relPath: 'android/app/build.gradle',
      extractOld: (content) => {
        const m = content.match(/^(\s*)versionName "([^"]+)"/m);
        if (!m) {
          throw new Error(
            'No versionName line found in android/app/build.gradle'
          );
        }
        return m[2];
      },
      update: (content) => bumpGradle(content, newVersion, versionCode)
    }
  ];

  // Transform every file in memory first; only when all of them succeed
  // is anything written, so a mid-run failure never leaves the version
  // half-bumped across the repo.
  const results = [];
  for (const file of files) {
    const filePath = path.join(ROOT, file.relPath);
    const content = await readFile(filePath, 'utf8');
    const oldVersion = file.extractOld(content);
    const updated = file.update(content);
    results.push({ relPath: file.relPath, oldVersion, updated });
  }

  if (!dryRun) {
    await Promise.all(
      results.map((result) =>
        writeFile(path.join(ROOT, result.relPath), result.updated)
      )
    );
  }

  const verb = dryRun ? 'would update' : 'updated';
  for (const result of results) {
    console.log(
      `${result.relPath}: ${verb} ${result.oldVersion} -> ${newVersion}`
    );
  }
  console.log(`versionCode for Android: ${versionCode}`);
  if (dryRun) {
    console.log(`${DRY_RUN_FLAG}: nothing was written.`);
  } else {
    console.log(
      'Next: add a CHANGELOG.md entry, commit, and push the version tag to trigger the Android release build.'
    );
  }
}

main().catch((error) => {
  console.error(`Version bump failed: ${error.message}`);
  process.exit(1);
});
