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
const DEFAULT_BASE_URL = 'http://127.0.0.1:4000';

/** Caché interna para evitar solicitudes duplicadas de contexto académico */
const SQL_ACADEMIC_CONTEXT_CACHE = { key: '', data: null };

/**
 * Obtiene la URL base de la API SQL, priorizando la configuración en LocalStorage.
 * @returns {string}
 */
export function getBaseUrl() {
  const runtime = String(window.localStorage?.getItem('aulabase:sql-api-base-url') || '').trim();
  if (runtime) return runtime.replace(/\/+$/, '');
  return DEFAULT_BASE_URL;
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
