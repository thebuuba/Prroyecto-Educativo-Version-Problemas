/**
 * Gestión de Hidratación y Persistencia de Datos.
 * Este módulo se encarga de cargar y guardar el estado de la aplicación en 
 * LocalStorage, SessionStorage y sincronizarlo con bases de datos externas (SQL/Cloud).
 * También gestiona el ciclo de vida de la sesión del usuario.
 */

import { S, setS } from './state.js';
import { 
  STORAGE_KEY, 
  SESSION_PANEL_STATE_KEY,
  PERSIST_DEBOUNCE_MS,
  DEFAULT_PERIODS,
  DEFAULT_SCHOOLS as CONST_DEFAULT_SCHOOLS,
  ACCOUNT_MAX_TRUSTED_DEVICES,
  ACCOUNT_MAX_ACTIVE_SESSIONS,
  LICENSE_MODEL_VERSION,
  BLOCKS,
  ACT_VIEW_MODE_DEFAULT,
  ATTENDANCE_V2_SLOT_CAPACITY
} from './constants.js';
import { 
  uid, 
  parseGradeLevel, 
  parseSection, 
  normTxt, 
  uniqueValues, 
  hasMojibakeMarkers, 
  fixMojibakeText, 
  repairUtf8State,
  sortCourses,
  debugSessionFlow
} from './utils.js';
import { 
  defaultBlockCfg, 
  emptyGroupCfg,
  createInitialState
} from './config.js';
import { go } from './routing.js';
import { 
  ensureCurriculumCatalogState, 
  rebuildAcademicHelpers, 
  ensureActiveContext, 
  getScopedSections, 
  ensurePeriodBuckets,
  validateAndRepairData
} from './domain-utils.js';
import * as DB from './api-db.js';
import {
  applySessionUser,
  buildLocalRootSnapshot,
  clearBrowserSession,
  clearSessionWindow,
  getDisplayUserName,
  loadLocalAuthUsers,
  loadLocalWorkspace,
  persistActiveUserWorkspace,
  persistLocalAuthUsers,
  readBrowserSession,
  replaceState,
  stopCloudStateSync,
} from './hydration-session.js';

export {
  applySessionUser,
  buildLocalRootSnapshot,
  clearBrowserSession,
  clearSessionWindow,
  getDisplayUserName,
  loadLocalAuthUsers,
  loadLocalWorkspace,
  persistActiveUserWorkspace,
  persistLocalAuthUsers,
  readBrowserSession,
  replaceState,
  stopCloudStateSync,
} from './hydration-session.js';

// --- Persistencia y Sesión ---

let persistDebounceTimer = null;
let persistPending = false;
let suppressSqlStateSave = false;

/**
 * Ejecuta el guardado físico del estado en los diferentes almacenamientos.
 */
export function persistNow() {
  try {
    const localSnapshotRaw = JSON.stringify(buildLocalRootSnapshot());
    persistLocalAuthUsers();
    if (S.sessionUserId) {
      // Si hay sesión, guardamos un estado inicial limpio en la raíz global
      DB.scheduleRawStateSave(STORAGE_KEY, JSON.stringify(createInitialState()));
    } else {
      DB.scheduleRawStateSave(STORAGE_KEY, localSnapshotRaw);
    }
    persistActiveUserWorkspace(localSnapshotRaw);
    if (!suppressSqlStateSave && typeof window.scheduleSqlStateBlockSyncs === 'function') {
      window.scheduleSqlStateBlockSyncs();
    }
  } catch(e){}
}

/**
 * Fuerza la ejecución de cualquier persistencia pendiente de forma inmediata.
 */
export function flushPersistQueue() {
  if (persistDebounceTimer) {
    window.clearTimeout(persistDebounceTimer);
    persistDebounceTimer = null;
  }
  if (!persistPending) return;
  persistPending = false;
  persistNow();
}

/**
 * Programa una operación de persistencia con debounce.
 * @param {Object} options - Opciones de persistencia.
 * @param {boolean} options.immediate - Si es true, guarda inmediatamente sin esperar al temporizador.
 */
export function persist(options = {}) {
  const immediate = options && options.immediate === true;
  if (immediate) {
    persistPending = false;
    if (persistDebounceTimer) {
      window.clearTimeout(persistDebounceTimer);
      persistDebounceTimer = null;
    }
    persistNow();
    return;
  }
  persistPending = true;
  if (persistDebounceTimer) window.clearTimeout(persistDebounceTimer);
  persistDebounceTimer = window.setTimeout(() => {
    persistDebounceTimer = null;
    if (!persistPending) return;
    persistPending = false;
    persistNow();
  }, PERSIST_DEBOUNCE_MS);
}


/**
 * Hidrata el workspace completo de un usuario desde la nube y/o almacenamiento local.
 * @param {Object} user - Usuario autenticado.
 */
export async function hydrateCloudStateForUser(user) {
  flushPersistQueue();
  await DB.flushPendingSave();
  if (typeof window.flushSqlStateBlockSyncs === 'function') {
    await window.flushSqlStateBlockSyncs().catch(() => null);
  }
  stopCloudStateSync();
  const localWorkspace = await loadLocalWorkspace(user.id);
  
  debugSessionFlow('hydrateCloudStateForUser:start', {
    uid: user?.id || null,
    hasLocalWorkspace: !!localWorkspace,
  });

  if (localWorkspace) replaceState(localWorkspace);
  else replaceState();

  applySessionUser(user);
  
  // Puentes para hidratar bloques SQL específicos (asistencia/evaluación)
  if (typeof window.hydrateSqlStateBlocksForActiveUser === 'function') {
    await window.hydrateSqlStateBlocksForActiveUser().catch((error) => {
      console.warn('[EduGest][sql] No se pudo hidratar bloques de estado durante login cloud.', error);
      return null;
    });
  }
  if (typeof window.hydrateSqlAcademicSnapshotForActiveUser === 'function') {
    await window.hydrateSqlAcademicSnapshotForActiveUser().catch((error) => {
      console.warn('[EduGest][sql] No se pudo hidratar snapshot académico durante login cloud.', error);
      return null;
    });
  }
  
  persist({ immediate: true });
  
  if (typeof window.updateSBUser === 'function') window.updateSBUser();
  if (typeof window.refreshTop === 'function') window.refreshTop();

  debugSessionFlow('hydrateCloudStateForUser:done', {
    uid: S.sessionUserId,
    students: Array.isArray(S.estudiantes) ? S.estudiantes.length : null,
  });
}

/**
 * Hidrata el workspace localmente para un usuario sin conexión a la nube obligatoria.
 * @param {Object} user - Usuario autenticado.
 */
export async function hydrateLocalWorkspaceForUser(user) {
  flushPersistQueue();
  await DB.flushPendingSave();
  if (typeof window.flushSqlStateBlockSyncs === 'function') {
    await window.flushSqlStateBlockSyncs().catch(() => null);
  }
  stopCloudStateSync();
  const localWorkspace = await loadLocalWorkspace(user?.id);
  
  debugSessionFlow('hydrateLocalWorkspaceForUser:start', {
    uid: user?.id || null,
    hasLocalWorkspace: !!localWorkspace,
  });
  
  if (localWorkspace) replaceState(localWorkspace);
  else replaceState();
  
  applySessionUser(user);
  
  if (typeof window.hydrateSqlStateBlocksForActiveUser === 'function') {
    await window.hydrateSqlStateBlocksForActiveUser().catch((error) => {
      console.warn('[EduGest][sql] No se pudo hidratar bloques de estado durante login local.', error);
      return null;
    });
  }
  if (typeof window.hydrateSqlAcademicSnapshotForActiveUser === 'function') {
    await window.hydrateSqlAcademicSnapshotForActiveUser().catch((error) => {
      console.warn('[EduGest][sql] No se pudo hidratar snapshot académico durante login local.', error);
      return null;
    });
  }
  
  persist({ immediate: true });
  
  if (typeof window.updateSBUser === 'function') window.updateSBUser();
  if (typeof window.refreshTop === 'function') window.refreshTop();

  debugSessionFlow('hydrateLocalWorkspaceForUser:done', {
    uid: S.sessionUserId,
  });
}

/**
 * Reinicia la aplicación al estado predeterminado de 'sin sesión'.
 */
export function resetToSignedOutState() {
  replaceState();
  clearSessionWindow();
  persist({ immediate: true });
  debugSessionFlow('resetToSignedOutState', {});
}

/**
 * Cierra la sesión activa del usuario, limpia el estado y persiste los cambios.
 */
export async function logoutAuth() {
  console.log('[EduGest][auth] Iniciando proceso de cierre de sesión...');
  try {
    stopCloudStateSync();
    if (typeof window.EduGestCloud?.logout === 'function') {
      // Intentamos cerrar sesión en la nube, pero no bloqueamos el cierre local si falla o tarda
      await Promise.race([
        window.EduGestCloud.logout(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]).catch(err => console.warn('[EduGest][auth] Logout en nube omitido o fallido:', err));
    }
  } catch (error) {
    console.warn('[EduGest][auth] Error durante stop/cloud logout:', error);
  }

  // Antes de borrar la sesión, vaciamos cualquier guardado pendiente para no perder
  // el último estado del usuario activo al cerrar o cambiar de cuenta.
  flushPersistQueue();
  await DB.flushPendingSave();
  if (typeof window.flushSqlStateBlockSyncs === 'function') {
    await window.flushSqlStateBlockSyncs().catch(() => null);
  }

  // Cierre de sesión local: Siempre ocurre
  replaceState();
  clearSessionWindow();
  persist({ immediate: true });
  
  if (typeof window.resetSidebarUser === 'function') {
    window.resetSidebarUser();
  }
  if (typeof window.updateSBUser === 'function') {
    window.updateSBUser();
  }
  if (typeof window.refreshTop === 'function') {
    window.refreshTop();
  }
  if (typeof window.forceCloseM === 'function') {
    window.forceCloseM('m-terms');
    window.forceCloseM('m-education-section');
    window.forceCloseM('m-setup');
  }
  if (typeof window.openM === 'function') {
    window.openM('m-auth');
  }
  if (typeof window.setAuthMode === 'function') {
    window.setAuthMode('login');
  }
  
  console.log('[EduGest][auth] Sesión cerrada localmente. Redirigiendo...');
  go('tablero', { replace: true });
}

// --- Hidratación e Inicialización del Sistema ---

/**
 * Realiza la carga inicial (bootstrapping) de los datos del sistema.
 * @param {Object} options - Parámetros de carga.
 * @param {boolean} options.skipRootState - Si es true, ignora el archivo raíz legado.
 */
export async function hydrate(options = {}) {
  const skipRootState = options && options.skipRootState === true;
  try {
    const raw = skipRootState ? null : await DB.loadRawState(STORAGE_KEY);
    if (raw) {
      let changed = false;
      const d = JSON.parse(raw);
      const storageHasMojibake = hasMojibakeMarkers(raw);
      
      // Fusión con el estado actual
      Object.assign(S, d);
      
      ensurePeriodsAndYear();
      if (!S.periodGroupConfigs || typeof S.periodGroupConfigs !== 'object') S.periodGroupConfigs = {};
      if (!S.notasByPeriod || typeof S.notasByPeriod !== 'object') S.notasByPeriod = {};
      
      // Sincronización de Periodo 1 (Migración legacy)
      if (!S.periodGroupConfigs.P1) { 
        S.periodGroupConfigs.P1 = JSON.parse(JSON.stringify(S.groupConfigs || {})); 
        changed = true; 
      }
      if (!S.notasByPeriod.P1) { 
        S.notasByPeriod.P1 = JSON.parse(JSON.stringify(S.notas || {})); 
        changed = true; 
      }
      if (!S.activePeriodId) { 
        S.activePeriodId = 'P1'; 
        changed = true; 
      }
      
      const schoolsBefore = Array.isArray(S.schools) ? S.schools.length : 0;
      ensureSchoolCatalog();
      if (S.schools.length !== schoolsBefore) changed = true;
      
      if (repairUtf8State(S)) changed = true;
      
      // Migraciones de estructuras antiguas
      migrateLegacyState(S, changed);
      
      // Inicializar ayudantes curriculares y académicos
      ensureCurriculumCatalogState();
      rebuildAcademicHelpers();
      
      if (!Array.isArray(S.instruments)) S.instruments = [];
      if (!Array.isArray(S.evaluations)) S.evaluations = [];
      if (!Array.isArray(S.authUsers)) S.authUsers = [];
      if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
      
      if (!('sessionUserId' in S)) S.sessionUserId = null;
      if (!('currentPage' in S)) S.currentPage = 'tablero';
      if (!('activityViewMode' in S)) S.activityViewMode = ACT_VIEW_MODE_DEFAULT;

      ensurePeriodBuckets(S.activePeriodId);
      validateAndRepairData();
      ensureActiveContext();
      
      if (changed) persist();

      console.debug('[EduGest][load:root] Global state hydrated');
    }

    // --- SESIÓN Y WORKSPACE: Siempre intentar restaurar si hay sesión en el browser ---
    const browserSession = readBrowserSession();
    if (browserSession?.uid) {
      S.sessionUserId = browserSession.uid;
      S.sessionUserName = browserSession.name || S.sessionUserName;
      S.sessionStartedAt = browserSession.startedAt || S.sessionStartedAt;
      
      // Intentamos cargar el workspace privado del usuario
      const localWorkspace = await loadLocalWorkspace(browserSession.uid);
      
      // Solo cargamos el workspace si tiene datos reales (para no sobreescribir datos globales durante migración)
      const hasWorkspaceData = localWorkspace && (
        (localWorkspace.profile && localWorkspace.profile.name) || 
        (Array.isArray(localWorkspace.grades) && localWorkspace.grades.length > 0)
      );

      if (hasWorkspaceData) {
        console.debug('[EduGest][load:workspace] Success - Data restored');
        Object.assign(S, localWorkspace);
        // Re-sincronizar ayudantes con los datos del workspace
        ensureCurriculumCatalogState();
        rebuildAcademicHelpers();
        ensurePeriodBuckets(S.activePeriodId);
      } else if (localWorkspace) {
        console.debug('[EduGest][load:workspace] Workspace exists but is empty, keeping current data');
      } else {
        console.warn('[EduGest][load:workspace] No local workspace found for user', browserSession.uid);
      }
    }
    
    // Cargar historial de autenticación
    const localAuthUsers = await loadLocalAuthUsers();
    if (localAuthUsers.length) S.authUsers = localAuthUsers;

    console.debug('[EduGest][load] Hidratación finalizada con éxito.');
    
    // Forzar actualización de la UI si hay sesión
    if (S.sessionUserId && typeof window.updateSBUser === 'function') {
      window.updateSBUser();
    }
  } catch(e){
    console.error('[EduGest][hydrate] Error during hydration:', e);
  }
}

/**
 * Migra estructuras de bloques de la versión pre-modular.
 */
function migrateLegacyState(S, changed) {
  const oldToNew = {com:'B1', res:'B2', eth:'B3', cyt:'B4'};
  if (S.blockCfg && !S.blockCfg.B1) {
    const migrated = {};
    Object.entries(oldToNew).forEach(([oldKey,newKey])=>{
      if (S.blockCfg[oldKey]) migrated[newKey] = S.blockCfg[oldKey];
    });
    S.blockCfg = {...migrated, ...S.blockCfg};
    changed = true;
  }
}

/**
 * Garantiza que los periodos y el año escolar estén definidos.
 */
export function ensurePeriodsAndYear() {
  if (!S.schoolYear || typeof S.schoolYear !== 'object') S.schoolYear = {id:'2025-2026', name:'2025-2026'};
  ensureAcademicCalendar();
  if (!Array.isArray(S.periods) || S.periods.length===0) S.periods = JSON.parse(JSON.stringify(DEFAULT_PERIODS));
  S.periods.sort((a,b)=>(a.order||99)-(b.order||99));
  if (!S.activePeriodId || !S.periods.find(p=>p.id===S.activePeriodId)) S.activePeriodId = S.periods[0]?.id || 'P1';
}

/**
 * Inicializa el catálogo de centros educativos.
 */
export function ensureSchoolCatalog() {
  mergeSchoolsIntoCatalog([]);
  if (typeof window.syncSchoolCatalogFromSql === 'function') window.syncSchoolCatalogFromSql();
}

/**
 * Fusiona nuevos centros educativos en el catálogo global garantizando unicidad.
 * @param {Array} items - Nuevos centros a añadir.
 */
export function mergeSchoolsIntoCatalog(items = []) {
  if (!Array.isArray(S.schools)) S.schools = [];
  const merged = [...S.schools, ...items, ...CONST_DEFAULT_SCHOOLS].map(n => String(n || '').trim()).filter(Boolean);
  const uniq = [];
  const seen = new Set();
  merged.forEach((n) => {
    const key = n.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    uniq.push(n);
  });
  S.schools = uniq.sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Sincroniza el directorio rápido de estudiantes para búsquedas offline.
 */
export function ensureStudentDirectory() {
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const before = S.studentDirectory.length;
  // Sincronización profunda desvinculada
  S.studentDirectory = JSON.parse(JSON.stringify(S.estudiantes || []));
  return S.studentDirectory.length !== before;
}

/**
 * Garantiza que el calendario académico y sus periodos asociados estén normalizados.
 */
export function ensureAcademicCalendar() {
  const calendar = normalizeAcademicCalendar(S.academicCalendar);
  S.academicCalendar = calendar;
  const nextPeriods = calendar.periods.map((period) => ({ id: period.id, name: period.name, order: period.order }));
  S.periods = JSON.parse(JSON.stringify(nextPeriods.length ? nextPeriods : DEFAULT_PERIODS));
  if (!S.activePeriodId || !S.periods.find((period) => period.id === S.activePeriodId)) {
    S.activePeriodId = S.periods[0]?.id || 'P1';
  }
  return calendar;
}

/**
 * Normaliza internamente la estructura de un calendario académico.
 */
function normalizeAcademicCalendar(calendar) {
  if (!calendar || typeof calendar !== 'object') return JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CALENDAR));
  return calendar;
}

/** @type {Object} Calendario por defecto para la República Dominicana */
const DEFAULT_ACADEMIC_CALENDAR = {
  country: 'DO',
  activeMonths: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5],
  periods: [
    { id: 'P1', name: 'Periodo 1', order: 1, months: [8, 9, 10] },
    { id: 'P2', name: 'Periodo 2', order: 2, months: [11, 12, 1] },
    { id: 'P3', name: 'Periodo 3', order: 3, months: [2, 3] },
    { id: 'P4', name: 'Periodo 4', order: 4, months: [4, 5] },
  ],
};
