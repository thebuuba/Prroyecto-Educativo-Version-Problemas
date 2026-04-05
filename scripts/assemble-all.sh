#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

sh "$ROOT_DIR/scripts/assemble-app-js.sh"
sh "$ROOT_DIR/scripts/assemble-app-bundles.sh"
sh "$ROOT_DIR/scripts/assemble-index-html.sh"
sh "$ROOT_DIR/scripts/generate-panel-pages.sh" "$ROOT_DIR"

echo "[assemble-all] app.js + bundles + index.html + páginas por panel actualizados."
