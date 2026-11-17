#!/usr/bin/env bash
# Build the Next.js site and refresh static/ from it. Run from anywhere, then commit static/.
# Anything in static/ that is not produced by the build is a mistake waiting to happen, so we stop
# and list it instead of deleting it. Put such files in web/public/ instead.
# static/vendor and static/models are git-ignored local downloads; they are kept as they are.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
keep=(vendor models)

cd "$root/web"
npm ci
npm run build

orphans=""
if [ -d "$root/static" ]; then
  orphans="$(cd "$root/static" && find . -type f ! -path './vendor/*' ! -path './models/*' ! -path './_next/*' | sort \
    | while read -r f; do [ -e "$root/web/out/$f" ] || echo "$f"; done)"
fi
if [ -n "$orphans" ] && [ "${FORCE:-0}" != "1" ]; then
  echo "Stopped: these files exist in static/ but not in the build, and would be deleted:" >&2
  echo "$orphans" >&2
  echo "Move them into web/public/ (same relative path) and run again, or run with FORCE=1 to delete them." >&2
  exit 1
fi

tmp="$(mktemp -d)"
for d in "${keep[@]}"; do [ -d "$root/static/$d" ] && mv "$root/static/$d" "$tmp/$d"; done
rm -rf "$root/static"
cp -r "$root/web/out" "$root/static"
for d in "${keep[@]}"; do [ -d "$tmp/$d" ] && mv "$tmp/$d" "$root/static/$d"; done
rm -rf "$tmp"
echo "static/ refreshed from web/out"
