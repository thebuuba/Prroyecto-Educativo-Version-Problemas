// Entry point específico de la ruta /actividades/. Carga el núcleo común, el bundle del panel y luego el shell que arranca la app.
window.__AULABASE_PAGE_ENTRY = { route: 'actividades', panel: 'actividades' };
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
    if (!bundleQueue.length) {
      // Trigger modular entry point after bundles are ready
      var rootScript = document.createElement('script');
      rootScript.src = '/js/page-entry/root.js';
      rootScript.type = 'module';
      document.body.appendChild(rootScript);
      return;
    }
    var nextBundle = bundleQueue.shift();
    var script = document.createElement('script');
    script.src = nextBundle.src;
    script.async = false;
    script.dataset.aulabaseEntry = 'actividades';
    script.dataset.aulabaseBundle = nextBundle.key;
    script.onload = function () {
      window.__AULABASE_LOADED_BUNDLES[nextBundle.key] = true;
      loadNextBundle();
    };
    document.body.appendChild(script);
  }
  loadNextBundle();
})();
