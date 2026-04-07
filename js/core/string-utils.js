import { normTxt } from './utils.js';
import { EDUCATION_SECTIONS } from './constants.js';

/**
 * Corrige fallos de codificación en textos comunes del currículo.
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
 * Normaliza y limpia textos de competencias específicas.
 */
export function curriculumNormalizeSpecificCompetencyText(value = '') {
  // Simplified Version
  const base = restoreSpanishQuestionCorruption(value || '');
  return base.replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
}

/**
 * Normaliza el nombre de un nivel educativo.
 */
export function normalizeEducationLevelName(level) {
  const v = normTxt(level);
  if (v === 'primario' || v === 'primaria') return 'Primaria';
  if (v === 'secundario' || v === 'secundaria') return 'Secundaria';
  if (v === 'inicial') return 'Inicial';
  return String(level || '').trim() || 'Primaria';
}

/**
 * Valida y normaliza una sección educativa.
 */
export function normalizeEducationSection(section) {
  if (!String(section || '').trim()) return '';
  const normalized = normalizeEducationLevelName(section);
  return EDUCATION_SECTIONS.includes(normalized) ? normalized : '';
}

/**
 * Convierte un set de niveles en una lista normalizada única.
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
 * Normaliza texto para búsqueda.
 */
export function normalizeCourseSearchText(text = '') {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
