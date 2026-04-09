// Entry point raíz de la app. Repite la secuencia núcleo + panel inicial + shell para que / use el mismo runtime que las demás páginas.
window.__AULABASE_PAGE_ENTRY = { route: '/', panel: 'dashboard' };
window.__AULABASE_ASSET_VERSION = '20260405i';
window.__AULABASE_LOADED_BUNDLES = window.__AULABASE_LOADED_BUNDLES || { core: false, shell: false };
(function installPersistGuards() {
  if (window.__AULABASE_PERSIST_GUARDS_INSTALLED) return;
  window.__AULABASE_PERSIST_GUARDS_INSTALLED = true;
  var flushPendingState = function () {
    try {
      if (window.EduGestDB && typeof window.EduGestDB.flushPendingSave === 'function') {
        window.EduGestDB.flushPendingSave();
      }
    } catch (_) {}
  };
  window.addEventListener('beforeunload', flushPendingState);
  window.addEventListener('pagehide', flushPendingState);
})();
(function loadAulaBaseRootBundles() {
  if (window.__AULABASE_SPLIT_BOOT_REQUESTED) return;
  window.__AULABASE_SPLIT_BOOT_REQUESTED = true;
  var bundleQueue = [
    { key: 'core', src: '/js/bundles/app-core.js?v=20260405i' },
    { key: 'dashboard', src: '/js/bundles/panel-dashboard.js?v=20260405i' },
    { key: 'shell', src: '/js/bundles/app-shell.js?v=20260405i' }
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
