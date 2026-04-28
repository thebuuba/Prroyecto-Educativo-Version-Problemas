import { request } from './client.js';

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
