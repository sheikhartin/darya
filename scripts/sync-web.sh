#!/usr/bin/env bash
#
# Syncs the static web app from the project root into www/ so Capacitor
# has a valid webDir. Capacitor 8 rejects "." (the project root) and
# requires a real subdirectory containing index.html.
#
# The project root stays the single source of truth for the PWA (hosted
# on GitHub Pages etc.); www/ is generated output, gitignored, and only
# used as the web bundle inside the Android app. The service worker
# fetches package.json at install time for its versioned cache name, so
# it is copied along with the app shell.
#
# Usage:
#   ./scripts/sync-web.sh
#   npm run sync:web

set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf www
mkdir -p www
cp -r \
  index.html \
  css \
  js \
  fonts \
  assets \
  manifest.json \
  sw.js \
  package.json \
  www/

echo "Web assets synced to www/"
