/**
 * Utilidades de sesión y persistencia local para hidratación.
 * Se separan del orquestador principal para mantener `hydration.js`
 * enfocado en el flujo de carga y restauración.
 */

import { S } from './state.js';
import {
  AUTH_USERS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  USER_WORKSPACE_STORAGE_PREFIX,
} from './constants.js';
import { nowIso } from './utils.js';
import { createInitialState } from './config.js';
import * as DB from './api-db.js';

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
    const raw = typeof localSnapshotRaw === 'string' && localSnapshotRaw
      ? localSnapshotRaw
      : JSON.stringify(buildLocalRootSnapshot());
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
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, localRaw);
    }
    if (sessionRaw && !localRaw) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionRaw);
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
    const sessionData = JSON.stringify({
      uid: S.sessionUserId,
      name: S.sessionUserName || '',
      startedAt: S.sessionStartedAt,
    });
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionData);
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionData);
  } catch (_) {}
}

export function clearBrowserSession() {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_) {}
}

export function refreshSessionWindow() {
  if (!S.sessionStartedAt) S.sessionStartedAt = nowIso();
  S.sessionExpiresAt = null;
  persistBrowserSession();
}

export function clearSessionWindow() {
  S.sessionStartedAt = null;
  S.sessionExpiresAt = null;
  clearBrowserSession();
}

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

export function getDisplayUserName(fallback = 'Sin perfil') {
  const localUserName = S.authUsers?.find?.((u) => u.id === S.sessionUserId)?.name || '';
  const candidates = [
    S.profile?.name,
    localUserName,
    S.sessionUserName,
  ].map((value) => String(value || '').trim()).filter(Boolean);

  const namedCandidate = candidates.find((value) => !value.includes('@'));
  return namedCandidate || candidates[0] || fallback;
}

export function replaceState(nextState = {}) {
  const fresh = createInitialState();
  const preservedAuthUsers = Array.isArray(S.authUsers) ? JSON.parse(JSON.stringify(S.authUsers)) : [];

  Object.keys(S).forEach((key) => { delete S[key]; });
  Object.assign(S, fresh, nextState || {});

  if ((!Array.isArray(S.authUsers) || S.authUsers.length === 0) && preservedAuthUsers.length) {
    S.authUsers = preservedAuthUsers;
  }
}

export function stopCloudStateSync() {
  if (typeof window.stopCloudStateSync === 'function') {
    window.stopCloudStateSync();
  }
}
