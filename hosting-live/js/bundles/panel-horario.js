/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-bundles.sh
 */

RENDERS.horario = function(c) {
  ensureTeacherPlannerState();
  c.innerHTML = renderTeacherSchedulePage();
};
// Alias de render para rutas antiguas o dedicadas al calendario docente.
RENDERS.calendario = RENDERS.horario;
// Asegura asegurar teacher planner estado.
function ensureTeacherPlannerState() {
  // Inicializa y sanea el estado del horario docente antes de cualquier render o edición del planner.
  if (!S.teacherPlanner || typeof S.teacherPlanner !== 'object') {
    S.teacherPlanner = { monthKey: getCurrentMonthKey(), customEvents: [], weeklySchedule: [], activeWeekdays: [0, 1, 2, 3, 4], journeyType: 'extended' };
  }
  if (!S.teacherPlanner.monthKey) S.teacherPlanner.monthKey = getCurrentMonthKey();
  if (!Array.isArray(S.teacherPlanner.customEvents)) S.teacherPlanner.customEvents = [];
  if (!Array.isArray(S.teacherPlanner.weeklySchedule)) S.teacherPlanner.weeklySchedule = [];
  S.teacherPlanner.journeyType = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || 'extended');
  TEACHER_SCHEDULE_WIZARD.journeyType = sanitizeTeacherScheduleJourneyType(TEACHER_SCHEDULE_WIZARD.journeyType || S.teacherPlanner.journeyType || 'extended');
  S.teacherPlanner.activeWeekdays = teacherScheduleNormalizeWeekdayList(S.teacherPlanner.activeWeekdays, [0, 1, 2, 3, 4]);
  S.teacherPlanner.weeklySchedule = S.teacherPlanner.weeklySchedule.map((row) => sanitizeTeacherScheduleRow(row));
}
// Obtiene get escuela year range.
function getSchoolYearRange() {
  // Extrae el rango anual del período escolar para construir eventos oficiales del calendario.
  const schoolYearId = String(S.schoolYear?.id || S.schoolYear?.name || '2025-2026');
  const match = schoolYearId.match(/(\d{4})\D+(\d{4})/);
  const startYear = match ? parseInt(match[1], 10) : 2025;
  const endYear = match ? parseInt(match[2], 10) : startYear + 1;
  return { startYear, endYear };
}
// Construye construir official planner events.
function buildOfficialPlannerEvents() {
  // Genera la agenda base del docente con hitos MINERD y feriados del año escolar.
  const { startYear, endYear } = getSchoolYearRange();
  return [
    { id: `minerd-doc-${startYear}`, date: `${startYear}-08-04`, title: 'Inicio de jornada docente y preparaci?n del a?o escolar', type: 'minerd', source: 'MINERD' },
    { id: `minerd-open-${startYear}`, date: `${startYear}-08-25`, title: 'Inicio del a?o escolar para estudiantes', type: 'minerd', source: 'MINERD' },
    { id: `holiday-mercedes-${startYear}`, date: `${startYear}-09-24`, title: 'D?a de Nuestra Se?ora de las Mercedes', type: 'holiday', source: 'Calendario nacional' },
    { id: `holiday-constitucion-${startYear}`, date: `${startYear}-11-06`, title: 'D?a de la Constituci?n', type: 'holiday', source: 'Calendario nacional' },
    { id: `holiday-navidad-${startYear}`, date: `${startYear}-12-25`, title: 'Navidad', type: 'holiday', source: 'Calendario nacional' },
    { id: `minerd-break-${startYear}`, date: `${startYear}-12-19`, title: 'Inicio del receso escolar de diciembre', type: 'minerd', source: 'MINERD' },
    { id: `holiday-newyear-${endYear}`, date: `${endYear}-01-01`, title: 'A?o Nuevo', type: 'holiday', source: 'Calendario nacional' },
    { id: `minerd-return-${endYear}`, date: `${endYear}-01-06`, title: 'Reinicio de docencia del segundo per?odo', type: 'minerd', source: 'MINERD' },
    { id: `holiday-altagracia-${endYear}`, date: `${endYear}-01-21`, title: 'D?a de Nuestra Se?ora de la Altagracia', type: 'holiday', source: 'Calendario nacional' },
    { id: `efemeride-duarte-${endYear}`, date: `${endYear}-01-26`, title: 'Natalicio de Juan Pablo Duarte', type: 'efemeride', source: 'Efem?ride patria' },
    { id: `holiday-independencia-${endYear}`, date: `${endYear}-02-27`, title: 'D?a de la Independencia Nacional', type: 'holiday', source: 'Calendario nacional' },
    { id: `efemeride-restauracion-${startYear}`, date: `${startYear}-08-16`, title: 'D?a de la Restauraci?n', type: 'efemeride', source: 'Efem?ride patria' },
  ];
}
// Normaliza normalizar planner event type.
function normalizePlannerEventType(type) {
  return ['minerd', 'holiday', 'efemeride', 'custom'].includes(type) ? type : 'custom';
}
// Obtiene get planner events.
function getPlannerEvents() {
  // Combina eventos oficiales y eventos personalizados del docente en una sola lista ordenada.
  ensureTeacherPlannerState();
  const custom = S.teacherPlanner.customEvents.map((event) => ({
    id: event.id || uid(),
    date: event.date || '',
    title: String(event.title || '').trim(),
    type: normalizePlannerEventType(event.type || 'custom'),
    source: event.source || 'Personal',
  })).filter((event) => event.date && event.title);
  return [...buildOfficialPlannerEvents(), ...custom].sort((a, b) => String(a.date).localeCompare(String(b.date), 'es') || String(a.title).localeCompare(String(b.title), 'es'));
}
// Actualiza set teacher planner mes.
function setTeacherPlannerMonth(monthKey) {
  // Cambia el mes visible del calendario docente y recalcula el panel.
  ensureTeacherPlannerState();
  S.teacherPlanner.monthKey = normalizeAttendanceMonthKey(monthKey);
  persist();
  go(currentPage);
}
// Gestiona planner mes label.
function plannerMonthLabel(monthKey) {
  const date = attendanceMonthStart(monthKey);
  return new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(date);
}
// Obtiene get planner mes matrix.
function getPlannerMonthMatrix(monthKey) {
  const start = attendanceMonthStart(monthKey);
  const monthIndex = start.getMonth();
  const year = start.getFullYear();
  const daysInMonth = new Date(year, monthIndex + 1, 0, 12, 0, 0, 0).getDate();
  const offset = (start.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      dateKey: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
// Gestiona planner event tone.
function plannerEventTone(type) {
  if (type === 'minerd') return 'tone-aqua';
  if (type === 'holiday') return 'tone-amber';
  if (type === 'efemeride') return 'tone-violet';
  return 'tone-green';
}
// Gestiona planner event type label.
function plannerEventTypeLabel(type) {
  if (type === 'minerd') return 'MINERD';
  if (type === 'holiday') return 'Festivo';
  if (type === 'efemeride') return 'Efem?ride';
  return 'Personal';
}
// Gestiona planner weekday name.
function plannerWeekdayName(dayIndex) {
  return ['Lunes', 'Martes', 'Mi?rcoles', 'Jueves', 'Viernes', 'S?bado', 'Domingo'][dayIndex] || 'Lunes';
}
const TEACHER_SCHEDULE_ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const TEACHER_SCHEDULE_DEFAULT_WEEKDAYS = [0, 1, 2, 3, 4];
const TEACHER_SCHEDULE_BLOCK_TYPES = ['class', 'planning', 'break', 'lunch', 'event'];
const TEACHER_SCHEDULE_JOURNEY_TYPES = ['extended', 'morning', 'afternoon', 'double', 'custom'];
const TEACHER_SCHEDULE_EDITOR = { mode: 'edit', originalKey: '', weekday: 0, startTime: '', endTime: '', draft: null, errors: {} };
const TEACHER_SCHEDULE_ROW_COPY = { startTime: '', endTime: '', sourceWeekday: 0 };
const TEACHER_SCHEDULE_ROW_ADJUST = { startTime: '', endTime: '' };
const TEACHER_SCHEDULE_WIZARD = {
  step: 1,
  journeyType: 'extended',
  startTime: '07:30',
  endTime: '11:55',
  durationsRaw: '40',
  includeBreak: true,
  breakStart: '09:30',
  breakEnd: '10:00',
  includeLunch: false,
  lunchStart: '12:00',
  lunchEnd: '13:00',
};
// Gestiona sanitize teacher programar journey type.
function sanitizeTeacherScheduleJourneyType(type) {
  return TEACHER_SCHEDULE_JOURNEY_TYPES.includes(type) ? type : 'extended';
}
// Gestiona teacher programar journey meta.
function teacherScheduleJourneyMeta(type) {
  const normalized = sanitizeTeacherScheduleJourneyType(type);
  if (normalized === 'extended') return { id: 'extended', label: 'Jornada extendida', copy: 'Jornada continua', rank: 1 };
  if (normalized === 'morning') return { id: 'morning', label: 'Tanda matutina', copy: 'Solo ma?ana', rank: 2 };
  if (normalized === 'afternoon') return { id: 'afternoon', label: 'Tanda vespertina', copy: 'Solo tarde', rank: 3 };
  if (normalized === 'double') return { id: 'double', label: 'Doble tanda', copy: 'Ma?ana + tarde', rank: 4 };
  return { id: 'custom', label: 'Personalizada', copy: 'Libre y flexible', rank: 5 };
}
// Gestiona teacher programar journey options.
function teacherScheduleJourneyOptions() {
  return TEACHER_SCHEDULE_JOURNEY_TYPES
    .map((type) => teacherScheduleJourneyMeta(type))
    .sort((a, b) => a.rank - b.rank);
}
// Gestiona teacher programar journey preset.
function teacherScheduleJourneyPreset(type) {
  const normalized = sanitizeTeacherScheduleJourneyType(type);
  if (normalized === 'morning') {
    return {
      startTime: '07:30',
      endTime: '11:55',
      durationsRaw: '40',
      includeBreak: true,
      breakStart: '09:30',
      breakEnd: '10:00',
      includeLunch: false,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      activeWeekdays: [0, 1, 2, 3, 4],
      shiftFilter: 'all',
    };
  }
  if (normalized === 'afternoon') {
    return {
      startTime: '13:00',
      endTime: '17:30',
      durationsRaw: '40',
      includeBreak: true,
      breakStart: '15:00',
      breakEnd: '15:20',
      includeLunch: false,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      activeWeekdays: [0, 1, 2, 3, 4],
      shiftFilter: 'all',
    };
  }
  if (normalized === 'double') {
    return {
      startTime: '07:30',
      endTime: '17:30',
      durationsRaw: '40,35',
      includeBreak: true,
      breakStart: '09:30',
      breakEnd: '10:00',
      includeLunch: true,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      activeWeekdays: [0, 1, 2, 3, 4],
      shiftFilter: 'all',
    };
  }
  if (normalized === 'custom') {
    return {
      startTime: TEACHER_SCHEDULE_WIZARD.startTime || '07:30',
      endTime: TEACHER_SCHEDULE_WIZARD.endTime || '11:55',
      durationsRaw: TEACHER_SCHEDULE_WIZARD.durationsRaw || '40',
      includeBreak: !!TEACHER_SCHEDULE_WIZARD.includeBreak,
      breakStart: TEACHER_SCHEDULE_WIZARD.breakStart || '09:30',
      breakEnd: TEACHER_SCHEDULE_WIZARD.breakEnd || '10:00',
      includeLunch: !!TEACHER_SCHEDULE_WIZARD.includeLunch,
      lunchStart: TEACHER_SCHEDULE_WIZARD.lunchStart || '12:00',
      lunchEnd: TEACHER_SCHEDULE_WIZARD.lunchEnd || '13:00',
      activeWeekdays: teacherScheduleNormalizeWeekdayList(S?.teacherPlanner?.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS),
      shiftFilter: 'all',
    };
  }
  return {
    startTime: '07:30',
    endTime: '15:30',
    durationsRaw: '45',
    includeBreak: true,
    breakStart: '10:00',
    breakEnd: '10:20',
    includeLunch: true,
    lunchStart: '12:30',
    lunchEnd: '13:10',
    activeWeekdays: [0, 1, 2, 3, 4],
    shiftFilter: 'all',
  };
}
// Gestiona teacher programar aplicar journey preset.
function teacherScheduleApplyJourneyPreset(type, options = {}) {
  // Aplica un preset de jornada para poblar horas base, descansos y días activos del horario.
  ensureTeacherPlannerState();
  const normalized = sanitizeTeacherScheduleJourneyType(type);
  const preset = teacherScheduleJourneyPreset(normalized);
  S.teacherPlanner.journeyType = normalized;
  TEACHER_SCHEDULE_WIZARD.journeyType = normalized;
  if (options.includeWeekdays !== false) {
    S.teacherPlanner.activeWeekdays = teacherScheduleNormalizeWeekdayList(preset.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS);
  }
  if (options.includeWizard !== false) {
    TEACHER_SCHEDULE_WIZARD.startTime = preset.startTime;
    TEACHER_SCHEDULE_WIZARD.endTime = preset.endTime;
    TEACHER_SCHEDULE_WIZARD.durationsRaw = preset.durationsRaw;
    TEACHER_SCHEDULE_WIZARD.includeBreak = !!preset.includeBreak;
    TEACHER_SCHEDULE_WIZARD.breakStart = preset.breakStart;
    TEACHER_SCHEDULE_WIZARD.breakEnd = preset.breakEnd;
    TEACHER_SCHEDULE_WIZARD.includeLunch = !!preset.includeLunch;
    TEACHER_SCHEDULE_WIZARD.lunchStart = preset.lunchStart;
    TEACHER_SCHEDULE_WIZARD.lunchEnd = preset.lunchEnd;
  }
  ensureTeacherScheduleViewState();
  if (normalized !== 'double') S.teacherPlanner.ui.shiftFilter = 'all';
}
// Normaliza normalizar teacher programar time valor.
function normalizeTeacherScheduleTimeValue(value) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return '';
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
// Normaliza normalizar teacher programar label.
function normalizeTeacherScheduleLabel(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
// Gestiona teacher programar normalizar weekday lista.
function teacherScheduleNormalizeWeekdayList(days, fallback = TEACHER_SCHEDULE_DEFAULT_WEEKDAYS) {
  const source = Array.isArray(days) ? days : fallback;
  const normalized = source
    .map((item) => parseInt(item, 10))
    .filter((day, index, list) => Number.isInteger(day) && TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(day) && list.indexOf(day) === index)
    .sort((a, b) => a - b);
  if (normalized.length) return normalized;
  const fallbackList = Array.isArray(fallback) ? fallback : TEACHER_SCHEDULE_DEFAULT_WEEKDAYS;
  return fallbackList
    .map((item) => parseInt(item, 10))
    .filter((day, index, list) => Number.isInteger(day) && TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(day) && list.indexOf(day) === index)
    .sort((a, b) => a - b);
}
// Gestiona teacher programar activo weekdays.
function teacherScheduleActiveWeekdays() {
  ensureTeacherPlannerState();
  const active = teacherScheduleNormalizeWeekdayList(S.teacherPlanner.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS);
  S.teacherPlanner.activeWeekdays = active;
  return active;
}
// Gestiona teacher programar alternar activo weekday.
function teacherScheduleToggleActiveWeekday(weekday, enabled) {
  ensureTeacherPlannerState();
  const target = parseInt(weekday, 10);
  if (!TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(target)) return;
  const current = teacherScheduleNormalizeWeekdayList(S.teacherPlanner.activeWeekdays, TEACHER_SCHEDULE_DEFAULT_WEEKDAYS);
  const next = enabled
    ? teacherScheduleNormalizeWeekdayList([...current, target], TEACHER_SCHEDULE_DEFAULT_WEEKDAYS)
    : current.filter((day) => day !== target);
  if (!next.length) {
    toast('Debes mantener al menos un d?a activo en el horario', true);
    go(currentPage);
    return;
  }
  if (next.length === current.length && next.every((day, index) => day === current[index])) return;
  S.teacherPlanner.activeWeekdays = next;
  persist();
  go(currentPage);
}
// Renderiza renderizar teacher programar activo days controls.
function renderTeacherScheduleActiveDaysControls() {
  const activeDays = teacherScheduleActiveWeekdays();
  return `
    <div class="teacher-schedule-active-days">
      <div class="teacher-schedule-active-days-title">D?as activos del horario</div>
      <div class="planner-day-check-row">
        ${TEACHER_SCHEDULE_ALL_WEEKDAYS.map((weekday) => `
          <label class="planner-day-check">
            <input type="checkbox" ${activeDays.includes(weekday) ? 'checked' : ''} onchange="teacherScheduleToggleActiveWeekday(${weekday}, this.checked)">
            <span>${plannerWeekdayName(weekday)}</span>
          </label>
        `).join('')}
      </div>
      <div class="teacher-schedule-active-days-copy">Lunes a viernes vienen activos por defecto. Activa s?bado o domingo solo cuando realmente los necesites.</div>
    </div>`;
}
// Gestiona sanitize teacher programar block type.
function sanitizeTeacherScheduleBlockType(type) {
  const normalized = type === 'free' ? 'planning' : type;
  return TEACHER_SCHEDULE_BLOCK_TYPES.includes(normalized) ? normalized : 'planning';
}
// Gestiona teacher programar default asignatura for block type.
function teacherScheduleDefaultSubjectForBlockType(type) {
  if (type === 'planning') return 'Hora pedag?gica / planificaci?n';
  if (type === 'break') return 'Receso / recreo';
  if (type === 'lunch') return 'Almuerzo';
  if (type === 'event') return 'Evento institucional';
  return '';
}
// Gestiona infer teacher programar block type.
function inferTeacherScheduleBlockType(row) {
  const subject = normalizeTeacherScheduleLabel(row?.subject || '');
  if (subject.includes('recreo') || subject.includes('receso')) return 'break';
  if (subject.includes('almuerzo')) return 'lunch';
  if (subject.includes('hora pedagogica') || subject.includes('planificacion')) return 'planning';
  if (subject.includes('evento') || subject.includes('izamiento') || subject.includes('arriamiento')) return 'event';
  return subject || row?.sectionId ? 'class' : 'planning';
}
// Gestiona sanitize teacher programar row.
function sanitizeTeacherScheduleRow(row) {
  // Normaliza una fila del horario para que el tablero, el editor y la persistencia usen la misma forma.
  const base = row && typeof row === 'object' ? row : {};
  const section = (S.secciones || []).find((item) => item.id === base.sectionId);
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === (base.gradeId || section?.gradeId || ''));
  return {
    id: base.id || uid(),
    weekday: Number.isInteger(base.weekday) ? base.weekday : (parseInt(base.weekday, 10) || 0),
    startTime: normalizeTeacherScheduleTimeValue(base.startTime || ''),
    endTime: normalizeTeacherScheduleTimeValue(base.endTime || ''),
    blockType: sanitizeTeacherScheduleBlockType(base.blockType || inferTeacherScheduleBlockType(base)),
    subject: String(base.subject || '').trim(),
    area: String(base.area || section?.area || lessonPlanAreaFromGroup(section) || curriculumOfficialSubjectArea(base.subject || '', base.gradeId || section?.gradeId || '', section?.grado || '') || '').trim(),
    gradeId: base.gradeId || section?.gradeId || '',
    educationLevel: normalizeEducationLevelName(base.educationLevel || grade?.educationLevel || ''),
    sectionId: base.sectionId || '',
    room: String(base.room || '').trim(),
    notes: String(base.notes || '').trim(),
  };
}
// Gestiona teacher programar rows sorted.
function teacherScheduleRowsSorted(rows = S.teacherPlanner?.weeklySchedule || []) {
  // Ordena las franjas del horario por día y hora para mostrar siempre una secuencia estable.
  return rows
    .map((row) => sanitizeTeacherScheduleRow(row))
    .filter((row) => row.startTime && row.endTime)
    .sort((a, b) => (a.weekday || 0) - (b.weekday || 0) || String(a.startTime || '').localeCompare(String(b.startTime || ''), 'es') || String(a.endTime || '').localeCompare(String(b.endTime || ''), 'es'));
}
// Gestiona teacher programar rows for activo days.
function teacherScheduleRowsForActiveDays(rows = teacherScheduleRowsSorted()) {
  // Filtra solo los días activos del docente para ocultar franjas fuera de la jornada real.
  const activeDays = teacherScheduleActiveWeekdays();
  return rows.filter((row) => activeDays.includes(parseInt(row.weekday, 10)));
}
// Gestiona teacher programar time to minutes.
function teacherScheduleTimeToMinutes(value) {
  const normalized = normalizeTeacherScheduleTimeValue(value);
  if (!normalized) return null;
  const [hours, minutes] = normalized.split(':').map((part) => parseInt(part, 10));
  return (hours * 60) + minutes;
}
// Gestiona teacher programar minutes to time.
function teacherScheduleMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
// Gestiona teacher programar format time.
function teacherScheduleFormatTime(value) {
  // Convierte una hora HH:MM a formato legible local con un fallback seguro.
  const normalized = normalizeTeacherScheduleTimeValue(value);
  if (!normalized) return '--:--';
  try {
    return new Intl.DateTimeFormat('es-DO', { hour: 'numeric', minute: '2-digit' }).format(new Date(`2025-01-01T${normalized}:00`));
  } catch (_) {
    return normalized;
  }
}
// Gestiona teacher programar rows for weekday.
function teacherScheduleRowsForWeekday(weekday, rows = teacherScheduleRowsForActiveDays()) {
  const target = parseInt(weekday, 10);
  if (!Number.isInteger(target)) return [];
  return rows
    .filter((row) => parseInt(row.weekday, 10) === target)
    .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || ''), 'es') || String(a.endTime || '').localeCompare(String(b.endTime || ''), 'es'));
}
// Gestiona teacher programar intervals overlap.
function teacherScheduleIntervalsOverlap(startA, endA, startB, endB) {
  const aStart = teacherScheduleTimeToMinutes(startA);
  const aEnd = teacherScheduleTimeToMinutes(endA);
  const bStart = teacherScheduleTimeToMinutes(startB);
  const bEnd = teacherScheduleTimeToMinutes(endB);
  if ([aStart, aEnd, bStart, bEnd].some((value) => value === null)) return false;
  return aStart < bEnd && bStart < aEnd;
}
// Gestiona teacher programar find row overlaps.
function teacherScheduleFindRowOverlaps(row, options = {}) {
  const normalized = sanitizeTeacherScheduleRow(row);
  const ignoreKey = String(options.ignoreKey || '');
  const weekday = parseInt(normalized.weekday, 10);
  if (!normalized.startTime || !normalized.endTime || !Number.isInteger(weekday)) return [];
  return teacherScheduleRowsSorted()
    .filter((item) => parseInt(item.weekday, 10) === weekday)
    .filter((item) => teacherScheduleCellKey(item.weekday || 0, item.startTime, item.endTime) !== ignoreKey)
    .filter((item) => teacherScheduleIntervalsOverlap(normalized.startTime, normalized.endTime, item.startTime, item.endTime));
}
// Gestiona teacher programar cell key.
function teacherScheduleCellKey(weekday, startTime, endTime) {
  return `${weekday}-${startTime}-${endTime}`;
}
// Gestiona teacher programar slot key.
function teacherScheduleSlotKey(startTime, endTime) {
  return `${startTime}-${endTime}`;
}
// Gestiona teacher programar slot lista.
function teacherScheduleSlotList(rows = teacherScheduleRowsSorted()) {
  const slotMap = new Map();
  rows.forEach((row) => {
    const key = teacherScheduleSlotKey(row.startTime, row.endTime);
    if (!slotMap.has(key)) slotMap.set(key, { startTime: row.startTime, endTime: row.endTime });
  });
  return Array.from(slotMap.values()).sort((a, b) => String(a.startTime).localeCompare(String(b.startTime), 'es') || String(a.endTime).localeCompare(String(b.endTime), 'es'));
}
// Gestiona teacher programar cell mapear.
function teacherScheduleCellMap(rows = teacherScheduleRowsSorted()) {
  return rows.reduce((map, row) => {
    map.set(teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime), row);
    return map;
  }, new Map());
}
// Gestiona teacher programar subjects.
function teacherScheduleSubjects() {
  return Array.from(new Set([
    ...((S.secciones || []).map((section) => section.materia || '').filter(Boolean)),
    ...((S.grades || []).map((grade) => grade.subjectName || '').filter(Boolean)),
    ...teacherScheduleRowsSorted().map((row) => row.subject || '').filter(Boolean),
  ])).sort((a, b) => String(a).localeCompare(String(b), 'es'));
}
// Gestiona teacher programar area options.
function teacherScheduleAreaOptions(gradeId = '') {
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === gradeId) || null;
  return lessonPlanAreaOptions(gradeId, grade?.name || '');
}
// Gestiona teacher programar sección options.
function teacherScheduleSectionOptions(gradeId = '', area = '') {
  const cleanArea = String(area || '').trim();
  return sortCourses((S.secciones || []).filter((section) => {
    const sameGrade = !gradeId || section.gradeId === gradeId;
    const sectionArea = String(section.area || lessonPlanAreaFromGroup(section) || '').trim();
    const sameArea = !cleanArea || sectionArea === cleanArea;
    return sameGrade && sameArea;
  }));
}
// Gestiona teacher programar asignatura options for borrador.
function teacherScheduleSubjectOptionsForDraft(draft = {}) {
  // Gestiona sección.
  const section = (S.secciones || []).find((item) => item.id === draft.sectionId) || null;
  const gradeId = String(draft.gradeId || section?.gradeId || '').trim();
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === gradeId) || null;
  const area = String(draft.area || section?.area || lessonPlanAreaFromGroup(section) || '').trim();
  return curriculumSubjectOptions({
    gradeId,
    gradeName: grade?.name || '',
    area,
    sectionName: section?.sec || '',
    scopeToExistingSections: !!section?.sec,
  });
}
// Gestiona teacher programar block label.
function teacherScheduleBlockLabel(type, fallbackText = '') {
  if (type === 'class') return fallbackText || 'Clase';
  if (type === 'planning') return fallbackText || 'Hora pedag?gica / planificaci?n';
  if (type === 'break') return 'Recreo / Receso';
  if (type === 'lunch') return 'Almuerzo';
  if (type === 'event') return fallbackText || 'Evento institucional';
  return 'Hora pedag?gica / planificaci?n';
}
// Gestiona teacher programar block type label.
function teacherScheduleBlockTypeLabel(type) {
  if (type === 'class') return 'Clase';
  if (type === 'planning') return 'Hora pedag?gica / planificaci?n';
  if (type === 'break') return 'Receso / recreo';
  if (type === 'lunch') return 'Almuerzo';
  if (type === 'event') return 'Evento institucional';
  return 'Hora pedag?gica / planificaci?n';
}
// Gestiona teacher programar block tone.
function teacherScheduleBlockTone(type) {
  if (type === 'planning') return 'is-planning';
  if (type === 'break') return 'is-break';
  if (type === 'lunch') return 'is-lunch';
  if (type === 'event') return 'is-event';
  return 'is-class';
}
// Gestiona teacher programar cell summary.
function teacherScheduleCellSummary(row) {
  // Gestiona grado.
  const grade = (S.grades || []).find((item) => item.id === row.gradeId) || null;
  // Gestiona sección.
  const section = (S.secciones || []).find((item) => item.id === row.sectionId) || null;
  const title = row.blockType === 'class'
    ? (row.subject || section?.materia || 'Clase')
    : teacherScheduleBlockLabel(row.blockType, row.subject);
  return {
    title,
    kindLabel: row.blockType === 'class' ? 'Clase' : teacherScheduleBlockTypeLabel(row.blockType),
    sectionLabel: section ? `${grade?.name || section.grado || ''} ${section.sec || ''}`.trim() : '',
    roomLabel: row.room ? `Aula ${row.room}` : '',
    notes: row.notes || '',
  };
}
// Gestiona teacher programar validar borrador.
function teacherScheduleValidateDraft(draft, context = {}) {
  // Valida un bloque del horario contra formato, datos académicos y solapes con la jornada existente.
  const normalized = sanitizeTeacherScheduleRow(draft || {});
  const errors = {};
  const startMinutes = teacherScheduleTimeToMinutes(normalized.startTime);
  const endMinutes = teacherScheduleTimeToMinutes(normalized.endTime);
  if (startMinutes === null) errors.startTime = 'Define una hora de inicio v?lida.';
  if (endMinutes === null) errors.endTime = 'Define una hora de fin v?lida.';
  if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
    errors.endTime = 'La hora de fin debe ser mayor que la hora de inicio.';
  }
  const weekday = parseInt(normalized.weekday, 10);
  if (!Number.isInteger(weekday) || !TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(weekday)) {
    errors.weekday = 'Selecciona un d?a v?lido.';
  }
  if (normalized.blockType === 'class') {
    if (!String(normalized.educationLevel || '').trim()) errors.gradeId = 'Debes seleccionar un grado con nivel educativo.';
    if (!String(normalized.gradeId || '').trim()) errors.gradeId = 'Debes seleccionar un grado.';
    if (!String(normalized.area || '').trim()) errors.area = 'Debes seleccionar un ?rea.';
    if (!String(normalized.subject || '').trim()) errors.subject = 'Debes seleccionar una asignatura.';
    if (!String(normalized.sectionId || '').trim()) errors.sectionId = 'Debes seleccionar una secci?n.';
  }
  if (!Object.keys(errors).length) {
    const overlaps = teacherScheduleFindRowOverlaps(normalized, { ignoreKey: context.ignoreKey || '' });
    if (overlaps.length) {
      const overlap = overlaps[0];
      errors.startTime = `Este segmento se solapa con ${teacherScheduleFormatTime(overlap.startTime)} - ${teacherScheduleFormatTime(overlap.endTime)}.`;
    }
  }
  return errors;
}
// Gestiona teacher programar set borrador errors.
function teacherScheduleSetDraftErrors(errors = {}) {
  TEACHER_SCHEDULE_EDITOR.errors = errors && typeof errors === 'object' ? errors : {};
}
// Gestiona teacher programar clear borrador error.
function teacherScheduleClearDraftError(field) {
  if (!field || !TEACHER_SCHEDULE_EDITOR.errors?.[field]) return;
  delete TEACHER_SCHEDULE_EDITOR.errors[field];
}
// Gestiona teacher programar focus first error.
function teacherScheduleFocusFirstError() {
  const body = document.getElementById('schedule-cell-body');
  if (!body) return;
  const fieldSelectors = {
    weekday: `select[data-schedule-field="weekday"]`,
    startTime: `[data-schedule-field="startTime"]`,
    endTime: `[data-schedule-field="endTime"]`,
    gradeId: `select[data-schedule-field="gradeId"]`,
    area: `select[data-schedule-field="area"]`,
    subject: `[data-schedule-field="subject"]`,
    sectionId: `select[data-schedule-field="sectionId"]`,
  };
  const firstKey = ['weekday', 'startTime', 'endTime', 'gradeId', 'area', 'subject', 'sectionId'].find((key) => TEACHER_SCHEDULE_EDITOR.errors?.[key]);
  if (!firstKey) return;
  setTimeout(() => {
    try { body.querySelector(fieldSelectors[firstKey])?.focus(); } catch (_) {}
  }, 0);
}
// Gestiona add teacher planner event.
function addTeacherPlannerEvent() {
  ensureTeacherPlannerState();
  const date = document.getElementById('planner-event-date')?.value || '';
  const title = String(document.getElementById('planner-event-title')?.value || '').trim();
  const type = normalizePlannerEventType(document.getElementById('planner-event-type')?.value || 'custom');
  if (!date || !title) { toast('Completa fecha y título del evento', true); return; }
  S.teacherPlanner.customEvents.push({ id: uid(), date, title, type, source: 'Personal' });
  persist();
  go(currentPage);
  toast('Evento agregado al calendario docente');
}
// Gestiona remove teacher planner event.
async function removeTeacherPlannerEvent(id) {
  ensureTeacherPlannerState();
  S.teacherPlanner.customEvents = S.teacherPlanner.customEvents.filter((event) => event.id !== id);
  persist({ immediate: true });
  go(currentPage);
}
// Inserta o reemplaza una celda semanal usando su llave horaria para evitar duplicados en el planner.
function teacherScheduleUpsertRow(nextRow) {
  ensureTeacherPlannerState();
  const normalized = sanitizeTeacherScheduleRow(nextRow);
  const key = teacherScheduleCellKey(normalized.weekday || 0, normalized.startTime, normalized.endTime);
  const nextRows = teacherScheduleRowsSorted().filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== key);
  nextRows.push(normalized);
  S.teacherPlanner.weeklySchedule = nextRows;
}
// Gestiona teacher programar replace row slot.
function teacherScheduleReplaceRowSlot(weekday, previousStartTime, previousEndTime, nextStartTime, nextEndTime) {
  ensureTeacherPlannerState();
  const rows = teacherScheduleRowsSorted();
  const previousKey = teacherScheduleCellKey(weekday, previousStartTime, previousEndTime);
  const sourceRow = rows.find((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) === previousKey);
  if (!sourceRow) return false;
  const normalized = sanitizeTeacherScheduleRow({ ...sourceRow, startTime: nextStartTime, endTime: nextEndTime });
  const nextKey = teacherScheduleCellKey(weekday, normalized.startTime, normalized.endTime);
  const nextRows = rows.filter((row) => {
    const key = teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime);
    return key !== previousKey && key !== nextKey;
  });
  nextRows.push(normalized);
  S.teacherPlanner.weeklySchedule = nextRows;
  return true;
}
// Gestiona teacher programar get row.
function teacherScheduleGetRow(weekday, startTime, endTime) {
  const key = teacherScheduleCellKey(weekday, startTime, endTime);
  return teacherScheduleRowsSorted().find((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) === key) || null;
}
// Genera una base uniforme de segmentos entre dos horas para usarla como semilla del horario semanal.
function teacherScheduleBuildBaseSlots(startTime, endTime, blockMinutes, options = {}) {
  // Divide un rango horario en bloques fijos para usarlo como base del asistente de horarios.
  const startMinutes = teacherScheduleTimeToMinutes(startTime);
  const endMinutes = teacherScheduleTimeToMinutes(endTime);
  const duration = Math.max(1, parseInt(blockMinutes, 10) || 0);
  const mergeRemainderToLast = options.mergeRemainderToLast !== false;
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes || duration <= 0) return [];
  const slots = [];
  let cursor = startMinutes;
  while ((cursor + duration) <= endMinutes) {
    const next = cursor + duration;
    slots.push({ startTime: teacherScheduleMinutesToTime(cursor), endTime: teacherScheduleMinutesToTime(next) });
    cursor = next;
  }
  if (!slots.length) {
    slots.push({ startTime: teacherScheduleMinutesToTime(startMinutes), endTime: teacherScheduleMinutesToTime(endMinutes) });
    return slots;
  }
  if (cursor < endMinutes) {
    if (mergeRemainderToLast) {
      slots[slots.length - 1].endTime = teacherScheduleMinutesToTime(endMinutes);
    } else {
      slots.push({ startTime: teacherScheduleMinutesToTime(cursor), endTime: teacherScheduleMinutesToTime(endMinutes) });
    }
  }
  return slots;
}
// Gestiona teacher programar analizar durations.
function teacherScheduleParseDurations(raw) {
  const values = String(raw || '')
    .split(/[,\s;/|]+/g)
    .map((item) => parseInt(item, 10))
    .filter((value) => Number.isInteger(value) && value >= 5);
  return values.length ? values : [40];
}
// Gestiona teacher programar collect wizard special segments.
function teacherScheduleCollectWizardSpecialSegments() {
  const specials = [];
  // Gestiona push special.
  const pushSpecial = (enabled, start, end, type, label) => {
    if (!enabled) return;
    const startTime = normalizeTeacherScheduleTimeValue(start);
    const endTime = normalizeTeacherScheduleTimeValue(end);
    if (!startTime || !endTime) return;
    const startMinutes = teacherScheduleTimeToMinutes(startTime);
    const endMinutes = teacherScheduleTimeToMinutes(endTime);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) return;
    specials.push({ startTime, endTime, startMinutes, endMinutes, type, label });
  };
  pushSpecial(!!TEACHER_SCHEDULE_WIZARD.includeBreak, TEACHER_SCHEDULE_WIZARD.breakStart, TEACHER_SCHEDULE_WIZARD.breakEnd, 'break', teacherScheduleDefaultSubjectForBlockType('break'));
  pushSpecial(!!TEACHER_SCHEDULE_WIZARD.includeLunch, TEACHER_SCHEDULE_WIZARD.lunchStart, TEACHER_SCHEDULE_WIZARD.lunchEnd, 'lunch', teacherScheduleDefaultSubjectForBlockType('lunch'));
  return specials.sort((a, b) => a.startMinutes - b.startMinutes);
}
// Compone la secuencia final de segmentos del asistente mezclando bloques pedagógicos y pausas especiales.
function teacherScheduleWizardBuildSegments(startTime, endTime, durations, specials = []) {
  // Construye la secuencia final del asistente mezclando bloques de clase y pausas especiales.
  const startMinutes = teacherScheduleTimeToMinutes(startTime);
  const endMinutes = teacherScheduleTimeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) return [];
  const safeDurations = Array.isArray(durations) && durations.length ? durations : [40];
  const segments = [];
  let cursor = startMinutes;
  let durationIndex = 0;
  const sortedSpecials = specials
    .filter((item) => Number.isInteger(item.startMinutes) && Number.isInteger(item.endMinutes))
    .sort((a, b) => a.startMinutes - b.startMinutes);
  while (cursor < endMinutes) {
    const special = sortedSpecials.find((item) => item.startMinutes >= cursor && item.startMinutes < endMinutes);
    const normalEnd = special ? Math.min(special.startMinutes, endMinutes) : endMinutes;
    while (cursor < normalEnd) {
      const duration = safeDurations[durationIndex % safeDurations.length];
      durationIndex += 1;
      const next = Math.min(cursor + duration, normalEnd);
      if (next <= cursor) break;
      segments.push({
        startTime: teacherScheduleMinutesToTime(cursor),
        endTime: teacherScheduleMinutesToTime(next),
        blockType: 'planning',
        subject: 'Clase / segmento pedag?gico',
      });
      cursor = next;
    }
    if (!special || special.startMinutes < cursor) continue;
    if (special.startMinutes >= endMinutes) break;
    segments.push({
      startTime: teacherScheduleMinutesToTime(special.startMinutes),
      endTime: teacherScheduleMinutesToTime(Math.min(special.endMinutes, endMinutes)),
      blockType: special.type,
      subject: special.label || teacherScheduleDefaultSubjectForBlockType(special.type),
    });
    cursor = Math.min(special.endMinutes, endMinutes);
  }
  return segments.filter((segment) => teacherScheduleTimeToMinutes(segment.endTime) > teacherScheduleTimeToMinutes(segment.startTime));
}
// Pinta el asistente paso a paso que ayuda a generar un horario inicial sin editar cada celda manualmente.
function renderTeacherScheduleWizard() {
  const body = document.getElementById('schedule-wizard-body');
  if (!body) return;
  const step = TEACHER_SCHEDULE_WIZARD.step;
  const progress = `<div class="teacher-schedule-wizard-progress">Paso ${step} de 4</div>`;
  if (step === 1) {
    const currentJourney = sanitizeTeacherScheduleJourneyType(TEACHER_SCHEDULE_WIZARD.journeyType || S.teacherPlanner?.journeyType || 'extended');
    body.innerHTML = `
      ${progress}
      <div class="fg">
        <label class="lbl">?Qu? tipo de jornada trabajas?</label>
        <select class="sel" id="schedule-wizard-journey">
          ${teacherScheduleJourneyOptions().map((option) => `<option value="${option.id}" ${option.id === currentJourney ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
        </select>
        <div class="form-note">La app adaptar? la estructura a tu realidad laboral. Opci?n recomendada: jornada extendida.</div>
      </div>
      <div class="fr">
        <div class="fg"><label class="lbl">Hora de inicio</label><input class="inp" id="schedule-wizard-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.startTime)}"></div>
        <div class="fg"><label class="lbl">Hora de fin</label><input class="inp" id="schedule-wizard-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.endTime)}"></div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-wizard')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="nextTeacherScheduleWizardStep()">Siguiente</button>
      </div>`;
    return;
  }
  if (step === 2) {
    body.innerHTML = `
      ${progress}
      <div class="fg">
        <label class="lbl">Duraci?n de bloques (minutos)</label>
        <input class="inp" id="schedule-wizard-durations" type="text" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.durationsRaw)}" placeholder="Ej. 40 o 40,35">
        <div class="form-note">Puedes usar una o varias duraciones separadas por coma. Ejemplo: 40,35 para alternar por tanda.</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="prevTeacherScheduleWizardStep()">Atrás</button>
        <button class="btn btn-primary" type="button" onclick="nextTeacherScheduleWizardStep()">Siguiente</button>
      </div>`;
    return;
  }
  if (step === 3) {
    body.innerHTML = `
      ${progress}
      <label class="teacher-schedule-modal-check" for="schedule-wizard-break-enabled">
        <input id="schedule-wizard-break-enabled" type="checkbox" ${TEACHER_SCHEDULE_WIZARD.includeBreak ? 'checked' : ''}>
        <span>Incluir recreo / receso</span>
      </label>
      <div class="fr">
        <div class="fg"><label class="lbl">Inicio recreo</label><input class="inp" id="schedule-wizard-break-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.breakStart)}" ${TEACHER_SCHEDULE_WIZARD.includeBreak ? '' : 'disabled'}></div>
        <div class="fg"><label class="lbl">Fin recreo</label><input class="inp" id="schedule-wizard-break-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.breakEnd)}" ${TEACHER_SCHEDULE_WIZARD.includeBreak ? '' : 'disabled'}></div>
      </div>
      <label class="teacher-schedule-modal-check" for="schedule-wizard-lunch-enabled">
        <input id="schedule-wizard-lunch-enabled" type="checkbox" ${TEACHER_SCHEDULE_WIZARD.includeLunch ? 'checked' : ''}>
        <span>Incluir almuerzo</span>
      </label>
      <div class="fr">
        <div class="fg"><label class="lbl">Inicio almuerzo</label><input class="inp" id="schedule-wizard-lunch-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.lunchStart)}" ${TEACHER_SCHEDULE_WIZARD.includeLunch ? '' : 'disabled'}></div>
        <div class="fg"><label class="lbl">Fin almuerzo</label><input class="inp" id="schedule-wizard-lunch-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_WIZARD.lunchEnd)}" ${TEACHER_SCHEDULE_WIZARD.includeLunch ? '' : 'disabled'}></div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="prevTeacherScheduleWizardStep()">Atrás</button>
        <button class="btn btn-primary" type="button" onclick="nextTeacherScheduleWizardStep()">Siguiente</button>
      </div>`;
    const breakToggle = document.getElementById('schedule-wizard-break-enabled');
    const lunchToggle = document.getElementById('schedule-wizard-lunch-enabled');
    breakToggle?.addEventListener('change', () => {
      const enabled = !!breakToggle.checked;
      const startInput = document.getElementById('schedule-wizard-break-start');
      const endInput = document.getElementById('schedule-wizard-break-end');
      if (startInput) startInput.disabled = !enabled;
      if (endInput) endInput.disabled = !enabled;
    });
    lunchToggle?.addEventListener('change', () => {
      const enabled = !!lunchToggle.checked;
      const startInput = document.getElementById('schedule-wizard-lunch-start');
      const endInput = document.getElementById('schedule-wizard-lunch-end');
      if (startInput) startInput.disabled = !enabled;
      if (endInput) endInput.disabled = !enabled;
    });
    return;
  }
  body.innerHTML = `
    ${progress}
    <div class="teacher-schedule-empty-onboarding" style="margin-top:0;">
      <div class="teacher-schedule-empty-onboarding-title">Resumen de la jornada</div>
      <div class="teacher-schedule-empty-onboarding-copy">
        ${escapeHtml(teacherScheduleJourneyMeta(TEACHER_SCHEDULE_WIZARD.journeyType || 'extended').label)} ?
        ${escapeHtml(teacherScheduleFormatTime(TEACHER_SCHEDULE_WIZARD.startTime))} - ${escapeHtml(teacherScheduleFormatTime(TEACHER_SCHEDULE_WIZARD.endTime))} ?
        bloques ${escapeHtml(TEACHER_SCHEDULE_WIZARD.durationsRaw || '40')} min
      </div>
      <div class="teacher-schedule-empty-onboarding-copy">
        Especiales: ${TEACHER_SCHEDULE_WIZARD.includeBreak ? 'Recreo activo' : 'Sin recreo'} ? ${TEACHER_SCHEDULE_WIZARD.includeLunch ? 'Almuerzo activo' : 'Sin almuerzo'}.
      </div>
    </div>
    <div class="mf">
      <button class="btn btn-outline" type="button" onclick="prevTeacherScheduleWizardStep()">Atrás</button>
      <button class="btn btn-primary" type="button" onclick="generateTeacherScheduleFromWizard()">Generar horario base</button>
    </div>`;
}
// Abre abrir teacher programar wizard modal.
function openTeacherScheduleWizardModal() {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  ensureTeacherPlannerState();
  TEACHER_SCHEDULE_WIZARD.journeyType = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || TEACHER_SCHEDULE_WIZARD.journeyType || 'extended');
  TEACHER_SCHEDULE_WIZARD.step = 1;
  renderTeacherScheduleWizard();
  openM('m-schedule-wizard');
}
// Gestiona next teacher programar wizard step.
function nextTeacherScheduleWizardStep() {
  if (TEACHER_SCHEDULE_WIZARD.step === 1) {
    const journeyType = sanitizeTeacherScheduleJourneyType(document.getElementById('schedule-wizard-journey')?.value || TEACHER_SCHEDULE_WIZARD.journeyType || 'extended');
    TEACHER_SCHEDULE_WIZARD.journeyType = journeyType;
    teacherScheduleApplyJourneyPreset(journeyType, { includeWeekdays: true, includeWizard: true });
    const start = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-start')?.value || '');
    const end = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-end')?.value || '');
    const startMinutes = teacherScheduleTimeToMinutes(start);
    const endMinutes = teacherScheduleTimeToMinutes(end);
    if (!start || !end || startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      toast('Define una jornada v?lida con hora de inicio menor que la hora de fin.', true);
      return;
    }
    TEACHER_SCHEDULE_WIZARD.startTime = start;
    TEACHER_SCHEDULE_WIZARD.endTime = end;
  }
  if (TEACHER_SCHEDULE_WIZARD.step === 2) {
    const durationsRaw = String(document.getElementById('schedule-wizard-durations')?.value || '').trim();
    const durations = teacherScheduleParseDurations(durationsRaw);
    if (!durations.length) {
      toast('Escribe al menos una duraci?n v?lida en minutos.', true);
      return;
    }
    TEACHER_SCHEDULE_WIZARD.durationsRaw = durationsRaw || '40';
  }
  if (TEACHER_SCHEDULE_WIZARD.step === 3) {
    TEACHER_SCHEDULE_WIZARD.includeBreak = !!document.getElementById('schedule-wizard-break-enabled')?.checked;
    TEACHER_SCHEDULE_WIZARD.includeLunch = !!document.getElementById('schedule-wizard-lunch-enabled')?.checked;
    TEACHER_SCHEDULE_WIZARD.breakStart = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-break-start')?.value || '');
    TEACHER_SCHEDULE_WIZARD.breakEnd = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-break-end')?.value || '');
    TEACHER_SCHEDULE_WIZARD.lunchStart = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-lunch-start')?.value || '');
    TEACHER_SCHEDULE_WIZARD.lunchEnd = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-wizard-lunch-end')?.value || '');
  }
  TEACHER_SCHEDULE_WIZARD.step = Math.min(4, TEACHER_SCHEDULE_WIZARD.step + 1);
  renderTeacherScheduleWizard();
}
// Gestiona prev teacher programar wizard step.
function prevTeacherScheduleWizardStep() {
  TEACHER_SCHEDULE_WIZARD.step = Math.max(1, TEACHER_SCHEDULE_WIZARD.step - 1);
  renderTeacherScheduleWizard();
}
// Gestiona generate teacher programar from wizard.
function generateTeacherScheduleFromWizard() {
  // Genera un horario semanal completo a partir del asistente paso a paso y reemplaza la base anterior si existe.
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  S.teacherPlanner.journeyType = sanitizeTeacherScheduleJourneyType(TEACHER_SCHEDULE_WIZARD.journeyType || S.teacherPlanner.journeyType || 'extended');
  const durations = teacherScheduleParseDurations(TEACHER_SCHEDULE_WIZARD.durationsRaw);
  const specials = teacherScheduleCollectWizardSpecialSegments();
  const invalidSpecial = specials.find((item) => item.startMinutes < teacherScheduleTimeToMinutes(TEACHER_SCHEDULE_WIZARD.startTime) || item.endMinutes > teacherScheduleTimeToMinutes(TEACHER_SCHEDULE_WIZARD.endTime));
  if (invalidSpecial) {
    toast('Los horarios de recreo/almuerzo deben estar dentro de la jornada.', true);
    return;
  }
  for (let i = 0; i < specials.length; i += 1) {
    const current = specials[i];
    const next = specials[i + 1];
    if (next && current.endMinutes > next.startMinutes) {
      toast('Los segmentos especiales se est?n solapando entre s?.', true);
      return;
    }
  }
  const segments = teacherScheduleWizardBuildSegments(
    TEACHER_SCHEDULE_WIZARD.startTime,
    TEACHER_SCHEDULE_WIZARD.endTime,
    durations,
    specials
  );
  if (!segments.length) {
    toast('No se pudo generar la estructura base. Revisa los datos del asistente.', true);
    return;
  }
  if (teacherScheduleRowsSorted().length && !confirm('Se reemplazar? el horario semanal actual por la estructura generada. ?Deseas continuar?')) return;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  S.teacherPlanner.weeklySchedule = [];
  activeWeekdays.forEach((weekday) => {
    segments.forEach((segment) => {
      S.teacherPlanner.weeklySchedule.push(sanitizeTeacherScheduleRow({
        id: uid(),
        weekday,
        startTime: segment.startTime,
        endTime: segment.endTime,
        blockType: segment.blockType || 'planning',
        subject: segment.subject || teacherScheduleDefaultSubjectForBlockType(segment.blockType || 'planning'),
        gradeId: '',
        sectionId: '',
        area: '',
        room: '',
        notes: '',
      }));
    });
  });
  persist();
  closeM('m-schedule-wizard');
  go(currentPage);
  toast(`Horario generado con ${segments.length} segmento(s) base por d?a (${teacherScheduleJourneyMeta(S.teacherPlanner.journeyType).label}).`);
}
// Gestiona teacher programar checked days.
function teacherScheduleCheckedDays(inputName) {
  return Array.from(document.querySelectorAll(`input[name="${inputName}"]:checked`))
    .map((input) => parseInt(input.value, 10))
    .filter((value, index, list) => Number.isInteger(value) && list.indexOf(value) === index);
}
// Renderiza renderizar teacher programar day checkboxes.
function renderTeacherScheduleDayCheckboxes(inputName, selectedDays = [], excludeWeekday = null) {
  const activeWeekdays = teacherScheduleActiveWeekdays();
  return activeWeekdays
    .filter((weekday) => weekday !== excludeWeekday)
    .map((weekday) => `
      <label class="teacher-schedule-day-pill">
        <input type="checkbox" name="${inputName}" value="${weekday}" ${selectedDays.includes(weekday) ? 'checked' : ''}>
        <span>${plannerWeekdayName(weekday)}</span>
      </label>`).join('');
}
// Abre abrir teacher programar base modal.
function openTeacherScheduleBaseModal() {
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const preset = teacherScheduleJourneyPreset(S.teacherPlanner.journeyType || 'extended');
  const startInput = document.getElementById('schedule-base-start');
  const endInput = document.getElementById('schedule-base-end');
  const durationInput = document.getElementById('schedule-base-duration');
  const specialsInput = document.getElementById('schedule-base-specials');
  const mergeRemainderInput = document.getElementById('schedule-base-merge-remainder');
  const firstDuration = teacherScheduleParseDurations(preset.durationsRaw || '40')[0] || 40;
  if (startInput) startInput.value = preset.startTime || '07:30';
  if (endInput) endInput.value = preset.endTime || '11:55';
  if (durationInput) durationInput.value = String(firstDuration);
  if (specialsInput) specialsInput.checked = !!(preset.includeBreak || preset.includeLunch);
  if (mergeRemainderInput) mergeRemainderInput.checked = true;
  openM('m-schedule-base');
}
// Gestiona generate teacher programar base.
function generateTeacherScheduleBase() {
  // Construye una plantilla rápida de bloques horarios iguales para todos los días activos.
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const slots = teacherScheduleBuildBaseSlots(
    document.getElementById('schedule-base-start')?.value || '',
    document.getElementById('schedule-base-end')?.value || '',
    document.getElementById('schedule-base-duration')?.value || '',
    { mergeRemainderToLast: !!document.getElementById('schedule-base-merge-remainder')?.checked }
  );
  if (!slots.length) {
    toast('Revisa la hora inicial, final y la duraci?n de cada bloque', true);
    return;
  }
  if (teacherScheduleRowsSorted().length && !confirm('Se reemplazar? el horario semanal actual por una nueva base. ?Deseas continuar?')) return;
  S.teacherPlanner.weeklySchedule = [];
  slots.forEach((slot) => {
    activeWeekdays.forEach((weekday) => {
      S.teacherPlanner.weeklySchedule.push({
        id: uid(),
        weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
        blockType: 'planning',
        subject: teacherScheduleDefaultSubjectForBlockType('planning'),
        gradeId: '',
        sectionId: '',
        room: '',
        notes: '',
      });
    });
  });
  persist();
  closeM('m-schedule-base');
  go(currentPage);
  toast(`Horario base generado con ${slots.length} bloque(s) en ${activeWeekdays.length} d?a(s) activo(s)`);
}
// Abre abrir teacher programar cell editor.
function openTeacherScheduleCellEditor(weekday, startTime, endTime) {
  // Abre el editor de un segmento existente y precarga su estado para edición puntual.
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const existing = teacherScheduleGetRow(weekday, startTime, endTime);
  const normalizedWeekday = parseInt(weekday, 10) || 0;
  const normalizedStart = normalizeTeacherScheduleTimeValue(startTime || '');
  const normalizedEnd = normalizeTeacherScheduleTimeValue(endTime || '');
  TEACHER_SCHEDULE_EDITOR.mode = 'edit';
  TEACHER_SCHEDULE_EDITOR.originalKey = teacherScheduleCellKey(normalizedWeekday, normalizedStart, normalizedEnd);
  TEACHER_SCHEDULE_EDITOR.weekday = normalizedWeekday;
  TEACHER_SCHEDULE_EDITOR.startTime = normalizedStart;
  TEACHER_SCHEDULE_EDITOR.endTime = normalizedEnd;
  teacherScheduleSetDraftErrors({});
  TEACHER_SCHEDULE_EDITOR.draft = existing ? { ...existing } : sanitizeTeacherScheduleRow({
    id: uid(),
    weekday,
    startTime,
    endTime,
    blockType: 'planning',
    subject: teacherScheduleDefaultSubjectForBlockType('planning'),
    gradeId: '',
    sectionId: '',
    room: '',
    notes: '',
  });
  renderTeacherScheduleCellEditor();
  openM('m-schedule-cell');
}
// Abre un editor para crear un nuevo segmento en el día indicado tomando el siguiente hueco disponible como punto de partida.
function openTeacherScheduleSegmentEditor(weekday = null) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const view = teacherScheduleGetViewState();
  const targetWeekday = Number.isInteger(parseInt(weekday, 10))
    ? parseInt(weekday, 10)
    : (view.selectedWeekday ?? activeWeekdays[0] ?? 0);
  const dayRows = teacherScheduleRowsForWeekday(targetWeekday);
  const lastRow = dayRows[dayRows.length - 1] || null;
  const nextStart = lastRow?.endTime || '07:30';
  const nextStartMinutes = teacherScheduleTimeToMinutes(nextStart);
  const fallbackEnd = nextStartMinutes === null ? '08:10' : teacherScheduleMinutesToTime(Math.min(nextStartMinutes + 40, (23 * 60) + 59));
  TEACHER_SCHEDULE_EDITOR.mode = 'create';
  TEACHER_SCHEDULE_EDITOR.originalKey = '';
  TEACHER_SCHEDULE_EDITOR.weekday = targetWeekday;
  TEACHER_SCHEDULE_EDITOR.startTime = nextStart;
  TEACHER_SCHEDULE_EDITOR.endTime = fallbackEnd;
  teacherScheduleSetDraftErrors({});
  TEACHER_SCHEDULE_EDITOR.draft = sanitizeTeacherScheduleRow({
    id: uid(),
    weekday: targetWeekday,
    startTime: nextStart,
    endTime: fallbackEnd,
    blockType: 'planning',
    subject: teacherScheduleDefaultSubjectForBlockType('planning'),
    gradeId: '',
    educationLevel: '',
    sectionId: '',
    room: '',
    notes: '',
  });
  renderTeacherScheduleCellEditor();
  openM('m-schedule-cell');
}
// Actualiza el borrador de la celda activa y refresca los selects dependientes cuando cambia grado, área o tipo de bloque.
function setTeacherScheduleCellDraft(field, value) {
  if (!TEACHER_SCHEDULE_EDITOR.draft) return;
  if (field === 'weekday') {
    const nextWeekday = parseInt(value, 10);
    if (Number.isInteger(nextWeekday) && TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(nextWeekday)) {
      TEACHER_SCHEDULE_EDITOR.draft.weekday = nextWeekday;
      TEACHER_SCHEDULE_EDITOR.weekday = nextWeekday;
      teacherScheduleClearDraftError('weekday');
      renderTeacherScheduleCellEditor();
    }
    return;
  }
  if (field === 'startTime' || field === 'endTime') {
    const normalized = normalizeTeacherScheduleTimeValue(value);
    TEACHER_SCHEDULE_EDITOR.draft[field] = normalized;
    TEACHER_SCHEDULE_EDITOR[field] = normalized;
    teacherScheduleClearDraftError(field);
    return;
  }
  if (field === 'blockType') {
    const previousType = sanitizeTeacherScheduleBlockType(TEACHER_SCHEDULE_EDITOR.draft.blockType);
    const nextType = sanitizeTeacherScheduleBlockType(value);
    TEACHER_SCHEDULE_EDITOR.draft.blockType = nextType;
    teacherScheduleSetDraftErrors({});
    if (nextType !== 'class') {
      TEACHER_SCHEDULE_EDITOR.draft.gradeId = '';
      TEACHER_SCHEDULE_EDITOR.draft.sectionId = '';
      TEACHER_SCHEDULE_EDITOR.draft.area = '';
      TEACHER_SCHEDULE_EDITOR.draft.subject = teacherScheduleDefaultSubjectForBlockType(nextType);
    } else if (!TEACHER_SCHEDULE_EDITOR.draft.subject || TEACHER_SCHEDULE_EDITOR.draft.subject === teacherScheduleDefaultSubjectForBlockType(previousType) || previousType !== 'class') {
      TEACHER_SCHEDULE_EDITOR.draft.subject = '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  if (field === 'gradeId') {
    TEACHER_SCHEDULE_EDITOR.draft.gradeId = value || '';
    // Gestiona grado.
    const grade = (S.grades || []).find((item) => item.id === TEACHER_SCHEDULE_EDITOR.draft.gradeId);
    TEACHER_SCHEDULE_EDITOR.draft.educationLevel = normalizeEducationLevelName(grade?.educationLevel || '');
    teacherScheduleClearDraftError('gradeId');
    const allowedAreas = teacherScheduleAreaOptions(value);
    if (!allowedAreas.includes(String(TEACHER_SCHEDULE_EDITOR.draft.area || '').trim())) {
      TEACHER_SCHEDULE_EDITOR.draft.area = '';
    }
    const allowedSections = teacherScheduleSectionOptions(value, TEACHER_SCHEDULE_EDITOR.draft.area || '');
    if (!allowedSections.some((section) => section.id === TEACHER_SCHEDULE_EDITOR.draft.sectionId)) TEACHER_SCHEDULE_EDITOR.draft.sectionId = '';
    const allowedSubjects = teacherScheduleSubjectOptionsForDraft(TEACHER_SCHEDULE_EDITOR.draft);
    if (!allowedSubjects.some((subject) => subject.value === TEACHER_SCHEDULE_EDITOR.draft.subject)) {
      TEACHER_SCHEDULE_EDITOR.draft.subject = allowedSubjects.length === 1 ? allowedSubjects[0].value : '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  if (field === 'area') {
    TEACHER_SCHEDULE_EDITOR.draft.area = String(value || '').trim();
    teacherScheduleClearDraftError('area');
    const allowedSections = teacherScheduleSectionOptions(TEACHER_SCHEDULE_EDITOR.draft.gradeId || '', TEACHER_SCHEDULE_EDITOR.draft.area || '');
    if (!allowedSections.some((section) => section.id === TEACHER_SCHEDULE_EDITOR.draft.sectionId)) TEACHER_SCHEDULE_EDITOR.draft.sectionId = '';
    const allowedSubjects = teacherScheduleSubjectOptionsForDraft(TEACHER_SCHEDULE_EDITOR.draft);
    if (!allowedSubjects.some((subject) => subject.value === TEACHER_SCHEDULE_EDITOR.draft.subject)) {
      TEACHER_SCHEDULE_EDITOR.draft.subject = allowedSubjects.length === 1 ? allowedSubjects[0].value : '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  if (field === 'sectionId') {
    TEACHER_SCHEDULE_EDITOR.draft.sectionId = value || '';
    teacherScheduleClearDraftError('sectionId');
    // Gestiona sección.
    const section = (S.secciones || []).find((item) => item.id === value);
    if (section) {
      TEACHER_SCHEDULE_EDITOR.draft.gradeId = section.gradeId || TEACHER_SCHEDULE_EDITOR.draft.gradeId || '';
      TEACHER_SCHEDULE_EDITOR.draft.area = section.area || lessonPlanAreaFromGroup(section) || TEACHER_SCHEDULE_EDITOR.draft.area || '';
      TEACHER_SCHEDULE_EDITOR.draft.subject = section.materia || '';
    }
    renderTeacherScheduleCellEditor();
    return;
  }
  TEACHER_SCHEDULE_EDITOR.draft[field] = value;
  if (field === 'subject') {
    teacherScheduleClearDraftError('subject');
    if (TEACHER_SCHEDULE_EDITOR.draft.blockType === 'class') renderTeacherScheduleCellEditor();
  }
}
// Persiste la celda actualmente abierta después de validar horarios, solapes y dependencias académicas.
function saveTeacherScheduleCell() {
  // Valida y guarda un segmento puntual del horario, evitando solapes con el resto de la jornada.
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  if (!draft) return;
  const weekday = parseInt(draft.weekday, 10);
  const startTime = normalizeTeacherScheduleTimeValue(draft.startTime || '');
  const endTime = normalizeTeacherScheduleTimeValue(draft.endTime || '');
  const errors = teacherScheduleValidateDraft(
    { ...draft, weekday, startTime, endTime },
    { ignoreKey: TEACHER_SCHEDULE_EDITOR.originalKey || '' }
  );
  if (Object.keys(errors).length) {
    teacherScheduleSetDraftErrors(errors);
    renderTeacherScheduleCellEditor();
    teacherScheduleFocusFirstError();
    const overlapError = errors.startTime && String(errors.startTime).includes('se solapa');
    toast(overlapError ? 'Hay solapamientos en ese d?a. Ajusta el horario del segmento.' : 'Completa los datos requeridos para guardar este segmento.', true);
    return;
  }
  teacherScheduleSetDraftErrors({});
  const nextRow = sanitizeTeacherScheduleRow({
    ...draft,
    weekday,
    startTime,
    endTime,
  });
  if (nextRow.blockType !== 'class') {
    nextRow.gradeId = '';
    nextRow.educationLevel = '';
    nextRow.sectionId = '';
    nextRow.area = '';
  }
  const nextKey = teacherScheduleCellKey(nextRow.weekday || 0, nextRow.startTime, nextRow.endTime);
  const originalKey = String(TEACHER_SCHEDULE_EDITOR.originalKey || '');
  const rows = teacherScheduleRowsSorted().filter((row) => {
    const key = teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime);
    return key !== originalKey && key !== nextKey;
  });
  rows.push(nextRow);
  S.teacherPlanner.weeklySchedule = rows;
  persist();
  closeM('m-schedule-cell');
  go(currentPage);
  toast(TEACHER_SCHEDULE_EDITOR.mode === 'create' ? 'Segmento creado' : 'Segmento actualizado');
}
// Elimina la celda que se está editando usando la llave original guardada en el editor.
function clearTeacherScheduleCell() {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  if (!draft) return;
  if (TEACHER_SCHEDULE_EDITOR.mode === 'create') {
    closeM('m-schedule-cell');
    return;
  }
  const originalKey = String(TEACHER_SCHEDULE_EDITOR.originalKey || '');
  if (!originalKey) return;
  S.teacherPlanner.weeklySchedule = teacherScheduleRowsSorted().filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== originalKey);
  persist();
  closeM('m-schedule-cell');
  go(currentPage);
  toast('Segmento eliminado');
}
// Duplica la celda actual hacia otros días seleccionados para acelerar la construcción del horario semanal.
function duplicateTeacherScheduleCell() {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  if (!draft) return;
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-duplicate-day');
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a para duplicar la celda', true);
    return;
  }
  for (const weekday of targetDays) {
    const nextRow = sanitizeTeacherScheduleRow({ ...draft, id: uid(), weekday, startTime: draft.startTime, endTime: draft.endTime });
    const overlaps = teacherScheduleFindRowOverlaps(nextRow);
    if (overlaps.length) {
      toast(`No se pudo duplicar en ${plannerWeekdayName(weekday)} porque existe solapamiento horario.`, true);
      continue;
    }
    const nextKey = teacherScheduleCellKey(nextRow.weekday || 0, nextRow.startTime, nextRow.endTime);
    S.teacherPlanner.weeklySchedule = teacherScheduleRowsSorted().filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== nextKey);
    S.teacherPlanner.weeklySchedule.push(nextRow);
  }
  persist();
  closeM('m-schedule-cell');
  go(currentPage);
  toast(`Segmento duplicado a ${targetDays.length} d?a(s)`);
}
// Renderiza renderizar teacher programar cell editor.
function renderTeacherScheduleCellEditor() {
  // Pinta el formulario modal de edición de segmento con sus errores y opciones dependientes del contexto.
  const draft = TEACHER_SCHEDULE_EDITOR.draft;
  const body = document.getElementById('schedule-cell-body');
  const title = document.getElementById('schedule-cell-title');
  if (!draft || !body || !title) return;
  const grades = getSortedGrades();
  const areas = teacherScheduleAreaOptions(draft.gradeId || '');
  const sections = teacherScheduleSectionOptions(draft.gradeId || '', draft.area || '');
  const subjectOptions = teacherScheduleSubjectOptionsForDraft(draft);
  const errors = TEACHER_SCHEDULE_EDITOR.errors || {};
  const isClass = draft.blockType === 'class';
  title.textContent = `${TEACHER_SCHEDULE_EDITOR.mode === 'create' ? 'Nuevo segmento' : 'Editar segmento'} ? ${plannerWeekdayName(parseInt(draft.weekday, 10) || 0)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-meta">
        <span class="teacher-schedule-modal-chip">${plannerWeekdayName(parseInt(draft.weekday, 10) || 0)}</span>
        <span class="teacher-schedule-modal-chip">${teacherScheduleFormatTime(draft.startTime)} - ${teacherScheduleFormatTime(draft.endTime)}</span>
      </div>
      <div class="fr">
        <div class="fg teacher-schedule-form-field ${errors.weekday ? 'has-error' : ''}">
          <label class="lbl">D?a</label>
          <select class="sel" data-schedule-field="weekday" onchange="setTeacherScheduleCellDraft('weekday', this.value)">
            ${teacherScheduleActiveWeekdays().map((weekday) => `<option value="${weekday}" ${parseInt(draft.weekday, 10) === weekday ? 'selected' : ''}>${plannerWeekdayName(weekday)}</option>`).join('')}
          </select>
          ${errors.weekday ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.weekday)}</small>` : ''}
        </div>
        <div class="fg teacher-schedule-form-field ${errors.startTime ? 'has-error' : ''}">
          <label class="lbl">Hora de inicio</label>
          <input class="inp" data-schedule-field="startTime" type="time" value="${escapeHtml(draft.startTime || '')}" oninput="setTeacherScheduleCellDraft('startTime', this.value)">
          ${errors.startTime ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.startTime)}</small>` : ''}
        </div>
        <div class="fg teacher-schedule-form-field ${errors.endTime ? 'has-error' : ''}">
          <label class="lbl">Hora de fin</label>
          <input class="inp" data-schedule-field="endTime" type="time" value="${escapeHtml(draft.endTime || '')}" oninput="setTeacherScheduleCellDraft('endTime', this.value)">
          ${errors.endTime ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.endTime)}</small>` : ''}
        </div>
      </div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">Tipo de segmento</label>
          <select class="sel" onchange="setTeacherScheduleCellDraft('blockType', this.value)">
            ${TEACHER_SCHEDULE_BLOCK_TYPES.map((type) => `<option value="${type}" ${type === draft.blockType ? 'selected' : ''}>${teacherScheduleBlockTypeLabel(type)}</option>`).join('')}
          </select>
        </div>
        <div class="fg teacher-schedule-form-field ${errors.gradeId ? 'has-error' : ''}">
          <label class="lbl">Grado</label>
          <select class="sel" data-schedule-field="gradeId" onchange="setTeacherScheduleCellDraft('gradeId', this.value)" ${isClass ? '' : 'disabled'}>
            <option value="">Selecciona un grado</option>
            ${grades.map((grade) => `<option value="${grade.id}" ${grade.id === draft.gradeId ? 'selected' : ''}>${escapeHtml(grade.name)}</option>`).join('')}
          </select>
          ${errors.gradeId ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.gradeId)}</small>` : ''}
        </div>
        <div class="fg">
          <label class="lbl">Nivel</label>
          <input class="inp" type="text" value="${escapeHtml(normalizeEducationLevelName(((S.grades || []).find((grade) => grade.id === draft.gradeId)?.educationLevel || draft.educationLevel || '')) || (isClass ? 'Selecciona un grado' : 'No aplica'))}" readonly>
        </div>
      </div>
      <div class="fr ${isClass ? '' : 'teacher-schedule-fields-disabled'}">
        <div class="fg teacher-schedule-form-field ${errors.area ? 'has-error' : ''}">
          <label class="lbl">?rea</label>
          <select class="sel" data-schedule-field="area" onchange="setTeacherScheduleCellDraft('area', this.value)" ${isClass ? '' : 'disabled'}>
            <option value="">Selecciona un área</option>
            ${areas.map((area) => `<option value="${escapeHtml(area)}" ${area === draft.area ? 'selected' : ''}>${escapeHtml(area)}</option>`).join('')}
          </select>
          ${errors.area ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.area)}</small>` : ''}
        </div>
        <div class="fg teacher-schedule-form-field ${errors.subject ? 'has-error' : ''}">
          <label class="lbl">${isClass ? 'Asignatura' : 'Nombre del bloque'}</label>
          ${isClass ? `
            <select class="sel" data-schedule-field="subject" onchange="setTeacherScheduleCellDraft('subject', this.value)">
              <option value="">${String(draft.area || '').trim() ? 'Selecciona una asignatura' : 'Selecciona un área primero'}</option>
              ${subjectOptions.map((subject) => `<option value="${escapeHtml(subject.value)}" ${subject.value === draft.subject ? 'selected' : ''}>${escapeHtml(subject.label)}</option>`).join('')}
            </select>` : `
            <input class="inp" data-schedule-field="subject" type="text" value="${escapeHtml(draft.subject || '')}" placeholder="${teacherScheduleBlockLabel(draft.blockType)}" oninput="setTeacherScheduleCellDraft('subject', this.value)">`}
          ${errors.subject ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.subject)}</small>` : ''}
        </div>
      </div>
      <div class="fr ${isClass ? '' : 'teacher-schedule-fields-disabled'}">
        <div class="fg teacher-schedule-form-field ${errors.sectionId ? 'has-error' : ''}">
          <label class="lbl">Secci?n</label>
          <select class="sel" data-schedule-field="sectionId" onchange="setTeacherScheduleCellDraft('sectionId', this.value)" ${isClass ? '' : 'disabled'}>
            <option value="">Selecciona una sección</option>
            ${sections.map((section) => `<option value="${section.id}" ${section.id === draft.sectionId ? 'selected' : ''}>${escapeHtml(`${section.sec} ? ${section.materia || 'General'}`)}</option>`).join('')}
          </select>
          ${errors.sectionId ? `<small class="teacher-schedule-field-error">${escapeHtml(errors.sectionId)}</small>` : ''}
        </div>
      </div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">Aula</label>
          <input class="inp" type="text" value="${escapeHtml(draft.room || '')}" placeholder="Opcional" oninput="setTeacherScheduleCellDraft('room', this.value)">
        </div>
        <div class="fg">
          <label class="lbl">Observaci?n</label>
          <input class="inp" type="text" value="${escapeHtml(draft.notes || '')}" placeholder="Opcional" oninput="setTeacherScheduleCellDraft('notes', this.value)">
        </div>
      </div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">Duplicar este segmento a otros d?as</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-duplicate-day', [], TEACHER_SCHEDULE_EDITOR.weekday)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-cell')">Cerrar</button>
        <button class="btn btn-outline" type="button" onclick="clearTeacherScheduleCell()">${TEACHER_SCHEDULE_EDITOR.mode === 'create' ? 'Cancelar' : 'Eliminar segmento'}</button>
        <button class="btn btn-outline" type="button" onclick="duplicateTeacherScheduleCell()">Duplicar</button>
        <button class="btn btn-primary" type="button" onclick="saveTeacherScheduleCell()">Guardar</button>
      </div>
    </div>`;
}
// Abre abrir teacher programar row copy modal.
function openTeacherScheduleRowCopyModal(startTime, endTime) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const sourceRow = teacherScheduleRowsForActiveDays().find((row) => row.startTime === startTime && row.endTime === endTime && activeWeekdays.includes(row.weekday));
  TEACHER_SCHEDULE_ROW_COPY.startTime = startTime;
  TEACHER_SCHEDULE_ROW_COPY.endTime = endTime;
  TEACHER_SCHEDULE_ROW_COPY.sourceWeekday = sourceRow?.weekday ?? activeWeekdays[0] ?? 0;
  renderTeacherScheduleRowCopyModal();
  openM('m-schedule-row-copy');
}
// Actualiza set teacher programar row copy source weekday.
function setTeacherScheduleRowCopySourceWeekday(value) {
  TEACHER_SCHEDULE_ROW_COPY.sourceWeekday = parseInt(value, 10) || 0;
  renderTeacherScheduleRowCopyModal();
}
// Renderiza renderizar teacher programar row copy modal.
function renderTeacherScheduleRowCopyModal() {
  const body = document.getElementById('schedule-row-copy-body');
  const title = document.getElementById('schedule-row-copy-title');
  if (!body || !title) return;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const sourceWeekdays = Array.from(new Set(
    teacherScheduleRowsForActiveDays()
      .filter((row) => row.startTime === TEACHER_SCHEDULE_ROW_COPY.startTime && row.endTime === TEACHER_SCHEDULE_ROW_COPY.endTime)
      .map((row) => parseInt(row.weekday, 10))
      .filter((weekday) => activeWeekdays.includes(weekday))
  ));
  const availableSourceDays = sourceWeekdays.length ? sourceWeekdays : activeWeekdays;
  if (!availableSourceDays.includes(TEACHER_SCHEDULE_ROW_COPY.sourceWeekday)) {
    TEACHER_SCHEDULE_ROW_COPY.sourceWeekday = availableSourceDays[0] ?? 0;
  }
  title.textContent = `Copiar a otros d?as ? ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_COPY.startTime)} - ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_COPY.endTime)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-help">Esta acci?n copia la configuraci?n de esta misma franja horaria desde el d?a origen hacia los d?as destino que selecci\u00f3nes.</div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">D?a origen</label>
          <select class="sel" onchange="setTeacherScheduleRowCopySourceWeekday(this.value)">
            ${availableSourceDays.map((weekday) => `<option value="${weekday}" ${weekday === TEACHER_SCHEDULE_ROW_COPY.sourceWeekday ? 'selected' : ''}>${plannerWeekdayName(weekday)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">D?as destino</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-row-copy-day', [], TEACHER_SCHEDULE_ROW_COPY.sourceWeekday)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-row-copy')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="copyTeacherScheduleRowToDays()">Copiar a otros d?as</button>
      </div>
    </div>`;
}
// Gestiona copy teacher programar row to days.
function copyTeacherScheduleRowToDays() {
  const sourceWeekday = Number.isInteger(TEACHER_SCHEDULE_ROW_COPY.sourceWeekday) ? TEACHER_SCHEDULE_ROW_COPY.sourceWeekday : 0;
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-row-copy-day').filter((weekday) => weekday !== sourceWeekday);
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a destino', true);
    return;
  }
  const sourceRow = teacherScheduleGetRow(sourceWeekday, TEACHER_SCHEDULE_ROW_COPY.startTime, TEACHER_SCHEDULE_ROW_COPY.endTime);
  if (!sourceRow) {
    toast('No se encontr? un bloque origen en ese d?a y hora', true);
    return;
  }
  targetDays.forEach((weekday) => {
    teacherScheduleUpsertRow({ ...sourceRow, id: uid(), weekday });
  });
  persist();
  closeM('m-schedule-row-copy');
  go(currentPage);
  toast(`Segmento copiado a ${targetDays.length} d?a(s)`);
}
// Abre abrir teacher programar row adjust modal.
function openTeacherScheduleRowAdjustModal(startTime, endTime) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  TEACHER_SCHEDULE_ROW_ADJUST.startTime = startTime;
  TEACHER_SCHEDULE_ROW_ADJUST.endTime = endTime;
  renderTeacherScheduleRowAdjustModal();
  openM('m-schedule-row-adjust');
}
// Renderiza renderizar teacher programar row adjust modal.
function renderTeacherScheduleRowAdjustModal() {
  const body = document.getElementById('schedule-row-adjust-body');
  const title = document.getElementById('schedule-row-adjust-title');
  if (!body || !title) return;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  title.textContent = `Ajustar franja horaria ? ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_ADJUST.startTime)} - ${teacherScheduleFormatTime(TEACHER_SCHEDULE_ROW_ADJUST.endTime)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-help">Usa este ajuste para absorber minutos sobrantes en bloques como receso, almuerzo, eventos o planificaci?n, sin regenerar todo el horario.</div>
      <div class="fr">
        <div class="fg">
          <label class="lbl">Hora de inicio</label>
          <input class="inp" id="schedule-row-adjust-start" type="time" value="${escapeHtml(TEACHER_SCHEDULE_ROW_ADJUST.startTime)}">
        </div>
        <div class="fg">
          <label class="lbl">Hora de fin</label>
          <input class="inp" id="schedule-row-adjust-end" type="time" value="${escapeHtml(TEACHER_SCHEDULE_ROW_ADJUST.endTime)}">
        </div>
      </div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">Aplicar ajuste en estos d?as</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-row-adjust-day', activeWeekdays)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-row-adjust')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="applyTeacherScheduleRowAdjust()">Guardar ajuste</button>
      </div>
    </div>`;
}
// Aplica aplicar teacher programar row adjust.
function applyTeacherScheduleRowAdjust() {
  const nextStart = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-row-adjust-start')?.value || '');
  const nextEnd = normalizeTeacherScheduleTimeValue(document.getElementById('schedule-row-adjust-end')?.value || '');
  const startMinutes = teacherScheduleTimeToMinutes(nextStart);
  const endMinutes = teacherScheduleTimeToMinutes(nextEnd);
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    toast('Define una franja v?lida con hora de inicio menor que hora de fin', true);
    return;
  }
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-row-adjust-day');
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a para aplicar el ajuste', true);
    return;
  }
  const hasSlotChange = nextStart !== TEACHER_SCHEDULE_ROW_ADJUST.startTime || nextEnd !== TEACHER_SCHEDULE_ROW_ADJUST.endTime;
  if (hasSlotChange) {
    const collisions = targetDays.filter((weekday) => !!teacherScheduleGetRow(weekday, nextStart, nextEnd));
    if (collisions.length && !confirm(`Ya existe una franja ${teacherScheduleFormatTime(nextStart)} - ${teacherScheduleFormatTime(nextEnd)} en ${collisions.length} d?a(s). ?Deseas reemplazarla con este ajuste?`)) {
      return;
    }
  }
  let updated = 0;
  targetDays.forEach((weekday) => {
    if (teacherScheduleReplaceRowSlot(weekday, TEACHER_SCHEDULE_ROW_ADJUST.startTime, TEACHER_SCHEDULE_ROW_ADJUST.endTime, nextStart, nextEnd)) updated += 1;
  });
  if (!updated) {
    toast('No se encontraron bloques para ajustar en los d?as selecci\u00f3nados', true);
    return;
  }
  persist();
  closeM('m-schedule-row-adjust');
  go(currentPage);
  toast(`Franja ajustada en ${updated} d?a(s)`);
}
// Elimina eliminar teacher programar segment.
function deleteTeacherScheduleSegment(weekday, startTime, endTime) {
  const key = teacherScheduleCellKey(parseInt(weekday, 10) || 0, normalizeTeacherScheduleTimeValue(startTime || ''), normalizeTeacherScheduleTimeValue(endTime || ''));
  if (!key || !confirm('?Eliminar este segmento del horario?')) return;
  const rows = teacherScheduleRowsSorted();
  const nextRows = rows.filter((row) => teacherScheduleCellKey(row.weekday || 0, row.startTime, row.endTime) !== key);
  if (nextRows.length === rows.length) return;
  S.teacherPlanner.weeklySchedule = nextRows;
  persist();
  go(currentPage);
  toast('Segmento eliminado');
}
// Abre abrir teacher programar day duplicate modal.
function openTeacherScheduleDayDuplicateModal(sourceWeekday) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const body = document.getElementById('schedule-row-copy-body');
  const title = document.getElementById('schedule-row-copy-title');
  if (!body || !title) return;
  const source = parseInt(sourceWeekday, 10);
  const activeDays = teacherScheduleActiveWeekdays();
  if (!activeDays.includes(source)) return;
  title.textContent = `Duplicar d?a completo ? ${plannerWeekdayName(source)}`;
  body.innerHTML = `
    <div class="teacher-schedule-modal-shell">
      <div class="teacher-schedule-modal-help">Se copiar?n todos los segmentos de ${plannerWeekdayName(source)} a los d?as destino que selecci\u00f3nes.</div>
      <div class="teacher-schedule-duplicate-box">
        <div class="teacher-schedule-duplicate-title">D?as destino</div>
        <div class="teacher-schedule-day-row">${renderTeacherScheduleDayCheckboxes('teacher-schedule-day-copy-day', [], source)}</div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" type="button" onclick="closeM('m-schedule-row-copy')">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="copyTeacherScheduleDayToDays(${source})">Duplicar d?a</button>
      </div>
    </div>`;
  openM('m-schedule-row-copy');
}
// Gestiona copy teacher programar day to days.
function copyTeacherScheduleDayToDays(sourceWeekday) {
  const source = parseInt(sourceWeekday, 10);
  const targetDays = teacherScheduleCheckedDays('teacher-schedule-day-copy-day').filter((weekday) => weekday !== source);
  if (!targetDays.length) {
    toast('Selecciona al menos un d?a destino', true);
    return;
  }
  const sourceRows = teacherScheduleRowsForWeekday(source);
  if (!sourceRows.length) {
    toast('Ese d?a no tiene segmentos para duplicar', true);
    return;
  }
  let nextRows = teacherScheduleRowsSorted();
  targetDays.forEach((weekday) => {
    nextRows = nextRows.filter((row) => parseInt(row.weekday, 10) !== weekday);
    sourceRows.forEach((row) => {
      nextRows.push(sanitizeTeacherScheduleRow({ ...row, id: uid(), weekday }));
    });
  });
  S.teacherPlanner.weeklySchedule = nextRows;
  persist();
  closeM('m-schedule-row-copy');
  go(currentPage);
  toast(`? D?a duplicado en ${targetDays.length} destino(s)`);
}
// Asegura asegurar teacher programar vista estado.
function ensureTeacherScheduleViewState() {
  ensureTeacherPlannerState();
  if (!S.teacherPlanner.ui || typeof S.teacherPlanner.ui !== 'object') {
    S.teacherPlanner.ui = {};
  }
  const activeDays = teacherScheduleActiveWeekdays();
  const fallbackDay = activeDays[0] ?? 0;
  const selectedWeekday = parseInt(S.teacherPlanner.ui.selectedWeekday, 10);
  S.teacherPlanner.ui.selectedWeekday = activeDays.includes(selectedWeekday) ? selectedWeekday : fallbackDay;
  S.teacherPlanner.ui.shiftFilter = ['all', 'morning', 'afternoon'].includes(S.teacherPlanner.ui.shiftFilter) ? S.teacherPlanner.ui.shiftFilter : 'all';
  if (S.teacherPlanner.journeyType !== 'double') S.teacherPlanner.ui.shiftFilter = 'all';
  S.teacherPlanner.ui.showMatrix = !!S.teacherPlanner.ui.showMatrix;
  S.teacherPlanner.ui.showLegend = S.teacherPlanner.ui.showLegend !== false;
  S.teacherPlanner.ui.showAdvanced = !!S.teacherPlanner.ui.showAdvanced;
  S.teacherPlanner.ui.showSystemMenu = !!S.teacherPlanner.ui.showSystemMenu;
}
// Gestiona teacher programar get vista estado.
function teacherScheduleGetViewState() {
  ensureTeacherScheduleViewState();
  return S.teacherPlanner.ui;
}
// Actualiza set teacher programar seleccionado day.
function setTeacherScheduleSelectedDay(weekday) {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  const next = parseInt(weekday, 10);
  if (!TEACHER_SCHEDULE_ALL_WEEKDAYS.includes(next)) return;
  S.teacherPlanner.ui.selectedWeekday = next;
  persist();
  go(currentPage);
}
// Actualiza set teacher programar shift filtro.
function setTeacherScheduleShiftFilter(filter) {
  ensureTeacherScheduleViewState();
  if (S.teacherPlanner.journeyType !== 'double') return;
  S.teacherPlanner.ui.showSystemMenu = false;
  const next = ['all', 'morning', 'afternoon'].includes(filter) ? filter : 'all';
  if (S.teacherPlanner.ui.shiftFilter === next) return;
  S.teacherPlanner.ui.shiftFilter = next;
  persist();
  go(currentPage);
}
// Actualiza set teacher programar journey type.
function setTeacherScheduleJourneyType(type) {
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  const next = sanitizeTeacherScheduleJourneyType(type);
  if (S.teacherPlanner.journeyType === next) return;
  const hasRows = teacherScheduleRowsSorted().length > 0;
  teacherScheduleApplyJourneyPreset(next, { includeWizard: true, includeWeekdays: !hasRows });
  persist();
  go(currentPage);
  const meta = teacherScheduleJourneyMeta(next);
  toast(`? Jornada aplicada: ${meta.label}`);
}
// Alterna alternar teacher programar matrix.
function toggleTeacherScheduleMatrix() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  S.teacherPlanner.ui.showMatrix = !S.teacherPlanner.ui.showMatrix;
  persist();
  go(currentPage);
}
// Alterna alternar teacher programar legend.
function toggleTeacherScheduleLegend() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  S.teacherPlanner.ui.showLegend = !S.teacherPlanner.ui.showLegend;
  persist();
  go(currentPage);
}
// Alterna alternar teacher programar advanced panel.
function toggleTeacherScheduleAdvancedPanel() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = false;
  S.teacherPlanner.ui.showAdvanced = !S.teacherPlanner.ui.showAdvanced;
  persist();
  go(currentPage);
}
// Alterna alternar teacher programar system menu.
function toggleTeacherScheduleSystemMenu() {
  ensureTeacherScheduleViewState();
  S.teacherPlanner.ui.showSystemMenu = !S.teacherPlanner.ui.showSystemMenu;
  go(currentPage);
}
// Cierra cerrar teacher programar system menu.
function closeTeacherScheduleSystemMenu(options = {}) {
  ensureTeacherScheduleViewState();
  if (!S.teacherPlanner.ui.showSystemMenu) return;
  S.teacherPlanner.ui.showSystemMenu = false;
  if (options.rerender !== false) go(currentPage);
}
// Gestiona teacher programar system menu action.
function teacherScheduleSystemMenuAction(action) {
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  if (action === 'matrix') {
    toggleTeacherScheduleMatrix();
    return;
  }
  if (action === 'pdf') {
    go(currentPage);
    teacherScheduleDownloadPdf();
    return;
  }
  if (action === 'word') {
    go(currentPage);
    teacherScheduleDownloadWord();
    return;
  }
  if (action === 'clear') {
    go(currentPage);
    clearTeacherScheduleBoard();
  }
}
// Gestiona teacher programar shift for row.
function teacherScheduleShiftForRow(row) {
  const start = teacherScheduleTimeToMinutes(row?.startTime || '');
  if (start === null) return 'morning';
  return start < (12 * 60) ? 'morning' : 'afternoon';
}
// Gestiona teacher programar uses split shifts.
function teacherScheduleUsesSplitShifts() {
  ensureTeacherPlannerState();
  return S.teacherPlanner.journeyType === 'double';
}
// Gestiona teacher programar journey heading.
function teacherScheduleJourneyHeading() {
  ensureTeacherPlannerState();
  const type = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || 'extended');
  if (type === 'morning') return 'Tanda matutina';
  if (type === 'afternoon') return 'Tanda vespertina';
  if (type === 'double') return 'Doble tanda';
  if (type === 'custom') return 'Jornada personalizada';
  return 'Jornada extendida';
}
// Renderiza renderizar teacher programar journey selector.
function renderTeacherScheduleJourneySelector() {
  ensureTeacherPlannerState();
  const current = sanitizeTeacherScheduleJourneyType(S.teacherPlanner.journeyType || 'extended');
  return `<div class="teacher-schedule-journey-selector">
    <div class="teacher-schedule-journey-label">Tipo de jornada</div>
    <div class="teacher-schedule-journey-chips">${teacherScheduleJourneyOptions().map((option) => `
      <button class="teacher-schedule-journey-chip ${current === option.id ? 'is-active' : ''}" type="button" onclick="setTeacherScheduleJourneyType('${option.id}')">
        <strong>${escapeHtml(option.label)}</strong>
        <small>${escapeHtml(option.copy)}</small>
      </button>
    `).join('')}</div>
  </div>`;
}
// Renderiza renderizar teacher programar day tabs.
function renderTeacherScheduleDayTabs() {
  const activeDays = teacherScheduleActiveWeekdays();
  const view = teacherScheduleGetViewState();
  return `<div class="teacher-schedule-day-tabs">${activeDays.map((weekday) => `
    <button class="teacher-schedule-day-tab ${view.selectedWeekday === weekday ? 'is-active' : ''}" type="button" onclick="setTeacherScheduleSelectedDay(${weekday})">${plannerWeekdayName(weekday)}</button>
  `).join('')}</div>`;
}
// Renderiza renderizar teacher programar shift filters.
function renderTeacherScheduleShiftFilters() {
  if (!teacherScheduleUsesSplitShifts()) return '';
  const view = teacherScheduleGetViewState();
  const options = [
    { id: 'all', label: 'Todas las tandas' },
    { id: 'morning', label: 'Matutina' },
    { id: 'afternoon', label: 'Vespertina' },
  ];
  return `<div class="teacher-schedule-shift-filter">${options.map((option) => `
    <button class="teacher-schedule-shift-chip ${view.shiftFilter === option.id ? 'is-active' : ''}" type="button" onclick="setTeacherScheduleShiftFilter('${option.id}')">${option.label}</button>
  `).join('')}</div>`;
}
// Renderiza renderizar teacher programar segment lista by shift.
function renderTeacherScheduleSegmentListByShift(weekday, shift) {
  const shiftLabel = shift === 'morning' ? 'Tanda matutina' : 'Tanda vespertina';
  const rows = teacherScheduleRowsForWeekday(weekday).filter((row) => teacherScheduleShiftForRow(row) === shift);
  return `
    <section class="teacher-schedule-shift-section">
      <div class="teacher-schedule-shift-head">
        <div class="teacher-schedule-shift-title">${shiftLabel}</div>
      </div>
      ${rows.length ? `<div class="teacher-schedule-segment-list">${rows.map((row) => {
        const summary = teacherScheduleCellSummary(row);
        return `<div class="teacher-schedule-segment-item teacher-schedule-timeline-item ${teacherScheduleBlockTone(row.blockType)}">
          <div class="teacher-schedule-segment-time teacher-schedule-timeline-time">${escapeHtml(teacherScheduleFormatTime(row.startTime))} - ${escapeHtml(teacherScheduleFormatTime(row.endTime))}</div>
          <div class="teacher-schedule-segment-body teacher-schedule-timeline-content">
            <div class="teacher-schedule-segment-title">${escapeHtml(summary.title)}</div>
            <div class="teacher-schedule-segment-meta">${escapeHtml(summary.kindLabel)}${summary.sectionLabel ? ` ? ${escapeHtml(summary.sectionLabel)}` : ''}</div>
          </div>
          <div class="teacher-schedule-segment-actions">
            <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleCellEditor(${weekday},'${row.startTime}','${row.endTime}')">Editar</button>
            <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleRowCopyModal('${row.startTime}','${row.endTime}')">Copiar</button>
            <button class="btn btn-danger btn-sm" type="button" onclick="deleteTeacherScheduleSegment(${weekday},'${row.startTime}','${row.endTime}')">Eliminar</button>
          </div>
        </div>`;
      }).join('')}</div>` : `<div class="teacher-schedule-shift-empty"><div class="et">Sin bloques en esta tanda</div></div>`}
    </section>`;
}
// Renderiza renderizar teacher programar segment cards.
function renderTeacherScheduleSegmentCards() {
  const view = teacherScheduleGetViewState();
  const weekday = view.selectedWeekday;
  const dayRows = teacherScheduleRowsForWeekday(weekday);
  const splitByShift = teacherScheduleUsesSplitShifts();
  const selectedShift = splitByShift ? (view.shiftFilter || 'all') : 'all';
  const blocks = splitByShift
    ? (selectedShift === 'all' ? ['morning', 'afternoon'] : [selectedShift])
    : ['all'];
  if (!dayRows.length) {
    return `
      <div class="teacher-schedule-empty-onboarding">
        <div class="teacher-schedule-empty-onboarding-title">A?n no tienes horario. Vamos a crearlo en menos de 2 minutos.</div>
        <div class="teacher-schedule-empty-onboarding-copy">Usa el bot?n principal de arriba para crearlo paso a paso, o agrega un bloque manual si prefieres.</div>
        <div class="teacher-schedule-empty-onboarding-actions">
          <button class="btn btn-outline" type="button" onclick="openTeacherScheduleSegmentEditor(${weekday})">+ Agregar bloque manual</button>
        </div>
      </div>`;
  }
  return `
    <div class="teacher-schedule-day-single">
      <div class="teacher-schedule-day-card-head">
        <div>
          <div class="teacher-schedule-day-title">${plannerWeekdayName(weekday)}</div>
          <div class="teacher-schedule-day-copy">${dayRows.length ? `${dayRows.length} segmento(s) ? ${teacherScheduleJourneyHeading()}` : 'Sin segmentos todav?a'}</div>
        </div>
      </div>
      ${splitByShift
        ? blocks.map((shift) => renderTeacherScheduleSegmentListByShift(weekday, shift)).join('')
        : `<section class="teacher-schedule-shift-section">
            <div class="teacher-schedule-shift-head">
              <div class="teacher-schedule-shift-title">${teacherScheduleJourneyHeading()}</div>
            </div>
            <div class="teacher-schedule-segment-list">${dayRows.map((row) => {
              const summary = teacherScheduleCellSummary(row);
              return `<div class="teacher-schedule-segment-item teacher-schedule-timeline-item ${teacherScheduleBlockTone(row.blockType)}">
                <div class="teacher-schedule-segment-time teacher-schedule-timeline-time">${escapeHtml(teacherScheduleFormatTime(row.startTime))} - ${escapeHtml(teacherScheduleFormatTime(row.endTime))}</div>
                <div class="teacher-schedule-segment-body teacher-schedule-timeline-content">
                  <div class="teacher-schedule-segment-title">${escapeHtml(summary.title)}</div>
                  <div class="teacher-schedule-segment-meta">${escapeHtml(summary.kindLabel)}${summary.sectionLabel ? ` ? ${escapeHtml(summary.sectionLabel)}` : ''}</div>
                </div>
                <div class="teacher-schedule-segment-actions">
                  <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleCellEditor(${weekday},'${row.startTime}','${row.endTime}')">Editar</button>
                  <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleRowCopyModal('${row.startTime}','${row.endTime}')">Copiar</button>
                  <button class="btn btn-danger btn-sm" type="button" onclick="deleteTeacherScheduleSegment(${weekday},'${row.startTime}','${row.endTime}')">Eliminar</button>
                </div>
              </div>`;
            }).join('')}</div>
          </section>`}
    </div>`;
}
// Renderiza renderizar teacher programar global empty estado.
function renderTeacherScheduleGlobalEmptyState() {
  return `
    <div class="teacher-schedule-empty-onboarding teacher-schedule-empty-onboarding-global">
      <div class="teacher-schedule-empty-onboarding-title">A?n no tienes horario. Vamos a crearlo en minutos.</div>
      <div class="teacher-schedule-empty-onboarding-copy">Empieza con el asistente guiado o crea tu primer bloque manualmente.</div>
      <div class="teacher-schedule-empty-onboarding-actions">
        <button class="btn btn-primary teacher-schedule-btn-primary" type="button" onclick="openTeacherScheduleWizardModal()">Crear horario paso a paso</button>
        <button class="btn btn-outline" type="button" onclick="openTeacherScheduleSegmentEditor()">Agregar bloque manual</button>
        <button class="btn btn-outline" type="button" onclick="openTeacherScheduleBaseModal()">Plantilla r?pida</button>
      </div>
    </div>`;
}
// Gestiona teacher programar construir matrix markup.
function teacherScheduleBuildMatrixMarkup(options = {}) {
  const interactive = options.interactive !== false;
  const activeWeekdays = teacherScheduleActiveWeekdays();
  const rows = teacherScheduleRowsForActiveDays();
  const slots = teacherScheduleSlotList(rows);
  const cellMap = teacherScheduleCellMap(rows);
  if (!slots.length) {
    return `<div class="empty planner-empty"><div class="et">Todav?a no hay segmentos</div><div class="es">Agrega segmentos manualmente o usa una plantilla base editable para empezar m?s r?pido.</div>${interactive ? '<button class="btn btn-primary" type="button" onclick="openTeacherScheduleSegmentEditor()">Agregar segmento</button>' : ''}</div>`;
  }
  return `<div class="${interactive ? 'table-wrap teacher-schedule-grid-wrap' : 'teacher-schedule-export-wrap'}">
    <table class="${interactive ? 'table teacher-schedule-grid' : 'teacher-schedule-export-table'}">
      <thead>
        <tr>
          <th>Hora</th>
          ${activeWeekdays.map((weekday) => `<th>${plannerWeekdayName(weekday)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${slots.map((slot) => {
          const cells = activeWeekdays.map((weekday) => {
            const row = cellMap.get(teacherScheduleCellKey(weekday, slot.startTime, slot.endTime)) || sanitizeTeacherScheduleRow({
              weekday,
              startTime: slot.startTime,
              endTime: slot.endTime,
              blockType: 'planning',
              subject: teacherScheduleDefaultSubjectForBlockType('planning'),
            });
            const summary = teacherScheduleCellSummary(row);
            if (!interactive) {
              return `<td class="teacher-schedule-export-cell ${teacherScheduleBlockTone(row.blockType)}"><div class="teacher-schedule-export-title">${escapeHtml(summary.title)}</div>${summary.sectionLabel ? `<div class="teacher-schedule-export-meta">${escapeHtml(summary.sectionLabel)}</div>` : ''}${summary.roomLabel ? `<div class="teacher-schedule-export-meta">${escapeHtml(summary.roomLabel)}</div>` : ''}</td>`;
            }
            return `<td><button class="teacher-schedule-cell ${teacherScheduleBlockTone(row.blockType)}" type="button" onclick="openTeacherScheduleCellEditor(${weekday},'${slot.startTime}','${slot.endTime}')"><div class="teacher-schedule-cell-kind ${teacherScheduleBlockTone(row.blockType)}">${escapeHtml(summary.kindLabel)}</div><div class="teacher-schedule-cell-title">${escapeHtml(summary.title)}</div>${summary.sectionLabel ? `<div class="teacher-schedule-cell-line">${escapeHtml(summary.sectionLabel)}</div>` : ''}${summary.roomLabel ? `<div class="teacher-schedule-cell-line">${escapeHtml(summary.roomLabel)}</div>` : ''}${summary.notes ? `<div class="teacher-schedule-cell-line is-notes">${escapeHtml(summary.notes)}</div>` : ''}</button></td>`;
          }).join('');
          return `<tr><th class="${interactive ? 'teacher-schedule-time-head' : 'teacher-schedule-export-time'}" scope="row"><span>${escapeHtml(teacherScheduleFormatTime(slot.startTime))}</span><small>${escapeHtml(teacherScheduleFormatTime(slot.endTime))}</small>${interactive ? `<div class="teacher-schedule-row-actions"><button class="btn btn-outline btn-sm teacher-schedule-row-copy-btn" type="button" onclick="openTeacherScheduleRowCopyModal('${slot.startTime}','${slot.endTime}')">Copiar a otros d?as</button><button class="btn btn-outline btn-sm teacher-schedule-row-copy-btn" type="button" onclick="openTeacherScheduleRowAdjustModal('${slot.startTime}','${slot.endTime}')">Ajustar franja</button></div>` : ''}</th>${cells}</tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}
// Gestiona teacher programar exportación base name.
function teacherScheduleExportBaseName() {
  const teacherName = String(S.profile?.name || S.sessionUserName || 'docente').trim();
  return `horario-docente-${normTxt(teacherName).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'docente'}`;
}
// Gestiona teacher programar construir exportación HTML.
function teacherScheduleBuildExportHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Horario semanal del docente</title><style>@page{size:landscape;margin:12mm;} body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#17304a;margin:0;} .teacher-schedule-export-page{display:grid;gap:14px;} .teacher-schedule-export-head{display:flex;justify-content:space-between;gap:14px;align-items:end;} .teacher-schedule-export-title{font-size:22px;font-weight:800;} .teacher-schedule-export-copy{font-size:12px;color:#5f7590;margin-top:4px;} .teacher-schedule-export-teacher{font-size:12px;font-weight:700;color:#315575;} .teacher-schedule-export-table{width:100%;border-collapse:collapse;table-layout:fixed;} .teacher-schedule-export-table th,.teacher-schedule-export-table td{border:1px solid #9fb0c4;padding:8px;vertical-align:top;} .teacher-schedule-export-table thead th{background:#e7f0fb;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;} .teacher-schedule-export-time{width:112px;min-width:112px;background:#edf4fc;text-align:center;} .teacher-schedule-export-time span,.teacher-schedule-export-time small{display:block;} .teacher-schedule-export-time span{font-size:13px;font-weight:900;} .teacher-schedule-export-time small{font-size:11px;color:#6d829b;margin-top:4px;} .teacher-schedule-export-cell{min-height:76px;} .teacher-schedule-export-title{font-size:13px;font-weight:800;} .teacher-schedule-export-meta{font-size:11px;color:#4b6784;margin-top:4px;} .teacher-schedule-export-cell.is-class{background:#eef6ff;} .teacher-schedule-export-cell.is-planning{background:#eef7ee;} .teacher-schedule-export-cell.is-break{background:#fff6e0;} .teacher-schedule-export-cell.is-lunch{background:#fff0e7;} .teacher-schedule-export-cell.is-event{background:#f3eeff;}</style></head><body><div class="teacher-schedule-export-page"><div class="teacher-schedule-export-head"><div><div class="teacher-schedule-export-title">Horario semanal del docente</div><div class="teacher-schedule-export-copy">Vista profesional organizada por bloques y d?as activos.</div></div><div class="teacher-schedule-export-teacher">${escapeHtml(String(S.profile?.name || S.sessionUserName || 'Docente'))}</div></div>${teacherScheduleBuildMatrixMarkup({ interactive: false })}</div></body></html>`;
}
// Gestiona teacher programar descarga word.
function teacherScheduleDownloadWord() {
  const blob = new Blob(['\ufeff', teacherScheduleBuildExportHtml()], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${teacherScheduleExportBaseName()}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
// Gestiona teacher programar descarga pdf.
function teacherScheduleDownloadPdf() {
  const blob = new Blob([teacherScheduleBuildExportHtml()], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) {
    toast('El navegador bloque? la vista de impresi?n del horario', true);
    return;
  }
  setTimeout(() => { try { w.focus(); w.print(); } catch (_) {} }, 400);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
// Gestiona clear teacher programar board.
async function clearTeacherScheduleBoard() {
  ensureTeacherPlannerState();
  closeTeacherScheduleSystemMenu({ persist: false, rerender: false });
  if (!teacherScheduleRowsSorted().length) {
    toast('Todav?a no hay horario configurado para limpiar');
    return;
  }
  if (!confirm('Se eliminar? todo el horario semanal actual. ?Deseas continuar?')) return;
  S.teacherPlanner.weeklySchedule = [];
  persist({ immediate: true });
  debugSessionFlow('delete:teacher-schedule', {
    uid: S.sessionUserId || null,
    rowsAfter: Array.isArray(S.teacherPlanner?.weeklySchedule) ? S.teacherPlanner.weeklySchedule.length : null,
  });
  go(currentPage);
  toast('Horario semanal limpiado');
}
// Renderiza renderizar planner calendario grid.
function renderPlannerCalendarGrid(monthKey) {
  const allEvents = getPlannerEvents();
  const eventsByDate = allEvents.reduce((map, event) => {
    if (!map[event.date]) map[event.date] = [];
    map[event.date].push(event);
    return map;
  }, {});
  const cells = getPlannerMonthMatrix(monthKey);
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  return `
    <div class="planner-calendar-grid">
      ${['Lun', 'Mar', 'Mi?', 'Jue', 'Vie', 'S?b', 'Dom'].map((name) => `<div class="planner-calendar-weekday">${name}</div>`).join('')}
      ${cells.map((cell) => {
        if (!cell) return '<div class="planner-calendar-cell is-empty"></div>';
        const events = eventsByDate[cell.dateKey] || [];
        return `
          <div class="planner-calendar-cell ${cell.dateKey === todayKey ? 'is-today' : ''}">
            <div class="planner-calendar-day">${cell.day}</div>
            <div class="planner-calendar-events">
              ${events.slice(0, 3).map((event) => `<div class="planner-calendar-chip ${plannerEventTone(event.type)}" title="${escapeHtml(`${event.title} ? ${event.source}`)}">${escapeHtml(event.title)}</div>`).join('')}
              ${events.length > 3 ? `<div class="planner-calendar-more">+${events.length - 3} m?s</div>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}
// Renderiza renderizar planner upcoming lista.
function renderPlannerUpcomingList(monthKey) {
  const events = getPlannerEvents().filter((event) => String(event.date || '').startsWith(`${normalizeAttendanceMonthKey(monthKey).slice(0, 7)}`));
  if (!events.length) {
    return `<div class="empty planner-empty"><div class="et">Sin eventos este mes</div><div class="es">Puedes agregar recordatorios propios del centro o del docente.</div></div>`;
  }
  return `<div class="planner-event-list">${events.map((event) => `
    <div class="planner-event-card ${plannerEventTone(event.type)}">
      <div class="planner-event-date">${escapeHtml(fmtDate(event.date))}</div>
      <div class="planner-event-body">
        <div class="planner-event-title">${escapeHtml(event.title)}</div>
        <div class="planner-event-meta">${plannerEventTypeLabel(event.type)} ? ${escapeHtml(event.source || '')}</div>
      </div>
      ${event.source === 'Personal' ? `<button class="btn btn-danger btn-sm" type="button" onclick="removeTeacherPlannerEvent('${event.id}')">Eliminar</button>` : ''}
    </div>`).join('')}</div>`;
}
// Renderiza renderizar teacher programar legend.
function renderTeacherScheduleLegend() {
  const items = [
    { type: 'class', label: 'Clase' },
    { type: 'planning', label: 'Hora pedag?gica' },
    { type: 'break', label: 'Recreo / receso' },
    { type: 'lunch', label: 'Almuerzo' },
    { type: 'event', label: 'Evento institucional' },
  ];
  return `<div class="teacher-schedule-legend-inline">${items.map((item) => `
    <span class="teacher-schedule-legend-pill ${teacherScheduleBlockTone(item.type)}"><i></i>${escapeHtml(item.label)}</span>
  `).join('')}</div>`;
}
// Renderiza renderizar teacher programar board.
function renderTeacherScheduleBoard() {
  // Construye el tablero visual del horario con acciones rápidas, lista de segmentos y matriz semanal opcional.
  const view = teacherScheduleGetViewState();
  const hasAnyBlocks = teacherScheduleRowsSorted().length > 0;
  if (!hasAnyBlocks) {
    return `
      <div class="planner-schedule-top">
        <div>
          <div class="planner-matrix-title">Horario docente</div>
          <div class="planner-schedule-note">Organiza tu semana laboral.</div>
          ${renderTeacherScheduleJourneySelector()}
        </div>
      </div>
      <div class="planner-matrix-shell">
        ${renderTeacherScheduleGlobalEmptyState()}
      </div>`;
  }
  return `
    <div class="planner-schedule-top">
      <div>
        <div class="planner-matrix-title">Horario docente</div>
        <div class="planner-schedule-note">Organiza tu semana laboral.</div>
        ${renderTeacherScheduleJourneySelector()}
      </div>
      <div class="planner-schedule-actions-stack">
        <div class="planner-schedule-actions planner-schedule-actions-primary teacher-schedule-primary-actions">
          <button class="btn btn-primary teacher-schedule-btn-primary" type="button" onclick="openTeacherScheduleWizardModal()">Crear horario paso a paso</button>
          <button class="btn btn-outline teacher-schedule-btn-secondary-main" type="button" onclick="openTeacherScheduleSegmentEditor(${view.selectedWeekday})">+ Agregar bloque</button>
        </div>
        <div class="planner-schedule-actions planner-schedule-actions-secondary teacher-schedule-secondary-buttons">
          <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleSegmentEditor(${view.selectedWeekday})">Agregar manual</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleBaseModal()">Plantilla r?pida</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="openTeacherScheduleDayDuplicateModal(${view.selectedWeekday})">Duplicar d?a</button>
        </div>
      </div>
    </div>
    ${renderTeacherScheduleDayTabs()}
    ${view.showAdvanced && teacherScheduleUsesSplitShifts() ? renderTeacherScheduleShiftFilters() : ''}
    ${view.showAdvanced && view.showLegend ? renderTeacherScheduleLegend() : ''}
    <div class="teacher-schedule-secondary-actions teacher-schedule-utility-row">
      <button class="btn btn-outline btn-sm" type="button" onclick="toggleTeacherScheduleAdvancedPanel()">${view.showAdvanced ? '= Ocultar opciones avanzadas' : '= Opciones avanzadas'}</button>
      ${view.showAdvanced ? `<button class="btn btn-outline btn-sm" type="button" onclick="toggleTeacherScheduleLegend()">${view.showLegend ? 'Ocultar tipos' : 'Ver tipos'}</button>` : ''}
      <div class="teacher-schedule-system-menu-wrap">
        <button class="btn btn-outline btn-sm" type="button" onclick="toggleTeacherScheduleSystemMenu()">M?s opciones</button>
        ${view.showSystemMenu ? `<div class="teacher-schedule-system-menu">
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('matrix')">${view.showMatrix ? 'Ocultar vista semanal' : 'Ver vista semanal'}</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('pdf')"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Exportar PDF</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('word')"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Exportar Word</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="teacherScheduleSystemMenuAction('clear')">Limpiar horario</button>
        </div>` : ''}
      </div>
    </div>
    <div class="planner-matrix-shell">
      ${renderTeacherScheduleSegmentCards()}
      ${view.showMatrix ? `<div class="planner-matrix-copy" style="margin-top:14px;">Vista semanal de referencia.</div>${teacherScheduleBuildMatrixMarkup()}` : ''}
    </div>`;
}
// Renderiza renderizar teacher programar page.
function renderTeacherSchedulePage() {
  // Renderiza la página contenedora del horario docente con sus acciones, tabs y matriz auxiliar.
  return `
    <div class="planner-page teacher-schedule-page">
      <div class="card planner-schedule-card">
        <div class="planner-schedule-shell">
          ${renderTeacherScheduleBoard()}
        </div>
      </div>
    </div>`;
}

