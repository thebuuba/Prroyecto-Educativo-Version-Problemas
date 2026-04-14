#!/bin/sh
set -eu

TARGET_DIR="${1:-$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)}"
INDEX_FILE="$TARGET_DIR/index.html"

if [ ! -f "$INDEX_FILE" ]; then
  echo "Error: falta $INDEX_FILE para generar páginas por panel." >&2
  exit 1
fi

APP_VERSION=$(sed -n 's#.*<script[^>]*src="/js/page-entry/root.js?v=\([^"]*\)".*#\1#p' "$INDEX_FILE" | head -n 1)
if [ -z "${APP_VERSION:-}" ]; then
  APP_VERSION=$(sed -n 's#.*<script[^>]*src="/js/config.js?v=\([^"]*\)".*#\1#p' "$INDEX_FILE" | head -n 1)
fi
if [ -z "${APP_VERSION:-}" ]; then
  APP_VERSION=$(sed -n 's#.*<script src="/app.js?v=\([^"]*\)".*#\1#p' "$INDEX_FILE" | head -n 1)
fi
if [ -z "${APP_VERSION:-}" ]; then
  echo "Error: no se pudo detectar la versión de los scripts runtime en $INDEX_FILE." >&2
  exit 1
fi

ROUTES=$(cat <<'EOF'
inicio|dashboard|dashboard|Inicio
estudiantes|estudiantes|estudiantes|Estudiantes
actividades|actividades|actividades|Actividades
configuracion-actividades|config|actividades|Configuración de actividades
matriz-general|matriz|matriz|Matriz general
reportes|reportes|reportes|Reportes
horario-docente|horario|horario|Horario docente
asistente-ia|ai|actividades|Asistente IA
calendario-docente|horario|horario|Calendario docente
instrumentos|instrumentos|instrumentos|Instrumentos
planificaciones|planificaciones|planificaciones|Planificaciones
registro-asistencia|asistencia|asistencia|Registro de asistencia
usuarios|usuarios|shell|Usuarios
configuracion|settings|ajustes|Configuración
EOF
)

rm -rf "$TARGET_DIR/js/page-entry"
mkdir -p "$TARGET_DIR/js/page-entry"

cat > "$TARGET_DIR/js/page-entry/root.js" <<EOF
// Entry point raíz de la app. Repite la secuencia núcleo + panel inicial + shell para que / use el mismo runtime que las demás páginas.
window.__AULABASE_PAGE_ENTRY = { route: '/', panel: 'dashboard' };
window.__AULABASE_ASSET_VERSION = '$APP_VERSION';
window.__AULABASE_LOADED_BUNDLES = window.__AULABASE_LOADED_BUNDLES || { core: false, shell: false };
(function loadAulaBaseRootBundles() {
  if (window.__AULABASE_SPLIT_BOOT_REQUESTED) return;
  window.__AULABASE_SPLIT_BOOT_REQUESTED = true;
  var bundleQueue = [
    { key: 'core', src: '/js/bundles/app-core.js?v=$APP_VERSION' },
    { key: 'dashboard', src: '/js/bundles/panel-dashboard.js?v=$APP_VERSION' },
    { key: 'shell', src: '/js/bundles/app-shell.js?v=$APP_VERSION' }
  ];
  function loadNextBundle() {
    if (!bundleQueue.length) return;
    var nextBundle = bundleQueue.shift();
    var script = document.createElement('script');
    script.src = nextBundle.src;
    script.async = false;
    script.dataset.aulabaseEntry = 'dashboard';
    script.dataset.aulabaseBundle = nextBundle.key;
    script.onload = function () {
      window.__AULABASE_LOADED_BUNDLES[nextBundle.key] = true;
      loadNextBundle();
    };
    document.body.appendChild(script);
  }
  loadNextBundle();
})();
EOF

echo "$ROUTES" | while IFS='|' read -r route panel bundle title; do
  [ -n "$route" ] || continue
  mkdir -p "$TARGET_DIR/$route"
  sed \
    -e "s#<title>AulaBase</title>#<title>AulaBase - $title</title>#g" \
    -e "s#<script type=\"module\" src=\"/js/page-entry/root.js\"></script>#<script type=\"module\" src=\"/js/page-entry/$route.js?v=$APP_VERSION\"></script>#g" \
    -e "s#<script type=\"module\" src=\"/js/page-entry/root.js?v=[^\"]*\"></script>#<script type=\"module\" src=\"/js/page-entry/$route.js?v=$APP_VERSION\"></script>#g" \
    -e "s#<script src=\"/js/page-entry/root.js?v=[^\"]*\" defer></script>#<script src=\"/js/page-entry/$route.js?v=$APP_VERSION\" defer></script>#g" \
    -e "s#<script src=\"/app.js?v=[^\"]*\" defer></script>#<script src=\"/js/page-entry/$route.js?v=$APP_VERSION\" defer></script>#g" \
    "$INDEX_FILE" > "$TARGET_DIR/$route/index.html"
  if [ "$bundle" = "shell" ]; then
    cat > "$TARGET_DIR/js/page-entry/$route.js" <<EOF
// Entry point específico de la ruta /$route/. Carga el núcleo común y luego el shell que arranca la app.
window.__AULABASE_PAGE_ENTRY = { route: '$route', panel: '$panel' };
window.__AULABASE_ASSET_VERSION = '$APP_VERSION';
window.__AULABASE_LOADED_BUNDLES = window.__AULABASE_LOADED_BUNDLES || { core: false, shell: false };
(function loadAulaBaseSplitBundles() {
  if (window.__AULABASE_SPLIT_BOOT_REQUESTED) return;
  window.__AULABASE_SPLIT_BOOT_REQUESTED = true;
  var bundleQueue = [
    { key: 'core', src: '/js/bundles/app-core.js?v=$APP_VERSION' },
    { key: 'shell', src: '/js/bundles/app-shell.js?v=$APP_VERSION' }
  ];
  function loadNextBundle() {
    if (!bundleQueue.length) return;
    var nextBundle = bundleQueue.shift();
    var script = document.createElement('script');
    script.src = nextBundle.src;
    script.async = false;
    script.dataset.aulabaseEntry = '$panel';
    script.dataset.aulabaseBundle = nextBundle.key;
    script.onload = function () {
      window.__AULABASE_LOADED_BUNDLES[nextBundle.key] = true;
      loadNextBundle();
    };
    document.body.appendChild(script);
  }
  loadNextBundle();
})();
EOF
  else
    cat > "$TARGET_DIR/js/page-entry/$route.js" <<EOF
// Entry point específico de la ruta /$route/. Carga el núcleo común, el bundle del panel y luego el shell que arranca la app.
window.__AULABASE_PAGE_ENTRY = { route: '$route', panel: '$panel' };
window.__AULABASE_ASSET_VERSION = '$APP_VERSION';
window.__AULABASE_LOADED_BUNDLES = window.__AULABASE_LOADED_BUNDLES || { core: false, shell: false };
(function loadAulaBaseSplitBundles() {
  if (window.__AULABASE_SPLIT_BOOT_REQUESTED) return;
  window.__AULABASE_SPLIT_BOOT_REQUESTED = true;
  var bundleQueue = [
    { key: 'core', src: '/js/bundles/app-core.js?v=$APP_VERSION' },
    { key: '$bundle', src: '/js/bundles/panel-$bundle.js?v=$APP_VERSION' },
    { key: 'shell', src: '/js/bundles/app-shell.js?v=$APP_VERSION' }
  ];
  function loadNextBundle() {
    if (!bundleQueue.length) return;
    var nextBundle = bundleQueue.shift();
    var script = document.createElement('script');
    script.src = nextBundle.src;
    script.async = false;
    script.dataset.aulabaseEntry = '$panel';
    script.dataset.aulabaseBundle = nextBundle.key;
    script.onload = function () {
      window.__AULABASE_LOADED_BUNDLES[nextBundle.key] = true;
      loadNextBundle();
    };
    document.body.appendChild(script);
  }
  loadNextBundle();
})();
EOF
  fi
done

echo "[generate-panel-pages] páginas y entrypoints por panel generados en $TARGET_DIR."
