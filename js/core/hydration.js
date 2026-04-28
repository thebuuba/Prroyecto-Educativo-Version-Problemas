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
} from './utils.js';
import { 
  defaultBlockCfg, 
  emptyGroupCfg,
} from './config.js';
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
  getDisplayUserName,
  loadLocalAuthUsers,
  loadLocalWorkspace,
  persistActiveUserWorkspace,
  persistLocalAuthUsers,
  readBrowserSession,
  replaceState,
  stopCloudStateSync,
} from './hydration-session.js';
import {
  flushPersistQueue,
  persist,
  persistNow,
  setSuppressSqlStateSave,
} from './hydration/persistence.js';
import {
  hydrateCloudStateForUser,
  hydrateLocalWorkspaceForUser,
  logoutAuth,
  resetToSignedOutState,
} from './hydration/session-flow.js';
import {
  ensureAcademicCalendar,
  ensurePeriodsAndYear,
  ensureSchoolCatalog,
  ensureStudentDirectory,
  mergeSchoolsIntoCatalog,
} from './hydration/academic-state.js';

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
  persistBrowserSession,
  readBrowserSession,
  replaceState,
  stopCloudStateSync,
} from './hydration-session.js';

export {
  flushPersistQueue,
  persist,
  persistNow,
  setSuppressSqlStateSave,
} from './hydration/persistence.js';

export {
  hydrateCloudStateForUser,
  hydrateLocalWorkspaceForUser,
  logoutAuth,
  resetToSignedOutState,
} from './hydration/session-flow.js';

export {
  ensureAcademicCalendar,
  ensurePeriodsAndYear,
  ensureSchoolCatalog,
  ensureStudentDirectory,
  mergeSchoolsIntoCatalog,
} from './hydration/academic-state.js';

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
      // Primero establecer la sesión desde el navegador
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
        // IMPORTANTE: Restaurar sessionUserId después de Object.assign
        S.sessionUserId = browserSession.uid;
        S.sessionUserName = browserSession.name || S.sessionUserName;
        S.sessionStartedAt = browserSession.startedAt || S.sessionStartedAt;
        // Re-sincronizar ayudantes con los datos del workspace
        ensureCurriculumCatalogState();
        rebuildAcademicHelpers();
        ensurePeriodBuckets(S.activePeriodId);
      } else if (localWorkspace) {
        console.debug('[EduGest][load:workspace] Workspace exists but is empty, keeping current data');
        // Asegurar que sessionUserId se mantiene aunque el workspace esté vacío
        S.sessionUserId = browserSession.uid;
        S.sessionUserName = browserSession.name || S.sessionUserName;
        S.sessionStartedAt = browserSession.startedAt || S.sessionStartedAt;
      } else {
        console.warn('[EduGest][load:workspace] No local workspace found for user', browserSession.uid);
        // Asegurar que sessionUserId se mantiene aunque no haya workspace
        S.sessionUserId = browserSession.uid;
        S.sessionUserName = browserSession.name || S.sessionUserName;
        S.sessionStartedAt = browserSession.startedAt || S.sessionStartedAt;
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
