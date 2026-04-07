export { 
  sortCourses, 
  normTxt, 
  parseSection, 
  parseGradeLevel, 
  escapeHtml, 
  uid, 
  nowIso, 
  fmtDate, 
  getCurrentMonthKey, 
  normalizeAttendanceMonthKey, 
  attendanceMonthKey, 
  attendanceMonthStart 
} from './utils.js';
import { EDUCATION_SECTIONS, EDUCATION_THEME_CLASS_BY_SECTION, EDUCATION_THEME_CLASS_BY_COMBINATION } from './constants.js';
import { normalizeEducationSections, normalizeEducationSection, normalizeEducationLevelName } from './string-utils.js';

// Re-exports from Specialized Modules
export * from './math-utils.js';
export * from './string-utils.js';
export * from './instrument-logic.js';
export * from './academic-logic.js';
export * from './api-mappings.js';
export * from './theme-logic.js';
export * from './academic-context-logic.js';
export * from './curriculum-logic.js';
export * from './planning-logic.js';

import { ensurePeriodBuckets, studentsInGroup } from './academic-context-logic.js';
import { fixMojibakeText } from './utils.js';

// Helper re-exports for shell/root/panels
export { getDisplayUserName, resetToSignedOutState, logoutAuth } from './hydration.js';
export { initials, openM, closeM, toast, forceCloseM, periodName } from './ui.js';
export { go, currentPage } from './routing.js';
export { 
  toggleDarkMode, 
  toggleSidebarPinnedPreference, 
  applyUserPreferences, 
  collapseSidebarIfAllowed, 
  setSidebarExpanded, 
  clearSidebarCloseTimer, 
  scheduleSidebarAutoClose,
  SIDEBAR_TIMINGS
} from './interactions.js';
export { STATIC_DOM } from './constants.js';

// Academic Structure & Context logic moved to academic-context-logic.js

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

    const secLetter = parseSection(st.sectionLetter || st.sec || '');
    const gradeLabel = st.grado || st.gradeName || '';
    const key = `${normTxt(gradeLabel)}|${secLetter}`;
    let target = sectionByKey.get(key);

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
}

/**
 * --- UI Themes & Scoping ---
 */

// Theme and scoping logic moved to theme-logic.js

export function getScopedGrades() {
  const allGrades = Array.isArray(S.grades) ? S.grades : [];
  if (!shouldScopeByEducationSection()) return allGrades;
  return allGrades.filter((grade) => matchesActiveEducationSection(grade?.educationLevel || ''));
}

export function getScopedStudents() {
  const allStudents = Array.isArray(S.estudiantes) ? S.estudiantes : [];
  if (!shouldScopeByEducationSection()) return allStudents;
  const scopedSectionIds = new Set(getScopedSections().map((section) => section.id));
  return allStudents.filter((student) => {
    const sectionId = student.sectionId || student.seccionId || student.courseId;
    return scopedSectionIds.has(sectionId);
  });
}

// Scoping helpers moved to theme-logic.js

/**
 * --- Search ---
 */

export function getStudentSearchResults(query = '') {
  const q = normTxt(query);
  if (!q) return [];
  const results = [];
  const students = getScopedStudents();
  const sections = getScopedSections();
  const grades = S.grades || [];

  students.forEach(st => {
    const fullName = normTxt(`${st.nombre || ''} ${st.apellido || ''}`);
    const normMat = normTxt(st.matricula || '');
    
    if (fullName.includes(q) || normMat.includes(q)) {
      const sec = sections.find(s => s.id === (st.courseId || st.sectionId || st.seccionId));
      const gr = grades.find(g => g.id === (sec?.gradeId || st.gradeId));
      results.push({
        id: st.id,
        fullName: `${st.nombre || ''} ${st.apellido || ''}`,
        matricula: st.matricula || '?',
        gradeLabel: gr?.name || '?',
        sectionLabel: sec?.sec || '?',
        educationLevelLabel: gr?.educationLevel || '',
        subjectLabels: sec?.materia ? [sec.materia] : [],
        final: window.studentFinal ? window.studentFinal(st.id, sec?.id) : null
      });
    }
  });
  return results;
}

// Temporary compatibility bridges
export const INTERACTION_ENHANCEMENTS = {}; 
export function hasActiveBrowserSession() {
  return !!S.sessionUserId;
}

// Ensure window exports for legacy shell
window.getGroupCfg = (gid, pid) => S.periodGroupConfigs?.[pid || S.activePeriodId]?.[gid] || { B1: { activities: [] }, B2: { activities: [] }, B3: { activities: [] }, B4: { activities: [] } };
window.ensurePeriodBuckets = ensurePeriodBuckets;
window.studentsInGroup = studentsInGroup;
window.fixMojibakeText = fixMojibakeText;
