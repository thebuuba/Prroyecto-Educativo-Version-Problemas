import { S } from '../state.js';
import { go } from '../routing.js';
import * as DB from '../api-db.js';
import { logoutSqlAuth } from '../api-sql/auth.js';
import { debugSessionFlow } from '../utils.js';
import {
  applySessionUser,
  clearSessionWindow,
  loadLocalWorkspace,
  replaceState,
  stopCloudStateSync,
} from '../hydration-session.js';
import {
  flushPersistQueue,
  persist,
} from './persistence.js';

async function flushBeforeWorkspaceSwap() {
  flushPersistQueue();
  await DB.flushPendingSave();
  if (typeof window.flushSqlStateBlockSyncs === 'function') {
    await window.flushSqlStateBlockSyncs().catch(() => null);
  }
  stopCloudStateSync();
}

async function hydrateSqlForActiveUser(contextLabel) {
  if (typeof window.hydrateSqlStateBlocksForActiveUser === 'function') {
    await window.hydrateSqlStateBlocksForActiveUser().catch((error) => {
      console.warn(`[EduGest][sql] No se pudo hidratar bloques de estado durante ${contextLabel}.`, error);
      return null;
    });
  }
  if (typeof window.hydrateSqlAcademicSnapshotForActiveUser === 'function') {
    await window.hydrateSqlAcademicSnapshotForActiveUser().catch((error) => {
      console.warn(`[EduGest][sql] No se pudo hidratar snapshot académico durante ${contextLabel}.`, error);
      return null;
    });
  }
}

function refreshSessionUi() {
  if (typeof window.updateSBUser === 'function') window.updateSBUser();
  if (typeof window.refreshTop === 'function') window.refreshTop();
}

export async function hydrateCloudStateForUser(user) {
  await flushBeforeWorkspaceSwap();
  const localWorkspace = await loadLocalWorkspace(user.id);

  debugSessionFlow('hydrateCloudStateForUser:start', {
    uid: user?.id || null,
    hasLocalWorkspace: !!localWorkspace,
  });

  if (localWorkspace) replaceState(localWorkspace);
  else replaceState();

  applySessionUser(user);
  await hydrateSqlForActiveUser('login cloud');
  persist({ immediate: true });
  refreshSessionUi();

  debugSessionFlow('hydrateCloudStateForUser:done', {
    uid: S.sessionUserId,
    students: Array.isArray(S.estudiantes) ? S.estudiantes.length : null,
  });
}

export async function hydrateLocalWorkspaceForUser(user) {
  await flushBeforeWorkspaceSwap();
  const localWorkspace = await loadLocalWorkspace(user?.id);

  debugSessionFlow('hydrateLocalWorkspaceForUser:start', {
    uid: user?.id || null,
    hasLocalWorkspace: !!localWorkspace,
  });

  if (localWorkspace) replaceState(localWorkspace);
  else replaceState();

  applySessionUser(user);
  await hydrateSqlForActiveUser('login local');
  persist({ immediate: true });
  refreshSessionUi();

  debugSessionFlow('hydrateLocalWorkspaceForUser:done', {
    uid: S.sessionUserId,
  });
}

export function resetToSignedOutState() {
  replaceState();
  clearSessionWindow();
  persist({ immediate: true });
  debugSessionFlow('resetToSignedOutState', {});
}

export async function logoutAuth() {
  try {
    stopCloudStateSync();
    if (typeof window.EduGestCloud?.logout === 'function') {
      await Promise.race([
        window.EduGestCloud.logout(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]).catch((err) => console.warn('[EduGest][auth] Logout en nube omitido o fallido:', err));
    }
    await logoutSqlAuth().catch((err) => console.warn('[EduGest][auth] Logout SQL omitido o fallido:', err));
  } catch (error) {
    console.warn('[EduGest][auth] Error durante stop/cloud logout:', error);
  }

  flushPersistQueue();
  await DB.flushPendingSave();
  if (typeof window.flushSqlStateBlockSyncs === 'function') {
    await window.flushSqlStateBlockSyncs().catch(() => null);
  }

  replaceState();
  clearSessionWindow();
  persist({ immediate: true });

  if (typeof window.resetSidebarUser === 'function') {
    window.resetSidebarUser();
  }
  refreshSessionUi();
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

  go('dashboard', { replace: true });
}
