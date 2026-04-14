#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
HOSTING_DIR="$ROOT_DIR/hosting-live"
LEGACY_DIR="$ROOT_DIR/web-legacy/public/legacy"
LEGACY_PUBLIC_DIR="$LEGACY_DIR/public"
LEGACY_ASSETS_DIR="$LEGACY_PUBLIC_DIR/assets"
ROOT_PUBLIC_ASSETS_DIR="$ROOT_DIR/public/assets"

for file in "$ROOT_DIR/index.html" "$ROOT_DIR/styles.css" "$ROOT_DIR/terminos.html" "$ROOT_DIR/privacidad.html"; do
  if [ ! -f "$file" ]; then
    echo "Error: falta el artefacto requerido $file." >&2
    exit 1
  fi
done

if [ ! -d "$ROOT_DIR/js" ] || [ ! -d "$ROOT_DIR/styles" ] || [ ! -d "$ROOT_PUBLIC_ASSETS_DIR" ]; then
  echo "Error: faltan directorios fuente en la raiz del proyecto." >&2
  exit 1
fi

mkdir -p "$HOSTING_DIR" "$HOSTING_DIR/legacy"
mkdir -p "$LEGACY_DIR" "$LEGACY_PUBLIC_DIR" "$LEGACY_ASSETS_DIR"
mkdir -p "$HOSTING_DIR/assets" "$HOSTING_DIR/js" "$HOSTING_DIR/styles"
rm -rf "$LEGACY_DIR/dist" "$HOSTING_DIR/legacy/dist"

cp -f "$ROOT_DIR/index.html" "$LEGACY_DIR/index.html"
cp -f "$ROOT_DIR/styles.css" "$LEGACY_DIR/styles.css"
cp -f "$ROOT_DIR/terminos.html" "$LEGACY_DIR/terminos.html"
cp -f "$ROOT_DIR/privacidad.html" "$LEGACY_DIR/privacidad.html"
rsync -a --delete "$ROOT_DIR/js/" "$LEGACY_DIR/js/"
rsync -a --delete "$ROOT_DIR/styles/" "$LEGACY_DIR/styles/"
rsync -a --delete "$ROOT_PUBLIC_ASSETS_DIR/" "$LEGACY_ASSETS_DIR/"
"$ROOT_DIR/scripts/generate-panel-pages.sh" "$LEGACY_DIR"

cp -f "$ROOT_DIR/index.html" "$HOSTING_DIR/index.html"
cp -f "$ROOT_DIR/styles.css" "$HOSTING_DIR/styles.css"
cp -f "$ROOT_DIR/terminos.html" "$HOSTING_DIR/terminos.html"
cp -f "$ROOT_DIR/privacidad.html" "$HOSTING_DIR/privacidad.html"
rsync -a --delete "$ROOT_DIR/js/" "$HOSTING_DIR/js/"
rsync -a --delete "$ROOT_DIR/styles/" "$HOSTING_DIR/styles/"
rsync -a --delete "$ROOT_PUBLIC_ASSETS_DIR/" "$HOSTING_DIR/assets/"
"$ROOT_DIR/scripts/generate-panel-pages.sh" "$HOSTING_DIR"

rsync -a --delete "$LEGACY_DIR/" "$HOSTING_DIR/legacy/"

find "$HOSTING_DIR" "$LEGACY_DIR" -name '.DS_Store' -delete

echo "hosting-live y web-legacy/public/legacy sincronizados desde las fuentes activas."
