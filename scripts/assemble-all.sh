#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

sh "$ROOT_DIR/scripts/assemble-index-html.sh"

echo "[assemble-all] index.html actualizado desde fragments fuente. Usa npm run build para generar dist/."
