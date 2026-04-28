import { request } from './client.js';
import { buildQuery } from './query.js';

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
