/**
 * Retorna la marca de tiempo actual en formato ISO.
 * @returns {string}
 */
export function nowIso() {
  return new Date().toISOString();
}

/**
 * Genera un identificador único corto basado en tiempo y aleatoriedad.
 * @returns {string}
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/**
 * Filtra un array eliminando valores nulos/falsos y duplicados.
 * @param {Array} arr - Array fuente.
 * @returns {Array} Array limpio.
 */
export function uniqueValues(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.filter(Boolean))];
}
