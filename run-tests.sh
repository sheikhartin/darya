#!/usr/bin/env bash
#
# Darya test suite runner.
#
# Runs the Bash smoke test (file structure, syntax, known-bug regression
# markers) then the Node.js engine test suite. With -n N, runs the engine
# tests N times and prints a pass/fail summary.
#
# Output modes:
#   Default:     Minimal result line (e.g. "Passed: 10/10 (100%)")
#   Verbose (-v): Per-round progress, failure details, full context
#
# Usage:
#   ./run-tests.sh                        # single run (smoke + engine)
#   ./run-tests.sh -n 10                  # 10 rounds of engine tests
#   ./run-tests.sh -n 5 -v                # 5 rounds with verbose output
#   ./run-tests.sh -n 5 --smoke-only      # smoke test only, 5 rounds
#   ./run-tests.sh --engine-only          # engine tests only, single run
#   ./run-tests.sh -v                     # single run, verbose

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

ROUNDS=1
MODE="all"
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--rounds)
      ROUNDS="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    --smoke-only)
      MODE="smoke"
      shift
      ;;
    --engine-only)
      MODE="engine"
      shift
      ;;
    *)
      echo "Error: Unknown option: $1"
      echo "Usage: $0 [-n rounds] [-v] [--smoke-only | --engine-only]"
      exit 1
      ;;
  esac
done

if ! [[ "$ROUNDS" =~ ^[0-9]+$ ]] || [ "$ROUNDS" -lt 1 ]]; then
  echo "Error: rounds must be a positive integer, got '$ROUNDS'"
  exit 1
fi

# -------------------------------------------------------------------
# Smoke test
# -------------------------------------------------------------------
run_smoke() {
  bash tests/smoke-test.sh
  return $?
}

# -------------------------------------------------------------------
# Single engine test run (captures output, returns exit code)
# -------------------------------------------------------------------
run_engine() {
  node --test-reporter tap tests/engine.test.js 2>&1
  return $?
}

# -------------------------------------------------------------------
# Single-run: smoke + engine (verbose-aware)
# -------------------------------------------------------------------
run_all_once() {
  local smoke_ok=0 engine_ok=0

  if [ "$MODE" = "engine" ]; then
    if $VERBOSE; then echo "[ENGINE]"; fi
    run_engine
    return $?
  fi

  if [ "$MODE" = "smoke" ] || [ "$MODE" = "all" ]; then
    if $VERBOSE; then echo "[SMOKE]"; fi
    run_smoke
    smoke_ok=$?
  fi

  if [ "$MODE" = "all" ]; then
    if $VERBOSE; then echo "[ENGINE]"; fi
    run_engine
    engine_ok=$?
  fi

  if [ "$MODE" = "smoke" ]; then
    return $smoke_ok
  fi

  [ "$smoke_ok" -eq 0 ] && [ "$engine_ok" -eq 0 ]
  return $?
}

# -------------------------------------------------------------------
# Multi-round engine-only runner
# -------------------------------------------------------------------
run_multi_round() {
  local total=$ROUNDS
  local passed=0 failed=0
  local fail_details=""

  if $VERBOSE; then
    echo "Running $total rounds..."
    echo ""
  fi

  for i in $(seq 1 "$total"); do
    local output
    output="$(node --test-reporter tap tests/engine.test.js 2>&1)"
    local rc=$?

    local fail_count
    fail_count="$(echo "$output" | grep -c '^not ok' || true)"

    if [ "$fail_count" -eq 0 ]; then
      passed=$((passed + 1))
      $VERBOSE && printf "  Round %2d: PASS\\n" "$i"
    else
      failed=$((failed + 1))
      local failed_names
      failed_names="$(echo "$output" | grep '^not ok' | sed 's/^not ok [0-9]* - //')"
      fail_details="${fail_details}  Round $i: ${failed_names}"$'\\n'
      $VERBOSE && printf "  Round %2d: FAIL - %s\\n" "$i" "$failed_names"
    fi
  done

  local pass_pct=0
  if [ "$total" -gt 0 ]; then
    pass_pct=$(( (passed * 100) / total ))
  fi

  if $VERBOSE; then
    echo ""
    echo "Result: $passed / $total ($pass_pct%)"
    echo ""
    if [ "$failed" -gt 0 ]; then
      echo "[FAILURES]"
      echo "$fail_details"
    else
      echo "[ALL PASS]"
    fi
  else
    # Minimal output: just the essential result
    echo "Passed: $passed/$total ($pass_pct%)"
  fi

  [ "$failed" -eq 0 ]
  return $?
}

# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------
if [ "$ROUNDS" -gt 1 ] && [ "$MODE" != "smoke" ]; then
  run_multi_round
  exit $?
fi

run_all_once
exit $?
