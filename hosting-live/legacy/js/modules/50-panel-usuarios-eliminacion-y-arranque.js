/* ------------------------- USUARIOS ------------------------- */
window.__AULABASE_LOADED_BUNDLES = window.__AULABASE_LOADED_BUNDLES || {};
window.__AULABASE_LOADED_BUNDLES.shell = true;

RENDERS.usuarios = function(c) {
  // Dibuja la tabla de usuarios adicionales y enlaza los botones de borrado con el flujo de eliminación segura.
  if(S.usuarios.length===0){
    c.innerHTML=`<div class="card"><div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">Sin usuarios adicionales</div><div class="es">Agrega coordinadores, directores u otros docentes.</div><button class="btn btn-primary" onclick="openUsrM()">+ Agregar usuario</button></div></div>`;
    return;
  }
  c.innerHTML=`<div class="card"><table class="tbl"><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>
    ${S.usuarios.map(u=>`<tr><td style="font-weight:600;">${escapeHtml(u.nombre || '?')}</td><td style="color:var(--mute);">${escapeHtml(u.email || '?')}</td>
    <td><span class="pill ${u.rol==='Dirección'?'p-rose':u.rol==='Coordinador'?'p-amber':'p-aqua'}">${escapeHtml(u.rol || 'Docente')}</span></td>
    <td><span class="pill p-green">Activo</span></td>
    <td><button class="btn btn-danger btn-sm js-del-usr" data-user-id="${escapeHtml(String(u.id || ''))}" type="button"><i class="ri-delete-bin-line"></i></button></td></tr>`).join('')}
  </tbody></table></div>`;
  c.querySelectorAll('.js-del-usr').forEach((button) => {
    button.addEventListener('click', () => {
      const userId = String(button.getAttribute('data-user-id') || '').trim();
      if (userId) delUsr(userId);
    });
  });
};

/* ------------------------- DELETE HANDLERS ------------------------- */
// Elimina un estudiante en SQL y en memoria, limpiando tambien notas y evaluaciones asociadas.
async function delEst(id){
  if(!confirm('¿Eliminar estudiante y todas sus calificaciones?')) return;
  if (window.AulaBaseSqlApi?.isEnabled?.()) {
    try {
      await syncSqlStudentDelete(id);
    } catch (error) {
      console.warn('[AulaBase][sql-api] No se pudo eliminar el estudiante en SQL', error);
      toast('No se pudo eliminar el estudiante en SQL', true);
      return;
    }
  }
  const before = Array.isArray(S.estudiantes) ? S.estudiantes.length : 0;
  S.estudiantes=S.estudiantes.filter(e=>e.id!==id);
  Object.keys(S.notasByPeriod||{}).forEach(pid=>{ if(S.notasByPeriod[pid]) delete S.notasByPeriod[pid][id]; });
  ensurePeriodBuckets(S.activePeriodId);
  S.evaluations = S.evaluations.filter(e=>e.studentId!==id);
  persist({ immediate: true });
  debugSessionFlow('delete:student', {
    uid: S.sessionUserId || null,
    targetId: id,
    before,
    after: Array.isArray(S.estudiantes) ? S.estudiantes.length : 0,
  });
  go('estudiantes'); toast('Eliminado');
}
// Elimina una seccion; si existe una hermana compatible, reubica estudiantes antes de limpiar el resto del estado.
async function delSec(id){
  const siblingSections = getRosterSections(id).filter((section) => section.id !== id);
  const replacementSectionId = siblingSections[0]?.id || '';
  const message = replacementSectionId
    ? '¿Eliminar esta materia? Los estudiantes se conservarán en la sección compartida.'
    : '¿Eliminar sección y todos sus estudiantes?';
  if(!confirm(message)) return;
  if (window.AulaBaseSqlApi?.isEnabled?.()) {
    try {
      await syncSqlSectionDelete(id);
    } catch (error) {
      console.warn('[AulaBase][sql-api] No se pudo eliminar la sección en SQL', error);
      toast('No se pudo eliminar la sección en SQL', true);
      return;
    }
  }
  const toDel = replacementSectionId
    ? []
    : S.estudiantes.filter(e=>(e.seccionId===id || e.sectionId===id)).map(e=>e.id);
  Object.keys(S.notasByPeriod||{}).forEach(pid=>{
    toDel.forEach(eid=>{ if (S.notasByPeriod[pid]) delete S.notasByPeriod[pid][eid]; });
  });
  S.evaluations = S.evaluations.filter(e=>!toDel.includes(e.studentId));
  if (replacementSectionId) {
    const replacement = S.secciones.find((section) => section.id === replacementSectionId);
    S.estudiantes.forEach((student) => {
      if ((student.seccionId === id || student.sectionId === id || student.courseId === id)) {
        student.courseId = replacementSectionId;
        student.sectionId = replacementSectionId;
        student.seccionId = replacementSectionId;
        student.gradeId = replacement?.gradeId || student.gradeId || null;
        student.gradeLevel = replacement?.gradeLevel || student.gradeLevel || null;
      }
    });
  } else {
    S.estudiantes=S.estudiantes.filter(e=>(e.seccionId!==id && e.sectionId!==id));
  }
  S.secciones=S.secciones.filter(s=>s.id!==id);
  S.grades.forEach(g=>g.sections=(g.sections||[]).filter(s=>s.id!==id));
  Object.keys(S.periodGroupConfigs||{}).forEach(pid=>{ if (S.periodGroupConfigs[pid]) delete S.periodGroupConfigs[pid][id]; });
  ensurePeriodBuckets(S.activePeriodId);
  if (S.activeGroupId===id || S.activeCourseId===id) {
    const next = sortCourses(getScopedSections())[0]?.id || null;
    S.activeGroupId = next;
    S.activeCourseId = next;
  }
  persist({ immediate: true });
  debugSessionFlow('delete:section', {
    uid: S.sessionUserId || null,
    targetId: id,
    sectionsAfter: Array.isArray(S.secciones) ? S.secciones.length : 0,
    studentsAfter: Array.isArray(S.estudiantes) ? S.estudiantes.length : 0,
  });
  go('estudiantes'); toast('Sección eliminada');
}
// Elimina un grado completo junto con secciones, estudiantes, actividades y evaluaciones dependientes.
async function delGrade(gradeId){
  const g = S.grades.find(x=>x.id===gradeId);
  if(!g) return;
  const secIds = S.secciones.filter(s=>s.gradeId===gradeId).map(s=>s.id);
  const msg = `¿Eliminar ${g.name}? También se eliminarán sus secciones, estudiantes y actividades/evaluaciones asociadas.`;
  if(!confirm(msg)) return;
  if (window.AulaBaseSqlApi?.isEnabled?.()) {
    try {
      await syncSqlGradeDelete(gradeId);
    } catch (error) {
      console.warn('[AulaBase][sql-api] No se pudo eliminar el grado en SQL', error);
      toast('No se pudo eliminar el grado en SQL', true);
      return;
    }
  }

  // collect all activity ids from group configs for this grade
  const actIds = [];
  Object.keys(S.periodGroupConfigs||{}).forEach(pid=>{
    secIds.forEach(sid=>{
      const cfg = S.periodGroupConfigs?.[pid]?.[sid];
      if (!cfg) return;
      BLOCKS.forEach(b=> (cfg[b]?.activities||[]).forEach(a=>actIds.push(a.id)));
    });
  });

  const toDelStudents = S.estudiantes
    .filter(e=>secIds.includes(e.courseId||e.sectionId||e.seccionId))
    .map(e=>e.id);

  Object.keys(S.notasByPeriod||{}).forEach(pid=>{
    const notas = S.notasByPeriod[pid] || {};
    toDelStudents.forEach(eid=>delete notas[eid]);
    Object.keys(notas).forEach(eid=>{
      actIds.forEach(aid=>{ if(notas[eid]) delete notas[eid][aid]; });
    });
  });

  S.evaluations = S.evaluations.filter(e=>
    !secIds.includes(e.groupId) &&
    !toDelStudents.includes(e.studentId) &&
    !actIds.includes(e.activityId)
  );
  S.estudiantes = S.estudiantes.filter(e=>!toDelStudents.includes(e.id));
  S.secciones = S.secciones.filter(s=>!secIds.includes(s.id));
  Object.keys(S.periodGroupConfigs||{}).forEach(pid=>{ secIds.forEach(sid=>delete S.periodGroupConfigs[pid][sid]); });
  ensurePeriodBuckets(S.activePeriodId);
  S.grades = S.grades.filter(x=>x.id!==gradeId);

  if (secIds.includes(S.activeCourseId||S.activeGroupId)) {
    const next = sortCourses(getScopedSections())[0]?.id || null;
    S.activeCourseId = next;
    S.activeGroupId = next;
  }
  persist({ immediate: true });
  debugSessionFlow('delete:grade', {
    uid: S.sessionUserId || null,
    targetId: gradeId,
    gradesAfter: Array.isArray(S.grades) ? S.grades.length : 0,
    sectionsAfter: Array.isArray(S.secciones) ? S.secciones.length : 0,
    studentsAfter: Array.isArray(S.estudiantes) ? S.estudiantes.length : 0,
  });
  go('estudiantes'); toast('Grado eliminado');
}
// Borra una plantilla local y vuelve a la vista de configuracion para refrescar la lista visible.
function delTpl(id){ S.templates=S.templates.filter(t=>t.id!==id); persist({ immediate: true }); go('config'); toast('Plantilla eliminada'); }
// Elimina un usuario adicional del estado local y refresca la tabla del panel de usuarios.
async function delUsr(id){ S.usuarios=S.usuarios.filter(u=>u.id!==id); persist({ immediate: true }); go('usuarios'); toast('Usuario eliminado'); }

/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   SIDEBAR & PROFILE
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Rehidrata nombre, avatar, correo y roles visibles en sidebar/topbar segun el estado actual de la sesion.
function updateSBUser(){
  const logoutBtn = document.getElementById('sb-logout');
  const compactLogoutBtn = document.getElementById('sb-logout-compact');
  const setupBtn = document.getElementById('sb-config-open');
  const avatar = document.getElementById('sb-av');
  const avatarImg = document.getElementById('sb-av-img');
  const pdAvatarImg = document.getElementById('sb-pd-av-img');
  const pdEmail = document.getElementById('sb-email');
  const sidebarName = document.getElementById('sb-name');
  const sidebarRole = document.getElementById('sb-role');
  const topName = document.getElementById('top-inline-name');
  const topRole = document.getElementById('top-inline-role');
  const displayName = getDisplayUserName();
  const localUser = S.authUsers?.find?.(u => u.id === S.sessionUserId);
  const activeEmail = localUser?.email || S.profile?.email || 'sin.correo@aulabase.edu';
  if (logoutBtn) logoutBtn.style.display = S.sessionUserId ? '' : 'none';
  if (compactLogoutBtn) compactLogoutBtn.style.display = S.sessionUserId ? '' : 'none';
  if(!S.profile) {
    if (avatar) avatar.textContent = displayName !== 'Sin perfil' ? initials(displayName) : '?';
    const cleanName = encodeURIComponent(displayName !== 'Sin perfil' ? displayName : 'Usuario');
    if (avatarImg) avatarImg.src = `https://ui-avatars.com/api/?name=${cleanName}&background=1E293B&color=fff&size=40`;
    if (pdAvatarImg) pdAvatarImg.src = `https://ui-avatars.com/api/?name=${cleanName}&background=1E293B&color=fff&size=48`;
    if (pdEmail) pdEmail.textContent = activeEmail;
    if (sidebarName) sidebarName.textContent = displayName;
    if (sidebarRole) sidebarRole.textContent = S.sessionUserId ? 'Completa tu perfil para continuar con todos los módulos.' : 'Gestiona tu perfil y el acceso de esta sesión.';
    if (topName) topName.textContent = displayName;
    if (topRole) topRole.textContent = S.sessionUserId ? 'Sesión activa' : 'Sin sesión';
    if (setupBtn) setupBtn.textContent = 'Configurar perfil';
    return;
  }
  if (avatar) avatar.textContent=initials(displayName);
  const validName = encodeURIComponent(displayName);
  if (avatarImg) avatarImg.src = `https://ui-avatars.com/api/?name=${validName}&background=1E293B&color=fff&size=40`;
  if (pdAvatarImg) pdAvatarImg.src = `https://ui-avatars.com/api/?name=${validName}&background=1E293B&color=fff&size=48`;
  if (pdEmail) pdEmail.textContent = activeEmail;
  if (sidebarName) sidebarName.textContent=displayName;
  if (sidebarRole) sidebarRole.textContent=`${S.profile.role} - ${periodName()}`;
  if (topName) topName.textContent = displayName;
  if (topRole) topRole.textContent = `${S.profile.role} - ${periodName()}`;
  if (setupBtn) setupBtn.textContent = 'Configurar perfil';
}
// Sincroniza el boton y el menu desplegable del perfil para mantener accesibilidad y estado visual.
function setProfileMenuOpen(open) {
  const toggle = document.getElementById('top-profile-toggle');
  const menu = document.getElementById('top-profile-menu');
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  menu.hidden = !open;
}
// Punto unico para cerrar el menu de perfil desde auth, navegacion u otros flujos.
function closeProfileMenu() {
  setProfileMenuOpen(false);
}
// Deja una traza rápida del orden de cursos para depurar inconsistencias al crear, borrar o reordenar secciones.
function logCourseOrderCheck(){
  try {
    const order = getGroups().map(g=>`${g.gradeName} ${g.sectionName}`).join(' | ');
    console.debug('[EduGest] Orden jerárquico de cursos:', order);
  } catch(e){}
}

STATIC_DOM.navLinks.filter(el => el.dataset.p).forEach(el=>{
  el.addEventListener('click',()=>{
    const requestedPage = el.dataset.p;
    const renderedPage = requestedPage === 'config' ? 'actividades' : requestedPage;
    const nextActivityMode = requestedPage === 'config' ? 'config' : (requestedPage === 'actividades' && ACT_VIEW_MODE === 'config' ? 'blocks' : ACT_VIEW_MODE);
    if (renderedPage === currentPage && S.currentPage === requestedPage && S.activityViewMode === nextActivityMode) return;
    if (!shouldKeepSidebarPinned()) {
      collapseSidebarIfAllowed();
    } else {
      setSidebarExpanded(true);
    }
    go(requestedPage, { animatePanelTransition: true });
  });
});

const profileOpenBtn = document.getElementById('sb-profile-open');
if (profileOpenBtn) {
  profileOpenBtn.addEventListener('click', () => {
    go('miperfil');
    const topProfileMenu = document.getElementById('top-profile-menu');
    if (topProfileMenu) {
      topProfileMenu.hidden = true;
      const topProfileToggle = document.getElementById('top-profile-toggle');
      if (topProfileToggle) topProfileToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const configOpenBtn = document.getElementById('sb-config-open');
if (configOpenBtn) {
  configOpenBtn.addEventListener('click', () => {
    go('miperfil');
    const topProfileMenu = document.getElementById('top-profile-menu');
    if (topProfileMenu) {
      topProfileMenu.hidden = true;
      const topProfileToggle = document.getElementById('top-profile-toggle');
      if (topProfileToggle) topProfileToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
document.querySelector('.sb-brand .logo')?.addEventListener('click',()=>go('dashboard', { animatePanelTransition: true }));
document.querySelector('#topbar-brand')?.addEventListener('click',()=>go('dashboard', { animatePanelTransition: true }));
document.querySelector('#sb-config-open')?.addEventListener('click',()=>{
  closeProfileMenu();
  if (S.sessionUserId) openM('m-setup');
  else openM('m-auth');
});
document.querySelector('#sb-dark-toggle')?.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleDarkMode();
  collapseSidebarIfAllowed();
});
document.querySelector('#sb-pin-toggle')?.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleSidebarPinnedPreference();
});
document.getElementById('sb-backdrop')?.addEventListener('click', () => {
  collapseSidebarIfAllowed();
});
const sidebarEl = document.getElementById('sb');
if (sidebarEl) {
  sidebarEl.addEventListener('pointerenter', () => {
    clearSidebarCloseTimer();
    setSidebarExpanded(true);
  });
  sidebarEl.addEventListener('pointerleave', () => {
    const activeEl = document.activeElement;
    if (activeEl && sidebarEl.contains(activeEl) && typeof activeEl.blur === 'function') {
      activeEl.blur();
    }
    scheduleSidebarAutoClose(sidebarEl, SIDEBAR_TIMINGS.pointerLeaveCloseDelayMs);
  });
  sidebarEl.addEventListener('focusin', () => {
    clearSidebarCloseTimer();
    setSidebarExpanded(true);
  });
  sidebarEl.addEventListener('focusout', () => {
    scheduleSidebarAutoClose(sidebarEl, SIDEBAR_TIMINGS.focusOutCloseDelayMs);
  });
}
document.querySelector('#top-profile-toggle')?.addEventListener('click', (event) => {
  event.stopPropagation();
  const menu = document.getElementById('top-profile-menu');
  setProfileMenuOpen(!!menu?.hidden);
});
document.addEventListener('click', (event) => {
  const wrap = document.getElementById('top-profile');
  if (!wrap || wrap.contains(event.target)) return;
  closeProfileMenu();
});
document.addEventListener('click', () => {
  closeInstrumentDownloadMenus();
});
document.addEventListener('click', (event) => {
  if (currentPage !== 'horario') return;
  const inScheduleMenu = event.target?.closest?.('.teacher-schedule-system-menu-wrap');
  if (inScheduleMenu) return;
  closeTeacherScheduleSystemMenu();
});
document.addEventListener('click', (event) => {
  if (!STUDENTS_SEARCH_DROPDOWN_OPEN) return;
  const searchWrap = event.target?.closest?.('.students-global-search-shell');
  if (searchWrap) return;
  closeStudentsSearchDropdown();
});
document.addEventListener('click', (event) => {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  if (sidebar.contains(event.target)) return;
  collapseSidebarIfAllowed();
});
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && String(event.key || '').toLowerCase() === 'k') {
    event.preventDefault();
    if (hasPendingDeviceVerification() || requiresTermsAcceptance() || requiresEducationSectionSelection() || requiresProfileSetupCompletion()) return;
    toggleQuickCommandPalette();
    return;
  }
  if (event.key === 'Escape' && isQuickCommandPaletteOpen()) {
    event.preventDefault();
    closeQuickCommandPalette();
    return;
  }
  if (isQuickCommandPaletteOpen() && !isEditableTarget(event.target)) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveQuickCommandSelection(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveQuickCommandSelection(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      runQuickCommandAt(INTERACTION_ENHANCEMENTS.activeIndex);
      return;
    }
  }
  if (requiresTermsAcceptance()) {
    const modal = document.getElementById('m-terms');
    const insideMandatoryModal = !!modal && modal.contains(event.target);
    const allowedGlobalKey = event.key === 'Escape' || event.key === 'F5';
    if (!insideMandatoryModal && !allowedGlobalKey) {
      event.preventDefault();
      event.stopPropagation();
      enforceMandatoryTermsAcceptance();
      return;
    }
  }
  if (requiresEducationSectionSelection()) {
    const modal = document.getElementById('m-education-section');
    const insideMandatoryModal = !!modal && modal.contains(event.target);
    const allowedGlobalKey = event.key === 'Escape' || event.key === 'F5';
    if (!insideMandatoryModal && !allowedGlobalKey) {
      event.preventDefault();
      event.stopPropagation();
      enforceMandatoryEducationSelection();
      return;
    }
  }
  if (requiresProfileSetupCompletion()) {
    const modal = document.getElementById('m-setup');
    const insideMandatoryModal = !!modal && modal.contains(event.target);
    const allowedGlobalKey = event.key === 'Escape' || event.key === 'F5';
    if (!insideMandatoryModal && !allowedGlobalKey) {
      event.preventDefault();
      event.stopPropagation();
      enforceMandatorySetup();
      return;
    }
  }
  if (event.key !== 'Escape') return;
  if (hasPendingDeviceVerification()) {
    event.preventDefault();
    openDeviceVerificationModal(
      DEVICE_VERIFICATION_FLOW.pendingMaskedEmail
        ? `Detectamos un dispositivo nuevo. Enviamos un codigo a ${DEVICE_VERIFICATION_FLOW.pendingMaskedEmail}.`
        : 'Detectamos un dispositivo nuevo. Revisa tu correo para continuar.'
    );
    return;
  }
  if (requiresTermsAcceptance()) {
    event.preventDefault();
    enforceMandatoryTermsAcceptance();
    return;
  }
  if (requiresEducationSectionSelection()) {
    event.preventDefault();
    enforceMandatoryEducationSelection();
    return;
  }
  if (requiresProfileSetupCompletion()) {
    event.preventDefault();
    enforceMandatorySetup();
    return;
  }
  closeProfileMenu();
  closeInstrumentDownloadMenus();
  closeStudentsSearchDropdown();
  collapseSidebarIfAllowed();
});
window.addEventListener('beforeunload', (event) => {
  if (!hasPendingSettingsChanges()) return;
  event.preventDefault();
  event.returnValue = '';
});
window.__aulaBaseNavHandlersReady = true;
STATIC_DOM.overlays.forEach(m=>{
  m.addEventListener('click',e=>{ if(e.target===m && m.id!=='m-setup' && m.id!=='m-auth' && m.id!=='m-education-section' && m.id!=='m-terms') closeM(m.id); });
});
window.addEventListener('popstate', (event) => {
  const state = event.state;
  if (state?.eduGestRoot) {
    syncNavHistory(S.currentPage || currentPage || 'dashboard', currentPage || 'dashboard', 'push');
    return;
  }
  if (!state?.eduGestNav) return;
  try {
    go(state.requestedPage || state.page || 'dashboard', {
      fromHistory: true,
      activityViewMode: state.activityViewMode || null,
    });
  } catch (error) {
    console.error('[EduGest][nav] No se pudo restaurar el historial', error);
    go('dashboard', { fromHistory: true, activityViewMode: 'blocks' });
  }
});
window.addEventListener('beforeunload', () => {
  lessonPlanFlushPendingAutosave();
  flushPersistQueue();
  window.EduGestDB.flushPendingSave();
});
window.addEventListener('pagehide', () => {
  lessonPlanFlushPendingAutosave();
  flushPersistQueue();
  window.EduGestDB.flushPendingSave();
});

// Evita que el arranque quede colgado esperando auth remoto devolviendo un timeout controlado.
// Intenta resolver el usuario de sesión sin colgar el arranque cuando Firebase o el storage tardan demasiado.
async function getCurrentUserWithBootTimeout() {
  // Espera la identidad cloud sin bloquear el boot cuando la autenticación tarda o no responde.
  if (!canUseCloudAuth()) return null;
  return Promise.race([
    window.EduGestCloud.getCurrentUser(),
    new Promise((resolve) => {
      window.setTimeout(() => resolve(AUTH_BOOT_TIMEOUT), AUTH_BOOT_TIMEOUT_MS);
    }),
  ]);
}

/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   BOOT
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Arranque principal: hidrata estado, restaura sesion, decide modales obligatorios y abre el panel correcto.
// Orquesta el arranque de la app: hidrata estado, valida sesión y abre el panel o la pantalla de acceso.
async function bootApp() {
  // Orquesta el arranque de la app: hidrata estado, valida sesión y abre el panel o la pantalla de acceso.
  const bootSplashWatchdog = window.setTimeout(() => {
    hideBootSplash();
  }, 7000);
  hideBootSplash();
  await hydrate({ skipRootState: canUseCloudAuth() });
  ensureAppHistoryRoot();
  initInteractionEnhancements();
  const browserSession = readBrowserSession();
  const browserSessionActive = !!browserSession?.uid;
  const browserSessionIdentity = browserSessionActive
    ? {
        id: browserSession.uid,
        uid: browserSession.uid,
        name: browserSession.name || S.sessionUserName || '',
        email: '',
      }
    : null;
  debugSessionFlow('boot:start', {
    cloudEnabled: canUseCloudAuth(),
    browserSessionUid: browserSession?.uid || null,
    stateSessionUid: S.sessionUserId || null,
    stateCloudOwnerUid: S.cloudOwnerUid || null,
  });
  const locationNav = readPanelLocation();
  const panelSessionState = readPanelSessionState(browserSession?.uid || '');
  if (!locationNav && panelSessionState) {
    if (panelSessionState.currentPage) S.currentPage = panelSessionState.currentPage;
    if (['blocks','matrix','config'].includes(panelSessionState.activityViewMode)) S.activityViewMode = panelSessionState.activityViewMode;
    if (panelSessionState.activeGroupId) S.activeGroupId = panelSessionState.activeGroupId;
    if (panelSessionState.activeGradeId) S.activeGradeId = panelSessionState.activeGradeId;
    if (panelSessionState.activePeriodId) S.activePeriodId = panelSessionState.activePeriodId;
    if (panelSessionState.attendanceMonthKey) {
      ensureAttendanceV2State();
      S.attendance.monthKey = panelSessionState.attendanceMonthKey;
    }
  }
  currentPage = locationNav?.requestedPage || S.currentPage || 'dashboard';
  ACT_VIEW_MODE = locationNav?.activityViewMode || (['blocks','matrix','config'].includes(S.activityViewMode) ? S.activityViewMode : 'blocks');
  if (!canUseCloudAuth() && !S.sessionUserId && browserSessionIdentity) {
    applySessionUser(browserSessionIdentity);
  }
  if (!canUseCloudAuth() && S.sessionUserId && !browserSessionActive) {
    resetToSignedOutState();
  }
  if (canUseCloudAuth()) {
    try {
      const authResult = await getCurrentUserWithBootTimeout();
      if (authResult === AUTH_BOOT_TIMEOUT) {
        console.warn('[EduGest][cloud] Timeout al restaurar sesion durante el arranque');
        debugSessionFlow('boot:cloud-timeout', {});
        resetToSignedOutState();
      } else if (authResult) {
        const user = authResult;
        debugSessionFlow('boot:cloud-user', { uid: user?.id || null });
        const gate = await enforceTrustedSession(user, { source: 'boot', pendingAfterLogin: false });
        if (!gate.ok) {
          debugSessionFlow('boot:cloud-user-blocked', { uid: user?.id || null });
          resetToSignedOutState();
        } else {
          await hydrateCloudStateForUser(user);
          ensureIndividualLicenseModel();
        }
      } else {
        debugSessionFlow('boot:cloud-no-user', {});
        resetToSignedOutState();
      }
    } catch (error) {
      console.error('[EduGest][cloud] Error al restaurar la sesion', error);
      debugSessionFlow('boot:cloud-error', { error: String(error?.message || error || '') });
      resetToSignedOutState();
    }
  } else if (S.sessionUserId && hasActiveBrowserSession()) {
    const localSessionUser = getLocalSessionUser() || getBrowserSessionIdentity();
    if (localSessionUser) {
      debugSessionFlow('boot:local-user', { uid: localSessionUser?.id || null });
      await hydrateLocalWorkspaceForUser(localSessionUser);
    }
  }
  ensurePeriodBuckets(S.activePeriodId || 'P1');
  ensureSchoolCatalog();
  ensureUserPreferences();
  applyUserPreferences();
  updateSBUser();
  setAuthMode('login');
  const mustAcceptTerms = requiresTermsAcceptance();
  const mustSelectEducationSection = requiresEducationSectionSelection();
  const mustCompleteSetup = requiresProfileSetupCompletion();
  if (S.sessionUserId) {
    forceCloseM('m-auth');
    if (mustAcceptTerms) {
      openM('m-auth');
      setAuthMode('login');
      forceCloseM('m-education-section');
      forceCloseM('m-setup');
      openM('m-terms');
    } else if (mustCompleteSetup) {
      forceCloseM('m-education-section');
      openM('m-setup', { fromAuth: true });
    } else if (mustSelectEducationSection) {
      forceCloseM('m-terms');
      forceCloseM('m-setup');
      openEducationSectionSetup({ fromAuth: true });
    } else {
      forceCloseM('m-terms');
      forceCloseM('m-education-section');
      forceCloseM('m-setup');
    }
  } else {
    openM('m-auth');
    forceCloseM('m-terms');
    forceCloseM('m-education-section');
    forceCloseM('m-setup');
  }
  ensureAuthScreenVisible();
  const targetPage = locationNav?.requestedPage || S.currentPage || currentPage || 'dashboard';
  try {
    go(targetPage, { historyMode: navHistoryInitialized ? 'push' : 'replace', activityViewMode: locationNav?.activityViewMode || null });
  } catch (error) {
    console.error('[EduGest][boot] No se pudo restaurar el panel actual', error);
    S.currentPage = 'dashboard';
    currentPage = 'dashboard';
    persist();
    go('dashboard', { historyMode: navHistoryInitialized ? 'push' : 'replace' });
    toast('No se pudo restaurar el panel anterior. Se abrió Inicio.', true);
  }
  scheduleNonCriticalTask(() => {
    renderSchoolSuggestions();
    setupMatriculaInputs();
    logCourseOrderCheck();
  });
  window.clearTimeout(bootSplashWatchdog);
}

bootApp().catch((error) => {
  console.error('[EduGest][boot] Error al iniciar la app', error);
  hideBootSplash();
  const bootErrorMessage = window.EduGestCloud?.friendlyError?.(error) || String(error?.message || error || 'Error desconocido');
  toast(`No se pudo completar el arranque: ${bootErrorMessage}`, true);
  try {
    initInteractionEnhancements();
    const browserSession = readBrowserSession();
    const browserSessionActive = !!browserSession?.uid;
    const browserSessionIdentity = browserSessionActive
      ? {
          id: browserSession.uid,
          uid: browserSession.uid,
          name: browserSession.name || S.sessionUserName || '',
          email: '',
        }
      : null;
    if (S.sessionUserId && !browserSessionActive) {
      resetToSignedOutState();
    }
    if (!canUseCloudAuth() && !S.sessionUserId && browserSessionIdentity) {
      applySessionUser(browserSessionIdentity);
    }
    ensurePeriodBuckets(S.activePeriodId || 'P1');
    ensureSchoolCatalog();
    ensureUserPreferences();
    applyUserPreferences();
    updateSBUser();
    setAuthMode('login');
    const mustAcceptTerms = requiresTermsAcceptance();
    const mustSelectEducationSection = requiresEducationSectionSelection();
    const mustCompleteSetup = requiresProfileSetupCompletion();
    if (S.sessionUserId) {
      forceCloseM('m-auth');
      if (mustAcceptTerms) {
        openM('m-auth');
        setAuthMode('login');
        forceCloseM('m-education-section');
        forceCloseM('m-setup');
        openM('m-terms');
      } else if (mustCompleteSetup) {
        forceCloseM('m-education-section');
        openM('m-setup', { fromAuth: true });
      } else if (mustSelectEducationSection) {
        forceCloseM('m-terms');
        forceCloseM('m-setup');
        openEducationSectionSetup({ fromAuth: true });
      } else {
        forceCloseM('m-terms');
        forceCloseM('m-education-section');
        forceCloseM('m-setup');
      }
    } else {
      openM('m-auth');
      forceCloseM('m-terms');
      forceCloseM('m-education-section');
      forceCloseM('m-setup');
    }
    ensureAuthScreenVisible();
    try {
      go(S.currentPage || currentPage || 'dashboard', { historyMode: navHistoryInitialized ? 'push' : 'replace' });
    } catch (panelError) {
      console.error('[EduGest][boot] No se pudo restaurar el panel actual', panelError);
      S.currentPage = 'dashboard';
      currentPage = 'dashboard';
      persist();
      go('dashboard', { historyMode: navHistoryInitialized ? 'push' : 'replace' });
      toast('No se pudo restaurar el panel anterior. Se abrió Inicio.', true);
    }
    scheduleNonCriticalTask(() => {
      renderSchoolSuggestions();
      setupMatriculaInputs();
      logCourseOrderCheck();
    });
    toast('No se pudo restaurar toda la sesión anterior, pero la app siguió cargando.', true);
  } catch (recoveryError) {
    console.error('[EduGest][boot] Falló la recuperación de emergencia', recoveryError);
    const view = STATIC_DOM.view;
    if (view) {
      view.innerHTML = renderPanelErrorCard('dashboard', recoveryError, { requestedPage: S.currentPage || currentPage || 'dashboard' });
    }
    ensureAuthScreenVisible();
  } finally {
    hideBootSplash();
  }
});
