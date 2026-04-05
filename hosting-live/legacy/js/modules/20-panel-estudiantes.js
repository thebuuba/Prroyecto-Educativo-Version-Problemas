/* ------------------------- ESTUDIANTES ------------------------- */
const SECTION_STUDENT_PANEL_OPEN = {};
const RECENT_CREATED_SECTION = { id: null, timer: null };
// Marca marcar recent created sección.
function markRecentCreatedSection(sectionId) {
  // Marca visualmente una seccion recien creada para ayudar al usuario a ubicarla en la lista activa.
  if (!sectionId) return;
  RECENT_CREATED_SECTION.id = sectionId;
  if (RECENT_CREATED_SECTION.timer) clearTimeout(RECENT_CREATED_SECTION.timer);
  RECENT_CREATED_SECTION.timer = setTimeout(() => {
    RECENT_CREATED_SECTION.id = null;
    RECENT_CREATED_SECTION.timer = null;
    if (currentPage === 'estudiantes') go('estudiantes');
  }, 4200);
}
// Actualiza set estudiantes grado vista.
function setStudentsGradeView(gradeId) {
  // Cambia el grado activo dentro del panel de estudiantes y fuerza a recalcular su contexto visible.
  setActiveGrade(gradeId);
}
// Alterna alternar sección estudiantes.
function toggleSectionStudents(sectionId) {
  // Abre o colapsa la seccion indicada dentro del panel y vuelve a renderizar la vista con ese estado.
  SECTION_STUDENT_PANEL_OPEN[sectionId] = !SECTION_STUDENT_PANEL_OPEN[sectionId];
  go('estudiantes');
}
// Renderiza la gestion completa de estudiantes: grados, secciones, buscador global y tabla del curso seleccionado.
RENDERS.estudiantes = function(c) {
  const scopedGrades = getSortedGrades();
  const scopedSections = getScopedSections();
  const scopedStudents = getScopedStudents();
  const scopedSectionById = new Map(scopedSections.map((section) => [section.id, section]));
  const scopedGradeById = new Map(scopedGrades.map((grade) => [grade.id, grade]));

  if (scopedGrades.length === 0) {
    c.innerHTML = `<div class="card"><div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">Crea un grado primero</div><div class="es">Necesitas al menos un grado y una sección antes de registrar estudiantes.</div><button class="btn btn-primary" onclick="openM('m-grade')">+ Crear grado</button></div></div>`;
    return;
  }

  ensureActiveContext();
  const selectedGradeId = scopedGrades.some(g=>g.id===S.activeGradeId) ? S.activeGradeId : scopedGrades[0]?.id || null;
  S.activeGradeId = selectedGradeId;
  const activeGrade = scopedGrades.find(g=>g.id===selectedGradeId) || scopedGrades[0];
  const gradeSections = sortCourses(scopedSections.filter(s=>s.gradeId===activeGrade.id));
  if (!gradeSections.some(sec=>sec.id===S.activeGroupId)) {
    S.activeGroupId = gradeSections[0]?.id || null;
    S.activeCourseId = S.activeGroupId;
  }
  const secs = gradeSections;

  const tabs = scopedGrades.map(gr => `
    <button class="grade-tab ${gr.id===S.activeGradeId?'on':''}" onclick="setStudentsGradeView('${gr.id}')">${gr.name} ? ${gr.educationLevel||'General'}</button>
  `).join('');
  const studentSearchQuery = normalizeCourseSearchText(STUDENTS_GLOBAL_QUERY);
  const studentSearchResults = getStudentSearchResults(STUDENTS_GLOBAL_QUERY);

  let secCards = '';
  if (secs.length === 0) {
    secCards = `<div class="empty" style="padding:24px;"><div class="et">Sin materias/secciones</div><div class="es">Crea una sección para empezar a registrar estudiantes.</div><button class="btn btn-outline btn-sm" onclick="openSecM('${activeGrade.id}')">+ Crear sección</button></div>`;
  } else {
    const selectedSection = secs.find(sec => sec.id === S.activeGroupId) || secs[0];
    S.activeGroupId = selectedSection.id;
    S.activeCourseId = selectedSection.id;

    const miniCards = secs.map(sec => {
      const estsCount = studentsInGroup(sec.id).length;
      const isActive = sec.id === selectedSection.id;
      const isNew = RECENT_CREATED_SECTION.id === sec.id;
      return `
        <button class="course-mini-card ${isActive ? 'is-active' : ''} ${isNew ? 'is-new' : ''}" type="button" onclick="setActiveSection('${sec.id}')" aria-pressed="${isActive ? 'true' : 'false'}">
          <div class="course-mini-title">${sec.sec} ? ${sec.materia || activeGrade.subjectName || 'General'}</div>
          <div class="course-mini-meta">${estsCount} estudiante${estsCount===1?'':'s'}</div>
        </button>`;
    }).join('');

    const tableStudents = studentsInGroup(selectedSection.id);
    let rows = '';
    if (tableStudents.length === 0) {
      rows = `<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--mute);">Sin estudiantes registrados.</td></tr>`;
    } else {
      tableStudents.forEach(e => {
        const rowSectionId = e.sectionId || e.seccionId || e.courseId || selectedSection.id;
        const rowSection = scopedSectionById.get(rowSectionId) || null;
        const rowGrade = scopedGradeById.get(rowSection?.gradeId || e.gradeId) || null;
        const rowCourseLabel = rowSection ? `${rowGrade?.name || ''} ${rowSection.sec || ''} ? ${rowSection.materia || 'General'}`.trim() : '';
        const f = studentFinal(e.id, rowSectionId);
        const {c:c2} = f!==null ? getGrade(f) : {c:''};
        const status = f===null ? ['p-gray','Sin notas'] : f>=75 ? ['p-green','Aprobado'] : f>=60 ? ['p-amber','En riesgo'] : ['p-rose','Reprobado'];
        rows += `<tr class="student-info-row" ondblclick="openViewStudent('${e.id}')">
          <td>
            <button class="student-name-link" type="button" onclick="openViewStudent('${e.id}')" ondblclick="openViewStudent('${e.id}')">${e.nombre} ${e.apellido}</button>
            ${rowCourseLabel ? `<div style="font-size:11px;color:var(--mute2);margin-top:2px;">${rowCourseLabel}</div>` : ''}
          </td>
          <td class="student-matricula">${e.matricula||'?'}</td>
          <td style="text-align:center;">${f!==null?`<span class="gb ${c2}">${f}</span>`:'?'}</td>
          <td style="text-align:center;"><span class="pill student-status-pill ${status[0]}">${status[1]}</span></td>
          <td ondblclick="event.stopPropagation()">
            <div class="student-actions" ondblclick="event.stopPropagation()">
              <button class="btn btn-outline btn-sm student-action-btn" type="button" aria-label="Editar estudiante" title="Editar estudiante" onclick="openEditStudent('${e.id}')"><i class="ri-edit-line"></i></button>
              <button class="btn btn-danger btn-sm student-action-btn" type="button" aria-label="Eliminar estudiante" title="Eliminar estudiante" onclick="delEst('${e.id}')"><i class="ri-delete-bin-line"></i></button>
            </div>
          </td>
        </tr>`;
      });
    }

    secCards = `
      <div class="students-workspace-layout">
        <aside class="students-sections-panel">
          <div class="students-sections-head">
            <div class="students-sections-title">Materias del grado</div>
            <div class="students-sections-head-actions">
              <button class="btn btn-outline btn-sm" onclick="openSecM('${activeGrade.id}')">+ Sección</button>
              <button class="btn btn-outline btn-sm" onclick="openSubjectInGrade('${activeGrade.id}','${selectedSection.id}')">+ Asignatura</button>
            </div>
          </div>
          <div class="course-mini-grid">${miniCards}</div>
        </aside>
        <div class="section-workspace">
        <div class="section-workspace-head">
          <div>
            <div class="section-workspace-title">${activeGrade.name} ${selectedSection.sec} ? ${selectedSection.materia || activeGrade.subjectName || 'General'}</div>
            <div class="section-workspace-sub">Curso activo</div>
          </div>
          <span class="pill p-gray">${tableStudents.length} estudiante${tableStudents.length===1?'':'s'}</span>
        </div>
        <div class="section-card-actions">
          <button class="btn btn-primary btn-sm" onclick="openEstM('${selectedSection.id}')">+ Agregar estudiante</button>
          <button class="btn btn-outline btn-sm" onclick="openBulkEstM('${selectedSection.id}')">Carga masiva</button>
        </div>
        <div class="section-card-meta-actions">
          <button class="section-text-action" onclick="openEditSection('${selectedSection.id}')">
            <img src="/assets/icons/edit.png" alt="" width="14" height="14" decoding="async"> Editar materia
          </button>
          <button class="section-text-action danger" onclick="delSec('${selectedSection.id}')">
            <span class="icon-delete" aria-hidden="true"></span> Eliminar
          </button>
        </div>
        <div class="students-table-wrap" style="margin-top:12px;">
          <table class="tbl tbl-students">
            <thead><tr><th>Nombre</th><th>Matrícula</th><th>Final</th><th>Estado</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      </div>`;
  }

  c.innerHTML = `
    <div class="students-page-top">
      <div class="students-page-actions">
        <button class="btn btn-primary btn-sm" onclick="openM('m-grade')">+ Grado</button>
        <button class="btn btn-outline btn-sm" onclick="openSubjectInGrade('${activeGrade.id}','${S.activeGroupId || ''}')">+ Asignatura</button>
        <button class="btn btn-outline btn-sm" onclick="openEditGrade('${activeGrade.id}')"><img src="/assets/icons/edit.png" alt="" width="14" height="14" decoding="async"> Editar grado</button>
        <button class="btn btn-danger btn-sm" onclick="delGrade('${activeGrade.id}')"><span class="icon-delete" aria-hidden="true"></span> Eliminar grado</button>
      </div>
      <div class="students-global-search">
        <div class="students-global-search-shell">
          <div class="students-global-search-row">
            <input
              id="students-global-search"
              class="inp students-global-search-input"
              type="search"
              value="${escapeHtml(STUDENTS_GLOBAL_QUERY)}"
              placeholder="Buscar estudiante (nombre o matrícula)"
              aria-label="Búsqueda global de estudiantes"
              onfocus="openStudentsSearchDropdown()"
              oninput="setStudentsGlobalSearch(this.value)">
            ${STUDENTS_GLOBAL_QUERY ? `<button class="btn btn-outline btn-sm" type="button" onclick="clearStudentsGlobalSearch()">Limpiar</button>` : ''}
          </div>
          ${studentSearchQuery && STUDENTS_SEARCH_DROPDOWN_OPEN ? `
            <div class="students-search-dropdown" role="listbox" aria-label="Resultados de estudiantes">
              ${studentSearchResults.length ? studentSearchResults.map((result) => `
                <button
                  class="students-search-result"
                  type="button"
                  onclick="openStudentSearchResult('${result.id}')">
                  <div class="students-search-result-head">
                    <div>
                      <div class="students-search-result-name">${escapeHtml(result.fullName)}</div>
                      <div class="students-search-result-meta">Matrícula: ${escapeHtml(result.matricula)} ? ${escapeHtml(result.gradeLabel)} ${escapeHtml(result.sectionLabel)}</div>
                    </div>
                    <div class="students-search-result-score">
                      ${result.final===null ? '?' : escapeHtml(String(result.final))}
                    </div>
                  </div>
                  <div class="students-search-result-grid">
                    <span><strong>Grado:</strong> ${escapeHtml(result.gradeLabel)}${result.educationLevelLabel ? ` ? ${escapeHtml(result.educationLevelLabel)}` : ''}</span>
                    <span><strong>Sección:</strong> ${escapeHtml(result.sectionLabel)}</span>
                    <span class="students-search-result-subjects students-search-result-subjects-full"><strong>Materias:</strong> ${renderSearchSubjectTags(result.subjectLabels)}</span>
                  </div>
                </button>
              `).join('') : `
                <div class="students-search-empty">No se encontraron estudiantes con esa búsqueda.</div>
              `}
            </div>` : ''}
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <div class="cp">
        <div style="font-size:12px;font-weight:700;color:var(--mute);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">Grados académicos</div>
        <div class="grade-line">${tabs}</div>
      </div>
    </div>
    <div class="card">
      <div class="ch">
        <span class="ch-title"><img src="/assets/icons/curso.png" alt="" width="18" height="18" decoding="async" style="filter: grayscale(1) brightness(0.62); opacity:.85;"> Gestión de estudiantes ? ${activeGrade.name} ? ${activeGrade.educationLevel||'General'}</span>
      </div>
      <div class="cp">${secCards}</div>
    </div>`;
};
