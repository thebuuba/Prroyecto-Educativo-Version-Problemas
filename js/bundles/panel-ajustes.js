/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-bundles.sh
 */

// Abre abrir perfil from settings.
function openProfileFromSettings() {
  closeProfileMenu();
  openM('m-setup');
}
// Actualiza settings sección order.
function settingsSectionOrder() {
  return ['profile', 'cycle', 'ux', 'notifications', 'evaluation', 'data', 'account'];
}
// Obtiene get settings multi valor.
function getSettingsMultiValue(selectId) {
  const el = document.getElementById(selectId);
  if (!el) return [];
  return Array.from(el.selectedOptions || []).map((opt) => String(opt.value || '').trim()).filter(Boolean);
}
// Captura el estado persistido actual de ajustes para compararlo luego contra el formulario editado.
function getSettingsStateSnapshot() {
  ensureUserPreferences();
  const localUser = getLocalSessionUser();
  const profile = S.profile || {};
  const profileName = String(profile.name || S.sessionUserName || localUser?.name || '').trim();
  const parsedFirstName = profileName.split(/\s+/).slice(0, 1).join(' ').trim();
  const parsedLastName = profileName.split(/\s+/).slice(1).join(' ').trim();
  return {
    profileName,
    profileFirstName: String(profile.firstName || parsedFirstName).trim(),
    profileLastName: String(profile.lastName || parsedLastName).trim(),
    profilePhone: normalizePhoneValue(profile.phone || ''),
    profileRole: String(profile.role || 'Docente').trim(),
    profileInst: String(profile.inst || '').trim(),
    profileEducationLevels: uniqueValues(normalizeEducationSections(profile.educationSections || profile.educationSection || '')),
    profileAreas: uniqueValues(profile.teachingProfile?.areas || []),
    profileGrades: uniqueValues(profile.teachingProfile?.grades || []),
    profileSubjects: uniqueValues(profile.subjects || []),
    profileSections: uniqueValues(profile.assignedSections || []),
    profileTimeZone: String(profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo').trim(),
    profileLanguage: String(profile.language || 'es-DO').trim(),
    profileAvatarUrl: String(profile.avatarUrl || '').trim(),
    year: S.profile?.year || S.schoolYear?.name || '2025-2026',
    period: S.activePeriodId || 'P1',
    density: S.preferences?.density || 'comfortable',
    animations: S.preferences?.animations !== false,
    authLoginAnimation: S.preferences?.authLoginAnimation !== false,
    notifDeadline: S.preferences?.notifications?.deadlineReminder !== false,
    notifLowPerformance: S.preferences?.notifications?.lowPerformanceAlert !== false,
    notifSummary: S.preferences?.notifications?.dailySummary === true,
    notifSync: S.preferences?.notifications?.syncAlert !== false,
    evalScale: String(S.preferences?.evaluation?.defaultScale || '100'),
    evalRounding: String(S.preferences?.evaluation?.rounding || 'nearest'),
    evalDecimals: S.preferences?.evaluation?.showDecimals === true,
    evalWeights: String(S.preferences?.evaluation?.weightPreset || 'balanced'),
  };
}
// Lee el formulario visible de ajustes y lo traduce a un snapshot comparable con el estado guardado.
function getSettingsFormSnapshot() {
  const base = getSettingsStateSnapshot();
  return {
    profileName: document.getElementById('cfg-profile-name')?.value?.trim() || base.profileName,
    profileFirstName: document.getElementById('cfg-profile-firstname')?.value?.trim() || base.profileFirstName,
    profileLastName: document.getElementById('cfg-profile-lastname')?.value?.trim() || base.profileLastName,
    profilePhone: normalizePhoneValue(document.getElementById('cfg-profile-phone')?.value || base.profilePhone),
    profileRole: document.getElementById('cfg-profile-role')?.value || base.profileRole,
    profileInst: document.getElementById('cfg-profile-inst')?.value?.trim() || base.profileInst,
    profileEducationLevels: uniqueValues(getSettingsMultiValue('cfg-profile-levels').length ? getSettingsMultiValue('cfg-profile-levels') : base.profileEducationLevels),
    profileAreas: uniqueValues(parseDelimitedValues(document.getElementById('cfg-profile-areas')?.value || base.profileAreas.join(', '))),
    profileGrades: uniqueValues(parseDelimitedValues(document.getElementById('cfg-profile-grades')?.value || base.profileGrades.join(', '))),
    profileSubjects: uniqueValues(getSettingsMultiValue('cfg-profile-subjects').length ? getSettingsMultiValue('cfg-profile-subjects') : base.profileSubjects),
    profileSections: uniqueValues(getSettingsMultiValue('cfg-profile-sections').length ? getSettingsMultiValue('cfg-profile-sections') : base.profileSections),
    profileTimeZone: document.getElementById('cfg-profile-timezone')?.value || base.profileTimeZone,
    profileLanguage: document.getElementById('cfg-profile-language')?.value || base.profileLanguage,
    profileAvatarUrl: document.getElementById('cfg-profile-avatar')?.value?.trim() || base.profileAvatarUrl,
    year: document.getElementById('cfg-year')?.value || base.year,
    period: document.getElementById('cfg-period')?.value || base.period,
    density: document.getElementById('cfg-density')?.value || base.density,
    animations: document.getElementById('cfg-animations') ? !!document.getElementById('cfg-animations').checked : base.animations,
    authLoginAnimation: document.getElementById('cfg-auth-login-animation') ? !!document.getElementById('cfg-auth-login-animation').checked : base.authLoginAnimation,
    notifDeadline: document.getElementById('cfg-notif-deadline') ? !!document.getElementById('cfg-notif-deadline').checked : base.notifDeadline,
    notifLowPerformance: document.getElementById('cfg-notif-low-performance') ? !!document.getElementById('cfg-notif-low-performance').checked : base.notifLowPerformance,
    notifSummary: document.getElementById('cfg-notif-summary') ? !!document.getElementById('cfg-notif-summary').checked : base.notifSummary,
    notifSync: document.getElementById('cfg-notif-sync') ? !!document.getElementById('cfg-notif-sync').checked : base.notifSync,
    evalScale: document.getElementById('cfg-eval-scale')?.value || base.evalScale,
    evalRounding: document.getElementById('cfg-eval-rounding')?.value || base.evalRounding,
    evalDecimals: document.getElementById('cfg-eval-decimals') ? !!document.getElementById('cfg-eval-decimals').checked : base.evalDecimals,
    evalWeights: document.getElementById('cfg-eval-weights')?.value || base.evalWeights,
  };
}
// Determina si el panel de ajustes tiene cambios pendientes sin guardar.
function isSettingsDirty() {
  const form = getSettingsFormSnapshot();
  const state = getSettingsStateSnapshot();
  form.profileEducationLevels = uniqueValues(form.profileEducationLevels).sort();
  form.profileAreas = uniqueValues(form.profileAreas).sort();
  form.profileGrades = uniqueValues(form.profileGrades).sort();
  form.profileSubjects = uniqueValues(form.profileSubjects).sort();
  form.profileSections = uniqueValues(form.profileSections).sort();
  state.profileEducationLevels = uniqueValues(state.profileEducationLevels).sort();
  state.profileAreas = uniqueValues(state.profileAreas).sort();
  state.profileGrades = uniqueValues(state.profileGrades).sort();
  state.profileSubjects = uniqueValues(state.profileSubjects).sort();
  state.profileSections = uniqueValues(state.profileSections).sort();
  return JSON.stringify(form) !== JSON.stringify(state);
}
// Actualiza actualizar settings guardar button visibility.
function updateSettingsSaveButtonVisibility() {
  const dirty = isSettingsDirty();
  const wrap = document.getElementById('settings-save-wrap');
  if (wrap) wrap.classList.toggle('is-hidden', !dirty);
  updateSettingsStatusSummary(dirty);
}
// Actualiza actualizar settings status summary.
function updateSettingsStatusSummary(dirty = isSettingsDirty()) {
  const bar = document.getElementById('settings-status-bar');
  const title = document.getElementById('settings-status-title');
  const copy = document.getElementById('settings-status-copy');
  const stepEdit = document.getElementById('settings-step-edit');
  const stepReview = document.getElementById('settings-step-review');
  const stepSave = document.getElementById('settings-step-save');
  if (!bar) return;
  bar.classList.toggle('is-dirty', dirty);
  bar.classList.toggle('is-clean', !dirty);
  if (title) title.textContent = dirty ? 'Cambios pendientes' : 'Todo guardado';
  if (copy) copy.textContent = dirty
    ? 'Revisa y presiona Guardar configuración para aplicar los ajustes.'
    : 'No hay cambios pendientes. Puedes seguir editando cualquier sección.';
  if (stepEdit) stepEdit.className = 'settings-status-step is-complete';
  if (stepReview) stepReview.className = 'settings-status-step is-complete';
  if (stepSave) stepSave.className = `settings-status-step ${dirty ? 'is-active' : 'is-complete'}`;
}
// Conecta listeners del formulario para detectar cambios y actualizar el estado visual de guardado.
function setupSettingsDirtyTracking() {
  [
    'cfg-profile-name',
    'cfg-profile-firstname',
    'cfg-profile-lastname',
    'cfg-profile-phone',
    'cfg-profile-role',
    'cfg-profile-inst',
    'cfg-profile-levels',
    'cfg-profile-areas',
    'cfg-profile-grades',
    'cfg-profile-subjects',
    'cfg-profile-sections',
    'cfg-profile-timezone',
    'cfg-profile-language',
    'cfg-profile-avatar',
    'cfg-year',
    'cfg-period',
    'cfg-density',
    'cfg-animations',
    'cfg-auth-login-animation',
    'cfg-notif-deadline',
    'cfg-notif-low-performance',
    'cfg-notif-summary',
    'cfg-notif-sync',
    'cfg-eval-scale',
    'cfg-eval-rounding',
    'cfg-eval-decimals',
    'cfg-eval-weights',
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', updateSettingsSaveButtonVisibility);
    if (el.tagName !== 'SELECT' && el.type !== 'checkbox') el.addEventListener('input', updateSettingsSaveButtonVisibility);
  });
  updateSettingsSaveButtonVisibility();
}
// Abre abrir settings sección.
function openSettingsSection(sectionId) {
  const validSections = settingsSectionOrder();
  S.settingsSection = validSections.includes(sectionId) ? sectionId : 'profile';
  go('settings');
}
// Gestiona navigate settings sección.
function navigateSettingsSection(step) {
  const order = settingsSectionOrder();
  const current = order.indexOf(S.settingsSection || 'profile');
  const next = Math.max(0, Math.min(order.length - 1, current + step));
  openSettingsSection(order[next]);
}
// Gestiona reset settings panel borrador.
function resetSettingsPanelDraft() {
  go('settings');
}
// Valida y guarda la configuración del usuario, preferencias de UX y metadatos académicos del perfil.
async function saveSettingsPanel() {
  const localUser = getLocalSessionUser();
  const firstName = String(document.getElementById('cfg-profile-firstname')?.value || S.profile?.firstName || '').trim();
  const lastName = String(document.getElementById('cfg-profile-lastname')?.value || S.profile?.lastName || '').trim();
  const profilePhone = normalizePhoneValue(document.getElementById('cfg-profile-phone')?.value || S.profile?.phone || '');
  const profileNameFromForm = String(document.getElementById('cfg-profile-name')?.value || '').trim();
  const profileName = buildProfileFullName(firstName, lastName) || profileNameFromForm || S.profile?.name || S.sessionUserName || localUser?.name || '';
  const profileRole = String(document.getElementById('cfg-profile-role')?.value || S.profile?.role || 'Docente').trim();
  const profileInstRaw = String(document.getElementById('cfg-profile-inst')?.value || S.profile?.inst || '').trim();
  const profileInst = normalizeSchoolName(profileInstRaw) || 'Sin especificar';
  const profileEducationLevels = normalizeEducationSections(
    getSettingsMultiValue('cfg-profile-levels').length
      ? getSettingsMultiValue('cfg-profile-levels')
      : (S.profile?.educationSections || S.profile?.educationSection || [])
  );
  const profileAreas = uniqueValues(parseDelimitedValues(
    document.getElementById('cfg-profile-areas')?.value
      || (S.profile?.teachingProfile?.areas || []).join(', ')
  ));
  const profileGrades = uniqueValues(parseDelimitedValues(
    document.getElementById('cfg-profile-grades')?.value
      || (S.profile?.teachingProfile?.grades || []).join(', ')
  ));
  const profileSubjects = uniqueValues(getSettingsMultiValue('cfg-profile-subjects'));
  const profileSections = uniqueValues(getSettingsMultiValue('cfg-profile-sections'));
  const profileTimeZone = String(document.getElementById('cfg-profile-timezone')?.value || S.profile?.timeZone || 'America/Santo_Domingo').trim();
  const profileLanguage = String(document.getElementById('cfg-profile-language')?.value || S.profile?.language || 'es-DO').trim();
  const profileAvatarUrl = String(document.getElementById('cfg-profile-avatar')?.value || S.profile?.avatarUrl || '').trim();
  const year = document.getElementById('cfg-year')?.value || S.profile?.year || S.schoolYear?.name || '2025-2026';
  const period = document.getElementById('cfg-period')?.value || S.activePeriodId || 'P1';
  ensureUserPreferences();
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  if (!profileName) {
    toast('El nombre completo es obligatorio.', true);
    return;
  }
  if (!firstName) {
    toast('El nombre es obligatorio.', true);
    return;
  }
  if (!lastName) {
    toast('Los apellidos son obligatorios.', true);
    return;
  }
  if (!profileEducationLevels.length) {
    toast('Selecciona al menos un nivel educativo del docente.', true);
    return;
  }
  if (!phoneHasValidDigits(profilePhone)) {
    toast('El teléfono debe tener 10 dígitos (formato: (000) 000-0000).', true);
    return;
  }
  S.profile.name = profileName;
  S.profile.firstName = firstName;
  S.profile.lastName = lastName;
  S.profile.phone = profilePhone;
  S.profile.role = profileRole || 'Docente';
  S.profile.inst = profileInst;
  S.profile.educationSections = profileEducationLevels;
  S.profile.educationSection = profileEducationLevels[0] || '';
  S.profile.educationSectionLocked = false;
  S.profile.subjects = profileSubjects;
  S.profile.assignedSections = profileSections;
  S.profile.teachingProfile = {
    center: profileInst,
    educationLevels: profileEducationLevels,
    areas: profileAreas,
    grades: profileGrades,
    subjects: profileSubjects,
  };
  S.profile.timeZone = profileTimeZone || 'America/Santo_Domingo';
  S.profile.language = profileLanguage || 'es-DO';
  S.profile.avatarUrl = profileAvatarUrl;
  if (localUser?.email) S.profile.email = localUser.email;
  ensureIndividualLicenseModel();
  applyEducationSectionTheme(profileEducationLevels);
  registerSchool(profileInst);
  S.preferences.density = document.getElementById('cfg-density')?.value || 'comfortable';
  S.preferences.animations = !!document.getElementById('cfg-animations')?.checked;
  S.preferences.authLoginAnimation = !!document.getElementById('cfg-auth-login-animation')?.checked;
  S.preferences.notifications = {
    deadlineReminder: !!document.getElementById('cfg-notif-deadline')?.checked,
    lowPerformanceAlert: !!document.getElementById('cfg-notif-low-performance')?.checked,
    dailySummary: !!document.getElementById('cfg-notif-summary')?.checked,
    syncAlert: !!document.getElementById('cfg-notif-sync')?.checked,
  };
  S.preferences.evaluation = {
    defaultScale: document.getElementById('cfg-eval-scale')?.value || '100',
    rounding: document.getElementById('cfg-eval-rounding')?.value || 'nearest',
    showDecimals: !!document.getElementById('cfg-eval-decimals')?.checked,
    weightPreset: document.getElementById('cfg-eval-weights')?.value || 'balanced',
  };
  applyUserPreferences();
  setSchoolYear(year);
  setActivePeriod(period);
  S.profile.period = periodName(period);
  if (window.AulaBaseSqlApi?.isEnabled?.()) {
    const email = String(S.profile?.email || localUser?.email || '').trim().toLowerCase();
    if (email) {
      try {
        const syncResult = await window.AulaBaseSqlApi.syncProfile({
          email,
          displayName: S.profile.name || '',
          phone: S.profile.phone || '',
          firebaseUid: S.sessionUserId || '',
          schoolName: profileInst,
          academicYear: year,
          timezone: S.profile.timeZone || 'America/Santo_Domingo',
          role: profileRole || 'teacher',
        });
        if (syncResult?.school?.name) {
          mergeSchoolsIntoCatalog([syncResult.school.name]);
        }
        scheduleSqlStateBlockSyncs();
      } catch (error) {
        console.warn('[AulaBase][sql-api] No se pudo sincronizar el perfil con SQL', error);
      }
    }
  }
  persist();
  updateSBUser();
  updateSettingsSaveButtonVisibility();
  toast('Configuración guardada');
}
// Descarga descarga workspace backup.
function downloadWorkspaceBackup() {
  try {
    const payload = {
      app: 'AulaBase',
      release: APP_RELEASE_TAG,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      ownerId: S.sessionUserId || null,
      ownerName: S.profile?.name || S.sessionUserName || '',
      state: buildLocalRootSnapshot(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aulabase-respaldo-${(S.profile?.name || 'docente').replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Respaldo descargado');
  } catch (error) {
    reportError('backup:download', error, { fallback: 'No se pudo descargar el respaldo.' });
  }
}
// Gestiona trigger workspace restore.
function triggerWorkspaceRestore() {
  document.getElementById('cfg-restore-file')?.click();
}
// Restaura un respaldo exportado por el usuario y rehidrata el workspace resultante en la sesión actual.
function restoreWorkspaceBackup(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      const backupMeta = parsed && typeof parsed === 'object' ? parsed : {};
      const backupApp = String(backupMeta.app || '').trim();
      const backupVersion = Number(backupMeta.schemaVersion || 1);
      if (backupApp && backupApp !== 'AulaBase') {
        throw new Error('Este archivo no pertenece a AulaBase.');
      }
      if (backupVersion > BACKUP_SCHEMA_VERSION) {
        throw new Error('Este respaldo fue creado con una versión más nueva de la app.');
      }
      const exportedAt = backupMeta.exportedAt ? new Date(backupMeta.exportedAt).toLocaleString('es-DO') : 'fecha no disponible';
      const ownerName = String(backupMeta.ownerName || 'usuario desconocido').trim();
      const confirmRestore = window.confirm(`Se restaurará un respaldo de ${ownerName} (${exportedAt}). Esta acción reemplazará el estado actual. ¿Deseas continuar?`);
      if (!confirmRestore) return;
      const nextState = parsed?.state && typeof parsed.state === 'object' ? parsed.state : parsed;
      if (!nextState || typeof nextState !== 'object') {
        throw new Error('El contenido del respaldo no es válido.');
      }
      const sessionUser = getLocalSessionUser() || getBrowserSessionIdentity();
      replaceState(nextState);
      if (sessionUser) applySessionUser(sessionUser);
      ensurePeriodBuckets(S.activePeriodId || 'P1');
      ensureSchoolCatalog();
      ensureUserPreferences();
      applyUserPreferences();
      persist();
      refreshTop();
      go(S.currentPage || currentPage || 'settings');
      toast('Respaldo restaurado');
    } catch (error) {
      reportError('backup:restore', error, { fallback: 'El archivo de respaldo no es válido.' });
    } finally {
      event.target.value = '';
    }
  };
  reader.onerror = (error) => {
    event.target.value = '';
    reportError('backup:read', error, { fallback: 'No se pudo leer el archivo de respaldo.' });
  };
  reader.readAsText(file);
}
// Renderiza la página completa de ajustes con secciones navegables, formulario y acciones de datos.
function renderSettingsPage() {
  ensurePeriodsAndYear();
  ensureUserPreferences();
  const validSections = settingsSectionOrder();
  const localUser = getLocalSessionUser();
  const sectionMeta = {
    profile: { idx: 1, label: 'Perfil', tone: 'normal' },
    cycle: { idx: 2, label: 'Año y período', tone: 'normal' },
    ux: { idx: 3, label: 'Apariencia', tone: 'normal' },
    notifications: { idx: 4, label: 'Notificaciones', tone: 'normal' },
    evaluation: { idx: 5, label: 'Evaluación', tone: 'normal' },
    data: { idx: 6, label: 'Datos', tone: 'normal' },
    account: { idx: 7, label: 'Cuenta', tone: 'danger' },
  };
  const activeSection = validSections.includes(S.settingsSection) ? S.settingsSection : 'profile';
  const activeIndex = validSections.indexOf(activeSection);
  const activeUser = getDisplayUserName('Docente activo');
  const activeEmail = localUser?.email || S.profile?.email || 'No disponible';
  const rawAccessMode = normalizeAuthAccessMode(S.profile?.authAccessMode || localUser?.authMode || '');
  const registrationMode = authAccessModeLabel(rawAccessMode);
  const profile = S.profile || {};
  const selectedEducationLevels = normalizeEducationSections(profile.educationSections || profile.educationSection || '');
  const gradeCatalog = uniqueValues((S.grades || []).map((grade) => String(grade.name || '').trim()).filter(Boolean));
  const areaCatalog = uniqueValues((S.secciones || []).map((section) => String(section.area || '').trim()).filter(Boolean));
  const teachingAreas = uniqueValues([...(profile.teachingProfile?.areas || []), ...areaCatalog]);
  const teachingGrades = uniqueValues([...(profile.teachingProfile?.grades || []), ...gradeCatalog]);
  const subjects = uniqueValues([
    ...(Array.isArray(profile.subjects) ? profile.subjects : []),
    ...((S.grades || []).map((grade) => grade.subjectName || '').filter(Boolean)),
    ...((S.secciones || []).map((section) => section.materia || '').filter(Boolean)),
  ]);
  const assignedSections = uniqueValues(Array.isArray(profile.assignedSections) ? profile.assignedSections : []);
  // Gestiona sección options.
  const sectionOptions = (S.secciones || []).map((section) => ({
    id: section.id,
    label: `${section.grado || 'Curso'} ${section.sec || ''} ? ${section.materia || 'General'}`,
  }));
  const roleOptions = ['Docente', 'Coordinador', 'Director', 'Asistente'];
  const timeZoneOptions = ['America/Santo_Domingo', 'America/New_York', 'America/Mexico_City', 'America/Bogota', 'Europe/Madrid'];
  const languageOptions = [
    { value: 'es-DO', label: 'Español (República Dominicana)' },
    { value: 'es-ES', label: 'Español (España)' },
    { value: 'es-MX', label: 'Español (México)' },
    { value: 'en-US', label: 'English (United States)' },
  ];
  const yearOptions = buildSchoolYearOptions()
    .map((year) => `<option value="${year}" ${year === (S.profile?.year || S.schoolYear?.name || '2025-2026') ? 'selected' : ''}>${year}</option>`)
    .join('');
  const periodOptions = (S.periods || [])
    .map((period) => `<option value="${period.id}" ${period.id === S.activePeriodId ? 'selected' : ''}>${period.id} ? ${period.name}</option>`)
    .join('');
  return `
    <div class="card settings-page-card">
      <div class="ch">
        <div class="ch-title">Centro de configuraci?n</div>
        <div class="settings-header-copy">Edita por secciones y guarda solo cuando termines.</div>
      </div>
      <div class="cp settings-page-body settings-layout">
        <div class="settings-status-bar is-clean" id="settings-status-bar">
          <div class="settings-status-main">
            <div class="settings-status-title" id="settings-status-title">Todo guardado</div>
            <div class="settings-status-copy" id="settings-status-copy">No hay cambios pendientes. Puedes seguir editando cualquier secci?n.</div>
          </div>
          <div class="settings-status-steps">
            <span class="settings-status-step is-complete" id="settings-step-edit">1. Editar</span>
            <span class="settings-status-step is-complete" id="settings-step-review">2. Revisar</span>
            <span class="settings-status-step is-complete" id="settings-step-save">3. Guardar</span>
          </div>
        </div>
        <aside class="settings-nav-panel">
          <div class="settings-nav-kicker">Navegación</div>
          <div class="settings-nav-title">Ajustes del maestro</div>
          <div class="settings-nav-list">
            <button type="button" class="settings-nav-link ${activeSection==='profile'?'is-active':''}" onclick="openSettingsSection('profile')"><span class="settings-nav-index">${sectionMeta.profile.idx}</span>${sectionMeta.profile.label}</button>
            <button type="button" class="settings-nav-link ${activeSection==='cycle'?'is-active':''}" onclick="openSettingsSection('cycle')"><span class="settings-nav-index">${sectionMeta.cycle.idx}</span>${sectionMeta.cycle.label}</button>
            <button type="button" class="settings-nav-link ${activeSection==='ux'?'is-active':''}" onclick="openSettingsSection('ux')"><span class="settings-nav-index">${sectionMeta.ux.idx}</span>${sectionMeta.ux.label}</button>
            <button type="button" class="settings-nav-link ${activeSection==='notifications'?'is-active':''}" onclick="openSettingsSection('notifications')"><span class="settings-nav-index">${sectionMeta.notifications.idx}</span>${sectionMeta.notifications.label}</button>
            <button type="button" class="settings-nav-link ${activeSection==='evaluation'?'is-active':''}" onclick="openSettingsSection('evaluation')"><span class="settings-nav-index">${sectionMeta.evaluation.idx}</span>${sectionMeta.evaluation.label}</button>
            <button type="button" class="settings-nav-link ${activeSection==='data'?'is-active':''}" onclick="openSettingsSection('data')"><span class="settings-nav-index">${sectionMeta.data.idx}</span>${sectionMeta.data.label}</button>
            <button type="button" class="settings-nav-link settings-nav-link-danger ${activeSection==='account'?'is-active':''}" onclick="openSettingsSection('account')"><span class="settings-nav-index">${sectionMeta.account.idx}</span>${sectionMeta.account.label}</button>
          </div>
        </aside>
        <div class="settings-workspace">
          <div class="settings-sections">
            <section class="settings-section-card ${activeSection==='profile'?'is-active':'is-hidden'}" id="cfg-sec-profile">
              <div class="settings-section-head">
                <div class="settings-label">Perfil</div>
                <div class="settings-copy">Configura tus datos base para usar el sistema con contexto correcto.</div>
              </div>
              <div class="settings-grid settings-grid-profile">
                <label class="settings-field">
                  <span class="settings-field-label">Nombre completo</span>
                  <input class="inp" id="cfg-profile-name" type="text" value="${String(profile.name || activeUser)}" placeholder="Nombre y apellido">
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Nombre(s)</span>
                  <input class="inp" id="cfg-profile-firstname" type="text" value="${String(profile.firstName || String(profile.name || '').split(/\s+/).slice(0, 1).join(' '))}" placeholder="Nombre(s)">
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Apellido(s)</span>
                  <input class="inp" id="cfg-profile-lastname" type="text" value="${String(profile.lastName || String(profile.name || '').split(/\s+/).slice(1).join(' '))}" placeholder="Apellido(s)">
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Correo</span>
                  <input class="inp" id="cfg-profile-email" type="email" value="${String(activeEmail)}" readonly>
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Teléfono</span>
                  <input class="inp" id="cfg-profile-phone" type="tel" value="${String(normalizePhoneValue(profile.phone || ''))}" maxlength="14" oninput="handlePhoneInput(this)" placeholder="(809) 555-1234">
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Rol</span>
                  <select class="sel" id="cfg-profile-role">
                    ${roleOptions.map((role) => `<option value="${role}" ${String(profile.role || 'Docente') === role ? 'selected' : ''}>${role}</option>`).join('')}
                  </select>
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Centro educativo</span>
                  <input class="inp" id="cfg-profile-inst" type="text" value="${String(profile.inst || '')}" list="schools-list" placeholder="Nombre del centro">
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Niveles que imparte</span>
                  <select class="sel settings-multi-select" id="cfg-profile-levels" multiple size="3">
                    ${EDUCATION_SECTIONS.map((level) => `<option value="${level}" ${selectedEducationLevels.includes(level) ? 'selected' : ''}>${level}</option>`).join('')}
                  </select>
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Areas que imparte</span>
                  <input class="inp" id="cfg-profile-areas" type="text" value="${escapeHtml((profile.teachingProfile?.areas || teachingAreas || []).join(', '))}" placeholder="Ej. Lengua Espanola, Matematica">
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Grados que trabaja</span>
                  <input class="inp" id="cfg-profile-grades" type="text" value="${escapeHtml((profile.teachingProfile?.grades || teachingGrades || []).join(', '))}" placeholder="Ej. 3ro, 4to de Secundaria">
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Asignaturas que imparte</span>
                  <select class="sel settings-multi-select" id="cfg-profile-subjects" multiple size="5">
                    ${subjects.map((subject) => `<option value="${subject}" ${(profile.subjects || []).includes(subject) ? 'selected' : ''}>${subject}</option>`).join('')}
                  </select>
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Grados/Secciones asignadas</span>
                  <select class="sel settings-multi-select" id="cfg-profile-sections" multiple size="5">
                    ${sectionOptions.map((section) => `<option value="${section.id}" ${assignedSections.includes(section.id) ? 'selected' : ''}>${section.label}</option>`).join('')}
                  </select>
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Zona horaria</span>
                  <select class="sel" id="cfg-profile-timezone">
                    ${timeZoneOptions.map((tz) => `<option value="${tz}" ${String(profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo') === tz ? 'selected' : ''}>${tz}</option>`).join('')}
                  </select>
                </label>
                <label class="settings-field">
                  <span class="settings-field-label">Idioma</span>
                  <select class="sel" id="cfg-profile-language">
                    ${languageOptions.map((lang) => `<option value="${lang.value}" ${String(profile.language || 'es-DO') === lang.value ? 'selected' : ''}>${lang.label}</option>`).join('')}
                  </select>
                </label>
                <label class="settings-field settings-field-span">
                  <span class="settings-field-label">Foto / Avatar (opcional)</span>
                  <input class="inp" id="cfg-profile-avatar" type="url" value="${String(profile.avatarUrl || '')}" placeholder="https://...">
                </label>
              </div>
              <div class="settings-section-nav">
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(-1)" ${activeIndex===0?'disabled':''}>Anterior</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(1)">Siguiente</button>
              </div>
            </section>
            <section class="settings-section-card ${activeSection==='cycle'?'is-active':'is-hidden'}" id="cfg-sec-cycle">
              <div class="settings-section-head">
                <div class="settings-label">Año escolar y período</div>
                <div class="settings-copy">Define el ciclo activo de trabajo del maestro.</div>
              </div>
              <div class="settings-stack">
                <select class="sel" id="cfg-year">${yearOptions}</select>
                <select class="sel" id="cfg-period">${periodOptions}</select>
              </div>
              <div class="settings-section-nav">
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(-1)">Anterior</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(1)">Siguiente</button>
              </div>
            </section>
            <section class="settings-section-card ${activeSection==='ux'?'is-active':'is-hidden'}" id="cfg-sec-ux">
              <div class="settings-section-head">
                <div class="settings-label">Apariencia</div>
                <div class="settings-copy">Ajusta cómo quieres ver y sentir la interfaz.</div>
              </div>
              <label class="settings-field">
                <span class="settings-field-label">Densidad visual</span>
                <select class="sel" id="cfg-density">
                  <option value="comfortable" ${(S.preferences?.density || 'comfortable') === 'comfortable' ? 'selected' : ''}>Cómoda</option>
                  <option value="compact" ${S.preferences?.density === 'compact' ? 'selected' : ''}>Compacta</option>
                </select>
              </label>
              <label class="settings-toggle">
                <input id="cfg-animations" type="checkbox" ${S.preferences?.animations !== false ? 'checked' : ''}>
                <span>Animaciones suaves</span>
              </label>
              <label class="settings-toggle">
                <input id="cfg-auth-login-animation" type="checkbox" ${S.preferences?.authLoginAnimation !== false ? 'checked' : ''}>
                <span>Animación al iniciar sesión</span>
              </label>
              <div class="settings-section-nav">
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(-1)">Anterior</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(1)">Siguiente</button>
              </div>
            </section>
            <section class="settings-section-card ${activeSection==='notifications'?'is-active':'is-hidden'}" id="cfg-sec-notifications">
              <div class="settings-section-head">
                <div class="settings-label">Notificaciones</div>
                <div class="settings-copy">Activa solo los avisos que realmente te ayudan en el día a día.</div>
              </div>
              <label class="settings-toggle">
                <input id="cfg-notif-deadline" type="checkbox" ${S.preferences?.notifications?.deadlineReminder !== false ? 'checked' : ''}>
                <span>Recordatorios de entregas y fechas límite</span>
              </label>
              <label class="settings-toggle">
                <input id="cfg-notif-low-performance" type="checkbox" ${S.preferences?.notifications?.lowPerformanceAlert !== false ? 'checked' : ''}>
                <span>Alertas de bajo rendimiento</span>
              </label>
              <label class="settings-toggle">
                <input id="cfg-notif-summary" type="checkbox" ${S.preferences?.notifications?.dailySummary === true ? 'checked' : ''}>
                <span>Resumen diario del panel</span>
              </label>
              <label class="settings-toggle">
                <input id="cfg-notif-sync" type="checkbox" ${S.preferences?.notifications?.syncAlert !== false ? 'checked' : ''}>
                <span>Alertas de sincronización y respaldo</span>
              </label>
              <div class="settings-section-nav">
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(-1)">Anterior</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(1)">Siguiente</button>
              </div>
            </section>
            <section class="settings-section-card ${activeSection==='evaluation'?'is-active':'is-hidden'}" id="cfg-sec-evaluation">
              <div class="settings-section-head">
                <div class="settings-label">Evaluación</div>
                <div class="settings-copy">Define reglas por defecto para puntajes y cálculos.</div>
              </div>
              <label class="settings-field">
                <span class="settings-field-label">Escala de calificación</span>
                <select class="sel" id="cfg-eval-scale">
                  <option value="100" ${String(S.preferences?.evaluation?.defaultScale || '100') === '100' ? 'selected' : ''}>0 a 100</option>
                  <option value="20" ${String(S.preferences?.evaluation?.defaultScale || '100') === '20' ? 'selected' : ''}>0 a 20</option>
                  <option value="10" ${String(S.preferences?.evaluation?.defaultScale || '100') === '10' ? 'selected' : ''}>0 a 10</option>
                </select>
              </label>
              <label class="settings-field">
                <span class="settings-field-label">Redondeo</span>
                <select class="sel" id="cfg-eval-rounding">
                  <option value="nearest" ${String(S.preferences?.evaluation?.rounding || 'nearest') === 'nearest' ? 'selected' : ''}>Al entero más cercano</option>
                  <option value="up" ${String(S.preferences?.evaluation?.rounding || 'nearest') === 'up' ? 'selected' : ''}>Siempre hacia arriba</option>
                  <option value="down" ${String(S.preferences?.evaluation?.rounding || 'nearest') === 'down' ? 'selected' : ''}>Siempre hacia abajo</option>
                </select>
              </label>
              <label class="settings-field">
                <span class="settings-field-label">Preset de ponderación</span>
                <select class="sel" id="cfg-eval-weights">
                  <option value="balanced" ${String(S.preferences?.evaluation?.weightPreset || 'balanced') === 'balanced' ? 'selected' : ''}>Balanceada</option>
                  <option value="skills-first" ${String(S.preferences?.evaluation?.weightPreset || 'balanced') === 'skills-first' ? 'selected' : ''}>Competencias primero</option>
                  <option value="project-first" ${String(S.preferences?.evaluation?.weightPreset || 'balanced') === 'project-first' ? 'selected' : ''}>Proyectos primero</option>
                </select>
              </label>
              <label class="settings-toggle">
                <input id="cfg-eval-decimals" type="checkbox" ${S.preferences?.evaluation?.showDecimals === true ? 'checked' : ''}>
                <span>Mostrar decimales en reportes</span>
              </label>
              <div class="settings-section-nav">
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(-1)">Anterior</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(1)">Siguiente</button>
              </div>
            </section>
            <section class="settings-section-card ${activeSection==='data'?'is-active':'is-hidden'}" id="cfg-sec-data">
              <div class="settings-section-head">
                <div class="settings-label">Datos</div>
                <div class="settings-copy">Gestiona respaldos de tu espacio actual.</div>
              </div>
              <div class="settings-actions-list">
                <button class="btn btn-outline btn-sm" type="button" onclick="downloadWorkspaceBackup()">Descargar respaldo</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="triggerWorkspaceRestore()">Restaurar respaldo</button>
                <input id="cfg-restore-file" type="file" accept="application/json" hidden onchange="restoreWorkspaceBackup(event)">
              </div>
              <div class="settings-section-nav">
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(-1)">Anterior</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(1)">Siguiente</button>
              </div>
            </section>
            <section class="settings-section-card settings-section-danger ${activeSection==='account'?'is-active':'is-hidden'}" id="cfg-sec-account">
              <div class="settings-section-head">
                <div class="settings-label">Cuenta</div>
                <div class="settings-copy">Cuenta individual del docente: Firebase Auth protege el acceso y SQL guarda lo académico.</div>
              </div>
              <label class="settings-field">
                <span class="settings-field-label">Modo de registro/acceso</span>
                <input class="inp" type="text" value="${registrationMode}" readonly>
              </label>
              <div class="settings-actions-list">
                <button class="btn btn-outline btn-sm" type="button" onclick="go('usuarios')">Ir a gestión de usuarios</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="toast('La opción para cambiar contraseña irá aquí después.', 'warn')">Cambiar contraseña</button>
                <button class="btn btn-danger btn-sm" type="button" onclick="logoutAuth()">Cerrar sesión</button>
              </div>
              <div class="settings-section-nav">
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(-1)">Anterior</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="navigateSettingsSection(1)" ${activeIndex===validSections.length-1?'disabled':''}>Siguiente</button>
              </div>
            </section>
          </div>
        </div>
        <div class="settings-page-actions is-hidden" id="settings-save-wrap">
          <div class="settings-dirty-note" id="settings-dirty-note">Cambios sin guardar</div>
          <button class="btn btn-outline btn-lg" type="button" onclick="resetSettingsPanelDraft()">Descartar</button>
          <button class="btn btn-primary btn-lg" type="button" onclick="saveSettingsPanel()">Guardar configuración</button>
        </div>
      </div>
    </div>
  `;
}
RENDERS.settings = function(c) {
  c.innerHTML = renderSettingsPage();
  setupSettingsDirtyTracking();
};

