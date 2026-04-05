/* ------------------------- DASHBOARD ------------------------- */
// Construye el tablero principal con KPIs, pendientes y accesos rapidos usando el contexto academico activo.
RENDERS.dashboard = function(c) {
  const teacherName = getDisplayUserName('Docente');
  const hours = new Date().getHours();
  const greet = hours < 12 ? 'Buen día' : hours < 19 ? 'Buenas tardes' : 'Buenas noches';
  const courses = sortCourses(getScopedSections());
  const scopedStudents = getScopedStudents();
  const scopedCourseIds = new Set(courses.map((course) => course.id));
  const totalStudents = scopedStudents.length;
  let hasSchedule = false;
  let hasPlanning = false;
  try {
    if (typeof ensureTeacherPlannerState === 'function') ensureTeacherPlannerState();
    if (typeof ensureLessonPlansState === 'function') ensureLessonPlansState();
    hasSchedule = typeof teacherScheduleRowsForActiveDays === 'function' ? teacherScheduleRowsForActiveDays().length > 0 : false;
    hasPlanning = Array.isArray(S.lessonPlans) && S.lessonPlans.some((plan) => {
      const groupId = lessonPlanStoredGroupId(plan);
      if (!groupId || !scopedCourseIds.has(groupId)) return false;
      if (plan.periodId && plan.periodId !== S.activePeriodId) return false;
      return true;
    });
  } catch (error) {
    console.warn('[EduGest][dashboard] No se pudo resolver el estado de horario o planificaciones', error);
    hasSchedule = false;
    hasPlanning = false;
  }
  const allActsList = courses.flatMap((course) => {
    const cfg = getGroupCfg(course.id, S.activePeriodId);
    return BLOCKS.flatMap((block) => (cfg[block]?.activities || []).map((activity) => ({ sectionId: course.id, block, activity })));
  });
  const totalActivities = allActsList.length;
  // Gestiona total instruments.
  const totalInstruments = (S.instruments || []).filter((instrument) => !instrument?.courseId || scopedCourseIds.has(instrument.courseId)).length;
  const pendingInstruments = allActsList.filter((item) => !item.activity?.instrumentId).length;
  const linkedActivities = allActsList.filter((item) => !!item.activity?.instrumentId).length;
  const schoolYear = S.schoolYear?.name || '2025-2026';
  const activePeriod = periodName();
  const institution = S.profile?.inst || 'Institución por configurar';
  const todayDate = new Date().toLocaleDateString('es-DO', {weekday:'long', day:'2-digit', month:'long'});
  const coursesWithoutStudents = courses.filter((course) => studentsInGroup(course.id).length === 0).length;
  const courseCoverage = totalActivities ? Math.round((linkedActivities / totalActivities) * 100) : 0;
  const hasCourses = courses.length > 0;
  const hasStudents = totalStudents > 0;
  const hasActivities = totalActivities > 0;
  const needsInstruments = hasActivities && pendingInstruments > 0;
  const focusItems = [];

  if (!hasCourses) {
    focusItems.push({ tone: 'rose', icon: 'school', eyebrow: 'Paso 1', title: 'Crea tu primer curso',
      text: 'Empieza creando un grado y una sección para abrir el año escolar.',
      clickAction: `openOnboardingCreateCourseFlow()`,
      action: `<button class="stitch-btn-primary" onclick="event.stopPropagation(); openOnboardingCreateCourseFlow()">Crear grado</button>` });
  } else if (!hasStudents) {
    focusItems.push({ tone: 'aqua', icon: 'person_add', eyebrow: 'Paso 2', title: 'Agrega tus estudiantes',
      text: 'Registra al menos un estudiante para comenzar a trabajar el curso.',
      clickAction: `openOnboardingAddStudentsFlow()`,
      action: `<button class="stitch-btn-primary" onclick="event.stopPropagation(); openOnboardingAddStudentsFlow()">Agregar ahora</button>` });
  } else if (!hasSchedule) {
    focusItems.push({ tone: 'violet', icon: 'schedule', eyebrow: 'Paso 3', title: 'Configura tu horario docente',
      text: 'Define tus franjas y días activos para organizar la jornada semanal.',
      clickAction: `go('horario')`,
      action: `<button class="stitch-btn-primary" onclick="event.stopPropagation(); go('horario')">Configurar horario</button>` });
  } else if (!hasPlanning) {
    focusItems.push({ tone: 'green', icon: 'draft', eyebrow: 'Paso 4', title: 'Crea tu primera planificación',
      text: 'Organiza tus clases y competencias para arrancar el período con claridad.',
      clickAction: `go('planificaciones')`,
      action: `<button class="stitch-btn-primary" onclick="event.stopPropagation(); go('planificaciones')">Planificar ahora</button>` });
  } else if (!hasActivities) {
    focusItems.push({ tone: 'amber', icon: 'task', eyebrow: 'Paso 5', title: 'Crea actividades de evaluación',
      text: 'Agrega actividades en tus bloques para comenzar el registro evaluativo.',
      clickAction: `go('actividades')`,
      action: `<button class="stitch-btn-primary" onclick="event.stopPropagation(); go('actividades')">Crear actividades</button>` });
  } else if (needsInstruments) {
    focusItems.push({ tone: 'amber', icon: 'assignment', eyebrow: 'Paso 6', title: 'Vincula instrumentos de evaluación',
      text: `${pendingInstruments} actividad(es) siguen sin instrumento asignado.`,
      clickAction: `go('instrumentos')`,
      action: `<button class="stitch-btn-primary" onclick="event.stopPropagation(); go('instrumentos')">Vincular ahora</button>` });
  }

  if (!focusItems.length) {
    try {
      const plannerItems = typeof dashboardPlannerFocusItems === 'function' ? dashboardPlannerFocusItems() : [];
      focusItems.push(...plannerItems.map((item) => ({ ...item, icon: 'event_note' })));
    } catch (error) {
      console.warn('[EduGest][dashboard] No se pudieron construir recordatorios de horario', error);
    }
    if (coursesWithoutStudents > 0) {
      focusItems.push({ tone: 'aqua', icon: 'person_search', eyebrow: 'Seguimiento', title: 'Completa cursos vacíos',
        text: `${coursesWithoutStudents} curso(s) todavía no tienen estudiantes asignados.`,
        clickAction: `go('estudiantes')`,
        action: `<button class="stitch-btn-outline" onclick="event.stopPropagation(); go('estudiantes')">Ir a estudiantes</button>` });
    }
    if (needsInstruments) {
      focusItems.push({ tone: 'amber', icon: 'assignment', eyebrow: 'Pendiente', title: 'Vincula instrumentos',
        text: `${pendingInstruments} actividad(es) siguen sin instrumento asignado.`,
        clickAction: `go('instrumentos')`,
        action: `<button class="stitch-btn-outline" onclick="event.stopPropagation(); go('instrumentos')">Resolver ahora</button>` });
    }
  }

  if (!S.profile?.inst) {
    focusItems.push({ tone: 'violet', icon: 'settings', eyebrow: 'Perfil', title: 'Completa tu configuración',
      text: 'Agrega la institución para dejar listo el contexto del panel.',
      clickAction: `openM('m-setup')`,
      action: `<button class="stitch-btn-outline" onclick="event.stopPropagation(); openM('m-setup')">Abrir perfil</button>` });
  }
  if (focusItems.length === 0) {
    focusItems.push({ tone: 'green', icon: 'check_circle', eyebrow: 'Todo listo', title: 'Tu panel está en orden',
      text: 'Ya puedes entrar directo a tus cursos o revisar la matriz del período.',
      clickAction: `go('reportes')`,
      action: `<button class="stitch-btn-primary" onclick="event.stopPropagation(); go('reportes')">Ver reportes</button>` });
  }

  const mainFocus = focusItems[0];
  const stepNum = String((mainFocus?.eyebrow || '').match(/\d+/)?.[0] || '1').padStart(2,'0');

  const quickActions = [
    { icon: 'person_add', title: 'Estudiantes', copy: 'Gestionar matrícula', action: `go('estudiantes', { animatePanelTransition: true })` },
    { icon: 'add_task',   title: 'Actividades', copy: 'Ajustar bloques',      action: `go('actividades', { animatePanelTransition: true })` },
    { icon: 'grid_view',  title: 'Matriz',      copy: 'Revisar calificaciones',action: `go('actividades', { activityViewMode: 'matrix', animatePanelTransition: true })` },
    { icon: 'description',title: 'Reportes',    copy: 'Exportar resultados',   action: `go('reportes', { animatePanelTransition: true })` },
  ];
  const quickHtml = quickActions.map(item => `
    <button class="stitch-quick-card" onclick="${item.action}">
      <span class="material-symbols-outlined stitch-quick-icon">${item.icon}</span>
      <span class="stitch-quick-title">${item.title}</span>
      <span class="stitch-quick-copy">${item.copy}</span>
    </button>
  `).join('');

  const activeCourseQuery = DASHBOARD_COURSE_QUERY;
  const normalizedCourseQuery = normalizeCourseSearchText(activeCourseQuery);
  const studentCountBySection = new Map();
  scopedStudents.forEach((student) => {
    const sectionId = student.sectionId || student.seccionId || student.courseId;
    if (!sectionId) return;
    studentCountBySection.set(sectionId, (studentCountBySection.get(sectionId) || 0) + 1);
  });
  const activityStatsBySection = new Map();
  allActsList.forEach((item) => {
    const sectionId = item.sectionId;
    if (!sectionId) return;
    const bucket = activityStatsBySection.get(sectionId) || { total: 0, linked: 0 };
    bucket.total += 1;
    if (item.activity?.instrumentId) bucket.linked += 1;
    activityStatsBySection.set(sectionId, bucket);
  });
  const filteredCourses = normalizedCourseQuery
    ? courses.filter((sec) => {
        const searchableText = normalizeCourseSearchText([sec.grado, sec.sec, `${sec.grado || ''} ${sec.sec || ''}`.trim(), sec.materia || 'General'].join(' '));
        return searchableText.includes(normalizedCourseQuery);
      })
    : courses;

  let coursesHtml = '';
  if (courses.length === 0) {
    coursesHtml = `<div class="stitch-empty-state">
      <div class="stitch-empty-icon"><span class="material-symbols-outlined">folder_off</span></div>
      <p class="stitch-empty-title">No hay cursos activos</p>
      <p class="stitch-empty-sub">Comienza creando un nuevo grado escolar</p>
    </div>`;
  } else if (filteredCourses.length === 0) {
    coursesHtml = `<div class="stitch-empty-state">
      <div class="stitch-empty-icon"><span class="material-symbols-outlined">search_off</span></div>
      <p class="stitch-empty-title">Sin resultados para "${escapeHtml(activeCourseQuery)}"</p>
      <button class="stitch-btn-outline" style="margin-top:8px" onclick="clearDashboardCourseSearch()">Limpiar búsqueda</button>
    </div>`;
  } else {
    coursesHtml = filteredCourses.map(sec => {
      const count = studentCountBySection.get(sec.id) || 0;
      const actStats = activityStatsBySection.get(sec.id) || { total: 0, linked: 0 };
      const prog = actStats.total ? Math.round((actStats.linked / actStats.total) * 100) : 0;
      return `<div class="stitch-course-item" role="button" tabindex="0"
        onclick="openDashboardCourse('${sec.id}')"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openDashboardCourse('${sec.id}');}">
        <div class="stitch-course-info">
          <div class="stitch-course-avatar"><span class="material-symbols-outlined">school</span></div>
          <div>
            <div class="stitch-course-name">${escapeHtml(sec.grado)} ${escapeHtml(sec.sec)}</div>
            <div class="stitch-course-sub">${escapeHtml(sec.materia || 'General')} · ${count} est.</div>
          </div>
        </div>
        <div class="stitch-course-bar-wrap">
          <div class="stitch-course-bar"><div class="stitch-course-bar-fill" style="width:${prog}%"></div></div>
          <span class="stitch-course-pct">${prog}%</span>
        </div>
      </div>`;
    }).join('');
  }

  c.innerHTML = `
    <div class="stitch-dash">
      <div class="stitch-hero">
        <div>
          <div class="stitch-hero-title">${greet}, ${escapeHtml(teacherName)}</div>
          <div class="stitch-hero-sub">${todayDate}</div>
        </div>
        <div class="stitch-pill-row">
          <span class="stitch-pill stitch-pill-main">${escapeHtml(institution)}</span>
          <span class="stitch-pill stitch-pill-sec">${escapeHtml(schoolYear)}</span>
          <span class="stitch-pill stitch-pill-sec">${escapeHtml(activePeriod)}</span>
        </div>
      </div>

      <div class="stitch-stats">
        <div class="stitch-stat-card">
          <div class="stitch-stat-icon"><span class="material-symbols-outlined">school</span></div>
          <div class="stitch-stat-label">Cursos</div>
          <div class="stitch-stat-value">${courses.length}</div>
        </div>
        <div class="stitch-stat-card">
          <div class="stitch-stat-icon"><span class="material-symbols-outlined">group</span></div>
          <div class="stitch-stat-label">Estudiantes</div>
          <div class="stitch-stat-value">${totalStudents}</div>
        </div>
        <div class="stitch-stat-card">
          <div class="stitch-stat-icon"><span class="material-symbols-outlined">event_note</span></div>
          <div class="stitch-stat-label">Actividades</div>
          <div class="stitch-stat-value">${totalActivities}</div>
        </div>
        <div class="stitch-stat-card">
          <div class="stitch-stat-icon"><span class="material-symbols-outlined">analytics</span></div>
          <div class="stitch-stat-label">Cobertura</div>
          <div class="stitch-stat-value">${courseCoverage}%</div>
        </div>
      </div>

      <div class="stitch-bento">
        <div class="stitch-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div class="stitch-card-title" style="margin-bottom:0">Qué hacer hoy</div>
            <span class="stitch-badge-pending">PENDIENTE</span>
          </div>
          <div class="stitch-focus-inner" role="button" tabindex="0"
            onclick="${mainFocus?.clickAction || ''}"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${mainFocus?.clickAction || ''};}">
            <div class="stitch-focus-num">${stepNum}</div>
            <div class="stitch-focus-body">
              <div class="stitch-focus-eyebrow">${escapeHtml(mainFocus?.eyebrow || 'Paso 1')}</div>
              <div class="stitch-focus-title">${escapeHtml(mainFocus?.title || '')}</div>
              <div class="stitch-focus-text">${escapeHtml(mainFocus?.text || '')}</div>
            </div>
            <div>${mainFocus?.action || ''}</div>
          </div>
        </div>

        <div class="stitch-card">
          <div class="stitch-card-title">Acciones rápidas</div>
          <div class="stitch-quick-grid">${quickHtml}</div>
        </div>

        <div class="stitch-bento-right">
          <div class="stitch-card">
            <div class="stitch-card-title">Vista general</div>
            <div class="stitch-overview-item">
              <div class="stitch-overview-avatar"><span class="material-symbols-outlined">library_books</span></div>
              <div>
                <div class="stitch-overview-lbl">Biblioteca</div>
                <div class="stitch-overview-val">Instrumentos</div>
              </div>
              <div class="stitch-overview-num">${totalInstruments}</div>
            </div>
            <div class="stitch-overview-item">
              <div class="stitch-overview-avatar"><span class="material-symbols-outlined">folder_off</span></div>
              <div>
                <div class="stitch-overview-lbl">Sin estudiantes</div>
                <div class="stitch-overview-val">Cursos vacíos</div>
              </div>
              <div class="stitch-overview-num" style="color:${coursesWithoutStudents > 0 ? '#9e3f4e' : 'var(--primary,#050720)'}">${coursesWithoutStudents}</div>
            </div>
            <div class="stitch-quote">"La educación no es preparación para la vida; la educación es la vida misma."</div>
          </div>

          <div class="stitch-card" style="flex:1">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div class="stitch-card-title" style="margin-bottom:0">Mis cursos</div>
              <button class="stitch-btn-outline" style="padding:5px 14px;font-size:.7rem" onclick="clearDashboardCourseSearch()">Limpiar</button>
            </div>
            <div class="stitch-course-search">
              <input class="inp" type="search" placeholder="Filtrar cursos..." value="${escapeHtml(activeCourseQuery)}" oninput="setDashboardCourseSearch(this.value)" aria-label="Filtrar cursos">
            </div>
            <div>${coursesHtml}</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Cambia el curso activo desde el dashboard y redirige al modulo donde el usuario quiere continuar trabajando.
function openDashboardCourse(sectionId, page='actividades') {
  // Lleva al usuario desde el tablero al curso elegido y conserva el contexto académico activo.
  if (!sectionId) return;
  S.activeGroupId = sectionId;
  S.activeCourseId = sectionId;
  const sec = (S.secciones || []).find(s=>s.id===sectionId);
  if (sec?.gradeId) S.activeGradeId = sec.gradeId;
  persist();
  if (page === 'matriz') { setActView('matrix'); return; }
  go(page);
}
