/**
 * Capa de compatibilidad legacy.
 * Centraliza la exposición de APIs modulares al ámbito global `window`
 * para que el HTML inline y los flujos heredados sigan funcionando.
 */

import { S } from './state.ts';
import { ensurePanelBundleLoaded } from './routing.ts';
import { flattenLegacyBridgeRegistry } from './legacy-api.ts';

export function installPersistGuards() {
  if (window.__AULABASE_PERSIST_GUARDS_INSTALLED) return;

  window.__AULABASE_PERSIST_GUARDS_INSTALLED = true;
  const flushPendingState = () => {
    try {
      window.EduGestDB?.flushPendingSave?.();
    } catch (_) {}
    try {
      window.flushSqlProfileSync?.();
      window.flushSqlStateBlockSyncs?.();
    } catch (_) {}
  };

  window.addEventListener('beforeunload', flushPendingState);
  window.addEventListener('pagehide', flushPendingState);
}

export function registerLegacyBridge() {
  Object.assign(window, flattenLegacyBridgeRegistry());
}

export function registerPanelRenderer() {
  window._renderPanel = async () => {
    const container = document.getElementById('view');
    if (!container) {
      console.warn('[EduGest][render] No se encontró el contenedor #view.');
      return;
    }

    const page = S.currentPage || 'tablero';

    if (window.RENDERS && typeof window.RENDERS[page] === 'function') {
      window.RENDERS[page](container);
      if (typeof window.refreshTop === 'function') {
        window.refreshTop();
      }
      return;
    }

    try {
      const loaded = await ensurePanelBundleLoaded(page, window.RENDERS || {});
      if (loaded && window.RENDERS[page]) {
        window.RENDERS[page](container);
        if (typeof window.refreshTop === 'function') window.refreshTop();
      } else {
        console.warn(`[EduGest][render] No se encontró renderizador para el panel: ${page}`);
      }
    } catch (err) {
      console.error(`[EduGest][render] Error cargando bundle para ${page}:`, err);
    }
  };
}
