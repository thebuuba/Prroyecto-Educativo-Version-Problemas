import { S } from '../../../core/state.js';
import { go } from '../../../core/routing.js';

let studentsViewMode = 'grid';

export function getStudentsViewMode() {
  return studentsViewMode;
}

export function registerStudentsActions() {
  window.setStudentsGradeView = (id) => {
    S.activeGradeId = id;
    go('estudiantes');
  };

  window.setActiveSection = (id) => {
    S.activeGroupId = id;
    S.activeCourseId = id;
    go('estudiantes');
  };

  window.setStudentsViewMode = (mode) => {
    studentsViewMode = mode === 'table' ? 'table' : 'grid';
    go('estudiantes');
  };

  window.setStudentsGlobalSearch = (q) => {
    window.STUDENTS_GLOBAL_QUERY = q;
    go('estudiantes');
  };

  window.openStudentSearchResult = (id) => {
    const st = (S.estudiantes || []).find((student) => student.id === id);
    if (!st) return;

    if (st.gradeId) S.activeGradeId = st.gradeId;
    const secId = st.courseId || st.sectionId || st.seccionId;
    if (secId) {
      S.activeGroupId = secId;
      S.activeCourseId = secId;
    }
    window.STUDENTS_GLOBAL_QUERY = '';
    window.openViewStudent(id);
  };

  window.openEditStudent = (id) => {
    S.editingStudentId = id;
    go('student-edit');
  };
}
