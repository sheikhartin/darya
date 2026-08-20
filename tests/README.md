# Tests

The runtime engine tests use only Node's built-in test APIs. Browser and
code-quality suites use the development tools declared in `package.json`.

**`./run-tests.sh`** (or `tests/smoke-test.sh` directly) - Bash. Checks
the file structure is intact, validates JS syntax (`node --check`), runs
the Node engine tests (see below), greps the source for markers of
several specific bugs found and fixed during development so a regression
is caught even by someone who only runs the shell script, then starts a
throwaway local server and confirms every asset actually serves with the
right status code and the homepage renders sane content. Requires `bash`,
`curl`, and `python3` (used only to serve the static files); `node` is
used opportunistically if present.

**`npm test`** - pure Node.js, using only the built-in `node:test` and
`node:assert` modules on the project's supported Node 22+ runtime. It runs
all engine and static-analysis unit suites listed in `package.json`.

**`npm run test:e2e`** - four Playwright-backed browser suites covering
keyboard and modal focus, offline service-worker behavior, quick replies,
and ambient sound/notification behavior. They auto-skip when no compatible
Chrome or Chromium binary is available.

Two suites deserve special mention: `safety-net.test.mjs` is the adversarial crisis corpus (slang,
contractions, passive ideation, means statements, third-party risk,
abuse disclosures, and benign false-positive guards, in both
languages); it is the most protected file in the suite, and removing
coverage from it requires an explicit safety review.
`engine-accuracy.test.mjs` guards answer trustworthiness: arithmetic
precedence, single-fact extraction, offline-honesty for live data,
media filters, and the no-verbatim-question-repeat guarantee.
`recent-life-intelligence.test.mjs` includes the cross-cultural slang,
age-context, ambiguity, and bounded-playfulness matrix in both languages.
`practical-wisdom-intelligence.test.mjs` adds 48 hard three-turn companion
personas across knowledge, daily life, app self-knowledge, and difficult
moods. `software-work-history-intelligence.test.mjs` adds 348 bilingual
lookup, live-engine, hard-persona, cyber-boundary, formatting,
no-fixed-price, conflict-history, migration, conscription,
Persian-code-point, and offline-wiring decisions.
`knowledge-world.test.mjs` also carries the bilingual society,
sex-work, pornography, addiction, Iran-law, cultural-humor, travel, and
planetary-place matrix with operational-boundary and false-positive guards.
The browser keyboard suite also guards live-edge scrolling and the jump
control's reader-intent behavior.
The unit suites exercise
the conversation engine and both language packs directly, no browser
involved: normalization, script validation, rule matching, exit
detection, repetition avoidance, the sentiment-based distress nudge
(including that it never overrides the safety rule), question
detection, short-answer context chaining, and bilingual parity between
the Persian and English packs. Several tests are named regressions for
specific bugs (e.g. the Persian word-boundary and punctuation-as-letter
issues) and were verified against the actual broken code before being
fixed, not just written to pass.

Both suites were stress-run dozens of times during development to shake
out flaky assertions (a few were found and fixed - tests that only
matched one of several randomly-chosen response variants) before being
considered reliable enough to ship.
