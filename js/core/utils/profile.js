/**
 * Extrae solo los dígitos de un teléfono para normalización.
 * @param {string} raw - Valor en crudo.
 * @returns {string}
 */
export function extractPhoneDigits(raw = '') {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1, 11);
  return digits.slice(0, 10);
}

/**
 * Normaliza un número de teléfono al formato (000) 000-0000.
 * @param {string} raw - Valor en crudo.
 * @returns {string}
 */
export function normalizePhoneValue(raw = '') {
  const digits = extractPhoneDigits(raw);
  if (!digits) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Verifica si un teléfono tiene la cantidad correcta de dígitos (10).
 * @param {string} raw - Valor en crudo.
 * @returns {boolean}
 */
export function phoneHasValidDigits(raw = '') {
  return extractPhoneDigits(raw).length === 10;
}

/**
 * Normaliza el nombre de una institución (colegio/escuela).
 * @param {string} name - Nombre de la escuela.
 * @returns {string}
 */
export function normalizeSchoolName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

/**
 * Construye el nombre completo concatenando nombre(s) y apellido(s).
 * @param {string} firstName - Nombres.
 * @param {string} lastName - Apellidos.
 * @returns {string}
 */
export function buildProfileFullName(firstName = '', lastName = '') {
  return [String(firstName || '').trim(), String(lastName || '').trim()].filter(Boolean).join(' ').trim();
}
