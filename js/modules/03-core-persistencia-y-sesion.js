/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   PERSISTENCIA Y SESION LOCAL
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Materializa el snapshot local completo y lo reparte entre root storage, workspace del usuario y sincronizaciones derivadas.
function persistNow() {
  try {
    const localSnapshotRaw = JSON.stringify(buildLocalRootSnapshot());
    persistLocalAuthUsers();
    if (S.sessionUserId) {
      // Keep root storage neutral while a user session is active to avoid cross-account restores.
      window.EduGestDB.scheduleRawStateSave(STORAGE_KEY, JSON.stringify(createInitialState()));
    } else {
      window.EduGestDB.scheduleRawStateSave(STORAGE_KEY, localSnapshotRaw);
    }
    persistActiveUserWorkspace(localSnapshotRaw);
    if (!suppressSqlStateSave) {
      scheduleSqlStateBlockSyncs();
    }
  } catch(e){}
}
// Fuerza el guardado pendiente antes de abandonar la vista o cerrar la pestaña para minimizar pérdida de cambios recientes.
function flushPersistQueue() {
  if (persistDebounceTimer) {
    window.clearTimeout(persistDebounceTimer);
    persistDebounceTimer = null;
  }
  if (!persistPending) return;
  persistPending = false;
  persistNow();
}
// Debounce central de persistencia: agrupa cambios frecuentes y permite forzar guardado inmediato cuando el flujo lo exige.
function persist(options = {}) {
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
// Genera una copia serializable del estado quitando usuarios auth sensibles para no contaminar restauraciones futuras.
function buildLocalRootSnapshot() {
  const snapshot = JSON.parse(JSON.stringify(S));
  snapshot.authUsers = [];
  return snapshot;
}
// Construye la llave por usuario que separa los workspaces locales y evita mezclar estados entre cuentas.
function buildUserWorkspaceKey(uid) {
  return `${USER_WORKSPACE_STORAGE_PREFIX}${uid}`;
}
// Persiste la lista de usuarios autenticados para que el selector de cuentas sobreviva entre recargas.
function persistLocalAuthUsers() {
  try {
    window.EduGestDB.scheduleRawStateSave(AUTH_USERS_STORAGE_KEY, () => JSON.stringify(S.authUsers || []));
  } catch (_) {}
}
// Guarda el workspace aislado del usuario activo para que cada cuenta restaure su contexto sin cruzarse con otra sesión.
function persistActiveUserWorkspace(localSnapshotRaw = null) {
  try {
    if (!S.sessionUserId) return;
    const raw = typeof localSnapshotRaw === 'string' && localSnapshotRaw ? localSnapshotRaw : JSON.stringify(buildLocalRootSnapshot());
    window.EduGestDB.scheduleRawStateSave(buildUserWorkspaceKey(S.sessionUserId), raw);
  } catch (_) {}
}
// Carga cargar local autenticación users.
async function loadLocalAuthUsers() {
  try {
    const raw = await window.EduGestDB.loadRawState(AUTH_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}
// Recupera el workspace individual del usuario desde almacenamiento local y lo valida antes de hidratarlo.
async function loadLocalWorkspace(uid) {
  try {
    if (!uid) return null;
    const raw = await window.EduGestDB.loadRawState(buildUserWorkspaceKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}
// Lee la sesión efímera del navegador y migra restos de localStorage hacia sessionStorage cuando detecta formato antiguo.
function readBrowserSession() {
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
// Deriva una llave por usuario para recordar panel, grupo y período sin mezclar sesiones distintas en el mismo navegador.
function buildPanelSessionStateKey(uid = '') {
  const cleanUid = String(uid || '').trim();
  return cleanUid ? `${SESSION_PANEL_STATE_KEY}:${cleanUid}` : '';
}
// Guarda solo el mínimo de sesión visible en sessionStorage para recuperar el usuario activo tras recargas simples.
function persistBrowserSession() {
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
// Borra cualquier rastro de sesión efímera del navegador al cerrar sesión o reiniciar el estado local.
function clearBrowserSession() {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_) {}
}
// Recupera el último panel abierto por usuario y migra restos antiguos desde localStorage hacia sessionStorage.
function readPanelSessionState(uid = '') {
  try {
    const key = buildPanelSessionStateKey(uid);
    if (!key) return null;
    const sessionRaw = window.sessionStorage.getItem(key);
    const localRaw = window.localStorage.getItem(key);
    const raw = sessionRaw || localRaw;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!sessionRaw && localRaw && parsed && typeof parsed === 'object') {
      window.sessionStorage.setItem(key, JSON.stringify(parsed));
      window.localStorage.removeItem(key);
    }
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}
// Persiste la ubicación funcional del usuario para volver al mismo panel y contexto después de un refresh o retorno.
function persistPanelSessionState() {
  try {
    const uid = String(S.sessionUserId || readBrowserSession()?.uid || '').trim();
    const key = buildPanelSessionStateKey(uid);
    if (!key) return;
    window.sessionStorage.removeItem(SESSION_PANEL_STATE_KEY);
    window.localStorage.removeItem(SESSION_PANEL_STATE_KEY);
    window.localStorage.removeItem(key);
    window.sessionStorage.setItem(key, JSON.stringify({
      uid,
      currentPage: S.currentPage || currentPage || 'dashboard',
      activityViewMode: S.activityViewMode || ACT_VIEW_MODE || 'blocks',
      activeGroupId: S.activeGroupId || null,
      activeGradeId: S.activeGradeId || null,
      activePeriodId: S.activePeriodId || null,
      attendanceMonthKey: S.attendance?.monthKey || null,
    }));
  } catch (_) {}
}
