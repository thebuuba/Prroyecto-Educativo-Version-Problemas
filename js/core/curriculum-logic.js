import { S } from './state.js';
import { curriculumNormalizeSpecificCompetencyText } from './string-utils.js';
import * as Catalog from './catalog.js';
import { SECONDARY_CURRICULUM_GRADE_KEYS } from './constants.js';
import { parseGradeLevel } from './utils.js';

/**
 * Normaliza un nombre de grado a una clave técnica.
 */
export function curriculumNormalizeGradeKey(value = '') {
  const clean = String(value || '').trim();
  if (!clean) return '';
  const rank = parseInt(clean, 10) || parseGradeLevel(clean);
  if (rank >= 1 && rank <= 6) return SECONDARY_CURRICULUM_GRADE_KEYS[rank - 1];
  return '';
}

/**
 * Normaliza múltiples nombres de grados.
 */
export function curriculumNormalizeGradeKeys(values = []) {
  return [...new Set((Array.isArray(values) ? values : [values]).map((item) => curriculumNormalizeGradeKey(item)).filter(Boolean))];
}

/**
 * Recupera el catálogo de competencias específicas.
 */
export function curriculumSpecificCompetencyCatalog(gradeLabel, areaLabel) {
  const cleanLevel = 'Secundaria';
  const gradeKey = curriculumNormalizeGradeKey(gradeLabel);
  const area = (areaLabel || 'General').trim();

  const registry = Catalog.OFFICIAL_CURRICULUM_SPECIFIC_COMPETENCY_REGISTRY[cleanLevel] || {};
  const gradeEntry = registry[gradeKey] || {};
  const areaEntry = gradeEntry[area] || gradeEntry['General'] || {};

  if (Object.keys(areaEntry).length === 0) {
    const block = Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS.find(b =>
      b.area === area && b.gradeKeys.includes(gradeKey)
    );
    if (block) return block.competencies;
  }

  return areaEntry;
}

/**
 * Busca la descripción de una competencia específica.
 */
export function curriculumSpecificCompetencyLookup(gradeLabel, areaLabel, competencyName) {
  const catalog = curriculumSpecificCompetencyCatalog(gradeLabel, areaLabel);
  const normalizedMatch = Object.keys(catalog).find(k => k.toLowerCase().includes((competencyName || '').toLowerCase()));
  return catalog[normalizedMatch || competencyName] || (Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS[areaLabel] || Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS.General)[competencyName] || '';
}

/**
 * Devuelve el contexto curricular para un grado.
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
 * Normaliza un objeto de fallbacks curriculares.
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
 * Asegura que el catálogo de currículo en el estado esté inicializado.
 */
export function ensureCurriculumCatalogState() {
  if (!S.curriculumCatalog || typeof S.curriculumCatalog !== 'object') S.curriculumCatalog = {};
  if (!Array.isArray(S.curriculumCatalog.customAreas)) S.curriculumCatalog.customAreas = [];
  if (!Array.isArray(S.curriculumCatalog.customSubjects)) S.curriculumCatalog.customSubjects = [];
  if (!Array.isArray(S.curriculumCatalog.customSpecificCompetencyBlocks)) S.curriculumCatalog.customSpecificCompetencyBlocks = [];
}

/**
 * Obtiene el área oficial de una asignatura a partir del catálogo nacional.
 */
export function curriculumOfficialSubjectArea(subject = '', gradeId = '', gradeName = '') {
  const cleanSubject = (subject || '').trim().toLowerCase();
  if (!cleanSubject) return '';
  // Simplificación para la versión modular: usamos los bloques de competencias para inferir el área
  for (const block of Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS) {
    if (block.competencies && Object.keys(block.competencies).length > 0) {
      if (block.area && cleanSubject.includes(block.area.toLowerCase())) return block.area;
    }
  }
  return '';
}

/**
 * Genera opciones de asignaturas filtradas por grado y área.
 */
export function curriculumSubjectOptions({ gradeId = '', gradeName = '', area = '', sectionName = '', scopeToExistingSections = false } = {}) {
  const areaLabel = String(area || '').trim();
  const catalog = curriculumSpecificCompetencyCatalog(gradeName, areaLabel);
  const subjects = new Set();
  
  if (areaLabel) {
    subjects.add(areaLabel);
  }
  
  // Agregar asignaturas del catálogo que coincidan con el área
  if (Catalog.OFFICIAL_CURRICULUM_SUBJECT_CATALOG && Catalog.OFFICIAL_CURRICULUM_SUBJECT_CATALOG[areaLabel]) {
    Catalog.OFFICIAL_CURRICULUM_SUBJECT_CATALOG[areaLabel].forEach(s => subjects.add(s));
  }

  return Array.from(subjects).sort((a, b) => a.localeCompare(b, 'es'));
}
