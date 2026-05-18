import { S } from '../../../../../../js/core/state.ts';
import { go } from '../../../../../../js/core/routing.ts';
import { openViewStudent } from '../../../../../../js/core/student-logic.ts';

let studentsViewMode = 'grid';

export function getStudentsViewMode() {
  return studentsViewMode;
}

export function setStudentsGradeView(id) {
  S.activeGradeId = id;
  S.activeGroupId = null;
  S.activeCourseId = null;
  go('estudiantes', { force: true, replace: true });
}

export function setActiveSection(id) {
  S.activeGroupId = id;
  S.activeCourseId = id;
  go('estudiantes', { force: true, replace: true });
}

export function setStudentsViewMode(mode) {
  studentsViewMode = mode === 'table' ? 'table' : 'grid';
  go('estudiantes', { force: true, replace: true });
}

export function setStudentsGlobalSearch(q) {
  window.STUDENTS_GLOBAL_QUERY = q;
  go('estudiantes', { force: true, replace: true });
}

export function openStudentSearchResult(id) {
  const st = (S.estudiantes || []).find((student) => student.id === id);
  if (!st) return;

  if (st.gradeId) S.activeGradeId = st.gradeId;
  const secId = st.courseId || st.sectionId || st.seccionId;
  if (secId) {
    S.activeGroupId = secId;
    S.activeCourseId = secId;
  }
  window.STUDENTS_GLOBAL_QUERY = '';
  openViewStudent(id);
}

export function openStudentEditPanel(id) {
  S.editingStudentId = id;
  go('student-edit');
}

export function registerStudentsActions() {
  window.setStudentsGradeView = setStudentsGradeView;
  window.setActiveSection = setActiveSection;
  window.setStudentsViewMode = setStudentsViewMode;
  window.setStudentsGlobalSearch = setStudentsGlobalSearch;
  window.openStudentSearchResult = openStudentSearchResult;
  window.openEditStudent = openStudentEditPanel;
}
