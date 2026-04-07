/**
 * Punto de entrada específico para la ruta de Configuración de Actividades.
 * --------------------------------------------------------------------------
 * Este script se encarga de:
 * 1. Definir la ruta activa y el panel a cargar (config).
 * 2. Cargar secuencialmente los bundles necesarios (Núcleo, Panel, Shell).
 */

window.__AULABASE_PAGE_ENTRY = { route: 'configuracion-actividades', panel: 'config' };
window.__AULABASE_ASSET_VERSION = '20260405i';
window.__AULABASE_LOADED_BUNDLES = window.__AULABASE_LOADED_BUNDLES || { core: false, shell: false };

(function loadAulaBaseSplitBundles() {
  if (window.__AULABASE_SPLIT_BOOT_REQUESTED) return;
  window.__AULABASE_SPLIT_BOOT_REQUESTED = true;

  var bundleQueue = [
    { key: 'core', src: '/js/bundles/app-core.js?v=20260405i' },
    { key: 'actividades', src: '/js/bundles/panel-actividades.js?v=20260405i' },
    { key: 'shell', src: '/js/bundles/app-shell.js?v=20260405i' }
  ];

  function loadNextBundle() {
    if (!bundleQueue.length) return;
    var nextBundle = bundleQueue.shift();
    var script = document.createElement('script');
    script.src = nextBundle.src;
    script.async = false;
    script.dataset.aulabaseEntry = 'config';
    script.dataset.aulabaseBundle = nextBundle.key;
    script.onload = function () {
      window.__AULABASE_LOADED_BUNDLES[nextBundle.key] = true;
      loadNextBundle();
    };
    document.body.appendChild(script);
  }

  loadNextBundle();
})();
