import { fixMojibakeText } from './text-normalization.js';

/**
 * Resuelve el mensaje de error más amigable para el usuario.
 * @param {Error|Object} error - Objeto de error capturado.
 * @param {string} [fallback] - Mensaje por defecto.
 * @returns {string} Mensaje final en español.
 */
export function errorMessage(error, fallback = 'No se pudo completar la acción.') {
  if (window.EduGestCloud?.friendlyError) {
    const cloudMessage = String(window.EduGestCloud.friendlyError(error) || '').trim();
    if (cloudMessage) return cloudMessage;
  }
  const directMessage = String(error?.message || '').trim();
  if (directMessage) return directMessage;
  return fallback;
}

/**
 * Registra un error en consola y muestra una notificación (toast) al usuario.
 * @param {string} context - Contexto donde ocurrió el error (ej. "Auth").
 * @param {Error} error - Excepción capturada.
 * @param {Object} [options] - Configuración de visualización.
 */
export function reportError(context, error, options = {}) {
  const { fallback = 'No se pudo completar la acción.', tone = 'error' } = options;
  console.error(`[EduGest][${context}]`, error);
  if (window.toast) window.toast(`${errorMessage(error, fallback)}`, tone);
}

/**
 * Escapa caracteres especiales de HTML para prevenir ataques XSS.
 * Incluye reparación previa de texto corrupto.
 * @param {string} value - Texto a escapar.
 * @returns {string}
 */
export function escapeHtml(value) {
  const text = fixMojibakeText(String(value == null ? '' : value));
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Verifica si un elemento del DOM es un campo de entrada editable.
 * @param {HTMLElement} el - Elemento a validar.
 * @returns {boolean}
 */
export function isEditableTarget(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
/**
 * Obtiene el valor recortado de un elemento input/select por su ID.
 * @param {string} id - ID del elemento DOM.
 * @returns {string} Valor limpio o vacío.
 */
export function v(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || '').trim() : '';
}
/**
 * Llena un elemento SELECT con opciones dinámicas.
 * @param {string} id - ID del SELECT.
 * @param {Array} items - Lista de objetos.
 * @param {Function} valFn - Función para obtener el valor.
 * @param {Function} lblFn - Función para obtener la etiqueta.
 * @param {string} [selected] - Valor seleccionado por defecto.
 * @param {string} [emptyMsg] - Mensaje si no hay items.
 */
export function fillSel(id, items, valFn, lblFn, selected = '', emptyMsg = 'Selecciona') {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items?.length 
    ? items.map(i => `<option value="${valFn(i)}" ${valFn(i) === selected ? 'selected' : ''}>${escapeHtml(lblFn(i))}</option>`).join('')
    : `<option value="">${emptyMsg}</option>`;
}
