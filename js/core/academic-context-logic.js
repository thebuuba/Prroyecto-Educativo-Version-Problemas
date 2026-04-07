import { S } from './state.js';
import { sortCourses, normTxt, parseSection, parseGradeLevel } from './utils.js';

/**
 * --- Academic Structure & Context ---
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

export function ensureStudentDirectory() {
  if (!Array.isArray(S.studentDirectory)) S.studentDirectory = [];
  const before = S.studentDirectory.length;
  S.studentDirectory = structuredClone(S.estudiantes || []);
  return S.studentDirectory.length !== before;
}

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

export function getScopedSections() {
  return Array.isArray(S.secciones) ? S.secciones : [];
}

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

export function getGroupLabel(groupId) {
  const g = getGroups().find(x=>x.id===groupId);
  return g ? `${g.gradeName} ${g.sectionName} — ${g.materia||'General'}` : '?';
}

export function getAttendanceGroupLabel(group) {
  if (!group) return 'Sin sección';
  return `${group.gradeName || ''} ${group.sectionName || ''} — ${group.materia || 'General'}`.trim();
}

/**
 * Obtiene la clave de roster para una sección (Grado + Letra).
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
 * Obtiene las secciones que comparten el mismo roster (misma sección administrativa).
 */
export function getRosterSections(sectionOrId) {
  const rosterKey = getSectionRosterKey(sectionOrId);
  if (!rosterKey) return [];
  return sortCourses((S.secciones || []).filter((section) => getSectionRosterKey(section) === rosterKey));
}

/**
 * Filtra los estudiantes activos de un grupo específico.
 */
export function studentsInGroup(groupId) {
  if (!groupId) return [];
  return (S.estudiantes || []).filter(s => (s.courseId === groupId || s.sectionId === groupId || s.seccionId === groupId) && s.status !== 'retired');
}

/**
 * Obtiene el rango del año escolar a partir del ID de schoolYear en el estado.
 */
export function getSchoolYearRange() {
  const schoolYearId = String(S.schoolYear?.id || S.schoolYear?.name || '2025-2026');
  const match = schoolYearId.match(/(\d{4})\D+(\d{4})/);
  const startYear = match ? parseInt(match[1], 10) : 2025;
  const endYear = match ? parseInt(match[2], 10) : startYear + 1;
  return { startYear, endYear };
}

/**
 * Obtiene la lista de grados ordenados por nivel educativo.
 */
export function getSortedGrades() {
  return (S.grades || []).sort((a, b) => (a.gradeLevel || 0) - (b.gradeLevel || 0));
}
