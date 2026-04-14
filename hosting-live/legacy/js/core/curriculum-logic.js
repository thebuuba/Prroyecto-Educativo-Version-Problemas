/**
 * Lógica de Currículo y Competencias Dominicanas.
 * --------------------------------------------------------------------------
 * Este módulo gestiona las reglas del Diseño Curricular Dominicano, incluyendo 
 * la normalización de grados, búsqueda de competencias específicas por área y 
 * la gestión del catálogo de indicadores.
 */

import { S } from './state.js';
import { curriculumNormalizeSpecificCompetencyText } from './string-utils.js';
import * as Catalog from './catalog.js';
import { SECONDARY_CURRICULUM_GRADE_KEYS } from './constants.js';
import { parseGradeLevel } from './utils.js';

/**
 * Normaliza el nombre de un grado a una clave técnica reconocida por el catálogo.
 * @param {string} value - Nombre del grado (ej. "1ro Secundaria", "6to").
 * @returns {string} Clave técnica (ej. "S1", "S6").
 */
export function curriculumNormalizeGradeKey(value = '') {
  const clean = String(value || '').trim();
  if (!clean) return '';
  const rank = parseInt(clean, 10) || parseGradeLevel(clean);
  if (rank >= 1 && rank <= 6) return SECONDARY_CURRICULUM_GRADE_KEYS[rank - 1];
  return '';
}

/**
 * Normaliza una lista de nombres de grados eliminando duplicados y valores inválidos.
 * @param {Array|string} values - Lista de nombres o un único nombre.
 * @returns {Array<string>} Lista de claves técnicas normalizadas.
 */
export function curriculumNormalizeGradeKeys(values = []) {
  return [...new Set((Array.isArray(values) ? values : [values]).map((item) => curriculumNormalizeGradeKey(item)).filter(Boolean))];
}

/**
 * Recupera el catálogo de competencias específicas dinámicamente según el grado y el área.
 * @param {string} gradeLabel - Etiqueta del grado.
 * @param {string} areaLabel - Área académica (ej. "Matemática", "Lengua Española").
 * @returns {Object} Mapa de competencias específicas y sus descripciones.
 */
export function curriculumSpecificCompetencyCatalog(gradeLabel, areaLabel) {
  const cleanLevel = 'Secundaria';
  const gradeKey = curriculumNormalizeGradeKey(gradeLabel);
  const area = (areaLabel || 'General').trim();

  const registry = Catalog.OFFICIAL_CURRICULUM_SPECIFIC_COMPETENCY_REGISTRY[cleanLevel] || {};
  const gradeEntry = registry[gradeKey] || {};
  const areaEntry = gradeEntry[area] || gradeEntry['General'] || {};

  // Reintento usando bloques estáticos si el registro dinámico falla
  if (Object.keys(areaEntry).length === 0) {
    const block = Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS.find(b =>
      b.area === area && b.gradeKeys.includes(gradeKey)
    );
    if (block) return block.competencies;
  }

  return areaEntry;
}

/**
 * Busca la descripción detallada de una competencia específica.
 * @param {string} gradeLabel - Grado.
 * @param {string} areaLabel - Área.
 * @param {string} competencyName - Nombre o fragmento de la competencia.
 * @returns {string} Descripción completa.
 */
export function curriculumSpecificCompetencyLookup(gradeLabel, areaLabel, competencyName) {
  const catalog = curriculumSpecificCompetencyCatalog(gradeLabel, areaLabel);
  const normalizedMatch = Object.keys(catalog).find(k => k.toLowerCase().includes((competencyName || '').toLowerCase()));
  return catalog[normalizedMatch || competencyName] || (Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS[areaLabel] || Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS.General)[competencyName] || '';
}

/**
 * Obtiene el contexto curricular (conceptos y procedimientos) para un grado específico.
 * @param {string} gradeLabel - Grado solicitado.
 * @returns {Object} Contexto con clave de grado y listas de contenidos.
 */
export function curriculumGradeContext(gradeLabel) {
  const gradeKey = curriculumNormalizeGradeKey(gradeLabel);
  return {
    gradeKey,
    conceptual: Catalog.LESSON_PLAN_CONCEPTUAL_CATALOG['Lengua Española']?.[gradeKey] || [],
    procedural: Catalog.LESSON_PLAN_PROCEDURAL_CATALOG['Lengua Española']?.[gradeKey] || [],
  };
}

/**
 * Normaliza y limpia un objeto de 'fallbacks' (valores de reserva) curriculares.
 * @param {Object} [source] - Objeto fuente de competencias.
 * @returns {Object} Objeto normalizado y limpio.
 */
export function curriculumNormalizeSpecificCompetencyFallbacks(source = Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS) {
  const result = {};
  Object.entries(source || {}).forEach(([scope, fundamentals]) => {
    const cleanScope = scope.trim();
    if (!cleanScope || !fundamentals || typeof fundamentals !== 'object') return;
    const nextFundamentals = {};
    Object.entries(fundamentals).forEach(([fundamental, values]) => {
      const cleanValues = [...new Set((Array.isArray(values) ? values : [values])
        .map((item) => curriculumNormalizeSpecificCompetencyText(item))
        .filter(Boolean))];
      if (cleanValues.length) nextFundamentals[fundamental.trim()] = cleanValues;
    });
    if (Object.keys(nextFundamentals).length) result[cleanScope] = nextFundamentals;
  });
  return result;
}

/**
 * Garantiza que la estructura de catálogos personalizados en el estado S esté inicializada.
 */
export function ensureCurriculumCatalogState() {
  if (!S.curriculumCatalog || typeof S.curriculumCatalog !== 'object') S.curriculumCatalog = {};
  if (!Array.isArray(S.curriculumCatalog.customAreas)) S.curriculumCatalog.customAreas = [];
  if (!Array.isArray(S.curriculumCatalog.customSubjects)) S.curriculumCatalog.customSubjects = [];
  if (!Array.isArray(S.curriculumCatalog.customSpecificCompetencyBlocks)) S.curriculumCatalog.customSpecificCompetencyBlocks = [];
}

/**
 * Infiere el área oficial de una asignatura basándose en el catálogo nacional.
 * @param {string} subject - Nombre de la asignatura.
 * @param {string} [gradeId] - ID del grado.
 * @param {string} [gradeName] - Nombre del grado.
 * @returns {string} Área detectada (ej. "Ciencias de la Naturaleza").
 */
export function curriculumOfficialSubjectArea(subject = '', gradeId = '', gradeName = '') {
  const cleanSubject = (subject || '').trim().toLowerCase();
  if (!cleanSubject) return '';
  for (const block of Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS) {
    if (block.competencies && Object.keys(block.competencies).length > 0) {
      if (block.area && cleanSubject.includes(block.area.toLowerCase())) return block.area;
    }
  }
  return '';
}

/**
 * Genera una lista de opciones de asignaturas filtradas.
 * @param {Object} params - Parámetros de filtrado.
 * @returns {Array<string>} Lista ordenada de asignaturas.
 */
export function curriculumSubjectOptions({ gradeId = '', gradeName = '', area = '', sectionName = '', scopeToExistingSections = false } = {}) {
  const areaLabel = String(area || '').trim();
  const subjects = new Set();
  
  if (areaLabel) {
    subjects.add(areaLabel);
  }
  
  // Agregar asignaturas del catálogo oficial que coincidan con el área seleccionada
  if (Catalog.OFFICIAL_CURRICULUM_SUBJECT_CATALOG && Catalog.OFFICIAL_CURRICULUM_SUBJECT_CATALOG[areaLabel]) {
    Catalog.OFFICIAL_CURRICULUM_SUBJECT_CATALOG[areaLabel].forEach(s => subjects.add(s));
  }

  return Array.from(subjects).sort((a, b) => a.localeCompare(b, 'es'));
}
