#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)

"$ROOT_DIR/scripts/assemble-all.sh"
"$ROOT_DIR/scripts/prepare-hosting-live.sh"
cd "$ROOT_DIR"
firebase deploy --only hosting --project proyectivoeducativo
