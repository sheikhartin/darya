#!/usr/bin/env bash
#
# Darya test suite runner.
#
# Runs the Bash smoke test (file structure, syntax, known-bug regression
# markers) then the Node.js test suite: the unit tests plus a
# headless-browser keyboard e2e test (auto-skips when no Chrome/Chromium
# binary exists). With -n N, runs the engine tests N times and prints a
# pass/fail summary (the browser e2e test is excluded from that mode to
# keep rounds fast).
#
# Output modes:
#   Default:     Minimal per-suite summary (2-4 lines)
#   Verbose (-v): Full output with per-test names and round progress
#
# Usage:
#   ./run-tests.sh                        # single run (smoke + node suites)
#   ./run-tests.sh -n 10                  # 10 rounds of engine tests
#   ./run-tests.sh -n 5 -v                # 5 rounds with verbose output
#   ./run-tests.sh --engine-only          # node suites only, single run
#   ./run-tests.sh -v --engine-only       # node suites only, verbose

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
    --engine-only)
      MODE="engine"
      shift
      ;;
    *)
      echo "Error: Unknown option: $1"
      echo "Usage: $0 [-n rounds] [-v] [--engine-only]"
      exit 1
      ;;
  esac
done

if ! [[ "$ROUNDS" =~ ^[0-9]+$ ]] || [ "$ROUNDS" -lt 1 ]; then
  echo "Error: rounds must be a positive integer, got '$ROUNDS'"
  exit 1
fi

# -------------------------------------------------------------------
# Helpers: parse TAP output for pass/fail counts
# -------------------------------------------------------------------
parse_engine_result() {
  local output="$1"
  local pass_str fail_str has_failure
  pass_str="$(echo "$output" | grep '^# pass ' | sed 's/^# pass //')"
  fail_str="$(echo "$output" | grep '^# fail ' | sed 's/^# fail //')"
  has_failure="$(echo "$output" | grep -c '^not ok' || true)"
  echo "$pass_str|$fail_str|$has_failure"
}

parse_smoke_result() {
  local output="$1"
  local pass_str fail_str
  pass_str="$(echo "$output" | grep '^Passed: ' | sed 's/Passed: \([0-9]*\) *Failed:.*/\1/')"
  fail_str="$(echo "$output" | grep '^Passed: ' | sed 's/Passed: [0-9]* *Failed: \([0-9]*\).*/\1/')"
  echo "$pass_str|$fail_str"
}

# -------------------------------------------------------------------
# Smoke test
# -------------------------------------------------------------------
run_smoke() {
  if $VERBOSE; then
    bash tests/smoke-test.sh
    return $?
  fi

  local output
  output="$(bash tests/smoke-test.sh 2>&1)"
  local parsed
  parsed="$(parse_smoke_result "$output")"
  local pass_str="${parsed%%|*}"
  local fail_str="${parsed##*|}"
  # Guard against empty parsing results (e.g. smoke test crashed)
  if [ -z "$pass_str" ] && [ -z "$fail_str" ]; then
    echo "Smoke: run failed (no output)"
    return 1
  fi
  local pass_ct="${pass_str:-0}"
  local fail_ct="${fail_str:-0}"
  echo "Smoke: $pass_ct passed, $fail_ct failed"
  [ "$fail_ct" -eq 0 ]
  return $?
}

# -------------------------------------------------------------------
# Single engine test run
# -------------------------------------------------------------------
run_engine() {
  local test_files="tests/ambient-sound.test.mjs tests/e2e-keyboard.test.mjs tests/engine.test.mjs tests/language.test.mjs tests/quality.test.mjs tests/time-utils.test.mjs"

  if $VERBOSE; then
    # shellcheck disable=SC2086
    node --test --test-reporter spec $test_files 2>&1
    return $?
  fi

  local output
  # shellcheck disable=SC2086
  output="$(node --test --test-reporter tap $test_files 2>&1)"
  local rc=$?
  local parsed
  parsed="$(parse_engine_result "$output")"
  local pass_str="${parsed%%|*}"
  local remaining="${parsed#*|}"
  local fail_str="${remaining%%|*}"
  local has_failure="${parsed##*|}"
  # Guard against missing TAP summary (e.g. node crashed)
  local pass_ct="${pass_str:-0}"
  local fail_ct="${fail_str:-0}"
  local fail_num="${has_failure:-0}"
  echo "Engine: $pass_ct passed, $fail_ct failed"
  [ "$fail_num" -eq 0 ]
  return $?
}

# -------------------------------------------------------------------
# Single-run: smoke + engine
# -------------------------------------------------------------------
run_all_once() {
  local overall_rc=0

  if [ "$MODE" = "engine" ]; then
    run_engine
    return $?
  fi

  # "all" mode: smoke + engine
  run_smoke
  [ $? -ne 0 ] && overall_rc=1

  run_engine
  [ $? -ne 0 ] && overall_rc=1

  return $overall_rc
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
    if $VERBOSE; then
      echo "--- Round $i / $total ---"
      node --test --test-reporter spec tests/engine.test.mjs tests/language.test.mjs tests/quality.test.mjs tests/time-utils.test.mjs 2>&1
      local rc=$?
    else
      local output
      output="$(node --test --test-reporter tap tests/engine.test.mjs tests/language.test.mjs tests/quality.test.mjs tests/time-utils.test.mjs 2>&1)"
      local rc=$?
    fi

    if $VERBOSE; then
      if [ "$rc" -eq 0 ]; then
        passed=$((passed + 1))
        echo "--- Round $i: PASS ---"
      else
        failed=$((failed + 1))
        fail_details="${fail_details}  Round $i: (see failures above)"$'\n'
        echo "--- Round $i: FAIL ---"
      fi
    else
      local fail_count
      fail_count="$(echo "$output" | grep -c '^not ok' || true)"
      if [ "$fail_count" -eq 0 ]; then
        passed=$((passed + 1))
      else
        failed=$((failed + 1))
        local failed_names
        failed_names="$(echo "$output" | grep '^not ok' | sed 's/^not ok [0-9]* - //')"
        fail_details="${fail_details}  Round $i: ${failed_names}"$'\n'
      fi
      # Print a progress character for every round (the summary tells the full story)
      printf "."
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
    # newline after progress dots (only if any rounds were run)
    [ "$total" -gt 0 ] && echo ""
    echo "Engine: $passed/$total rounds passed ($pass_pct%)"
  fi

  [ "$failed" -eq 0 ]
  return $?
}

# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------
if [ "$ROUNDS" -gt 1 ] && [ "$MODE" != "engine" ]; then
  # Multi-round: only engine tests are supported
  run_multi_round
  exit $?
fi

run_all_once
exit $?
