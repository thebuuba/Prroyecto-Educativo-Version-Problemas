const STUDENTS_SEARCH_DEBOUNCE_MS = 180;
let STUDENTS_GLOBAL_QUERY = '';
let STUDENTS_SEARCH_DROPDOWN_OPEN = false;
let studentsSearchDebounceTimer = null;

// Genera las etiquetas visibles de materias/áreas para mostrar contexto en la búsqueda global de estudiantes.
function renderSearchSubjectTags(subjects = []) {
  const items = (Array.isArray(subjects) ? subjects : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  if (!items.length) return '?';
  return `<div class="students-search-subject-tags">${items.map((item) => `<span class="students-search-subject-tag">${escapeHtml(item)}</span>`).join('')}</div>`;
}

// Cruza el texto buscado con estudiantes, curso, grado y materias para devolver coincidencias útiles al usuario.
function getStudentSearchResults(query, limit = 8) {
  const normalizedQuery = normalizeCourseSearchText(query);
  if (!normalizedQuery) return [];
  const scopedSections = getScopedSections();
  const scopedSectionById = new Map(scopedSections.map((section) => [section.id, section]));
  const scopedGradeById = new Map(getScopedGrades().map((grade) => [grade.id, grade]));

  return getScopedStudents()
    .map((st) => {
      const sectionId = st.sectionId || st.seccionId || st.courseId || '';
      const section = scopedSectionById.get(sectionId) || null;
      const grade = scopedGradeById.get(section?.gradeId || st.gradeId) || null;
      const subjectLabels = getRosterSubjectLabels(sectionId);
      const courseLabels = getRosterCourseLabels(sectionId);
      const fullName = `${st.nombre || ''} ${st.apellido || ''}`.trim();
      const searchable = normalizeCourseSearchText([
        st.matricula || '',
        st.nombre || '',
        st.apellido || '',
        fullName,
        section?.sec || '',
        ...subjectLabels,
        grade?.name || '',
        grade?.educationLevel || '',
      ].join(' '));
      if (!searchable.includes(normalizedQuery)) return null;

      const final = sectionId ? studentFinal(st.id, sectionId) : null;
      const status = final===null ? 'Sin notas' : final>=75 ? 'Aprobado' : final>=60 ? 'En riesgo' : 'Reprobado';
      const sectionLabel = section?.sec || '?';
      const subjectLabel = subjectLabels.join(' ? ') || section?.materia || grade?.subjectName || 'General';
      const gradeLabel = grade?.name || '?';
      const educationLevelLabel = grade?.educationLevel || '';
      const courseLabel = courseLabels.join(' | ') || [gradeLabel, sectionLabel, subjectLabel].filter(Boolean).join(' ? ');

      return {
        id: st.id,
        fullName: fullName || 'Sin nombre',
        matricula: st.matricula || '?',
        gradeLabel,
        sectionLabel,
        subjectLabel,
        educationLevelLabel,
        courseLabel,
        final,
        status,
        sectionId,
        courseLabels,
        subjectLabels,
        gradeId: grade?.id || st.gradeId || '',
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aStarts = normalizeCourseSearchText(a.fullName).startsWith(normalizedQuery) ? 0 : 1;
      const bStarts = normalizeCourseSearchText(b.fullName).startsWith(normalizedQuery) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
    })
    .slice(0, limit);
}

// Re-pinta la vista de estudiantes sin perder la posición del cursor en el buscador global.
function rerenderStudentsPagePreservingSearchCaret() {
  if (currentPage !== 'estudiantes' || !STATIC_DOM.view) return;
  const activeEl = document.activeElement;
  const isSearchFocused = activeEl && activeEl.id === 'students-global-search';
  const caretStart = isSearchFocused ? activeEl.selectionStart : null;
  const caretEnd = isSearchFocused ? activeEl.selectionEnd : null;

  RENDERS.estudiantes(STATIC_DOM.view);
  injectPanelContextControls(STATIC_DOM.view);
  queueRenderedTextRepair(STATIC_DOM.view);

  if (isSearchFocused) {
    const searchEl = document.getElementById('students-global-search');
    if (searchEl) {
      const len = searchEl.value.length;
      const nextStart = Math.min(caretStart ?? len, len);
      const nextEnd = Math.min(caretEnd ?? len, len);
      searchEl.focus({ preventScroll: true });
      searchEl.setSelectionRange(nextStart, nextEnd);
    }
  }
}

// Abre el estudiante encontrado y sincroniza el grado/curso activo para que el resto del panel quede coherente.
function openStudentSearchResult(studentId) {
  const student = getScopedStudents().find((entry) => entry.id === studentId);
  if (!student) return;
  const sectionId = student.sectionId || student.seccionId || student.courseId || '';
  const section = getScopedSections().find((entry) => entry.id === sectionId) || null;
  if (section?.gradeId) S.activeGradeId = section.gradeId;
  if (sectionId) {
    S.activeGroupId = sectionId;
    S.activeCourseId = sectionId;
  }
  STUDENTS_GLOBAL_QUERY = '';
  STUDENTS_SEARCH_DROPDOWN_OPEN = false;
  rerenderStudentsPagePreservingSearchCaret();
  openViewStudent(studentId);
}

// Muestra el desplegable de resultados solo cuando la búsqueda tiene texto suficiente para aportar coincidencias.
function openStudentsSearchDropdown() {
  if (!normalizeCourseSearchText(STUDENTS_GLOBAL_QUERY)) return;
  if (STUDENTS_SEARCH_DROPDOWN_OPEN) return;
  STUDENTS_SEARCH_DROPDOWN_OPEN = true;
  rerenderStudentsPagePreservingSearchCaret();
}

// Oculta el desplegable de resultados cuando el usuario sale de la búsqueda o limpia el campo.
function closeStudentsSearchDropdown() {
  if (!STUDENTS_SEARCH_DROPDOWN_OPEN) return;
  STUDENTS_SEARCH_DROPDOWN_OPEN = false;
  rerenderStudentsPagePreservingSearchCaret();
}

// Actualiza la consulta global de estudiantes y agenda un rerender diferido para no saturar el teclado.
function setStudentsGlobalSearch(value) {
  STUDENTS_GLOBAL_QUERY = String(value || '');
  STUDENTS_SEARCH_DROPDOWN_OPEN = !!normalizeCourseSearchText(STUDENTS_GLOBAL_QUERY);
  if (studentsSearchDebounceTimer) clearTimeout(studentsSearchDebounceTimer);
  studentsSearchDebounceTimer = setTimeout(() => {
    studentsSearchDebounceTimer = null;
    rerenderStudentsPagePreservingSearchCaret();
  }, STUDENTS_SEARCH_DEBOUNCE_MS);
}

// Limpia la búsqueda global y vuelve a mostrar el listado completo de estudiantes.
function clearStudentsGlobalSearch() {
  if (studentsSearchDebounceTimer) {
    clearTimeout(studentsSearchDebounceTimer);
    studentsSearchDebounceTimer = null;
  }
  if (!STUDENTS_GLOBAL_QUERY) return;
  STUDENTS_GLOBAL_QUERY = '';
  STUDENTS_SEARCH_DROPDOWN_OPEN = false;
  rerenderStudentsPagePreservingSearchCaret();
}
