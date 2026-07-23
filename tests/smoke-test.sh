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
# Requires: bash, curl, python3 (only used to serve the static files --
# any other static server works too, see SERVE_CMD below). node is used
# opportunistically for syntax checks if present, but its absence doesn't
# fail the run.
#
# Exit code is 0 if everything passed, 1 otherwise -- safe to use in CI
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

color() { printf '\033[%sm%s\033[0m' "$1" "$2"; }
ok()   { PASS_COUNT=$((PASS_COUNT + 1)); echo "  $(color 32 '✓') $1"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo "  $(color 31 '✗') $1"; }
section() { echo; echo "$(color 36 "== $1 ==")"; }

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
  "js/darya-engine.js"
  "js/languages/fa.js"
  "js/languages/en.js"
  "favicon.ico"
  "assets/favicon.svg"
  "manifest.json"
  "sw.js"
  "fonts/Vazirmatn-Regular.woff2"
  "fonts/Quicksand-VF.woff2"
  "fonts/Lalezar-Regular.woff2"
  "assets/icons/icon-192.png"
  "assets/icons/icon-512.png"
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
  for f in js/app.js js/darya-engine.js js/languages/fa.js js/languages/en.js; do
    if node --check "$f" 2>/tmp/darya-syntax-err; then
      ok "valid syntax: $f"
    else
      fail "SYNTAX ERROR in $f: $(cat /tmp/darya-syntax-err)"
    fi
  done
else
  echo "  $(color 33 '(node not found -- skipping syntax checks)')"
fi

# ============================================================================
section "Node engine test suite"
# ============================================================================

if command -v node >/dev/null 2>&1; then
  if node --test tests/engine.test.js > /tmp/darya-node-test.log 2>&1; then
    node_pass=$(grep -oP '(?<=# pass )\d+' /tmp/darya-node-test.log || echo "?")
    ok "engine tests passed ($node_pass tests)"
  else
    fail "engine test suite failed -- see details below"
    grep -E "^not ok|AssertionError" /tmp/darya-node-test.log | sed 's/^/      /'
  fi
else
  echo "  $(color 33 '(node not found -- skipping engine test suite)')"
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
  fail "[hidden] override rule missing -- picker/app may not actually hide (see conversation history)"
fi

# The Persian word-boundary bug: \b does not work on Persian script in JS
# regex, and a plain [\u0600-\u06FF] range wrongly includes punctuation.
if grep -q '\\\\p{L}' js/languages/fa.js; then
  ok "fa.js uses \\p{L} for word-boundary checks (not a raw Unicode range)"
else
  fail "fa.js does not appear to use \\p{L} boundary checks -- word-boundary bug may have regressed"
fi

# The menu popover overflow bug: it must grow toward the center
# (inset-inline-end), not toward whichever edge the trigger sits near.
if grep -A3 '\.menu__popover {' css/style.css | grep -q 'inset-inline-end'; then
  ok "menu popover anchored with inset-inline-end (overflow-safe)"
else
  fail "menu popover anchoring changed -- verify it doesn't overflow the viewport again"
fi

# The beach needs a dedicated, thin foam line at the waterline.
if grep -q 'beach-scene__foam' index.html css/style.css 2>/dev/null; then
  ok "beach-scene foam line is present"
else
  fail "beach-scene foam line is missing"
fi

# The beach-theme text contrast bug: several text elements (picker note,
# disclaimer, input hint, message timestamps) have no background of their
# own and were unreadable against light sand until a shared scrim was
# added to darken the bottom of the scene.
if grep -q 'backdrop__scrim' index.html && grep -q 'backdrop__scrim' css/style.css; then
  ok "beach-theme contrast scrim present"
else
  fail "backdrop__scrim missing -- beach-theme text over sand may be unreadable again"
fi

# Full offline capability: no CDN font dependency, service worker and
# manifest present, manifest is valid JSON.
if grep -qi 'fonts.googleapis\|fonts.gstatic' index.html css/style.css 2>/dev/null; then
  fail "a Google Fonts CDN reference is back -- this breaks full offline use"
else
  ok "no external font CDN dependency (fonts are self-hosted)"
fi

if [[ -f sw.js && -f manifest.json ]]; then
  ok "service worker and manifest present"
else
  fail "sw.js or manifest.json missing -- app will not be installable/offline-capable"
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

# Half-space normalization must load before the Persian language pack.
if grep -q 'js/languages/halfspace.js' index.html && grep -q 'DaryaHalfspace' js/languages/halfspace.js; then
  ok "halfspace wired before the Persian language pack"
else
  fail "halfspace normalizer is not wired correctly"
fi

# Beach markup is intentionally structural: one fixed scene, three empty ocean
# layers, and CSS-only sun children instead of inline wave artwork.
if grep -q 'class="beach-scene"' index.html && [[ "$(grep -o 'class="beach-scene__ocean' index.html | wc -l)" -eq 3 ]] && grep -q 'beach-scene__sun-halo' index.html; then
  ok "beach scene structure has three ocean layers and a CSS sun"
else
  fail "beach scene structure is incomplete"
fi

if grep -q 'beach-scene__ocean' css/style.css && grep -q 'background-repeat: repeat-x' css/style.css && grep -q 'mask-image: linear-gradient(to right, transparent 0%' css/style.css && grep -q 'background-position-x' css/style.css && ! grep -Eq 'translate3d\([^,]+, *-[123]px' css/style.css; then
  ok "wave layers use in-place repeat-x tiles with an edge mask"
else
  fail "wave tile repeat-x/mask regression marker missing"
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
  global.window = global;
  require('./js/languages/halfspace.js');
  const words = ['میز', 'میدان', 'میهن', 'خوشبخت', 'متر', 'بیمه', 'بیبی'];
  process.exit(words.every((word) => global.halfSpace(word) === word) ? 0 : 1);
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
if ! grep -RIn --exclude-dir=.git --exclude-dir='tests' --exclude='sw.js' --exclude='OFFLINE.md' --exclude-dir='licenses' -E "$forbidden_pattern" . >/tmp/darya-forbidden.log 2>&1; then
  ok "forbidden identity and legacy version strings stay out of app sources"
else
  fail "forbidden source strings found: $(tr '\n' ' ' </tmp/darya-forbidden.log)"
fi

if grep -q 'supports not' css/style.css && grep -q 'mask-image' css/style.css; then
  ok "beach wave has a no-mask fallback"
else
  fail "beach wave fallback for older mask engines is missing"
fi

if grep -q 'backdrop__depth-breath' index.html css/style.css && grep -q '@keyframes depth-breathe' css/style.css && grep -q 'prefers-reduced-motion: reduce' css/style.css; then
  ok "ocean depth breath is present and reduced-motion safe"
else
  fail "ocean depth breath regression detected"
fi

if grep -q 'const count = 8' js/app.js && grep -q 'randomBetween(14, 22)' js/app.js && grep -q 'randomBetween(-12, 12)' js/app.js; then
  ok "ocean bubble parameters are randomized in the calm range"
else
  fail "ocean bubble randomization regression detected"
fi

if grep -A4 '@keyframes horizon-drift' css/style.css | grep -q 'translateX' && ! grep -A4 '@keyframes horizon-drift' css/style.css | grep -q 'translateY'; then
  ok "ocean horizon drift has no vertical bob"
else
  fail "ocean horizon vertical bob regression detected"
fi

if ! grep -RIn --exclude-dir=.git --exclude-dir='tests' --exclude='sw.js' --exclude='OFFLINE.md' --exclude-dir='licenses' -E 'language model|LLM|AI assistant|therapist|counselor|I.?m just a bot|I.?m just an AI|tell me more|how does that make you feel|what else can you tell me|بیشتر بگو|چه احساسی داری|چه چیز دیگری' . >/tmp/darya-intelligence-forbidden.log 2>&1; then
  ok "intelligence identity and generic-phrase guards pass"
else
  fail "intelligence forbidden phrases found: $(tr '\n' ' ' </tmp/darya-intelligence-forbidden.log)"
fi

if grep -q 'topicSpecificQuestions' js/darya-engine.js js/languages/en.js js/languages/fa.js && grep -q 'blend_sleep_anxiety' js/languages/en.js js/languages/fa.js && grep -q "rule('recap'" js/languages/en.js js/languages/fa.js; then
  ok "topic-specific questions, blends, and recap rules are wired"
else
  fail "intelligence topic-depth wiring is incomplete"
fi

# ============================================================================
section "Live server checks"
# ============================================================================

SERVE_CMD="python3 -m http.server ${PORT}"
if ! command -v python3 >/dev/null 2>&1; then
  echo "  $(color 33 '(python3 not found -- skipping live server checks)')"
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
    check_status "/js/darya-engine.js" "200"
    check_status "/js/languages/fa.js" "200"
    check_status "/js/languages/en.js" "200"
    check_status "/favicon.ico" "200"
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
      fail "homepage contains a literal 'undefined' or '[object Object]' -- likely a templating bug"
    else
      ok "no obvious templating artifacts in homepage HTML"
    fi
  fi
fi

# ============================================================================
section "Summary"
# ============================================================================

echo
echo "Passed: $(color 32 "$PASS_COUNT")   Failed: $(color 31 "$FAIL_COUNT")"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "$(color 31 'SMOKE TEST FAILED')"
  exit 1
else
  echo "$(color 32 'ALL CHECKS PASSED')"
  exit 0
fi
