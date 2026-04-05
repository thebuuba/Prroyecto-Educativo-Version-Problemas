let dashboardSearchDebounceTimer = null;
let DASHBOARD_COURSE_QUERY = '';

// Re-renderiza el dashboard actual usando el contenedor compartido para refrescar tarjetas, KPIs y listados.
function renderDashboardHome() {
  if (!STATIC_DOM.view) return;
  RENDERS.dashboard(STATIC_DOM.view);
  injectPanelContextControls(STATIC_DOM.view);
  queueRenderedTextRepair(STATIC_DOM.view);
}

// Actualiza el término de búsqueda del dashboard y agenda un rerender suave para filtrar cursos sin perder contexto.
function setDashboardCourseSearch(value) {
  DASHBOARD_COURSE_QUERY = String(value || '');
  if (dashboardSearchDebounceTimer) {
    clearTimeout(dashboardSearchDebounceTimer);
    dashboardSearchDebounceTimer = null;
  }
  if (currentPage === 'dashboard') window.requestAnimationFrame(() => {
    if (currentPage === 'dashboard') renderDashboardHome();
  });
}

// Limpia el filtro activo del tablero y devuelve la lista de cursos al estado completo.
function clearDashboardCourseSearch() {
  if (dashboardSearchDebounceTimer) {
    clearTimeout(dashboardSearchDebounceTimer);
    dashboardSearchDebounceTimer = null;
  }
  if (!DASHBOARD_COURSE_QUERY) return;
  DASHBOARD_COURSE_QUERY = '';
  if (currentPage === 'dashboard') renderDashboardHome();
}

// Construye recordatorios accionables para hoy y mañana a partir del horario docente y las planificaciones existentes.
function dashboardPlannerFocusItems() {
  if (
    typeof teacherScheduleRowsForActiveDays !== 'function' ||
    typeof sanitizeTeacherScheduleRow !== 'function' ||
    typeof lessonPlanClassesForDate !== 'function' ||
    typeof teacherScheduleFormatTime !== 'function' ||
    typeof getGroupLabel !== 'function'
  ) {
    return [];
  }
  try {
    ensureTeacherPlannerState();
  } catch (error) {
    console.warn('[EduGest][dashboard] No se pudo preparar el horario docente', error);
    return [];
  }
  let rows = [];
  try {
    rows = teacherScheduleRowsForActiveDays().filter((row) => sanitizeTeacherScheduleRow(row).blockType === 'class');
  } catch (error) {
    console.warn('[EduGest][dashboard] No se pudieron leer las franjas del horario docente', error);
    return [];
  }
  if (!rows.length) return [];
  // Gestiona make date key.
  const makeDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const targets = [
    { offset: 0, label: 'Hoy', date: new Date() },
    { offset: 1, label: 'Mañana', date: new Date(Date.now() + 86400000) },
  ];
  const items = [];
  targets.forEach(({ label, date }) => {
    const jsWeekday = date.getDay();
    const weekday = jsWeekday === 0 ? 6 : jsWeekday - 1;
    const dateKey = makeDateKey(date);
    rows
      .filter((row) => parseInt(row.weekday, 10) === weekday)
      .slice(0, 2)
      .forEach((row) => {
        const groupId = row.sectionId || '';
        let planned = false;
        try {
          planned = groupId ? lessonPlanClassesForDate(groupId, dateKey).length > 0 : false;
        } catch (error) {
          console.warn('[EduGest][dashboard] No se pudo resolver la planificación de referencia', error);
        }
        items.push({
          tone: label === 'Hoy' ? 'green' : 'amber',
          icon: label === 'Hoy' ? '<i class="ri-calendar-check-line"></i>' : '<i class="ri-calendar-line"></i>',
          eyebrow: label,
          title: `${label} tienes ${row.subject || 'clase'}`,
          text: `${getGroupLabel(groupId) || 'Curso'} · ${teacherScheduleFormatTime(row.startTime)}${planned ? ' · ya planificada' : ' · <span class="dashboard-focus-alert">falta planificación</span>'}`,
          clickAction: `openPlanningForGroup('${groupId}')`,
          action: `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openPlanningForGroup('${groupId}')">${planned ? 'Abrir planificación' : 'Planificar ahora'}</button>`,
        });
      });
  });
  return items;
}
