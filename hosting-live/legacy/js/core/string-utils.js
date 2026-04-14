/**
 * Utilidades de Procesamiento de Texto y Normalización Curricular.
 * --------------------------------------------------------------------------
 * Este módulo se encarga de la limpieza de cadenas, corrección de errores de 
 * codificación (UTF-8) y normalización de términos educativos para asegurar 
 * consistencia en los catálogos.
 */

import { normTxt } from './utils.js';
import { EDUCATION_SECTIONS } from './constants.js';

/**
 * Corrige fallos de codificación (caracteres sustitutos ) en textos comunes del currículo.
 * Reemplaza patrones de corrupción por sus equivalentes con tildes correctas.
 * @param {string} value - Texto con posible corrupción.
 * @returns {string} Texto restaurado.
 */
export function restoreSpanishQuestionCorruption(value = '') {
  let text = String(value || '');
  text = text.replace(/\uFFFD/g, '?');
  const replacements = [
    [/comprensi\?n/gi, 'comprensión'],
    [/producci\?n/gi, 'producción'],
    [/l\?gico/gi, 'lógico'],
    [/cr\?tico/gi, 'crítico'],
    [/resoluci\?n/gi, 'resolución'],
    [/soluci\?n/gi, 'solución'],
    [/espec\?fico/gi, 'específico'],
    [/espec\?fica/gi, 'específica'],
    [/espec\?ficos/gi, 'específicos'],
    [/espec\?ficas/gi, 'específicas'],
    [/hist\?rica/gi, 'histórica'],
    [/cient\?fica/gi, 'científica'],
    [/tecnol\?gica/gi, 'tecnológica'],
    [/pedag\?gica/gi, 'pedagógica'],
    [/art\?stica/gi, 'artística'],
    [/comunicaci\?n/gi, 'comunicación'],
    [/interacci\?n/gi, 'interacción'],
    [/exposici\?n/gi, 'exposición'],
    [/evaluaci\?n/gi, 'evaluación'],
    [/observaci\?n/gi, 'observación'],
    [/reflexi\?n/gi, 'reflexión'],
    [/descripci\?n/gi, 'descripción'],
    [/organizaci\?n/gi, 'organización'],
    [/situaci\?n/gi, 'situación'],
  ];
  replacements.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });
  return text;
}

/**
 * Normaliza y limpia textos de competencias específicas eliminando espacios extra.
 * @param {string} value - Texto de la competencia.
 * @returns {string} Texto limpio y normalizado.
 */
export function curriculumNormalizeSpecificCompetencyText(value = '') {
  const base = restoreSpanishQuestionCorruption(value || '');
  return base.replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
}

/**
 * Normaliza el nombre de un nivel educativo (Inicial, Primaria, Secundaria).
 * @param {string} level - Nombre del nivel.
 * @returns {string} Nombre estandarizado.
 */
export function normalizeEducationLevelName(level) {
  const v = normTxt(level);
  if (v === 'primario' || v === 'primaria') return 'Primaria';
  if (v === 'secundario' || v === 'secundaria') return 'Secundaria';
  if (v === 'inicial') return 'Inicial';
  return String(level || '').trim() || 'Primaria';
}

/**
 * Valida si un nivel educativo es uno de los permitidos oficialmente.
 * @param {string} section - Nombre de la sección/nivel.
 * @returns {string} Nivel válido o cadena vacía.
 */
export function normalizeEducationSection(section) {
  if (!String(section || '').trim()) return '';
  const normalized = normalizeEducationLevelName(section);
  return EDUCATION_SECTIONS.includes(normalized) ? normalized : '';
}

/**
 * Convierte un set de niveles (como array o string separado por comas) en una lista normalizada.
 * @param {Array|string} value - Niveles a normalizar.
 * @returns {Array<string>} Lista de niveles únicos y válidos.
 */
export function normalizeEducationSections(value) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  const unique = [];
  rawValues.forEach((item) => {
    const normalized = normalizeEducationSection(item);
    if (normalized && !unique.includes(normalized) && unique.length < 3) unique.push(normalized);
  });
  return unique;
}

/**
 * Normaliza texto para operaciones de búsqueda (insensible a tildes y mayúsculas).
 * @param {string} text - Texto fuente.
 * @returns {string} Texto normalizado NFD.
 */
export function normalizeCourseSearchText(text = '') {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
