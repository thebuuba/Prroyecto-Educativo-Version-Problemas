import { S } from './state.js';
import { readBrowserSession } from './hydration.js';
import { mapActivityToSqlPayload } from './api-mappings.js';
import { normTxt } from './utils.js';

const DEFAULT_BASE_URL = 'http://127.0.0.1:4000';
const SQL_ACADEMIC_CONTEXT_CACHE = { key: '', data: null };

// Obtiene get base url.
export function getBaseUrl() {
  const runtime = String(window.localStorage?.getItem('aulabase:sql-api-base-url') || '').trim();
  if (runtime) return runtime.replace(/\/+$/, '');
  return DEFAULT_BASE_URL;
}

// Comprueba si is activada.
export function isEnabled() {
  return !!getBaseUrl();
}

// Gestiona request.
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

// Carga cargar escuela catalog.
export async function loadSchoolCatalog() {
  const payload = await request('/api/bootstrap/catalog');
  return Array.isArray(payload?.schools) ? payload.schools : [];
}

// Sincroniza sync perfil.
export async function syncProfile(payload) {
  return request('/api/bootstrap/profile', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Carga cargar grades.
export async function loadGrades(params = {}) {
  return request(`/api/grades${buildQuery(params)}`);
}

// Carga cargar sections.
export async function loadSections(params = {}) {
  return request(`/api/sections${buildQuery(params)}`);
}

// Carga cargar estudiantes.
export async function loadStudents(params = {}) {
  return request(`/api/students${buildQuery(params)}`);
}

// Carga cargar asistencia.
export async function loadAttendance(params = {}) {
  return request(`/api/attendance${buildQuery(params)}`);
}

// Carga cargar actividades.
export async function loadActivities(params = {}) {
  return request(`/api/activities${buildQuery(params)}`);
}

// Carga cargar evaluations.
export async function loadEvaluations(params = {}) {
  return request(`/api/evaluations${buildQuery(params)}`);
}

// Gestiona replace asistencia mes.
export async function replaceAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Gestiona clear asistencia mes.
export async function clearAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear grado.
export async function createGrade(payload = {}) {
  return request('/api/grades', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar grado.
export async function updateGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear sección.
export async function createSection(payload = {}) {
  return request('/api/sections', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar sección.
export async function updateSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear estudiante.
export async function createStudent(payload = {}) {
  return request('/api/students', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar estudiante.
export async function updateStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar grado.
export async function deleteGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar sección.
export async function deleteSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar estudiante.
export async function deleteStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear actividad.
export async function createActivity(payload = {}) {
  return request('/api/activities', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar actividad.
export async function updateActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar actividad.
export async function deleteActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Gestiona upsert evaluations.
export async function upsertEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar evaluations.
export async function deleteEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Carga cargar academic snapshot.
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

// Construye construir query.
export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    const normalized = String(value ?? '').trim();
    if (normalized) query.set(key, normalized);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

// Carga cargar estado block.
export async function loadStateBlock(blockKey, context = {}) {
  const cleanBlockKey = String(blockKey || '').trim();
  return request(`/api/state/${encodeURIComponent(cleanBlockKey)}${buildQuery(context)}`);
}

// Sincroniza sync estado block.
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
 * Obtiene el contexto de estado para la API de SQL.
 */
export function getSqlStateContext() {
  const localUser = readBrowserSession();
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

/**
 * Comprueba si un ID tiene formato de UUID (típico de SQL).
 */
export function isSqlUuidLike(value) {
  const str = String(value || '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Garantiza que exista un contexto académico en la base de datos SQL.
 */
export async function ensureSqlAcademicContext() {
  if (!isEnabled()) return null;
  const context = getSqlStateContext();
  if (!context) return null;
  
  const cacheKey = `${context.email}::${context.schoolName}::${context.firebaseUid || ''}`;
  if (SQL_ACADEMIC_CONTEXT_CACHE.key === cacheKey && SQL_ACADEMIC_CONTEXT_CACHE.data) {
    return SQL_ACADEMIC_CONTEXT_CACHE.data;
  }
  
  try {
    const result = await syncProfile(context);
    const resolved = {
      ...context,
      userId: result?.user?.id || '',
      schoolId: result?.school?.id || '',
      school: result?.school || null,
      user: result?.user || null,
    };
    SQL_ACADEMIC_CONTEXT_CACHE.key = cacheKey;
    SQL_ACADEMIC_CONTEXT_CACHE.data = resolved;
    return resolved;
  } catch (error) {
    console.warn('[EduGest][sql] Failed to ensure academic context', error);
    return null;
  }
}

export async function ensureSqlSchoolIdForProfile() {
  const context = await ensureSqlAcademicContext();
  return String(context?.schoolId || '').trim();
}

/**
 * --- SQL Attendance Synchronization ---
 */

const SQL_ATTENDANCE_SYNC_RUNTIME = {
  timers: new Map(),
  inFlight: new Map(),
  pending: new Set(),
};

function normalizeSqlAttendanceMonthKey(monthKey) {
  return String(monthKey || '').trim().slice(0, 7);
}

function normalizeSqlAttendanceStatus(status = '') {
  const s = String(status || '').toUpperCase();
  if (['P', 'T', 'L', 'S'].includes(s)) return 'P';
  if (s === 'A') return 'A';
  if (s === 'E') return 'E';
  if (s === 'R') return 'R';
  return 'P';
}

function normalizeAttendanceV2DayValue(value) {
  const raw = String(value || '').replace(/\D/g, '').slice(0, 2);
  if (!raw) return '';
  const day = parseInt(raw, 10);
  return day >= 1 && day <= 31 ? String(day) : '';
}

function createAttendanceV2SlotMeta(type = '', reason = '') {
  return { type: String(type || '').trim(), reason: String(reason || '').trim().slice(0, 140) };
}

function normalizeAttendanceV2SlotMeta(meta) {
  if (!meta || typeof meta !== 'object') return createAttendanceV2SlotMeta(String(meta || ''));
  return createAttendanceV2SlotMeta(meta.type || '', meta.reason || '');
}

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

  // Legacy format
  Object.entries(sectionRecord || {}).forEach(([studentId, days]) => {
    if (!days || typeof days !== 'object' || Array.isArray(days)) return;
    Object.entries(days).forEach(([attendanceDate, status]) => {
      pushRow(studentId, attendanceDate, status, null);
    });
  });
  return rows;
}

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

export function cancelSqlAttendanceMonthSync(sectionId, monthKey) {
  const key = `${String(sectionId || '').trim()}::${normalizeSqlAttendanceMonthKey(monthKey)}`;
  const timer = SQL_ATTENDANCE_SYNC_RUNTIME.timers.get(key);
  if (timer) window.clearTimeout(timer);
  SQL_ATTENDANCE_SYNC_RUNTIME.timers.delete(key);
  SQL_ATTENDANCE_SYNC_RUNTIME.pending.delete(key);
}

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
 * Sincroniza una actividad con la base de datos SQL.
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
