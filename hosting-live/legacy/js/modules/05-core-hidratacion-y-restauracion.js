// Gestiona hydrate SQL academic snapshot for activo usuario.
async function hydrateSqlAcademicSnapshotForActiveUser() {
  if (SQL_ACADEMIC_SYNC_PROMISE) return SQL_ACADEMIC_SYNC_PROMISE;
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return false;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return false;

  SQL_ACADEMIC_SYNC_PROMISE = window.AulaBaseSqlApi.loadAcademicSnapshot({ schoolId: context.schoolId })
    .then((snapshot) => {
      const changed = applySqlAcademicSnapshot(snapshot || {});
      if (changed) {
        persist({ immediate: true });
      }
      scheduleNonCriticalTask(() => syncSqlActivitiesAndEvaluationsForActiveUser(), 120);
      return changed;
    })
    .catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo hidratar el estado academico SQL', error);
      return false;
    })
    .finally(() => {
      SQL_ACADEMIC_SYNC_PROMISE = null;
    });

  return SQL_ACADEMIC_SYNC_PROMISE;
}
// Reconstruye relaciones derivadas entre grados, secciones y estudiantes después de hidratar o migrar datos.
function rebuildAcademicHelpers() {
  if (!Array.isArray(S.grades)) S.grades = [];
  if (!Array.isArray(S.secciones)) S.secciones = [];
  if (!Array.isArray(S.estudiantes)) S.estudiantes = [];
  S.grades.forEach((grade) => {
    grade.sections = [];
    grade.gradeLevel = grade.gradeLevel || resolveGradeLevelRank(grade.name, grade.educationLevel);
  });
  S.secciones.forEach((section) => {
    const grade = S.grades.find((entry) => entry.id === section.gradeId);
    section.grado = section.grado || grade?.name || '';
    section.gradeLevel = section.gradeLevel || grade?.gradeLevel || parseGradeLevel(section.grado || '');
    section.sectionLetter = section.sectionLetter || parseSection(section.sec || '');
    section.sec = section.sec || section.sectionLetter || '';
    if (grade) {
      grade.sections = grade.sections || [];
      if (!grade.sections.find((entry) => entry.id === section.id)) {
        grade.sections.push({
          id: section.id,
          name: section.sec,
          sectionLetter: section.sectionLetter,
          materia: section.materia,
          area: section.area,
          room: section.room || '',
        });
      }
    }
  });
  S.estudiantes.forEach((student) => {
    const sectionId = student.courseId || student.sectionId || student.seccionId || '';
    const section = S.secciones.find((entry) => entry.id === sectionId);
    student.courseId = sectionId;
    student.sectionId = sectionId;
    student.seccionId = sectionId;
    student.gradeId = student.gradeId || section?.gradeId || null;
    student.gradeLevel = student.gradeLevel || section?.gradeLevel || parseGradeLevel(section?.grado || '');
  });
  ensureStudentDirectory();
}
// Empaqueta el bloque de estado que viaja a SQL para persistir solo la parte correspondiente del workspace.
function buildSqlStateBlockPayload(blockKey) {
  if (blockKey === 'academics') {
    return {
      grades: cloneSqlPayload(S.grades || [], []),
      secciones: cloneSqlPayload(S.secciones || [], []),
      estudiantes: cloneSqlPayload(S.estudiantes || [], []),
      activeGradeId: S.activeGradeId || null,
      activeGroupId: S.activeGroupId || null,
      activeCourseId: S.activeCourseId || null,
    };
  }
  if (blockKey === 'assessment') {
    return {
      periods: cloneSqlPayload(S.periods || [], []),
      schoolYear: cloneSqlPayload(S.schoolYear || {}, {}),
      academicCalendar: cloneSqlPayload(S.academicCalendar || {}, {}),
      activePeriodId: S.activePeriodId || 'P1',
      periodGroupConfigs: cloneSqlPayload(S.periodGroupConfigs || {}, {}),
    };
  }
  return {
    teacherPlanner: cloneSqlPayload(S.teacherPlanner || { monthKey: '', customEvents: [], weeklySchedule: [] }, { monthKey: '', customEvents: [], weeklySchedule: [] }),
  };
}
// Determina si el bloque ya tiene contenido local que no debería sobrescribirse automáticamente desde SQL.
function sqlStateBlockHasLocalData(blockKey) {
  if (blockKey === 'academics') {
    return !!((S.grades || []).length || (S.secciones || []).length || (S.estudiantes || []).length);
  }
  if (blockKey === 'assessment') {
    return !!(Object.keys(S.periodGroupConfigs || {}).length);
  }
  return !!((S.teacherPlanner?.customEvents || []).length || (S.teacherPlanner?.weeklySchedule || []).length);
}
// Aplica el snapshot remoto de un bloque de estado y lo adapta al modelo local de la app.
function applySqlStateBlockPayload(blockKey, payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (blockKey === 'academics') {
    S.grades = Array.isArray(payload.grades) ? cloneSqlPayload(payload.grades, []) : [];
    S.secciones = Array.isArray(payload.secciones) ? cloneSqlPayload(payload.secciones, []) : [];
    S.estudiantes = Array.isArray(payload.estudiantes) ? cloneSqlPayload(payload.estudiantes, []) : [];
    if (payload.activeGradeId) S.activeGradeId = payload.activeGradeId;
    if (payload.activeGroupId) S.activeGroupId = payload.activeGroupId;
    if (payload.activeCourseId) S.activeCourseId = payload.activeCourseId;
    rebuildAcademicHelpers();
    return true;
  }
  if (blockKey === 'assessment') {
    if (Array.isArray(payload.periods) && payload.periods.length) S.periods = cloneSqlPayload(payload.periods, []);
    if (payload.schoolYear && typeof payload.schoolYear === 'object') S.schoolYear = cloneSqlPayload(payload.schoolYear, {});
    if (payload.academicCalendar && typeof payload.academicCalendar === 'object') S.academicCalendar = cloneSqlPayload(payload.academicCalendar, {});
    S.periodGroupConfigs = payload.periodGroupConfigs && typeof payload.periodGroupConfigs === 'object'
      ? cloneSqlPayload(payload.periodGroupConfigs, {})
      : {};
    S.activePeriodId = payload.activePeriodId || S.activePeriodId || 'P1';
    ensurePeriodsAndYear();
    ensurePeriodBuckets(S.activePeriodId || 'P1');
    return true;
  }
  S.teacherPlanner = payload.teacherPlanner && typeof payload.teacherPlanner === 'object'
    ? cloneSqlPayload(payload.teacherPlanner, { monthKey: '', customEvents: [], weeklySchedule: [] })
    : { monthKey: '', customEvents: [], weeklySchedule: [] };
  return true;
}
// Programa la sincronización diferida de un bloque SQL para evitar escrituras demasiado frecuentes.
function scheduleSqlStateBlockSync(blockKey) {
  if (suppressSqlStateSave) return;
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return;
  const context = getSqlStateContext();
  if (!context) return;
  const payload = buildSqlStateBlockPayload(blockKey);
  const payloadHash = serializeSqlStatePayload(payload);
  if (!payloadHash) return;
  const meta = readSqlStateMeta();
  if (meta.blocks?.[blockKey]?.lastSyncedHash === payloadHash) return;
  const runtime = SQL_STATE_RUNTIME[blockKey];
  runtime.context = context;
  runtime.payload = payload;
  runtime.hash = payloadHash;
  if (runtime.timer) window.clearTimeout(runtime.timer);
  runtime.timer = window.setTimeout(() => {
    runtime.timer = null;
    flushSqlStateBlockSync(blockKey);
  }, SQL_STATE_SYNC_DELAY_MS);
}
// Dispara la sincronización de todos los bloques SQL conocidos cuando el usuario cambia el workspace.
function scheduleSqlStateBlockSyncs() {
  SQL_STATE_BLOCK_KEYS.forEach((blockKey) => scheduleSqlStateBlockSync(blockKey));
}
// Fuerza el envío de un bloque pendiente a SQL respetando reintentos y escrituras en vuelo.
async function flushSqlStateBlockSync(blockKey) {
  const runtime = SQL_STATE_RUNTIME[blockKey];
  if (!runtime || !runtime.context || !runtime.payload || !runtime.hash) return false;
  if (runtime.inFlight) {
    runtime.pending = true;
    return false;
  }
  runtime.inFlight = true;
  try {
    const result = await window.AulaBaseSqlApi.syncStateBlock(blockKey, runtime.context, runtime.payload, runtime.hash);
    patchSqlStateMeta(blockKey, {
      lastSyncedHash: runtime.hash,
      lastRemoteUpdatedAt: result?.updatedAt || new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn(`[AulaBase][sql-api] No se pudo sincronizar el bloque ${blockKey}`, error);
    return false;
  } finally {
    runtime.inFlight = false;
    if (runtime.pending) {
      runtime.pending = false;
      runtime.timer = window.setTimeout(() => {
        runtime.timer = null;
        flushSqlStateBlockSync(blockKey);
      }, SQL_STATE_SYNC_DELAY_MS);
    }
  }
}
// Recupera los bloques SQL del usuario activo y decide si el estado local debe reemplazarse.
async function hydrateSqlStateBlocksForActiveUser() {
  if (SQL_STATE_HYDRATE_PROMISE) return SQL_STATE_HYDRATE_PROMISE;
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return false;
  const context = getSqlStateContext();
  if (!context) return false;
  SQL_STATE_HYDRATE_PROMISE = Promise.all(SQL_STATE_BLOCK_KEYS.map(async (blockKey) => {
    try {
      const result = await window.AulaBaseSqlApi.loadStateBlock(blockKey, context);
      return { blockKey, result };
    } catch (error) {
      console.warn(`[AulaBase][sql-api] No se pudo hidratar el bloque ${blockKey}`, error);
      return { blockKey, result: null };
    }
  })).then((entries) => {
    let changed = false;
    entries.forEach(({ blockKey, result }) => {
      const payload = result?.payload;
      if (!payload || typeof payload !== 'object') return;
      const localPayload = buildSqlStateBlockPayload(blockKey);
      const localHash = serializeSqlStatePayload(localPayload);
      const remoteHash = serializeSqlStatePayload(payload);
      const metaBlock = readSqlStateMeta().blocks?.[blockKey] || {};
      const shouldApply = !sqlStateBlockHasLocalData(blockKey) || (!!metaBlock.lastSyncedHash && metaBlock.lastSyncedHash === localHash);
      if (!shouldApply) return;
      if (applySqlStateBlockPayload(blockKey, payload)) {
        changed = true;
        patchSqlStateMeta(blockKey, {
          lastSyncedHash: remoteHash,
          lastRemoteUpdatedAt: result?.updatedAt || new Date().toISOString(),
        });
      }
    });
    if (changed) {
      suppressSqlStateSave = true;
      try {
        ensurePeriodsAndYear();
        ensurePeriodBuckets(S.activePeriodId || 'P1');
        ensureSchoolCatalog();
        ensureStudentDirectory();
        persist({ immediate: true });
      } finally {
        suppressSqlStateSave = false;
      }
    }
    return changed;
  }).finally(() => {
    SQL_STATE_HYDRATE_PROMISE = null;
  });
  return SQL_STATE_HYDRATE_PROMISE;
}
// Renderiza renderizar escuela suggestions.
function renderSchoolSuggestions() {
  const dl = document.getElementById('s-inst-list');
  if (!dl) return;
  ensureSchoolCatalog();
  const nextMarkup = S.schools.map(s => `<option value="${s}"></option>`).join('');
  if (nextMarkup === schoolSuggestionsCache) return;
  schoolSuggestionsCache = nextMarkup;
  dl.innerHTML = nextMarkup;
}
// Busca coincidencias de institución para completar el nombre mientras el usuario escribe.
function findInlineSchoolSuggestion(query = '') {
  const typed = normalizeSchoolName(query);
  if (!typed) return '';
  ensureSchoolCatalog();
  const lowerTyped = typed.toLocaleLowerCase('es');
  return S.schools.find((school) => {
    const value = String(school || '').trim();
    if (!value) return false;
    const lowerValue = value.toLocaleLowerCase('es');
    return lowerValue.startsWith(lowerTyped) && lowerValue !== lowerTyped;
  }) || '';
}
// Limpia cualquier pista visual de autocompletado de la institución.
function clearInstitutionInlineHint() {
  const input = document.getElementById('s-inst');
  const prefixEl = document.getElementById('s-inst-ghost-prefix');
  const suffixEl = document.getElementById('s-inst-ghost-suffix');
  if (input) input.dataset.inlineSuggestion = '';
  if (prefixEl) prefixEl.textContent = '';
  if (suffixEl) suffixEl.textContent = '';
}
// Calcula y pinta la sugerencia inline de institución para completar el texto sin obligar a usar un dropdown.
function updateInstitutionInlineHint(inputEl = null) {
  const input = inputEl || document.getElementById('s-inst');
  const prefixEl = document.getElementById('s-inst-ghost-prefix');
  const suffixEl = document.getElementById('s-inst-ghost-suffix');
  if (!input || !prefixEl || !suffixEl) return;
  const typed = normalizeSchoolName(input.value || '');
  if (!typed) {
    clearInstitutionInlineHint();
    return;
  }
  const suggestion = findInlineSchoolSuggestion(typed);
  if (!suggestion) {
    clearInstitutionInlineHint();
    return;
  }
  const suffix = suggestion.slice(typed.length);
  input.dataset.inlineSuggestion = suggestion;
  prefixEl.textContent = typed;
  suffixEl.textContent = suffix;
}
// Normaliza la escritura de institución y refresca su sugerencia inline.
function handleInstitutionInput(inputEl) {
  if (!inputEl) return;
  inputEl.value = String(inputEl.value || '').replace(/\s{2,}/g, ' ');
  updateInstitutionInlineHint(inputEl);
}
// Acepta la sugerencia inline al pulsar Tab, End o ArrowRight cuando el cursor ya está al final.
function handleInstitutionKeydown(event) {
  const input = event?.currentTarget || document.getElementById('s-inst');
  if (!input) return;
  if (!['Tab', 'ArrowRight', 'End'].includes(event.key)) return;
  const suggestion = String(input.dataset.inlineSuggestion || '').trim();
  const caretAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
  if (!suggestion || !caretAtEnd) return;
  event.preventDefault();
  input.value = suggestion;
  clearInstitutionInlineHint();
}
// Registra una institución nueva en el catálogo local si todavía no existe.
function registerSchool(name) {
  const n = normalizeSchoolName(name);
  if (!n) return;
  ensureSchoolCatalog();
  if (!S.schools.some(s => s.toLowerCase() === n.toLowerCase())) {
    S.schools.push(n);
    S.schools.sort((a,b)=>a.localeCompare(b,'es'));
  }
}
// Sustituye el estado raíz completo manteniendo una copia de usuarios autenticados si aún no llegaron del storage.
function replaceState(nextState = {}) {
  const fresh = createInitialState();
  const preservedAuthUsers = Array.isArray(S.authUsers) ? JSON.parse(JSON.stringify(S.authUsers)) : [];
  Object.keys(S).forEach((key) => { delete S[key]; });
  Object.assign(S, fresh, nextState || {});
  if ((!Array.isArray(S.authUsers) || S.authUsers.length === 0) && preservedAuthUsers.length) {
    S.authUsers = preservedAuthUsers;
  }
}
// Indica si la capa cloud de auth está realmente disponible antes de intentar usarla.
function canUseCloudAuth() {
  return !!window.EduGestCloud?.isConfigured?.();
}
// Decide si un error de cloud auth debe degradarse al flujo local para no bloquear el acceso.
function shouldFallbackToLocalAuth(error) {
  const code = String(error?.code || '').trim();
  const message = String(error?.message || '').trim().toLowerCase();
  const fallbackCodes = new Set([
    'auth/configuration-not-found',
    'auth/operation-not-allowed',
    'auth/network-request-failed',
    'auth/unauthorized-domain',
    'auth/invalid-api-key',
    'auth/internal-error',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.',
  ]);
  if (fallbackCodes.has(code)) return true;
  if (message.includes('firebase no esta configurado')) return true;
  if (message.includes('servicio de verificacion por correo')) return true;
  if (message.includes('servicio de envio de codigos')) return true;
  if (message.includes('validar la seguridad de la sesion')) return true;
  return false;
}
// Detiene la suscripción a eventos cloud activos para evitar duplicar sincronizaciones entre sesiones.
function stopCloudStateSync() {
  if (typeof cloudStateUnsubscribe === 'function') {
    try { cloudStateUnsubscribe(); } catch (_) {}
  }
  cloudStateUnsubscribe = null;
}
// Reinicia la ventana de sesión activa y persiste su marca temporal de inicio.
function refreshSessionWindow() {
  if (!S.sessionStartedAt) S.sessionStartedAt = new Date().toISOString();
  S.sessionExpiresAt = null;
  persistBrowserSession();
}
// Limpia los metadatos temporales de la sesión al cerrar o desactivar el usuario activo.
function clearSessionWindow() {
  S.sessionStartedAt = null;
  S.sessionExpiresAt = null;
  clearBrowserSession();
}
// Comprueba si el navegador todavía conserva una identidad de sesión mínima.
function hasActiveBrowserSession() {
  return !!readBrowserSession()?.uid;
}
// Devuelve una identidad resumida de la sesión para restaurar el estado visible sin cargar todo el usuario.
function getBrowserSessionIdentity() {
  const session = readBrowserSession();
  if (!session?.uid) return null;
  return {
    id: session.uid,
    uid: session.uid,
    name: session.name || S.sessionUserName || '',
    email: '',
  };
}
// Busca el usuario local asociado a la sesión mínima del navegador.
function getLocalSessionUser() {
  const session = readBrowserSession();
  const uid = session?.uid || '';
  if (!uid || !Array.isArray(S.authUsers)) return null;
  return S.authUsers.find((user) => user.id === uid) || null;
}
// Aplica el usuario activo al estado global y sincroniza sus marcas temporales de sesión.
function applySessionUser(user) {
  const prevUserId = S.sessionUserId;
  S.sessionUserId = user?.id || null;
  S.sessionUserName = user?.name || user?.email || null;
  S.cloudOwnerUid = user?.id || null;
  if (user?.id) {
    if (prevUserId !== user.id) S.sessionStartedAt = new Date().toISOString();
    refreshSessionWindow();
  }
  else clearSessionWindow();
}
// Resuelve el nombre visible del usuario priorizando perfil, sesión y luego un fallback seguro.
function getDisplayUserName(fallback = 'Sin perfil') {
  const localUserName = S.authUsers?.find?.(u => u.id === S.sessionUserId)?.name || '';
  const candidates = [
    S.profile?.name,
    localUserName,
    S.sessionUserName,
  ].map((value) => String(value || '').trim()).filter(Boolean);
  const namedCandidate = candidates.find((value) => !value.includes('@'));
  return namedCandidate || candidates[0] || fallback;
}
// Limpia los datos visibles del sidebar para mostrar un estado anónimo coherente.
function resetSidebarUser() {
  const avatar = document.getElementById('sb-av');
  const avatarImg = document.getElementById('sb-av-img');
  const pdAvatarImg = document.getElementById('sb-pd-av-img');
  const pdEmail = document.getElementById('sb-email');
  const sidebarName = document.getElementById('sb-name');
  const sidebarRole = document.getElementById('sb-role');
  const topName = document.getElementById('top-inline-name');
  const topRole = document.getElementById('top-inline-role');
  if (avatar) avatar.textContent='?';
  const avURL = 'https://ui-avatars.com/api/?name=Usuario&background=1E293B&color=fff&size=40';
  if (avatarImg) avatarImg.src = avURL;
  if (pdAvatarImg) pdAvatarImg.src = avURL.replace('size=40', 'size=48');
  if (pdEmail) pdEmail.textContent = 'sin.correo@aulabase.edu';
  if (sidebarName) sidebarName.textContent='Sin perfil';
  if (sidebarRole) sidebarRole.textContent='Gestiona tu perfil y el acceso de esta sesión.';
  if (topName) topName.textContent='Sin perfil';
  if (topRole) topRole.textContent='Sin sesión';
  const setupBtn = document.getElementById('sb-config-open');
  if (setupBtn) setupBtn.textContent = 'Configurar perfil';
  const logoutBtn = document.getElementById('sb-logout');
  if (logoutBtn) logoutBtn.style.display = 'none';
  closeProfileMenu();
}
// Hidrata el workspace completo del usuario autenticado, incluyendo SQL académico y bloques persistidos localmente.
async function hydrateCloudStateForUser(user) {
  stopCloudStateSync();
  const localWorkspace = await loadLocalWorkspace(user.id);
  debugSessionFlow('hydrateCloudStateForUser:start', {
    uid: user?.id || null,
    hasLocalWorkspace: !!localWorkspace,
  });

  if (localWorkspace) replaceState(localWorkspace);
  else replaceState();

  applySessionUser(user);
  await hydrateSqlStateBlocksForActiveUser();
  await hydrateSqlAcademicSnapshotForActiveUser();
  cloudStateHydrated = true;
  persist({ immediate: true });
  debugSessionFlow('hydrateCloudStateForUser:done', {
    uid: S.sessionUserId,
    cloudStateHydrated,
    students: Array.isArray(S.estudiantes) ? S.estudiantes.length : null,
    sections: Array.isArray(S.secciones) ? S.secciones.length : null,
  });
}
// Hidrata el workspace local cuando no hay sincronía cloud activa, pero conserva la misma forma interna del estado.
async function hydrateLocalWorkspaceForUser(user) {
  stopCloudStateSync();
  const localWorkspace = await loadLocalWorkspace(user?.id);
  debugSessionFlow('hydrateLocalWorkspaceForUser:start', {
    uid: user?.id || null,
    hasLocalWorkspace: !!localWorkspace,
  });
  if (localWorkspace) replaceState(localWorkspace);
  else replaceState();
  applySessionUser(user);
  await hydrateSqlStateBlocksForActiveUser();
  await hydrateSqlAcademicSnapshotForActiveUser();
  cloudStateHydrated = false;
  persist({ immediate: true });
  debugSessionFlow('hydrateLocalWorkspaceForUser:done', {
    uid: S.sessionUserId,
    cloudStateHydrated,
    students: Array.isArray(S.estudiantes) ? S.estudiantes.length : null,
    sections: Array.isArray(S.secciones) ? S.secciones.length : null,
  });
}
// Devuelve la app a un estado de salida limpia cuando la sesión ya no existe o fue cerrada.
function resetToSignedOutState() {
  replaceState();
  cloudStateHydrated = false;
  clearSessionWindow();
  persist({ immediate: true });
  debugSessionFlow('resetToSignedOutState', {});
}
