import { escapeHtml } from './error-and-dom.js';

/**
 * Normaliza y formatea una matrícula al formato estándar 00-0000-0.
 * @param {string} raw - Valor en crudo.
 * @returns {string} Matrícula formateada.
 */
export function formatMatricula(raw) {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 7);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 7)}`;
}

/**
 * Normaliza la matrícula eliminando caracteres de separación.
 * @param {string} raw - Valor en crudo.
 * @returns {string} Cadena de solo dígitos.
 */
export function normalizeMatricula(raw) {
  return formatMatricula(raw).replace(/\D/g, '');
}

/**
 * Comprueba si una matrícula tiene el formato esperado (00-0000-0).
 * @param {string} raw - Valor a validar.
 * @returns {boolean}
 */
export function isValidMatricula(raw) {
  return /^\d{2}-\d{4}-\d$/.test(String(raw || '').trim());
}

/**
 * Genera una imagen de avatar (Data URL) basada en el nombre del estudiante.
 * @param {string} name - Nombre completo.
 * @returns {string} Data URL del SVG generado.
 */
export function buildStudentAvatarDataUrl(name = '') {
  const clean = String(name || '').trim();
  const initialsChars = clean
    ? clean.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    : 'EG';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stop-color="#d8ecff"/><stop offset="100%" stop-color="#9ec8f5"/></linearGradient></defs><rect width="160" height="160" rx="28" fill="url(#g)"/><text x="50%" y="54%" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="700" fill="#24466c">${escapeHtml(initialsChars)}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Resetea los campos de un formulario específico.
 * @param {string} mode - Tipo de formulario ('student', etc).
 * @param {Object} [presets] - Valores por defecto tras el reset.
 */
export function resetForm(mode, presets = {}) {
  if (mode === 'student') {
    ['e-nom', 'e-ape', 'e-mat', 'e-photo-data'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const photoPreview = document.getElementById('e-photo-preview');
    if (photoPreview) photoPreview.src = '';
    if (presets.courseId) {
      const secSel = document.getElementById('e-sec');
      if (secSel) secSel.value = presets.courseId;
    }
  }
}
