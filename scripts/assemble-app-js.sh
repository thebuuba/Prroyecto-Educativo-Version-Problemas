#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MODULES_DIR="$ROOT_DIR/js/modules"
OUT_FILE="$ROOT_DIR/app.js"

cat > "$OUT_FILE" <<'EOF'
/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-js.sh
 */

EOF

cat \
  "$MODULES_DIR/00-core-state-and-utils.js" \
  "$MODULES_DIR/03-core-persistencia-y-sesion.js" \
  "$MODULES_DIR/04-core-texto-y-normalizacion.js" \
  "$MODULES_DIR/05-core-hidratacion-y-restauracion.js" \
  "$MODULES_DIR/06-core-settings-guards.js" \
  "$MODULES_DIR/02-core-interacciones-y-motion.js" \
  "$MODULES_DIR/19-panel-horario-docente.js" \
  "$MODULES_DIR/01-panel-autenticacion.js" \
  "$MODULES_DIR/10-panel-tablero.js" \
  "$MODULES_DIR/11-panel-tablero-estado.js" \
  "$MODULES_DIR/12-panel-estudiantes-state.js" \
  "$MODULES_DIR/13-panel-actividades-state.js" \
  "$MODULES_DIR/14-panel-planificaciones-state.js" \
  "$MODULES_DIR/15-panel-planificaciones-view.js" \
  "$MODULES_DIR/16-panel-planificaciones-actions.js" \
  "$MODULES_DIR/17-panel-asistencia.js" \
  "$MODULES_DIR/18-panel-ajustes.js" \
  "$MODULES_DIR/20-panel-estudiantes.js" \
  "$MODULES_DIR/21-panel-actividades.js" \
  "$MODULES_DIR/22-panel-instrumentos-vista.js" \
  "$MODULES_DIR/23-panel-planificaciones-interfaz.js" \
  "$MODULES_DIR/24-panel-configuracion-actividades.js" \
  "$MODULES_DIR/40-panel-matriz.js" \
  "$MODULES_DIR/41-panel-reportes.js" \
  "$MODULES_DIR/42-panel-motor-instrumentos.js" \
  "$MODULES_DIR/50-panel-usuarios-eliminacion-y-arranque.js" \
  >> "$OUT_FILE"

echo "[assemble-app-js] app.js generado desde js/modules/."
