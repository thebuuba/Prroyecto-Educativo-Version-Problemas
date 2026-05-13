import { S } from '../state.ts';
import {
  PERSIST_DEBOUNCE_MS,
  STORAGE_KEY,
} from '../constants.ts';
import { createInitialState } from '../config.ts';
import * as DB from '../api-db.ts';
import {
  buildLocalRootSnapshot,
  persistActiveUserWorkspace,
  persistLocalAuthUsers,
} from '../hydration-session.ts';
import { syncSqlAcademicEntitiesForActiveUser } from '../sync-logic.ts';

let persistDebounceTimer = null;
let persistPending = false;
let suppressSqlStateSave = false;
let academicEntitySyncTimer = null;
let academicEntitySyncInFlight = false;
let academicEntitySyncPending = false;

export function setSuppressSqlStateSave(value) {
  suppressSqlStateSave = value === true;
}

function scheduleSqlAcademicEntitySync() {
  if (!S.sessionUserId || suppressSqlStateSave) return;
  academicEntitySyncPending = true;
  if (academicEntitySyncTimer) window.clearTimeout(academicEntitySyncTimer);
  academicEntitySyncTimer = window.setTimeout(async () => {
    academicEntitySyncTimer = null;
    if (academicEntitySyncInFlight || !academicEntitySyncPending) return;
    academicEntitySyncPending = false;
    academicEntitySyncInFlight = true;
    try {
      await syncSqlAcademicEntitiesForActiveUser();
    } catch (error) {
      console.warn('[EduGest][sql] No se pudieron resincronizar entidades académicas.', error);
    } finally {
      academicEntitySyncInFlight = false;
      if (academicEntitySyncPending) scheduleSqlAcademicEntitySync();
    }
  }, 350);
}

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
    if (!suppressSqlStateSave) {
      if (typeof window.scheduleSqlProfileSync === 'function') {
        window.scheduleSqlProfileSync({ immediate: true });
      }
      if (typeof window.scheduleSqlStateBlockSyncs === 'function') {
        window.scheduleSqlStateBlockSyncs();
      }
      scheduleSqlAcademicEntitySync();
    }
  } catch (_) {}
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
