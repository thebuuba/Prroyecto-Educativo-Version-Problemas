import { S } from '../state.js';
import { isEnabled } from './client.js';
import { clearAttendanceMonth, replaceAttendanceMonth } from './academic-endpoints.js';
import { ensureSqlSchoolIdForProfile } from './context.js';

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
