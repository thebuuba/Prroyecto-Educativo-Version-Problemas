/**
 * Lógica de Estructura Académica y Contexto de Usuario.
 * --------------------------------------------------------------------------
 * Este módulo gestiona la organización de grados, secciones y estudiantes,
 * asegurando que el contexto activo (grado/grupo seleccionado) sea consistente
 * y que las relaciones jerárquicas se mantengan actualizadas.
 */

import { S } from './state.js';
import { sortCourses, normTxt, parseSection, parseGradeLevel } from './utils.js';

/**
 * Asegura que existan los contenedores (buckets) de configuración y notas para un periodo.
 * @param {string} [periodId=S.activePeriodId] - ID del periodo escolar.
 */
export function ensurePeriodBuckets(periodId = S.activePeriodId) {
  if (!periodId) return;
  if (!S.periodGroupConfigs || typeof S.periodGroupConfigs !== 'object') S.periodGroupConfigs = {};
  if (!S.notasByPeriod || typeof S.notasByPeriod !== 'object') S.notasByPeriod = {};
  
  if (!S.periodGroupConfigs[periodId]) {
    const base = (periodId === 'P1' && S.groupConfigs && Object.keys(S.groupConfigs).length) ? S.groupConfigs : {};
    S.periodGroupConfigs[periodId] = structuredClone(base);
  }
  if (!S.notasByPeriod[periodId]) {
    S.notasByPeriod[periodId] = (periodId === 'P1' && S.notas && Object.keys(S.notas).length) ? structuredClone(S.notas) : {};
  }
}

/**
 * Sincroniza el directorio de estudiantes realizando una copia profunda de la lista principal.
 * @returns {boolean} True si el tamaño del directorio cambió.
 */
export function ensureStudentDirectory() {
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const before = S.studentDirectory.length;
  // Copia desvinculada para evitar mutaciones accidentales en búsquedas
  S.studentDirectory = structuredClone(S.estudiantes || []);
  return S.studentDirectory.length !== before;
}

/**
 * Reconstruye los ayudantes y relaciones académicas (Grado -> Secciones -> Estudiantes).
 * Normaliza nombres, niveles de grado y letras de sección.
 */
export function rebuildAcademicHelpers() {
  if (!Array.isArray(S.grades)) S.grades = [];
  if (!Array.isArray(S.secciones)) S.secciones = [];
  if (!Array.isArray(S.estudiantes)) S.estudiantes = [];
  
  // Limpiar y preparar Grados
  S.grades.forEach((grade) => {
    grade.sections = [];
    grade.gradeLevel = grade.gradeLevel || parseGradeLevel(grade.name);
  });
  
  // Vincular Secciones a sus Grados y normalizar metadatos
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

  // Vincular Estudiantes a sus Secciones/Grados correspondientes
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
 * Obtiene el listado de secciones disponibles en el contexto actual.
 * @returns {Array} Listado de secciones.
 */
export function getScopedSections() {
  return Array.isArray(S.secciones) ? S.secciones : [];
}

/**
 * Garantiza que el contexto activo (Grado y Grupo seleccionados) sea válido.
 * Si el contexto actual es inválido o nulo, selecciona el primero disponible.
 */
export function ensureActiveContext() {
  const scopedSections = getScopedSections();
  const sortedGrades = [...S.grades].sort((a,b)=> (a.gradeLevel||0) - (b.gradeLevel||0));
  
  // Validar Grado Activo
  if (S.activeGradeId && !sortedGrades.some(g=>g.id===S.activeGradeId)) S.activeGradeId = null;
  if (!S.activeGradeId) S.activeGradeId = sortedGrades[0]?.id || null;

  // Validar Grupo Activo dentro del grado seleccionado
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
 * Obtiene el listado de grupos (secciones) formateado y ordenado para UI.
 * @returns {Array<Object>} Lista de grupos enriquecida.
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
 * Retorna una etiqueta legible que identifica a un grupo.
 * @param {string} groupId - ID del grupo.
 * @returns {string} Etiqueta tipo "Grado Sección — Materia".
 */
export function getGroupLabel(groupId) {
  const g = getGroups().find(x=>x.id===groupId);
  return g ? `${g.gradeName} ${g.sectionName} — ${g.materia||'General'}` : '?';
}

/**
 * Genera una etiqueta formateada para el panel de asistencia.
 * @param {Object} group - Objeto de grupo.
 * @returns {string}
 */
export function getAttendanceGroupLabel(group) {
  if (!group) return 'Sin sección';
  return `${group.gradeName || ''} ${group.sectionName || ''} — ${group.materia || 'General'}`.trim();
}

/**
 * Obtiene la clave de roster (identificador único administrativo) para una sección.
 * Se basa en la combinación de GradeId y la letra de la sección (A, B, C...).
 * @param {string|Object} sectionOrId - Sección o su identificador.
 * @returns {string} Clave tipo "GradeId|SectionLetter".
 */
export function getSectionRosterKey(sectionOrId) {
  const sec = typeof sectionOrId === 'string'
    ? getScopedSections().find((section) => section.id === sectionOrId) || (S.secciones || []).find((section) => section.id === sectionOrId)
    : sectionOrId;
  if (!sec) return '';
  const gradeId = sec.gradeId || '';
  const sectionLetter = parseSection(sec.sectionLetter || sec.sec || '');
  return `${gradeId}|${sectionLetter}`;
}

/**
 * Obtiene todas las secciones que comparten el mismo roster (misma sección administrativa 
 * aunque sean distintas materias).
 * @param {string|Object} sectionOrId - Sección base para la búsqueda.
 * @returns {Array} Lista de secciones hermanas.
 */
export function getRosterSections(sectionOrId) {
  const rosterKey = getSectionRosterKey(sectionOrId);
  if (!rosterKey) return [];
  return sortCourses((S.secciones || []).filter((section) => getSectionRosterKey(section) === rosterKey));
}

/**
 * Filtra los estudiantes que pertenecen a un grupo específico y no están retirados.
 * @param {string} groupId - ID del grupo.
 * @returns {Array} Lista de estudiantes activos.
 */
export function studentsInGroup(groupId) {
  if (!groupId) return [];
  return (S.estudiantes || []).filter(s => (s.courseId === groupId || s.sectionId === groupId || s.seccionId === groupId) && s.status !== 'retired');
}

/**
 * Resuelve el rango numérico del año escolar activo (ej. {2025, 2026}).
 * @returns {{ startYear: number, endYear: number }}
 */
export function getSchoolYearRange() {
  const schoolYearId = String(S.schoolYear?.id || S.schoolYear?.name || '2025-2026');
  const match = schoolYearId.match(/(\d{4})\D+(\d{4})/);
  const startYear = match ? parseInt(match[1], 10) : 2025;
  const endYear = match ? parseInt(match[2], 10) : startYear + 1;
  return { startYear, endYear };
}

/**
 * Obtiene la lista de grados institucionales ordenada jerárquicamente por nivel.
 * @returns {Array}
 */
export function getSortedGrades() {
  return (S.grades || []).sort((a, b) => (a.gradeLevel || 0) - (b.gradeLevel || 0));
}
