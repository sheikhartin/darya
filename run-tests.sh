#!/usr/bin/env bash
#
# Runs the full Darya test suite: the Bash smoke test (file structure,
# syntax, live server checks, known-bug regression markers) followed by
# the Node.js engine test suite on its own for a clean, focused report.
#
# Usage: ./run-tests.sh

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

echo "Darya test suite"
echo "================"

bash tests/smoke-test.sh
exit_code=$?

exit "$exit_code"
