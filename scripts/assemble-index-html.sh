#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SECTIONS_DIR="$ROOT_DIR/sections/html"
OUT_FILE="$ROOT_DIR/index.html"

cat > "$OUT_FILE" <<'EOF'
<!-- AUTO-GENERADO: no editar directamente.
     Fuente: sections/html/* + scripts/assemble-index-html.sh -->

EOF

cat \
  "$SECTIONS_DIR/00-shell-head.html" \
  "$SECTIONS_DIR/01-shell-chrome.html" \
  "$SECTIONS_DIR/02-auth-access-shell.html" \
  "$SECTIONS_DIR/03-auth-login-box.html" \
  "$SECTIONS_DIR/04-auth-register-box.html" \
  "$SECTIONS_DIR/05-auth-modal-utils.html" \
  "$SECTIONS_DIR/03-setup-profile-modal.html" \
  "$SECTIONS_DIR/04-panel-estudiantes-modals.html" \
  "$SECTIONS_DIR/05-panel-actividades-usuarios-modals.html" \
  "$SECTIONS_DIR/06-panel-instrumentos-modals.html" \
  "$SECTIONS_DIR/07-panel-horario-modals.html" \
  "$SECTIONS_DIR/08-runtime-footer.html" \
  >> "$OUT_FILE"

echo "[assemble-index-html] index.html generado desde sections/html/."
