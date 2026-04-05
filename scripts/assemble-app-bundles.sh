#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MODULES_DIR="$ROOT_DIR/js/modules"
OUT_DIR="$ROOT_DIR/js/bundles"

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR"/*.js

write_bundle() {
  bundle_name="$1"
  shift
  out_file="$OUT_DIR/$bundle_name"

  cat > "$out_file" <<EOF
/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-bundles.sh
 */

EOF

  for module_name in "$@"; do
    cat "$MODULES_DIR/$module_name" >> "$out_file"
    printf '\n' >> "$out_file"
  done
}

write_bundle "app-core.js" \
  "00-core-state-and-utils.js" \
  "03-core-persistencia-y-sesion.js" \
  "04-core-texto-y-normalizacion.js" \
  "05-core-hidratacion-y-restauracion.js" \
  "06-core-settings-guards.js" \
  "02-core-interacciones-y-motion.js" \
  "19-panel-horario-docente.js" \
  "01-panel-autenticacion.js"

write_bundle "app-shell.js" \
  "50-panel-usuarios-eliminacion-y-arranque.js"

write_bundle "panel-dashboard.js" \
  "10-panel-tablero.js" \
  "11-panel-tablero-estado.js"

write_bundle "panel-estudiantes.js" \
  "12-panel-estudiantes-state.js" \
  "20-panel-estudiantes.js"

write_bundle "panel-actividades.js" \
  "13-panel-actividades-state.js" \
  "21-panel-actividades.js" \
  "24-panel-configuracion-actividades.js"

write_bundle "panel-planificaciones.js" \
  "14-panel-planificaciones-state.js" \
  "15-panel-planificaciones-view.js" \
  "16-panel-planificaciones-actions.js" \
  "23-panel-planificaciones-interfaz.js"

write_bundle "panel-asistencia.js" \
  "17-panel-asistencia.js"

write_bundle "panel-ajustes.js" \
  "18-panel-ajustes.js"

write_bundle "panel-horario.js" \
  "19-panel-horario-docente.js"

write_bundle "panel-instrumentos.js" \
  "22-panel-instrumentos-vista.js" \
  "42-panel-motor-instrumentos.js"

write_bundle "panel-matriz.js" \
  "40-panel-matriz.js"

write_bundle "panel-reportes.js" \
  "41-panel-reportes.js"

echo "[assemble-app-bundles] bundles generados en js/bundles/."
