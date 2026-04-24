/**
 * Punto de entrada específico para la ruta /calendario-docente/.
 * Define la ruta activa y delega el arranque al entrypoint modular raíz.
 */

window.__AULABASE_PAGE_ENTRY = { route: 'calendario-docente', panel: 'horario' };
window.__AULABASE_ASSET_VERSION = window.__AULABASE_ASSET_VERSION || '20260405i';

function startAulaBaseRoot() {
  if (window.__AULABASE_ROOT_BOOT_REQUESTED) return;
  window.__AULABASE_ROOT_BOOT_REQUESTED = true;
  var rootScript = document.createElement('script');
  rootScript.src = '/js/page-entry/root.js';
  rootScript.type = 'module';
  document.body.appendChild(rootScript);
}

function waitForAulaBaseAuth(callback) {
  if (document.getElementById('m-auth')) { callback(); return; }
  if (window.__AULABASE_AUTH_READY && typeof window.__AULABASE_AUTH_READY.then === 'function') {
    window.__AULABASE_AUTH_READY.then(callback);
    return;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.setTimeout(callback, 0); }, { once: true });
    return;
  }
  window.setTimeout(callback, 0);
}

waitForAulaBaseAuth(startAulaBaseRoot);
