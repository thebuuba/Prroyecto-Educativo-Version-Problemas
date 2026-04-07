import { S } from './state.js';

const PANEL_MODULES = import.meta.glob('/js/panels/*.js');

/**
 * Página actual renderizada en el cliente.
 * @type {string}
 */
export let currentPage = 'dashboard';
export function setCurrentPage(val) { currentPage = val; }

/**
 * Flag para indicar si la sincronización de historial ya fue realizada.
 * @type {boolean}
 */
export let navHistoryInitialized = false;
export function setNavHistoryInitialized(val) { navHistoryInitialized = val; }

/**
 * Identificador de la raíz de navegación de EduGest en el objeto history.
 */
export const APP_HISTORY_ROOT = 'edugest-root';

/**
 * Mapa de rutas de URL para cada panel.
 * @type {Object<string, string>}
 */
export const PANEL_ROUTES = {
  dashboard: '/inicio',
  estudiantes: '/estudiantes',
  actividades: '/actividades',
  config: '/configuracion-actividades',
  matriz: '/matriz-general',
  reportes: '/reportes',
  horario: '/horario-docente',
  ai: '/asistente-ia',
  instrumentos: '/instrumentos',
  calendario: '/calendario-docente',
  planificaciones: '/planificaciones',
  asistencia: '/registro-asistencia',
  usuarios: '/usuarios',
  settings: '/configuracion',
};

export const MODAL_ROUTES = {};

/**
 * Mapeo de paneles a sus respectivos nombres de bundle/módulo.
 * @type {Object<string, string>}
 */
export const PANEL_BUNDLES = {
  dashboard: 'dashboard',
  estudiantes: 'estudiantes',
  actividades: 'actividades',
  config: 'actividades',
  matriz: 'matriz',
  reportes: 'reportes',
  horario: 'horario',
  ai: 'actividades',
  instrumentos: 'instrumentos',
  calendario: 'horario',
  planificaciones: 'planificaciones',
  asistencia: 'asistencia',
  settings: 'ajustes',
  usuarios: 'usuarios',
};

/**
 * Direcciones relativas de los archivos JS para cada bundle.
 * @type {Object<string, string>}
 */
export const PANEL_BUNDLE_URLS = {
  usuarios: '/js/panels/users.js',
  dashboard: '/js/panels/dashboard.js',
  estudiantes: '/js/panels/students.js',
  actividades: '/js/panels/activities.js',
  matriz: '/js/panels/matrix.js',
  reportes: '/js/panels/reports.js',
  horario: '/js/panels/schedule.js',
  instrumentos: '/js/panels/instruments.js',
  planificaciones: '/js/panels/planning.js',
  asistencia: '/js/panels/attendance.js',
  ajustes: '/js/panels/settings.js',
  auth: '/js/panels/auth.js',
};

export const loadedPanelBundles = window.__AULABASE_LOADED_BUNDLES || (window.__AULABASE_LOADED_BUNDLES = {});
export const pendingPanelBundleLoads = {};

export const PAGE = {
  // Configured in root.js or similarly for now to avoid direct dependency cycle
  // But for the sake of the monolith extraction we'll need it
};

// Routing Helpers

export function buildPanelUrl(requestedPage, activityViewMode) {
  const pageKey = requestedPage === 'config' || (requestedPage === 'actividades' && activityViewMode === 'config')
    ? 'config'
    : (requestedPage || 'dashboard');
  return PANEL_ROUTES[pageKey] || '/inicio';
}

export function buildModalUrl(id, currentP, activityViewM) {
  return MODAL_ROUTES[id] || buildPanelUrl(currentP || 'dashboard', activityViewM);
}

export function syncNavHistory(requestedPage, renderedPage, mode = 'push', currentActViewMode) {
  const nextUrl = buildPanelUrl(requestedPage, currentActViewMode);
  const historyState = {
    eduGestNav: true,
    requestedPage,
    page: renderedPage,
    activityViewMode: currentActViewMode,
  };
  if (mode === 'replace') window.history.replaceState(historyState, '', nextUrl);
  else if (`${window.location.pathname}${window.location.search}` !== nextUrl) window.history.pushState(historyState, '', nextUrl);
  else window.history.replaceState(historyState, '', nextUrl);
  navHistoryInitialized = true;
}

export function ensureAppHistoryRoot() {
  const state = window.history.state || {};
  if (state?.eduGestRoot) return;
  window.history.replaceState({ eduGestRoot: true, marker: APP_HISTORY_ROOT }, '', window.location.href);
  navHistoryInitialized = false;
}

export function resolvePanelBundleKey(pageKey) {
  return PANEL_BUNDLES[pageKey] || null;
}

export function buildPanelBundleUrl(bundleKey) {
  const baseUrl = PANEL_BUNDLE_URLS[bundleKey];
  if (!baseUrl) return '';
  const assetVersion = window.__AULABASE_ASSET_VERSION ? `?v=${encodeURIComponent(window.__AULABASE_ASSET_VERSION)}` : '';
  return `${baseUrl}${assetVersion}`;
}

/**
 * Carga dinámicamente el bundle o módulo necesario para un panel.
 * Soporta tanto módulos ES modernos como scripts legados.
 * @param {string} pageKey - Clave del panel a cargar.
 * @param {Object} RENDERS - Mapa de funciones de renderizado (del shell).
 * @returns {Promise<boolean>} Promesa que resuelve al completar la carga.
 */
export function ensurePanelBundleLoaded(pageKey, RENDERS) {
  const bundleKey = resolvePanelBundleKey(pageKey);
  if (!bundleKey) return Promise.resolve(Boolean(RENDERS[pageKey]));
  if (loadedPanelBundles[bundleKey]) return Promise.resolve(true);
  const bundleUrl = buildPanelBundleUrl(bundleKey);
  if (!bundleUrl) return Promise.resolve(Boolean(RENDERS[pageKey]));

  // Check if it's a modern ES module (migrated) or a legacy script bundle
  const isModule = bundleUrl.includes('/js/panels/') || bundleUrl.includes('/js/core/');
  
  if (isModule) {
    const globKey = bundleUrl.split('?')[0]; // Clean version for glob matching
    const importFn = PANEL_MODULES[globKey];

    if (importFn) {
      pendingPanelBundleLoads[bundleKey] = importFn()
        .then((mod) => {
          loadedPanelBundles[bundleKey] = true;
          delete pendingPanelBundleLoads[bundleKey];
          if (typeof mod.init === 'function') mod.init();
          return true;
        })
        .catch((err) => {
          delete pendingPanelBundleLoads[bundleKey];
          console.error(`[EduGest][routing] Error loading module ${bundleKey}:`, err);
          throw err;
        });
    } else {
      // Fallback for modules not in /js/panels/ or if glob fails
      pendingPanelBundleLoads[bundleKey] = import(/* @vite-ignore */ bundleUrl)
        .then((mod) => {
          loadedPanelBundles[bundleKey] = true;
          delete pendingPanelBundleLoads[bundleKey];
          if (typeof mod.init === 'function') mod.init();
          return true;
        })
        .catch((err) => {
          delete pendingPanelBundleLoads[bundleKey];
          console.error(`[EduGest][routing] Error loading module ${bundleKey} (fallback):`, err);
          throw err;
        });
    }
  } else {
    pendingPanelBundleLoads[bundleKey] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = bundleUrl;
      script.async = false;
      script.dataset.aulabaseBundle = bundleKey;
      script.onload = () => {
        loadedPanelBundles[bundleKey] = true;
        delete pendingPanelBundleLoads[bundleKey];
        resolve(true);
      };
      script.onerror = () => {
        delete pendingPanelBundleLoads[bundleKey];
        reject(new Error(`No se pudo cargar el bundle del panel ${bundleKey}`));
      };
      document.body.appendChild(script);
    });
  }
  return pendingPanelBundleLoads[bundleKey];
}

export function readPanelLocation(activeP, activeActViewM) {
  let path = String(window.location.pathname || '/').trim();
  path = path.replace(/\/index\.html$/i, '');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (!path) path = '/';
  const modalEntry = Object.entries(MODAL_ROUTES).find(([, route]) => route === path);
  if (modalEntry) {
    return {
      requestedPage: activeP || 'dashboard',
      activityViewMode: ['blocks','matrix','config'].includes(activeActViewM) ? activeActViewM : 'blocks',
      modalId: modalEntry[0],
    };
  }
  const entry = Object.entries(PANEL_ROUTES).find(([, route]) => route === path);
  if (entry) {
    const [requestedPage] = entry;
    return {
      requestedPage,
      activityViewMode: requestedPage === 'config' ? 'config' : (requestedPage === 'actividades' ? 'blocks' : null),
    };
  }
  const rawHash = String(window.location.hash || '').replace(/^#/, '').trim();
  if (rawHash === 'config') return { requestedPage: 'config', activityViewMode: 'config' };
  // Note: we can't check PAGE[rawHash] here without creating a circular dependency easily, so we'll handle it in the main entry
  return null;
}

/**
 * Función principal de navegación programática (puedes llamarla desde HTML).
 * @param {string} [requestedPage='dashboard'] - ID del panel de destino.
 * @param {Object} [options={}] - Opciones de navegación (replace, skipHistory).
 */
export function go(requestedPage = 'dashboard', options = {}) {
  const replace = options && (options.replace === true || options.replace === 'replace');
  const skipHistory = options && options.skipHistory === true;
  const activityViewMode = (requestedPage === 'config' || S.activityViewMode === 'config') ? 'config' : (requestedPage === 'actividades' ? S.activityViewMode : 'blocks');
  
  S.currentPage = requestedPage;
  if (activityViewMode) S.activityViewMode = activityViewMode;

  if (!skipHistory) {
     syncNavHistory(requestedPage, requestedPage, replace ? 'replace' : 'push', activityViewMode);
  }

  // En el monolito, 'go' disparaba 'renderPanel'. 
  // Aquí, como estamos en transición, dispararemos un evento global o llamaremos a window._renderPanel si existe.
  if (typeof window._renderPanel === 'function') {
    window._renderPanel();
  } else {
    console.debug('[EduGest][routing] _renderPanel no encontrado. Se llamará cuando el shell esté disponible.');
  }

  // Notificar cambio de página
  window.dispatchEvent(new CustomEvent('edugest:page-change', { detail: { page: requestedPage } }));
}

// Exportar al window para compatibilidad con el HTML legado (onclick="go(...)")
window.go = go;
window.currentPage = currentPage;

