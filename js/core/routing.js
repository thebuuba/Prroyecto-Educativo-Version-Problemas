/**
 * Sistema de Enrutamiento y Carga de Paneles.
 * Este módulo gestiona el historial de navegación, el mapeo de URLs a paneles
 * y la carga dinámica de módulos (bundles) para optimizar el rendimiento.
 */

import { S } from './state.js';

/** Diccionario de módulos de paneles disponibles para importación dinámica vía Vite. */
const PANEL_MODULES = import.meta.glob('/js/panels/*.js');

/**
 * ID del panel actualmente renderizado.
 * @type {string}
 */
export let currentPage = 'dashboard';
export function setCurrentPage(val) { currentPage = val; }

/**
 * Indica si el sistema de historial (pushState) ya fue inicializado.
 * @type {boolean}
 */
export let navHistoryInitialized = false;
export function setNavHistoryInitialized(val) { navHistoryInitialized = val; }

/** Identificador de la raíz en el objeto de historial del navegador. */
export const APP_HISTORY_ROOT = 'edugest-root';

/**
 * Mapeo de identificadores de panel a rutas amigables de URL.
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
  'grade-setup': '/configuracion-academica',
  'student-create': '/nuevo-estudiante',
  'section-create': '/nueva-asignatura',
  'student-edit': '/editar-estudiante',
};

/** @type {Object} Reservado para rutas de modales específicos. */
export const MODAL_ROUTES = {};

/**
 * Agrupación de paneles por nombre de bundle (paquete de código común).
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
  'grade-setup': 'grados',
  'student-create': 'estudiantes-nuevo',
  'section-create': 'secciones-nuevo',
  'student-edit': 'estudiantes-edicion',
};

/**
 * Ubicaciones físicas de los archivos JS para cada bundle.
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
  grados: '/js/panels/grade-setup.js',
  'estudiantes-nuevo': '/js/panels/student-create.js',
  'secciones-nuevo': '/js/panels/section-create.js',
  'estudiantes-edicion': '/js/panels/student-edit.js',
};

/** Registro de bundles ya cargados en la sesión actual. */
export const loadedPanelBundles = window.__AULABASE_LOADED_BUNDLES || (window.__AULABASE_LOADED_BUNDLES = {});

/** Registro de promesas de carga en curso para evitar descargas duplicadas. */
export const pendingPanelBundleLoads = {};

/** Configuración de metadatos de página (Títulos, categorías). */
export const PAGE = {};

/**
 * Construye una URL completa basada en el panel y el modo de vista.
 * @param {string} requestedPage - El ID del panel.
 * @param {string} activityViewMode - El sub-modo (ej. 'config', 'blocks').
 * @returns {string} URL formada.
 */
export function buildPanelUrl(requestedPage, activityViewMode) {
  const pageKey = requestedPage === 'config' || (requestedPage === 'actividades' && activityViewMode === 'config')
    ? 'config'
    : (requestedPage || 'dashboard');
  return PANEL_ROUTES[pageKey] || '/inicio';
}

/**
 * Construye la URL para un modal, manteniendo el contexto de la página actual.
 */
export function buildModalUrl(id, currentP, activityViewM) {
  return MODAL_ROUTES[id] || buildPanelUrl(currentP || 'dashboard', activityViewM);
}

/**
 * Sincroniza el estado del panel con el historial del navegador (history API).
 * @param {string} requestedPage - Página solicitada.
 * @param {string} renderedPage - Página realmente renderizada.
 * @param {'push'|'replace'} mode - Tipo de entrada en el historial.
 * @param {string} currentActViewMode - Modo de vista actual.
 */
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

/**
 * Garantiza que exista una marca de inicio en el historial para detectar el cierre de la app.
 */
export function ensureAppHistoryRoot() {
  const state = window.history.state || {};
  if (state?.eduGestRoot) return;
  window.history.replaceState({ eduGestRoot: true, marker: APP_HISTORY_ROOT }, '', window.location.href);
  navHistoryInitialized = false;
}

/**
 * Resuelve qué bundle de código pertenece a una página específica.
 */
export function resolvePanelBundleKey(pageKey) {
  return PANEL_BUNDLES[pageKey] || null;
}

/**
 * Construye la URL de descarga de un bundle añadiendo control de versiones.
 */
export function buildPanelBundleUrl(bundleKey) {
  const baseUrl = PANEL_BUNDLE_URLS[bundleKey];
  if (!baseUrl) return '';
  const assetVersion = window.__AULABASE_ASSET_VERSION ? `?v=${encodeURIComponent(window.__AULABASE_ASSET_VERSION)}` : '';
  return `${baseUrl}${assetVersion}`;
}

/**
 * Carga dinámicamente el bundle o módulo necesario para un panel.
 * Soporta tanto módulos ES modernos como scripts legados para maximizar compatibilidad.
 * @param {string} pageKey - Clave del panel a cargar.
 * @param {Object} RENDERS - Mapa de funciones de renderizado del componente Shell.
 * @returns {Promise<boolean>} Resuelve true si el bundle está listo.
 */
export function ensurePanelBundleLoaded(pageKey, RENDERS) {
  const bundleKey = resolvePanelBundleKey(pageKey);
  if (!bundleKey) return Promise.resolve(Boolean(RENDERS[pageKey]));
  if (loadedPanelBundles[bundleKey]) return Promise.resolve(true);
  const bundleUrl = buildPanelBundleUrl(bundleKey);
  if (!bundleUrl) return Promise.resolve(Boolean(RENDERS[pageKey]));

  // Determinar si es un módulo ES nativo o un script global
  const isModule = bundleUrl.includes('/js/panels/') || bundleUrl.includes('/js/core/');
  
  if (isModule) {
    const globKey = bundleUrl.split('?')[0]; 
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
          console.error(`[EduGest][routing] Error cargando módulo ${bundleKey}:`, err);
          throw err;
        });
    } else {
      // Fallback para importación dinámica directa (ignorado por Vite)
      pendingPanelBundleLoads[bundleKey] = import(/* @vite-ignore */ bundleUrl)
        .then((mod) => {
          loadedPanelBundles[bundleKey] = true;
          delete pendingPanelBundleLoads[bundleKey];
          if (typeof mod.init === 'function') mod.init();
          return true;
        })
        .catch((err) => {
          delete pendingPanelBundleLoads[bundleKey];
          console.error(`[EduGest][routing] Error cargando módulo ${bundleKey} (fallback):`, err);
          throw err;
        });
    }
  } else {
    // Carga de scripts legados inyectando etiquetas <script>
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

/**
 * Analiza la URL actual para determinar qué panel debe mostrarse.
 * @param {string} activeP - Página activa sugerida.
 * @param {string} activeActViewM - Modo de vista activo sugerido.
 * @returns {Object|null} Objeto con la localización resuelta.
 */
export function readPanelLocation(activeP, activeActViewM) {
  let path = String(window.location.pathname || '/').trim();
  
  // Normalización agresiva de la ruta
  path = path.replace(/\/index\.html$/i, '');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (!path || path === '/') path = '/';

  console.debug(`[EduGest][routing] Detectando panel para ruta: "${path}"`);
  
  const modalEntry = Object.entries(MODAL_ROUTES).find(([, route]) => route === path);
  if (modalEntry) {
    return {
      requestedPage: activeP || 'dashboard',
      activityViewMode: ['blocks','matrix','config'].includes(activeActViewM) ? activeActViewM : 'blocks',
      modalId: modalEntry[0],
    };
  }
  
  // Buscar en el mapeo de rutas (incluyendo rutas exactas como /configuracion)
  const entry = Object.entries(PANEL_ROUTES).find(([, route]) => {
    const r = String(route || '').trim();
    return r === path || r === (path + '/') || path === (r + '/');
  });

  if (entry) {
    const [requestedPage] = entry;
    return {
      requestedPage,
      activityViewMode: requestedPage === 'config' ? 'config' : (requestedPage === 'actividades' ? 'blocks' : (activeActViewM || null)),
    };
  }
  
  const rawHash = String(window.location.hash || '').replace(/^#/, '').trim();
  if (rawHash === 'config') return { requestedPage: 'config', activityViewMode: 'config' };
  
  return null;
}

/**
 * Función principal de navegación programática.
 * Actualiza el estado global, sincroniza el historial y dispara el renderizado del panel.
 * @param {string} [requestedPage='dashboard'] - ID del panel de destino.
 * @param {Object} [options={}] - Opciones de navegación (replace, skipHistory).
 */
export function go(requestedPage = 'dashboard', options = {}) {
  const replace = options && (options.replace === true || options.replace === 'replace');
  const skipHistory = options && options.skipHistory === true;
  const activityViewMode = (requestedPage === 'config' || S.activityViewMode === 'config') ? 'config' : (requestedPage === 'actividades' ? S.activityViewMode : 'blocks');
  
  S.currentPage = requestedPage;
  if (activityViewMode) S.activityViewMode = activityViewMode;

  if (typeof window.syncSidebarNavState === 'function') {
    window.syncSidebarNavState(requestedPage);
  }

  if (!skipHistory) {
     syncNavHistory(requestedPage, requestedPage, replace ? 'replace' : 'push', activityViewMode);
  }

  // Activar el renderizado a través del Shell (si está disponible vía global)
  if (typeof window._renderPanel === 'function') {
    window._renderPanel();
  } else {
    console.debug('[EduGest][routing] _renderPanel no encontrado. Se llamará cuando el shell esté disponible.');
  }

  // Notificar cambio de página a listeners personalizados
  window.dispatchEvent(new CustomEvent('edugest:page-change', { detail: { page: requestedPage } }));
}

// Globalización para compatibilidad con llamadas desde HTML ligado (ej. onclick="go(...)")
window.go = go;
window.currentPage = currentPage;
