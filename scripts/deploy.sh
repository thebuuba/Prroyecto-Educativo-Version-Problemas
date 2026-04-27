#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FIREBASE_CONFIG="${FIREBASE_CONFIG:-$ROOT_DIR/firebase.json}"

printf '\n[deploy] 1/3 Ensamblando fuentes...\n'
"$ROOT_DIR/scripts/assemble-all.sh"

printf '\n[deploy] 2/3 Generando dist con Vite...\n'
cd "$ROOT_DIR"
npm run build

printf '\n[deploy] 3/3 Deploy hosting...\n'
firebase deploy --config "$FIREBASE_CONFIG" --only hosting

printf '\n[deploy] OK. Publicado en hosting.\n'
