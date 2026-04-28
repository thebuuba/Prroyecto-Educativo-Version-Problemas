import { S } from '../state.js';
import {
  PERSIST_DEBOUNCE_MS,
  STORAGE_KEY,
} from '../constants.js';
import { createInitialState } from '../config.js';
import * as DB from '../api-db.js';
import {
  buildLocalRootSnapshot,
  persistActiveUserWorkspace,
  persistLocalAuthUsers,
} from '../hydration-session.js';

let persistDebounceTimer = null;
let persistPending = false;
let suppressSqlStateSave = false;

export function setSuppressSqlStateSave(value) {
  suppressSqlStateSave = value === true;
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
    if (!suppressSqlStateSave && typeof window.scheduleSqlStateBlockSyncs === 'function') {
      window.scheduleSqlStateBlockSyncs();
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
