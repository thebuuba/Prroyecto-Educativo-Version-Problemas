/**
 * Sistema de Enrutamiento y Carga de Paneles.
 * Este módulo gestiona el historial de navegación, el mapeo de URLs a paneles
 * y la carga dinámica de módulos (bundles) para optimizar el rendimiento.
 */

import { S } from './state.ts';

type NavMode = 'push' | 'replace';
type PanelRouteMap = Record<string, string>;
type PanelModuleMap = Record<string, () => Promise<any>>;
type RenderRegistry = Record<string, unknown>;
type GoOptions = {
  replace?: boolean | string;
  skipHistory?: boolean;
  force?: boolean;
  [key: string]: unknown;
};

/** Diccionario de módulos que sí participan en la carga diferida vía Vite. */
const PANEL_MODULES: PanelModuleMap = {
  '/js/panels/usuarios/principal.ts': () => import('../panels/usuarios/principal.ts'),
  '/js/panels/estudiantes/principal.ts': () => import('../panels/estudiantes/principal.ts'),
  '/js/panels/actividades/principal.ts': () => import('../../apps/web/src/panels/actividades/principal.ts'),
  '/js/panels/matriz/principal.ts': () => import('../../apps/web/src/panels/matriz/principal.ts'),
  '/js/panels/reportes/principal.ts': () => import('../../apps/web/src/panels/reportes/principal.ts'),
  '/js/panels/horario/principal.ts': () => import('../panels/horario/principal.ts'),
  '/js/panels/instrumentos/principal.ts': () => import('../../apps/web/src/panels/instrumentos/principal.ts'),
  '/js/panels/planificaciones/principal.ts': () => import('../../apps/web/src/panels/planificaciones/principal.ts'),
  '/js/panels/asistencia/principal.ts': () => import('../panels/asistencia/principal.ts'),
  '/js/panels/configuracion/principal.ts': () => import('../panels/configuracion/principal.ts'),
  '/js/panels/configuracion-academica/principal.ts': () => import('../panels/configuracion-academica/principal.ts'),
  '/js/panels/crear-estudiante/principal.ts': () => import('../panels/crear-estudiante/principal.ts'),
  '/js/panels/crear-seccion/principal.ts': () => import('../panels/crear-seccion/principal.ts'),
  '/js/panels/editar-estudiante/principal.ts': () => import('../panels/editar-estudiante/principal.ts'),
};

/**
 * ID del panel actualmente renderizado.
 * @type {string}
 */
export let currentPage = 'tablero';
export function setCurrentPage(val: string): void { currentPage = val; }

/**
 * Indica si el sistema de historial (pushState) ya fue inicializado.
 * @type {boolean}
 */
export let navHistoryInitialized = false;
export function setNavHistoryInitialized(val: boolean): void { navHistoryInitialized = val; }

/** Identificador de la raíz en el objeto de historial del navegador. */
export const APP_HISTORY_ROOT = 'edugest-root';

/**
 * Mapeo de identificadores de panel a rutas amigables de URL.
 * @type {Object<string, string>}
 */
export const PANEL_ROUTES: PanelRouteMap = {
  dashboard: '/inicio',
  tablero: '/inicio', // Compatibilidad: nombre español
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
export const MODAL_ROUTES: PanelRouteMap = {};

/**
 * Agrupación de paneles por nombre de bundle (paquete de código común).
 * @type {Object<string, string>}
 */
export const PANEL_BUNDLES: PanelRouteMap = {
  dashboard: 'dashboard',
  tablero: 'dashboard', // Compatibilidad: nombre español
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
  'configuracion-academica': 'grados',
};

/**
 * Ubicaciones físicas de los archivos JS para cada bundle.
 * @type {Object<string, string>}
 */
export const PANEL_BUNDLE_URLS: PanelRouteMap = {
  usuarios: '/js/panels/usuarios/principal.ts',
  dashboard: '/js/panels/tablero/principal.ts',
  estudiantes: '/js/panels/estudiantes/principal.ts',
  actividades: '/js/panels/actividades/principal.ts',
  matriz: '/js/panels/matriz/principal.ts',
  reportes: '/js/panels/reportes/principal.ts',
  horario: '/js/panels/horario/principal.ts',
  instrumentos: '/js/panels/instrumentos/principal.ts',
  planificaciones: '/js/panels/planificaciones/principal.ts',
  asistencia: '/js/panels/asistencia/principal.ts',
  ajustes: '/js/panels/configuracion/principal.ts',
  grados: '/js/panels/configuracion-academica/principal.ts',
  'estudiantes-nuevo': '/js/panels/crear-estudiante/principal.ts',
  'secciones-nuevo': '/js/panels/crear-seccion/principal.ts',
  'estudiantes-edicion': '/js/panels/editar-estudiante/principal.ts',
};

/** Registro de bundles ya cargados en la sesión actual. */
export const loadedPanelBundles: Record<string, boolean> = window.__AULABASE_LOADED_BUNDLES || (window.__AULABASE_LOADED_BUNDLES = {});

/** Registro de promesas de carga en curso para evitar descargas duplicadas. */
export const pendingPanelBundleLoads: Record<string, Promise<boolean>> = {};

/** Configuración de metadatos de página (Títulos, categorías). */
export const PAGE: Record<string, unknown> = {};

/**
 * Construye una URL completa basada en el panel y el modo de vista.
 * @param {string} requestedPage - El ID del panel.
 * @param {string} activityViewMode - El sub-modo (ej. 'config', 'blocks').
 * @returns {string} URL formada.
 */
export function buildPanelUrl(requestedPage: string, activityViewMode?: string | null): string {
  const pageKey = requestedPage === 'config' || (requestedPage === 'actividades' && activityViewMode === 'config')
    ? 'config'
    : (requestedPage || 'tablero');
  return PANEL_ROUTES[pageKey] || '/inicio';
}

/**
 * Construye la URL para un modal, manteniendo el contexto de la página actual.
 */
export function buildModalUrl(id: string, currentP?: string | null, activityViewM?: string | null): string {
  return MODAL_ROUTES[id] || buildPanelUrl(currentP || 'tablero', activityViewM);
}

/**
 * Sincroniza el estado del panel con el historial del navegador (history API).
 * @param {string} requestedPage - Página solicitada.
 * @param {string} renderedPage - Página realmente renderizada.
 * @param {'push'|'replace'} mode - Tipo de entrada en el historial.
 * @param {string} currentActViewMode - Modo de vista actual.
 */
export function syncNavHistory(requestedPage: string, renderedPage: string, mode: NavMode = 'push', currentActViewMode?: string | null): void {
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
export function ensureAppHistoryRoot(): void {
  const state = window.history.state || {};
  if (state?.eduGestRoot) return;
  window.history.replaceState({ eduGestRoot: true, marker: APP_HISTORY_ROOT }, '', window.location.href);
  navHistoryInitialized = false;
}

/**
 * Resuelve qué bundle de código pertenece a una página específica.
 */
export function resolvePanelBundleKey(pageKey: string): string | null {
  return PANEL_BUNDLES[pageKey] || null;
}

/**
 * Construye la URL de descarga de un bundle añadiendo control de versiones.
 */
export function buildPanelBundleUrl(bundleKey: string): string {
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
export function ensurePanelBundleLoaded(pageKey: string, RENDERS: RenderRegistry): Promise<boolean> {
  const bundleKey = resolvePanelBundleKey(pageKey);
  if (!bundleKey) {
    return Promise.resolve(Boolean(RENDERS[pageKey]));
  }
  if (pendingPanelBundleLoads[bundleKey]) {
    return pendingPanelBundleLoads[bundleKey];
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
          const initializer = typeof mod.inicializar === 'function' ? mod.inicializar : mod.init;
          if (typeof initializer === 'function') initializer();
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
          const initializer = typeof mod.inicializar === 'function' ? mod.inicializar : mod.init;
          if (typeof initializer === 'function') initializer();
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
export function readPanelLocation(activeP?: string | null, activeActViewM?: string | null) {
  let path = String(window.location.pathname || '/').trim();
  
  // Normalización agresiva de la ruta
  path = path.replace(/\/index\.html$/i, '');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (!path || path === '/') path = '/';

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
export function go(requestedPage = 'dashboard', options: GoOptions = {}): void {
  // Normalizar 'tablero' a 'dashboard' para evitar duplicados
  const normalizedPage = requestedPage === 'tablero'
    ? 'dashboard'
    : requestedPage === 'configuracion-academica'
      ? 'grade-setup'
      : requestedPage;
  
  // Prevenir navegación duplicada al mismo panel
  if (S.currentPage === normalizedPage && !options?.force) {
    return;
  }
  
  const replace = options && (options.replace === true || options.replace === 'replace');
  const skipHistory = options && options.skipHistory === true;
  const activityViewMode = (normalizedPage === 'config' || S.activityViewMode === 'config') ? 'config' : (normalizedPage === 'actividades' ? S.activityViewMode : 'blocks');
  
  S.currentPage = normalizedPage;
  if (activityViewMode) S.activityViewMode = activityViewMode;

  if (typeof window.syncSidebarNavState === 'function') {
    window.syncSidebarNavState(normalizedPage);
  }

  if (!skipHistory) {
     syncNavHistory(normalizedPage, normalizedPage, replace ? 'replace' : 'push', activityViewMode);
  }

  // Activar el renderizado a través del Shell (si está disponible vía global)
  if (typeof window._renderPanel === 'function') {
    window._renderPanel();
  }

  // Notificar cambio de página a listeners personalizados
  window.dispatchEvent(new CustomEvent('edugest:page-change', { detail: { page: requestedPage } }));
}

// Globalización para compatibilidad con llamadas desde HTML ligado (ej. onclick="go(...)")
window.go = go;
window.currentPage = currentPage;
