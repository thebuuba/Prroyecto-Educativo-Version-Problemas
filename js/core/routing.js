/**
 * Sistema de Enrutamiento y Carga de Paneles.
 * Este módulo gestiona el historial de navegación, el mapeo de URLs a paneles
 * y la carga dinámica de módulos (bundles) para optimizar el rendimiento.
 */

import { S } from './state.js';

/** Diccionario de módulos que sí participan en la carga diferida vía Vite. */
const PANEL_MODULES = {
  '/js/panels/usuarios/principal.js': () => import('../panels/usuarios/principal.js'),
  '/js/panels/tablero/principal.js': () => import('../panels/tablero/principal.js'),
  '/js/panels/estudiantes/principal.js': () => import('../panels/estudiantes/principal.js'),
  '/js/panels/actividades/principal.js': () => import('../panels/actividades/principal.js'),
  '/js/panels/matriz/principal.js': () => import('../panels/matriz/principal.js'),
  '/js/panels/reportes/principal.js': () => import('../panels/reportes/principal.js'),
  '/js/panels/horario/principal.js': () => import('../panels/horario/principal.js'),
  '/js/panels/instrumentos/principal.js': () => import('../panels/instrumentos/principal.js'),
  '/js/panels/planificaciones/principal.js': () => import('../panels/planificaciones/principal.js'),
  '/js/panels/asistencia/principal.js': () => import('../panels/asistencia/principal.js'),
  '/js/panels/configuracion/principal.js': () => import('../panels/configuracion/principal.js'),
  '/js/panels/configuracion-academica/principal.js': () => import('../panels/configuracion-academica/principal.js'),
  '/js/panels/crear-estudiante/principal.js': () => import('../panels/crear-estudiante/principal.js'),
  '/js/panels/crear-seccion/principal.js': () => import('../panels/crear-seccion/principal.js'),
  '/js/panels/editar-estudiante/principal.js': () => import('../panels/editar-estudiante/principal.js'),
};

/**
 * ID del panel actualmente renderizado.
 * @type {string}
 */
export let currentPage = 'tablero';
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
  usuarios: '/js/panels/usuarios/principal.js',
  dashboard: '/js/panels/tablero/principal.js',
  estudiantes: '/js/panels/estudiantes/principal.js',
  actividades: '/js/panels/actividades/principal.js',
  matriz: '/js/panels/matriz/principal.js',
  reportes: '/js/panels/reportes/principal.js',
  horario: '/js/panels/horario/principal.js',
  instrumentos: '/js/panels/instrumentos/principal.js',
  planificaciones: '/js/panels/planificaciones/principal.js',
  asistencia: '/js/panels/asistencia/principal.js',
  ajustes: '/js/panels/configuracion/principal.js',
  grados: '/js/panels/configuracion-academica/principal.js',
  'estudiantes-nuevo': '/js/panels/crear-estudiante/principal.js',
  'secciones-nuevo': '/js/panels/crear-seccion/principal.js',
  'estudiantes-edicion': '/js/panels/editar-estudiante/principal.js',
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
    : (requestedPage || 'tablero');
  return PANEL_ROUTES[pageKey] || '/inicio';
}

/**
 * Construye la URL para un modal, manteniendo el contexto de la página actual.
 */
export function buildModalUrl(id, currentP, activityViewM) {
  return MODAL_ROUTES[id] || buildPanelUrl(currentP || 'tablero', activityViewM);
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
  if (!bundleKey) {
    return Promise.resolve(Boolean(RENDERS[pageKey]));
  }
  if (loadedPanelBundles[bundleKey]) {
    return Promise.resolve(true);
  }
  const bundleUrl = buildPanelBundleUrl(bundleKey);
  if (!bundleUrl) {
    return Promise.resolve(Boolean(RENDERS[pageKey]));
  }

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
          if (typeof mod.init === 'function') {
            mod.init();
          }
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
          if (typeof mod.init === 'function') {
            mod.init();
          }
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
        console.error('[Routing][ensurePanelBundleLoaded] Error cargando script legacy:', bundleKey);
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
      requestedPage: activeP || 'tablero',
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
