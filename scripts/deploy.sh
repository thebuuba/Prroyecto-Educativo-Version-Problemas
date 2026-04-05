#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LEGACY_WEB_DIR="$ROOT_DIR/web-legacy"
FIREBASE_CONFIG="${FIREBASE_CONFIG:-$ROOT_DIR/firebase.json}"

printf '\n[deploy] 1/4 Ensamblando artefactos...\n'
"$ROOT_DIR/scripts/assemble-all.sh"

printf '\n[deploy] 2/4 Sincronizando hosting-live y legacy...\n'
"$ROOT_DIR/scripts/prepare-hosting-live.sh"

printf '\n[deploy] 3/4 Validando build legacy JS...\n'
cd "$LEGACY_WEB_DIR"
npm run build
rm -rf "$LEGACY_WEB_DIR/public/legacy/dist"

printf '\n[deploy] 4/4 Deploy hosting...\n'
cd "$ROOT_DIR"
firebase deploy --config "$FIREBASE_CONFIG" --only hosting

printf '\n[deploy] OK. Publicado en hosting.\n'
