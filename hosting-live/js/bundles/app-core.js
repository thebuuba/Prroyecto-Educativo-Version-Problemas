/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-bundles.sh
 */

﻿/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   STATE
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
const {
  AVPAL,
  BASIC_INSTRUMENT_META,
  BASIC_INSTRUMENT_TYPES,
  BCOLOR,
  BICON,
  BLOCKS,
  BNAME,
  DEFAULT_ACADEMIC_CALENDAR,
  DEFAULT_PERIODS,
  DEFAULT_SCHOOLS,
  STORAGE_KEY,
  createInitialState,
  defaultBlockCfg,
  emptyGroupCfg,
} = window.EduGestConfig;

let INSTRUMENT_FILTER = 'all';
let INSTRUMENT_LIBRARY_FILTERS = { gradeId:'', type:'', subject:'', periodId:'' };
const INSTRUMENT_DOWNLOAD_MENU = { openId: null, root: null };
const S = createInitialState();
let cloudStateHydrated = false;
let cloudStateUnsubscribe = null;
let isApplyingRemoteCloudState = false;
let suppressCloudStateSave = false;
const AUTH_BOOT_TIMEOUT_MS = 5000;
const AUTH_BOOT_TIMEOUT = Symbol('AUTH_BOOT_TIMEOUT');
const SESSION_STORAGE_KEY = `${STORAGE_KEY}:session`;
const SESSION_PANEL_STATE_KEY = `${STORAGE_KEY}:panel`;
const AUTH_USERS_STORAGE_KEY = `${STORAGE_KEY}:auth_users`;
const USER_WORKSPACE_STORAGE_PREFIX = `${STORAGE_KEY}:workspace:`;
const DEFAULT_AI_BACKEND_URL = 'https://edugest-ndgk.onrender.com';
const APP_RELEASE_TAG = '2026.03';
const BACKUP_SCHEMA_VERSION = 2;
const LICENSE_MODEL_VERSION = '2026-03-24';
const ACCOUNT_MAX_TRUSTED_DEVICES = 3;
const ACCOUNT_MAX_ACTIVE_SESSIONS = 5;
const DASHBOARD_SEARCH_DEBOUNCE_MS = 140;
const PERSIST_DEBOUNCE_MS = 140;
const AUTH_VERIFY_CTX = { email: '', password: '' };
const REGISTER_RATE_LIMIT = {
  key: 'eg_v3:register-rate-limit',
  windowMs: 10 * 60 * 1000,
  maxAttempts: 5,
  blockMs: 15 * 60 * 1000,
};
const TERMS_VERSION = '2026-03-24';
const SIDEBAR_INTERACTION = { closeTimer: null, suppressAutoCloseUntil: 0 };
const SIDEBAR_PERF = { rafId: null };
const PANEL_MOTION = { observer: null, token: 0 };
const INTERACTION_ENHANCEMENTS = {
  initialized: false,
  rippleBound: false,
  quickPaletteBound: false,
  container: null,
  input: null,
  list: null,
  hint: null,
  entries: [],
  filtered: [],
  activeIndex: -1,
};
const SIDEBAR_TIMINGS = {
  expandMs: 220,
  collapseMs: 200,
  pointerLeaveCloseDelayMs: 130,
  focusOutCloseDelayMs: 120,
  reopenGraceMs: 150,
};
let persistDebounceTimer = null;
let persistPending = false;
let attendanceMonthPinned = false;
let panelEnhancementToken = 0;
const STUDENT_ROSTER_CACHE = {
  token: '',
  rosterStudents: new Map(),
};
// Programa tareas no críticas fuera del camino principal para que el render siga ágil aunque haya reparaciones o mejoras pendientes.
const scheduleNonCriticalTask = (() => {
  if (typeof window.requestIdleCallback === 'function') {
    return (task, timeout = 180) => window.requestIdleCallback(() => task(), { timeout });
  }
  return (task) => window.setTimeout(task, 32);
})();
let xlsxLibraryPromise = null;
// Carga la librería XLSX solo cuando alguna exportación la necesita y reutiliza la misma promesa entre llamadas.
function ensureXlsxLibrary() {
  if (typeof window.XLSX !== 'undefined') return Promise.resolve(window.XLSX);
  if (xlsxLibraryPromise) return xlsxLibraryPromise;
  xlsxLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.XLSX !== 'undefined') resolve(window.XLSX);
      else reject(new Error('XLSX no disponible tras cargar el script.'));
    };
    script.onerror = () => reject(new Error('No se pudo cargar el generador XLSX.'));
    document.head.appendChild(script);
  }).catch((error) => {
    xlsxLibraryPromise = null;
    throw error;
  });
  return xlsxLibraryPromise;
}
const STATIC_DOM = {
  navLinks: Array.from(document.querySelectorAll('.sb-link')),
  overlays: Array.from(document.querySelectorAll('.ov')),
  topTitle: document.getElementById('tbt'),
  topSubtitle: document.getElementById('tbs'),
  topContext: document.getElementById('tb-context'),
  topActions: document.getElementById('tb-actions'),
  view: document.getElementById('view'),
};
let schoolSuggestionsCache = '';
const SETUP_FLOW = {
  educationSection: '',
  educationSections: [],
  educationSectionConfirmed: false,
  educationSectionLocked: false,
  educationSectionStep: 'select',
};
const EDUCATION_SECTION_MODAL_CONTEXT = {
  fromAuth: false,
};
const TERMS_ACCEPTANCE_FLOW = {
  openSetupAfterAccept: false,
  revokeOnDecline: false,
};
const DEVICE_VERIFICATION_FLOW = {
  pendingUser: null,
  pendingAfterLogin: false,
  pendingMaskedEmail: '',
  pendingSource: 'login',
};
// Comprueba si la depuración de sesión está activa.
function isSessionDebugEnabled() {
  // Activa trazas de sesión solo cuando el runtime pide depuración explícita.
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('debugSession') === '1') return true;
    const flag = String(window.localStorage.getItem('eg_v3:debug-session') || '').trim();
    return flag === '1' || flag.toLowerCase() === 'true';
  } catch (_) {
    return false;
  }
}
// Escribe una traza breve del flujo de sesión para depuración.
function debugSessionFlow(event, payload = {}) {
  // Emite una traza legible de la sesión para seguir el arranque, hidratación y cierre de usuario.
  if (!isSessionDebugEnabled()) return;
  try {
    console.info(`[EduGest][session-debug] ${event}`, payload);
  } catch (_) {}
}
// Comprueba si la depuración de autenticación está activa.
function isAuthDebugEnabled() {
  // Activa trazas de autenticación solo cuando el navegador mantiene el flag de depuración.
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('debugAuth') === '1') return true;
    const flag = String(window.localStorage.getItem('eg_v3:debug-auth') || '').trim();
    return flag === '1' || flag.toLowerCase() === 'true';
  } catch (_) {
    return false;
  }
}
// Escribe una traza breve del flujo de autenticación para depuración.
function debugAuthFlow(event, payload = {}) {
  // Registra pasos del login para distinguir fallos de Firebase, del storage o del propio panel.
  if (!isAuthDebugEnabled()) return;
  try {
    console.info(`[EduGest][auth-debug] ${event}`, payload);
  } catch (_) {}
}
/**
 * Catálogo Curricular y Temas.
 */
const EDUCATION_SECTIONS = ['Inicial', 'Primaria', 'Secundaria'];
const EDUCATION_THEME_CLASS_BY_SECTION = {
  Inicial: 'edu-level-inicial',
  Primaria: 'edu-level-primaria',
  Secundaria: 'edu-level-secundaria',
};
const EDUCATION_THEME_CLASS_BY_COMBINATION = {
  'Inicial+Primaria': 'edu-level-combo-inicial-primaria',
  'Primaria+Secundaria': 'edu-level-combo-primaria-secundaria',
};
const GRADE_CATALOG_BY_SECTION = {
  Inicial: ['Pre-kinder', 'Kinder', 'Pre-primario'],
  Primaria: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
  Secundaria: [
    '1ro de Secundaria',
    '2do de Secundaria',
    '3ro de Secundaria',
    '4to de Secundaria',
    '5to de Secundaria',
    '6to de Secundaria',
  ],
};

// Encola una reparación diferida del texto ya renderizado.
function queueRenderedTextRepair(...roots) {
  // Repara en diferido textos renderizados con mojibake para no bloquear la pintura inicial del panel.
  const candidates = roots.filter(Boolean);
  if (!candidates.length) return;
  scheduleNonCriticalTask(() => {
    candidates.forEach((root) => repairRenderedText(root));
  });
}

// Normaliza el mensaje visible que se mostrará en un error.
function errorMessage(error, fallback = 'No se pudo completar la acción.') {
  // Resume errores técnicos a un mensaje corto y entendible para mostrarlo en UI o logs.
  if (window.EduGestCloud?.friendlyError) {
    const cloudMessage = String(window.EduGestCloud.friendlyError(error) || '').trim();
    if (cloudMessage) return cloudMessage;
  }
  const directMessage = String(error?.message || '').trim();
  if (directMessage) return directMessage;
  return fallback;
}

// Registra un error, informa al usuario y deja un fallback seguro.
function reportError(context, error, options = {}) {
  // Unifica el registro en consola y el toast visible para que los errores queden trazables para soporte y para el usuario.
  const { fallback = 'No se pudo completar la acción.', tone = 'error' } = options;
  console.error(`[EduGest][${context}]`, error);
  toast(`${errorMessage(error, fallback)}`, tone);
}

// Limpia la caché local de lista de estudiantes.
function resetStudentRosterCache() {
  // Limpia el cache derivado de cursos y grupos cuando cambia el contexto académico activo.
  STUDENT_ROSTER_CACHE.token = '';
  STUDENT_ROSTER_CACHE.rosterStudents = new Map();
}
// Construye la clave de caché usada para la lista de estudiantes.
function buildStudentRosterCacheToken() {
  // Construye una llave corta que identifica el contexto actual del roster.
  const studentSignature = (S.estudiantes || [])
    .map((student) => `${student.id}:${student.courseId || student.sectionId || student.seccionId || ''}:${student.gradeId || ''}`)
    .join('|');
  const sectionSignature = (S.secciones || [])
    .map((section) => `${section.id}:${section.gradeId || ''}:${section.sec || ''}`)
    .join('|');
  return `${S.sessionUserId || ''}::${S.activeEducationSection || ''}::${studentSignature}::${sectionSignature}`;
}
// Restaura el estado persistido y prepara la aplicación para arrancar.
async function hydrate(options = {}) {
  // Hidrata el estado raíz desde almacenamiento local, aplica migraciones y deja listas las estructuras mínimas del panel.
  const skipRootState = options && options.skipRootState === true;
  try {
    const raw = skipRootState ? null : await window.EduGestDB.loadRawState(STORAGE_KEY);
    if (raw) {
      let changed = false;
      const d = JSON.parse(raw);
      const storageHasMojibake = hasMojibakeMarkers(raw);
      const migratedLegacyPeriods = !d.periodGroupConfigs || !d.periodGroupConfigs.P1;
      Object.assign(S, d);
      ensurePeriodsAndYear();
      if (!S.periodGroupConfigs || typeof S.periodGroupConfigs !== 'object') S.periodGroupConfigs = {};
      if (!S.notasByPeriod || typeof S.notasByPeriod !== 'object') S.notasByPeriod = {};
      if (!S.periodGroupConfigs.P1) { S.periodGroupConfigs.P1 = cloneCfg(S.groupConfigs || {}); changed = true; }
      if (!S.notasByPeriod.P1) { S.notasByPeriod.P1 = JSON.parse(JSON.stringify(S.notas || {})); changed = true; }
      if (!S.activePeriodId) { S.activePeriodId = 'P1'; changed = true; }
      const schoolsBefore = Array.isArray(S.schools) ? S.schools.length : 0;
      ensureSchoolCatalog();
      if (S.schools.length !== schoolsBefore) changed = true;
      if (repairUtf8State(S)) changed = true;
      // migrate old block IDs -> fixed IDs B1..B4
      const oldToNew = {com:'B1', res:'B2', eth:'B3', cyt:'B4'};
      if (S.blockCfg && !S.blockCfg.B1) {
        const migrated = {};
        Object.entries(oldToNew).forEach(([oldKey,newKey])=>{
          if (S.blockCfg[oldKey]) migrated[newKey] = S.blockCfg[oldKey];
        });
        S.blockCfg = {...migrated, ...S.blockCfg};
        changed = true;
      }
      // ensure grades and sections hierarchy + migrate flat sections
      if (!Array.isArray(S.grades)) S.grades = [];
      if (!Array.isArray(S.secciones)) S.secciones = [];
      ensureCurriculumCatalogState();
      const gradeByName = {};
      S.grades.forEach(g=>{ gradeByName[g.name]=g; });
      // Analiza analizar grado sección.
      const parseGradeSection = (sec) => {
        const g0 = (sec.grado||sec.name||'').trim();
        const s0 = (sec.sec||'').trim();
        if (g0 && s0) return {grade:g0, section:parseSection(s0)};
        const rawName = `${sec.nombre||''} ${sec.name||''} ${sec.grado||''} ${sec.sec||''}`.trim();
        const m = rawName.match(/(\d+\s*(?:ro|ero|do|to|mo|vo|er)?|primero|segundo|tercero|cuarto|quinto|sexto|septimo|s?ptimo|octavo|noveno|decimo|d?cimo)\s*([A-Z])/i);
        if (m) return {grade:m[1].trim(), section:parseSection(m[2])};
        return {grade:g0||'General', section:parseSection(s0||'A')};
      };
      S.secciones.forEach(sec=>{
        const ps = parseGradeSection(sec);
        let gr = gradeByName[ps.grade];
        if (!gr) {
          gr = {id:uid(), name:ps.grade, gradeLevel: parseGradeLevel(ps.grade), sections:[]};
          gradeByName[ps.grade]=gr;
          S.grades.push(gr);
          changed = true;
        }
        if (!gr.gradeLevel) { gr.gradeLevel = parseGradeLevel(gr.name); changed = true; }
        if (!sec.gradeId) sec.gradeId = gr.id;
        if (!sec.sec) sec.sec = ps.section;
        if (!sec.grado) sec.grado = ps.grade;
        if (!sec.gradeLevel) sec.gradeLevel = parseGradeLevel(sec.grado||gr.name);
        if (!sec.sectionLetter) sec.sectionLetter = parseSection(sec.sec);
        const inferredArea = lessonPlanAreaFromGroup(sec);
        if (!sec.area || (inferredArea && curriculumSubjectUsesOfficialCatalog(sec.materia || '', sec.gradeId || '', sec.grado || '') && normTxt(sec.area) !== normTxt(inferredArea))) {
          sec.area = inferredArea;
        }
        if (!gr.sections.find(s=>s.id===sec.id)) {
          gr.sections.push({id:sec.id, name:sec.sec, sectionLetter:parseSection(sec.sec), materia:sec.materia||'General', area: sec.area || '', room: sec.room || ''});
          changed = true;
        }
      });

      // ensure group configs per section (groupId = sectionId)
      if (!S.groupConfigs || typeof S.groupConfigs!=='object') S.groupConfigs = {};
      const baseCfg = S.blockCfg ? JSON.parse(JSON.stringify(S.blockCfg)) : null;
      S.secciones.forEach(sec=>{
        if (!S.groupConfigs[sec.id]) {
          S.groupConfigs[sec.id] = baseCfg ? JSON.parse(JSON.stringify(baseCfg)) : {
            B1: defaultBlockCfg('B1'), B2: defaultBlockCfg('B2'), B3: defaultBlockCfg('B3'), B4: defaultBlockCfg('B4')
          };
        }
      });

      BLOCKS.forEach(b => {
        if (!S.blockCfg[b]) S.blockCfg[b] = defaultBlockCfg(b);
        if (!Array.isArray(S.blockCfg[b].activities)) S.blockCfg[b].activities = [];
        S.blockCfg[b].activities.forEach(a => {
          if (!Array.isArray(a.instrumentIds)) a.instrumentIds = a.instrumentId ? [a.instrumentId] : [];
          if (!Array.isArray(a.instrumentHistory)) a.instrumentHistory = [];
          if (!('instrumentId' in a)) a.instrumentId = a.instrumentIds[0] || null;
          if (!('desc' in a)) a.desc = '';
          if (!('producto' in a)) a.producto = '';
          if (!('tipo' in a)) a.tipo = '';
        });
      });
      if (!Array.isArray(S.instruments)) S.instruments = [];
      if (!Array.isArray(S.evaluations)) S.evaluations = [];
      if (!Array.isArray(S.authUsers)) S.authUsers = [];
      if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
      if (!('sessionUserId' in S)) S.sessionUserId = null;
      if (!('sessionUserName' in S)) S.sessionUserName = null;
      if (!('sessionStartedAt' in S)) S.sessionStartedAt = null;
      if (!('sessionExpiresAt' in S)) S.sessionExpiresAt = null;
      if (!('currentPage' in S)) S.currentPage = 'dashboard';
      if (!('activityViewMode' in S)) S.activityViewMode = 'blocks';
      if (S.profile && typeof S.profile === 'object') {
        const normalizedSections = normalizeEducationSections(S.profile.educationSections || S.profile.educationSection || '');
        const normalizedSection = normalizedSections[0] || '';
        if (JSON.stringify(normalizedSections) !== JSON.stringify(S.profile.educationSections || [])) {
          S.profile.educationSections = normalizedSections;
          changed = true;
        }
        if (normalizedSection && S.profile.educationSection !== normalizedSection) {
          S.profile.educationSection = normalizedSection;
          changed = true;
        }
        if (S.profile.educationSectionLocked !== false) {
          S.profile.educationSectionLocked = false;
          changed = true;
        }
        if (!S.profile.teachingProfile || typeof S.profile.teachingProfile !== 'object') {
          S.profile.teachingProfile = {
            center: String(S.profile.inst || '').trim(),
            educationLevels: normalizedSections,
            areas: [],
            grades: [],
            subjects: uniqueValues(S.profile.subjects || []),
          };
          changed = true;
        } else {
          const nextLevels = normalizeEducationSections(S.profile.teachingProfile.educationLevels || normalizedSections);
          if (JSON.stringify(nextLevels) !== JSON.stringify(S.profile.teachingProfile.educationLevels || [])) {
            S.profile.teachingProfile.educationLevels = nextLevels;
            changed = true;
          }
        }
        if (!S.profile.accountLicense || typeof S.profile.accountLicense !== 'object' || S.profile.accountLicense.type !== 'individual_teacher') {
          S.profile.accountLicense = {
            type: 'individual_teacher',
            shareAllowed: false,
            maxTrustedDevices: ACCOUNT_MAX_TRUSTED_DEVICES,
            maxActiveSessions: ACCOUNT_MAX_ACTIVE_SESSIONS,
            policyVersion: LICENSE_MODEL_VERSION,
            updatedAt: nowIso(),
          };
          changed = true;
        }
      }
      const browserSession = readBrowserSession();
      if (browserSession?.uid && browserSession.uid === S.sessionUserId) {
        S.sessionUserName = browserSession.name || S.sessionUserName;
        S.sessionStartedAt = browserSession.startedAt || S.sessionStartedAt;
      }
      S.instruments.forEach(i=>{
        if (!i.periodId) { i.periodId = 'P1'; changed = true; }
        if (i.type==='rubrica_analitica') {
          const before = JSON.stringify(i);
          normalizeRubricaInstrument(i);
          if (JSON.stringify(i)!==before) changed = true;
        }
      });
      S.evaluations.forEach(ev=>{
        if (!ev.periodId) { ev.periodId = 'P1'; changed = true; }
        if (!Array.isArray(ev.perCriterion) && ev.values && ev.instrumentId) {
          const inst = S.instruments.find(x=>x.id===ev.instrumentId);
          if (inst?.type==='rubrica_analitica') {
            const calc = evaluateInstrument(inst, ev.values);
            ev.perCriterion = (calc.perCriterion||[]).map(x=>({...x, teacherComment:''}));
            ev.teacherCommentGeneral = ev.teacherCommentGeneral || '';
            if (!('total' in ev)) ev.total = ev.totalScore ?? calc.totalScore ?? 0;
            changed = true;
          }
        } else {
          if (!('teacherCommentGeneral' in ev)) { ev.teacherCommentGeneral = ''; changed = true; }
          if (Array.isArray(ev.perCriterion)) {
            ev.perCriterion.forEach(pc=>{ if (!('teacherComment' in pc)) { pc.teacherComment=''; changed = true; } });
          }
        }
      });
      Object.keys(S.periodGroupConfigs).forEach(pid=>{
        const pg = S.periodGroupConfigs[pid] || {};
        Object.keys(pg).forEach(gid=>{
          BLOCKS.forEach(b=>{
            const acts = pg?.[gid]?.[b]?.activities || [];
            acts.forEach(a=>{
              if (!a.periodId) { a.periodId = pid; changed = true; }
              if (!a.courseId) { a.courseId = gid; changed = true; }
            });
          });
        });
      });

      // ensure students carry gradeId + sectionId
      S.estudiantes.forEach(e=>{
        if (!e.sectionId && e.seccionId) e.sectionId = e.seccionId;
        if (!e.seccionId && e.sectionId) e.seccionId = e.sectionId;
        const sec = S.secciones.find(s=>s.id===e.sectionId);
        if (sec && !e.gradeId) e.gradeId = sec.gradeId;
        if (sec && !e.gradeLevel) { e.gradeLevel = sec.gradeLevel || parseGradeLevel(sec.grado); changed = true; }
      });
      if (ensureStudentDirectory()) changed = true;
      S.evaluations.forEach(ev=>{
        if (!ev.groupId) {
          const st = S.estudiantes.find(s=>s.id===ev.studentId);
          ev.groupId = st?.sectionId || st?.seccionId || null;
        }
      });
      if (!S.activeGroupId || !S.secciones.find(s=>s.id===S.activeGroupId)) {
        S.activeGroupId = sortCourses(getScopedSections())[0]?.id || null;
        changed = true;
      }
      // keep activeCourseId and activeGroupId synchronized
      if (!S.activeCourseId) { S.activeCourseId = S.activeGroupId || null; changed = true; }
      if (S.activeCourseId && S.activeGroupId !== S.activeCourseId) { S.activeGroupId = S.activeCourseId; changed = true; }
      if (migratedLegacyPeriods) {
        S.periodGroupConfigs.P1 = cloneCfg(S.groupConfigs || {});
        S.notasByPeriod.P1 = JSON.parse(JSON.stringify(S.notas || {}));
        changed = true;
      }

      ensurePeriodBuckets(S.activePeriodId);

      migrateDataIfNeeded();

      // ensure active course is valid after repairs
      const firstCourse = sortCourses(getScopedSections())[0]?.id || null;
      const validActive = getScopedSections().find(s=>s.id===S.activeCourseId) ? S.activeCourseId : firstCourse;
      if (S.activeCourseId !== validActive || S.activeGroupId !== validActive) {
        S.activeCourseId = validActive;
        S.activeGroupId = validActive;
        changed = true;
      }
      const contextBefore = `${S.activeGroupId||''}|${S.activeCourseId||''}|${S.activeGradeId||''}`;
      ensureActiveContext();
      if (`${S.activeGroupId||''}|${S.activeCourseId||''}|${S.activeGradeId||''}` !== contextBefore) changed = true;
      ensurePeriodBuckets(S.activePeriodId);
      if (changed) persist();

      console.debug('[EduGest][load]', {
        coursesCount: S.grades.length,
        sectionsCount: S.secciones.length,
        studentsCount: S.estudiantes.length,
        activeCourseId: S.activeCourseId,
        activePeriodId: S.activePeriodId,
        storageHadMojibake: storageHasMojibake
      });
    } else if (skipRootState) {
      debugSessionFlow('hydrate:skip-root-state', {
        reason: 'cloud-auth-enabled',
        browserSessionUid: readBrowserSession()?.uid || null,
      });
    }
    const localAuthUsers = await loadLocalAuthUsers();
    if (localAuthUsers.length) S.authUsers = localAuthUsers;
  } catch(e){}
}

/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   ROUTING
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
let currentPage = 'dashboard';
let navHistoryInitialized = false;
const APP_HISTORY_ROOT = 'edugest-root';
const PANEL_ROUTES = {
  dashboard: '/inicio',
  estudiantes: '/estudiantes',
  actividades: '/actividades',
  config: '/configuracion-actividades',
  matriz: '/matriz-general',
  reportes: '/reportes',
  horario: '/horario-docente',
  ai: '/asistente-ia',
  instrumentos: '/instrumentos',
  calendario: '/calendario-docente',
  planificaciones: '/planificaciones',
  asistencia: '/registro-asistencia',
  usuarios: '/usuarios',
  settings: '/configuracion',
};
const MODAL_ROUTES = {};
const PANEL_BUNDLES = {
  dashboard: 'dashboard',
  estudiantes: 'estudiantes',
  actividades: 'actividades',
  config: 'actividades',
  matriz: 'matriz',
  reportes: 'reportes',
  horario: 'horario',
  ai: 'actividades',
  instrumentos: 'instrumentos',
  calendario: 'horario',
  planificaciones: 'planificaciones',
  asistencia: 'asistencia',
  settings: 'ajustes',
  usuarios: 'shell',
};
const PANEL_BUNDLE_URLS = {
  shell: '/js/bundles/app-shell.js',
  dashboard: '/js/bundles/panel-dashboard.js',
  estudiantes: '/js/bundles/panel-estudiantes.js',
  actividades: '/js/bundles/panel-actividades.js',
  matriz: '/js/bundles/panel-matriz.js',
  reportes: '/js/bundles/panel-reportes.js',
  horario: '/js/bundles/panel-horario.js',
  instrumentos: '/js/bundles/panel-instrumentos.js',
  planificaciones: '/js/bundles/panel-planificaciones.js',
  asistencia: '/js/bundles/panel-asistencia.js',
  ajustes: '/js/bundles/panel-ajustes.js',
};
const loadedPanelBundles = window.__AULABASE_LOADED_BUNDLES || (window.__AULABASE_LOADED_BUNDLES = {});
const pendingPanelBundleLoads = {};
loadedPanelBundles.core = true;

const PAGE = {
  dashboard:   {t:'Inicio',            s:()=> '',
                 a:()=>renderYearPeriodSelector()},
  estudiantes: {t:'Estudiantes',              s:()=>`${studentsInGroup(S.activeGroupId).length} estudiantes en ${getGroupLabel(S.activeGroupId)} - ${periodName()}`,
                 a:()=>withGroupSelector(`<button class="btn btn-outline btn-sm" onclick="go('grade-setup')">+ Grado</button><button class="btn btn-outline btn-sm" onclick="openSecM()">+ Sección</button><button class="btn btn-outline btn-sm" onclick="openBulkEstM()">Carga masiva</button><button class="btn btn-primary btn-sm" onclick="openEstM()">+ Estudiante</button>`)},
  actividades: {t:'Actividades',              s:()=> ACT_VIEW_MODE==='config' ? `Configura bloques, actividades y puntos por grupo - ${periodName()}` : `${totalActs()} actividades configuradas en 4 bloques - ${periodName()}`,
                 a:()=>withGroupSelector(`<button class="btn btn-primary btn-sm" onclick="openM('m-act')">+ Actividad suelta</button>`)},
  config:      {t:'Configuración de actividades', s:()=>`Flexibilidad total - puntos y actividades por bloque - ${periodName()}`,
                 a:()=>withGroupSelector(`<button class="btn btn-outline btn-sm" onclick="openM('m-tpl')">Guardar plantilla</button><button class="btn btn-amber btn-sm" onclick="autoAdjustAll()">Autoajustar todo</button>`)},
  matriz:      {t:'Matriz de calificaciones', s:()=>`${studentsInGroup(S.activeGroupId).length} estudiantes - ${totalActs()} actividades - ${periodName()}`,
                 a:()=>withGroupSelector(`<button class="btn btn-outline btn-sm" onclick="toast('Exportando Excel...')"><img class="btn-doc-icon" src="/assets/icons/logoexcel.png" alt="Excel">Excel</button><button class="btn btn-outline btn-sm" onclick="toast('Generando PDF...')"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">PDF</button>`)},
  instrumentos:{t:'Instrumentos de evaluación', s:()=>`${S.instruments.filter(i=>!i.periodId || i.periodId===S.activePeriodId).length} instrumentos en biblioteca - ${periodName()}`,
                 a:()=>`${renderYearPeriodSelector()}<button class="btn btn-primary btn-sm" onclick="openCreateInstrumentTypePicker()">+ Nuevo instrumento</button>`},
  horario:     {t:'Horario docente', s:()=>`Semana laboral, bloques pedagógicos y carga académica organizada`, a:()=>''},
  calendario:  {t:'Calendario Docente', s:()=>`Agenda escolar, efemérides y recordatorios del centro`, a:()=>''},
  planificaciones:{t:'Planificaciones', s:()=>`${(S.lessonPlans || []).filter((plan) => plan.groupId === S.activeGroupId && (!plan.periodId || plan.periodId === S.activePeriodId)).length} planificación(es) para ${getGroupLabel(S.activeGroupId) || 'el curso activo'} - ${periodName()}`,
                 a:()=>withGroupSelector(`<button class="btn btn-primary btn-sm" type="button" onclick="scrollToLessonPlanComposer()">+ Nueva planificación</button>`)},
  asistencia:  {t:'Registro de Asistencia',     s:()=>`${studentsInGroup(S.activeGroupId).length} estudiantes en ${getGroupLabel(S.activeGroupId) || 'la sección activa'}`, a:()=>''},
  reportes:    {t:'Reportes',      s:()=>`Exportaciones y estadísticas - ${periodName()}`,  a:()=>withGroupSelector('')},
  ai:          {t:'Asistente IA',             s:()=>`Consultas, resúmenes y sugerencias sobre tu panel - ${periodName()}`, a:()=>`<button class="btn btn-outline btn-sm" onclick="seedAiPrompt('Dame un resumen del periodo actual')">Resumen rápido</button>`},
  usuarios:    {t:'Usuarios y Roles',         s:()=>`${S.usuarios.length} usuarios`,
                 a:()=>`<button class="btn btn-primary btn-sm" onclick="openUsrM()">+ Usuario</button>`},
  settings:    {t:'Configuración',            s:()=>`Ajusta perfil, año escolar y período de trabajo`, a:()=>''},
  miperfil:    {t:'Mi Perfil',               s:()=>`Gestiona tu identidad institucional y seguridad - ${periodName()}`, a:()=>`
    <div class="flex gap-4">
      <button class="px-6 py-2.5 rounded-full border border-outline-variant/30 font-bold text-sm text-primary hover:bg-surface-container-low transition-colors">
        Descartar
      </button>
      <button class="px-8 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-all">
        Guardar Cambios
      </button>
    </div>`},
};
// Alias de calendario para conservar la ruta pública antigua sin duplicar la definición visual del panel.
PAGE.calendario = PAGE.horario;

// Devuelve el mes actual en formato YYYY-MM para inicializar calendarios y planificadores dependientes del mes.
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Mantiene el historial del navegador alineado con el panel real para soportar back/forward sin perder contexto.
function syncNavHistory(requestedPage, renderedPage, mode = 'push') {
  // Mantiene el historial del navegador alineado con el panel real para soportar back/forward sin perder contexto.
  const nextUrl = buildPanelUrl(requestedPage, ACT_VIEW_MODE);
  const historyState = {
    eduGestNav: true,
    requestedPage,
    page: renderedPage,
    activityViewMode: ACT_VIEW_MODE,
  };
  if (mode === 'replace') window.history.replaceState(historyState, '', nextUrl);
  else if (`${window.location.pathname}${window.location.search}` !== nextUrl) window.history.pushState(historyState, '', nextUrl);
  else window.history.replaceState(historyState, '', nextUrl);
  navHistoryInitialized = true;
}

// Si la app aterriza sin una raiz propia en history, la crea para no romper la navegacion inicial.
function ensureAppHistoryRoot() {
  // Si la app aterriza sin una raiz propia en history, la crea para no romper la navegacion inicial.
  const state = window.history.state || {};
  if (state?.eduGestRoot) return;
  window.history.replaceState({ eduGestRoot: true, marker: APP_HISTORY_ROOT }, '', window.location.href);
  navHistoryInitialized = false;
}

// Traduce el panel solicitado a una URL estable que luego se comparte entre render, refresh e historial.
function buildPanelUrl(requestedPage, activityViewMode = ACT_VIEW_MODE) {
  // Traduce el panel solicitado a una URL estable que luego se comparte entre render, refresh e historial.
  const pageKey = requestedPage === 'config' || (requestedPage === 'actividades' && activityViewMode === 'config')
    ? 'config'
    : (requestedPage || 'dashboard');
  return PANEL_ROUTES[pageKey] || '/inicio';
}

// Resuelve la URL publica de un modal; si no existe ruta dedicada, cae al panel activo.
function buildModalUrl(id) {
  // Resuelve la URL pública de un modal; si no existe ruta dedicada, cae al panel activo.
  return MODAL_ROUTES[id] || buildPanelUrl(S.currentPage || currentPage || 'dashboard', ACT_VIEW_MODE);
}

// Resuelve qué bundle necesita un panel para poder pintarse cuando la app se carga por páginas separadas.
function resolvePanelBundleKey(pageKey) {
  // Resuelve qué bundle necesita un panel para poder pintarse cuando la app se carga por páginas separadas.
  return PANEL_BUNDLES[pageKey] || null;
}

// Construye la URL versionada del bundle para permitir cargas perezosas sin pelear con el caché del navegador.
function buildPanelBundleUrl(bundleKey) {
  // Construye la URL versionada del bundle para permitir cargas perezosas sin pelear con el caché del navegador.
  const baseUrl = PANEL_BUNDLE_URLS[bundleKey];
  if (!baseUrl) return '';
  const assetVersion = window.__AULABASE_ASSET_VERSION ? `?v=${encodeURIComponent(window.__AULABASE_ASSET_VERSION)}` : '';
  return `${baseUrl}${assetVersion}`;
}

// Carga una sola vez el archivo JS del panel solicitado y reutiliza la misma promesa si varias rutas lo piden a la vez.
function ensurePanelBundleLoaded(pageKey) {
  // Carga una sola vez el archivo JS del panel solicitado y reutiliza la misma promesa si varias rutas lo piden a la vez.
  const bundleKey = resolvePanelBundleKey(pageKey);
  if (!bundleKey) return Promise.resolve(Boolean(RENDERS[pageKey]));
  if (loadedPanelBundles[bundleKey]) return Promise.resolve(true);
  if (pendingPanelBundleLoads[bundleKey]) return pendingPanelBundleLoads[bundleKey];
  const bundleUrl = buildPanelBundleUrl(bundleKey);
  if (!bundleUrl) return Promise.resolve(Boolean(RENDERS[pageKey]));
  pendingPanelBundleLoads[bundleKey] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = bundleUrl;
    script.async = false;
    script.dataset.aulabaseBundle = bundleKey;
    script.onload = () => {
      loadedPanelBundles[bundleKey] = true;
      delete pendingPanelBundleLoads[bundleKey];
      resolve(true);
    };
    script.onerror = () => {
      delete pendingPanelBundleLoads[bundleKey];
      reject(new Error(`No se pudo cargar el bundle del panel ${bundleKey}`));
    };
    document.body.appendChild(script);
  });
  return pendingPanelBundleLoads[bundleKey];
}

// Construye una tarjeta de error más explícita para que el usuario y el depurador sepan qué panel falló y por qué.
function renderPanelErrorCard(pageKey, error, extra = {}) {
  const requestedPage = extra.requestedPage || S.currentPage || currentPage || 'dashboard';
  const route = PANEL_ROUTES[requestedPage] || window.location.pathname || '/inicio';
  const detail = error?.message || String(error || 'Error desconocido');
  const stack = String(error?.stack || '').trim();
  const panelLabel = PAGE[pageKey]?.t || pageKey || 'Desconocido';
  const routeLabel = `${requestedPage}${route && route !== requestedPage ? ` · ${route}` : ''}`;
  return `
    <div class="card">
      <div class="empty" style="align-items:flex-start;text-align:left;gap:10px;">
        <div class="et">No se pudo abrir este panel</div>
        <div class="es"><strong>Panel:</strong> ${escapeHtml(panelLabel)}<br><strong>Ruta:</strong> ${escapeHtml(routeLabel)}<br><strong>Error:</strong> ${escapeHtml(detail)}</div>
        ${stack ? `<details style="margin-top:8px;width:100%;"><summary style="cursor:pointer;font-weight:700;color:var(--mute);">Ver detalle técnico</summary><pre style="white-space:pre-wrap;overflow:auto;max-height:220px;margin:8px 0 0;color:var(--mute);font-size:12px;line-height:1.4;">${escapeHtml(stack)}</pre></details>` : ''}
      </div>
    </div>`;
}

// Comprueba si la interfaz puede animar transiciones.
function canAnimateUiMotion() {
  // Decide si el runtime permite animaciones globales según preferencias y entorno.
  if (S.preferences?.animations === false) return false;
  if (document.body.classList.contains('pref-reduce-motion')) return false;
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}
// Escapa texto para renderizarlo como HTML seguro.
function escapeHtml(value) {
  // Escapa texto plano antes de inyectarlo en HTML para evitar romper el DOM o mezclar markup.
  const text = fixMojibakeText(String(value == null ? '' : value));
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// Comprueba si editable target.
function isEditableTarget(el) {
  // Detecta si el evento ocurrió sobre un campo editable para no interceptar navegación ni atajos.
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
// Lee pathname y hash para reconstruir el panel o modal que el usuario esperaba abrir al cargar la app.
function readPanelLocation() {
  // Lee pathname y hash para reconstruir el panel o modal que el usuario esperaba abrir al cargar la app.
  let path = String(window.location.pathname || '/').trim();
  path = path.replace(/\/index\.html$/i, '');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (!path) path = '/';
  const modalEntry = Object.entries(MODAL_ROUTES).find(([, route]) => route === path);
  if (modalEntry) {
    return {
      requestedPage: S.currentPage || currentPage || 'dashboard',
      activityViewMode: ['blocks','matrix','config'].includes(S.activityViewMode) ? S.activityViewMode : ACT_VIEW_MODE,
      modalId: modalEntry[0],
    };
  }
  const entry = Object.entries(PANEL_ROUTES).find(([, route]) => route === path);
  if (entry) {
    const [requestedPage] = entry;
    return {
      requestedPage,
      activityViewMode: requestedPage === 'config' ? 'config' : (requestedPage === 'actividades' ? 'blocks' : null),
    };
  }
  const rawHash = String(window.location.hash || '').replace(/^#/, '').trim();
  if (rawHash === 'config') return { requestedPage: 'config', activityViewMode: 'config' };
  if (PAGE[rawHash]) return { requestedPage: rawHash, activityViewMode: rawHash === 'actividades' ? 'blocks' : null };
  return null;
}

// Coordina el cambio de panel: valida salidas, sincroniza estado global, actualiza historial y renderiza la vista.
function go(p, options = {}) {
  // Ruta única de navegación: resuelve panel, sincroniza historia, carga bundles y dispara el render.
  document.body.classList.toggle('miperfil-active', p === 'miperfil');
  applyEducationSectionTheme();
  if (enforceMandatoryEducationSelection()) return;
  const { fromHistory = false, historyMode = 'push', activityViewMode = null, animatePanelTransition = false } = options;
  const previousRenderedPage = currentPage;
  const requestedPage = p;
  let nextPage = p;
  const leavingLessonPlanEditor = currentPage === 'planificaciones' && requestedPage !== 'planificaciones' && lessonPlanUiMode() === 'editor';
  if (leavingLessonPlanEditor) {
    lessonPlanFlushPendingAutosave();
    lessonPlanSetMode('home');
    persist({ immediate: true });
  }
  if (nextPage === 'config') nextPage = 'actividades';
  if (!canLeaveSettingsPage(nextPage)) {
    if (fromHistory) syncNavHistory(S.currentPage || currentPage || 'settings', currentPage || 'settings', 'replace');
    return;
  }
  if (activityViewMode && ['blocks', 'matrix', 'config'].includes(activityViewMode)) {
    ACT_VIEW_MODE = activityViewMode;
  }
  if (p === 'config') {
    ACT_VIEW_MODE = 'config';
    p = 'actividades';
  } else if (!activityViewMode && p === 'actividades' && ACT_VIEW_MODE === 'config') {
    ACT_VIEW_MODE = 'blocks';
  }
  currentPage = p;
  setActivePanelContext(p);
  const shouldPersistPageState = S.currentPage !== requestedPage || S.activityViewMode !== ACT_VIEW_MODE;
  S.currentPage = requestedPage;
  S.activityViewMode = ACT_VIEW_MODE;
  if (shouldPersistPageState) persistPanelSessionState();
  if (!fromHistory) syncNavHistory(requestedPage, p, historyMode);
  syncSidebarNavState(p);
  const cfg = PAGE[p] || {t:p, s:()=>'', a:()=>''};
  const topActions = STATIC_DOM.topActions;
  const view = STATIC_DOM.view;
  if (STATIC_DOM.topTitle) STATIC_DOM.topTitle.textContent = pageTitleWithContext(p, cfg.t);
  if (STATIC_DOM.topSubtitle) STATIC_DOM.topSubtitle.textContent = topbarContext();
  if (STATIC_DOM.topContext) STATIC_DOM.topContext.innerHTML = '';
  if (!topActions || !view) return;
  topActions.innerHTML = '';
  const shouldDeferPanelRender = p === 'asistencia' || previousRenderedPage === 'asistencia';
  // Renderiza renderizar panel.
  const renderPanel = async () => {
    if (p !== currentPage) return;
    try {
      if (!RENDERS[p]) {
        await ensurePanelBundleLoaded(p);
      }
      if (p !== currentPage) return;
      if (RENDERS[p]) RENDERS[p](view);
      else view.innerHTML = `<div class="card"><div class="empty"><div class="et">Panel no disponible</div><div class="es">Este apartado todavía no tiene contenido.</div></div></div>`;
      injectPanelContextControls(view);
      if (animatePanelTransition) {
        view.classList.remove('is-panel-transition');
        void view.offsetWidth;
        view.classList.add('is-panel-transition');
      } else {
        view.classList.remove('is-panel-transition');
      }
      enhancePanelMotion(view);
      const enhancementToken = ++panelEnhancementToken;
      scheduleNonCriticalTask(() => {
        if (enhancementToken !== panelEnhancementToken) return;
        if (p !== currentPage) return;
        if (p === 'asistencia') {
          enableWritingAssist(topActions);
          enableAttendanceWritingAssist(view);
          queueRenderedTextRepair(topActions);
        } else {
          enableWritingAssist(topActions, view);
          queueRenderedTextRepair(topActions, view);
        }
      });
    } catch (error) {
      console.error('[EduGest][nav] Error al renderizar el panel', p, error);
      view.innerHTML = renderPanelErrorCard(p, error, { requestedPage: S.currentPage || currentPage || p });
      toast('No se pudo abrir este panel. Revisa la consola.', true);
    }
  };
  if (shouldDeferPanelRender) {
    view.innerHTML = `<div class="panel-loading-shell"><div class="panel-loading-card">Cargando apartado...</div></div>`;
    window.requestAnimationFrame(() => { renderPanel(); });
  } else {
    renderPanel();
  }
}

// Sincroniza el estado visual de la navegación lateral.
function syncSidebarNavState(activePage) {
  // Marca visualmente la opción activa del sidebar y del header para que el usuario vea su contexto.
  STATIC_DOM.navLinks.forEach((el) => {
    const isActive = el.dataset.p === activePage;
    el.classList.toggle('on', isActive);
    if (isActive) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
}

// Refresca el encabezado superior y sus contadores visibles.
function refreshTop() {
  // Refresca la cabecera superior con el contexto académico y del usuario que esté activo.
  applyEducationSectionTheme();
  const cfg = PAGE[currentPage];
  if (!cfg) return;
  if (STATIC_DOM.topTitle) STATIC_DOM.topTitle.textContent = pageTitleWithContext(currentPage, cfg.t);
  if (STATIC_DOM.topSubtitle) STATIC_DOM.topSubtitle.textContent = topbarContext();
  if (STATIC_DOM.topContext) STATIC_DOM.topContext.innerHTML = '';
  if (STATIC_DOM.topActions) STATIC_DOM.topActions.innerHTML = '';
  if (STATIC_DOM.view) injectPanelContextControls(STATIC_DOM.view);
}

/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   HELPERS
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Genera un identificador único corto.
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
// Lee el valor de un campo por su id.
function v(id)  { return (document.getElementById(id)?.value || '').trim(); }
// Normaliza la definición base del calendario académico.
function normalizeAcademicCalendar(input) {
  // Normaliza el calendario académico para que llegue a la app con una forma predecible.
  const base = JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CALENDAR));
  const next = input && typeof input === 'object' ? JSON.parse(JSON.stringify(input)) : {};
  const rawPeriods = Array.isArray(next.periods) && next.periods.length ? next.periods : base.periods;
  const periods = rawPeriods
    .map((period, index) => {
      const months = Array.isArray(period?.months) ? period.months : [];
      const cleanMonths = months
        .map((value) => parseInt(value, 10))
        .filter((value, monthIndex, list) => value >= 1 && value <= 12 && list.indexOf(value) === monthIndex);
      return {
        id: String(period?.id || base.periods[index]?.id || `P${index + 1}`),
        name: String(period?.name || base.periods[index]?.name || `Periodo ${index + 1}`),
        order: Number.isFinite(parseInt(period?.order, 10)) ? parseInt(period.order, 10) : (index + 1),
        months: cleanMonths.length ? cleanMonths : [...(base.periods[index]?.months || [])],
      };
    })
    .sort((a, b) => (a.order || 99) - (b.order || 99));
  // Gestiona activo meses.
  const activeMonths = (Array.isArray(next.activeMonths) ? next.activeMonths : periods.flatMap((period) => period.months))
    .map((value) => parseInt(value, 10))
    .filter((value, index, list) => value >= 1 && value <= 12 && list.indexOf(value) === index);
  return {
    country: String(next.country || base.country || 'DO'),
    activeMonths: activeMonths.length ? activeMonths : [...base.activeMonths],
    periods: periods.length ? periods : JSON.parse(JSON.stringify(base.periods)),
  };
}
// Normaliza el calendario académico y alinea periodos/periodo activo con esa versión estable.
function ensureAcademicCalendar() {
  const calendar = normalizeAcademicCalendar(S.academicCalendar);
  S.academicCalendar = calendar;
  const nextPeriods = calendar.periods.map((period) => ({ id: period.id, name: period.name, order: period.order }));
  S.periods = JSON.parse(JSON.stringify(nextPeriods.length ? nextPeriods : DEFAULT_PERIODS));
  if (!S.activePeriodId || !S.periods.find((period) => period.id === S.activePeriodId)) {
    S.activePeriodId = S.periods[0]?.id || 'P1';
  }
  return calendar;
}
// Devuelve los períodos del calendario académico.
function academicCalendarPeriods() {
  // Devuelve los periodos del calendario normalizados y listos para ser usados por los paneles.
  return ensureAcademicCalendar().periods;
}
// Devuelve los meses activos del calendario académico.
function academicCalendarActiveMonths() {
  // Calcula los meses activos del calendario para la vista y los filtros derivados.
  return ensureAcademicCalendar().activeMonths;
}
// Resuelve la definición de un período académico.
function academicPeriodDefinition(periodId = S.activePeriodId) {
  // Resuelve la definición completa del periodo activo para reutilizarla en horario, dashboard y reportes.
  return academicCalendarPeriods().find((period) => period.id === periodId) || null;
}
const LESSON_PLAN_RESOURCE_PRESETS = [
  'Pizarra',
  'Cuaderno',
  'Lápiz',
  'Marcadores',
  'Borrador',
  'Libro de texto',
  'Guía impresa',
  'Imágenes',
  'Diapositivas',
  'Video',
  'Simulador',
  'Computadora',
  'Televisor',
  'Internet',
];
const LESSON_PLAN_TRANSVERSAL_AXES = [
  {
    value: 'Educación ambiental y desarrollo sostenible',
    description: 'Promueve el cuidado del medio ambiente y el uso responsable de los recursos.',
  },
  {
    value: 'Educación en valores y ciudadanía',
    description: 'Fomenta el respeto, la responsabilidad y la convivencia.',
  },
  {
    value: 'Educación para la democracia y la convivencia',
    description: 'Promueve el diálogo, la participación y la resolución pacífica de conflictos.',
  },
  {
    value: 'Educación para la salud y el bienestar',
    description: 'Favorece hábitos de vida saludable y cuidado integral de la persona.',
  },
  {
    value: 'Educación para el trabajo y la productividad',
    description: 'Desarrolla responsabilidad, compromiso y valoración del trabajo.',
  },
  {
    value: 'Educación en igualdad y equidad de género',
    description: 'Promueve el respeto, la inclusión y la equidad entre las personas.',
  },
];
const LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS = [
  'Competencia comunicativa',
  'Competencia de pensamiento lógico, creativo y crítico',
  'Competencia de resolución de problemas',
  'Competencia ética y ciudadana',
  'Competencia científica y tecnológica',
  'Competencia ambiental y de la salud',
  'Competencia de desarrollo personal y espiritual',
];
const LENGUA_ESPANOLA_SECONDARY_SPECIFIC_COMPETENCIES = {
  '1ro': {
    'Competencia comunicativa': 'Se comunica con claridad en diferentes contextos, siguiendo los procesos de comprensión y producción oral y escrita, con creatividad, al emplear adecuadamente un tipo de texto (funcional o literario), las TIC, así como otros recursos y medios.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Utiliza secuencias argumentativas (hechos, ejemplos, analogías, argumentos y contra argumentos), en discursos orales y escritos, creando nuevos conocimientos a partir de procesos de comprensión y producción de textos orales y escritos abordados con temas y problemas sociales de su realidad.',
    'Competencia de resolución de problemas': 'Identifica problemas de su vida estudiantil o cotidiana a través de un tipo de texto específico y apropiado, como punto de partida para su estudio y solución.',
    'Competencia ética y ciudadana': 'Analiza textos variados de manera oral o escrita que ponen de relieve hechos y tradiciones históricas relevantes, identificando nuevas relaciones sociales al reconocer y valorar el patrimonio natural y sociocultural dominicano.',
    'Competencia científica y tecnológica': 'Demuestra conocimiento de procesos investigativos científicos sencillos y del uso de tecnología de acuerdo con su grado, a través de textos científicos y especialmente los de secuencia expositivo-explicativa.',
    'Competencia ambiental y de la salud': 'Explica con claridad situaciones sobre salud, medioambiente y la comunidad, mediante textos de diferentes secuencias y géneros, a través de herramientas tecnológicas y otros medios y recursos.',
    'Competencia de desarrollo personal y espiritual': 'Demuestra conocimiento y comprensión de sí mismo y de los demás al expresar su percepción del mundo, a partir de un tipo de texto favorable a las situaciones y a las personas.',
  },
  '2do': {
    'Competencia comunicativa': 'Comunica sus ideas y experiencias en diferentes situaciones, mediante un género textual (funcional o literario) abordado desde la comprensión y producción oral y escrita, mostrando creatividad y destrezas en el uso de la lengua, utilizando medios y recursos tecnológicos y de otros tipos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Produce textos orales y escritos variados a partir de inferencias de comprensión y producción textual, demostrando un pensamiento estructurado, derivando en conclusiones razonables y lógicas.',
    'Competencia de resolución de problemas': 'Utiliza textos específicos variados (orales y escritos) que apoyan el desarrollo de una investigación de carácter científico, seleccionando información con criterios de relevancia, pertinencia, validez y confiabilidad.',
    'Competencia ética y ciudadana': 'Usa textos variados de secuencia argumentativa, con los que conoce y cuestiona prácticas sociales de ciudadanía en el entorno local, nacional e internacional, confrontándolas con los valores universales en discursos analíticos y propositivos.',
    'Competencia científica y tecnológica': 'Utiliza textos de secuencia expositiva-explicativa de manera oral y escrita, en la divulgación de hallazgos científicos y sociales, así como de los avances tecnológicos a lo largo del tiempo, haciendo uso de variadas herramientas que proporcionan las tecnologías de la información y la comunicación (TIC).',
    'Competencia ambiental y de la salud': 'Usa textos diversos en la divulgación y promoción de situaciones de salud y ambiente, abordando temas y problemas de actualidad, mediante el uso de herramientas tecnológicas, entre otras.',
    'Competencia de desarrollo personal y espiritual': 'Utiliza textos literarios como manifestación de la lengua y recurso para promover valores universales y fortalecer la dimensión humanista.',
  },
  '3ro': {
    'Competencia comunicativa': 'Demuestra dominio, desenvolvimiento y creatividad al comunicarse eficazmente de manera personal y colectiva en su entorno familiar, escolar y de la comunidad, utilizando un género textual (funcional o literario), a partir de la comprensión y producción oral y escrita, la utilización responsable de las TIC y demás medios.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Demuestra la validez de las informaciones sostenidas en los juicios, puntos de vista, conclusiones, acciones y pensamientos que construye, usando un género textual que respete la diversidad de opiniones.',
    'Competencia de resolución de problemas': 'Presenta resultados de investigaciones a través de textos específicos, orales y escritos, como ensayos o informes, que evidencian la solución de problemas en contextos determinados, con una postura de criticidad, valoración y respeto a los datos citados.',
    'Competencia ética y ciudadana': 'Produce textos en la elaboración de proyectos encaminados a la construcción de una ciudadanía responsable, abierta e inclusiva que busca soluciones colectivas a los problemas sociales.',
    'Competencia científica y tecnológica': 'Expone investigaciones científicas sencillas que realiza, apoyándose en el uso de textos de secuencia expositiva-explicativa y en actos de intercomunicación que se desarrollan en la escuela y otros contextos, tomando en cuenta su conocimiento en la utilización de variadas herramientas tecnológicas con que cuenta.',
    'Competencia ambiental y de la salud': 'Promueve comportamientos y valores sobre la conservación de la salud, de la naturaleza y sus ecosistemas, mediante el uso de textos variados y a través del desarrollo de actividades de intercomunicación en diferentes contextos de la comunidad.',
    'Competencia de desarrollo personal y espiritual': 'Valora y promueve el uso de la lengua oral y escrita al realizar lecturas y escrituras reflexivas, canalizando emociones y sentimientos, hacia el fortalecimiento de las relaciones humanas y el respeto a la dignidad.',
  },
  '4to': {
    'Competencia comunicativa': 'Emplea adecuadamente un género textual, siguiendo los procesos de comprensión y producción oral y escrita con creatividad, así como el uso de las TIC y otros recursos y medios, al comunicarse en diferentes contextos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Usa secuencias argumentativas (hechos, ejemplos, analogías, argumentos y contraargumentos), en discursos orales y escritos, abordados con temas sociales de su realidad y fuera de esta.',
    'Competencia de resolución de problemas': 'Describe problemas de su vida estudiantil, familiar y social, utilizando un tipo de texto como el informe de investigación, en el punto de partida para su estudio y aporte de posibles soluciones.',
    'Competencia ética y ciudadana': 'Sintetiza a través de textos variados relaciones socioculturales de entornos diversos, valorando las propiedades naturales que ponen de relieve hechos y tradiciones históricas.',
    'Competencia científica y tecnológica': 'Explica conocimientos de procesos investigativos científicos y del uso de tecnología, a través de textos de secuencia expositiva-explicativa, acorde con su grado y las necesidades contextuales.',
    'Competencia ambiental y de la salud': 'Manifiesta conocimientos y experiencia sobre situaciones relacionadas con salud, medioambiente y la comunidad, mediante textos de secuencias y géneros variados, a través de herramientas tecnológicas y otros medios y recursos.',
    'Competencia de desarrollo personal y espiritual': 'Evidencia conocimiento y comprensión de sí mismo y de los demás, expresando su percepción del mundo, mediante un tipo de texto adecuado a las situaciones personales y sociales.',
  },
  '5to': {
    'Competencia comunicativa': 'Muestra destrezas lingüísticas al exponer ideas y experiencias en diferentes situaciones de comunicación social, mediante un tipo de texto (funcional o literario) conveniente desde la comprensión y producción oral y escrita, usando medios y recursos diversos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Analiza textos variados a partir de inferencias, demostrando un pensamiento estructurado que le lleva a conclusiones razonables y lógicas en diferentes contextos.',
    'Competencia de resolución de problemas': 'Selecciona textos específicos que apoyan el desarrollo de una investigación científica, siguiendo criterios de relevancia, pertinencia, validez y confiabilidad para la solución de problemas.',
    'Competencia ética y ciudadana': 'Emplea diversidad de textos de secuencia argumentativa, con los que conoce y cuestiona las prácticas sociales de ciudadanía en el entorno local y nacional, confrontándolas con valores universales.',
    'Competencia científica y tecnológica': 'Divulga a través de textos de secuencia expositiva-explicativa hallazgos científicos, sociales y tecnológicos a lo largo del tiempo, para aportar soluciones a problemas de diferentes contextos.',
    'Competencia ambiental y de la salud': 'Publica informaciones sobre temas relacionados con salud y medio ambiente, a través de textos como catálogo, receta, artículos de opinión e instructivos, en el ámbito escolar y comunitario, haciendo uso de herramientas tecnológicas, entre otras.',
    'Competencia de desarrollo personal y espiritual': 'Utiliza textos literarios y de otros tipos, para manifestar sus sentimientos, emociones e inquietudes en la promoción de valores universales y fortalecer la dimensión humanista.',
  },
  '6to': {
    'Competencia comunicativa': 'Exhibe desenvolvimiento y creatividad al comunicarse eficazmente de manera personal y colectiva, utilizando un modelo textual, a partir de la comprensión y producción, con uso ético y responsable de plataformas tecnológicas y diferentes medios y recursos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Expone la validez de informaciones diversas sostenidas en juicios, puntos de vista, conclusiones y acciones, usando un género textual conveniente, respetando las demás opiniones.',
    'Competencia de resolución de problemas': 'Presenta resultados de investigaciones a través de textos convenientes que evidencian soluciones de problemas, tomando en cuenta la audiencia y manifestando postura crítica, valorativa y de respeto frente a lo que se lee, escucha y escribe.',
    'Competencia ética y ciudadana': 'Usa textos de secuencia argumentativa en la elaboración de proyectos como elemento clave, hacia la construcción de una ciudadanía responsable y dinámica que busca solución de problemas colectivos.',
    'Competencia científica y tecnológica': 'Explica resultados de investigaciones que realiza, apoyándose en el uso de textos de secuencia expositiva-explicativa, en actos de intercomunicación que se desarrollan en la escuela y otro contexto, utilizando herramientas tecnológicas y otros recursos.',
    'Competencia ambiental y de la salud': 'Utiliza sus conocimientos en la promoción y divulgación de comportamientos y valores sobre la conservación de la salud, la naturaleza y sus ecosistemas, mediante el uso de textos y a través de actividades de intercomunicación en diferentes contextos de la comunidad, apoyados en recursos variados.',
    'Competencia de desarrollo personal y espiritual': 'Canaliza emociones y sentimientos en lecturas y escrituras reflexivas, a través de un tipo de texto conveniente, fortaleciendo las relaciones humanas y el respeto a la dignidad propia y de otras personas.',
  },
};

const SECONDARY_CURRICULUM_GRADE_KEYS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
const OFFICIAL_CURRICULUM_SPECIFIC_COMPETENCY_REGISTRY = {
  Secundaria: SECONDARY_CURRICULUM_GRADE_KEYS.reduce((acc, gradeKey) => {
    acc[gradeKey] = {
      'Lengua Española': {
        'Lengua Española': { ...(LENGUA_ESPANOLA_SECONDARY_SPECIFIC_COMPETENCIES[gradeKey] || {}) },
      },
    };
    return acc;
  }, {}),
};

const LESSON_PLAN_ACTIVITY_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'pareja', label: 'Pareja' },
  { value: 'grupal', label: 'Grupal' },
  { value: 'plenario', label: 'Plenario' },
];
const LESSON_PLAN_CLASS_DURATION_OPTIONS = [
  { value: '1', label: '1 hora de clase' },
  { value: '2', label: '2 horas de clase' },
];
const LESSON_PLAN_INSTRUMENT_TYPE_OPTIONS = [
  { value: 'rubrica_analitica', label: 'Rúbrica' },
  { value: 'lista_cotejo_a', label: 'Lista de cotejo' },
  { value: 'lista_cotejo_b', label: 'Lista ponderada' },
  { value: 'escala_estimativa', label: 'Escala estimativa' },
];
const LESSON_PLAN_TECHNIQUE_OPTIONS = [
  'Observación directa',
  'Producción escrita',
  'Exposición',
  'Resolución de ejercicios',
  'Debate guiado',
  'Práctica de laboratorio',
  'Mapa conceptual',
  'Cuadro comparativo',
];
const LESSON_PLAN_BLOCK_LABELS = {
  B1: 'Comunicativa',
  B2: 'Pensamiento lógico, creativo y crítico / Resolución de problemas',
  B3: 'Ética y ciudadanía / Desarrollo personal y espiritual',
  B4: 'Científica y tecnológica / Ambiental y de la salud',
};
const LESSON_PLAN_CURRICULUM_PRESETS = {
  fundamentalCompetencies: LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS,
  specificCompetencies: ['Explica fenómenos', 'Argumenta con evidencia', 'Aplica procedimientos', 'Trabaja de forma colaborativa'],
  conceptualContents: ['Conceptos clave del tema', 'Definiciones básicas', 'Características principales', 'Relación entre conceptos'],
  proceduralContents: ['Observación guiada', 'Análisis de casos', 'Resolución de ejercicios', 'Socialización de hallazgos'],
  attitudinalContents: ['Respeto por las ideas', 'Responsabilidad', 'Trabajo en equipo', 'Cuidado del entorno'],
  indicators: ['Identifica conceptos esenciales', 'Explica con sus palabras', 'Aplica lo aprendido en una actividad', 'Participa activamente'],
};
const LESSON_PLAN_CONCEPTUAL_CATALOG = {
  'Lengua Española': {
    '1ro': [
      { topic: 'La noticia', subtopics: ['Función y estructura', 'Interrogantes', 'Elementos que hacen que un hecho sea noticia', 'Conectores de orden y temporales', 'Modo y tiempos verbales', 'Sinónimos', 'La puntuación', 'Siglas, abreviaturas y acrónimos', 'Elementos paratextuales'] },
      { topic: 'La guía turística', subtopics: ['Estructura', 'Estructura (portada, información, imágenes y cierre)', 'Características: apariencia, estímulos, atractivos y contenido', 'Sustantivos abstractos (alegría, laboriosidad, servicio, etc.)', 'Sustantivos propios y comunes de lugares', 'Adjetivos calificativos y determinativos', 'Vocabulario atractivo y persuasivo', 'Verbos en presente de indicativo', 'Oraciones exclamativas', 'Oraciones interrogativas', 'Sintagma nominal (núcleo, modificador directo y modificador indirecto)', 'Información gráfica (mapas, gráficos, dibujos, fotografías)'] },
      { topic: 'El informe de lectura', subtopics: ['Función', 'Estructura (título del informe, introducción, desarrollo, conclusión)', 'El resumen como estrategia', 'Pasos para realizar un resumen', 'Adjetivos', 'Verbos en presente y en pasado de indicativo', 'Conectores de ejemplificación'] },
      { topic: 'El afiche', subtopics: ['Función y estructura', 'El afiche como texto argumentativo', 'Situación comunicativa', 'Recursos poéticos: metáforas, pleonasmos, elipsis, exageración', 'Argumentos para convencer', 'El imperativo', 'Lo connotativo expresivo', 'Palabras y frases de prevención o alerta', 'Verbos y perífrasis de obligación o posibilidad'] },
      { topic: 'El cuento policíaco y detectivesco', subtopics: ['Función y estructura', 'Características: el ambiente, la trama y los personajes', 'El narrador', 'Recursos lingüísticos y literarios', 'Los actantes', 'Verbo en pretérito indefinido y en pretérito imperfecto del indicativo', 'Adverbios de tiempo y espacio', 'Adjetivos', 'Conectores, coordinantes y de consecuencia'] },
      { topic: 'El caligrama', subtopics: ['Función y estructura', 'La tipografía, caligrafía', 'Imagen visual', 'El tema del poema', 'El verso libre', 'Figuras literarias: epíteto, anáfora, comparación, personificación y metáfora', 'Sustantivos', 'Adjetivos', 'Descripciones'] },
    ],
    '2do': [
      { topic: 'La noticia', subtopics: ['Función y estructura', 'Interrogantes en la noticia', 'Características de la noticia', 'Elementos que hacen un hecho sea noticia', 'Oraciones coordinadas y subordinadas', 'Elementos paratextuales', 'Sinónimos', 'Tiempos verbales: pretérito perfecto simple y pretérito pluscuamperfecto', 'Las oraciones, los párrafos en el texto'] },
      { topic: 'La guía turística', subtopics: ['Función y estructura', 'Características: apariencia, estímulos, atractivo y contenido', 'Sustantivos propios, comunes, abstractos', 'Verbos en presente de indicativo', 'Oraciones exclamativas, interrogativas', 'Conectores espaciales', 'Adjetivos: calificativos y determinativos', 'Vocabulario adecuado', 'Atractivo y persuasivo', 'Información gráfica', 'Los signos auxiliares'] },
      { topic: 'El artículo expositivo', subtopics: ['Función y estructura', 'Modo de organización problema-solución', 'Verbos en presente del modo indicativo', 'Oraciones interrogativas', 'El párrafo', 'Idea principal y secundaria', 'El adjetivo', 'La concordancia', 'Pronombres demostrativos', 'Conectores de causa, efecto, finalidad y contraste', 'Construcciones comparativas'] },
      { topic: 'El informe de lectura', subtopics: ['Función y estructura', 'El resumen como estrategia de comprensión', 'El párrafo', 'Estructura y características', 'La oración temática', 'Verbos en presente, pretérito perfecto simple, pretérito imperfecto del modo indicativo', 'Resumen del texto literario'] },
      { topic: 'El cuento de amor y amistad', subtopics: ['Función y estructura', 'Autores de cuentos de amor: Emilia Pardo Bazán, Oscar Wilde, Rafael Altamira, Horacio Quiroga, Borja Rodríguez Gutiérrez, Juan Ruiz', 'Arcipreste de Hita, y otros', 'Elementos del cuento', 'El tiempo presente y el pretérito imperfecto del modo indicativo', 'El tiempo presente y el pretérito imperfecto del modo subjuntivo', 'Recursos literarios: comparación, metáfora, epíteto', 'Adjetivos', 'El diálogo de estilo directo e indirecto'] },
      { topic: 'La décima espinela', subtopics: ['Función y estructura', 'Verso octosílabo', 'Figuras literarias', 'Interjecciones y exclamaciones'] },
    ],
    '3ro': [
      { topic: 'La entrevista', subtopics: ['Función y estructura', 'Roles de los/as participantes', 'Tipos de entrevista: según el objetivo y la modalidad', 'Oraciones interrogativas', 'Los pronombres interrogativos y exclamativos', 'El registro formal e informal', 'Sustantivos abstractos', 'Formas verbales en primera persona'] },
      { topic: 'La crónica', subtopics: ['Función y estructura narrativa', 'Características de la crónica', 'Conectores de secuenciación temporal', 'Adverbios de modo', 'Sinónimos y expresiones sinónimas', 'Preposiciones y locuciones preposicionales', 'Modificadores circunstanciales', 'Pronombres personales, demostrativos e indefinidos', 'Oraciones coordinadas, yuxtapuestas y subordinadas'] },
      { topic: 'El catálogo', subtopics: ['Función y estructura', 'Elementos paratextuales del editor y del autor', 'Palabras compuestas', 'Hipónimos', 'Términos en latín', 'Adjetivos', 'El gerundio', 'Números y viñetas', 'Vocabulario', 'Información gráfica'] },
      { topic: 'El informe de experimento', subtopics: ['Función y estructura', 'Verbos impersonales', 'Perífrasis verbales', 'Conectores de secuenciación, causalidad', 'Adverbios de modo', 'Frases incidentales', 'Vocabulario temático', 'Palabras compuestas', 'Gráficas, tablas, diagramas y dibujos', 'Mapas conceptuales'], note: 'Debido a que el informe de experimento es un texto de naturaleza eminentemente escrita, las competencias de comprensión y producciones orales se incorporarán como procedimientos de la comprensión y producciones escritas.' },
      { topic: 'El artículo de opinión', subtopics: ['Función y estructura', 'La tesis', 'Argumentos de ejemplificación y de analogía', 'Modalizadores', 'Conectores de ejemplificación y de comparación', 'La pregunta retórica', 'El subrayado como técnica'] },
      { topic: 'El cuento social, político, cultural', subtopics: ['Función y estructura', 'Tipos', 'Elementos del cuento', 'La forma narrativa', 'Tipos de narrador', 'Los actantes', 'Recursos lingüísticos y literarios', 'El diálogo directo e indirecto', 'El verbo: modo indicativo y subjuntivo, tiempos: pretérito indefinido, pretérito imperfecto y pretérito compuesto', 'El adverbio de tiempo y espacio', 'Conectores coordinantes y subordinantes', 'Variantes lingüísticas'] },
      { topic: 'El madrigal', subtopics: ['Función y estructura', 'El verso endecasílabo', 'La rima', 'Figuras literarias', 'Vocabulario'] },
    ],
    '4to': [
      { topic: 'La crónica', subtopics: ['Función y estructura', 'Características', 'Tipos de crónicas', 'Conectores de secuenciación temporal', 'Adverbios de modo', 'El adjetivo', 'Sinónimos y expresiones sinónimas', 'Modificadores circunstanciales', 'Pronombres personales, demostrativos e indefinidos', 'Verbos en voz pasiva', 'Oraciones coordinadas'] },
      { topic: 'El instructivo', subtopics: ['Función y estructura', 'El "se" impersonal', 'El infinitivo', 'Conectores de orden, finalidad', 'Adverbios o construcciones adverbiales', 'Léxico técnico o especializado', 'Ilustraciones, gráficas y dibujos', 'Números y/o viñetas'] },
      { topic: 'El informe de investigación', subtopics: ['Función', 'Estructura', 'Composición de argumentos', 'Formas impersonales del verbo', 'Vocabulario temático', 'Oraciones compuestas', 'Verbos en infinitivo', 'Conectores de contraste, adición, cierre, ejemplificación, finalidad', 'Adverbios de frecuencia, de modo', 'Referencias bibliográficas', 'Mecanismos de citación', 'Esquemas de contenido: organizadores gráficos'] },
      { topic: 'El artículo de opinión', subtopics: ['Función y estructura argumentativa', 'Contraargumentos', 'Conectores de adición, recapitulación y cierre', 'Expresiones para precisar la tesis o punto de vista', 'Verbos de opinión', 'Las citas textuales: directas o indirectas', 'Los datos estadísticos', 'La pregunta retórica', 'Vocabulario temático'], note: 'Debido a que el artículo de opinión es un texto de naturaleza esencialmente escrita, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la producción escrita.' },
      { topic: 'El discurso oral de agradecimiento', subtopics: ['Función y estructura', 'Características', 'Roles de los participantes', 'Referencias léxicas', 'La autorreferencia en los deícticos', 'Conectores de apertura, de cierre, de causa-efecto', 'Marcas de agradecimiento, de cortesía', 'Organizadores para introducir otras voces intratextuales', 'La secuencia argumentativa', 'Elementos paralingüísticos'] },
      { topic: 'La novela', subtopics: ['Función y estructura', 'Componentes', 'Secuencias narrativas, descriptivas y dialogadas', 'Conectores temporales, causales y consecutivos', 'Organizadores discursivos', 'Verbos en pasado', 'Adjetivos', 'Narrador y personajes', 'Temas de la novela', 'Los personajes'], note: 'Para este tipo de texto se priorizará la comprensión tanto oral como escrita.' },
      { topic: 'El soneto', subtopics: ['Función y estructura', 'Licencias métricas', 'Los versos', 'La rima', 'Imágenes visuales, auditivas, olfativas, táctiles y gustativas', 'Figuras literarias', 'Campo de los sentimientos'] },
    ],
    '5to': [
      { topic: 'La carta de autopresentación', subtopics: ['Función y estructura', 'Fórmulas de cortesía', 'Verbo en presente del indicativo', 'El condicional en las formas verbales', 'El pretérito perfecto', 'Adjetivos', 'Conectores de finalidad, de causa-efecto, de adición', 'El vocabulario temático', 'El motivo de la carta'], note: 'Debido a que la carta es eminentemente un texto escrito, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la producción escrita, sobre todo, aquellos relacionados con la producción oral del cuerpo de la carta.' },
      { topic: 'La reseña', subtopics: ['Función y estructura', 'Verbos en presente de indicativo, en pretérito perfecto, en futuro', 'Conectores de cierre, de adición', 'Adjetivos calificativos', 'Adverbios de modo', 'Vocabulario temático', 'Mecanismos de citación'], note: 'En este tipo de texto y para este grado, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la producción escrita.' },
      { topic: 'El ensayo argumentativo', subtopics: ['Función y estructura', 'La tesis', 'Tipos de argumentos: de autoridad, por datos estadísticos, por hechos, por causa-efecto, por teorías o generalizaciones, por ejemplos, por comparaciones, por analogías', 'Argumentos y contraargumentos', 'Conectores de orden, digresión, adición, consecuencia, contraste'], note: 'Debido a que el ensayo argumentativo es un texto de naturaleza esencialmente escrita, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la comprensión y producción escrita.' },
      { topic: 'El discurso oral de recibimiento y despedida', subtopics: ['Función y estructura', 'Características', 'Roles de los participantes: orador y público', 'Referencias léxicas de personas', 'La autorreferencia en los deícticos', 'Las personas gramaticales', 'Conectores de apertura, cierre', 'Marcas de recibimiento y despedida, de causa-efecto', 'Marcas de cortesía', 'El registro formal', 'Expresiones de certeza positiva', 'Expresiones de postura del orador', 'Organizadores de otras voces', 'Citas textuales', 'Organizadores intratextuales', 'Secuencia argumentativa', 'Reglas para hablar en público', 'Los signos de puntuación'] },
      { topic: 'La novela', subtopics: ['Función y estructura', 'Secuencias: narrativas, descriptivas, dialogadas', 'Conectores temporales, causales y consecutivos', 'Marcadores espaciales', 'Marcas textuales y paratextuales', 'Organizadores discursivos de orden', 'Verbos en pasado y presente', 'Los adjetivos', 'Tipos de narrador', 'Los personajes', 'Temas de la novela', 'Los actantes', 'Orden de la narración'], note: 'Para este tipo de texto se priorizará la comprensión tanto oral como escrita.' },
      { topic: 'La poesía social', subtopics: ['Función y estructura', 'Verso libre y rimado', 'Recursos estilísticos: imágenes, figuras, tropos', 'Exclamaciones'] },
      { topic: 'El monólogo', subtopics: ['Definición de monólogo', 'Tipos de monólogos: el unipersonal, la comedia de pie', 'Estrategias discursivas monologales: el soliloquio, el recital', 'Elementos del monólogo teatral', 'Términos técnicos propios del teatro', 'Secuencias textuales', 'Los adjetivos y los adverbios'] },
    ],
    '6to': [
      { topic: 'El informe de investigación', subtopics: ['Función y estructura', 'Los procedimientos de composición de argumentos', 'Formas impersonales del verbo', 'Vocabulario temático', 'Conectores de concesión, de transición, de precisión', 'Locuciones adverbiales', 'Expresiones modalizadoras', 'Adverbios de frecuencia, de cantidad, de modo', 'Referencias bibliográficas', 'Citación', 'Organizadores gráficos', 'Recursos paratextuales'] },
      { topic: 'El reportaje', subtopics: ['Función y estructura', 'Características', 'La secuencia expositiva, descriptiva, narrativa', 'Formas impersonales del verbo', 'Las oraciones subordinadas sustantivas (especificativas y explicativas) y sus conectores', 'Las oraciones coordinadas yuxtapuestas', 'El adjetivo', 'Elementos paratextuales'] },
      { topic: 'El ensayo argumentativo', subtopics: ['Función y estructura', 'La tesis para expresar la postura', 'Los tipos de argumentos: de autoridad, por datos estadísticos, por hechos, por causa-efecto, por teorías o generalizaciones, por ejemplos, por comparaciones, por analogías', 'Contraargumentos', 'Las falacias argumentativas', 'Conectores explicativos y de rectificación, de distanciamiento, recapitulativos, de refuerzo'], note: 'Debido a que el ensayo argumentativo es un texto de naturaleza esencialmente escrita, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la comprensión y producción escrita.' },
      { topic: 'El discurso oral de graduación', subtopics: ['Función y estructura', 'Referencias léxicas', 'La autorreferencia en los deícticos', 'Conectores de apertura, temporales, de cierre, de causa-efecto', 'Marcas de cortesía', 'Registro formal', 'Oraciones según la actitud del hablante', 'Secuencia narrativa, argumentativa', 'Elementos paralingüísticos'], note: 'Aunque este tipo de texto es eminentemente oral, la producción escrita sirve como estrategia para su posterior oralización.' },
      { topic: 'La novela', subtopics: ['Función y estructura', 'Secuencias narrativas, descriptivas y dialogadas', 'Conectores temporales, causales y consecutivos', 'Marcadores espaciales', 'Marcas textuales y paratextuales', 'Organizadores discursivos de orden', 'Verbos en pasado y presente', 'Los adjetivos', 'Tipos de narrador', 'Los personajes', 'Temas de la novela', 'Los actantes', 'Orden de la narración'], note: 'Para este tipo de texto se priorizará la comprensión tanto oral como escrita.' },
      { topic: 'Poesía social', subtopics: ['Función y estructura', 'Verso libre y rimado', 'Recursos estilísticos: imágenes, figuras, tropos', 'Exclamaciones'] },
    ],
  },
};
// Base progresiva para cargar competencias específicas limpias por área + grado + competencia fundamental.
// Aqu? iremos agregando nuevos bloques oficiales del currículo sin tocar el render del paso 2.
const LESSON_PLAN_PROCEDURAL_CATALOG = {
  "Lengua Española": {
    "1ro": [
      {
        "topic": "La noticia",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de noticias de interés mundial relacionadas con la naturaleza y el ambiente e identificación de su intención comunicativa. Utilización de la estructura de la noticia (titular, entrada o copete, cuerpo, foto y pie de foto) para comprender su contenido; uso de las interrogantes (qué ocurrió, a quién le ocurrió, dónde ocurrió, cuándo ocurrió y cómo ocurrió) para comprenderla; realización de inferencias necesarias para comprender el sentido global del texto y del significado de las palabras que desconoce, a partir del contexto."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Escogencia de una noticia de interés mundial sobre la naturaleza y el ambiente, teniendo en cuenta los elementos que convierten un hecho en noticia; establecimiento de la intención comunicativa de la noticia que producirá oralmente. Relato de la noticia, tomando en cuenta su función, su estructura (titular, entrada y cuerpo) y las interrogantes que debe responder (qué ocurrió, a quién le ocurrió, dónde le ocurrió, cuándo le ocurrió y cómo ocurrió); uso de marcadores que expresen orden y temporalidad para organizar lógica y coherentemente la noticia; vocabulario temático (verbos y sustantivos); la entonación, el ritmo, las pausas y silencios, así como el tono (serio) que caracterizan la noticia."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Selección de la modalidad de lectura (en voz alta, en silencio, individual, compartida); anticipación del contenido del texto a partir de marcas textuales y paratextuales; establecimiento del propósito para leer la noticia; identificación de la intención comunicativa de la noticia que lee. Lectura de la noticia para dar respuesta a las interrogantes propias del texto (qué ocurrió, a quién le ocurrió, dónde ocurrió, cuándo ocurrió y cómo ocurrió); realización de inferencias mientras lee • Valoración de la objetividad de las noticias que escucha. • Curiosidad por conocer lo que sucede a su alrededor y en el mundo . • Sensibilidad y solidaridad con lo sucedido y repor tado en las noticias. • Criticidad frente a las cuestiones r elacionadas con la naturaleza y el medioambiente. • Valoración de la escritura de la noticia como un proceso ."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "La guía turística",
        "proceduralItems": [
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Selección del acontecimiento para la noticia; documentación y búsqueda de la información necesaria para la noticia; establecimiento del público a quien va dirigida la noticia; elección de un titular llamativo para la noticia; presentación de la entrada de la noticia con un vocabulario y sintaxis sencillos; organización de la información, tomando en cuenta el orden de las interrogantes (qué, a quién, dónde, cuándo, cómo); utilización del registro de lengua formal y estilo a la intención comunicativa y al público al que va dirigida la noticia; conectores de orden y temporales para lograr la cohesión de la noticia; los signos convencionales de la escritura; revisión y corrección de los borradores por parte del/de la docente y los/las demás estudiantes. Edición y publicación de la versión final de la noticia, a través de medios y recursos tecnológicos o convencionales."
          },
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de guías turísticas leídas por los/las compañeros/as; anticipación del sentido global del texto, a partir de la información gráfica (mapas, gráficos, dibujos o fotografías). Utilización de los verbos en presente de indicativo, para expresar cualidades de los lugares de interés de la comunidad; reconocimiento de la estructura organizacional del texto mediante la identificación de verbos en presente de indicativo, sustantivos y adjetivos; paráfrasis del sentido global de la guía turística utilizando adjetivos calificativos."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa del texto que va a producir oralmente; elección de los lugares de mayor interés de la comunidad y su clasificación en: museos, plazas, bibliotecas, exposiciones, restaurantes, hoteles, salas de conciertos, cines, teatros y parques; recopilación de la información necesaria del lugar; delimitación del alcance de su guía: público, tema y diseño de presentación; empleo de mapas, gráficos o collage de fotografías para explicitar gráficamente el tema de la guía turística; descripción topográfica para destacar aspectos sobresalientes de los lugares de su comunidad. Utilización de sustantivos propios y comunes para nombrar lugares turísticos de la comunidad, y de los grados del adjetivo para describirlos; vocabulario y la intención comunicativa; utilización de verbos en presente del indicativo para expresar las cualidades de los lugares de interés de la comunidad; conectores espaciales y temporales. • Veracidad de los contenidos de la guía respec to a los conocimientos de la comunidad. • Respeto por los valores identitar ios de los elementos que le rodean • y conforman su contex to sociocultural. • Valoración de aspectos geog ráficos, culturales, gastronómicos de la propia población. • Interés por escr ibir guías turísticas sobre la comunidad a la que pertenece. • Creatividad como medio para hacer más eficiente el proceso de comunicación. 70 Contenidos Conceptos Procedimientos"
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento del propósito para la lectura de la guía turística; inferencia del contenido de la guía turística a partir del título y otras marcas paratextuales (fotografías, mapas o gráficos); identificación de la intención comunicativa de la guía turística que lee en silencio y/o en voz alta; utilización de la estructura de la guía turística (portada, información, imágenes y cierre), los verbos en presente de indicativo, sustantivos propios, comunes y abstractos, los adjetivos, oraciones interrogativas y exclamativas, para comprender la guía turística que lee. Clasificación de los lugares que aparecen en la guía leída; reconocimiento de la estructura organizacional del texto, mediante la identificación de los verbos en presente de indicativo, los sustantivos y adjetivos; reconstrucción del sentido global del texto, utilizando recursos gráficos o tecnológicos. Producción escrita (escribir) Establecimiento de la intención comunicativa del texto que va a producir; selección de los lugares de mayor interés de la comunidad; clasificación de los lugares seleccionados; definición de la estructura, registro y recursos de la guía turística; selección del soporte de la guía: físico (libro) o digital y la tecnología que va a utilizar para su elaboración; elaboración de los materiales gráficos que va a emplear en la guía (mapas, gráficos o collage de fotografías); utilización de la estructura (portada, información e imágenes y cierre), los verbos en presente de indicativo, sustantivos propios, comunes y abstractos, los adjetivos, para producir la guía turística; vocabulario para producir la guía turística de acuerdo a la intención comunicativa; los signos convencionales de la escritura (comas, dos puntos, comillas, signos de interrogación y de exclamación). • Curiosidad e inter és al escuchar los informes de lectura leídos por el/la docente o compañeros y compañeras o grabados en audio. • Valoración del informe de lec tura como medio para comprender y reconstruir textos. • Respeto y valoración de la riqueza cultural al analizar las costumbr es, formas de comportamiento, estilos de vida, hábitos, pautas culturales observados en los textos narrativos del ámbito literario."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El informe de lectura",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de informes de lectura leídos por el/la docente o por sus compañeros/as; anticipación del contenido a partir del título u otras marcas textuales; inferencia de la intención comunicativa del análisis del informe de lectura que escucha; utilización de la estructura del informe de lectura para comprender el análisis de los patrones socioculturales presentes en él."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de un texto narrativo del ámbito literario (cuento, leyenda, fábula o novela), sobre el cual hará la exposición del informe de lectura; establecimiento de la intención comunicativa que producirá oralmente; resumen del contenido del texto seleccionado, presentando sus ideas principales a partir de las reglas de omisión, selección, generalización y reconstrucción; análisis oral de los patrones socioculturales presentes en el texto seleccionado para producir oralmente el informe de lectura. Exposición oral del informe de lectura, presentando el análisis de los patrones socioculturales observados en él. • Disfrute y entusiasmo al leer el informe de lec tura. • Actitud reflexiva y analítica al examinar patr ones culturales presentes en textos narrativos del ámbito literario. • Valoración de la creatividad, la or ganización y la estética al presentar por escrito el informe de lectura."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura; anticipación del contenido del informe de lectura a partir del título y otras marcas textuales y paratextuales. Realización de las inferencias necesarias para comprender el sentido global del análisis que lee; utilización de la estructura de los verbos en presente y pasado, los adjetivos, y los conectores para comprender el análisis presente en el informe que lee; evaluación de las predicciones realizadas antes y durante la lectura; paráfrasis del contenido del informe de lectura para comprender el análisis de los patrones socioculturales presentes en él."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Selección de un texto narrativo del ámbito literario (cuento, fábula, leyenda, novela), sobre el cual producirá el informe de lectura; búsqueda de la información necesaria para la elaboración de un esquema de escritura donde se organice de manera lógica la estructura del texto que producirá; elaboración del resumen del contenido del texto seleccionado, presentando las ideas principales a partir de las reglas de omisión, selección, generalización y reconstrucción; análisis sociocultural del texto seleccionado; utilización del vocabulario de acuerdo a la intención comunicativa y al público receptor; utilización de los signos convencionales de la escritura (comas, dos puntos, comillas, signos de interrogación y de exclamación); uso de adjetivos para describir y caracterizar los patrones socioculturales de los textos analizados, de verbos en presente y en pasado de indicativo y de conectores de adición (y, además, también) y de ejemplificación (por ejemplo, tal como); asignación de un título en función de su contenido. • Valoración de la veracidad de los datos ofr ecidos en"
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El afiche",
        "proceduralItems": [
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura del afiche; anticipación del contenido del afiche a partir de los elementos gráficos que lo conforman: imágenes, tipos de letras, colores, distribución espacial de los componentes. Comprensión de la intención a partir de las palabras claves para sugerir, atraer, motivar o convencer; interpretación de los mensajes y recursos persuasivos del afiche; realización de las inferencias necesarias para comprender el sentido global del afiche; paráfrasis del contenido global del afiche y recuerdo de la información importante que contiene."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la situación comunicativa del afiche: intención, destinatarios/as, tiempo y lugar de acciones comunicativas; elección del tipo de actividad cuya participación motiva el afiche y de los datos de la misma (día y lugar de realización, público que asistirá, acciones que se van a realizar); planificación de los componentes textual y visual, a partir de la actividad y los datos seleccionados; uso del imperativo para mover a la acción como parte del componente textual del afiche; utilización de recursos poéticos y/o argumentativos para atraer al/ a la destinatario/a: exageración, metáfora, elipsis, pleonasmo, hechos, cifras estadísticas, ventajas. Selección de los elementos gráficos que completarán el afiche: imágenes, formas, colores, tipos de letras, organización espacial de los elementos lingüísticos, gráficos y tamaño del afiche. • Apreciación de los estímulos y emociones que provoca la escucha de textos narrativos. • Interés por nar rar de forma lúdica y entretenida cuentos de naturaleza policíaca y detectivesca. • Curiosidad por conocer el desarr ollo y desenlace de los hechos narrados. • Valoración del tema y la trama del cuento que lee para conocer ac titudes y valores humanos. • Valoración de la importancia de escribir cuent os policíacos para desarrollar el pensamiento y orden lógico en la narración de un suceso. • Disfrute al escuchar caligramas. • Valoración de la función lúdica y estética de la poesía gráfica. 72 Contenidos Conceptos Procedimientos"
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El cuento policíaco y detectivesco",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de cuentos leídos por el/la profesor/a o grabados de la radio o la televisión; reconocimiento de los personajes centrales y secundarios para comprender las motivaciones que desencadenan las acciones; identificación del ambiente en sus aspectos fundamentales: cerrado, abierto, campo, ciudad para establecer la relación e influencia respecto a los personajes; comprensión del texto de manera global a partir de los tres momentos: inicio, nudo y desenlace; reconocimiento de los elementos y la estructura propios de este tipo de texto; identificación de verbos en pretérito indefinido y pretérito imperfecto, adverbios de tiempo y espacio y conectores coordinantes y de consecuencia para comprender con mayor claridad el texto narrado. Resumen o paráfrasis de la historia contada, utilizando un vocabulario apropiado e inclusivo."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de una trama con características policíacas para producir oralmente un cuento; establecimiento de la intención comunicativa (lúdica, despertar interés) del cuento que producirá oralmente; utilización de conectores coordinantes y de consecuencia para dar cohesión y sentido lógico al texto narrado; adecuación del lenguaje corporal como soporte a la expresión oral; matización del tono y volumen de voz, según la intervención de los distintos personajes del cuento. Descripción del ambiente y de los personajes, utilizando adjetivos y un vocabulario apropiado e inclusivo; empleo de recursos lingüísticos (descripción, diálogo) y literarios (comparación, metáfora, epíteto…) para dar mayor expresividad a los sucesos que ocurren en la narración."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Inferencia del contenido del cuento a partir del título y otras marcas paratextuales (imagen, color, gráficos, cubierta; utilización de la estructura narrativa (inicio, nudo y desenlace) para comprender la narración; reconocimiento de los personajes (centrales y secundarios) a partir de sus acciones y apariciones; relación entre los personajes y el ambiente en el que se desenvuelven. Identificación de los conectores coordinantes y de consecuencia para establecer la coherencia y orden lógico entre las ideas; paráfrasis del sentido global del cuento policíaco, utilizando un vocabulario adecuado a este tipo de texto • Respeto y empatía por los sentimientos y opiniones expresados por otr os y otras. • Reconocimiento y valoración de la expresión v erbal y corporal como medio para transmitir emociones. • Sensibilidad al declamar caligrama. • Disfrute al leer caligramas. • Disfrute al producir caligramas . • Valoración de la expresión escrita como medio para transmitir emociones ."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Elección del tema o trama que abordará en el cuento; elaboración de un esquema secuencial que servirá de guion; utilización de conectores lógicos en la producción escrita; delimitación del perfil de cada personaje del cuento utilización de un vocabulario apropiado según la intención comunicativa, los personajes que intervienen y el tema tratado; recreación del escenario o ambiente en el que actuarán los personajes de la historia; empleo de recursos lingüísticos (descripción, diálogo) y literarios (comparación, metáfora, epíteto…), para dar mayor expresividad a los sucesos que ocurren en la narración. Escritura de los borradores del cuento policíaco, tomando en cuenta la intención, los/las interlocutores/as, la estructura y el modo de organización; revisión y corrección del cuento policíaco, tomando en cuenta las convenciones de la escritura y las sugerencias de los/las compañeras/as y del/de la profesor/a; ilustración del cuento para una mejor comprensión del mismo; edición final y publicación del cuento policíaco en forma impresa y digital."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El caligrama",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de caligramas de poetas españoles/as, latinoamericanos/as caribeños/as y dominicanos/as, acordes con la edad e intereses; reconocimiento de la intención comunicativa del autor y de los sentimientos que expresa; uso de la estructura del caligrama (texto poético que forma una figura alusiva a lo que trata el poema), de la rima y de las figuras literarias (epíteto, anáfora, comparación, personificación y metáfora) presentes para comprender sus significados explícitos e implícitos y disfrutar de las emociones que provoca el poema. Paráfrasis oral del sentido global del caligrama, utilizando el vocabulario adecuado a este tipo de texto"
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de caligramas de autores/as, acordes a la intención comunicativa que quiere expresar. Verbalización de figuras literarias (epíteto, anáfora, comparación, personificación y metáfora) de la rima y los versos del caligrama, usando la entonación y el lenguaje gestual, acordes a la intención comunicativa y a los sentimientos que se quieren expresar."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Reconocimiento de la intención comunicativa del autor y de los sentimientos que expresa; uso de la estructura del caligrama (texto poético que forma una figura alusiva a lo que trata el poema), para compr ender su sig nificado. Utilización de la rima y el ritmo y las figuras literarias (epíteto, anáfora, comparación, personificación y metáfora) presentes para comprender sus significados implícitos y disfrutar de las emociones que provoca."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa del caligrama que va a Producir; selección del tema e imagen del caligrama; utilización de vocabulario apropiado a su intención comunicativa y al tipo de sentimiento o emoción que quiere expresar; así como las figuras literarias: epíteto, anáfora, comparación, personificación y metáfora. Escritura de borradores del caligrama atendiendo a su estructura, rima, figuras literarias y vocabulario apropiado, para la intención comunicativa y el tipo de sentimiento o emoción que quiere expresar; revisión y corrección de borradores del caligrama con ayuda del/de la docente y los compañeros y compañeras. Edición y publicación de caligramas en un mural, en un libro artesanal o en una revista escolar. Producción escrita (escribir) Selección del acontecimiento adecuado para la noticia; documentación y búsqueda de la información necesaria para la noticia; establecimiento del público al que va dirigida la noticia; elección de un titular llamativo para la noticia; presentación de la entrada o copete con un vocabulario y sintaxis sencilla; organización de la información, tomando en cuenta el orden de las interrogantes (qué, a quién, dónde, cuándo, cómo); utilización del registro formal y de un estilo a la intención comunicativa y al público al que va dirigida la noticia; conectores de orden y temporalidad, oraciones coordinadas y subordinadas para lograr la cohesión y para ampliar el sentido de la idea principal de la noticia; los signos convencionales de la escritura. Redacción del borrador o los borradores de la noticia; revisión y corrección del borrador o los borradores de la noticia por parte del/de la maestro/a y los/las demás estudiantes; edición y publicación (impresa o digital) de la versión final de la noticia que escribe."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      }
    ],
    "2do": [
      {
        "topic": "La noticia",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de noticias sobre temas sociales a nivel mundial relacionados con economía, pobreza, política, educación; identificación de la intención comunicativa de la noticia; utilización de la estructura de la noticia (titular, entrada o copete, cuerpo, foto y pie de foto) para comprender su contenido. Utilización de las interrogantes (qué ocurrió, a quién le ocurrió, dónde ocurrió, cuándo ocurrió y cómo ocurrió) para comprender la noticia; inferencias necesarias para comprender el sentido global del texto."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de una noticia sobre temas sociales a nivel mundial relacionados con economía, pobreza, política, educación, inmigración, etc., teniendo en cuenta los elementos que convierten un hecho en noticia; establecimiento de la intención comunicativa de la noticia que producirá. Relato de la noticia tomando en cuenta su función, su estructura (titular, entrada y cuerpo, foto y pie de foto) y las interrogantes que debe responder (qué ocurrió, a quién le ocurrió, dónde le ocurrió, cuándo le ocurrió y cómo ocurrió); uso de conectores que expresan orden temporalidad, coordinación y subordinación para organizar lógica y coherentemente la noticia que produce; vocabulario temático (verbos y sustantivos) con la noticia seleccionada; la entonación, el ritmo, las pausas y silencios, así como el tono (serio) que caracteriza la noticia."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Selección de la modalidad de lectura (en voz alta, en silencio, individual, compartida); anticipación del contenido del texto a partir de marcas textuales y paratextuales; establecimiento del propósito para leer la noticia; identificación de la intención comunicativa de la noticia que lee. Lectura de la noticia intentando dar respuesta a las interrogantes propias de dicho texto (qué ocurrió, a quién le ocurrió, dónde ocurrió, cuándo ocurrió y cómo ocurrió); realización de inferencias mientras lee para comprender la información fundamental de la noticia; así como el significado de las palabras que desconoce; paráfrasis de las informaciones contenidas en las noticias leídas; evaluación de las predicciones realizadas antes y durante la lectura. • Interés y cr iticidad frente a temas sociales a nivel mundial, relacionados con economía, pobreza, política, educación, inmigración, etc. • Creatividad mediante la búsqueda de titulares para las noticias . • Valoración de la escritura de la noticia como un proceso. Área de Lengua Española Nivel Secundario - Primer Ciclo 2do. Grado Competencias Fundamentales Competencias Específicas del Grado Comunicativa Comunica sus ideas y experiencias en diferentes situaciones, mediante un género textual (funcional o literario) abordado desde la comprensión y producción oral y escrita, mostrando creatividad y destrezas en el uso de la lengua, utilizando medios y recursos tecnológicos y de otros tipos. Pensamiento Lógico, Creativo y Crítico Produce textos orales y escritos variados a partir de inferencias de comprensión y producción textual, demostrando un pensamiento estructurado, derivando en conclusiones razonables y lógicas. Resolución de Problemas Utiliza textos específicos variados (orales y escritos) que apoyan el desarrollo de una investigación de carácter científico, seleccionando información con criterios de relevancia, pertinencia, validez y confiabilidad. Ética y Ciudadana Usa textos variados de secuencia argumentativa, con los que conoce y cuestiona prácticas sociales de ciudadanía en el entorno local, nacional e internacional, confrontándolas con los valores universales en discursos analíticos y propositivos. Científica y Tecnológica Utiliza textos de secuencia expositivo-explicativa de manera oral y escrita, en la divulgación de hallazgos científicos y sociales, así como de los avances tecnológicos a lo largo del tiempo, haciendo uso de variadas herramientas que proporcionan las tecnologías de la información y la comunicación TIC. Ambiental y de la Salud Usa textos diversos en la divulgación y promoción de situaciones de salud y ambiente, abordando temas y problemas de actualidad, mediante el uso de herramientas tecnológicas, entre otras. Desarrollo Personal y Espiritual Utiliza textos literarios como manifestación de la lengua y recurso para promover valores universales y fortalecer la dimensión humanista. 76 Contenidos Conceptos Procedimientos Actitudes y Valores"
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "La guía turística",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de guías turísticas leídas por los/las compañeros/as; anticipación del sentido global del texto a partir de la información gráfica (mapas, gráficos, dibujos o fotografía; realización de las inferencias necesarias para comprender el sentido global de la guía turística que escucha. Utilización de los verbos en presente indicativo para expresar cualidades de los lugares de interés; reconocimiento de la estructura organizacional del texto mediante la identificación de los verbos de presente e indicativo, sustantivos y adjetivos; paráfrasis del sentido global del contenido."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa del texto que va a producir oralmente; elección de los lugares turísticos más importantes del país y su clasificación: provincias, monumentos, ríos, playas y lugares turísticos; recopilación de la información necesaria del lugar; paquetes turísticos, excursiones, reservas, etc.) utilizando fuentes bibliográficas y recursos tecnológicos; delimitación del alcance de la guía turística: público, tema y diseño de presentación; empleo de mapas, gráficos o collage de fotografías para explicitar gráficamente el tema de la guía turística; empleo de la descripción topográfica para destacar aspectos sobresalientes del lugar seleccionado del país. Utilización de verbos en presente del indicativo para expresar las cualidades de ese lugar del país; así como conectores especiales y temporales."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento del propósito para la lectura de la guía turística; inferencia del contenido de la misma a partir del título y otras marcas paratextuales (fotografías, mapas o gráficos); utilización de la estructura de la guía turística (portada, información, imágenes y cierre), los verbos en presente del indicativo, sustantivos propios, comunes y abstractos, los adjetivos, oraciones interrogativas y exclamativas para comprender la guía turística que lee. Clasificación de los lugares que aparecen en la guía leída en: provincias, monumentos, ríos, playas y lugares turísticos; identificación de la secuencia textual descriptiva y sus características; reconociendo la estructura, la función, el registro y el soporte; así como la reconstrucción del sentido global del texto, utilizando recursos gráficos o tecnológicos."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa del texto que va a producir; selección de los lugares turísticos de mayor interés del país: provincias, monumentos, ríos, playas lugares turísticos; recopilación de la información necesaria del lugar; definición de la estructura, registro y recursos de la guía turística; selección del soporte: físico (libro) o digital; elaboración de los materiales gráficos que va a emplear (mapas, gráficos o collage de fotografías),utilización de la estructura (portada, información, imágenes y cierre), los verbos en presente del indicativo, sustantivos propios, comunes y abstractos, los adjetivos, para producir la guía turística; utilización de los signos convencionales de la escritura al escribir el texto (comas, dos puntos, comillas, signos de interrogación y de exclamación). Escritura de los primeros borradores, tomando en cuenta las características previamente establecidas; revisión de los borradores con ayuda de pares o el/la profesor/a teniendo en cuenta el uso de los recursos del texto descriptivo. • Valoración de la veracidad de los contenidos de la guía tur ística respecto a los conocimientos del país. • Toma de conciencia del valor geográfico, cultural y tur ístico del país. • Interés por mostrar los valor es culturales y sociales del país. • Valoración de la importancia de conocer y dar a conocer el país a visitantes ex tranjeros. • Curiosidad por leer y dar a conocer temas r elacionados con el país. • Reconocimiento de la creatividad como medio para hacer más eficient e el proceso de comunicación."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El artículo expositivo",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa del artículo expositivo que producirá oralmente; selección de las fuentes bibliográficas, en versión física y/o digital, que va a utilizar en la recolección de la información necesaria para estructurar el texto; desarrollo de estrategias de planificación del contenido del texto que producirá oralmente, tomando en cuenta la estructura el orden lógico de las ideas, el vocabulario temático, los conectores de causa efecto y de finalidad, los tiempos y modos verbales; selección del léxico a la intención comunicativa y a los/las interlocutores; así como los recursos audio visuales (en formato físico y/o digital) que sirven de apoyo al artículo expositivo que produce oralmente. Selección y utilización de citas o datos para apoyar la explicación del tema que desarrolla en el artículo expositivo; incorporación de recursos no verbales (gestos faciales, miradas, movimientos, postura corporal, entonación, ritmo, intensidad) para apoyar el contenido lingüístico."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Anticipación del contenido del artículo expositivo que lee en soporte físico y/o digital a partir del título, subtítulos y otras marcas textuales y paratextuales (tablas, cuadros, esquemas, fotografías); realización de las inferencias necesarias basadas en la estructura del texto, con modo de organización problema-solución, para comprender su sentido; paráfrasis del sentido global del artículo expositivo leído, ajustándose a la estructura propia del modo de organización problema-solución, al contenido (idea principal e ideas secundarias), a la intención, a los/las destinatarios/as y al léxico adecuado al tipo de texto. Construcción de esquemas, cuadros sinópticos y otros organizadores gráficos, manuscritos y/o digitales para dar cuenta de la comprensión del artículo expositivo leído."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa del artículo expositivo que produce por escrito: informar y ofrecer explicación acerca de problemas sociales relacionados con la realidad; investigación de la información en las fuentes seleccionadas; registro de la información en función de la estructura (introducción, desarrollo y conclusión), el tema y los/las destinatarios/as del texto; planificación del contenido del texto mediante el uso de organizadores gráficos (mapas conceptuales, mapas semánticos); organización de la información registrada, utilizando estrategias que permiten estructurar las ideas según el modo de organización problema solución: las partes de la estructura, los conectores de causa-efecto y de finalidad y el léxico apropiado al tema y a los/las interlocutores/ as; utilización de recursos paratextuales (cuadros, gráficos, fotografías, diagramas) para ilustrar el contenido que produce por escrito; uso de citas o datos encontrados en las fuentes de información para apoyar las ideas desarrolladas en el texto. Redacción de borradores, manuscritos y/o digitales; revisión y corrección de manera individual y con la colaboración del/de la docente y de sus compañeros o compañera; edición y publicación, en soporte físico o digital, de artículos expositivos de temas diversos. • Actitud reflexiva fr ente a las problemáticas abordadas en los artículos expositivos que escucha y que podrían afectarle a él o a ella y a sus pares. • Honestidad intelectual en el acopio y presentación de la inf ormación que desarrolla en la exposición oral. • Capacidad de investigación en div ersas fuentes de información en formato físico y/o digital para sustentar y enriquecer el contenido del artículo expositivo que produce por escrito."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El informe de lectura",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de informes de lectura leídos por el/la docente, por sus compañeros/as o en una grabación; anticipación del contenido del informe de lectura a partir del título u otras marcas textuales; utilización de la estructura del informe de lectura para comprender el análisis de los temas presentes en él; realización de las inferencias necesarias para comprender el sentido global del análisis realizado en el texto; paráfrasis del contenido del informe de lectura para comprender el análisis de los temas. • Curiosidad e inter és al escuchar los informes de lectura leídos por el/la docente, compañeros y compañeras o en una grabación. • Respeto y valoración de la riqueza cultural al analizar t emas observados en los textos narrativos del ámbito literario. 78 Contenidos Conceptos Procedimientos Actitudes y Valores • La oración temática • Verbos en present e, pretérito perfecto simple, pretérito imperfecto del modo indicativo • Resumen del text o literario"
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de un texto narrativo del ámbito literario (cuento, leyenda, fábula, novela), sobre el cual hará la exposición del informe de lectura; establecimiento de la intención comunicativa que producirá oralmente; resumen del contenido del texto seleccionado, presentando sus ideas principales a partir de las reglas de omisión, selección, generalización y reconstrucción; análisis oral del o los temas del texto seleccionado para producir oralmente; utilización del vocabulario a la intención comunicativa a los/las destinatarios/as. Exposición oral presentando el análisis del o los temas del texto seleccionado."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura del informe de lectura; anticipación del contenido del informe de lectura a partir del título y otras marcas textuales y paratextuales. Realización de las inferencias necesarias para comprender el sentido global del análisis presente en el informe de lectura que lee; utilización de la estructura del informe de lectura, de los párrafos y sus ideas, y de los verbos para comprender el contenido del texto que lee en formato físico o digital; paráfrasis del contenido del informe de lectura para comprender el análisis de los temas presentes en él."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Selección de un texto narrativo del ámbito literario (cuento, fábula, leyenda, novela), sobre el cual producirá el informe de lectura; establecimiento de un propósito para el informe de lectura que producirá; búsqueda de la información necesaria para elaborar el texto que producirá; elaboración del resumen del contenido del texto seleccionado, presentando las ideas principales a partir de las reglas de omisión, elección, generalización y reconstrucción; análisis del o los temas del texto seleccionado (cuento, fábula, leyenda, novela); utilización de la estructura (introducción, desarrollo y conclusión) para exponer coherentemente las ideas del informe de lectura; así como los signos convencionales de la escritura. Redacción de borradores, manuscritos y/o digitales, tomando en cuenta su organización, la coherencia y la cohesión textuales, revisión y corrección de los borradores con ayuda del/de la docente y los compañeros y las compañeras; edición y publicación del informe de lectura en formato físico o digital. • Disfrute y entusiasmo al leer el informe de lec tura. • Capacidad reflexiva y metódica al analizar t emas presentes en textos narrativos del ámbito literario. El cuento de amor y amistad • Función y estructura • Autores de cuent os de amor: Emilia Pardo Bazán, Oscar Wilde, Rafael Altamira, Horacio Quiroga, Borja Rodríguez Gutiérrez, Juan Ruiz, Comprensión oral (escuchar) Escucha atenta de cuentos leídos por el/la profesor/a y/o grabados de la radio o la televisión; realización de las inferencias necesarias para comprender el sentido global del cuento; reconocimiento de los personajes (principales, secundarios, ambientales, incidentales o fugaces) y de los actantes (sujeto, objeto, colaborador, aliado, cómplice, oponente) para comprender el rol y las motivaciones que definen sus acciones; identificación del ambiente físico: cerrado, abierto, rural, citadino; y sicológico: conflicto, angustia, opresión, alegría, para establecer la relación e influencia con respecto a los personajes. Comprensión global del texto a partir de su estructura (la introducción, la complicación, la resolución y la evaluación) y de la identificación de los verbos, adverbios y conectores lógicos empleados; descripción del ambiente y los personajes utilizando adjetivos y un vocabulario apropiado e inclusivo; clasificación de los personajes principales y secundarios, protagonista y antagonista; resumen o paráfrasis de la historia contada utilizando un vocabulario inclusivo. • Apreciación de los estímulos y emociones que prov oca la escucha de textos narrativos amorosos y sentimentales. • Valoración de la importancia de narrar para conocer valor es, actitudes y conductas humanas. Producción oral (hablar) Establecimiento de la intención comunicativa (lúdica, despertar interés) del cuento que producirá oralmente; selección de una trama con características amorosa y sentimental para producir un cuento oralmente; descripción del ambiente y los personajes del cuento; inclusión de diálogos de estilo directo e indirecto como recurso lingüístico en que se apoya la narración; matización del tono y volumen de voz, según la intervención de los distintos personajes que intervienen. Utilización de la estructura, los componentes, verbos, adjetivos conectores propios de este tipo de texto, al producir el cuento en forma oral; narración del cuento tomando en cuenta la estructura, los elementos y la intención comunicativa."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El cuento de amor y amistad",
        "proceduralItems": [],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "La décima espinela",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de décimas de autores españoles, latinoamericanos y dominicanos, acordes a la intención comunicativa que quiere expresar; verbalización de figuras literarias (comparación, metáfora, paradoja, antítesis e ironía) de la rima, las interjecciones y exclamaciones y los versos de la décima, usando la entonación y lenguaje gestual acordes a la intención comunicativa y a los sentimientos que se quieren expresar."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura de la décima; reconocimiento de la intención comunicativa del autor y de los sentimientos que expresa; uso de la estructura de la décima (estrofa de diez versos con versos octosílabos con contenido de carácter social) para comprender su significado, utilización de la rima, el ritmo y las figuras literarias (comparación, metáfora, paradoja, antítesis e ironía) presentes para comprender sus significados implícitos y disfrutar de las emociones que provoca; paráfrasis del sentido global, utilizando el vocabulario adecuado a este tipo de texto. • Valoración de la función lúdica y estética de la décima. • Aprecio de la poesía popular y de las tradiciones orales expresadas en las décimas. • Respeto y empatía por los sentimientos y opiniones expr esados por otros. • Reconocimiento del valor de la expresión v erbal y corporal como medio para transmitir emociones e ideas. • Sensibilidad al declamar décimas. • Aprecio de la poesía popular y de las tradiciones escritas expresadas en las décimas . 80 Contenidos Conceptos Procedimientos Actitudes y Valores"
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa de la décima que va a producir; selección del tema de la décima; utilización de vocabulario apropiado a su intención comunicativa y al tipo de sentimiento, emoción o idea que quiere expresar; utilización de figuras literarias: comparación, metáfora, paradoja, antítesis e ironía. Escritura de borradores de la décima, atendiendo su estructura, rima, revisión y corrección de borradores con ayuda del docente y los compañeros y compañeras; edición y publica- ción de las décimas en un mural, en un libro artesanal o en una revista escolar. Indicadores de Logro • Expresa sus ideas a trav és de textos orales y/o escritos, creando un ambiente cultural e interactivo, desde una perspectiva social. • Emplea la lengua haciendo uso de las diferentes funciones textuales, a través de su expresión personal, creando estructuras para forjar el conocimiento en medios diversos. • Valora los recursos de la lengua y los utiliza al r esponder preguntas inferenciales y críticas en la comprensión de sentidos. • Demuestra capacidad en el uso de secuencias argumen tativas, en la construcción de discursos con temas de su realidad, así como del contexto local, nacional y mundial. • Reconstruye c onocimientos sobre situaciones sociales a partir de inferencias en la comprensión y producción de textos funcionales y literarios. • Expone informaciones con juicios y pun tos de vista pertinentes, en la construcción de pensamiento estructurado que derivan en conclusiones lógicas, acciones y respeto de opiniones. • Identifica problemas o conflic tos del centro educativo y comunitario, a través de un tipo de texto específico y apropiado. • Utiliza tex tos específicos variados que apoyan la solución de problemas, facilitando la investigación, búsqueda de información, con criterios de relevancia, pertinencia, validez y confiabilidad. • Presenta inf ormes de investigación que evidencian la solución de problemas en un contexto determinado. • Presenta nuev as relaciones sociales en reconocimiento y valoración de lo natural y sociocultural, haciendo uso de textos, tales como análisis, comentarios, argumentos, entre otros. • Conoce y cuestiona las prác ticas sociales de ciudadanía en el entorno local y su confrontación con los valores universales, a través de textos y secuencia argumentativa. • Elabora pro yectos colaborativos, utilizando textos variados y apropiados, para la construcción de una ciudadanía que busca soluciones a problemas. • Expone conocimient os sobre procesos de investigación en el campo de la ciencia, mediante textos variados y haciendo uso de medios y herramientas tecnológicas. • Analiza tex tos de secuencia expositivo-explicativa relacionados con investigaciones científicas sencillas, para la comprensión de problemas o situaciones de su entorno familiar, escolar, comunitario. • Redacta t extos expositivo-explicativos sobre hallazgos científicos y sociales, haciendo uso de las convenciones de lengua y su divulgación en diferentes contextos. • Caract eriza problemáticas relacionadas con salud y ambiente que afectan el quehacer social, haciendo uso de textos diversos y apoyándose en recursos y medios variados. • Escribe tex tos sobre la flora y la fauna dominicanas, la salud y el ambiente, identificando especies endémicas, preparación de alimentos sanos, problemas ambientales de actualidad, proceso de reciclaje, zonas protegidas, para una mejor salud integral, ambiente favorable al desarrollo humano. • Aplica conocimient os sobre la conservación de la salud, la naturaleza y sus ecosistemas, redactando textos variados, para su divulgación en actividades de intercomunicación dentro y fuera del aula. • Utiliza un género te xtual para la comprensión de sí mismo y de los demás en variadas situaciones de comunicación. • Escribe tex tos literarios para el cultivo de valores universales y reforzar la dimensión humanista y el desarrollo físico y espiritual. • Canalizar emociones y sentimient os mediante lecturas y escrituras reflexivas, fortaleciendo las relaciones humanas, el respeto y la dignidad de las personas."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      }
    ],
    "3ro": [
      {
        "topic": "La entrevista",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de la entrevista realizada a personas destacadas de la comunidad; anticipación del contenido a partir de la introducción; identificación de la intención comunicativa que escucha; presentación (saludo, del entrevistado, del tema y el motivo), cuerpo (preguntas y respuestas), cierre (resumen de lo tratado y/o valoración personal), para mayor comprensión. Realización de inferencias basadas en las relaciones locales que existen entre las ideas que escucha, haciendo uso de las oraciones interrogativas y enunciativas, el tiempo verbal y el tono confesional que es propio de este tipo de texto; realización de las inferencias necesarias para comprender el sentido de la lectura que escucha."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa en la que participa como entrevistador/a; investigación y selección de los personajes relevantes de la comunidad para su realización, según sus valores, aportes y transcendencia; delimitación del alcance de la entrevista: público, temas y contenido; elaboración de las preguntas, ajustándose a la intención comunicativa y al orden lógico con que se presentan las ideas. Realización de las preguntas, tomando en cuenta la estructura textual; desarrollo de estrategias de selección, registro y organización de la información necesaria para estructurar las preguntas en la que participa como entrevistador/a. Selección del vocabulario temático y del registro a la situación de comunicación; incorporación de recursos no verbales (gestos, entonación, postura física, tono de voz) para apoyar el contenido lingüístico adecuándolos a la expresión verbal."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Realización de inferencias basadas en las relaciones locales que existen entre las ideas de la entrevista que lee; inferencia, a partir del contexto del significado de palabras desconocidas contenidas en la transcripción; utilización del diccionario, en versión física y/o digital, para buscar la definición de las palabras que lee cuy o sig nificado no ha podido inferir. Realización de las inferencias necesarias para comprender el sentido global que lee; tomando en cuenta la estructura textual, la intención comunicativa, los temas tratados a través de las diversas preguntas y respuestas."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa de la entrevista en la que participa como entrevistador/a; investigación y selección de los personajes relevantes de la comunidad para su realización, según los valores, aportes y transcendencia; delimitación del alcance de la entrevista: público, temas y contenido. Elaboración de las • Interés por los temas presentados en la entre vista. • Criticidad frente a las inf ormaciones y opiniones de los/las participantes en la entrevista. • Valoración de la importancia de la entre vista como un medio para conocer las ideas y la vida de las personas destacadas de la comunidad. • Respeto por las ideas y los valores del/de la entr evistado/a."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "La crónica",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de crónicas leídas en el aula y/o difundidas a través de algún medio de comunicación (periódico, radio, televisión…); anticipación del contenido que escucha a partir del título o de otras marcas textuales; identificación de la intención comunicativa para entender su sentido global. Utilización de la estructura para mejor comprensión del contenido; inferencia del rol y la imagen del hablante en la crónica que escucha. Identificación de los hechos, del ambiente y de las personas referidas en la crónica que escucha."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa de la crónica que producirá oralmente. Selección con la ayuda del/de la docente sobre los detalles que se resaltan en el tema. Narrar de acuerdo con la intención comunicativa y los/las interlocutores/as, ajustándose a los hechos seleccionados para destacar el acto comunicativo. Utilización de conectores temporales para secuenciar los hechos noticiosos seleccionados. Utilización de sinónimos para adecuar las palabras que destacan los hechos noticiosos que desea resaltar en la crónica; modalización de los hechos narrados en la crónica utilizando los adverbios de modo necesarios para transmitir la información, adecuándose a la situación comunicativa."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura de una crónica; anticipación del contenido a partir del título y otras marcas paratextuales (título, volanta, copete, fotografía, epígrafe) utilizados en la crónica. Utilización de la estructura narrativa y de los componentes destacados en el cuerpo (qué, cómo, cuándo, quiénes) para comprender la relevancia de la información. Inferencia a partir del contexto del significado de las palabras que desconoce; utilización del diccionario en formato físico, virtual o digital para buscar la definición de las palabras cuyo significado no ha podido inferir a partir del contexto. Inferencia de la secuencia de los hechos a través de los conectores utilizados en la crónica; realización de las inferencias necesarias para comprender el sentido global; paráfrasis del sentido de la crónica, utilizando el vocabulario adecuado a este tipo de texto."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa; selección de los hechos noticiosos que destacará la información; investigación de los hechos, las causas y las posibles consecuencias para destacarlos en la crónica; selección de la información relevante sobre los hechos que se resaltarán; elaboración de un esquema para organizar la información que presentará. Determinación de la audiencia y el registro que utilizará para transmitir la información. Empleo de adverbios, preposiciones, pronombres y conectores de temporalidad necesarios para transmitir la información en la crónica de forma coherente y cohesiva; empleo de la normativa: signos de puntuación; elaboración de los borradores necesarios para la redacción final de la crónica enfatizando la corrección de los problemas de contenido y la revisión de la normativa. Revisión y corrección de los borradores con ayuda del/de la docente y de los/las compañeros/as; ilustración con imágenes que contribuyan a la comprensión de los hechos dados a conocer en la crónica. • Valoración de la crónica como medio para infor marse de sucesos y acontecimientos sociales. • Curiosidad por encontrar la veracidad de los hechos nar rados en la crónica que lee. • Valoración de la objetividad de la crónica que lee para deter minar la veracidad de los hechos narrados. • Criticidad al leer crónicas sobre hechos ocur ridos a nivel nacional e internacional. • Interés por nar rar con objetividad los hechos relevantes seleccionados para la producción de crónicas."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El catálogo",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de catálogos leídos por los/las compañeros/as; anticipación del contenido a partir del título u otras marcas textuales; inferencia de la intención comunicativa que escucha; utilización de la estructura para comprender su contenido; inferencia a partir del contexto del significado de las palabras que desconoce. Realización de las inferencias necesarias para comprender el sentido global del catálogo que escucha; utilización de la información gráfica, como dibujos y fotografías; paráfrasis del sentido global, utilizando el vocabulario apropiado para presentar la información."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa del texto que va a producir oralmente; selección de las especies de la flora y la fauna del país; recopilación de la información necesaria de cada especie: nombre común, nombre científico, descripción, reproducción, hábitat, conservación y peligros o amenazas, utilizando diversas fuentes impresas y electrónicas. Delimitación del alcance de su catálogo (tipo, tema y diseño de presentación) y el tipo de soporte (físico o digital); elaboración de mapas, gráficos o collage de fotografías para apoyar gráficamente el tema. Utilización de hipónimos e hiperónimos para referirse a las especies de la flora y la fauna, utilización de un vocabulario adecuado para presentar la información."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento del propósito para la lectura del catálogo. Anticipación del contenido del texto a partir del título y otras marcas paratextuales como dibujos y fotografías; identificación de la secuencia textual descriptiva y sus características; activación de los conocimientos previos necesarios para comprender el contenido; identificación de la intención comunicativa del texto. Lectura en silencio o en voz alta en material impreso o en la pantalla, respetando las convenciones de la lengua escrita; inferencia a partir del contexto del significado de las palabras que desconoce; utilización del diccionario en formato impreso, digital o virtual para buscar la definición de las palabras cuyo significado desconoce. Realización de las inferencias necesarias para comprender globalmente el sentido de la lectura; utilización de la estructura para comprender su contenido; reconstrucción del sentido del texto por medio del resumen o la paráfrasis utilizando un vocabulario apropiado."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Lectura en silencio o en voz alta del catálogo en material impreso o en la pantalla, respetando las convenciones de la lengua escrita; utilización del diccionario en formato impreso, digital o virtual para busca la definición de las palabras cuyo significado desconoce; utilización de la estructura para comprender su contenido; reconstrucción del sentido del texto por medio de la paráfrasis o resumen. Delimitación del alcance de su catálogo: tipo, tema y diseño de presentación y el tipo de soporte (físico o electrónico); elaboración de mapas, gráficos o collage de fotografías para apoyarse gráficamente en el tema. Utilización del vocabulario en la intención comunicativa; escritura de los primeros borradores, tomando en cuenta las características textuales previamente establecidas, así como los signos auxiliares de la escritura; revisión de los borradores con ayuda de sus pares o el/la profesor/a, teniendo en cuenta el uso de los recursos del texto descriptivo. • Actitud respetuosa al escuchar a su int erlocutor/a. • Toma de conciencia del valor geográfico, cultural y ecológ ico del país. • Valoración de la importancia de preser var la biodiversidad, con el fin de mantener el equilibrio ecológico. • Interés por escr ibir catálogos para dar a conocer la flora y la fauna del país. • Reconocimiento de la importancia de la cr eatividad como medio para hacer más eficiente el proceso de comunicación. 84 Contenidos Conceptos Procedimientos Actitudes y Valores"
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El informe de experimento",
        "proceduralItems": [
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura del informe de experimento. Anticipación del contenido a partir de marcas textuales y paratextuales (gráficos, tablas, imágenes); inferencia de la intención comunicativa a partir de su estructura y del vocabulario que le es propio; identificación de los conectores de secuenciación y de causalidad para comprender las relaciones lógicas entre las ideas contenidas en el procedimiento y en la interpretación de los datos del informe que lee. Utilización del diccionario en versión física y/o digital para buscar la definición de palabras cuyo significado no ha podido inferir a partir del texto; Realización de inferencias a partir de tablas, gráficos, dibujos y otras marcas paratextuales presentes; paráfrasis del texto que lee a partir de la idea principal y las ideas secundarias, ajustándose a la intención comunicativa y a su estructura; construcción de mapas conceptuales, manuscritos y/o digitales, para dar cuenta de la comprensión del informe de experimento leído."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa del informe de experimento que escribe. Selección del experimento sobre el que escribirá el informe; selección de las fuentes de información, en versión física y/o digital, que va a utilizar para producir por escrito las ideas del experimento; desarrollo de estrategias de registro de la información necesaria para el texto que escribe, utilizando esquemas que organizan las ideas según la estructura de este tipo de escritura. Estructuración de las ideas, atendiendo a las partes que lo componen y al uso de la gramática específica (formas impersonales del verbo, perífrasis verbales, palabras compuestas, conectores de secuenciación y de causalidad, frases incidentales y adverbios de modo). Utilización de recursos paratextuales (tablas, gráficos, dibujos…) para ilustrar el contenido del informe que escribe. Selección del léxico adecuado a la intención comunicativa, a los/las interlocutores/as y al vocabulario temático; asignación de un título coherente con el contenido del texto; redacción de borradores, manuscritos y/o digitales correspondientes al Área de Ciencias de la Naturaleza, tomando en cuenta la intención comunicativa del mismo; revisión y corrección del informe de experimento de manera individual y con la colaboración del/de la docente y de sus compañeros o compañeras. • Curiosidad por conocer el contenido del inf orme de experimento que lee. • Valoración de la objetividad y sistematicidad present es en los informes de experimentos que lee. • Valoración del informe de exper imento como un medio para aproximarse al conocimiento de la realidad con una base científica. • Valoración del informe de exper imento como un medio de demostrar conocimientos de la realidad con una base científica."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El artículo de opinión",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa del comentario; selección del tema o problemática que va a comentar; investigación de la temática o problemática que va a desarrollar en el artículo de opinión. Planificación de los argumentos y la tesis del comentario que va a producir de modo oral; formulación de la tesis para expresar su opinión respecto del tema. Estructuración de los argumentos para apoyar la tesis, haciendo uso de adjetivos, conectores y marcadores que denoten la postura asumida. Organización lógica de los argumentos para defender la tesis acerca de la realidad del comentario; utilización del vocabulario en la intención comunicativa, a la audiencia y al tema seleccionado; utilización de citas textuales, de ejemplos y analogías para apoyar su opinión sobre la problemática presentada; estructuración de la tesis y los argumentos que va a producir oralmente, tomando en cuenta el uso de los conectores, la nominalización, los adjetivos, los argumentos de autoridad, ejemplificación, analogía y el tipo de registro. • Tolerancia frente a las opiniones del ar tículo de opinión que escucha. • Valoración de la diversidad de opiniones y crit erios para emitir juicios de valor sobre temas y problemáticas de su realidad personal y social más inmediatas, nacional e internacional. • Postura crítica en tor no a los temas controversiales de su realidad personal o social."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura de artículos de opinión sobre temas controversiales de su realidad personal o social; lectura atenta en la prensa escrita (virtual o impresa); anticipación del contenido de la lectura a partir del título y otras marcas textuales. Utilización de la estructura para comprender su contenido. Utilización del diccionario para buscar la definición de las palabras cuyo significado no ha podido inferir; identificación de la tesis defendida por el/la autor/a del artículo de opinión que lee y de los argumentos que ofrece, utilizando la técnica del subrayado. Realización de las inferencias necesarias para comprender el artículo que lee; paráfrasis de la tesis y de los argumentos del/de la autora/a."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Selección de la temática que va a desarrollar en el artículo de opinión; investigación de la temática o problemática que va a desarrollar. Establecimiento de la intención comunicativa; planificación de la tesis y los argumentos que va a desarrollar; selección del vocabulario apropiado a la intención comunicativa, a la audiencia y al tema seleccionado. Estructuración del artículo que va a producir; escritura de borradores, manuscritos, digitales, ajustándose al tema del comentario (punto de partida, tesis, argumentos, conclusión); asignación de un título y/o (y un subtítulo, si es necesario) en función del contenido del texto; revisión y corrección del artículo que escribe, tomando en cuenta las sugerencias de sus pares y del/de la docente, además de las ideas propias, atendiendo a la intención comunicativa, al tema, a la audiencia, a la estructura del texto, a los párrafos, las oraciones, al léxico y la ortografía. • Tolerancia frente al punt o de vista que adopta el/la autor/a del artículo de opinión que lee. El cuento social, político, cultural • Función y estructura • Tipos • Elementos del cuento • La forma narrativa • Tipos de narrador • Los actantes • Recursos lingüísticos y literarios • El diálogo direct o e indirecto • El verbo: modo indicativ o y subjuntivo, tiempos: pretérito indefinido, pretérito imperfecto y pretérito compuesto • El adverbio de tiempo y espacio • Conector es coordinantes y subordinantes • Variantes lingüísticas"
          },
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de cuentos leídos por el/la profesor/a o grabados de la radio, del Internet o la televisión; anticipación del contenido a través del título y otras marcas textuales; inferencia, a partir del contexto del significado de las palabras que desconoce. Realización de las inferencias necesarias para comprender el sentido del cuento que escucha en forma oral o grabada. Reconocimiento de los personajes (principales, secundarios, ambientales, incidentales o fugaces) y de los actantes (sujeto, objeto, colaborador, aliado, cómplice, oponente) para comprender las motivaciones que definen sus acciones. Producción oral (hablar) Descripción del ambiente físico (cerrado, abierto, rural) y psicológico (conflicto, angustia, opresivo, alegre) para establecer la relación de influencia con los personajes; utilización de los elementos formales de la lengua propios de este tipo de texto: tiempos verbales, adjetivos, adverbios de tiempo y de secuencia, así como conectores lógicos para dar a entender con mayor claridad el texto narrado. Modulación, entonación, matización y cambios de voz en las entradas de los personajes, según sus actitudes y acciones para una mejor comprensión del cuento narrado. Narración del cuento ajustándose a la estructura, los elementos y la intención comunicativa. Resumen o paráfrasis de la historia contada. Comprensión escrita (leer) Establecimiento de un propósito para la lectura del cuento social y cultural. Inferencia del contenido del cuento a partir del título y otras marcas paratextuales (imagen, color, gráficos, cubierta). Utilización del diccionario en formato impreso, digital o virtual para buscar la definición de las palabras y expresiones cuyo significado no ha podido inferir. Lectura en silencioo en voz alta, en material impreso o en la pantalla, respetando las convenciones de la lengua escrita. Utilización de la estructura del cuento (esquema narrativo): la introducción, la complicación, la resolución y la evaluación para comprender el texto. Reconocimiento de los personajes (principales, secundarios, ambientales, incidentales o fugaces) y los actantes (sujeto, objeto, aliado, oponente) para comprender las motivaciones que definen sus acciones y funciones; utilización y reconocimiento de conectores coordinantes y subordinantes (y, e, ni, que, porque, ya que, de este modo, pues, por eso, de ahí que) para comprender la relación, coherencia y orden lógico en la narración. • Apreciación de los estímulos y emociones que prov oca la escucha de cuentos de contenido social, político, cultural. • Valoración de la creatividad, coher encia, grado de interés e imaginación del/ de la /autor/a al concebir el cuento. • Interés por nar rar cuentos sobre temas sociales, políticos, culturales para el disfrute de los y las demás. 86 Contenidos Conceptos Procedimientos Actitudes y Valores Producción escrita (escribir) Establecimiento de la intención comunicativa del cuento sobre temas de la realidad social, política o cultural que escribirá. Elección del tema o trama que abordará. Elaboración de un esquema secuencial que servirá de guion para la escritura del cuento; utilización de elementos formales y gramaticales (verbos, adverbios, pronombres) en la producción escrita; utilización de un vocabulario según la intención comunicativa, los personajes que intervienen y el tema tratado. Recreación del escenario o ambiente en el que actuarán los personajes de la historia; escritura de los borradores del cuento social, político o cultural, tomando en cuenta la intención, los/las interlocutores/as, la estructura y las convenciones de la lengua escrita. Revisión y corrección del relato compartiéndolo con compañeros y compañeras y con profesores/as; edición final y publicación en formato físico o digital. • Curiosidad por conocer el tema, desar rollo y desenlace de los hechos narrados en el cuento que lee. • Valoración del tema y la trama del cuento social , político o cultural que lee para conocer actitudes, sentimientos, valores y antivalores humanos. • Interés por dar a conocer su pr oducción del cuento a sus compañeros y compañeras y otros/as lectores/as."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El cuento social, político, cultural",
        "proceduralItems": [],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El madrigal",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de madrigales de autores españoles, latinoamericanos, caribeños y dominicanos, acordes a la intención comunicativa que quiere expresar; verbalización de figuras literarias (epíteto, personificación, hipérbole, hipérbaton, sinestesia), la rima y los versos del madrigal, usando la entonación y lenguaje gestual, acordes a la intención comunicativa y a los sentimientos que se quieren expresar. Uso de cambios de voz y de entonación, atendiendo a los sentimientos que el madrigal transmite."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Anticipación del contenido del madrigal a partir del título; establecimiento de un propósito para la lectura; inferencia a partir del contexto del significado de las palabras que desconoce. Reconocimiento de la intención comunicativa del autor y de los sentimientos que expresa. Uso de la estructura (versos de siete y once sílabas), para comprender su significado; utilización de la rima y el ritmo y las figuras literarias (epíteto, personificación, hipérbole, hipérbaton, sinestesia) presentes para comprender sus significados implícitos y disfrutar de las emociones que provoca; paráfrasis del sentido poético, utilizando el vocabulario de este tipo de texto."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa del texto que va a producir; selección del tema del madrigal; uso de la rima consonante de versos heptasílabos y endecasílabos. Utilización de vocabulario, el sentimiento o emoción que quiere expresar; utilización de figuras literarias: epíteto, personificación, hipérbole, hipérbaton, sinestesia en su producción escrita; escritura de borradores, atendiendo su estructura, rima, figuras literarias y vocabulario; revisión y corrección de borradores con ayuda del docente y los compañeros. Edición y publicación del madrigal en un mural, en un libro artesanal o en una revista escolar. • Disfrute al escuchar madrigales. • Valoración de la función lúdica y estética de la lengua oral. • Disfrute al recitar madrigales en v oz alta. • Disfrute al leer madrigales. • Disfrute e interés al escr ibir madrigales. • Valoración de la función lúdica y estética de la lengua escrita. • Valoración de la forma y expr esión de sentimientos y emociones en los madrigales que escribe."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      }
    ],
    "4to": [
      {
        "topic": "La crónica",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "• Establecimiento de la intención comunicativa de la crónica que pr oducirá oralmente; selección del suceso de actualidad sobre el cual versará el texto; narración de acuerdo con la intención comunicativa y los interlocutores, ajustándose a los sucesos ocurridos. • Utilización de conector es temporales para secuenciar los sucesos ocurridos en orden cronológico; los pronombres personales, la voz pasiva y oraciones coordinadas, yuxtapuestas y subordinadas para ampliar de manera precisa y ordenada detalles de los sucesos ocurridos; utilización de sinónimos para evitar la repetición de palabras y dar cohesión a los sucesos narrados; modalización de los hechos, utilizando los adverbios de modo necesarios para transmitir la información."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "• Establecimiento de un propósito para la lec tura de una crónica; anticipación del contenido a partir del título y otras marcas paratextuales (título, volanta, copete, fotografía y epígrafe); utilización de la estructura narrativa y de los componentes destacados para comprender la información relevante en el texto dado; inferencia a partir del contexto del significado de las palabras cuyo significado desconoce; utilización del diccionario en formato físico, virtual o digital para buscar las palabras, cuyo sentido no ha podido inferir; inferencia de la secuencia de los hechos a través de los conectores utilizados en la crónica. Realización de las inferencias necesarias para comprender el sentido global de la crónica. • Valoración de la crónica como medio para infor marse de sucesos locales y globales. • Interés y cur iosidad por escuchar crónicas. • Valoración de la importancia de inv estigar los hechos seleccionados para ser narrados en la crónica"
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "• Establecimiento de la intención comunicativa de la crónica; in vestigación de los sucesos, las causas y las posibles consecuencias que se destacan en el texto. Selección de la información relevante sobre los hechos que se resaltan; elaboración de un esquema para organizar la información que presentará el contenido. • Determinación de la audiencia a la que dir igirá la crónica y el registro que utilizará para transmitir la información; empleo de adverbios, adjetivos, pronombres y conectores de temporalidad necesarios para transmitir la información de forma coherente y cohesiva. • Elaboración de los borradores necesar ios para la redacción final, enfatizando la corrección de los problemas de revisión de la normativa; revisión y corrección de borradores con ayuda del docente y de los compañeros y las compañeras; edición y publicación de la crónica, en formato físico o virtual."
          },
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "• Escucha atenta de instructivos leídos por el/la docent e, un compañero o compañera, sobre el uso juegos diversos; el ensamblaje de muebles y juguetes; anticipación del contenido d"
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El instructivo",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "• Establecimiento de la intención comunicativa del instructiv o que produce oralmente; selección y justificación del tema que produce oralmente, así como de las fuentes de información que utiliza, en versión física y/o digital. Desarrollo de estrategias de selección, registro y organización de la información necesaria para estructurar el informe que produce oralmente. • Selección del léxico técnico o especializado, según los destinatar ios y el área temática que produce de manera oral; utilización de adverbios y construcciones adverbiales para especificar las acciones del instructivo que produce; incorporación de recursos no verbales (gestos faciales, miradas, movimientos, postura corporal, entonación, ritmo, intensidad) para apoyar el contenido lingüístico que produce. Asignación de un título coherente con el contenido de producción oral. • Valoración crítica de la crónica que escucha. • Interés por nar rar con claridad, precisión, orden y concisión los sucesos de la crónica. • Veracidad en la narración de los hechos seleccionados en la crónica. El instruc tivo • Función y estructura • El \"se\" impersonal • El infinitivo • Conector es de orden, finalidad • Adverbios o construcciones adv erbiales"
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "• Establecimiento de un propósito para la lec tura sobre el uso de juegos diversos; el ensamblaje de muebles y juguetes; anticipación del contenido, a partir del título y otras marcas textuales y paratextuales (viñetas, numeración, dibujos, imágenes…), si las tuviera. Inferencia de la intención del instructivo que lee en soporte físico y/o digital, a partir de su estructura y el vocabulario temático que le es propio. • Inferencia a par tir del contexto del significado de las palabras que desconoce; utilización del diccionario en versión física y/o digital para comprender el sentido de las palabras que lee cuyo significado no ha podido inferir; realización de inferencias basadas en el contenido (tema, ideas principales y secundarias) para construir el sentido global del contenido que leee. • Capacidad de ejecución ordenada y lógica de las acciones cont enidas en el instructivo que escucha. • Desarrollo del sentido lóg ico al expresar oralmente los procedimientos del instructivo."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El informe de investigación",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "• Establecimiento de un propósito para la escucha del inf orme de investigación; anticipación el contenido a partir de marcas textuales; realización de inferencias basadas en la estructura de investigación que escucha; realización de inferencias basadas en las relaciones locales que existen entre las ideas contenidas que escucha. Identificación de los conectores de contraste, adición, cierre, explicación, ejemplificación y finalidad para comprender las relaciones lógicas entre las ideas contenidas en las diferentes partes presentadas; identificación de los procedimientos (analogía, ejemplificación, deducción, de autoridad) que ha utilizado el autor del informe para comprender los argumentos que sustentan la tesis de la investigación. • Paráfrasis del sentido global del informe de in vestigación que escucha, a partir del problema planteado, los objetivos de la investigación, la metodología, las bases teóricas, el análisis de los resultados, las conclusiones y recomendaciones, ajustándose a la intención comunicativa y a la estructura de este tipo de texto. Resumen del contenido mediante la omisión de información no relevante, selección de las ideas principales, generalización y reconstrucción que representan el sentido global del texto."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "• Establecimiento de la situación de comunicación (intención y destinatarios) que pr oduce de forma oral; selección y justificación de las fuentes bibliográficas, en versión física y/o digital, a utilizar para producir por escrito las ideas del contenido; desarrollo de estrategias de registro y organización para estructurar el informe de investigación. Estructuración de las ideas, atendiendo a las partes que lo componen y al uso de la gramática específica (formas impersonales del verbo, conectores de contraste, adición, cierre, explicación, ejemplificación, finalidad, adverbios de frecuencia, de cantidad y de modo). • Articulación de los ar gumentos que le permitan sustentar la tesis de la investigación que reporta en el informe, haciendo uso de los diversos procedimientos: analogía, deducción y de autoridad. Selección del léxico a la intención comunicativa, a los interlocutores y al vocabulario temático de la investigación. utilización de diversos mecanismos de citación para desarrollar el marco teórico y el análisis de los resultados finales."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "• Establecimiento de un propósito para la lec tura del informe de investigación; anticipación del contenido de investigación a partir de marcas textuales y paratextuales (gráficos, tablas, cuadros, elementos tipográficos), activación de los conocimientos previos relacionados con el tema de investigación; inferencia de la intención comunicativa del texto que lee, mediante su estructura y el vocabulario que le es propio. • Utilización del diccionario en versión física y/o dig ital para buscar la definición de palabras cuyo significado no ha podido inferir en el texto; realización de inferencias basadas en la estructura de la información que lee. Realización de inferencias basadas en las relaciones locales que existen entre las ideas del contenido que lee; identificación de los conectores de contraste, adición, cierre, explicación, ejemplificación y finalidad para comprender las relaciones lógicas entre las ideas contenidas en la investigación. • Interés , curiosidad y criticidad frente al contenido del informe de investigación que escucha. • Apertura ante las observaciones que otr os (expertos, docente, compañeros y compañeras) puedan hacer a su informe de investigación. • Claridad al evidenciar la vo z propia y la voz de otros autores en las ideas contenidas en el informe de investigación. • Honestidad al presentar los resultados de la inv estigación. • Interés por escr ibir informes de investigación dirigidos a un público general, sobre temas y problemas de interés escolar y/o comunitario. 98 Contenidos Conceptos Procedimientos"
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "• Establecimiento de la situación de comunicación (intención y destinatarios) del inf orme de investigación que escribe. Selección y justificación del tema sobre el que escribirá a partir de un problema detectado. Selección y justificación de las fuentes bibliográficas, en versión física y/o digital, a utilizar para producir por escrito los resultados finales. Desarrollo de estrategias de registro y organización de la información para estructurar el informe que escribe. • Estructuración de las ideas del informe , atendiendo a las partes que lo componen y al uso de la gramática específica (formas impersonales del verbo, conectores de contraste, adición, cierre, explicación, ejemplificación y finalidad, adverbios de frecuencia, de cantidad y de modo). • Articulación de los argumentos que le per mitan sustentar la tesis de la investigación que reporta en el informe, haciendo uso de los diversos procedimientos: analogía, ejemplificación, deducción, de autoridad. • Utilización de recursos paratex tuales (tablas, gráficos, cuadros, elementos tipográficos…) para ilustrar el contenido que escribe; selección del léxico a la intención comunicativa, a los interlocutores y al vocabulario temático del informe; asignación de un título coherente con el contenido; utilización de diversos mecanismos de citación para desarrollar el marco teórico y el análisis de los resultados de la investigación."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El artículo de opinión",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "• Escucha atenta del artículo de opinión leído por un compañero o compañera, o por el docent e; anticipación del contenido a partir del título, subtítulo y otras marcas textuales. Utilización de la estructura del artículo de opinión (introducción, tesis, argumentos y conclusión) para comprender su contenido. Realización de inferencias basadas en las relaciones lógicas de las ideas que escucha, apoyándose en los conectores de adición, ejemplificación, explicación, recapitulación y cierre; en el vocabulario temático y en la gramática propia de este tipo de texto. • Realización de inferencias basadas en los hechos y las opiniones emitidas en el ar tículo de opinión que escucha. Paráfrasis de la tesis y los argumentos que utiliza el autor del artículo de opinión que escucha; resumen del contenido que lee partiendo de la identificación de las ideas principales (argumentos y tesis) y secundarias en cada párrafo."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "• Selección de la temática a desarrollar en el artículo de opinión; investigación en fuentes diversas de la temática a desarrollar. Establecimiento de la intención comunicativa que posteriormente producirá por escrito: criticar, convencer, defender, etc. Planificación de la opinión y los argumentos a desarrollar en el artículo de opinión. Selección del vocabulario apropiado a la intención comunicativa a la audiencia y al tema escogido. • Estructuración de las ideas tomando en cuenta el vocabular io temático, los conectores, las estrategias y recursos argumentativos; estructuración de contraargumentos para debilitar posibles puntos de vista contrarios que pueda tener la audiencia sobre el tema del artículo de opinión. Organización de los argumentos a presentar en el artículo de opinión, en función del criterio de importancia, para lograr la intención previamente establecida (convencer, defender, criticar…)."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "• Lectura atenta del ar tículo de opinión en la prensa escrita (virtual o impresa); anticipación del contenido a partir del título, subtítulo y otras marcas textuales; utilización de la estructura (introducción, tesis, argumentos y conclusión) para comprender su contenido; realización de inferencias basadas en las relaciones lógicas de las ideas que lee, apoyándose en los conectores de adición, ejemplificación, explicación, recapitulación y cierre; el vocabulario temático y en la gramática propia de este tipo de texto. • Realización de inferencias basadas en los hechos y las opiniones emitidas que lee . Paráfrasis de la tesis y los argumentos que utiliza el autor del artículo de opinión que lee. • Tolerancia frente a las opiniones y juicios de valor del ar tículo de opinión que escucha. • Capacidad para tomar una postura crítica fr ente a las opiniones emitidas por el/ la autor/a del artículo de opinión que escucha y que lee. • Capacidad de producir por escrit o artículo de opinión bien estructurado con argumentos lógicos y coherentes."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "• Selección del tema sobre el cual r edactará el artículo de opinión; asignación de un título coherente con el contenido a desarrollar. Establecimiento de la intención comunicativa: criticar, convencer, defender, etc. Planificación de la tesis y los argumentos a desarrollar en el artículo de opinión; selección del vocabulario apropiado a la intención comunicativa, a la audiencia y al tema seleccionado; las oraciones compuestas subordinadas adverbiales, sustantivas y adjetivas; la pregunta retórica, las expresiones y verbos de opinión y el vocabulario temático. • Estructuración de contraar gumentos para debilitar posibles puntos de vista contrarios que pueda tener la audiencia sobre el tema. Utilización de elementos paratextuales (gráficos, imágenes, elementos tipográficos…) para reforzar la argumentación; utilización de citas textuales o datos estadísticos para apoyar sus ideas en el artículo que escribe; revisión, con ayuda del/de la docente, de un compañero o de una compañera, de la opinión que produce por escrito, ajustándose al tema, a la estructura, a la intención comunicativa y a los destinatarios; edición del artículo que produce por escrito, tomando en cuenta las convenciones de la escritura: uso de márgenes, separación de oraciones y párrafos, uso de letras, de las mayúsculas, la tilde y los signos de puntuación; publicación que produce por escrito en medios físicos (murales del aula y de la escuela, revista o periódico escolar…) y/o digitales (página web de la escuela, blogs…). Comprensión oral (escuchar) • Establecimiento de un propósito comunicativ o para escuchar discursos de agradecimiento; escucha atenta de discursos de agradecimiento; anticipación del contenido del discurso de agradecimiento a partir de lo que escucha en la introducción; inferencia a partir del contexto, del significado de palabras desconocidas. • Reconocimiento de la tesis que pr esenta la importancia de agradecer a la persona o entidad por la cual se realizó el discurso. Identificación de las razones por las que es necesario que se realice un discurso de agradecimiento. Identificación de la apertura y del cierre del discurso de agradecimiento a través de los conectores que indican estos procesos; reconocimiento de las referencias léxicas de persona y de la autorreferencia presentada en los deícticos de las personas gramaticales. • Reconocimiento de las marcas de ag radecimiento, de cortesía; uso de los organizadores intratextuales y los conectores de causa y efecto; identificación de la postura del orador por medio de las expresiones que lo indican; Paráfrasis del contenido global del discurso que escucha, tomando en cuenta la estructura textual, la intención comunicativa, el tema, la tesis y las diversas razones que expone el orador al dirigirse a su público. El discurso oral de agradecimiento • Función y estructura • Caracter ísticas • Roles de los participantes • Referencias léxicas • La autorref erencia en los deícticos • Conector es de apertura, de cierre, de causa• efecto • Marcas de agradecimient o, de cortesía • Organizadores para introducir otras v oces intratextuales • La secuencia argumentativa • Elementos paralingüísticos Pr oducción oral (hablar) • Establecimiento de un propósito comunicativ o para producir oralmente discursos; anticipación del contenido y la introducción; empleo de las referencias lexicales de personas y de la autorreferencia presentada en los deícticos gramaticales; producción oral de discursos de agradecimiento, tomando en cuenta la situación contextual y la estructura (punto de partida, tesis, argumentos, conclusión). • Empleo de las marcas de cortesía, de ag radecimiento (según sea la ocasión) y de expresiones que indican postura del orador; empleo de organizadores intratextuales que remitan a una parte anterior en el discurso e intertextuales para introducir otras voces en el texto. Utilización de elementos paralingüísticos y extralingüísticos propios de la comunicación oral para optimizar su presentación ante el público. • Empleo de estrategias para mantener la at ención de público: mirar a los ojos a alguno de los presentes, entonación, postura relajada, gesticulación, vocabulario acorde al contexto, muestra alegría y entusiasmo, involucra a sus oyentes con el uso de verbos en primera o segunda persona del plural; validación de las citas a través de la correcta presentación de las fuentes bibliográficas utilizadas. Establecimiento de la tesis que presenta la importancia de agradecer a la persona y/o entidad por la cual se realizó el discurso. • Interés y cur iosidad por escuchar otros discursos de agradecimiento que puedan servir de referentes al momento de producir los propios. • Capacidad para expresarse estratég icamente y lograr el propósito comunicativo de discurso al secuenciar las ideas de forma lógica. 100 Contenidos Conceptos Procedimientos"
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El discurso oral de agradecimiento",
        "proceduralItems": [],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "La novela",
        "proceduralItems": [
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "• Lectura atenta acor de con la edad e intereses; anticipación del contenido de la novela de aventuras a partir del título y otras marcas textuales y paratextuales; utilización de la estructura de la novela (inicio, nudo y desenlace), de los verbos en pasado y presente, de los conectores, de los adjetivos, de la distinción entre narrador y personajes, las fórmulas de inicio y de cierre para comprender su contenido. • Utilización del diccionario para conocer el significado de las palabras desconocidas , cuyo sentido no ha podido inferir; identificación de las distintas voces (narrador y personajes) que intervienen en la novela para su comprensión; realización de las inferencias necesarias para comprender el sentido del texto que lee; identificación de las acciones realizadas por los personajes de la novela e inferencias sobre la relación de causalidad entre ellas. • Distinción entre el narrador y los personajes para comprender la trama r elatada; identificación del o los temas de la novela. Paráfrasis de las acciones principales, usando el vocabulario apropiado y mediante el uso de sinónimos y otros recursos; resumen del contenido que lee, apoyándose en el narrador. • Disfrute al escuchar novelas que despier tan su imaginación y creatividad. • Valoración de la función lúdica y estética de la lengua. • Interés y cur iosidad por realizar predicciones de novelas que escucha. • Disfrute al leer novelas para f omentar su imaginación y creatividad. • Valoración de la función lúdica y estética de la lengua. • Valoración del trabajo creativo de los/las escr itores/as cuyas novelas lee."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El soneto",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "• Selección de sonetos de autor es dominicanos, latinoamericanos y españoles, representativos de este tipo de poema; verbalización de las figuras literarias, la rima, el ritmo y los versos del soneto usando la entonación y el lenguaje gestual acordes a la intención comunicativa, el tema y a los sentimientos que se quieren expresar. • Utilización de cambios de voz y ent onación atendiendo a los sentimientos que el soneto evoca; adecuación del lenguaje gestual y corporal con la intención comunicativa y los sentimientos el texto."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "• Anticipación del contenido del soneto a par tir del título y otras marcas textuales y paratextuales; establecimiento de un propósito para su lectura; reconocimiento de la intención comunicativa del autor y de los sentimientos que el texto evoca. • Disfrute al escuchar los sonetos seleccionados. • Valoración de la función lúdica y estética del soneto como expr esión poética. • Demostración de placer estético al recitar sonet os de contenido diverso. • Valoración del lenguaje corporal como soport e del lenguaje verbal para transmitir emociones y sentimientos a través del soneto. 102 Contenidos Conceptos Procedimientos"
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "• Establecimiento de la intención comunicativa del soneto que va a producir por escrito; selección del tema, personaje, hecho o situación que enfocará en el soneto. Uso de la rima consonante y de versos endecasílabos para escribir el soneto; utilización del vocabulario apropiado a su intención comunicativa y a los sentimientos que se quieren evocar con el poema. • Utilización de los recursos literar ios que demanda el texto según el tema, los sentimientos que evoca, la creatividad y el ritmo; escritura de borradores, atendiendo a la emoción y el sentimiento que se quiere expresar a la intención comunicativa, la estructura, los recursos estilísticos, el vocabulario y la corrección ortográfica. • Revisión y corrección de borradores con ayuda del docente y los compañeros y compañeras de clases; edición y publicación de éstos en los murales del aula, en los diferentes blogs de los grupos, así como en un libro artesanal o en una revista escolar. • Sensibilidad y la creatividad en la producción de sonet os sobre diversos temas. • Valoración del soneto para recr ear, denunciar, analizar, caricaturizar personajes, hechos, problemáticas y sucesos del medio circundante y exterior."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      }
    ],
    "5to": [
      {
        "topic": "La carta de autopresentación",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa de la carta: (presentación de intereses, preparación, experiencias y habilidades que posee), expresado mediante oraciones claras y coherentes las capacidades, las razones y argumentos que justifican la autopresentación. Inclusión de conectores de finalidad, de adición y causa• efecto para explicar las razones e intereses que motivan la carta, haciendo uso de un vocabulario apropiado a la intención comunicativa y a los destinatarios."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura de la carta de autopresentación, anticipando el contenido a partir de la silueta, de fragmentos leídos y de otras marcas textuales, haciendo uso de inferencias acerca de la intención comunicativa. Utilización de la estructura de la carta de autopresentación: (lugar y fecha, destinatario, saludo, cuerpo o asunto que la motiva, despedida y firma) para comprender su contenido, identifica los conectores de finalidad, de adición y de causa• efecto que explican las razones a partir del contexto, del significado de las palabras que desconoce, y utilizando el diccionario en versión física o digital para comprender el sentido global. • Curiosidad e inter és al escuchar la lectura de cartas de autopresentación por parte de sus pares o del/de la docente. • Valoración de la carta como un medio para dar a conocer la preparación, exper iencias y habilidades que se poseen. • Creatividad y lógica al expresar los motiv os de la carta de autopresentación. • Criticidad para valorar las caracter ísticas, intereses, habilidades, experiencias y razones que justifican la autopresentación en las cartas que escribe."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "La reseña",
        "proceduralItems": [
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa de la carta de autopresentación que escribe: presentación de intereses, preparación, experiencias y habilidades que se poseen, selección del/de los destinatarios (s) y del soporte (físico o digital) y de los argumentos que justifican el motivo y uso de vocabulario temático (interés, tener, poseer, candidato/a, experiencia, habilidad, oportunidad, logro) ajustado a la intención. Escritura de borradores ajustándose a la estructura (lugar y fecha, destinatario, cargo o estatus, saludo, cuerpo o asunto de la carta, despedida y firma), revisión y corrección tomando en cuenta la brevedad y credibilidad en el contenido, con la ayuda del/de la docente y de las compañeras y compañeros. Edición de la versión final utilizando medios físicos y/o digitales, selección y llenado, tomando en cuenta el protocolo para la escritura del mismo (datos del remitente y destinatario de manera convencional) y envío de la versión final utilizando el correo electrónico y/o el correo tradicional."
          },
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Establecimiento de un propósito para la escucha de la reseña leída por el docente, por un compañero o compañera, a partir de marcas textuales. Realización de inferencias basadas en la situación de comunicación en que se produce la reseña (intención, autor, audiencia, tema), relaciones lógicas entre las ideas, a partir del contexto, del significado de las palabras que no conoce para realizar una paráfrasis del sentido global, apoyándose en el argumento de la obra, el tiempo, el lugar de los personajes, sus interacciones, el tema, los diálogos y el género al que pertenece."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa de la reseña que el destinatario producirá, selección de la fuente de información, citas claves (del reportaje, película, documental, obra teatral) y testimonios (del autor, personaje de la película, espectáculo) que incluirá. Registro de la información (argumento y valoración personal) necesaria para estructurar el contenido, organización de las ideas, utilización de los conectores entre las oraciones y los párrafos para mantener la cohesión, las relaciones de coherencia y el uso de vocabulario adecuado al contexto y a la función. • Valoración de la importancia de la reseña de obras per tenecientes al género audiovisual y/o de una novela leída para conocer el contenido de una determinada obra y la opinión del/ la autor/a sobre la misma. • Interés por compr ender el punto de vista del/ la autor/a de la reseña que escucha y lee. • Reflexión sobre los valores pr omovidos en la reseña que escucha y lee. • Desarrollo de la capacidad de or ganización y síntesis al estructurar las ideas referentes al argumento de la obra que va a reseñar."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El ensayo argumentativo",
        "proceduralItems": [
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura de la reseña: en silencio o en voz alta, anticipando el contenido a partir de marcas textuales y paratextuales, realizando inferencias basadas en la situación de comunicación (intención, autor, audiencia, tema) y a través de relaciones lógicas entre las ideas. Utilización de la estructura para comprender su contenido, a partir del contexto del significado de las palabras temáticas que no conoce, uso de diccionario en versión física y/o digital y paráfrasis del sentido global de la reseña que lee."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Selección de la obra temática y la intención comunicativa sobre la cual redactará citas claves (del reportaje, película, documental, obra teatral) y testimonios (del autor, personaje de la película, espectáculo) para incluirlas en la reseña. Planificación de la obra, tomando en cuenta su estructura (título, ficha bibliográfica, resumen del argumento y valoración personal) y contenido (códigos, actores, director, técnicos, público, elementos verbales, paraverbales y no verbales). Selección del vocabulario apropiado y al tema para la audiencia, utiliza conectores de adición y cierre para expresar sus ideas de modo coherente, redacta de un primer borrador de la reseña manuscrito o digital, revisa y corrige la reseña de manera individual y con la colaboración del/de la docente y de sus compañeros o compañeras, edita y publica en soporte físico o digital. • Tolerancia y respeto fr ente a las opiniones y juicios de valor que expresa el autor del ensayo argumentativo que escucha. • Valoración del uso de la lengua para dar su opinión sobre temas contr oversiales del entorno y la realidad nacional e internacional. • Criticidad al asumir una postura frente a los t emas y problemáticas que aborda el ensayo argumentativo leído. • Interés por dar a conocer su opinión acer ca de una determinada temática, a través del ensayo argumentativo que ha escrito. 106 Nota: Debido a que el ensayo argumentativo es un texto de naturaleza esencialmen- te escrita, la competencia de producción oral servirá solo para desarrollar proce - dimientos que fortalezcan y complementen la compren- sión y producción escrita."
          },
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Establecimiento de un propósito para la escucha del ensayo argumentativo leídos por el docente y los compañeros de clases; realiza inferencias a partir del título y elementos paratextuales para anticipar posibles contenidos basadas en la intención y el tipo de audiencia. Utilización de la estructura del ensayo argumentativo para comprender su contenido globalmente, del contexto y sentido a partir de palabras cuyos significados desconoce, realizando inferencias para comprender la tesis central del ensayo y los argumentos utilizados para apoyarla, identifica formas personales como: \"pienso que\" , \"me parece que\" , para comprender cuando el autor del ensayo sostiene una opinión. Identificación de fórmulas como \"Según…\" , \"De acuerdo con…\" , para comprender cuando el autor del ensayo introduce las citas o argumentos de autoridad; basadas en las relaciones lógicas entre las ideas contenidas en el ensayo argumentativo, apoyándose en los conectores utilizados; resumen del contenido del ensayo, mediante la omisión de información no relevante, selección de las ideas principales (argumentos), generalización y reconstrucción de las ideas que representan el sentido global del texto."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la situación de comunicación del ensayo argumentativo que producirá por escrito: intención y audiencia. Selección y justificación del tema sobre el que escribirá el ensayo argumentativo; asignación de un título posible; planificación de la tesis o punto de vista que defenderá; las fuentes de información de donde tomará los argumentos y contraargumentos; uso del léxico adecuado con el tema, la intención, los destinatarios, los conectores de digresión, adición, contraste, consecuencia y orden para dar cohesión al ensayo. El discurso oral de recibimiento y despedida • Función y estructura • Caracter ísticas • Roles de los participantes: orador y público • Referencias léxicas de personas • La autorref erencia en los deícticos • Las personas gramaticales • Conector es de apertura, cierre Comprensión escrita (leer) Anticipación del contenido del ensayo argumentativo que lee a partir de marcas textuales y paratextuales; establece un propósito; infiere sobre la estructura, la intención, el tipo de audiencia y el uso de diccionario para comprender palabras cuyo significado desconoce y su contenido global. Realización de inferencias para comprender la tesis central del ensayo que lee y los argumentos utilizados para apoyarla; basadas en las relaciones lógicas e ideas principales para conocer el sentido global del texto. Producción escrita (escribir) Establecimiento de la situación de comunicación del ensayo argumentativo que produce: intención, audiencia/destinatarios, justificación del tema, título posible, tesis o punto de vista, las fuentes y organización de la información según la estructura canónica del texto. Utilización del léxico adecuado con el tema, uso de conectores de digresión, adición, contraste, consecuencia y orden para dar cohesión al ensayo argumentativo que escribe; empleo de formas personales: \"pienso que\" , \"me parece que\" ... fórmulas para introducir las citas: \"Según…\" , \"De acuerdo con…\"; revisión con ayuda del/de la docente, de un compañero o de una compañera. Edición del ensayo argumentativo que produce por escrito, tomando en cuenta las convenciones de la escritura: uso de márgenes, separación de oraciones y párrafos, uso de las mayúsculas, la tilde y los signos de puntuación."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El discurso oral de recibimiento y despedida",
        "proceduralItems": [],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "La novela",
        "proceduralItems": [
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de un propósito comunicativo para producir por escrito el discurso que será oralizado, información necesaria, selecciona del soporte (físico y/o digital) sobre el que realizarán los esquemas o guiones, organiza las ideas de manera lógica, la estructura (punto de partida, tesis, argumentos, conclusión), la escritura convencional, signos de puntuación para hacer citas textuales: comillas, paréntesis, puntos suspensivos, las referencias léxicas de persona, autorreferencial y los deícticos de las personas gramaticales. Utilización de conectores de apertura y cierre y de causa - efecto, empleo de las marcas tanto de cortesía como de recibimiento y despedida, organizadores intratextuales, y uso de la (s) cita (s) a través de la correcta presentación de las fuentes bibliográfica utilizadas. Redacción, revisión y corrección de borradores de discursos, manuscritos y/o digitales, tomando en cuenta su estructura textual, intención comunicativa, destinatarios, vocabulario temático y gramática textual, aprovechando la ayuda del/de la docente, de los compañeros y compañeras. 108 • Conectores temporales, causales y consecutivos • Organizadores discursivos • Verbos en pasado y present e • Los adjetivos • El narrador (primera, t ercera persona) y los personajes • Temas de la novela • Los personajes principales y secundarios , protagonista y antagonista • Los tipos de actantes: agent e, paciente, beneficiario, cómplice, ayudante, ponente, aliado Nota: Para este tipo de texto se priorizará la comprensión tanto oral como escrita."
          },
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de novelas cortas acordes con la edad e intereses, anticipando el contenido a partir del título y otras marcas textuales; uso de la estructura de la novela (inicio, nudo y desenlace), los verbos en pasado y presente, de los conectores, de los adjetivos, de la distinción entre narrador y personajes para comprender su contenido. Inferencia a partir del contexto, del significado de las palabras cuyo significado desconoce para comprender el sentido global de la novela, identifica las acciones realizadas por los personajes de la novela y sobre la relación de causalidad entre ellas; distinción entre el narrador y los personajes para comprender la trama y el tema; uso vocabulario apropiado; y resumen del contenido, apoyándose en el narrador, los personajes, las acciones, el ambiente y la atmósfera, el o los temas y los diálogos de los personajes."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura de la novela; anticipación del contenido de la novela a partir del título, y otras marcas textuales y paratextuales, usos de la estructura de la novela (inicio, nudo y desenlace), de los conectores, de los verbos en pasado y presente, de los adjetivos, de la distinción entre narrador y personajes y de las fórmulas de inicio y de cierre para comprender su contenido. Inferencia a partir del contexto del significado de las palabras que desconoce, usa diccionario, identifica las distintas voces (narrador y personajes) que intervienen en la novela, para la comprensión del sentido global; identifica y clasifica los personajes, las intenciones de las acciones; usando un vocabulario apropiado y mediante el uso de sinónimos y otros recursos; y resumen apoyándose en el narrador, los personajes, las acciones, el ambiente y la atmósfera, el o los temas y los diálogos de los personajes. • Disfrute al escuchar novelas cor tas que fomenta su imaginación y creatividad. • Valoración de la función lúdica y estética de la lengua. • Valoración de la importancia de reconocer los sentimient os y motivaciones de los personajes. • Disfrute al leer novelas para f omentar su imaginación y creatividad. • Valoración del trabajo creativo de los escr itores cuyas novelas lee. La poesía satírica • Función y estructura • Ironía, farsa, caricatura • Sarcasmo, parodia • Tono burlesco • Verso y prosa • Recursos estilísticos: imágenes (visuales, auditivas, olfativas , táctiles y gustativas) • Recursos estilísticos: • figuras (antítesis, paralelismo, ex ecración, epíteto, deprecación, comparación) • Recursos estilísticos: tropos (metáfora). • Exclamación. Comprensión or al (escuchar) Anticipación del contenido del poema a partir del título, escucha atenta de poemas satíricos de autores dominicanos, latinoamericanos y españoles sobre personajes, hechos diversos, presentes y pasados. Inferencias a partir del contexto del significado de las palabras que se desconocen, reconocimiento de los sentimientos evocados y la intención comunicativa del autor, comprensión y disfrute de los significados, explícitos e implícitos y de las emociones que provoca los poemas escuchados, identificación de los cambios y matices de entonación, según la temática y los sentimientos que el poema evoca."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de poemas de autores dominicanos, latinoamericanos y españoles, representativos de la poesía satírica, verbalización y declamación de poemas satíricos manteniendo la entonación, el ritmo y la fluidez que demandan, según el tema, la estructura y los recursos estilísticos de los mismos, el lenguaje gestual y corporal con la intención comunicativa y los sentimientos que refleja la narración. Comprensión escrita (leer) Anticipación del contenido de los poemas a partir del título, establecimiento de un propósito para la lectura de los poemas, inferencias a partir del contexto del significado de las palabras que desconoce. Reconocimiento de la intención comunicativa del autor y de los sentimientos que el texto evoca, uso de la estructura del poema para determinar su desarrollo y la distribución del contenido, identificación y análisis de los recursos estilísticos para valorar la riqueza creativa y expresiva del poema, determinando los significados explícitos e implícitos que presenta el poema a partir de los elementos connotativos y denotativos. Paráfrasis del sentido global de los poemas de contenido social, utilizando el vocabulario en este tipo de texto. • Disfrute al escuchar los poemas seleccionados. • Respeto y empatía por los sentimientos y opiniones expr esados por otros sobre el texto. • Placer estético al recitar poemas de cont enido satírico. • Reconocimiento del lenguaje corporal como sopor te del lenguaje verbal. • Disfrute al leer poemas de contenido satírico . • Desarrollo de la cr eatividad en la producción de poemas de temas satíricos. • Valoración de la poesía satírica para denunciar, analizar y dar a conocer pr oblemáticas, personajes, hechos y sucesos del medio circundante."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "La poesía social",
        "proceduralItems": [],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El monólogo",
        "proceduralItems": [],
        "manualReviewRequired": true,
        "source": "pdf"
      }
    ],
    "6to": [
      {
        "topic": "El informe de investigación",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la situación de comunicación (intención y destinatarios) del informe de investigación que produce oralmente; selecciona y justifica el tema a partir de un problema detectado, de las fuentes bibliográficas, en versión física y/o digital, desarrollando de estrategias de registro y organización de la información necesaria para la estructura de las ideas, atendiendo a las partes que lo componen y al uso de la gramática específica (formas impersonales del verbo, conectores de concesión, de transición y explicación, adverbios de frecuencia, de cantidad y de modo). Articulación de los argumentos que le permitan sustentar la tesis de la investigación que reporta en el informe, haciendo uso de los diversos procedimientos: analogía, ejemplificación, deducción, de autoridad; léxico, interlocutores y vocabulario temático a la intención comunicativa, asignación de un título coherente con el contenido para desarrollar el marco teórico y el análisis. • Interés y cur iosidad por escuchar y leer informes de investigación dirigidos a un público general, sobre temas y problemas de medioambiente y salud. • Criticidad para evaluar los datos y los ar gumentos presentados en el informe de investigación que lee. • Claridad al evidenciar la vo z propia y la voz de otros autores en las ideas contenidas en el informe de investigación. • Interés por escr ibir informes de investigación dirigidos a un público general, sobre temas y problemas de medioambiente y salud. Área de Lengua Española Nivel Secundario - Segundo Ciclo 6to. Grado Competencias Fundamentales Competencias Específicas del Grado Comunicativa Exhibe desenvolvimiento y creatividad al comunicarse eficazmente de manera personal y colectiva, utilizando un modelo textual, a partir de la comprensión y producción, con uso ético y responsable de plataformas tecnológicas y diferentes medios y recursos. Pensamiento Lógico, Creativo y Crítico Expone la validez de informaciones diversas sostenidas en juicios, puntos de vista, conclusiones y acciones, usando un género textual conveniente, respetando las demás opiniones. Resolución de Problemas Presenta resultados de investigaciones a través de textos convenientes que evidencian soluciones de problemas, tomando en cuenta la audiencia y manifestando postura crítica, valórica y de respeto frente a lo que se lee, escucha y escribe. Ética y Ciudadana Usa textos de secuencia argumentativa en la elaboración de proyectos como elemento clave, hacia la construcción de una ciudadanía responsable y dinámica que busca solución de problemas colectivos. Científica y Tecnológica Explica resultados de investigaciones que realiza, apoyándose en el uso de textos de secuencia expositivo- explicativa, en actos de intercomunicación que se desarrollan en la escuela y otro contexto, utilizando herramientas tecnológicas y otros recursos. Ambiental y de la Salud Utiliza sus conocimientos en la promoción y divulgación de comportamientos y valores sobre la conservación de la salud, la naturaleza y sus ecosistemas, mediante el uso de textos y a través de actividades de intercomunicación en diferentes contextos de la comunidad, apoyados en recursos variados. Desarrollo Personal y Espiritual Canaliza emociones y sentimientos en lecturas y escrituras reflexivas, a través de un tipo de texto conveniente, fortaleciendo las relaciones humanas y el respeto a la dignidad propia y de otras personas."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura del informe de investigación; anticipa el contenido a partir de marcas textuales y paratextuales (gráficos, tablas, cuadros, elementos tipográficos). Inferencia de la intención comunicativa del informe de investigación que lee, identifica los conectores de concesión, transición y precisión, para comprender las relaciones lógicas entre las ideas contenidas en las diferentes partes; uso de diccionario en versión física y/o digital para buscar la definición de palabras cuyo significado no ha podido inferir a partir del texto. Realización de inferencias basadas en la estructura del informe de investigación que lee; basadas en las relaciones locales que existen entre las ideas contenidas en el informe; de los procedimientos (analogía, ejemplificación, deducción, de autoridad); paráfrasis del sentido global del informe a partir del problema planteado, los objetivos de la investigación, la metodología, las bases teóricas, las conclusiones y recomendaciones, ajustándose a la intención comunicativa y a la estructura de este tipo de texto; resumiendo el contenido del informe de investigación, mediante la omisión de información no relevante, selección de las ideas principales, generalización y reconstrucción de las ideas que representan el sentido global del texto."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la situación de comunicación (intención y destinatarios) del informe de investigación que escribe; selección y justificación del tema a partir de un problema detectado; de las fuentes bibliográficas, en versión física y/o digital, a utilizar para producir por escrito las ideas. Desarrollo de estrategias de registro y organización de la información necesaria para estructurar el informe de investigación que escribe; atendiendo a las partes que lo componen y al uso de la gramática específica (formas impersonales del verbo, conectores de concesión, de transición y explicación, adverbios de frecuencia, de cantidad y de modo). Articulación de los argumentos que le permitan sustentar la tesis de la investigación que reporta en el informe, haciendo uso de los diversos procedimientos: analogía, ejemplificación, deducción, de autoridad; de recursos paratextuales (tablas, gráficos, cuadros, elementos tipográficos…) para ilustrar el contenido del informe; del léxico a la intención comunicativa, a los interlocutores y al vocabulario temático del informe de investigación de campo; uso de diversos mecanismos de citación para desarrollar el marco teórico y el análisis de los resultados; borrador, redacción, revisión, corrección, edición y publicación del informe con la colaboración del docente y de sus compañeros o compañeras y dirigido a un público general."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El reportaje",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Establecimiento de un propósito comunicativo para la escucha del reportaje sobre problemas relacionados con la realidad nacional e internacional; escucha atenta de reportajes sobre problemas relacionados con la realidad nacional e internacional, leídos por los estudiantes, por el/la docente o reproducidos a través de medios digitales. Anticipación del contenido del reportaje que escucha a partir del título y otras marcas textuales y paratextuales; activa de los conocimientos previos sobre la temática abordada; realiza inferencias necesarias basadas en la intención; comprende el sentido global del mismo a partir del contexto del significado de las palabras, basadas en el contenido (tema, ideas principales y secundarias), apoyándose en las estrategias utilizadas por el autor."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la intención comunicativa del reportaje que produce ortológicamente; selecciona el tema a tratar, así como de las fuentes de información que utiliza en versión física y/o digital; registro y organización de la información necesaria para estructurar el contenido (problemas relacionados con la realidad nacional e internacional). • Interés por escuchar r eportajes sobre problemas relacionados con la realidad nacional e internacional. • Interés por expr esar las ideas del reportaje de manera objetiva, lógica, clara y coherente. 114 Contenidos Conceptos Procedimientos"
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito comunicativo para la lectura de reportajes sobre problemas relacionados con la realidad nacional e internacional; anticipa contenido de reportajes sobre problemas relacionados con la realidad nacional e internacional, a partir del título y otras marcas textuales; activa los conocimientos previos sobre la temática abordada. Realización de las inferencias necesarias basadas en la estructura y en la intención de reportajes que lee para comprender su sentido global; basadas en las relaciones locales que existen entre las ideas del reportaje que lee, haciendo uso de los conectores y del vocabulario temático, utiliza diccionario en versión física y/o digital para comprender el sentido de las palabras cuyo significado no ha podido inferir para comprender el contenido del reportaje que lee."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa del reportaje que produce por escrito; selección del tema y del soporte (físico y/o digital) sobre el que se produce; las fuentes de información relativas al tema considerando su diversidad y fiabilidad; registro de la información recolectada para estructurar las ideas; organización de la información; léxico apropiado al tema y a los interlocutores; asigna de un título coherente con el contenido; uso de recursos paratextuales (gráficos, fotografías, imágenes…) para ilustrar el contenido del reportaje que produce por escrito. Redacción de borradores del reportaje, manuscrito y/o digital, sobre problemas relacionados con la realidad nacional e internacional, tomando en cuenta su estructura textual, intención comunicativa, destinatarios, vocabulario temático y gramática textual; revisa, corrige y edita de manera individual y/o con la ayuda de sus compañeros, compañeras y docentes, para asegurarse de que el texto se ajuste a la situación. • Interés por leer r eportajes sobre problemas relacionados con la realidad nacional e internacional. • Interés por lo que sucede en el ent orno y por darlo a conocer a través del reportaje que escribe. • Seguridad y confianza al producir por escr ito el reportaje. El ensayo argumentativo • Función y estructura • La tesis para expresar la postura • Los tipos de argumentos: de aut oridad, por datos estadísticos, por hechos, por causa- efecto, por teorías o generalizaciones, por ejemplos, por comparaciones, por analogías Comprensión oral (escuchar) Establecimiento de un propósito para la escucha d"
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      },
      {
        "topic": "El ensayo argumentativo",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Establecimiento de la situación de comunicación del ensayo argumentativo que producirá por escrito: intención y audiencia; selecciona y justifica el tema; asigna un título posible para el ensayo que producirá, atendiendo al contenido del mismo; planifica la tesis o punto de vista que defenderá; selecciona las fuentes de información de donde tomará los argumentos y contraargumentos que producirá. Usa el léxico con el tema, la intención y los destinatarios del ensayo; usa conectores de explicación, de rectificación, de distanciamiento, de refuerzo y de recapitulación para dar cohesión. • Tolerancia y respeto fr ente a las opiniones y juicios de valor que expresa el autor del ensayo argumentativo que escucha. • Valoración del uso de la lengua para dar su opinión sobre temas contr oversiales del entorno y la realidad nacional e internacional."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la situación de comunicación del ensayo argumentativo que produce: intención y audiencia/destinatarios; selecciona y justifica el tema sobre el que escribirá el ensayo; asigna un título posible para el ensayo que producirá, atendiendo al contenido del mismo; planifica la tesis o punto de vista que defenderá; utilizando estrategias de investigación en diversidad de fuentes de información, de selección, registro, organización y estructuración de las ideas (listados de ideas, esquemas y otros organizadores gráficos). Estructuración de los argumentos y contraargumentos que se utilizan en el ensayo argumentativo que escribe; organiza la información a incluir, la estructura canónica del texto; la intención y los destinatarios del ensayo argumentativo que produce; uso de conectores de explicación, rectificación, distanciamiento, recapitulación y refuerzo para dar cohesión; revisa con ayuda del/de la docente, de un compañero o de una compañera, del ensayo argumentativo que produce por escrito, ajustándose al tema, a la estructura, a la intención comunicativa y a los destinatarios; edita el ensayo que produce por escrito, tomando en cuenta las convenciones de la escritura: uso de márgenes, separación de oraciones y párrafos; uso de letras mayúsculas, la tilde y los signos de puntuación. El discurso oral de graduación • Función y estructura • Referencias léxicas • La autorref erencia en los deícticos • Conector es de apertura, temporales, de cierre, de causa• efecto • Marcas de cort esía • Registro f ormal • Oraciones según la actitud del hablante • Secuencia narrativa, argumentativa • Elementos paralingüísticos Compr ensión oral (escuchar) Establecimiento de un propósito comunicativo para escuchar discursos de graduación; escucha atenta de discursos; anticipa el contenido a partir de lo que escucha en la introducción; infiere para determinar el contexto espacio• temporal y sociocultural en el que se desarrolla el discurso que escucha; a partir del contexto, del significado de palabras desconocidas; reconoce la temática sobre la cual se desarrolla; identifica la tesis y los argumentos que sirven de sustento; reconoce diferentes anécdotas (si aparecen) presentes; identifica la postura del orador por medio de las expresiones que lo indican, la apertura y del cierre del discurso; agradecimiento a través de los conectores que indican estos procesos; expresiones de certeza y de expresiones que indican sentimientos o juicios de valor. Reconocimiento de las referencias léxicas de persona y de la autorreferencia presentada en los deícticos de las personas gramaticales; comprende de la función de los organizadores intertextuales e intratextuales; reconstruye el discurso que escucha; tomando en cuenta la estructura textual, la intención comunicativa, el tema, la tesis y los argumentos que sustenta la tesis. Producción oral (hablar) Establecimiento de un propósito comunicativo para producir oralmente discursos de graduación; anticipa el contenido en la introducción; emplea las referencias léxicas de persona y autorreferencial presentada en los deícticos de las personas gramaticales; selecciona un tema (éxito, esfuerzo, perseverancia, gracias, motivación, entusiasmo, futuro, recuerdos…) para formular una tesis y los argumentos que la sustentan; tomando en cuenta la situación contextual y la estructura (punto de partida, tesis, argumentos, conclusión), conectores de apertura, temporales, de causa efecto y de cierre; organizadores intratextuales para introducir otras voces en el texto. • Interés y cur iosidad por escuchar otros discursos de graduación que puedan servir de referentes al momento de producir los propios. • Capacidad para expresarse estratég icamente y lograr el propósito comunicativo del discurso al secuenciar las ideas de forma lógica. 116 Contenidos Conceptos Procedimientos"
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito comunicativo para leer discursos de graduación; activa experiencias previas a través de la prelectura de discursos; anticipa el contenido del discurso a partir de lo que escucha en la introducción; Infiere para determinar el contexto espacio• temporal y sociocultural en el que se desarrolla discurso que lee; a partir del contexto, del significado de palabras, usando el diccionario, en versión física y/o digital, para comprender el sentido de las palabras cuyo significado no ha podido inferir. Reconocimiento de las referencias léxicas de persona y autorreferencial presentada en los deícticos de las personas gramaticales; uso de conectores de apertura y cierre y de causa• efecto, de las marcas de cortesía y agradecimiento, de marcadores intertextuales para introducir otras voces a través de citas textuales: tal como dijo, según lo expresó. • Interés y cur iosidad por leer otros discursos que puedan servir de referentes al momento de producir los propios. • Valoración de los guiones y esquemas de escritura al momento de desar rollar sus ideas para ser oralizadas en ámbitos formales. Identificación de organizadores intratextuales que remitan a una parte anterior en el discurso (por lo antes dicho, a propósito de lo anterior); reconoce marcadores paratextuales presentes en los discursos que lee: números o letras para enumerar hechos, razones, etc., subrayados, cambios en el tipo de letra, itálica, negritas. Reconocimiento de expresiones que indican postura del orador, juicios de valor, agradecimiento y cortesía; de la tesis sobre la que se desarrolla el discurso; de los argumentos que sustenta la tesis; de diferentes anécdotas (si aparecen) presentes en el discurso; de los signos de puntuación para hacer citas textuales: comillas, paréntesis, puntos suspensivos…; reconstruye el contenido del discurso que escucha, tomando en cuenta la estructura textual, la intención comunicativa, el tema, la tesis y los argumentos que sustenta la tesis. Producción escrita (escribir) Establecimiento de un propósito comunicativo para producir por escrito el discurso ortológico; selecciona un tema (éxito, esfuerzo, perseverancia, gracias, motivación, entusiasmo, futuro, recuerdos…) para formular una tesis y los argumentos que la sustentan; busca información necesaria para producir el discurso escrito con la conciencia ortológica; selecciona el soporte (físico y/o digital) sobre el que realizarán los esquemas o guiones de escritura; de un tema (éxito, esfuerzo, perseverancia, gracias, motivación, entusiasmo, futuro, recuerdos). Elaboración, a partir de la temática, de la tesis y los argumentos que la sustenten; de guiones o esquemas escritos para organizar las ideas que se quieren transmitir de manera lógica y coherente en los que estén claramente definidas la tesis y los argumentos que la sustentarán; emplea de la escritura convencional para redactar el discurso de graduación; redacta, revisa, corrige y edita borradores manuscritos y/o digitales, aprovechando la ayuda del/de la docente, de los compañeros y compañeras; tomando en cuenta la situación contextual y la estructura (punto de partida, tesis, argumentos, conclusión)."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El discurso oral de graduación",
        "proceduralItems": [],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "La novela",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de novelas cortas acordes con la edad e intereses; anticipa el contenido de la novela a partir del título y otras marcas textuales; usa la estructura de la novela (inicio, nudo y desenlace), de los verbos en pasado y presente, de los conectores, de los adjetivos, de la distinción entre narrador y personajes y de las fórmulas de inicio y de cierre, para comprender su contenido. Inferencia a partir del contexto del significado de las palabras que desconoce; para comprender el sentido de la novela que escucha; para identificar las acciones realizadas por los personajes de la novela, sobre la relación de causalidad entre ellas; de las motivaciones e intenciones de las acciones de los personajes; sobre los tipos de actantes para analizar los personajes y comprender sus actuaciones; distingue entre el narrador y los personajes para comprender la trama relatada en la novela. Utilización del orden de la narración (cronológico o anacrónico) para comprender la trama de la novela; identifica el tema, parafrasea las acciones principales, usando el vocabulario apropiado y mediante el uso de sinónimos y otros recursos; resume el contenido de la novela que escucha, apoyándose en el narrador, los personajes, las acciones, el ambiente y la atmósfera, el o los temas y los diálogos de los personajes, el tipo de narrador y el orden de la narración."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Establecimiento de un propósito para la lectura de la novela; anticipa el contenido de la novela a partir del título, y otras marcas textuales y paratextuales; usa la estructura de la novela (inicio, nudo y desenlace), de los conectores, de los verbos en pasado y presente, de los adjetivos, de la distinción entre narrador y personajes y de las fórmulas de inicio y de cierre, para comprender su contenido. • Disfrute al escuchar novelas cor tas que fomenta su imaginación y creatividad. • Valoración de la función lúdica y estética de la lengua. • Curiosidad por realizar pr edicciones de novelas que escucha. • Valoración de la importancia de reconocer los sentimient os y motivaciones de los personajes. • Disfrute al leer novelas para f omentar su imaginación y creatividad. • Valoración del trabajo creativo de los escr itores cuyas novelas lee. Usa el diccionario para conocer el significado de las palabras desconocidas, identifica de las distintas voces (narrador y personajes) que intervienen en la novela, para su comprensión; comprender el sentido de la novela que lee. Identificación y clasificación de los personajes para la comprensión de sus acciones. Inferencia de las motivaciones e intenciones de las acciones de los personajes; usa el orden de la narración (cronológico o anacrónico) para comprender la trama; parafrasea las acciones principales de la novela, usando el vocabulario mediante el uso de sinónimos y otros recursos; resume el contenido de la novela que escucha, apoyándose en el narrador, los personajes, las acciones, el ambiente y la atmósfera, el o los temas y los diálogos de los personajes, el tipo de narrador y el orden de la narración. 118 Contenidos Conceptos Procedimientos"
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "Poesía social",
        "proceduralItems": [
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "Selección de poemas de autores dominicanos, caribeños, latinoamericanos y españoles, representativos de la poesía social; verbaliza y declama poemas de contenido social manteniendo la entonación, el ritmo y la fluidez que demandan el tema y los elementos estructurales de los mismos; adecua el lenguaje gestual y corporal con la intención comunicativa y los sentimientos que evoca el texto."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "Anticipación del contenido de los poemas a partir del título; establece un propósito para la lectura; infiere a partir del contexto, del significado de las palabras que desconoce; reconoce la intención comunicativa del autor y de los sentimientos que el texto evoca; usa la estructura del poema para determinar su desarrollo y la distribución del contenido; identifica y analiza los recursos estilísticos para valorar la riqueza creativa y expresiva del poema; determina los significados, explícitos e implícitos que presenta el poema a partir de los elementos connotativos y denotativos. paráfrasis el sentido global de los poemas de contenido social, utilizando el vocabulario adecuado para este tipo de texto."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "Establecimiento de la intención comunicativa del poema que va a producir por escrito; selecciona el tema o la problemática que enfocará; usa el vocabulario apropiado a su intención comunicativa y al sentimiento o emoción que quiere transmitir, los recursos literarios que demanda el abordaje del tema: los sentimientos, la creatividad, la connotación. Escritura de borradores de poemas de contenido social, atendiendo a: la emoción y sentimiento que quiere expresar; la intención comunicativa; la estructura y recursos estilísticos; el vocabulario y la corrección ortográfica; revisión, corrección y edición de borradores con ayuda del docente y los compañeros y compañeras de clases; publica el contenido social en los murales del aula, en los diferentes blogs de los grupos, así como en un libro artesanal o en una revista escolar. • Disfrute al escuchar los diversos poemas. • Valoración de la función lúdica y estética del poema social. • Disfrute al leer y producir poemas de contenido social . • Creatividad en la producción de poemas de temas sociales . • Valoración de la poesía de temas sociales para denunciar , analizar y dar a conocer las problemáticas del medio circundante."
          }
        ],
        "manualReviewRequired": true,
        "source": "pdf"
      },
      {
        "topic": "El monólogo",
        "proceduralItems": [
          {
            "id": "comprension_oral",
            "title": "Comprensión oral (escuchar)",
            "text": "Escucha atenta de la lectura de monólogos por parte del docente o sus compañeros de clase; asiste a la puesta en escena de monólogos ya sea en vivo o por medios audiovisuales; analiza los elementos estructurales del monólogo presenciado o escuchado; comprende y parafrasea el tema desarrollado; identifica los conectores lógicos utilizados en un monólogo y comprende la relación que establecen entre las partes del texto o ideas que conecta. Inferencia de ideas y del punto de vista del autor expresado en el monólogo a partir de los elementos estructurales reconocidos en el mismo; reconoce diferentes figuras literarias y la intención comunicativa o estética de las mismas; identifica objetos utilizados como símbolos en representaciones teatrales; parafrasea información relevante para fines establecidos previamente. Establecimiento de relaciones entre el tema tratado en el monólogo y los contenidos de otras materias; de relaciones tanto entre los hechos representados en el monólogo con o la realidad cotidiana; identifica rasgos de la personalidad del personaje o la voz monologal (actitudes, valores, creencias, ideas, conocimientos, nivel social, rasgos culturales); contexto en el que hace la forma en que transmite su parlamento, tanto por su lenguaje verbal como no verbal. • Interés por conocer y disfrutar dif erentes formas de representación teatral. • Conciencia crítica en la discriminación de dif erentes formas de representación artística y los mensajes que contengan. • Valoración del cuerpo como un medio de expresión que está siempr e transmitiendo un mensaje."
          },
          {
            "id": "produccion_oral",
            "title": "Producción oral (hablar)",
            "text": "• Utilización de los elementos estructurales del monólogo en la pr oducción de su monólogo; define el tema desarrollado en el monólogo y el punto de vista que desea presentar; uso los elementos estructurales del monólogo para transmitir sus ideas y su punto de vista acerca del tema tratado; establece relaciones entre el tema tratado en el monólogo y los contenidos de otras materias; relaciones tanto entre los hechos representados en el monólogo con o la realidad cotidiana. • Empleo de objetos diversos como símbolos en la producción de monólogos; construy e los rasgos de la personalidad del personaje o la voz monologal (actitudes, valores, creencias, ideas, conocimientos, nivel social, rasgos culturales) en consonancia con las ideas que expresa, el contexto en el que lo hace y la forma en que transmite su parlamento, tanto por su lenguaje verbal como no verbal; uso de diferentes figuras literarias para transmitir las ideas que desea expresar o para lograr efectos estéticos en la forma de transmitir su mensaje."
          },
          {
            "id": "comprension_escrita",
            "title": "Comprensión escrita (leer)",
            "text": "• Escucha atenta de la lectura de monólogos por part e del docente o sus compañeros de clase; asiste a la puesta en escena de monólogos ya sea en vivo o por medios audiovisuales; analiza los elementos estructurales del monólogo presenciado o escuchado; comprende y parafrasea el tema desarrollado; identifica los conectores lógicos utilizados en un monólogo y comprende la relación que establecen entre las partes del texto o ideas que conecta. • Establecimiento de la relación entre los hechos r epresentados en el monólogo y su contextualización espacial y temporal; reconoce diferentes figuras literarias y la intención comunicativa o estética de las mismas; identifica objetos utilizados como símbolos en representaciones teatrales. • Inferencia de ideas y del punt o de vista del autor expresado en el monólogo a partir de los elementos estructurales reconocidos en el mismo; subrayado y/o parafraseo de información relevante para fines establecidos previamente; establece relaciones entre el tema tratado en el monólogo y los contenidos de otras materias; relaciones tanto entre los hechos representados en el monólogo con o la realidad cotidiana; identifica rasgos de la personalidad del personaje o la voz monologar (actitudes, valores, creencias, ideas, conocimientos, nivel social, rasgos culturales) a partir de lo que expresa, el contexto en el que lo hace y la forma en que transmite su parlamento, tanto por su lenguaje verbal como no verbal."
          },
          {
            "id": "produccion_escrita",
            "title": "Producción escrita (escribir)",
            "text": "• Utilización de los elementos estructurales del monólogo en la pr oducción de su monólogo; define el tema desarrollado en el monólogo y el punto de vista que desea presentar; usa los elementos estructurales del monólogo para transmitir sus ideas y su punto de vista acerca del tema tratado; establece relaciones entre el tema tratado en el monólogo y los contenidos de otras materias; relaciones tanto entre los hechos representados en el monólogo con o la realidad cotidiana. • Utilización de conector es lógicos que establecen relación coherente entre las partes del texto o ideas que conectan; establece la relación entre los hechos representados en el monólogo y su contextualización espacial y temporal; uso de objetos como símbolos en los monólogos que produce; construye los rasgos de la personalidad del personaje o la voz monologal (actitudes, valores, creencias, ideas, conocimientos, nivel social, rasgos culturales) en consonancia con las ideas que expresa, el contexto en el que lo hace y la forma en que transmite su parlamento, tanto por su lenguaje verbal como no verbal. • Valoración del cuerpo como un medio de expr esión que está siempre transmitiendo un mensaje. • Capacidad de canalizar por medio del teatro y el monólogo los conflic tos personales, la necesidad de expresión creativa, la autoafirmación de la individualidad, los cuestionamientos de la realidad social y el sentido de trascendencia. • Utilización de diferent es figuras literarias para transmitir las ideas que desea expresar o para lograr efectos estéticos en la forma de transmitir su mensaje; escribe borradores del monólogo utilizando las secuencias textuales (narración, descripción y argumentación), las diversas figuras literarias y sus conectores correspondientes."
          }
        ],
        "manualReviewRequired": false,
        "source": "pdf"
      }
    ]
  }
};

const DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS = [
  {
    area: 'Lengua Española',
    cycle: 'Secundaria - Primer ciclo',
    gradeKeys: ['1ro', '2do', '3ro'],
    source: 'official-seed',
    competencies: {
      'Competencia comunicativa': [
        'Comprende textos orales y escritos adecuados a distintas intenciones comunicativas del entorno escolar y social.',
        'Produce textos orales y escritos con coherencia, cohesión y corrección para comunicar ideas y opiniones.',
        'Participa en intercambios comunicativos respetando turnos, propósitos y normas de convivencia.',
      ],
      'Competencia de pensamiento lógico, creativo y crítico': [
        'Analiza mensajes y textos desde una postura crítica, identificando ideas principales, argumentos y recursos expresivos.',
        'Establece relaciones entre ideas, compara puntos de vista y construye interpretaciones propias de textos diversos.',
      ],
      'Competencia de resolución de problemas': [
        'Utiliza estrategias de lectura, escritura y oralidad para resolver situaciones comunicativas de su contexto escolar.',
      ],
      'Competencia ética y ciudadana': [
        'Usa el lenguaje de manera respetuosa para dialogar, convivir y participar en situaciones de aula y comunidad.',
      ],
      'Competencia científica y tecnológica': [
        'Emplea fuentes impresas y digitales para buscar, organizar y comunicar información con criterio.',
      ],
      'Competencia ambiental y de la salud': [
        'Interpreta y produce mensajes que promueven el cuidado del entorno y prácticas saludables.',
      ],
      'Competencia de desarrollo personal y espiritual': [
        'Expresa emociones, ideas y experiencias personales mediante textos y exposiciones con seguridad y empatía.',
      ],
    },
  },
  {
    area: 'Lengua Española',
    cycle: 'Secundaria - Segundo ciclo',
    gradeKeys: ['4to', '5to', '6to'],
    source: 'official-seed',
    competencies: {
      'Competencia comunicativa': [
        'Interpreta críticamente obras y textos de mayor complejidad para participar en intercambios académicos y sociales.',
        'Produce discursos, ensayos y otros textos con intención estética, argumentativa o informativa según el contexto.',
        'Adequa registros, estructuras y recursos expresivos al propósito y al destinatario.',
      ],
      'Competencia de pensamiento lógico, creativo y crítico': [
        'Valora textos literarios y no literarios mediante análisis, inferencias y juicios críticos fundamentados.',
        'Construye argumentos propios a partir de la lectura, la investigación y la comparación de fuentes.',
      ],
      'Competencia de resolución de problemas': [
        'Resuelve situaciones académicas y sociales utilizando procesos de comprensión, síntesis y producción textual.',
      ],
      'Competencia ética y ciudadana': [
        'Argumenta con respeto y responsabilidad frente a temas sociales y culturales presentes en textos y debates.',
      ],
      'Competencia científica y tecnológica': [
        'Integra herramientas digitales y criterios de validación de fuentes para comunicar información de forma responsable.',
      ],
      'Competencia ambiental y de la salud': [
        'Analiza discursos y mensajes relacionados con el ambiente, la salud y la sostenibilidad desde una postura crítica.',
      ],
      'Competencia de desarrollo personal y espiritual': [
        'Construye identidad y sentido crítico a través de la lectura, la escritura y la apreciación literaria.',
      ],
    },
  },
  {
    area: 'Ciencias de la Naturaleza',
    cycle: 'Secundaria - Primer ciclo',
    gradeKeys: ['1ro', '2do', '3ro'],
    source: 'official-seed',
    competencies: {
      'Competencia comunicativa': [
        'Explica fenómenos naturales usando vocabulario científico básico en exposiciones orales y escritas.',
        'Comunica resultados de observaciones, experiencias y conclusiones con claridad.',
      ],
      'Competencia de pensamiento lógico, creativo y crítico': [
        'Analiza relaciones entre variables, hechos y evidencias para interpretar fenómenos del entorno.',
        'Formula explicaciones y comparaciones a partir de observaciones y modelos científicos escolares.',
      ],
      'Competencia de resolución de problemas': [
        'Aplica procedimientos sencillos para resolver situaciones relacionadas con materia, energía, seres vivos y ambiente.',
      ],
      'Competencia ética y ciudadana': [
        'Participa responsablemente en actividades científicas respetando normas de trabajo, seguridad y convivencia.',
      ],
      'Competencia científica y tecnológica': [
        'Usa métodos de indagación, experimentación y registro de datos para construir conocimientos científicos.',
        'Emplea instrumentos, modelos y recursos tecnológicos escolares para investigar fenómenos naturales.',
      ],
      'Competencia ambiental y de la salud': [
        'Relaciona conocimientos científicos con el cuidado de la salud, del ambiente y del uso responsable de los recursos.',
      ],
      'Competencia de desarrollo personal y espiritual': [
        'Muestra curiosidad, perseverancia y actitud reflexiva frente al estudio de la naturaleza y del propio cuerpo.',
      ],
    },
  },
  {
    area: 'Ciencias de la Naturaleza',
    cycle: 'Secundaria - Segundo ciclo',
    gradeKeys: ['4to', '5to', '6to'],
    source: 'official-seed',
    competencies: {
      'Competencia comunicativa': [
        'Comunica explicaciones, resultados y argumentos científicos mediante informes, exposiciones y representaciones gráficas.',
        'Interpreta información científica proveniente de textos, tablas, esquemas y medios digitales.',
      ],
      'Competencia de pensamiento lógico, creativo y crítico': [
        'Analiza evidencias y modelos científicos para explicar fenómenos físicos, químicos y biológicos.',
        'Evalúa hipótesis y conclusiones considerando datos, relaciones causales y pensamiento crítico.',
      ],
      'Competencia de resolución de problemas': [
        'Resuelve situaciones del entorno mediante procedimientos científicos, modelación y análisis de resultados.',
      ],
      'Competencia ética y ciudadana': [
        'Asume una postura ética frente al uso del conocimiento científico y tecnológico en la sociedad.',
      ],
      'Competencia científica y tecnológica': [
        'Diseña y ejecuta procesos de indagación para comprender fenómenos naturales y tecnológicos.',
        'Integra conceptos y procedimientos científicos para explicar situaciones de la vida cotidiana.',
      ],
      'Competencia ambiental y de la salud': [
        'Argumenta y propone acciones relacionadas con sostenibilidad, salud integral y prevención de riesgos.',
      ],
      'Competencia de desarrollo personal y espiritual': [
        'Demuestra autonomía, rigor y valoración de la ciencia como medio para comprender y transformar su realidad.',
      ],
    },
  },
];
const DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS = {
  General: {
    'Competencia comunicativa': [
      'Comunica ideas, procesos y conclusiones con claridad en situaciones propias del área.',
    ],
    'Competencia de pensamiento lógico, creativo y crítico': [
      'Analiza información del área y formula ideas propias con sentido crítico.',
    ],
    'Competencia de resolución de problemas': [
      'Aplica saberes del área para resolver situaciones del contexto escolar y social.',
    ],
    'Competencia ética y ciudadana': [
      'Actúa con responsabilidad, respeto y compromiso en actividades propias del área.',
    ],
    'Competencia científica y tecnológica': [
      'Utiliza recursos, procedimientos y herramientas del área para investigar y aprender.',
    ],
    'Competencia ambiental y de la salud': [
      'Relaciona los aprendizajes del área con el cuidado del ambiente y la salud.',
    ],
    'Competencia de desarrollo personal y espiritual': [
      'Fortalece su autonomía, autoestima y crecimiento personal a través de experiencias del área.',
    ],
  },
};
// Extrae el grupo persistido en una planificación para reconstruir su contexto académico original.
function lessonPlanStoredGroupId(plan) {
  return plan?.groupId || plan?.general?.groupId || plan?.general?.sectionId || '';
}
// Extrae el período persistido en una planificación para restaurar su línea de tiempo.
function lessonPlanStoredPeriodId(plan) {
  return plan?.periodId || plan?.general?.periodId || S.activePeriodId || 'P1';
}
// Devuelve el nombre del docente que se usará como firma en planificaciones e impresiones.
function lessonPlanTeacherName() {
  return String(S.profile?.name || S.sessionUserName || '').trim();
}
// Devuelve el nombre de la institución o una etiqueta de respaldo para el documento.
function lessonPlanInstitutionName() {
  return String(S.profile?.inst || '').trim();
}
// Busca la descripción corta de un eje transversal para mostrarla junto al valor seleccionado.
function lessonPlanTransversalAxisDescription(value) {
  const selected = LESSON_PLAN_TRANSVERSAL_AXES.find((item) => item.value === String(value || '').trim());
  return selected?.description || '';
}
// Resuelve un texto de ayuda para una competencia específica dentro del formulario de planificaciones.
function lessonPlanSpecificPlaceholderForFundamental(fundamental) {
  const clean = normTxt(fixMojibakeText(String(fundamental || '').trim()));
  const map = {
    [normTxt('Competencia comunicativa')]: 'Ej. Expresa ideas de forma clara y argumentada durante el trabajo en clase...',
    [normTxt('Competencia de pensamiento lógico, creativo y crítico')]: 'Ej. Analiza situaciones y propone soluciones con razonamiento lógico...',
    [normTxt('Competencia de resolución de problemas')]: 'Ej. Resuelve situaciones del entorno aplicando estrategias pertinentes...',
    [normTxt('Competencia ética y ciudadana')]: 'Ej. Participa de manera responsable y respetuosa en situaciones de convivencia escolar...',
    [normTxt('Competencia científica y tecnológica')]: 'Ej. Interpreta fenómenos utilizando lenguaje científico y recursos tecnológicos...',
    [normTxt('Competencia ambiental y de la salud')]: 'Ej. Promueve acciones de cuidado ambiental y hábitos saludables en su contexto...',
    [normTxt('Competencia de desarrollo personal y espiritual')]: 'Ej. Demuestra autocontrol, empatía y compromiso con su crecimiento personal...',
  };
  return map[clean] || 'Ej. Describe la competencia específica que desarrollarás en esta clase...';
}
const LESSON_PLAN_TEMP_GRADE_VALUE = '__temp_grade__';
const DOMINICAN_SECONDARY_CURRICULUM_AREAS = [
  {
    name: 'Lengua Española',
    subjects: [
      { name: 'Lengua Española', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
      { name: 'Apreciación y Producción Literarias', grades: ['4to', '5to'] },
      { name: 'Análisis y producción de textos periodísticos y publicitarios', grades: ['6to'] },
      { name: 'Análisis y producción de textos científicos y profesionales', grades: ['6to'] },
    ],
  },
  {
    name: 'Lenguas Extranjeras',
    subjects: [
      { name: 'Inglés', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
      { name: 'Francés', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
      { name: 'Apreciación literaria y manejo de la información (Inglés)', grades: ['4to', '5to', '6to'] },
    ],
  },
  {
    name: 'Matemática',
    subjects: [
      { name: 'Matemática', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
      { name: 'Matemáticas financieras y tecnología', grades: ['4to', '5to', '6to'] },
      { name: 'Estadística, probabilidad y tecnología', grades: ['4to', '5to', '6to'] },
      { name: 'Trigonometría, cálculo diferencial y tecnología', grades: ['4to', '5to', '6to'] },
    ],
  },
  {
    name: 'Ciencias Sociales',
    subjects: [
      { name: 'Ciencias Sociales', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
      { name: 'Filosofía social y pensamiento dominicano', grades: ['4to', '5to', '6to'] },
      { name: 'Geografía humana y Demografía', grades: ['4to', '5to', '6to'] },
      { name: 'Ciudadanía democrática', grades: ['4to', '5to', '6to'] },
    ],
  },
  {
    name: 'Ciencias de la Naturaleza',
    subjects: [
      { name: 'Ciencias de la Tierra', grades: ['1ro'] },
      { name: 'Ciencias de la Vida', grades: ['2do'] },
      { name: 'Ciencias Físicas', grades: ['3ro'] },
      { name: 'Biología', grades: ['4to'] },
      { name: 'Química', grades: ['5to'] },
      { name: 'Física', grades: ['6to'] },
      { name: 'Biología y computación', grades: ['4to'] },
      { name: 'Química y computación', grades: ['5to'] },
      { name: 'Física y computación', grades: ['6to'] },
    ],
  },
  {
    name: 'Educación Artística',
    subjects: [
      { name: 'Educación Artística', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
    ],
  },
  {
    name: 'Educación Física',
    subjects: [
      { name: 'Educación Física', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
    ],
  },
  {
    name: 'Formación Integral, Humana y Religiosa',
    subjects: [
      { name: 'Formación Integral, Humana y Religiosa', grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
    ],
  },
];
const DOMINICAN_SECONDARY_CURRICULUM_AREA_ORDER = DOMINICAN_SECONDARY_CURRICULUM_AREAS.map((item) => item.name);
const DOMINICAN_SECONDARY_CURRICULUM_AREA_SET = new Set(DOMINICAN_SECONDARY_CURRICULUM_AREA_ORDER);
// Garantiza que el catálogo curricular cargue con una estructura limpia y con datos derivados normalizados.
function ensureCurriculumCatalogState() {
  if (!S.curriculumCatalog || typeof S.curriculumCatalog !== 'object') S.curriculumCatalog = {};
  if (!Array.isArray(S.curriculumCatalog.customAreas)) S.curriculumCatalog.customAreas = [];
  if (!Array.isArray(S.curriculumCatalog.customSubjects)) S.curriculumCatalog.customSubjects = [];
  if (!Array.isArray(S.curriculumCatalog.customSpecificCompetencyBlocks)) S.curriculumCatalog.customSpecificCompetencyBlocks = [];
  S.curriculumCatalog.customAreas = S.curriculumCatalog.customAreas
    .map((item) => {
      const base = item && typeof item === 'object' ? item : { name: item };
      const name = normalizeSpanishDraftText(base.name || base.label || '', { preserveCase: true }).trim();
      if (!name) return null;
      return {
        id: String(base.id || uid()),
        name,
        educationLevel: normalizeEducationLevelName(base.educationLevel || 'Secundaria'),
      };
    })
    .filter(Boolean);
  S.curriculumCatalog.customSubjects = S.curriculumCatalog.customSubjects
    .map((item) => {
      const base = item && typeof item === 'object' ? item : { name: item };
      const name = normalizeSpanishDraftText(base.name || base.label || '', { preserveCase: true }).trim();
      const area = normalizeSpanishDraftText(base.area || '', { preserveCase: true }).trim();
      if (!name) return null;
      return {
        id: String(base.id || uid()),
        name,
        area,
        educationLevel: normalizeEducationLevelName(base.educationLevel || 'Secundaria'),
        gradeKeys: curriculumNormalizeGradeKeys(base.gradeKeys || base.grades || []),
      };
    })
    .filter(Boolean);
  S.curriculumCatalog.customSpecificCompetencyBlocks = S.curriculumCatalog.customSpecificCompetencyBlocks
    .map((item) => curriculumNormalizeSpecificCompetencyBlock(item, 'custom'))
    .filter(Boolean);
}
// Normaliza una clave de grado para poder comparar catálogos y consultas sin diferencias de formato.
function curriculumNormalizeGradeKey(value = '') {
  const clean = String(value || '').trim();
  if (!clean) return '';
  const rank = parseInt(clean, 10) || parseGradeLevel(clean);
  if (rank >= 1 && rank <= 6) return SECONDARY_CURRICULUM_GRADE_KEYS[rank - 1];
  return '';
}
// Normaliza una lista completa de claves de grado antes de buscar coincidencias oficiales.
function curriculumNormalizeGradeKeys(values = []) {
  return [...new Set((Array.isArray(values) ? values : [values]).map((item) => curriculumNormalizeGradeKey(item)).filter(Boolean))];
}
// Repara textos del currículo que lleguen con signos de interrogación sustituyendo caracteres rotos de origen.
function restoreSpanishQuestionCorruption(value = '') {
  let text = String(value || '');
  text = text.replace(/\uFFFD/g, '?');
  const replacements = [
    [/comprensi\?n/gi, 'comprensión'],
    [/producci\?n/gi, 'producción'],
    [/l\?gico/gi, 'lógico'],
    [/cr\?tico/gi, 'crítico'],
    [/resoluci\?n/gi, 'resolución'],
    [/soluci\?n/gi, 'solución'],
    [/espec\?fico/gi, 'específico'],
    [/espec\?fica/gi, 'específica'],
    [/espec\?ficos/gi, 'específicos'],
    [/espec\?ficas/gi, 'específicas'],
    [/hist\?rica/gi, 'histórica'],
    [/cient\?fica/gi, 'científica'],
    [/tecnol\?gica/gi, 'tecnológica'],
    [/tecnolog\?a/gi, 'tecnología'],
    [/g\?nero/gi, 'género'],
    [/trav\?s/gi, 'través'],
    [/comunicaci\?n/gi, 'comunicación'],
    [/investigaci\?n/gi, 'investigación'],
    [/intercomunicaci\?n/gi, 'intercomunicación'],
    [/ciudadan\?a/gi, 'ciudadanía'],
    [/dimensi\?n/gi, 'dimensión'],
    [/anal\?tico/gi, 'analítico'],
    [/anal\?tica/gi, 'analítica'],
    [/percepci\?n/gi, 'percepción'],
    [/utilizaci\?n/gi, 'utilización'],
    [/dem\?s/gi, 'demás'],
    [/s\? mismo/gi, 'sí mismo'],
    [/s\? /gi, 'sí '],
    [/car\?cter/gi, 'carácter'],
    [/g\?neros/gi, 'géneros'],
    [/ling\?\?sticas/gi, 'lingüísticas'],
    [/cat\?logo/gi, 'catálogo'],
    [/art\?culos/gi, 'artículos'],
    [/\?mbito/gi, 'ámbito'],
    [/promoci\?n/gi, 'promoción'],
    [/divulgaci\?n/gi, 'divulgación'],
    [/construcci\?n/gi, 'construcción'],
    [/din\?mica/gi, 'dinámica'],
    [/postura cr\?tica/gi, 'postura crítica'],
    [/uso \?tico/gi, 'uso ético'],
    [/espa\?ola/gi, 'española'],
    [/matem\?tica/gi, 'matemática'],
    [/educaci\?n/gi, 'educación'],
    [/f\?sica/gi, 'física'],
    [/art\?stica/gi, 'artística'],
    [/opini\?n/gi, 'opinión'],
  ];
  replacements.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });
  return text;
}
// Limpia y normaliza el texto de una competencia específica para comparar fuentes oficiales y personalizadas.
function curriculumNormalizeSpecificCompetencyText(value = '') {
  return fixMojibakeText(normalizeSpanishDraftText(restoreSpanishQuestionCorruption(value || ''), { preserveCase: true }))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
}
// Construye un catálogo de respaldo de competencias específicas cuando la fuente oficial todavía no existe para ese caso.
function curriculumNormalizeSpecificCompetencyFallbacks(source = DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS) {
  const result = {};
  Object.entries(source || {}).forEach(([scope, fundamentals]) => {
    const cleanScope = fixMojibakeText(normalizeSpanishDraftText(scope || '', { preserveCase: true })).trim();
    if (!cleanScope || !fundamentals || typeof fundamentals !== 'object') return;
    const nextFundamentals = {};
    Object.entries(fundamentals).forEach(([fundamental, values]) => {
      const cleanFundamental = fixMojibakeText(normalizeSpanishDraftText(fundamental || '', { preserveCase: true })).trim();
      const cleanValues = [...new Set((Array.isArray(values) ? values : [values])
        .map((item) => curriculumNormalizeSpecificCompetencyText(item))
        .filter(Boolean))];
      if (cleanFundamental && cleanValues.length) nextFundamentals[cleanFundamental] = cleanValues;
    });
    if (Object.keys(nextFundamentals).length) result[cleanScope] = nextFundamentals;
  });
  return result;
}
// Calcula un ID estable para que el mismo bloque curricular se reconozca aunque cambie el orden o el texto de origen.
function curriculumSpecificCompetencyBlockStableId(area = '', gradeKeys = [], cycle = '', source = '') {
  return [area, ...(Array.isArray(gradeKeys) ? gradeKeys : []), cycle, source]
    .join('|')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9|]+/g, '-')
    .replace(/\|+/g, '-')
    .replace(/^-+|-+$/g, '');
}
// Normaliza un bloque completo de competencias específicas para guardarlo y compararlo de forma consistente.
function curriculumNormalizeSpecificCompetencyBlock(entry, source = 'official-seed') {
  const base = entry && typeof entry === 'object' ? entry : {};
  const area = fixMojibakeText(normalizeSpanishDraftText(base.area || '', { preserveCase: true })).trim();
  const gradeKeys = curriculumNormalizeGradeKeys(base.gradeKeys || base.grades || []);
  const cycle = fixMojibakeText(normalizeSpanishDraftText(base.cycle || '', { preserveCase: true })).trim();
  const competenciesSource = base.competencies || base.fundamentals || {};
  const competencies = {};
  Object.entries(competenciesSource || {}).forEach(([fundamental, values]) => {
    const cleanFundamental = fixMojibakeText(normalizeSpanishDraftText(fundamental || '', { preserveCase: true })).trim();
    const cleanValues = [...new Set((Array.isArray(values) ? values : [values])
      .map((item) => curriculumNormalizeSpecificCompetencyText(item))
      .filter(Boolean))];
    if (cleanFundamental && cleanValues.length) competencies[cleanFundamental] = cleanValues;
  });
  if (!area || !gradeKeys.length || !Object.keys(competencies).length) return null;
  return {
    id: String(base.id || curriculumSpecificCompetencyBlockStableId(area, gradeKeys, cycle, source || base.source || 'seed')),
    area,
    gradeKeys,
    cycle,
    source: String(base.source || source || 'seed'),
    status: String(base.status || 'ready'),
    competencies,
  };
}
// Devuelve los bloques oficiales de competencias específicas ya normalizados y listos para consulta.
function curriculumOfficialSpecificCompetencyBlocks() {
  return DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS
    .map((entry) => curriculumNormalizeSpecificCompetencyBlock(entry, 'official-seed'))
    .filter(Boolean);
}
// Combina bloques oficiales y personalizados para que el selector curricular vea toda la oferta disponible.
function curriculumSpecificCompetencyBlocks() {
  ensureCurriculumCatalogState();
  return [
    ...curriculumOfficialSpecificCompetencyBlocks(),
    ...S.curriculumCatalog.customSpecificCompetencyBlocks,
  ];
}
// Construye el catálogo global de competencias específicas indexado por grado, área y competencia fundamental.
function curriculumSpecificCompetencyCatalog() {
  const catalog = {};
  curriculumSpecificCompetencyBlocks().forEach((block) => {
    if (!catalog[block.area]) catalog[block.area] = {};
    block.gradeKeys.forEach((gradeKey) => {
      if (!catalog[block.area][gradeKey]) catalog[block.area][gradeKey] = {};
      Object.entries(block.competencies || {}).forEach(([fundamental, values]) => {
        if (!catalog[block.area][gradeKey][fundamental]) catalog[block.area][gradeKey][fundamental] = [];
        values.forEach((value) => {
          if (!catalog[block.area][gradeKey][fundamental].includes(value)) {
            catalog[block.area][gradeKey][fundamental].push(value);
          }
        });
      });
    });
  });
  catalog.__fallback__ = curriculumNormalizeSpecificCompetencyFallbacks();
  return catalog;
}
// Busca una competencia específica exacta dentro del catálogo oficial usando todos los filtros relevantes.
function curriculumOfficialSpecificCompetencyExactLookup({ educationLevel = '', gradeKey = '', area = '', subject = '', fundamental = '' } = {}) {
  const cleanLevel = normalizeEducationLevelName(educationLevel || '');
  const cleanGradeKey = curriculumNormalizeGradeKey(gradeKey || '');
  const cleanArea = curriculumCatalogDisplayText(area || '');
  const cleanSubject = curriculumCatalogDisplayText(subject || '');
  const cleanFundamental = fixMojibakeText(normalizeSpanishDraftText(fundamental || '', { preserveCase: true })).trim();
  const levelRegistry = OFFICIAL_CURRICULUM_SPECIFIC_COMPETENCY_REGISTRY[cleanLevel] || {};
  const gradeRegistry = levelRegistry[cleanGradeKey] || {};
  const canonical = (value = '') => normTxt(curriculumCatalogDisplayText(value || ''));
  const areaEntry = Object.entries(gradeRegistry).find(([areaName]) => canonical(areaName) === canonical(cleanArea));
  if (!areaEntry) return '';
  const subjectRegistry = areaEntry[1] && typeof areaEntry[1] === 'object' ? areaEntry[1] : {};
  const subjectEntry = Object.entries(subjectRegistry).find(([subjectName]) => !cleanSubject || canonical(subjectName) === canonical(cleanSubject));
  if (!subjectEntry) return '';
  const competencyRegistry = subjectEntry[1] && typeof subjectEntry[1] === 'object' ? subjectEntry[1] : {};
  const exactEntry = Object.entries(competencyRegistry).find(([key]) => canonical(key) === canonical(cleanFundamental));
  return curriculumNormalizeSpecificCompetencyText(exactEntry?.[1] || '');
}
// Resuelve la competencia específica más apropiada para el contexto actual del grupo y del grado.
function curriculumSpecificCompetencyLookup({ area = '', subject = '', gradeId = '', gradeName = '', fundamental = '' } = {}) {
  const cleanArea = normalizeSpanishDraftText(area || '', { preserveCase: true }).trim();
  const cleanFundamental = normalizeSpanishDraftText(fundamental || '', { preserveCase: true }).trim();
  const cleanSubject = normalizeSpanishDraftText(subject || '', { preserveCase: true }).trim();
  const ctx = curriculumGradeContext(gradeId, gradeName);
  const catalog = curriculumSpecificCompetencyCatalog();
  const options = [];
  const append = (values = []) => {
    (Array.isArray(values) ? values : []).forEach((value) => {
      const cleanValue = curriculumNormalizeSpecificCompetencyText(value);
      if (cleanValue && !options.includes(cleanValue)) options.push(cleanValue);
    });
  };
  const canonical = (value = '') => normTxt(fixMojibakeText(normalizeSpanishDraftText(value || '', { preserveCase: true })));
  const canonicalArea = canonical(cleanArea);
  const canonicalFundamental = canonical(cleanFundamental);
  const canonicalSubject = canonical(cleanSubject);
  const exactOfficialText = curriculumOfficialSpecificCompetencyExactLookup({
    educationLevel: ctx.educationLevel,
    gradeKey: ctx.gradeKey,
    area: cleanArea,
    subject: cleanSubject,
    fundamental: cleanFundamental,
  });
  if (exactOfficialText) {
    return {
      area: cleanArea,
      gradeKey: ctx.gradeKey,
      cycle: ctx.cycle,
      fundamental: cleanFundamental,
      options: [exactOfficialText],
      usesFallback: false,
    };
  }
  if (cleanArea && cleanFundamental && ctx.gradeKey) {
    append(catalog[cleanArea]?.[ctx.gradeKey]?.[cleanFundamental] || []);
  }
  if (!options.length && cleanArea && cleanFundamental && catalog[cleanArea]) {
    Object.values(catalog[cleanArea]).forEach((fundamentalMap) => append(fundamentalMap?.[cleanFundamental] || []));
  }
  if (!options.length && cleanFundamental) {
    append(catalog.__fallback__?.General?.[cleanFundamental] || []);
  }
  return {
    area: cleanArea,
    gradeKey: ctx.gradeKey,
    cycle: ctx.cycle,
    fundamental: cleanFundamental,
    options,
    usesFallback: !cleanArea || !ctx.gradeKey || !catalog[cleanArea]?.[ctx.gradeKey]?.[cleanFundamental],
  };
}
// Calcula el contexto curricular de un grado para saber qué catálogo aplicar.
function curriculumGradeContext(gradeId = '', gradeName = '') {
  const grade = (S.grades || []).find((item) => String(item.id || '') === String(gradeId || '')) || null;
  const label = String(grade?.name || gradeName || '').trim();
  const educationLevel = normalizeEducationLevelName(
    grade?.educationLevel
    || grade?.educationSection
    || grade?.nivel
    || grade?.level
    || (/\bsecundaria\b/i.test(label) ? 'Secundaria' : '')
  );
  const rank = grade?.gradeLevel || parseGradeLevel(label);
  const gradeKey = educationLevel === 'Secundaria' && rank >= 1 && rank <= 6 ? SECONDARY_CURRICULUM_GRADE_KEYS[rank - 1] : '';
  return {
    grade,
    label,
    educationLevel,
    rank,
    gradeKey,
    cycle: educationLevel === 'Secundaria' && rank >= 1 && rank <= 3
      ? 'Secundaria - Primer ciclo'
      : (educationLevel === 'Secundaria' && rank >= 4 && rank <= 6 ? 'Secundaria - Segundo ciclo' : ''),
  };
}
// Devuelve el catálogo oficial de áreas por nivel educativo.
function curriculumOfficialAreaCatalog(educationLevel = 'Secundaria') {
  return normalizeEducationLevelName(educationLevel) === 'Secundaria' ? DOMINICAN_SECONDARY_CURRICULUM_AREAS : [];
}
// Normaliza el texto visible de un área o asignatura para poder mostrarlo sin ruido de formato.
function curriculumCatalogDisplayText(value = '') {
  return fixMojibakeText(normalizeSpanishDraftText(value || '', { preserveCase: true })).trim();
}
// Genera la versión canónica de un texto curricular para comparaciones más seguras.
function curriculumCatalogCanonicalText(value = '') {
  return normTxt(curriculumCatalogDisplayText(value || ''));
}
// Busca el área oficial de una asignatura para un grado concreto.
function curriculumOfficialSubjectArea(subject = '', gradeId = '', gradeName = '') {
  const cleanSubject = curriculumCatalogCanonicalText(subject || '');
  if (!cleanSubject) return '';
  const ctx = curriculumGradeContext(gradeId, gradeName);
  for (const areaEntry of curriculumOfficialAreaCatalog(ctx.educationLevel || 'Secundaria')) {
    for (const subjectEntry of areaEntry.subjects || []) {
      if (curriculumCatalogCanonicalText(subjectEntry.name || '') !== cleanSubject) continue;
      if (!ctx.gradeKey || !Array.isArray(subjectEntry.grades) || !subjectEntry.grades.length || subjectEntry.grades.includes(ctx.gradeKey)) {
        return curriculumCatalogDisplayText(areaEntry.name || '');
      }
    }
  }
  return '';
}
// Construye las opciones de áreas personalizadas creadas por el centro.
function curriculumCustomAreaOptions(educationLevel = 'Secundaria') {
  ensureCurriculumCatalogState();
  const level = normalizeEducationLevelName(educationLevel || 'Secundaria');
  return S.curriculumCatalog.customAreas
    .filter((item) => !level || normalizeEducationLevelName(item.educationLevel || 'Secundaria') === level)
    .map((item) => item.name);
}
// Combina áreas oficiales y personalizadas para los selectores del editor.
function curriculumExistingAreaOptions(educationLevel = 'Secundaria', gradeId = '', gradeName = '') {
  const level = normalizeEducationLevelName(educationLevel || curriculumGradeContext(gradeId, gradeName).educationLevel || 'Secundaria');
  const deduped = new Map();
  (S.secciones || [])
    .filter((section) => {
      const sectionCtx = curriculumGradeContext(section.gradeId || '', section.grado || '');
      return !level || normalizeEducationLevelName(sectionCtx.educationLevel || level) === level;
    })
    .map((section) => curriculumCatalogDisplayText(section.area || curriculumOfficialSubjectArea(section.materia || '', section.gradeId || '', section.grado || '') || ''))
    .filter(Boolean)
    .forEach((area) => {
      const key = curriculumCatalogCanonicalText(area);
      if (!deduped.has(key)) deduped.set(key, area);
    });
  return [...deduped.values()];
}
// Ordena áreas de currículo de forma estable para que el selector siempre muestre una jerarquía entendible.
function curriculumAreaSort(items = []) {
  const byCanonical = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const clean = curriculumCatalogDisplayText(item || '');
    const key = curriculumCatalogCanonicalText(clean);
    if (clean && key && !byCanonical.has(key)) byCanonical.set(key, clean);
  });
  const ordered = [];
  curriculumOfficialAreaCatalog('Secundaria').forEach((entry) => {
    const area = curriculumCatalogDisplayText(entry.name || '');
    const key = curriculumCatalogCanonicalText(area);
    if (!key || !byCanonical.has(key)) return;
    ordered.push(byCanonical.get(key));
    byCanonical.delete(key);
  });
  const extras = [...byCanonical.values()].sort((a, b) => String(a || '').localeCompare(String(b || ''), 'es'));
  return [...ordered, ...extras];
}
// Devuelve las opciones de área filtradas por el contexto del grado y el nivel educativo.
function curriculumAreaOptionsForContext(gradeId = '', gradeName = '', educationLevel = '') {
  const ctx = curriculumGradeContext(gradeId, gradeName);
  const level = normalizeEducationLevelName(educationLevel || ctx.educationLevel || 'Secundaria') || 'Secundaria';
  const values = new Set([
    ...curriculumOfficialAreaCatalog(level).map((item) => curriculumCatalogDisplayText(item.name || '')),
    ...curriculumCustomAreaOptions(level).map((item) => curriculumCatalogDisplayText(item || '')),
    ...curriculumExistingAreaOptions(level, gradeId, gradeName),
  ]);
  return curriculumAreaSort([...values]);
}
// Indica si un área ya está cubierta por una asignatura oficial dentro del contexto actual.
function curriculumAreaHasOfficialSubject(area = '', gradeId = '', gradeName = '') {
  const cleanArea = curriculumCatalogDisplayText(area || '');
  if (!cleanArea) return false;
  const ctx = curriculumGradeContext(gradeId, gradeName);
  const areaEntry = curriculumOfficialAreaCatalog(ctx.educationLevel || 'Secundaria')
    .find((item) => curriculumCatalogCanonicalText(item.name || '') === curriculumCatalogCanonicalText(cleanArea));
  if (!areaEntry) return false;
  if (!ctx.gradeKey) return !!(areaEntry.subjects || []).length;
  return (areaEntry.subjects || []).some((subject) => !Array.isArray(subject.grades) || !subject.grades.length || subject.grades.includes(ctx.gradeKey));
}
// Devuelve las asignaturas existentes que coinciden con los filtros del panel.
function curriculumExistingSubjectsForFilter({ gradeId = '', area = '', sectionName = '' } = {}) {
  const cleanArea = curriculumCatalogCanonicalText(area || '');
  const cleanSection = String(sectionName || '').trim().toLowerCase();
  return (S.secciones || []).filter((section) => {
    const sameGrade = !gradeId || String(section.gradeId || '') === String(gradeId || '');
    const sameSection = !cleanSection || String(section.sec || '').trim().toLowerCase() === cleanSection;
    const sectionArea = curriculumCatalogCanonicalText(section.area || curriculumOfficialSubjectArea(section.materia || '', section.gradeId || '', section.grado || '') || '');
    const sameArea = !cleanArea || sectionArea === cleanArea;
    return sameGrade && sameSection && sameArea;
  });
}
// Arma la lista de asignaturas válidas según el contexto actual y el catálogo oficial/local.
function curriculumSubjectOptions({ gradeId = '', gradeName = '', area = '', sectionName = '', scopeToExistingSections = false, educationLevel = '' } = {}) {
  ensureCurriculumCatalogState();
  const ctx = curriculumGradeContext(gradeId, gradeName);
  const resolvedEducationLevel = normalizeEducationLevelName(educationLevel || ctx.educationLevel || 'Secundaria') || 'Secundaria';
  const cleanArea = curriculumCatalogDisplayText(area || '');
  const cleanAreaKey = curriculumCatalogCanonicalText(cleanArea);
  if (!cleanArea) return [];
  const byValue = new Map();
  const addOption = (name, meta = {}) => {
    const cleanName = curriculumCatalogDisplayText(name || '');
    if (!cleanName) return;
    const key = curriculumCatalogCanonicalText(cleanName);
    if (byValue.has(key)) return;
    byValue.set(key, {
      value: cleanName,
      label: cleanName,
      area: cleanArea,
      source: meta.source || 'custom',
      grades: meta.grades || [],
    });
  };
  const scopedSectionRows = curriculumExistingSubjectsForFilter({ gradeId, area: cleanArea, sectionName });
  if (scopeToExistingSections && scopedSectionRows.length) {
    scopedSectionRows.forEach((section) => addOption(section.materia || '', { source: 'section' }));
    return [...byValue.values()];
  }
  const officialArea = curriculumOfficialAreaCatalog(resolvedEducationLevel)
    .find((item) => curriculumCatalogCanonicalText(item.name || '') === cleanAreaKey);
  (officialArea?.subjects || []).forEach((subject) => {
    if (!ctx.gradeKey || !Array.isArray(subject.grades) || !subject.grades.length || subject.grades.includes(ctx.gradeKey)) {
      addOption(subject.name, { source: 'official', grades: subject.grades || [] });
    }
  });
  S.curriculumCatalog.customSubjects
    .filter((item) => curriculumCatalogCanonicalText(item.area || '') === cleanAreaKey)
    .filter((item) => {
      const itemLevel = normalizeEducationLevelName(item.educationLevel || 'Secundaria');
      if (resolvedEducationLevel && itemLevel && itemLevel !== resolvedEducationLevel) return false;
      if (!ctx.gradeKey || !Array.isArray(item.gradeKeys) || !item.gradeKeys.length) return true;
      return item.gradeKeys.includes(ctx.gradeKey);
    })
    .forEach((item) => addOption(item.name, { source: 'custom', grades: item.gradeKeys || [] }));
  scopedSectionRows.forEach((section) => addOption(section.materia || '', { source: 'section' }));
  return [...byValue.values()];
}
// Registra un área personalizada nueva cuando el catálogo oficial no cubre esa necesidad.
function curriculumRegisterCustomArea(name, educationLevel = 'Secundaria') {
  ensureCurriculumCatalogState();
  const cleanName = normalizeSpanishDraftText(name || '', { preserveCase: true }).trim();
  if (!cleanName) return '';
  const level = normalizeEducationLevelName(educationLevel || 'Secundaria') || 'Secundaria';
  const existingOfficial = curriculumOfficialAreaCatalog(level).find((item) => normTxt(item.name) === normTxt(cleanName));
  if (existingOfficial) return existingOfficial.name;
  const existingCustom = S.curriculumCatalog.customAreas.find((item) => normTxt(item.name) === normTxt(cleanName) && normalizeEducationLevelName(item.educationLevel || 'Secundaria') === level);
  if (existingCustom) return existingCustom.name;
  S.curriculumCatalog.customAreas.push({ id: uid(), name: cleanName, educationLevel: level });
  persist();
  return cleanName;
}
// Registra una asignatura personalizada y la vincula a su área de trabajo.
function curriculumRegisterCustomSubject(name, area, options = {}) {
  ensureCurriculumCatalogState();
  const cleanName = normalizeSpanishDraftText(name || '', { preserveCase: true }).trim();
  const cleanArea = normalizeSpanishDraftText(area || '', { preserveCase: true }).trim();
  if (!cleanName || !cleanArea) return '';
  const ctx = curriculumGradeContext(options.gradeId || '', options.gradeName || '');
  const level = normalizeEducationLevelName(options.educationLevel || ctx.educationLevel || 'Secundaria') || 'Secundaria';
  const existingOfficial = curriculumSubjectOptions({
    area: cleanArea,
    gradeId: options.gradeId || '',
    gradeName: options.gradeName || '',
    educationLevel: level,
  }).find((item) => item.source === 'official' && normTxt(item.value) === normTxt(cleanName));
  if (existingOfficial) return existingOfficial.value;
  const desiredGradeKeys = curriculumNormalizeGradeKeys(options.gradeKeys || (ctx.gradeKey ? [ctx.gradeKey] : []));
  const existingCustom = S.curriculumCatalog.customSubjects.find((item) => (
    normTxt(item.name) === normTxt(cleanName)
    && normTxt(item.area) === normTxt(cleanArea)
    && normalizeEducationLevelName(item.educationLevel || 'Secundaria') === level
  ));
  if (existingCustom) {
    if (desiredGradeKeys.length) {
      existingCustom.gradeKeys = [...new Set([...(existingCustom.gradeKeys || []), ...desiredGradeKeys])];
      persist();
    }
    return existingCustom.name;
  }
  S.curriculumCatalog.customSubjects.push({
    id: uid(),
    name: cleanName,
    area: cleanArea,
    educationLevel: level,
    gradeKeys: desiredGradeKeys,
  });
  persist();
  return cleanName;
}
// Guarda un bloque de competencias específicas personalizado u oficial dentro del catálogo general.
function curriculumRegisterSpecificCompetencyBlock(entry) {
  ensureCurriculumCatalogState();
  const normalized = curriculumNormalizeSpecificCompetencyBlock(entry, 'custom');
  if (!normalized) return null;
  const existing = S.curriculumCatalog.customSpecificCompetencyBlocks.find((item) => item.id === normalized.id)
    || S.curriculumCatalog.customSpecificCompetencyBlocks.find((item) => (
      normTxt(item.area) === normTxt(normalized.area)
      && JSON.stringify(item.gradeKeys || []) === JSON.stringify(normalized.gradeKeys || [])
      && String(item.cycle || '') === String(normalized.cycle || '')
    ));
  if (existing) {
    existing.source = normalized.source;
    existing.status = normalized.status;
    existing.competencies = normalized.competencies;
    persist();
    return existing;
  }
  S.curriculumCatalog.customSpecificCompetencyBlocks.push(normalized);
  persist();
  return normalized;
}
// Comprueba si una asignatura debe resolverse contra el catálogo oficial en vez de un valor libre.
function curriculumSubjectUsesOfficialCatalog(subject = '', gradeId = '', gradeName = '') {
  return !!curriculumOfficialSubjectArea(subject, gradeId, gradeName);
}
// Devuelve las áreas disponibles para el selector del plan de clase.
function lessonPlanAreaOptions(gradeId = '', gradeName = '') {
  return curriculumAreaOptionsForContext(gradeId, gradeName);
}
// Resuelve el área académica principal de un grupo a partir de su configuración y de su materia.
function lessonPlanAreaFromGroup(group) {
  const explicitArea = curriculumCatalogDisplayText(group?.area || '');
  const officialArea = curriculumOfficialSubjectArea(group?.materia || '', group?.gradeId || '', group?.grado || '');
  if (officialArea) return officialArea;
  if (explicitArea) return explicitArea;
  const subject = curriculumCatalogCanonicalText(group?.materia || '');
  if (!subject) return '';
  if (/(biologia|quimica|fisica|ciencia|naturaleza|tierra|vida)/.test(subject)) return 'Ciencias de la Naturaleza';
  if (/(lengua|literaria|texto|periodistic|publicitario|espanol)/.test(subject)) return 'Lengua Espa\u00f1ola';
  if (/(matemat|algebra|geometr)/.test(subject)) return 'Matem\u00e1tica';
  if (/(social|historia|geografia|geografía)/.test(subject)) return 'Ciencias Sociales';
  if (/ingles|english|frances|franc[eé]s/.test(subject)) return 'Lenguas Extranjeras';
  return '';
}
// Construye el nombre completo del grado para mostrarlo en planificaciones e impresiones.
function lessonPlanFullGradeName(group = null, grade = null) {
  const raw = String(grade?.name || group?.grado || '').trim();
  if (!raw) return '';
  if (/\bde\b/i.test(raw)) return raw;
  const educationLevel = normalizeEducationLevelName(
    grade?.educationLevel
    || grade?.educationSection
    || grade?.nivel
    || grade?.level
    || S.profile?.educationSection
    || ''
  );
  return `${raw} de ${educationLevel.toLowerCase()}`.trim();
}
// Convierte una fecha del plan de clase en un texto largo y legible.
function lessonPlanClassDateLongLabel(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  try {
    const date = new Date(`${normalized}T12:00:00`);
    const weekday = date.toLocaleDateString('es-DO', { weekday: 'long' });
    const prettyWeekday = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : '';
    const prettyDate = date.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${prettyDate} - ${prettyWeekday}`.trim();
  } catch (error) {
    return normalized;
  }
}
// Calcula la duración base de una hora de clase para repartir los bloques de la planificación.
function lessonPlanBaseMinutes() {
  const firstSlot = teacherScheduleRowsForActiveDays().find((row) => sanitizeTeacherScheduleRow(row).blockType === 'class');
  if (firstSlot) {
    const start = teacherScheduleTimeToMinutes(firstSlot.startTime);
    const end = teacherScheduleTimeToMinutes(firstSlot.endTime);
    const diff = start !== null && end !== null ? Math.max(1, end - start) : 0;
    if (diff >= 35 && diff <= 60) return diff;
  }
  return 40;
}
// Convierte una duración numérica en una etiqueta corta para el editor de clases.
function lessonPlanDurationLabel(hours) {
  const blocks = Math.max(1, parseInt(hours, 10) || 1);
  const minutes = lessonPlanBaseMinutes() * blocks;
  return `${blocks} hora${blocks > 1 ? 's' : ''} de clase · ${minutes} minutos`;
}
// Crea la estructura mínima de una clase dentro de una planificación.
function lessonPlanCreateClass(index = 1, overrides = {}) {
  const base = {
    id: uid(),
    index,
    title: '',
    date: '',
    durationHours: '1',
    durationMinutes: lessonPlanDurationLabel(1),
    pedagogicalIntent: '',
    notes: '',
    resourcesPreset: [],
    resourcesText: '',
    activityLinks: [],
    start: {
      description: '',
      questions: '',
      priorKnowledge: '',
      intention: '',
      time: '',
    },
    development: {
      description: '',
      teacherAction: '',
      studentAction: '',
      contentExplanation: '',
      activities: '',
      socialization: '',
      time: '',
    },
    closure: {
      summary: '',
      metacognition: '',
      conclusions: '',
      task: '',
      time: '',
    },
    adaptation: {
      studentName: '',
      needType: '',
      activityAdaptation: '',
      evaluationAdaptation: '',
      observation: '',
    },
  };
  return {
    ...base,
    ...overrides,
    start: { ...base.start, ...(overrides.start || {}) },
    development: { ...base.development, ...(overrides.development || {}) },
    closure: { ...base.closure, ...(overrides.closure || {}) },
    adaptation: { ...base.adaptation, ...(overrides.adaptation || {}) },
    resourcesPreset: Array.isArray(overrides.resourcesPreset) ? overrides.resourcesPreset.filter(Boolean) : base.resourcesPreset,
    activityLinks: Array.isArray(overrides.activityLinks) ? overrides.activityLinks.filter(Boolean) : base.activityLinks,
  };
}
// Crea una planificación general nueva usando el grupo y período activos como contexto inicial.
function lessonPlanCreateGeneral(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const group = (S.secciones || []).find((item) => item.id === groupId) || null;
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === group?.gradeId) || null;
  return {
    center: lessonPlanInstitutionName(),
    teacher: lessonPlanTeacherName(),
    area: lessonPlanAreaFromGroup(group),
    subject: group?.materia || '',
    subarea: group?.materia || '',
    usesTemporaryGrade: false,
    gradeId: group?.gradeId || '',
    gradeName: lessonPlanFullGradeName(group, grade),
    sectionId: groupId || '',
    sectionName: group?.sec || '',
    groupId: groupId || '',
    periodId: periodId || S.activePeriodId || 'P1',
    themeTitle: '',
    sequenceName: '',
    title: '',
    transversalAxis: '',
    classDate: '',
    scheduleLinked: false,
    totalDuration: '',
    classCount: 1,
    startDate: '',
    endDate: '',
  };
}
// Crea una planificación vacía lista para editarse desde cero.
function lessonPlanCreateBlank(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const now = Date.now();
  return {
    id: uid(),
    version: 2,
    status: 'draft',
    editorStep: 'general',
    groupId: groupId || '',
    periodId: periodId || S.activePeriodId || 'P1',
    createdAt: now,
    updatedAt: now,
    general: lessonPlanCreateGeneral(groupId, periodId),
    curriculum: {
      fundamentalCompetencies: '',
      specificCompetencies: '',
      specificCompetencyMap: {},
      specificCompetencyModeMap: {},
      conceptualMeta: {
        topic: '',
        subtopics: [],
        notesByTopic: {},
      },
      conceptualContents: '',
      proceduralMeta: {
        topic: '',
        subtopics: [],
        itemIds: [],
        manualReviewRequired: false,
      },
      proceduralItemMap: {},
      proceduralContents: '',
      attitudinalMeta: {
        topic: '',
        subtopics: [],
        itemIds: [],
        manualReviewRequired: false,
      },
      attitudinalItemMap: {},
      attitudinalContents: '',
      indicatorMeta: {
        topic: '',
        subtopics: [],
        itemIds: [],
        manualReviewRequired: false,
      },
      indicatorItemMap: {},
      indicators: '',
    },
    strategy: {
      teachingLearning: '',
      methodology: '',
      organization: '',
      inclusionNotes: '',
    },
    resources: {
      preset: [],
      notes: '',
    },
    classes: [lessonPlanCreateClass(1)],
    exportMeta: {
      template: 'structured',
      futureAiReady: true,
      curriculumSource: 'manual',
    },
  };
}
// Normaliza una referencia a actividad para que la planificación conserve vínculos consistentes.
function lessonPlanNormalizeActivityLink(link) {
  const base = link && typeof link === 'object' ? link : {};
  return {
    activityId: String(base.activityId || '').trim(),
    blockId: BLOCKS.includes(base.blockId) ? base.blockId : 'B1',
    instrumentId: String(base.instrumentId || '').trim(),
    evidence: String(base.evidence || '').trim(),
    technique: String(base.technique || '').trim(),
  };
}
// Limpia y normaliza una clase del plan para que siempre tenga campos coherentes.
function lessonPlanNormalizeClass(rawClass, index = 1) {
  const base = rawClass && typeof rawClass === 'object' ? rawClass : {};
  const durationHours = String(base.durationHours || '').trim() || '1';
  return lessonPlanCreateClass(index, {
    ...base,
    id: base.id || uid(),
    index,
    title: String(base.title || base.topic || '').trim(),
    date: String(base.date || '').trim(),
    durationHours,
    durationMinutes: String(base.durationMinutes || base.duration || lessonPlanDurationLabel(durationHours)).trim(),
    pedagogicalIntent: String(base.pedagogicalIntent || base.intent || '').trim(),
    notes: String(base.notes || '').trim(),
    resourcesPreset: Array.isArray(base.resourcesPreset) ? base.resourcesPreset.map((item) => String(item || '').trim()).filter(Boolean) : [],
    resourcesText: String(base.resourcesText || '').trim(),
    activityLinks: Array.isArray(base.activityLinks) ? base.activityLinks.map(lessonPlanNormalizeActivityLink).filter((item) => item.activityId) : [],
    start: base.start || {},
    development: base.development || {},
    closure: base.closure || {},
    adaptation: base.adaptation || {},
  });
}
// Normaliza una planificación completa y reconstruye la estructura esperada por el editor.
function lessonPlanNormalizePlan(plan) {
  const base = plan && typeof plan === 'object' ? plan : {};
  if (!base.general && (base.title || base.date || base.contents || base.activities)) {
    const legacy = lessonPlanCreateBlank(base.groupId || '', base.periodId || S.activePeriodId || 'P1');
    legacy.id = base.id || legacy.id;
    legacy.createdAt = Number.isFinite(base.createdAt) ? base.createdAt : legacy.createdAt;
    legacy.updatedAt = Number.isFinite(base.updatedAt) ? base.updatedAt : legacy.updatedAt;
    legacy.general.title = String(base.title || '').trim();
    legacy.general.startDate = String(base.date || '').trim();
    legacy.general.endDate = String(base.date || '').trim();
    legacy.resources.notes = String(base.resources || '').trim();
    legacy.curriculum.conceptualContents = String(base.contents || '').trim();
    legacy.curriculum.indicators = String(base.evidences || '').trim();
    legacy.strategy.teachingLearning = String(base.purpose || '').trim();
    legacy.classes = [lessonPlanCreateClass(1, {
      date: String(base.date || '').trim(),
      title: String(base.title || '').trim(),
      development: {
        description: String(base.activities || '').trim(),
        activities: String(base.activities || '').trim(),
      },
      closure: { conclusions: String(base.notes || '').trim() },
      resourcesText: String(base.resources || '').trim(),
      notes: String(base.notes || '').trim(),
    })];
    return legacy;
  }
  const normalized = lessonPlanCreateBlank(lessonPlanStoredGroupId(base), lessonPlanStoredPeriodId(base));
  normalized.id = base.id || normalized.id;
  normalized.version = 2;
  normalized.status = base.status === 'completed' ? 'completed' : 'draft';
  normalized.editorStep = lessonPlanSectionOrder().includes(String(base.editorStep || '').trim()) ? String(base.editorStep || '').trim() : 'general';
  normalized.groupId = lessonPlanStoredGroupId(base);
  normalized.periodId = lessonPlanStoredPeriodId(base);
  normalized.createdAt = Number.isFinite(base.createdAt) ? base.createdAt : normalized.createdAt;
  normalized.updatedAt = Number.isFinite(base.updatedAt) ? base.updatedAt : normalized.updatedAt;
  normalized.general = { ...normalized.general, ...(base.general || {}) };
  normalized.general.groupId = normalized.groupId;
  normalized.general.sectionId = normalized.general.sectionId || normalized.groupId;
  normalized.general.periodId = normalized.periodId;
  normalized.general.usesTemporaryGrade = !!normalized.general.usesTemporaryGrade;
  normalized.general.themeTitle = String(normalized.general.themeTitle || normalized.general.title || '').trim();
  normalized.general.sequenceName = String(normalized.general.sequenceName || '').trim();
  normalized.general.classDate = String(normalized.general.classDate || normalized.general.startDate || normalized.classes?.[0]?.date || '').trim();
  normalized.general.scheduleLinked = !!normalized.general.scheduleLinked;
  normalized.general.title = String(normalized.general.title || normalized.general.themeTitle || '').trim();
  normalized.general.startDate = String(normalized.general.startDate || normalized.general.classDate || '').trim();
  normalized.general.endDate = String(normalized.general.endDate || normalized.general.classDate || '').trim();
  normalized.curriculum = { ...normalized.curriculum, ...(base.curriculum || {}) };
  if (!normalized.curriculum.specificCompetencyMap || typeof normalized.curriculum.specificCompetencyMap !== 'object') {
    normalized.curriculum.specificCompetencyMap = {};
  }
  if (!normalized.curriculum.specificCompetencyModeMap || typeof normalized.curriculum.specificCompetencyModeMap !== 'object') {
    normalized.curriculum.specificCompetencyModeMap = {};
  }
  normalized.curriculum.conceptualMeta = {
    topic: String(base.curriculum?.conceptualMeta?.topic || '').trim(),
    subtopics: Array.isArray(base.curriculum?.conceptualMeta?.subtopics)
      ? base.curriculum.conceptualMeta.subtopics.map((item) => normalizeSpanishDraftText(item || '', { preserveCase: true }).trim()).filter(Boolean)
      : [],
    notesByTopic: base.curriculum?.conceptualMeta?.notesByTopic && typeof base.curriculum.conceptualMeta.notesByTopic === 'object'
      ? Object.fromEntries(
        Object.entries(base.curriculum.conceptualMeta.notesByTopic)
          .map(([topicName, note]) => [
            normalizeSpanishDraftText(topicName || '', { preserveCase: true }).trim(),
            normalizeSpanishDraftText(note || '', { preserveCase: true }).trim(),
          ])
          .filter(([topicName, note]) => topicName && note)
      )
      : {},
  };
  if (!normalized.curriculum.conceptualMeta.topic && normalized.curriculum.conceptualContents) {
    const parsed = lessonPlanParseConceptualSummary(normalized.curriculum.conceptualContents);
    normalized.curriculum.conceptualMeta = {
      topic: parsed.topic,
      subtopics: parsed.subtopics,
      notesByTopic: normalized.curriculum.conceptualMeta.notesByTopic || {},
    };
  }
  normalized.curriculum.proceduralMeta = {
    topic: String(base.curriculum?.proceduralMeta?.topic || '').trim(),
    subtopics: Array.isArray(base.curriculum?.proceduralMeta?.subtopics)
      ? base.curriculum.proceduralMeta.subtopics
        .map((item) => normalizeSpanishDraftText(item || '', { preserveCase: true }).trim())
        .filter(Boolean)
      : [],
    itemIds: Array.isArray(base.curriculum?.proceduralMeta?.itemIds)
      ? base.curriculum.proceduralMeta.itemIds
        .map((item) => String(item || '').trim())
        .filter(Boolean)
      : [],
    manualReviewRequired: !!base.curriculum?.proceduralMeta?.manualReviewRequired,
  };
  if (!normalized.curriculum.proceduralItemMap || typeof normalized.curriculum.proceduralItemMap !== 'object') {
    normalized.curriculum.proceduralItemMap = {};
  } else {
    normalized.curriculum.proceduralItemMap = Object.fromEntries(
      Object.entries(normalized.curriculum.proceduralItemMap)
        .map(([key, value]) => [String(key || '').trim(), normalizeSpanishDraftText(value || '', { preserveCase: true }).trim()])
        .filter(([key, value]) => key && value)
    );
  }
  normalized.curriculum.attitudinalMeta = {
    topic: String(base.curriculum?.attitudinalMeta?.topic || '').trim(),
    subtopics: Array.isArray(base.curriculum?.attitudinalMeta?.subtopics)
      ? base.curriculum.attitudinalMeta.subtopics
        .map((item) => normalizeSpanishDraftText(item || '', { preserveCase: true }).trim())
        .filter(Boolean)
      : [],
    itemIds: Array.isArray(base.curriculum?.attitudinalMeta?.itemIds)
      ? base.curriculum.attitudinalMeta.itemIds
        .map((item) => String(item || '').trim())
        .filter(Boolean)
      : [],
    manualReviewRequired: !!base.curriculum?.attitudinalMeta?.manualReviewRequired,
  };
  if (!normalized.curriculum.attitudinalItemMap || typeof normalized.curriculum.attitudinalItemMap !== 'object') {
    normalized.curriculum.attitudinalItemMap = {};
  } else {
    normalized.curriculum.attitudinalItemMap = Object.fromEntries(
      Object.entries(normalized.curriculum.attitudinalItemMap)
        .map(([key, value]) => [String(key || '').trim(), normalizeSpanishDraftText(value || '', { preserveCase: true }).trim()])
        .filter(([key, value]) => key && value)
    );
  }
  normalized.curriculum.indicatorMeta = {
    topic: String(base.curriculum?.indicatorMeta?.topic || '').trim(),
    subtopics: Array.isArray(base.curriculum?.indicatorMeta?.subtopics)
      ? base.curriculum.indicatorMeta.subtopics
        .map((item) => normalizeSpanishDraftText(item || '', { preserveCase: true }).trim())
        .filter(Boolean)
      : [],
    itemIds: Array.isArray(base.curriculum?.indicatorMeta?.itemIds)
      ? base.curriculum.indicatorMeta.itemIds
        .map((item) => String(item || '').trim())
        .filter(Boolean)
      : [],
    manualReviewRequired: !!base.curriculum?.indicatorMeta?.manualReviewRequired,
  };
  if (!normalized.curriculum.indicatorItemMap || typeof normalized.curriculum.indicatorItemMap !== 'object') {
    normalized.curriculum.indicatorItemMap = {};
  } else {
    normalized.curriculum.indicatorItemMap = Object.fromEntries(
      Object.entries(normalized.curriculum.indicatorItemMap)
        .map(([key, value]) => [String(key || '').trim(), normalizeSpanishDraftText(value || '', { preserveCase: true }).trim()])
        .filter(([key, value]) => key && value)
    );
  }
  Object.keys(normalized.curriculum.specificCompetencyMap).forEach((key) => {
    const cleanKey = fixMojibakeText(normalizeSpanishDraftText(key || '', { preserveCase: true })).trim();
    const cleanValue = curriculumNormalizeSpecificCompetencyText(normalized.curriculum.specificCompetencyMap[key] || '');
    if (!cleanKey) {
      delete normalized.curriculum.specificCompetencyMap[key];
      return;
    }
    if (cleanKey !== key) {
      delete normalized.curriculum.specificCompetencyMap[key];
      normalized.curriculum.specificCompetencyMap[cleanKey] = cleanValue;
      return;
    }
    normalized.curriculum.specificCompetencyMap[key] = cleanValue;
  });
  Object.keys(normalized.curriculum.specificCompetencyModeMap).forEach((key) => {
    const cleanKey = fixMojibakeText(normalizeSpanishDraftText(key || '', { preserveCase: true })).trim();
    const rawMode = String(normalized.curriculum.specificCompetencyModeMap[key] || '').trim().toLowerCase();
    const cleanMode = rawMode === 'manual' ? 'manual' : 'catalog';
    if (!cleanKey) {
      delete normalized.curriculum.specificCompetencyModeMap[key];
      return;
    }
    if (cleanKey !== key) {
      delete normalized.curriculum.specificCompetencyModeMap[key];
      normalized.curriculum.specificCompetencyModeMap[cleanKey] = cleanMode;
      return;
    }
    normalized.curriculum.specificCompetencyModeMap[key] = cleanMode;
  });
  normalized.strategy = { ...normalized.strategy, ...(base.strategy || {}) };
  normalized.resources = {
    preset: Array.isArray(base.resources?.preset) ? base.resources.preset.map((item) => String(item || '').trim()).filter(Boolean) : [],
    notes: String(base.resources?.notes || '').trim(),
  };
  normalized.classes = (Array.isArray(base.classes) ? base.classes : []).map((item, idx) => lessonPlanNormalizeClass(item, idx + 1));
  if (!normalized.classes.length) normalized.classes = [lessonPlanCreateClass(1)];
  normalized.exportMeta = { ...normalized.exportMeta, ...(base.exportMeta || {}) };
  return normalized;
}
// Decide si una planificación debe conservarse al migrar o limpiar datos viejos.
function lessonPlanShouldKeep(plan) {
  if (lessonPlanStoredGroupId(plan)) return true;
  const general = plan?.general || {};
  return !!(
    general.usesTemporaryGrade
    || String(general.gradeName || '').trim()
    || String(general.sectionName || '').trim()
    || String(general.subject || '').trim()
    || String(general.themeTitle || general.title || '').trim()
    || String(general.sequenceName || '').trim()
  );
}
// Garantiza que el estado de planificaciones tenga siempre colecciones, draft y UI consistentes.
// Garantiza que el estado de planificaciones exista y tenga la forma mínima requerida por los paneles.
function ensureLessonPlansState() {
  if (!Array.isArray(S.lessonPlans)) S.lessonPlans = [];
  S.lessonPlans = S.lessonPlans.map((plan) => lessonPlanNormalizePlan(plan)).filter((plan) => lessonPlanShouldKeep(plan));
  if (!S.lessonPlanDraft || typeof S.lessonPlanDraft !== 'object') {
    S.lessonPlanDraft = lessonPlanCreateBlank(S.activeGroupId, S.activePeriodId);
  } else {
    S.lessonPlanDraft = lessonPlanNormalizePlan(S.lessonPlanDraft);
  }
  if (!S.lessonPlanUi || typeof S.lessonPlanUi !== 'object') S.lessonPlanUi = {};
  if (!Array.isArray(S.lessonPlanUi.expandedClassIds)) {
    S.lessonPlanUi.expandedClassIds = (S.lessonPlanDraft.classes || []).map((lessonClass) => lessonClass.id);
  }
  if (!S.lessonPlanUi.activityDrafts || typeof S.lessonPlanUi.activityDrafts !== 'object') {
    S.lessonPlanUi.activityDrafts = {};
  }
  if (typeof S.lessonPlanUi.activeSectionId !== 'string') S.lessonPlanUi.activeSectionId = '';
  if (typeof S.lessonPlanUi.mode !== 'string') S.lessonPlanUi.mode = 'home';
  if (typeof S.lessonPlanUi.autosaveTimer !== 'number') S.lessonPlanUi.autosaveTimer = 0;
  if (!S.lessonPlanUi.generalErrors || typeof S.lessonPlanUi.generalErrors !== 'object') S.lessonPlanUi.generalErrors = {};
  if (!S.lessonPlanUi.curriculumErrors || typeof S.lessonPlanUi.curriculumErrors !== 'object') S.lessonPlanUi.curriculumErrors = {};
  if (!S.lessonPlanUi.curriculumBlockErrors || typeof S.lessonPlanUi.curriculumBlockErrors !== 'object') S.lessonPlanUi.curriculumBlockErrors = {};
  if (!Array.isArray(S.lessonPlanUi.expandedSpecificCompetencyFundamentals)) S.lessonPlanUi.expandedSpecificCompetencyFundamentals = [];
  if (!Array.isArray(S.lessonPlanUi.expandedProceduralItems)) S.lessonPlanUi.expandedProceduralItems = [];
  if (!Array.isArray(S.lessonPlanUi.expandedAttitudinalItems)) S.lessonPlanUi.expandedAttitudinalItems = [];
  if (!Array.isArray(S.lessonPlanUi.expandedIndicatorItems)) S.lessonPlanUi.expandedIndicatorItems = [];
}
// Devuelve la etiqueta visible de un bloque curricular para la UI de planificaciones.
function lessonPlanBlockLabel(blockId) {
  return LESSON_PLAN_BLOCK_LABELS[blockId] || BNAME?.[blockId] || 'Bloque';
}
// Filtra las planificaciones que pertenecen al grupo activo o al grupo pedido.
function lessonPlansForGroup(groupId = S.activeGroupId) {
  ensureLessonPlansState();
  return (S.lessonPlans || [])
    .filter((plan) => lessonPlanStoredGroupId(plan) === groupId && (!lessonPlanStoredPeriodId(plan) || lessonPlanStoredPeriodId(plan) === S.activePeriodId))
    .sort((a, b) => String(b.general?.classDate || b.general?.startDate || '').localeCompare(String(a.general?.classDate || a.general?.startDate || ''), 'es') || (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}
// Devuelve la lista de borradores de planificación disponibles en memoria.
function lessonPlanDrafts() {
  ensureLessonPlansState();
  return (S.lessonPlans || [])
    .filter((plan) => (plan.status || 'draft') !== 'completed')
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}
// Convierte una fecha de actualización en una etiqueta relativa comprensible para el usuario.
function lessonPlanRelativeUpdatedAt(value) {
  const ts = Number(value || 0);
  if (!ts) return 'Hace un momento';
  const delta = Math.max(0, Date.now() - ts);
  const minute = 60000;
  const hour = minute * 60;
  const day = hour * 24;
  if (delta < minute) return 'Hace unos segundos';
  if (delta < hour) {
    const minutes = Math.max(1, Math.round(delta / minute));
    return `Hace ${minutes} min`;
  }
  if (delta < day) {
    const hours = Math.max(1, Math.round(delta / hour));
    return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  }
  const days = Math.max(1, Math.round(delta / day));
  return `Hace ${days} día${days === 1 ? '' : 's'}`;
}
// Indica si el borrador usa un grado temporal que todavía no existe como sección formal.
function lessonPlanUsesTemporaryGrade(draft = lessonPlanDraft()) {
  return !!draft?.general?.usesTemporaryGrade;
}
// Devuelve los grados que pueden seleccionarse dentro del compositor de planificaciones.
function lessonPlanAvailableGrades() {
  return [...getScopedGrades()].sort((a, b) =>
    (a.gradeLevel || parseGradeLevel(a.name)) - (b.gradeLevel || parseGradeLevel(b.name))
    || String(a.name || '').localeCompare(String(b.name || ''), 'es')
  );
}
// Restringe las secciones disponibles a las que pertenecen al grado seleccionado.
function lessonPlanSectionsForGradeId(gradeId = '') {
  if (!gradeId) return [];
  return sortCourses((S.secciones || []).filter((section) => String(section.gradeId || '') === String(gradeId || '')));
}
// Convierte las secciones de un grado en opciones visibles para un selector HTML.
function lessonPlanSectionOptionsForGradeId(gradeId = '') {
  const rows = lessonPlanSectionsForGradeId(gradeId);
  const deduped = new Map();
  rows.forEach((group) => {
    const key = String(group?.sec || '').trim();
    if (!key) return;
    if (!deduped.has(key)) deduped.set(key, { value: key, label: key, groups: [] });
    deduped.get(key).groups.push(group);
  });
  return [...deduped.values()].sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'es'));
}
// Calcula las asignaturas posibles para el contexto del grado, área y sección seleccionados.
function lessonPlanSubjectOptionsForGradeId(gradeId = '', sectionName = '', area = '', gradeName = '') {
  return curriculumSubjectOptions({
    gradeId,
    gradeName,
    area,
    sectionName,
    scopeToExistingSections: !!String(sectionName || '').trim(),
  });
}
// Encuentra el grupo que mejor coincide con la selección curricular actual.
function lessonPlanResolveGroupForSelection(gradeId = '', sectionName = '', subject = '', preferredGroupId = '') {
  const normalizedSection = String(sectionName || '').trim().toLowerCase();
  const normalizedSubject = curriculumCatalogCanonicalText(subject || '');
  const matches = lessonPlanSectionsForGradeId(gradeId).filter((group) => {
    const sameSection = !normalizedSection || String(group?.sec || '').trim().toLowerCase() === normalizedSection;
    const sameSubject = !normalizedSubject || curriculumCatalogCanonicalText(group?.materia || '') === normalizedSubject;
    return sameSection && sameSubject;
  });
  return matches.find((group) => group.id === preferredGroupId) || matches[0] || null;
}
// Sugiere el área académica más probable para la combinación de grado, sección y asignatura.
function lessonPlanSuggestedAreaForSelection(gradeId = '', sectionName = '', subject = '', fallbackArea = '') {
  return String(fallbackArea || '').trim();
}
// Resuelve el grupo principal de un grado, priorizando un grupo preferido si existe.
function lessonPlanPrimaryGroupForGradeId(gradeId = '', preferredGroupId = '') {
  const sections = lessonPlanSectionsForGradeId(gradeId);
  return sections.find((section) => section.id === preferredGroupId) || sections[0] || null;
}
// Aplica un grupo seleccionado al borrador general sin perder los campos ya escritos.
function lessonPlanApplyGroupToGeneral(group, options = {}) {
  const draft = lessonPlanDraft();
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === group?.gradeId) || null;
  const keepPeriod = options.keepPeriod !== false;
  const cleanSubject = curriculumCatalogDisplayText(group?.materia || '');
  lessonPlanSetDraftValue('general.groupId', group?.id || '', false);
  lessonPlanSetDraftValue('general.sectionId', group?.id || '', false);
  lessonPlanSetDraftValue('groupId', group?.id || '', false);
  lessonPlanSetDraftValue('general.gradeId', group?.gradeId || '', false);
  lessonPlanSetDraftValue('general.gradeName', lessonPlanFullGradeName(group, grade), false);
  lessonPlanSetDraftValue('general.sectionName', group?.sec || '', false);
  lessonPlanSetDraftValue('general.subject', cleanSubject, false);
  lessonPlanSetDraftValue('general.subarea', cleanSubject, false);
  lessonPlanSetDraftValue('general.area', lessonPlanAreaFromGroup(group) || draft.general.area || '', false);
  if (!keepPeriod) lessonPlanSetDraftValue('general.periodId', S.activePeriodId || 'P1', false);
  if (draft.general.scheduleLinked && group?.id) {
    const suggestedDate = lessonPlanSuggestedNextClassDate(group.id, lessonPlanTodayIso());
    if (suggestedDate) lessonPlanSetClassDate(suggestedDate, false);
  }
  lessonPlanResyncSpecificCompetenciesForCurrentContext();
  lessonPlanResyncConceptualSelectionForCurrentContext();
  lessonPlanResyncProceduralSelectionForCurrentContext();
}
// Aplica al encabezado del plan la selección actual de grado, sección, asignatura y grupo.
// Sincroniza la selección general del plan con el grupo, área y asignatura elegidos.
function lessonPlanApplyGeneralSelection({
  gradeId = '',
  gradeName = '',
  sectionName = '',
  subject = '',
  area = '',
  group = null,
  keepPeriod = true,
} = {}) {
  lessonPlanSetDraftValue('general.gradeId', gradeId || '', false);
  lessonPlanSetDraftValue('general.gradeName', gradeName || '', false);
  lessonPlanSetDraftValue('general.sectionName', sectionName || '', false);
  lessonPlanSetDraftValue('general.subject', curriculumCatalogDisplayText(subject || ''), false);
  lessonPlanSetDraftValue('general.subarea', curriculumCatalogDisplayText(subject || ''), false);
  lessonPlanSetDraftValue('general.area', curriculumCatalogDisplayText(area || ''), false);
  lessonPlanSetDraftValue('general.groupId', group?.id || '', false);
  lessonPlanSetDraftValue('general.sectionId', group?.id || '', false);
  lessonPlanSetDraftValue('groupId', group?.id || '', false);
  if (!keepPeriod) lessonPlanSetDraftValue('general.periodId', S.activePeriodId || 'P1', false);
  if (lessonPlanDraft().general.scheduleLinked && group?.id) {
    const suggestedDate = lessonPlanSuggestedNextClassDate(group.id, lessonPlanTodayIso());
    if (suggestedDate) lessonPlanSetClassDate(suggestedDate, false);
  }
  lessonPlanResyncSpecificCompetenciesForCurrentContext();
  lessonPlanResyncConceptualSelectionForCurrentContext();
  lessonPlanResyncProceduralSelectionForCurrentContext();
}
// Cambia el grado del plan general y ajusta el resto de campos relacionados.
function lessonPlanSetGradeSelection(value, rerender = true) {
  const draft = lessonPlanDraft();
  const nextValue = String(value || '').trim();
  if (nextValue === LESSON_PLAN_TEMP_GRADE_VALUE) {
    lessonPlanSetDraftValue('general.usesTemporaryGrade', true, false);
    lessonPlanSetDraftValue('general.gradeId', '', false);
    lessonPlanSetDraftValue('general.gradeName', '', false);
    lessonPlanSetDraftValue('general.groupId', '', false);
    lessonPlanSetDraftValue('general.sectionId', '', false);
    lessonPlanSetDraftValue('groupId', '', false);
    lessonPlanSetDraftValue('general.sectionName', '', false);
    lessonPlanSetDraftValue('general.subject', '', false);
    lessonPlanSetDraftValue('general.subarea', '', false);
    lessonPlanSetDraftValue('general.area', '', false);
    lessonPlanResyncSpecificCompetenciesForCurrentContext();
    lessonPlanResyncConceptualSelectionForCurrentContext();
    lessonPlanResyncProceduralSelectionForCurrentContext();
    lessonPlanValidateGeneralField('grade');
    lessonPlanValidateGeneralField('section');
    lessonPlanValidateGeneralField('subject');
    if (rerender) lessonPlanRefreshOpenSectionModal();
    return;
  }
  lessonPlanSetDraftValue('general.usesTemporaryGrade', false, false);
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === nextValue) || null;
  const availableSectionOptions = lessonPlanSectionOptionsForGradeId(nextValue);
  const currentSectionName = String(draft.general.sectionName || '').trim();
  const nextSectionName = availableSectionOptions.some((option) => option.value === currentSectionName)
    ? currentSectionName
    : (availableSectionOptions.length === 1 ? availableSectionOptions[0].value : '');
  const group = lessonPlanResolveGroupForSelection(nextValue, nextSectionName, '', draft.general.groupId || S.activeGroupId);
  lessonPlanApplyGeneralSelection({
    gradeId: nextValue,
    gradeName: lessonPlanFullGradeName(null, grade) || '',
    sectionName: nextSectionName,
    subject: '',
    area: '',
    group,
  });
  lessonPlanValidateGeneralField('grade');
  delete lessonPlanGeneralErrors().area;
  delete lessonPlanGeneralErrors().section;
  delete lessonPlanGeneralErrors().subject;
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Cambia la sección del plan general y vuelve a calcular el contexto del grupo.
function lessonPlanSetSectionSelection(value, rerender = true) {
  const nextValue = String(value || '').trim();
  const draft = lessonPlanDraft();
  const currentArea = curriculumCatalogDisplayText(draft.general.area || '');
  if (!nextValue) {
    const group = lessonPlanResolveGroupForSelection(draft.general.gradeId || '', '', '', draft.general.groupId || S.activeGroupId);
    lessonPlanApplyGeneralSelection({
      gradeId: draft.general.gradeId || '',
      gradeName: draft.general.gradeName || '',
      sectionName: '',
      subject: '',
      area: currentArea,
      group,
    });
    delete lessonPlanGeneralErrors().area;
    delete lessonPlanGeneralErrors().section;
    delete lessonPlanGeneralErrors().subject;
    if (rerender) lessonPlanRefreshOpenSectionModal();
    return;
  }
  const subjectOptions = lessonPlanSubjectOptionsForGradeId(draft.general.gradeId || '', nextValue, currentArea, draft.general.gradeName || '');
  const currentSubject = curriculumCatalogDisplayText(draft.general.subject || draft.general.subarea || '');
  const nextSubject = subjectOptions.find((option) => curriculumCatalogCanonicalText(option.value) === curriculumCatalogCanonicalText(currentSubject))?.value
    || (subjectOptions.length === 1 ? subjectOptions[0].value : '');
  const group = lessonPlanResolveGroupForSelection(draft.general.gradeId || '', nextValue, nextSubject, draft.general.groupId || S.activeGroupId);
  lessonPlanApplyGeneralSelection({
    gradeId: draft.general.gradeId || '',
    gradeName: draft.general.gradeName || '',
    sectionName: nextValue,
    subject: nextSubject,
    area: currentArea,
    group,
  });
  delete lessonPlanGeneralErrors().area;
  delete lessonPlanGeneralErrors().section;
  delete lessonPlanGeneralErrors().subject;
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Cambia el área curricular elegida para el plan de clase.
function lessonPlanSetAreaSelection(value, rerender = true) {
  const draft = lessonPlanDraft();
  const nextArea = curriculumCatalogDisplayText(value || '');
  lessonPlanSetDraftValue('general.area', nextArea, false);
  const subjectOptions = lessonPlanSubjectOptionsForGradeId(
    draft.general.gradeId || '',
    draft.general.sectionName || '',
    nextArea,
    draft.general.gradeName || ''
  );
  const currentSubject = curriculumCatalogDisplayText(draft.general.subject || draft.general.subarea || '');
  const nextSubject = subjectOptions.find((option) => curriculumCatalogCanonicalText(option.value) === curriculumCatalogCanonicalText(currentSubject))?.value
    || (
      subjectOptions.length === 1 ? subjectOptions[0].value : ''
    );
  lessonPlanSetDraftValue('general.subject', curriculumCatalogDisplayText(nextSubject || ''), false);
  lessonPlanSetDraftValue('general.subarea', curriculumCatalogDisplayText(nextSubject || ''), false);
  const group = lessonPlanResolveGroupForSelection(
    draft.general.gradeId || '',
    draft.general.sectionName || '',
    nextSubject,
    draft.general.groupId || S.activeGroupId
  );
  lessonPlanSetDraftValue('general.groupId', group?.id || '', false);
  lessonPlanSetDraftValue('general.sectionId', group?.id || '', false);
  lessonPlanSetDraftValue('groupId', group?.id || '', false);
  lessonPlanResyncSpecificCompetenciesForCurrentContext();
  lessonPlanResyncConceptualSelectionForCurrentContext();
  lessonPlanResyncProceduralSelectionForCurrentContext();
  delete lessonPlanGeneralErrors().area;
  delete lessonPlanGeneralErrors().subject;
  lessonPlanValidateGeneralField('area');
  lessonPlanValidateGeneralField('subject');
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Guarda el texto libre de la asignatura mientras la persona sigue escribiendo.
function lessonPlanSetSubjectInputValue(value, rerender = false) {
  const nextValue = curriculumCatalogDisplayText(value || '');
  lessonPlanSetDraftValue('general.subject', nextValue, false);
  lessonPlanSetDraftValue('general.subarea', nextValue, false);
  lessonPlanResyncSpecificCompetenciesForCurrentContext();
  lessonPlanResyncConceptualSelectionForCurrentContext();
  lessonPlanResyncProceduralSelectionForCurrentContext();
  delete lessonPlanGeneralErrors().subject;
  lessonPlanValidateGeneralField('subject');
  if (rerender) lessonPlanRefreshOpenSectionModal();
  else lessonPlanSyncGeneralFieldUi('subject');
}
// Aplica una asignatura seleccionada al borrador y actualiza su contexto curricular.
function lessonPlanSetSubjectSelection(value, rerender = true) {
  const draft = lessonPlanDraft();
  const nextValue = curriculumCatalogDisplayText(value || '');
  const gradeId = String(draft.general.gradeId || '').trim();
  const sectionName = String(draft.general.sectionName || '').trim();
  const group = lessonPlanResolveGroupForSelection(gradeId, sectionName, nextValue, draft.general.groupId || S.activeGroupId);
  lessonPlanApplyGeneralSelection({
    gradeId,
    gradeName: draft.general.gradeName || '',
    sectionName,
    subject: nextValue,
    area: curriculumCatalogDisplayText(draft.general.area || ''),
    group,
  });
  delete lessonPlanGeneralErrors().area;
  delete lessonPlanGeneralErrors().subject;
  lessonPlanValidateGeneralField('subject');
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Gestiona clase plan crear custom area.
function lessonPlanCreateCustomArea() {
  const draft = lessonPlanDraft();
  const educationLevel = curriculumGradeContext(draft.general.gradeId || '', draft.general.gradeName || '').educationLevel || 'Secundaria';
  const raw = prompt('Escribe el nombre del área personalizada:');
  const created = curriculumRegisterCustomArea(raw || '', educationLevel);
  if (!created) return;
  lessonPlanSetAreaSelection(created, false);
  lessonPlanValidateGeneralField('area');
  lessonPlanRefreshOpenSectionModal();
  toast('área personalizada agregada');
}
// Gestiona clase plan crear custom asignatura.
function lessonPlanCreateCustomSubject() {
  const draft = lessonPlanDraft();
  const area = String(draft.general.area || '').trim();
  if (!area) {
    toast('Selecciona primero un área', true);
    return;
  }
  const raw = prompt('Escribe el nombre de la asignatura personalizada:');
  const created = curriculumRegisterCustomSubject(raw || '', area, {
    gradeId: draft.general.gradeId || '',
    gradeName: draft.general.gradeName || '',
  });
  if (!created) return;
  lessonPlanSetSubjectSelection(created, false);
  lessonPlanValidateGeneralField('subject');
  lessonPlanRefreshOpenSectionModal();
  toast('Asignatura personalizada agregada');
}
// Agrupa los ids de los campos del formulario de secciones.
function sectionFormFieldIds(prefix = 'sec') {
  return prefix === 'es'
    ? { grade: 'es-gid', section: 'es-sec', area: 'es-area', subject: 'es-mat' }
    : { grade: 'sec-g', section: 'sec-s', area: 'sec-area', subject: 'sec-m' };
}
// Refresca el formulario curricular de una sección.
function refreshSectionCurriculumForm(prefix = 'sec', forceResetSubject = false) {
  const ids = sectionFormFieldIds(prefix);
  const gradeId = String(document.getElementById(ids.grade)?.value || '').trim();
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => String(item.id || '') === gradeId) || null;
  const areaSelect = document.getElementById(ids.area);
  const subjectSelect = document.getElementById(ids.subject);
  if (!areaSelect || !subjectSelect) return;
  const areaOptions = lessonPlanAreaOptions(gradeId, grade?.name || '');
  const currentArea = String(areaSelect.value || '').trim();
  const nextArea = areaOptions.includes(currentArea) ? currentArea : '';
  fillSel(ids.area, areaOptions.map((area) => ({ value: area, label: area })), (item) => item.value, (item) => item.label, nextArea, 'Selecciona área');
  const currentSubject = String(subjectSelect.value || '').trim();
  const subjectOptions = curriculumSubjectOptions({ gradeId, gradeName: grade?.name || '', area: nextArea });
  const nextSubject = !forceResetSubject && subjectOptions.some((item) => item.value === currentSubject)
    ? currentSubject
    : (subjectOptions.length === 1 ? subjectOptions[0].value : '');
  fillSel(ids.subject, subjectOptions, (item) => item.value, (item) => item.label, nextSubject, nextArea ? 'Selecciona asignatura' : 'Selecciona un área primero');
  subjectSelect.disabled = !nextArea;
}
// Crea una opción personalizada de área para una sección.
function createSectionCustomArea(prefix = 'sec') {
  const ids = sectionFormFieldIds(prefix);
  const gradeId = String(document.getElementById(ids.grade)?.value || '').trim();
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => String(item.id || '') === gradeId) || null;
  const created = curriculumRegisterCustomArea(prompt('Escribe el nombre del área personalizada:') || '', grade?.educationLevel || 'Secundaria');
  if (!created) return;
  refreshSectionCurriculumForm(prefix, false);
  const areaEl = document.getElementById(ids.area);
  if (areaEl) areaEl.value = created;
  refreshSectionCurriculumForm(prefix, true);
  toast('área personalizada agregada');
}
// Crea una opción personalizada de asignatura para una sección.
function createSectionCustomSubject(prefix = 'sec') {
  const ids = sectionFormFieldIds(prefix);
  const gradeId = String(document.getElementById(ids.grade)?.value || '').trim();
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => String(item.id || '') === gradeId) || null;
  const area = String(document.getElementById(ids.area)?.value || '').trim();
  if (!area) {
    toast('Selecciona primero un área', true);
    return;
  }
  const created = curriculumRegisterCustomSubject(prompt('Escribe el nombre de la asignatura personalizada:') || '', area, {
    gradeId,
    gradeName: grade?.name || '',
    educationLevel: grade?.educationLevel || 'Secundaria',
  });
  if (!created) return;
  refreshSectionCurriculumForm(prefix, false);
  const subjectEl = document.getElementById(ids.subject);
  if (subjectEl) subjectEl.value = created;
  toast('Asignatura personalizada agregada');
}
// Inserta o actualiza el draft actual dentro del listado persistido de planificaciones.
// Sincroniza el borrador de planificación con el registro que se mantiene en memoria para autosave y navegación.
function lessonPlanSyncDraftRecord(statusOverride = '') {
  ensureLessonPlansState();
  const draft = lessonPlanNormalizePlan(S.lessonPlanDraft);
  draft.status = statusOverride || draft.status || 'draft';
  draft.editorStep = lessonPlanSectionOrder().includes(String(S.lessonPlanUi.activeSectionId || '').trim())
    ? String(S.lessonPlanUi.activeSectionId || '').trim()
    : (draft.editorStep || 'general');
  draft.updatedAt = Date.now();
  // Gestiona idx.
  const idx = (S.lessonPlans || []).findIndex((item) => item.id === draft.id);
  if (idx >= 0) S.lessonPlans[idx] = draft;
  else S.lessonPlans.unshift(draft);
  S.lessonPlanDraft = lessonPlanNormalizePlan(draft);
  return S.lessonPlanDraft;
}
// Fuerza el guardado inmediato del draft cancelando antes cualquier autosave pendiente.
// Guarda de inmediato el borrador de planificación cuando el editor necesita forzar un autosave.
function lessonPlanPersistDraftNow(statusOverride = 'draft') {
  lessonPlanCancelAutosave();
  lessonPlanSyncDraftRecord(statusOverride || 'draft');
  persist({ immediate: true });
}
// Limpia el temporizador de autosave para evitar escrituras duplicadas u obsoletas.
// Cancela cualquier autosave pendiente del compositor de planificaciones.
function lessonPlanCancelAutosave() {
  ensureLessonPlansState();
  if (S.lessonPlanUi.autosaveTimer) {
    clearTimeout(S.lessonPlanUi.autosaveTimer);
    S.lessonPlanUi.autosaveTimer = 0;
  }
}
// Devuelve el borrador de planificación activo en el estado global.
function lessonPlanDraft() {
  ensureLessonPlansState();
  return S.lessonPlanDraft;
}
// Busca una clase concreta dentro del borrador activo.
function lessonPlanGetClass(classId) {
  return lessonPlanDraft().classes.find((item) => item.id === classId) || null;
}
// Escribe un valor profundo dentro del draft usando una ruta tipo "general.gradeId".
// Escribe un valor dentro del borrador usando una ruta anidada y decide si debe re-renderizar.
function lessonPlanSetDraftValue(path, value, rerender = false) {
  const draft = lessonPlanDraft();
  const parts = String(path || '').split('.').filter(Boolean);
  if (!parts.length) return;
  let cursor = draft;
  while (parts.length > 1) {
    const key = parts.shift();
    if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[parts[0]] = value;
  draft.updatedAt = Date.now();
  lessonPlanQueueAutosave();
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Cambia un campo del plan y aplica efectos secundarios si ese campo afecta la vista o la validación.
function lessonPlanSetField(path, value) {
  lessonPlanSetDraftValue(path, normalizeSpanishDraftText(value || '', { preserveCase: true }));
}
// Actualiza un campo general del plan y refresca sus validaciones inline relacionadas.
// Actualiza un texto general del plan y sincroniza validaciones y vista previa.
function lessonPlanSetGeneralTextField(field, value, validationFields = []) {
  const normalized = normalizeSpanishDraftText(value || '', { preserveCase: true });
  lessonPlanSetDraftValue(`general.${field}`, normalized, false);
  const checks = Array.isArray(validationFields) ? validationFields : [validationFields];
  checks.filter(Boolean).forEach((item) => {
    lessonPlanValidateGeneralField(item);
    lessonPlanSyncGeneralFieldUi(item);
  });
}
// Cambia el título temático de la planificación y refresca las piezas que dependen de ese nombre.
function lessonPlanSetThemeTitle(value) {
  const normalized = normalizeSpanishDraftText(value || '', { preserveCase: true });
  lessonPlanSetDraftValue('general.themeTitle', normalized, false);
  lessonPlanSetDraftValue('general.title', normalized, false);
  lessonPlanValidateGeneralField('themeTitle');
  lessonPlanValidateGeneralField('sequenceName');
  lessonPlanSyncThemeSequenceUi();
}
// Devuelve un mapa con los errores curriculares detectados en el borrador actual.
function lessonPlanCurriculumErrors() {
  ensureLessonPlansState();
  return S.lessonPlanUi.curriculumErrors;
}
// Devuelve los errores agrupados por bloque curricular para pintar alertas precisas.
function lessonPlanCurriculumBlockErrors() {
  ensureLessonPlansState();
  return S.lessonPlanUi.curriculumBlockErrors;
}
// Resuelve el error puntual de un campo curricular determinado.
function lessonPlanCurriculumError(field) {
  return String(lessonPlanCurriculumErrors()[field] || '').trim();
}
// Resuelve el error específico de un bloque de competencias fundamentales.
function lessonPlanCurriculumSpecificBlockError(fundamental) {
  return String(lessonPlanCurriculumBlockErrors()[String(fundamental || '').trim()] || '').trim();
}
// Normaliza un texto curricular libre en una lista de ítems separada por líneas.
function lessonPlanCurriculumItems(value) {
  return Array.from(new Set(
    String(value || '')
      .split(/\n|;/)
      .map((item) => fixMojibakeText(normalizeSpanishDraftText(item || '', { preserveCase: true })).trim())
      .filter(Boolean)
  ));
}
// Devuelve el texto legible asociado a un campo curricular dentro del borrador.
function lessonPlanCurriculumTextValue(field) {
  return String(lessonPlanDraft()?.curriculum?.[field] || '').trim();
}
// Devuelve las competencias fundamentales activadas en el plan actual.
function lessonPlanSelectedFundamentalCompetencies(draft = lessonPlanDraft()) {
  const selected = lessonPlanCurriculumItems(draft?.curriculum?.fundamentalCompetencies || '');
  const canonical = (value = '') => normTxt(fixMojibakeText(normalizeSpanishDraftText(value || '', { preserveCase: true })));
  const ordered = LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS.filter((item) => selected.some((selectedItem) => canonical(selectedItem) === canonical(item)));
  const extras = selected.filter((item) => !ordered.some((orderedItem) => canonical(orderedItem) === canonical(item)));
  return [...ordered, ...extras];
}
// Convierte la selección de competencias específicas del borrador en un mapa por competencia fundamental.
function lessonPlanSpecificCompetencyMap(draft = lessonPlanDraft()) {
  const base = draft?.curriculum?.specificCompetencyMap;
  return base && typeof base === 'object' ? { ...base } : {};
}
// Devuelve el modo de captura usado por cada competencia fundamental.
function lessonPlanSpecificCompetencyModeMap(draft = lessonPlanDraft()) {
  const base = draft?.curriculum?.specificCompetencyModeMap;
  return base && typeof base === 'object' ? { ...base } : {};
}
// Genera una llave de contexto para identificar el ciclo/grado curricular activo.
function lessonPlanCurriculumCycleKey(draft = lessonPlanDraft()) {
  const general = draft?.general || {};
  const gradeId = String(general.gradeId || '').trim();
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === gradeId) || null;
  const educationLevel = normalizeEducationLevelName(grade?.educationLevel || general.educationLevel || '');
  const gradeLabel = String(general.gradeName || grade?.name || '').trim();
  const numericGrade = parseGradeLevel(gradeLabel);
  if (educationLevel === 'Secundaria') {
    if (numericGrade >= 1 && numericGrade <= 3) return 'Secundaria - Primer ciclo';
    if (numericGrade >= 4 && numericGrade <= 6) return 'Secundaria - Segundo ciclo';
    return 'Secundaria - General';
  }
  if (educationLevel === 'Primaria') {
    if (numericGrade >= 1 && numericGrade <= 3) return 'Primaria - Primer ciclo';
    if (numericGrade >= 4 && numericGrade <= 6) return 'Primaria - Segundo ciclo';
    return 'Primaria - General';
  }
  return 'General';
}
// Resuelve el catálogo válido de competencias específicas para una fundamental en el contexto actual.
// Devuelve las opciones de competencias específicas disponibles para una competencia fundamental dada.
function lessonPlanSpecificCompetencyOptionsForFundamental(fundamental, draft = lessonPlanDraft()) {
  const lookup = curriculumSpecificCompetencyLookup({
    area: draft?.general?.area || '',
    subject: draft?.general?.subject || draft?.general?.subarea || '',
    gradeId: draft?.general?.gradeId || '',
    gradeName: draft?.general?.gradeName || '',
    fundamental,
  });
  return lookup.options;
}
// Copia el mapa específico seleccionado al formato textual que aún consumen otras vistas/exportes.
// Reescribe la selección de competencias específicas a partir de un mapa ya calculado.
function lessonPlanSyncSpecificCompetenciesFromMap(map = lessonPlanSpecificCompetencyMap(), rerender = false) {
  const selectedFundamentals = lessonPlanSelectedFundamentalCompetencies();
  const orderedValues = selectedFundamentals
    .map((fundamental) => curriculumNormalizeSpecificCompetencyText(map[fundamental] || ''))
    .filter(Boolean);
  lessonPlanSetDraftValue('curriculum.specificCompetencyMap', { ...map }, false);
  lessonPlanSetDraftValue('curriculum.specificCompetencies', orderedValues.join('\n'), false);
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Recalcula el mapa de competencias específicas cuando cambia grado, área o asignatura.
// Recalcula las competencias específicas visibles después de cambiar de grado, área o fundamental.
function lessonPlanResyncSpecificCompetenciesForCurrentContext() {
  const draft = lessonPlanDraft();
  const selectedFundamentals = lessonPlanSelectedFundamentalCompetencies(draft);
  const currentMap = lessonPlanSpecificCompetencyMap(draft);
  const nextMap = {};
  selectedFundamentals.forEach((fundamental) => {
    const options = lessonPlanSpecificCompetencyOptionsForFundamental(fundamental, draft)
      .map((item) => curriculumNormalizeSpecificCompetencyText(item))
      .filter(Boolean);
    const currentValue = curriculumNormalizeSpecificCompetencyText(currentMap[fundamental] || '');
    nextMap[fundamental] = options.includes(currentValue) ? currentValue : (options[0] || '');
  });
  lessonPlanSetDraftValue('curriculum.specificCompetencyModeMap', {}, false);
  lessonPlanSyncSpecificCompetenciesFromMap(nextMap, false);
  delete lessonPlanCurriculumErrors().specificCompetencies;
  const blockErrors = lessonPlanCurriculumBlockErrors();
  Object.keys(blockErrors).forEach((key) => delete blockErrors[key]);
}
// Cambia entre modo catálogo/manual para una competencia fundamental concreta.
// Cambia el modo de captura de una competencia fundamental concreta.
function lessonPlanSetSpecificCompetencyModeForFundamental(fundamental, mode, rerender = true) {
  const cleanFundamental = normalizeSpanishDraftText(fundamental || '', { preserveCase: true }).trim();
  if (!cleanFundamental) return;
  const nextMode = String(mode || '').trim().toLowerCase() === 'manual' ? 'manual' : 'catalog';
  const map = lessonPlanSpecificCompetencyModeMap();
  map[cleanFundamental] = nextMode;
  lessonPlanSetDraftValue('curriculum.specificCompetencyModeMap', map, false);
  if (nextMode === 'catalog') {
    const options = lessonPlanSpecificCompetencyOptionsForFundamental(cleanFundamental);
    const currentMap = lessonPlanSpecificCompetencyMap();
    if (!options.includes(String(currentMap[cleanFundamental] || '').trim())) {
      currentMap[cleanFundamental] = options[0] || '';
      lessonPlanSyncSpecificCompetenciesFromMap(currentMap, false);
      lessonPlanValidateCurriculumField('specificCompetencies');
      lessonPlanValidateSpecificCompetencyBlock(cleanFundamental);
    }
  }
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Indica si una competencia específica está siendo capturada en modo manual.
function lessonPlanSpecificCompetencyUsesManualMode(fundamental, draft = lessonPlanDraft()) {
  const cleanFundamental = String(fundamental || '').trim();
  if (!cleanFundamental) return false;
  const modeMap = lessonPlanSpecificCompetencyModeMap(draft);
  const currentValue = String(lessonPlanSpecificCompetencyMap(draft)[cleanFundamental] || '').trim();
  const options = lessonPlanSpecificCompetencyOptionsForFundamental(cleanFundamental, draft);
  if (modeMap[cleanFundamental] === 'manual') return true;
  return !!currentValue && !options.includes(currentValue);
}
// Construye un slug estable para identificar en el DOM cada bloque de competencias específicas.
function lessonPlanSpecificBlockSlug(fundamental) {
  return String(fundamental || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
// Sincroniza el estado expandido/colapsado de los bloques específicos con la UI actual.
function lessonPlanSyncSpecificCompetencyBlocksUi() {
  const blockErrors = lessonPlanCurriculumBlockErrors();
  lessonPlanSelectedFundamentalCompetencies().forEach((fundamental) => {
    const slug = lessonPlanSpecificBlockSlug(fundamental);
    const block = document.getElementById(`lesson-plan-specific-block-${slug}`);
    if (!block) return;
    const message = String(blockErrors[fundamental] || '').trim();
    block.classList.toggle('lesson-plan-field-invalid', !!message);
    block.querySelectorAll('.sel, .inp, .lesson-plan-specific-editor-surface').forEach((field) => {
      field.classList.toggle('is-invalid', !!message);
    });
    let errorNode = block.querySelector('[data-specific-block-error="true"]');
    if (message) {
      if (!errorNode) {
        errorNode = document.createElement('small');
        errorNode.className = 'lesson-plan-field-error';
        errorNode.dataset.specificBlockError = 'true';
        block.appendChild(errorNode);
      }
      errorNode.textContent = message;
    } else if (errorNode) {
      errorNode.remove();
    }
  });
}
// Valida una tarjeta individual de competencia fundamental para ubicar el error en su bloque.
// Valida un bloque de competencia específica antes de guardarlo o mostrarlo como correcto.
function lessonPlanValidateSpecificCompetencyBlock(fundamental) {
  const cleanFundamental = String(fundamental || '').trim();
  if (!cleanFundamental) return true;
  const nextErrors = lessonPlanCurriculumBlockErrors();
  const options = lessonPlanSpecificCompetencyOptionsForFundamental(cleanFundamental);
  const value = String(lessonPlanSpecificCompetencyMap()[cleanFundamental] || '').trim();
  if (!options.length) {
    delete nextErrors[cleanFundamental];
    return true;
  }
  if (!value) nextErrors[cleanFundamental] = 'Debes seleccionar una competencia espec\u00edfica para esta competencia fundamental.';
  else delete nextErrors[cleanFundamental];
  return !String(nextErrors[cleanFundamental] || '').trim();
}
// Recorta texto largo para mostrarlo como una previsualización compacta dentro del editor.
function lessonPlanPreviewText(value, max = 160) {
  const text = normalizeSpanishDraftText(String(value || ''), { preserveCase: true }).trim();
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max - 3).trim() + '...';
}
// Resuelve el tema conceptual actual y su conjunto de subtemas para alimentar los bloques derivados.
function lessonPlanConceptualTopicData(draft = lessonPlanDraft()) {
  const ctx = curriculumGradeContext(draft?.general?.gradeId || '', draft?.general?.gradeName || '');
  const area = curriculumCatalogDisplayText(draft?.general?.area || '');
  const subject = curriculumCatalogDisplayText(draft?.general?.subject || draft?.general?.subarea || '');
  // This block is currently implemented for Lengua Española (Secundaria).
  const canonicalArea = curriculumCatalogCanonicalText(area || '');
  const canonicalSubject = curriculumCatalogCanonicalText(subject || '');
  if (canonicalArea !== curriculumCatalogCanonicalText('Lengua Española')) return [];
  if (canonicalSubject && canonicalSubject !== curriculumCatalogCanonicalText('Lengua Española') && !canonicalSubject.includes('lengua')) return [];
  const matchedAreaKey = Object.keys(LESSON_PLAN_CONCEPTUAL_CATALOG).find((key) => normTxt(key) === normTxt(area || '')) || '';
  const areaCatalog = LESSON_PLAN_CONCEPTUAL_CATALOG[area] || LESSON_PLAN_CONCEPTUAL_CATALOG[matchedAreaKey] || {};
  const gradeTopics = Array.isArray(areaCatalog[ctx.gradeKey]) ? areaCatalog[ctx.gradeKey] : [];
  return gradeTopics.map((entry) => {
    const cleanTopic = curriculumCatalogDisplayText(entry?.topic || '');
    const mappedSubtopics = Array.isArray(entry?.subtopics) ? entry.subtopics : [];
    const selectedSubtopics = mappedSubtopics
      .map((subtopic) => curriculumCatalogDisplayText(subtopic || ''))
      .filter(Boolean)
      .filter((subtopic) => !/^nota\s*:/i.test(subtopic));
    const explicitNote = curriculumCatalogDisplayText(entry?.note || '');
    const embeddedNote = mappedSubtopics
      .map((subtopic) => curriculumCatalogDisplayText(subtopic || ''))
      .find((subtopic) => /^nota\s*:/i.test(subtopic)) || '';
    return {
      topic: cleanTopic,
      subtopics: selectedSubtopics,
      note: explicitNote || embeddedNote.replace(/^nota\s*:\s*/i, '').trim(),
    };
  }).filter((entry) => entry.topic);
}
// Sintetiza el tema conceptual y sus subtemas en un texto corto de apoyo visual.
function lessonPlanConceptualSummaryText(topic = '', subtopics = []) {
  const cleanTopic = curriculumCatalogDisplayText(topic || '');
  const cleanSubtopics = Array.from(new Set((Array.isArray(subtopics) ? subtopics : [])
    .map((item) => curriculumCatalogDisplayText(item || ''))
    .filter(Boolean)));
  if (!cleanTopic || !cleanSubtopics.length) return '';
  return cleanTopic + ': ' + cleanSubtopics.join('; ');
}
// Convierte un texto corto de resumen conceptual en una selección estructurada de tema y subtemas.
function lessonPlanParseConceptualSummary(value = '') {
  const raw = curriculumCatalogDisplayText(value || '');
  if (!raw) return { topic: '', subtopics: [] };
  const parts = raw.split(':');
  const topic = curriculumCatalogDisplayText(parts[0] || '');
  const detail = curriculumCatalogDisplayText(parts.slice(1).join(':') || '');
  const subtopics = detail
    ? detail.split(';').map((item) => curriculumCatalogDisplayText(item || '')).filter(Boolean)
    : [];
  return { topic, subtopics };
}
// Devuelve la selección conceptual activa para usarla en vistas, validaciones y bloques derivados.
function lessonPlanConceptualSelection(draft = lessonPlanDraft()) {
  const current = draft?.curriculum?.conceptualMeta && typeof draft.curriculum.conceptualMeta === 'object' ? draft.curriculum.conceptualMeta : {};
  const topic = curriculumCatalogDisplayText(current.topic || '');
  const subtopics = Array.from(new Set((Array.isArray(current.subtopics) ? current.subtopics : [])
    .map((item) => curriculumCatalogDisplayText(item || ''))
    .filter(Boolean)));
  const notesByTopic = current.notesByTopic && typeof current.notesByTopic === 'object'
    ? Object.fromEntries(
      Object.entries(current.notesByTopic)
        .map(([topicName, note]) => [
          curriculumCatalogDisplayText(topicName || ''),
          curriculumCatalogDisplayText(note || ''),
        ])
        .filter(([topicName, note]) => topicName && note)
    )
    : {};
  const topics = lessonPlanConceptualTopicData(draft);
  const selectedTopic = topics.find((entry) => normTxt(entry.topic || '') === normTxt(topic || '')) || null;
  return { topic, subtopics, topics, notesByTopic, selectedTopicNote: String(selectedTopic?.note || '').trim() };
}
// Persiste la selección conceptual actual y dispara la cadena de derivados curriculares.
// Escribe la selección conceptual en el borrador y actualiza la interfaz si hace falta.
function lessonPlanConceptualWriteSelection(topic = '', subtopics = [], rerender = true) {
  const cleanTopic = curriculumCatalogDisplayText(topic || '');
  const cleanSubtopics = Array.from(new Set((Array.isArray(subtopics) ? subtopics : [])
    .map((item) => curriculumCatalogDisplayText(item || ''))
    .filter(Boolean)));
  const currentMeta = lessonPlanConceptualSelection();
  const nextNotesByTopic = { ...(currentMeta.notesByTopic || {}) };
  if (cleanTopic) {
    // Gestiona seleccionado topic.
    const selectedTopic = (currentMeta.topics || []).find((entry) => normTxt(entry.topic || '') === normTxt(cleanTopic || '')) || null;
    const selectedNote = String(selectedTopic?.note || '').trim();
    if (selectedNote) nextNotesByTopic[cleanTopic] = selectedNote;
  }
  lessonPlanSetDraftValue('curriculum.conceptualMeta', { topic: cleanTopic, subtopics: cleanSubtopics, notesByTopic: nextNotesByTopic }, false);
  lessonPlanSetDraftValue('curriculum.conceptualContents', lessonPlanConceptualSummaryText(cleanTopic, cleanSubtopics), false);
  try {
    lessonPlanSyncProceduralSelectionFromConceptual(false);
    lessonPlanValidateCurriculumField('conceptualContents');
  } catch (error) {
    console.error('[lesson-plan] Error sincronizando contenidos derivados desde conceptuales', error);
  }
  if (rerender) lessonPlanRefreshOpenSectionModal();
  else lessonPlanSyncCurriculumFieldUi('conceptualContents');
}
// Cambia solo el tema conceptual principal sin perder la selección de subtemas.
function lessonPlanSetConceptualTopic(topic, rerender = true) {
  const cleanTopic = curriculumCatalogDisplayText(topic || '');
  if (!cleanTopic) {
    lessonPlanConceptualWriteSelection('', [], rerender);
    return;
  }
  lessonPlanConceptualWriteSelection(cleanTopic, [], rerender);
}
// Decodifica valores serializados para que puedan compararse o pintarse correctamente en la UI.
function lessonPlanDecodeDataValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch (_) {
    return raw;
  }
}
// Alterna un subtema conceptual usando valores ya codificados desde la plantilla HTML.
function lessonPlanToggleConceptualSubtopicFromValues(encodedSubtopic = '', encodedTopic = '', rerender = true) {
  const decodedSubtopic = curriculumCatalogDisplayText(lessonPlanDecodeDataValue(encodedSubtopic || ''));
  if (!decodedSubtopic) return;
  const decodedTopic = curriculumCatalogDisplayText(lessonPlanDecodeDataValue(encodedTopic || ''));
  lessonPlanToggleConceptualSubtopic(decodedSubtopic, rerender, decodedTopic);
}
// Alterna un subtema conceptual concreto dentro de la selección activa.
function lessonPlanToggleConceptualSubtopic(subtopic, rerender = true, forcedTopic = '') {
  const cleanSubtopic = curriculumCatalogDisplayText(subtopic || '');
  if (!cleanSubtopic) return;
  const current = lessonPlanConceptualSelection();
  const cleanForcedTopic = curriculumCatalogDisplayText(forcedTopic || '');
  const domTopic = curriculumCatalogDisplayText(
    document.getElementById('lesson-plan-conceptual-topic')?.value || '',
  );
  const activeTopic = current.topic || cleanForcedTopic || domTopic;
  if (!activeTopic) return;
  let currentSubtopics = Array.isArray(current.subtopics) ? current.subtopics : [];
  if (cleanForcedTopic && normTxt(activeTopic || '') !== normTxt(current.topic || '')) {
    currentSubtopics = [];
  }
  const nextSubtopics = currentSubtopics.some((item) => normTxt(item || '') === normTxt(cleanSubtopic))
    ? currentSubtopics.filter((item) => normTxt(item || '') !== normTxt(cleanSubtopic))
    : [...currentSubtopics, cleanSubtopic];
  lessonPlanConceptualWriteSelection(activeTopic, nextSubtopics, rerender);
}
// Resuelve el clic sobre un subtema conceptual y decide cómo actualizar la selección.
function lessonPlanHandleConceptualSubtopicClick(trigger, rerender = true) {
  const node = trigger && typeof trigger === 'object' ? trigger : null;
  if (!node) return;
  const attrSubtopic = String(node.getAttribute?.('data-subtopic') || '').trim();
  const dataSubtopic = String(node.dataset?.subtopic || '').trim();
  const attrTopic = String(node.getAttribute?.('data-topic') || '').trim();
  const dataTopic = String(node.dataset?.topic || '').trim();
  const fallbackSubtopic = normalizeSpanishDraftText(
    String(node.querySelector?.('span:last-child')?.textContent || node.textContent || ''),
    { preserveCase: true }
  ).trim();
  const decodedSubtopic = normalizeSpanishDraftText(
    lessonPlanDecodeDataValue(attrSubtopic || dataSubtopic || fallbackSubtopic),
    { preserveCase: true }
  ).trim();
  if (!decodedSubtopic) return;
  const decodedTopic = normalizeSpanishDraftText(
    lessonPlanDecodeDataValue(attrTopic || dataTopic || ''),
    { preserveCase: true }
  ).trim();
  lessonPlanToggleConceptualSubtopic(decodedSubtopic, rerender, decodedTopic);
}
// Conecta la delegación de eventos para manejar clics sobre subtemas sin poner listeners en cada chip.
function lessonPlanBindConceptualSubtopicDelegation() {
  // Delegación desactivada para evitar doble disparo.
  // El subtema usa handler directo en el botón.
  return;
}
lessonPlanBindConceptualSubtopicDelegation();
// Selecciona todos los subtemas conceptuales disponibles para el tema actual.
function lessonPlanSelectAllConceptualSubtopics(rerender = true) {
  const current = lessonPlanConceptualSelection();
  if (!current.topic) return;
  // Gestiona actual topic.
  const currentTopic = (current.topics || []).find((entry) => String(entry.topic || '').trim() === current.topic) || null;
  lessonPlanConceptualWriteSelection(current.topic, Array.isArray(currentTopic?.subtopics) ? currentTopic.subtopics : [], rerender);
}
// Limpia por completo la selección conceptual del borrador.
function lessonPlanClearConceptualSelection(rerender = true) {
  lessonPlanConceptualWriteSelection('', [], rerender);
}
// Permite pegar o escribir un resumen conceptual y rehidratar la selección estructurada.
function lessonPlanSetConceptualSummaryText(value, rerender = true) {
  const parsed = lessonPlanParseConceptualSummary(value || '');
  lessonPlanSetDraftValue('curriculum.conceptualContents', normalizeSpanishDraftText(value || '', { preserveCase: true }).trim(), false);
  const currentMeta = lessonPlanConceptualSelection();
  lessonPlanSetDraftValue('curriculum.conceptualMeta', { topic: parsed.topic, subtopics: parsed.subtopics, notesByTopic: currentMeta.notesByTopic || {} }, false);
  try {
    lessonPlanSyncProceduralSelectionFromConceptual(false);
    lessonPlanValidateCurriculumField('conceptualContents');
  } catch (error) {
    console.error('[lesson-plan] Error sincronizando resumen conceptual', error);
  }
  if (rerender) lessonPlanRefreshOpenSectionModal();
  else lessonPlanSyncCurriculumFieldUi('conceptualContents');
}
// Rehidrata la selección conceptual desde el draft cuando cambia el contexto curricular base.
// Reconcilia la selección conceptual con el contexto del grado y del área cuando cambia el formulario.
function lessonPlanResyncConceptualSelectionForCurrentContext() {
  const draft = lessonPlanDraft();
  const selection = lessonPlanConceptualSelection(draft);
  const topics = selection.topics || [];
  const matchedTopic = topics.find((entry) => normTxt(entry.topic || '') === normTxt(selection.topic || '')) || null;
  if (!matchedTopic) {
    lessonPlanSetDraftValue('curriculum.conceptualMeta', { topic: '', subtopics: [], notesByTopic: {} }, false);
    lessonPlanSetDraftValue('curriculum.conceptualContents', '', false);
    lessonPlanSyncProceduralSelectionFromConceptual(false);
    delete lessonPlanCurriculumErrors().conceptualContents;
    return;
  }
  const allowedSubtopics = new Set((matchedTopic.subtopics || []).map((item) => normTxt(item || '')));
  // Gestiona next subtopics.
  const nextSubtopics = (selection.subtopics || []).filter((item) => allowedSubtopics.has(normTxt(item || '')));
  const nextNotesByTopic = {};
  const selectedNote = String(matchedTopic.note || '').trim();
  if (selectedNote) nextNotesByTopic[matchedTopic.topic] = selectedNote;
  lessonPlanSetDraftValue('curriculum.conceptualMeta', { topic: matchedTopic.topic, subtopics: nextSubtopics, notesByTopic: nextNotesByTopic }, false);
  lessonPlanSetDraftValue('curriculum.conceptualContents', lessonPlanConceptualSummaryText(matchedTopic.topic, nextSubtopics), false);
  lessonPlanSyncProceduralSelectionFromConceptual(false);
  delete lessonPlanCurriculumErrors().conceptualContents;
}
// Resuelve el tema procedimental y sus ítems para los bloques de procedimientos derivados.
function lessonPlanProceduralTopicData(draft = lessonPlanDraft()) {
  const ctx = curriculumGradeContext(draft?.general?.gradeId || '', draft?.general?.gradeName || '');
  const area = curriculumCatalogDisplayText(draft?.general?.area || '');
  const subject = curriculumCatalogDisplayText(draft?.general?.subject || draft?.general?.subarea || '');
  const canonicalArea = curriculumCatalogCanonicalText(area || '');
  const canonicalSubject = curriculumCatalogCanonicalText(subject || '');
  if (canonicalArea !== curriculumCatalogCanonicalText('Lengua Española')) return [];
  if (canonicalSubject && canonicalSubject !== curriculumCatalogCanonicalText('Lengua Española') && !canonicalSubject.includes('lengua')) return [];
  const matchedAreaKey = Object.keys(LESSON_PLAN_PROCEDURAL_CATALOG).find((key) => normTxt(key) === normTxt(area || '')) || '';
  const areaCatalog = LESSON_PLAN_PROCEDURAL_CATALOG[area] || LESSON_PLAN_PROCEDURAL_CATALOG[matchedAreaKey] || {};
  const gradeTopics = Array.isArray(areaCatalog[ctx.gradeKey]) ? areaCatalog[ctx.gradeKey] : [];
  return gradeTopics.map((entry) => {
    const topic = curriculumCatalogDisplayText(entry?.topic || '');
    const proceduralItems = Array.isArray(entry?.proceduralItems) ? entry.proceduralItems : [];
    return {
      topic,
      source: String(entry?.source || 'pdf').trim() || 'pdf',
      manualReviewRequired: !!entry?.manualReviewRequired,
      proceduralItems: proceduralItems.map((item) => ({
        id: String(item?.id || '').trim(),
        title: curriculumCatalogDisplayText(item?.title || ''),
        text: curriculumCatalogDisplayText(item?.text || ''),
      })).filter((item) => item.id && item.title && item.text),
    };
  }).filter((entry) => entry.topic);
}
// Crea una llave estable para identificar un ítem procedimental dentro del DOM y el borrador.
function lessonPlanProceduralItemKey(topic = '', itemId = '') {
  const cleanTopic = normalizeSpanishDraftText(topic || '', { preserveCase: true }).trim();
  const cleanId = String(itemId || '').trim();
  if (!cleanTopic || !cleanId) return '';
  return `${lessonPlanSpecificBlockSlug(cleanTopic)}::${cleanId}`;
}
// Genera los contenidos procedimentales sugeridos para el tema/subtemas conceptuales activos.
// Devuelve los procedimientos asociados a la selección conceptual actual.
function lessonPlanProceduralItemsForSelection(draft = lessonPlanDraft()) {
  const conceptual = lessonPlanConceptualSelection(draft);
  if (!conceptual.topic || !Array.isArray(conceptual.subtopics) || !conceptual.subtopics.length) {
    return { topic: '', subtopics: [], manualReviewRequired: false, source: 'pdf', items: [] };
  }
  const topics = lessonPlanProceduralTopicData(draft);
  const selectedTopic = topics.find((entry) => normTxt(entry.topic || '') === normTxt(conceptual.topic || '')) || null;
  if (!selectedTopic) {
    return { topic: conceptual.topic, subtopics: conceptual.subtopics || [], manualReviewRequired: true, source: 'pdf', items: [] };
  }
  const manualMap = draft?.curriculum?.proceduralItemMap && typeof draft.curriculum.proceduralItemMap === 'object'
    ? draft.curriculum.proceduralItemMap
    : {};
  const selectedSubtopics = Array.from(new Set((conceptual.subtopics || [])
    .map((item) => curriculumCatalogDisplayText(item || ''))
    .filter(Boolean)));
  const items = selectedTopic.proceduralItems.map((item) => {
    const key = lessonPlanProceduralItemKey(selectedTopic.topic, item.id);
    const overrideText = curriculumCatalogDisplayText(manualMap[key] || '');
    return {
      ...item,
      key,
      text: overrideText || item.text,
      subtopicsRelacionados: selectedSubtopics,
    };
  });
  return {
    topic: selectedTopic.topic,
    subtopics: selectedSubtopics,
    manualReviewRequired: !!selectedTopic.manualReviewRequired,
    source: selectedTopic.source || 'pdf',
    items,
  };
}
// Resume los procedimientos seleccionados en un texto compacto para vistas previas o almacenamiento.
function lessonPlanProceduralSummaryText(items = []) {
  const cleanItems = Array.isArray(items) ? items : [];
  return cleanItems
    .map((item) => `${String(item?.title || '').trim()}: ${String(item?.text || '').trim()}`.trim())
    .filter((line) => line && !/:$/.test(line))
    .join('\n\n');
}
// Genera una llave estable para un derivado curricular, como indicador o contenido actitudinal.
function lessonPlanCurricularDerivedItemKey(topic = '', type = '', seed = '') {
  const cleanTopic = normalizeSpanishDraftText(topic || '', { preserveCase: true }).trim();
  const cleanType = String(type || '').trim().toLowerCase();
  const cleanSeed = normalizeSpanishDraftText(seed || '', { preserveCase: true }).trim();
  if (!cleanTopic || !cleanType || !cleanSeed) return '';
  return `${lessonPlanSpecificBlockSlug(cleanTopic)}::${cleanType}::${lessonPlanSpecificBlockSlug(cleanSeed).slice(0, 72)}`;
}
// Limpia texto derivado del currículo para dejarlo apto para chips, etiquetas o listas.
function lessonPlanCurricularCleanupDerivedText(value = '') {
  let text = normalizeSpanishDraftText(value || '', { preserveCase: true }).trim();
  if (!text) return '';
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\b\d{2,3}\s+Contenidos\s+Conceptos\s+Procedimientos[\s\S]*$/i, '')
    .replace(/Área\s+de\s+Lengua\s+Española[\s\S]*$/i, '')
    .replace(/\bNivel\s+Secundario[\s\S]*$/i, '')
    .replace(/\bCompetencias\s+Fundamentales[\s\S]*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return fixMojibakeText(text).trim();
}
// Extrae ítems separados por viñetas o saltos de línea para reconstruir listas derivadas.
function lessonPlanExtractBulletItems(value = '') {
  const text = lessonPlanCurricularCleanupDerivedText(value);
  if (!text || !text.includes('•')) return [];
  return Array.from(new Set(
    text
      .split('•')
      .slice(1)
      .map((item) => lessonPlanCurricularCleanupDerivedText(item))
      .map((item) => item.replace(/^[\-–—:;,.]+/, '').replace(/[\-–—:;,.]+$/, '').trim())
      .filter((item) => item.length >= 12)
  ));
}
// Saca indicadores sugeridos desde un bloque de texto libre del currículo.
function lessonPlanExtractDerivedIndicators(value = '') {
  const text = lessonPlanCurricularCleanupDerivedText(value);
  if (!text) return [];
  const marker = text.search(/Indicadores?\s+de\s+Logro/i);
  if (marker < 0) return [];
  return lessonPlanExtractBulletItems(text.slice(marker));
}
// Saca actitudes o valores sugeridos desde un bloque de texto libre del currículo.
function lessonPlanExtractDerivedAttitudes(value = '') {
  const text = lessonPlanCurricularCleanupDerivedText(value);
  if (!text) return [];
  const marker = text.search(/Indicadores?\s+de\s+Logro/i);
  const segment = marker >= 0 ? text.slice(0, marker) : text;
  return lessonPlanExtractBulletItems(segment).filter((item) => !/indicador(?:es)?\s+de\s+logro/i.test(item));
}
// Tokeniza texto libre para ayudar a encontrar sugerencias y coincidencias semánticas.
function lessonPlanSuggestionTokens(text = '') {
  const stopwords = new Set([
    'de','la','el','los','las','y','o','u','en','un','una','unos','unas','con','sin','por','para','del','al','que','se','su','sus','a','como','lo'
  ]);
  return Array.from(new Set(
    normTxt(text || '')
      .split(/[^a-z0-9ñáéíóúü]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4 && !stopwords.has(token))
  ));
}
// Ordena sugerencias según su cercanía al texto de referencia.
function lessonPlanRankSuggestionItems(items = [], referenceText = '') {
  const refs = new Set(lessonPlanSuggestionTokens(referenceText));
  // Gestiona calificación item.
  const scoreItem = (item) => {
    const text = String(item?.text || '');
    if (!text) return 0;
    const tokens = lessonPlanSuggestionTokens(text);
    let score = 0;
    tokens.forEach((token) => { if (refs.has(token)) score += 1; });
    const cleanRef = normTxt(referenceText || '');
    if (cleanRef && normTxt(text).includes(cleanRef)) score += 3;
    return score;
  };
  return [...items]
    .map((item, idx) => ({ item, idx, score: scoreItem(item) }))
    .sort((a, b) => (b.score - a.score) || (a.idx - b.idx))
    .map((entry) => entry.item);
}
// Agrupa temas procedimentales por grado para reutilizar contenido derivado en el plan.
function lessonPlanDerivedGradePools(proceduralTopics = []) {
  const topics = Array.isArray(proceduralTopics) ? proceduralTopics : [];
  const attitudinalByText = new Map();
  const indicatorsByText = new Map();
  topics.forEach((topicEntry) => {
    const topicTitle = normalizeSpanishDraftText(topicEntry?.topic || '', { preserveCase: true }).trim();
    (topicEntry?.proceduralItems || []).forEach((item) => {
      const sourceText = normalizeSpanishDraftText(item?.text || '', { preserveCase: true }).trim();
      if (!sourceText) return;
      lessonPlanExtractDerivedAttitudes(sourceText).forEach((text) => {
        const clean = normalizeSpanishDraftText(text || '', { preserveCase: true }).trim();
        const key = normTxt(clean);
        if (!clean || attitudinalByText.has(key)) return;
        attitudinalByText.set(key, { text: clean, sourceTopic: topicTitle });
      });
      lessonPlanExtractDerivedIndicators(sourceText).forEach((text) => {
        const clean = normalizeSpanishDraftText(text || '', { preserveCase: true }).trim();
        const key = normTxt(clean);
        if (!clean || indicatorsByText.has(key)) return;
        indicatorsByText.set(key, { text: clean, sourceTopic: topicTitle });
      });
    });
  });
  return {
    attitudinalItems: Array.from(attitudinalByText.values()),
    indicatorItems: Array.from(indicatorsByText.values()),
  };
}
// Resume los ítems derivados en un texto único listo para mostrar o guardar.
function lessonPlanDerivedSummaryText(items = []) {
  const cleanItems = Array.isArray(items) ? items : [];
  return cleanItems
    .map((item) => `• ${String(item?.text || '').trim()}`.trim())
    .filter((line) => line && line !== '•')
    .join('\n');
}
// Construye actitudes e indicadores derivados usando el mismo contexto conceptual/procedimental.
// Resuelve los indicadores actitudinales que corresponden a la selección conceptual actual.
function lessonPlanAttitudinalIndicatorItemsForSelection(draft = lessonPlanDraft()) {
  const conceptual = lessonPlanConceptualSelection(draft);
  if (!conceptual.topic || !Array.isArray(conceptual.subtopics) || !conceptual.subtopics.length) {
    return {
      topic: '',
      subtopics: [],
      source: 'pdf',
      manualReviewRequired: false,
      attitudinalItems: [],
      indicatorItems: [],
      needsConceptualSelection: true,
    };
  }
  const topics = lessonPlanProceduralTopicData(draft);
  const selectedTopic = topics.find((entry) => normTxt(entry.topic || '') === normTxt(conceptual.topic || '')) || null;
  if (!selectedTopic) {
    return {
      topic: conceptual.topic,
      subtopics: conceptual.subtopics || [],
      source: 'pdf',
      manualReviewRequired: true,
      attitudinalItems: [],
      indicatorItems: [],
      needsConceptualSelection: false,
    };
  }
  const selectedSubtopics = Array.from(new Set((conceptual.subtopics || [])
    .map((item) => normalizeSpanishDraftText(item || '', { preserveCase: true }).trim())
    .filter(Boolean)));
  const suggestionReferenceText = [selectedTopic.topic || '', ...selectedSubtopics].join(' ');
  const sourceText = selectedTopic.proceduralItems
    .map((item) => normalizeSpanishDraftText(item?.text || '', { preserveCase: true }).trim())
    .filter(Boolean)
    .join(' ');
  const gradePools = lessonPlanDerivedGradePools(topics);
  const attitudinalMap = draft?.curriculum?.attitudinalItemMap && typeof draft.curriculum.attitudinalItemMap === 'object'
    ? draft.curriculum.attitudinalItemMap
    : {};
  const indicatorMap = draft?.curriculum?.indicatorItemMap && typeof draft.curriculum.indicatorItemMap === 'object'
    ? draft.curriculum.indicatorItemMap
    : {};
  const topicAttitudinalSeed = lessonPlanExtractDerivedAttitudes(sourceText).map((text) => ({ text, sourceTopic: selectedTopic.topic }));
  const attitudinalSeed = topicAttitudinalSeed.length
    ? topicAttitudinalSeed
    : lessonPlanRankSuggestionItems(gradePools.attitudinalItems, suggestionReferenceText).slice(0, 12);
  const attitudinalItems = attitudinalSeed.map((seed, index) => {
    const seedText = normalizeSpanishDraftText(seed?.text || '', { preserveCase: true }).trim();
    const sourceTopic = normalizeSpanishDraftText(seed?.sourceTopic || '', { preserveCase: true }).trim();
    const key = lessonPlanCurricularDerivedItemKey(selectedTopic.topic, 'attitudinal', `${sourceTopic}|${seedText}`);
    const rawOverride = normalizeSpanishDraftText(attitudinalMap[key] || '', { preserveCase: true }).trim();
    if (rawOverride === '__disabled__') return null;
    const overrideText = rawOverride && rawOverride !== '__disabled__' ? rawOverride : '';
    return {
      id: `actitud_${index + 1}`,
      key,
      title: sourceTopic && normTxt(sourceTopic) !== normTxt(selectedTopic.topic || '') ? `Actitud y valor (${sourceTopic})` : `Actitud y valor ${index + 1}`,
      text: overrideText || seedText,
      subtopicsRelacionados: selectedSubtopics,
    };
  }).filter(Boolean);
  const topicIndicatorSeed = lessonPlanExtractDerivedIndicators(sourceText).map((text) => ({ text, sourceTopic: selectedTopic.topic }));
  const gradeSuggestedIndicators = lessonPlanRankSuggestionItems(gradePools.indicatorItems, suggestionReferenceText).slice(0, 16);
  const competencyFallback = Object.entries(lessonPlanSpecificCompetenciesForCurrentSelection(draft) || {})
    .map(([fundamental, text]) => {
      const cleanText = normalizeSpanishDraftText(text || '', { preserveCase: true }).trim();
      const cleanFundamental = normalizeSpanishDraftText(fundamental || '', { preserveCase: true }).trim();
      if (!cleanText) return null;
      return { text: cleanText, sourceTopic: cleanFundamental ? `Competencia: ${cleanFundamental}` : 'Competencia específica del grado' };
    })
    .filter(Boolean);
  const indicatorSeed = topicIndicatorSeed.length
    ? topicIndicatorSeed
    : (gradeSuggestedIndicators.length ? gradeSuggestedIndicators : competencyFallback);
  const indicatorItems = indicatorSeed.map((seed, index) => {
    const seedText = normalizeSpanishDraftText(seed?.text || '', { preserveCase: true }).trim();
    const sourceTopic = normalizeSpanishDraftText(seed?.sourceTopic || '', { preserveCase: true }).trim();
    const key = lessonPlanCurricularDerivedItemKey(selectedTopic.topic, 'indicator', `${sourceTopic}|${seedText}`);
    const rawOverride = normalizeSpanishDraftText(indicatorMap[key] || '', { preserveCase: true }).trim();
    if (rawOverride === '__disabled__') return null;
    const overrideText = rawOverride && rawOverride !== '__disabled__' ? rawOverride : '';
    return {
      id: `indicador_${index + 1}`,
      key,
      title: sourceTopic && normTxt(sourceTopic) !== normTxt(selectedTopic.topic || '') ? `Indicador sugerido (${sourceTopic})` : `Indicador de logro ${index + 1}`,
      text: overrideText || seedText,
      subtopicsRelacionados: selectedSubtopics,
    };
  }).filter(Boolean);
  const indicatorMode = topicIndicatorSeed.length ? 'linked' : (indicatorItems.length ? 'grade_suggested' : 'none');
  return {
    topic: selectedTopic.topic,
    subtopics: selectedSubtopics,
    source: selectedTopic.source || 'pdf',
    manualReviewRequired: !!selectedTopic.manualReviewRequired,
    attitudinalMode: topicAttitudinalSeed.length ? 'linked' : (attitudinalItems.length ? 'grade_suggested' : 'none'),
    indicatorMode,
    attitudinalItems,
    indicatorItems,
    needsConceptualSelection: false,
  };
}
// Sincroniza al draft los bloques actitudinales e indicadores cuando cambia el insumo conceptual.
// Sincroniza los indicadores actitudinales a partir de la selección conceptual.
function lessonPlanSyncAttitudinalIndicatorSelectionFromConceptual(rerender = true) {
  const draft = lessonPlanDraft();
  const selection = lessonPlanAttitudinalIndicatorItemsForSelection(draft);
  const nextAttitudinalMap = draft?.curriculum?.attitudinalItemMap && typeof draft.curriculum.attitudinalItemMap === 'object'
    ? { ...draft.curriculum.attitudinalItemMap }
    : {};
  const nextIndicatorMap = draft?.curriculum?.indicatorItemMap && typeof draft.curriculum.indicatorItemMap === 'object'
    ? { ...draft.curriculum.indicatorItemMap }
    : {};
  if (!selection.topic) {
    S.lessonPlanUi.expandedAttitudinalItems = [];
    S.lessonPlanUi.expandedIndicatorItems = [];
    lessonPlanSetDraftValue('curriculum.attitudinalMeta', { topic: '', subtopics: [], itemIds: [], manualReviewRequired: false }, false);
    lessonPlanSetDraftValue('curriculum.indicatorMeta', { topic: '', subtopics: [], itemIds: [], manualReviewRequired: false }, false);
    lessonPlanSetDraftValue('curriculum.attitudinalItemMap', nextAttitudinalMap, false);
    lessonPlanSetDraftValue('curriculum.indicatorItemMap', nextIndicatorMap, false);
    lessonPlanSetDraftValue('curriculum.attitudinalContents', '', false);
    lessonPlanSetDraftValue('curriculum.indicators', '', false);
    if (rerender) lessonPlanRefreshOpenSectionModal();
    else {
      lessonPlanSyncCurriculumFieldUi('attitudinalContents');
      lessonPlanSyncCurriculumFieldUi('indicators');
    }
    return;
  }
  selection.attitudinalItems.forEach((item) => {
    if (item.key && item.text) nextAttitudinalMap[item.key] = item.text;
  });
  selection.indicatorItems.forEach((item) => {
    if (item.key && item.text) nextIndicatorMap[item.key] = item.text;
  });
  S.lessonPlanUi.expandedAttitudinalItems = [];
  S.lessonPlanUi.expandedIndicatorItems = [];
  lessonPlanSetDraftValue('curriculum.attitudinalMeta', {
    topic: selection.topic,
    subtopics: selection.subtopics,
    itemIds: selection.attitudinalItems.map((item) => item.id),
    manualReviewRequired: selection.manualReviewRequired,
  }, false);
  lessonPlanSetDraftValue('curriculum.indicatorMeta', {
    topic: selection.topic,
    subtopics: selection.subtopics,
    itemIds: selection.indicatorItems.map((item) => item.id),
    manualReviewRequired: selection.manualReviewRequired,
  }, false);
  lessonPlanSetDraftValue('curriculum.attitudinalItemMap', nextAttitudinalMap, false);
  lessonPlanSetDraftValue('curriculum.indicatorItemMap', nextIndicatorMap, false);
  lessonPlanSetDraftValue('curriculum.attitudinalContents', lessonPlanDerivedSummaryText(selection.attitudinalItems), false);
  lessonPlanSetDraftValue('curriculum.indicators', lessonPlanDerivedSummaryText(selection.indicatorItems), false);
  if (rerender) lessonPlanRefreshOpenSectionModal();
  else {
    lessonPlanSyncCurriculumFieldUi('attitudinalContents');
    lessonPlanSyncCurriculumFieldUi('indicators');
  }
}
// Regenera el bloque procedimental y encadena la resincronización de actitudes/indicadores.
// Sincroniza los contenidos procedimentales a partir del tema conceptual elegido.
function lessonPlanSyncProceduralSelectionFromConceptual(rerender = true) {
  const draft = lessonPlanDraft();
  const selection = lessonPlanProceduralItemsForSelection(draft);
  const nextMap = draft?.curriculum?.proceduralItemMap && typeof draft.curriculum.proceduralItemMap === 'object'
    ? { ...draft.curriculum.proceduralItemMap }
    : {};
  if (!selection.topic || !selection.items.length) {
    S.lessonPlanUi.expandedProceduralItems = [];
    lessonPlanSetDraftValue('curriculum.proceduralMeta', {
      topic: '',
      subtopics: [],
      itemIds: [],
      manualReviewRequired: false,
    }, false);
    lessonPlanSetDraftValue('curriculum.proceduralContents', '', false);
    lessonPlanSetDraftValue('curriculum.proceduralItemMap', nextMap, false);
    lessonPlanSyncAttitudinalIndicatorSelectionFromConceptual(false);
    if (rerender) lessonPlanRefreshOpenSectionModal();
    return;
  }
  selection.items.forEach((item) => {
    if (item.key && item.text) nextMap[item.key] = item.text;
  });
  // Regla UX: las tarjetas procedimentales siempre inician colapsadas.
  S.lessonPlanUi.expandedProceduralItems = [];
  lessonPlanSetDraftValue('curriculum.proceduralMeta', {
    topic: selection.topic,
    subtopics: selection.subtopics,
    itemIds: selection.items.map((item) => item.id),
    manualReviewRequired: selection.manualReviewRequired,
  }, false);
  lessonPlanSetDraftValue('curriculum.proceduralItemMap', nextMap, false);
  lessonPlanSetDraftValue('curriculum.proceduralContents', lessonPlanProceduralSummaryText(selection.items), false);
  lessonPlanSyncAttitudinalIndicatorSelectionFromConceptual(false);
  if (rerender) lessonPlanRefreshOpenSectionModal();
  else {
    lessonPlanSyncCurriculumFieldUi('proceduralContents');
    lessonPlanSyncCurriculumFieldUi('attitudinalContents');
    lessonPlanSyncCurriculumFieldUi('indicators');
  }
}
// Recalcula los procedimientos visibles cuando cambia el contexto del plan.
function lessonPlanResyncProceduralSelectionForCurrentContext() {
  lessonPlanSyncProceduralSelectionFromConceptual(false);
}
// Permite editar un ítem procedimental puntual y recompone el resumen textual persistido.
// Guarda el texto de un ítem procedimental editado manualmente.
function lessonPlanSetProceduralItemText(itemKey, value, rerender = false) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return;
  const draft = lessonPlanDraft();
  const nextMap = draft?.curriculum?.proceduralItemMap && typeof draft.curriculum.proceduralItemMap === 'object'
    ? { ...draft.curriculum.proceduralItemMap }
    : {};
  const cleanValue = normalizeSpanishDraftText(value || '', { preserveCase: true }).trim();
  if (cleanValue) nextMap[cleanKey] = cleanValue;
  else delete nextMap[cleanKey];
  lessonPlanSetDraftValue('curriculum.proceduralItemMap', nextMap, false);
  const selection = lessonPlanProceduralItemsForSelection(lessonPlanDraft());
  lessonPlanSetDraftValue('curriculum.proceduralContents', lessonPlanProceduralSummaryText(selection.items), false);
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Permite sobreescribir una actitud derivada sin perder la selección automática base.
// Guarda el texto de un ítem actitudinal editado manualmente.
function lessonPlanSetAttitudinalItemText(itemKey, value, rerender = false) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return;
  const draft = lessonPlanDraft();
  const nextMap = draft?.curriculum?.attitudinalItemMap && typeof draft.curriculum.attitudinalItemMap === 'object'
    ? { ...draft.curriculum.attitudinalItemMap }
    : {};
  const cleanValue = normalizeSpanishDraftText(value || '', { preserveCase: true }).trim();
  if (cleanValue) nextMap[cleanKey] = cleanValue;
  else delete nextMap[cleanKey];
  lessonPlanSetDraftValue('curriculum.attitudinalItemMap', nextMap, false);
  const selection = lessonPlanAttitudinalIndicatorItemsForSelection(lessonPlanDraft());
  lessonPlanSetDraftValue('curriculum.attitudinalContents', lessonPlanDerivedSummaryText(selection.attitudinalItems), false);
  if (rerender) lessonPlanRefreshOpenSectionModal();
}
// Permite editar un indicador derivado y vuelve a validar el campo agregado de indicadores.
// Guarda el texto de un indicador editado manualmente.
function lessonPlanSetIndicatorItemText(itemKey, value, rerender = false) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return;
  const draft = lessonPlanDraft();
  const nextMap = draft?.curriculum?.indicatorItemMap && typeof draft.curriculum.indicatorItemMap === 'object'
    ? { ...draft.curriculum.indicatorItemMap }
    : {};
  const cleanValue = normalizeSpanishDraftText(value || '', { preserveCase: true }).trim();
  if (cleanValue) nextMap[cleanKey] = cleanValue;
  else delete nextMap[cleanKey];
  lessonPlanSetDraftValue('curriculum.indicatorItemMap', nextMap, false);
  const selection = lessonPlanAttitudinalIndicatorItemsForSelection(lessonPlanDraft());
  lessonPlanSetDraftValue('curriculum.indicators', lessonPlanDerivedSummaryText(selection.indicatorItems), false);
  lessonPlanValidateCurriculumField('indicators');
  if (rerender) lessonPlanRefreshOpenSectionModal();
  else lessonPlanSyncCurriculumFieldUi('indicators');
}
// Activa o desactiva un derivado sin borrarlo, dejando el override marcado en su mapa.
// Activa o desactiva un ítem derivado para excluirlo temporalmente del plan.
function lessonPlanToggleDerivedItemEnabled(kind = 'attitudinal', itemKey = '') {
  const cleanKind = String(kind || '').trim() === 'indicator' ? 'indicator' : 'attitudinal';
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return;
  const draft = lessonPlanDraft();
  const mapPath = cleanKind === 'indicator' ? 'curriculum.indicatorItemMap' : 'curriculum.attitudinalItemMap';
  const currentMap = cleanKind === 'indicator'
    ? (draft?.curriculum?.indicatorItemMap && typeof draft.curriculum.indicatorItemMap === 'object' ? { ...draft.curriculum.indicatorItemMap } : {})
    : (draft?.curriculum?.attitudinalItemMap && typeof draft.curriculum.attitudinalItemMap === 'object' ? { ...draft.curriculum.attitudinalItemMap } : {});
  if (String(currentMap[cleanKey] || '').trim() === '__disabled__') delete currentMap[cleanKey];
  else currentMap[cleanKey] = '__disabled__';
  lessonPlanSetDraftValue(mapPath, currentMap, false);
  lessonPlanSyncAttitudinalIndicatorSelectionFromConceptual(true);
}
// Devuelve el conjunto de ítems procedimentales que están visualmente expandidos.
function lessonPlanProceduralExpandedItems() {
  ensureLessonPlansState();
  return Array.isArray(S.lessonPlanUi.expandedProceduralItems)
    ? S.lessonPlanUi.expandedProceduralItems
    : [];
}
// Comprueba si un procedimiento está expandido en la UI.
function lessonPlanProceduralItemIsExpanded(itemKey) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return false;
  return lessonPlanProceduralExpandedItems().includes(cleanKey);
}
// Abre o cierra un procedimiento derivado dentro del panel.
function lessonPlanToggleProceduralExpanded(itemKey) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return;
  const list = lessonPlanProceduralExpandedItems();
  S.lessonPlanUi.expandedProceduralItems = list.includes(cleanKey)
    ? list.filter((item) => item !== cleanKey)
    : [...list, cleanKey];
  lessonPlanRefreshOpenSectionModal();
}
// Devuelve el conjunto de ítems actitudinales que están expandidos.
function lessonPlanAttitudinalExpandedItems() {
  ensureLessonPlansState();
  return Array.isArray(S.lessonPlanUi.expandedAttitudinalItems)
    ? S.lessonPlanUi.expandedAttitudinalItems
    : [];
}
// Comprueba si un ítem actitudinal está expandido.
function lessonPlanAttitudinalItemIsExpanded(itemKey) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return false;
  return lessonPlanAttitudinalExpandedItems().includes(cleanKey);
}
// Abre o cierra un ítem actitudinal dentro del panel.
function lessonPlanToggleAttitudinalExpanded(itemKey) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return;
  const list = lessonPlanAttitudinalExpandedItems();
  S.lessonPlanUi.expandedAttitudinalItems = list.includes(cleanKey)
    ? list.filter((item) => item !== cleanKey)
    : [...list, cleanKey];
  lessonPlanRefreshOpenSectionModal();
}
// Devuelve el conjunto de indicadores que están expandidos.
function lessonPlanIndicatorExpandedItems() {
  ensureLessonPlansState();
  return Array.isArray(S.lessonPlanUi.expandedIndicatorItems)
    ? S.lessonPlanUi.expandedIndicatorItems
    : [];
}
// Comprueba si un indicador está expandido.
function lessonPlanIndicatorItemIsExpanded(itemKey) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return false;
  return lessonPlanIndicatorExpandedItems().includes(cleanKey);
}
// Abre o cierra un indicador dentro del panel de derivación.
function lessonPlanToggleIndicatorExpanded(itemKey) {
  const cleanKey = String(itemKey || '').trim();
  if (!cleanKey) return;
  const list = lessonPlanIndicatorExpandedItems();
  S.lessonPlanUi.expandedIndicatorItems = list.includes(cleanKey)
    ? list.filter((item) => item !== cleanKey)
    : [...list, cleanKey];
  lessonPlanRefreshOpenSectionModal();
}
// Devuelve las competencias fundamentales abiertas dentro del bloque específico.
function lessonPlanSpecificCompetencyExpandedFundamentals() {
  ensureLessonPlansState();
  return Array.isArray(S.lessonPlanUi.expandedSpecificCompetencyFundamentals)
    ? S.lessonPlanUi.expandedSpecificCompetencyFundamentals
    : [];
}
// Comprueba si una competencia fundamental está expandida.
function lessonPlanSpecificCompetencyIsExpanded(fundamental) {
  const clean = String(fundamental || '').trim();
  if (!clean) return false;
  return lessonPlanSpecificCompetencyExpandedFundamentals().includes(clean);
}
// Abre o cierra el bloque de una competencia fundamental concreta.
function lessonPlanToggleSpecificCompetencyExpanded(fundamental) {
  const clean = String(fundamental || '').trim();
  if (!clean) return;
  const list = lessonPlanSpecificCompetencyExpandedFundamentals();
  S.lessonPlanUi.expandedSpecificCompetencyFundamentals = list.includes(clean)
    ? list.filter((item) => item !== clean)
    : [...list, clean];
  lessonPlanRefreshOpenSectionModal();
}
// Guarda texto curricular libre en el campo correspondiente del borrador.
function lessonPlanSetCurriculumTextField(field, value) {
  lessonPlanSetDraftValue(`curriculum.${field}`, normalizeSpanishDraftText(value || '', { preserveCase: true }), false);
  lessonPlanValidateCurriculumField(field);
  lessonPlanSyncCurriculumFieldUi(field);
}
// Normaliza el título temático final antes de guardarlo o mostrarlo.
function lessonPlanFinalizeThemeTitle(value) {
  const normalized = normalizeSpanishDraftText(value || '', { preserveCase: true });
  const finalized = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '';
  lessonPlanSetDraftValue('general.themeTitle', finalized, false);
  lessonPlanSetDraftValue('general.title', finalized, false);
  lessonPlanValidateGeneralField('themeTitle');
  lessonPlanValidateGeneralField('sequenceName');
  lessonPlanSyncThemeSequenceUi();
}
// Cambia el nombre de la secuencia didáctica y actualiza dependencias visuales.
function lessonPlanSetSequenceName(value) {
  lessonPlanSetDraftValue('general.sequenceName', normalizeSpanishDraftText(value || '', { preserveCase: true }), false);
  lessonPlanValidateGeneralField('themeTitle');
  lessonPlanValidateGeneralField('sequenceName');
  lessonPlanSyncThemeSequenceUi();
}
// Normaliza el nombre de la secuencia antes de persistirla.
function lessonPlanFinalizeSequenceName(value) {
  const normalized = normalizeSpanishDraftText(value || '', { preserveCase: true });
  lessonPlanSetDraftValue('general.sequenceName', normalized, false);
  lessonPlanValidateGeneralField('themeTitle');
  lessonPlanValidateGeneralField('sequenceName');
  lessonPlanSyncThemeSequenceUi();
}
// Cambia el eje transversal del plan de clase.
function lessonPlanSetTransversalAxis(value) {
  lessonPlanSetDraftValue('general.transversalAxis', curriculumCatalogDisplayText(String(value || '').trim()), false);
  lessonPlanValidateGeneralField('transversalAxis');
  lessonPlanRefreshOpenSectionModal();
}
// Devuelve los errores generales del plan para mostrarlos en el formulario principal.
function lessonPlanGeneralErrors() {
  ensureLessonPlansState();
  return S.lessonPlanUi.generalErrors;
}
// Resuelve el error puntual de un campo general del plan.
function lessonPlanGeneralError(field) {
  return String(lessonPlanGeneralErrors()[field] || '').trim();
}
// Pinta o limpia el estado de error visual de un campo específico en el formulario.
function lessonPlanSyncFieldErrorUi(selector, errorText) {
  const input = selector ? document.querySelector(selector) : null;
  if (!input) return;
  const field = input.closest('.fg');
  if (!field) return;
  const message = String(errorText || '').trim();
  field.classList.toggle('lesson-plan-field-invalid', !!message);
  input.classList.toggle('is-invalid', !!message);
  let errorNode = field.querySelector('.lesson-plan-field-error');
  if (message) {
    if (!errorNode) {
      errorNode = document.createElement('small');
      errorNode.className = 'lesson-plan-field-error';
      errorNode.dataset.inlineError = 'true';
      field.appendChild(errorNode);
    }
    errorNode.textContent = message;
  } else if (errorNode) {
    errorNode.remove();
  }
}
// Sincroniza los bloques visuales de tema y secuencia con el borrador actual.
function lessonPlanSyncThemeSequenceUi() {
  const message = lessonPlanGeneralError('themeTitle') || lessonPlanGeneralError('sequenceName');
  lessonPlanSyncFieldErrorUi('#lesson-plan-title', message);
  lessonPlanSyncFieldErrorUi('#lesson-plan-sequence-name', message);
}
// Actualiza un campo general del plan dentro de la UI según el estado del borrador.
function lessonPlanSyncGeneralFieldUi(field) {
  if (field === 'themeTitle' || field === 'sequenceName') {
    lessonPlanSyncThemeSequenceUi();
    return;
  }
  const selectors = {
    grade: '#lesson-plan-grade-select, #lesson-plan-grade-name',
    area: '#lesson-plan-area',
    section: '#lesson-plan-section-select, #lesson-plan-section-name',
    subject: '#lesson-plan-subject, #lesson-plan-subject-select',
    transversalAxis: '#lesson-plan-axis-select',
    classDate: '#lesson-plan-class-date',
  };
  lessonPlanSyncFieldErrorUi(selectors[field] || '', lessonPlanGeneralError(field));
}
// Actualiza la UI de un campo curricular cuando el borrador cambia por validación o por selección.
function lessonPlanSyncCurriculumFieldUi(field) {
  const selectors = {
    fundamentalCompetencies: '#lesson-plan-fundamental-selector',
    specificCompetencies: '#lesson-plan-curriculum-specific',
    conceptualContents: '#lesson-plan-curriculum-conceptual',
    proceduralContents: '#lesson-plan-curriculum-procedural',
    attitudinalContents: '#lesson-plan-curriculum-attitudinal',
    indicators: '#lesson-plan-curriculum-indicators',
  };
  lessonPlanSyncFieldErrorUi(selectors[field] || '', lessonPlanCurriculumError(field));
}
// Detecta errores combinados entre el tema temático y el nombre de la secuencia.
function lessonPlanThemeOrSequenceError(draft = lessonPlanDraft()) {
  const title = normalizeSpanishDraftText(draft?.general?.themeTitle || '', { preserveCase: true }).trim();
  const sequence = normalizeSpanishDraftText(draft?.general?.sequenceName || '', { preserveCase: true }).trim();
  if ((!title || title.length < 3) && !sequence) return 'Debes escribir el título del tema o la secuencia didáctica.';
  return '';
}
// Valida un campo del encabezado general y deja el error listo para renderizar inline.
// Valida un campo general del plan y devuelve el error correspondiente si no cumple.
function lessonPlanValidateGeneralField(field) {
  const draft = lessonPlanDraft();
  const errors = lessonPlanGeneralErrors();
  let message = '';
  const usesTemporaryGrade = lessonPlanUsesTemporaryGrade(draft);
  const gradeValue = usesTemporaryGrade
    ? String(draft.general.gradeName || '').trim()
    : String(draft.general.gradeId || '').trim();
  const areaValue = String(draft.general.area || '').trim();
  const sectionValue = usesTemporaryGrade
    ? String(draft.general.sectionName || '').trim()
    : String(draft.general.sectionId || draft.general.groupId || draft.general.sectionName || '').trim();
  const subjectValue = String(draft.general.subject || draft.general.subarea || '').trim();
  const classDateValue = String(draft.general.classDate || draft.general.startDate || '').trim();
  if (field === 'grade' && !gradeValue) message = 'Debes seleccionar un grado.';
  if (field === 'area' && !areaValue) message = 'Debes seleccionar un área.';
  if (field === 'section' && !sectionValue) message = 'Debes seleccionar una sección.';
  if (field === 'subject' && !subjectValue) message = 'Debes seleccionar una asignatura.';
  if (field === 'themeTitle' || field === 'sequenceName') message = lessonPlanThemeOrSequenceError(draft);
  if (field === 'transversalAxis' && !String(draft.general.transversalAxis || '').trim()) message = 'Debes seleccionar un eje transversal.';
  if (field === 'classDate' && !classDateValue) message = 'Debes indicar la fecha de la clase.';
  if (message) errors[field] = message;
  else delete errors[field];
  return !message;
}
// Valida un campo curricular agregado y distribuye errores entre resumen y bloques internos.
// Valida un campo curricular individual antes de permitir guardar la planificación.
function lessonPlanValidateCurriculumField(field) {
  const errors = lessonPlanCurriculumErrors();
  let message = '';
  const draft = lessonPlanDraft();
  const fundamentalItems = lessonPlanCurriculumItems(draft.curriculum.fundamentalCompetencies);
  const specificMap = lessonPlanSpecificCompetencyMap(draft);
  const missingSpecifics = fundamentalItems.length
    ? fundamentalItems.filter((item) => !String(specificMap[item] || '').trim())
    : [];
  const specificItems = fundamentalItems.length
    ? fundamentalItems.map((item) => String(specificMap[item] || '').trim()).filter(Boolean)
    : lessonPlanCurriculumItems(draft.curriculum.specificCompetencies);
  const conceptualItems = lessonPlanCurriculumItems(draft.curriculum.conceptualContents);
  const indicatorItems = lessonPlanCurriculumItems(draft.curriculum.indicators);
  if (field === 'fundamentalCompetencies' && !fundamentalItems.length) message = 'Debes seleccionar al menos una competencia fundamental.';
  if (field === 'specificCompetencies' && (!specificItems.length || missingSpecifics.length)) message = 'Debes completar al menos una competencia específica.';
  if (field === 'conceptualContents' && !conceptualItems.length) message = 'Debes indicar al menos un contenido conceptual.';
  if (field === 'indicators' && !indicatorItems.length) message = 'Debes indicar al menos un indicador de logro.';
  if (message) errors[field] = message;
  else delete errors[field];
  if (field === 'specificCompetencies') {
    const blockErrors = lessonPlanCurriculumBlockErrors();
    Object.keys(blockErrors).forEach((key) => delete blockErrors[key]);
    missingSpecifics.forEach((item) => {
      blockErrors[item] = 'Debes seleccionar una competencia específica para esta competencia fundamental.';
    });
  }
  return !message;
}
// Ejecuta la validación global del bloque curricular antes de permitir avanzar o guardar.
// Valida toda la sección curricular del plan antes de persistirla.
function lessonPlanValidateCurriculumSection() {
  const draft = lessonPlanDraft();
  const nextErrors = {};
  const fundamentalItems = lessonPlanSelectedFundamentalCompetencies(draft);
  const specificMap = lessonPlanSpecificCompetencyMap(draft);
  const specificValues = fundamentalItems.length
    ? fundamentalItems.map((item) => String(specificMap[item] || '').trim()).filter(Boolean)
    : lessonPlanCurriculumItems(draft.curriculum.specificCompetencies);
  const nextBlockErrors = {};
  if (!fundamentalItems.length) {
    nextErrors.fundamentalCompetencies = 'Debes seleccionar al menos una competencia fundamental.';
  }
  fundamentalItems.forEach((item) => {
    if (!String(specificMap[item] || '').trim()) {
      nextBlockErrors[item] = 'Debes seleccionar una competencia específica para esta competencia fundamental.';
    }
  });
  if (!specificValues.length || Object.keys(nextBlockErrors).length) {
    nextErrors.specificCompetencies = 'Debes completar al menos una competencia específica.';
  }
  if (!lessonPlanCurriculumItems(draft.curriculum.conceptualContents).length) {
    nextErrors.conceptualContents = 'Debes indicar al menos un contenido conceptual.';
  }
  if (!lessonPlanCurriculumItems(draft.curriculum.indicators).length) {
    nextErrors.indicators = 'Debes indicar al menos un indicador de logro.';
  }
  S.lessonPlanUi.curriculumErrors = nextErrors;
  S.lessonPlanUi.curriculumBlockErrors = nextBlockErrors;
  lessonPlanRefreshOpenSectionModal();
  const firstErrorField = ['fundamentalCompetencies', 'specificCompetencies', 'conceptualContents', 'indicators']
    .find((field) => String(nextErrors[field] || '').trim());
  if (firstErrorField) {
    const selectors = {
      fundamentalCompetencies: '#lesson-plan-fundamental-selector .lesson-plan-choice-pill, #lesson-plan-fundamental-selector',
      specificCompetencies: '#lesson-plan-curriculum-specific .is-invalid, #lesson-plan-curriculum-specific',
      conceptualContents: '#lesson-plan-curriculum-conceptual',
      indicators: '#lesson-plan-curriculum-indicators',
    };
    const target = document.querySelector(selectors[firstErrorField] || '');
    toast('Completa los campos curriculares obligatorios para continuar.', true);
    requestAnimationFrame(() => {
      if (target && typeof target.focus === 'function') target.focus();
    });
  }
  return !Object.keys(nextErrors).length;
}
// Valida la sección general del plan, incluyendo tema, secuencia y datos base.
function lessonPlanValidateGeneralSection() {
  const draft = lessonPlanDraft();
  const nextErrors = {};
  const usesTemporaryGrade = lessonPlanUsesTemporaryGrade(draft);
  const gradeValue = usesTemporaryGrade
    ? String(draft.general.gradeName || '').trim()
    : String(draft.general.gradeId || '').trim();
  const areaValue = String(draft.general.area || '').trim();
  const sectionValue = usesTemporaryGrade
    ? String(draft.general.sectionName || '').trim()
    : String(draft.general.sectionId || draft.general.groupId || draft.general.sectionName || '').trim();
  const subjectValue = String(draft.general.subject || draft.general.subarea || '').trim();
  const classDateValue = String(draft.general.classDate || draft.general.startDate || '').trim();
  if (!gradeValue) {
    nextErrors.grade = 'Debes seleccionar un grado.';
  }
  if (!areaValue) {
    nextErrors.area = 'Debes seleccionar un área.';
  }
  if (!sectionValue) {
    nextErrors.section = 'Debes seleccionar una sección.';
  }
  if (!subjectValue) {
    nextErrors.subject = 'Debes seleccionar una asignatura.';
  }
  const themeOrSequenceMessage = lessonPlanThemeOrSequenceError(draft);
  if (themeOrSequenceMessage) {
    nextErrors.themeTitle = themeOrSequenceMessage;
    nextErrors.sequenceName = themeOrSequenceMessage;
  }
  if (!String(draft.general.transversalAxis || '').trim()) {
    nextErrors.transversalAxis = 'Debes seleccionar un eje transversal.';
  }
  if (!classDateValue) {
    nextErrors.classDate = 'Debes indicar la fecha de la clase.';
  }
  S.lessonPlanUi.generalErrors = nextErrors;
  lessonPlanRefreshOpenSectionModal();
  const firstErrorField = ['grade', 'area', 'section', 'subject', 'themeTitle', 'sequenceName', 'transversalAxis', 'classDate']
    .find((field) => String(nextErrors[field] || '').trim());
  if (firstErrorField) {
    const selectors = {
      grade: '#lesson-plan-grade-select, #lesson-plan-grade-name',
      area: '#lesson-plan-area',
      section: '#lesson-plan-section-select, #lesson-plan-section-name',
      subject: '#lesson-plan-subject, #lesson-plan-subject-select',
      themeTitle: '#lesson-plan-title',
      sequenceName: '#lesson-plan-sequence-name',
      transversalAxis: '#lesson-plan-axis-select',
      classDate: '#lesson-plan-class-date',
    };
    const target = document.querySelector(selectors[firstErrorField] || '');
    toast('Completa los campos obligatorios para continuar.', true);
    requestAnimationFrame(() => {
      if (target && typeof target.focus === 'function') target.focus();
    });
  }
  return !Object.keys(nextErrors).length;
}
// Añade un valor a una ruta existente del borrador, útil para textos acumulativos.
function lessonPlanAppendField(path, value) {
  const current = String(path.split('.').reduce((cursor, key) => (cursor && cursor[key] !== undefined ? cursor[key] : ''), lessonPlanDraft()) || '').trim();
  const addition = normalizeSpanishDraftText(value || '', { preserveCase: true });
  if (!addition) return;
  lessonPlanSetDraftValue(path, current ? `${current}\n${addition}` : addition, true);
}
// Cambia un campo específico de una clase dentro del bloque de planificación.
function lessonPlanSetClassField(classId, path, value) {
  const lessonClass = lessonPlanGetClass(classId);
  if (!lessonClass) return;
  const parts = String(path || '').split('.').filter(Boolean);
  let cursor = lessonClass;
  while (parts.length > 1) {
    const key = parts.shift();
    if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[parts[0]] = normalizeSpanishDraftText(value || '', { preserveCase: true });
  lessonPlanDraft().updatedAt = Date.now();
  lessonPlanQueueAutosave();
}
// Añade contenido a un campo de una clase sin reemplazar lo que ya tenía.
function lessonPlanAppendClassField(classId, path, value) {
  const lessonClass = lessonPlanGetClass(classId);
  if (!lessonClass) return;
  const current = String(path.split('.').reduce((cursor, key) => (cursor && cursor[key] !== undefined ? cursor[key] : ''), lessonClass) || '').trim();
  const addition = normalizeSpanishDraftText(value || '', { preserveCase: true });
  if (!addition) return;
  lessonPlanSetClassField(classId, path, current ? `${current}\n${addition}` : addition);
  go('planificaciones');
}
// Ajusta la duración de una clase y recalcula la etiqueta visible para el editor.
function lessonPlanSetClassDurationHours(classId, value) {
  const lessonClass = lessonPlanGetClass(classId);
  if (!lessonClass) return;
  const hours = LESSON_PLAN_CLASS_DURATION_OPTIONS.some((option) => option.value === String(value)) ? String(value) : '1';
  lessonClass.durationHours = hours;
  lessonClass.durationMinutes = lessonPlanDurationLabel(hours);
  lessonPlanDraft().updatedAt = Date.now();
  lessonPlanQueueAutosave();
  go('planificaciones');
}
// Guarda la selección de un combo general del plan y decide si debe repintar.
function lessonPlanSetGeneralSelect(path, value, rerender = false) {
  if (path === 'groupId') {
    // Gestiona grupo.
    const group = (S.secciones || []).find((item) => item.id === value) || null;
    // Gestiona grado.
    const grade = (S.grades || []).find((item) => item.id === group?.gradeId) || null;
    lessonPlanSetDraftValue('general.groupId', value || '', false);
    lessonPlanSetDraftValue('general.sectionId', value || '', false);
    lessonPlanSetDraftValue('groupId', value || '', false);
    if (group) {
      lessonPlanSetDraftValue('general.subject', group.materia || '', false);
      lessonPlanSetDraftValue('general.subarea', group.materia || '', false);
      lessonPlanSetDraftValue('general.gradeId', group.gradeId || '', false);
      lessonPlanSetDraftValue('general.gradeName', lessonPlanFullGradeName(group, grade), false);
      lessonPlanSetDraftValue('general.sectionName', group.sec || '', false);
      lessonPlanSetDraftValue('general.area', lessonPlanAreaFromGroup(group), false);
    }
    lessonPlanResyncSpecificCompetenciesForCurrentContext();
    lessonPlanResyncConceptualSelectionForCurrentContext();
    lessonPlanResyncProceduralSelectionForCurrentContext();
    if (lessonPlanDraft().general.scheduleLinked) {
      const suggestedDate = lessonPlanSuggestedNextClassDate(value || '', lessonPlanTodayIso());
      if (suggestedDate) lessonPlanSetClassDate(suggestedDate, false);
    }
    if (rerender) go('planificaciones');
    return;
  }
  lessonPlanSetDraftValue(`general.${path}`, value, rerender);
}
// Cambia la cantidad de clases del plan y sincroniza la lista interna.
function lessonPlanSetClassCount(value) {
  const desired = Math.max(1, parseInt(value, 10) || 1);
  const draft = lessonPlanDraft();
  while (draft.classes.length < desired) draft.classes.push(lessonPlanCreateClass(draft.classes.length + 1));
  while (draft.classes.length > desired) draft.classes.pop();
  draft.classes.forEach((lessonClass, index) => { lessonClass.index = index + 1; });
  draft.general.classCount = desired;
  draft.updatedAt = Date.now();
  go('planificaciones');
}
// Activa o desactiva un recurso general de la planificación.
function lessonPlanToggleResource(resource) {
  const draft = lessonPlanDraft();
  const list = Array.isArray(draft.resources.preset) ? draft.resources.preset : [];
  if (list.includes(resource)) draft.resources.preset = list.filter((item) => item !== resource);
  else draft.resources.preset = [...list, resource];
  lessonPlanQueueAutosave();
}
// Activa o desactiva un recurso asociado a una clase específica.
function lessonPlanToggleClassResource(classId, resource) {
  const lessonClass = lessonPlanGetClass(classId);
  if (!lessonClass) return;
  const list = Array.isArray(lessonClass.resourcesPreset) ? lessonClass.resourcesPreset : [];
  if (list.includes(resource)) lessonClass.resourcesPreset = list.filter((item) => item !== resource);
  else lessonClass.resourcesPreset = [...list, resource];
  lessonPlanQueueAutosave();
}
// Devuelve o crea el borrador de actividad asociado a una clase del plan.
function lessonPlanActivityDraft(classId) {
  ensureLessonPlansState();
  if (!S.lessonPlanUi.activityDrafts[classId]) {
    S.lessonPlanUi.activityDrafts[classId] = {
      name: '',
      description: '',
      type: 'individual',
      evidence: '',
      blockId: 'B1',
      points: 20,
      technique: '',
      instrumentId: '',
      instrumentType: 'rubrica_analitica',
    };
  }
  return S.lessonPlanUi.activityDrafts[classId];
}
// Cambia un campo del borrador de actividad anclado a una clase.
function lessonPlanSetActivityDraftField(classId, field, value) {
  const draft = lessonPlanActivityDraft(classId);
  draft[field] = field === 'points' ? Math.max(1, round2(parseDecimalInput(value, 20))) : normalizeSpanishDraftText(value || '', { preserveCase: true });
}
// Filtra las filas del horario que coinciden con el grupo activo para sugerir fechas.
function lessonPlanMatchingScheduleRows(groupId) {
  ensureTeacherPlannerState();
  return teacherScheduleRowsForActiveDays()
    .filter((row) => teacherScheduleRowMatchesAttendanceSection(row, groupId))
    .filter((row) => sanitizeTeacherScheduleRow(row).blockType === 'class');
}
// Devuelve la fecha visible del plan de clase o una fecha sugerida por contexto.
function lessonPlanClassDateValue(draft = lessonPlanDraft()) {
  return String(draft?.general?.classDate || draft?.general?.startDate || draft?.classes?.[0]?.date || '').trim();
}
// Calcula la fecha de hoy en formato ISO simple para usarla en el plan.
function lessonPlanTodayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
// Sugiere la siguiente fecha de clase real considerando el horario y el grupo.
function lessonPlanSuggestedNextClassDate(groupId, fromDate = '') {
  const rows = lessonPlanMatchingScheduleRows(groupId);
  if (!rows.length) return '';
  const weekdayOrder = Array.from(new Set(rows.map((row) => parseInt(row.weekday, 10)).filter((value) => Number.isInteger(value)))).sort((a, b) => a - b);
  if (!weekdayOrder.length) return '';
  const baseDate = String(fromDate || '').trim() || lessonPlanTodayIso();
  const cursor = new Date(`${baseDate}T12:00:00`);
  for (let guard = 0; guard < 120; guard += 1) {
    const jsWeekday = cursor.getDay();
    const weekday = jsWeekday === 0 ? 6 : jsWeekday - 1;
    if (weekdayOrder.includes(weekday)) return cursor.toISOString().slice(0, 10);
    cursor.setDate(cursor.getDate() + 1);
  }
  return '';
}
// Genera una secuencia de fechas sugeridas a partir del horario y la cantidad de clases.
function lessonPlanSuggestedDates(groupId, startDate, classCount) {
  const rows = lessonPlanMatchingScheduleRows(groupId);
  if (!rows.length || !startDate || !classCount) return [];
  const weekdayOrder = Array.from(new Set(rows.map((row) => parseInt(row.weekday, 10)).filter((value) => Number.isInteger(value)))).sort((a, b) => a - b);
  if (!weekdayOrder.length) return [];
  const slots = [];
  const cursor = new Date(`${startDate}T12:00:00`);
  while (slots.length < classCount && slots.length < 120) {
    const jsWeekday = cursor.getDay();
    const weekday = jsWeekday === 0 ? 6 : jsWeekday - 1;
    if (weekdayOrder.includes(weekday)) slots.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}
// Cambia la fecha de una clase del plan y vuelve a sincronizar la vista si hace falta.
function lessonPlanSetClassDate(value, rerender = true) {
  const normalized = String(value || '').trim();
  lessonPlanSetDraftValue('general.classDate', normalized, false);
  lessonPlanSetDraftValue('general.startDate', normalized, false);
  lessonPlanSetDraftValue('general.endDate', normalized, false);
  const draft = lessonPlanDraft();
  if (draft.classes[0]) draft.classes[0].date = normalized;
  draft.updatedAt = Date.now();
  lessonPlanValidateGeneralField('classDate');
  lessonPlanQueueAutosave();
  if (rerender) {
    go('planificaciones');
    lessonPlanRefreshOpenSectionModal();
  }
}
// Activa o desactiva el vínculo automático del plan con el horario docente.
function lessonPlanToggleScheduleLinked(enabled) {
  const draft = lessonPlanDraft();
  draft.general.scheduleLinked = !!enabled;
  if (draft.general.scheduleLinked) {
    const suggestedDate = lessonPlanSuggestedNextClassDate(draft.general.groupId || S.activeGroupId, lessonPlanTodayIso());
    if (suggestedDate) lessonPlanSetClassDate(suggestedDate, false);
  }
  draft.updatedAt = Date.now();
  lessonPlanQueueAutosave();
  go('planificaciones');
  lessonPlanRefreshOpenSectionModal();
}
// Aplica en bloque las fechas sugeridas por el horario al plan de clases.
function lessonPlanApplySuggestedDates() {
  const draft = lessonPlanDraft();
  const startDate = draft.general.startDate;
  if (!draft.general.groupId || !startDate) {
    toast('Selecciona primero materia y fecha de inicio', true);
    return;
  }
  const suggestions = lessonPlanSuggestedDates(draft.general.groupId, startDate, draft.classes.length);
  if (!suggestions.length) {
    toast('No encontró un horario docente para sugerir fechas', true);
    return;
  }
  draft.classes.forEach((lessonClass, index) => { lessonClass.date = suggestions[index] || lessonClass.date || ''; });
  draft.general.endDate = suggestions[suggestions.length - 1] || draft.general.endDate;
  draft.updatedAt = Date.now();
  persist();
  go('planificaciones');
  toast('Fechas sugeridas desde el horario docente');
}
// Crea un instrumento nuevo partiendo de la información de una clase concreta.
function lessonPlanCreateInstrumentForClass(classId) {
  const draft = lessonPlanActivityDraft(classId);
  const name = String(draft.name || '').trim() || 'Instrumento de planificación';
  const type = LESSON_PLAN_INSTRUMENT_TYPE_OPTIONS.find((item) => item.value === draft.instrumentType)?.value || 'rubrica_analitica';
  const created = instrumentService.create({
    type,
    name,
    maxScore: Math.max(1, round2(parseDecimalInput(draft.points, 20))),
    periodId: S.activePeriodId,
    courseId: S.activeGroupId || null,
  });
  if (!created) {
    toast('No pude crear el instrumento', true);
    return;
  }
  draft.instrumentId = created.id;
  persist();
  go('planificaciones');
  toast('Instrumento creado y listo para vincular');
}
// Vincula una actividad existente a una clase del plan y al bloque curricular indicado.
function lessonPlanLinkExistingActivity(classId, activityId, blockId = 'B1') {
  const lessonClass = lessonPlanGetClass(classId);
  if (!lessonClass || !activityId) return;
  const found = findActivity(activityId);
  if (!found) {
    toast('La actividad seleccionada no existe', true);
    return;
  }
  if (!lessonClass.activityLinks.some((item) => item.activityId === activityId)) {
    lessonClass.activityLinks.push(lessonPlanNormalizeActivityLink({
      activityId,
      blockId: found.block || blockId,
      instrumentId: found.activity.instrumentId || '',
      evidence: found.activity.producto || '',
      technique: found.activity.tipo || '',
    }));
    persist();
  }
  go('planificaciones');
}
// Elimina el vínculo entre una clase del plan y una actividad ya asociada.
function lessonPlanRemoveActivityLink(classId, activityId) {
  const lessonClass = lessonPlanGetClass(classId);
  if (!lessonClass) return;
  lessonClass.activityLinks = lessonClass.activityLinks.filter((item) => item.activityId !== activityId);
  persist();
  go('planificaciones');
}
// Crea una actividad nueva ya enlazada a una clase del plan.
function lessonPlanCreateLinkedActivity(classId) {
  const classDraft = lessonPlanActivityDraft(classId);
  const lessonClass = lessonPlanGetClass(classId);
  if (!lessonClass) return;
  const name = String(classDraft.name || '').trim();
  if (!name) {
    toast('Escribe el nombre de la actividad', true);
    return;
  }
  if (!String(classDraft.technique || '').trim()) {
    toast('La actividad necesita una técnica de evaluación', true);
    return;
  }
  if (!String(classDraft.instrumentId || '').trim()) {
    toast('La actividad necesita un instrumento de evaluación', true);
    return;
  }
  const blockId = BLOCKS.includes(classDraft.blockId) ? classDraft.blockId : 'B1';
  const points = Math.max(1, round2(parseDecimalInput(classDraft.points, 20)));
  const activity = {
    id: uid(),
    name,
    courseId: S.activeGroupId,
    periodId: S.activePeriodId,
    pts: points,
    tipo: classDraft.type || '',
    fecha: lessonClass.date || '',
    desc: String(classDraft.description || '').trim(),
    producto: String(classDraft.evidence || '').trim(),
    technique: String(classDraft.technique || '').trim(),
    lessonPlanId: lessonPlanDraft().id,
    lessonClassId: classId,
    instrumentId: classDraft.instrumentId || null,
    instrumentIds: classDraft.instrumentId ? [classDraft.instrumentId] : [],
    instrumentHistory: [],
  };
  getGroupCfg(S.activeGroupId, S.activePeriodId)[blockId].activities.push(activity);
  if (!lessonClass.activityLinks.some((item) => item.activityId === activity.id)) {
    lessonClass.activityLinks.push(lessonPlanNormalizeActivityLink({
      activityId: activity.id,
      blockId,
      instrumentId: classDraft.instrumentId || '',
      evidence: classDraft.evidence || '',
      technique: classDraft.technique || '',
    }));
  }
  S.lessonPlanUi.activityDrafts[classId] = {
    name: '',
    description: '',
    type: 'individual',
    evidence: '',
    blockId: 'B1',
    points: 20,
    technique: '',
    instrumentId: '',
    instrumentType: 'rubrica_analitica',
  };
  persist();
  go('planificaciones');
  toast('Actividad creada y vinculada a la planificación');
}
// Convierte una clave de mes en su número para comparar o sugerir períodos.
function monthNumberFromMonthKey(monthKey) {
  return attendanceMonthStart(monthKey).getMonth() + 1;
}
// Sugiere el período académico activo según el mes recibido.
function suggestedAcademicPeriodIdForMonth(monthKey) {
  const monthNumber = monthNumberFromMonthKey(monthKey);
  return academicCalendarPeriods().find((period) => (period.months || []).includes(monthNumber))?.id || null;
}
// Indica si un mes dado está marcado como activo en el calendario académico.
function isAcademicMonthActive(monthKey) {
  return academicCalendarActiveMonths().includes(monthNumberFromMonthKey(monthKey));
}
// Devuelve el nombre visible del período académico activo o solicitado.
function periodName(periodId = S.activePeriodId) {
  const rawName = academicPeriodDefinition(periodId)?.name || (S.periods || DEFAULT_PERIODS).find(p=>p.id===periodId)?.name || periodId || 'P1';
  return fixMojibakeText(String(rawName || '').trim()).replace(/^Periodo\b/i, 'Período');
}
// Devuelve los grados ordenados para que los selectores mantengan una secuencia estable.
function getSortedGrades() {
  return [...getScopedGrades()].sort((a,b)=>(a.gradeLevel||parseGradeLevel(a.name))-(b.gradeLevel||parseGradeLevel(b.name)) || String(a.name).localeCompare(String(b.name),'es'));
}
// Resuelve la sección activa actual a partir del grupo o curso seleccionado.
function getActiveSection() {
  return getScopedSections().find(s=>s.id===S.activeGroupId) || null;
}
// Asegura que el contexto activo de grado, sección y grupo quede consistente antes de renderizar.
function ensureActiveContext() {
  const sortedGrades = getSortedGrades();
  const scopedSections = getScopedSections();
  const byId = new Map(scopedSections.map(s => [s.id, s]));
  const currentByGroup = byId.get(S.activeGroupId);
  const currentByCourse = byId.get(S.activeCourseId);
  if (S.activeGradeId && !sortedGrades.some(g=>g.id===S.activeGradeId)) S.activeGradeId = null;
  if (!S.activeGradeId) S.activeGradeId = currentByGroup?.gradeId || currentByCourse?.gradeId || sortedGrades[0]?.id || null;

  const sectionsInActiveGrade = sortCourses(scopedSections.filter(s=>s.gradeId===S.activeGradeId));
  let nextSectionId = null;
  if (currentByGroup && currentByGroup.gradeId===S.activeGradeId) nextSectionId = currentByGroup.id;
  else if (currentByCourse && currentByCourse.gradeId===S.activeGradeId) nextSectionId = currentByCourse.id;
  else nextSectionId = sectionsInActiveGrade[0]?.id || null;

  S.activeGroupId = nextSectionId;
  S.activeCourseId = nextSectionId;
}
// Construye la etiqueta de contexto académico que se muestra en la barra superior.
function activeContextLabel(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const courseLabel = getGroupLabel(groupId);
  const periodCode = periodId || S.activePeriodId || 'P1';
  return `${courseLabel} - Período ${periodCode}`;
}
// Decide si la página actual necesita mostrar el contexto académico en la UI.
function shouldShowAcademicContext(pageId = currentPage) {
  return ['actividades', 'matriz', 'reportes'].includes(pageId);
}
// Combina el título base del panel con su contexto académico cuando corresponde.
function pageTitleWithContext(pageId = currentPage, baseTitle = '') {
  if (!shouldShowAcademicContext(pageId)) return baseTitle;
  return `${baseTitle} - ${activeContextLabel()}`;
}
// Pinta las líneas de contexto académico reutilizables en instrumentos y planificaciones.
function renderInstrumentContextLines(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  return `
    <div class="inst-context-lines">
      <div><strong>Curso:</strong> ${getGroupLabel(groupId)}</div>
      <div><strong>Período:</strong> ${periodId || S.activePeriodId || 'P1'}</div>
    </div>
  `;
}
// Construye el subtítulo de la barra superior con período, usuario y contexto.
function topbarContext() {
  const institution = S.profile?.inst || 'Institución por configurar';
  const year = S.schoolYear?.name || S.profile?.year || '2025-2026';
  const period = periodName();
  return `${institution} - ${year} - ${period}`;
}
// Renderiza los controles de contexto que viven en la cabecera superior.
function renderTopbarContextControls() {
  // Construye el selector visible de curso y período que usan dashboard, actividades, matriz y reportes.
  ensureActiveContext();
  ensurePeriodsAndYear();
  const groups = getGroups();
  const groupOptions = groups
    .map((group) => `<option value="${group.id}" ${group.id===S.activeGroupId?'selected':''}>${group.gradeName} ${group.sectionName} ? ${group.materia||'General'}</option>`)
    .join('');
  const periodOptions = (S.periods || DEFAULT_PERIODS)
    .map((period) => `<option value="${period.id}" ${period.id===S.activePeriodId?'selected':''}>${period.name}</option>`)
    .join('');
  return `
    <div class="tb-context-controls panel-context-controls">
      <div class="tb-context-mini">
        <select class="tb-context-select" onchange="setActiveGroup(this.value)" aria-label="Seleccionar curso">${groupOptions || '<option value="">Sin cursos</option>'}</select>
        <select class="tb-context-select" onchange="setActivePeriod(this.value)" aria-label="Seleccionar período">${periodOptions}</select>
      </div>
    </div>
  `;
}
// Inserta controles contextuales dentro de la vista activa según el panel abierto.
function injectPanelContextControls(view) {
  // Inserta el bloque de contexto académico dentro de la vista activa cuando el panel necesita curso/período.
  if (!view) return;
  const existing = view.querySelector('.panel-context-host');
  if (existing) existing.remove();
  if (!shouldShowAcademicContext(currentPage)) return;
  const host = document.createElement('div');
  host.className = 'panel-context-host';
  host.innerHTML = renderTopbarContextControls();
  view.prepend(host);
}
// Garantiza que el calendario de periodos y el año escolar existan antes de usarlos en la UI.
function ensurePeriodsAndYear() {
  if (!S.schoolYear || typeof S.schoolYear !== 'object') S.schoolYear = {id:'2025-2026', name:'2025-2026'};
  ensureAcademicCalendar();
  if (!Array.isArray(S.periods) || S.periods.length===0) S.periods = JSON.parse(JSON.stringify(DEFAULT_PERIODS));
  S.periods.sort((a,b)=>(a.order||99)-(b.order||99));
  if (!S.activePeriodId || !S.periods.find(p=>p.id===S.activePeriodId)) S.activePeriodId = S.periods[0]?.id || 'P1';
}
// Clona una configuración de bloques para poder copiarla sin compartir referencias.
function cloneCfg(cfg) {
  return JSON.parse(JSON.stringify(cfg || emptyGroupCfg()));
}
// Asegura que existan los buckets de datos para el período solicitado.
function ensurePeriodBuckets(periodId = S.activePeriodId) {
  ensurePeriodsAndYear();
  if (!S.periodGroupConfigs || typeof S.periodGroupConfigs !== 'object') S.periodGroupConfigs = {};
  if (!S.notasByPeriod || typeof S.notasByPeriod !== 'object') S.notasByPeriod = {};
  if (!S.periodGroupConfigs[periodId]) {
    const base = (periodId==='P1' && S.groupConfigs && Object.keys(S.groupConfigs).length) ? S.groupConfigs : {};
    S.periodGroupConfigs[periodId] = cloneCfg(base);
  }
  if (!S.notasByPeriod[periodId]) {
    S.notasByPeriod[periodId] = (periodId==='P1' && S.notas && Object.keys(S.notas).length) ? JSON.parse(JSON.stringify(S.notas)) : {};
  }
  S.groupConfigs = S.periodGroupConfigs[periodId];
  S.notas = S.notasByPeriod[periodId];
}
// Cambia el período activo y deja el estado listo para re-renderizar el panel correcto.
function setActivePeriod(periodId) {
  if (enforceMandatoryEducationSelection()) return;
  const next = (S.periods||[]).find(p=>p.id===periodId)?.id || 'P1';
  S.activePeriodId = next;
  ensureActiveContext();
  ensurePeriodBuckets(next);
  resetAllCreateForms();
  persist();
  refreshTop();
  go(currentPage);
}
// Cambia la escuela activa en el estado global.
function setActiveSchool(name) {
  const school = normalizeSchoolName(name) || 'Sin especificar';
  registerSchool(school);
  if (!S.profile) S.profile = {};
  S.profile.inst = school;
  persist();
  refreshTop();
}
// Cambia el año escolar activo y sincroniza el calendario derivado.
function setSchoolYear(yearName) {
  const y = String(yearName||'').trim() || '2025-2026';
  S.schoolYear = {id:y, name:y};
  if (S.profile) S.profile.year = y;
  persist();
  refreshTop();
}
// Construye la lista de años escolares disponibles para los selectores del sistema.
function buildSchoolYearOptions() {
  const list = [];
  for (let y=2025; y<=2030; y++) list.push(`${y}-${y+1}`);
  if (S.profile?.year && !list.includes(S.profile.year)) list.unshift(S.profile.year);
  if (S.schoolYear?.name && !list.includes(S.schoolYear.name)) list.unshift(S.schoolYear.name);
  return Array.from(new Set(list));
}
// Renderiza el selector compacto de año y período que aparece en la barra superior.
function renderYearPeriodSelector() {
  return '';
}
// Normaliza el nombre de una escuela para compararlo y almacenarlo de forma estable.
function normalizeSchoolName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}
let SQL_SCHOOL_CATALOG_SYNC_PROMISE = null;
let SQL_SCHOOL_CATALOG_SYNCED = false;
const SQL_STATE_BLOCK_KEYS = ['assessment', 'planner'];
const SQL_STATE_SYNC_DELAY_MS = 900;
let SQL_STATE_HYDRATE_PROMISE = null;
let SQL_STATE_META_CACHE = { userId: '', data: null };
let suppressSqlStateSave = false;
let SQL_ACADEMIC_CONTEXT_CACHE = { key: '', data: null };
let SQL_ACADEMIC_SYNC_PROMISE = null;
const SQL_STATE_RUNTIME = SQL_STATE_BLOCK_KEYS.reduce((acc, blockKey) => {
  acc[blockKey] = {
    timer: null,
    inFlight: false,
    pending: false,
    context: null,
    payload: null,
    hash: '',
  };
  return acc;
}, {});
// Fusiona las escuelas llegadas de otra fuente con el catálogo local sin duplicarlas.
function mergeSchoolsIntoCatalog(items = []) {
  if (!Array.isArray(S.schools)) S.schools = [];
  const merged = [...S.schools, ...items, ...DEFAULT_SCHOOLS].map(normalizeSchoolName).filter(Boolean);
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
// Sincroniza el catálogo local de escuelas con la copia que viene de SQL.
function syncSchoolCatalogFromSql() {
  if (SQL_SCHOOL_CATALOG_SYNCED) return Promise.resolve();
  if (SQL_SCHOOL_CATALOG_SYNC_PROMISE) return SQL_SCHOOL_CATALOG_SYNC_PROMISE;
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return Promise.resolve();
  SQL_SCHOOL_CATALOG_SYNC_PROMISE = window.AulaBaseSqlApi.loadSchoolCatalog()
    .then((schools) => {
      const names = schools.map((entry) => normalizeSchoolName(entry?.name)).filter(Boolean);
      if (names.length) {
        mergeSchoolsIntoCatalog(names);
        renderSchoolSuggestions();
      }
      SQL_SCHOOL_CATALOG_SYNCED = true;
    })
    .catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo cargar el catalogo de escuelas', error);
    })
    .finally(() => {
      SQL_SCHOOL_CATALOG_SYNC_PROMISE = null;
    });
  return SQL_SCHOOL_CATALOG_SYNC_PROMISE;
}
// Garantiza que exista un catálogo de escuelas útil aunque la persistencia venga vacía.
function ensureSchoolCatalog() {
  mergeSchoolsIntoCatalog([]);
  syncSchoolCatalogFromSql();
}
// Construye la llave de almacenamiento usada para recordar metadatos SQL por usuario.
function buildSqlStateMetaStorageKey(userId = '') {
  return `aulabase:sql-state-meta:${String(userId || 'anon').trim() || 'anon'}`;
}
// Lee los metadatos SQL guardados localmente para saber qué entidad estaba sincronizada.
function readSqlStateMeta() {
  const userId = String(S.sessionUserId || 'anon').trim() || 'anon';
  if (SQL_STATE_META_CACHE.userId === userId && SQL_STATE_META_CACHE.data) {
    return SQL_STATE_META_CACHE.data;
  }
  let parsed = { blocks: {} };
  try {
    const raw = window.localStorage.getItem(buildSqlStateMetaStorageKey(userId));
    if (raw) {
      const candidate = JSON.parse(raw);
      if (candidate && typeof candidate === 'object') parsed = candidate;
    }
  } catch (_) {}
  if (!parsed.blocks || typeof parsed.blocks !== 'object') parsed.blocks = {};
  SQL_STATE_META_CACHE = { userId, data: parsed };
  return parsed;
}
// Persiste los metadatos SQL locales cuando cambia la entidad o el contexto sincronizado.
function writeSqlStateMeta(meta) {
  const userId = String(S.sessionUserId || 'anon').trim() || 'anon';
  const normalized = meta && typeof meta === 'object' ? meta : { blocks: {} };
  if (!normalized.blocks || typeof normalized.blocks !== 'object') normalized.blocks = {};
  SQL_STATE_META_CACHE = { userId, data: normalized };
  try {
    window.localStorage.setItem(buildSqlStateMetaStorageKey(userId), JSON.stringify(normalized));
  } catch (_) {}
}
// Aplica un parche puntual a los metadatos SQL locales sin sobrescribir el resto.
function patchSqlStateMeta(blockKey, patch = {}) {
  const meta = readSqlStateMeta();
  meta.blocks[blockKey] = {
    ...(meta.blocks[blockKey] || {}),
    ...(patch || {}),
  };
  writeSqlStateMeta(meta);
  return meta.blocks[blockKey];
}
// Clona un payload SQL para evitar mutaciones accidentales cuando se prepara una sincronización.
function cloneSqlPayload(payload, fallback) {
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch (_) {
    return fallback;
  }
}
// Convierte un payload SQL a una cadena segura para comparaciones o almacenamiento local.
function serializeSqlStatePayload(payload) {
  try {
    return JSON.stringify(payload || {});
  } catch (_) {
    return '';
  }
}
// Devuelve el contexto SQL actual de la sesión, incluyendo escuela, usuario y periodo.
function getSqlStateContext() {
  const localUser = getLocalSessionUser();
  const authUser = Array.isArray(S.authUsers) ? S.authUsers.find((user) => user.id === S.sessionUserId) : null;
  const email = String(S.profile?.email || localUser?.email || authUser?.email || '').trim().toLowerCase();
  const schoolName = normalizeSchoolName(S.profile?.inst || '');
  if (!email || !schoolName) return null;
  return {
    email,
    schoolName,
    firebaseUid: S.sessionUserId || '',
    displayName: String(S.profile?.name || S.sessionUserName || localUser?.name || '').trim(),
    phone: String(S.profile?.phone || '').trim(),
    academicYear: String(S.profile?.year || S.schoolYear?.name || '').trim(),
    timezone: String(S.profile?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo').trim(),
    role: String(S.profile?.role || 'Docente').trim(),
  };
}
// Garantiza que exista contexto académico SQL antes de guardar o leer datos dependientes de la cuenta.
async function ensureSqlAcademicContext() {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return null;
  const context = getSqlStateContext();
  if (!context) return null;
  const cacheKey = `${context.email}::${context.schoolName}::${context.firebaseUid || ''}`;
  if (SQL_ACADEMIC_CONTEXT_CACHE.key === cacheKey && SQL_ACADEMIC_CONTEXT_CACHE.data) {
    return SQL_ACADEMIC_CONTEXT_CACHE.data;
  }
  try {
    const result = await window.AulaBaseSqlApi.syncProfile(context);
    const resolved = {
      ...context,
      userId: result?.user?.id || '',
      schoolId: result?.school?.id || '',
      school: result?.school || null,
      user: result?.user || null,
    };
    if (resolved.school?.name) {
      mergeSchoolsIntoCatalog([resolved.school.name]);
    }
    SQL_ACADEMIC_CONTEXT_CACHE = { key: cacheKey, data: resolved };
    return resolved;
  } catch (error) {
    console.warn('[AulaBase][sql-api] No se pudo resolver el contexto academico SQL', error);
    return null;
  }
}
// Normaliza un estado de asistencia para que se almacene siempre con las mismas etiquetas.
function normalizeSqlAttendanceStatus(status = '') {
  const code = String(status || '').trim().toUpperCase();
  if (!code) return '';
  if (['P', 'A', 'E', 'R', 'T'].includes(code)) return code;
  if (/^(PRESENTE|PRESENTE|ASISTI|P)$/i.test(code)) return 'P';
  if (/^(AUSENTE|A)$/i.test(code)) return 'A';
  if (/^(EXCUSA|EXCUSA|E)$/i.test(code)) return 'E';
  if (/^(RETIRADO|R)$/i.test(code)) return 'R';
  if (/^(TARDE|T)$/i.test(code)) return 'T';
  return '';
}
// Convierte filas de asistencia SQL en un snapshot compacto que la UI pueda reutilizar.
function buildSqlAttendanceSnapshot(rows = []) {
  const monthMap = new Map();
  const sectionMonthMap = new Map();
  (rows || []).forEach((row) => {
    const sectionId = String(row?.section_id || '').trim();
    const studentId = String(row?.student_id || '').trim();
    const date = String(row?.attendance_date || '').slice(0, 10);
    if (!sectionId || !studentId || !date) return;
    const monthKey = date.slice(0, 7);
    const sectionMonthKey = `${sectionId}::${monthKey}`;
    if (!sectionMonthMap.has(sectionMonthKey)) {
      sectionMonthMap.set(sectionMonthKey, {
        sectionId,
        monthKey,
        rows: [],
        daySet: new Set(),
      });
    }
    const bucket = sectionMonthMap.get(sectionMonthKey);
    bucket.rows.push(row);
    bucket.daySet.add(date.slice(8, 10).replace(/^0/, '') || '0');
    const rowKey = `${sectionMonthKey}::${studentId}`;
    if (!monthMap.has(rowKey)) {
      monthMap.set(rowKey, {
        sectionId,
        monthKey,
        studentId,
        codes: new Map(),
      });
    }
    monthMap.get(rowKey).codes.set(date.slice(8, 10).replace(/^0/, '') || '0', normalizeSqlAttendanceStatus(row?.status || ''));
  });

  const records = {};
  sectionMonthMap.forEach((entry) => {
    const sectionRecords = records[entry.sectionId] || {};
    const record = typeof createAttendanceV2MonthRecord === 'function'
      ? createAttendanceV2MonthRecord()
      : { slotDays: [], slotMeta: [], studentCodes: {}, retiredCarryOverrides: {}, retiredPolicy: 'until-retirement', scheduleLinked: false, visibleCount: 1, __normalized: true };
    const dayList = Array.from(entry.daySet).map((value) => String(value || '').trim()).filter(Boolean).sort((a, b) => Number(a) - Number(b));
    record.slotDays = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY || 96 }, (_, idx) => dayList[idx] || '');
    record.slotMeta = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY || 96 }, () => (typeof createAttendanceV2SlotMeta === 'function' ? createAttendanceV2SlotMeta() : { type: '', reason: '' }));
    record.studentCodes = {};
    record.retiredCarryOverrides = {};
    record.retiredPolicy = 'until-retirement';
    record.scheduleLinked = false;
    record.visibleCount = Math.max(1, dayList.length);
    // Gestiona estudiante rows.
    const studentRows = (rows || []).filter((row) => String(row?.section_id || '').trim() === entry.sectionId && String(row?.attendance_date || '').slice(0, 7) === entry.monthKey);
    const byStudent = new Map();
    studentRows.forEach((row) => {
      const studentId = String(row?.student_id || '').trim();
      const day = String(row?.attendance_date || '').slice(8, 10).replace(/^0/, '') || '';
      if (!studentId || !day) return;
      if (!byStudent.has(studentId)) byStudent.set(studentId, new Map());
      byStudent.get(studentId).set(day, normalizeSqlAttendanceStatus(row?.status || ''));
    });
    byStudent.forEach((codes, studentId) => {
      record.studentCodes[studentId] = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY || 96 }, (_, idx) => {
        const day = dayList[idx];
        return day ? (codes.get(day) || '') : '';
      });
    });
    record.__normalized = true;
    sectionRecords[entry.monthKey] = record;
    records[entry.sectionId] = sectionRecords;
  });

  return { records };
}
// Aplica en memoria el snapshot académico que viene desde SQL para hidratar la interfaz.
function applySqlAcademicSnapshot(snapshot = {}) {
  const grades = Array.isArray(snapshot.grades) ? snapshot.grades : [];
  const sections = Array.isArray(snapshot.sections) ? snapshot.sections : [];
  const students = Array.isArray(snapshot.students) ? snapshot.students : [];
  const evaluations = Array.isArray(snapshot.evaluations) ? snapshot.evaluations : [];
  const attendance = snapshot.attendance && typeof snapshot.attendance === 'object' ? snapshot.attendance : [];

  if (!grades.length && !sections.length && !students.length && !evaluations.length && (!Array.isArray(attendance) || !attendance.length)) {
    return false;
  }

  const normalizedGrades = grades.map((row) => ({
    id: String(row?.id || '').trim(),
    schoolId: String(row?.school_id || '').trim(),
    educationLevel: String(row?.education_level || '').trim() || 'Primaria',
    name: String(row?.name || '').trim(),
    gradeLevel: Number.isFinite(Number(row?.ordinal)) ? Number(row.ordinal) : parseGradeLevel(String(row?.name || '').trim()),
    ordinal: Number.isFinite(Number(row?.ordinal)) ? Number(row.ordinal) : null,
    subjectName: '',
    sections: [],
  })).filter((grade) => grade.id && grade.name);

  const gradeById = new Map(normalizedGrades.map((grade) => [grade.id, grade]));
  const normalizedSections = sections.map((row) => {
    const gradeId = String(row?.grade_id || '').trim();
    const grade = gradeById.get(gradeId) || null;
    const sectionName = String(row?.name || '').trim();
    return {
      id: String(row?.id || '').trim(),
      schoolId: String(row?.school_id || '').trim(),
      gradeId,
      grado: grade?.name || '',
      gradeLevel: grade?.gradeLevel || parseGradeLevel(grade?.name || ''),
      sec: sectionName,
      sectionLetter: parseSection(sectionName),
      materia: String(row?.subject_name || '').trim() || 'General',
      area: String(row?.subject_area || '').trim(),
      room: '',
      teacherUserId: String(row?.teacher_user_id || '').trim() || null,
    };
  }).filter((section) => section.id && section.gradeId);

  normalizedSections.forEach((section) => {
    const grade = gradeById.get(section.gradeId);
    if (!grade) return;
    grade.sections = grade.sections || [];
    grade.sections.push({
      id: section.id,
      name: section.sec,
      sectionLetter: section.sectionLetter,
      materia: section.materia,
      area: section.area,
      room: section.room || '',
    });
  });

  const sectionById = new Map(normalizedSections.map((section) => [section.id, section]));
  const normalizedStudents = students.map((row) => {
    const section = sectionById.get(String(row?.section_id || '').trim()) || null;
    const firstName = String(row?.first_name || '').trim();
    const middleName = String(row?.middle_name || '').trim();
    const lastName = String(row?.last_name || '').trim();
    return {
      id: String(row?.id || '').trim(),
      schoolId: String(row?.school_id || '').trim(),
      gradeId: String(row?.grade_id || '').trim() || section?.gradeId || null,
      courseId: String(row?.section_id || '').trim(),
      sectionId: String(row?.section_id || '').trim(),
      seccionId: String(row?.section_id || '').trim(),
      nombre: firstName,
      apellido: [middleName, lastName].filter(Boolean).join(' ').trim() || lastName,
      matricula: String(row?.enrollment_code || '').trim(),
      middleName: middleName || null,
      birthDate: String(row?.birth_date || '').trim() || null,
      status: String(row?.status || '').trim() || 'active',
      gradeLevel: section?.gradeLevel || parseGradeLevel(section?.grado || ''),
      photoUrl: '',
    };
  }).filter((student) => student.id && student.courseId);

  const normalizedAttendance = Array.isArray(attendance) ? buildSqlAttendanceSnapshot(attendance) : { records: {} };
  const normalizedEvaluations = buildEvaluationsSnapshot(evaluations);
  const normalizedNotasByPeriod = buildNotasByPeriodFromEvaluations(evaluations);
  const loadedAttendanceSections = normalizedAttendance?.records && typeof normalizedAttendance.records === 'object'
    ? Object.keys(normalizedAttendance.records)
    : [];
  const loadedAttendanceMonths = loadedAttendanceSections.flatMap((sectionId) => Object.keys(normalizedAttendance.records[sectionId] || {}));

  S.grades = normalizedGrades;
  S.secciones = normalizedSections;
  S.estudiantes = normalizedStudents;
  if (normalizedEvaluations.length) {
    S.evaluations = normalizedEvaluations;
    S.notasByPeriod = normalizedNotasByPeriod;
  } else {
    if (!Array.isArray(S.evaluations)) S.evaluations = [];
    if (!S.notasByPeriod || typeof S.notasByPeriod !== 'object') S.notasByPeriod = {};
  }
  if (normalizedAttendance?.records && Object.keys(normalizedAttendance.records).length) {
    const nextMonthKey = loadedAttendanceMonths[0] || S.attendance?.monthKey || getCurrentMonthKey();
    S.attendance = {
      ...(S.attendance && typeof S.attendance === 'object' ? S.attendance : { monthKey: getCurrentMonthKey(), records: {} }),
      monthKey: nextMonthKey,
      records: normalizedAttendance.records,
    };
  } else if (!S.attendance || typeof S.attendance !== 'object') {
    S.attendance = { monthKey: getCurrentMonthKey(), records: {} };
  }
  rebuildAcademicHelpers();
  ensurePeriodsAndYear();
  ensurePeriodBuckets(S.activePeriodId || 'P1');
  if (!normalizedGrades.some((grade) => grade.id === S.activeGradeId)) {
    S.activeGradeId = normalizedGrades[0]?.id || null;
  }
  if (!normalizedSections.some((section) => section.id === S.activeGroupId)) {
    S.activeGroupId = normalizedSections[0]?.id || null;
    S.activeCourseId = S.activeGroupId;
  }
  ensureStudentDirectory();
  return true;
}
// Cierra la sesión de autenticación y limpia la navegación para volver al acceso.
async function logoutAuth() {
  try {
    if (typeof stopCloudStateSync === 'function') stopCloudStateSync();
    if (typeof window.EduGestCloud?.logout === 'function') {
      await window.EduGestCloud.logout();
    }
  } catch (error) {
    console.error('[EduGest][auth] Cloud logout failed:', error);
    // No detenemos el logout local por un fallo en la nube
  }

  replaceState();
  cloudStateHydrated = false;
  clearSessionWindow();
  persist();
  resetSidebarUser();
  closeProfileMenu();
  forceCloseM('m-terms');
  closeM('m-education-section');
  closeM('m-setup');
  clearDeviceVerificationFlow();
  openM('m-auth');
  setAuthMode('login');
  applyEducationSectionTheme('');
  go('dashboard');
  toast('Sesión cerrada');
}
// Cancela el flujo de configuración inicial y vuelve al registro o al acceso según corresponda.
function cancelSetup() {
  if (requiresProfileSetupCompletion()) {
    const shouldLogout = window.confirm('Aun no has completado tu perfil. ¿Deseas cerrar sesión?');
    if (!shouldLogout) return;
    logoutAuth();
    return;
  }
  closeM('m-setup');
  go('dashboard');
}
// Devuelve el flujo de setup al estado de registro para que el usuario no pierda contexto.
function returnSetupToRegister() {
  if (requiresProfileSetupCompletion()) {
    const shouldLogout = window.confirm('Aun no has completado tu perfil. ¿Deseas cerrar sesión?');
    if (!shouldLogout) return;
    logoutAuth();
    return;
  }
  closeM('m-setup');
  openM('m-auth');
  setAuthMode('register');
}
// Decide si la transición entre login, registro y setup puede animarse sin forzar reducción de movimiento.
function canAnimateAuthHandoff() {
  return !(S.preferences?.authLoginAnimation === false || S.preferences?.animations === false);
}
// Abre el selector obligatorio de sección educativa cuando la cuenta aún no tiene contexto académico.
function openEducationSectionSetup(options = {}) {
  EDUCATION_SECTION_MODAL_CONTEXT.fromAuth = !!options.fromAuth;
  const savedEducationSections = getActiveEducationSections();
  const isEducationSectionLocked = false;
  SETUP_FLOW.educationSections = savedEducationSections.length ? [...savedEducationSections] : [];
  SETUP_FLOW.educationSection = SETUP_FLOW.educationSections[0] || '';
  SETUP_FLOW.educationSectionLocked = isEducationSectionLocked;
  SETUP_FLOW.educationSectionConfirmed = false;
  SETUP_FLOW.educationSectionStep = SETUP_FLOW.educationSections.length ? 'confirm' : 'select';
  closeM('m-setup');
  // Abre abrir sección modal.
  const openSectionModal = () => {
    openM('m-education-section');
    const modal = document.getElementById('m-education-section');
    const select = document.getElementById('s-education-section');
    if (select && !isEducationSectionLocked) select.value = '';
    if (modal && !isEducationSectionLocked) {
      modal.classList.add('hover-suppressed');
      modal.classList.add('opening-guard');
      modal.querySelectorAll('.edu-section-option').forEach((button) => button.blur());
      if (modal._educationHoverTimeout) window.clearTimeout(modal._educationHoverTimeout);
      // Gestiona release hover.
      const releaseHover = () => {
        modal.classList.remove('hover-suppressed');
        modal.classList.remove('opening-guard');
        modal.removeEventListener('pointerdown', releaseHover);
        modal.removeEventListener('keydown', releaseHover);
        modal._educationHoverTimeout = null;
      };
      modal.addEventListener('pointerdown', releaseHover, { once: true });
      modal.addEventListener('keydown', releaseHover, { once: true });
      modal._educationHoverTimeout = window.setTimeout(releaseHover, 450);
    }
    if (modal && options.animateFromAuth && canAnimateAuthHandoff()) {
      modal.classList.add('is-auth-handoff');
      if (modal._authHandoffTimeout) window.clearTimeout(modal._authHandoffTimeout);
      modal._authHandoffTimeout = window.setTimeout(() => {
        modal.classList.remove('is-auth-handoff');
        modal._authHandoffTimeout = null;
      }, 420);
    }
    renderSetupEducationSectionFlow();
  };
  if (options.animateFromAuth) {
    const authModal = document.getElementById('m-auth');
    const shouldAnimate = canAnimateAuthHandoff() && authModal?.classList?.contains('open');
    if (shouldAnimate) {
      authModal.classList.add('is-handing-off');
      window.setTimeout(() => {
        authModal.classList.remove('is-handing-off');
        closeM('m-auth');
        openSectionModal();
      }, 170);
      return;
    }
    closeM('m-auth');
  }
  openSectionModal();
}
// Indica si el usuario ya confirmó su sección educativa obligatoria.
function hasConfirmedEducationSection() {
  return getActiveEducationSections().length > 0;
}
// Verifica si la cuenta actual necesita completar la sección educativa antes de entrar al panel.
function requiresEducationSectionSelection() {
  return !!S.sessionUserId && isProfileSetupComplete() && !hasConfirmedEducationSection();
}
// Extrae solo dígitos de un teléfono para validaciones y normalización.
function extractPhoneDigits(raw = '') {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1, 11);
  return digits.slice(0, 10);
}
// Normaliza el teléfono a un formato estable y reutilizable en formularios.
function normalizePhoneValue(raw = '') {
  const digits = extractPhoneDigits(raw);
  if (!digits) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}
// Comprueba si un teléfono tiene la cantidad mínima de dígitos útiles.
function phoneHasValidDigits(raw = '') {
  return extractPhoneDigits(raw).length === 10;
}
// Mantiene el campo de teléfono legible mientras la persona escribe.
function handlePhoneInput(inputEl) {
  if (!inputEl) return;
  const caretAtEnd = inputEl.selectionStart === inputEl.value.length;
  inputEl.value = normalizePhoneValue(inputEl.value);
  if (caretAtEnd) inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
}
// Construye el nombre completo del perfil a partir de nombres separados.
function buildProfileFullName(firstName = '', lastName = '') {
  return [String(firstName || '').trim(), String(lastName || '').trim()].filter(Boolean).join(' ').trim();
}
// Comprueba si el perfil ya tiene los datos mínimos para entrar al panel sin pasar por setup.
function isProfileSetupComplete(profile = S.profile) {
  const data = profile && typeof profile === 'object' ? profile : {};
  let firstName = String(data.firstName || '').trim();
  let lastName = String(data.lastName || '').trim();
  
  // Retrocompatibilidad: Si existen perfiles antiguos que solo tienen 'name'
  const legacyName = String(data.name || S.sessionUserName || '').trim();
  if (legacyName && !firstName && !lastName) {
    const parts = legacyName.split(' ');
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
    // Auto-migrar en memoria para evitar fallos futuros
    if (profile === S.profile) {
      S.profile.firstName = firstName;
      S.profile.lastName = lastName;
    }
  }

  const name = String(data.name || buildProfileFullName(firstName, lastName) || legacyName).trim();
  const role = String(data.role || '').trim();
  const inst = String(data.inst || '').trim();
  
  // No bloqueamos por teléfono, año o periodo, ya que son datos que se pueden completar después.
  // Solo requerimos nombre, rol e institución para entrar al dashboard.
  return !!name && (!!firstName || !!lastName) && !!role && !!inst;
}
// Indica si la cuenta sigue obligada a terminar el setup de perfil.
function requiresProfileSetupCompletion() {
  return !!S.sessionUserId && !isProfileSetupComplete();
}
// Verifica si el perfil ya aceptó los términos requeridos para operar la cuenta.
function isProfileTermsAccepted(profile = S.profile) {
  const data = profile && typeof profile === 'object' ? profile : {};
  const accepted = data.termsAccepted === true;
  const hasDates = !!String(data.termsAcceptedAt || '').trim() && !!String(data.privacyAcceptedAt || '').trim();
  if (accepted && hasDates && String(data.termsVersion || '').trim() === TERMS_VERSION) return true;
  // Gestiona local usuario.
  const localUser = (S.authUsers || []).find((entry) => entry.id === S.sessionUserId);
  if (!localUser) return false;
  const localAccepted = localUser.termsAccepted === true;
  const localHasDates = !!String(localUser.termsAcceptedAt || '').trim() && !!String(localUser.privacyAcceptedAt || '').trim();
  if (!(localAccepted && localHasDates && String(localUser.termsVersion || '').trim() === TERMS_VERSION)) return false;
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  S.profile.termsAccepted = true;
  S.profile.termsVersion = TERMS_VERSION;
  S.profile.termsAcceptedAt = S.profile.termsAcceptedAt || localUser.termsAcceptedAt || nowIso();
  S.profile.privacyAcceptedAt = S.profile.privacyAcceptedAt || localUser.privacyAcceptedAt || nowIso();
  return true;
}
// Comprueba si la pantalla todavía debe obligar a aceptar términos.
function requiresTermsAcceptance() {
  // Request: terms are accepted inline in register form; do not force terms modal.
  return false;
}
// Indica si el modal de términos obligatorios sigue visible.
function isMandatoryTermsModalOpen() {
  const modal = document.getElementById('m-terms');
  return !!modal?.classList?.contains('open');
}
// Fuerza la aceptación de términos cuando el acceso aún no está completo.
function enforceMandatoryTermsAcceptance(showToast = false) {
  if (!requiresTermsAcceptance()) return false;
  if (!isMandatoryTermsModalOpen()) openM('m-terms');
  if (showToast) toast('Debes aceptar los términos para continuar.', true);
  return true;
}
// Indica si el modal de setup sigue abierto.
function isMandatorySetupModalOpen() {
  const modal = document.getElementById('m-setup');
  return !!modal?.classList?.contains('open');
}
// Fuerza que el usuario complete el setup antes de seguir al panel.
function enforceMandatorySetup(showToast = false) {
  if (!requiresProfileSetupCompletion()) return false;
  if (!isMandatorySetupModalOpen()) openM('m-setup', { fromAuth: true });
  if (showToast) toast('Debes completar tu perfil para continuar.', true);
  return true;
}
// Indica si el modal de sección educativa está abierto.
function isMandatoryEducationModalOpen() {
  const modal = document.getElementById('m-education-section');
  return !!modal?.classList?.contains('open');
}
// Bloquea el acceso hasta que la sección educativa obligatoria quede elegida.
function enforceMandatoryEducationSelection(showToast = false) {
  if (!requiresEducationSectionSelection()) return false;
  if (!isMandatoryEducationModalOpen()) openEducationSectionSetup({ fromAuth: true });
  if (showToast) toast('Debes confirmar tus niveles educativos para continuar.', true);
  return true;
}
// Limpia el error visual relacionado con la aceptación de términos.
function clearTermsAcceptanceError() {
  const error = document.getElementById('terms-accept-error');
  const checkbox = document.getElementById('terms-accept-check');
  if (error) {
    error.hidden = true;
    error.textContent = '';
  }
  checkbox?.removeAttribute('aria-invalid');
}
// Muestra un error claro cuando el flujo de aceptación de términos falla o queda incompleto.
function showTermsAcceptanceError(message) {
  const error = document.getElementById('terms-accept-error');
  const checkbox = document.getElementById('terms-accept-check');
  if (error) {
    error.hidden = false;
    error.textContent = String(message || '').trim();
  }
  if (checkbox) checkbox.setAttribute('aria-invalid', 'true');
}
// Marca localmente que el usuario ya aceptó términos para evitar repetir el bloqueo.
function markTermsAcceptedOnLocalUser() {
  const localUser = S.authUsers.find((entry) => entry.id === S.sessionUserId);
  if (!localUser) return;
  localUser.termsAccepted = true;
  localUser.termsVersion = TERMS_VERSION;
  localUser.termsAcceptedAt = S.profile?.termsAcceptedAt || nowIso();
  localUser.privacyAcceptedAt = S.profile?.privacyAcceptedAt || nowIso();
  persistLocalAuthUsers();
}
// Persiste la aceptación de términos y cierra el modal una vez que el usuario confirma.
async function confirmTermsAcceptance() {
  const checkbox = document.getElementById('terms-accept-check');
  if (!checkbox?.checked) {
    showTermsAcceptanceError('Debes aceptar los términos y la polética para continuar.');
    toast('Acepta los términos para continuar', true);
    return;
  }
  clearTermsAcceptanceError();
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  ensureIndividualLicenseModel();
  const acceptedAt = nowIso();
  S.profile.termsAccepted = true;
  S.profile.termsVersion = TERMS_VERSION;
  S.profile.termsAcceptedAt = acceptedAt;
  S.profile.privacyAcceptedAt = acceptedAt;
  markTermsAcceptedOnLocalUser();
  persist();
  forceCloseM('m-terms');
  forceCloseM('m-auth');
  TERMS_ACCEPTANCE_FLOW.revokeOnDecline = false;
  if (TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept || requiresProfileSetupCompletion()) {
    openM('m-setup', { fromAuth: true });
    TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept = false;
    return;
  }
  TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept = false;
  if (requiresEducationSectionSelection()) {
    openEducationSectionSetup({ fromAuth: true });
    return;
  }
  go('dashboard');
  updateSBUser();
  toast('Términos aceptados');
}
// Cancela la aceptación de términos y devuelve el flujo al estado correcto.
async function cancelTermsAcceptance() {
  const mustRevoke = TERMS_ACCEPTANCE_FLOW.revokeOnDecline === true;
  TERMS_ACCEPTANCE_FLOW.revokeOnDecline = false;
  TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept = false;
  if (!mustRevoke) {
    await logoutAuth();
    return;
  }
  const rejectingUserId = S.sessionUserId;
  try {
    if (canUseCloudAuth()) {
      await window.EduGestCloud.deleteCurrentUser();
    }
  } catch (error) {
    console.error('[EduGest][auth] No se pudo eliminar la cuenta nueva tras rechazo de términos', error);
  }
  if (rejectingUserId) {
    S.authUsers = (S.authUsers || []).filter((entry) => entry.id !== rejectingUserId);
    persistLocalAuthUsers();
  }
  await logoutAuth();
  toast('Cuenta cancelada por no aceptar los términos.');
}
// Cancela el setup de sección educativa sin romper el estado de la sesión.
function cancelEducationSectionSetup() {
  if (requiresEducationSectionSelection()) {
    const shouldLogout = window.confirm('Aun no has confirmado tu nivel educativo. ¿Deseas cerrar sesión?');
    if (!shouldLogout) return;
    logoutAuth();
    return;
  }
  closeM('m-education-section');
  if (EDUCATION_SECTION_MODAL_CONTEXT.fromAuth) {
    openM('m-auth');
    setAuthMode('register');
    return;
  }
  go('dashboard');
}
// Guarda la sección educativa elegida para que el acceso quede coherente en el siguiente arranque.
function persistEducationSectionSelection(section) {
  const normalizedSections = normalizeEducationSections(section);
  if (!normalizedSections.length) return false;
  const primarySection = normalizedSections[0];
  const currentProfile = S.profile && typeof S.profile === 'object' ? S.profile : {};
  S.profile = {
    ...currentProfile,
    educationSection: primarySection,
    educationSections: normalizedSections,
    educationSectionLocked: false,
    teachingProfile: {
      ...(currentProfile.teachingProfile && typeof currentProfile.teachingProfile === 'object' ? currentProfile.teachingProfile : {}),
      center: String(currentProfile.inst || '').trim(),
      educationLevels: normalizedSections,
      areas: uniqueValues(currentProfile.teachingProfile?.areas || []),
      grades: uniqueValues(currentProfile.teachingProfile?.grades || []),
      subjects: uniqueValues(currentProfile.subjects || currentProfile.teachingProfile?.subjects || []),
    },
  };
  SETUP_FLOW.educationSections = [...normalizedSections];
  SETUP_FLOW.educationSection = primarySection;
  SETUP_FLOW.educationSectionLocked = false;
  SETUP_FLOW.educationSectionConfirmed = true;
  SETUP_FLOW.educationSectionStep = 'confirm';
  ensureIndividualLicenseModel();
  applyEducationSectionTheme(normalizedSections);
  persist();
  return true;
}

// Da formato visual a la matrícula antes de mostrarla o guardarla.
function formatMatricula(raw) {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 7);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0,2)}-${digits.slice(2)}`;
  return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6,7)}`;
}
// Normaliza la matrícula eliminando caracteres de separación y dejando solo la forma canónica.
function normalizeMatricula(raw) {
  return formatMatricula(raw).replace(/\D/g, '');
}
// Comprueba si una matrícula tiene la longitud y la forma mínimas esperadas.
function isValidMatricula(raw) {
  return /^\d{2}-\d{4}-\d$/.test(String(raw || '').trim());
}
// Construye una clave estable para indexar un estudiante en el directorio local.
function studentDirectoryKey(student) {
  const mat = formatMatricula(student?.matricula || '');
  if (mat) return `mat:${mat}`;
  const nombre = String(student?.nombre || '').trim().toLowerCase();
  const apellido = String(student?.apellido || '').trim().toLowerCase();
  return `name:${nombre}|${apellido}`;
}
// Construye la etiqueta visible de un estudiante recordado para el selector rápido.
function buildRememberedStudentLabel(student) {
  const fullName = [student?.nombre, student?.apellido].filter(Boolean).join(' ').trim();
  const mat = formatMatricula(student?.matricula || '');
  return mat ? `${fullName} - ${mat}` : fullName;
}
// Genera una imagen de avatar simple en base al nombre del estudiante.
function buildStudentAvatarDataUrl(name = '') {
  const clean = String(name || '').trim();
  const initials = clean
    ? clean.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    : 'EG';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stop-color="#d8ecff"/><stop offset="100%" stop-color="#9ec8f5"/></linearGradient></defs><rect width="160" height="160" rx="28" fill="url(#g)"/><text x="50%" y="54%" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="700" fill="#24466c">${escapeHtml(initials)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
// Escribe una foto de estudiante en el campo visual del formulario.
function setStudentPhotoField(prefix, photoUrl = '', fullName = '') {
  const hidden = document.getElementById(`${prefix}-photo-data`);
  const preview = document.getElementById(`${prefix}-photo-preview`);
  const safeUrl = String(photoUrl || '').trim();
  if (hidden) hidden.value = safeUrl;
  if (preview) preview.src = safeUrl || buildStudentAvatarDataUrl(fullName);
}
// Limpia la foto temporal del formulario de estudiantes.
function clearStudentPhotoField(prefix) {
  const fullName = [document.getElementById(`${prefix}-nom`)?.value, document.getElementById(`${prefix}-ape`)?.value]
    .filter(Boolean)
    .join(' ')
    .trim();
  const fileInput = document.getElementById(`${prefix}-photo-file`);
  if (fileInput) fileInput.value = '';
  setStudentPhotoField(prefix, '', fullName);
}
// Procesa un archivo o URL de foto y la aplica al formulario correspondiente.
function handleStudentPhotoInput(input, prefix) {
  const file = input?.files?.[0];
  if (!file) {
    clearStudentPhotoField(prefix);
    return;
  }
  if (!String(file.type || '').startsWith('image/')) {
    toast('Selecciona una imagen válida', true);
    input.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    toast('La foto no debe superar 2 MB', true);
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const fullName = [document.getElementById(`${prefix}-nom`)?.value, document.getElementById(`${prefix}-ape`)?.value]
      .filter(Boolean)
      .join(' ')
      .trim();
    setStudentPhotoField(prefix, String(reader.result || ''), fullName);
  };
  reader.onerror = () => {
    toast('No se pudo leer la imagen seleccionada', true);
    input.value = '';
  };
  reader.readAsDataURL(file);
}
// Obtiene las notas o desempeños de un estudiante para una sección o grupo concretos.
function getStudentPerformanceEntries(studentId, sectionOrId) {
  const sectionIds = getRosterSectionIds(sectionOrId);
  return sectionIds
    .map((sectionId) => {
      const sec = S.secciones.find((s) => s.id === sectionId);
      if (!sec) return null;
      const grade = S.grades.find((g) => g.id === sec.gradeId);
      const final = studentFinal(studentId, sectionId);
      const status = final===null ? 'Sin notas' : final>=75 ? 'Aprobado' : final>=60 ? 'En riesgo' : 'Reprobado';
      return {
        sectionId,
        subject: sec.materia || 'General',
        courseLabel: `${grade?.name || sec.grado || '?'} ${sec.sec || ''} ? ${sec.materia || 'General'}`.trim(),
        final,
        status,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.subject.localeCompare(b.subject, 'es', { sensitivity: 'base' }));
}
// Renderiza una lista compacta de métricas para mostrar rendimiento o notas del estudiante.
function renderStudentMetricList(entries = [], type = 'final') {
  if (!entries.length) return '?';
  return `<div class="student-view-metric-list">${
    entries.map((entry) => {
      const value = type === 'final'
        ? (entry.final === null ? '?' : String(entry.final))
        : entry.status;
      return `<div class="student-view-metric-item">
        <span class="student-view-metric-label">${escapeHtml(entry.subject)}</span>
        <span class="student-view-metric-value">${escapeHtml(value)}</span>
      </div>`;
    }).join('')
  }</div>`;
}
// Abre el selector de foto desde la vista pública del estudiante.
function openStudentViewPhotoPicker() {
  const stId = document.getElementById('sv-id')?.value || '';
  if (!stId) return;
  document.getElementById('sv-photo-file')?.click();
}
// Procesa la imagen elegida desde la vista del estudiante y la deja lista para guardar.
function handleStudentViewPhotoInput(input) {
  const file = input?.files?.[0];
  if (!file) return;
  if (!String(file.type || '').startsWith('image/')) {
    toast('Selecciona una imagen válida', true);
    input.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    toast('La foto no debe superar 2 MB', true);
    input.value = '';
    return;
  }
  const stId = document.getElementById('sv-id')?.value || '';
  const st = S.estudiantes.find((entry) => entry.id === stId);
  if (!st) {
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    st.photoUrl = String(reader.result || '').trim();
    const secId = st.sectionId || st.seccionId || st.courseId || '';
    upsertStudentDirectoryEntry(st, secId);
    persist();
    const fullName = `${st.nombre || ''} ${st.apellido || ''}`.trim();
    const photoEl = document.getElementById('sv-photo');
    if (photoEl) photoEl.src = st.photoUrl || buildStudentAvatarDataUrl(fullName);
    input.value = '';
    go('estudiantes');
    openViewStudent(st.id);
    toast('Foto actualizada');
  };
  reader.onerror = () => {
    toast('No se pudo leer la imagen seleccionada', true);
    input.value = '';
  };
  reader.readAsDataURL(file);
}
// Garantiza que el directorio local de estudiantes exista y tenga entradas coherentes.
function ensureStudentDirectory() {
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const map = new Map();
  let changed = false;
  S.studentDirectory.forEach((entry) => {
    if (!entry) return;
    const normalized = {
      nombre: String(entry.nombre || '').trim(),
      apellido: String(entry.apellido || '').trim(),
      matricula: formatMatricula(entry.matricula || ''),
      photoUrl: String(entry.photoUrl || '').trim(),
      lastSectionId: entry.lastSectionId || '',
      updatedAt: entry.updatedAt || Date.now(),
    };
    if (!normalized.nombre || !normalized.apellido) return;
    const key = studentDirectoryKey(normalized);
    if (!map.has(key)) map.set(key, normalized);
  });
  (S.estudiantes || []).forEach((student) => {
    const normalized = {
      nombre: String(student.nombre || '').trim(),
      apellido: String(student.apellido || '').trim(),
      matricula: formatMatricula(student.matricula || ''),
      photoUrl: String(student.photoUrl || '').trim(),
      lastSectionId: student.sectionId || student.seccionId || student.courseId || '',
      updatedAt: Date.now(),
    };
    if (!normalized.nombre || !normalized.apellido) return;
    const key = studentDirectoryKey(normalized);
    const previous = map.get(key);
    if (!previous || previous.nombre !== normalized.nombre || previous.apellido !== normalized.apellido || previous.matricula !== normalized.matricula || previous.lastSectionId !== normalized.lastSectionId) {
      map.set(key, normalized);
      changed = true;
    }
  });
  const next = Array.from(map.values()).sort((a, b) => {
    const left = `${a.apellido} ${a.nombre}`.trim();
    const right = `${b.apellido} ${b.nombre}`.trim();
    return left.localeCompare(right, 'es');
  });
  if (next.length !== S.studentDirectory.length) changed = true;
  S.studentDirectory = next;
  return changed;
}
// Inserta o actualiza una entrada del directorio de estudiantes usando el contexto de sección.
function upsertStudentDirectoryEntry(student, sectionId = '') {
  if (!student) return;
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const normalized = {
    nombre: String(student.nombre || '').trim(),
    apellido: String(student.apellido || '').trim(),
    matricula: formatMatricula(student.matricula || ''),
    photoUrl: String(student.photoUrl || '').trim(),
    lastSectionId: sectionId || student.sectionId || student.seccionId || student.courseId || '',
    updatedAt: Date.now(),
  };
  if (!normalized.nombre || !normalized.apellido) return;
  const key = studentDirectoryKey(normalized);
  const idx = S.studentDirectory.findIndex((entry) => studentDirectoryKey(entry) === key);
  if (idx >= 0) {
    S.studentDirectory[idx] = { ...S.studentDirectory[idx], ...normalized };
  } else {
    S.studentDirectory.push(normalized);
  }
  ensureStudentDirectory();
}
// Reconstruye el listado de estudiantes recordados para que la búsqueda rápida esté actualizada.
function refreshRememberedStudentOptions() {
  const list = document.getElementById('e-remembered-list');
  if (!list) return;
  ensureStudentDirectory();
  list.innerHTML = (S.studentDirectory || []).map((student) => {
    const label = buildRememberedStudentLabel(student);
    return `<option value="${escapeHtml(label)}"></option>`;
  }).join('');
}
// Busca un estudiante recordado por texto, matrícula o coincidencia parcial.
function findRememberedStudent(query) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return null;
  ensureStudentDirectory();
  return (S.studentDirectory || []).find((student) => {
    const label = buildRememberedStudentLabel(student).toLowerCase();
    const fullName = `${student.nombre} ${student.apellido}`.trim().toLowerCase();
    const mat = formatMatricula(student.matricula || '').toLowerCase();
    return label === needle || fullName === needle || mat === needle;
  }) || null;
}
// Completa automáticamente el formulario de estudiante a partir de una entrada recordada.
function fillStudentFormFromRemembered(student) {
  if (!student) return;
  const nom = document.getElementById('e-nom');
  const ape = document.getElementById('e-ape');
  const mat = document.getElementById('e-mat');
  const remembered = document.getElementById('e-remembered');
  if (nom) nom.value = student.nombre || '';
  if (ape) ape.value = student.apellido || '';
  if (mat) mat.value = formatMatricula(student.matricula || '');
  if (remembered) remembered.value = buildRememberedStudentLabel(student);
  setStudentPhotoField('e', student.photoUrl || '', `${student.nombre || ''} ${student.apellido || ''}`.trim());
}
// Aplica la selección del estudiante recordado al formulario activo.
function applyRememberedStudentSelection(value) {
  const student = findRememberedStudent(value);
  if (!student) return;
  fillStudentFormFromRemembered(student);
}
// Activa la máscara de matrícula para un input concreto.
function bindMatriculaMask(id) {
  const el = document.getElementById(id);
  if (!el || el.dataset.maskBound === '1') return;
  el.dataset.maskBound = '1';
  el.addEventListener('input', () => {
    const next = formatMatricula(el.value);
    if (el.value !== next) el.value = next;
  });
  el.addEventListener('blur', () => {
    el.value = formatMatricula(el.value);
  });
}
// Inicializa todos los campos de matrícula que estén presentes en la UI.
function setupMatriculaInputs() {
  bindMatriculaMask('e-mat');
  bindMatriculaMask('ee-mat');
}
// Construye la estructura vacía de un formulario de creación según su tipo.
function buildEmptyForm(type, context={}) {
  const ctxCourse = context.courseId || S.activeCourseId || S.activeGroupId || '';
  const sec = S.secciones.find(s=>s.id===ctxCourse);
  return {
    grade: {
      educationLevel: context.educationLevel || getActiveEducationSection() || '',
      name: context.name || '',
      sec: context.sec || '',
      area: context.area || '',
      materia: context.materia || '',
      room: context.room || '',
    },
    section: {gradeId: context.gradeId || sec?.gradeId || '', sec: context.sec || '', materia: context.materia || '', area: context.area || sec?.area || lessonPlanAreaFromGroup(sec) || '', room: context.room || sec?.room || ''},
    student: {nom:'', ape:'', mat:'', secId: ctxCourse || ''},
    activity: {nom:'', blq:'B1', tipo:'Práctica', pts:20, fecha:'', obs:''},
    template: {name:'', desc:''},
    user: {nom:'', email:'', rol:'Docente', secId:''},
  }[type];
}
// Devuelve las secciones disponibles para el grado activo o solicitado.
function sectionsForGrade(gradeId = S.activeGradeId) {
  if (!gradeId) return [];
  return sortCourses((S.secciones || []).filter(s=>s.gradeId===gradeId));
}
// Reinicia un formulario de creación sin perder el contexto académico necesario.
function resetForm(type, context={}) {
  const f = buildEmptyForm(type, context);
  if (!f) return;
  if (type==='grade') {
    renderGradeCreationOptions(f.educationLevel || '');
    renderGradeSectionOptions(f.sec || '');
    const areaEl = document.getElementById('gr-area');
    if (areaEl) areaEl.value = f.area || '';
    refreshGradeCurriculumForm(true);
    const mat=document.getElementById('gr-subject'); if(mat) mat.value = f.materia || '';
    const room=document.getElementById('gr-room'); if(room){ room.value=f.room || ''; room.placeholder='Ej. Aula 3A'; }
  }
  if (type==='section') {
    const sortedGrades = getSortedGrades();
    fillSel('sec-g', sortedGrades, g=>g.id, g=>g.name, f.gradeId, 'Selecciona grado');
    const sec=document.getElementById('sec-s'); if(sec){ sec.value=f.sec || ''; sec.placeholder='A, B, C...'; }
    const areaEl = document.getElementById('sec-area');
    if (areaEl) areaEl.value = f.area || '';
    refreshSectionCurriculumForm('sec', false);
    const mat=document.getElementById('sec-m'); if(mat) mat.value = f.materia || '';
    const room=document.getElementById('sec-room'); if(room){ room.value=f.room || ''; room.placeholder='Ej. Aula 3A'; }
  }
  if (type==='student') {
    const allowed = sectionsForGrade(S.activeGradeId);
    fillSel('e-sec', allowed, s=>s.id, s=>`${s.grado} ${s.sec} - ${s.materia}`, f.secId || allowed[0]?.id || '');
    refreshRememberedStudentOptions();
    const remembered=document.getElementById('e-remembered'); if(remembered){ remembered.value=''; remembered.placeholder='Busca por nombre o matricula'; }
    const n=document.getElementById('e-nom'); if(n){ n.value=''; n.placeholder='Nombre(s)'; }
    const a=document.getElementById('e-ape'); if(a){ a.value=''; a.placeholder='Apellido(s)'; }
    const m=document.getElementById('e-mat'); if(m){ m.value=''; m.placeholder='00-0000-0'; }
    clearStudentPhotoField('e');
  }
  if (type==='activity') {
    const n=document.getElementById('a-nom'); if(n){ n.value=''; n.placeholder='Ej. Presentación oral - Sec. 2'; }
    const b=document.getElementById('a-blq'); if(b) b.value=f.blq;
    const t=document.getElementById('a-tipo'); if(t) t.value=f.tipo;
    const p=document.getElementById('a-pts'); if(p) p.value=String(f.pts);
    const d=document.getElementById('a-fecha'); if(d) d.value='';
    const o=document.getElementById('a-obs'); if(o){ o.value=''; o.placeholder='Notas opcionales...'; }
  }
  if (type==='template') {
    const n=document.getElementById('tpl-name'); if(n){ n.value=''; n.placeholder='Ej. "P2 Secundaria (5×20)"'; }
    const d=document.getElementById('tpl-desc'); if(d){ d.value=''; d.placeholder='Descripción breve...'; }
  }
  if (type==='user') {
    const n=document.getElementById('u-nom'); if(n){ n.value=''; n.placeholder='Nombre completo'; }
    const e=document.getElementById('u-email'); if(e){ e.value=''; e.placeholder='correo@escuela.edu'; }
    const r=document.getElementById('u-rol'); if(r) r.value='Docente';
    fillSel('u-sec', sortCourses(getScopedSections()), s=>s.id, s=>`${s.grado} ${s.sec}`, f.secId, 'Todas');
  }
}
// Limpia todos los formularios de creación abiertos dentro de la interfaz.
function resetAllCreateForms() {
  resetForm('grade');
  resetForm('section');
  resetForm('student');
  resetForm('activity');
  resetForm('template');
  resetForm('user');
}
// Prepara un modal de creación justo antes de abrirlo.
function onOpenCreateModal(id, context={}) {
  setupMatriculaInputs();
  if (id==='m-grade') resetForm('grade', context);
  if (id==='m-sec') resetForm('section', context);
  if (id==='m-est') resetForm('student', context);
  if (id==='m-act') resetForm('activity');
  if (id==='m-tpl') resetForm('template');
  if (id==='m-usr') resetForm('user');
}
// Limpia el estado asociado a un modal cuando se cierra.
function onCloseModal(id) {
  if (['m-grade','m-sec','m-est','m-act','m-tpl','m-usr'].includes(id)) onOpenCreateModal(id);
}
// Renderiza el flujo completo de selección de sección educativa durante el onboarding.
function renderSetupEducationSectionFlow() {
  const title = document.getElementById('s-education-title');
  const selectStep = document.getElementById('s-education-step-select');
  const select = document.getElementById('s-education-section');
  const optionButtons = [...document.querySelectorAll('.edu-section-option')];
  const box = document.getElementById('s-education-confirm-box');
  const confirmTitle = document.getElementById('s-education-confirm-title');
  const copy = document.getElementById('s-education-confirm-copy');
  const confirmBtn = document.getElementById('s-education-confirm-btn');
  const closeBtn = document.getElementById('s-education-close-btn');
  if (!title || !selectStep || !select || !box || !confirmTitle || !copy || !confirmBtn) return;
  const selections = getSetupFlowEducationSections();
  const confirmed = !!SETUP_FLOW.educationSectionConfirmed;
  const locked = !!SETUP_FLOW.educationSectionLocked;
  const required = requiresEducationSectionSelection();
  const showConfirmStep = selections.length > 0;

  select.value = selections.join(',');
  select.disabled = locked || confirmed;
  optionButtons.forEach((button) => {
    const value = normalizeEducationSection(button.dataset.value || button.textContent || '');
    const isSelected = selections.includes(value);
    const isLocked = locked || confirmed;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('role', 'checkbox');
    button.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    button.disabled = isLocked;
    button.tabIndex = isLocked ? -1 : 0;
    if (isLocked) {
      button.setAttribute('aria-disabled', 'true');
    } else {
      button.removeAttribute('aria-disabled');
    }
  });
  if (selections.length === 1) {
    const selectedButton = optionButtons.find((button) => button.classList.contains('is-selected'));
    if (selectedButton) {
      const selectedStyles = window.getComputedStyle(selectedButton);
      const selectedAccent = String(selectedStyles.getPropertyValue('--option-accent') || '').trim();
      const selectedInk = String(selectedStyles.getPropertyValue('--option-accent-ink') || '').trim();
      const selectedShadow = String(selectedStyles.getPropertyValue('--option-accent-shadow') || '').trim();
      if (selectedAccent) {
        confirmBtn.style.setProperty('--confirm-btn-bg', selectedAccent);
        confirmBtn.style.setProperty('--confirm-btn-hover', `color-mix(in srgb, ${selectedAccent} 88%, #000 12%)`);
      } else {
        confirmBtn.style.removeProperty('--confirm-btn-bg');
        confirmBtn.style.removeProperty('--confirm-btn-hover');
      }
      if (selectedInk) confirmBtn.style.setProperty('--confirm-btn-ink', selectedInk);
      else confirmBtn.style.removeProperty('--confirm-btn-ink');
      if (selectedShadow) confirmBtn.style.setProperty('--confirm-btn-shadow', selectedShadow);
      else confirmBtn.style.removeProperty('--confirm-btn-shadow');
    }
  } else {
    confirmBtn.style.removeProperty('--confirm-btn-bg');
    confirmBtn.style.removeProperty('--confirm-btn-hover');
    confirmBtn.style.removeProperty('--confirm-btn-ink');
    confirmBtn.style.removeProperty('--confirm-btn-shadow');
  }
  title.textContent = 'Selecciona tus niveles educativos (máximo 3)';
  selectStep.hidden = false;
  box.hidden = !showConfirmStep;
  confirmTitle.textContent = selections.length
    ? `Has seleccionado ${selections.join(' y ')}`
    : 'Selecciona al menos un nivel';
  copy.textContent = selections.length
    ? 'Confirma tu selección para continuar. Puedes elegir hasta 3 niveles y actualizar esta selección en tu perfil cuando cambie tu carga docente.'
    : 'Selecciona 1, 2 o 3 niveles para continuar.';
  confirmBtn.hidden = locked || confirmed;
  confirmBtn.disabled = selections.length === 0;
  select.title = '';
  if (closeBtn) closeBtn.hidden = required;
  applyEducationSectionTheme(selections);
}
// Guarda en memoria la sección educativa elegida dentro del flujo de setup.
function pickSetupEducationSection(value) {
  const modal = document.getElementById('m-education-section');
  if (modal?.classList?.contains('opening-guard')) return;
  if (SETUP_FLOW.educationSectionLocked || SETUP_FLOW.educationSectionConfirmed) return;
  handleSetupEducationSectionChange(value);
}
// Maneja el cambio del selector de sección educativa y actualiza la UI correspondiente.
function handleSetupEducationSectionChange(value) {
  if (SETUP_FLOW.educationSectionLocked) return;
  const box = document.getElementById('s-education-confirm-box');
  const normalized = normalizeEducationSection(value);
  if (!normalized) return;
  const current = getSetupFlowEducationSections();
  const alreadySelected = current.includes(normalized);
  let next = current;
  if (alreadySelected) {
    next = current.filter((item) => item !== normalized);
  } else {
    if (current.length >= 3) {
      toast('Solo puedes seleccionar hasta 3 niveles educativos', true);
      return;
    }
    next = [...current, normalized];
  }
  SETUP_FLOW.educationSections = next;
  SETUP_FLOW.educationSection = next[0] || '';
  SETUP_FLOW.educationSectionConfirmed = false;
  SETUP_FLOW.educationSectionStep = next.length ? 'confirm' : 'select';
  renderSetupEducationSectionFlow();
  if (box && next.length) {
    box.classList.remove('is-level-picked');
    void box.offsetWidth;
    box.classList.add('is-level-picked');
  }
}
// Confirma la sección educativa elegida y deja listo el acceso al resto del panel.
function confirmSetupEducationSection() {
  if (SETUP_FLOW.educationSectionLocked) return;
  const selections = getSetupFlowEducationSections();
  if (!selections.length) {
    toast('Selecciona al menos un nivel educativo', true);
    return;
  }
  if (!persistEducationSectionSelection(selections)) {
    toast('No se pudo guardar el nivel educativo', true);
    return;
  }
  renderSetupEducationSectionFlow();
  const educationModal = document.getElementById('m-education-section');
  const shouldAnimateHandoff = canAnimateAuthHandoff() && !!educationModal?.classList?.contains('open');
  const shouldReturnToProfile = requiresProfileSetupCompletion();
  if (shouldAnimateHandoff) {
    educationModal.classList.add('is-handing-to-setup');
    window.setTimeout(() => {
      educationModal.classList.remove('is-handing-to-setup');
      closeM('m-education-section');
      if (shouldReturnToProfile) {
        openM('m-setup', { fromAuth: EDUCATION_SECTION_MODAL_CONTEXT.fromAuth, fromEducation: true });
      } else {
        closeM('m-setup');
        go('dashboard');
        updateSBUser();
      }
    }, 190);
    return;
  }
  closeM('m-education-section');
  if (shouldReturnToProfile) {
    openM('m-setup', { fromAuth: EDUCATION_SECTION_MODAL_CONTEXT.fromAuth, fromEducation: true });
  } else {
    closeM('m-setup');
    go('dashboard');
    updateSBUser();
  }
}
// Rellena el formulario de setup con los datos que ya estén disponibles en la cuenta.
function populateSetupForm() {
  const nameInput = document.getElementById('s-name');
  const lastNameInput = document.getElementById('s-lastname');
  const phoneInput = document.getElementById('s-phone');
  const roleInput = document.getElementById('s-role');
  const schoolInput = document.getElementById('s-inst');
  const yearInput = document.getElementById('s-year');
  const periodInput = document.getElementById('s-period');
  const fallbackFullName = S.profile?.name || S.sessionUserName || S.authUsers?.find(u => u.id === S.sessionUserId)?.name || '';
  const fallbackFirstName = String(S.profile?.firstName || fallbackFullName.split(/\s+/).slice(0, 1).join(' ')).trim();
  const fallbackLastName = String(S.profile?.lastName || fallbackFullName.split(/\s+/).slice(1).join(' ')).trim();

  if (nameInput) nameInput.value = fallbackFirstName;
  if (lastNameInput) lastNameInput.value = fallbackLastName;
  if (phoneInput) phoneInput.value = normalizePhoneValue(S.profile?.phone || '');
  if (roleInput && S.profile?.role) roleInput.value = S.profile.role;
  if (schoolInput && S.profile?.inst) schoolInput.value = S.profile.inst;
  if (schoolInput) updateInstitutionInlineHint(schoolInput);
  if (yearInput && (S.profile?.year || S.schoolYear?.id)) yearInput.value = S.profile?.year || S.schoolYear?.id;
  if (periodInput && S.profile?.period) periodInput.value = S.profile.period;
}
// Rellena el panel de configuración con el estado actual de la sesión.
function populateSettingsPanel() {
  ensurePeriodsAndYear();
  ensureUserPreferences();
  const yearSelect = document.getElementById('cfg-year');
  const periodSelect = document.getElementById('cfg-period');
  const densitySelect = document.getElementById('cfg-density');
  const animationsToggle = document.getElementById('cfg-animations');
  const authLoginAnimationToggle = document.getElementById('cfg-auth-login-animation');
  if (yearSelect) {
    yearSelect.innerHTML = buildSchoolYearOptions().map(y => `<option value="${y}" ${((S.profile?.year || S.schoolYear?.name)===y)?'selected':''}>${y}</option>`).join('');
  }
  if (periodSelect) {
    periodSelect.innerHTML = (S.periods || []).map(p => `<option value="${p.id}" ${p.id===S.activePeriodId?'selected':''}>${p.id} - ${p.name}</option>`).join('');
  }
  if (densitySelect) densitySelect.value = S.preferences?.density || 'comfortable';
  if (animationsToggle) animationsToggle.checked = S.preferences?.animations !== false;
  if (authLoginAnimationToggle) authLoginAnimationToggle.checked = S.preferences?.authLoginAnimation !== false;
}
// Abre el panel de configuración y sincroniza sus campos con el estado global.
function openSettingsPanel() {
  closeProfileMenu();
  go('settings');
}
// Fija o libera la barra lateral según la preferencia actual.
function setSidebarPinned(pinned) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  const isPinned = !!pinned;
  sidebar.classList.toggle('sb-pinned', isPinned);
  if (isPinned) sidebar.classList.add('sb-expanded');
  syncSidebarOverlayState();
}
// Cancela el temporizador que cerraría automáticamente la barra lateral.
function clearSidebarCloseTimer() {
  if (!SIDEBAR_INTERACTION.closeTimer) return;
  clearTimeout(SIDEBAR_INTERACTION.closeTimer);
  SIDEBAR_INTERACTION.closeTimer = null;
}
// Decide si la barra lateral debe retrasar su cierre por accesibilidad o interacción reciente.
function shouldDeferSidebarAutoClose() {
  return Date.now() < SIDEBAR_INTERACTION.suppressAutoCloseUntil;
}
// Programa el cierre automático de la barra lateral después de un retraso corto.
function scheduleSidebarAutoClose(sidebar, delayMs) {
  if (!sidebar) return;
  if (shouldKeepSidebarPinned() || shouldDeferSidebarAutoClose()) return;
  clearSidebarCloseTimer();
  SIDEBAR_INTERACTION.closeTimer = setTimeout(() => {
    if (shouldKeepSidebarPinned()) return;
    if (sidebar.matches(':hover') || sidebar.matches(':focus-within')) return;
    collapseSidebarIfAllowed();
  }, delayMs);
}
// Indica si el profiling del sidebar está activado para medir su comportamiento.
function isSidebarPerfEnabled() {
  try {
    return window.localStorage?.getItem('edugestPerfSidebar') === '1';
  } catch (_) {
    return false;
  }
}
// Detiene la medición de rendimiento asociada al sidebar.
function stopSidebarPerfProbe() {
  if (SIDEBAR_PERF.rafId) cancelAnimationFrame(SIDEBAR_PERF.rafId);
  SIDEBAR_PERF.rafId = null;
}
// Inicia una medición de rendimiento del sidebar en una fase concreta.
function startSidebarPerfProbe(phase) {
  if (!isSidebarPerfEnabled()) return;
  stopSidebarPerfProbe();
  const budgetMs = 420;
  const frameTimes = [];
  const longFrames = [];
  let start = 0;
  let prev = 0;
  // Gestiona loop.
  const loop = (ts) => {
    if (!start) start = ts;
    if (prev) {
      const dt = ts - prev;
      frameTimes.push(dt);
      if (dt > 20) longFrames.push(Number(dt.toFixed(2)));
    }
    prev = ts;
    if (ts - start < budgetMs) {
      SIDEBAR_PERF.rafId = requestAnimationFrame(loop);
      return;
    }
    SIDEBAR_PERF.rafId = null;
    const avg = frameTimes.length ? frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length : 0;
    const fps = avg > 0 ? (1000 / avg) : 0;
    console.info('[EduGest][sidebar-perf]', {
      phase,
      frames: frameTimes.length,
      avgFrameMs: Number(avg.toFixed(2)),
      estimatedFps: Number(fps.toFixed(1)),
      longFramesOver20ms: longFrames.length,
      longFrames,
    });
  };
  SIDEBAR_PERF.rafId = requestAnimationFrame(loop);
}
// Ajusta la duración de las animaciones del sidebar.
function setSidebarMotionDuration(ms) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  sidebar.style.setProperty('--sb-width-duration', `${ms}ms`);
}
// Sincroniza el overlay de la barra lateral con el estado visual actual.
function syncSidebarOverlayState() {
  const sidebar = document.getElementById('sb');
  const backdrop = document.getElementById('sb-backdrop');
  const isPinned = shouldKeepSidebarPinned();
  const isExpanded = !!sidebar?.classList.contains('sb-expanded');
  const overlayOpen = isExpanded && !isPinned;
  document.body.classList.toggle('sb-overlay-open', overlayOpen);
  if (backdrop) {
    backdrop.hidden = !overlayOpen;
    backdrop.setAttribute('aria-hidden', overlayOpen ? 'false' : 'true');
  }
}
// Expande o contrae la barra lateral y sincroniza su estado interno.
function setSidebarExpanded(expanded) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  if (shouldKeepSidebarPinned()) {
    setSidebarMotionDuration(SIDEBAR_TIMINGS.expandMs);
    sidebar.classList.add('sb-expanded');
    syncSidebarOverlayState();
    return;
  }
  startSidebarPerfProbe(expanded ? 'expand' : 'collapse');
  setSidebarMotionDuration(expanded ? SIDEBAR_TIMINGS.expandMs : SIDEBAR_TIMINGS.collapseMs);
  if (expanded) {
    SIDEBAR_INTERACTION.suppressAutoCloseUntil = Date.now() + SIDEBAR_TIMINGS.reopenGraceMs;
  }
  sidebar.classList.toggle('sb-expanded', !!expanded);
  syncSidebarOverlayState();
}
// Comprueba si la configuración actual obliga a mantener el sidebar fijado.
function shouldKeepSidebarPinned() {
  return !!S.preferences?.sidebarPinned;
}
// Contrae la barra lateral solo si el estado actual lo permite.
function collapseSidebarIfAllowed() {
  clearSidebarCloseTimer();
  if (shouldKeepSidebarPinned()) {
    setSidebarPinned(true);
    return;
  }
  const sidebar = document.getElementById('sb');
  const activeEl = document.activeElement;
  if (sidebar && activeEl && sidebar.contains(activeEl) && typeof activeEl.blur === 'function') {
    activeEl.blur();
  }
  setSidebarPinned(false);
  setSidebarExpanded(false);
}
// Elimina duplicados de una lista manteniendo valores únicos.
function uniqueValues(list = []) {
  return Array.from(new Set((list || []).map((item) => String(item || '').trim()).filter(Boolean)));
}
// Convierte un texto separado por delimitadores en una lista limpia de valores.
function parseDelimitedValues(raw = '', delimiter = ',') {
  return uniqueValues(String(raw || '').split(delimiter).map((item) => item.trim()));
}
// Garantiza que exista una estructura válida de preferencias de usuario.
function ensureUserPreferences() {
  if (!S.preferences || typeof S.preferences !== 'object') {
    S.preferences = { density: 'comfortable', animations: true, authLoginAnimation: true, darkMode: false };
  }
  if (!S.preferences.density) S.preferences.density = 'comfortable';
  if (typeof S.preferences.animations !== 'boolean') S.preferences.animations = true;
  if (typeof S.preferences.authLoginAnimation !== 'boolean') S.preferences.authLoginAnimation = true;
  if (typeof S.preferences.darkMode !== 'boolean') S.preferences.darkMode = false;
  if (typeof S.preferences.sidebarPinned !== 'boolean') S.preferences.sidebarPinned = false;
  if (typeof S.preferences.aiBackendUrl !== 'string') S.preferences.aiBackendUrl = '';
  if (!S.preferences.notifications || typeof S.preferences.notifications !== 'object') {
    S.preferences.notifications = {
      deadlineReminder: true,
      lowPerformanceAlert: true,
      dailySummary: false,
      syncAlert: true,
    };
  }
  if (!S.preferences.evaluation || typeof S.preferences.evaluation !== 'object') {
    S.preferences.evaluation = {
      defaultScale: '100',
      rounding: 'nearest',
      showDecimals: false,
      weightPreset: 'balanced',
    };
  }
}
// Sincroniza el estado visible del interruptor de modo oscuro con la preferencia guardada.
function syncDarkModeToggleUI() {
  const darkToggle = document.getElementById('sb-dark-toggle');
  const darkState = document.getElementById('sb-dark-state');
  const darkIcon = document.getElementById('sb-dark-icon');
  const pinToggle = document.getElementById('sb-pin-toggle');
  const enabled = S.preferences?.darkMode === true;
  const pinned = S.preferences?.sidebarPinned === true;
  if (darkToggle) {
    darkToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    darkToggle.setAttribute('aria-label', enabled ? 'Modo claro' : 'Modo oscuro');
    darkToggle.title = enabled ? 'Desactivar modo oscuro' : 'Activar modo oscuro';
  }
  if (darkIcon) {
    darkIcon.src = enabled ? '/assets/icons/modoclaro.png' : '/assets/icons/modooscuro.png';
  }
  if (darkState) darkState.textContent = enabled ? 'ON' : 'OFF';
  if (pinToggle) {
    pinToggle.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    pinToggle.setAttribute('aria-label', pinned ? 'Desfijar barra lateral' : 'Fijar barra lateral');
    pinToggle.title = pinned ? 'Desfijar barra lateral' : 'Fijar barra lateral';
  }
}
// Aplica las preferencias guardadas al DOM y al estado general de la interfaz.
function applyUserPreferences() {
  ensureUserPreferences();
  document.body.classList.toggle('pref-compact', S.preferences.density === 'compact');
  document.body.classList.toggle('pref-reduce-motion', S.preferences.animations === false);
  applyMotionProfile();
  document.body.classList.toggle('theme-dark', S.preferences.darkMode === true);
  applyEducationSectionTheme();
  const sidebarPinned = S.preferences.sidebarPinned === true;
  setSidebarPinned(sidebarPinned);
  if (sidebarPinned) {
    setSidebarExpanded(true);
  } else {
    const sidebar = document.getElementById('sb');
    if (sidebar && !sidebar.matches(':hover') && !sidebar.matches(':focus-within')) {
      setSidebarExpanded(false);
    }
  }
  syncDarkModeToggleUI();
}
// Alterna la preferencia de sidebar fijado y la persiste.
function toggleSidebarPinnedPreference() {
  ensureUserPreferences();
  S.preferences.sidebarPinned = !S.preferences.sidebarPinned;
  applyUserPreferences();
  persist();
  toast(S.preferences.sidebarPinned ? 'Barra lateral fijada' : 'Barra lateral automática');
}
// Alterna el modo oscuro global del sistema.
function toggleDarkMode() {
  ensureUserPreferences();
  S.preferences.darkMode = !S.preferences.darkMode;
  applyUserPreferences();
  persist();
  toast(S.preferences.darkMode ? 'Modo oscuro activado' : 'Modo oscuro desactivado');
}
// Abre un modal de la app y aplica contexto opcional antes de mostrarlo.
function openM(id, context={})  {
  onOpenCreateModal(id, context);
  const modal = document.getElementById(id);
  if (id === 'm-setup') {
    modal?.classList.toggle('auth-setup', !!context.fromAuth);
    modal?.classList.toggle('from-education', !!context.fromEducation);
  }
  modal?.classList.add('open');
  if (id === 'm-auth') document.body.classList.add('auth-screen-open');
  if (id === 'm-setup') populateSetupForm();
  if (id === 'm-terms') {
    const checkbox = document.getElementById('terms-accept-check');
    if (checkbox) checkbox.checked = false;
    clearTermsAcceptanceError();
  }
  enableWritingAssist(modal);
  queueRenderedTextRepair(modal);
}
// Cierra un modal aunque la UI o el foco intenten mantenerlo abierto.
function forceCloseM(id) {
  const modal = document.getElementById(id);
  modal?.classList.remove('open');
  if (id === 'm-setup') {
    modal?.classList.remove('auth-setup');
    modal?.classList.remove('from-education');
  }
  if (id === 'm-auth') document.body.classList.remove('auth-screen-open');
  onCloseModal(id);
}
// Garantiza que la pantalla de autenticación vuelva a mostrarse cuando no hay sesión activa.
function ensureAuthScreenVisible() {
  if (S.sessionUserId) return;
  const modal = document.getElementById('m-auth');
  if (!modal) return;
  if (!modal.classList.contains('open')) openM('m-auth');
  document.body.classList.add('auth-screen-open');
}
// Cierra un modal normalizando sus flags y limpiando estados asociados.
function closeM(id) {
  if (id === 'm-terms' && enforceMandatoryTermsAcceptance()) return;
  if (id === 'm-education-section' && enforceMandatoryEducationSelection()) return;
  if (id === 'm-setup' && enforceMandatorySetup()) return;
  forceCloseM(id);
}
// Muestra un aviso temporal en pantalla, de error o informativo.
function toast(msg, err=false) {
  const t = document.getElementById('toast');
  t.textContent = fixMojibakeText(msg);
  const tone = (err===true || err==='error') ? 'error' : ((err==='warn' || err==='warning') ? 'warn' : 'info');
  t.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  t.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
  t.setAttribute('aria-atomic', 'true');
  const isDarkTheme = document.body.classList.contains('theme-dark');
  t.style.background = tone==='error'
    ? 'var(--rose)'
    : (tone==='warn' ? 'var(--amber)' : (isDarkTheme ? 'rgba(10, 20, 34, .94)' : 'var(--ink)'));
  t.style.color = tone==='warn' ? '#111827' : (isDarkTheme ? '#edf4ff' : '#fff');
  t.style.transform = 'translateY(0)'; t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.style.transform='translateY(70px)'; t.style.opacity='0'; }, 3200);
}
// Oculta la pantalla de arranque una vez que la UI ya está lista.
function hideBootSplash() {
  const splash = document.getElementById('app-boot');
  if (!splash) return;
  splash.classList.add('is-hidden');
  window.setTimeout(() => splash.remove(), 280);
}
// Construye las iniciales visuales de una persona para avatar o chips de usuario.
function initials(n) { return n.split(' ').filter(Boolean).map(w=>w[0].toUpperCase()).join('').slice(0,2); }
// Genera un color estable a partir de un identificador para avatares y etiquetas.
function avColor(id) { let h=0; for(let i=0;i<id.length;i++) h=id.charCodeAt(i)+((h<<5)-h); return AVPAL[Math.abs(h)%AVPAL.length]; }
// Formatea una fecha ISO corta a un texto amigable para la interfaz.
function fmtDate(d) { if(!d) return ''; try { return new Date(d+'T12:00:00').toLocaleDateString('es-DO',{day:'numeric',month:'short'}); } catch(e){ return d; } }
// Normaliza un texto quitando tildes y mayúsculas para comparar búsquedas sin ruido.
function normTxt(x){ return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
// Extrae un nivel de grado numérico a partir del nombre visible del grado.
function parseGradeLevel(label) {
  const s = normTxt(label);
  const num = s.match(/\d+/);
  if (num) return parseInt(num[0],10);
  const m = {
    primero:1, primer:1, primeroa:1, primerob:1, '1ero':1, '1ro':1,
    segundo:2, '2do':2,
    tercero:3, tercer:3, '3ro':3,
    cuarto:4, '4to':4,
    quinto:5, '5to':5,
    sexto:6, '6to':6,
    septimo:7, septimoa:7, septimob:7, '7mo':7,
    octavo:8, '8vo':8,
    noveno:9, '9no':9,
    decimo:10, '10mo':10
  };
  for (const k of Object.keys(m)) if (s.includes(k)) return m[k];
  return 999;
}
// Normaliza normalizar educación level name.
function normalizeEducationLevelName(level) {
  const v = normTxt(level);
  if (v === 'primario' || v === 'primaria') return 'Primaria';
  if (v === 'secundario' || v === 'secundaria') return 'Secundaria';
  if (v === 'inicial') return 'Inicial';
  return String(level || '').trim() || 'Primaria';
}
// Normaliza normalizar educación sección.
function normalizeEducationSection(section) {
  if (!String(section || '').trim()) return '';
  const normalized = normalizeEducationLevelName(section);
  return EDUCATION_SECTIONS.includes(normalized) ? normalized : '';
}
// Normaliza normalizar educación sections.
function normalizeEducationSections(value) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  const unique = [];
  rawValues.forEach((item) => {
    const normalized = normalizeEducationSection(item);
    if (!normalized) return;
    if (unique.includes(normalized)) return;
    if (unique.length >= 3) return;
    unique.push(normalized);
  });
  return unique;
}
// Construye construir educación sección combination key.
function buildEducationSectionCombinationKey(sections = []) {
  const normalized = normalizeEducationSections(sections);
  if (normalized.length !== 2) return '';
  return [...normalized].sort((a, b) => EDUCATION_SECTIONS.indexOf(a) - EDUCATION_SECTIONS.indexOf(b)).join('+');
}
// Resuelve resolver educación theme class.
function resolveEducationThemeClass(sectionOrSections = '') {
  const sections = normalizeEducationSections(sectionOrSections);
  const comboKey = buildEducationSectionCombinationKey(sections);
  if (comboKey && EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey]) {
    return EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey];
  }
  const primary = sections[0] || '';
  return primary ? (EDUCATION_THEME_CLASS_BY_SECTION[primary] || '') : '';
}
// Obtiene configuración flujo educación sections.
function getSetupFlowEducationSections() {
  const fromArray = normalizeEducationSections(SETUP_FLOW.educationSections || []);
  if (fromArray.length) return fromArray;
  const fromSingle = normalizeEducationSection(SETUP_FLOW.educationSection || '');
  return fromSingle ? [fromSingle] : [];
}
// Obtiene activo educación sections.
function getActiveEducationSections() {
  const sections = normalizeEducationSections(S.profile?.educationSections || []);
  if (sections.length) return sections;
  const fallback = normalizeEducationSection(S.profile?.educationSection || '');
  return fallback ? [fallback] : [];
}
// Resuelve resolver educación theme sección.
function resolveEducationThemeSection() {
  const modal = document.getElementById('m-education-section');
  const draftSelections = getSetupFlowEducationSections();
  if (modal?.classList?.contains('open') && draftSelections.length) return draftSelections;
  return getActiveEducationSections();
}
// Aplica aplicar educación sección theme.
function applyEducationSectionTheme(section = '') {
  const body = document.body;
  if (!body) return;
  Object.values(EDUCATION_THEME_CLASS_BY_SECTION).forEach((cls) => body.classList.remove(cls));
  Object.values(EDUCATION_THEME_CLASS_BY_COMBINATION).forEach((cls) => body.classList.remove(cls));
  const target = section || resolveEducationThemeSection();
  const themeClass = resolveEducationThemeClass(target);
  if (themeClass) body.classList.add(themeClass);
}
// Gestiona should scope by educación sección.
function shouldScopeByEducationSection() {
  return getActiveEducationSections().length > 0;
}
// Gestiona matches activo educación sección.
function matchesActiveEducationSection(level) {
  if (!shouldScopeByEducationSection()) return true;
  const activeSections = getActiveEducationSections();
  const normalizedLevel = normTxt(normalizeEducationLevelName(level));
  return activeSections.some((section) => normTxt(section) === normalizedLevel);
}
// Obtiene scoped grades.
function getScopedGrades() {
  const allGrades = Array.isArray(S.grades) ? S.grades : [];
  if (!shouldScopeByEducationSection()) return allGrades;
  return allGrades.filter((grade) => matchesActiveEducationSection(grade?.educationLevel || ''));
}
// Obtiene scoped sections.
function getScopedSections() {
  const allSections = Array.isArray(S.secciones) ? S.secciones : [];
  if (!shouldScopeByEducationSection()) return allSections;
  const scopedGradeIds = new Set(getScopedGrades().map((grade) => grade.id));
  return allSections.filter((section) => scopedGradeIds.has(section.gradeId));
}
// Obtiene scoped estudiantes.
function getScopedStudents() {
  const allStudents = Array.isArray(S.estudiantes) ? S.estudiantes : [];
  if (!shouldScopeByEducationSection()) return allStudents;
  const scopedSectionIds = new Set(getScopedSections().map((section) => section.id));
  return allStudents.filter((student) => {
    const sectionId = student.sectionId || student.seccionId || student.courseId;
    return scopedSectionIds.has(sectionId);
  });
}
// Obtiene activo educación sección.
function getActiveEducationSection() {
  return getActiveEducationSections()[0] || '';
}
// Obtiene grado catalog for educación sección.
function getGradeCatalogForEducationSection(section) {
  const normalized = normalizeEducationSection(section);
  return GRADE_CATALOG_BY_SECTION[normalized] || GRADE_CATALOG_BY_SECTION.Primaria;
}
// Resuelve resolver grado level rank.
function resolveGradeLevelRank(gradeName, section) {
  const numeric = parseGradeLevel(gradeName);
  if (numeric !== 999) return numeric;
  const catalog = getGradeCatalogForEducationSection(section);
  const idx = catalog.findIndex((item) => normTxt(item) === normTxt(gradeName));
  return idx >= 0 ? idx + 1 : 999;
}
// Renderiza renderizar grado creation options.
function renderGradeCreationOptions(preferredSection = '') {
  const levelSelect = document.getElementById('gr-edu-level');
  const gradeSelect = document.getElementById('gr-grade-num');
  if (!levelSelect || !gradeSelect) return;
  const lockedSections = getActiveEducationSections();
  const availableSections = lockedSections.length ? lockedSections : [...EDUCATION_SECTIONS];
  let selectedSection = normalizeEducationSection(preferredSection || levelSelect.value || '');
  if (!selectedSection || !availableSections.includes(selectedSection)) {
    selectedSection = availableSections[0] || 'Primaria';
  }
  const options = getGradeCatalogForEducationSection(selectedSection);
  const currentGrade = String(gradeSelect.value || '').trim();
  const nextGrade = options.includes(currentGrade) ? currentGrade : '';

  levelSelect.innerHTML = availableSections.map((level) => (
    `<option value="${level}" ${level === selectedSection ? 'selected' : ''}>${level}</option>`
  )).join('');
  levelSelect.disabled = lockedSections.length === 1;
  levelSelect.title = lockedSections.length === 1
    ? 'Tu perfil docente tiene un solo nivel activo.'
    : '';

  gradeSelect.innerHTML = `<option value="">Selecciona un grado</option>${options.map((grade) => (
    `<option value="${grade}" ${grade === nextGrade ? 'selected' : ''}>${grade}</option>`
  )).join('')}`;
  refreshGradeCurriculumForm(true);
}
// Procesa procesar grado educación level change.
function handleGradeEducationLevelChange(level) {
  renderGradeCreationOptions(level);
}
// Renderiza renderizar grado sección options.
function renderGradeSectionOptions(selectedValue = '') {
  const sectionSelect = document.getElementById('gr-section');
  if (!sectionSelect) return;
  const baseOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cleanSelected = String(selectedValue || '').trim();
  const values = [...new Set([
    ...baseOptions,
    ...((S.secciones || []).map((section) => parseSection(section.sec || section.sectionLetter || '')).filter(Boolean)),
    cleanSelected ? parseSection(cleanSelected) : '',
  ].filter(Boolean))];
  fillSel('gr-section', values.map((value) => ({ value, label: value })), (item) => item.value, (item) => item.label, cleanSelected ? parseSection(cleanSelected) : '', 'Selecciona una sección');
}
// Crea crear grado custom sección.
function createGradeCustomSection() {
  const raw = prompt('Escribe la sección personalizada:') || '';
  const clean = parseSection(raw);
  if (!String(raw || '').trim()) return;
  renderGradeSectionOptions(clean);
  const sectionEl = document.getElementById('gr-section');
  if (sectionEl) sectionEl.value = clean;
  toast('Sección personalizada agregada');
}
// Gestiona grado creation selection.
function gradeCreationSelection() {
  return {
    educationLevel: normalizeEducationLevelName(String(document.getElementById('gr-edu-level')?.value || '').trim()),
    gradeName: String(document.getElementById('gr-grade-num')?.value || '').trim(),
  };
}
// Refresca refrescar grado curriculum form.
function refreshGradeCurriculumForm(forceResetSubject = false) {
  const areaSelect = document.getElementById('gr-area');
  const subjectSelect = document.getElementById('gr-subject');
  if (!areaSelect || !subjectSelect) return;
  const { educationLevel, gradeName } = gradeCreationSelection();
  if (!gradeName) {
    fillSel('gr-area', [], (item) => item.value, (item) => item.label, '', 'Selecciona un grado primero');
    fillSel('gr-subject', [], (item) => item.value, (item) => item.label, '', 'Selecciona un grado y un área');
    areaSelect.disabled = true;
    subjectSelect.disabled = true;
    return;
  }
  const areaOptions = curriculumAreaOptionsForContext('', gradeName, educationLevel);
  const currentArea = String(areaSelect.value || '').trim();
  const nextArea = areaOptions.includes(currentArea) ? currentArea : '';
  fillSel('gr-area', areaOptions.map((area) => ({ value: area, label: area })), (item) => item.value, (item) => item.label, nextArea, 'Selecciona área');
  const currentSubject = String(subjectSelect.value || '').trim();
  const subjectOptions = curriculumSubjectOptions({ gradeName, area: nextArea, educationLevel });
  const nextSubject = !forceResetSubject && subjectOptions.some((item) => item.value === currentSubject)
    ? currentSubject
    : (subjectOptions.length === 1 ? subjectOptions[0].value : '');
  fillSel('gr-subject', subjectOptions, (item) => item.value, (item) => item.label, nextSubject, nextArea ? 'Selecciona asignatura' : 'Selecciona un área primero');
  areaSelect.disabled = false;
  subjectSelect.disabled = !nextArea;
}
// Crea crear grado custom area.
function createGradeCustomArea() {
  const { educationLevel } = gradeCreationSelection();
  const created = curriculumRegisterCustomArea(prompt('Escribe el nombre del área personalizada:') || '', educationLevel || 'Secundaria');
  if (!created) return;
  refreshGradeCurriculumForm(false);
  const areaEl = document.getElementById('gr-area');
  if (areaEl) areaEl.value = created;
  refreshGradeCurriculumForm(true);
  toast('área personalizada agregada');
}
// Crea crear grado custom asignatura.
function createGradeCustomSubject() {
  const { educationLevel, gradeName } = gradeCreationSelection();
  const area = String(document.getElementById('gr-area')?.value || '').trim();
  if (!area) {
    toast('Selecciona primero un área', true);
    return;
  }
  const created = curriculumRegisterCustomSubject(prompt('Escribe el nombre de la asignatura personalizada:') || '', area, {
    gradeName,
    educationLevel: educationLevel || 'Secundaria',
  });
  if (!created) return;
  refreshGradeCurriculumForm(false);
  const subjectEl = document.getElementById('gr-subject');
  if (subjectEl) subjectEl.value = created;
  toast('Asignatura personalizada agregada');
}
// Analiza analizar sección.
function parseSection(label) {
  const raw = String(label||'').trim().toUpperCase();
  if (!raw) return 'A';
  const m = raw.match(/\b([A-Z])\b/);
  if (m) return m[1];
  return raw.split(/\s+/)[0].replace(/[^A-Z0-9]/g,'') || 'A';
}
// Gestiona sort courses.
function sortCourses(list) {
  return [...(list||[])].sort((a,b)=>{
    const ga = a.gradeLevel || parseGradeLevel(a.gradeName||a.grado||a.name||'');
    const gb = b.gradeLevel || parseGradeLevel(b.gradeName||b.grado||b.name||'');
    if (ga !== gb) return ga - gb;
    const sa = parseSection(a.sectionLetter||a.sectionName||a.sec||a.name||'');
    const sb = parseSection(b.sectionLetter||b.sectionName||b.sec||b.name||'');
    if (sa !== sb) return sa.localeCompare(sb, 'es');
    return String(a.materia||a.subject||'').localeCompare(String(b.materia||b.subject||''), 'es');
  });
}
// Valida validar and repair datos.
function validateAndRepairData() {
  const sectionById = new Map((S.secciones||[]).map(s=>[s.id, s]));
  const sectionByKey = new Map();
  (S.secciones||[]).forEach(sec=>{
    const key = `${normTxt(sec.grado)}|${parseSection(sec.sec)}`;
    if (!sectionByKey.has(key)) sectionByKey.set(key, sec);
  });

  let repaired = 0;
  let unassigned = 0;
  (S.estudiantes||[]).forEach(st=>{
    const current = st.courseId || st.sectionId || st.seccionId;
    if (current && sectionById.has(current)) {
      st.courseId = current;
      st.sectionId = current;
      st.seccionId = current;
      const sec = sectionById.get(current);
      st.gradeId = sec?.gradeId || st.gradeId || null;
      return;
    }

    // try to reassign by grade + section hints
    const secLetter = parseSection(st.sectionLetter || st.sec || '');
    const gradeLabel = st.grado || st.gradeName || '';
    const key = `${normTxt(gradeLabel)}|${secLetter}`;
    let target = sectionByKey.get(key);

    // fallback by old seccionId/sectionId if still valid
    if (!target) {
      const fallback = st.seccionId || st.sectionId;
      if (fallback && sectionById.has(fallback)) target = sectionById.get(fallback);
    }

    if (target) {
      st.courseId = target.id;
      st.sectionId = target.id;
      st.seccionId = target.id;
      st.gradeId = target.gradeId || st.gradeId || null;
      repaired++;
    } else {
      st.courseId = null;
      if (!sectionById.has(st.sectionId)) st.sectionId = null;
      if (!sectionById.has(st.seccionId)) st.seccionId = null;
      unassigned++;
    }
  });

  (S.evaluations||[]).forEach(ev=>{
    if (!ev.groupId) {
      const st = S.estudiantes.find(s=>s.id===ev.studentId);
      ev.groupId = st?.courseId || st?.sectionId || st?.seccionId || null;
    }
  });

  if (repaired || unassigned) {
    console.debug('[EduGest][repair]', {repairedStudents: repaired, unassignedStudents: unassigned});
  }
}
// Migra migrar datos if needed.
function migrateDataIfNeeded() {
  validateAndRepairData();
}
// Rellena sel.
function fillSel(id, arr, valFn, lblFn, sel, ph) {
  const el = document.getElementById(id); if(!el) return;
  el.innerHTML = ph ? `<option value="">${ph}</option>` : '';
  arr.forEach(x => { const o=document.createElement('option'); o.value=valFn(x); o.textContent=lblFn(x); if(sel&&o.value===sel) o.selected=true; el.appendChild(o); });
}
// Abre abrir sec m.
function openSecM(gradeId=null) {
  if (getSortedGrades().length===0) { toast('Crea un grado primero', true); go('grade-setup'); return; }
  openM('m-sec', {gradeId});
}
// Obtiene grupos.
function getGroups() {
  // Deriva el catálogo de cursos visibles desde grados y secciones para alimentar navegación y selectores.
  const gradeById = new Map(getScopedGrades().map((grade) => [grade.id, grade]));
  return sortCourses(getScopedSections().map(sec => {
    const gr = gradeById.get(sec.gradeId);
    return {
      id:sec.id, gradeId:sec.gradeId, gradeName:gr?.name||sec.grado||'', sectionName:sec.sec, materia:sec.materia || gr?.subjectName || 'General',
      gradeLevel: sec.gradeLevel || gr?.gradeLevel || parseGradeLevel(gr?.name||sec.grado),
      sectionLetter: sec.sectionLetter || parseSection(sec.sec)
    };
  }));
}
// Obtiene sección lista key.
function getSectionRosterKey(sectionOrId) {
  const sec = typeof sectionOrId === 'string'
    ? getScopedSections().find((section) => section.id === sectionOrId) || (S.secciones || []).find((section) => section.id === sectionOrId)
    : sectionOrId;
  if (!sec) return '';
  const gradeId = sec.gradeId || '';
  const sectionLetter = parseSection(sec.sectionLetter || sec.sec || '');
  return `${gradeId}|${sectionLetter}`;
}
// Obtiene lista sections.
function getRosterSections(sectionOrId) {
  const rosterKey = getSectionRosterKey(sectionOrId);
  if (!rosterKey) return [];
  return sortCourses((S.secciones || []).filter((section) => getSectionRosterKey(section) === rosterKey));
}
// Obtiene lista sección ids.
function getRosterSectionIds(sectionOrId) {
  return getRosterSections(sectionOrId).map((section) => section.id);
}
// Resuelve resolver lista sección id.
function resolveRosterSectionId(sectionOrId) {
  return getRosterSections(sectionOrId)[0]?.id || (typeof sectionOrId === 'string' ? sectionOrId : sectionOrId?.id) || '';
}
// Gestiona share lista between sections.
function shareRosterBetweenSections(sectionA, sectionB) {
  const keyA = getSectionRosterKey(sectionA);
  const keyB = getSectionRosterKey(sectionB);
  return !!keyA && keyA === keyB;
}
// Obtiene lista asignatura labels.
function getRosterSubjectLabels(sectionOrId) {
  return [...new Set(
    getRosterSections(sectionOrId)
      .map((section) => String(section?.materia || '').trim())
      .filter(Boolean)
  )];
}
// Obtiene lista curso labels.
function getRosterCourseLabels(sectionOrId) {
  return [...new Set(
    getRosterSections(sectionOrId)
      .map((section) => getGroupLabel(section.id))
      .filter((label) => label && label !== '?')
  )];
}
// Obtiene grupo label.
function getGroupLabel(groupId) {
  // Resume un curso en un texto corto legible para tarjetas, encabezados y mensajes de depuración.
  const g = getGroups().find(x=>x.id===groupId);
  return g ? `${g.gradeName} ${g.sectionName} ? ${g.materia||'General'}` : '?';
}
// Obtiene asistencia grupo label.
function getAttendanceGroupLabel(group) {
  if (!group) return '?';
  return `${group.gradeName} ${group.sectionName} ? ${group.materia || 'General'}`;
}
// Asegura asegurar activo grupo.
function ensureActiveGroup() {
  // Punto de paso único para forzar que el contexto académico esté alineado antes de leer o escribir notas.
  ensureActiveContext();
}
// Gestiona estudiantes in grupo.
function studentsInGroup(groupId = S.activeGroupId) {
  const rosterKey = getSectionRosterKey(groupId);
  if (!rosterKey) return [];
  const token = buildStudentRosterCacheToken();
  if (STUDENT_ROSTER_CACHE.token !== token) {
    const scopedStudents = getScopedStudents();
    const buckets = new Map();
    (S.secciones || []).forEach((section) => {
      const key = getSectionRosterKey(section);
      if (!key || buckets.has(key)) return;
      const rosterIds = new Set(getRosterSectionIds(section.id));
      buckets.set(key, scopedStudents.filter((student) => {
        const sectionId = student.courseId || student.sectionId || student.seccionId;
        return rosterIds.has(sectionId);
      }));
    });
    STUDENT_ROSTER_CACHE.token = token;
    STUDENT_ROSTER_CACHE.rosterStudents = buckets;
  }
  return STUDENT_ROSTER_CACHE.rosterStudents.get(rosterKey) || [];
}
// Obtiene grupo cfg.
function getGroupCfg(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  ensureActiveGroup();
  ensurePeriodBuckets(periodId);
  if (!groupId) return S.blockCfg;
  const pool = S.periodGroupConfigs[periodId];
  if (!pool[groupId]) {
    pool[groupId] = emptyGroupCfg();
  }
  BLOCKS.forEach(b=>{
    (pool[groupId][b]?.activities||[]).forEach(a=>{
      if (!a.periodId) a.periodId = periodId;
      if (!a.courseId) a.courseId = groupId;
    });
  });
  return pool[groupId];
}
// Gestiona with grupo selector.
function withGroupSelector(extra='') {
  const groups = getGroups();
  const opts = groups.map(g=>`<option value="${g.id}" ${g.id===S.activeGroupId?'selected':''}>${g.gradeName} ${g.sectionName} ? ${g.materia||'General'}</option>`).join('');
  return `${renderYearPeriodSelector()}<select class="sel" style="min-width:170px;" onchange="setActiveGroup(this.value)">${opts || '<option value="">Sin grupos</option>'}</select>${extra}`;
}
// Actualiza activo grado.
function setActiveGrade(gradeId) {
  // Cambia el grado activo y mueve el contexto al primer curso válido de ese grado.
  if (enforceMandatoryEducationSelection()) return;
  const sortedGrades = getSortedGrades();
  const nextGradeId = sortedGrades.find(g=>g.id===gradeId)?.id || sortedGrades[0]?.id || null;
  S.activeGradeId = nextGradeId;
  const sections = sortCourses(getScopedSections().filter(s=>s.gradeId===nextGradeId));
  let nextSectionId = S.activeGroupId;
  if (!sections.find(s=>s.id===nextSectionId)) nextSectionId = sections[0]?.id || null;
  S.activeGroupId = nextSectionId;
  S.activeCourseId = nextSectionId;
  ensurePeriodBuckets(S.activePeriodId);
  persist();
  resetAllCreateForms();
  go(currentPage);
}
// Actualiza activo grupo.
function setActiveGroup(groupId) {
  // Cambia el curso activo, ajusta el grado si corresponde y vuelve a pintar el panel actual.
  if (enforceMandatoryEducationSelection()) return;
  S.activeGroupId = groupId || null;
  S.activeCourseId = S.activeGroupId;
  const sec = getScopedSections().find(s=>s.id===S.activeGroupId);
  if (sec?.gradeId) S.activeGradeId = sec.gradeId;
  ensureActiveContext();
  ensurePeriodBuckets(S.activePeriodId);
  persist();
  resetAllCreateForms();
  go(currentPage);
}
// Actualiza activo sección.
function setActiveSection(sectionId) {
  setActiveGroup(sectionId);
}
// Actualiza activo curso id.
function setActiveCourseId(courseId) { setActiveGroup(courseId); }
// Gestiona total acts.
function totalActs(groupId = S.activeGroupId) {
  const cfg = getGroupCfg(groupId, S.activePeriodId);
  return BLOCKS.reduce((s,b) => s + (cfg[b]?.activities?.length||0), 0);
}
// Gestiona all actividades.
function allActivities(periodId = S.activePeriodId) {
  const out = [];
  const cfg = getGroupCfg(S.activeGroupId, periodId);
  BLOCKS.forEach(b => {
    (cfg[b]?.activities||[]).forEach(a => out.push({block:b, activity:a}));
  });
  return out;
}
// Gestiona find actividad.
function findActivity(actId, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId);
  for (const b of BLOCKS) {
    const idx = (cfg[b]?.activities||[]).findIndex(a=>a.id===actId);
    if (idx >= 0) return {block:b, index:idx, activity:cfg[b].activities[idx]};
  }
  return null;
}
// Renderiza renderizar estudiante vista tag lista.
function renderStudentViewTagList(items = [], className = 'student-view-tag') {
  const values = (Array.isArray(items) ? items : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  if (!values.length) return '?';
  return `<div class="student-view-tag-list">${values.map((item) => `<span class="${className}">${escapeHtml(item)}</span>`).join('')}</div>`;
}
// Normaliza normalizar curso search texto.
function normalizeCourseSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
// Asegura asegurar IA estado.
function ensureAiState() {
  if (!Array.isArray(S.aiChatHistory)) S.aiChatHistory = [];
}
// Obtiene IA backend url.
function getAiBackendUrl() {
  ensureUserPreferences();
  return String(S.preferences.aiBackendUrl || DEFAULT_AI_BACKEND_URL).trim();
}
// Construye construir IA contexto snapshot.
function buildAiContextSnapshot() {
  ensureActiveGroup();
  const groups = getGroups();
  const activeGroupLabel = getGroupLabel(S.activeGroupId);
  const groupSummaries = groups.slice(0, 12).map((group) => {
    const cfg = getGroupCfg(group.id, S.activePeriodId);
    const activities = BLOCKS.reduce((sum, block) => sum + (cfg[block]?.activities?.length || 0), 0);
    const linked = BLOCKS.reduce((sum, block) => sum + (cfg[block]?.activities || []).filter((item) => !!item.instrumentId).length, 0);
    return {
      id: group.id,
      name: `${group.gradeName} ${group.sectionName}`.trim(),
      subject: group.materia || 'General',
      students: studentsInGroup(group.id).length,
      activities,
      linkedActivities: linked,
      coverage: activities ? Math.round((linked / activities) * 100) : 0,
    };
  });
  const pendingCoverage = groupSummaries.filter((group) => group.activities > 0 && group.coverage < 100);
  const noStudents = groupSummaries.filter((group) => group.students === 0);
  return {
    userId: S.sessionUserId || '',
    userName: S.sessionUserName || getDisplayUserName('Docente'),
    teacher: getDisplayUserName('Docente'),
    role: S.profile?.role || 'Docente',
    institution: S.profile?.inst || 'Institucion por configurar',
    schoolYear: S.schoolYear?.name || S.profile?.year || '2025-2026',
    period: periodName(),
    activeCourse: activeGroupLabel,
    totals: {
      courses: groups.length,
      students: (S.estudiantes || []).length,
      activities: groupSummaries.reduce((sum, group) => sum + group.activities, 0),
      instruments: (S.instruments || []).filter((inst) => !inst.periodId || inst.periodId === S.activePeriodId).length,
    },
    flags: {
      groupsWithoutStudents: noStudents.map((group) => group.name),
      groupsPendingCoverage: pendingCoverage.map((group) => `${group.name} (${group.coverage}%)`),
    },
    groups: groupSummaries,
  };
}
// Construye construir local IA reply.
function buildLocalAiReply(message, context) {
  const q = normTxt(message);
  const totals = context.totals || {};
  const flags = context.flags || {};
  const groups = context.groups || [];
  const weakestCoverage = [...groups].filter((group) => group.activities > 0).sort((a, b) => a.coverage - b.coverage)[0];
  const busiestGroup = [...groups].sort((a, b) => b.students - a.students)[0];

  if (q.includes('resumen') || q.includes('periodo') || q.includes('panel')) {
    return [
      `Resumen del ${context.period}:`,
      `Tienes ${totals.courses || 0} curso(s), ${totals.students || 0} estudiante(s), ${totals.activities || 0} actividad(es) y ${totals.instruments || 0} instrumento(s) en biblioteca.`,
      flags.groupsWithoutStudents?.length ? `Cursos sin estudiantes: ${flags.groupsWithoutStudents.join(', ')}.` : 'Todos los cursos tienen estudiantes asignados.',
      weakestCoverage ? `La cobertura mas baja la tiene ${weakestCoverage.name} con ${weakestCoverage.coverage}% de actividades vinculadas a instrumento.` : 'Aun no hay actividades suficientes para medir cobertura.',
    ].join('\n');
  }
  if (q.includes('riesgo') || q.includes('atencion') || q.includes('prioridad')) {
    return [
      'Prioridades sugeridas:',
      flags.groupsWithoutStudents?.length ? `1. Asignar estudiantes a ${flags.groupsWithoutStudents[0]}.` : '1. No hay cursos vacios en este momento.',
      weakestCoverage ? `2. Vincular instrumentos en ${weakestCoverage.name}; ahora mismo va en ${weakestCoverage.coverage}%.` : '2. Crear o vincular instrumentos en las actividades pendientes.',
      busiestGroup ? `3. Revisar primero ${busiestGroup.name}, porque concentra ${busiestGroup.students} estudiante(s).` : '3. Aun no hay datos suficientes para priorizar por curso.',
    ].join('\n');
  }
  if (q.includes('instrument') || q.includes('actividad')) {
    return weakestCoverage
      ? `Te conviene empezar por ${weakestCoverage.name}. Tiene ${weakestCoverage.activities} actividades y solo ${weakestCoverage.linkedActivities} vinculadas a instrumento.`
      : 'Todavia no veo actividades con suficiente detalle para sugerir un instrumento concreto.';
  }
  if (q.includes('curso') || q.includes('grupo') || q.includes('seccion')) {
    return groups.length
      ? `Curso activo: ${context.activeCourse}. El grupo con mas estudiantes ahora mismo es ${busiestGroup?.name || context.activeCourse}.`
      : 'Todavia no hay cursos creados. Empieza por Estudiantes para crear un grado y una seccion.';
  }
  return [
    `Puedo ayudarte con este panel, ${context.teacher}.`,
    'Prueba preguntas como:',
    '- Dame un resumen del periodo actual',
    '- Que curso necesita mas atencion',
    '- Donde faltan instrumentos',
    '- Que deberia revisar hoy',
  ].join('\n');
}
// Normaliza normalizar IA messages for api.
function normalizeAiMessagesForApi() {
  ensureAiState();
  return S.aiChatHistory.slice(-8).map((item) => ({
    role: item.role === 'assistant' ? 'assistant' : 'user',
    text: item.text,
  }));
}
// Gestiona push IA mensaje.
function pushAiMessage(role, text, source = 'local') {
  ensureAiState();
  S.aiChatHistory.push({
    id: uid(),
    role,
    text: String(text || '').trim(),
    source,
    createdAt: Date.now(),
  });
  if (S.aiChatHistory.length > 24) S.aiChatHistory = S.aiChatHistory.slice(-24);
  persist();
}
let AI_REQUEST_PENDING = false;
// Gestiona request IA response.
async function requestAiResponse(message) {
  const backendUrl = getAiBackendUrl();
  const context = buildAiContextSnapshot();
  if (!backendUrl) {
    return { text: buildLocalAiReply(message, context), source: 'local' };
  }
  const baseUrl = backendUrl.replace(/\/$/, '');
  const sendChat = async (timeoutMs = 65000) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          history: normalizeAiMessagesForApi(),
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  };
  try {
    let payload;
    try {
      payload = await sendChat(65000);
    } catch (firstError) {
      const firstMsg = String(firstError?.message || '').toLowerCase();
      const isTimeout = firstError?.name === 'AbortError';
      const isFailedFetch = firstMsg.includes('failed to fetch');
      if (!isTimeout && !isFailedFetch) throw firstError;
      // Render free can cold-start; wake it up and retry once.
      try { await fetch(`${baseUrl}/health`); } catch (_) {}
      payload = await sendChat(65000);
    }
    if (!payload?.reply) throw new Error('Sin respuesta');
    const payloadSource = String(payload.source || 'python').toLowerCase();
    if (payloadSource === 'local') {
      return { text: payload.reply, source: 'python-local' };
    }
    return { text: payload.reply, source: 'python' };
  } catch (error) {
    const reason = error?.name === 'AbortError'
      ? 'timeout'
      : String(error?.message || 'conexion fallida');
    return {
      text: `No pude conectar con el backend IA (${reason}). Verifica que el servicio este activo en ${backendUrl}.`,
      source: 'backend-error',
    };
  }
}
// Renderiza renderizar IA mensaje bubble.
function renderAiMessageBubble(item) {
  const roleClass = item.role === 'assistant' ? 'assistant' : 'user';
  const sourceLabel = item.role === 'assistant'
    ? (
      item.source === 'python'
        ? 'Python IA'
        : item.source === 'python-local'
          ? 'Python (heuristica local)'
          : item.source === 'rate-limited'
            ? 'Limite diario'
          : item.source === 'backend-error'
            ? 'Error de backend'
            : 'Respuesta local'
    )
    : 'Tu consulta';
  return `
    <div class="ai-msg ai-msg-${roleClass}">
      <div class="ai-msg-meta">${sourceLabel}</div>
      <div class="ai-msg-body">${escapeHtml(item.text).replace(/\n/g, '<br>')}</div>
    </div>
  `;
}
// Renderiza renderizar IA panel.
function renderAiPanel() {
  ensureAiState();
  const backendUrl = getAiBackendUrl();
  const statusClass = backendUrl ? 'is-online' : 'is-local';
  const messages = S.aiChatHistory.length
    ? S.aiChatHistory.map(renderAiMessageBubble).join('')
    : `<div class="ai-empty-state">
        <div class="ai-empty-title">Empieza aqui</div>
        <div class="ai-empty-copy">Escribe una pregunta o toca una sugerencia de la derecha. Ejemplo: "Que curso necesita mas atencion hoy?"</div>
      </div>`;
  return `
    <div class="ai-shell">
      <div class="card ai-hero-card">
        <div class="cp ai-hero-simple">
          <div class="ai-hero-copy">
            <div class="ai-hero-title-sm">Asistente IA docente</div>
            <div class="ai-hero-sub">Consulta cursos, actividades, instrumentos y prioridades de forma rapida.</div>
          </div>
          <div class="ai-status-pill ${statusClass}">
            ${backendUrl ? 'Backend IA conectado' : 'Modo local activo'}
          </div>
        </div>
      </div>

      <div class="ai-layout">
        <div class="card ai-chat-card">
          <div class="ch">
            <div class="ch-title">Conversacion</div>
          </div>
          <div class="cp ai-chat-body">
            <div class="ai-messages">${messages}</div>
            <div class="ai-composer">
              <textarea id="ai-input" class="inp ai-input" rows="4" placeholder="Ej. Que curso necesita mas atencion esta semana?" onkeydown="handleAiInputKeydown(event)"></textarea>
              <div class="ai-composer-actions">
                <button class="btn btn-outline" type="button" onclick="clearAiChat()">Limpiar</button>
                <button class="btn btn-primary" type="button" onclick="submitAiPrompt()" ${AI_REQUEST_PENDING ? 'disabled' : ''}>${AI_REQUEST_PENDING ? 'Pensando...' : 'Preguntar'}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card ai-side-card">
          <div class="ch">
            <div class="ch-title">Preguntas rapidas</div>
          </div>
          <div class="cp ai-side-body">
            <button class="btn btn-outline btn-block" type="button" onclick="seedAiPrompt('Dame un resumen del periodo actual')">Resumen del periodo</button>
            <button class="btn btn-outline btn-block" type="button" onclick="seedAiPrompt('Que curso necesita mas atencion')">Curso con prioridad</button>
            <button class="btn btn-outline btn-block" type="button" onclick="seedAiPrompt('Donde faltan instrumentos')">Instrumentos faltantes</button>
            <button class="btn btn-outline btn-block" type="button" onclick="seedAiPrompt('Que deberia revisar hoy')">Que revisar hoy</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
// Gestiona clear IA chat.
function clearAiChat() {
  S.aiChatHistory = [];
  persist();
  if (currentPage === 'ai') go('ai');
}
// Gestiona seed IA prompt.
function seedAiPrompt(message) {
  const input = document.getElementById('ai-input');
  if (currentPage !== 'ai') {
    go('ai');
    scheduleNonCriticalTask(() => {
      const nextInput = document.getElementById('ai-input');
      if (nextInput) nextInput.value = message;
    }, 60);
    return;
  }
  if (input) input.value = message;
}
// Procesa procesar IA input keydown.
function handleAiInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submitAiPrompt();
  }
}
// Gestiona submit IA prompt.
async function submitAiPrompt() {
  if (AI_REQUEST_PENDING) return;
  const input = document.getElementById('ai-input');
  const message = String(input?.value || '').trim();
  if (!message) {
    toast('Escribe una consulta para el asistente', true);
    return;
  }
  AI_REQUEST_PENDING = true;
  pushAiMessage('user', message, 'user');
  if (input) input.value = '';
  if (currentPage === 'ai') go('ai');
  const reply = await requestAiResponse(message);
  pushAiMessage('assistant', reply.text, reply.source);
  AI_REQUEST_PENDING = false;
  if (currentPage === 'ai') go('ai');
}
// Obtiene actividad label.
function getActivityLabel(actId) {
  const f = findActivity(actId);
  return f ? `${BICON[f.block]} ${f.activity.name} (${BNAME[f.block]})` : 'Actividad';
}
// Asegura asegurar actividad instrumento fields.
function ensureActivityInstrumentFields(act) {
  if (!Array.isArray(act.instrumentIds)) act.instrumentIds = act.instrumentId ? [act.instrumentId] : [];
  if (!Array.isArray(act.instrumentHistory)) act.instrumentHistory = [];
  if (!('instrumentId' in act)) act.instrumentId = act.instrumentIds[0] || null;
}
// Obtiene instrumento by id.
function getInstrumentById(id) { return S.instruments.find(i=>i.id===id); }
// Gestiona now iso.
function nowIso() { return new Date().toISOString(); }

// Gestiona default criterios for type.
function defaultCriteriaForType(type, maxScore=20) {
  const mk = (name, maxPts, weight=0)=>({id:uid(), name, maxPoints:maxPts, weight});
  if (type==='lista_cotejo_a') {
    return [
      mk('Cumple con la estructura esperada', 5, 25),
      mk('Entrega evidencias completas', 5, 25),
      mk('Aplica correctamente procedimientos', 5, 25),
      mk('Presenta orden y claridad', 5, 25),
    ];
  }
  if (type==='lista_cotejo_b') {
    return [
      mk('Comprensión conceptual', 5, 25),
      mk('Aplicación del procedimiento', 5, 25),
      mk('Precisión en resultados', 5, 25),
      mk('Comunicación de resultados', 5, 25),
    ];
  }
  if (type==='escala_estimativa') {
    return [
      mk('Participación', Math.round(maxScore/4), 25),
      mk('Cumplimiento de tareas', Math.round(maxScore/4), 25),
      mk('Calidad del trabajo', Math.round(maxScore/4), 25),
      mk('Responsabilidad', Math.round(maxScore/4), 25),
    ];
  }
  return [
    mk('Dominio conceptual', Math.round(maxScore/4), 25),
    mk('Aplicación práctica', Math.round(maxScore/4), 25),
    mk('Comunicación y claridad', Math.round(maxScore/4), 25),
    mk('Calidad del producto', Math.round(maxScore/4), 25),
  ];
}

// Gestiona default levels for type.
function defaultLevelsForType(type, levelsCount=4) {
  if (type==='escala_estimativa') {
    return [
      {id:uid(), label:'Siempre', factor:1, value:4},
      {id:uid(), label:'Casi siempre', factor:0.75, value:3},
      {id:uid(), label:'A veces', factor:0.5, value:2},
      {id:uid(), label:'Nunca', factor:0.25, value:1},
    ];
  }
  if (levelsCount===5) {
    return [
      {id:uid(), label:'Excelente', factor:1},
      {id:uid(), label:'Muy bueno', factor:.85},
      {id:uid(), label:'Bueno', factor:.7},
      {id:uid(), label:'Básico', factor:.55},
      {id:uid(), label:'Inicial', factor:.4},
    ];
  }
  return [
    {id:uid(), label:'Excelente', factor:1},
    {id:uid(), label:'Bueno', factor:.8},
    {id:uid(), label:'Básico', factor:.6},
    {id:uid(), label:'Inicial', factor:.4},
  ];
}
// Gestiona default rúbrica levels.
function defaultRubricLevels(levelsCount=4) {
  const presets = {
    2: [{label:'Logrado',factor:1},{label:'En desarrollo',factor:.5}],
    3: [{label:'Alto',factor:1},{label:'Medio',factor:.67},{label:'Bajo',factor:.34}],
    4: [{label:'Excelente',factor:1},{label:'Bueno',factor:.75},{label:'Básico',factor:.5},{label:'Inicial',factor:.25}],
    5: [{label:'Excelente',factor:1},{label:'Muy bueno',factor:.85},{label:'Bueno',factor:.7},{label:'Básico',factor:.55},{label:'Inicial',factor:.4}],
    6: [{label:'Nivel 6',factor:1},{label:'Nivel 5',factor:.85},{label:'Nivel 4',factor:.7},{label:'Nivel 3',factor:.55},{label:'Nivel 2',factor:.4},{label:'Nivel 1',factor:.25}],
  };
  const list = presets[Math.max(2,Math.min(6,parseInt(levelsCount)||4))] || presets[4];
  return list.map(x=>({id:uid(), label:x.label, factor:x.factor, valueFactor:x.factor}));
}
// Normaliza normalizar rúbrica criterios.
function normalizeRubricCriteria(criteria, levels) {
  const lv = Array.isArray(levels) ? levels : [];
  return (criteria||[]).map((c, idx)=>{
    const out = {...c};
    out.id = out.id || uid();
    out.label = out.label || out.name || `Criterio ${idx+1}`;
    out.name = out.label;
    out.weightPct = parseFloat(out.weightPct ?? out.weight ?? 0) || 0;
    out.weight = out.weightPct;
    out.maxPoints = parseFloat(out.maxPoints ?? 0) || 0;
    out.order = parseInt(out.order ?? (idx + 1)) || (idx + 1);
    out.descriptors = (out.descriptors && typeof out.descriptors==='object') ? {...out.descriptors} : {};
    lv.forEach(l=>{ if (!(l.id in out.descriptors)) out.descriptors[l.id] = ''; });
    return out;
  });
}
// Normaliza normalizar rubrica instrumento.
function normalizeRubricaInstrument(inst) {
  if (!inst || inst.type!=='rubrica_analitica') return inst;
  const levelsCount = Math.max(2, Math.min(6, parseInt(inst.levelsCount)||((inst.levels||[]).length||4)));
  let levels = (inst.levels||[]).map(l=>({
    ...l,
    id: l.id || uid(),
    label: l.label || 'Nivel',
    factor: Number.isFinite(parseFloat(l.factor ?? l.valueFactor)) ? parseFloat(l.factor ?? l.valueFactor) : null,
    valueFactor: Number.isFinite(parseFloat(l.valueFactor ?? l.factor)) ? parseFloat(l.valueFactor ?? l.factor) : null
  }));
  if (levels.length < 2) levels = defaultRubricLevels(levelsCount);
  inst.levelsCount = Math.max(2, Math.min(6, levels.length));
  inst.levels = levels;
  inst.criteria = normalizeRubricCriteria(inst.criteria, inst.levels);
  inst.maxTotal = parseFloat(inst.maxTotal ?? inst.maxScore ?? calcInstrumentMax(inst)) || 0;
  inst.maxScore = inst.maxTotal;
  inst.schoolYear = inst.schoolYear || S.schoolYear?.name || '2025-2026';
  if (!('autoAdjustLevels' in inst)) inst.autoAdjustLevels = true;
  inst.appearanceTemplate = inst.appearanceTemplate || inst.appearanceMode || 'academic';
  delete inst.appearanceMode;
  const baseTpl = RUBRIC_APPEARANCE_TEMPLATES[inst.appearanceTemplate] || RUBRIC_APPEARANCE_TEMPLATES.academic;
  const legacyPal = inst.appearancePalette || {};
  const levelColorsLegacy = [
    legacyPal.excelente || baseTpl.theme.levelColors[0],
    legacyPal.bueno || baseTpl.theme.levelColors[1],
    legacyPal.basico || baseTpl.theme.levelColors[2],
    legacyPal.inicial || baseTpl.theme.levelColors[3],
    baseTpl.theme.levelColors[4]
  ];
  inst.appearanceTheme = {
    ...baseTpl.theme,
    ...(inst.appearanceTheme || {}),
    headerBg: (inst.appearanceTheme?.headerBg || legacyPal.header || baseTpl.theme.headerBg),
    headerText: (inst.appearanceTheme?.headerText || baseTpl.theme.headerText),
    tableBorder: (inst.appearanceTheme?.tableBorder || baseTpl.theme.tableBorder),
    rowAltBg: (inst.appearanceTheme?.rowAltBg || legacyPal.rowAlt || baseTpl.theme.rowAltBg),
    rowBaseBg: (inst.appearanceTheme?.rowBaseBg || baseTpl.theme.rowBaseBg),
    metaColumnBg: (inst.appearanceTheme?.metaColumnBg || baseTpl.theme.metaColumnBg),
    levelColors: Array.isArray(inst.appearanceTheme?.levelColors) && inst.appearanceTheme.levelColors.length ? inst.appearanceTheme.levelColors : levelColorsLegacy
  };
  ieSyncAppearanceLevelColorsById(inst);
  if (!('useColorsOnPrint' in inst)) inst.useColorsOnPrint = true;
  if (!('forceBWOnPrint' in inst)) inst.forceBWOnPrint = false;
  delete inst.appearancePalette;
  delete inst.customAccent;
  return inst;
}

// Gestiona make instrumento borrador.
function makeInstrumentDraft(type='rubrica_analitica', seed={}) {
  const maxScore = parseFloat(seed.maxScore ?? seed.maxTotal) || 20;
  const levelsCount = Math.max(2, Math.min(6, parseInt(seed.levelsCount)||4));
  const levels = seed.levels || (type==='rubrica_analitica' ? defaultRubricLevels(levelsCount) : defaultLevelsForType(type, levelsCount));
  const criteriaBase = seed.criteria || defaultCriteriaForType(type, maxScore);
  const criteria = (type==='rubrica_analitica')
    ? normalizeRubricCriteria(criteriaBase, levels)
    : criteriaBase;
  const draft = {
    id: seed.id || uid(),
    name: (seed.name!==undefined) ? seed.name : (type==='rubrica_analitica' || type==='lista_cotejo_a' || type==='lista_cotejo_b' || type==='escala_estimativa' ? '' : `Instrumento ${new Date().toLocaleTimeString('es-DO',{hour:'2-digit',minute:'2-digit'})}`),
    type,
    maxScore,
    maxTotal: maxScore,
    levelsCount,
    criteria,
    levels,
    schoolYear: seed.schoolYear || S.schoolYear?.name || '2025-2026',
    periodId: seed.periodId || S.activePeriodId || 'P1',
    courseId: (seed.courseId!==undefined) ? seed.courseId : (type==='lista_cotejo_a' ? null : (S.activeGroupId || null)),
    autoAdjustLevels: ('autoAdjustLevels' in seed) ? !!seed.autoAdjustLevels : true,
    sourceActivityId: seed.sourceActivityId || null,
    version: seed.version || 1,
    parentId: seed.parentId || null,
    appearanceTemplate: seed.appearanceTemplate || seed.appearanceMode || 'academic',
    appearanceTheme: {
      ...(RUBRIC_APPEARANCE_TEMPLATES[seed.appearanceTemplate || seed.appearanceMode || 'academic']?.theme || RUBRIC_APPEARANCE_TEMPLATES.academic.theme),
      ...(seed.appearanceTheme || {})
    },
    useColorsOnPrint: ('useColorsOnPrint' in seed) ? !!seed.useColorsOnPrint : true,
    forceBWOnPrint: ('forceBWOnPrint' in seed) ? !!seed.forceBWOnPrint : false,
    checklistMode: seed.checklistMode === 'trichotomic' ? 'trichotomic' : 'dichotomic',
    partialValue: Number.isFinite(parseFloat(seed.partialValue)) ? Math.max(0, Math.min(1, parseFloat(seed.partialValue))) : 0.5,
    activityName: typeof seed.activityName === 'string' ? seed.activityName : '',
    checklistValueMode: seed.checklistValueMode === 'manual' ? 'manual' : 'auto',
    checklistFactors: (seed.checklistFactors && typeof seed.checklistFactors==='object') ? {...seed.checklistFactors} : {},
    checklistPoints: (seed.checklistPoints && typeof seed.checklistPoints==='object') ? {...seed.checklistPoints} : {},
    createdAt: seed.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
  if (type==='rubrica_analitica') return normalizeRubricaInstrument(draft);
  if (type==='lista_cotejo_a') return normalizeChecklistDraft(draft);
  if (type==='lista_cotejo_b') return normalizeWeightedChecklistDraft(draft);
  if (type==='escala_estimativa') return normalizeEstimativeDraft(draft);
  return draft;
}

// Gestiona instrumento type label.
function instrumentTypeLabel(type) {
  const m = {
    rubrica_analitica:'Rúbrica analítica',
    lista_cotejo_a:'Lista de cotejo (simple)',
    lista_cotejo_b:'Lista de cotejo ponderada',
    escala_estimativa:'Escala estimativa',
    rubrica_holistica:'Rúbrica holística (legacy)'
  };
  return m[type] || type;
}
// Gestiona instrumento name prefix.
function instrumentNamePrefix(type) {
  const m = {
    rubrica_analitica:'Rúbrica',
    lista_cotejo_a:'Lista de cotejo',
    lista_cotejo_b:'Lista ponderada',
    escala_estimativa:'Escala estimativa',
  };
  return m[type] || 'Instrumento';
}
// Gestiona strip instrumento name prefix.
function stripInstrumentNamePrefix(type, rawName='') {
  const name = String(rawName || '').trim();
  const prefix = instrumentNamePrefix(type);
  const patterns = [
    `${prefix} ? `,
    `${prefix} ? `,
    `${prefix} - `,
  ];
  for (const p of patterns) {
    if (name.toLowerCase().startsWith(p.toLowerCase())) {
      return name.slice(p.length).trim();
    }
  }
  return name;
}
// Gestiona compose instrumento name.
function composeInstrumentName(type, rawName='') {
  const base = stripInstrumentNamePrefix(type, rawName);
  return `${instrumentNamePrefix(type)} ? ${base || 'Nueva actividad'}`;
}

// Gestiona calc instrumento max.
function calcInstrumentMax(instrument) {
  if (!instrument) return 0;
  if (instrument.type==='lista_cotejo_a') {
    return parseFloat(instrument.maxTotal ?? instrument.maxScore) || 0;
  }
  return (instrument.criteria||[]).reduce((s,c)=>s + (parseFloat(c.maxPoints)||0), 0);
}
// Normaliza normalizar lista de cotejo borrador.
function normalizeChecklistDraft(draft) {
  if (!draft || draft.type!=='lista_cotejo_a') return draft;
  draft.checklistMode = draft.checklistMode === 'trichotomic' ? 'trichotomic' : 'dichotomic';
  draft.checklistValueMode = draft.checklistValueMode === 'manual' ? 'manual' : 'auto';
  const parsedActivityName = String(draft.activityName || '').trim();
  if (!parsedActivityName) {
    const rawName = String(draft.name || '').trim();
    const prefix = 'Lista de cotejo';
    if (rawName.startsWith(`${prefix} ? `)) {
      const suffix = rawName.slice((`${prefix} ? `).length).trim();
      draft.activityName = suffix.toLowerCase()==='sin título' ? '' : suffix;
    } else {
      draft.activityName = '';
    }
  } else {
    draft.activityName = parsedActivityName;
  }
  if (!Array.isArray(draft.criteria)) draft.criteria = [];
  const total = parseFloat(draft.maxTotal ?? draft.maxScore) || 0;
  const per = draft.criteria.length ? total / draft.criteria.length : 0;
  const points = (draft.checklistPoints && typeof draft.checklistPoints==='object') ? draft.checklistPoints : {};
  const autoPoints = { yes: per, partial: per / 2, no: 0 };
  draft.checklistPoints = draft.checklistValueMode==='manual'
    ? {
      yes: Number.isFinite(parseFloat(points.yes)) ? Math.max(0, parseFloat(points.yes)) : autoPoints.yes,
      partial: Number.isFinite(parseFloat(points.partial)) ? Math.max(0, parseFloat(points.partial)) : autoPoints.partial,
      no: Number.isFinite(parseFloat(points.no)) ? Math.max(0, parseFloat(points.no)) : autoPoints.no,
    }
    : autoPoints;
  draft.criteria = draft.criteria.map((c, idx) => ({
    ...c,
    id: c.id || uid(),
    label: c.label || c.name || `Criterio ${idx+1}`,
    name: c.label || c.name || `Criterio ${idx+1}`,
    maxPoints: per,
    weight: 0,
    weightPct: 0,
    order: idx + 1,
  }));
  draft.maxTotal = total;
  draft.maxScore = total;
  draft.checklistFactors = {
    yes: per>0 ? (draft.checklistPoints.yes / per) : 0,
    partial: per>0 ? (draft.checklistPoints.partial / per) : 0,
    no: per>0 ? (draft.checklistPoints.no / per) : 0,
  };
  draft.partialValue = draft.checklistFactors.partial;
  draft.name = composeInstrumentName('lista_cotejo_a', draft.activityName || '');
  return draft;
}
// Resuelve resolver lista de cotejo points.
function resolveChecklistPoints(inst) {
  const i = normalizeChecklistDraft(JSON.parse(JSON.stringify(inst || {})));
  const tri = i.checklistMode === 'trichotomic';
  return {
    yes: Math.max(0, parseFloat(i.checklistPoints?.yes) || 0),
    partial: tri ? Math.max(0, parseFloat(i.checklistPoints?.partial) || 0) : 0,
    no: Math.max(0, parseFloat(i.checklistPoints?.no) || 0),
  };
}
// Valida validar lista de cotejo points.
function validateChecklistPoints(inst) {
  const i = normalizeChecklistDraft(JSON.parse(JSON.stringify(inst || {})));
  const total = parseFloat(i.maxTotal ?? i.maxScore) || 0;
  const count = Array.isArray(i.criteria) ? i.criteria.length : 0;
  const tri = i.checklistMode === 'trichotomic';
  const p = resolveChecklistPoints(i);
  const maxPer = tri ? Math.max(p.yes, p.partial, p.no) : Math.max(p.yes, p.no);
  const severe = (maxPer * count) > (total + 0.0001);
  const warn = tri && p.partial > p.yes;
  return {
    severe,
    warn,
    severeMessage: severe ? 'Los valores definidos exceden el puntaje máximo del instrumento' : '',
    warnMessage: warn ? 'Parcial es mayor que Cumple; revisa la configuración' : ''
  };
}
// Normaliza normalizar ponderada lista de cotejo borrador.
function normalizeWeightedChecklistDraft(draft) {
  if (!draft || draft.type!=='lista_cotejo_b') return draft;
  if (!Array.isArray(draft.criteria)) draft.criteria = [];
  const total = parseFloat(draft.maxTotal ?? draft.maxScore) || 0;
  draft.criteria = draft.criteria.map((c, idx)=>({
    ...c,
    id: c.id || uid(),
    label: c.label || c.name || `Criterio ${idx+1}`,
    name: c.label || c.name || `Criterio ${idx+1}`,
    maxPoints: Math.max(0, parseFloat(c.maxPoints) || 0),
    weight: 0,
    weightPct: 0,
    order: idx + 1,
  }));
  draft.maxTotal = total;
  draft.maxScore = total;
  return draft;
}
// Normaliza normalizar estimativa borrador.
function normalizeEstimativeDraft(draft) {
  if (!draft || draft.type!=='escala_estimativa') return draft;
  if (!Array.isArray(draft.levels) || !draft.levels.length) {
    draft.levels = [
      {id:uid(), label:'Siempre', value:4},
      {id:uid(), label:'Casi siempre', value:3},
      {id:uid(), label:'A veces', value:2},
      {id:uid(), label:'Nunca', value:1},
    ];
  }
  draft.levels = draft.levels.map((l, idx)=>({
    ...l,
    id: l.id || uid(),
    label: l.label || `Nivel ${idx+1}`,
    value: Number.isFinite(parseFloat(l.value)) ? Math.max(0, parseFloat(l.value)) : (Number.isFinite(parseFloat(l.factor)) ? Math.max(0, parseFloat(l.factor)) : 0),
  }));
  draft.levels.sort((a,b)=>(parseFloat(b.value)||0) - (parseFloat(a.value)||0));
  const total = Math.max(0, parseFloat(draft.maxTotal ?? draft.maxScore) || 20);
  const criteriaCount = Math.max(1, (draft.criteria||[]).length || 1);
  const perCriterion = total / criteriaCount;
  const maxLevelValue = Math.max(0, ...draft.levels.map(l=>parseFloat(l.value)||0));
  if (!Array.isArray(draft.criteria)) draft.criteria = [];
  // keep scale values bounded by criterion max so scale lives inside each criterion bucket
  draft.levels = draft.levels.map(l=>({
    ...l,
    value: Math.max(0, Math.min(perCriterion, parseFloat(l.value)||0))
  }));
  const maxValueBounded = Math.max(0, ...draft.levels.map(l=>parseFloat(l.value)||0));
  draft.levels = draft.levels.map(l=>({
    ...l,
    factor: maxValueBounded>0 ? ((parseFloat(l.value)||0) / maxValueBounded) : 0,
    valueFactor: maxValueBounded>0 ? ((parseFloat(l.value)||0) / maxValueBounded) : 0,
  }));
  draft.criteria = draft.criteria.map((c, idx)=>({
    ...c,
    id: c.id || uid(),
    label: c.label || c.name || `Criterio ${idx+1}`,
    name: c.label || c.name || `Criterio ${idx+1}`,
    maxPoints: perCriterion,
    weight: 0,
    weightPct: 0,
    order: idx + 1,
  }));
  draft.maxTotal = round2(total);
  draft.maxScore = draft.maxTotal;
  return draft;
}
// Gestiona ie auto adjust scale valores.
function ieAutoAdjustScaleValues() {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='escala_estimativa') return;
  const n = Math.max(1, (d.levels||[]).length);
  const criteriaCount = Math.max(1, (d.criteria||[]).length || 1);
  const perCriterion = (Math.max(0, parseFloat(d.maxTotal ?? d.maxScore) || 0)) / criteriaCount;
  const top = Math.max(1, Math.round(perCriterion));
  (d.levels||[]).forEach((l, idx)=>{
    if (idx===n-1) {
      l.value = 1;
      return;
    }
    const descending = top - idx;
    l.value = Math.max(1, descending);
  });
  normalizeEstimativeDraft(d);
  renderInstrumentEditor();
}
// Gestiona ponderada criterios sum.
function weightedCriteriaSum(draft) {
  return round2((draft?.criteria||[]).reduce((s,c)=>s + (parseFloat(c.maxPoints)||0), 0));
}
// Gestiona ie auto adjust ponderada lista de cotejo points.
function ieAutoAdjustWeightedChecklistPoints() {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_b' || !Array.isArray(d.criteria) || d.criteria.length===0) return;
  const m = d.criteria.length;
  const maxTotal = Math.max(0, parseFloat(d.maxTotal ?? d.maxScore) || 0);
  const each = m ? (maxTotal / m) : 0;
  d.criteria.forEach(c=>{ c.maxPoints = each; });
}

// Gestiona evaluate instrumento.
function evaluateInstrument(instrument, values) {
  if (instrument?.type==='lista_cotejo_a') {
    const inst = normalizeChecklistDraft(JSON.parse(JSON.stringify(instrument)));
    const v = values || {};
    const criteria = inst.criteria || [];
    const target = parseFloat(inst.maxTotal ?? inst.maxScore ?? 0) || 0;
    const points = resolveChecklistPoints(inst);
    const tri = inst.checklistMode === 'trichotomic';
    // Gestiona points for.
    const pointsFor = (raw) => {
      if (raw===true || raw===1 || raw==='1' || raw==='cumple') return points.yes;
      if (tri && (raw==='partial' || raw==='parcial')) return points.partial;
      if (raw===false || raw===0 || raw==='0' || raw==='nocumple' || raw==='no') return points.no;
      const n = parseFloat(raw);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    };
    const totalScore = criteria.reduce((sum, c) => sum + pointsFor(v[c.id]), 0);
    return { totalScore: round2(totalScore), maxScore: round2(target) };
  }
  if (instrument?.type==='rubrica_analitica') {
    const inst = normalizeRubricaInstrument(JSON.parse(JSON.stringify(instrument)));
    const v = values || {};
    let totalRaw = 0;
    let max = 0;
    const perCriterion = [];
    inst.criteria.forEach(c=>{
      const cmax = parseFloat(c.maxPoints)||0;
      const levelId = v[c.id];
      const lv = inst.levels.find(x=>x.id===levelId);
      const factor = lv ? (parseFloat(lv.valueFactor ?? lv.factor) || 0) : 0;
      const points = round2(cmax * factor);
      totalRaw += points;
      max += cmax;
      perCriterion.push({criterionId:c.id, levelId:levelId||null, points});
    });
    const target = parseFloat(inst.maxTotal ?? inst.maxScore ?? max) || max;
    const totalScore = (max>0 && target>0 && round2(max)!==round2(target)) ? round2((totalRaw/max)*target) : round2(totalRaw);
    return {totalScore, maxScore: round2(target||max), totalRaw: round2(totalRaw), perCriterion};
  }
  if (instrument?.type==='escala_estimativa') {
    const inst = normalizeEstimativeDraft(JSON.parse(JSON.stringify(instrument)));
    const v = values || {};
    let totalRaw = 0;
    let maxRaw = 0;
    inst.criteria.forEach(c=>{
      const cmax = parseFloat(c.maxPoints)||0;
      const levelId = v[c.id];
      const lv = (inst.levels||[]).find(x=>x.id===levelId);
      const factor = lv ? (parseFloat(lv.valueFactor ?? lv.factor) || 0) : 0;
      totalRaw += (cmax * factor);
      maxRaw += cmax;
    });
    const target = parseFloat(inst.maxTotal ?? inst.maxScore ?? maxRaw) || maxRaw;
    const totalScore = (maxRaw>0 && target>0 && round2(maxRaw)!==round2(target))
      ? round2((totalRaw/maxRaw)*target)
      : round2(totalRaw);
    return {totalScore, maxScore: round2(target||maxRaw)};
  }
  const v = values || {};
  let total = 0;
  let max = 0;
  instrument.criteria.forEach(c=>{
    const cid = c.id;
    const cmax = parseFloat(c.maxPoints)||0;
    if (instrument.type==='lista_cotejo_a') {
      const yes = !!v[cid];
      total += yes ? cmax : 0;
      max += cmax;
      return;
    }
    if (instrument.type==='lista_cotejo_b') {
      const raw = v[cid];
      const pts = Math.max(0, Math.min(cmax, parseFloat(raw)||0));
      total += pts;
      max += cmax;
      return;
    }
    const levelId = v[cid];
    const lv = instrument.levels.find(x=>x.id===levelId);
    const pts = lv ? Math.round(cmax * (lv.factor||0)) : 0;
    total += pts;
    max += cmax;
  });
  return {totalScore: total, maxScore: max};
}

// Mapea mapear evaluation to actividad calificación.
function mapEvaluationToActivityScore(totalScore, maxScore, activityMax) {
  if (!maxScore || maxScore <= 0) return 0;
  if (maxScore === activityMax) return totalScore;
  return round2((totalScore / maxScore) * activityMax);
}

// Sugiere sugerir instrumento for actividad.
function suggestInstrumentForActivity(meta) {
  const txt = `${meta.name||''} ${meta.descripcion||''} ${meta.producto||''} ${meta.tipo||''}`.toLowerCase();
  if (txt.includes('exposición') || txt.includes('oral')) return 'rubrica_analitica';
  if (txt.includes('informe') || txt.includes('redacción') || txt.includes('escrito')) return 'rubrica_analitica';
  if (txt.includes('experimento') || txt.includes('laboratorio')) return 'lista_cotejo_b';
  if (txt.includes('participación') || txt.includes('observable') || txt.includes('práctica en aula')) return 'lista_cotejo_a';
  return 'escala_estimativa';
}

const instrumentService = {
  list() { return S.instruments.filter(i=>(i.periodId||'P1')===S.activePeriodId && (!S.activeGroupId || i.courseId===S.activeGroupId)); },
  create(draft) {
    if (!isBasicInstrumentType(draft?.type)) return null;
    const inst = makeInstrumentDraft(draft.type, draft);
    if (inst.type==='lista_cotejo_a') normalizeChecklistDraft(inst);
    if (inst.type==='lista_cotejo_b') normalizeWeightedChecklistDraft(inst);
    if (inst.type==='escala_estimativa') normalizeEstimativeDraft(inst);
    inst.periodId = draft.periodId || S.activePeriodId;
    inst.courseId = draft.courseId || S.activeGroupId || null;
    const g = getGroups().find(x=>x.id===inst.courseId);
    inst.gradeId = g?.gradeId || null;
    inst.gradeName = g?.gradeName || '';
    inst.subjectName = g?.materia || inst.subjectName || '';
    S.instruments.push(inst);
    persist();
    return inst;
  },
  update(id, payload) {
    const idx = S.instruments.findIndex(i=>i.id===id);
    if (idx < 0) return null;
    const next = {...S.instruments[idx], ...payload, updatedAt: nowIso()};
    if (next.type==='rubrica_analitica') normalizeRubricaInstrument(next);
    if (next.type==='lista_cotejo_a') normalizeChecklistDraft(next);
    if (next.type==='lista_cotejo_b') normalizeWeightedChecklistDraft(next);
    if (next.type==='escala_estimativa') normalizeEstimativeDraft(next);
    const g = getGroups().find(x=>x.id===next.courseId);
    next.gradeId = g?.gradeId || next.gradeId || null;
    next.gradeName = g?.gradeName || next.gradeName || '';
    next.subjectName = g?.materia || next.subjectName || '';
    S.instruments[idx] = next;
    persist();
    return S.instruments[idx];
  },
  remove(id) {
    S.instruments = S.instruments.filter(i=>i.id!==id);
    allActivities().forEach(({activity}) => {
      ensureActivityInstrumentFields(activity);
      activity.instrumentIds = activity.instrumentIds.filter(x=>x!==id);
      if (activity.instrumentId === id) activity.instrumentId = activity.instrumentIds[0] || null;
    });
    persist();
  },
  duplicate(id) {
    const src = getInstrumentById(id);
    if (!src) return null;
    const clone = JSON.parse(JSON.stringify(src));
    clone.id = uid();
    clone.name = `${src.name} (copia)`;
    clone.parentId = src.id;
    clone.version = (src.version||1) + 1;
    clone.createdAt = nowIso();
    clone.updatedAt = nowIso();
    if (clone.type==='rubrica_analitica') normalizeRubricaInstrument(clone);
    if (clone.type==='lista_cotejo_a') normalizeChecklistDraft(clone);
    if (clone.type==='lista_cotejo_b') normalizeWeightedChecklistDraft(clone);
    if (clone.type==='escala_estimativa') normalizeEstimativeDraft(clone);
    S.instruments.push(clone);
    persist();
    return clone;
  },
  suggest(meta) {
    const rawType = suggestInstrumentForActivity(meta);
    const type = isBasicInstrumentType(rawType) ? rawType : 'rubrica_analitica';
    const draft = makeInstrumentDraft(type, {
      name: meta.name || '',
      maxScore: parseInt(meta.maxScore)||20,
      periodId: S.activePeriodId,
      courseId: S.activeGroupId || null
    });
    if (type==='lista_cotejo_a') {
      draft.activityName = meta.name || '';
      normalizeChecklistDraft(draft);
    }
    const txt = `${meta.name||''} ${meta.descripcion||''} ${meta.producto||''}`.toLowerCase();
    if (txt.includes('exposición') || txt.includes('oral')) {
      draft.criteria = [
        {id:uid(), name:'Claridad y dicción', maxPoints:5, weight:25},
        {id:uid(), name:'Dominio del contenido', maxPoints:5, weight:25},
        {id:uid(), name:'Organización del discurso', maxPoints:5, weight:25},
        {id:uid(), name:'Uso de recursos y lenguaje corporal', maxPoints:5, weight:25},
      ];
    } else if (txt.includes('informe') || txt.includes('redacción') || txt.includes('escrito')) {
      draft.criteria = [
        {id:uid(), name:'Coherencia y estructura del texto', maxPoints:5, weight:25},
        {id:uid(), name:'Rigor conceptual', maxPoints:5, weight:25},
        {id:uid(), name:'Análisis y argumentación', maxPoints:5, weight:25},
        {id:uid(), name:'Normas de presentación y ortografía', maxPoints:5, weight:25},
      ];
    } else if (txt.includes('experimento') || txt.includes('laboratorio')) {
      draft.criteria = [
        {id:uid(), name:'Preparación y seguridad', maxPoints:4, weight:20},
        {id:uid(), name:'Ejecución del procedimiento', maxPoints:4, weight:20},
        {id:uid(), name:'Registro de datos', maxPoints:4, weight:20},
        {id:uid(), name:'Análisis de resultados', maxPoints:4, weight:20},
        {id:uid(), name:'Conclusiones y mejora', maxPoints:4, weight:20},
      ];
    }
    return draft;
  },
  link(activityId, instrumentId) {
    const f = findActivity(activityId);
    if (!f) return false;
    const a = f.activity;
    ensureActivityInstrumentFields(a);
    if (a.instrumentId && a.instrumentId !== instrumentId) {
      a.instrumentHistory.push({instrumentId:a.instrumentId, replacedAt:nowIso()});
    }
    a.instrumentId = instrumentId;
    if (!a.instrumentIds.includes(instrumentId)) a.instrumentIds.push(instrumentId);
    persist();
    return true;
  },
  applyEvaluation(payload) {
    payload.periodId = payload.periodId || S.activePeriodId;
    const idx = S.evaluations.findIndex(e=>
      e.activityId===payload.activityId &&
      e.instrumentId===payload.instrumentId &&
      e.studentId===payload.studentId &&
      e.groupId===payload.groupId &&
      (e.periodId||'P1')===payload.periodId
    );
    if (idx>=0) {
      payload.id = S.evaluations[idx].id || payload.id;
      payload.createdAt = S.evaluations[idx].createdAt || payload.createdAt || nowIso();
      payload.updatedAt = nowIso();
      S.evaluations[idx] = payload;
    } else {
      S.evaluations.push(payload);
    }
    if (!S.notas[payload.studentId]) S.notas[payload.studentId] = {};
    S.notas[payload.studentId][payload.activityId] = payload.activityScore;
    upsertLocalEvaluationRecord(payload);
    persist();
    syncSqlEvaluationUpsert(payload, {
      sectionId: payload.groupId || payload.courseId || S.activeGroupId,
      periodId: payload.periodId,
      activity: findActivity(payload.activityId, payload.groupId || payload.courseId || S.activeGroupId, payload.periodId)?.activity || null,
    }).catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo sincronizar una evaluación con SQL', error);
    });
    return payload;
  }
};

// Obtiene grado.
function getGrade(n) {
  if (n===null) return {l:'?', c:''};
  if (n>=90) return {l:'A',c:'gA'};
  if (n>=75) return {l:'B',c:'gB'};
  if (n>=60) return {l:'C',c:'gC'};
  return {l:'D',c:'gD'};
}
// Gestiona calificación class.
function scoreClass(raw, max) {
  if (!raw && raw!==0) return '';
  const r = raw/max;
  if (r>=.9) return 'h'; if (r>=.75) return 'o'; if (r>=.6) return 'w'; return 'd';
}
// Gestiona round2.
function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
// Analiza analizar decimal input.
function parseDecimalInput(val, fallback = 0) {
  const n = Number(String(val ?? '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : fallback;
}
// Gestiona fmt num.
function fmtNum(n) {
  const v = round2(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
}
// Gestiona notas mapear.
function notasMap(periodId = S.activePeriodId) {
  ensurePeriodBuckets(periodId);
  return S.notasByPeriod[periodId] || {};
}
// Gestiona upsert local evaluation record.
function upsertLocalEvaluationRecord(payload) {
  if (!payload || !payload.activityId || !payload.studentId) return null;
  const periodId = String(payload.periodId || S.activePeriodId || 'P1').trim() || 'P1';
  // Gestiona key matches.
  const keyMatches = (entry) =>
    entry.activityId === payload.activityId &&
    entry.studentId === payload.studentId &&
    (entry.periodId || 'P1') === periodId &&
    String(entry.groupId || entry.courseId || '') === String(payload.groupId || payload.courseId || S.activeGroupId || '');
  const idx = S.evaluations.findIndex(keyMatches);
  const next = {
    ...payload,
    periodId,
    groupId: payload.groupId || payload.courseId || S.activeGroupId || null,
    courseId: payload.courseId || payload.groupId || S.activeGroupId || null,
    score: Number.isFinite(Number(payload.score)) ? Number(payload.score) : Number(payload.activityScore || 0),
    activityScore: Number.isFinite(Number(payload.activityScore)) ? Number(payload.activityScore) : Number(payload.score || 0),
    updatedAt: nowIso(),
  };
  if (idx >= 0) {
    next.id = S.evaluations[idx].id || next.id || uid();
    next.createdAt = S.evaluations[idx].createdAt || next.createdAt || nowIso();
    S.evaluations[idx] = next;
  } else {
    next.id = next.id || uid();
    next.createdAt = next.createdAt || nowIso();
    S.evaluations.push(next);
  }
  if (!S.notasByPeriod[periodId]) S.notasByPeriod[periodId] = {};
  if (!S.notasByPeriod[periodId][next.studentId]) S.notasByPeriod[periodId][next.studentId] = {};
  S.notasByPeriod[periodId][next.studentId][next.activityId] = next.activityScore;
  return next;
}

/* ------------------------- Block calculations ------------------------- */
function blockRawMax(b, groupId = S.activeGroupId, periodId = S.activePeriodId) { return (getGroupCfg(groupId, periodId)[b]?.activities||[]).reduce((s,a)=>s+(parseDecimalInput(a.pts,0)),0); }
function blockMeta(b, groupId = S.activeGroupId, periodId = S.activePeriodId)   { return getGroupCfg(groupId, periodId)[b]?.meta || 100; }
// Gestiona do normalizar.
function doNormalize(b, groupId = S.activeGroupId, periodId = S.activePeriodId) { return getGroupCfg(groupId, periodId)[b]?.normalize !== false; }

// Raw score for a student on a block
function studentBlockRaw(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId)[b];
  const nmap = notasMap(periodId);
  return cfg.activities.reduce((s,a) => s + ((nmap[estId]||{})[a.id]||0), 0);
}

// Normalized / final block score
function studentBlockScore(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const raw = studentBlockRaw(estId, b, groupId, periodId);
  const rawMax = blockRawMax(b, groupId, periodId);
  const meta = blockMeta(b, groupId, periodId);
  if (rawMax === 0) return 0;
  return doNormalize(b, groupId, periodId) ? Math.round(raw / rawMax * meta) : raw;
}

// Overall final: weighted average across blocks proportional to each block's meta
function studentFinal(estId, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const cfg = getGroupCfg(groupId, periodId);
  if (BLOCKS.every(b => (cfg[b]?.activities?.length||0) === 0)) return null;
  const totalMeta = BLOCKS.reduce((s,b) => s + blockMeta(b, groupId, periodId), 0);
  if (totalMeta === 0) return null;
  const weighted = BLOCKS.reduce((s,b) => s + studentBlockScore(estId,b,groupId,periodId) * blockMeta(b,groupId,periodId), 0);
  return Math.round(weighted / totalMeta);
}

// Gestiona estudiante annual block average.
function studentAnnualBlockAverage(estId, b, groupId = S.activeGroupId) {
  const periodIds = academicCalendarPeriods().map((period) => period.id);
  const scores = periodIds
    .map((periodId) => {
      const cfg = getGroupCfg(groupId, periodId)[b];
      return (cfg?.activities?.length || 0) ? studentBlockScore(estId, b, groupId, periodId) : null;
    })
    .filter((value) => value !== null);
  return scores.length ? round2(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
}

// Gestiona estudiante annual final.
function studentAnnualFinal(estId, groupId = S.activeGroupId) {
  const blockScores = BLOCKS
    .map((blockId) => studentAnnualBlockAverage(estId, blockId, groupId))
    .filter((value) => value !== null);
  return blockScores.length ? round2(blockScores.reduce((sum, value) => sum + value, 0) / blockScores.length) : null;
}

// Gestiona global block avg.
function globalBlockAvg(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const ests = studentsInGroup(groupId);
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentBlockScore(e.id, b, groupId, periodId));
  return Math.round(scores.reduce((s,v)=>s+v,0) / scores.length);
}
// Gestiona global avg.
function globalAvg(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const ests = studentsInGroup(groupId);
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentFinal(e.id, groupId, periodId)).filter(v=>v!==null);
  return scores.length ? Math.round(scores.reduce((s,v)=>s+v,0)/scores.length) : null;
}

/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   SAVE HANDLERS
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Guarda el perfil inicial y completa el arranque de la cuenta.
async function saveSetup() {
  const firstName = String(v('s-name') || S.profile?.firstName || '').trim();
  const lastName = String(v('s-lastname') || S.profile?.lastName || '').trim();
  const phone = normalizePhoneValue(v('s-phone') || S.profile?.phone || '');
  const fallbackName = S.sessionUserName || S.authUsers?.find(u => u.id === S.sessionUserId)?.name || '';
  const name = buildProfileFullName(firstName, lastName) || fallbackName;
  const role = String(v('s-role') || '').trim();
  const inst=normalizeSchoolName(v('s-inst'));
  const finalEducationSections = normalizeEducationSections(
    S.profile?.educationSections
    || SETUP_FLOW.educationSections
    || S.profile?.educationSection
    || SETUP_FLOW.educationSection
    || ''
  );
  const finalEducationSection = finalEducationSections[0] || '';
  const year = String(v('s-year')||'').trim();
  const pRaw = String(v('s-period')||'').trim();
  if(!firstName){ toast('Completa tu nombre',true); return; }
  if(!phoneHasValidDigits(phone)){ toast('Escribe un teléfono válido: (000) 000-0000',true); return; }
  if(!name){ toast('Completa tu nombre',true); return; }
  if(!role){ toast('Completa tu rol',true); return; }
  if(!inst){ toast('Completa la institución',true); return; }
  if(!year){ toast('Completa el año escolar',true); return; }
  if(!pRaw){ toast('Completa el período',true); return; }
  registerSchool(inst);
  renderSchoolSuggestions();
  const normalizedPeriodInput = normTxt(pRaw).replace(/\s+/g, ' ').trim();
  const normalizedPeriodAliases = {
    'p1': 'P1',
    '1er periodo': 'P1',
    'periodo 1': 'P1',
    'primer periodo': 'P1',
    'p2': 'P2',
    '2do periodo': 'P2',
    'periodo 2': 'P2',
    'segundo periodo': 'P2',
    'p3': 'P3',
    '3er periodo': 'P3',
    'periodo 3': 'P3',
    'tercer periodo': 'P3',
    'p4': 'P4',
    '4to periodo': 'P4',
    'periodo 4': 'P4',
    'cuarto periodo': 'P4',
  };
  const pid = normalizedPeriodAliases[normalizedPeriodInput]
    || (S.periods || DEFAULT_PERIODS).find((period) => normTxt(period.id) === normalizedPeriodInput)?.id
    || (S.periods || DEFAULT_PERIODS).find((period) => normTxt(period.name) === normalizedPeriodInput)?.id;
  if (!pid) {
    toast('Selecciona un período válido', true);
    return;
  }
  S.profile = {
    name,
    firstName,
    lastName,
    phone,
    role,
    inst,
    year,
    email: S.profile?.email || (S.sessionUserName && S.sessionUserName.includes('@') ? S.sessionUserName : ''),
    period: periodName(pid),
    educationSection: finalEducationSection || '',
    educationSections: finalEducationSections,
    educationSectionLocked: false,
    teachingProfile: {
      center: inst,
      educationLevels: finalEducationSections,
      areas: uniqueValues(S.profile?.teachingProfile?.areas || []),
      grades: uniqueValues(S.profile?.teachingProfile?.grades || []),
      subjects: uniqueValues(S.profile?.subjects || []),
    },
  };
  ensureIndividualLicenseModel();
  applyEducationSectionTheme(finalEducationSections);
  S.schoolYear = {id:year, name:year};
  S.activePeriodId = pid;
  ensurePeriodBuckets(pid);
  persist();
  closeM('m-setup');
  if (!finalEducationSection) {
    toast('Ahora selecciona tu nivel educativo para continuar.', 'warning');
    openEducationSectionSetup({ fromAuth: true });
    return;
  }
  updateSBUser();
  go('dashboard');
  toast('¡Perfil guardado!');
}
// Gestiona matricula exists.
function matriculaExists(mat, excludeId=null) {
  const m = formatMatricula(mat);
  if (!m) return false;
  return S.estudiantes.some(e => e.id!==excludeId && formatMatricula(e.matricula)===m);
}
// Normaliza normalizar sección asignatura name.
function normalizeSectionSubjectName(value) {
  const clean = String(value || '').trim();
  return clean || 'General';
}
// Convierte un grado interno al payload que espera SQL.
function mapGradeToSqlPayload(grade, schoolId) {
  return {
    schoolId,
    educationLevel: String(grade?.educationLevel || 'Primaria').trim() || 'Primaria',
    name: String(grade?.name || '').trim(),
    ordinal: Number.isFinite(Number(grade?.gradeLevel)) ? Number(grade.gradeLevel) : Number.isFinite(Number(grade?.ordinal)) ? Number(grade.ordinal) : null,
  };
}
// Convierte una sección interna al payload que espera SQL.
function mapSectionToSqlPayload(section, schoolId, gradeId) {
  return {
    schoolId,
    gradeId,
    name: String(section?.sec || section?.name || '').trim(),
    subjectArea: String(section?.area || '').trim() || null,
    subjectName: String(section?.materia || '').trim() || null,
    teacherUserId: String(section?.teacherUserId || S.sessionUserId || '').trim() || null,
  };
}
// Convierte un estudiante interno al payload que espera SQL.
function mapStudentToSqlPayload(student, schoolId, gradeId, sectionId) {
  return {
    schoolId,
    gradeId,
    sectionId,
    enrollmentCode: String(student?.matricula || '').trim() || null,
    firstName: String(student?.nombre || '').trim(),
    lastName: String(student?.apellido || '').trim(),
    middleName: String(student?.middleName || '').trim() || null,
    birthDate: String(student?.birthDate || '').trim() || null,
    status: String(student?.status || 'active').trim() || 'active',
  };
}
// Comprueba si SQL uuid like.
function isSqlUuidLike(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '').trim());
}
// Asegura asegurar SQL escuela id for perfil.
async function ensureSqlSchoolIdForProfile() {
  const context = await ensureSqlAcademicContext();
  return String(context?.schoolId || '').trim();
}
// Sincroniza SQL grado crear or actualizar.
async function syncSqlGradeCreateOrUpdate(grade, localSection = null) {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return { grade: null, section: null };
  const schoolId = await ensureSqlSchoolIdForProfile();
  if (!schoolId) return { grade: null, section: null };
  const gradePayload = mapGradeToSqlPayload(grade, schoolId);
  const shouldUpdateGrade = isSqlUuidLike(grade?.id) && typeof window.AulaBaseSqlApi.updateGrade === 'function';
  const sqlGrade = shouldUpdateGrade
    ? await window.AulaBaseSqlApi.updateGrade(grade.id, gradePayload)
    : await window.AulaBaseSqlApi.createGrade(gradePayload);
  let sqlSection = null;
  if (localSection) {
    const sectionPayload = mapSectionToSqlPayload(localSection, schoolId, sqlGrade?.id || grade?.id || '');
    const shouldUpdateSection = isSqlUuidLike(localSection?.id) && typeof window.AulaBaseSqlApi.updateSection === 'function';
    sqlSection = shouldUpdateSection
      ? await window.AulaBaseSqlApi.updateSection(localSection.id, sectionPayload)
      : await window.AulaBaseSqlApi.createSection(sectionPayload);
  }
  return { grade: sqlGrade || null, section: sqlSection || null };
}
// Sincroniza SQL sección crear or actualizar.
async function syncSqlSectionCreateOrUpdate(section) {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return null;
  const schoolId = await ensureSqlSchoolIdForProfile();
  if (!schoolId) return null;
  const payload = mapSectionToSqlPayload(section, schoolId, section?.gradeId || '');
  return isSqlUuidLike(section?.id) && typeof window.AulaBaseSqlApi.updateSection === 'function'
    ? window.AulaBaseSqlApi.updateSection(section.id, payload)
    : window.AulaBaseSqlApi.createSection(payload);
}
// Sincroniza SQL estudiante crear or actualizar.
async function syncSqlStudentCreateOrUpdate(student) {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return null;
  const schoolId = await ensureSqlSchoolIdForProfile();
  if (!schoolId) return null;
  const payload = mapStudentToSqlPayload(student, schoolId, student?.gradeId || '', student?.sectionId || student?.courseId || '');
  return isSqlUuidLike(student?.id) && typeof window.AulaBaseSqlApi.updateStudent === 'function'
    ? window.AulaBaseSqlApi.updateStudent(student.id, payload)
    : window.AulaBaseSqlApi.createStudent(payload);
}
// Sincroniza SQL grado eliminar.
async function syncSqlGradeDelete(gradeId) {
  if (!window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.deleteGrade !== 'function') return null;
  const schoolId = await ensureSqlSchoolIdForProfile();
  if (!schoolId) return null;
  return window.AulaBaseSqlApi.deleteGrade(gradeId, { schoolId });
}
// Sincroniza SQL sección eliminar.
async function syncSqlSectionDelete(sectionId) {
  if (!window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.deleteSection !== 'function') return null;
  const schoolId = await ensureSqlSchoolIdForProfile();
  if (!schoolId) return null;
  return window.AulaBaseSqlApi.deleteSection(sectionId, { schoolId });
}
// Sincroniza SQL estudiante eliminar.
async function syncSqlStudentDelete(studentId) {
  if (!window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.deleteStudent !== 'function') return null;
  const schoolId = await ensureSqlSchoolIdForProfile();
  if (!schoolId) return null;
  return window.AulaBaseSqlApi.deleteStudent(studentId, { schoolId });
}
const SQL_ACADEMIC_MIRROR_SYNC = {
  inFlight: false,
  pending: false,
};
// Convierte una actividad interna al payload que espera SQL.
function mapActivityToSqlPayload(activity, meta = {}) {
  return {
    schoolId: String(meta.schoolId || '').trim(),
    sectionId: String(meta.sectionId || activity?.courseId || '').trim(),
    teacherUserId: String(meta.teacherUserId || '').trim() || null,
    periodId: String(meta.periodId || activity?.periodId || 'P1').trim() || 'P1',
    blockKey: String(meta.blockKey || '').trim() || null,
    name: String(activity?.name || '').trim(),
    description: String(activity?.desc || activity?.description || '').trim() || null,
    points: Number.isFinite(Number(activity?.pts)) ? Number(activity.pts) : 0,
    activityType: String(activity?.tipo || activity?.activityType || '').trim() || null,
    scheduledDate: String(activity?.fecha || activity?.scheduledDate || '').trim() || null,
  };
}
// Normaliza normalizar SQL evaluation calificación percent.
function normalizeSqlEvaluationScorePercent(evaluation, activity = null) {
  const explicit = Number(evaluation?.scorePercent ?? evaluation?.score_percent);
  if (Number.isFinite(explicit)) return explicit;
  const score = Number(evaluation?.activityScore ?? evaluation?.score ?? 0);
  const max = Number(activity?.pts ?? evaluation?.activityPoints ?? 0);
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null;
  return round2((score / max) * 100);
}
// Convierte una evaluación interna al payload que espera SQL.
function mapEvaluationToSqlPayload(evaluation, meta = {}) {
  const activity = meta.activity || null;
  const activityScore = Number(evaluation?.activityScore ?? evaluation?.score ?? 0);
  const activityPoints = Number(activity?.pts ?? evaluation?.activityPoints ?? 0);
  const payload = {
    ...JSON.parse(JSON.stringify(evaluation || {})),
    activityPoints,
    activityScore: Number.isFinite(activityScore) ? activityScore : 0,
  };
  return {
    schoolId: String(meta.schoolId || '').trim(),
    sectionId: String(meta.sectionId || evaluation?.groupId || evaluation?.courseId || '').trim(),
    activityId: String(evaluation?.activityId || '').trim(),
    studentId: String(evaluation?.studentId || '').trim(),
    periodId: String(evaluation?.periodId || 'P1').trim() || 'P1',
    score: Number.isFinite(activityScore) ? activityScore : 0,
    scorePercent: normalizeSqlEvaluationScorePercent(evaluation, activity),
    notes: String(evaluation?.teacherCommentGeneral || evaluation?.notes || '').trim() || null,
    payload,
    evaluatedAt: String(evaluation?.evaluatedAt || evaluation?.timestamp || evaluation?.createdAt || '').trim() || null,
  };
}
// Convierte filas SQL de evaluaciones en el formato interno de la app.
function buildEvaluationsSnapshot(rows = []) {
  return (rows || []).map((row) => {
    let payload = {};
    try {
      payload = row?.payload && typeof row.payload === 'object' ? row.payload : JSON.parse(String(row?.payload || '{}'));
    } catch (_) {
      payload = {};
    }
    const score = Number.isFinite(Number(row?.score)) ? Number(row.score) : Number(payload?.activityScore ?? 0);
    const evaluation = {
      id: String(row?.id || payload?.id || uid()).trim(),
      schoolId: String(row?.school_id || payload?.schoolId || '').trim(),
      sectionId: String(row?.section_id || payload?.sectionId || payload?.groupId || payload?.courseId || '').trim(),
      groupId: String(payload?.groupId || row?.section_id || '').trim(),
      courseId: String(payload?.courseId || row?.section_id || '').trim(),
      activityId: String(row?.activity_id || payload?.activityId || '').trim(),
      instrumentId: String(payload?.instrumentId || '').trim() || null,
      studentId: String(row?.student_id || payload?.studentId || '').trim(),
      periodId: String(row?.period_id || payload?.periodId || 'P1').trim() || 'P1',
      values: payload?.values && typeof payload.values === 'object' ? JSON.parse(JSON.stringify(payload.values)) : {},
      totalScore: Number.isFinite(Number(payload?.totalScore)) ? Number(payload.totalScore) : Number(payload?.total ?? 0),
      maxScore: Number.isFinite(Number(payload?.maxScore)) ? Number(payload.maxScore) : null,
      total: Number.isFinite(Number(payload?.total)) ? Number(payload.total) : Number(payload?.totalScore ?? 0),
      perCriterion: Array.isArray(payload?.perCriterion) ? JSON.parse(JSON.stringify(payload.perCriterion)) : [],
      teacherCommentGeneral: String(payload?.teacherCommentGeneral || row?.notes || '').trim(),
      activityScore: score,
      score,
      scorePercent: Number.isFinite(Number(row?.score_percent)) ? Number(row.score_percent) : normalizeSqlEvaluationScorePercent({ ...payload, score, activityScore: score }, null),
      notes: String(row?.notes || payload?.notes || '').trim(),
      payload,
      evaluatedAt: String(row?.evaluated_at || payload?.evaluatedAt || '').trim() || null,
      createdAt: String(row?.created_at || payload?.createdAt || '').trim() || null,
      updatedAt: String(row?.updated_at || payload?.updatedAt || '').trim() || null,
    };
    return evaluation;
  }).filter((evaluation) => evaluation.activityId && evaluation.studentId);
}
// Reconstruye el mapa de notas a partir de las evaluaciones SQL.
function buildNotasByPeriodFromEvaluations(rows = []) {
  const notasByPeriod = {};
  (rows || []).forEach((row) => {
    const periodId = String(row?.period_id || row?.periodId || 'P1').trim() || 'P1';
    const studentId = String(row?.student_id || row?.studentId || '').trim();
    const activityId = String(row?.activity_id || row?.activityId || '').trim();
    const score = Number.isFinite(Number(row?.score)) ? Number(row.score) : Number(row?.payload?.activityScore ?? row?.payload?.score ?? 0);
    if (!studentId || !activityId) return;
    if (!notasByPeriod[periodId]) notasByPeriod[periodId] = {};
    if (!notasByPeriod[periodId][studentId]) notasByPeriod[periodId][studentId] = {};
    notasByPeriod[periodId][studentId][activityId] = score;
  });
  return notasByPeriod;
}
// Sincroniza SQL actividad crear or actualizar.
async function syncSqlActivityCreateOrUpdate(activity, meta = {}) {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  const payload = mapActivityToSqlPayload(activity, {
    ...meta,
    schoolId: context.schoolId,
    teacherUserId: context.userId || meta.teacherUserId || '',
  });
  if (!payload.sectionId || !payload.name) return null;
  const shouldUpdate = isSqlUuidLike(activity?.id) && typeof window.AulaBaseSqlApi.updateActivity === 'function';
  return shouldUpdate
    ? window.AulaBaseSqlApi.updateActivity(activity.id, payload)
    : window.AulaBaseSqlApi.createActivity(payload);
}
// Sincroniza SQL actividad eliminar.
async function syncSqlActivityDelete(activityId) {
  if (!window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.deleteActivity !== 'function') return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return window.AulaBaseSqlApi.deleteActivity(activityId, { schoolId: context.schoolId });
}
// Sincroniza SQL evaluation upsert.
async function syncSqlEvaluationUpsert(evaluation, meta = {}) {
  if (!window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.upsertEvaluations !== 'function') return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  const sectionId = String(meta.sectionId || evaluation?.groupId || evaluation?.courseId || '').trim();
  if (!sectionId) return null;
  let activity = meta.activity || null;
  if (!activity && evaluation?.activityId) {
    const found = findActivity(evaluation.activityId, sectionId, evaluation?.periodId || S.activePeriodId);
    activity = found?.activity || null;
  }
  if (activity?.id) {
    await syncSqlActivityCreateOrUpdate(activity, {
      schoolId: context.schoolId,
      sectionId,
      periodId: String(meta.periodId || evaluation?.periodId || S.activePeriodId || 'P1').trim() || 'P1',
      blockKey: meta.blockKey || null,
    });
  }
  const payload = mapEvaluationToSqlPayload(evaluation, {
    schoolId: context.schoolId,
    sectionId,
    activity,
  });
  if (!payload.activityId || !payload.studentId) return null;
  return window.AulaBaseSqlApi.upsertEvaluations(payload);
}
// Sincroniza SQL evaluations eliminar.
async function syncSqlEvaluationsDelete(filters = {}) {
  if (!window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.deleteEvaluations !== 'function') return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return window.AulaBaseSqlApi.deleteEvaluations({
    schoolId: context.schoolId,
    ...filters,
  });
}
// Sincroniza SQL actividades and evaluations for activo usuario.
async function syncSqlActivitiesAndEvaluationsForActiveUser() {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return false;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return false;
  if (SQL_ACADEMIC_MIRROR_SYNC.inFlight) {
    SQL_ACADEMIC_MIRROR_SYNC.pending = true;
    return false;
  }
  SQL_ACADEMIC_MIRROR_SYNC.inFlight = true;
  try {
    for (const [periodId, groups] of Object.entries(S.periodGroupConfigs || {})) {
      for (const [sectionId, cfg] of Object.entries(groups || {})) {
        for (const blockKey of BLOCKS) {
          for (const activity of (cfg?.[blockKey]?.activities || [])) {
            await syncSqlActivityCreateOrUpdate(activity, {
              schoolId: context.schoolId,
              sectionId,
              periodId,
              blockKey,
            });
          }
        }
      }
    }
    for (const evaluation of (Array.isArray(S.evaluations) ? S.evaluations : [])) {
      await syncSqlEvaluationUpsert(evaluation, {
        sectionId: evaluation.groupId || evaluation.courseId || '',
        periodId: evaluation.periodId || S.activePeriodId || 'P1',
      });
    }
    return true;
  } catch (error) {
    console.warn('[AulaBase][sql-api] No se pudo sincronizar actividades/evaluaciones con SQL', error);
    return false;
  } finally {
    SQL_ACADEMIC_MIRROR_SYNC.inFlight = false;
    if (SQL_ACADEMIC_MIRROR_SYNC.pending) {
      SQL_ACADEMIC_MIRROR_SYNC.pending = false;
      scheduleNonCriticalTask(() => syncSqlActivitiesAndEvaluationsForActiveUser(), 120);
    }
  }
}
const SQL_ATTENDANCE_SYNC_RUNTIME = {
  timers: new Map(),
  inFlight: new Map(),
  pending: new Set(),
};
// Normaliza normalizar SQL asistencia mes key.
function normalizeSqlAttendanceMonthKey(monthKey) {
  return String(monthKey || '').trim().slice(0, 7);
}
// Construye construir SQL asistencia mes rows.
function buildSqlAttendanceMonthRows(sectionId, monthKey) {
  const normalizedMonth = normalizeSqlAttendanceMonthKey(monthKey);
  const sectionRecord = S.attendance?.records?.[sectionId]?.[normalizedMonth];
  if (!sectionId || !normalizedMonth || !sectionRecord || typeof sectionRecord !== 'object') return [];

  const rows = [];
  const pushRow = (studentId, attendanceDate, status, reason = null) => {
    const cleanStudentId = String(studentId || '').trim();
    const cleanDate = String(attendanceDate || '').trim().slice(0, 10);
    const cleanStatus = normalizeSqlAttendanceStatus(status || '');
    const cleanReason = String(reason || '').trim() || null;
    if (!cleanStudentId || !cleanDate || !cleanStatus || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) return;
    rows.push({
      studentId: cleanStudentId,
      attendanceDate: cleanDate,
      status: cleanStatus,
      reason: cleanReason,
    });
  };

  if (Array.isArray(sectionRecord.slotDays) && sectionRecord.studentCodes && typeof sectionRecord.studentCodes === 'object') {
    const slotDays = Array.isArray(sectionRecord.slotDays) ? sectionRecord.slotDays : [];
    const slotMeta = Array.isArray(sectionRecord.slotMeta) ? sectionRecord.slotMeta : [];
    Object.entries(sectionRecord.studentCodes || {}).forEach(([studentId, codes]) => {
      if (!Array.isArray(codes)) return;
      codes.forEach((code, slotIndex) => {
        const day = normalizeAttendanceV2DayValue(slotDays[slotIndex] || '');
        const status = normalizeSqlAttendanceStatus(code || '');
        if (!day || !status) return;
        const meta = typeof normalizeAttendanceV2SlotMeta === 'function'
          ? normalizeAttendanceV2SlotMeta(slotMeta[slotIndex] || '')
          : { reason: '' };
        pushRow(studentId, `${normalizedMonth}-${day.padStart(2, '0')}`, status, meta?.reason || '');
      });
    });
    return rows;
  }

  Object.entries(sectionRecord || {}).forEach(([studentId, days]) => {
    if (!days || typeof days !== 'object' || Array.isArray(days)) return;
    Object.entries(days).forEach(([attendanceDate, status]) => {
      pushRow(studentId, attendanceDate, status, null);
    });
  });
  return rows;
}
// Sincroniza SQL asistencia mes.
async function syncSqlAttendanceMonth(sectionId, monthKey, options = {}) {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return null;
  const schoolId = await ensureSqlSchoolIdForProfile();
  const cleanSectionId = String(sectionId || '').trim();
  const normalizedMonth = normalizeSqlAttendanceMonthKey(monthKey);
  if (!schoolId || !cleanSectionId || !/^\d{4}-\d{2}$/.test(normalizedMonth)) return null;
  if (options?.clear) {
    return window.AulaBaseSqlApi.clearAttendanceMonth({
      schoolId,
      sectionId: cleanSectionId,
      monthKey: normalizedMonth,
    });
  }
  const rows = buildSqlAttendanceMonthRows(cleanSectionId, normalizedMonth);
  return window.AulaBaseSqlApi.replaceAttendanceMonth({
    schoolId,
    sectionId: cleanSectionId,
    monthKey: normalizedMonth,
    rows,
  });
}
// Gestiona cancel SQL asistencia mes sync.
function cancelSqlAttendanceMonthSync(sectionId, monthKey) {
  const key = `${String(sectionId || '').trim()}::${normalizeSqlAttendanceMonthKey(monthKey)}`;
  const timer = SQL_ATTENDANCE_SYNC_RUNTIME.timers.get(key);
  if (timer) window.clearTimeout(timer);
  SQL_ATTENDANCE_SYNC_RUNTIME.timers.delete(key);
  SQL_ATTENDANCE_SYNC_RUNTIME.pending.delete(key);
}
// Programa programar SQL asistencia mes sync.
function scheduleSqlAttendanceMonthSync(sectionId, monthKey) {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return;
  const cleanSectionId = String(sectionId || '').trim();
  const normalizedMonth = normalizeSqlAttendanceMonthKey(monthKey);
  if (!cleanSectionId || !/^\d{4}-\d{2}$/.test(normalizedMonth)) return;
  const key = `${cleanSectionId}::${normalizedMonth}`;
  cancelSqlAttendanceMonthSync(cleanSectionId, normalizedMonth);
  const timer = window.setTimeout(() => {
    SQL_ATTENDANCE_SYNC_RUNTIME.timers.delete(key);
    if (SQL_ATTENDANCE_SYNC_RUNTIME.inFlight.get(key)) {
      SQL_ATTENDANCE_SYNC_RUNTIME.pending.add(key);
      return;
    }
    SQL_ATTENDANCE_SYNC_RUNTIME.inFlight.set(key, true);
    syncSqlAttendanceMonth(cleanSectionId, normalizedMonth)
      .catch((error) => {
        console.warn('[AulaBase][sql-api] No se pudo sincronizar asistencia con SQL', error);
      })
      .finally(() => {
        SQL_ATTENDANCE_SYNC_RUNTIME.inFlight.delete(key);
        if (SQL_ATTENDANCE_SYNC_RUNTIME.pending.has(key)) {
          SQL_ATTENDANCE_SYNC_RUNTIME.pending.delete(key);
          scheduleSqlAttendanceMonthSync(cleanSectionId, normalizedMonth);
        }
      });
  }, 220);
  SQL_ATTENDANCE_SYNC_RUNTIME.timers.set(key, timer);
}
// Migra migrar sección references.
function migrateSectionReferences(oldId, newId) {
  if (!oldId || !newId || oldId === newId) return;
  Object.keys(S.periodGroupConfigs || {}).forEach((pid) => {
    const periodCfg = S.periodGroupConfigs[pid];
    if (!periodCfg || !Object.prototype.hasOwnProperty.call(periodCfg, oldId)) return;
    periodCfg[newId] = periodCfg[oldId];
    delete periodCfg[oldId];
  });
  if (Object.prototype.hasOwnProperty.call(SECTION_STUDENT_PANEL_OPEN, oldId)) {
    SECTION_STUDENT_PANEL_OPEN[newId] = SECTION_STUDENT_PANEL_OPEN[oldId];
    delete SECTION_STUDENT_PANEL_OPEN[oldId];
  }
  if (RECENT_CREATED_SECTION.id === oldId) {
    RECENT_CREATED_SECTION.id = newId;
  }
}
// Guarda una sección y sincroniza su estado local y remoto.
function saveSec() {
  const gradeId=document.getElementById('sec-g')?.value, s=v('sec-s');
  if(!gradeId||!s){ toast('Completa grado y sección',true); return; }
  const g=S.grades.find(x=>x.id===gradeId);
  if(!g){ toast('Grado inválido',true); return; }
  const secLetter = parseSection(s);
  const materia = normalizeSectionSubjectName(v('sec-m'));
  const area = String(document.getElementById('sec-area')?.value || '').trim();
  const room = normalizeSpanishDraftText(v('sec-room'), { preserveCase: true }).trim();
  if (!area) { toast('Selecciona el área de la asignatura', true); return; }
  if (!materia || materia === 'General') { toast('Selecciona la asignatura de la sección', true); return; }
  if (S.secciones.some(sec=>sec.gradeId===gradeId && parseSection(sec.sec)===secLetter && normTxt(normalizeSectionSubjectName(sec.materia))===normTxt(materia))) {
    toast('Ya existe esa asignatura en esa sección', true); return;
  }
  const sec={id:uid(), gradeId, grado:g.name, gradeLevel:g.gradeLevel||parseGradeLevel(g.name), sec:secLetter, sectionLetter:secLetter, materia, area, room};
  S.secciones.push(sec);
  g.sections = g.sections || [];
  g.sections.push({id:sec.id, name:sec.sec, sectionLetter:secLetter, materia:sec.materia, area: sec.area, room: sec.room || ''});
  ensurePeriodsAndYear();
  (S.periods||DEFAULT_PERIODS).forEach(p=>{
    ensurePeriodBuckets(p.id);
    S.periodGroupConfigs[p.id][sec.id] = emptyGroupCfg();
  });
  ensurePeriodBuckets(S.activePeriodId);
  S.activeGroupId = sec.id;
  S.activeCourseId = sec.id;
  S.activeGradeId = sec.gradeId;
  SECTION_STUDENT_PANEL_OPEN[sec.id] = true;
  markRecentCreatedSection(sec.id);
  syncSqlSectionCreateOrUpdate(sec)
    .then((sqlSection) => {
      if (sqlSection?.id && sqlSection.id !== sec.id) {
        const oldSectionId = sec.id;
        sec.id = sqlSection.id;
        S.activeGroupId = sqlSection.id;
        S.activeCourseId = sqlSection.id;
        migrateSectionReferences(oldSectionId, sec.id);
        S.secciones = S.secciones.map((entry) => (entry.id === oldSectionId ? sec : entry));
        g.sections = g.sections.map((entry) => (entry.id === oldSectionId ? { ...entry, id: sec.id } : entry));
      }
    })
    .catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo sincronizar la seccion con SQL', error);
    })
    .finally(() => {
      persist();
      closeM('m-sec');
      go('estudiantes');
      toast('Sección creada');
    });
}
// Guarda un grado y sincroniza su estado local y remoto.
async function saveGrade() {
  const name=v('gr-grade-num');
  const educationLevel=normalizeEducationLevelName(v('gr-edu-level'));
  const sectionValue = String(v('gr-section') || '').trim();
  const sectionLetter = parseSection(sectionValue);
  const area = String(document.getElementById('gr-area')?.value || '').trim();
  const materia = normalizeSectionSubjectName(document.getElementById('gr-subject')?.value || '');
  const room = normalizeSpanishDraftText(v('gr-room'), { preserveCase: true }).trim();
  const allowedSections = getActiveEducationSections();
  if(!name || !educationLevel){ toast('Selecciona nivel y grado',true); return; }
  if(!sectionValue){ toast('Completa la sección académica',true); return; }
  if(!area){ toast('Selecciona el área curricular',true); return; }
  if(!materia || materia === 'General'){ toast('Selecciona la asignatura del grado',true); return; }
  if (allowedSections.length && !allowedSections.some((level) => normTxt(level) === normTxt(educationLevel))) {
    toast(`Este grado no coincide con los niveles activos de tu perfil (${allowedSections.join(', ')}).`, true);
    return;
  }
  if(S.grades.some(g=>normTxt(g.name)===normTxt(name) && normTxt(normalizeEducationLevelName(g.educationLevel))===normTxt(educationLevel))){
    toast('Ese grado ya existe en ese nivel',true); return;
  }
  const grade = {
    id:uid(),
    name,
    gradeLevel:resolveGradeLevelRank(name, educationLevel),
    educationLevel,
    subjectName:materia,
    sections:[],
  };
  const section = {
    id:uid(),
    gradeId: grade.id,
    grado: grade.name,
    gradeLevel: grade.gradeLevel || parseGradeLevel(grade.name),
    sec: sectionLetter,
    sectionLetter,
    materia,
    area,
    room,
  };
  S.grades.push(grade);
  S.secciones.push(section);
  grade.sections.push({
    id: section.id,
    name: section.sec,
    sectionLetter,
    materia: section.materia,
    area: section.area,
    room: section.room || '',
  });
  ensurePeriodsAndYear();
  (S.periods||DEFAULT_PERIODS).forEach(p=>{
    ensurePeriodBuckets(p.id);
    S.periodGroupConfigs[p.id][section.id] = emptyGroupCfg();
  });
  ensurePeriodBuckets(S.activePeriodId);
  S.activeGradeId = grade.id;
  S.activeGroupId = section.id;
  S.activeCourseId = section.id;
  SECTION_STUDENT_PANEL_OPEN[section.id] = true;
  markRecentCreatedSection(section.id);
  try {
    const sqlResult = await syncSqlGradeCreateOrUpdate(grade, section);
    if (sqlResult?.grade?.id && sqlResult.grade.id !== grade.id) {
      const oldGradeId = grade.id;
      grade.id = sqlResult.grade.id;
      section.gradeId = sqlResult.grade.id;
      S.periodGroupConfigs = S.periodGroupConfigs || {};
      Object.keys(S.periodGroupConfigs || {}).forEach((pid) => {
        if (!S.periodGroupConfigs[pid]) return;
        S.periodGroupConfigs[pid][section.id] = S.periodGroupConfigs[pid][section.id] || emptyGroupCfg();
      });
      S.estudiantes.forEach((student) => {
        if (student.gradeId === oldGradeId) student.gradeId = section.gradeId;
      });
    }
    if (sqlResult?.section?.id && sqlResult.section.id !== section.id) {
      const oldSectionId = section.id;
      section.id = sqlResult.section.id;
      S.secciones = S.secciones.map((entry) => (entry.id === oldSectionId ? section : entry));
      grade.sections = grade.sections.map((entry) => (entry.id === oldSectionId ? { ...entry, id: section.id } : entry));
      migrateSectionReferences(oldSectionId, section.id);
      S.estudiantes.forEach((student) => {
        if ((student.courseId || student.sectionId || student.seccionId) === oldSectionId) {
          student.courseId = section.id;
          student.sectionId = section.id;
          student.seccionId = section.id;
          student.gradeId = section.gradeId;
        }
      });
    }
  } catch (error) {
    console.warn('[AulaBase][sql-api] No se pudo sincronizar el grado con SQL', error);
  }
  persist();
  closeM('m-grade');
  go('estudiantes');
  toast('Grado creado con su configuración académica inicial');
}
window.saveGrade = saveGrade;
// Abre el flujo guiado para crear un curso inicial.
function openOnboardingCreateCourseFlow() {
  go('estudiantes', { animatePanelTransition: true });
  window.setTimeout(() => {
    forceCloseM('m-student-add-mode');
    forceCloseM('m-est');
    forceCloseM('m-est-bulk');
    go('grade-setup');
  }, 120);
}
// Abre el modal para elegir cómo agregar estudiantes.
function openStudentAddModeModal() {
  openM('m-student-add-mode');
}
// Abre el flujo guiado para agregar estudiantes.
function openOnboardingAddStudentsFlow() {
  go('estudiantes', { animatePanelTransition: true });
  window.setTimeout(() => {
    forceCloseM('m-grade');
    forceCloseM('m-est');
    forceCloseM('m-est-bulk');
    openStudentAddModeModal();
  }, 120);
}
// Gestiona choose estudiante add mode.
function chooseStudentAddMode(mode) {
  forceCloseM('m-student-add-mode');
  const targetSecId = S.activeGroupId || S.activeCourseId || '';
  if (mode === 'bulk') {
    openBulkEstM(targetSecId);
    return;
  }
  openEstM(targetSecId);
}
// Abre abrir est m.
function openEstM(secId) {
  const targetSecId = secId || S.activeGroupId;
  if (targetSecId) {
    openM('m-est', {courseId: targetSecId});
    return;
  }
  const gradeSections = sectionsForGrade(S.activeGradeId);
  if (gradeSections.length===0) {
    toast('Crea una sección para este grado antes de registrar estudiantes', true);
    openSecM(S.activeGradeId || null);
    return;
  }
  openM('m-est', {courseId: gradeSections[0].id});
}
// Guarda un estudiante nuevo en el grupo activo.
async function saveEst(options = {}) {
  const keepOpen = options?.keepOpen === true;
  const nom=v('e-nom'), ape=v('e-ape');
  if(!nom||!ape){ toast('Nombre y apellido requeridos',true); return; }
  const mat = formatMatricula(v('e-mat'));
  const matInput = document.getElementById('e-mat');
  if (matInput) matInput.value = mat;
  if(!mat){ toast('Matrícula requerida',true); return; }
  if(!isValidMatricula(mat)){ toast('Formato de matrícula inválido. Usa 00-0000-0',true); return; }
  if(matriculaExists(mat)){ toast('Matrícula ya existe',true); return; }
  const selectedSecId = document.getElementById('e-sec')?.value;
  if(!selectedSecId){ toast('Selecciona una sección',true); return; }
  const secId = resolveRosterSectionId(selectedSecId);
  const sec = S.secciones.find(s=>s.id===secId);
  const photoUrl = String(document.getElementById('e-photo-data')?.value || '').trim();
  const student = {id:uid(), nombre:nom, apellido:ape, matricula:mat, photoUrl, courseId:secId, seccionId:secId, sectionId:secId, gradeId:sec?.gradeId||null};
  S.estudiantes.push(student);
  S.activeGroupId = selectedSecId;
  S.activeCourseId = selectedSecId;
  SECTION_STUDENT_PANEL_OPEN[secId] = true;
  upsertStudentDirectoryEntry(student, secId);
  try {
    const sqlStudent = await syncSqlStudentCreateOrUpdate(student);
    if (sqlStudent?.id && sqlStudent.id !== student.id) {
      student.id = sqlStudent.id;
    }
  } catch (error) {
    console.warn('[AulaBase][sql-api] No se pudo sincronizar el estudiante con SQL', error);
  }
  persist();
  go('estudiantes');
  if (keepOpen) {
    resetForm('student', {courseId: selectedSecId});
    const nameInput = document.getElementById('e-nom');
    if (nameInput && typeof nameInput.focus === 'function') nameInput.focus();
    toast('Estudiante registrado. Listo para agregar otro.');
    return;
  }
  closeM('m-est');
  toast('Estudiante registrado');
}
// Abre el modal de carga masiva desde la vista de estudiantes.
function openBulkFromEstModal() {
  const secId = document.getElementById('e-sec')?.value || S.activeGroupId || '';
  closeM('m-est');
  openBulkEstM(secId);
}
const BULK_IMPORT_STATE = {
  mode: 'text',
  analyzed: false,
  entries: [],
  sourceName: '',
  lastRows: 0,
};
// Obtiene masiva policy.
function getBulkPolicy() {
  return document.querySelector('input[name="be-policy"]:checked')?.value || 'valid';
}
// Obtiene masiva dup mode.
function getBulkDupMode() {
  return document.querySelector('input[name="be-dup-mode"]:checked')?.value || 'skip';
}
// Actualiza masiva input mode.
function setBulkInputMode(mode = 'text') {
  BULK_IMPORT_STATE.mode = mode === 'file' ? 'file' : 'text';
  const textWrap = document.getElementById('be-text-wrap');
  const fileWrap = document.getElementById('be-file-wrap');
  const textBtn = document.getElementById('be-mode-text');
  const fileBtn = document.getElementById('be-mode-file');
  if (textWrap) textWrap.hidden = BULK_IMPORT_STATE.mode !== 'text';
  if (fileWrap) fileWrap.hidden = BULK_IMPORT_STATE.mode !== 'file';
  if (textBtn) textBtn.classList.toggle('on', BULK_IMPORT_STATE.mode === 'text');
  if (fileBtn) fileBtn.classList.toggle('on', BULK_IMPORT_STATE.mode === 'file');
}
// Gestiona reset masiva preview.
function resetBulkPreview() {
  BULK_IMPORT_STATE.analyzed = false;
  BULK_IMPORT_STATE.entries = [];
  BULK_IMPORT_STATE.sourceName = '';
  BULK_IMPORT_STATE.lastRows = 0;
  const wrap = document.getElementById('be-preview-wrap');
  const body = document.getElementById('be-preview-body');
  const summary = document.getElementById('be-summary');
  const downloadBtn = document.getElementById('be-errors-download');
  if (wrap) wrap.hidden = true;
  if (body) body.innerHTML = '';
  if (summary) summary.textContent = 'Sin analizar';
  if (downloadBtn) downloadBtn.hidden = true;
}
// Gestiona re analyze masiva if needed.
function reAnalyzeBulkIfNeeded() {
  if (!BULK_IMPORT_STATE.analyzed) return;
  analyzeBulkInput();
}
// Gestiona descarga masiva template.
function downloadBulkTemplate() {
  const rows = [
    'matricula,nombre,apellido',
    '00-0001-1,Juan,Perez',
    '00-0002-3,Maria,Lopez',
    '00-0003-5,Carlos,Diaz',
  ].join('\n');
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla-carga-masiva-estudiantes.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
// Normaliza normalizar masiva header key.
function normalizeBulkHeaderKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}
// Analiza analizar csv line.
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}
// Gestiona split masiva estudiante name.
function splitBulkStudentName(fullName) {
  const clean = String(fullName||'').trim().replace(/\s+/g,' ');
  if (!clean) return {nombre:'', apellido:''};
  const parts = clean.split(' ');
  if (parts.length===1) return {nombre:parts[0], apellido:'(Sin apellido)'};
  return {nombre:parts[0], apellido:parts.slice(1).join(' ')};
}
// Normaliza normalizar masiva line.
function normalizeBulkLine(line) {
  return String(line || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
    .trim();
}
// Analiza analizar masiva estudiante line.
function parseBulkStudentLine(line) {
  const raw = normalizeBulkLine(line);
  if (!raw) return {skip:true};
  const matMatch = raw.match(/(\d{2}\s*-\s*\d{4}\s*-\s*\d|\b\d{7}\b)/);
  if (!matMatch) return {error:'Sin matrícula válida'};
  const mat = formatMatricula(matMatch[1].replace(/\s+/g, ''));
  if (!isValidMatricula(mat)) return {error:'Matrícula inválida'};
  const namePart = raw.replace(matMatch[1], ' ').replace(/[;,|]+/g,' ').trim();
  if (!namePart) return {error:'Sin nombre'};
  const nm = splitBulkStudentName(namePart);
  if (!nm.nombre) return {error:'Sin nombre'};
  return {nombre:nm.nombre, apellido:nm.apellido, matricula:mat};
}
// Analiza analizar masiva mapped row.
function parseBulkMappedRow(row) {
  const matRaw = row.matricula || row.matriculaid || row.mat || row.codigo || '';
  const matricula = formatMatricula(String(matRaw).trim());
  if (!matricula) return { error: 'Sin matrícula válida' };
  if (!isValidMatricula(matricula)) return { error: 'Matrícula inválida' };
  const fullName = row.nombrecompleto || row.nombreyapellido || row.fullname || '';
  let nombre = row.nombre || row.nombres || row.firstname || '';
  let apellido = row.apellido || row.apellidos || row.lastname || '';
  if (!nombre && fullName) {
    const split = splitBulkStudentName(fullName);
    nombre = split.nombre;
    apellido = split.apellido;
  }
  if (!nombre) return { error: 'Sin nombre' };
  if (!apellido) apellido = '(Sin apellido)';
  return { matricula, nombre: String(nombre).trim(), apellido: String(apellido).trim() };
}
// Construye construir masiva header mapear.
function buildBulkHeaderMap(headerRow) {
  const map = {};
  headerRow.forEach((cell, idx) => {
    const key = normalizeBulkHeaderKey(cell);
    if (key) map[idx] = key;
  });
  return map;
}
// Gestiona header looks like header.
function headerLooksLikeHeader(headerMap = {}) {
  const keys = Object.values(headerMap);
  return keys.some((k) => ['matricula', 'matriculaid', 'mat', 'codigo', 'nombre', 'nombres', 'apellido', 'apellidos', 'nombrecompleto'].includes(k));
}
// Lee masiva file rows.
async function readBulkFileRows(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'csv') {
    const text = await file.text();
    return text.split(/\r?\n/).map((line) => parseCsvLine(line));
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const xlsx = await ensureXlsxLibrary();
    const buffer = await file.arrayBuffer();
    const wb = xlsx.read(buffer, { type: 'array' });
    const first = wb.SheetNames[0];
    if (!first) return [];
    return xlsx.utils.sheet_to_json(wb.Sheets[first], { header: 1, defval: '' });
  }
  throw new Error('Formato no soportado. Usa CSV o XLSX.');
}
// Gestiona classify masiva entries.
function classifyBulkEntries(entries = [], targetSectionId = '') {
  const dupMode = getBulkDupMode();
  const seen = new Set();
  return entries.map((entry) => {
    if (entry.status === 'error') return entry;
    const key = String(entry.matricula || '').toLowerCase();
    if (seen.has(key)) return { ...entry, status: 'error', detail: 'Matrícula repetida en el archivo' };
    seen.add(key);
    const existingStudent = findStudentByMatricula(entry.matricula);
    if (!existingStudent) return { ...entry, status: 'new', detail: 'Se agregará' };
    const existingSectionId = existingStudent.sectionId || existingStudent.seccionId || existingStudent.courseId || '';
    const existingLabel = existingSectionId ? getGroupLabel(existingSectionId) : 'otra sección';
    const sameRoster = !!targetSectionId && shareRosterBetweenSections(existingSectionId, targetSectionId);
    const sameSection = !!targetSectionId && existingSectionId === targetSectionId;
    if (sameRoster) {
      return {
        ...entry,
        status: 'skip',
        sameRoster: true,
        detail: sameSection
          ? 'Ya existe en esta misma materia'
          : `Ya forma parte de esta sección compartida desde ${existingLabel}`,
      };
    }
    if (dupMode === 'update') {
      return {
        ...entry,
        status: 'update',
        detail: sameSection ? 'Se actualizará en esta misma sección' : `Se moverá desde ${existingLabel} a la sección seleccionada`,
      };
    }
    return {
      ...entry,
      status: 'skip',
      detail: sameSection ? 'Ya existe en esta sección' : `Ya existe en ${existingLabel} (omitido). Usa "Actualizar existentes" para moverlo.`,
    };
  });
}
// Gestiona find estudiante by matricula.
function findStudentByMatricula(mat) {
  const key = normalizeMatricula(mat);
  return (S.estudiantes || []).find((s) => normalizeMatricula(s.matricula) === key) || null;
}
// Gestiona summarize masiva entries.
function summarizeBulkEntries(entries = []) {
  const summary = { total: entries.length, new: 0, update: 0, skip: 0, error: 0 };
  entries.forEach((e) => {
    if (e.status === 'new') summary.new++;
    else if (e.status === 'update') summary.update++;
    else if (e.status === 'skip') summary.skip++;
    else if (e.status === 'error') summary.error++;
  });
  return summary;
}
// Renderiza renderizar masiva preview.
function renderBulkPreview(entries = []) {
  const wrap = document.getElementById('be-preview-wrap');
  const body = document.getElementById('be-preview-body');
  const summaryEl = document.getElementById('be-summary');
  const downloadBtn = document.getElementById('be-errors-download');
  if (!body || !summaryEl || !wrap) return;
  const summary = summarizeBulkEntries(entries);
  summaryEl.textContent = `Total ${summary.total} · Nuevos ${summary.new} · Actualizar ${summary.update} · Omitidos ${summary.skip} · Errores ${summary.error}`;
  body.innerHTML = entries.map((e) => {
    const badge = e.status === 'new' ? '<span class="pill p-green">Nuevo</span>'
      : e.status === 'update' ? '<span class="pill p-amber">Actualizar</span>'
      : e.status === 'skip' ? '<span class="pill p-gray">Omitido</span>'
      : '<span class="pill p-rose">Error</span>';
    return `<tr>
      <td>${e.row}</td>
      <td>${escapeHtml(e.matricula || '?')}</td>
      <td>${escapeHtml([e.nombre, e.apellido].filter(Boolean).join(' '))}</td>
      <td>${badge}</td>
      <td>${escapeHtml(e.detail || '')}</td>
    </tr>`;
  }).join('');
  wrap.hidden = entries.length === 0;
  if (downloadBtn) downloadBtn.hidden = !entries.some((e) => e.status === 'error' || e.status === 'skip');
}
// Gestiona analyze masiva input.
async function analyzeBulkInput() {
  try {
    const secId = document.getElementById('be-sec')?.value;
    if (!secId) { toast('Selecciona una sección', true); return false; }
    let baseEntries = [];
    if (BULK_IMPORT_STATE.mode === 'text') {
      const list = (document.getElementById('be-list')?.value || '').trim();
      if (!list) { toast('Pega la lista de estudiantes', true); return false; }
      const lines = list.split(/\r?\n/);
      baseEntries = lines.map((line, idx) => {
        const parsed = parseBulkStudentLine(line);
        if (parsed.skip) return null;
        if (parsed.error) return { row: idx + 1, status: 'error', detail: parsed.error, matricula: '', nombre: '', apellido: '' };
        return { row: idx + 1, status: 'parsed', detail: '', ...parsed };
      }).filter(Boolean);
      BULK_IMPORT_STATE.sourceName = 'texto pegado';
    } else {
      const file = document.getElementById('be-file')?.files?.[0];
      if (!file) { toast('Selecciona un archivo CSV o XLSX', true); return false; }
      let rows = [];
      try {
        rows = await readBulkFileRows(file);
      } catch (error) {
        toast(`${error.message || 'No se pudo leer el archivo'}`, true);
        return false;
      }
      if (!rows.length) { toast('El archivo no tiene datos', true); return false; }
      const headerMap = buildBulkHeaderMap(rows[0] || []);
      const hasHeader = headerLooksLikeHeader(headerMap);
      const start = hasHeader ? 1 : 0;
      for (let idx = start; idx < rows.length; idx++) {
        const row = rows[idx] || [];
        const clean = row.map((v) => String(v ?? '').trim()).filter(Boolean);
        if (!clean.length) continue;
        if (hasHeader) {
          const obj = {};
          row.forEach((val, col) => {
            const key = headerMap[col];
            if (!key) return;
            obj[key] = String(val ?? '').trim();
          });
          const parsed = parseBulkMappedRow(obj);
          if (parsed.error) baseEntries.push({ row: idx + 1, status: 'error', detail: parsed.error, matricula: '', nombre: '', apellido: '' });
          else baseEntries.push({ row: idx + 1, status: 'parsed', detail: '', ...parsed });
        } else {
          const parsed = parseBulkStudentLine(clean.join(', '));
          if (parsed.skip) continue;
          if (parsed.error) baseEntries.push({ row: idx + 1, status: 'error', detail: parsed.error, matricula: '', nombre: '', apellido: '' });
          else baseEntries.push({ row: idx + 1, status: 'parsed', detail: '', ...parsed });
        }
      }
      BULK_IMPORT_STATE.sourceName = file.name;
    }
    const classified = classifyBulkEntries(baseEntries, secId);
    BULK_IMPORT_STATE.entries = classified;
    BULK_IMPORT_STATE.lastRows = classified.length;
    BULK_IMPORT_STATE.analyzed = true;
    renderBulkPreview(classified);
    if (!classified.length) {
      toast('No se encontraron filas utilizables', true);
      return false;
    }
    return true;
  } catch (error) {
    reportError('bulk-students-analyze', error, { fallback: 'No se pudo analizar la carga masiva.' });
    return false;
  }
}
// Gestiona descarga masiva error registrar.
function downloadBulkErrorReport() {
  // Gestiona bad.
  const bad = (BULK_IMPORT_STATE.entries || []).filter((e) => e.status === 'error' || e.status === 'skip');
  if (!bad.length) { toast('No hay errores para descargar.', true); return; }
  const lines = ['fila,matricula,nombre,apellido,estado,detalle'];
  bad.forEach((e) => {
    lines.push([
      e.row,
      `"${String(e.matricula || '').replace(/"/g, '""')}"`,
      `"${String(e.nombre || '').replace(/"/g, '""')}"`,
      `"${String(e.apellido || '').replace(/"/g, '""')}"`,
      e.status,
      `"${String(e.detail || '').replace(/"/g, '""')}"`,
    ].join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte-carga-masiva-errores.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
// Abre el modal de carga masiva de estudiantes.
function openBulkEstM(secId) {
  const gradeSections = sectionsForGrade(S.activeGradeId);
  if (!secId && gradeSections.length===0) {
    toast('Crea una sección para este grado antes de cargar estudiantes', true);
    openSecM(S.activeGradeId || null);
    return;
  }
  const options = secId ? sortCourses(getScopedSections()) : gradeSections;
  fillSel('be-sec', options, s=>s.id, s=>`${s.grado} ${s.sec} · ${s.materia}`, secId || S.activeGroupId || options[0]?.id || '', 'Selecciona');
  const ta = document.getElementById('be-list');
  if (ta) ta.value = '';
  const fi = document.getElementById('be-file');
  if (fi) fi.value = '';
  setBulkInputMode('text');
  resetBulkPreview();
  openM('m-est-bulk');
}
// Procesa procesar masiva file change.
function handleBulkFileChange(input) {
  if (!input?.files?.[0]) return;
  setBulkInputMode('file');
  resetBulkPreview();
}
// Guarda guardar masiva est.
async function saveBulkEst() {
  try {
    const selectedSecId = document.getElementById('be-sec')?.value;
    if (!selectedSecId) { toast('Selecciona una sección', true); return; }
    const secId = resolveRosterSectionId(selectedSecId);
    if (!BULK_IMPORT_STATE.analyzed) {
      const ok = await analyzeBulkInput();
      if (!ok) return;
    }
    const entries = BULK_IMPORT_STATE.entries || [];
    if (!entries.length) { toast('No hay filas para procesar', true); return; }
    const policy = getBulkPolicy();
    const summary = summarizeBulkEntries(entries);
    if (policy === 'stop' && summary.error > 0) {
      toast('Hay errores en la lista. Corrígelos o usa "Cargar solo válidos".', true);
      return;
    }
    const sec = S.secciones.find(s=>s.id===secId);
    let added = 0;
    let updated = 0;
    for (const e of entries) {
      if (e.status === 'new') {
        const student = {
          id:uid(),
          nombre:e.nombre,
          apellido:e.apellido,
          matricula:e.matricula,
          courseId:secId,
          seccionId:secId,
          sectionId:secId,
          gradeId:sec?.gradeId||null
        };
        try {
          const sqlStudent = await syncSqlStudentCreateOrUpdate(student);
          if (sqlStudent?.id && sqlStudent.id !== student.id) student.id = sqlStudent.id;
        } catch (error) {
          console.warn('[AulaBase][sql-api] No se pudo sincronizar un estudiante de carga masiva con SQL', error);
        }
        S.estudiantes.push(student);
        upsertStudentDirectoryEntry(student, secId);
        added++;
        continue;
      }
      if (e.status === 'update') {
        const existing = findStudentByMatricula(e.matricula);
        if (!existing) continue;
        existing.nombre = e.nombre;
        existing.apellido = e.apellido;
        existing.matricula = e.matricula;
        existing.courseId = secId;
        existing.sectionId = secId;
        existing.seccionId = secId;
        existing.gradeId = sec?.gradeId || null;
        existing.gradeLevel = sec?.gradeLevel || parseGradeLevel(sec?.grado || '');
        try {
          await syncSqlStudentCreateOrUpdate(existing);
        } catch (error) {
          console.warn('[AulaBase][sql-api] No se pudo actualizar un estudiante de carga masiva en SQL', error);
        }
        upsertStudentDirectoryEntry(existing, secId);
        updated++;
      }
    }
    if (!added && !updated) {
      const sharedCount = entries.filter((entry) => entry.sameRoster).length;
      if (sharedCount > 0 && sharedCount === entries.length) {
        toast('Estos estudiantes ya están disponibles en esta materia porque comparten la misma sección real.', true);
        return;
      }
      if (summary.skip > 0 && summary.error === 0) {
        toast('Todos los estudiantes ya existen. Si quieres pasarlos a esta sección, usa "Actualizar existentes".', true);
        return;
      }
      toast('No hubo estudiantes para cargar con la configuración elegida.', true);
      return;
    }
    S.activeGroupId = selectedSecId;
    S.activeCourseId = selectedSecId;
    SECTION_STUDENT_PANEL_OPEN[secId] = true;
    persist();
    closeM('m-est-bulk');
    go('estudiantes');
    toast(`Carga masiva completada (${added} nuevos, ${updated} actualizados, ${summary.skip} omitidos, ${summary.error} errores)`);
  } catch (error) {
    reportError('bulk-students-save', error, { fallback: 'No se pudo completar la carga masiva de estudiantes.' });
  }
}
// Abre el modal para editar un estudiante.
function openEditStudent(stId) {
  const st = S.estudiantes.find(e=>e.id===stId);
  if(!st) return;
  fillSel('ee-sec', sortCourses(getScopedSections()), s=>s.id, s=>`${s.grado} ${s.sec} · ${s.materia}`, st.courseId||st.sectionId||st.seccionId);
  document.getElementById('ee-id').value = st.id;
  document.getElementById('ee-nom').value = st.nombre || '';
  document.getElementById('ee-ape').value = st.apellido || '';
  document.getElementById('ee-mat').value = formatMatricula(st.matricula || '');
  setStudentPhotoField('ee', st.photoUrl || '', `${st.nombre || ''} ${st.apellido || ''}`.trim());
  const photoInput = document.getElementById('ee-photo-file');
  if (photoInput) photoInput.value = '';
  openM('m-est-edit');
}
// Reabre el modal de edición del estudiante desde la vista previa.
function openEditStudentFromView() {
  const stId = document.getElementById('sv-id')?.value || '';
  if (!stId) return;
  closeM('m-est-view');
  openEditStudent(stId);
}
// Abre la vista detallada de un estudiante.
function openViewStudent(stId) {
  const st = S.estudiantes.find(e=>e.id===stId);
  if(!st) return;
  const storedSecId = st.courseId || st.sectionId || st.seccionId || '';
  const preferredSecId = shareRosterBetweenSections(storedSecId, S.activeGroupId) ? S.activeGroupId : storedSecId;
  const secId = preferredSecId || storedSecId;
  const sec = S.secciones.find(s=>s.id===secId);
  const grade = S.grades.find(g=>g.id===(sec?.gradeId || st.gradeId));
  const subjectLabels = getRosterSubjectLabels(secId);
  const courseLabels = getRosterCourseLabels(secId);
  const performanceEntries = getStudentPerformanceEntries(st.id, secId);
  const courseLabel = courseLabels.join(' | ') || (sec ? `${grade?.name || sec.grado || '?'} ${sec.sec || ''} ? ${sec.materia || 'General'}`.trim() : '?');
  const fullName = `${st.nombre || ''} ${st.apellido || ''}`.trim();
  const final = secId ? studentFinal(st.id, secId) : null;
  const status = final===null ? 'Sin notas' : final>=75 ? 'Aprobado' : final>=60 ? 'En riesgo' : 'Reprobado';

  // Actualiza texto.
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  // Actualiza HTML.
  const setHtml = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  };
  setText('sv-name', fullName || '?');
  setText('sv-hero-name', fullName || '?');
  setText('sv-mat', st.matricula || '?');
  setText('sv-grade', grade?.name || '?');
  setText('sv-section', sec?.sec || '?');
  setHtml('sv-subject', renderStudentViewTagList(subjectLabels.length ? subjectLabels : [sec?.materia || 'General'], 'student-view-tag'));
  setHtml('sv-course', renderStudentViewTagList(courseLabels.length ? courseLabels : [courseLabel], 'student-view-course-tag'));
  setHtml('sv-hero-course', renderStudentViewTagList(courseLabels.length ? courseLabels : [courseLabel], 'student-view-hero-tag'));
  setHtml('sv-final', renderStudentMetricList(performanceEntries.length ? performanceEntries : [{
    subject: sec?.materia || 'General',
    final,
    status,
  }], 'final'));
  setHtml('sv-status', renderStudentMetricList(performanceEntries.length ? performanceEntries : [{
    subject: sec?.materia || 'General',
    final,
    status,
  }], 'status'));
  const idEl = document.getElementById('sv-id');
  if (idEl) idEl.value = st.id;
  const photoEl = document.getElementById('sv-photo');
  if (photoEl) photoEl.src = String(st.photoUrl || '').trim() || buildStudentAvatarDataUrl(fullName);
  const photoInput = document.getElementById('sv-photo-file');
  if (photoInput) photoInput.value = '';
  openM('m-est-view');
}
// Guarda los cambios de un estudiante existente.
async function saveEditStudent() {
  const id = v('ee-id');
  const st = S.estudiantes.find(e=>e.id===id);
  if(!st) return;
  const nom=v('ee-nom'), ape=v('ee-ape');
  const mat = formatMatricula(v('ee-mat'));
  const matInput = document.getElementById('ee-mat');
  if (matInput) matInput.value = mat;
  if(!nom||!ape){ toast('Nombre y apellido requeridos',true); return; }
  if(!mat){ toast('Matrícula requerida',true); return; }
  if(!isValidMatricula(mat)){ toast('Formato de matrícula inválido. Usa 00-0000-0',true); return; }
  if(matriculaExists(mat, id)){ toast('Matrícula ya existe',true); return; }
  const selectedSecId = document.getElementById('ee-sec')?.value;
  if(!selectedSecId){ toast('Selecciona una sección',true); return; }
  const secId = resolveRosterSectionId(selectedSecId);
  const sec = S.secciones.find(s=>s.id===secId);
  st.nombre = nom;
  st.apellido = ape;
  st.matricula = mat;
  st.photoUrl = String(document.getElementById('ee-photo-data')?.value || '').trim();
  st.courseId = secId;
  st.sectionId = secId;
  st.seccionId = secId;
  st.gradeId = sec?.gradeId || null;
  st.gradeLevel = sec?.gradeLevel || parseGradeLevel(sec?.grado||'');
  upsertStudentDirectoryEntry(st, secId);
  try {
    await syncSqlStudentCreateOrUpdate(st);
  } catch (error) {
    console.warn('[AulaBase][sql-api] No se pudo actualizar el estudiante en SQL', error);
  }
  persist(); closeM('m-est-edit'); go('estudiantes'); toast('Estudiante actualizado');
}
// Abre el modal para editar un grado.
function openEditGrade(gradeId) {
  const g = S.grades.find(x=>x.id===gradeId);
  if(!g) return;
  const edLevel = normalizeEducationLevelName(g.educationLevel);
  document.getElementById('eg-id').value = g.id;
  document.getElementById('eg-edu-level').value = edLevel;
  document.getElementById('eg-grade-num').value = g.name || '1ro';
  openM('m-grade-edit');
}
// Guarda los cambios de un grado existente.
async function saveEditGrade() {
  const id=v('eg-id');
  const g = S.grades.find(x=>x.id===id);
  if(!g) return;
  const name = v('eg-grade-num');
  const educationLevel = normalizeEducationLevelName(v('eg-edu-level'));
  const lvl=parseGradeLevel(name);
  if(!name || !educationLevel){ toast('Completa nivel educativo y grado', true); return; }
  if(S.grades.some(x=>x.id!==id && normTxt(x.name)===normTxt(name) && normTxt(normalizeEducationLevelName(x.educationLevel))===normTxt(educationLevel))){ toast('Ya existe otro grado con ese nivel educativo', true); return; }
  g.name = name;
  g.gradeLevel = lvl;
  g.educationLevel = educationLevel;
  S.secciones.filter(s=>s.gradeId===id).forEach(sec=>{
    sec.grado = name;
    sec.gradeLevel = lvl;
  });
  S.estudiantes.forEach(st=>{
    if(st.gradeId===id) st.gradeLevel = lvl;
  });
  try {
    await syncSqlGradeCreateOrUpdate(g);
  } catch (error) {
    console.warn('[AulaBase][sql-api] No se pudo actualizar el grado en SQL', error);
  }
  persist(); closeM('m-grade-edit'); go('estudiantes'); toast('Grado actualizado');
}
// Abre el modal de asignatura dentro de un grado.
function openSubjectInGrade(gradeId = S.activeGradeId, sectionId = S.activeGroupId) {
  // Gestiona sec.
  const sec = (S.secciones || []).find((section) => section.id === sectionId);
  openM('m-sec', {
    gradeId: gradeId || sec?.gradeId || '',
    sec: sec?.sec || '',
    materia: '',
    area: sec?.area || lessonPlanAreaFromGroup(sec) || '',
  });
}
// Abre el modal para editar una sección.
function openEditSection(sectionId) {
  const sec = S.secciones.find(s=>s.id===sectionId);
  if(!sec) return;
  const sortedGrades = getSortedGrades();
  fillSel('es-gid', sortedGrades, g=>g.id, g=>g.name, sec.gradeId, 'Selecciona grado');
  document.getElementById('es-id').value = sec.id;
  document.getElementById('es-sec').value = sec.sec || '';
  const areaEl = document.getElementById('es-area');
  if (areaEl) areaEl.value = sec.area || lessonPlanAreaFromGroup(sec) || '';
  refreshSectionCurriculumForm('es', false);
  document.getElementById('es-area').value = sec.area || lessonPlanAreaFromGroup(sec) || '';
  refreshSectionCurriculumForm('es', false);
  document.getElementById('es-mat').value = sec.materia || '';
  document.getElementById('es-room').value = sec.room || '';
  openM('m-sec-edit');
}
// Guarda los cambios de una sección existente.
async function saveEditSection() {
  const id=v('es-id');
  const sec = S.secciones.find(s=>s.id===id);
  if(!sec) return;
  const gradeId=document.getElementById('es-gid')?.value;
  const secLetter=parseSection(v('es-sec'));
  const mat=normalizeSectionSubjectName(v('es-mat'));
  const area = String(document.getElementById('es-area')?.value || '').trim();
  const room = normalizeSpanishDraftText(v('es-room'), { preserveCase: true }).trim();
  if(!gradeId || !secLetter){ toast('Completa grado y sección', true); return; }
  if(!area){ toast('Selecciona el área de la asignatura', true); return; }
  if(!mat || mat === 'General'){ toast('Selecciona la asignatura de la sección', true); return; }
  if(S.secciones.some(s=>s.id!==id && s.gradeId===gradeId && parseSection(s.sec)===secLetter && normTxt(normalizeSectionSubjectName(s.materia))===normTxt(mat))){ toast('Ya existe esa asignatura en esa sección', true); return; }
  const gr = S.grades.find(g=>g.id===gradeId);
  sec.gradeId = gradeId;
  sec.grado = gr?.name || sec.grado;
  sec.gradeLevel = gr?.gradeLevel || parseGradeLevel(gr?.name||sec.grado);
  sec.sec = secLetter;
  sec.sectionLetter = secLetter;
  sec.materia = mat;
  sec.area = area;
  sec.room = room;
  S.estudiantes.forEach(st=>{
    if ((st.courseId||st.sectionId||st.seccionId)===id) {
      st.courseId = id;
      st.sectionId = id;
      st.seccionId = id;
      st.gradeId = sec.gradeId;
      st.gradeLevel = sec.gradeLevel;
    }
  });
  // rebuild grade.sections helper arrays
  S.grades.forEach(g=>g.sections=[]);
  S.secciones.forEach(s=>{
    const g=S.grades.find(x=>x.id===s.gradeId);
    if(g){
      g.sections = g.sections || [];
      if(!g.sections.find(x=>x.id===s.id)) g.sections.push({id:s.id, name:s.sec, sectionLetter:s.sectionLetter, materia:s.materia, area:s.area, room:s.room || ''});
    }
  });
  try {
    await syncSqlSectionCreateOrUpdate(sec);
  } catch (error) {
    console.warn('[AulaBase][sql-api] No se pudo actualizar la seccion en SQL', error);
  }
  persist(); closeM('m-sec-edit'); go('estudiantes'); toast('Sección actualizada');
}
// Guarda una actividad nueva en el bloque activo.
function saveAct() {
  const nom=v('a-nom');
  if(!nom){ toast('Nombre requerido',true); return; }
  if(!S.activeGroupId){ toast('Selecciona/crea un grupo primero', true); return; }
  const blq = document.getElementById('a-blq').value;
  const tipo = v('a-tipo');
  const pts = Math.max(0, round2(parseDecimalInput(v('a-pts'),20)));
  if(pts<=0){ toast('Los puntos deben ser mayores que 0', true); return; }
  const act = {
    id:uid(),
    name:nom,
    courseId:S.activeGroupId,
    periodId:S.activePeriodId,
    pts,
    tipo,
    fecha:v('a-fecha'),
    desc:v('a-obs'),
    producto:'',
    instrumentId:null,
    instrumentIds:[],
    instrumentHistory:[]
  };
  const cfg = getGroupCfg(S.activeGroupId);
  cfg[blq].activities.push(act);
  persist();
  syncSqlActivityCreateOrUpdate(act, {
    sectionId: S.activeGroupId,
    periodId: S.activePeriodId,
    blockKey: blq,
  }).catch((error) => {
    console.warn('[AulaBase][sql-api] No se pudo sincronizar la actividad creada con SQL', error);
  });
  closeM('m-act'); go('config'); toast(`Actividad agregada al bloque ${BNAME[blq]}`);
}
// Guarda la configuración actual como plantilla reutilizable.
function saveTpl() {
  const name=v('tpl-name');
  if(!name){ toast('Nombre requerido',true); return; }
  const snapshot = JSON.parse(JSON.stringify(getGroupCfg(S.activeGroupId)));
  S.templates.push({id:uid(), name, desc:v('tpl-desc'), cfg:snapshot, created: new Date().toLocaleDateString('es-DO')});
  persist(); closeM('m-tpl'); toast('Plantilla guardada');
}
// Abre el modal para crear un usuario.
function openUsrM() {
  openM('m-usr');
}
// Guarda un usuario nuevo en la administración interna.
function saveUsr() {
  const nom=v('u-nom');
  if(!nom){ toast('Nombre requerido',true); return; }
  S.usuarios.push({id:uid(), nombre:nom, email:v('u-email'), rol:v('u-rol'), seccionId:document.getElementById('u-sec')?.value});
  persist(); closeM('m-usr'); go('usuarios'); toast('Usuario creado');
}

/* ------------------------- Configuración de actividades ------------------------- */
function addActToBlock(b) {
  const cfg = getGroupCfg(S.activeGroupId);
  const n = cfg[b].activities.length + 1;
  const act = {
    id:uid(), name:`Actividad ${n}`, courseId:S.activeGroupId, periodId:S.activePeriodId, pts:20, tipo:'', fecha:'', desc:'', producto:'',
    instrumentId:null, instrumentIds:[], instrumentHistory:[]
  };
  cfg[b].activities.push(act);
  persist(); renderActivitiesConfigBlock(b);
  syncSqlActivityCreateOrUpdate(act, {
    sectionId: S.activeGroupId,
    periodId: S.activePeriodId,
    blockKey: b,
  }).catch((error) => {
    console.warn('[AulaBase][sql-api] No se pudo sincronizar la actividad con SQL', error);
  });
}
// Elimina una actividad del bloque y limpia sus notas.
function removeActFromBlock(b, actId) {
  const cfg = getGroupCfg(S.activeGroupId);
  cfg[b].activities = cfg[b].activities.filter(a=>a.id!==actId);
  // clean notes for this act
  Object.keys(S.notas).forEach(eid => { if(S.notas[eid]) delete S.notas[eid][actId]; });
  S.evaluations = S.evaluations.filter(e=>!(e.activityId===actId && (e.periodId||'P1')===S.activePeriodId));
  persist(); renderActivitiesConfigBlock(b);
  syncSqlActivityDelete(actId).catch((error) => {
    console.warn('[AulaBase][sql-api] No se pudo eliminar la actividad en SQL', error);
  });
  syncSqlEvaluationsDelete({
    sectionId: S.activeGroupId,
    periodId: S.activePeriodId,
    activityId: actId,
  }).catch((error) => {
    console.warn('[AulaBase][sql-api] No se pudieron eliminar las evaluaciones en SQL', error);
  });
}
// Actualiza los puntos de una actividad del bloque.
function updateActPts(b, actId, val, rerender=true) {
  const act = getGroupCfg(S.activeGroupId)[b].activities.find(a=>a.id===actId);
  if(act){
    const n = Math.max(0, round2(parseDecimalInput(val,0)));
    act.pts = n;
    persist();
    if (rerender) renderActivitiesConfigProgress(b);
    syncSqlActivityCreateOrUpdate(act, {
      sectionId: S.activeGroupId,
      periodId: S.activePeriodId,
      blockKey: b,
    }).catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo actualizar la actividad en SQL', error);
    });
  }
}
// Actualiza el nombre de una actividad del bloque.
function updateActName(b, actId, val) {
  const act = getGroupCfg(S.activeGroupId)[b].activities.find(a=>a.id===actId);
  if(act){
    act.name=val;
    persist();
    syncSqlActivityCreateOrUpdate(act, {
      sectionId: S.activeGroupId,
      periodId: S.activePeriodId,
      blockKey: b,
    }).catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo actualizar la actividad en SQL', error);
    });
  }
}
// Actualiza el meta/peso del bloque.
function updateMeta(b, val) {
  getGroupCfg(S.activeGroupId)[b].meta = parseInt(val)||100; persist(); renderActivitiesConfigProgress(b);
}
// Activa o desactiva la normalización del bloque.
function toggleNormalize(b, checked) {
  getGroupCfg(S.activeGroupId)[b].normalize = checked; persist(); renderActivitiesConfigProgress(b);
}
// Ajusta automáticamente los puntos de todas las actividades del bloque.
function autoAdjustBlock(b) {
  const acts = getGroupCfg(S.activeGroupId)[b].activities;
  if(acts.length===0) return;
  const meta = blockMeta(b);
  const base = Math.floor(meta / acts.length);
  const rem  = meta - base * acts.length;
  acts.forEach((a,i)=>{ a.pts = base + (i<rem?1:0); });
  persist(); renderActivitiesConfigBlock(b); toast(`Bloque ${BNAME[b]} autoajustado a ${meta} pts`);
}
// Ajusta automáticamente todos los bloques.
function autoAdjustAll() {
  BLOCKS.forEach(b => autoAdjustBlock(b));
  toast('Todos los bloques ajustados automáticamente');
}
// Aplica una plantilla guardada al grupo activo.
function applyTemplate(tplId) {
  const tpl = S.templates.find(t=>t.id===tplId);
  if(!tpl) return;
  if(!confirm(`¿Aplicar la plantilla "${tpl.name}"? Esto reemplazará la configuración actual.`)) return;
  if(!S.activeGroupId){ toast('Selecciona un grupo', true); return; }
  ensurePeriodBuckets(S.activePeriodId);
  S.periodGroupConfigs[S.activePeriodId][S.activeGroupId] = JSON.parse(JSON.stringify(tpl.cfg));
  S.groupConfigs = S.periodGroupConfigs[S.activePeriodId];
  persist(); go('config'); toast(`Plantilla "${tpl.name}" aplicada`);
}
// Devuelve las clases de planificación de un grupo para una fecha.
function lessonPlanClassesForDate(groupId, dateKey) {
  ensureLessonPlansState();
  return (S.lessonPlans || [])
    .filter((plan) => lessonPlanStoredGroupId(plan) === groupId)
    .flatMap((plan) => (plan.classes || []).filter((lessonClass) => lessonClass.date === dateKey).map((lessonClass) => ({ plan, lessonClass })));
}
/* set nota */
function setNota(estId, actId, val, maxPts, inputEl) {
  const max = parseDecimalInput(maxPts, 0);
  let v = round2(parseDecimalInput(val, 0));
  if(v>max){v=max; inputEl.value=fmtNum(max);}
  if(v<0){v=0; inputEl.value='0';}
  if(!S.notas[estId]) S.notas[estId]={};
  S.notas[estId][actId] = v;
  const est = S.estudiantes.find(x=>x.id===estId);
  const gid = est?.sectionId || est?.seccionId || S.activeGroupId;
  const activity = findActivity(actId, gid, S.activePeriodId)?.activity || null;
  upsertLocalEvaluationRecord({
    activityId: actId,
    studentId: estId,
    groupId: gid,
    courseId: gid,
    periodId: S.activePeriodId,
    activityScore: v,
    score: v,
    scorePercent: max > 0 ? round2((v / max) * 100) : null,
    notes: '',
    payload: { source: 'manual-note', activityId: actId, studentId: estId, score: v },
  });
  persist();
  inputEl.className = 'si '+scoreClass(v, maxPts);
  // update block total cell
  BLOCKS.forEach(b=>{
    const rawMax = blockRawMax(b, gid);
    const raw = studentBlockRaw(estId, b, gid);
    const score = doNormalize(b, gid)&&rawMax>0 ? Math.round(raw/rawMax*blockMeta(b,gid)) : raw;
    const cel = document.getElementById(`bt-${estId}-${b}`);
    if(cel){ cel.textContent = score; }
  });
  // update final
  const fin = studentFinal(estId, gid);
  const {l,c} = getGrade(fin);
  const finEl = document.getElementById(`fin-${estId}`);
  const letEl = document.getElementById(`let-${estId}`);
  if(finEl) finEl.textContent = fin!==null?fin:'?';
  if(letEl) letEl.innerHTML = fin!==null?`<span class="gb ${c}">${l}</span>`:'?';
  refreshTop();
  syncSqlEvaluationUpsert({
    activityId: actId,
    studentId: estId,
    groupId: gid,
    courseId: gid,
    periodId: S.activePeriodId,
    activityScore: v,
    score: v,
    scorePercent: max > 0 ? round2((v / max) * 100) : null,
    notes: '',
    payload: { source: 'manual-note', activityId: actId, studentId: estId, score: v },
  }, { sectionId: gid, periodId: S.activePeriodId, activity });
}

/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   RENDERERS
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
const RENDERS = {};

RENDERS.miperfil = (view) => {
  view.innerHTML = `
    <!-- Bento Grid Layout for Settings -->
    <div class="grid grid-cols-12 gap-8 py-4">
      <!-- User Profile Hero Card -->
      <section class="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-10 shadow-[0_20px_40px_rgba(41,52,58,0.04)] relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div class="relative z-10">
          <div class="flex flex-col md:flex-row gap-10 items-start">
            <!-- Profile Image Section -->
            <div class="relative group">
              <div class="w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img alt="User profile avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqgF8W03GVSl1s0uMO25gzT5qMvqhaF4UbhGqfWhpCLkdtQiMKVVcFIXWMSfsLxSKZpslEH8HIoCqMbZ3L2RFw2CjbyrwNaALnCiYjmTWkVQGFLlRj_u-uNsR_tZN1qjtg9SbKYhuMVd8_NBdLiz96W7G3-urcDlunBHB52FgG4PmQ4ugjTUdyEY952lx7s-L69B2XsxXjXmq4KRszxoaPbqpuLxEQy26nT4BNoatAGU4AcCqrbaWAeb3sfwC_w_3lUQ0xWGLg_HSf"/>
              </div>
              <button class="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-surface-container-high hover:bg-surface-container-low transition-colors group-hover:scale-110 duration-200">
                <span class="material-symbols-outlined text-secondary text-xl">photo_camera</span>
              </button>
            </div>
            <!-- Form Fields -->
            <div class="flex-1 w-full space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-[11px] font-bold uppercase tracking-wider text-outline px-1">Nombre Completo</label>
                  <input class="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface font-medium focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" type="text" value="Alejandro Rivera"/>
                </div>
                <div class="space-y-2">
                  <label class="block text-[11px] font-bold uppercase tracking-wider text-outline px-1">Correo Institucional</label>
                  <input class="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface font-medium focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" type="email" value="a.rivera@aulabase.edu"/>
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-[11px] font-bold uppercase tracking-wider text-outline px-1">Biografía Académica</label>
                <textarea class="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface font-medium focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all resize-none" rows="3">Profesor titular del departamento de Ciencias de la Computación. Especialista en Arquitectura de Software y UX Design.</textarea>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- Quick Stats/Info Card (Asymmetric) -->
      <section class="col-span-12 lg:col-span-4 space-y-6">
        <div class="bg-primary text-on-primary rounded-xl p-8 shadow-xl shadow-primary/20">
          <span class="material-symbols-outlined text-4xl mb-4 opacity-50">verified_user</span>
          <h3 class="text-xl font-bold mb-2">Cuenta Verificada</h3>
          <p class="text-on-primary/70 text-sm leading-relaxed">Tu identidad ha sido confirmada por la institución AulaBase. Tienes acceso total a los recursos docentes.</p>
        </div>
        <div class="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
          <h4 class="text-xs font-bold uppercase tracking-widest text-outline mb-4">Última Actividad</h4>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-secondary mt-1.5"></div>
              <div>
                <p class="text-xs font-bold text-on-surface">Inicio de sesión</p>
                <p class="text-[10px] text-outline">Hace 12 minutos • Madrid, ES</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-outline-variant mt-1.5"></div>
              <div>
                <p class="text-xs font-bold text-on-surface">Cambio de contraseña</p>
                <p class="text-[10px] text-outline">Hace 3 días</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- Security Section -->
      <section class="col-span-12 bg-white rounded-xl p-10 border border-outline-variant/10">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 class="text-xl font-extrabold text-on-surface tracking-tight">Seguridad de la Cuenta</h3>
            <p class="text-sm text-on-surface-variant">Protege tu acceso con credenciales robustas.</p>
          </div>
          <div class="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20">
            <span class="material-symbols-outlined text-secondary text-sm" style="font-variation-settings: 'FILL' 1;">lock</span>
            <span class="text-xs font-bold text-primary">Encriptación activa AES-256</span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-2">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-outline px-1">Contraseña Actual</label>
            <input class="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface font-medium focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="••••••••••••" type="password"/>
          </div>
          <div class="space-y-2">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-outline px-1">Nueva Contraseña</label>
            <input class="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface font-medium focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="Mínimo 8 caracteres" type="password"/>
          </div>
          <div class="space-y-2">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-outline px-1">Confirmar Nueva Contraseña</label>
            <input class="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface font-medium focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="Repite la contraseña" type="password"/>
          </div>
        </div>
        <div class="mt-8 flex justify-end">
          <button class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#050720] text-white font-bold text-sm hover:shadow-xl transition-all active:scale-95">
            <span class="material-symbols-outlined text-lg">key</span>
            Actualizar Credenciales
          </button>
        </div>
      </section>
      <!-- Preferences / Notifications Preview (Small cards) -->
      <section class="col-span-12 md:col-span-6 bg-surface-container-low/50 rounded-xl p-8 border border-outline-variant/5">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-primary">notifications</span>
          </div>
          <div>
            <h4 class="font-bold text-on-surface">Notificaciones Push</h4>
            <p class="text-xs text-on-surface-variant">Alertas de nuevas clases y mensajes.</p>
          </div>
          <div class="ml-auto">
            <label class="relative inline-flex items-center cursor-pointer">
              <input checked="" class="sr-only peer" type="checkbox"/>
              <div class="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
        </div>
      </section>
      <section class="col-span-12 md:col-span-6 bg-surface-container-low/50 rounded-xl p-8 border border-outline-variant/5">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-primary">dark_mode</span>
          </div>
          <div>
            <h4 class="font-bold text-on-surface">Modo Oscuro</h4>
            <p class="text-xs text-on-surface-variant">Cambia el aspecto visual del sistema.</p>
          </div>
          <div class="ml-auto">
            <label class="relative inline-flex items-center cursor-pointer">
              <input class="sr-only peer" type="checkbox"/>
              <div class="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
        </div>
      </section>
    </div>
    <!-- Footer Meta -->
    <footer class="mt-16 text-center">
      <p class="text-[11px] font-bold text-outline-variant uppercase tracking-[0.2em]">AulaBase Dashboard Engine v2.4.0</p>
    </footer>
  `;
};

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

// Detecta cadenas con señales típicas de texto roto por codificación UTF-8/Windows-1252.
function hasMojibakeMarkers(str) {
  if (typeof str !== 'string') return false;
  return /(?:\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]{1,2}|\u00F0[\u0080-\u00BF]{2,3}|\uFFFD)/.test(str);
}
// Detecta palabras o frases en español que quedaron con signos de interrogación o reemplazos parciales.
function hasQuestionMarkWordCorruption(str) {
  if (typeof str !== 'string') return false;
  return /[A-Za-z]\?[A-Za-z]/.test(str)
    || /[A-Za-z]\uFFFD[A-Za-z]/.test(str)
    || /[A-Za-z0-9)]\s+\?\s+[A-Za-z0-9(]/.test(str)
    || /^\?\s+[A-Za-z]/.test(str);
}
// Intenta reinterpretar una cadena como bytes cp1252 para rescatar texto que llegó con doble codificación.
function decodeCp1252Utf8(str) {
  try {
    const bytes = new Uint8Array(Array.from(str, ch => ch.charCodeAt(0) & 255));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (_) {
    return str;
  }
}
// Corrige preguntas y palabras comunes que quedaron convertidas en signos de interrogación durante una importación.
function fixQuestionMarkCorruption(str) {
  if (typeof str !== 'string' || !hasQuestionMarkWordCorruption(str)) return str;
  let fixed = str;
  // Repara signos de apertura en preguntas comunes cuando llegan como '?'.
  fixed = fixed.replace(/(^|[\s"'([{])\?([A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1])/g, '$1\u00BF$2');
  fixed = fixed.replace(/\?\s*Selecciona \u00E1rea\s*\?/gi, 'Selecciona \u00E1rea');
  fixed = fixed.replace(/\?\s*Selecciona asignatura\s*\?/gi, 'Selecciona asignatura');
  fixed = fixed.replace(/^\?\s+M\u00E1s opciones\b/gm, 'M\u00E1s opciones');
  fixed = fixed.replace(/([A-Za-z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F10-9)])\s+\?\s+([A-Za-z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F10-9(])/g, '$1 - $2');
  const replacements = [
    [/\bAq\?\b/g, 'Aqu\u00ED'],
    [/\baq\?\b/g, 'aqu\u00ED'],
    [/\bQu\?\b/g, 'Qu\u00E9'],
    [/\bqu\?\b/g, 'qu\u00E9'],
    [/\baqu\?\b/gi, 'aqu\u00ED'],
    [/per\?odo/gi, 'per\u00EDodo'],
    [/acci\?n/gi, 'acci\u00F3n'],
    [/m\?s/gi, 'm\u00E1s'],
    [/v\?lido/gi, 'v\u00E1lido'],
    [/v\?lida/gi, 'v\u00E1lida'],
    [/inv\?lido/gi, 'inv\u00E1lido'],
    [/inv\?lida/gi, 'inv\u00E1lida'],
    [/m\?ximo/gi, 'm\u00E1ximo'],
    [/m\?nimo/gi, 'm\u00EDnimo'],
    [/r\?pido/gi, 'r\u00E1pido'],
    [/r\?pida/gi, 'r\u00E1pida'],
    [/r\?pidas/gi, 'r\u00E1pidas'],
    [/matr\?cula/gi, 'matr\u00EDcula'],
    [/secci\?n/gi, 'secci\u00F3n'],
    [/a\?o/gi, 'a\u00F1o'],
    [/sesi\?n/gi, 'sesi\u00F3n'],
    [/configuraci\?n/gi, 'configuraci\u00F3n'],
    [/todav\?a/gi, 'todav\u00EDa'],
    [/a\?n/gi, 'a\u00FAn'],
    [/d\?a/gi, 'd\u00EDa'],
    [/d\?as/gi, 'd\u00EDas'],
    [/tel\?fono/gi, 'tel\u00E9fono'],
    [/instituci\?n/gi, 'instituci\u00F3n'],
    [/informaci\?n/gi, 'informaci\u00F3n'],
    [/evaluaci\?n/gi, 'evaluaci\u00F3n'],
    [/planificaci\?n/gi, 'planificaci\u00F3n'],
    [/resoluci\?n/gi, 'resoluci\u00F3n'],
    [/participaci\?n/gi, 'participaci\u00F3n'],
    [/producci\?n/gi, 'producci\u00F3n'],
    [/exposici\?n/gi, 'exposici\u00F3n'],
    [/observaci\?n/gi, 'observaci\u00F3n'],
    [/descripci\?n/gi, 'descripci\u00F3n'],
    [/duraci\?n/gi, 'duraci\u00F3n'],
    [/selecci\?n/gi, 'selecci\u00F3n'],
    [/organizaci\?n/gi, 'organizaci\u00F3n'],
    [/intenci\?n/gi, 'intenci\u00F3n'],
    [/sincronizaci\?n/gi, 'sincronizaci\u00F3n'],
    [/redacci\?n/gi, 'redacci\u00F3n'],
    [/ponderaci\?n/gi, 'ponderaci\u00F3n'],
    [/exportaci\?n/gi, 'exportaci\u00F3n'],
    [/educaci\?n/gi, 'educaci\u00F3n'],
    [/f\?sica/gi, 'f\u00EDsica'],
    [/cient\?fica/gi, 'cient\u00EDfica'],
    [/cient\?fico/gi, 'cient\u00EDfico'],
    [/tecnol\?gica/gi, 'tecnol\u00F3gica'],
    [/tecnolog\?a/gi, 'tecnolog\u00EDa'],
    [/pedag\?gica/gi, 'pedag\u00F3gica'],
    [/acad\?mica/gi, 'acad\u00E9mica'],
    [/did\?ctica/gi, 'did\u00E1ctica'],
    [/autom\?tica/gi, 'autom\u00E1tica'],
    [/autom\?ticamente/gi, 'autom\u00E1ticamente'],
    [/anal\?tica/gi, 'anal\u00EDtica'],
    [/pr\?ctica/gi, 'pr\u00E1ctica'],
    [/b\?sico/gi, 'b\u00E1sico'],
    [/b\?sica/gi, 'b\u00E1sica'],
    [/b\?sicos/gi, 'b\u00E1sicos'],
    [/l\?gico/gi, 'l\u00F3gico'],
    [/cr\?tico/gi, 'cr\u00EDtico'],
    [/cr\?tica/gi, 'cr\u00EDtica'],
    [/t\?rminos/gi, 't\u00E9rminos'],
    [/t\?cnica/gi, 't\u00E9cnica'],
    [/t\?cnicas/gi, 't\u00E9cnicas'],
    [/t\?tulo/gi, 't\u00EDtulo'],
    [/subt\?tulo/gi, 'subt\u00EDtulo'],
    [/s\?ntesis/gi, 's\u00EDntesis'],
    [/an\?lisis/gi, 'an\u00E1lisis'],
    [/m\?todo/gi, 'm\u00E9todo'],
    [/m\?todos/gi, 'm\u00E9todos'],
    [/di\?logo/gi, 'di\u00E1logo'],
    [/g\?nero/gi, 'g\u00E9nero'],
    [/h\?bitos/gi, 'h\u00E1bitos'],
    [/empat\?a/gi, 'empat\u00EDa'],
    [/autonom\?a/gi, 'autonom\u00EDa'],
    [/investigaci\?n/gi, 'investigaci\u00F3n'],
    [/comprensi\?n/gi, 'comprensi\u00F3n'],
    [/curr\?culo/gi, 'curr\u00EDculo'],
    [/apreciaci\?n/gi, 'apreciaci\u00F3n'],
    [/comparaci\?n/gi, 'comparaci\u00F3n'],
    [/relaci\?n/gi, 'relaci\u00F3n'],
    [/caracter\?sticas/gi, 'caracter\u00EDsticas'],
    [/gr\?ficas/gi, 'gr\u00E1ficas'],
    [/qu\?mica/gi, 'qu\u00EDmica'],
    [/biolog\?a/gi, 'biolog\u00EDa'],
    [/geograf\?a/gi, 'geograf\u00EDa'],
    [/filosof\?a/gi, 'filosof\u00EDa'],
    [/estad\?stica/gi, 'estad\u00EDstica'],
    [/trigonometr\?a/gi, 'trigonometr\u00EDa'],
    [/ciudadan\?a/gi, 'ciudadan\u00EDa'],
    [/formaci\?n/gi, 'formaci\u00F3n'],
    [/art\?stica/gi, 'art\u00EDstica'],
    [/dise\?o/gi, 'dise\u00F1o'],
    [/se\?ora/gi, 'se\u00F1ora'],
    [/ma\?ana/gi, 'ma\u00F1ana'],
    [/mi\?rcoles/gi, 'mi\u00E9rcoles'],
    [/s\?bado/gi, 's\u00E1bado'],
    [/mod\?ulos/gi, 'm\u00F3dulos'],
    [/hip\?tesis/gi, 'hip\u00F3tesis'],
    [/prevenci\?n/gi, 'prevenci\u00F3n'],
  ];
  replacements.forEach(([pattern, replacement]) => {
    fixed = fixed.replace(pattern, replacement);
  });
  return fixed;
}
// Sustituye el glyph de reemplazo por letras válidas cuando el texto perdió el carácter original.
function fixReplacementGlyphCorruption(str) {
  if (typeof str !== 'string' || str.indexOf('\uFFFD') === -1) return str;
  const replacements = [
    [/t[\uFFFD]tulo/gi, 't\u00edtulo'],
    [/subt[\uFFFD]tulo/gi, 'subt\u00edtulo'],
    [/modificaci[\uFFFD]n/gi, 'modificaci\u00f3n'],
    [/secci[\uFFFD]n/gi, 'secci\u00f3n'],
    [/planificaci[\uFFFD]n/gi, 'planificaci\u00f3n'],
    [/did[\uFFFD]ctica/gi, 'did\u00e1ctica'],
    [/evaluaci[\uFFFD]n/gi, 'evaluaci\u00f3n'],
    [/dise[\uFFFD]o/gi, 'dise\u00f1o'],
    [/per[\uFFFD]odo/gi, 'per\u00edodo'],
    [/a[\uFFFD]o/gi, 'a\u00f1o'],
    [/d[\uFFFD]a/gi, 'd\u00eda'],
    [/a[\uFFFD]rea/gi, '\u00e1rea'],
    [/sub[\uFFFD]rea/gi, 'sub\u00e1rea'],
    [/espa[\uFFFD]ol/gi, 'espa\u00f1ol'],
    [/espa[\uFFFD]ola/gi, 'espa\u00f1ola'],
    [/matem[\uFFFD]tica/gi, 'matem\u00e1tica'],
    [/educaci[\uFFFD]n/gi, 'educaci\u00f3n'],
    [/f[\uFFFD]sica/gi, 'f\u00edsica'],
    [/l[\uFFFD]gico/gi, 'l\u00f3gico'],
    [/cr[\uFFFD]tico/gi, 'cr\u00edtico'],
    [/resoluci[\uFFFD]n/gi, 'resoluci\u00f3n'],
    [/cient[\uFFFD]fica/gi, 'cient\u00edfica'],
    [/tecnol[\uFFFD]gica/gi, 'tecnol\u00f3gica'],
    [/ciudadan[\uFFFD]a/gi, 'ciudadan\u00eda'],
    [/g[\uFFFD]nero/gi, 'g\u00e9nero'],
    [/ingl[\uFFFD]s/gi, 'ingl\u00e9s'],
    [/franc[\uFFFD]s/gi, 'franc\u00e9s'],
    [/art[\uFFFD]stica/gi, 'art\u00edstica'],
    [/formaci[\uFFFD]n/gi, 'formaci\u00f3n'],
    [/curr[\uFFFD]culo/gi, 'curr\u00edculo'],
    [/comprensi[\uFFFD]n/gi, 'comprensi\u00f3n'],
    [/producci[\uFFFD]n/gi, 'producci\u00f3n'],
    [/as[\uFFFD]/gi, 'as\u00ed'],
    [/m[\uFFFD]s/gi, 'm\u00e1s'],
    [/a[\uFFFD]n/gi, 'a\u00fan'],
    [/\b[\uFFFD]tica\b/gi, '\u00e9tica'],
    [/^\s*[\uFFFD]ltima/gi, '\u00daltima'],
  ];
  let fixed = str;
  replacements.forEach(([pattern, replacement]) => {
    fixed = fixed.replace(pattern, replacement);
  });
  if (hasMojibakeMarkers(fixed)) {
    const decoded = decodeCp1252Utf8(fixed);
    if (decoded && scoreMojibake(decoded) <= scoreMojibake(fixed)) fixed = decoded;
  }
  return fixed;
}
// Da una puntuación simple al texto roto para comparar cuál versión quedó menos dañada.
function scoreMojibake(str) {
  if (typeof str !== 'string') return 0;
  const markers = ['Ã','Â','â','ð','ï?½'];
  return markers.reduce((acc, m) => {
    const parts = str.split(m);
    return acc + (parts.length > 1 ? parts.length - 1 : 0);
  }, 0);
}
// Repara una cadena aislada aplicando primero decodificación y luego reemplazos directos de texto roto.
function fixMojibakeText(str) {
  if (!hasMojibakeMarkers(str) && !hasQuestionMarkWordCorruption(str)) return str;
  let best = str;
  if (hasMojibakeMarkers(best)) {
    for (let i = 0; i < 2; i++) {
      const candidate = decodeCp1252Utf8(best);
      if (!candidate || candidate === best) break;
      if (scoreMojibake(candidate) <= scoreMojibake(best)) best = candidate;
    }
  }
  const directReplacements = [
    [/\u00C3\u00A1/g, '\u00E1'],
    [/\u00C3\u00A9/g, '\u00E9'],
    [/\u00C3\u00AD/g, '\u00ED'],
    [/\u00C3\u00B3/g, '\u00F3'],
    [/\u00C3\u00BA/g, '\u00FA'],
    [/\u00C3\u00B1/g, '\u00F1'],
    [/\u00C3\u0081/g, '\u00C1'],
    [/\u00C3\u0089/g, '\u00C9'],
    [/\u00C3\u008D/g, '\u00CD'],
    [/\u00C3\u0093/g, '\u00D3'],
    [/\u00C3\u009A/g, '\u00DA'],
    [/\u00C3\u0091/g, '\u00D1'],
    [/\u00C3\u00BC/g, '\u00FC'],
    [/\u00C3\u009C/g, '\u00DC'],
    [/\u00C2\u00BF/g, '\u00BF'],
    [/\u00C2\u00A1/g, '\u00A1'],
    [/\u00C2\u00B0/g, '\u00B0'],
    [/\u00C2\u00BA/g, '\u00BA'],
    [/\u00C2\u00AA/g, '\u00AA'],
    [/\u00C2\u00A0/g, ' '],
  ];
  directReplacements.forEach(([pattern, replacement]) => {
    best = best.replace(pattern, replacement);
  });
  best = fixQuestionMarkCorruption(best);
  best = fixReplacementGlyphCorruption(best);
  return best;
}
// Recorre un árbol de estado o datos anidados y corrige todos los textos dañados que encuentre.
function sanitizeTextTree(root) {
  let changed = false;
  // Gestiona walk.
  const walk = (node) => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        const curr = node[i];
        if (typeof curr === 'string') {
          const fixed = fixMojibakeText(curr);
          if (fixed !== curr) { node[i] = fixed; changed = true; }
        } else if (curr && typeof curr === 'object') {
          walk(curr);
        }
      }
      return node;
    }
    Object.keys(node).forEach((k) => {
      const curr = node[k];
      if (typeof curr === 'string') {
        const fixed = fixMojibakeText(curr);
        if (fixed !== curr) { node[k] = fixed; changed = true; }
      } else if (curr && typeof curr === 'object') {
        walk(curr);
      }
    });
    return node;
  };
  walk(root);
  return changed;
}
// Reescribe el estado actual con su versión saneada para que el almacenamiento local quede limpio.
function repairUtf8State(targetState) {
  if (!targetState || typeof targetState !== 'object') return false;
  let changed = false;
  if (sanitizeTextTree(targetState.profile || {})) changed = true;
  if (sanitizeTextTree(targetState.templates || [])) changed = true;
  if (sanitizeTextTree(targetState.blockCfg || {})) changed = true;
  if (sanitizeTextTree(targetState.groupConfigs || {})) changed = true;
  if (sanitizeTextTree(targetState.periodGroupConfigs || {})) changed = true;
  if (sanitizeTextTree(targetState.lessonPlans || [])) changed = true;
  if (sanitizeTextTree(targetState.lessonPlanUi || {})) changed = true;
  if (sanitizeTextTree(targetState.instruments || [])) changed = true;
  if (sanitizeTextTree(targetState.usuarios || [])) changed = true;
  if (sanitizeTextTree(targetState.studentDirectory || [])) changed = true;
  if (sanitizeTextTree(targetState.grades || [])) changed = true;
  if (sanitizeTextTree(targetState.secciones || [])) changed = true;
  return changed;
}
// Ejecuta la reparación global de texto del estado y avisa al usuario si la limpieza produjo cambios.
function repairUtf8Text(showToast = true) {
  const changed = repairUtf8State(S);
  if (changed) persist();
  refreshTop();
  go(currentPage);
  if (showToast) {
    toast(changed ? 'Texto reparado (UTF-8)' : 'No se detectó texto corrupto');
  }
}
// Recorre el DOM visible y repara textos ya pintados que todavía conserven corrupción de codificación.
function repairRenderedText(root = document.body) {
  if (!root) return;
  const candidateText = `${root.textContent || ''} ${(root.getAttribute?.('placeholder') || '')} ${(root.getAttribute?.('title') || '')} ${(root.getAttribute?.('aria-label') || '')}`;
  if (!hasMojibakeMarkers(candidateText) && !hasQuestionMarkWordCorruption(candidateText)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const fixed = fixMojibakeText(node.nodeValue);
    if (fixed !== node.nodeValue) node.nodeValue = fixed;
  });
  root.querySelectorAll('*').forEach((el) => {
    ['placeholder', 'title', 'aria-label'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      const fixed = fixMojibakeText(value);
      if (fixed !== value) el.setAttribute(attr, fixed);
    });
  });
}
// Marca qué inputs conviene tratar con asistencia de escritura sin tocar campos sensibles o irrelevantes.
function isWritingAssistEligibleField(el) {
  if (!el || !el.tagName) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || '').toUpperCase();
  if (tag === 'TEXTAREA') return !el.readOnly && !el.disabled;
  if (tag !== 'INPUT') return false;
  const type = String(el.type || 'text').toLowerCase();
  if (['email', 'password', 'url', 'number', 'date', 'datetime-local', 'time', 'month', 'week', 'color', 'file', 'hidden', 'range', 'checkbox', 'radio'].includes(type)) return false;
  if (el.readOnly || el.disabled) return false;
  const idNameHint = `${el.id || ''} ${el.name || ''} ${el.getAttribute('data-format') || ''}`.toLowerCase();
  if (/(matricula|matrícula|cedula|c?dula|telefono|teléfono|correo|email|url|codigo|c?digo)/.test(idNameHint)) return false;
  return true;
}
// Vincula normalización en vivo a un campo concreto sin interferir con la posición del cursor.
function applyWritingAssistToField(el) {
  if (!isWritingAssistEligibleField(el)) return;
  el.setAttribute('lang', 'es-DO');
  el.setAttribute('spellcheck', 'true');
  if (!el.hasAttribute('autocapitalize')) el.setAttribute('autocapitalize', 'sentences');
  if (!el.hasAttribute('autocorrect') || String(el.getAttribute('autocorrect')).toLowerCase() === 'off') {
    el.setAttribute('autocorrect', 'on');
  }
}
// Activa la asistencia de escritura sobre una o varias raíces DOM para que el saneo ocurra en los paneles visibles.
function enableWritingAssist(...roots) {
  const targets = roots.filter(Boolean);
  if (!targets.length) return;
  targets.forEach((root) => {
    if (isWritingAssistEligibleField(root)) applyWritingAssistToField(root);
    root.querySelectorAll?.('input, textarea, [contenteditable="true"]').forEach((field) => {
      applyWritingAssistToField(field);
    });
  });
}
// Aplica la misma lógica de asistencia, pero enfocada en las celdas y campos del módulo de asistencia.
function enableAttendanceWritingAssist(root) {
  if (!root) return;
  root.querySelectorAll?.('.attendance-day-input, .attendance-day-reason-input').forEach((field) => {
    applyWritingAssistToField(field);
  });
}
// Normaliza texto en español preservando mayúsculas, tildes y abreviaturas comunes del editor.
function normalizeSpanishDraftText(value, options = {}) {
  if (value == null) return '';
  let next = fixMojibakeText(restoreSpanishQuestionCorruption(String(value)));
  const preserveCase = options.preserveCase === true;
  next = next.replace(/\s+/g, ' ');
  next = next.replace(/\s+([,.;:!?])/g, '$1');
  next = next.replace(/([,.;:!?])(?!\s|$)/g, '$1 ');
  // NOTE:
  // Do not split connector words inside tokens (e.g. "Presente" -> "Pres en te").
  // That heuristic produced visual spacing bugs across planning forms.
  next = next.trim();
  if (!preserveCase) {
    next = next.replace(/^([a-z\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F1])/u, (m) => m.toLocaleUpperCase('es-DO'));
  }
  return next;
}
// Reescribe el valor del input sin mover el cursor más de lo necesario.
function applyLiveNormalizedValue(input, nextValue) {
  if (!input) return nextValue;
  const currentValue = String(input.value || '');
  if (currentValue === nextValue) return nextValue;
  const selectionStart = typeof input.selectionStart === 'number' ? input.selectionStart : currentValue.length;
  const selectionEnd = typeof input.selectionEnd === 'number' ? input.selectionEnd : currentValue.length;
  const tail = currentValue.length - selectionEnd;
  input.value = nextValue;
  const nextCursor = Math.max(0, nextValue.length - tail);
  try {
    input.setSelectionRange(nextCursor, nextCursor);
  } catch (_) {}
  return nextValue;
}
// Normaliza el nombre de una actividad mientras se escribe para mantener el draft limpio.
function handleActNameInput(b, actId, input) {
  if (!input) return;
  const normalized = normalizeSpanishDraftText(input.value);
  const finalValue = applyLiveNormalizedValue(input, normalized);
  updateActName(b, actId, finalValue);
}
// Revalida el nombre de la actividad al salir del campo y consolida el texto final.
function handleActNameBlur(b, actId, input) {
  if (!input) return;
  const normalized = normalizeSpanishDraftText(input.value);
  const finalValue = applyLiveNormalizedValue(input, normalized);
  updateActName(b, actId, finalValue);
}

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

  // Intenta recuperar el perfil desde SQL si está vacío (ej. nuevo dispositivo o limpieza de cache)
  if ((!S.profile || !S.profile.inst) && window.AulaBaseSqlApi?.isEnabled?.()) {
    try {
      const targetEmail = String(user?.email || S.sessionUserName || '').trim().toLowerCase();
      if (targetEmail) {
        const result = await window.AulaBaseSqlApi.syncProfile({ email: targetEmail, firebaseUid: user?.id || '' });
        if (result && result.user) {
          if (!S.profile) S.profile = {};
          S.profile.name = String(result.user.display_name || result.user.displayName || S.profile.name || '').trim();
          S.profile.firstName = String(result.user.first_name || result.user.firstName || S.profile.firstName || '').trim();
          S.profile.lastName = String(result.user.last_name || result.user.lastName || S.profile.lastName || '').trim();
          S.profile.phone = String(result.user.phone || S.profile.phone || '').trim();
          S.profile.role = String(result.user.role || S.profile.role || 'Docente').trim();
          S.profile.year = String(result.user.academic_year || result.user.academicYear || S.profile.year || '').trim();
          if (result.school && result.school.name) {
            S.profile.inst = String(result.school.name || '').trim();
          }
          // Compatibilidad: Separar nombre si no vinieron campos first/last name
          if (S.profile.name && !S.profile.firstName && !S.profile.lastName) {
            const parts = S.profile.name.split(' ');
            S.profile.firstName = parts[0] || '';
            S.profile.lastName = parts.slice(1).join(' ') || '';
          }
        }
      }
    } catch (_) {}
  }

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

/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   GUARDIAS COMPARTIDAS DE AJUSTES
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Determina si el panel de ajustes sigue abierto y su formulario está sucio para decidir si se puede navegar fuera.
function hasPendingSettingsChanges() {
  const onSettings = currentPage === 'settings' || S.currentPage === 'settings';
  if (!onSettings) return false;
  if (!document.getElementById('settings-save-wrap')) return false;
  if (typeof isSettingsDirty !== 'function') return false;
  return isSettingsDirty();
}

// Bloquea la salida del panel de ajustes si hay cambios pendientes para evitar perder configuraciones al navegar.
function canLeaveSettingsPage(nextPage) {
  if (!hasPendingSettingsChanges()) return true;
  if (nextPage === 'settings') return true;
  toast('Tienes cambios sin guardar. Guarda o descarta antes de salir.', true);
  return false;
}

// Construye construir rápido comando entries.
function buildQuickCommandEntries() {
  const isDark = document.body.classList.contains('theme-dark');
  return [
    { id: 'page-dashboard', label: 'Ir a Inicio', description: 'Panel general y métricas', keywords: 'inicio panel dashboard', run: () => go('dashboard', { animatePanelTransition: true }) },
    { id: 'page-estudiantes', label: 'Ir a Estudiantes', description: 'Listado y gestión de estudiantes', keywords: 'estudiantes lista grupo', run: () => go('estudiantes', { animatePanelTransition: true }) },
    { id: 'page-actividades', label: 'Ir a Actividades', description: 'Planifica y organiza actividades', keywords: 'actividades bloques', run: () => go('actividades', { animatePanelTransition: true }) },
    { id: 'page-matriz', label: 'Ir a Matriz General', description: 'Calificaciones por bloque y curso', keywords: 'matriz notas calificaciones', run: () => go('matriz', { animatePanelTransition: true }) },
    { id: 'page-planificaciones', label: 'Ir a Planificaciones', description: 'Diseño y seguimiento de clases', keywords: 'planificaciones lecciones', run: () => go('planificaciones', { animatePanelTransition: true }) },
    { id: 'page-asistencia', label: 'Ir a Registro de Asistencia', description: 'Control de asistencia del curso activo', keywords: 'asistencia asistencia diaria', run: () => go('asistencia', { animatePanelTransition: true }) },
    { id: 'page-reportes', label: 'Ir a Reportes', description: 'Exportaciones y estadísticas', keywords: 'reportes exportar', run: () => go('reportes', { animatePanelTransition: true }) },
    { id: 'page-settings', label: 'Abrir Configuración', description: 'Perfil, ciclo y preferencias', keywords: 'configuración ajustes perfil', run: () => go('settings', { animatePanelTransition: true }) },
    { id: 'open-profile', label: 'Configurar Perfil', description: 'Abre la edición de perfil docente', keywords: 'perfil setup cuenta', run: () => openM('m-setup') },
    { id: 'toggle-theme', label: isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro', description: 'Alterna el tema visual actual', keywords: 'modo oscuro claro tema', run: () => toggleDarkMode() },
  ];
}
// Crea una sola vez la paleta de comandos y deja cacheadas sus referencias DOM para reusarla en toda la app.
function ensureQuickCommandPalette() {
  if (INTERACTION_ENHANCEMENTS.container && INTERACTION_ENHANCEMENTS.input && INTERACTION_ENHANCEMENTS.list) return;
  const shell = document.createElement('div');
  shell.id = 'quick-command-palette';
  shell.className = 'quick-command-palette';
  shell.hidden = true;
  shell.setAttribute('aria-hidden', 'true');
  shell.innerHTML = `
    <div class="quick-command-backdrop" data-action="close"></div>
    <div class="quick-command-dialog" role="dialog" aria-modal="true" aria-label="Acciones rápidas">
      <div class="quick-command-head">
        <input id="quick-command-input" class="quick-command-input" type="text" autocomplete="off" placeholder="Busca una acción... (Ej: estudiantes, reportes, modo oscuro)">
        <span class="quick-command-hint" id="quick-command-hint">0 resultados</span>
      </div>
      <div id="quick-command-list" class="quick-command-list" role="listbox" aria-label="Resultados"></div>
      <div class="quick-command-foot">Atajos: ↑ ↓ para moverte, Enter para ejecutar, Esc para cerrar.</div>
    </div>
  `;
  document.body.appendChild(shell);
  INTERACTION_ENHANCEMENTS.container = shell;
  INTERACTION_ENHANCEMENTS.input = shell.querySelector('#quick-command-input');
  INTERACTION_ENHANCEMENTS.list = shell.querySelector('#quick-command-list');
  INTERACTION_ENHANCEMENTS.hint = shell.querySelector('#quick-command-hint');
}
// Comprueba si is rápido comando palette abrir.
function isQuickCommandPaletteOpen() {
  return !!INTERACTION_ENHANCEMENTS.container && !INTERACTION_ENHANCEMENTS.container.hidden;
}
// Pinta los resultados filtrados y mantiene sincronizada la selección activa del atajo rápido.
function renderQuickCommandResults() {
  const list = INTERACTION_ENHANCEMENTS.list;
  const hint = INTERACTION_ENHANCEMENTS.hint;
  if (!list || !hint) return;
  const rows = INTERACTION_ENHANCEMENTS.filtered;
  if (!rows.length) {
    INTERACTION_ENHANCEMENTS.activeIndex = -1;
    list.innerHTML = '<div class="quick-command-empty">No hay coincidencias para esa búsqueda.</div>';
    hint.textContent = '0 resultados';
    return;
  }
  if (INTERACTION_ENHANCEMENTS.activeIndex < 0 || INTERACTION_ENHANCEMENTS.activeIndex >= rows.length) {
    INTERACTION_ENHANCEMENTS.activeIndex = 0;
  }
  list.innerHTML = rows.map((entry, index) => `
    <button type="button" class="quick-command-item ${index === INTERACTION_ENHANCEMENTS.activeIndex ? 'is-active' : ''}" data-index="${index}" role="option" aria-selected="${index === INTERACTION_ENHANCEMENTS.activeIndex ? 'true' : 'false'}">
      <span class="quick-command-item-label">${escapeHtml(entry.label)}</span>
      <span class="quick-command-item-desc">${escapeHtml(entry.description)}</span>
    </button>
  `).join('');
  hint.textContent = `${rows.length} resultado${rows.length === 1 ? '' : 's'}`;
}
// Filtra acciones rápidas por texto libre sobre etiqueta, descripción y palabras clave.
function filterQuickCommandResults(query = '') {
  const needle = String(query || '').trim().toLowerCase();
  const all = INTERACTION_ENHANCEMENTS.entries || [];
  if (!needle) {
    INTERACTION_ENHANCEMENTS.filtered = all.slice();
    renderQuickCommandResults();
    return;
  }
  INTERACTION_ENHANCEMENTS.filtered = all.filter((entry) => {
    const target = `${entry.label} ${entry.description} ${entry.keywords || ''}`.toLowerCase();
    return target.includes(needle);
  });
  renderQuickCommandResults();
}
// Gestiona move rápido comando selection.
function moveQuickCommandSelection(step) {
  // Desplaza la selección activa dentro de los resultados visibles del buscador global.
  const rows = INTERACTION_ENHANCEMENTS.filtered;
  if (!rows.length) return;
  const size = rows.length;
  let nextIndex = INTERACTION_ENHANCEMENTS.activeIndex + step;
  if (nextIndex < 0) nextIndex = size - 1;
  if (nextIndex >= size) nextIndex = 0;
  INTERACTION_ENHANCEMENTS.activeIndex = nextIndex;
  renderQuickCommandResults();
  INTERACTION_ENHANCEMENTS.list?.querySelector('.quick-command-item.is-active')?.scrollIntoView({ block: 'nearest' });
}
// Gestiona run rápido comando at.
function runQuickCommandAt(index) {
  // Ejecuta la acción elegida y cierra la paleta para dejar limpio el foco de navegación.
  const entry = INTERACTION_ENHANCEMENTS.filtered?.[index];
  if (!entry || typeof entry.run !== 'function') return;
  closeQuickCommandPalette();
  entry.run();
}
// Abre la paleta con el catálogo actualizado de acciones y enfoca el input para búsqueda inmediata.
function openQuickCommandPalette() {
  ensureQuickCommandPalette();
  const shell = INTERACTION_ENHANCEMENTS.container;
  const input = INTERACTION_ENHANCEMENTS.input;
  if (!shell || !input) return;
  INTERACTION_ENHANCEMENTS.entries = buildQuickCommandEntries();
  INTERACTION_ENHANCEMENTS.filtered = INTERACTION_ENHANCEMENTS.entries.slice();
  INTERACTION_ENHANCEMENTS.activeIndex = 0;
  shell.hidden = false;
  shell.setAttribute('aria-hidden', 'false');
  document.body.classList.add('quick-command-open');
  input.value = '';
  renderQuickCommandResults();
  window.requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
}
// Cierra la paleta y limpia las clases globales que bloquean interacción con el fondo.
function closeQuickCommandPalette() {
  const shell = INTERACTION_ENHANCEMENTS.container;
  if (!shell || shell.hidden) return;
  shell.hidden = true;
  shell.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('quick-command-open');
}
// Alterna alternar rápido comando palette.
function toggleQuickCommandPalette() {
  // Abre o cierra la paleta según su estado actual para reutilizarla desde teclado o UI.
  if (isQuickCommandPaletteOpen()) closeQuickCommandPalette();
  else openQuickCommandPalette();
}
// Conecta clicks, teclado y cierres del overlay para que la paleta funcione como un buscador de acciones global.
function bindQuickCommandPaletteEvents() {
  if (INTERACTION_ENHANCEMENTS.quickPaletteBound) return;
  ensureQuickCommandPalette();
  const shell = INTERACTION_ENHANCEMENTS.container;
  const input = INTERACTION_ENHANCEMENTS.input;
  const list = INTERACTION_ENHANCEMENTS.list;
  if (!shell || !input || !list) return;
  shell.addEventListener('click', (event) => {
    if (event.target?.closest?.('[data-action="close"]')) {
      closeQuickCommandPalette();
      return;
    }
    const item = event.target?.closest?.('.quick-command-item');
    if (!item) return;
    const index = Number(item.getAttribute('data-index'));
    if (Number.isFinite(index)) runQuickCommandAt(index);
  });
  input.addEventListener('input', () => {
    filterQuickCommandResults(input.value);
  });
  input.addEventListener('keydown', (event) => {
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
    if (event.key === 'Escape') {
      event.preventDefault();
      closeQuickCommandPalette();
      return;
    }
  });
  INTERACTION_ENHANCEMENTS.quickPaletteBound = true;
}
// Añade una respuesta visual leve en botones y navegación sin interferir con los componentes interactivos especiales.
function bindTapRippleFeedback() {
  if (INTERACTION_ENHANCEMENTS.rippleBound) return;
  document.addEventListener('pointerdown', (event) => {
    if (!canAnimateUiMotion()) return;
    const trigger = event.target?.closest?.('.btn, .sb-link, .sb-utility, .sb-logout-compact, .topbar-brand, .top-profile-toggle');
    if (!trigger || !(trigger instanceof HTMLElement)) return;
    if (trigger.classList.contains('quick-command-item')) return;
    const rect = trigger.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    trigger.classList.add('has-tap-ripple');
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - (size / 2)}px`;
    ripple.style.top = `${event.clientY - rect.top - (size / 2)}px`;
    trigger.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, { passive: true });
  INTERACTION_ENHANCEMENTS.rippleBound = true;
}
// Inicializa una sola vez las mejoras globales de interacción compartidas por todos los paneles.
function initInteractionEnhancements() {
  if (INTERACTION_ENHANCEMENTS.initialized) return;
  bindQuickCommandPaletteEvents();
  bindTapRippleFeedback();
  INTERACTION_ENHANCEMENTS.initialized = true;
}
// Resuelve el perfil de motion preferido por el usuario para decidir cuánta animación aplicar.
function getMotionProfile() {
  try {
    const saved = String(window.localStorage?.getItem('edugestMotionProfile') || '').trim().toLowerCase();
    if (saved === 'fast') return 'fast';
  } catch (_) {}
  return 'smooth';
}
// Aplica aplicar movimiento perfil.
function applyMotionProfile() {
  // Publica el perfil visual actual en el body para que CSS y JS respondan con la misma velocidad.
  const profile = getMotionProfile();
  document.body.classList.toggle('motion-smooth', profile === 'smooth');
  document.body.classList.toggle('motion-fast', profile === 'fast');
}
// Expone el panel activo como atributo de datos para CSS, motion y depuración contextual.
function setActivePanelContext(page) {
  const panelKey = String(page || 'dashboard').trim().toLowerCase();
  document.body.setAttribute('data-panel', panelKey);
  STATIC_DOM.view?.setAttribute('data-panel', panelKey);
}

// Reinicia el observador actual y avanza el token para invalidar animaciones viejas cuando cambiamos de panel.
function resetPanelMotion() {
  // Reinicia el observador actual y avanza el token para invalidar animaciones viejas cuando cambiamos de panel.
  if (PANEL_MOTION.observer) {
    PANEL_MOTION.observer.disconnect();
    PANEL_MOTION.observer = null;
  }
  PANEL_MOTION.token += 1;
}

// Recolecta los bloques visuales que deben animarse al entrar un panel sin depender de una sola estructura HTML.
function collectPanelMotionTargets(view) {
  // Recolecta los bloques visuales que deben animarse al entrar un panel sin depender de una sola estructura HTML.
  if (!view) return [];
  const selectors = [
    ':scope > *',
    ':scope > * > .cp',
    ':scope > * > .card',
    ':scope > * > section',
    '.dashboard-grid > *',
    '.settings-grid > *',
    '.settings-grid-profile > *',
    '.fr > .fg',
    '.kpi-grid > *',
    '.stats-grid > *',
    '.attendance-dashboard-grid > *',
  ];
  const seen = new Set();
  const targets = [];
  selectors.forEach((selector) => {
    view.querySelectorAll(selector).forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (seen.has(el)) return;
      if (el.classList.contains('ov')) return;
      if (el.id === 'toast-wrap') return;
      const area = (el.offsetWidth || 0) * (el.offsetHeight || 0);
      if (area < 6400) return;
      seen.add(el);
      targets.push(el);
    });
  });
  return targets.slice(0, 30);
}

// Aplica la animación escalonada de entrada a los bloques del panel recién renderizado.
function enhancePanelMotion(view) {
  // Aplica la animación escalonada de entrada a los bloques del panel recién renderizado.
  resetPanelMotion();
  if (!view) return;
  const targets = collectPanelMotionTargets(view);
  targets.forEach((el) => {
    el.classList.remove('ui-reveal', 'is-visible');
    el.style.removeProperty('--reveal-delay');
  });
  if (!targets.length || !canAnimateUiMotion()) return;
  const token = PANEL_MOTION.token;
  const motionFast = document.body.classList.contains('motion-fast');
  const delayStepMs = motionFast ? 20 : 32;
  const revealCap = motionFast ? 8 : 10;
  targets.forEach((el, index) => {
    el.classList.add('ui-reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(index, revealCap) * delayStepMs}ms`);
  });
  if (typeof window.IntersectionObserver !== 'function') {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new window.IntersectionObserver((entries) => {
    if (token !== PANEL_MOTION.token) return;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    root: view,
    threshold: 0.12,
    rootMargin: '0px 0px -10% 0px',
  });
  PANEL_MOTION.observer = observer;
  targets.forEach((el) => observer.observe(el));
  window.requestAnimationFrame(() => {
    if (token !== PANEL_MOTION.token) return;
    targets.slice(0, 4).forEach((el) => el.classList.add('is-visible'));
  });
}

RENDERS.horario = function(c) {
  ensureTeacherPlannerState();
  c.innerHTML = renderTeacherSchedulePage();
};
// Alias de render para rutas antiguas o dedicadas al calendario docente.
RENDERS.calendario = RENDERS.horario;
// Asegura asegurar teacher planner estado.
function ensureTeacherPlannerState() {
  // Inicializa y sanea el estado del horario docente antes de cualquier render o edición del planner.
  if (!S.teacherPlanner || typeof S.teacherPlanner !== 'object') {
    S.teacherPlanner = { monthKey: getCurrentMonthKey(), customEvents: [], weeklySchedule: [], activeWeekdays: [0, 1, 2, 3, 4], journeyType: 'extended' };
  }
  if (!S.teacherPlanner.monthKey) S.teacherPlanner.monthKey = getCurrentMonthKey();
  if (!Array.isArray(S.teacherPlanner.customEvents)) S.teacherPlanner.customEvents = [];
  if (!Array.isArray(S.teacherPlanner.weeklySchedule)) S.teacherPlanner.weeklySchedule = [];
  S.teacherPlanner.journeyType = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || 'extended');
  TEACHER_SCHEDULE_WIZARD.journeyType = sanitizeTeacherScheduleJourneyType(TEACHER_SCHEDULE_WIZARD.journeyType || S.teacherPlanner.journeyType || 'extended');
  S.teacherPlanner.activeWeekdays = teacherScheduleNormalizeWeekdayList(S.teacherPlanner.activeWeekdays, [0, 1, 2, 3, 4]);
  S.teacherPlanner.weeklySchedule = S.teacherPlanner.weeklySchedule.map((row) => sanitizeTeacherScheduleRow(row));
}
// Obtiene get escuela year range.
function getSchoolYearRange() {
  // Extrae el rango anual del período escolar para construir eventos oficiales del calendario.
  const schoolYearId = String(S.schoolYear?.id || S.schoolYear?.name || '2025-2026');
  const match = schoolYearId.match(/(\d{4})\D+(\d{4})/);
  const startYear = match ? parseInt(match[1], 10) : 2025;
  const endYear = match ? parseInt(match[2], 10) : startYear + 1;
  return { startYear, endYear };
}
// Construye construir official planner events.
function buildOfficialPlannerEvents() {
  // Genera la agenda base del docente con hitos MINERD y feriados del año escolar.
  const { startYear, endYear } = getSchoolYearRange();
  return [
    { id: `minerd-doc-${startYear}`, date: `${startYear}-08-04`, title: 'Inicio de jornada docente y preparaci?n del a?o escolar', type: 'minerd', source: 'MINERD' },
    { id: `minerd-open-${startYear}`, date: `${startYear}-08-25`, title: 'Inicio del a?o escolar para estudiantes', type: 'minerd', source: 'MINERD' },
    { id: `holiday-mercedes-${startYear}`, date: `${startYear}-09-24`, title: 'D?a de Nuestra Se?ora de las Mercedes', type: 'holiday', source: 'Calendario nacional' },
    { id: `holiday-constitucion-${startYear}`, date: `${startYear}-11-06`, title: 'D?a de la Constituci?n', type: 'holiday', source: 'Calendario nacional' },
    { id: `holiday-navidad-${startYear}`, date: `${startYear}-12-25`, title: 'Navidad', type: 'holiday', source: 'Calendario nacional' },
    { id: `minerd-break-${startYear}`, date: `${startYear}-12-19`, title: 'Inicio del receso escolar de diciembre', type: 'minerd', source: 'MINERD' },
    { id: `holiday-newyear-${endYear}`, date: `${endYear}-01-01`, title: 'A?o Nuevo', type: 'holiday', source: 'Calendario nacional' },
    { id: `minerd-return-${endYear}`, date: `${endYear}-01-06`, title: 'Reinicio de docencia del segundo per?odo', type: 'minerd', source: 'MINERD' },
    { id: `holiday-altagracia-${endYear}`, date: `${endYear}-01-21`, title: 'D?a de Nuestra Se?ora de la Altagracia', type: 'holiday', source: 'Calendario nacional' },
    { id: `efemeride-duarte-${endYear}`, date: `${endYear}-01-26`, title: 'Natalicio de Juan Pablo Duarte', type: 'efemeride', source: 'Efem?ride patria' },
    { id: `holiday-independencia-${endYear}`, date: `${endYear}-02-27`, title: 'D?a de la Independencia Nacional', type: 'holiday', source: 'Calendario nacional' },
    { id: `efemeride-restauracion-${startYear}`, date: `${startYear}-08-16`, title: 'D?a de la Restauraci?n', type: 'efemeride', source: 'Efem?ride patria' },
  ];
}
// Normaliza normalizar planner event type.
function normalizePlannerEventType(type) {
  return ['minerd', 'holiday', 'efemeride', 'custom'].includes(type) ? type : 'custom';
}
// Obtiene get planner events.
function getPlannerEvents() {
  // Combina eventos oficiales y eventos personalizados del docente en una sola lista ordenada.
  ensureTeacherPlannerState();
  const custom = S.teacherPlanner.customEvents.map((event) => ({
    id: event.id || uid(),
    date: event.date || '',
    title: String(event.title || '').trim(),
    type: normalizePlannerEventType(event.type || 'custom'),
    source: event.source || 'Personal',
  })).filter((event) => event.date && event.title);
  return [...buildOfficialPlannerEvents(), ...custom].sort((a, b) => String(a.date).localeCompare(String(b.date), 'es') || String(a.title).localeCompare(String(b.title), 'es'));
}
// Actualiza set teacher planner mes.
function setTeacherPlannerMonth(monthKey) {
  // Cambia el mes visible del calendario docente y recalcula el panel.
  ensureTeacherPlannerState();
  S.teacherPlanner.monthKey = normalizeAttendanceMonthKey(monthKey);
  persist();
  go(currentPage);
}
// Gestiona planner mes label.
function plannerMonthLabel(monthKey) {
  const date = attendanceMonthStart(monthKey);
  return new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(date);
}
// Obtiene get planner mes matrix.
function getPlannerMonthMatrix(monthKey) {
  const start = attendanceMonthStart(monthKey);
  const monthIndex = start.getMonth();
  const year = start.getFullYear();
  const daysInMonth = new Date(year, monthIndex + 1, 0, 12, 0, 0, 0).getDate();
  const offset = (start.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      dateKey: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
// Gestiona planner event tone.
function plannerEventTone(type) {
  if (type === 'minerd') return 'tone-aqua';
  if (type === 'holiday') return 'tone-amber';
  if (type === 'efemeride') return 'tone-violet';
  return 'tone-green';
}
// Gestiona planner event type label.
function plannerEventTypeLabel(type) {
  if (type === 'minerd') return 'MINERD';
  if (type === 'holiday') return 'Festivo';
  if (type === 'efemeride') return 'Efem?ride';
  return 'Personal';
}
// Gestiona planner weekday name.
function plannerWeekdayName(dayIndex) {
  return ['Lunes', 'Martes', 'Mi?rcoles', 'Jueves', 'Viernes', 'S?bado', 'Domingo'][dayIndex] || 'Lunes';
}
const TEACHER_SCHEDULE_ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const TEACHER_SCHEDULE_DEFAULT_WEEKDAYS = [0, 1, 2, 3, 4];
const TEACHER_SCHEDULE_BLOCK_TYPES = ['class', 'planning', 'break', 'lunch', 'event'];
const TEACHER_SCHEDULE_JOURNEY_TYPES = ['extended', 'morning', 'afternoon', 'double', 'custom'];
const TEACHER_SCHEDULE_EDITOR = { mode: 'edit', originalKey: '', weekday: 0, startTime: '', endTime: '', draft: null, errors: {} };
const TEACHER_SCHEDULE_ROW_COPY = { startTime: '', endTime: '', sourceWeekday: 0 };
const TEACHER_SCHEDULE_ROW_ADJUST = { startTime: '', endTime: '' };
const TEACHER_SCHEDULE_WIZARD = {
  step: 1,
  journeyType: 'extended',
  startTime: '07:30',
  endTime: '11:55',
  durationsRaw: '40',
  includeBreak: true,
  breakStart: '09:30',
  breakEnd: '10:00',
  includeLunch: false,
  lunchStart: '12:00',
  lunchEnd: '13:00',
};
// Gestiona sanitize teacher programar journey type.
function sanitizeTeacherScheduleJourneyType(type) {
  return TEACHER_SCHEDULE_JOURNEY_TYPES.includes(type) ? type : 'extended';
}
// Gestiona teacher programar journey meta.
function teacherScheduleJourneyMeta(type) {
  const normalized = sanitizeTeacherScheduleJourneyType(type);
  if (normalized === 'extended') return { id: 'extended', label: 'Jornada extendida', copy: 'Jornada continua', rank: 1 };
  if (normalized === 'morning') return { id: 'morning', label: 'Tanda matutina', copy: 'Solo ma?ana', rank: 2 };
  if (normalized === 'afternoon') return { id: 'afternoon', label: 'Tanda vespertina', copy: 'Solo tarde', rank: 3 };
  if (normalized === 'double') return { id: 'double', label: 'Doble tanda', copy: 'Ma?ana + tarde', rank: 4 };
  return { id: 'custom', label: 'Personalizada', copy: 'Libre y flexible', rank: 5 };
}
// Gestiona teacher programar journey options.
function teacherScheduleJourneyOptions() {
  return TEACHER_SCHEDULE_JOURNEY_TYPES
    .map((type) => teacherScheduleJourneyMeta(type))
    .sort((a, b) => a.rank - b.rank);
}
// Gestiona teacher programar journey preset.
function teacherScheduleJourneyPreset(type) {
  const normalized = sanitizeTeacherScheduleJourneyType(type);
  if (normalized === 'morning') {
    return {
      startTime: '07:30',
      endTime: '11:55',
      durationsRaw: '40',
      includeBreak: true,
      breakStart: '09:30',
      breakEnd: '10:00',
      includeLunch: false,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      activeWeekdays: [0, 1, 2, 3, 4],
      shiftFilter: 'all',
    };
  }
  if (normalized === 'afternoon') {
    return {
      startTime: '13:00',
      endTime: '17:30',
      durationsRaw: '40',
      includeBreak: true,
      breakStart: '15:00',
      breakEnd: '15:20',
      includeLunch: false,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      activeWeekdays: [0, 1, 2, 3, 4],
      shiftFilter: 'all',
    };
  }
  if (normalized === 'double') {
    return {
      startTime: '07:30',
      endTime: '17:30',
      durationsRaw: '40,35',
      includeBreak: true,
      breakStart: '09:30',
      breakEnd: '10:00',
      includeLunch: true,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      activeWeekdays: [0, 1, 2, 3, 4],
      shiftFilter: 'all',
    };
  }
  if (normalized === 'custom') {
    return {
      startTime: TEACHER_SCHEDULE_WIZARD.startTime || '07:30',
      endTime: TEACHER_SCHEDULE_WIZARD.endTime || '11:55',
      durationsRaw: TEACHER_SCHEDULE_WIZARD.durationsRaw || '40',
      includeBreak: !!TEACHER_SCHEDULE_WIZARD.includeBreak,
      breakStart: TEACHER_SCHEDULE_WIZARD.breakStart || '09:30',
      breakEnd: TEACHER_SCHEDULE_WIZARD.breakEnd || '10:00',
      includeLunch: !!TEACHER_SCHEDULE_WIZARD.includeLunch,
      lunchStart: TEACHER_SCHEDULE_WIZARD.lunchStart || '12:00',
      lunchEnd: TEACHER_SCHEDULE_WIZARD.lunchEnd || '13:00',
      activeWeekdays: teacherScheduleNormalizeWeekdayList(S?.teacherPlanner?.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS),
      shiftFilter: 'all',
    };
  }
  return {
    startTime: '07:30',
    endTime: '15:30',
    durationsRaw: '45',
    includeBreak: true,
    breakStart: '10:00',
    breakEnd: '10:20',
    includeLunch: true,
    lunchStart: '12:30',
    lunchEnd: '13:10',
    activeWeekdays: [0, 1, 2, 3, 4],
    shiftFilter: 'all',
  };
}
// Gestiona teacher programar aplicar journey preset.
function teacherScheduleApplyJourneyPreset(type, options = {}) {
  // Aplica un preset de jornada para poblar horas base, descansos y días activos del horario.
  ensureTeacherPlannerState();
  const normalized = sanitizeTeacherScheduleJourneyType(type);
  const preset = teacherScheduleJourneyPreset(normalized);
  S.teacherPlanner.journeyType = normalized;
  TEACHER_SCHEDULE_WIZARD.journeyType = normalized;
  if (options.includeWeekdays !== false) {
    S.teacherPlanner.activeWeekdays = teacherScheduleNormalizeWeekdayList(preset.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS);
  }
  if (options.includeWizard !== false) {
    TEACHER_SCHEDULE_WIZARD.startTime = preset.startTime;
    TEACHER_SCHEDULE_WIZARD.endTime = preset.endTime;
    TEACHER_SCHEDULE_WIZARD.durationsRaw = preset.durationsRaw;
    TEACHER_SCHEDULE_WIZARD.includeBreak = !!preset.includeBreak;
    TEACHER_SCHEDULE_WIZARD.breakStart = preset.breakStart;
    TEACHER_SCHEDULE_WIZARD.breakEnd = preset.breakEnd;
    TEACHER_SCHEDULE_WIZARD.includeLunch = !!preset.includeLunch;
    TEACHER_SCHEDULE_WIZARD.lunchStart = preset.lunchStart;
    TEACHER_SCHEDULE_WIZARD.lunchEnd = preset.lunchEnd;
  }
  ensureTeacherScheduleViewState();
  if (normalized !== 'double') S.teacherPlanner.ui.shiftFilter = 'all';
}
// Normaliza normalizar teacher programar time valor.
function normalizeTeacherScheduleTimeValue(value) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return '';
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
// Normaliza normalizar teacher programar label.
function normalizeTeacherScheduleLabel(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
// Gestiona teacher programar normalizar weekday lista.
function teacherScheduleNormalizeWeekdayList(days, fallback = TEACHER_SCHEDULE_DEFAULT_WEEKDAYS) {
  const source = Array.isArray(days) ? days : fallback;
  const normalized = source
    .map((item) => parseInt(item, 10))
    .filter((day, index, list) => Number.isInteger(day) && TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(day) && list.indexOf(day) === index)
    .sort((a, b) => a - b);
  if (normalized.length) return normalized;
  const fallbackList = Array.isArray(fallback) ? fallback : TEACHER_SCHEDULE_DEFAULT_WEEKDAYS;
  return fallbackList
    .map((item) => parseInt(item, 10))
    .filter((day, index, list) => Number.isInteger(day) && TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(day) && list.indexOf(day) === index)
    .sort((a, b) => a - b);
}
// Gestiona teacher programar activo weekdays.
function teacherScheduleActiveWeekdays() {
  ensureTeacherPlannerState();
  const active = teacherScheduleNormalizeWeekdayList(S.teacherPlanner.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS);
  S.teacherPlanner.activeWeekdays = active;
  return active;
}
// Gestiona teacher programar alternar activo weekday.
function teacherScheduleToggleActiveWeekday(weekday, enabled) {
  ensureTeacherPlannerState();
  const target = parseInt(weekday, 10);
  if (!TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(target)) return;
  const current = teacherScheduleNormalizeWeekdayList(S.teacherPlanner.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS);
  const next = enabled
    ? teacherScheduleNormalizeWeekdayList([...current, target], TEACHER_SCHEDULE_DEFAULT_WEEKDAYS)
    : current.filter((day) => day !== target);
  if (!next.length) {
    toast('Debes mantener al menos un d?a activo en el horario', true);
    go(currentPage);
    return;
  }
  if (next.length === current.length && next.every((day, index) => day === current[index])) return;
  S.teacherPlanner.activeWeekdays = next;
  persist();
  go(currentPage);
}
// Renderiza renderizar teacher programar activo days controls.
function renderTeacherScheduleActiveDaysControls() {
  const activeDays = teacherScheduleActiveWeekdays();
  return `
    <div class="teacher-schedule-active-days">
      <div class="teacher-schedule-active-days-title">D?as activos del horario</div>
      <div class="planner-day-check-row">
        ${TEACHER_SCHEDULE_ALL_WEEKDAYS.map((weekday) => `
          <label class="planner-day-check">
            <input type="checkbox" ${activeDays.includes(weekday) ? 'checked' : ''} onchange="teacherScheduleToggleActiveWeekday(${weekday}, this.checked)">
            <span>${plannerWeekdayName(weekday)}</span>
          </label>
        `).join('')}
      </div>
      <div class="teacher-schedule-active-days-copy">Lunes a viernes vienen activos por defecto. Activa s?bado o domingo solo cuando realmente los necesites.</div>
    </div>`;
}
// Gestiona sanitize teacher programar block type.
function sanitizeTeacherScheduleBlockType(type) {
  const normalized = type === 'free' ? 'planning' : type;
  return TEACHER_SCHEDULE_BLOCK_TYPES.includes(normalized) ? normalized : 'planning';
}
// Gestiona teacher programar default asignatura for block type.
function teacherScheduleDefaultSubjectForBlockType(type) {
  if (type === 'planning') return 'Hora pedag?gica / planificaci?n';
  if (type === 'break') return 'Receso / recreo';
  if (type === 'lunch') return 'Almuerzo';
  if (type === 'event') return 'Evento institucional';
  return '';
}
// Gestiona infer teacher programar block type.
function inferTeacherScheduleBlockType(row) {
  const subject = normalizeTeacherScheduleLabel(row?.subject || '');
  if (subject.includes('recreo') || subject.includes('receso')) return 'break';
  if (subject.includes('almuerzo')) return 'lunch';
  if (subject.includes('hora pedagogica') || subject.includes('planificacion')) return 'planning';
  if (subject.includes('evento') || subject.includes('izamiento') || subject.includes('arriamiento')) return 'event';
  return subject || row?.sectionId ? 'class' : 'planning';
}
// Gestiona sanitize teacher programar row.
function sanitizeTeacherScheduleRow(row) {
  // Normaliza una fila del horario para que el tablero, el editor y la persistencia usen la misma forma.
  const base = row && typeof row === 'object' ? row : {};
  const section = (S.secciones || []).find((item) => item.id === base.sectionId);
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === (base.gradeId || section?.gradeId || ''));
  return {
    id: base.id || uid(),
    weekday: Number.isInteger(base.weekday) ? base.weekday : (parseInt(base.weekday, 10) || 0),
    startTime: normalizeTeacherScheduleTimeValue(base.startTime || ''),
    endTime: normalizeTeacherScheduleTimeValue(base.endTime || ''),
    blockType: sanitizeTeacherScheduleBlockType(base.blockType || inferTeacherScheduleBlockType(base)),
    subject: String(base.subject || '').trim(),
    area: String(base.area || section?.area || lessonPlanAreaFromGroup(section) || curriculumOfficialSubjectArea(base.subject || '', base.gradeId || section?.gradeId || '', section?.grado || '') || '').trim(),
    gradeId: base.gradeId || section?.gradeId || '',
    educationLevel: normalizeEducationLevelName(base.educationLevel || grade?.educationLevel || ''),
    sectionId: base.sectionId || '',
    room: String(base.room || '').trim(),
    notes: String(base.notes || '').trim(),
  };
}
// Gestiona teacher programar rows sorted.
function teacherScheduleRowsSorted(rows = S.teacherPlanner?.weeklySchedule || []) {
  // Ordena las franjas del horario por día y hora para mostrar siempre una secuencia estable.
  return rows
    .map((row) => sanitizeTeacherScheduleRow(row))
    .filter((row) => row.startTime && row.endTime)
    .sort((a, b) => (a.weekday || 0) - (b.weekday || 0) || String(a.startTime || '').localeCompare(String(b.startTime || ''), 'es') || String(a.endTime || '').localeCompare(String(b.endTime || ''), 'es'));
}
// Gestiona teacher programar rows for activo days.
function teacherScheduleRowsForActiveDays(rows = teacherScheduleRowsSorted()) {
  // Filtra solo los días activos del docente para ocultar franjas fuera de la jornada real.
  const activeDays = teacherScheduleActiveWeekdays();
  return rows.filter((row) => activeDays.includes(parseInt(row.weekday, 10)));
}
// Gestiona teacher programar time to minutes.
function teacherScheduleTimeToMinutes(value) {
  const normalized = normalizeTeacherScheduleTimeValue(value);
  if (!normalized) return null;
  const [hours, minutes] = normalized.split(':').map((part) => parseInt(part, 10));
  return (hours * 60) + minutes;
}
// Gestiona teacher programar minutes to time.
function teacherScheduleMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
// Gestiona teacher programar format time.
function teacherScheduleFormatTime(value) {
  // Convierte una hora HH:MM a formato legible local con un fallback seguro.
  const normalized = normalizeTeacherScheduleTimeValue(value);
  if (!normalized) return '--:--';
  try {
    return new Intl.DateTimeFormat('es-DO', { hour: 'numeric', minute: '2-digit' }).format(new Date(`2025-01-01T${normalized}:00`));
  } catch (_) {
    return normalized;
  }
}
// Gestiona teacher programar rows for weekday.
function teacherScheduleRowsForWeekday(weekday, rows = teacherScheduleRowsForActiveDays()) {
  const target = parseInt(weekday, 10);
  if (!Number.isInteger(target)) return [];
  return rows
    .filter((row) => parseInt(row.weekday, 10) === target)
    .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || ''), 'es') || String(a.endTime || '').localeCompare(String(b.endTime || ''), 'es'));
}
// Gestiona teacher programar intervals overlap.
function teacherScheduleIntervalsOverlap(startA, endA, startB, endB) {
  const aStart = teacherScheduleTimeToMinutes(startA);
  const aEnd = teacherScheduleTimeToMinutes(endA);
  const bStart = teacherScheduleTimeToMinutes(startB);
  const bEnd = teacherScheduleTimeToMinutes(endB);
  if ([aStart, aEnd, bStart, bEnd].some((value) => value === null)) return false;
  return aStart < bEnd && bStart < aEnd;
}
// Gestiona teacher programar find row overlaps.
function teacherScheduleFindRowOverlaps(row, options = {}) {
  const normalized = sanitizeTeacherScheduleRow(row);
  const ignoreKey = String(options.ignoreKey || '');
  const weekday = parseInt(normalized.weekday, 10);
  if (!normalized.startTime || !normalized.endTime || !Number.isInteger(weekday)) return [];
  return teacherScheduleRowsSorted()
    .filter((item) => parseInt(item.weekday, 10) === weekday)
    .filter((item) => teacherScheduleCellKey(item.weekday || 0, item.startTime, item.endTime) !== ignoreKey)
    .filter((item) => teacherScheduleIntervalsOverlap(normalized.startTime, normalized.endTime, item.startTime, item.endTime));
}
// Gestiona teacher programar cell key.
function teacherScheduleCellKey(weekday, startTime, endTime) {
  return `${weekday}-${startTime}-${endTime}`;
}
// Gestiona teacher programar slot key.
function teacherScheduleSlotKey(startTime, endTime) {
  return `${startTime}-${endTime}`;
}
// Gestiona teacher programar slot lista.
function teacherScheduleSlotList(rows = teacherScheduleRowsSorted()) {
  const slotMap = new Map();
  rows.forEach((row) => {
    const key = teacherScheduleSlotKey(row.startTime, row.endTime);
    if (!slotMap.has(key)) slotMap.set(key, { startTime: row.startTime, endTime: row.endTime });
  });
  return Array.from(slotMap.values()).sort((a, b) => String(a.startTime).localeCompare(String(b.startTime), 'es') || String(a.endTime).localeCompare(String(b.endTime), 'es'));
}
// Gestiona teacher programar cell mapear.
function teacherScheduleCellMap(rows = teacherScheduleRowsSorted()) {
  return rows.reduce((map, row) => {
    map.set(teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime), row);
    return map;
  }, new Map());
}
// Gestiona teacher programar subjects.
function teacherScheduleSubjects() {
  return Array.from(new Set([
    ...((S.secciones || []).map((section) => section.materia || '').filter(Boolean)),
    ...((S.grades || []).map((grade) => grade.subjectName || '').filter(Boolean)),
    ...teacherScheduleRowsSorted().map((row) => row.subject || '').filter(Boolean),
  ])).sort((a, b) => String(a).localeCompare(String(b), 'es'));
}
// Gestiona teacher programar area options.
function teacherScheduleAreaOptions(gradeId = '') {
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === gradeId) || null;
  return lessonPlanAreaOptions(gradeId, grade?.name || '');
}
// Gestiona teacher programar sección options.
function teacherScheduleSectionOptions(gradeId = '', area = '') {
  const cleanArea = String(area || '').trim();
  return sortCourses((S.secciones || []).filter((section) => {
    const sameGrade = !gradeId || section.gradeId === gradeId;
    const sectionArea = String(section.area || lessonPlanAreaFromGroup(section) || '').trim();
    const sameArea = !cleanArea || sectionArea === cleanArea;
    return sameGrade && sameArea;
  }));
}
// Gestiona teacher programar asignatura options for borrador.
function teacherScheduleSubjectOptionsForDraft(draft = {}) {
  // Gestiona sección.
  const section = (S.secciones || []).find((item) => item.id === draft.sectionId) || null;
  const gradeId = String(draft.gradeId || section?.gradeId || '').trim();
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === gradeId) || null;
  const area = String(draft.area || section?.area || lessonPlanAreaFromGroup(section) || '').trim();
  return curriculumSubjectOptions({
    gradeId,
    gradeName: grade?.name || '',
    area,
    sectionName: section?.sec || '',
    scopeToExistingSections: !!section?.sec,
  });
}
// Gestiona teacher programar block label.
function teacherScheduleBlockLabel(type, fallbackText = '') {
  if (type === 'class') return fallbackText || 'Clase';
  if (type === 'planning') return fallbackText || 'Hora pedag?gica / planificaci?n';
  if (type === 'break') return 'Recreo / Receso';
  if (type === 'lunch') return 'Almuerzo';
  if (type === 'event') return fallbackText || 'Evento institucional';
  return 'Hora pedag?gica / planificaci?n';
}
// Gestiona teacher programar block type label.
function teacherScheduleBlockTypeLabel(type) {
  if (type === 'class') return 'Clase';
  if (type === 'planning') return 'Hora pedag?gica / planificaci?n';
  if (type === 'break') return 'Receso / recreo';
  if (type === 'lunch') return 'Almuerzo';
  if (type === 'event') return 'Evento institucional';
  return 'Hora pedag?gica / planificaci?n';
}
// Gestiona teacher programar block tone.
function teacherScheduleBlockTone(type) {
  if (type === 'planning') return 'is-planning';
  if (type === 'break') return 'is-break';
  if (type === 'lunch') return 'is-lunch';
  if (type === 'event') return 'is-event';
  return 'is-class';
}
// Gestiona teacher programar cell summary.
function teacherScheduleCellSummary(row) {
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === row.gradeId) || null;
  // Gestiona sección.
  const section = (S.secciones || []).find((item) => item.id === row.sectionId) || null;
  const title = row.blockType === 'class'
    ? (row.subject || section?.materia || 'Clase')
    : teacherScheduleBlockLabel(row.blockType, row.subject);
  return {
    title,
    kindLabel: row.blockType === 'class' ? 'Clase' : teacherScheduleBlockTypeLabel(row.blockType),
    sectionLabel: section ? `${grade?.name || section.grado || ''} ${section.sec || ''}`.trim() : '',
    roomLabel: row.room ? `Aula ${row.room}` : '',
    notes: row.notes || '',
  };
}
// Gestiona teacher programar validar borrador.
function teacherScheduleValidateDraft(draft, context = {}) {
  // Valida un bloque del horario contra formato, datos académicos y solapes con la jornada existente.
  const normalized = sanitizeTeacherScheduleRow(draft || {});
  const errors = {};
  const startMinutes = teacherScheduleTimeToMinutes(normalized.startTime);
  const endMinutes = teacherScheduleTimeToMinutes(normalized.endTime);
  if (startMinutes === null) errors.startTime = 'Define una hora de inicio v?lida.';
  if (endMinutes === null) errors.endTime = 'Define una hora de fin v?lida.';
  if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
    errors.endTime = 'La hora de fin debe ser mayor que la hora de inicio.';
  }
  const weekday = parseInt(normalized.weekday, 10);
  if (!Number.isInteger(weekday) || !TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(weekday)) {
    errors.weekday = 'Selecciona un d?a v?lido.';
  }
  if (normalized.blockType === 'class') {
    if (!String(normalized.educationLevel || '').trim()) errors.gradeId = 'Debes seleccionar un grado con nivel educativo.';
    if (!String(normalized.gradeId || '').trim()) errors.gradeId = 'Debes seleccionar un grado.';
    if (!String(normalized.area || '').trim()) errors.area = 'Debes seleccionar un ?rea.';
    if (!String(normalized.subject || '').trim()) errors.subject = 'Debes seleccionar una asignatura.';
    if (!String(normalized.sectionId || '').trim()) errors.sectionId = 'Debes seleccionar una secci?n.';
  }
  if (!Object.keys(errors).length) {
    const overlaps = teacherScheduleFindRowOverlaps(normalized, { ignoreKey: context.ignoreKey || '' });
    if (overlaps.length) {
      const overlap = overlaps[0];
      errors.startTime = `Este segmento se solapa con ${teacherScheduleFormatTime(overlap.startTime)} - ${teacherScheduleFormatTime(overlap.endTime)}.`;
    }
  }
  return errors;
}
// Gestiona teacher programar set borrador errors.
function teacherScheduleSetDraftErrors(errors = {}) {
  TEACHER_SCHEDULE_EDITOR.errors = errors && typeof errors === 'object' ? errors : {};
}
// Gestiona teacher programar clear borrador error.
function teacherScheduleClearDraftError(field) {
  if (!field || !TEACHER_SCHEDULE_EDITOR.errors?.[field]) return;
  delete TEACHER_SCHEDULE_EDITOR.errors[field];
}
// Gestiona teacher programar focus first error.
function teacherScheduleFocusFirstError() {
  const body = document.getElementById('schedule-cell-body');
  if (!body) return;
  const fieldSelectors = {
    weekday: `select[data-schedule-field="weekday"]`,
    startTime: `[data-schedule-field="startTime"]`,
    endTime: `[data-schedule-field="endTime"]`,
    gradeId: `select[data-schedule-field="gradeId"]`,
    area: `select[data-schedule-field="area"]`,
    subject: `[data-schedule-field="subject"]`,
    sectionId: `select[data-schedule-field="sectionId"]`,
  };
  const firstKey = ['weekday', 'startTime', 'endTime', 'gradeId', 'area', 'subject', 'sectionId'].find((key) => TEACHER_SCHEDULE_EDITOR.errors?.[key]);
  if (!firstKey) return;
  setTimeout(() => {
    try { body.querySelector(fieldSelectors[firstKey])?.focus(); } catch (_) {}
  }, 0);
}
// Gestiona add teacher planner event.
function addTeacherPlannerEvent() {
  ensureTeacherPlannerState();
  const date = document.getElementById('planner-event-date')?.value || '';
  const title = String(document.getElementById('planner-event-title')?.value || '').trim();
  const type = normalizePlannerEventType(document.getElementById('planner-event-type')?.value || 'custom');
  if (!date || !title) { toast('Completa fecha y título del evento', true); return; }
  S.teacherPlanner.customEvents.push({ id: uid(), date, title, type, source: 'Personal' });
  persist();
  go(currentPage);
  toast('Evento agregado al calendario docente');
}
// Gestiona remove teacher planner event.
async function removeTeacherPlannerEvent(id) {
  ensureTeacherPlannerState();
  S.teacherPlanner.customEvents = S.teacherPlanner.customEvents.filter((event) => event.id !== id);
  persist({ immediate: true });
  go(currentPage);
}
// Inserta o reemplaza una celda semanal usando su llave horaria para evitar duplicados en el planner.
function teacherScheduleUpsertRow(nextRow) {
  ensureTeacherPlannerState();
  const normalized = sanitizeTeacherScheduleRow(nextRow);
  const key = teacherScheduleCellKey(normalized.weekday || 0, normalized.startTime, normalized.endTime);
  const nextRows = teacherScheduleRowsSorted().filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== key);
  nextRows.push(normalized);
  S.teacherPlanner.weeklySchedule = nextRows;
}
// Gestiona teacher programar replace row slot.
function teacherScheduleReplaceRowSlot(weekday, previousStartTime, previousEndTime, nextStartTime, nextEndTime) {
  ensureTeacherPlannerState();
  const rows = teacherScheduleRowsSorted();
  const previousKey = teacherScheduleCellKey(weekday, previousStartTime, previousEndTime);
  const sourceRow = rows.find((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) === previousKey);
  if (!sourceRow) return false;
  const normalized = sanitizeTeacherScheduleRow({ ...sourceRow, startTime: nextStartTime, endTime: nextEndTime });
  const nextKey = teacherScheduleCellKey(weekday, normalized.startTime, normalized.endTime);
  const nextRows = rows.filter((row) => {
    const key = teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime);
    return key !== previousKey && key !== nextKey;
  });
  nextRows.push(normalized);
  S.teacherPlanner.weeklySchedule = nextRows;
  return true;
}
// Gestiona teacher programar get row.
function teacherScheduleGetRow(weekday, startTime, endTime) {
  const key = teacherScheduleCellKey(weekday, startTime, endTime);
  return teacherScheduleRowsSorted().find((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) === key) || null;
}
// Genera una base uniforme de segmentos entre dos horas para usarla como semilla del horario semanal.
function teacherScheduleBuildBaseSlots(startTime, endTime, blockMinutes, options = {}) {
  // Divide un rango horario en bloques fijos para usarlo como base del asistente de horarios.
  const startMinutes = teacherScheduleTimeToMinutes(startTime);
  const endMinutes = teacherScheduleTimeToMinutes(endTime);
  const duration = Math.max(1, parseInt(blockMinutes, 10) || 0);
  const mergeRemainderToLast = options.mergeRemainderToLast !== false;
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes || duration <= 0) return [];
  const slots = [];
  let cursor = startMinutes;
  while ((cursor + duration) <= endMinutes) {
    const next = cursor + duration;
    slots.push({ startTime: teacherScheduleMinutesToTime(cursor), endTime: teacherScheduleMinutesToTime(next) });
    cursor = next;
  }
  if (!slots.length) {
    slots.push({ startTime: teacherScheduleMinutesToTime(startMinutes), endTime: teacherScheduleMinutesToTime(endMinutes) });
    return slots;
  }
  if (cursor < endMinutes) {
    if (mergeRemainderToLast) {
      slots[slots.length - 1].endTime = teacherScheduleMinutesToTime(endMinutes);
    } else {
      slots.push({ startTime: teacherScheduleMinutesToTime(cursor), endTime: teacherScheduleMinutesToTime(endMinutes) });
    }
  }
  return slots;
}
// Gestiona teacher programar analizar durations.
function teacherScheduleParseDurations(raw) {
  const values = String(raw || '')
    .split(/[,\s;/|]+/g)
    .map((item) => parseInt(item, 10))
    .filter((value) => Number.isInteger(value) && value >= 5);
  return values.length ? values : [40];
}
// Gestiona teacher programar collect wizard special segments.
function teacherScheduleCollectWizardSpecialSegments() {
  const specials = [];
  // Gestiona push special.
  const pushSpecial = (enabled, start, end, type, label) => {
    if (!enabled) return;
    const startTime = normalizeTeacherScheduleTimeValue(start);
    const endTime = normalizeTeacherScheduleTimeValue(end);
    if (!startTime || !endTime) return;
    const startMinutes = teacherScheduleTimeToMinutes(startTime);
    const endMinutes = teacherScheduleTimeToMinutes(endTime);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) return;
    specials.push({ startTime, endTime, startMinutes, endMinutes, type, label });
  };
  pushSpecial(!!TEACHER_SCHEDULE_WIZARD.includeBreak, TEACHER_SCHEDULE_WIZARD.breakStart, TEACHER_SCHEDULE_WIZARD.breakEnd, 'break', teacherScheduleDefaultSubjectForBlockType('break'));
  pushSpecial(!!TEACHER_SCHEDULE_WIZARD.includeLunch, TEACHER_SCHEDULE_WIZARD.lunchStart, TEACHER_SCHEDULE_WIZARD.lunchEnd, 'lunch', teacherScheduleDefaultSubjectForBlockType('lunch'));
  return specials.sort((a, b) => a.startMinutes - b.startMinutes);
}
// Compone la secuencia final de segmentos del asistente mezclando bloques pedagógicos y pausas especiales.
function teacherScheduleWizardBuildSegments(startTime, endTime, durations, specials = []) {
  // Construye la secuencia final del asistente mezclando bloques de clase y pausas especiales.
  const startMinutes = teacherScheduleTimeToMinutes(startTime);
  const endMinutes = teacherScheduleTimeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) return [];
  const safeDurations = Array.isArray(durations) && durations.length ? durations : [40];
  const segments = [];
  let cursor = startMinutes;
  let durationIndex = 0;
  const sortedSpecials = specials
    .filter((item) => Number.isInteger(item.startMinutes) && Number.isInteger(item.endMinutes))
    .sort((a, b) => a.startMinutes - b.startMinutes);
  while (cursor < endMinutes) {
    const special = sortedSpecials.find((item) => item.startMinutes >= cursor && item.startMinutes < endMinutes);
    const normalEnd = special ? Math.min(special.startMinutes, endMinutes) : endMinutes;
    while (cursor < normalEnd) {
      const duration = safeDurations[durationIndex % safeDurations.length];
      durationIndex += 1;
      const next = Math.min(cursor + duration, normalEnd);
      if (next <= cursor) break;
      segments.push({
        startTime: teacherScheduleMinutesToTime(cursor),
        endTime: teacherScheduleMinutesToTime(next),
        blockType: 'planning',
        subject: 'Clase / segmento pedag?gico',
      });
      cursor = next;
    }
    if (!special || special.startMinutes < cursor) continue;
    if (special.startMinutes >= endMinutes) break;
    segments.push({
      startTime: teacherScheduleMinutesToTime(special.startMinutes),
      endTime: teacherScheduleMinutesToTime(Math.min(special.endMinutes, endMinutes)),
      blockType: special.type,
      subject: special.label || teacherScheduleDefaultSubjectForBlockType(special.type),
    });
    cursor = Math.min(special.endMinutes, endMinutes);
  }
  return segments.filter((segment) => teacherScheduleTimeToMinutes(segment.endTime) > teacherScheduleTimeToMinutes(segment.startTime));
}
// Pinta el asistente paso a paso que ayuda a generar un horario inicial sin editar cada celda manualmente.
function renderTeacherScheduleWizard() {
  const body = document.getElementById('schedule-wizard-body');
  if (!body) return;
  const step = TEACHER_SCHEDULE_WIZARD.step;
  const progress = `<div class="teacher-schedule-wizard-progress">Paso ${step} de 4</div>`;
  if (step === 1) {
    const currentJourney = sanitizeTeacherScheduleJourneyType(TEACHER_SCHEDULE_WIZARD.journeyType || S.teacherPlanner?.journeyType || 'extended');
    body.innerHTML = `
      ${progress}
      <div class="fg">
        <label class="lbl">?Qu? tipo de jornada trabajas?</label>
        <select class="sel" id="schedule-wizard-journey">
          ${teacherScheduleJourneyOptions().map((option) => `<option value="${option.id}" ${option.id === currentJourney ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
        </select>
        <div class="form-note">La app adaptar? la estructura a tu realidad laboral. Opci?n recomendada: jornada extendida.</div>
      </div>
      <div class="fr">
        <div class="fg"><label class="lbl">Hora de inicio</label><input class="inp" id="schedule-wizard-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.startTime)}"></div>
        <div class="fg"><label class="lbl">Hora de fin</label><input class="inp" id="schedule-wizard-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.endTime)}"></div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-wizard')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="nextTeacherScheduleWizardStep()">Siguiente</button>
      </div>`;
    return;
  }
  if (step === 2) {
    body.innerHTML = `
      ${progress}
      <div class="fg">
        <label class="lbl">Duraci?n de bloques (minutos)</label>
        <input class="inp" id="schedule-wizard-durations" type="text" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.durationsRaw)}" placeholder="Ej. 40 o 40,35">
        <div class="form-note">Puedes usar una o varias duraciones separadas por coma. Ejemplo: 40,35 para alternar por tanda.</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="prevTeacherScheduleWizardStep()">Atrás</button>
        <button class="btn btn-primary" type="button" onclick="nextTeacherScheduleWizardStep()">Siguiente</button>
      </div>`;
    return;
  }
  if (step === 3) {
    body.innerHTML = `
      ${progress}
      <label class="teacher-schedule-modal-check" for="schedule-wizard-break-enabled">
        <input id="schedule-wizard-break-enabled" type="checkbox" ${TEACHER_SCHEDULE_WIZARD.includeBreak ? 'checked' : ''}>
        <span>Incluir recreo / receso</span>
      </label>
      <div class="fr">
        <div class="fg"><label class="lbl">Inicio recreo</label><input class="inp" id="schedule-wizard-break-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.breakStart)}" ${TEACHER_SCHEDULE_WIZARD.includeBreak ? '' : 'disabled'}></div>
        <div class="fg"><label class="lbl">Fin recreo</label><input class="inp" id="schedule-wizard-break-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.breakEnd)}" ${TEACHER_SCHEDULE_WIZARD.includeBreak ? '' : 'disabled'}></div>
      </div>
      <label class="teacher-schedule-modal-check" for="schedule-wizard-lunch-enabled">
        <input id="schedule-wizard-lunch-enabled" type="checkbox" ${TEACHER_SCHEDULE_WIZARD.includeLunch ? 'checked' : ''}>
        <span>Incluir almuerzo</span>
      </label>
      <div class="fr">
        <div class="fg"><label class="lbl">Inicio almuerzo</label><input class="inp" id="schedule-wizard-lunch-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.lunchStart)}" ${TEACHER_SCHEDULE_WIZARD.includeLunch ? '' : 'disabled'}></div>
        <div class="fg"><label class="lbl">Fin almuerzo</label><input class="inp" id="schedule-wizard-lunch-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.lunchEnd)}" ${TEACHER_SCHEDULE_WIZARD.includeLunch ? '' : 'disabled'}></div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="prevTeacherScheduleWizardStep()">Atrás</button>
        <button class="btn btn-primary" type="button" onclick="nextTeacherScheduleWizardStep()">Siguiente</button>
      </div>`;
    const breakToggle = document.getElementById('schedule-wizard-break-enabled');
    const lunchToggle = document.getElementById('schedule-wizard-lunch-enabled');
    breakToggle?.addEventListener('change', () => {
      const enabled = !!breakToggle.checked;
      const startInput = document.getElementById('schedule-wizard-break-start');
      const endInput = document.getElementById('schedule-wizard-break-end');
      if (startInput) startInput.disabled = !enabled;
      if (endInput) endInput.disabled = !enabled;
    });
    lunchToggle?.addEventListener('change', () => {
      const enabled = !!lunchToggle.checked;
      const startInput = document.getElementById('schedule-wizard-lunch-start');
      const endInput = document.getElementById('schedule-wizard-lunch-end');
      if (startInput) startInput.disabled = !enabled;
      if (endInput) endInput.disabled = !enabled;
    });
    return;
  }
  body.innerHTML = `
    ${progress}
    <div class="teacher-schedule-empty-onboarding" style="margin-top:0;">
      <div class="teacher-schedule-empty-onboarding-title">Resumen de la jornada</div>
      <div class="teacher-schedule-empty-onboarding-copy">
        ${escapeHtml(teacherScheduleJourneyMeta(TEACHER_SCHEDULE_WIZARD.journeyType || 'extended').label)} ?
        ${escapeHtml(teacherScheduleFormatTime(TEACHER_SCHEDULE_WIZARD.startTime))} - ${escapeHtml(teacherScheduleFormatTime(TEACHER_SCHEDULE_WIZARD.endTime))} ?
        bloques ${escapeHtml(TEACHER_SCHEDULE_WIZARD.durationsRaw || '40')} min
      </div>
      <div class="teacher-schedule-empty-onboarding-copy">
        Especiales: ${TEACHER_SCHEDULE_WIZARD.includeBreak ? 'Recreo activo' : 'Sin recreo'} ? ${TEACHER_SCHEDULE_WIZARD.includeLunch ? 'Almuerzo activo' : 'Sin almuerzo'}.
      </div>
    </div>
    <div class="mf">
      <button class="btn btn-outline" type="button" onclick="prevTeacherScheduleWizardStep()">Atrás</button>
      <button class="btn btn-primary" type="button" onclick="generateTeacherScheduleFromWizard()">Generar horario base</button>
    </div>`;
}
// Abre abrir teacher programar wizard modal.
function openTeacherScheduleWizardModal() {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  ensureTeacherPlannerState();
  TEACHER_SCHEDULE_WIZARD.journeyType = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || TEACHER_SCHEDULE_WIZARD.journeyType || 'extended');
  TEACHER_SCHEDULE_WIZARD.step = 1;
  renderTeacherScheduleWizard();
  openM('m-schedule-wizard');
}
// Gestiona next teacher programar wizard step.
function nextTeacherScheduleWizardStep() {
  if (TEACHER_SCHEDULE_WIZARD.step === 1) {
    const journeyType = sanitizeTeacherScheduleJourneyType(document.getElementById('schedule-wizard-journey')?.value || TEACHER_SCHEDULE_WIZARD.journeyType || 'extended');
    TEACHER_SCHEDULE_WIZARD.journeyType = journeyType;
    teacherScheduleApplyJourneyPreset(journeyType, { includeWeekdays: true, includeWizard: true });
    const start = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-start')?.value || '');
    const end = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-end')?.value || '');
    const startMinutes = teacherScheduleTimeToMinutes(start);
    const endMinutes = teacherScheduleTimeToMinutes(end);
    if (!start || !end || startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      toast('Define una jornada v?lida con hora de inicio menor que la hora de fin.', true);
      return;
    }
    TEACHER_SCHEDULE_WIZARD.startTime = start;
    TEACHER_SCHEDULE_WIZARD.endTime = end;
  }
  if (TEACHER_SCHEDULE_WIZARD.step === 2) {
    const durationsRaw = String(document.getElementById('schedule-wizard-durations')?.value || '').trim();
    const durations = teacherScheduleParseDurations(durationsRaw);
    if (!durations.length) {
      toast('Escribe al menos una duraci?n v?lida en minutos.', true);
      return;
    }
    TEACHER_SCHEDULE_WIZARD.durationsRaw = durationsRaw || '40';
  }
  if (TEACHER_SCHEDULE_WIZARD.step === 3) {
    TEACHER_SCHEDULE_WIZARD.includeBreak = !!document.getElementById('schedule-wizard-break-enabled')?.checked;
    TEACHER_SCHEDULE_WIZARD.includeLunch = !!document.getElementById('schedule-wizard-lunch-enabled')?.checked;
    TEACHER_SCHEDULE_WIZARD.breakStart = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-break-start')?.value || '');
    TEACHER_SCHEDULE_WIZARD.breakEnd = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-break-end')?.value || '');
    TEACHER_SCHEDULE_WIZARD.lunchStart = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-lunch-start')?.value || '');
    TEACHER_SCHEDULE_WIZARD.lunchEnd = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-lunch-end')?.value || '');
  }
  TEACHER_SCHEDULE_WIZARD.step = Math.min(4, TEACHER_SCHEDULE_WIZARD.step + 1);
  renderTeacherScheduleWizard();
}
// Gestiona prev teacher programar wizard step.
function prevTeacherScheduleWizardStep() {
  TEACHER_SCHEDULE_WIZARD.step = Math.max(1, TEACHER_SCHEDULE_WIZARD.step - 1);
  renderTeacherScheduleWizard();
}
// Gestiona generate teacher programar from wizard.
function generateTeacherScheduleFromWizard() {
  // Genera un horario semanal completo a partir del asistente paso a paso y reemplaza la base anterior si existe.
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  S.teacherPlanner.journeyType = sanitizeTeacherScheduleJourneyType(TEACHER_SCHEDULE_WIZARD.journeyType || S.teacherPlanner.journeyType || 'extended');
  const durations = teacherScheduleParseDurations(TEACHER_SCHEDULE_WIZARD.durationsRaw);
  const specials = teacherScheduleCollectWizardSpecialSegments();
  const invalidSpecial = specials.find((item) => item.startMinutes < teacherScheduleTimeToMinutes(TEACHER_SCHEDULE_WIZARD.startTime) || item.endMinutes > teacherScheduleTimeToMinutes(TEACHER_SCHEDULE_WIZARD.endTime));
  if (invalidSpecial) {
    toast('Los horarios de recreo/almuerzo deben estar dentro de la jornada.', true);
    return;
  }
  for (let i = 0; i < specials.length; i += 1) {
    const current = specials[i];
    const next = specials[i + 1];
    if (next && current.endMinutes > next.startMinutes) {
      toast('Los segmentos especiales se est?n solapando entre s?.', true);
      return;
    }
  }
  const segments = teacherScheduleWizardBuildSegments(
    TEACHER_SCHEDULE_WIZARD.startTime,
    TEACHER_SCHEDULE_WIZARD.endTime,
    durations,
    specials
  );
  if (!segments.length) {
    toast('No se pudo generar la estructura base. Revisa los datos del asistente.', true);
    return;
  }
  if (teacherScheduleRowsSorted().length && !confirm('Se reemplazar? el horario semanal actual por la estructura generada. ?Deseas continuar?')) return;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  S.teacherPlanner.weeklySchedule = [];
  activeWeekdays.forEach((weekday) => {
    segments.forEach((segment) => {
      S.teacherPlanner.weeklySchedule.push(sanitizeTeacherScheduleRow({
        id: uid(),
        weekday,
        startTime: segment.startTime,
        endTime: segment.endTime,
        blockType: segment.blockType || 'planning',
        subject: segment.subject || teacherScheduleDefaultSubjectForBlockType(segment.blockType || 'planning'),
        gradeId: '',
        sectionId: '',
        area: '',
        room: '',
        notes: '',
      }));
    });
  });
  persist();
  closeM('m-schedule-wizard');
  go(currentPage);
  toast(`Horario generado con ${segments.length} segmento(s) base por d?a (${teacherScheduleJourneyMeta(S.teacherPlanner.journeyType).label}).`);
}
// Gestiona teacher programar checked days.
function teacherScheduleCheckedDays(inputName) {
  return Array.from(document.querySelectorAll(`input[name="${inputName}"]:checked`))
    .map((input) => parseInt(input.value, 10))
    .filter((value, index, list) => Number.isInteger(value) && list.indexOf(value) === index);
}
// Renderiza renderizar teacher programar day checkboxes.
function renderTeacherScheduleDayCheckboxes(inputName, selectedDays = [], excludeWeekday = null) {
  const activeWeekdays = teacherScheduleActiveWeekdays();
  return activeWeekdays
    .filter((weekday) => weekday !== excludeWeekday)
    .map((weekday) => `
      <label class="teacher-schedule-day-pill">
        <input type="checkbox" name="${inputName}" value="${weekday}" ${selectedDays.includes(weekday) ? 'checked' : ''}>
        <span>${plannerWeekdayName(weekday)}</span>
      </label>`).join('');
}
// Abre abrir teacher programar base modal.
function openTeacherScheduleBaseModal() {
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const preset = teacherScheduleJourneyPreset(S.teacherPlanner.journeyType || 'extended');
  const startInput = document.getElementById('schedule-base-start');
  const endInput = document.getElementById('schedule-base-end');
  const durationInput = document.getElementById('schedule-base-duration');
  const specialsInput = document.getElementById('schedule-base-specials');
  const mergeRemainderInput = document.getElementById('schedule-base-merge-remainder');
  const firstDuration = teacherScheduleParseDurations(preset.durationsRaw || '40')[0] || 40;
  if (startInput) startInput.value = preset.startTime || '07:30';
  if (endInput) endInput.value = preset.endTime || '11:55';
  if (durationInput) durationInput.value = String(firstDuration);
  if (specialsInput) specialsInput.checked = !!(preset.includeBreak || preset.includeLunch);
  if (mergeRemainderInput) mergeRemainderInput.checked = true;
  openM('m-schedule-base');
}
// Gestiona generate teacher programar base.
function generateTeacherScheduleBase() {
  // Construye una plantilla rápida de bloques horarios iguales para todos los días activos.
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const slots = teacherScheduleBuildBaseSlots(
    document.getElementById('schedule-base-start')?.value || '',
    document.getElementById('schedule-base-end')?.value || '',
    document.getElementById('schedule-base-duration')?.value || '',
    { mergeRemainderToLast: !!document.getElementById('schedule-base-merge-remainder')?.checked }
  );
  if (!slots.length) {
    toast('Revisa la hora inicial, final y la duraci?n de cada bloque', true);
    return;
  }
  if (teacherScheduleRowsSorted().length && !confirm('Se reemplazar? el horario semanal actual por una nueva base. ?Deseas continuar?')) return;
  S.teacherPlanner.weeklySchedule = [];
  slots.forEach((slot) => {
    activeWeekdays.forEach((weekday) => {
      S.teacherPlanner.weeklySchedule.push({
        id: uid(),
        weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
        blockType: 'planning',
        subject: teacherScheduleDefaultSubjectForBlockType('planning'),
        gradeId: '',
        sectionId: '',
        room: '',
        notes: '',
      });
    });
  });
  persist();
  closeM('m-schedule-base');
  go(currentPage);
  toast(`Horario base generado con ${slots.length} bloque(s) en ${activeWeekdays.length} d?a(s) activo(s)`);
}
// Abre abrir teacher programar cell editor.
function openTeacherScheduleCellEditor(weekday, startTime, endTime) {
  // Abre el editor de un segmento existente y precarga su estado para edición puntual.
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const existing = teacherScheduleGetRow(weekday, startTime, endTime);
  const normalizedWeekday = parseInt(weekday, 10) || 0;
  const normalizedStart = normalizeTeacherScheduleTimeValue(startTime || '');
  const normalizedEnd = normalizeTeacherScheduleTimeValue(endTime || '');
  TEACHER_SCHEDULE_EDITOR.mode = 'edit';
  TEACHER_SCHEDULE_EDITOR.originalKey = teacherScheduleCellKey(normalizedWeekday, normalizedStart, normalizedEnd);
  TEACHER_SCHEDULE_EDITOR.weekday = normalizedWeekday;
  TEACHER_SCHEDULE_EDITOR.startTime = normalizedStart;
  TEACHER_SCHEDULE_EDITOR.endTime = normalizedEnd;
  teacherScheduleSetDraftErrors({});
  TEACHER_SCHEDULE_EDITOR.draft = existing ? { ...existing } : sanitizeTeacherScheduleRow({
    id: uid(),
    weekday,
    startTime,
    endTime,
    blockType: 'planning',
    subject: teacherScheduleDefaultSubjectForBlockType('planning'),
    gradeId: '',
    sectionId: '',
    room: '',
    notes: '',
  });
  renderTeacherScheduleCellEditor();
  openM('m-schedule-cell');
}
// Abre un editor para crear un nuevo segmento en el día indicado tomando el siguiente hueco disponible como punto de partida.
function openTeacherScheduleSegmentEditor(weekday = null) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const view = teacherScheduleGetViewState();
  const targetWeekday = Number.isInteger(parseInt(weekday, 10))
    ? parseInt(weekday, 10)
    : (view.selectedWeekday ?? activeWeekdays[0] ?? 0);
  const dayRows = teacherScheduleRowsForWeekday(targetWeekday);
  const lastRow = dayRows[dayRows.length - 1] || null;
  const nextStart = lastRow?.endTime || '07:30';
  const nextStartMinutes = teacherScheduleTimeToMinutes(nextStart);
  const fallbackEnd = nextStartMinutes === null ? '08:10' : teacherScheduleMinutesToTime(Math.min(nextStartMinutes + 40, (23 * 60) + 59));
  TEACHER_SCHEDULE_EDITOR.mode = 'create';
  TEACHER_SCHEDULE_EDITOR.originalKey = '';
  TEACHER_SCHEDULE_EDITOR.weekday = targetWeekday;
  TEACHER_SCHEDULE_EDITOR.startTime = nextStart;
  TEACHER_SCHEDULE_EDITOR.endTime = fallbackEnd;
  teacherScheduleSetDraftErrors({});
  TEACHER_SCHEDULE_EDITOR.draft = sanitizeTeacherScheduleRow({
    id: uid(),
    weekday: targetWeekday,
    startTime: nextStart,
    endTime: fallbackEnd,
    blockType: 'planning',
    subject: teacherScheduleDefaultSubjectForBlockType('planning'),
    gradeId: '',
    educationLevel: '',
    sectionId: '',
    room: '',
    notes: '',
  });
  renderTeacherScheduleCellEditor();
  openM('m-schedule-cell');
}
// Actualiza el borrador de la celda activa y refresca los selects dependientes cuando cambia grado, área o tipo de bloque.
function setTeacherScheduleCellDraft(field, value) {
  if (!TEACHER_SCHEDULE_EDITOR.draft) return;
  if (field === 'weekday') {
    const nextWeekday = parseInt(value, 10);
    if (Number.isInteger(nextWeekday) && TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(nextWeekday)) {
      TEACHER_SCHEDULE_EDITOR.draft.weekday = nextWeekday;
      TEACHER_SCHEDULE_EDITOR.weekday = nextWeekday;
      teacherScheduleClearDraftError('weekday');
      renderTeacherScheduleCellEditor();
    }
    return;
  }
  if (field === 'startTime' || field === 'endTime') {
    const normalized = normalizeTeacherScheduleTimeValue(value);
    TEACHER_SCHEDULE_EDITOR.draft[field] = normalized;
    TEACHER_SCHEDULE_EDITOR[field] = normalized;
    teacherScheduleClearDraftError(field);
    return;
  }
  if (field === 'blockType') {
    const previousType = sanitizeTeacherScheduleBlockType(TEACHER_SCHEDULE_EDITOR.draft.blockType);
    const nextType = sanitizeTeacherScheduleBlockType(value);
    TEACHER_SCHEDULE_EDITOR.draft.blockType = nextType;
    teacherScheduleSetDraftErrors({});
    if (nextType !== 'class') {
      TEACHER_SCHEDULE_EDITOR.draft.gradeId = '';
      TEACHER_SCHEDULE_EDITOR.draft.sectionId = '';
      TEACHER_SCHEDULE_EDITOR.draft.area = '';
      TEACHER_SCHEDULE_EDITOR.draft.subject = teacherScheduleDefaultSubjectForBlockType(nextType);
    } else if (!TEACHER_SCHEDULE_EDITOR.draft.subject || TEACHER_SCHEDULE_EDITOR.draft.subject === teacherScheduleDefaultSubjectForBlockType(previousType) || previousType !== 'class') {
      TEACHER_SCHEDULE_EDITOR.draft.subject = '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  if (field === 'gradeId') {
    TEACHER_SCHEDULE_EDITOR.draft.gradeId = value || '';
    // Gestiona grado.
    const grade = (S.grades || []).find((item) => item.id === TEACHER_SCHEDULE_EDITOR.draft.gradeId);
    TEACHER_SCHEDULE_EDITOR.draft.educationLevel = normalizeEducationLevelName(grade?.educationLevel || '');
    teacherScheduleClearDraftError('gradeId');
    const allowedAreas = teacherScheduleAreaOptions(value);
    if (!allowedAreas.includes(String(TEACHER_SCHEDULE_EDITOR.draft.area || '').trim())) {
      TEACHER_SCHEDULE_EDITOR.draft.area = '';
    }
    const allowedSections = teacherScheduleSectionOptions(value, TEACHER_SCHEDULE_EDITOR.draft.area || '');
    if (!allowedSections.some((section) => section.id === TEACHER_SCHEDULE_EDITOR.draft.sectionId)) TEACHER_SCHEDULE_EDITOR.draft.sectionId = '';
    const allowedSubjects = teacherScheduleSubjectOptionsForDraft(TEACHER_SCHEDULE_EDITOR.draft);
    if (!allowedSubjects.some((subject) => subject.value === TEACHER_SCHEDULE_EDITOR.draft.subject)) {
      TEACHER_SCHEDULE_EDITOR.draft.subject = allowedSubjects.length === 1 ? allowedSubjects[0].value : '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  if (field === 'area') {
    TEACHER_SCHEDULE_EDITOR.draft.area = String(value || '').trim();
    teacherScheduleClearDraftError('area');
    const allowedSections = teacherScheduleSectionOptions(TEACHER_SCHEDULE_EDITOR.draft.gradeId || '', TEACHER_SCHEDULE_EDITOR.draft.area || '');
    if (!allowedSections.some((section) => section.id === TEACHER_SCHEDULE_EDITOR.draft.sectionId)) TEACHER_SCHEDULE_EDITOR.draft.sectionId = '';
    const allowedSubjects = teacherScheduleSubjectOptionsForDraft(TEACHER_SCHEDULE_EDITOR.draft);
    if (!allowedSubjects.some((subject) => subject.value === TEACHER_SCHEDULE_EDITOR.draft.subject)) {
      TEACHER_SCHEDULE_EDITOR.draft.subject = allowedSubjects.length === 1 ? allowedSubjects[0].value : '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  if (field === 'sectionId') {
    TEACHER_SCHEDULE_EDITOR.draft.sectionId = value || '';
    teacherScheduleClearDraftError('sectionId');
    // Gestiona sección.
    const section = (S.secciones || []).find((item) => item.id === value);
    if (section) {
      TEACHER_SCHEDULE_EDITOR.draft.gradeId = section.gradeId || TEACHER_SCHEDULE_EDITOR.draft.gradeId || '';
      TEACHER_SCHEDULE_EDITOR.draft.area = section.area || lessonPlanAreaFromGroup(section) || TEACHER_SCHEDULE_EDITOR.draft.area || '';
      TEACHER_SCHEDULE_EDITOR.draft.subject = section.materia || '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  TEACHER_SCHEDULE_EDITOR.draft[field] = value;
  if (field === 'subject') {
    teacherScheduleClearDraftError('subject');
    if (TEACHER_SCHEDULE_EDITOR.draft.blockType === 'class') renderTeacherScheduleCellEditor();
  }
}
// Persiste la celda actualmente abierta después de validar horarios, solapes y dependencias académicas.
function saveTeacherScheduleCell() {
  // Valida y guarda un segmento puntual del horario, evitando solapes con el resto de la jornada.
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  if (!draft) return;
  const weekday = parseInt(draft.weekday, 10);
  const startTime = normalizeTeacherScheduleTimeValue(draft.startTime || '');
  const endTime = normalizeTeacherScheduleTimeValue(draft.endTime || '');
  const errors = teacherScheduleValidateDraft(
    { ...draft, weekday, startTime, endTime },
    { ignoreKey: TEACHER_SCHEDULE_EDITOR.originalKey || '' }
  );
  if (Object.keys(errors).length) {
    teacherScheduleSetDraftErrors(errors);
    renderTeacherScheduleCellEditor();
    teacherScheduleFocusFirstError();
    const overlapError = errors.startTime && String(errors.startTime).includes('se solapa');
    toast(overlapError ? 'Hay solapamientos en ese d?a. Ajusta el horario del segmento.' : 'Completa los datos requeridos para guardar este segmento.', true);
    return;
  }
  teacherScheduleSetDraftErrors({});
  const nextRow = sanitizeTeacherScheduleRow({
    ...draft,
    weekday,
    startTime,
    endTime,
  });
  if (nextRow.blockType !== 'class') {
    nextRow.gradeId = '';
    nextRow.educationLevel = '';
    nextRow.sectionId = '';
    nextRow.area = '';
  }
  const nextKey = teacherScheduleCellKey(nextRow.weekday || 0, nextRow.startTime, nextRow.endTime);
  const originalKey = String(TEACHER_SCHEDULE_EDITOR.originalKey || '');
  const rows = teacherScheduleRowsSorted().filter((row) => {
    const key = teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime);
    return key !== originalKey && key !== nextKey;
  });
  rows.push(nextRow);
  S.teacherPlanner.weeklySchedule = rows;
  persist();
  closeM('m-schedule-cell');
  go(currentPage);
  toast(TEACHER_SCHEDULE_EDITOR.mode === 'create' ? 'Segmento creado' : 'Segmento actualizado');
}
// Elimina la celda que se está editando usando la llave original guardada en el editor.
function clearTeacherScheduleCell() {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  if (!draft) return;
  if (TEACHER_SCHEDULE_EDITOR.mode === 'create') {
    closeM('m-schedule-cell');
    return;
  }
  const originalKey = String(TEACHER_SCHEDULE_EDITOR.originalKey || '');
  if (!originalKey) return;
  S.teacherPlanner.weeklySchedule = teacherScheduleRowsSorted().filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== originalKey);
  persist();
  closeM('m-schedule-cell');
  go(currentPage);
  toast('Segmento eliminado');
}
// Duplica la celda actual hacia otros días seleccionados para acelerar la construcción del horario semanal.
function duplicateTeacherScheduleCell() {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  if (!draft) return;
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-duplicate-day');
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a para duplicar la celda', true);
    return;
  }
  for (const weekday of targetDays) {
    const nextRow = sanitizeTeacherScheduleRow({ ...draft, id: uid(), weekday, startTime: draft.startTime, endTime: draft.endTime });
    const overlaps = teacherScheduleFindRowOverlaps(nextRow);
    if (overlaps.length) {
      toast(`No se pudo duplicar en ${plannerWeekdayName(weekday)} porque existe solapamiento horario.`, true);
      continue;
    }
    const nextKey = teacherScheduleCellKey(nextRow.weekday || 0, nextRow.startTime, nextRow.endTime);
    S.teacherPlanner.weeklySchedule = teacherScheduleRowsSorted().filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== nextKey);
    S.teacherPlanner.weeklySchedule.push(nextRow);
  }
  persist();
  closeM('m-schedule-cell');
  go(currentPage);
  toast(`Segmento duplicado a ${targetDays.length} d?a(s)`);
}
// Renderiza renderizar teacher programar cell editor.
function renderTeacherScheduleCellEditor() {
  // Pinta el formulario modal de edición de segmento con sus errores y opciones dependientes del contexto.
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  const body = document.getElementById('schedule-cell-body');
  const title = document.getElementById('schedule-cell-title');
  if (!draft || !body || !title) return;
  const grades = getSortedGrades();
  const areas = teacherScheduleAreaOptions(draft.gradeId || '');
  const sections = teacherScheduleSectionOptions(draft.gradeId || '', draft.area || '');
  const subjectOptions = teacherScheduleSubjectOptionsForDraft(draft);
  const errors = TEACHER_SCHEDULE_EDITOR.errors || {};
  const isClass = draft.blockType === 'class';
  title.textContent = `${TEACHER_SCHEDULE_EDITOR.mode === 'create' ? 'Nuevo segmento' : 'Editar segmento'} ? ${plannerWeekdayName(parseInt(draft.weekday, 10) || 0)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-meta">
        <span class="teacher-schedule-modal-chip">${plannerWeekdayName(parseInt(draft.weekday, 10) || 0)}</span>
        <span class="teacher-schedule-modal-chip">${teacherScheduleFormatTime(draft.startTime)} - ${teacherScheduleFormatTime(draft.endTime)}</span>
      </div>
      <div class="fr">
        <div class="fg teacher-schedule-form-field ${errors.weekday ? 'has-error' : ''}">
          <label class="lbl">D?a</label>
          <select class="sel" data-schedule-field="weekday" onchange="setTeacherScheduleCellDraft('weekday', this.value)">
            ${teacherScheduleActiveWeekdays().map((weekday) => `<option value="${weekday}" ${parseInt(draft.weekday, 10) === weekday ? 'selected' : ''}>${plannerWeekdayName(weekday)}</option>`).join('')}
          </select>
          ${errors.weekday ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.weekday)}</small>` : ''}
        </div>
        <div class="fg teacher-schedule-form-field ${errors.startTime ? 'has-error' : ''}">
          <label class="lbl">Hora de inicio</label>
          <input class="inp" data-schedule-field="startTime" type="time" value="${escapeHtml(draft.startTime || '')}" oninput="setTeacherScheduleCellDraft('startTime', this.value)">
          ${errors.startTime ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.startTime)}</small>` : ''}
        </div>
        <div class="fg teacher-schedule-form-field ${errors.endTime ? 'has-error' : ''}">
          <label class="lbl">Hora de fin</label>
          <input class="inp" data-schedule-field="endTime" type="time" value="${escapeHtml(draft.endTime || '')}" oninput="setTeacherScheduleCellDraft('endTime', this.value)">
          ${errors.endTime ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.endTime)}</small>` : ''}
        </div>
      </div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">Tipo de segmento</label>
          <select class="sel" onchange="setTeacherScheduleCellDraft('blockType', this.value)">
            ${TEACHER_SCHEDULE_BLOCK_TYPES.map((type) => `<option value="${type}" ${type === draft.blockType ? 'selected' : ''}>${teacherScheduleBlockTypeLabel(type)}</option>`).join('')}
          </select>
        </div>
        <div class="fg teacher-schedule-form-field ${errors.gradeId ? 'has-error' : ''}">
          <label class="lbl">Grado</label>
          <select class="sel" data-schedule-field="gradeId" onchange="setTeacherScheduleCellDraft('gradeId', this.value)" ${isClass ? '' : 'disabled'}>
            <option value="">Selecciona un grado</option>
            ${grades.map((grade) => `<option value="${grade.id}" ${grade.id === draft.gradeId ? 'selected' : ''}>${escapeHtml(grade.name)}</option>`).join('')}
          </select>
          ${errors.gradeId ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.gradeId)}</small>` : ''}
        </div>
        <div class="fg">
          <label class="lbl">Nivel</label>
          <input class="inp" type="text" value="${escapeHtml(normalizeEducationLevelName(((S.grades || []).find((grade) => grade.id === draft.gradeId)?.educationLevel || draft.educationLevel || '')) || (isClass ? 'Selecciona un grado' : 'No aplica'))}" readonly>
        </div>
      </div>
      <div class="fr ${isClass ? '' : 'teacher-schedule-fields-disabled'}">
        <div class="fg teacher-schedule-form-field ${errors.area ? 'has-error' : ''}">
          <label class="lbl">?rea</label>
          <select class="sel" data-schedule-field="area" onchange="setTeacherScheduleCellDraft('area', this.value)" ${isClass ? '' : 'disabled'}>
            <option value="">Selecciona un área</option>
            ${areas.map((area) => `<option value="${escapeHtml(area)}" ${area === draft.area ? 'selected' : ''}>${escapeHtml(area)}</option>`).join('')}
          </select>
          ${errors.area ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.area)}</small>` : ''}
        </div>
        <div class="fg teacher-schedule-form-field ${errors.subject ? 'has-error' : ''}">
          <label class="lbl">${isClass ? 'Asignatura' : 'Nombre del bloque'}</label>
          ${isClass ? `
            <select class="sel" data-schedule-field="subject" onchange="setTeacherScheduleCellDraft('subject', this.value)">
              <option value="">${String(draft.area || '').trim() ? 'Selecciona una asignatura' : 'Selecciona un área primero'}</option>
              ${subjectOptions.map((subject) => `<option value="${escapeHtml(subject.value)}" ${subject.value === draft.subject ? 'selected' : ''}>${escapeHtml(subject.label)}</option>`).join('')}
            </select>` : `
            <input class="inp" data-schedule-field="subject" type="text" value="${escapeHtml(draft.subject || '')}" placeholder="${teacherScheduleBlockLabel(draft.blockType)}" oninput="setTeacherScheduleCellDraft('subject', this.value)">`}
          ${errors.subject ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.subject)}</small>` : ''}
        </div>
      </div>
      <div class="fr ${isClass ? '' : 'teacher-schedule-fields-disabled'}">
        <div class="fg teacher-schedule-form-field ${errors.sectionId ? 'has-error' : ''}">
          <label class="lbl">Secci?n</label>
          <select class="sel" data-schedule-field="sectionId" onchange="setTeacherScheduleCellDraft('sectionId', this.value)" ${isClass ? '' : 'disabled'}>
            <option value="">Selecciona una sección</option>
            ${sections.map((section) => `<option value="${section.id}" ${section.id === draft.sectionId ? 'selected' : ''}>${escapeHtml(`${section.sec} ? ${section.materia || 'General'}`)}</option>`).join('')}
          </select>
          ${errors.sectionId ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.sectionId)}</small>` : ''}
        </div>
      </div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">Aula</label>
          <input class="inp" type="text" value="${escapeHtml(draft.room || '')}" placeholder="Opcional" oninput="setTeacherScheduleCellDraft('room', this.value)">
        </div>
        <div class="fg">
          <label class="lbl">Observaci?n</label>
          <input class="inp" type="text" value="${escapeHtml(draft.notes || '')}" placeholder="Opcional" oninput="setTeacherScheduleCellDraft('notes', this.value)">
        </div>
      </div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">Duplicar este segmento a otros d?as</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-duplicate-day', [], TEACHER_SCHEDULE_EDITOR.weekday)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-cell')">Cerrar</button>
        <button class="btn btn-outline" type="button" onclick="clearTeacherScheduleCell()">${TEACHER_SCHEDULE_EDITOR.mode === 'create' ? 'Cancelar' : 'Eliminar segmento'}</button>
        <button class="btn btn-outline" type="button" onclick="duplicateTeacherScheduleCell()">Duplicar</button>
        <button class="btn btn-primary" type="button" onclick="saveTeacherScheduleCell()">Guardar</button>
      </div>
    </div>`;
}
// Abre abrir teacher programar row copy modal.
function openTeacherScheduleRowCopyModal(startTime, endTime) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const sourceRow = teacherScheduleRowsForActiveDays().find((row) => row.startTime === startTime && row.endTime === endTime && activeWeekdays.includes(row.weekday));
  TEACHER_SCHEDULE_ROW_COPY.startTime = startTime;
  TEACHER_SCHEDULE_ROW_COPY.endTime = endTime;
  TEACHER_SCHEDULE_ROW_COPY.sourceWeekday = sourceRow?.weekday ?? activeWeekdays[0] ?? 0;
  renderTeacherScheduleRowCopyModal();
  openM('m-schedule-row-copy');
}
// Actualiza set teacher programar row copy source weekday.
function setTeacherScheduleRowCopySourceWeekday(value) {
  TEACHER_SCHEDULE_ROW_COPY.sourceWeekday = parseInt(value, 10) || 0;
  renderTeacherScheduleRowCopyModal();
}
// Renderiza renderizar teacher programar row copy modal.
function renderTeacherScheduleRowCopyModal() {
  const body = document.getElementById('schedule-row-copy-body');
  const title = document.getElementById('schedule-row-copy-title');
  if (!body || !title) return;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const sourceWeekdays = Array.from(new Set(
    teacherScheduleRowsForActiveDays()
      .filter((row) => row.startTime === TEACHER_SCHEDULE_ROW_COPY.startTime && row.endTime === TEACHER_SCHEDULE_ROW_COPY.endTime)
      .map((row) => parseInt(row.weekday, 10))
      .filter((weekday) => activeWeekdays.includes(weekday))
  ));
  const availableSourceDays = sourceWeekdays.length ? sourceWeekdays : activeWeekdays;
  if (!availableSourceDays.includes(TEACHER_SCHEDULE_ROW_COPY.sourceWeekday)) {
    TEACHER_SCHEDULE_ROW_COPY.sourceWeekday = availableSourceDays[0] ?? 0;
  }
  title.textContent = `Copiar a otros d?as ? ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_COPY.startTime)} - ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_COPY.endTime)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-help">Esta acci?n copia la configuraci?n de esta misma franja horaria desde el d?a origen hacia los d?as destino que selecci\u00f3nes.</div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">D?a origen</label>
          <select class="sel" onchange="setTeacherScheduleRowCopySourceWeekday(this.value)">
            ${availableSourceDays.map((weekday) => `<option value="${weekday}" ${weekday === TEACHER_SCHEDULE_ROW_COPY.sourceWeekday ? 'selected' : ''}>${plannerWeekdayName(weekday)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">D?as destino</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-row-copy-day', [], TEACHER_SCHEDULE_ROW_COPY.sourceWeekday)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-row-copy')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="copyTeacherScheduleRowToDays()">Copiar a otros d?as</button>
      </div>
    </div>`;
}
// Gestiona copy teacher programar row to days.
function copyTeacherScheduleRowToDays() {
  const sourceWeekday = Number.isInteger(TEACHER_SCHEDULE_ROW_COPY.sourceWeekday) ? TEACHER_SCHEDULE_ROW_COPY.sourceWeekday : 0;
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-row-copy-day').filter((weekday) => weekday !== sourceWeekday);
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a destino', true);
    return;
  }
  const sourceRow = teacherScheduleGetRow(sourceWeekday, TEACHER_SCHEDULE_ROW_COPY.startTime, TEACHER_SCHEDULE_ROW_COPY.endTime);
  if (!sourceRow) {
    toast('No se encontr? un bloque origen en ese d?a y hora', true);
    return;
  }
  targetDays.forEach((weekday) => {
    teacherScheduleUpsertRow({ ...sourceRow, id: uid(), weekday });
  });
  persist();
  closeM('m-schedule-row-copy');
  go(currentPage);
  toast(`Segmento copiado a ${targetDays.length} d?a(s)`);
}
// Abre abrir teacher programar row adjust modal.
function openTeacherScheduleRowAdjustModal(startTime, endTime) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  TEACHER_SCHEDULE_ROW_ADJUST.startTime = startTime;
  TEACHER_SCHEDULE_ROW_ADJUST.endTime = endTime;
  renderTeacherScheduleRowAdjustModal();
  openM('m-schedule-row-adjust');
}
// Renderiza renderizar teacher programar row adjust modal.
function renderTeacherScheduleRowAdjustModal() {
  const body = document.getElementById('schedule-row-adjust-body');
  const title = document.getElementById('schedule-row-adjust-title');
  if (!body || !title) return;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  title.textContent = `Ajustar franja horaria ? ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_ADJUST.startTime)} - ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_ADJUST.endTime)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-help">Usa este ajuste para absorber minutos sobrantes en bloques como receso, almuerzo, eventos o planificaci?n, sin regenerar todo el horario.</div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">Hora de inicio</label>
          <input class="inp" id="schedule-row-adjust-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_ROW_ADJUST.startTime)}">
        </div>
        <div class="fg">
          <label class="lbl">Hora de fin</label>
          <input class="inp" id="schedule-row-adjust-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_ROW_ADJUST.endTime)}">
        </div>
      </div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">Aplicar ajuste en estos d?as</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-row-adjust-day', activeWeekdays)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-row-adjust')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="applyTeacherScheduleRowAdjust()">Guardar ajuste</button>
      </div>
    </div>`;
}
// Aplica aplicar teacher programar row adjust.
function applyTeacherScheduleRowAdjust() {
  const nextStart = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-row-adjust-start')?.value || '');
  const nextEnd = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-row-adjust-end')?.value || '');
  const startMinutes = teacherScheduleTimeToMinutes(nextStart);
  const endMinutes = teacherScheduleTimeToMinutes(nextEnd);
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    toast('Define una franja v?lida con hora de inicio menor que hora de fin', true);
    return;
  }
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-row-adjust-day');
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a para aplicar el ajuste', true);
    return;
  }
  const hasSlotChange = nextStart !== TEACHER_SCHEDULE_ROW_ADJUST.startTime || nextEnd !== TEACHER_SCHEDULE_ROW_ADJUST.endTime;
  if (hasSlotChange) {
    const collisions = targetDays.filter((weekday) => !!teacherScheduleGetRow(weekday, nextStart, nextEnd));
    if (collisions.length && !confirm(`Ya existe una franja ${teacherScheduleFormatTime(nextStart)} - ${teacherScheduleFormatTime(nextEnd)} en ${collisions.length} d?a(s). ?Deseas reemplazarla con este ajuste?`)) {
      return;
    }
  }
  let updated = 0;
  targetDays.forEach((weekday) => {
    if (teacherScheduleReplaceRowSlot(weekday, TEACHER_SCHEDULE_ROW_ADJUST.startTime, TEACHER_SCHEDULE_ROW_ADJUST.endTime, nextStart, nextEnd)) updated += 1;
  });
  if (!updated) {
    toast('No se encontraron bloques para ajustar en los d?as selecci\u00f3nados', true);
    return;
  }
  persist();
  closeM('m-schedule-row-adjust');
  go(currentPage);
  toast(`Franja ajustada en ${updated} d?a(s)`);
}
// Elimina eliminar teacher programar segment.
function deleteTeacherScheduleSegment(weekday, startTime, endTime) {
  const key = teacherScheduleCellKey(parseInt(weekday, 10) || 0, normalizeTeacherScheduleTimeValue(startTime || ''), normalizeTeacherScheduleTimeValue(endTime || ''));
  if (!key || !confirm('?Eliminar este segmento del horario?')) return;
  const rows = teacherScheduleRowsSorted();
  const nextRows = rows.filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== key);
  if (nextRows.length === rows.length) return;
  S.teacherPlanner.weeklySchedule = nextRows;
  persist();
  go(currentPage);
  toast('Segmento eliminado');
}
// Abre abrir teacher programar day duplicate modal.
function openTeacherScheduleDayDuplicateModal(sourceWeekday) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const body = document.getElementById('schedule-row-copy-body');
  const title = document.getElementById('schedule-row-copy-title');
  if (!body || !title) return;
  const source = parseInt(sourceWeekday, 10);
  const activeDays = teacherScheduleActiveWeekdays();
  if (!activeDays.includes(source)) return;
  title.textContent = `Duplicar d?a completo ? ${plannerWeekdayName(source)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-help">Se copiar?n todos los segmentos de ${plannerWeekdayName(source)} a los d?as destino que selecci\u00f3nes.</div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">D?as destino</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-day-copy-day', [], source)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-row-copy')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="copyTeacherScheduleDayToDays(${source})">Duplicar d?a</button>
      </div>
    </div>`;
  openM('m-schedule-row-copy');
}
// Gestiona copy teacher programar day to days.
function copyTeacherScheduleDayToDays(sourceWeekday) {
  const source = parseInt(sourceWeekday, 10);
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-day-copy-day').filter((weekday) => weekday !== source);
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a destino', true);
    return;
  }
  const sourceRows = teacherScheduleRowsForWeekday(source);
  if (!sourceRows.length) {
    toast('Ese d?a no tiene segmentos para duplicar', true);
    return;
  }
  let nextRows = teacherScheduleRowsSorted();
  targetDays.forEach((weekday) => {
    nextRows = nextRows.filter((row) => parseInt(row.weekday, 10) !== weekday);
    sourceRows.forEach((row) => {
      nextRows.push(sanitizeTeacherScheduleRow({ ...row, id: uid(), weekday }));
    });
  });
  S.teacherPlanner.weeklySchedule = nextRows;
  persist();
  closeM('m-schedule-row-copy');
  go(currentPage);
  toast(`? D?a duplicado en ${targetDays.length} destino(s)`);
}
// Asegura asegurar teacher programar vista estado.
function ensureTeacherScheduleViewState() {
  ensureTeacherPlannerState();
  if (!S.teacherPlanner.ui || typeof S.teacherPlanner.ui !== 'object') {
    S.teacherPlanner.ui = {};
  }
  const activeDays = teacherScheduleActiveWeekdays();
  const fallbackDay = activeDays[0] ?? 0;
  const selectedWeekday = parseInt(S.teacherPlanner.ui.selectedWeekday, 10);
  S.teacherPlanner.ui.selectedWeekday = activeDays.includes(selectedWeekday) ? selectedWeekday : fallbackDay;
  S.teacherPlanner.ui.shiftFilter = ['all', 'morning', 'afternoon'].includes(S.teacherPlanner.ui.shiftFilter) ? S.teacherPlanner.ui.shiftFilter : 'all';
  if (S.teacherPlanner.journeyType !== 'double') S.teacherPlanner.ui.shiftFilter = 'all';
  S.teacherPlanner.ui.showMatrix = !!S.teacherPlanner.ui.showMatrix;
  S.teacherPlanner.ui.showLegend = S.teacherPlanner.ui.showLegend !== false;
  S.teacherPlanner.ui.showAdvanced = !!S.teacherPlanner.ui.showAdvanced;
  S.teacherPlanner.ui.showSystemMenu = !!S.teacherPlanner.ui.showSystemMenu;
}
// Gestiona teacher programar get vista estado.
function teacherScheduleGetViewState() {
  ensureTeacherScheduleViewState();
  return S.teacherPlanner.ui;
}
// Actualiza set teacher programar seleccionado day.
function setTeacherScheduleSelectedDay(weekday) {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  const next = parseInt(weekday, 10);
  if (!TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(next)) return;
  S.teacherPlanner.ui.selectedWeekday = next;
  persist();
  go(currentPage);
}
// Actualiza set teacher programar shift filtro.
function setTeacherScheduleShiftFilter(filter) {
  ensureTeacherScheduleViewState();
  if (S.teacherPlanner.journeyType !== 'double') return;
  S.teacherPlanner.ui.showSystemMenu = false;
  const next = ['all', 'morning', 'afternoon'].includes(filter) ? filter : 'all';
  if (S.teacherPlanner.ui.shiftFilter === next) return;
  S.teacherPlanner.ui.shiftFilter = next;
  persist();
  go(currentPage);
}
// Actualiza set teacher programar journey type.
function setTeacherScheduleJourneyType(type) {
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const next = sanitizeTeacherScheduleJourneyType(type);
  if (S.teacherPlanner.journeyType === next) return;
  const hasRows = teacherScheduleRowsSorted().length > 0;
  teacherScheduleApplyJourneyPreset(next, { includeWizard: true, includeWeekdays: !hasRows });
  persist();
  go(currentPage);
  const meta = teacherScheduleJourneyMeta(next);
  toast(`? Jornada aplicada: ${meta.label}`);
}
// Alterna alternar teacher programar matrix.
function toggleTeacherScheduleMatrix() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  S.teacherPlanner.ui.showMatrix = !S.teacherPlanner.ui.showMatrix;
  persist();
  go(currentPage);
}
// Alterna alternar teacher programar legend.
function toggleTeacherScheduleLegend() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  S.teacherPlanner.ui.showLegend = !S.teacherPlanner.ui.showLegend;
  persist();
  go(currentPage);
}
// Alterna alternar teacher programar advanced panel.
function toggleTeacherScheduleAdvancedPanel() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  S.teacherPlanner.ui.showAdvanced = !S.teacherPlanner.ui.showAdvanced;
  persist();
  go(currentPage);
}
// Alterna alternar teacher programar system menu.
function toggleTeacherScheduleSystemMenu() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = !S.teacherPlanner.ui.showSystemMenu;
  go(currentPage);
}
// Cierra cerrar teacher programar system menu.
function closeTeacherScheduleSystemMenu(options = {}) {
  ensureTeacherScheduleViewState();
  if (!S.teacherPlanner.ui.showSystemMenu) return;
  S.teacherPlanner.ui.showSystemMenu = false;
  if (options.rerender !== false) go(currentPage);
}
// Gestiona teacher programar system menu action.
function teacherScheduleSystemMenuAction(action) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  if (action === 'matrix') {
    toggleTeacherScheduleMatrix();
    return;
  }
  if (action === 'pdf') {
    go(currentPage);
    teacherScheduleDownloadPdf();
    return;
  }
  if (action === 'word') {
    go(currentPage);
    teacherScheduleDownloadWord();
    return;
  }
  if (action === 'clear') {
    go(currentPage);
    clearTeacherScheduleBoard();
  }
}
// Gestiona teacher programar shift for row.
function teacherScheduleShiftForRow(row) {
  const start = teacherScheduleTimeToMinutes(row?.startTime || '');
  if (start === null) return 'morning';
  return start < (12 * 60) ? 'morning' : 'afternoon';
}
// Gestiona teacher programar uses split shifts.
function teacherScheduleUsesSplitShifts() {
  ensureTeacherPlannerState();
  return S.teacherPlanner.journeyType === 'double';
}
// Gestiona teacher programar journey heading.
function teacherScheduleJourneyHeading() {
  ensureTeacherPlannerState();
  const type = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || 'extended');
  if (type === 'morning') return 'Tanda matutina';
  if (type === 'afternoon') return 'Tanda vespertina';
  if (type === 'double') return 'Doble tanda';
  if (type === 'custom') return 'Jornada personalizada';
  return 'Jornada extendida';
}
// Renderiza renderizar teacher programar journey selector.
function renderTeacherScheduleJourneySelector() {
  ensureTeacherPlannerState();
  const current = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || 'extended');
  return `<div class="teacher-schedule-journey-selector">
    <div class="teacher-schedule-journey-label">Tipo de jornada</div>
    <div class="teacher-schedule-journey-chips">${teacherScheduleJourneyOptions().map((option) => `
      <button class="teacher-schedule-journey-chip ${current === option.id ? 'is-active' : ''}" type="button" onclick="setTeacherScheduleJourneyType('${option.id}')">
        <strong>${escapeHtml(option.label)}</strong>
        <small>${escapeHtml(option.copy)}</small>
      </button>
    `).join('')}</div>
  </div>`;
}
// Renderiza renderizar teacher programar day tabs.
function renderTeacherScheduleDayTabs() {
  const activeDays = teacherScheduleActiveWeekdays();
  const view = teacherScheduleGetViewState();
  return `<div class="teacher-schedule-day-tabs">${activeDays.map((weekday) => `
    <button class="teacher-schedule-day-tab ${view.selectedWeekday === weekday ? 'is-active' : ''}" type="button" onclick="setTeacherScheduleSelectedDay(${weekday})">${plannerWeekdayName(weekday)}</button>
  `).join('')}</div>`;
}
// Renderiza renderizar teacher programar shift filters.
function renderTeacherScheduleShiftFilters() {
  if (!teacherScheduleUsesSplitShifts()) return '';
  const view = teacherScheduleGetViewState();
  const options = [
    { id: 'all', label: 'Todas las tandas' },
    { id: 'morning', label: 'Matutina' },
    { id: 'afternoon', label: 'Vespertina' },
  ];
  return `<div class="teacher-schedule-shift-filter">${options.map((option) => `
    <button class="teacher-schedule-shift-chip ${view.shiftFilter === option.id ? 'is-active' : ''}" type="button" onclick="setTeacherScheduleShiftFilter('${option.id}')">${option.label}</button>
  `).join('')}</div>`;
}
// Renderiza renderizar teacher programar segment lista by shift.
function renderTeacherScheduleSegmentListByShift(weekday, shift) {
  const shiftLabel = shift === 'morning' ? 'Tanda matutina' : 'Tanda vespertina';
  const rows = teacherScheduleRowsForWeekday(weekday).filter((row) => teacherScheduleShiftForRow(row) === shift);
  return `
    <section class="teacher-schedule-shift-section">
      <div class="teacher-schedule-shift-head">
        <div class="teacher-schedule-shift-title">${shiftLabel}</div>
      </div>
      ${rows.length ? `<div class="teacher-schedule-segment-list">${rows.map((row) => {
        const summary = teacherScheduleCellSummary(row);
        return `<div class="teacher-schedule-segment-item teacher-schedule-timeline-item ${teacherScheduleBlockTone(row.blockType)}">
          <div class="teacher-schedule-segment-time teacher-schedule-timeline-time">${escapeHtml(teacherScheduleFormatTime(row.startTime))} - ${escapeHtml(teacherScheduleFormatTime(row.endTime))}</div>
          <div class="teacher-schedule-segment-body teacher-schedule-timeline-content">
            <div class="teacher-schedule-segment-title">${escapeHtml(summary.title)}</div>
            <div class="teacher-schedule-segment-meta">${escapeHtml(summary.kindLabel)}${summary.sectionLabel ? ` ? ${escapeHtml(summary.sectionLabel)}` : ''}</div>
          </div>
          <div class="teacher-schedule-segment-actions">
            <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleCellEditor(${weekday},'${row.startTime}','${row.endTime}')">Editar</button>
            <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleRowCopyModal('${row.startTime}','${row.endTime}')">Copiar</button>
            <button class="btn btn-danger btn-sm" type="button" onclick="deleteTeacherScheduleSegment(${weekday},'${row.startTime}','${row.endTime}')">Eliminar</button>
          </div>
        </div>`;
      }).join('')}</div>` : `<div class="teacher-schedule-shift-empty"><div class="et">Sin bloques en esta tanda</div></div>`}
    </section>`;
}
// Renderiza renderizar teacher programar segment cards.
function renderTeacherScheduleSegmentCards() {
  const view = teacherScheduleGetViewState();
  const weekday = view.selectedWeekday;
  const dayRows = teacherScheduleRowsForWeekday(weekday);
  const splitByShift = teacherScheduleUsesSplitShifts();
  const selectedShift = splitByShift ? (view.shiftFilter || 'all') : 'all';
  const blocks = splitByShift
    ? (selectedShift === 'all' ? ['morning', 'afternoon'] : [selectedShift])
    : ['all'];
  if (!dayRows.length) {
    return `
      <div class="teacher-schedule-empty-onboarding">
        <div class="teacher-schedule-empty-onboarding-title">A?n no tienes horario. Vamos a crearlo en menos de 2 minutos.</div>
        <div class="teacher-schedule-empty-onboarding-copy">Usa el bot?n principal de arriba para crearlo paso a paso, o agrega un bloque manual si prefieres.</div>
        <div class="teacher-schedule-empty-onboarding-actions">
          <button class="btn btn-outline" type="button" onclick="openTeacherScheduleSegmentEditor(${weekday})">+ Agregar bloque manual</button>
        </div>
      </div>`;
  }
  return `
    <div class="teacher-schedule-day-single">
      <div class="teacher-schedule-day-card-head">
        <div>
          <div class="teacher-schedule-day-title">${plannerWeekdayName(weekday)}</div>
          <div class="teacher-schedule-day-copy">${dayRows.length ? `${dayRows.length} segmento(s) ? ${teacherScheduleJourneyHeading()}` : 'Sin segmentos todav?a'}</div>
        </div>
      </div>
      ${splitByShift
        ? blocks.map((shift) => renderTeacherScheduleSegmentListByShift(weekday, shift)).join('')
        : `<section class="teacher-schedule-shift-section">
            <div class="teacher-schedule-shift-head">
              <div class="teacher-schedule-shift-title">${teacherScheduleJourneyHeading()}</div>
            </div>
            <div class="teacher-schedule-segment-list">${dayRows.map((row) => {
              const summary = teacherScheduleCellSummary(row);
              return `<div class="teacher-schedule-segment-item teacher-schedule-timeline-item ${teacherScheduleBlockTone(row.blockType)}">
                <div class="teacher-schedule-segment-time teacher-schedule-timeline-time">${escapeHtml(teacherScheduleFormatTime(row.startTime))} - ${escapeHtml(teacherScheduleFormatTime(row.endTime))}</div>
                <div class="teacher-schedule-segment-body teacher-schedule-timeline-content">
                  <div class="teacher-schedule-segment-title">${escapeHtml(summary.title)}</div>
                  <div class="teacher-schedule-segment-meta">${escapeHtml(summary.kindLabel)}${summary.sectionLabel ? ` ? ${escapeHtml(summary.sectionLabel)}` : ''}</div>
                </div>
                <div class="teacher-schedule-segment-actions">
                  <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleCellEditor(${weekday},'${row.startTime}','${row.endTime}')">Editar</button>
                  <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleRowCopyModal('${row.startTime}','${row.endTime}')">Copiar</button>
                  <button class="btn btn-danger btn-sm" type="button" onclick="deleteTeacherScheduleSegment(${weekday},'${row.startTime}','${row.endTime}')">Eliminar</button>
                </div>
              </div>`;
            }).join('')}</div>
          </section>`}
    </div>`;
}
// Renderiza renderizar teacher programar global empty estado.
function renderTeacherScheduleGlobalEmptyState() {
  return `
    <div class="teacher-schedule-empty-onboarding teacher-schedule-empty-onboarding-global">
      <div class="teacher-schedule-empty-onboarding-title">A?n no tienes horario. Vamos a crearlo en minutos.</div>
      <div class="teacher-schedule-empty-onboarding-copy">Empieza con el asistente guiado o crea tu primer bloque manualmente.</div>
      <div class="teacher-schedule-empty-onboarding-actions">
        <button class="btn btn-primary teacher-schedule-btn-primary" type="button" onclick="openTeacherScheduleWizardModal()">Crear horario paso a paso</button>
        <button class="btn btn-outline" type="button" onclick="openTeacherScheduleSegmentEditor()">Agregar bloque manual</button>
        <button class="btn btn-outline" type="button" onclick="openTeacherScheduleBaseModal()">Plantilla r?pida</button>
      </div>
    </div>`;
}
// Gestiona teacher programar construir matrix markup.
function teacherScheduleBuildMatrixMarkup(options = {}) {
  const interactive = options.interactive !== false;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const rows = teacherScheduleRowsForActiveDays();
  const slots = teacherScheduleSlotList(rows);
  const cellMap = teacherScheduleCellMap(rows);
  if (!slots.length) {
    return `<div class="empty planner-empty"><div class="et">Todav?a no hay segmentos</div><div class="es">Agrega segmentos manualmente o usa una plantilla base editable para empezar m?s r?pido.</div>${interactive ? '<button class="btn btn-primary" type="button" onclick="openTeacherScheduleSegmentEditor()">Agregar segmento</button>' : ''}</div>`;
  }
  return `<div class="${interactive ? 'table-wrap teacher-schedule-grid-wrap' : 'teacher-schedule-export-wrap'}">
    <table class="${interactive ? 'table teacher-schedule-grid' : 'teacher-schedule-export-table'}">
      <thead>
        <tr>
          <th>Hora</th>
          ${activeWeekdays.map((weekday) => `<th>${plannerWeekdayName(weekday)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${slots.map((slot) => {
          const cells = activeWeekdays.map((weekday) => {
            const row = cellMap.get(teacherScheduleCellKey(weekday, slot.startTime, slot.endTime)) || sanitizeTeacherScheduleRow({
              weekday,
              startTime: slot.startTime,
              endTime: slot.endTime,
              blockType: 'planning',
              subject: teacherScheduleDefaultSubjectForBlockType('planning'),
            });
            const summary = teacherScheduleCellSummary(row);
            if (!interactive) {
              return `<td class="teacher-schedule-export-cell ${teacherScheduleBlockTone(row.blockType)}"><div class="teacher-schedule-export-title">${escapeHtml(summary.title)}</div>${summary.sectionLabel ? `<div class="teacher-schedule-export-meta">${escapeHtml(summary.sectionLabel)}</div>` : ''}${summary.roomLabel ? `<div class="teacher-schedule-export-meta">${escapeHtml(summary.roomLabel)}</div>` : ''}</td>`;
            }
            return `<td><button class="teacher-schedule-cell ${teacherScheduleBlockTone(row.blockType)}" type="button" onclick="openTeacherScheduleCellEditor(${weekday},'${slot.startTime}','${slot.endTime}')"><div class="teacher-schedule-cell-kind ${teacherScheduleBlockTone(row.blockType)}">${escapeHtml(summary.kindLabel)}</div><div class="teacher-schedule-cell-title">${escapeHtml(summary.title)}</div>${summary.sectionLabel ? `<div class="teacher-schedule-cell-line">${escapeHtml(summary.sectionLabel)}</div>` : ''}${summary.roomLabel ? `<div class="teacher-schedule-cell-line">${escapeHtml(summary.roomLabel)}</div>` : ''}${summary.notes ? `<div class="teacher-schedule-cell-line is-notes">${escapeHtml(summary.notes)}</div>` : ''}</button></td>`;
          }).join('');
          return `<tr><th class="${interactive ? 'teacher-schedule-time-head' : 'teacher-schedule-export-time'}" scope="row"><span>${escapeHtml(teacherScheduleFormatTime(slot.startTime))}</span><small>${escapeHtml(teacherScheduleFormatTime(slot.endTime))}</small>${interactive ? `<div class="teacher-schedule-row-actions"><button class="btn btn-outline btn-sm teacher-schedule-row-copy-btn" type="button" onclick="openTeacherScheduleRowCopyModal('${slot.startTime}','${slot.endTime}')">Copiar a otros d?as</button><button class="btn btn-outline btn-sm teacher-schedule-row-copy-btn" type="button" onclick="openTeacherScheduleRowAdjustModal('${slot.startTime}','${slot.endTime}')">Ajustar franja</button></div>` : ''}</th>${cells}</tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}
// Gestiona teacher programar exportación base name.
function teacherScheduleExportBaseName() {
  const teacherName = String(S.profile?.name || S.sessionUserName || 'docente').trim();
  return `horario-docente-${normTxt(teacherName).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'docente'}`;
}
// Gestiona teacher programar construir exportación HTML.
function teacherScheduleBuildExportHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Horario semanal del docente</title><style>@page{size:landscape;margin:12mm;} body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#17304a;margin:0;} .teacher-schedule-export-page{display:grid;gap:14px;} .teacher-schedule-export-head{display:flex;justify-content:space-between;gap:14px;align-items:end;} .teacher-schedule-export-title{font-size:22px;font-weight:800;} .teacher-schedule-export-copy{font-size:12px;color:#5f7590;margin-top:4px;} .teacher-schedule-export-teacher{font-size:12px;font-weight:700;color:#315575;} .teacher-schedule-export-table{width:100%;border-collapse:collapse;table-layout:fixed;} .teacher-schedule-export-table th,.teacher-schedule-export-table td{border:1px solid #9fb0c4;padding:8px;vertical-align:top;} .teacher-schedule-export-table thead th{background:#e7f0fb;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;} .teacher-schedule-export-time{width:112px;min-width:112px;background:#edf4fc;text-align:center;} .teacher-schedule-export-time span,.teacher-schedule-export-time small{display:block;} .teacher-schedule-export-time span{font-size:13px;font-weight:900;} .teacher-schedule-export-time small{font-size:11px;color:#6d829b;margin-top:4px;} .teacher-schedule-export-cell{min-height:76px;} .teacher-schedule-export-title{font-size:13px;font-weight:800;} .teacher-schedule-export-meta{font-size:11px;color:#4b6784;margin-top:4px;} .teacher-schedule-export-cell.is-class{background:#eef6ff;} .teacher-schedule-export-cell.is-planning{background:#eef7ee;} .teacher-schedule-export-cell.is-break{background:#fff6e0;} .teacher-schedule-export-cell.is-lunch{background:#fff0e7;} .teacher-schedule-export-cell.is-event{background:#f3eeff;}</style></head><body><div class="teacher-schedule-export-page"><div class="teacher-schedule-export-head"><div><div class="teacher-schedule-export-title">Horario semanal del docente</div><div class="teacher-schedule-export-copy">Vista profesional organizada por bloques y d?as activos.</div></div><div class="teacher-schedule-export-teacher">${escapeHtml(String(S.profile?.name || S.sessionUserName || 'Docente'))}</div></div>${teacherScheduleBuildMatrixMarkup({ interactive: false })}</div></body></html>`;
}
// Gestiona teacher programar descarga word.
function teacherScheduleDownloadWord() {
  const blob = new Blob(['\ufeff', teacherScheduleBuildExportHtml()], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${teacherScheduleExportBaseName()}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
// Gestiona teacher programar descarga pdf.
function teacherScheduleDownloadPdf() {
  const blob = new Blob([teacherScheduleBuildExportHtml()], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) {
    toast('El navegador bloque? la vista de impresi?n del horario', true);
    return;
  }
  setTimeout(() => { try { w.focus(); w.print(); } catch (_) {} }, 400);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
// Gestiona clear teacher programar board.
async function clearTeacherScheduleBoard() {
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  if (!teacherScheduleRowsSorted().length) {
    toast('Todav?a no hay horario configurado para limpiar');
    return;
  }
  if (!confirm('Se eliminar? todo el horario semanal actual. ?Deseas continuar?')) return;
  S.teacherPlanner.weeklySchedule = [];
  persist({ immediate: true });
  debugSessionFlow('delete:teacher-schedule', {
    uid: S.sessionUserId || null,
    rowsAfter: Array.isArray(S.teacherPlanner?.weeklySchedule) ? S.teacherPlanner.weeklySchedule.length : null,
  });
  go(currentPage);
  toast('Horario semanal limpiado');
}
// Renderiza renderizar planner calendario grid.
function renderPlannerCalendarGrid(monthKey) {
  const allEvents = getPlannerEvents();
  const eventsByDate = allEvents.reduce((map, event) => {
    if (!map[event.date]) map[event.date] = [];
    map[event.date].push(event);
    return map;
  }, {});
  const cells = getPlannerMonthMatrix(monthKey);
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  return `
    <div class="planner-calendar-grid">
      ${['Lun', 'Mar', 'Mi?', 'Jue', 'Vie', 'S?b', 'Dom'].map((name) => `<div class="planner-calendar-weekday">${name}</div>`).join('')}
      ${cells.map((cell) => {
        if (!cell) return '<div class="planner-calendar-cell is-empty"></div>';
        const events = eventsByDate[cell.dateKey] || [];
        return `
          <div class="planner-calendar-cell ${cell.dateKey === todayKey ? 'is-today' : ''}">
            <div class="planner-calendar-day">${cell.day}</div>
            <div class="planner-calendar-events">
              ${events.slice(0, 3).map((event) => `<div class="planner-calendar-chip ${plannerEventTone(event.type)}" title="${escapeHtml(`${event.title} ? ${event.source}`)}">${escapeHtml(event.title)}</div>`).join('')}
              ${events.length > 3 ? `<div class="planner-calendar-more">+${events.length - 3} m?s</div>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}
// Renderiza renderizar planner upcoming lista.
function renderPlannerUpcomingList(monthKey) {
  const events = getPlannerEvents().filter((event) => String(event.date || '').startsWith(`${normalizeAttendanceMonthKey(monthKey).slice(0, 7)}`));
  if (!events.length) {
    return `<div class="empty planner-empty"><div class="et">Sin eventos este mes</div><div class="es">Puedes agregar recordatorios propios del centro o del docente.</div></div>`;
  }
  return `<div class="planner-event-list">${events.map((event) => `
    <div class="planner-event-card ${plannerEventTone(event.type)}">
      <div class="planner-event-date">${escapeHtml(fmtDate(event.date))}</div>
      <div class="planner-event-body">
        <div class="planner-event-title">${escapeHtml(event.title)}</div>
        <div class="planner-event-meta">${plannerEventTypeLabel(event.type)} ? ${escapeHtml(event.source || '')}</div>
      </div>
      ${event.source === 'Personal' ? `<button class="btn btn-danger btn-sm" type="button" onclick="removeTeacherPlannerEvent('${event.id}')">Eliminar</button>` : ''}
    </div>`).join('')}</div>`;
}
// Renderiza renderizar teacher programar legend.
function renderTeacherScheduleLegend() {
  const items = [
    { type: 'class', label: 'Clase' },
    { type: 'planning', label: 'Hora pedag?gica' },
    { type: 'break', label: 'Recreo / receso' },
    { type: 'lunch', label: 'Almuerzo' },
    { type: 'event', label: 'Evento institucional' },
  ];
  return `<div class="teacher-schedule-legend-inline">${items.map((item) => `
    <span class="teacher-schedule-legend-pill ${teacherScheduleBlockTone(item.type)}"><i></i>${escapeHtml(item.label)}</span>
  `).join('')}</div>`;
}
// Renderiza renderizar teacher programar board.
function renderTeacherScheduleBoard() {
  // Construye el tablero visual del horario con acciones rápidas, lista de segmentos y matriz semanal opcional.
  const view = teacherScheduleGetViewState();
  const hasAnyBlocks = teacherScheduleRowsSorted().length > 0;
  if (!hasAnyBlocks) {
    return `
      <div class="planner-schedule-top">
        <div>
          <div class="planner-matrix-title">Horario docente</div>
          <div class="planner-schedule-note">Organiza tu semana laboral.</div>
          ${renderTeacherScheduleJourneySelector()}
        </div>
      </div>
      <div class="planner-matrix-shell">
        ${renderTeacherScheduleGlobalEmptyState()}
      </div>`;
  }
  return `
    <div class="planner-schedule-top">
      <div>
        <div class="planner-matrix-title">Horario docente</div>
        <div class="planner-schedule-note">Organiza tu semana laboral.</div>
        ${renderTeacherScheduleJourneySelector()}
      </div>
      <div class="planner-schedule-actions-stack">
        <div class="planner-schedule-actions planner-schedule-actions-primary teacher-schedule-primary-actions">
          <button class="btn btn-primary teacher-schedule-btn-primary" type="button" onclick="openTeacherScheduleWizardModal()">Crear horario paso a paso</button>
          <button class="btn btn-outline teacher-schedule-btn-secondary-main" type="button" onclick="openTeacherScheduleSegmentEditor(${view.selectedWeekday})">+ Agregar bloque</button>
        </div>
        <div class="planner-schedule-actions planner-schedule-actions-secondary teacher-schedule-secondary-buttons">
          <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleSegmentEditor(${view.selectedWeekday})">Agregar manual</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleBaseModal()">Plantilla r?pida</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleDayDuplicateModal(${view.selectedWeekday})">Duplicar d?a</button>
        </div>
      </div>
    </div>
    ${renderTeacherScheduleDayTabs()}
    ${view.showAdvanced && teacherScheduleUsesSplitShifts() ? renderTeacherScheduleShiftFilters() : ''}
    ${view.showAdvanced && view.showLegend ? renderTeacherScheduleLegend() : ''}
    <div class="teacher-schedule-secondary-actions teacher-schedule-utility-row">
      <button class="btn btn-outline btn-sm" type="button" onclick="toggleTeacherScheduleAdvancedPanel()">${view.showAdvanced ? '= Ocultar opciones avanzadas' : '= Opciones avanzadas'}</button>
      ${view.showAdvanced ? `<button class="btn btn-outline btn-sm" type="button" onclick="toggleTeacherScheduleLegend()">${view.showLegend ? 'Ocultar tipos' : 'Ver tipos'}</button>` : ''}
      <div class="teacher-schedule-system-menu-wrap">
        <button class="btn btn-outline btn-sm" type="button" onclick="toggleTeacherScheduleSystemMenu()">M?s opciones</button>
        ${view.showSystemMenu ? `<div class="teacher-schedule-system-menu">
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('matrix')">${view.showMatrix ? 'Ocultar vista semanal' : 'Ver vista semanal'}</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('pdf')"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Exportar PDF</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('word')"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Exportar Word</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('clear')">Limpiar horario</button>
        </div>` : ''}
      </div>
    </div>
    <div class="planner-matrix-shell">
      ${renderTeacherScheduleSegmentCards()}
      ${view.showMatrix ? `<div class="planner-matrix-copy" style="margin-top:14px;">Vista semanal de referencia.</div>${teacherScheduleBuildMatrixMarkup()}` : ''}
    </div>`;
}
// Renderiza renderizar teacher programar page.
function renderTeacherSchedulePage() {
  // Renderiza la página contenedora del horario docente con sus acciones, tabs y matriz auxiliar.
  return `
    <div class="planner-page teacher-schedule-page">
      <div class="card planner-schedule-card">
        <div class="planner-schedule-shell">
          ${renderTeacherScheduleBoard()}
        </div>
      </div>
    </div>`;
}

/* AUTOGENERADO: no editar directamente.
 * Fuente: js/modules/00-core-state-and-utils.js (bloque de autenticación extraído)
 */

// Actualiza set autenticación nota.
function setAuthNote(message = '', tone = 'info', options = {}) {
  const note = document.getElementById('auth-note');
  const noteTitle = document.getElementById('auth-note-title');
  const noteText = document.getElementById('auth-note-text');
  if (!note) return;
  const msg = String(message || '').trim();
  if (!msg) {
    note.hidden = true;
    if (noteTitle) noteTitle.textContent = '';
    if (noteText) noteText.textContent = '';
    note.className = 'auth-note';
    return;
  }
  const { title = '' } = options;
  note.hidden = false;
  if (noteTitle) noteTitle.textContent = title;
  if (noteText) noteText.textContent = msg;
  note.className = `auth-note ${tone}`;
}
let AUTH_CORNER_TOAST_TIMER = 0;
// Gestiona show autenticación corner toast.
function showAuthCornerToast(message = '', title = 'Aviso', tone = 'info') {
  const msg = String(message || '').trim();
  if (!msg) return;
  const safeTone = ['info', 'warn', 'error'].includes(String(tone || '').trim()) ? String(tone || '').trim() : 'info';
  let toastEl = document.getElementById('auth-corner-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'auth-corner-toast';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.innerHTML = `
      <div class="auth-corner-toast-dot" aria-hidden="true">
        <span class="material-symbols-outlined">info</span>
      </div>
      <div class="auth-corner-toast-body">
        <strong class="auth-corner-toast-title"></strong>
        <div class="auth-corner-toast-text"></div>
      </div>`;
    document.body.appendChild(toastEl);
  }
  toastEl.className = `auth-corner-toast tone-${safeTone}`;
  toastEl.dataset.tone = safeTone;
  const titleNode = toastEl.querySelector('.auth-corner-toast-title');
  const textNode = toastEl.querySelector('.auth-corner-toast-text');
  if (titleNode) titleNode.textContent = String(title || 'Aviso').trim();
  if (textNode) textNode.textContent = msg;
  toastEl.classList.remove('show');
  void toastEl.offsetWidth;
  toastEl.classList.add('show');
  if (AUTH_CORNER_TOAST_TIMER) window.clearTimeout(AUTH_CORNER_TOAST_TIMER);
  AUTH_CORNER_TOAST_TIMER = window.setTimeout(() => {
    toastEl.classList.remove('show');
  }, 5000);
}
// Normaliza normalizar autenticación access mode.
function normalizeAuthAccessMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  if (value === 'google') return 'google';
  if (value === 'facebook') return 'facebook';
  if (value === 'local') return 'local';
  if (value === 'email') return 'email';
  return '';
}
// Gestiona autenticación access mode label.
function authAccessModeLabel(mode) {
  const normalized = normalizeAuthAccessMode(mode);
  if (normalized === 'google') return 'Google';
  if (normalized === 'facebook') return 'Facebook';
  if (normalized === 'local') return 'Local (sincronización limitada)';
  if (normalized === 'email') return 'Email y contraseña';
  return 'No disponible';
}
// Gestiona remember actual autenticación access mode.
function rememberCurrentAuthAccessMode(mode) {
  const normalized = normalizeAuthAccessMode(mode);
  if (!normalized) return;
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  S.profile.authAccessMode = normalized;
}
// Gestiona reset register code flujo.
function resetRegisterCodeFlow(clearCode = true) {
  const code = document.getElementById('ar-code');
  const registerBtn = document.getElementById('auth-register-submit');
  if (code && clearCode) code.value = '';
  if (registerBtn) {
    registerBtn.innerHTML = 'Registrarse <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
  }
}
// Gestiona autenticación email key.
function authEmailKey(email) {
  return String(email || '').trim().toLowerCase();
}
// Gestiona format ms to min sec.
function formatMsToMinSec(ms = 0) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}
// Lee read register rate estado.
function readRegisterRateState() {
  try {
    const raw = window.localStorage.getItem(REGISTER_RATE_LIMIT.key);
    if (!raw) return { attempts: [], blockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      attempts: Array.isArray(parsed?.attempts) ? parsed.attempts.filter((value) => Number.isFinite(value)) : [],
      blockedUntil: Number(parsed?.blockedUntil) || 0,
    };
  } catch (_) {
    return { attempts: [], blockedUntil: 0 };
  }
}
// Persiste persistir register rate estado.
function persistRegisterRateState(state) {
  try {
    window.localStorage.setItem(REGISTER_RATE_LIMIT.key, JSON.stringify({
      attempts: Array.isArray(state?.attempts) ? state.attempts : [],
      blockedUntil: Number(state?.blockedUntil) || 0,
    }));
  } catch (_) {
    // ignore storage errors
  }
}
// Gestiona evaluate register rate limit.
function evaluateRegisterRateLimit() {
  const now = Date.now();
  const state = readRegisterRateState();
  const attempts = state.attempts.filter((ts) => now - ts <= REGISTER_RATE_LIMIT.windowMs);
  let blockedUntil = Number(state.blockedUntil) || 0;
  if (blockedUntil <= now) blockedUntil = 0;
  if (!blockedUntil && attempts.length >= REGISTER_RATE_LIMIT.maxAttempts) {
    blockedUntil = now + REGISTER_RATE_LIMIT.blockMs;
  }
  const remainingMs = blockedUntil > now ? blockedUntil - now : 0;
  const blocked = remainingMs > 0;
  persistRegisterRateState({ attempts, blockedUntil });
  return { blocked, remainingMs, attempts };
}
// Gestiona record register attempt.
function recordRegisterAttempt(success = false) {
  const now = Date.now();
  if (success) {
    persistRegisterRateState({ attempts: [], blockedUntil: 0 });
    return;
  }
  const state = readRegisterRateState();
  const attempts = state.attempts.filter((ts) => now - ts <= REGISTER_RATE_LIMIT.windowMs);
  attempts.push(now);
  persistRegisterRateState({ attempts, blockedUntil: Number(state.blockedUntil) || 0 });
}
// Obtiene get register strength meta.
function getRegisterStrengthMeta(password = '') {
  const pass = String(password || '');
  if (!pass) return { score: 0, label: '', percent: 0, tone: 'weak' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  const labels = ['Débil', 'Aceptable', 'Buena', 'Fuerte'];
  const tones = ['weak', 'fair', 'good', 'strong'];
  const idx = Math.max(0, Math.min(score - 1, 3));
  return {
    score,
    label: labels[idx] || 'Débil',
    percent: [25, 50, 75, 100][idx] || 0,
    tone: tones[idx] || 'weak',
  };
}
// Valida validar register password.
function validateRegisterPassword(password = '') {
  const pass = String(password || '');
  if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) return 'La contraseña debe incluir letras y números.';
  return '';
}
// Actualiza set register field error.
function setRegisterFieldError(fieldId, message = '') {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  const msg = String(message || '').trim();
  if (error) {
    error.textContent = msg;
    error.hidden = !msg;
  }
  if (input) {
    input.classList.toggle('is-invalid', !!msg);
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}
// Gestiona clear register field errors.
function clearRegisterFieldErrors() {
  ['ar-name', 'ar-email', 'ar-pass', 'ar-pass2'].forEach((id) => setRegisterFieldError(id, ''));
  const termsError = document.getElementById('ar-terms-error');
  if (termsError) {
    termsError.hidden = true;
    termsError.textContent = '';
  }
}
let REGISTER_PASSWORD_STRENGTH_VISIBLE = false;
// Actualiza actualizar register password strength interfaz.
function updateRegisterPasswordStrengthUI(password = '') {
  const wrap = document.getElementById('ar-pass-strength');
  const fill = document.getElementById('ar-pass-strength-fill');
  const label = document.getElementById('ar-pass-strength-label');
  if (!wrap || !fill || !label) return;
  const meta = getRegisterStrengthMeta(password);
  if (!REGISTER_PASSWORD_STRENGTH_VISIBLE || !password) {
    wrap.hidden = true;
    fill.style.width = '0%';
    fill.dataset.tone = '';
    label.textContent = 'Débil';
    return;
  }
  wrap.hidden = false;
  fill.style.width = `${meta.percent}%`;
  fill.dataset.tone = meta.tone;
  label.textContent = meta.label;
}
// Actualiza configuración inicial register field ux.
function setupRegisterFieldUX() {
  const passInput = document.getElementById('ar-pass');
  const pass2Input = document.getElementById('ar-pass2');
  const nameInput = document.getElementById('ar-name');
  const emailInput = document.getElementById('ar-email');
  const termsInput = document.getElementById('ar-terms-check');
  if (passInput && passInput.dataset.registerUxBound !== '1') {
    passInput.dataset.registerUxBound = '1';
    passInput.addEventListener('input', () => {
      REGISTER_PASSWORD_STRENGTH_VISIBLE = true;
      setRegisterFieldError('ar-pass', '');
      updateRegisterPasswordStrengthUI(passInput.value || '');
    });
  }
  if (pass2Input && pass2Input.dataset.registerUxBound !== '1') {
    pass2Input.dataset.registerUxBound = '1';
    pass2Input.addEventListener('input', () => setRegisterFieldError('ar-pass2', ''));
  }
  if (nameInput && nameInput.dataset.registerUxBound !== '1') {
    nameInput.dataset.registerUxBound = '1';
    nameInput.addEventListener('input', () => setRegisterFieldError('ar-name', ''));
  }
  if (emailInput && emailInput.dataset.registerUxBound !== '1') {
    emailInput.dataset.registerUxBound = '1';
    emailInput.addEventListener('input', () => setRegisterFieldError('ar-email', ''));
  }
  if (termsInput && termsInput.dataset.registerUxBound !== '1') {
    termsInput.dataset.registerUxBound = '1';
    termsInput.addEventListener('change', () => {
      const termsError = document.getElementById('ar-terms-error');
      if (termsError) {
        termsError.hidden = true;
        termsError.textContent = '';
      }
    });
  }
}
// Crea crear local password salt.
function createLocalPasswordSalt() {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('');
}
// Comprueba si tiene hash local password.
async function hashLocalPassword(password, salt) {
  const raw = `${salt}::${String(password || '')}`;
  if (window.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(raw)));
}
// Crea crear local password record.
async function createLocalPasswordRecord(password) {
  const salt = createLocalPasswordSalt();
  const hash = await hashLocalPassword(password, salt);
  return { salt, hash };
}
// Resuelve resolver local autenticación usuario.
async function resolveLocalAuthUser(email, password) {
  const user = S.authUsers.find((entry) => authEmailKey(entry.email) === email);
  if (!user) return { user: null, migrated: false };
  const plainPassword = String(password || '');
  if (user.passHash && user.passSalt) {
    const hashed = await hashLocalPassword(plainPassword, user.passSalt);
    return { user: hashed === user.passHash ? user : null, migrated: false };
  }
  const legacyPass = String(user.pass || '');
  if (!legacyPass || legacyPass !== plainPassword) return { user: null, migrated: false };
  const record = await createLocalPasswordRecord(plainPassword);
  user.passHash = record.hash;
  user.passSalt = record.salt;
  user.passAlgo = 'sha256-salted-v1';
  delete user.pass;
  return { user, migrated: true };
}
// Gestiona actual autenticación mode.
function currentAuthMode() {
  return document.querySelector('.auth-panel')?.dataset.mode === 'register' ? 'register' : 'login';
}
// Procesa procesar autenticación login tab.
function handleAuthLoginTab() {
  if (currentAuthMode() === 'register') {
    setAuthMode('login');
    return;
  }
  loginAuth();
}
// Procesa procesar autenticación register tab.
function handleAuthRegisterTab() {
  if (currentAuthMode() !== 'register') {
    setAuthMode('register');
    return;
  }
  registerAuth();
}
// Gestiona animate autenticación panel.
function animateAuthPanel(panel, direction) {
  if (!panel) return;
  if (S.preferences?.authLoginAnimation === false || S.preferences?.animations === false) {
    panel.classList.remove('is-entering-left', 'is-entering-right');
    return;
  }
  panel.classList.remove('is-entering-left', 'is-entering-right');
  void panel.offsetWidth;
  panel.classList.add(direction === 'left' ? 'is-entering-left' : 'is-entering-right');
}
// Gestiona animate autenticación chrome.
function animateAuthChrome(direction) {
  if (S.preferences?.authLoginAnimation === false || S.preferences?.animations === false) return;
  const headingNodes = document.querySelectorAll('#auth-title, #auth-subtitle');
  const headingClass = direction === 'left' ? 'is-fading-left' : 'is-fading-right';
  headingNodes.forEach((node) => {
    node.classList.remove('is-fading-left', 'is-fading-right');
    void node.offsetWidth;
    node.classList.add(headingClass);
  });
  const animatedNodes = document.querySelectorAll('.auth-social, .auth-switch-row');
  if (!animatedNodes.length) return;
  const className = direction === 'left' ? 'is-shifting-left' : 'is-shifting-right';
  animatedNodes.forEach((node) => {
    node.classList.remove('is-shifting-left', 'is-shifting-right');
    void node.offsetWidth;
    node.classList.add(className);
  });
}
// Gestiona transition autenticación panels.
function transitionAuthPanels(showLogin) {
  const loginBox = document.getElementById('auth-login-box');
  const registerBox = document.getElementById('auth-register-box');
  if (loginBox) loginBox.style.display = showLogin ? '' : 'none';
  if (registerBox) registerBox.style.display = showLogin ? 'none' : '';
  animateAuthPanel(showLogin ? loginBox : registerBox, showLogin ? 'left' : 'right');
  animateAuthChrome(showLogin ? 'left' : 'right');
}
// Actualiza set autenticación mode.
function setAuthMode(mode) {
  const login = mode !== 'register';
  const lb = document.getElementById('auth-login-box');
  const rb = document.getElementById('auth-register-box');
  const panel = document.querySelector('.auth-panel');
  const tt = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const loginSocial = document.querySelector('#m-auth .auth-panel > .auth-social');
  const socialDivider = document.getElementById('auth-social-divider');
  const switchCopy = document.getElementById('auth-switch-copy');
  const switchLink = document.getElementById('auth-switch-link');
  const registerSubmit = document.getElementById('auth-register-submit');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  transitionAuthPanels(login);
  if (panel) panel.dataset.mode = login ? 'login' : 'register';
  if (tt) tt.textContent = login ? 'Bienvenido de nuevo' : 'Crear cuenta';
  if (subtitle) subtitle.textContent = login
    ? 'Ingresa tus credenciales para continuar.'
    : 'Únete a la excelencia académica estructurada.';
  if (loginSocial) loginSocial.style.display = login ? '' : 'none';
  if (socialDivider) socialDivider.textContent = login ? 'o usa tu email' : 'o usa tu email';
  if (switchCopy) switchCopy.textContent = login ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?';
  if (switchLink) {
    switchLink.textContent = login ? 'Regístrate' : 'Inicia sesión';
    switchLink.onclick = login ? handleAuthRegisterTab : handleAuthLoginTab;
  }
  if (loginTab) {
    loginTab.classList.toggle('is-active', login);
    loginTab.setAttribute('aria-selected', login ? 'true' : 'false');
  }
  if (registerTab) {
    registerTab.classList.toggle('is-active', !login);
    registerTab.setAttribute('aria-selected', login ? 'false' : 'true');
  }
  if (login) resetRegisterCodeFlow();
  else {
    if (registerSubmit) {
      registerSubmit.innerHTML = 'Registrarse <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
    }
  }
  setAuthNote('');
  setupRegisterFieldUX();
  REGISTER_PASSWORD_STRENGTH_VISIBLE = false;
  if (login) {
    clearRegisterFieldErrors();
    updateRegisterPasswordStrengthUI('');
  } else {
    updateRegisterPasswordStrengthUI('');
  }
}
// Procesa procesar forgot password.
function handleForgotPassword() {
  openForgotPasswordModal();
}
// Actualiza set forgot password nota.
function setForgotPasswordNote(message = '', tone = 'info', title = '') {
  const note = document.getElementById('auth-forgot-note');
  const noteTitle = document.getElementById('auth-forgot-note-title');
  const noteText = document.getElementById('auth-forgot-note-text');
  if (!note || !noteTitle || !noteText) return;
  const msg = String(message || '').trim();
  if (!msg) {
    note.hidden = true;
    note.className = 'auth-note info';
    noteTitle.textContent = '';
    noteText.textContent = '';
    return;
  }
  note.hidden = false;
  note.className = `auth-note ${tone}`;
  noteTitle.textContent = title || '';
  noteText.textContent = msg;
}
// Abre abrir forgot password modal.
function openForgotPasswordModal() {
  const input = document.getElementById('auth-forgot-email');
  if (input) input.value = authEmailKey(v('al-email'));
  setForgotPasswordNote('');
  openM('m-auth-forgot');
  window.setTimeout(() => input?.focus(), 30);
}
// Cierra cerrar forgot password modal.
function closeForgotPasswordModal() {
  setForgotPasswordNote('');
  closeM('m-auth-forgot');
}
// Gestiona inspect cloud email account.
async function inspectCloudEmailAccount(email) {
  if (!canUseCloudAuth() || !window.EduGestCloud?.inspectEmailAccount) return null;
  try {
    const info = await window.EduGestCloud.inspectEmailAccount(email);
    debugAuthFlow('inspect-email', {
      email,
      methods: info?.methods || [],
      exists: !!info?.exists,
      hasPassword: !!info?.hasPassword,
      hasGoogle: !!info?.hasGoogle,
      hasFacebook: !!info?.hasFacebook,
    });
    return info;
  } catch (error) {
    debugAuthFlow('inspect-email-error', {
      email,
      errorCode: String(error?.code || ''),
      errorMessage: String(error?.message || ''),
    });
    return null;
  }
}
// Gestiona login error mensaje from inspector.
function loginErrorMessageFromInspector(accountInfo) {
  if (!accountInfo) return 'Correo o contraseña incorrectos. Usa "¿Olvidaste tu contraseña?" para recuperar el acceso.';
  if (accountInfo.hasGoogle && !accountInfo.hasPassword) {
    return 'Esta cuenta está asociada a Google. Debes iniciar sesión con Google.';
  }
  if (accountInfo.hasFacebook && !accountInfo.hasPassword) {
    return 'Esta cuenta está asociada a Facebook. Debes iniciar sesión con Facebook.';
  }
  return 'Correo o contraseña incorrectos. Usa "¿Olvidaste tu contraseña?" para recuperar el acceso.';
}
// Gestiona register error mensaje from inspector.
function registerErrorMessageFromInspector(accountInfo) {
  if (!accountInfo) {
    return 'No se pudo completar el registro. Inténtalo de nuevo.';
  }
  if (accountInfo.hasGoogle && !accountInfo.hasPassword) {
    return 'Este correo ya está asociado a Google. Inicia sesión con Google.';
  }
  if (accountInfo.hasFacebook && !accountInfo.hasPassword) {
    return 'Este correo ya está asociado a Facebook. Inicia sesión con Facebook.';
  }
  if (accountInfo.hasPassword) {
    return 'Este correo ya está registrado. Inicia sesión o restablece tu contraseña.';
  }
  return 'Este correo ya está registrado. Inicia sesión o usa recuperación de contraseña.';
}
// Orquesta la recuperacion de contraseña y normaliza los mensajes para no exponer de mas el estado de la cuenta.
async function submitForgotPassword() {
  const email = authEmailKey(v('auth-forgot-email'));
  if (!email) {
    setForgotPasswordNote('Escribe el correo de tu cuenta para continuar.', 'warn', 'Falta el correo');
    return;
  }
  if (!email.includes('@')) {
    setForgotPasswordNote('Revisa el correo e inténtalo otra vez.', 'warn', 'Correo inválido');
    return;
  }
  if (!canUseCloudAuth()) {
    setForgotPasswordNote('La recuperación automática solo está disponible cuando Firebase está configurado.', 'warn', 'No disponible en modo local');
    return;
  }
  try {
    await window.EduGestCloud.sendPasswordReset(email);
    setForgotPasswordNote(`Te enviamos un enlace de recuperación a ${email}. Revisa también la carpeta de spam.`, 'info', 'Correo enviado');
    toast('Enlace de recuperación enviado');
  } catch (error) {
    const code = String(error?.code || '').trim();
    if (code === 'auth/invalid-email') {
      const message = 'El correo no es válido. Revísalo e inténtalo de nuevo.';
      setForgotPasswordNote(message, 'warn', 'Correo inválido');
      toast(`${message}`, true);
      return;
    }
    if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
      const message = 'La recuperación de contraseña no está configurada todavía en Firebase Authentication.';
      setForgotPasswordNote(message, 'error', 'Configuración pendiente');
      toast(`${message}`, true);
      return;
    }
    // Mensaje neutro anti-enumeración: no bloquea al usuario aunque Firebase no revele estado de cuenta.
    const neutral = `Si ${email} está registrado, recibirás un enlace de recuperación en unos minutos.`;
    setForgotPasswordNote(neutral, 'info', 'Solicitud enviada');
    toast('Revisa tu correo para recuperar acceso');
  }
}
// Usa Firebase Auth directo como plan B cuando el bridge principal no esta disponible en esta build.
async function loginWithProviderFallback(providerName) {
  const config = window.EDUGEST_FIREBASE_CONFIG || null;
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const isConfigured = !!config && requiredKeys.every((key) => {
    const value = String(config[key] || '').trim();
    return value && !value.startsWith('REEMPLAZA_');
  });
  if (!isConfigured) {
    throw new Error('Firebase no esta configurado.');
  }

  const [appMod, authMod] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js'),
  ]);

  const app = appMod.getApps?.().length ? appMod.getApp() : appMod.initializeApp(config);
  const auth = authMod.getAuth(app);
  auth.languageCode = 'es';
  try {
    await authMod.setPersistence(auth, authMod.browserSessionPersistence);
  } catch (_) {
    await authMod.setPersistence(auth, authMod.inMemoryPersistence);
  }
  void authMod.getRedirectResult(auth).catch(() => null);

  const normalized = String(providerName || '').trim().toLowerCase();
  let provider = null;
  if (normalized === 'google') {
    provider = new authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
  } else if (normalized === 'facebook') {
    provider = new authMod.FacebookAuthProvider();
  } else {
    throw new Error(`Proveedor no soportado: ${providerName}`);
  }

  try {
    const cred = await authMod.signInWithPopup(auth, provider);
    const user = auth.currentUser || cred.user;
    return window.EduGestCloud?.normalizeUser ? window.EduGestCloud.normalizeUser(user, { isNewUser: !!cred?.additionalUserInfo?.isNewUser }) : {
      id: user?.uid || '',
      uid: user?.uid || '',
      email: user?.email || '',
      name: user?.displayName || '',
      emailVerified: !!user?.emailVerified,
      isNewUser: !!cred?.additionalUserInfo?.isNewUser,
    };
  } catch (error) {
    const code = String(error?.code || '').trim();
    const shouldRedirect = new Set([
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/operation-not-supported-in-this-environment',
    ]).has(code);
    if (!shouldRedirect) throw error;
    await authMod.signInWithRedirect(auth, provider);
    return { redirected: true, provider: normalized };
  }
}
// Alterna alternar password visibility.
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  if (button) {
    const label = showing ? 'Mostrar contraseña' : 'Ocultar contraseña';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.classList.toggle('is-visible', !showing);
    // Reinicia la microanimacion para que se vea en cada clic.
    button.classList.remove('is-reacting');
    void button.offsetWidth;
    button.classList.add('is-reacting');
    const icon = button.querySelector('img');
    if (icon) {
      icon.src = showing
        ? '/assets/icons/vercontrasena.png'
        : '/assets/icons/ocultarcontrasena.png';
    }
  }
}
// Asegura asegurar individual license model.
function ensureIndividualLicenseModel() {
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  const current = S.profile.accountLicense && typeof S.profile.accountLicense === 'object'
    ? S.profile.accountLicense
    : {};
  S.profile.accountLicense = {
    ...current,
    type: 'individual_teacher',
    shareAllowed: false,
    maxTrustedDevices: ACCOUNT_MAX_TRUSTED_DEVICES,
    maxActiveSessions: ACCOUNT_MAX_ACTIVE_SESSIONS,
    policyVersion: LICENSE_MODEL_VERSION,
    updatedAt: nowIso(),
  };
}
// Actualiza set device verification nota.
function setDeviceVerificationNote(message = '', tone = 'info', title = '') {
  void message;
  void tone;
  void title;
}
// Abre abrir device verification modal.
function openDeviceVerificationModal(copy = '') {
  void copy;
}
// Gestiona clear device verification flujo.
function clearDeviceVerificationFlow() {
  DEVICE_VERIFICATION_FLOW.pendingUser = null;
  DEVICE_VERIFICATION_FLOW.pendingAfterLogin = false;
  DEVICE_VERIFICATION_FLOW.pendingMaskedEmail = '';
  DEVICE_VERIFICATION_FLOW.pendingSource = 'login';
}
// Comprueba si tiene has pending device verification.
function hasPendingDeviceVerification() {
  return !!DEVICE_VERIFICATION_FLOW.pendingUser;
}
// Comprueba si is device verification service unavailable.
function isDeviceVerificationServiceUnavailable(error) {
  const code = String(error?.code || '').trim();
  const message = String(error?.message || '').toLowerCase();
  if (code === 'functions/internal' || code === 'functions/unavailable') return true;
  if (message === 'internal') return true;
  return message.includes('resend')
    || message.includes('servicio de envio de codigos')
    || message.includes('device verification service unavailable');
}
// Gestiona continue sesión after security verification.
async function continueSessionAfterSecurityVerification() {
  clearDeviceVerificationFlow();
}
// Gestiona enforce trusted sesión.
async function enforceTrustedSession(user, options = {}) {
  void user;
  void options;
  return { ok: true, requiresVerification: false };
}
// Gestiona confirm pending device verification.
async function confirmPendingDeviceVerification() {
  clearDeviceVerificationFlow();
}
// Gestiona resend pending device verification code.
async function resendPendingDeviceVerificationCode() {
  clearDeviceVerificationFlow();
}
// Gestiona cancel pending device verification.
async function cancelPendingDeviceVerification() {
  clearDeviceVerificationFlow();
  await logoutAuth();
}
// Cierra el flujo de autenticacion, persiste la sesion y redirige al setup o al dashboard segun el estado del perfil.
function finishAuthSession(user, options = {}) {
  const { openSetup = false, isNewAccount = false } = options;
  applySessionUser(user);
  // Sync the authenticated user's email into S.profile so the settings panel can display it.
  if (user?.email) {
    if (!S.profile || typeof S.profile !== 'object') S.profile = {};
    if (!S.profile.email) S.profile.email = user.email;
  }
  ensureIndividualLicenseModel();
  debugAuthFlow('session:finish', {
    uid: user?.id || null,
    email: user?.email || '',
    openSetup: !!openSetup,
    isNewAccount: !!isNewAccount,
    hasProfile: !!(S.profile && typeof S.profile === 'object'),
  });
  persist();
  closeProfileMenu();
  if (requiresTermsAcceptance()) {
    TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept = !!openSetup;
    TERMS_ACCEPTANCE_FLOW.revokeOnDecline = !!isNewAccount;
    openM('m-auth');
    setAuthMode('login');
    forceCloseM('m-education-section');
    forceCloseM('m-setup');
    openM('m-terms');
    return;
  }
  if (openSetup) {
    closeM('m-auth');
    if (requiresProfileSetupCompletion()) {
      openM('m-setup', { fromAuth: true });
    } else if (requiresEducationSectionSelection()) {
      openEducationSectionSetup({ fromAuth: true });
    } else {
      go('dashboard');
      updateSBUser();
    }
  } else {
    TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept = false;
    TERMS_ACCEPTANCE_FLOW.revokeOnDecline = false;
    closeM('m-auth');
    closeM('m-education-section');
    closeM('m-setup');
    go('dashboard');
    updateSBUser();
  }
}
// Decide si, tras autenticarse, la cuenta debe completar perfil o seccion educativa antes de entrar al panel.
function shouldOpenSetupAfterAuth() {
  const profile = S.profile && typeof S.profile === 'object' ? S.profile : {};
  // Relaxed: if the profile is complete (Name, Role, Inst), we don't force the setup modal.
  // We only force it if the core profile is missing or if they TRULY have no education section and we need one.
  return !isProfileSetupComplete(profile);
}
// Ejecuta el registro completo: valida campos, crea cuenta en Firebase o local y abre el onboarding requerido.
async function registerAuth() {
  const name = v('ar-name');
  const email = authEmailKey(v('ar-email'));
  const pass = (document.getElementById('ar-pass')?.value || '').trim();
  const pass2 = (document.getElementById('ar-pass2')?.value || '').trim();
  const termsChecked = !!document.getElementById('ar-terms-check')?.checked;
  clearRegisterFieldErrors();
  setupRegisterFieldUX();
  updateRegisterPasswordStrengthUI(pass);
  const limit = evaluateRegisterRateLimit();
  if (limit.blocked) {
    const wait = formatMsToMinSec(limit.remainingMs);
    setAuthNote(`Demasiados intentos de registro. Inténtalo de nuevo en ${wait}.`, 'warn', {
      title: 'Registro temporalmente pausado',
    });
    toast(`Registro temporalmente bloqueado (${wait})`, true);
    return;
  }
  if (!name || !email || !pass || !pass2) {
    if (!name) setRegisterFieldError('ar-name', 'Escribe tu nombre completo.');
    if (!email) setRegisterFieldError('ar-email', 'Escribe un correo válido.');
    if (!pass) setRegisterFieldError('ar-pass', 'Crea una contraseña segura.');
    if (!pass2) setRegisterFieldError('ar-pass2', 'Confirma tu contraseña.');
    showAuthCornerToast('Completa todos los campos para continuar.', 'Faltan datos', 'error');
    return;
  }
  if (!email.includes('@')) {
    setRegisterFieldError('ar-email', 'Revisa el formato del correo.');
    showAuthCornerToast('Revisa el formato del correo e inténtalo otra vez.', 'Correo inválido', 'error');
    return;
  }
  const passwordError = validateRegisterPassword(pass);
  if (passwordError) {
    setRegisterFieldError('ar-pass', passwordError);
    showAuthCornerToast(passwordError, 'Contraseña insegura', 'error');
    return;
  }
  if (pass !== pass2) {
    setRegisterFieldError('ar-pass2', 'Las contraseñas no coinciden.');
    showAuthCornerToast('Las contraseñas no coinciden.', 'Error en la confirmación', 'error');
    return;
  }
  if (!termsChecked) {
    const termsError = document.getElementById('ar-terms-error');
    if (termsError) {
      termsError.hidden = false;
      termsError.textContent = 'Debes aceptar los términos y la política de privacidad.';
    }
    showAuthCornerToast('Acepta los términos para continuar.', 'Términos pendientes', 'error');
    return;
  }
  const acceptedAt = nowIso();
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  S.profile.termsAccepted = true;
  S.profile.termsVersion = TERMS_VERSION;
  S.profile.termsAcceptedAt = acceptedAt;
  S.profile.privacyAcceptedAt = acceptedAt;
  if (canUseCloudAuth()) {
    try {
      debugAuthFlow('register:attempt', { email });
      const user = await window.EduGestCloud.register(email, pass, name);
      const gate = await enforceTrustedSession(user, { source: 'register', pendingAfterLogin: true });
      if (!gate.ok) {
        setAuthNote(
          gate.maskedEmail
            ? `Te enviamos un codigo de seguridad a ${gate.maskedEmail}. Verifica este dispositivo para continuar.`
            : 'Verifica este dispositivo con el codigo enviado a tu correo para continuar.',
          'warn',
          { title: 'Verificacion de dispositivo requerida' }
        );
        return;
      }
      if (gate.degradedSecurity) {
        debugAuthFlow('security:degraded-login', { source: 'login' });
      }
      rememberCurrentAuthAccessMode('email');
      replaceState();
      if (!gate.degradedSecurity) setAuthNote('');
      ensureIndividualLicenseModel();
      finishAuthSession(user, { openSetup: true, isNewAccount: true });
      toast('Cuenta creada');
      hydrateCloudStateForUser(user).catch((error) => {
        console.error('[EduGest][cloud] No se pudo hidratar el estado tras el registro', error);
      });
    } catch (error) {
      debugAuthFlow('register:error', {
        email,
        errorCode: String(error?.code || ''),
        errorMessage: String(error?.message || ''),
      });
      const code = String(error?.code || '').trim();
      if (code === 'auth/email-already-in-use') {
        const accountInfo = await inspectCloudEmailAccount(email);
        const message = registerErrorMessageFromInspector(accountInfo);
        recordRegisterAttempt(false);
        setRegisterFieldError('ar-email', 'Este correo ya está registrado.');
        setAuthNote('');
        showAuthCornerToast(message, 'Correo ya registrado', 'error');
        return;
      }
      if (!shouldFallbackToLocalAuth(error)) {
        recordRegisterAttempt(false);
        toast(`${window.EduGestCloud.friendlyError(error)}`, true);
        setAuthNote(window.EduGestCloud.friendlyError(error), 'error', {
          title: 'No se pudo crear la cuenta',
        });
        return;
      }
      if (S.authUsers.some(u => authEmailKey(u.email) === email)) {
        recordRegisterAttempt(false);
        setRegisterFieldError('ar-email', 'Este correo ya está registrado.');
        setAuthNote('');
        showAuthCornerToast('Ese correo ya está registrado en este dispositivo.', 'Correo ya registrado', 'error');
        return;
      }
      const passwordRecord = await createLocalPasswordRecord(pass);
      const user = {
        id: uid(),
        name,
        email,
        passHash: passwordRecord.hash,
        passSalt: passwordRecord.salt,
        passAlgo: 'sha256-salted-v1',
        createdAt: nowIso(),
        authMode: 'local',
        termsAccepted: true,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: acceptedAt,
        privacyAcceptedAt: acceptedAt,
      };
      S.authUsers.push(user);
      persistLocalAuthUsers();
      await hydrateLocalWorkspaceForUser(user);
      rememberCurrentAuthAccessMode('local');
      finishAuthSession(user, { openSetup: true, isNewAccount: true });
      recordRegisterAttempt(true);
      toast('Firebase no respondió. Entraste en modo local.', 'warning');
      return;
    }
    recordRegisterAttempt(true);
    return;
  }

  if (S.authUsers.some(u => authEmailKey(u.email) === email)) {
    recordRegisterAttempt(false);
    setRegisterFieldError('ar-email', 'Este correo ya está registrado.');
    setAuthNote('');
    showAuthCornerToast('Este correo ya está registrado. Inicia sesión o usa recuperación de contraseña.', 'Correo ya registrado', 'error');
    return;
  }
  const passwordRecord = await createLocalPasswordRecord(pass);
  const user = {
    id: uid(),
    name,
    email,
    passHash: passwordRecord.hash,
    passSalt: passwordRecord.salt,
    passAlgo: 'sha256-salted-v1',
    createdAt: nowIso(),
    authMode: 'local',
    termsAccepted: true,
    termsVersion: TERMS_VERSION,
    termsAcceptedAt: acceptedAt,
    privacyAcceptedAt: acceptedAt,
  };
  S.authUsers.push(user);
  persistLocalAuthUsers();
  await hydrateLocalWorkspaceForUser(user);
  rememberCurrentAuthAccessMode('local');
  finishAuthSession(user, { openSetup: true, isNewAccount: true });
  recordRegisterAttempt(true);
  toast('Cuenta creada');
}
// Intenta iniciar sesion por correo/clave y resuelve caidas a modo local cuando el proveedor remoto falla.
async function loginAuth() {
  const email = authEmailKey(v('al-email'));
  const pass = (document.getElementById('al-pass')?.value || '').trim();
  if (!email || !pass) {
    showAuthCornerToast('Completa correo y contraseña para entrar.', 'Faltan datos', 'error');
    return;
  }
  debugAuthFlow('login:attempt', { email });
  const localAuth = await resolveLocalAuthUser(email, pass);
  const localUser = localAuth.user;
  if (localAuth.migrated) persistLocalAuthUsers();

  if (canUseCloudAuth()) {
    let user = null;
    try {
      user = await window.EduGestCloud.login(email, pass);
    } catch (error) {
      debugAuthFlow('login:error', {
        email,
        errorCode: String(error?.code || ''),
        errorMessage: String(error?.message || ''),
      });
      if (localUser) {
        await hydrateLocalWorkspaceForUser(localUser);
        rememberCurrentAuthAccessMode('local');
        finishAuthSession(localUser, { openSetup: shouldOpenSetupAfterAuth() });
        toast('Entraste en modo local con esta cuenta guardada.', 'warning');
        return;
      }
      if (!shouldFallbackToLocalAuth(error)) {
        const code = String(error?.code || '').trim();
        let message = window.EduGestCloud.friendlyError(error);
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          const accountInfo = await inspectCloudEmailAccount(email);
          message = loginErrorMessageFromInspector(accountInfo);
        }
        toast(`${message}`, true);
        setAuthNote(message, 'error', {
          title: 'No se pudo iniciar sesión',
        });
        return;
      }
      if (!localUser) {
        toast('Firebase no respondió y no existe una cuenta local con esos datos.', true);
        return;
      }
      await hydrateLocalWorkspaceForUser(localUser);
      rememberCurrentAuthAccessMode('local');
      finishAuthSession(localUser, { openSetup: shouldOpenSetupAfterAuth() });
      toast('Entraste en modo local porque Firebase no respondió.', 'warning');
      return;
    }
    let gate = null;
    try {
      gate = await enforceTrustedSession(user, { source: 'login', pendingAfterLogin: true });
      if (!gate.ok) {
        setAuthNote(
          gate.maskedEmail
            ? `Te enviamos un codigo de seguridad a ${gate.maskedEmail}. Verifica este dispositivo para continuar.`
            : 'Verifica este dispositivo con el codigo enviado a tu correo para continuar.',
          'warn',
          { title: 'Verificacion de dispositivo requerida' }
        );
        return;
      }
      if (gate.degradedSecurity) {
        debugAuthFlow('security:degraded-register', { source: 'register' });
      }
    } catch (error) {
      const message = window.EduGestCloud.friendlyError(error);
      setAuthNote(message, 'error', {
        title: 'No se pudo validar la seguridad de la sesion',
      });
      toast(`${message}`, true);
      try {
        await window.EduGestCloud.logout();
      } catch (_) {}
      return;
    }
    await hydrateCloudStateForUser(user);
    rememberCurrentAuthAccessMode('email');
    ensureIndividualLicenseModel();
    finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth() });
    if (!gate?.degradedSecurity) setAuthNote('');
    toast('Bienvenido');
    return;
  }

  const user = localUser;
  if (!user) { toast('Credenciales incorrectas', true); return; }
  await hydrateLocalWorkspaceForUser(user);
  rememberCurrentAuthAccessMode('local');
  finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth() });
  toast('Bienvenido');
}
// Maneja el acceso social con Google/Facebook, incluyendo redirect fallback y validaciones post-login.
async function authWithProvider(provider) {
  const providerLabel = provider === 'facebook' ? 'Facebook' : 'Google';
  try {
    toast(`Abriendo acceso con ${providerLabel}...`);
    const cloud = window.EduGestCloud;
    const user = cloud?.loginWithProvider
      ? await cloud.loginWithProvider(provider)
      : await loginWithProviderFallback(provider);
    if (user?.redirected) {
      setAuthNote(`Te redirigimos a ${providerLabel} para continuar con el acceso.`, 'info', {
        title: 'Redirección iniciada',
      });
      return;
    }
    const gate = await enforceTrustedSession(user, { source: `provider:${provider}`, pendingAfterLogin: true });
    if (!gate.ok) {
      setAuthNote(
        gate.maskedEmail
          ? `Te enviamos un codigo de seguridad a ${gate.maskedEmail}. Verifica este dispositivo para continuar.`
          : 'Verifica este dispositivo con el codigo enviado a tu correo para continuar.',
        'warn',
        { title: 'Verificacion de dispositivo requerida' }
      );
      return;
    }
    if (gate.degradedSecurity) {
      debugAuthFlow('security:degraded-provider', { source: `provider:${provider}` });
    }
    await hydrateCloudStateForUser(user);
    rememberCurrentAuthAccessMode(provider === 'facebook' ? 'facebook' : 'google');
    ensureIndividualLicenseModel();
    finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth(), isNewAccount: !!user?.isNewUser });
    if (!gate?.degradedSecurity) setAuthNote('');
    toast(`Acceso con ${providerLabel} completado`);
  } catch (error) {
    const code = String(error?.code || '').trim();
    const providerConfigError = code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found';
    const message = providerConfigError
      ? `El acceso con ${providerLabel} no está configurado en Firebase Authentication.`
      : (window.EduGestCloud?.friendlyError?.(error) || 'No se pudo iniciar sesión.');
    toast(`${message}`, true);
    setAuthNote(message, 'error', {
      title: `No se pudo iniciar sesión con ${providerLabel}`,
    });
  }
}

Object.assign(window, {
  loginAuth,
  registerAuth,
  authWithProvider,
  handleForgotPassword,
  logoutAuth,
  saveGrade,
});

