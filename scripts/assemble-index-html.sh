#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
OUTPUT_FILE="${1:-$ROOT_DIR/index.html}"

SECTIONS="
sections/shell/head.html
sections/shell/chrome.html
js/panels/configuracion-inicial/html/setup-profile-modal.html
sections/panels/estudiantes/modals.html
sections/panels/actividades/modals.html
sections/panels/instrumentos/modals.html
sections/panels/horario/modals.html
sections/shell/runtime-footer.html
"

first_section=1
: > "$OUTPUT_FILE"
for section in $SECTIONS; do
  file="$ROOT_DIR/$section"
  if [ ! -f "$file" ]; then
    echo "Error: falta el fragmento HTML $section" >&2
    exit 1
  fi
  if [ "$first_section" -eq 0 ]; then
    printf '\n' >> "$OUTPUT_FILE"
  fi
  cat "$file" >> "$OUTPUT_FILE"
  first_section=0
done
printf '\n' >> "$OUTPUT_FILE"

echo "[assemble-index-html] index ensamblado desde fragmentos organizados por seccion/panel."
