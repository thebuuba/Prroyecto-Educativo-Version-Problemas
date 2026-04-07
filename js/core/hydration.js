import { S, setS } from './state.js';
import { 
  STORAGE_KEY, 
  AUTH_USERS_STORAGE_KEY, 
  SESSION_STORAGE_KEY, 
  SESSION_PANEL_STATE_KEY,
  USER_WORKSPACE_STORAGE_PREFIX,
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
  debugSessionFlow,
  nowIso
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

// --- Persistence & Session ---

let persistDebounceTimer = null;
let persistPending = false;
let suppressSqlStateSave = false;

export function persistNow() {
  try {
    const localSnapshotRaw = JSON.stringify(buildLocalRootSnapshot());
    persistLocalAuthUsers();
    if (S.sessionUserId) {
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

export function flushPersistQueue() {
  if (persistDebounceTimer) {
    window.clearTimeout(persistDebounceTimer);
    persistDebounceTimer = null;
  }
  if (!persistPending) return;
  persistPending = false;
  persistNow();
}

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

export function buildLocalRootSnapshot() {
  const snapshot = JSON.parse(JSON.stringify(S));
  snapshot.authUsers = [];
  return snapshot;
}

export function buildUserWorkspaceKey(uid) {
  return `${USER_WORKSPACE_STORAGE_PREFIX}${uid}`;
}

export function persistLocalAuthUsers() {
  try {
    DB.scheduleRawStateSave(AUTH_USERS_STORAGE_KEY, () => JSON.stringify(S.authUsers || []));
  } catch (_) {}
}

export function persistActiveUserWorkspace(localSnapshotRaw = null) {
  try {
    if (!S.sessionUserId) return;
    const raw = typeof localSnapshotRaw === 'string' && localSnapshotRaw ? localSnapshotRaw : JSON.stringify(buildLocalRootSnapshot());
    DB.scheduleRawStateSave(buildUserWorkspaceKey(S.sessionUserId), raw);
  } catch (_) {}
}

export async function loadLocalAuthUsers() {
  try {
    const raw = await DB.loadRawState(AUTH_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export async function loadLocalWorkspace(uid) {
  try {
    if (!uid) return null;
    const raw = await DB.loadRawState(buildUserWorkspaceKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}

export function readBrowserSession() {
  try {
    const sessionRaw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    const localRaw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const raw = sessionRaw || localRaw;
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session !== 'object') return null;
    if (!sessionRaw && localRaw) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    return session;
  } catch (_) {
    return null;
  }
}

export function persistBrowserSession() {
  try {
    if (!S.sessionUserId) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      uid: S.sessionUserId,
      name: S.sessionUserName || '',
      startedAt: S.sessionStartedAt,
    }));
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_) {}
}

export function clearBrowserSession() {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_) {}
}

/**
 * Syncs the active user to global state and manages session window.
 * @param {Object} user 
 */
export function applySessionUser(user) {
  const prevUserId = S.sessionUserId;
  S.sessionUserId = user?.id || null;
  S.sessionUserName = user?.name || user?.email || null;
  S.cloudOwnerUid = user?.id || null;
  
  if (user?.id) {
    if (prevUserId !== user.id) S.sessionStartedAt = nowIso();
    refreshSessionWindow();
  } else {
    clearSessionWindow();
  }
}

/**
 * Resolves the display name for the current session user.
 * @param {string} fallback 
 * @returns {string}
 */
export function getDisplayUserName(fallback = 'Sin perfil') {
  const localUserName = S.authUsers?.find?.(u => u.id === S.sessionUserId)?.name || '';
  const candidates = [
    S.profile?.name,
    localUserName,
    S.sessionUserName,
  ].map((value) => String(value || '').trim()).filter(Boolean);
  
  const namedCandidate = candidates.find((value) => !value.includes('@'));
  return namedCandidate || candidates[0] || fallback;
}

/**
 * Refreshes the session start timestamp and persists.
 */
export function refreshSessionWindow() {
  if (!S.sessionStartedAt) S.sessionStartedAt = nowIso();
  S.sessionExpiresAt = null;
  persistBrowserSession();
}

/**
 * Clears the session window timestamps.
 */
export function clearSessionWindow() {
  S.sessionStartedAt = null;
  S.sessionExpiresAt = null;
  clearBrowserSession();
}

/**
 * Replaces the entire root state while preserving auth users if necessary.
 * @param {Object} nextState 
 */
export function replaceState(nextState = {}) {
  const fresh = createInitialState();
  const preservedAuthUsers = Array.isArray(S.authUsers) ? JSON.parse(JSON.stringify(S.authUsers)) : [];
  
  Object.keys(S).forEach((key) => { delete S[key]; });
  Object.assign(S, fresh, nextState || {});
  
  if ((!Array.isArray(S.authUsers) || S.authUsers.length === 0) && preservedAuthUsers.length) {
    S.authUsers = preservedAuthUsers;
  }
}

/**
 * Stops any active cloud state synchronization.
 */
export function stopCloudStateSync() {
  if (typeof window.stopCloudStateSync === 'function') {
    window.stopCloudStateSync();
  }
}

/**
 * Hydrates the full workspace for a cloud user.
 * @param {Object} user 
 */
export async function hydrateCloudStateForUser(user) {
  stopCloudStateSync();
  const localWorkspace = await loadLocalWorkspace(user.id);
  
  debugSessionFlow('hydrateCloudStateForUser:start', {
    uid: user?.id || null,
    hasLocalWorkspace: !!localWorkspace,
  });

  if (localWorkspace) replaceState(localWorkspace);
  else replaceState();

  applySessionUser(user);
  
  if (typeof window.hydrateSqlStateBlocksForActiveUser === 'function') {
    await window.hydrateSqlStateBlocksForActiveUser();
  }
  if (typeof window.hydrateSqlAcademicSnapshotForActiveUser === 'function') {
    await window.hydrateSqlAcademicSnapshotForActiveUser();
  }
  
  // Mark as cloud-hydrated (internal flag can be added to S or tracked locally)
  persist({ immediate: true });
  
  debugSessionFlow('hydrateCloudStateForUser:done', {
    uid: S.sessionUserId,
    students: Array.isArray(S.estudiantes) ? S.estudiantes.length : null,
  });
}

/**
 * Hydrates the local workspace when cloud is unavailable.
 * @param {Object} user 
 */
export async function hydrateLocalWorkspaceForUser(user) {
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
    await window.hydrateSqlStateBlocksForActiveUser();
  }
  if (typeof window.hydrateSqlAcademicSnapshotForActiveUser === 'function') {
    await window.hydrateSqlAcademicSnapshotForActiveUser();
  }
  
  persist({ immediate: true });
  
  debugSessionFlow('hydrateLocalWorkspaceForUser:done', {
    uid: S.sessionUserId,
  });
}

/**
 * Resets the application to a signed-out state.
 */
export function resetToSignedOutState() {
  replaceState();
  clearSessionWindow();
  persist({ immediate: true });
  debugSessionFlow('resetToSignedOutState', {});
}

// --- Hydration & Initialization ---

export async function hydrate(options = {}) {
  const skipRootState = options && options.skipRootState === true;
  try {
    const raw = skipRootState ? null : await DB.loadRawState(STORAGE_KEY);
    if (raw) {
      let changed = false;
      const d = JSON.parse(raw);
      const storageHasMojibake = hasMojibakeMarkers(raw);
      
      // Merge with current state
      Object.assign(S, d);
      
      ensurePeriodsAndYear();
      if (!S.periodGroupConfigs || typeof S.periodGroupConfigs !== 'object') S.periodGroupConfigs = {};
      if (!S.notasByPeriod || typeof S.notasByPeriod !== 'object') S.notasByPeriod = {};
      
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
      
      // Legacy migrations
      migrateLegacyState(S, changed);
      
      ensureCurriculumCatalogState();
      rebuildAcademicHelpers();
      
      if (!Array.isArray(S.instruments)) S.instruments = [];
      if (!Array.isArray(S.evaluations)) S.evaluations = [];
      if (!Array.isArray(S.authUsers)) S.authUsers = [];
      if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
      
      if (!('sessionUserId' in S)) S.sessionUserId = null;
      if (!('currentPage' in S)) S.currentPage = 'dashboard';
      if (!('activityViewMode' in S)) S.activityViewMode = ACT_VIEW_MODE_DEFAULT;

      const browserSession = readBrowserSession();
      if (browserSession?.uid && browserSession.uid === S.sessionUserId) {
        S.sessionUserName = browserSession.name || S.sessionUserName;
        S.sessionStartedAt = browserSession.startedAt || S.sessionStartedAt;
      }
      
      ensurePeriodBuckets(S.activePeriodId);
      
      validateAndRepairData();
      
      ensureActiveContext();
      
      if (changed) persist();

      console.debug('[EduGest][load]', {
        coursesCount: S.grades.length,
        sectionsCount: S.secciones.length,
        studentsCount: S.estudiantes ? S.estudiantes.length : 0,
        activeCourseId: S.activeCourseId,
        activePeriodId: S.activePeriodId,
        changed,
        storageHadMojibake
      });
    }
    
    const localAuthUsers = await loadLocalAuthUsers();
    if (localAuthUsers.length) S.authUsers = localAuthUsers;
  } catch(e){
    console.error('[EduGest][hydrate] Error during hydration:', e);
  }
}

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

export function ensurePeriodsAndYear() {
  if (!S.schoolYear || typeof S.schoolYear !== 'object') S.schoolYear = {id:'2025-2026', name:'2025-2026'};
  ensureAcademicCalendar();
  if (!Array.isArray(S.periods) || S.periods.length===0) S.periods = JSON.parse(JSON.stringify(DEFAULT_PERIODS));
  S.periods.sort((a,b)=>(a.order||99)-(b.order||99));
  if (!S.activePeriodId || !S.periods.find(p=>p.id===S.activePeriodId)) S.activePeriodId = S.periods[0]?.id || 'P1';
}

export function ensureSchoolCatalog() {
  mergeSchoolsIntoCatalog([]);
  if (typeof window.syncSchoolCatalogFromSql === 'function') window.syncSchoolCatalogFromSql();
}

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





export function ensureStudentDirectory() {
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const before = S.studentDirectory.length;
  // Deep sync from estudiantes
  S.studentDirectory = JSON.parse(JSON.stringify(S.estudiantes || []));
  return S.studentDirectory.length !== before;
}







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

function normalizeAcademicCalendar(calendar) {
  if (!calendar || typeof calendar !== 'object') return JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CALENDAR));
  return calendar;
}

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
