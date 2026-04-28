/**
 * Formatea una fecha ISO (YYYY-MM-DD) a un formato legible corto (es-DO).
 * @param {string} d - Fecha en formato ISO.
 * @returns {string} Ej: "7 Abr".
 */
export function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'short' });
  } catch (e) {
    return d;
  }
}

/**
 * Obtiene la llave del mes actual en formato estandarizado YYYY-MM.
 * @returns {string}
 */
export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Normaliza una llave de mes al formato YYYY-MM, validando su estructura.
 * @param {string} monthKey - Llave a normalizar.
 * @returns {string}
 */
export function normalizeAttendanceMonthKey(monthKey) {
  const match = String(monthKey || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return getCurrentMonthKey();
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) return getCurrentMonthKey();
  return `${match[1]}-${String(month).padStart(2, '0')}`;
}

/**
 * Genera una llave de mes (YYYY-MM) a partir de un objeto Date.
 * @param {Date|string} date - Objeto de fecha.
 * @returns {string}
 */
export function attendanceMonthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Obtiene la fecha de inicio de un mes (1ero del mes) a las 12:00 PM para evitar problemas de zona horaria.
 * @param {string} monthKey - Llave YYYY-MM.
 * @returns {Date}
 */
export function attendanceMonthStart(monthKey) {
  const normalized = normalizeAttendanceMonthKey(monthKey);
  const [year, month] = normalized.split('-').map((value) => parseInt(value, 10));
  return new Date(year, month - 1, 1, 12, 0, 0, 0);
}

/**
 * Redondea un número a 2 decimales de forma segura.
 * @param {number|string} n - Número a redondear.
 * @returns {number}
 */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
