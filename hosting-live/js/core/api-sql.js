/**
 * Integración con la API SQL/RDS (Backend de Persistencia).
 * --------------------------------------------------------------------------
 * Este módulo gestiona la comunicación con el servidor central para la 
 * sincronización de perfiles, asistencia, calificaciones y catálogos escolares.
 */

import { S } from './state.js';
import { readBrowserSession } from './hydration.js';
import { mapActivityToSqlPayload } from './api-mappings.js';
import { normTxt } from './utils.js';

/** URL base por defecto del servidor SQL */
const DEFAULT_BASE_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:4000';

/** Caché interna para evitar solicitudes duplicadas de contexto académico */
const SQL_ACADEMIC_CONTEXT_CACHE = { key: '', data: null };
const SQL_STATE_BLOCK_KEYS = ['assessment', 'planner'];
const SQL_STATE_SYNC_RUNTIME = SQL_STATE_BLOCK_KEYS.reduce((acc, blockKey) => {
  acc[blockKey] = { timer: null, inFlight: false, pending: false };
  return acc;
}, {});

/**
 * Obtiene la URL base de la API SQL, priorizando la configuración en LocalStorage y luego el entorno.
 * @returns {string}
 */
export function getBaseUrl() {
  const runtime = String(window.localStorage?.getItem('aulabase:sql-api-base-url') || '').trim();
  if (runtime) return runtime.replace(/\/+$/, '');
  return DEFAULT_BASE_URL.replace(/\/+$/, '');
}

/**
 * Verifica si la integración con SQL está habilitada (basado en la existencia de la URL).
 * @returns {boolean}
 */
export function isEnabled() {
  return !!getBaseUrl();
}

/**
 * Realiza una solicitud HTTP a la API SQL.
 * @param {string} path - Ruta del endpoint.
 * @param {Object} [options={}] - Opciones de fetch (method, body, headers).
 * @returns {Promise<Object|null>} Respuesta de la API.
 */
export async function request(path, options = {}) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    const message = String(payload?.message || `SQL API error (${response.status})`).trim();
    throw new Error(message);
  }

  return payload;
}

/**
 * Carga el catálogo de escuelas registradas en el sistema central.
 * @returns {Promise<Array>}
 */
export async function loadSchoolCatalog() {
  const payload = await request('/api/bootstrap/catalog');
  return Array.isArray(payload?.schools) ? payload.schools : [];
}

/**
 * Sincroniza los metadatos del perfil local con el servidor SQL.
 * @param {Object} payload - Datos del perfil.
 * @returns {Promise<Object>}
 */
export async function syncProfile(payload) {
  return request('/api/bootstrap/profile', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Carga la lista de grados asociados al perfil.
 */
export async function loadGrades(params = {}) {
  return request(`/api/grades${buildQuery(params)}`);
}

/**
 * Carga la lista de secciones (cursos) asociadas al perfil.
 */
export async function loadSections(params = {}) {
  return request(`/api/sections${buildQuery(params)}`);
}

/**
 * Carga la lista de estudiantes.
 */
export async function loadStudents(params = {}) {
  return request(`/api/students${buildQuery(params)}`);
}

/**
 * Carga los registros de asistencia históricos.
 */
export async function loadAttendance(params = {}) {
  return request(`/api/attendance${buildQuery(params)}`);
}

/**
 * Carga la lista de actividades evaluativas.
 */
export async function loadActivities(params = {}) {
  return request(`/api/activities${buildQuery(params)}`);
}

/**
 * Carga los resultados de evaluaciones para estudiantes y actividades.
 */
export async function loadEvaluations(params = {}) {
  return request(`/api/evaluations${buildQuery(params)}`);
}

/**
 * Reemplaza o crea masivamente los registros de asistencia para un mes específico.
 */
export async function replaceAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina todos los registros de asistencia de un mes/sección.
 */
export async function clearAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea un nuevo grado en el servidor SQL.
 */
export async function createGrade(payload = {}) {
  return request('/api/grades', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de un grado existente.
 */
export async function updateGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea una nueva sección (curso) en el servidor SQL.
 */
export async function createSection(payload = {}) {
  return request('/api/sections', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de una sección existente.
 */
export async function updateSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea un nuevo estudiante en el servidor SQL.
 */
export async function createStudent(payload = {}) {
  return request('/api/students', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de un estudiante existente.
 */
export async function updateStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina un grado de la base de datos SQL.
 */
export async function deleteGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina una sección de la base de datos SQL.
 */
export async function deleteSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina un estudiante de la base de datos SQL.
 */
export async function deleteStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea una nueva actividad evaluativa en el servidor SQL.
 */
export async function createActivity(payload = {}) {
  return request('/api/activities', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de una actividad existente.
 */
export async function updateActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina una actividad de la base de datos SQL.
 */
export async function deleteActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea o actualiza masivamente un conjunto de evaluaciones (calificaciones).
 */
export async function upsertEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina registros de evaluaciones específicos.
 */
export async function deleteEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Carga una captura completa de los datos académicos para sincronización fuera de línea.
 */
export async function loadAcademicSnapshot(params = {}) {
  const [grades, sections, students, activities, evaluations, attendance] = await Promise.all([
    loadGrades(params),
    loadSections(params),
    loadStudents(params),
    loadActivities(params),
    loadEvaluations(params),
    loadAttendance(params),
  ]);
  return { grades, sections, students, activities, evaluations, attendance };
}

function cloneJson(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return fallback;
  }
}

function normalizeMonthKey(monthKey) {
  return String(monthKey || '').trim().slice(0, 7);
}

function createAttendanceMonthRecord() {
  return {
    slotDays: Array.from({ length: 96 }, () => ''),
    slotMeta: Array.from({ length: 96 }, () => ({ type: '', reason: '' })),
    studentCodes: {},
    retiredCarryOverrides: {},
    retiredPolicy: 'until-retirement',
    scheduleLinked: false,
    visibleCount: 1,
    __normalized: true,
  };
}

function buildSqlAttendanceSnapshot(rows = []) {
  const sectionMonthMap = new Map();
  (rows || []).forEach((row) => {
    const sectionId = String(row?.section_id || '').trim();
    const studentId = String(row?.student_id || '').trim();
    const date = String(row?.attendance_date || '').slice(0, 10);
    if (!sectionId || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const monthKey = date.slice(0, 7);
    const key = `${sectionId}::${monthKey}`;
    if (!sectionMonthMap.has(key)) {
      sectionMonthMap.set(key, {
        sectionId,
        monthKey,
        days: new Set(),
        byStudent: new Map(),
      });
    }
    const bucket = sectionMonthMap.get(key);
    const day = date.slice(8, 10).replace(/^0/, '') || '';
    if (!day) return;
    bucket.days.add(day);
    if (!bucket.byStudent.has(studentId)) bucket.byStudent.set(studentId, new Map());
    bucket.byStudent.get(studentId).set(day, String(row?.status || '').trim().toUpperCase());
  });

  const records = {};
  sectionMonthMap.forEach((bucket) => {
    if (!records[bucket.sectionId]) records[bucket.sectionId] = {};
    const record = createAttendanceMonthRecord();
    const days = Array.from(bucket.days).sort((a, b) => Number(a) - Number(b));
    record.slotDays = Array.from({ length: 96 }, (_, idx) => days[idx] || '');
    record.visibleCount = Math.max(1, days.length);
    bucket.byStudent.forEach((codes, studentId) => {
      record.studentCodes[studentId] = Array.from({ length: 96 }, (_, idx) => {
        const day = days[idx];
        return day ? (codes.get(day) || '') : '';
      });
    });
    records[bucket.sectionId][bucket.monthKey] = record;
  });

  return { records };
}

export function buildSqlStateBlockPayload(blockKey) {
  if (blockKey === 'assessment') {
    return {
      periods: cloneJson(S.periods || [], []),
      schoolYear: cloneJson(S.schoolYear || {}, {}),
      academicCalendar: cloneJson(S.academicCalendar || {}, {}),
      activePeriodId: S.activePeriodId || 'P1',
      periodGroupConfigs: cloneJson(S.periodGroupConfigs || {}, {}),
    };
  }
  return {
    teacherPlanner: cloneJson(S.teacherPlanner || { monthKey: '', customEvents: [], weeklySchedule: [] }, { monthKey: '', customEvents: [], weeklySchedule: [] }),
    lessonPlans: cloneJson(S.lessonPlans || [], []),
  };
}

export function applySqlStateBlockPayload(blockKey, payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (blockKey === 'assessment') {
    if (Array.isArray(payload.periods) && payload.periods.length) S.periods = cloneJson(payload.periods, []);
    if (payload.schoolYear && typeof payload.schoolYear === 'object') S.schoolYear = cloneJson(payload.schoolYear, {});
    if (payload.academicCalendar && typeof payload.academicCalendar === 'object') S.academicCalendar = cloneJson(payload.academicCalendar, {});
    if (payload.periodGroupConfigs && typeof payload.periodGroupConfigs === 'object') {
      S.periodGroupConfigs = cloneJson(payload.periodGroupConfigs, {});
    }
    S.activePeriodId = payload.activePeriodId || S.activePeriodId || 'P1';
    return true;
  }
  S.teacherPlanner = payload.teacherPlanner && typeof payload.teacherPlanner === 'object'
    ? cloneJson(payload.teacherPlanner, { monthKey: '', customEvents: [], weeklySchedule: [] })
    : { monthKey: '', customEvents: [], weeklySchedule: [] };
  if (Array.isArray(payload.lessonPlans)) {
    S.lessonPlans = cloneJson(payload.lessonPlans, []);
  }
  return true;
}

export function applySqlAcademicSnapshot(snapshot = {}) {
  const grades = Array.isArray(snapshot.grades) ? snapshot.grades : [];
  const sections = Array.isArray(snapshot.sections) ? snapshot.sections : [];
  const students = Array.isArray(snapshot.students) ? snapshot.students : [];
  const evaluations = Array.isArray(snapshot.evaluations) ? snapshot.evaluations : [];
  const attendance = Array.isArray(snapshot.attendance) ? snapshot.attendance : [];

  const hasData = !!(grades.length || sections.length || students.length || evaluations.length || attendance.length);
  if (!hasData) return false;

  const normalizedGrades = grades
    .map((row) => ({
      id: String(row?.id || '').trim(),
      schoolId: String(row?.school_id || '').trim(),
      educationLevel: String(row?.education_level || '').trim() || 'Primaria',
      name: String(row?.name || '').trim(),
      gradeLevel: Number.isFinite(Number(row?.ordinal)) ? Number(row.ordinal) : null,
      ordinal: Number.isFinite(Number(row?.ordinal)) ? Number(row.ordinal) : null,
      subjectName: '',
      sections: [],
    }))
    .filter((grade) => grade.id && grade.name);

  const gradeById = new Map(normalizedGrades.map((grade) => [grade.id, grade]));
  const normalizedSections = sections
    .map((row) => {
      const gradeId = String(row?.grade_id || '').trim();
      const grade = gradeById.get(gradeId) || null;
      const sectionName = String(row?.name || '').trim();
      return {
        id: String(row?.id || '').trim(),
        schoolId: String(row?.school_id || '').trim(),
        gradeId,
        grado: grade?.name || '',
        gradeLevel: grade?.gradeLevel || null,
        sec: sectionName,
        sectionLetter: sectionName,
        materia: String(row?.subject_name || '').trim() || 'General',
        area: String(row?.subject_area || '').trim(),
        room: '',
        teacherUserId: String(row?.teacher_user_id || '').trim() || null,
      };
    })
    .filter((section) => section.id && section.gradeId);

  normalizedSections.forEach((section) => {
    const grade = gradeById.get(section.gradeId);
    if (!grade) return;
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
  const normalizedStudents = students
    .map((row) => {
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
        gradeLevel: section?.gradeLevel || null,
        photoUrl: '',
      };
    })
    .filter((student) => student.id && student.courseId);

  const attendanceSnapshot = buildSqlAttendanceSnapshot(attendance);

  S.grades = normalizedGrades;
  S.secciones = normalizedSections;
  S.estudiantes = normalizedStudents;
  if (evaluations.length) {
    S.evaluations = evaluations.map((row) => ({
      id: String(row?.id || '').trim(),
      schoolId: String(row?.school_id || '').trim(),
      groupId: String(row?.section_id || '').trim(),
      courseId: String(row?.section_id || '').trim(),
      activityId: String(row?.activity_id || '').trim(),
      studentId: String(row?.student_id || '').trim(),
      periodId: String(row?.period_id || 'P1').trim() || 'P1',
      score: Number(row?.score || 0),
      activityScore: Number(row?.score || 0),
      scorePercent: row?.score_percent === null || row?.score_percent === undefined ? null : Number(row.score_percent),
      notes: String(row?.notes || '').trim() || '',
      payload: row?.payload || {},
      evaluatedAt: row?.evaluated_at || null,
    })).filter((entry) => entry.id && entry.activityId && entry.studentId);
  } else {
    S.evaluations = Array.isArray(S.evaluations) ? S.evaluations : [];
  }

  if (attendanceSnapshot?.records && Object.keys(attendanceSnapshot.records).length) {
    S.attendance = {
      ...(S.attendance && typeof S.attendance === 'object' ? S.attendance : { monthKey: normalizeMonthKey(new Date().toISOString().slice(0, 7)), records: {} }),
      records: attendanceSnapshot.records,
      monthKey: Object.keys(attendanceSnapshot.records).flatMap((sectionId) => Object.keys(attendanceSnapshot.records[sectionId] || {}))[0] || S.attendance?.monthKey || normalizeMonthKey(new Date().toISOString().slice(0, 7)),
    };
  }

  return true;
}

export async function hydrateSqlAcademicSnapshotForActiveUser() {
  if (!isEnabled()) return false;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return false;
  const snapshot = await loadAcademicSnapshot({ schoolId: context.schoolId });
  return applySqlAcademicSnapshot(snapshot || {});
}

export async function hydrateSqlStateBlocksForActiveUser() {
  if (!isEnabled()) return false;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return false;
  let changed = false;
  for (const blockKey of SQL_STATE_BLOCK_KEYS) {
    const result = await loadStateBlock(blockKey, context).catch(() => null);
    const payload = result?.payload;
    if (payload && applySqlStateBlockPayload(blockKey, payload)) {
      changed = true;
    }
  }
  return changed;
}

export async function syncSqlActivityDelete(activityId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteActivity(activityId, { schoolId: context.schoolId });
}

export async function syncSqlGradeDelete(gradeId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteGrade(gradeId, { schoolId: context.schoolId });
}

export async function syncSqlSectionDelete(sectionId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteSection(sectionId, { schoolId: context.schoolId });
}

export async function syncSqlStudentDelete(studentId) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteStudent(studentId, { schoolId: context.schoolId });
}

export async function syncSqlEvaluationsDelete(filters = {}) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  return deleteEvaluations({ schoolId: context.schoolId, ...filters });
}

export async function flushSqlStateBlockSyncs() {
  const pending = [];
  for (const blockKey of SQL_STATE_BLOCK_KEYS) {
    const runtime = SQL_STATE_SYNC_RUNTIME[blockKey];
    if (runtime?.timer) {
      window.clearTimeout(runtime.timer);
      runtime.timer = null;
    }
    if (runtime?.pending || runtime?.payload) {
      pending.push(syncSqlStateBlock(blockKey));
    }
  }
  return Promise.allSettled(pending);
}

export function scheduleSqlStateBlockSyncs() {
  SQL_STATE_BLOCK_KEYS.forEach((blockKey) => scheduleSqlStateBlockSync(blockKey));
}

function scheduleSqlStateBlockSync(blockKey) {
  if (!SQL_STATE_BLOCK_KEYS.includes(blockKey)) return;
  if (!isEnabled()) return;
  const context = getSqlStateContext();
  if (!context?.email || (!context?.schoolId && !context?.schoolName)) return;
  const payload = buildSqlStateBlockPayload(blockKey);
  const runtime = SQL_STATE_SYNC_RUNTIME[blockKey];
  runtime.context = context;
  runtime.payload = payload;
  if (runtime.timer) window.clearTimeout(runtime.timer);
  runtime.timer = window.setTimeout(() => {
    runtime.timer = null;
    syncSqlStateBlock(blockKey).catch(() => null);
  }, 180);
}

async function syncSqlStateBlock(blockKey) {
  const runtime = SQL_STATE_SYNC_RUNTIME[blockKey];
  if (!runtime?.context || !runtime?.payload) return null;
  if (runtime.inFlight) {
    runtime.pending = true;
    return null;
  }
  runtime.inFlight = true;
  try {
    return await syncStateBlock(blockKey, runtime.context, runtime.payload, JSON.stringify(runtime.payload));
  } finally {
    runtime.inFlight = false;
    if (runtime.pending) {
      runtime.pending = false;
      scheduleSqlStateBlockSync(blockKey);
    }
  }
}

/**
 * Construye una cadena de consulta (query string) a partir de un objeto de parámetros.
 * @returns {string} Ej: "?key=value".
 */
export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    const normalized = String(value ?? '').trim();
    if (normalized) query.set(key, normalized);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

/**
 * Carga un bloque de estado arbitrario desde la API SQL.
 */
export async function loadStateBlock(blockKey, context = {}) {
  const cleanBlockKey = String(blockKey || '').trim();
  return request(`/api/state/${encodeURIComponent(cleanBlockKey)}${buildQuery(context)}`);
}

/**
 * Sincroniza/Guarda un bloque de estado (NoSQL-style) en la base de datos SQL.
 */
export async function syncStateBlock(blockKey, context = {}, payload = {}, payloadHash = '') {
  const cleanBlockKey = String(blockKey || '').trim();
  return request(`/api/state/${encodeURIComponent(cleanBlockKey)}`, {
    method: 'POST',
    body: JSON.stringify({
      ...(context || {}),
      payload,
      payloadHash: String(payloadHash || '').trim(),
    }),
  });
}

/**
 * Normaliza el nombre de una escuela para comparaciones seguras.
 */
export function normalizeSchoolName(name) {
  return normTxt(name);
}

/**
 * Obtiene el contexto consolidado del usuario para operaciones de sincronización SQL.
 * Incluye email, institución, rol y año académico.
 * @returns {Object|null}
 */
export function getSqlStateContext() {
  const localUser = readBrowserSession();
  const authUser = Array.isArray(S.authUsers) ? S.authUsers.find((user) => user.id === S.sessionUserId) : null;
  const email = String(S.profile?.email || localUser?.email || authUser?.email || '').trim().toLowerCase();
  const schoolId = String(S.profile?.schoolId || S.profile?.school?.id || '').trim();
  const schoolName = normalizeSchoolName(S.profile?.inst || '');
  if (!email || (!schoolId && !schoolName)) return null;
  return {
    email,
    schoolId,
    schoolName,
    firebaseUid: S.sessionUserId || '',
    displayName: String(S.profile?.name || S.sessionUserName || localUser?.name || '').trim(),
    phone: String(S.profile?.phone || '').trim(),
    academicYear: String(S.profile?.year || S.schoolYear?.name || '').trim(),
    timezone: String(S.profile?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo').trim(),
    role: String(S.profile?.role || 'Docente').trim(),
  };
}

/**
 * Comprueba si un ID tiene formato de UUID estándar.
 * @returns {boolean}
 */
export function isSqlUuidLike(value) {
  const str = String(value || '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Garantiza que exista un contexto académico en la base de datos SQL.
 * Crea el perfil del usuario y la escuela si no existen y retorna sus IDs internos.
 * @returns {Promise<Object|null>}
 */
export async function ensureSqlAcademicContext() {
  if (!isEnabled()) return null;
  const context = getSqlStateContext();
  if (!context) return null;
  
  const cacheKey = `${context.email}::${context.schoolId || context.schoolName || ''}::${context.firebaseUid || ''}`;
  if (SQL_ACADEMIC_CONTEXT_CACHE.key === cacheKey && SQL_ACADEMIC_CONTEXT_CACHE.data) {
    return SQL_ACADEMIC_CONTEXT_CACHE.data;
  }
  
  try {
    const result = await syncProfile(context);
    const resolvedSchoolId = String(result?.school?.id || context.schoolId || '').trim();
    const resolvedSchoolName = String(result?.school?.name || context.schoolName || '').trim();
    if (resolvedSchoolId) {
      if (!S.profile || typeof S.profile !== 'object') S.profile = {};
      S.profile.schoolId = resolvedSchoolId;
      if (resolvedSchoolName) S.profile.inst = resolvedSchoolName;
      if (result?.school) {
        S.profile.school = cloneJson(result.school, null);
      }
    }
    const resolved = {
      ...context,
      userId: result?.user?.id || '',
      schoolId: resolvedSchoolId,
      school: result?.school || null,
      user: result?.user || null,
    };
    SQL_ACADEMIC_CONTEXT_CACHE.key = `${context.email}::${resolvedSchoolId || resolvedSchoolName || ''}::${context.firebaseUid || ''}`;
    SQL_ACADEMIC_CONTEXT_CACHE.data = resolved;
    return resolved;
  } catch (error) {
    console.warn('[EduGest][sql] Failed to ensure academic context', error);
    return null;
  }
}

/**
 * Atajo para obtener el schoolId de la base de datos SQL para el perfil activo.
 */
export async function ensureSqlSchoolIdForProfile() {
  const context = await ensureSqlAcademicContext();
  return String(context?.schoolId || '').trim();
}

/**
 * --- Sincronización de Asistencia SQL ---
 */

/** Orquestador de tareas en vuelo y temporizadores para sincronización de asistencia */
const SQL_ATTENDANCE_SYNC_RUNTIME = {
  timers: new Map(),
  inFlight: new Map(),
  pending: new Set(),
};

/** Normaliza la llave de mes para compatibilidad con la base de datos (YYYY-MM) */
function normalizeSqlAttendanceMonthKey(monthKey) {
  return String(monthKey || '').trim().slice(0, 7);
}

/** Mapea los códigos de estado locales a los códigos permitidos en SQL */
function normalizeSqlAttendanceStatus(status = '') {
  const s = String(status || '').toUpperCase();
  if (['P', 'T', 'L', 'S'].includes(s)) return 'P';
  if (s === 'A') return 'A';
  if (s === 'E') return 'E';
  if (s === 'R') return 'R';
  return 'P';
}

/** Valida el número del día (1-31) para asistencia */
function normalizeAttendanceV2DayValue(value) {
  const raw = String(value || '').replace(/\D/g, '').slice(0, 2);
  if (!raw) return '';
  const day = parseInt(raw, 10);
  return day >= 1 && day <= 31 ? String(day) : '';
}

/** Genera estructura de metadatos para un slot de asistencia */
function createAttendanceV2SlotMeta(type = '', reason = '') {
  return { type: String(type || '').trim(), reason: String(reason || '').trim().slice(0, 140) };
}

/** Normaliza metadatos de slot */
function normalizeAttendanceV2SlotMeta(meta) {
  if (!meta || typeof meta !== 'object') return createAttendanceV2SlotMeta(String(meta || ''));
  return createAttendanceV2SlotMeta(meta.type || '', meta.reason || '');
}

/**
 * Transforma el JSON estructurado de asistencia de EduGest en filas aplanadas para SQL.
 */
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
    const slotDays = sectionRecord.slotDays;
    const slotMeta = sectionRecord.slotMeta || [];
    Object.entries(sectionRecord.studentCodes || {}).forEach(([studentId, codes]) => {
      if (!Array.isArray(codes)) return;
      codes.forEach((code, slotIndex) => {
        const day = normalizeAttendanceV2DayValue(slotDays[slotIndex] || '');
        const status = normalizeSqlAttendanceStatus(code || '');
        if (!day || !status) return;
        const meta = normalizeAttendanceV2SlotMeta(slotMeta[slotIndex] || '');
        pushRow(studentId, `${normalizedMonth}-${day.padStart(2, '0')}`, status, meta?.reason || '');
      });
    });
    return rows;
  }

  // Soporte para formato legado
  Object.entries(sectionRecord || {}).forEach(([studentId, days]) => {
    if (!days || typeof days !== 'object' || Array.isArray(days)) return;
    Object.entries(days).forEach(([attendanceDate, status]) => {
      pushRow(studentId, attendanceDate, status, null);
    });
  });
  return rows;
}

/**
 * Sincroniza inmediatamente los registros de asistencia de una sección con el servidor SQL.
 */
export async function syncSqlAttendanceMonth(sectionId, monthKey, options = {}) {
  if (!isEnabled()) return null;
  const schoolId = await ensureSqlSchoolIdForProfile();
  const cleanSectionId = String(sectionId || '').trim();
  const normalizedMonth = normalizeSqlAttendanceMonthKey(monthKey);
  if (!schoolId || !cleanSectionId || !/^\d{4}-\d{2}$/.test(normalizedMonth)) return null;

  if (options?.clear) {
    return clearAttendanceMonth({ schoolId, sectionId: cleanSectionId, monthKey: normalizedMonth });
  }

  const rows = buildSqlAttendanceMonthRows(cleanSectionId, normalizedMonth);
  return replaceAttendanceMonth({ schoolId, sectionId: cleanSectionId, monthKey: normalizedMonth, rows });
}

/**
 * Cancela cualquier sincronización de asistencia pendiente de ejecución.
 */
export function cancelSqlAttendanceMonthSync(sectionId, monthKey) {
  const key = `${String(sectionId || '').trim()}::${normalizeSqlAttendanceMonthKey(monthKey)}`;
  const timer = SQL_ATTENDANCE_SYNC_RUNTIME.timers.get(key);
  if (timer) window.clearTimeout(timer);
  SQL_ATTENDANCE_SYNC_RUNTIME.timers.delete(key);
  SQL_ATTENDANCE_SYNC_RUNTIME.pending.delete(key);
}

/**
 * Programa una sincronización de asistencia con retardo (debounced).
 * Previene colisiones y reduce la carga del servidor durante ediciones rápidas.
 */
export function scheduleSqlAttendanceMonthSync(sectionId, monthKey) {
  if (!isEnabled()) return;
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
        console.warn('[EduGest][sql] No se pudo sincronizar asistencia con SQL', error);
      })
      .finally(() => {
        SQL_ATTENDANCE_SYNC_RUNTIME.inFlight.delete(key);
        if (SQL_ATTENDANCE_SYNC_RUNTIME.pending.has(key)) {
          SQL_ATTENDANCE_SYNC_RUNTIME.pending.delete(key);
          scheduleSqlAttendanceMonthSync(cleanSectionId, normalizedMonth);
        }
      });
  }, 500);
  SQL_ATTENDANCE_SYNC_RUNTIME.timers.set(key, timer);
}

/**
 * Sincroniza una actividad evaluativa con la base de datos SQL.
 * Determina automáticamente si debe crear o actualizar basándose en el ID.
 */
export async function syncSqlActivityCreateOrUpdate(activity, meta = {}) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  
  const payload = mapActivityToSqlPayload(activity, {
    ...meta,
    schoolId: context.schoolId,
    teacherUserId: context.userId || meta.teacherUserId || '',
  });
  
  if (!payload.sectionId || !payload.name) return null;
  
  const shouldUpdate = isSqlUuidLike(activity?.id);
  return shouldUpdate
    ? updateActivity(activity.id, payload)
    : createActivity(payload);
}
