// Entry point específico de la ruta /planificaciones/. Carga el núcleo común, el bundle del panel y luego el shell que arranca la app.
window.__AULABASE_PAGE_ENTRY = { route: 'planificaciones', panel: 'planificaciones' };
window.__AULABASE_ASSET_VERSION = '20260405i';
window.__AULABASE_LOADED_BUNDLES = window.__AULABASE_LOADED_BUNDLES || { core: false, shell: false };
(function loadAulaBaseSplitBundles() {
  if (window.__AULABASE_SPLIT_BOOT_REQUESTED) return;
  window.__AULABASE_SPLIT_BOOT_REQUESTED = true;
  var bundleQueue = [
    { key: 'core', src: '/js/bundles/app-core.js?v=20260405i' },
    { key: 'planificaciones', src: '/js/bundles/panel-planificaciones.js?v=20260405i' },
    { key: 'shell', src: '/js/bundles/app-shell.js?v=20260405i' }
  ];
  function loadNextBundle() {
    if (!bundleQueue.length) return;
    var nextBundle = bundleQueue.shift();
    var script = document.createElement('script');
    script.src = nextBundle.src;
    script.async = false;
    script.dataset.aulabaseEntry = 'planificaciones';
    script.dataset.aulabaseBundle = nextBundle.key;
    script.onload = function () {
      window.__AULABASE_LOADED_BUNDLES[nextBundle.key] = true;
      loadNextBundle();
    };
    document.body.appendChild(script);
  }
  loadNextBundle();
})();
