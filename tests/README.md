# Tests

Two complementary suites, both dependency-free.

**`./run-tests.sh`** (or `tests/smoke-test.sh` directly) - Bash. Checks
the file structure is intact, validates JS syntax (`node --check`), runs
the Node engine tests (see below), greps the source for markers of
several specific bugs found and fixed during development so a regression
is caught even by someone who only runs the shell script, then starts a
throwaway local server and confirms every asset actually serves with the
right status code and the homepage renders sane content. Requires `bash`,
`curl`, and `python3` (used only to serve the static files); `node` is
used opportunistically if present.

**`node --test-reporter tap tests/engine.test.js tests/language.test.js tests/quality.test.js`** - pure Node.js, using only the
built-in `node:test` and `node:assert` modules (Node 18+, nothing to
`npm install`). Exercises the conversation engine and both language packs
directly, no browser involved: normalization, script validation, rule
matching, exit detection, repetition avoidance, the sentiment-based
distress nudge (including that it never overrides the safety rule),
question detection, and bilingual parity between the Persian and English
packs. Several tests are named regressions for specific bugs (e.g. the
Persian word-boundary and punctuation-as-letter issues) and were verified
against the actual broken code before being fixed, not just written to
pass.

Both suites were stress-run dozens of times during development to shake
out flaky assertions (a few were found and fixed - tests that only
matched one of several randomly-chosen response variants) before being
considered reliable enough to ship.
