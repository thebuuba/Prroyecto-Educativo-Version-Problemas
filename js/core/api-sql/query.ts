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
