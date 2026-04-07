import { S } from './state.js';
import { uid, nowIso, parseGradeLevel, parseSection, sortCourses, normTxt } from './utils.js';
import { persist } from './hydration.js';
import * as Catalog from './catalog.js';
import { SECONDARY_CURRICULUM_GRADE_KEYS, BLOCKS } from './constants.js';

/**
 * Nivel Educativo del sistema AulaBase.
 * @type {string[]}
 */
export const EDUCATION_SECTIONS = ['Inicial', 'Primaria', 'Secundaria'];

/**
 * Clases CSS de tema por cada sección educativa.
 * @type {Object<string, string>}
 */
export const EDUCATION_THEME_CLASS_BY_SECTION = {
  'Inicial': 'theme-infant',
  'Primaria': 'theme-primary',
  'Secundaria': 'theme-secondary',
};

/**
 * Clases CSS para combinaciones de niveles educativos.
 * @type {Object<string, string>}
 */
export const EDUCATION_THEME_CLASS_BY_COMBINATION = {
  'Primaria+Secundaria': 'theme-unified-k12',
  'Inicial+Primaria': 'theme-infant-primary',
};
const SETUP_FLOW = {}; // Temporary placeholder if needed, usually in state.js

/**
 * Infiera el área curricular de un grupo basado en su nombre de materia.
 * @param {Object} group - Objeto que representa la sección o curso.
 * @returns {string} El nombre del área oficial o el área original si no hay coincidencia.
 */
export function lessonPlanAreaFromGroup(group) {
  // Simplified version, missing some dependencies from the monolith but enough for now
  const subject = String(group?.materia || '').toLowerCase();
  if (/(biologia|quimica|fisica|ciencia|naturaleza|tierra|vida)/.test(subject)) return 'Ciencias de la Naturaleza';
  if (/(lengua|literaria|texto|periodistic|publicitario|espanol)/.test(subject)) return 'Lengua Española';
  if (/(matemat|algebra|geometr)/.test(subject)) return 'Matemática';
  if (/(social|historia|geografia|geografía)/.test(subject)) return 'Ciencias Sociales';
  if (/ingles|english|frances|franc[eé]s/.test(subject)) return 'Lenguas Extranjeras';
  return group?.area || '';
}

/**
 * Normaliza los atributos de una r&uacute;brica anal&iacute;tica para asegurar integridad.
 * @param {Object} inst - Objeto del instrumento.
 * @returns {Object} El instrumento normalizado.
 */
export function normalizeRubricaInstrument(inst) {
  if (!inst || inst.type !== 'rubrica_analitica') return inst;
  // Basic normalization logic extracted from monolith
  inst.levelsCount = Math.max(2, Math.min(6, inst.levels?.length || 4));
  inst.maxScore = parseFloat(inst.maxTotal ?? inst.maxScore) || 20;
  inst.updatedAt = nowIso();
  return inst;
}

/**
 * Evalúa un instrumento de evaluación contra un set de valores (calificaciones por criterio).
 * @param {Object} instrument - El instrumento (rúbrica, lista cotejo, etc).
 * @param {Object<string, any>} values - Diccionario de ID_CRITERIO -> VALOR.
 * @returns {Object} Objeto con totalScore y detalle perCriterion.
 */
export function evaluateInstrument(instrument, values) {
  if (!instrument || !values) return { totalScore: 0, perCriterion: [] };
  // Logic to calculate scores based on instrument type
  let total = 0;
  const perCriterion = (instrument.criteria || []).map(c => {
    const val = values[c.id];
    let score = 0;
    if (instrument.type === 'rubrica_analitica') {
      const level = (instrument.levels || []).find(l => l.id === val);
      score = (parseFloat(level?.factor) || 0) * (parseFloat(c.maxPoints) || 0);
    } else {
      score = parseFloat(val) || 0;
    }
    total += score;
    return { id: c.id, score, value: val };
  });

  return {
    totalScore: total,
    perCriterion
  };
}

/**
 * Devuelve la etiqueta amigable para un tipo de instrumento.
 * @param {string} type - Tipo técnico del instrumento.
 * @returns {string} Etiqueta descriptiva.
 */
export function instrumentTypeLabel(type) {
  const m = {
    rubrica_analitica: 'Rúbrica analítica',
    lista_cotejo_a: 'Lista de cotejo (simple)',
    lista_cotejo_b: 'Lista de cotejo ponderada',
    escala_estimativa: 'Escala estimativa',
  };
  return m[type] || type;
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
 * Asegura y sincroniza los contenedores de datos (buckets) por periodo.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo (P1, P2...).
 */
export function ensurePeriodBuckets(periodId = S.activePeriodId) {
  // Prepara los contenedores de notas y configuraciones para un periodo específico si no existen.
  if (!periodId) return;
  if (typeof window.ensurePeriodsAndYear === 'function') window.ensurePeriodsAndYear();
  
  if (!S.periodGroupConfigs || typeof S.periodGroupConfigs !== 'object') S.periodGroupConfigs = {};
  if (!S.notasByPeriod || typeof S.notasByPeriod !== 'object') S.notasByPeriod = {};
  
  if (!S.periodGroupConfigs[periodId]) {
    const base = (periodId === 'P1' && S.groupConfigs && Object.keys(S.groupConfigs).length) ? S.groupConfigs : {};
    S.periodGroupConfigs[periodId] = JSON.parse(JSON.stringify(base));
  }
  if (!S.notasByPeriod[periodId]) {
    S.notasByPeriod[periodId] = (periodId === 'P1' && S.notas && Object.keys(S.notas).length) ? JSON.parse(JSON.stringify(S.notas)) : {};
  }
  
  // Sincronización para código legado
  S.groupConfigs = S.periodGroupConfigs[periodId];
  S.notas = S.notasByPeriod[periodId];
}

/**
 * Reconstruye ayudantes académicos y jerarquías (grados -> secciones -> estudiantes).
 * Útil tras una hidratación masiva o cambio de contexto.
 */
export function rebuildAcademicHelpers() {
  if (!Array.isArray(S.grades)) S.grades = [];
  if (!Array.isArray(S.secciones)) S.secciones = [];
  if (!Array.isArray(S.estudiantes)) S.estudiantes = [];
  
  S.grades.forEach((grade) => {
    grade.sections = [];
    grade.gradeLevel = grade.gradeLevel || parseGradeLevel(grade.name);
  });
  
  S.secciones.forEach((section) => {
    const grade = S.grades.find((entry) => entry.id === section.gradeId);
    section.grado = section.grado || grade?.name || '';
    section.gradeLevel = section.gradeLevel || grade?.gradeLevel || parseGradeLevel(section.grado || '');
    section.sectionLetter = section.sectionLetter || parseSection(section.sec || '');
    if (grade) {
      if (!grade.sections.find((entry) => entry.id === section.id)) {
        grade.sections.push({
          id: section.id,
          name: section.sec,
          sectionLetter: section.sectionLetter,
          materia: section.materia,
          area: section.area,
          room: section.room || '',
        });
      }
    }
  });

  S.estudiantes.forEach((student) => {
    const sectionId = student.courseId || student.sectionId || student.seccionId || '';
    const section = S.secciones.find((entry) => entry.id === sectionId);
    student.courseId = sectionId;
    student.sectionId = sectionId;
    student.seccionId = sectionId;
    student.gradeId = student.gradeId || section?.gradeId || null;
    student.gradeLevel = student.gradeLevel || section?.gradeLevel || parseGradeLevel(section?.grado || '');
  });
  
  ensureStudentDirectory();
}

/**
 * Asegura la integridad del directorio de estudiantes (caché plana).
 * @returns {boolean} True si el tamaño del directorio cambió.
 */
export function ensureStudentDirectory() {
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const before = S.studentDirectory.length;
  S.studentDirectory = JSON.parse(JSON.stringify(S.estudiantes || []));
  return S.studentDirectory.length !== before;
}

/**
 * Devuelve las secciones activas filtradas por el contexto de seguridad/alcance.
 * @returns {Array} Lista de secciones.
 */
export function getScopedSections() {
  return Array.isArray(S.secciones) ? S.secciones : [];
}

/**
 * Asegura que el grado y grupo activo sean válidos y coherentes.
 * Útil para prevenir estados inconsistentes tras borrar datos.
 */
export function ensureActiveContext() {
  const scopedSections = getScopedSections();
  const sortedGrades = [...S.grades].sort((a,b)=> (a.gradeLevel||0) - (b.gradeLevel||0));
  
  if (S.activeGradeId && !sortedGrades.some(g=>g.id===S.activeGradeId)) S.activeGradeId = null;
  if (!S.activeGradeId) S.activeGradeId = sortedGrades[0]?.id || null;

  const sectionsInActiveGrade = sortCourses(scopedSections.filter(s=>s.gradeId===S.activeGradeId));
  let nextSectionId = null;
  
  if (S.activeGroupId && scopedSections.some(s=>s.id===S.activeGroupId && s.gradeId===S.activeGradeId)) {
    nextSectionId = S.activeGroupId;
  } else {
    nextSectionId = sectionsInActiveGrade[0]?.id || null;
  }

  S.activeGroupId = nextSectionId;
  S.activeCourseId = nextSectionId;
}

/**
 * Devuelve la lista de grupos (secciones con metadatos de grado) para UI.
 * @returns {Array} Lista de grupos amigables.
 */
export function getGroups() {
  const gradeById = new Map(S.grades.map((grade) => [grade.id, grade]));
  return sortCourses(getScopedSections().map(sec => {
    const gr = gradeById.get(sec.gradeId);
    return {
      id:sec.id, gradeId:sec.gradeId, gradeName:gr?.name||sec.grado||'', sectionName:sec.sec, materia:sec.materia || 'General',
      gradeLevel: sec.gradeLevel || gr?.gradeLevel || parseGradeLevel(gr?.name||sec.grado),
      sectionLetter: sec.sectionLetter || parseSection(sec.sec)
    };
  }));
}

/**
 * Devuelve una etiqueta amigable que combina Grado, Sección y Materia.
 * @param {string} groupId - ID de la sección.
 * @returns {string} Etiqueta tipo "6to A - Matemática".
 */
export function getGroupLabel(groupId) {
  const g = getGroups().find(x=>x.id===groupId);
  return g ? `${g.gradeName} ${g.sectionName} \u2014 ${g.materia||'General'}` : '?';
}

/**
 * Valida y repara la integridad de los datos de estudiantes y evaluaciones (relaciones rotas).
 */
export function validateAndRepairData() {
  const sectionById = new Map((S.secciones || []).map(s => [s.id, s]));
  const sectionByKey = new Map();
  (S.secciones || []).forEach(sec => {
    const key = `${normTxt(sec.grado)}|${parseSection(sec.sec)}`;
    if (!sectionByKey.has(key)) sectionByKey.set(key, sec);
  });

  let repaired = 0;
  let unassigned = 0;
  (S.estudiantes || []).forEach(st => {
    const current = st.courseId || st.sectionId || st.seccionId;
    if (current && sectionById.has(current)) {
      st.courseId = current;
      st.sectionId = current;
      st.seccionId = current;
      const sec = sectionById.get(current);
      st.gradeId = sec?.gradeId || st.gradeId || null;
      return;
    }

    // try to reassign by grade + section hints
    const secLetter = parseSection(st.sectionLetter || st.sec || '');
    const gradeLabel = st.grado || st.gradeName || '';
    const key = `${normTxt(gradeLabel)}|${secLetter}`;
    let target = sectionByKey.get(key);

    // fallback by old seccionId/sectionId if still valid
    if (!target) {
      const fallback = st.seccionId || st.sectionId;
      if (fallback && sectionById.has(fallback)) target = sectionById.get(fallback);
    }

    if (target) {
      st.courseId = target.id;
      st.sectionId = target.id;
      st.seccionId = target.id;
      st.gradeId = target.gradeId || st.gradeId || null;
      repaired++;
    } else {
      st.courseId = null;
      if (!sectionById.has(st.sectionId)) st.sectionId = null;
      if (!sectionById.has(st.seccionId)) st.seccionId = null;
      unassigned++;
    }
  });

  (S.evaluations || []).forEach(ev => {
    if (!ev.groupId) {
      const st = S.estudiantes.find(s => s.id === ev.studentId);
      ev.groupId = st?.courseId || st?.sectionId || st?.seccionId || null;
    }
  });

  if (repaired || unassigned) {
    console.debug('[EduGest][repair]', { repairedStudents: repaired, unassignedStudents: unassigned });
  }
}

/**
 * Normaliza un nombre de grado a una clave técnica de currículo (ej: '1ro' -> '1_SEC').
 * @param {string} value - Nombre del grado.
 * @returns {string} Clave técnica del currículo.
 */
export function curriculumNormalizeGradeKey(value = '') {
  const clean = String(value || '').trim();
  if (!clean) return '';
  const rank = parseInt(clean, 10) || parseGradeLevel(clean);
  if (rank >= 1 && rank <= 6) return SECONDARY_CURRICULUM_GRADE_KEYS[rank - 1];
  return '';
}

/**
 * Normaliza múltiples nombres de grados a claves técnicas.
 * @param {string|string[]} values - Nombres de grados.
 * @returns {string[]} Claves técnicas únicas.
 */
export function curriculumNormalizeGradeKeys(values = []) {
  return [...new Set((Array.isArray(values) ? values : [values]).map((item) => curriculumNormalizeGradeKey(item)).filter(Boolean))];
}

/**
 * Corrige fallos de codificación (UTF-8/Windows-1252) en textos comunes del currículo dominicano.
 * @param {string} value - Texto con posible corrupción.
 * @returns {string} Texto reparado.
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
 * Recupera el catálogo de competencias específicas para un grado y área.
 * @param {string} gradeLabel - Nombre del grado.
 * @param {string} areaLabel - Nombre del área curricular.
 * @returns {Object} Diccionario de competencias.
 */
export function curriculumSpecificCompetencyCatalog(gradeLabel, areaLabel) {
  const cleanLevel = 'Secundaria';
  const gradeKey = curriculumNormalizeGradeKey(gradeLabel);
  const area = (areaLabel || 'General').trim();

  const registry = Catalog.OFFICIAL_CURRICULUM_SPECIFIC_COMPETENCY_REGISTRY[cleanLevel] || {};
  const gradeEntry = registry[gradeKey] || {};
  const areaEntry = gradeEntry[area] || gradeEntry['General'] || {};

  // If no entry, try to find in blocks
  if (Object.keys(areaEntry).length === 0) {
    const block = Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS.find(b =>
      b.area === area && b.gradeKeys.includes(gradeKey)
    );
    if (block) return block.competencies;
  }

  return areaEntry;
}

/**
 * Busca la descripción de una competencia específica en los catálogos oficiales.
 * @param {string} gradeLabel - Nombre del grado.
 * @param {string} areaLabel - Nombre del área curricular.
 * @param {string} competencyName - Nombre o fragmento de la competencia.
 * @returns {string} La descripción extendida.
 */
export function curriculumSpecificCompetencyLookup(gradeLabel, areaLabel, competencyName) {
  const catalog = curriculumSpecificCompetencyCatalog(gradeLabel, areaLabel);
  const normalizedMatch = Object.keys(catalog).find(k => k.toLowerCase().includes((competencyName || '').toLowerCase()));
  return catalog[normalizedMatch || competencyName] || (Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS[areaLabel] || Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS.General)[competencyName] || '';
}

/**
 * Devuelve el contexto curricular (conceptuales/procedimentales) para un grado.
 * @param {string} gradeLabel - Nombre del grado.
 * @returns {Object} {gradeKey, conceptual, procedural}
 */
export function curriculumGradeContext(gradeLabel) {
  const gradeKey = curriculumNormalizeGradeKey(gradeLabel);
  return {
    gradeKey,
    conceptual: Catalog.LESSON_PLAN_CONCEPTUAL_CATALOG['Lengua Española']?.[gradeKey] || [],
    procedural: Catalog.LESSON_PLAN_PROCEDURAL_CATALOG['Lengua Española']?.[gradeKey] || [],
  };
}

// --- Academic Calculations ---

/**
 * Redondea un número a 2 decimales de forma segura.
 * @param {number} n - Número a redondear.
 * @returns {number} Número redondeado.
 */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Parsea un input (con soporte para coma decimal) a un número flotante.
 * @param {any} val - Valor a parsear.
 * @param {number} [fallback=0] - Valor por defecto si falla el parseo.
 * @returns {number} El número parseado.
 */
export function parseDecimalInput(val, fallback = 0) {
  const n = Number(String(val ?? '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Formatea un número eliminando decimales innecesarios (ej: 10.00 -> 10).
 * @param {number} n - Número a formatear.
 * @returns {string} String formateado.
 */
export function fmtNum(n) {
  const v = round2(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
}

/**
 * Mapea una calificación de instrumento (sobre X) a una calificación de actividad (sobre Y).
 * @param {number} totalScore - Puntos obtenidos en el instrumento.
 * @param {number} maxScore - Puntos máximos del instrumento.
 * @param {number} activityMax - Puntos máximos de la actividad en el sistema.
 * @returns {number} Score mapeado.
 */
export function mapEvaluationToActivityScore(totalScore, maxScore, activityMax) {
  if (!maxScore || maxScore <= 0) return 0;
  if (maxScore === activityMax) return totalScore;
  return round2((totalScore / maxScore) * activityMax);
}

/**
 * Sugiere un tipo de instrumento basado en metadatos de la actividad (IA heurística).
 * @param {Object} meta - Metadatos de la actividad.
 * @returns {string} Tipo de instrumento sugerido.
 */
export function suggestInstrumentForActivity(meta) {
  const txt = `${meta.name||''} ${meta.descripcion||''} ${meta.producto||''} ${meta.tipo||''}`.toLowerCase();
  if (txt.includes('exposición') || txt.includes('oral')) return 'rubrica_analitica';
  if (txt.includes('informe') || txt.includes('redacción') || txt.includes('escrito')) return 'rubrica_analitica';
  if (txt.includes('experimento') || txt.includes('laboratorio')) return 'lista_cotejo_b';
  if (txt.includes('participación') || txt.includes('observable') || txt.includes('práctica en aula')) return 'lista_cotejo_a';
  return 'escala_estimativa';
}

/**
 * Devuelve la calificación literal (A, B, C, D) para una nota numérica.
 * @param {number} n - Nota numérica.
 * @returns {Object} { l: literal, c: class }
 */
export function getGrade(n) {
  if (n === null) return { l: '?', c: '' };
  if (n >= 90) return { l: 'A', c: 'gA' };
  if (n >= 75) return { l: 'B', c: 'gB' };
  if (n >= 60) return { l: 'C', c: 'gC' };
  return { l: 'D', c: 'gD' };
}

/**
 * Devuelve una clase de color descriptiva según el desempeño.
 * @param {number} raw - Nota actual.
 * @param {number} max - Nota máxima.
 * @returns {string} Clase (h, o, w, d).
 */
export function scoreClass(raw, max) {
  if (!raw && raw !== 0) return '';
  const r = raw / max;
  if (r >= .9) return 'h';
  if (r >= .75) return 'o';
  if (r >= .6) return 'w';
  return 'd';
}

/**
 * Calcula los puntos máximos totales configurados para un bloque en un grupo.
 * @param {string} b - ID del bloque (B1..B4).
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number} Total de puntos.
 */
export function blockRawMax(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  if (typeof window.getGroupCfg !== 'function') return 0;
  return (window.getGroupCfg(groupId, periodId)[b]?.activities || []).reduce((s, a) => s + (parseDecimalInput(a.pts, 0)), 0);
}

/**
 * Devuelve el porcentaje de peso meta para un bloque.
 * @param {string} b - ID del bloque.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number} Peso meta (ej: 25).
 */
export function blockMeta(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  if (typeof window.getGroupCfg !== 'function') return 100;
  return window.getGroupCfg(groupId, periodId)[b]?.meta || 100;
}

/**
 * Indica si un bloque debe ser normalizado a su peso meta.
 * @param {string} b - ID del bloque.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {boolean} True si normaliza.
 */
export function doNormalize(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  if (typeof window.getGroupCfg !== 'function') return true;
  return window.getGroupCfg(groupId, periodId)[b]?.normalize !== false;
}

/**
 * Devuelve el mapa de notas para un periodo específico.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {Object} Mapa de notas.
 */
export function notasMap(periodId = S.activePeriodId) {
  if (typeof window.ensurePeriodBuckets === 'function') window.ensurePeriodBuckets(periodId);
  return S.notasByPeriod[periodId] || {};
}

/**
 * Calcula los puntos acumulados (sin normalizar) de un estudiante en un bloque.
 * @param {string} estId - ID del estudiante.
 * @param {string} b - ID del bloque.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number} Puntos acumulados.
 */
export function studentBlockRaw(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  if (typeof window.getGroupCfg !== 'function') return 0;
  const cfg = window.getGroupCfg(groupId, periodId)[b];
  const nmap = notasMap(periodId);
  return cfg.activities.reduce((s, a) => s + ((nmap[estId] || {})[a.id] || 0), 0);
}

/**
 * Calcula la calificación final de un estudiante en un bloque (opcionalmente normalizada).
 * @param {string} estId - ID del estudiante.
 * @param {string} b - ID del bloque.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number} Calificación del bloque (0-100).
 */
export function studentBlockScore(estId, b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const raw = studentBlockRaw(estId, b, groupId, periodId);
  const rawMax = blockRawMax(b, groupId, periodId);
  const meta = blockMeta(b, groupId, periodId);
  if (rawMax === 0) return 0;
  return doNormalize(b, groupId, periodId) ? Math.round(raw / rawMax * meta) : raw;
}

/**
 * Calcula la calificación final del periodo para un estudiante.
 * @param {string} estId - ID del estudiante.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number|null} Nota final del periodo.
 */
export function studentFinal(estId, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  if (typeof window.getGroupCfg !== 'function') return null;
  const cfg = window.getGroupCfg(groupId, periodId);
  if (BLOCKS.every(b => (cfg[b]?.activities?.length || 0) === 0)) return null;
  const totalMeta = BLOCKS.reduce((s, b) => s + blockMeta(b, groupId, periodId), 0);
  if (totalMeta === 0) return null;
  const weighted = BLOCKS.reduce((s, b) => s + studentBlockScore(estId, b, groupId, periodId) * blockMeta(b, groupId, periodId), 0);
  return Math.round(weighted / totalMeta);
}

/**
 * Calcula el promedio anual de un estudiante para un bloque específico (promedio de periodos).
 * @param {string} estId - ID del estudiante.
 * @param {string} b - ID del bloque.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @returns {number|null} Promedio anual del bloque.
 */
export function studentAnnualBlockAverage(estId, b, groupId = S.activeGroupId) {
  const periodIds = ['P1', 'P2', 'P3', 'P4']; // Simplified, or use academicCalendarPeriods if available
  const scores = periodIds
    .map((periodId) => {
      if (typeof window.getGroupCfg !== 'function') return null;
      const cfg = window.getGroupCfg(groupId, periodId)[b];
      return (cfg?.activities?.length || 0) ? studentBlockScore(estId, b, groupId, periodId) : null;
    })
    .filter((value) => value !== null);
  return scores.length ? round2(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
}

/**
 * Calcula la nota final anual de un estudiante (completivo/final).
 * @param {string} estId - ID del estudiante.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @returns {number|null} Nota promedio anual.
 */
export function studentAnnualFinal(estId, groupId = S.activeGroupId) {
  const blockScores = BLOCKS
    .map((blockId) => studentAnnualBlockAverage(estId, blockId, groupId))
    .filter((value) => value !== null);
  return blockScores.length ? round2(blockScores.reduce((sum, value) => sum + value, 0) / blockScores.length) : null;
}

/**
 * Calcula el promedio grupal para un bloque.
 * @param {string} b - ID del bloque.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number|null} Nota promedio del grupo.
 */
export function globalBlockAvg(b, groupId = S.activeGroupId, periodId = S.activePeriodId) {
  if (typeof window.studentsInGroup !== 'function') return null;
  const ests = window.studentsInGroup(groupId);
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentBlockScore(e.id, b, groupId, periodId));
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

/**
 * Calcula el promedio grupal final del periodo.
 * @param {string} [groupId=S.activeGroupId] - ID de la sección.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo.
 * @returns {number|null} Nota promedio final.
 */
export function globalAvg(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  if (typeof window.studentsInGroup !== 'function') return null;
  const ests = window.studentsInGroup(groupId);
  if (ests.length === 0) return null;
  const scores = ests.map(e => studentFinal(e.id, groupId, periodId)).filter(v => v !== null);
  return scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
}

/**
 * Extrae el ID de grupo almacenado en una planificaci&oacute;n.
 * @param {Object} plan - Objeto de la planificación.
 * @returns {string} ID del grupo.
 */
export function lessonPlanStoredGroupId(plan) {
  return plan?.groupId || plan?.general?.groupId || plan?.general?.sectionId || '';
}

/**
 * Extrae el ID de periodo almacenado o el activo por defecto.
 * @param {Object} plan - Objeto de la planificación.
 * @returns {string} ID del periodo.
 */
export function lessonPlanStoredPeriodId(plan) {
  return plan?.periodId || plan?.general?.periodId || S.activePeriodId || 'P1';
}

/**
 * Devuelve el nombre del docente actual.
 * @returns {string} Nombre completo.
 */
export function lessonPlanTeacherName() {
  return String(S.profile?.name || S.sessionUserName || '').trim();
}

/**
 * Devuelve el nombre de la institución.
 * @returns {string} Nombre del centro educativo.
 */
export function lessonPlanInstitutionName() {
  return String(S.profile?.inst || '').trim();
}

/**
 * Devuelve la descripción de un eje transversal basado en su código.
 * @param {string} value - Código del eje.
 * @returns {string} Descripción extendida.
 */
export function lessonPlanTransversalAxisDescription(value) {
  if (typeof window.LESSON_PLAN_TRANSVERSAL_AXES === 'undefined') return '';
  const selected = window.LESSON_PLAN_TRANSVERSAL_AXES.find((item) => item.value === String(value || '').trim());
  return selected?.description || '';
}

/**
 * Genera un texto de ejemplo (placeholder) para una competencia fundamental específica.
 * @param {string} fundamental - Nombre de la competencia fundamental.
 * @returns {string} Texto sugerido tipo "Ej. Describe...".
 */
export function lessonPlanSpecificPlaceholderForFundamental(fundamental) {
  const clean = normTxt(restoreSpanishQuestionCorruption(String(fundamental || '').trim()));
  const map = {
    [normTxt('Competencia comunicativa')]: 'Ej. Expresa ideas de forma clara y argumentada durante el trabajo en clase...',
    [normTxt('Competencia de pensamiento lógico, creativo y crítico')]: 'Ej. Analiza situaciones y propone soluciones con razonamiento lógico...',
    [normTxt('Competencia de resolución de problemas')]: 'Ej. Resuelve situaciones del entorno aplicando estrategias pertinentes...',
    [normTxt('Competencia ética y ciudadana')]: 'Ej. Participa de manera responsable y respetuosa en situaciones de convivencia escolar...',
    [normTxt('Competencia científica y tecnológica')]: 'Ej. Interpreta fenómenos utilizando lenguaje científico y recursos tecnológicos...',
    [normTxt('Competencia ambiental y de la salud')]: 'Ej. Promueve acciones de cuidado ambiental y hábitos saludables en su contexto...',
    [normTxt('Competencia de desarrollo personal y espiritual')]: 'Ej. Demuestra autocontrol, empatía y compromiso con su crecimiento personal...',
  };
  return map[clean] || 'Ej. Describe la competencia específica que desarrollarás en esta clase...';
}

/**
 * Normaliza y limpia textos de competencias específicas (remueve mojibake y espacios extras).
 * @param {string} value - Texto de la competencia.
 * @returns {string} Texto limpio.
 */
export function curriculumNormalizeSpecificCompetencyText(value = '') {
  // fixMojibakeText and normalizeSpanishDraftText are expected to be in global scope or utils
  // For now, using a simplified version if they are not available
  const base = typeof window.fixMojibakeText === 'function' 
    ? window.fixMojibakeText(restoreSpanishQuestionCorruption(value || ''))
    : restoreSpanishQuestionCorruption(value || '');
    
  return base.replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
}

/**
 * Normaliza un objeto completo de fallbacks curriculares.
 * @param {Object} source - Mapa de fallbacks.
 * @returns {Object} Mapa normalizado.
 */
export function curriculumNormalizeSpecificCompetencyFallbacks(source = Catalog.DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS) {
  const result = {};
  Object.entries(source || {}).forEach(([scope, fundamentals]) => {
    const cleanScope = scope.trim();
    if (!cleanScope || !fundamentals || typeof fundamentals !== 'object') return;
    const nextFundamentals = {};
    Object.entries(fundamentals).forEach(([fundamental, values]) => {
      const cleanFundamental = fundamental.trim();
      const cleanValues = [...new Set((Array.isArray(values) ? values : [values])
        .map((item) => curriculumNormalizeSpecificCompetencyText(item))
        .filter(Boolean))];
      if (cleanFundamental && cleanValues.length) nextFundamentals[cleanFundamental] = cleanValues;
    });
    if (Object.keys(nextFundamentals).length) result[cleanScope] = nextFundamentals;
  });
  return result;
}

/**
 * Normaliza el nombre de un nivel educativo a su valor oficial.
 * @param {string} level - Valor crudo del nivel.
 * @returns {string} 'Inicial', 'Primaria' o 'Secundaria'.
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
 * @param {string} section - Nombre de la sección.
 * @returns {string} Sección válida o vacío.
 */
export function normalizeEducationSection(section) {
  if (!String(section || '').trim()) return '';
  const normalized = normalizeEducationLevelName(section);
  return EDUCATION_SECTIONS.includes(normalized) ? normalized : '';
}

/**
 * Convierte un set de niveles (array o string separado por comas) en una lista normalizada única.
 * @param {any} value - Valores crudos.
 * @returns {string[]} Lista única (máx 3).
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
 * Construye una clave única para una combinación de 2 niveles educativos (ej: 'Primaria+Secundaria').
 * @param {string[]} [sections=[]] - Lista de secciones.
 * @returns {string} Clave combinada o vacío.
 */
export function buildEducationSectionCombinationKey(sections = []) {
  const normalized = normalizeEducationSections(sections);
  if (normalized.length !== 2) return '';
  return [...normalized].sort((a, b) => EDUCATION_SECTIONS.indexOf(a) - EDUCATION_SECTIONS.indexOf(b)).join('+');
}

/**
 * Resuelve la clase de tema CSS basada en la sección o secciones dadas.
 * @param {string|string[]} [sectionOrSections=''] - Secciones.
 * @returns {string} Clase de tema CSS.
 */
export function resolveEducationThemeClass(sectionOrSections = '') {
  const sections = normalizeEducationSections(sectionOrSections);
  const comboKey = buildEducationSectionCombinationKey(sections);
  if (comboKey && EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey]) return EDUCATION_THEME_CLASS_BY_COMBINATION[comboKey];
  const primary = sections[0] || '';
  return primary ? (EDUCATION_THEME_CLASS_BY_SECTION[primary] || '') : '';
}

/**
 * Obtiene las secciones educativas activas del perfil del usuario.
 * @returns {string[]} Lista de secciones activas.
 */
export function getActiveEducationSections() {
  const sections = normalizeEducationSections(S.profile?.educationSections || []);
  if (sections.length) return sections;
  const fallback = normalizeEducationSection(S.profile?.educationSection || '');
  return fallback ? [fallback] : [];
}

/**
 * Resuelve la sección o secciones para el tema actual.
 * @returns {string[]} Secciones activas.
 */
export function resolveEducationThemeSection() {
  // Simplification, removing SETUP_FLOW dependency if not in modular state
  return getActiveEducationSections();
}

/**
 * Aplica el tema CSS de la sección educativa al body del documento.
 * @param {string} [section=''] - Sección específica o auto-resolución.
 */
export function applyEducationSectionTheme(section = '') {
  const body = document.body;
  if (!body) return;
  Object.values(EDUCATION_THEME_CLASS_BY_SECTION).forEach((cls) => body.classList.remove(cls));
  Object.values(EDUCATION_THEME_CLASS_BY_COMBINATION).forEach((cls) => body.classList.remove(cls));
  const target = section || resolveEducationThemeSection();
  const themeClass = resolveEducationThemeClass(target);
  if (themeClass) body.classList.add(themeClass);
}

/**
 * Indica si el sistema debe filtrar (scoping) por sección educativa actual.
 * @returns {boolean} True si hay secciones activas configuradas.
 */
export function shouldScopeByEducationSection() {
  return getActiveEducationSections().length > 0;
}

/**
 * Verifica si un nivel educativo coincide con alguna de las secciones activas.
 * @param {string} level - Nivel a verificar.
 * @returns {boolean} True si coincide o si no hay filtrado activo.
 */
export function matchesActiveEducationSection(level) {
  if (!shouldScopeByEducationSection()) return true;
  const activeSections = getActiveEducationSections();
  const normalizedLevel = normTxt(normalizeEducationLevelName(level));
  return activeSections.some((section) => normTxt(section) === normalizedLevel);
}

/**
 * Devuelve la lista de grados filtrada por el alcance educativo activo.
 * @returns {Array} Grados visibles.
 */
export function getScopedGrades() {
  const allGrades = Array.isArray(S.grades) ? S.grades : [];
  if (!shouldScopeByEducationSection()) return allGrades;
  return allGrades.filter((grade) => matchesActiveEducationSection(grade?.educationLevel || ''));
}

// getScopedSections is already exported earlier in DomainUtils, let's update it if needed or just use current

/**
 * Devuelve la lista de estudiantes filtrada por el alcance educativo activo (según su sección).
 * @returns {Array} Estudiantes visibles.
 */
export function getScopedStudents() {
  const allStudents = Array.isArray(S.estudiantes) ? S.estudiantes : [];
  if (!shouldScopeByEducationSection()) return allStudents;
  const scopedSectionIds = new Set(getScopedSections().map((section) => section.id));
  return allStudents.filter((student) => {
    const sectionId = student.sectionId || student.seccionId || student.courseId;
    return scopedSectionIds.has(sectionId);
  });
}

/**
 * Devuelve la sección educativa primaria (la primera activa).
 * @returns {string} Sección primaria.
 */
export function getActiveEducationSection() {
  return getActiveEducationSections()[0] || '';
}

// --- SQL Mappings ---

/**
 * Mapea un grado al payload requerido por la DB (SQL).
 * @param {Object} grade - Objeto del grado.
 * @param {string} schoolId - ID de la escuela.
 * @returns {Object} Payload SQL.
 */
export function mapGradeToSqlPayload(grade, schoolId) {
  return {
    schoolId,
    educationLevel: String(grade?.educationLevel || 'Primaria').trim() || 'Primaria',
    name: String(grade?.name || '').trim(),
    ordinal: Number.isFinite(Number(grade?.gradeLevel)) ? Number(grade.gradeLevel) : Number.isFinite(Number(grade?.ordinal)) ? Number(grade.ordinal) : null,
  };
}

/**
 * Mapea una sección al payload requerido por la DB (SQL).
 * @param {Object} section - Objeto de la sección.
 * @param {string} schoolId - ID de la escuela.
 * @param {string} gradeId - ID del grado padre.
 * @returns {Object} Payload SQL.
 */
export function mapSectionToSqlPayload(section, schoolId, gradeId) {
  return {
    schoolId,
    gradeId,
    name: String(section?.sec || section?.name || '').trim(),
    subjectArea: String(section?.area || '').trim() || null,
    subjectName: String(section?.materia || '').trim() || null,
    teacherUserId: String(section?.teacherUserId || S.sessionUserId || '').trim() || null,
  };
}

/**
 * Mapea un estudiante al payload requerido por la DB (SQL).
 * @param {Object} student - Objeto del estudiante.
 * @param {string} schoolId - ID de la escuela.
 * @param {string} gradeId - ID del grado.
 * @param {string} sectionId - ID de la sección.
 * @returns {Object} Payload SQL.
 */
export function mapStudentToSqlPayload(student, schoolId, gradeId, sectionId) {
  return {
    schoolId,
    gradeId,
    sectionId,
    enrollmentCode: String(student?.matricula || '').trim() || null,
    firstName: String(student?.nombre || '').trim(),
    lastName: String(student?.apellido || '').trim(),
    middleName: String(student?.middleName || '').trim() || null,
    birthDate: String(student?.birthDate || '').trim() || null,
    status: String(student?.status || 'active').trim() || 'active',
  };
}

/**
 * Mapea una actividad al payload requerido por la DB (SQL).
 * @param {Object} activity - Objeto de la actividad.
 * @param {Object} meta - Metadatos adicionales (schoolId, sectionId, etc).
 * @returns {Object} Payload SQL.
 */
export function mapActivityToSqlPayload(activity, meta = {}) {
  return {
    schoolId: String(meta.schoolId || '').trim(),
    sectionId: String(meta.sectionId || activity?.courseId || '').trim(),
    teacherUserId: String(meta.teacherUserId || '').trim() || null,
    periodId: String(meta.periodId || activity?.periodId || 'P1').trim() || 'P1',
    blockKey: String(meta.blockKey || '').trim() || null,
    name: String(activity?.name || '').trim(),
    description: String(activity?.desc || activity?.description || '').trim() || null,
    points: Number.isFinite(Number(activity?.pts)) ? Number(activity.pts) : 0,
    activityType: String(activity?.tipo || activity?.activityType || '').trim() || null,
    scheduledDate: String(activity?.fecha || activity?.scheduledDate || '').trim() || null,
  };
}

/**
 * Normaliza el porcentaje de puntuación para una evaluación SQL.
 * @param {Object} evaluation - Evaluación.
 * @param {Object} [activity=null] - Actividad asociada.
 * @returns {number|null} Porcentaje (0-100).
 */
export function normalizeSqlEvaluationScorePercent(evaluation, activity = null) {
  const explicit = Number(evaluation?.scorePercent ?? evaluation?.score_percent);
  if (Number.isFinite(explicit)) return explicit;
  const score = Number(evaluation?.activityScore ?? evaluation?.score ?? 0);
  const max = Number(activity?.pts ?? evaluation?.activityPoints ?? 0);
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null;
  return round2((score / max) * 100);
}

/**
 * Mapea una evaluación al payload requerido por la DB (SQL).
 * @param {Object} evaluation - Evaluación.
 * @param {Object} meta - Metadatos (schoolId, activity, etc).
 * @returns {Object} Payload SQL.
 */
export function mapEvaluationToSqlPayload(evaluation, meta = {}) {
  const activity = meta.activity || null;
  const activityScore = Number(evaluation?.activityScore ?? evaluation?.score ?? 0);
  const activityPoints = Number(activity?.pts ?? evaluation?.activityPoints ?? 0);
  const payload = {
    ...JSON.parse(JSON.stringify(evaluation || {})),
    activityPoints,
    activityScore: Number.isFinite(activityScore) ? activityScore : 0,
  };
  return {
    schoolId: String(meta.schoolId || '').trim(),
    sectionId: String(meta.sectionId || evaluation?.groupId || evaluation?.courseId || '').trim(),
    activityId: String(evaluation?.activityId || '').trim(),
    studentId: String(evaluation?.studentId || '').trim(),
    periodId: String(evaluation?.periodId || 'P1').trim() || 'P1',
    score: Number.isFinite(activityScore) ? activityScore : 0,
    scorePercent: normalizeSqlEvaluationScorePercent(evaluation, activity),
    notes: String(evaluation?.teacherCommentGeneral || evaluation?.notes || '').trim() || null,
    payload,
    evaluatedAt: String(evaluation?.evaluatedAt || evaluation?.timestamp || evaluation?.createdAt || '').trim() || null,
  };
}

// --- Attendance Domain Logic ---

/**
 * Devuelve la lista de meses activos en el calendario académico.
 * @returns {string[]} Lista de códigos de mes ('08', '09'...).
 */
export function academicCalendarActiveMonths() {
  const settings = S.calendarSettings || {};
  return Array.isArray(settings.activeMonths) ? settings.activeMonths : ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
}

/**
 * Verifica si un mes dado (YYYY-MM) es activo académicamente.
 * @param {string} monthKey - Clave del mes.
 * @returns {boolean} True si es activo.
 */
export function isAcademicMonthActive(monthKey) {
  const month = String(monthKey || '').split('-')[1];
  return academicCalendarActiveMonths().includes(month);
}

/**
 * Sugiere el ID de periodo (P1-P4) para un mes dado.
 * @param {string} monthKey - Clave del mes.
 * @returns {string|null} ID del periodo.
 */
export function suggestedAcademicPeriodIdForMonth(monthKey) {
  const month = String(monthKey || '').split('-')[1];
  const map = S.calendarSettings?.periodMonthMap || {
    '08': 'P1', '09': 'P1', '10': 'P1',
    '11': 'P2', '12': 'P2', '01': 'P2',
    '02': 'P3', '03': 'P3', '04': 'P3',
    '05': 'P4', '06': 'P4'
  };
  return map[month] || null;
}

/**
 * Devuelve el nombre amigable de un mes en español.
 * @param {string} monthKey - Clave del mes.
 * @returns {string} Nombre del mes.
 */
export function plannerMonthLabel(monthKey) {
  const month = String(monthKey || '').split('-')[1];
  const names = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };
  return names[month] || month;
}

/**
 * Devuelve la estructura de los periodos académicos.
 * @returns {Array} Lista de periodos.
 */
export function academicCalendarPeriods() {
  return [
    { id: 'P1', name: 'Primer Período' },
    { id: 'P2', name: 'Segundo Período' },
    { id: 'P3', name: 'Tercer Período' },
    { id: 'P4', name: 'Cuarto Período' }
  ];
}

/**
 * Devuelve el nombre del periodo según su ID.
 * @param {string} id - ID del periodo.
 * @returns {string} Nombre amigable.
 */
export function periodName(id) {
  return academicCalendarPeriods().find(p => p.id === id)?.name || id;
}

/**
 * Genera la etiqueta amigable para un grupo de asistencia.
 * @param {Object} group - Grupo.
 * @returns {string} Etiqueta.
 */
export function getAttendanceGroupLabel(group) {
  if (!group) return 'Sin sección';
  return `${group.gradeName || ''} ${group.sectionName || ''} \u2014 ${group.materia || 'General'}`.trim();
}

/**
 * Devuelve la lista de estudiantes filtrada por un grupo específico.
 * @param {string} groupId - ID del grupo.
 * @returns {Array} Estudiantes.
 */
export function studentsInGroup(groupId) {
  if (!groupId) return [];
  return (S.estudiantes || []).filter(s => (s.courseId === groupId || s.sectionId === groupId || s.seccionId === groupId) && s.status !== 'retired');
}

/**
 * Calcula el rango del año escolar actual (ej: {start: 2023, end: 2024}).
 * @returns {Object} Rango de años.
 */
export function getSchoolYearRange() {
  const now = new Date();
  const year = now.getFullYear();
  if (now.getMonth() + 1 >= 8) return { start: year, end: year + 1 };
  return { start: year - 1, end: year };
}

// --- Search & Filtering Helpers ---

/**
 * Normaliza texto para búsqueda (minúsculas, sin acentos).
 * @param {string} [text=''] - Texto a normalizar.
 * @returns {string} Texto normalizado.
 */
export function normalizeCourseSearchText(text = '') {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Busca estudiantes en el alcance actual basándose en una consulta.
 * @param {string} [query=''] - Texto de búsqueda.
 * @returns {Array} Resultados de búsqueda con metadatos.
 */
export function getStudentSearchResults(query = '') {
  const q = normalizeCourseSearchText(query);
  if (!q) return [];
  const results = [];
  const students = getScopedStudents();
  const sections = getScopedSections();
  const grades = S.grades || [];

  students.forEach(st => {
    const fullName = `${st.nombre || ''} ${st.apellido || ''}`;
    const normName = normalizeCourseSearchText(fullName);
    const normMat = normalizeCourseSearchText(st.matricula || '');
    
    if (normName.includes(q) || normMat.includes(q)) {
      const sec = sections.find(s => s.id === (st.courseId || st.sectionId || st.seccionId));
      const gr = grades.find(g => g.id === (sec?.gradeId || st.gradeId));
      results.push({
        id: st.id,
        fullName,
        matricula: st.matricula || '?',
        gradeLabel: gr?.name || '?',
        sectionLabel: sec?.sec || '?',
        educationLevelLabel: gr?.educationLevel || '',
        subjectLabels: sec?.materia ? [sec.materia] : [],
        final: studentFinal(st.id, sec?.id)
      });
    }
  });
  return results;
}

// --- Group Configuration Helpers ---

export function getGroupCfg(groupId, periodId = S.activePeriodId) {
  if (!groupId) return emptyGroupCfg();
  if (!S.periodGroupConfigs) S.periodGroupConfigs = {};
  if (!S.periodGroupConfigs[periodId]) S.periodGroupConfigs[periodId] = {};
  if (!S.periodGroupConfigs[periodId][groupId]) {
    S.periodGroupConfigs[periodId][groupId] = emptyGroupCfg();
  }
  return S.periodGroupConfigs[periodId][groupId];
}

export function emptyBlockCfg() {
  return { activities: [], meta: 100, normalize: true };
}

export function emptyGroupCfg() {
  return {
    B1: emptyBlockCfg(),
    B2: emptyBlockCfg(),
    B3: emptyBlockCfg(),
    B4: emptyBlockCfg(),
  };
}

/**
 * Core Planning Domain Logic
 * --------------------------------------------------------------------------
 */

// Crea una planificación general nueva usando el grupo y período activos como contexto inicial.
export function lessonPlanCreateGeneral(groupId = window.S.activeGroupId, periodId = window.S.activePeriodId) {
  const group = (window.S.secciones || []).find((item) => item.id === groupId) || null;
  const grade = (window.S.grades || []).find((item) => item.id === group?.gradeId) || null;
  
  return {
    center: lessonPlanInstitutionName(),
    teacher: lessonPlanTeacherName(),
    area: lessonPlanAreaFromGroup(group),
    subject: group?.materia || '',
    subarea: group?.materia || '',
    usesTemporaryGrade: false,
    gradeId: group?.gradeId || '',
    gradeName: lessonPlanFullGradeName(group, grade),
    sectionId: groupId || '',
    sectionName: group?.sec || '',
    groupId: groupId || '',
    periodId: periodId || window.S.activePeriodId || 'P1',
    themeTitle: '',
    sequenceName: '',
    title: '',
    transversalAxis: '',
    classDate: '',
    scheduleLinked: false,
    totalDuration: '',
    classCount: 1,
    startDate: '',
    endDate: '',
  };
}

// Crea una planificación vacía lista para editarse desde cero.
export function lessonPlanCreateBlank(groupId = window.S.activeGroupId, periodId = window.S.activePeriodId) {
  const now = Date.now();
  return {
    id: uid(),
    version: 2,
    status: 'draft',
    editorStep: 'general',
    groupId: groupId || '',
    periodId: periodId || window.S.activePeriodId || 'P1',
    createdAt: now,
    updatedAt: now,
    general: lessonPlanCreateGeneral(groupId, periodId),
    curriculum: {
      fundamentalCompetencies: '',
      specificCompetencies: '',
      specificCompetencyMap: {},
      specificCompetencyModeMap: {},
      conceptualMeta: {
        topic: '',
        subtopics: [],
        notesByTopic: {},
      },
      conceptualContents: '',
      proceduralMeta: {
        topic: '',
        subtopics: [],
        itemIds: [],
        manualReviewRequired: false,
      },
      proceduralItemMap: {},
      proceduralContents: '',
      attitudinalMeta: {
        topic: '',
        subtopics: [],
        itemIds: [],
        manualReviewRequired: false,
      },
      attitudinalItemMap: {},
      attitudinalContents: '',
      indicatorMeta: {
        topic: '',
        subtopics: [],
        itemIds: [],
        manualReviewRequired: false,
      },
      indicatorItemMap: {},
      indicators: '',
    },
    strategy: {
      teachingLearning: '',
      methodology: '',
      organization: '',
      inclusionNotes: '',
    },
    resources: {
      preset: [],
      notes: '',
    },
    classes: [lessonPlanCreateClass(1)],
    exportMeta: {
      template: 'structured',
      futureAiReady: true,
      curriculumSource: 'manual',
    },
  };
}

// Normaliza una referencia a actividad para que la planificación conserve vínculos consistentes.
export function lessonPlanNormalizeActivityLink(link) {
  const base = link && typeof link === 'object' ? link : {};
  return {
    activityId: String(base.activityId || '').trim(),
    blockId: (window.S.BLOCKS || ['B1', 'B2', 'B3', 'B4']).includes(base.blockId) ? base.blockId : 'B1',
    instrumentId: String(base.instrumentId || '').trim(),
    evidence: String(base.evidence || '').trim(),
    technique: String(base.technique || '').trim(),
  };
}

// Limpia y normaliza una clase del plan para que siempre tenga campos coherentes.
export function lessonPlanNormalizeClass(rawClass, index = 1) {
  const base = rawClass && typeof rawClass === 'object' ? rawClass : {};
  const durationHours = String(base.durationHours || '').trim() || '1';
  return lessonPlanCreateClass(index, {
    ...base,
    id: base.id || uid(),
    index,
    title: String(base.title || base.topic || '').trim(),
    date: String(base.date || '').trim(),
    durationHours,
    durationMinutes: String(base.durationMinutes || base.duration || (durationHours + 'h')).trim(),
    pedagogicalIntent: String(base.pedagogicalIntent || base.intent || '').trim(),
    notes: String(base.notes || '').trim(),
    resourcesPreset: Array.isArray(base.resourcesPreset) ? base.resourcesPreset.map((item) => String(item || '').trim()).filter(Boolean) : [],
    resourcesText: String(base.resourcesText || '').trim(),
    activityLinks: Array.isArray(base.activityLinks) ? base.activityLinks.map(lessonPlanNormalizeActivityLink).filter((item) => item.activityId) : [],
    start: base.start || {},
    development: base.development || {},
    closure: base.closure || {},
    adaptation: base.adaptation || {},
  });
}

// Normaliza una planificación completa y reconstruye la estructura esperada por el editor.
export function lessonPlanNormalizePlan(plan) {
  const base = plan && typeof plan === 'object' ? plan : {};
  if (!base.general && (base.title || base.date || base.contents || base.activities)) {
    const legacy = lessonPlanCreateBlank(base.groupId || '', base.periodId || window.S.activePeriodId || 'P1');
    legacy.id = base.id || legacy.id;
    legacy.createdAt = Number.isFinite(base.createdAt) ? base.createdAt : legacy.createdAt;
    legacy.updatedAt = Number.isFinite(base.updatedAt) ? base.updatedAt : legacy.updatedAt;
    legacy.general.title = String(base.title || '').trim();
    legacy.general.startDate = String(base.date || '').trim();
    legacy.general.endDate = String(base.date || '').trim();
    legacy.resources.notes = String(base.resources || '').trim();
    legacy.curriculum.conceptualContents = String(base.contents || '').trim();
    legacy.curriculum.indicators = String(base.evidences || '').trim();
    legacy.strategy.teachingLearning = String(base.purpose || '').trim();
    legacy.classes = [lessonPlanCreateClass(1, {
      date: String(base.date || '').trim(),
      title: String(base.title || '').trim(),
      development: {
        description: String(base.activities || '').trim(),
        activities: String(base.activities || '').trim(),
      },
      closure: { conclusions: String(base.notes || '').trim() },
      resourcesText: String(base.resources || '').trim(),
      notes: String(base.notes || '').trim(),
    })];
    return legacy;
  }
  
  const normalized = lessonPlanCreateBlank(lessonPlanStoredGroupId(base), lessonPlanStoredPeriodId(base));
  normalized.id = base.id || normalized.id;
  normalized.version = 2;
  normalized.status = base.status === 'completed' ? 'completed' : 'draft';
  normalized.editorStep = base.editorStep || 'general';
  normalized.groupId = lessonPlanStoredGroupId(base);
  normalized.periodId = lessonPlanStoredPeriodId(base);
  normalized.createdAt = Number.isFinite(base.createdAt) ? base.createdAt : normalized.createdAt;
  normalized.updatedAt = Number.isFinite(base.updatedAt) ? base.updatedAt : normalized.updatedAt;
  normalized.general = { ...normalized.general, ...(base.general || {}) };
  normalized.general.groupId = normalized.groupId;
  normalized.general.sectionId = normalized.general.sectionId || normalized.groupId;
  normalized.general.periodId = normalized.periodId;
  normalized.general.usesTemporaryGrade = !!normalized.general.usesTemporaryGrade;
  normalized.general.themeTitle = String(normalized.general.themeTitle || normalized.general.title || '').trim();
  normalized.general.title = String(normalized.general.title || normalized.general.themeTitle || '').trim();
  normalized.general.startDate = String(normalized.general.startDate || normalized.general.classDate || '').trim();
  normalized.general.endDate = String(normalized.general.endDate || normalized.general.classDate || '').trim();
  normalized.curriculum = { ...normalized.curriculum, ...(base.curriculum || {}) };
  
  if (!normalized.curriculum.specificCompetencyMap || typeof normalized.curriculum.specificCompetencyMap !== 'object') {
    normalized.curriculum.specificCompetencyMap = {};
  }
  if (!normalized.curriculum.specificCompetencyModeMap || typeof normalized.curriculum.specificCompetencyModeMap !== 'object') {
    normalized.curriculum.specificCompetencyModeMap = {};
  }
  
  normalized.strategy = { ...normalized.strategy, ...(base.strategy || {}) };
  normalized.resources = {
    preset: Array.isArray(base.resources?.preset) ? base.resources.preset.map((item) => String(item || '').trim()).filter(Boolean) : [],
    notes: String(base.resources?.notes || '').trim(),
  };
  normalized.classes = (Array.isArray(base.classes) ? base.classes : []).map((item, idx) => lessonPlanNormalizeClass(item, idx + 1));
  if (!normalized.classes.length) normalized.classes = [lessonPlanCreateClass(1)];
  normalized.exportMeta = { ...normalized.exportMeta, ...(base.exportMeta || {}) };
  
  return normalized;
}

// Decide si una planificación debe conservarse al migrar o limpiar datos viejos.
export function lessonPlanShouldKeep(plan) {
  if (lessonPlanStoredGroupId(plan)) return true;
  const general = plan?.general || {};
  return !!(
    general.usesTemporaryGrade
    || String(general.gradeName || '').trim()
    || String(general.sectionName || '').trim()
    || String(general.subject || '').trim()
    || String(general.themeTitle || general.title || '').trim()
    || String(general.sequenceName || '').trim()
  );
}

// Garantiza que el estado de planificaciones exista y tenga la forma mínima requerida por los paneles.
export function ensureLessonPlansState() {
  const S = window.S;
  if (!Array.isArray(S.lessonPlans)) S.lessonPlans = [];
  S.lessonPlans = S.lessonPlans.map((plan) => lessonPlanNormalizePlan(plan)).filter((plan) => lessonPlanShouldKeep(plan));
  
  if (!S.lessonPlanDraft || typeof S.lessonPlanDraft !== 'object') {
    S.lessonPlanDraft = lessonPlanCreateBlank(S.activeGroupId, S.activePeriodId);
  } else {
    S.lessonPlanDraft = lessonPlanNormalizePlan(S.lessonPlanDraft);
  }
  
  if (!S.lessonPlanUi || typeof S.lessonPlanUi !== 'object') S.lessonPlanUi = {};
  if (!Array.isArray(S.lessonPlanUi.expandedClassIds)) {
    S.lessonPlanUi.expandedClassIds = (S.lessonPlanDraft.classes || []).map((lessonClass) => lessonClass.id);
  }
  if (!S.lessonPlanUi.activityDrafts || typeof S.lessonPlanUi.activityDrafts !== 'object') {
    S.lessonPlanUi.activityDrafts = {};
  }
  
  if (typeof S.lessonPlanUi.activeSectionId !== 'string') S.lessonPlanUi.activeSectionId = '';
  if (typeof S.lessonPlanUi.mode !== 'string') S.lessonPlanUi.mode = 'home';
  if (typeof S.lessonPlanUi.autosaveTimer !== 'number') S.lessonPlanUi.autosaveTimer = 0;
}

// Filtra las planificaciones que pertenecen al grupo activo o al grupo pedido.
export function lessonPlansForGroup(groupId = window.S.activeGroupId) {
  ensureLessonPlansState();
  const S = window.S;
  return (S.lessonPlans || [])
    .filter((plan) => lessonPlanStoredGroupId(plan) === groupId && (!lessonPlanStoredPeriodId(plan) || lessonPlanStoredPeriodId(plan) === S.activePeriodId))
    .sort((a, b) => String(b.general?.classDate || b.general?.startDate || '').localeCompare(String(a.general?.classDate || a.general?.startDate || ''), 'es') || (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

// Devuelve la lista de borradores de planificación disponibles en memoria.
export function lessonPlanDrafts() {
  ensureLessonPlansState();
  const S = window.S;
  return (S.lessonPlans || [])
    .filter((plan) => (plan.status || 'draft') !== 'completed')
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

// Convierte una fecha de actualización en una etiqueta relativa comprensible para el usuario.
export function lessonPlanRelativeUpdatedAt(value) {
  const ts = Number(value || 0);
  if (!ts) return 'Hace un momento';
  const delta = Math.max(0, Date.now() - ts);
  const minute = 60000;
  const hour = minute * 60;
  const day = hour * 24;
  if (delta < minute) return 'Hace unos segundos';
  if (delta < hour) {
    const minutes = Math.max(1, Math.round(delta / minute));
    return `Hace ${minutes} min`;
  }
  if (delta < day) {
    const hours = Math.max(1, Math.round(delta / hour));
    return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  }
  const days = Math.max(1, Math.round(delta / day));
  return `Hace ${days} día${days === 1 ? '' : 's'}`;
}

// Devuelve la etiqueta visible de un bloque curricular
export function lessonPlanBlockLabel(blockId) {
  const labels = { B1: 'Bloque 1', B2: 'Bloque 2', B3: 'Bloque 3', B4: 'Bloque 4' };
  return labels[blockId] || 'Bloque';
}

// Helper for Lesson Plan Draft
export function lessonPlanDraft() {
  ensureLessonPlansState();
  return window.S.lessonPlanDraft;
}

// Persist draft
export function lessonPlanPersistDraftNow(statusOverride = 'draft') {
  const S = window.S;
  if (S.lessonPlanUi?.autosaveTimer) {
    clearTimeout(S.lessonPlanUi.autosaveTimer);
    S.lessonPlanUi.autosaveTimer = 0;
  }
  
  ensureLessonPlansState();
  const draft = lessonPlanNormalizePlan(S.lessonPlanDraft);
  draft.status = statusOverride || draft.status || 'draft';
  draft.updatedAt = Date.now();
  
  const idx = (S.lessonPlans || []).findIndex((item) => item.id === draft.id);
  if (idx >= 0) S.lessonPlans[idx] = draft;
  else S.lessonPlans.unshift(draft);
  
  S.lessonPlanDraft = lessonPlanNormalizePlan(draft);
  if (window.persist) window.persist({ immediate: true });
}

export function lessonPlanInstitutionName() {
  return window.S?.institution?.name || 'Centro Educativo';
}

export function lessonPlanTeacherName() {
  return window.S?.user?.fullName || 'Docente';
}

export function lessonPlanFullGradeName(group, grade) {
  if (grade?.name) return grade.name;
  if (group?.grado) return group.grado;
  return '';
}

export function lessonPlanAvailableGrades() {
  return (window.S?.grades || []).map(g => ({ id: g.id, name: g.name }));
}

export function lessonPlanSectionOptionsForGradeId(gradeId) {
  if (!gradeId) return [];
  return (window.S?.secciones || [])
    .filter(s => s.gradeId === gradeId)
    .map(s => ({ value: s.sec, label: s.sec }));
}

export function lessonPlanSubjectOptionsForGradeId(gradeId) {
  if (!gradeId) return [];
  const subjects = new Set();
  (window.S?.secciones || [])
    .filter(s => s.gradeId === gradeId)
    .forEach(s => { if (s.materia) subjects.add(s.materia); });
  return Array.from(subjects).map(s => ({ value: s, label: s }));
}

export function lessonPlanAreaOptions() {
  return [
    { value: 'Lengua Española', label: 'Lengua Española' },
    { value: 'Matemática', label: 'Matemática' },
    { value: 'Ciencias de la Naturaleza', label: 'Ciencias de la Naturaleza' },
    { value: 'Ciencias Sociales', label: 'Ciencias Sociales' },
    { value: 'Lenguas Extranjeras', label: 'Lenguas Extranjeras' },
    { value: 'Educación Física', label: 'Educación Física' },
    { value: 'Educación Artística', label: 'Educación Artística' },
    { value: 'Formación Integral Humana y Religiosa', label: 'Formación Integral Humana y Religiosa' },
  ];
}

export function lessonPlanTodayIso() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function lessonPlanSuggestedNextClassDate(prevDate = '') {
  const base = prevDate ? new Date(prevDate) : new Date();
  if (isNaN(base.getTime())) return lessonPlanTodayIso();
  // Simple heuristic: next day, skipping weekends if possible (basic)
  base.setDate(base.getDate() + 1);
  if (base.getDay() === 0) base.setDate(base.getDate() + 1);
  if (base.getDay() === 6) base.setDate(base.getDate() + 2);
  return base.toISOString().split('T')[0];
}

export function lessonPlanResolveGroupForSelection(gradeId, sectionName) {
  return (window.S?.secciones || []).find(s => s.gradeId === gradeId && s.sec === sectionName) || null;
}

export function lessonPlanApplyGeneralSelection(draft, selection) {
  const { gradeId, gradeName, sectionName, subject, periodId } = selection;
  const group = lessonPlanResolveGroupForSelection(gradeId, sectionName);
  
  draft.groupId = group?.id || '';
  draft.periodId = periodId || draft.periodId || 'P1';
  
  if (!draft.general) draft.general = lessonPlanCreateGeneral(draft.groupId, draft.periodId);
  draft.general.gradeId = gradeId;
  draft.general.gradeName = gradeName;
  draft.general.sectionId = draft.groupId;
  draft.general.sectionName = sectionName;
  draft.general.subject = subject;
  draft.general.groupId = draft.groupId;
  draft.general.periodId = draft.periodId;
  
  return draft;
}

export function lessonPlanCreateClass(index, base = {}) {
  return {
    id: base.id || uid(),
    index: index || 1,
    title: String(base.title || '').trim(),
    date: String(base.date || '').trim(),
    durationHours: String(base.durationHours || '1').trim(),
    durationMinutes: String(base.durationMinutes || '45').trim(),
    pedagogicalIntent: String(base.pedagogicalIntent || '').trim(),
    resourcesPreset: Array.isArray(base.resourcesPreset) ? base.resourcesPreset : [],
    resourcesText: String(base.resourcesText || '').trim(),
    notes: String(base.notes || '').trim(),
    activityLinks: Array.isArray(base.activityLinks) ? base.activityLinks : [],
    start: {
      description: String(base.start?.description || '').trim(),
      activities: String(base.start?.activities || '').trim(),
      duration: String(base.start?.duration || '10').trim(),
    },
    development: {
      description: String(base.development?.description || '').trim(),
      activities: String(base.development?.activities || '').trim(),
      duration: String(base.development?.duration || '25').trim(),
    },
    closure: {
      description: String(base.closure?.description || '').trim(),
      activities: String(base.closure?.activities || '').trim(),
      duration: String(base.closure?.duration || '10').trim(),
      conclusions: String(base.closure?.conclusions || '').trim(),
    },
    adaptation: {
      notes: String(base.adaptation?.notes || '').trim(),
      strategies: String(base.adaptation?.strategies || '').trim(),
    },
  };
}
