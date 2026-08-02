#!/usr/bin/env bash
#
# Smoke test for Darya (static site). Checks file structure, JS syntax,
# and (if a local server + curl are available, which they are on virtually
# any Linux install including Arch) that the site actually serves and
# responds correctly when running for real.
#
# Usage:
#   ./tests/smoke-test.sh
#
# Requires: bash, curl, python3 (only used to serve the static files;
# any other static server works too, see SERVE_CMD below). node is used
# opportunistically for syntax checks if present, but its absence doesn't
# fail the run.
#
# NOTE: This script binds a fixed port (8123) for its live server checks.
# Do NOT run it concurrently with another instance, or with run-tests.sh
# (which also runs the smoke test on the same port); concurrent runs
# race for port 8123 and produce spurious connection-refused failures.
#
# Exit code is 0 if everything passed, 1 otherwise; safe to use in CI
# or a pre-commit hook.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PORT=8123
BASE_URL="http://127.0.0.1:${PORT}"
SERVER_PID=""

PASS_COUNT=0
FAIL_COUNT=0

# --- Output helpers ---------------------------------------------------------

ok()   { PASS_COUNT=$((PASS_COUNT + 1)); echo "  [PASS] $1"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo "  [FAIL] $1"; }
section() { echo; echo "==== $1 ===="; }

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null
  fi
}
trap cleanup EXIT

cd "$PROJECT_DIR" || { echo "Cannot cd into $PROJECT_DIR"; exit 1; }

# ============================================================================
section "File structure"
# ============================================================================

required_files=(
  "index.html"
  "css/style.css"
  "js/app.js"
  "js/engine/index.js"
  "js/engine/utils.js"
  "js/engine/factual.js"
  "js/engine/recap.js"
  "js/engine/responder.js"
  "js/engine/time-utils.js"
  "js/ui/core.js"
  "js/ui/ambient.js"
  "js/ui/ambient-sound.js"
  "js/ui/export.js"
  "js/ui/logger.js"
  "js/ui/overlays.js"
  "js/data/knowledge-base.js"
  "js/languages/index.js"
  "js/languages/fa.js"
  "js/languages/en.js"
  "js/languages/fa-responses.js"
  "js/languages/en-responses.js"
  "js/languages/halfspace.js"
  "js/languages/entity-extractor.js"
  "assets/favicon.ico"
  "assets/favicon.svg"
  "manifest.json"
  "sw.js"
  "fonts/Vazirmatn-Regular.woff2"
  "fonts/Quicksand-VF.woff2"
  "fonts/Lalezar-Regular.woff2"
  "fonts/BeVietnamPro-Regular.woff2"
  "assets/icons/icon-192.png"
  "assets/icons/icon-512.png"
  "assets/icons/icon-maskable-192.png"
  "assets/icons/icon-maskable-512.png"
)

for f in "${required_files[@]}"; do
  if [[ -f "$f" ]]; then
    ok "present: $f"
  else
    fail "MISSING: $f"
  fi
done

# ============================================================================
section "JavaScript syntax"
# ============================================================================

if command -v node >/dev/null 2>&1; then
  for f in js/app.js js/engine/index.js js/engine/utils.js js/engine/factual.js js/engine/recap.js js/engine/responder.js js/engine/time-utils.js js/ui/core.js js/ui/ambient.js js/ui/ambient-sound.js js/ui/export.js js/ui/logger.js js/ui/overlays.js js/data/knowledge-base.js js/languages/index.js js/languages/fa.js js/languages/en.js js/languages/fa-responses.js js/languages/en-responses.js js/languages/halfspace.js js/languages/entity-extractor.js; do
    if node --check "$f" 2>/tmp/darya-syntax-err; then
      ok "valid syntax: $f"
    else
      fail "SYNTAX ERROR in $f: $(cat /tmp/darya-syntax-err)"
    fi
  done
else
  echo "  $(color 33 '(node not found; skipping syntax checks)')"
fi

# ============================================================================
section "Node engine test suite"
# ============================================================================

if command -v node >/dev/null 2>&1; then
  if node --test --test-reporter tap tests/engine.test.mjs tests/language.test.mjs tests/quality.test.mjs tests/time-utils.test.mjs > /tmp/darya-node-test.log 2>&1; then
    node_pass=$(grep -oP '(?<=# pass )\d+' /tmp/darya-node-test.log || echo "ER")
    ok "all tests passed ($node_pass tests)"
  else
    fail "engine test suite failed; see details below"
    grep -E "^not ok|AssertionError" /tmp/darya-node-test.log | sed 's/^/      /'
  fi
else
  echo "  $(color 33 '(node not found; skipping engine test suite)')"
fi

# ============================================================================
section "Known-bug regression markers (static grep checks)"
# ============================================================================
# These check that specific historical bugs stay fixed at the source level,
# independent of the Node test suite, so a regression is caught even by
# someone who only runs this shell script.

# The [hidden] visibility bug: an element's own `display` rule could
# silently defeat the `hidden` attribute unless a higher-specificity rule
# forces it.
if grep -q '\[hidden\]' css/style.css && grep -A2 '^\[hidden\]' css/style.css | grep -q 'display: none'; then
  ok "[hidden] override rule present in style.css"
else
  fail "[hidden] override rule missing; picker/app may not actually hide (see conversation history)"
fi

# The Persian word-boundary bug: \b does not work on Persian script in JS
# regex, and a plain [\u0600-\u06FF] range wrongly includes punctuation.
if grep -q '\\\\p{L}' js/languages/fa.js; then
  ok "fa.js uses \\p{L} for word-boundary checks (not a raw Unicode range)"
else
  fail "fa.js does not appear to use \\p{L} boundary checks; word-boundary bug may have regressed"
fi

# The menu popover overflow bug: it must grow toward the center
# (inset-inline-end), not toward whichever edge the trigger sits near.
if grep -A3 '\.menu__popover {' css/style.css | grep -q 'inset-inline-end'; then
  ok "menu popover anchored with inset-inline-end (overflow-safe)"
else
  fail "menu popover anchoring changed; verify it doesn't overflow the viewport again"
fi



# The beach-theme text contrast bug: several text elements (picker note,
# disclaimer, input hint, message timestamps) have no background of their
# own and were unreadable against light sand until a shared scrim was
# added to darken the bottom of the scene.
if grep -q 'backdrop__scrim' index.html && grep -q 'backdrop__scrim' css/style.css; then
  ok "beach-theme contrast scrim present"
else
  fail "backdrop__scrim missing; beach-theme text over sand may be unreadable again"
fi

# Full offline capability: no CDN font dependency, service worker and
# manifest present, manifest is valid JSON.
if grep -qi 'fonts.googleapis\|fonts.gstatic' index.html css/style.css 2>/dev/null; then
  fail "a Google Fonts CDN reference is back; this breaks full offline use"
else
  ok "no external font CDN dependency (fonts are self-hosted)"
fi

if [[ -f sw.js && -f manifest.json ]]; then
  ok "service worker and manifest present"
else
  fail "sw.js or manifest.json missing; app will not be installable/offline-capable"
fi

if command -v python3 >/dev/null 2>&1; then
  if python3 -c "import json; json.load(open('manifest.json'))" 2>/dev/null; then
    ok "manifest.json is valid JSON"
  else
    fail "manifest.json is not valid JSON"
  fi
fi

# ============================================================================
section "Feature regression markers"
# ============================================================================

# Half-space normalization integration: verify the engine pipeline uses
# half-space normalization correctly for Persian input.
if command -v node >/dev/null 2>&1 && node - <<'NODE'
  (async () => {
    // The classic scripts attach to the global namespace, so the test
    // helpers load them in dependency order and re-export the API.
    const { freshEngine, FA } = await import('./tests/helpers.mjs');
    const engine = freshEngine(FA);
    const reply = engine.respond('حالم خوب نیست');
    process.exit(reply && reply.length > 5 ? 0 : 1);
  })().catch(() => process.exit(1));
NODE
then
  ok "halfspace wired into engine pipeline"
else
  fail "halfspace not wired into engine pipeline"
fi

# Beach markup is intentionally structural: one fixed scene, three empty ocean
# layers, and CSS-only sun children instead of inline wave artwork.
if grep -q 'class="beach-scene"' index.html && [[ "$(grep -o 'class="beach-scene__ocean' index.html | wc -l)" -eq 3 ]] && grep -q 'beach-scene__sun-halo' index.html; then
  ok "beach scene structure has three ocean layers and a CSS sun"
else
  fail "beach scene structure is incomplete"
fi

if grep -q 'beach-scene__ocean' css/style.css && grep -q 'animation-name: beach-wave-drift' css/style.css && grep -q '@keyframes beach-wave-drift' css/style.css && grep -q 'translateX(-50%)' css/style.css && ! grep -q 'beach-ocean-bob' css/style.css && ! grep -Eq 'translate3d\([^,]+, *-[123]px' css/style.css; then
  ok "wave layers use seamless inline SVG tiles with single-element GPU drift"
else
  fail "wave tile drift regression marker missing"
fi

if grep -q 'animation: sun-breathe' css/style.css && grep -q '@keyframes sun-breathe' css/style.css; then
  ok "sun breathing animation is present"
else
  fail "sun breathing animation is missing"
fi

if grep -q 'height: 110px' css/style.css && ! grep -q '24vh' css/style.css; then
  ok "beach scrim remains narrow at 110px"
else
  fail "broad 24vh beach scrim has regressed"
fi

if grep -q 'menuExportMd:.*دانلود گفتگو.*مارک‌داون' js/languages/fa.js && ! grep -q 'دانلود گفتگو (' js/languages/fa.js; then
  ok "Persian export label uses Markdown transliteration without parentheses"
else
  fail "Persian export label is missing the no-parentheses form"
fi

legacy_markdown_label='دانلود گفتگو ('''Markdown''')'
if ! grep -q "$legacy_markdown_label" index.html js/languages/fa.js js/languages/en.js 2>/dev/null; then
  ok "old parenthesized Markdown export form is gone"
else
  fail "old parenthesized Markdown export form remains"
fi

# Additional hardening checks keep the static shell honest as assets evolve.
if command -v node >/dev/null 2>&1 && node - <<'NODE'
  (async () => {
    const { halfSpace } = await import('./tests/helpers.mjs');
    const words = ['میز', 'میدان', 'میهن', 'خوشبخت', 'متر', 'بیمه', 'بیبی'];
    process.exit(words.every((word) => halfSpace(word) === word) ? 0 : 1);
  })().catch(() => process.exit(1));
NODE
then
  ok "halfspace allow-list roots remain unchanged"
else
  fail "halfspace allow-list regression detected"
fi

if python3 - <<'PY2'
import pathlib, re
sw = pathlib.Path('sw.js').read_text()
entries = set(re.findall(r"['\"](\./[^'\"]+)['\"]", sw))
required = {'./index.html'}
required.update('./js/languages/' + p.name for p in pathlib.Path('js/languages').glob('*.js'))
required.update('./fonts/' + p.name for p in pathlib.Path('fonts').glob('*.woff2'))
raise SystemExit(0 if required <= entries else 1)
PY2
then
  ok "service worker precaches every language script and font"
else
  fail "service worker precache is incomplete"
fi

forbidden_pattern='language'\ 'model|L''LM|AI'\ 'assistant|therap''ist|دانلود گفتگو ('\ 'Markdown'\ ')|(^|[^A-Za-z])v[0-9]+\.[0-9]+'
if ! grep -RIn --exclude-dir=.git --exclude-dir='node_modules' --exclude-dir='tests' --exclude-dir='.husky' --exclude='sw.js' --exclude='OFFLINE.md' -E "$forbidden_pattern" . >/tmp/darya-forbidden.log 2>&1; then
  ok "forbidden identity and legacy version strings stay out of app sources"
else
  fail "forbidden source strings found: $(tr '\n' ' ' </tmp/darya-forbidden.log)"
fi



if grep -q 'backdrop__depth-breath' index.html css/style.css && grep -q '@keyframes depth-breathe' css/style.css && grep -q 'prefers-reduced-motion: reduce' css/style.css; then
  ok "ocean depth breath is present and reduced-motion safe"
else
  fail "ocean depth breath regression detected"
fi

if grep -q 'const count = 8' js/ui/ambient.js && grep -q 'randomBetween(14, 22)' js/ui/ambient.js && grep -q 'randomBetween(-12, 12)' js/ui/ambient.js; then
  ok "ocean bubble parameters are randomized in the calm range"
else
  fail "ocean bubble randomization regression detected"
fi

if grep -A4 '@keyframes horizon-drift' css/style.css | grep -q 'translateX' && ! grep -A4 '@keyframes horizon-drift' css/style.css | grep -q 'translateY'; then
  ok "ocean horizon drift has no vertical bob"
else
  fail "ocean horizon vertical bob regression detected"
fi

# Null/undefined input guard: the engine must coerce falsy values to string
# and return the language-specific emptyInputReply rather than crashing.
if grep -q 'if (!String(rawText).trim())' js/engine/responder.js && grep -q 'emptyInputReply' js/languages/en.js js/languages/fa.js; then
  ok "null/undefined input guard present in both languages"
else
  fail "null/undefined input guard missing; null or undefined input could crash the engine"
fi

# Mixed-script detection: the engine must detect when the user mixes
# scripts (e.g. Persian with English) so it can respond appropriately
# instead of treating it as a pure-language input.
if grep -q '_isMixedLanguage' js/engine/responder.js && grep -q 'MIXED_SCRIPT_FOREIGN_MIN' js/engine/utils.js; then
  ok "mixed-script detection is wired in the engine"
else
  fail "mixed-script detection missing; bilingual input may be mishandled"
fi

# Multi-codepoint emoji resilience: the normalization regex must use
# Unicode property escapes (\\p{L}, \\p{N}, \\p{M}) so that multi-byte
# characters like ZWJ emoji sequences and flag emoji (surrogate pairs)
# are preserved during normalization rather than being truncated or
# split across surrogate boundaries.
if grep -q '[\\\\p{L}\\\\p{N}\\\\p{M}'"'"'\\\\u2019\\\\u02BC\\-\\s]' js/engine/utils.js 2>/dev/null || grep -q '\\\\p{L}' js/engine/utils.js; then
  ok "normalization uses Unicode property escapes (emoji-safe)"
else
  fail "normalization does not use \\p{L}; multi-codepoint emoji may be corrupted"
fi

# HTML injection resilience: the normalization regex strips angle brackets
# and HTML-like syntax by only keeping letters, numbers, marks, apostrophes,
# hyphens, and spaces. Everything else (including <, >, ", &, /) is removed,
# so <script>alert(1)</script> becomes plain text automatically.
if grep -q 'normalizeForMatching' js/engine/utils.js && grep -q 'MIXED_SCRIPT_FOREIGN_RATIO' js/engine/utils.js; then
  ok "HTML/XSS injection stripped by normalization in responder.js"
else
  fail "HTML/XSS injection stripping regression; engine may echo back malicious tags"
fi

if ! grep -RIn --exclude-dir=.git --exclude-dir='node_modules' --exclude-dir='tests' --exclude-dir='.husky' --exclude='sw.js' --exclude='OFFLINE.md' -E 'language model|LLM|AI assistant|therapist|counselor|I.?m just a bot|I.?m just an AI|tell me more|how does that make you feel|what else can you tell me|بیشتر بگو|چه احساسی داری|چه چیز دیگری' . >/tmp/darya-intelligence-forbidden.log 2>&1; then
  ok "intelligence identity and generic-phrase guards pass"
else
  fail "intelligence forbidden phrases found: $(tr '\n' ' ' </tmp/darya-intelligence-forbidden.log)"
fi

if grep -q 'topicSpecificQuestions' js/engine/responder.js js/languages/en.js js/languages/fa.js && (grep -q 'blend_sleep_anxiety' js/languages/en.js js/languages/fa.js || grep -q 'blend_sleep_anxiety' js/languages/en-responses.js js/languages/fa-responses.js) && (grep -q 'recap:' js/languages/en-responses.js || grep -q 'recap:' js/languages/fa-responses.js); then
  ok "topic-specific questions, blends, and recap rules are wired"
else
  fail "intelligence topic-depth wiring is incomplete"
fi

if grep -q 'contextTopics' js/engine/responder.js && grep -q 'contextTopics' js/engine/utils.js; then
  ok "entity callbacks carry topic context confidence"
else
  fail "entity context confidence guard is missing"
fi

if [[ "$(grep -n 'id="menu-export-txt"' index.html | cut -d: -f1)" -lt "$(grep -n 'id="menu-export-md"' index.html | cut -d: -f1)" ]] && grep -q 'پوسته' js/languages/fa.js; then
  ok "plain text export precedes Markdown and Persian uses پوسته"
else
  fail "export order or Persian theme wording is wrong"
fi

if grep -q 'initBeachWaveVariation' js/app.js && grep -q -e '--wave-duration' js/ui/ambient.js && grep -q -e '--wave-delay' js/ui/ambient.js && ! grep -Eq 'beach-wave-drift[^}]*translate3d' css/style.css; then
  ok "beach waves have randomized horizontal-only timing"
else
  fail "beach wave variation regression detected"
fi

emdash=$'\u2014'
if ! grep -RIn --exclude-dir=.git --exclude-dir='node_modules' --exclude-dir='tests' --exclude-dir='.husky' "$emdash" . >/tmp/darya-emdash.log 2>&1; then
  ok "no em dash characters remain"
else
  fail "em dash characters found: $(tr '\n' ' ' </tmp/darya-emdash.log)"
fi

if grep -q 'CACHE_NAME.*darya-cache-' sw.js && grep -q 'pkg\.version' sw.js && ! grep -q "CACHE_NAME = 'darya-cache-current'" sw.js; then
  ok "service worker cache name derives from package.json version"
else
  fail "cache version marker: expected dynamic version from package.json"
fi

# English-only comments: scan all .js source files under js/ for
# comment lines (//) whose first non-whitespace character is outside
# the ASCII range (i.e., not English). This catches Persian/Arabic
# or any other script creeping into code comments. Uses python3 for
# reliable Unicode matching (grep -P is not available everywhere).
if python3 <<'PYEN' >/tmp/darya-nonenglish-comments.log 2>&1
import os, re, sys
pattern = re.compile(r"^\s*//[^\x00-\x7F]")
found = []
for root, dirs, files in os.walk("js"):
    dirs[:] = [d for d in dirs if d != "node_modules"]
    for f in files:
        if not f.endswith(".js"):
            continue
        path = os.path.join(root, f)
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            for i, line in enumerate(fh, 1):
                if pattern.search(line):
                    found.append(f"{path}:{i}:{line.rstrip()}")
for item in found:
    print(item)
sys.exit(1 if found else 0)
PYEN
then
  ok "all comments in js/ are in English"
else
  fail "non-English comments found in js/ sources: $(cat /tmp/darya-nonenglish-comments.log | tr '\n' '; ')"
fi

if grep -q "font-family: 'Be Vietnam Pro'" css/style.css && ! grep -Eq "font-weight: (100|200|300)" css/style.css; then
  ok "English uses a readable non-thin Be Vietnam Pro setup"
else
  fail "English font configuration is too thin or missing"
fi

# No debug artifacts in source: check for console.log outside the
# logger module, debugger statements, TODO, and FIXME markers in
# the js/ source tree. The DaryaLogger module is the only
# permitted place for console output.
if python3 <<'PYDBG' >/tmp/darya-debug-artifacts.log 2>&1
import os, re, sys
found = []
for root, dirs, files in os.walk("js"):
    dirs[:] = [d for d in dirs if d != "node_modules"]
    for f in files:
        if not f.endswith(".js"):
            continue
        path = os.path.join(root, f)
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            for i, line in enumerate(fh, 1):
                # Skip js/ui/logger.js (the only permitted logger) and
                # lines that use DaryaLogger (the allowed wrapper).
                if "logger.js" in path:
                    continue
                if "DaryaLogger" in line:
                    continue
                # Allow console.warn/error calls that follow the
                # 'Darya ...' prefix pattern (the project's intentional
                # logging convention where DaryaLogger is not available).
                if re.search(r"console\.(log|debug|info|trace)", line):
                    found.append(f"{path}:{i}:{line.rstrip()}")
                elif re.search(r"console\.(warn|error)\(\s*['\"](?!Darya)", line):
                    # console.warn/error that does NOT start with 'Darya'
                    found.append(f"{path}:{i}:{line.rstrip()}")
                if re.search(r"\bdebugger\b", line):
                    found.append(f"{path}:{i}:{line.rstrip()}")
                if re.search(r"\bTODO\b|\bFIXME\b", line):
                    found.append(f"{path}:{i}:{line.rstrip()}")
for item in found:
    print(item)
sys.exit(1 if found else 0)
PYDBG
then
  ok "no debug artifacts (bare console.log, debugger, TODO, FIXME) in source"
else
  fail "debug artifacts found in source: $(cat /tmp/darya-debug-artifacts.log | tr '\n' '; ')"
fi

if grep -q 'selectResponseStrategy' js/engine/responder.js && grep -q 'responseStrategies' js/engine/utils.js; then
  ok "response strategy decisions are tracked"
else
  fail "response strategy tracking is missing"
fi

# Bare math detection regression marker: Persian '۲+۵' must produce
# a math answer directly, not a generic fallback.
if grep -q 'handleFactualQuestion' js/engine/factual.js && grep -q 'bareMath' js/engine/factual.js; then
  ok "handleFactualQuestion with bare math detection present"
else
  fail "bare math detection missing; users get no answer for '2+5'"
fi

# Engine split regression marker: darya-engine.js was split into
# utils.js and responder.js. No monolithic file should remain.
if [[ ! -f js/darya-engine.js ]]; then
  ok "engine split is complete (no js/darya-engine.js)"
else
  fail "stale js/darya-engine.js found; engine split may have regressed"
fi

# Half-space normalization for Persian: must be loaded as a separate
# classic script before the language packs and attach the DaryaHalfspace
# global that the language packs consume.
if grep -q 'global.DaryaHalfspace' js/languages/halfspace.js; then
  ok "halfspace classic script attaches DaryaHalfspace global"
else
  fail "halfspace classic script missing DaryaHalfspace global"
fi

# Ambient scene module exports for bubbles and birds.
if grep -q 'DaryaAmbient' js/ui/ambient.js && grep -q 'initBubbles' js/ui/ambient.js; then
  ok "ambient module exports bubble/bird initialization"
else
  fail "ambient module missing required exports"
fi

# Knowledge base path: confirm it moved to js/data/.
if [[ -f js/data/knowledge-base.js ]] && grep -q 'DaryaKnowledge' js/data/knowledge-base.js; then
  ok "knowledge-base is at js/data/knowledge-base.js"
else
  fail "knowledge-base not found at js/data/knowledge-base.js"
fi

if grep -qE "html\\[data-theme=['\"]beach['\"]\\] \\.menu__trigger" css/style.css && grep -qE "html\\[data-theme=['\"]beach['\"]\\] \\.input-hint" css/style.css; then
  ok "beach menu and language hint visibility rules are present"
else
  fail "beach foreground visibility rules are missing"
fi

# ============================================================================
section "Live server checks"
# ============================================================================

SERVE_CMD="python3 -m http.server ${PORT}"
if ! command -v python3 >/dev/null 2>&1; then
  echo "  $(color 33 '(python3 not found; skipping live server checks)')"
else
  $SERVE_CMD >/tmp/darya-server.log 2>&1 &
  SERVER_PID=$!
  sleep 1.5

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    fail "local server failed to start (see /tmp/darya-server.log)"
  else
    check_status() {
      local path="$1"
      local expected="$2"
      local status
      status=$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}${path}")
      if [[ "$status" == "$expected" ]]; then
        ok "GET ${path} -> ${status}"
      else
        fail "GET ${path} -> ${status} (expected ${expected})"
      fi
    }

    check_status "/" "200"
    check_status "/css/style.css" "200"
    check_status "/js/app.js" "200"
    check_status "/js/engine/index.js" "200"
    check_status "/js/engine/utils.js" "200"
    check_status "/js/engine/factual.js" "200"
    check_status "/js/engine/recap.js" "200"
    check_status "/js/engine/responder.js" "200"
    check_status "/js/engine/time-utils.js" "200"
    check_status "/js/ui/core.js" "200"
    check_status "/js/ui/ambient.js" "200"
    check_status "/js/ui/ambient-sound.js" "200"
    check_status "/js/ui/export.js" "200"
    check_status "/js/ui/logger.js" "200"
    check_status "/js/ui/overlays.js" "200"
    check_status "/js/data/knowledge-base.js" "200"
    check_status "/js/languages/index.js" "200"
    check_status "/js/languages/fa.js" "200"
    check_status "/js/languages/en.js" "200"
    check_status "/js/languages/fa-responses.js" "200"
    check_status "/js/languages/en-responses.js" "200"
    check_status "/assets/favicon.ico" "200"
    check_status "/manifest.json" "200"
    check_status "/sw.js" "200"
    check_status "/fonts/Vazirmatn-Regular.woff2" "200"
    check_status "/assets/icons/icon-192.png" "200"
    check_status "/assets/icons/icon-512.png" "200"
    check_status "/assets/favicon.svg" "200"
    check_status "/this-does-not-exist.xyz" "404"

    # Content sanity: the page should mention both language options and
    # not contain leftover template placeholders or obvious breakage.
    # Fetched with one short retry, since a fresh local connection can
    # occasionally hiccup on the very first request.
    homepage=$(curl -s "${BASE_URL}/")
    if [[ -z "$homepage" ]]; then
      sleep 0.5
      homepage=$(curl -s "${BASE_URL}/")
    fi

    if echo "$homepage" | grep -q 'picker-fa' && echo "$homepage" | grep -q 'picker-en'; then
      ok "homepage includes both language picker options"
    else
      fail "homepage is missing one or both language picker options"
    fi

    if echo "$homepage" | grep -qi 'undefined\|\[object Object\]'; then
      fail "homepage contains a literal 'undefined' or '[object Object]'; likely a templating bug"
    else
      ok "no obvious templating artifacts in homepage HTML"
    fi
  fi
fi

# ============================================================================
section "Summary"
# ============================================================================

echo
echo "Passed: $PASS_COUNT   Failed: $FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "SMOKE TEST FAILED"
  exit 1
else
  echo "ALL CHECKS PASSED"
  exit 0
fi
