// Obtiene get actual mes key.
function getCurrentMonthKey() {
  // Calcula el mes actual como llave compacta para usarla en buckets y navegación.
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
// Normaliza normalizar asistencia mes key.
function normalizeAttendanceMonthKey(monthKey) {
  // Garantiza que la llave mensual quede en formato YYYY-MM antes de tocar memoria o SQL.
  const match = String(monthKey || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return getCurrentMonthKey();
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) return getCurrentMonthKey();
  return `${match[1]}-${String(month).padStart(2, '0')}`;
}
// Gestiona asistencia mes start.
function attendanceMonthStart(monthKey) {
  // Convierte la llave mensual a una fecha base estable para sacar días y etiquetas del mes.
  const normalized = normalizeAttendanceMonthKey(monthKey);
  const [year, month] = normalized.split('-').map((value) => parseInt(value, 10));
  return new Date(year, month - 1, 1, 12, 0, 0, 0);
}
// Gestiona next asistencia mes key.
function nextAttendanceMonthKey(monthKey) {
  // Avanza un mes para construir la segunda columna del visor mensual.
  const date = attendanceMonthStart(monthKey);
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
// Gestiona asistencia mes label.
function attendanceMonthLabel(monthKey) {
  // Devuelve el nombre del mes en mayúsculas para encabezados y avisos de borrado.
  return new Intl.DateTimeFormat('es-DO', { month: 'long' }).format(attendanceMonthStart(monthKey)).toUpperCase();
}
// Gestiona asistencia workdays.
function attendanceWorkdays(monthKey) {
  // Genera los días laborables del mes sin sábados ni domingos para pintar la grilla de asistencia.
  const start = attendanceMonthStart(monthKey);
  const year = start.getFullYear();
  const monthIndex = start.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0, 12, 0, 0, 0).getDate();
  const days = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day, 12, 0, 0, 0);
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) continue;
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({ day, dateKey });
  }
  return days;
}
// Inicializa la estructura minima de asistencia legacy para evitar lecturas/escrituras sobre ramas inexistentes.
function ensureAttendanceState() {
  // Inicializa la estructura legacy de asistencia para que el render y los mutadores no fallen.
  if (!S.attendance || typeof S.attendance !== 'object') {
    S.attendance = { monthKey: getCurrentMonthKey(), records: {} };
  }
  if (!S.attendance.monthKey) S.attendance.monthKey = getCurrentMonthKey();
  if (!S.attendance.records || typeof S.attendance.records !== 'object') S.attendance.records = {};
}
// Obtiene get asistencia mes bucket.
function getAttendanceMonthBucket(sectionId, monthKey, createIfMissing = false) {
  // Resuelve el bucket mensual de una sección y opcionalmente lo crea si aún no existe.
  ensureAttendanceState();
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  if (!sectionId) return {};
  if (!S.attendance.records[sectionId]) {
    if (!createIfMissing) return {};
    S.attendance.records[sectionId] = {};
  }
  if (!S.attendance.records[sectionId][normalizedMonth]) {
    if (!createIfMissing) return {};
    S.attendance.records[sectionId][normalizedMonth] = {};
  }
  return S.attendance.records[sectionId][normalizedMonth];
}
// Obtiene get asistencia code.
function getAttendanceCode(sectionId, monthKey, studentId, dateKey) {
  // Lee la marca puntual de asistencia del bucket mensual para pintar el calendario.
  const bucket = getAttendanceMonthBucket(sectionId, monthKey, false);
  return String(bucket?.[studentId]?.[dateKey] || '').toUpperCase();
}
// Escribe una marca puntual de asistencia en el modelo legacy y agenda la sincronizacion mensual hacia SQL.
function setAttendanceCode(sectionId, monthKey, studentId, dateKey, code) {
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  const cleanCode = String(code || '').toUpperCase();
  let changed = false;
  if (!sectionId || !studentId || !dateKey) return;
  if (!cleanCode) {
    const monthBucket = getAttendanceMonthBucket(sectionId, normalizedMonth, false);
    if (!monthBucket?.[studentId]) return;
    delete monthBucket[studentId][dateKey];
    if (!Object.keys(monthBucket[studentId]).length) delete monthBucket[studentId];
    if (!Object.keys(monthBucket).length) delete S.attendance.records[sectionId][normalizedMonth];
    if (S.attendance.records[sectionId] && !Object.keys(S.attendance.records[sectionId]).length) delete S.attendance.records[sectionId];
    changed = true;
  } else {
    const monthBucket = getAttendanceMonthBucket(sectionId, normalizedMonth, true);
    if (!monthBucket[studentId]) monthBucket[studentId] = {};
    monthBucket[studentId][dateKey] = cleanCode;
    changed = true;
  }
  if (changed) scheduleSqlAttendanceMonthSync(sectionId, normalizedMonth);
}
// Gestiona summarize asistencia mes.
function summarizeAttendanceMonth(sectionId, monthKey, studentId) {
  // Resume ausencias y presencias del estudiante para mostrar indicadores compactos en la tabla.
  const days = attendanceWorkdays(monthKey);
  let absences = 0;
  let attendanceCredits = 0;
  days.forEach(({ dateKey }) => {
    const code = getAttendanceCode(sectionId, monthKey, studentId, dateKey);
    if (code === 'A') absences += 1;
    if (code === 'P' || code === 'E') attendanceCredits += 1;
  });
  return {
    absences,
    percent: days.length ? Math.round((attendanceCredits / days.length) * 100) : 0,
  };
}
// Gestiona asistencia marcar class.
function attendanceMarkClass(code) {
  // Traduce el código de asistencia a su clase visual para colorear la grilla.
  if (code === 'P') return 'is-present';
  if (code === 'A') return 'is-absent';
  if (code === 'E') return 'is-excused';
  if (code === 'R') return 'is-retired';
  return '';
}
// Gestiona asistencia legend item.
function attendanceLegendItem(code, label) {
  // Construye una pieza de leyenda reutilizable para explicar los códigos de asistencia.
  return `<span class="attendance-legend-item"><span class="attendance-mark ${attendanceMarkClass(code)}">${code}</span>${label}</span>`;
}
// Actualiza set asistencia mes.
function setAttendanceMonth(monthKey) {
  // Cambia el mes visible del panel y re-renderiza para que el usuario siga editando la misma sección.
  ensureAttendanceState();
  S.attendance.monthKey = normalizeAttendanceMonthKey(monthKey);
  persist();
  go(currentPage);
}
// Gestiona cycle asistencia code.
function cycleAttendanceCode(sectionId, studentId, dateKey) {
  // Alterna el código de asistencia de una celda sin depender de menús contextuales.
  const monthKey = String(dateKey || '').slice(0, 7);
  const order = ['', 'P', 'A', 'E', 'R'];
  const current = getAttendanceCode(sectionId, monthKey, studentId, dateKey);
  const currentIndex = order.indexOf(current);
  const nextCode = order[(currentIndex + 1 + order.length) % order.length];
  setAttendanceCode(sectionId, monthKey, studentId, dateKey, nextCode);
  persist();
  go(currentPage);
}
// Borra un mes completo de asistencia legacy tanto en memoria como en SQL, con confirmacion previa.
function clearAttendanceMonth(sectionId, monthKey) {
  // Borra el mes completo de asistencia legacy tanto en memoria como en SQL, con confirmación previa.
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  const label = attendanceMonthLabel(normalizedMonth).toLowerCase();
  if (!confirm(`Se borrar? la asistencia registrada para ${label}. ?Deseas continuar?`)) return;
  ensureAttendanceState();
  if (S.attendance.records?.[sectionId]?.[normalizedMonth]) {
    delete S.attendance.records[sectionId][normalizedMonth];
    if (!Object.keys(S.attendance.records[sectionId]).length) delete S.attendance.records[sectionId];
    cancelSqlAttendanceMonthSync(sectionId, normalizedMonth);
    syncSqlAttendanceMonth(sectionId, normalizedMonth, { clear: true }).catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo limpiar la asistencia en SQL', error);
    });
    persist();
    go(currentPage);
    toast(`Asistencia de ${label} eliminada`);
  }
}
// Gestiona impresión asistencia sheet.
function printAttendanceSheet() {
  // Abre el diálogo de impresión del navegador para exportar la hoja de asistencia visible.
  window.print();
}
// Renderiza la hoja de asistencia legacy para cursos que aun usan la grilla mensual simplificada.
RENDERS.asistencia = function(c) {
  ensureAttendanceState();
  ensureActiveGroup();

  const groups = getGroups();
  const activeGroup = groups.find((group) => group.id === S.activeGroupId) || groups[0] || null;
  if (!activeGroup) {
    c.innerHTML = `<div class="card"><div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">No hay secciones creadas</div><div class="es">Crea una secci?n para poder llevar el registro de asistencia por curso.</div><button class="btn btn-primary" onclick="go('estudiantes')">Ir a estudiantes</button></div></div>`;
    return;
  }
  if (S.activeGroupId !== activeGroup.id) {
    S.activeGroupId = activeGroup.id;
    S.activeCourseId = activeGroup.id;
  }

  const monthA = normalizeAttendanceMonthKey(S.attendance.monthKey || getCurrentMonthKey());
  const monthB = nextAttendanceMonthKey(monthA);
  const monthADays = attendanceWorkdays(monthA);
  const monthBDays = attendanceWorkdays(monthB);
  const students = [...studentsInGroup(activeGroup.id)].sort((a, b) => {
    const left = `${a.apellido || ''} ${a.nombre || ''}`.trim();
    const right = `${b.apellido || ''} ${b.nombre || ''}`.trim();
    return left.localeCompare(right, 'es', { sensitivity: 'base' });
  });

  const sectionOptions = groups.map((group) => (
    `<option value="${group.id}" ${group.id === activeGroup.id ? 'selected' : ''}>${escapeHtml(`${group.gradeName} ${group.sectionName} ? ${group.materia || 'General'}`)}</option>`
  )).join('');
  const totalColumns = 2 + monthADays.length + 2 + monthBDays.length + 2;
  const teacherName = String(S.profile?.name || S.sessionUserName || '').trim() || 'Pendiente';
  const title = String(activeGroup.materia || `${activeGroup.gradeName} ${activeGroup.sectionName}`).toUpperCase();

  if (!students.length) {
    c.innerHTML = `
      <div class="card attendance-page">
        <div class="attendance-controls">
          <div class="attendance-toolbar">
            <label class="attendance-control">
              <span>Seccion</span>
              <select class="sel" onchange="setActiveGroup(this.value)">${sectionOptions}</select>
            </label>
            <label class="attendance-control">
              <span>Mes inicial</span>
              <input class="inp" type="month" value="${monthA}" onchange="setAttendanceMonth(this.value)">
            </label>
          </div>
        </div>
        <div class="empty" style="padding:32px 24px;">
          <div class="ei"><i class="ri-team-line"></i></div>
          <div class="et">Esta seccion todavia no tiene estudiantes</div>
          <div class="es">Agrega estudiantes a ${escapeHtml(`${activeGroup.gradeName} ${activeGroup.sectionName}`)} para completar el registro de asistencia.</div>
          <button class="btn btn-primary" onclick="go('estudiantes')">Ir a estudiantes</button>
        </div>
      </div>`;
    return;
  }

  const headerDaysA = monthADays.map(({ day }) => `<th class="attendance-day-head">${day}</th>`).join('');
  const headerDaysB = monthBDays.map(({ day }) => `<th class="attendance-day-head">${day}</th>`).join('');
  const rows = students.map((student, index) => {
    const summaryA = summarizeAttendanceMonth(activeGroup.id, monthA, student.id);
    const summaryB = summarizeAttendanceMonth(activeGroup.id, monthB, student.id);
    const cellsA = monthADays.map(({ day, dateKey }) => {
      const code = getAttendanceCode(activeGroup.id, monthA, student.id, dateKey);
      return `<td class="attendance-cell"><button class="attendance-mark ${attendanceMarkClass(code)}" type="button" onclick="cycleAttendanceCode('${activeGroup.id}','${student.id}','${dateKey}')" title="Clic para alternar P, A, E, R">${code || ''}</button></td>`;
    }).join('');
    const cellsB = monthBDays.map(({ day, dateKey }) => {
      const code = getAttendanceCode(activeGroup.id, monthB, student.id, dateKey);
      return `<td class="attendance-cell"><button class="attendance-mark ${attendanceMarkClass(code)}" type="button" onclick="cycleAttendanceCode('${activeGroup.id}','${student.id}','${dateKey}')" title="Clic para alternar P, A, E, R">${code || ''}</button></td>`;
    }).join('');
    const fullName = `${student.apellido || ''}, ${student.nombre || ''}`.replace(/^,\s*/, '').trim();
    return `
      <tr>
        <td class="attendance-row-index">${index + 1}</td>
        <td class="attendance-student-name">${escapeHtml(fullName)}</td>
        ${cellsA}
        <td class="attendance-summary-cell">${summaryA.absences}</td>
        <td class="attendance-summary-cell">${summaryA.percent}%</td>
        ${cellsB}
        <td class="attendance-summary-cell">${summaryB.absences}</td>
        <td class="attendance-summary-cell">${summaryB.percent}%</td>
      </tr>`;
  }).join('');

  c.innerHTML = `
    <div class="card attendance-page">
      <div class="attendance-controls">
        <div class="attendance-toolbar">
          <label class="attendance-control">
            <span>Seccion</span>
            <select class="sel" onchange="setActiveGroup(this.value)">${sectionOptions}</select>
          </label>
          <label class="attendance-control">
            <span>Mes inicial</span>
            <input class="inp" type="month" value="${monthA}" onchange="setAttendanceMonth(this.value)">
          </label>
          <div class="attendance-actions">
            <button class="btn btn-outline btn-sm" type="button" onclick="clearAttendanceMonth('${activeGroup.id}','${monthA}')">Limpiar ${attendanceMonthLabel(monthA).toLowerCase()}</button>
            <button class="btn btn-primary btn-sm" type="button" onclick="printAttendanceSheet()">Imprimir</button>
          </div>
        </div>
        <div class="attendance-legend">
          ${attendanceLegendItem('P', 'Presente')}
          ${attendanceLegendItem('A', 'Ausente')}
          ${attendanceLegendItem('E', 'Excusa')}
          ${attendanceLegendItem('R', 'Retirado')}
        </div>
      </div>

      <div class="attendance-sheet-wrap">
        <table class="attendance-sheet">
          <thead>
            <tr>
              <th class="attendance-sheet-title" colspan="${totalColumns}">${escapeHtml(title)}</th>
            </tr>
            <tr>
              <th class="attendance-sheet-label">DOCENTE</th>
              <th class="attendance-sheet-value" colspan="${totalColumns - 1}">${escapeHtml(teacherName)}</th>
            </tr>
            <tr>
              <th class="attendance-sheet-label">SECCION</th>
              <th class="attendance-sheet-value" colspan="${totalColumns - 1}">${escapeHtml(`${activeGroup.gradeName} ${activeGroup.sectionName} ? ${activeGroup.materia || 'General'}`)}</th>
            </tr>
            <tr>
              <th class="attendance-side-head" rowspan="3">No.</th>
              <th class="attendance-side-head attendance-side-name" rowspan="3">ESTUDIANTES</th>
              <th class="attendance-month-head" colspan="${monthADays.length + 2}">${attendanceMonthLabel(monthA)}</th>
              <th class="attendance-month-head" colspan="${monthBDays.length + 2}">${attendanceMonthLabel(monthB)}</th>
            </tr>
            <tr>
              <th class="attendance-workdays-head" colspan="${monthADays.length}">DIAS TRABAJADOS</th>
              <th class="attendance-workdays-head" colspan="2">RESUMEN</th>
              <th class="attendance-workdays-head" colspan="${monthBDays.length}">DIAS TRABAJADOS</th>
              <th class="attendance-workdays-head" colspan="2">RESUMEN</th>
            </tr>
            <tr>
              ${headerDaysA}
              <th class="attendance-summary-head">A</th>
              <th class="attendance-summary-head">%</th>
              ${headerDaysB}
              <th class="attendance-summary-head">A</th>
              <th class="attendance-summary-head">%</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
};

const ATTENDANCE_V2_SLOT_CAPACITY = 96;
const ATTENDANCE_V2_CODE_ORDER = ['', 'P', 'T', 'A', 'E', 'R'];
const ATTENDANCE_V2_EXCEPTION_ORDER = ['', 'holiday', 'suspension', 'no-school'];
const ATTENDANCE_V2_UI = { sectionId: '', monthKey: '', studentIds: [], activeType: '', activeStudentId: '', activeSlotIndex: 0, dayDrafts: {} };
const ATTENDANCE_V2_DEFERRED_PROJECTION = new Set();

// Crea crear asistencia v2 slot meta.
function createAttendanceV2SlotMeta(type = '', reason = '') {
  return { type: normalizeAttendanceV2Exception(type), reason: String(reason || '').trim().slice(0, 140) };
}

// Crea crear asistencia v2 mes record.
function createAttendanceV2MonthRecord() {
  return {
    slotDays: Array(ATTENDANCE_V2_SLOT_CAPACITY).fill(''),
    slotMeta: Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, () => createAttendanceV2SlotMeta()),
    studentCodes: {},
    retiredCarryOverrides: {},
    retiredPolicy: 'until-retirement',
    scheduleLinked: false,
    visibleCount: 1,
    __normalized: true,
  };
}

// Garantiza la estructura base de asistencia v2, incluyendo settings, meses activos y preferencias de captura.
function ensureAttendanceV2State() {
  if (!S.attendance || typeof S.attendance !== 'object') S.attendance = {};
  if (!S.attendance.monthKey) S.attendance.monthKey = getCurrentMonthKey();
  if (!S.attendance.records || typeof S.attendance.records !== 'object') S.attendance.records = {};
  if (!S.attendance.settings || typeof S.attendance.settings !== 'object') S.attendance.settings = {};
  if (!S.attendance.groupSettings || typeof S.attendance.groupSettings !== 'object') S.attendance.groupSettings = {};
  if (!('advanceOnKeyboard' in S.attendance.settings)) S.attendance.settings.advanceOnKeyboard = true;
  S.attendance.settings.activeSchoolMonths = [...academicCalendarActiveMonths()];
}

// Obtiene get asistencia v2 grupo settings.
function getAttendanceV2GroupSettings(sectionId, createIfMissing = false) {
  ensureAttendanceV2State();
  if (!sectionId) return { scheduleLinked: false };
  if (!S.attendance.groupSettings[sectionId]) {
    if (!createIfMissing) return { scheduleLinked: false };
    S.attendance.groupSettings[sectionId] = { scheduleLinked: false };
  }
  const settings = S.attendance.groupSettings[sectionId];
  settings.scheduleLinked = !!settings.scheduleLinked;
  return settings;
}

// Gestiona asistencia activo escuela meses.
function attendanceActiveSchoolMonths() {
  ensureAcademicCalendar();
  return [...academicCalendarActiveMonths()];
}

// Gestiona asistencia is escuela mes activo.
function attendanceIsSchoolMonthActive(monthKey) {
  return isAcademicMonthActive(monthKey);
}

// Gestiona asistencia mes status label.
function attendanceMonthStatusLabel(monthKey) {
  return attendanceIsSchoolMonthActive(monthKey) ? 'Mes lectivo' : 'Fuera del calendario escolar';
}

// Gestiona asistencia mes class.
function attendanceMonthClass(monthKey) {
  return attendanceIsSchoolMonthActive(monthKey) ? 'is-active' : 'is-inactive';
}

// Gestiona asistencia mes long label.
function attendanceMonthLongLabel(monthKey) {
  return new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(attendanceMonthStart(monthKey));
}

// Gestiona asistencia shift mes key.
function attendanceShiftMonthKey(monthKey, delta) {
  const date = attendanceMonthStart(monthKey);
  date.setMonth(date.getMonth() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
// Gestiona asistencia activo escuela mes keys.
function attendanceActiveSchoolMonthKeys() {
  const { startYear, endYear } = getSchoolYearRange();
  return academicCalendarActiveMonths().map((month) => {
    const year = month >= 8 ? startYear : endYear;
    return `${year}-${String(month).padStart(2, '0')}`;
  });
}
// Gestiona teacher programar row matches asistencia sección.
function teacherScheduleRowMatchesAttendanceSection(row, sectionId) {
  // Gestiona target sección.
  const targetSection = (S.secciones || []).find((section) => section.id === sectionId);
  if (!targetSection) return false;
  const normalizedRow = sanitizeTeacherScheduleRow(row);
  // Gestiona row sección.
  const rowSection = (S.secciones || []).find((section) => section.id === normalizedRow.sectionId);
  const targetSubject = normalizeTeacherScheduleLabel(targetSection.materia || '');
  const rowSubject = normalizeTeacherScheduleLabel(normalizedRow.subject || rowSection?.materia || '');
  const rowSectionLetter = rowSection ? parseSection(rowSection.sec || rowSection.sectionLetter || '') : '';
  const targetSectionLetter = parseSection(targetSection.sec || targetSection.sectionLetter || '');
  if (normalizedRow.blockType !== 'class') return false;
  if (normalizedRow.sectionId === sectionId) return true;
  const sameRoster = normalizedRow.sectionId && shareRosterBetweenSections(normalizedRow.sectionId, sectionId);
  if (sameRoster && (!rowSubject || rowSubject === targetSubject)) return true;
  const sameGrade = normalizedRow.gradeId && normalizedRow.gradeId === targetSection.gradeId;
  const sameSectionLetter = rowSectionLetter && rowSectionLetter === targetSectionLetter;
  const sameSubject = rowSubject === targetSubject;
  if (sameGrade && sameSectionLetter && sameSubject) return true;
  if (sameGrade && sameSectionLetter && !rowSubject) return true;
  return sameGrade && sameSubject;
}
// Gestiona asistencia v2 programar rows.
function attendanceV2ScheduleRows(sectionId) {
  ensureTeacherPlannerState();
  return teacherScheduleRowsForActiveDays()
    .map((row) => sanitizeTeacherScheduleRow(row))
    .filter((row) => teacherScheduleRowMatchesAttendanceSection(row, sectionId));
}
// Construye construir asistencia v2 slots from weekly programar.
function buildAttendanceV2SlotsFromWeeklySchedule(sectionId, monthKey) {
  const rows = attendanceV2ScheduleRows(sectionId);
  if (!rows.length) return [];
  const weekdayCounts = rows.reduce((acc, row) => {
    const weekday = parseInt(row.weekday, 10);
    if (Number.isInteger(weekday) && weekday >= 0 && weekday <= 6) acc[weekday] = (acc[weekday] || 0) + 1;
    return acc;
  }, {});
  const weekdayOrder = Object.keys(weekdayCounts).map((value) => parseInt(value, 10)).sort((a, b) => a - b);
  if (!weekdayOrder.length) return [];
  const start = attendanceMonthStart(monthKey);
  const year = start.getFullYear();
  const monthIndex = start.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0, 12, 0, 0, 0).getDate();
  const slots = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const jsDay = new Date(year, monthIndex, day, 12, 0, 0, 0).getDay();
    const normalizedWeekday = jsDay === 0 ? 6 : jsDay - 1;
    const repeatCount = weekdayCounts[normalizedWeekday] || 0;
    for (let occurrence = 0; occurrence < repeatCount; occurrence += 1) slots.push(String(day));
  }
  return slots.slice(0, ATTENDANCE_V2_SLOT_CAPACITY);
}
// Gestiona asistencia v2 fill array.
function attendanceV2FillArray(source, fallbackFactory) {
  return Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, (_, idx) => {
    if (idx < source.length) return source[idx];
    return typeof fallbackFactory === 'function' ? fallbackFactory(idx) : fallbackFactory;
  });
}
// Gestiona asistencia v2 visible slot count.
function attendanceV2VisibleSlotCount(record) {
  const explicitCount = Math.max(0, Math.min(ATTENDANCE_V2_SLOT_CAPACITY, parseInt(record?.visibleCount, 10) || 0));
  const configuredCount = Array.isArray(record?.slotDays)
    ? record.slotDays.reduce((max, value, idx) => (String(value || '').trim() ? idx + 1 : max), 0)
    : 0;
  return Math.max(1, explicitCount, configuredCount);
}
// Gestiona asistencia v2 aplicar slot projection.
function attendanceV2ApplySlotProjection(record, slots) {
  const nextDays = attendanceV2FillArray(slots, '');
  const previousDays = Array.isArray(record.slotDays) ? record.slotDays : [];
  const previousMeta = Array.isArray(record.slotMeta) ? record.slotMeta : [];
  const nextMeta = attendanceV2FillArray(slots.map((day, idx) => {
    const currentDay = String(previousDays[idx] || '').trim();
    return currentDay && currentDay === String(day) ? normalizeAttendanceV2SlotMeta(previousMeta[idx] || '') : createAttendanceV2SlotMeta();
  }), () => createAttendanceV2SlotMeta());
  record.slotDays = nextDays;
  record.slotMeta = nextMeta;
  record.visibleCount = Math.max(1, Math.min(ATTENDANCE_V2_SLOT_CAPACITY, slots.length));
  Object.keys(record.studentCodes || {}).forEach((studentId) => {
    const current = Array.isArray(record.studentCodes[studentId]) ? record.studentCodes[studentId] : [];
    record.studentCodes[studentId] = attendanceV2FillArray(slots.map((_, idx) => String(current[idx] || '').toUpperCase()), '');
  });
}
// Gestiona asistencia v2 record has configured days.
function attendanceV2RecordHasConfiguredDays(record) {
  return Array.isArray(record?.slotDays) && record.slotDays.some((value) => String(value || '').trim());
}
// Asegura asegurar asistencia v2 projected programar.
function ensureAttendanceV2ProjectedSchedule(sectionId, fromMonthKey) {
  const normalizedFrom = normalizeAttendanceMonthKey(fromMonthKey);
  const monthKeys = attendanceActiveSchoolMonthKeys().filter((key) => key >= normalizedFrom);
  if (!monthKeys.length) return false;
  let changed = false;
  monthKeys.forEach((monthKey) => {
    const slots = buildAttendanceV2SlotsFromWeeklySchedule(sectionId, monthKey);
    if (!slots.length) return;
    const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
    if (attendanceV2RecordHasConfiguredDays(record)) return;
    attendanceV2ApplySlotProjection(record, slots);
    changed = true;
  });
  if (changed) persist();
  return changed;
}

// Gestiona asistencia mes select options.
function attendanceMonthSelectOptions(monthKey) {
  const { startYear, endYear } = getSchoolYearRange();
  const options = [];
  for (let month = 8; month <= 12; month += 1) {
    const optionKey = `${startYear}-${String(month).padStart(2, '0')}`;
    options.push({ key: optionKey, label: attendanceMonthLongLabel(optionKey), active: attendanceIsSchoolMonthActive(optionKey) });
  }
  for (let month = 1; month <= 7; month += 1) {
    const optionKey = `${endYear}-${String(month).padStart(2, '0')}`;
    options.push({ key: optionKey, label: attendanceMonthLongLabel(optionKey), active: attendanceIsSchoolMonthActive(optionKey) });
  }
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  if (!options.some((option) => option.key === normalizedMonth)) {
    options.push({
      key: normalizedMonth,
      label: attendanceMonthLongLabel(normalizedMonth),
      active: attendanceIsSchoolMonthActive(normalizedMonth),
    });
  }
  return options;
}

// Normaliza normalizar asistencia v2 exception.
function normalizeAttendanceV2Exception(type) {
  return ATTENDANCE_V2_EXCEPTION_ORDER.includes(type) ? type : '';
}

// Normaliza normalizar asistencia v2 slot meta.
function normalizeAttendanceV2SlotMeta(meta) {
  if (!meta || typeof meta !== 'object') return createAttendanceV2SlotMeta(String(meta || ''));
  return createAttendanceV2SlotMeta(meta.type || '', meta.reason || '');
}

// Gestiona sanitize asistencia v2 record.
function sanitizeAttendanceV2Record(record) {
  if (!record || typeof record !== 'object') return createAttendanceV2MonthRecord();
  if (!Array.isArray(record.slotDays)) record.slotDays = Array(ATTENDANCE_V2_SLOT_CAPACITY).fill('');
  if (!Array.isArray(record.slotMeta)) record.slotMeta = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, () => createAttendanceV2SlotMeta());
  if (!record.studentCodes || typeof record.studentCodes !== 'object') record.studentCodes = {};
  if (!record.retiredCarryOverrides || typeof record.retiredCarryOverrides !== 'object') record.retiredCarryOverrides = {};
  record.slotDays = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, (_, idx) => {
    const raw = String(record.slotDays[idx] ?? '').replace(/\D/g, '').slice(0, 2);
    if (!raw) return '';
    const day = parseInt(raw, 10);
    return day >= 1 && day <= 31 ? String(day) : '';
  });
  record.slotMeta = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, (_, idx) => normalizeAttendanceV2SlotMeta(record.slotMeta[idx] || ''));
  if (!['until-retirement', 'full-month'].includes(record.retiredPolicy)) record.retiredPolicy = 'until-retirement';
  record.scheduleLinked = !!record.scheduleLinked;
  record.visibleCount = Math.max(1, Math.min(ATTENDANCE_V2_SLOT_CAPACITY, parseInt(record.visibleCount, 10) || 0));
  Object.keys(record.studentCodes).forEach((studentId) => {
    const baseRow = Array.isArray(record.studentCodes[studentId]) ? record.studentCodes[studentId] : [];
    record.studentCodes[studentId] = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, (_, idx) => {
      const code = String(baseRow[idx] || '').toUpperCase();
      return ATTENDANCE_V2_CODE_ORDER.includes(code) ? code : '';
    });
    const retiredIndex = record.studentCodes[studentId].indexOf('R');
    if (retiredIndex >= 0) {
      for (let idx = retiredIndex + 1; idx < ATTENDANCE_V2_SLOT_CAPACITY; idx += 1) record.studentCodes[studentId][idx] = '';
    }
  });
  record.__normalized = true;
  return record;
}

// Gestiona asistencia v2 row has any marcar.
function attendanceV2RowHasAnyMark(row) {
  return Array.isArray(row) && row.some((code) => String(code || '').trim());
}

// Gestiona asistencia v2 inherited retired.
function attendanceV2InheritedRetired(sectionId, monthKey, studentId) {
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  const record = getAttendanceV2MonthRecord(sectionId, normalizedMonth, false);
  if (record.retiredCarryOverrides?.[studentId]) return false;
  const currentRow = getAttendanceV2StudentRow(sectionId, normalizedMonth, studentId, false);
  if (currentRow.includes('R')) return false;
  if (attendanceV2RowHasAnyMark(currentRow)) return false;
  const sectionRecords = S.attendance?.records?.[sectionId];
  if (!sectionRecords || typeof sectionRecords !== 'object') return false;
  let inherited = false;
  Object.keys(sectionRecords)
    .filter((key) => normalizeAttendanceMonthKey(key) < normalizedMonth)
    .sort()
    .forEach((key) => {
      const prevRecord = getAttendanceV2MonthRecord(sectionId, key, false);
      const prevRow = getAttendanceV2StudentRow(sectionId, key, studentId, false);
      if (prevRow.includes('R')) inherited = true;
      else if (attendanceV2RowHasAnyMark(prevRow) || prevRecord.retiredCarryOverrides?.[studentId]) inherited = false;
    });
  return inherited;
}

// Gestiona asistencia v2 effective slot code.
function attendanceV2EffectiveSlotCode(sectionId, monthKey, studentId, slotIndex) {
  const stored = String(getAttendanceV2StudentRow(sectionId, monthKey, studentId, false)[slotIndex] || '').toUpperCase();
  if (stored) return stored;
  return attendanceV2InheritedRetired(sectionId, monthKey, studentId) ? 'R' : '';
}

// Obtiene el registro mensual v2 de una seccion y lo normaliza para que el resto del flujo trabaje sobre datos sanos.
function getAttendanceV2MonthRecord(sectionId, monthKey, createIfMissing = false) {
  ensureAttendanceV2State();
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  if (!sectionId) return createAttendanceV2MonthRecord();
  const groupSettings = getAttendanceV2GroupSettings(sectionId, createIfMissing);
  if (!S.attendance.records[sectionId]) {
    if (!createIfMissing) return createAttendanceV2MonthRecord();
    S.attendance.records[sectionId] = {};
  }
  if (!S.attendance.records[sectionId][normalizedMonth]) {
    if (!createIfMissing) return createAttendanceV2MonthRecord();
    S.attendance.records[sectionId][normalizedMonth] = { ...createAttendanceV2MonthRecord(), scheduleLinked: !!groupSettings.scheduleLinked };
  }
  const currentRecord = S.attendance.records[sectionId][normalizedMonth];
  if (!currentRecord.__normalized) {
    S.attendance.records[sectionId][normalizedMonth] = sanitizeAttendanceV2Record(currentRecord);
  }
  S.attendance.records[sectionId][normalizedMonth].scheduleLinked = !!groupSettings.scheduleLinked;
  return S.attendance.records[sectionId][normalizedMonth];
}

// Obtiene get asistencia v2 estudiante row.
function getAttendanceV2StudentRow(sectionId, monthKey, studentId, createIfMissing = false) {
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, createIfMissing);
  if (!record.studentCodes[studentId]) {
    if (!createIfMissing) return Array(ATTENDANCE_V2_SLOT_CAPACITY).fill('');
    record.studentCodes[studentId] = Array(ATTENDANCE_V2_SLOT_CAPACITY).fill('');
  }
  return record.studentCodes[studentId];
}

// Obtiene get asistencia v2 slot code.
function getAttendanceV2SlotCode(sectionId, monthKey, studentId, slotIndex) {
  return attendanceV2EffectiveSlotCode(sectionId, monthKey, studentId, slotIndex);
}

// Actualiza set asistencia v2 slot code.
function setAttendanceV2SlotCode(sectionId, monthKey, studentId, slotIndex, code) {
  if (!sectionId || !studentId || slotIndex < 0 || slotIndex >= ATTENDANCE_V2_SLOT_CAPACITY) return;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  if (attendanceV2InheritedRetired(sectionId, monthKey, studentId) && String(code || '').toUpperCase() !== 'R') {
    record.retiredCarryOverrides[studentId] = true;
  } else if (String(code || '').toUpperCase() === 'R') {
    delete record.retiredCarryOverrides[studentId];
  }
  const row = getAttendanceV2StudentRow(sectionId, monthKey, studentId, true);
  row[slotIndex] = ATTENDANCE_V2_CODE_ORDER.includes(String(code || '').toUpperCase()) ? String(code || '').toUpperCase() : '';
  const retiredIndex = row.indexOf('R');
  if (retiredIndex >= 0) {
    for (let idx = retiredIndex + 1; idx < ATTENDANCE_V2_SLOT_CAPACITY; idx += 1) row[idx] = '';
  }
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
}

// Normaliza normalizar asistencia v2 day valor.
function normalizeAttendanceV2DayValue(value) {
  const raw = String(value || '').replace(/\D/g, '').slice(0, 2);
  if (!raw) return '';
  const day = parseInt(raw, 10);
  return day >= 1 && day <= 31 ? String(day) : '';
}

// Actualiza set asistencia v2 slot day.
function setAttendanceV2SlotDay(sectionId, monthKey, slotIndex, value) {
  if (!sectionId || slotIndex < 0 || slotIndex >= ATTENDANCE_V2_SLOT_CAPACITY) return false;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  const normalized = normalizeAttendanceV2DayValue(value);
  record.slotDays[slotIndex] = normalized;
  record.visibleCount = Math.max(attendanceV2VisibleSlotCount(record), slotIndex + 1);
  if (!normalized) record.slotMeta[slotIndex] = createAttendanceV2SlotMeta();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  return true;
}

// Gestiona asistencia v2 slot meta.
function attendanceV2SlotMeta(sectionId, monthKey, slotIndex) {
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, false);
  return normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
}

// Actualiza set asistencia v2 slot exception.
function setAttendanceV2SlotException(sectionId, monthKey, slotIndex, type) {
  if (!sectionId || slotIndex < 0 || slotIndex >= ATTENDANCE_V2_SLOT_CAPACITY) return;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  if (!record.slotDays[slotIndex]) {
    toast('Primero coloca un d?a v?lido en esa columna', true);
    return;
  }
  const targetDay = String(record.slotDays[slotIndex] || '').trim();
  const current = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
  const normalizedType = normalizeAttendanceV2Exception(type);
  const nextReason = normalizedType ? current.reason : '';
  record.slotMeta = record.slotMeta.map((meta, idx) => String(record.slotDays[idx] || '').trim() === targetDay
    ? createAttendanceV2SlotMeta(normalizedType, nextReason)
    : normalizeAttendanceV2SlotMeta(meta || ''));
  persist();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  rerenderAttendanceV2Page();
}

// Actualiza set asistencia v2 slot reason.
function setAttendanceV2SlotReason(sectionId, monthKey, slotIndex, reason) {
  if (!sectionId || slotIndex < 0 || slotIndex >= ATTENDANCE_V2_SLOT_CAPACITY) return;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  const current = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
  if (!current.type) return;
  const targetDay = String(record.slotDays[slotIndex] || '').trim();
  record.slotMeta = record.slotMeta.map((meta, idx) => String(record.slotDays[idx] || '').trim() === targetDay
    ? createAttendanceV2SlotMeta(current.type, reason)
    : normalizeAttendanceV2SlotMeta(meta || ''));
  persist();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  rerenderAttendanceV2Page();
}

// Gestiona asistencia v2 worked slots.
function attendanceV2WorkedSlots(sectionId, monthKey) {
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, false);
  return Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, (_, slotIndex) => {
    const day = record.slotDays[slotIndex];
    const meta = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
    if (!day || meta.type) return null;
    return { slotIndex, day: parseInt(day, 10), exception: meta.type };
  }).filter(Boolean);
}

// Gestiona asistencia v2 exception label.
function attendanceV2ExceptionLabel(type) {
  if (type === 'holiday') return 'F';
  if (type === 'suspension') return 'S';
  if (type === 'no-school') return 'NL';
  return '?';
}

// Gestiona asistencia v2 exception title.
function attendanceV2ExceptionTitle(type) {
  if (type === 'holiday') return 'Feriado';
  if (type === 'suspension') return 'Suspensi?n de clases';
  if (type === 'no-school') return 'No laborable';
  return 'Ninguno';
}

// Gestiona asistencia v2 exception short label.
function attendanceV2ExceptionShortLabel(type) {
  return type ? `${attendanceV2ExceptionLabel(type)} ? ${attendanceV2ExceptionTitle(type)}` : 'Ninguno';
}

// Gestiona asistencia v2 exception class.
function attendanceV2ExceptionClass(type) {
  if (type === 'holiday') return 'is-holiday';
  if (type === 'suspension') return 'is-suspension';
  if (type === 'no-school') return 'is-no-school';
  return '';
}

// Gestiona asistencia v2 marcar class.
function attendanceV2MarkClass(code) {
  if (code === 'P') return 'is-present';
  if (code === 'T') return 'is-late';
  if (code === 'A') return 'is-absent';
  if (code === 'E') return 'is-excused';
  if (code === 'R') return 'is-retired';
  return '';
}

// Gestiona asistencia v2 legend item.
function attendanceV2LegendItem(code, label) {
  return `<span class="attendance-legend-item"><span class="attendance-mark ${attendanceV2MarkClass(code)}">${code}</span>${label}</span>`;
}

// Gestiona asistencia v2 clean estudiante name.
function attendanceV2CleanStudentName(value) {
  return String(value || '').replace(/^\s*\d+\s*/u, '').trim();
}

// Gestiona asistencia v2 estudiante full name.
function attendanceV2StudentFullName(student) {
  const firstName = attendanceV2CleanStudentName(student?.nombre || '');
  const lastName = attendanceV2CleanStudentName(student?.apellido || '');
  return `${firstName} ${lastName}`.trim();
}

// Gestiona asistencia header contexto.
function attendanceHeaderContext(group, monthKey) {
  const suggestedPeriodId = suggestedAcademicPeriodIdForMonth(monthKey) || S.activePeriodId;
  return {
    subject: group?.materia || 'General',
    section: `${group?.gradeName || ''} ${group?.sectionName || ''}`.trim(),
    period: periodName(suggestedPeriodId),
    month: plannerMonthLabel(monthKey),
  };
}

// Gestiona asistencia v2 retired index.
function attendanceV2RetiredIndex(sectionId, monthKey, studentId) {
  const row = getAttendanceV2StudentRow(sectionId, monthKey, studentId, false);
  const explicitIndex = row.indexOf('R');
  if (explicitIndex >= 0) return explicitIndex;
  return attendanceV2InheritedRetired(sectionId, monthKey, studentId) ? 0 : -1;
}

// Gestiona asistencia v2 is locked.
function attendanceV2IsLocked(sectionId, monthKey, studentId, slotIndex) {
  const retiredIndex = attendanceV2RetiredIndex(sectionId, monthKey, studentId);
  return retiredIndex >= 0 && slotIndex > retiredIndex;
}

// Gestiona summarize asistencia v2 mes.
function summarizeAttendanceV2Month(sectionId, monthKey, studentId) {
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, false);
  const row = getAttendanceV2StudentRow(sectionId, monthKey, studentId, false);
  const workedSlots = attendanceV2WorkedSlots(sectionId, monthKey);
  if (attendanceV2InheritedRetired(sectionId, monthKey, studentId)) {
    return { total: 0, percent: 0, retiredIndex: 0 };
  }
  const retiredIndex = row.indexOf('R');
  const scopedSlots = workedSlots.filter(({ slotIndex }) => retiredIndex < 0 || record.retiredPolicy === 'full-month' || slotIndex <= retiredIndex);
  let total = 0;
  scopedSlots.forEach(({ slotIndex }) => { if (row[slotIndex] === 'P' || row[slotIndex] === 'T' || row[slotIndex] === 'E') total += 1; });
  return { total, percent: scopedSlots.length ? round2((total / scopedSlots.length) * 100) : 0, retiredIndex };
}

// Actualiza set asistencia v2 interfaz focus.
function setAttendanceV2UiFocus(type, studentId, slotIndex) {
  ATTENDANCE_V2_UI.activeType = type;
  ATTENDANCE_V2_UI.activeStudentId = studentId || '';
  ATTENDANCE_V2_UI.activeSlotIndex = slotIndex;
}

// Gestiona asistencia v2 day borrador key.
function attendanceV2DayDraftKey(sectionId, monthKey, slotIndex) {
  return `${sectionId}__${monthKey}__${slotIndex}`;
}

// Actualiza set asistencia v2 day borrador.
function setAttendanceV2DayDraft(sectionId, monthKey, slotIndex, value) {
  ATTENDANCE_V2_UI.dayDrafts[attendanceV2DayDraftKey(sectionId, monthKey, slotIndex)] = String(value || '').replace(/\D/g, '').slice(0, 2);
}

// Gestiona clear asistencia v2 day borrador.
function clearAttendanceV2DayDraft(sectionId, monthKey, slotIndex) {
  delete ATTENDANCE_V2_UI.dayDrafts[attendanceV2DayDraftKey(sectionId, monthKey, slotIndex)];
}

// Obtiene get asistencia v2 day borrador.
function getAttendanceV2DayDraft(sectionId, monthKey, slotIndex, fallback = '') {
  const key = attendanceV2DayDraftKey(sectionId, monthKey, slotIndex);
  return Object.prototype.hasOwnProperty.call(ATTENDANCE_V2_UI.dayDrafts, key)
    ? ATTENDANCE_V2_UI.dayDrafts[key]
    : fallback;
}

// Gestiona focus asistencia v2 interfaz cell.
function focusAttendanceV2UiCell(type, studentId, slotIndex) {
  const selector = type === 'day'
    ? `[data-att-v2-type="day"][data-att-v2-slot="${slotIndex}"]`
    : `[data-att-v2-type="attendance"][data-att-v2-student="${studentId}"][data-att-v2-slot="${slotIndex}"]`;
  const el = STATIC_DOM.view?.querySelector(selector);
  if (el && typeof el.focus === 'function') {
    el.focus();
    return true;
  }
  return false;
}

// Gestiona restore asistencia v2 interfaz focus.
function restoreAttendanceV2UiFocus() {
  if (currentPage !== 'asistencia' || !ATTENDANCE_V2_UI.activeType) return;
  scheduleNonCriticalTask(() => {
    focusAttendanceV2UiCell(ATTENDANCE_V2_UI.activeType, ATTENDANCE_V2_UI.activeStudentId, ATTENDANCE_V2_UI.activeSlotIndex);
  });
}

// Re-renderiza la vista de asistencia v2 sin perder el panel actual ni el contexto de escritura asistida.
function rerenderAttendanceV2Page(options = {}) {
  const { refreshTopbar = false } = options;
  if (currentPage !== 'asistencia' || !STATIC_DOM.view) {
    go(currentPage);
    return;
  }
  if (refreshTopbar) refreshTop();
  RENDERS.asistencia(STATIC_DOM.view);
  enableAttendanceWritingAssist(STATIC_DOM.view);
}

// Actualiza actualizar asistencia v2 programar switch interfaz.
function updateAttendanceV2ScheduleSwitchUi(enabled) {
  const button = STATIC_DOM.view?.querySelector('[data-att-v2-action="toggle-schedule-link"]');
  if (!button) return;
  const copyStrong = button.querySelector('.attendance-link-switch-copy strong');
  const copySmall = button.querySelector('.attendance-link-switch-copy small');
  button.dataset.attV2Enabled = enabled ? 'true' : 'false';
  button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  button.classList.toggle('is-linked', !!enabled);
  button.classList.toggle('is-unlinked', !enabled);
  if (copyStrong) copyStrong.textContent = enabled ? 'Encendido' : 'Apagado';
  if (copySmall) copySmall.textContent = enabled ? 'Autorrelleno activo' : 'Sin autorrelleno';
}

// Refresca refrescar asistencia v2 estudiante row interfaz.
function refreshAttendanceV2StudentRowUi(sectionId, monthKey, studentId) {
  if (currentPage !== 'asistencia' || !STATIC_DOM.view || !studentId) return false;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, false);
  const slotCount = attendanceV2VisibleSlotCount(record);
  const stats = summarizeAttendanceV2Month(sectionId, monthKey, studentId);
  for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
    const cell = STATIC_DOM.view.querySelector(`[data-att-v2-type="attendance"][data-att-v2-student="${studentId}"][data-att-v2-slot="${slotIndex}"]`);
    if (!cell) continue;
    const code = attendanceV2EffectiveSlotCode(sectionId, monthKey, studentId, slotIndex);
    const slotMeta = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
    const unavailable = !record.slotDays[slotIndex] || !!slotMeta.type;
    const locked = unavailable || attendanceV2IsLocked(sectionId, monthKey, studentId, slotIndex);
    const shownCode = unavailable ? '?' : code;
    cell.textContent = shownCode;
    cell.disabled = locked;
    cell.className = `attendance-mark ${attendanceV2MarkClass(code)} ${locked ? 'is-locked' : ''}`.trim();
    cell.closest('.attendance-cell')?.classList.toggle('is-special-day', unavailable);
  }
  const totalEl = STATIC_DOM.view.querySelector(`[data-att-v2-total-for="${studentId}"]`);
  const percentEl = STATIC_DOM.view.querySelector(`[data-att-v2-percent-for="${studentId}"]`);
  if (totalEl) totalEl.textContent = String(stats.total);
  if (percentEl) percentEl.textContent = `${stats.percent}%`;
  return true;
}

// Cambia el mes activo, sincroniza periodo sugerido y prepara el registro para seguir editando esa ventana temporal.
function setAttendanceV2Month(monthKey, options = {}) {
  const { syncPeriod = true, userInitiated = true } = options;
  ensureAttendanceV2State();
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  S.attendance.monthKey = normalizedMonth;
  if (userInitiated) attendanceMonthPinned = true;
  if (syncPeriod) {
    const suggestedPeriodId = suggestedAcademicPeriodIdForMonth(normalizedMonth);
    if (suggestedPeriodId) {
      S.activePeriodId = suggestedPeriodId;
      ensurePeriodBuckets(suggestedPeriodId);
    }
  }
  if (S.activeGroupId) {
    const record = getAttendanceV2MonthRecord(S.activeGroupId, normalizedMonth, true);
    if (record.scheduleLinked) attendanceV2EnsureMonthMatchesSchedule(S.activeGroupId, normalizedMonth);
  }
  persist();
  if (S.activeGroupId) scheduleSqlAttendanceMonthSync(S.activeGroupId, normalizedMonth);
  rerenderAttendanceV2Page({ refreshTopbar: true });
}

// Gestiona shift asistencia v2 mes.
function shiftAttendanceV2Month(delta) {
  const nextMonthKey = attendanceShiftMonthKey(S.attendance.monthKey || getCurrentMonthKey(), delta);
  setAttendanceV2Month(nextMonthKey);
}

// Actualiza set asistencia v2 retired policy.
function setAttendanceV2RetiredPolicy(sectionId, monthKey, policy) {
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  record.retiredPolicy = ['until-retirement', 'full-month'].includes(policy) ? policy : 'until-retirement';
  persist();
  rerenderAttendanceV2Page();
}

// Vincula o desvincula el horario docente con la asistencia mensual y aplica la proyeccion cuando corresponde.
function setAttendanceV2ScheduleLinked(sectionId, monthKey, enabled, options = {}) {
  const { deferProjection = false } = options;
  if (!sectionId) return;
  const deferKey = `${sectionId}::${monthKey}`;
  const groupSettings = getAttendanceV2GroupSettings(sectionId, true);
  groupSettings.scheduleLinked = !!enabled;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  record.scheduleLinked = !!enabled;
  if (record.scheduleLinked) {
    if (deferProjection) ATTENDANCE_V2_DEFERRED_PROJECTION.add(deferKey);
    else ATTENDANCE_V2_DEFERRED_PROJECTION.delete(deferKey);
    persist();
    // Aplica aplicar projection.
    const applyProjection = () => {
      ATTENDANCE_V2_DEFERRED_PROJECTION.delete(deferKey);
      const applied = attendanceV2EnsureMonthMatchesSchedule(sectionId, monthKey, { force: true });
      rerenderAttendanceV2Page();
      toast(applied ? 'Horario vinculado y d?as autocompletados' : 'No hay horario semanal configurado para esta materia.', !applied);
    };
    if (deferProjection) {
      scheduleNonCriticalTask(applyProjection, 120);
    } else {
      rerenderAttendanceV2Page();
      applyProjection();
    }
    scheduleSqlAttendanceMonthSync(sectionId, monthKey);
    return;
  }
  ATTENDANCE_V2_DEFERRED_PROJECTION.delete(deferKey);
  record.slotDays = Array(ATTENDANCE_V2_SLOT_CAPACITY).fill('');
  record.slotMeta = Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, () => createAttendanceV2SlotMeta());
  record.visibleCount = 1;
  persist();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  rerenderAttendanceV2Page();
  toast('Horario desvinculado y d?as autorrellenados ocultos');
}

// Gestiona add asistencia v2 visible slot.
function addAttendanceV2VisibleSlot(sectionId, monthKey) {
  if (!sectionId) return;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  const nextCount = Math.min(ATTENDANCE_V2_SLOT_CAPACITY, attendanceV2VisibleSlotCount(record) + 1);
  if (nextCount === attendanceV2VisibleSlotCount(record)) {
    toast('Ya no se pueden agregar m?s columnas', true);
    return;
  }
  record.visibleCount = nextCount;
  persist();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  rerenderAttendanceV2Page();
}

// Gestiona remove asistencia v2 visible slot.
function removeAttendanceV2VisibleSlot(sectionId, monthKey) {
  if (!sectionId) return;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  const currentCount = attendanceV2VisibleSlotCount(record);
  if (currentCount <= 1) {
    toast('Debe quedar al menos una columna visible', true);
    return;
  }
  const targetIndex = currentCount - 1;
  record.slotDays[targetIndex] = '';
  record.slotMeta[targetIndex] = createAttendanceV2SlotMeta();
  Object.keys(record.studentCodes || {}).forEach((studentId) => {
    const row = Array.isArray(record.studentCodes[studentId]) ? record.studentCodes[studentId] : [];
    row[targetIndex] = '';
    record.studentCodes[studentId] = row;
  });
  record.visibleCount = Math.max(1, currentCount - 1);
  persist();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  rerenderAttendanceV2Page();
}

// Elimina el mes v2 completo del curso activo y propaga el borrado a SQL como fuente principal.
function clearAttendanceV2Month(sectionId, monthKey) {
  const normalizedMonth = normalizeAttendanceMonthKey(monthKey);
  if (S.attendance.records?.[sectionId]?.[normalizedMonth]) {
    delete S.attendance.records[sectionId][normalizedMonth];
    if (!Object.keys(S.attendance.records[sectionId]).length) delete S.attendance.records[sectionId];
    cancelSqlAttendanceMonthSync(sectionId, normalizedMonth);
    syncSqlAttendanceMonth(sectionId, normalizedMonth, { clear: true }).catch((error) => {
      console.warn('[AulaBase][sql-api] No se pudo limpiar la asistencia en SQL', error);
    });
    persist();
    rerenderAttendanceV2Page();
  }
}

// Gestiona cycle asistencia v2 slot exception.
function cycleAttendanceV2SlotException(sectionId, monthKey, slotIndex) {
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  if (!record.slotDays[slotIndex]) {
    toast('Primero coloca un d?a v?lido en esa columna', true);
    return;
  }
  const current = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
  const currentIndex = ATTENDANCE_V2_EXCEPTION_ORDER.indexOf(current.type);
  setAttendanceV2SlotException(
    sectionId,
    monthKey,
    slotIndex,
    ATTENDANCE_V2_EXCEPTION_ORDER[(currentIndex + 1 + ATTENDANCE_V2_EXCEPTION_ORDER.length) % ATTENDANCE_V2_EXCEPTION_ORDER.length]
  );
}

// Proyecta los dias del horario semanal sobre el mes, cuidando no pisar marcas o excepciones ya capturadas.
function attendanceV2EnsureMonthMatchesSchedule(sectionId, monthKey, options = {}) {
  const { force = false } = options;
  const slots = buildAttendanceV2SlotsFromWeeklySchedule(sectionId, monthKey);
  if (!slots.length) return false;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  const projectedDays = attendanceV2FillArray(slots, '');
  const sameProjection = projectedDays.every((day, idx) => String(record.slotDays[idx] || '') === String(day || ''));
  if (!force && attendanceV2RecordHasConfiguredDays(record) && sameProjection) return false;
  if (!force && attendanceV2RecordHasConfiguredDays(record) && !sameProjection) {
    const hasStudentMarks = Object.values(record.studentCodes || {}).some((row) => Array.isArray(row) && row.some((code) => String(code || '').trim()));
    // Comprueba si tiene has exceptions.
    const hasExceptions = (record.slotMeta || []).some((meta) => {
      const normalized = normalizeAttendanceV2SlotMeta(meta || '');
      return !!(normalized.type || normalized.reason);
    });
    if (hasStudentMarks || hasExceptions) return false;
  }
  attendanceV2ApplySlotProjection(record, slots);
  persist();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  return true;
}

// Fuerza manualmente la proyeccion del horario semanal sobre el mes cuando el docente lo solicita.
function applyAttendanceV2WeeklySchedule(sectionId, monthKey) {
  if (!attendanceV2EnsureMonthMatchesSchedule(sectionId, monthKey, { force: true })) {
    toast('No hay horario semanal configurado para esta secci?n.', true);
    return;
  }
  toast('D?as autocompletados desde el horario docente');
  rerenderAttendanceV2Page();
}

// Actualiza set asistencia v2 day valor.
function setAttendanceV2DayValue(sectionId, monthKey, slotIndex, value) {
  setAttendanceV2UiFocus('day', '', slotIndex);
  const normalized = String(value || '').replace(/\D/g, '').slice(0, 2);
  setAttendanceV2DayDraft(sectionId, monthKey, slotIndex, normalized);
}

// Confirma el dia escrito en una columna, valida su rango y mueve el foco si la captura continua en serie.
function commitAttendanceV2DayValue(sectionId, monthKey, slotIndex, value, direction = '') {
  setAttendanceV2UiFocus('day', '', slotIndex);
  const draft = String(value ?? getAttendanceV2DayDraft(sectionId, monthKey, slotIndex, '')).replace(/\D/g, '').slice(0, 2);
  if (!setAttendanceV2SlotDay(sectionId, monthKey, slotIndex, draft)) {
    setAttendanceV2DayDraft(sectionId, monthKey, slotIndex, draft);
    scheduleNonCriticalTask(() => focusAttendanceV2UiCell('day', '', slotIndex));
    return false;
  }
  clearAttendanceV2DayDraft(sectionId, monthKey, slotIndex);
  if (direction) {
    const moved = moveAttendanceV2Focus('day', '', slotIndex, direction);
    if (!moved) setAttendanceV2NextFocus('day', '', slotIndex, direction);
  }
  persist();
  return true;
}

// Alterna la marca de asistencia de una celda y refresca solo la fila afectada cuando es posible.
function cycleAttendanceV2SlotCode(sectionId, monthKey, studentId, slotIndex) {
  if (attendanceV2IsLocked(sectionId, monthKey, studentId, slotIndex)) return;
  const current = getAttendanceV2SlotCode(sectionId, monthKey, studentId, slotIndex);
  const currentIndex = ATTENDANCE_V2_CODE_ORDER.indexOf(current);
  const nextCode = ATTENDANCE_V2_CODE_ORDER[(currentIndex + 1 + ATTENDANCE_V2_CODE_ORDER.length) % ATTENDANCE_V2_CODE_ORDER.length];
  setAttendanceV2NextFocus('attendance', studentId, slotIndex, 'down');
  setAttendanceV2SlotCode(sectionId, monthKey, studentId, slotIndex, nextCode);
  persist();
  if (!refreshAttendanceV2StudentRowUi(sectionId, monthKey, studentId)) rerenderAttendanceV2Page();
  restoreAttendanceV2UiFocus();
}

// Escribe una marca exacta desde teclado o accesos directos, preservando el flujo de foco de captura.
function setAttendanceV2CodeDirect(sectionId, monthKey, studentId, slotIndex, code) {
  if (attendanceV2IsLocked(sectionId, monthKey, studentId, slotIndex)) return;
  setAttendanceV2NextFocus('attendance', studentId, slotIndex, 'down');
  setAttendanceV2SlotCode(sectionId, monthKey, studentId, slotIndex, code);
  persist();
  if (!refreshAttendanceV2StudentRowUi(sectionId, monthKey, studentId)) rerenderAttendanceV2Page();
  restoreAttendanceV2UiFocus();
}

// Gestiona move asistencia v2 focus.
function moveAttendanceV2Focus(type, studentId, slotIndex, direction) {
  const studentIds = ATTENDANCE_V2_UI.studentIds || [];
  const rowIndex = studentIds.indexOf(studentId);
  const slotLimit = attendanceV2VisibleSlotCount(getAttendanceV2MonthRecord(ATTENDANCE_V2_UI.sectionId, ATTENDANCE_V2_UI.monthKey, false));
  if (type === 'day') {
    if (direction === 'left') return focusAttendanceV2UiCell('day', '', Math.max(0, slotIndex - 1));
    if (direction === 'right') return focusAttendanceV2UiCell('day', '', Math.min(slotLimit - 1, slotIndex + 1));
    if (direction === 'down' || direction === 'enter') return focusAttendanceV2UiCell('attendance', studentIds[0], slotIndex);
    return false;
  }
  if (direction === 'left') return focusAttendanceV2UiCell('attendance', studentId, Math.max(0, slotIndex - 1));
  if (direction === 'right') return focusAttendanceV2UiCell('attendance', studentId, Math.min(slotLimit - 1, slotIndex + 1));
  if (direction === 'up') {
    if (rowIndex <= 0) return focusAttendanceV2UiCell('day', '', slotIndex);
    return focusAttendanceV2UiCell('attendance', studentIds[rowIndex - 1], slotIndex);
  }
  if (direction === 'down' || direction === 'enter') {
    if (rowIndex < 0 || rowIndex >= studentIds.length - 1) return false;
    return focusAttendanceV2UiCell('attendance', studentIds[rowIndex + 1], slotIndex);
  }
  return false;
}

// Actualiza set asistencia v2 next focus.
function setAttendanceV2NextFocus(type, studentId, slotIndex, direction) {
  const studentIds = ATTENDANCE_V2_UI.studentIds || [];
  const rowIndex = studentIds.indexOf(studentId);
  const slotLimit = attendanceV2VisibleSlotCount(getAttendanceV2MonthRecord(ATTENDANCE_V2_UI.sectionId, ATTENDANCE_V2_UI.monthKey, false));
  if (type === 'day') {
    if (direction === 'left') return setAttendanceV2UiFocus('day', '', Math.max(0, slotIndex - 1));
    if (direction === 'right') return setAttendanceV2UiFocus('day', '', Math.min(slotLimit - 1, slotIndex + 1));
    if (direction === 'down' || direction === 'enter') {
      return setAttendanceV2UiFocus('attendance', studentIds[0] || '', slotIndex);
    }
    return setAttendanceV2UiFocus('day', '', slotIndex);
  }
  if (direction === 'left') return setAttendanceV2UiFocus('attendance', studentId, Math.max(0, slotIndex - 1));
  if (direction === 'right') return setAttendanceV2UiFocus('attendance', studentId, Math.min(slotLimit - 1, slotIndex + 1));
  if (direction === 'up') {
    if (rowIndex <= 0) return setAttendanceV2UiFocus('day', '', slotIndex);
    return setAttendanceV2UiFocus('attendance', studentIds[rowIndex - 1], slotIndex);
  }
  if (direction === 'down' || direction === 'enter') {
    if (rowIndex < 0 || rowIndex >= studentIds.length - 1) return setAttendanceV2UiFocus('attendance', studentId, slotIndex);
    return setAttendanceV2UiFocus('attendance', studentIds[rowIndex + 1], slotIndex);
  }
  return setAttendanceV2UiFocus('attendance', studentId, slotIndex);
}

// Traduce teclas de navegacion y captura rapida en acciones concretas dentro de la grilla de asistencia.
function handleAttendanceV2CellKey(event, sectionId, monthKey, studentId, slotIndex) {
  const key = String(event.key || '').toUpperCase();
  if (['ARROWLEFT', 'ARROWRIGHT', 'ARROWUP', 'ARROWDOWN', 'ENTER'].includes(key)) {
    event.preventDefault();
    const map = { ARROWLEFT: 'left', ARROWRIGHT: 'right', ARROWUP: 'up', ARROWDOWN: 'down', ENTER: 'enter' };
    moveAttendanceV2Focus('attendance', studentId, slotIndex, map[key]);
    return;
  }
  if (key === 'BACKSPACE' || key === 'DELETE') {
    event.preventDefault();
    setAttendanceV2CodeDirect(sectionId, monthKey, studentId, slotIndex, '');
    return;
  }
  if (['P', 'T', 'A', 'E', 'R'].includes(key)) {
    event.preventDefault();
    setAttendanceV2CodeDirect(sectionId, monthKey, studentId, slotIndex, key);
  }
}

// Controla la edicion de los encabezados de dia para que solo entren valores validos y el foco siga ordenado.
function handleAttendanceV2DayKey(event, sectionId, monthKey, slotIndex) {
  const key = String(event.key || '').toUpperCase();
  if (['ARROWLEFT', 'ARROWRIGHT', 'ARROWDOWN'].includes(key)) {
    event.preventDefault();
    const map = { ARROWLEFT: 'left', ARROWRIGHT: 'right', ARROWDOWN: 'down' };
    moveAttendanceV2Focus('day', '', slotIndex, map[key]);
    return;
  }
  if (key === 'ENTER') {
    event.preventDefault();
    commitAttendanceV2DayValue(sectionId, monthKey, slotIndex, event.currentTarget?.value || '', 'right');
    return;
  }
  if (key.length === 1 && !/\d/.test(key)) {
    event.preventDefault();
  }
}

// Genera el markup completo de la tabla v2, tanto para edicion interactiva como para exportaciones.
function attendanceV2BuildTableMarkup(sectionId, monthKey, options = {}) {
  const activeGroup = getGroups().find((group) => group.id === sectionId);
  if (!activeGroup) return '';
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  ATTENDANCE_V2_UI.sectionId = sectionId;
  ATTENDANCE_V2_UI.monthKey = monthKey;
  const students = [...studentsInGroup(sectionId)];
  ATTENDANCE_V2_UI.studentIds = students.map((student) => student.id);
  const context = attendanceHeaderContext(activeGroup, monthKey);
  const workedCount = attendanceV2WorkedSlots(sectionId, monthKey).length;
  const interactive = options.interactive !== false;
  const includeIndex = options.includeIndex !== false;
  const slotCount = attendanceV2VisibleSlotCount(record);
  const headers = Array.from({ length: slotCount }, (_, idx) => `<th class="attendance-col-head">${idx + 1}</th>`).join('');
  const dayRow = Array.from({ length: slotCount }, (_, slotIndex) => {
    const dayValue = record.slotDays[slotIndex] || '';
    const slotMeta = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
    const exception = slotMeta.type;
    const reason = slotMeta.reason || '';
    const reasonMarkup = reason ? `<div class="attendance-day-reason">${escapeHtml(reason)}</div>` : '';
    if (!interactive) {
      return `<td class="attendance-day-slot ${attendanceV2ExceptionClass(exception)}"><div class="attendance-day-static">${escapeHtml(dayValue || '')}</div><div class="attendance-day-tag">${escapeHtml(attendanceV2ExceptionShortLabel(exception))}</div>${reasonMarkup}</td>`;
    }
    return `<td class="attendance-day-slot ${attendanceV2ExceptionClass(exception)}"><div class="attendance-day-editor"><input class="attendance-day-input" data-att-v2-type="day" data-att-v2-slot="${slotIndex}" inputmode="numeric" maxlength="2" value="${escapeHtml(getAttendanceV2DayDraft(sectionId, monthKey, slotIndex, dayValue))}" onfocus="setAttendanceV2UiFocus('day','',${slotIndex})" onkeydown="handleAttendanceV2DayKey(event,'${sectionId}','${monthKey}',${slotIndex})" oninput="setAttendanceV2DayValue('${sectionId}','${monthKey}',${slotIndex},this.value); this.value = this.value.replace(/\\D/g,'').slice(0,2);" onblur="commitAttendanceV2DayValue('${sectionId}','${monthKey}',${slotIndex},this.value)"><label class="attendance-special-day"><span>Marcar d?a especial</span><select class="sel attendance-day-select" onchange="setAttendanceV2SlotException('${sectionId}','${monthKey}',${slotIndex},this.value)"><option value="" ${exception === '' ? 'selected' : ''}>Ninguno</option><option value="holiday" ${exception === 'holiday' ? 'selected' : ''}>Feriado</option><option value="suspension" ${exception === 'suspension' ? 'selected' : ''}>Suspensi?n</option><option value="no-school" ${exception === 'no-school' ? 'selected' : ''}>No laborable</option></select></label>${exception ? `<input class="attendance-day-reason-input" type="text" maxlength="140" value="${escapeHtml(reason)}" placeholder="Motivo opcional" onblur="setAttendanceV2SlotReason('${sectionId}','${monthKey}',${slotIndex},this.value)">` : ''}</div><div class="attendance-day-tag">${escapeHtml(attendanceV2ExceptionShortLabel(exception))}</div></td>`;
  }).join('');
  const rows = students.map((student, index) => {
    const stats = summarizeAttendanceV2Month(sectionId, monthKey, student.id);
    const fullName = attendanceV2StudentFullName(student);
    const cells = Array.from({ length: slotCount }, (_, slotIndex) => {
      const code = attendanceV2EffectiveSlotCode(sectionId, monthKey, student.id, slotIndex);
      const slotMeta = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
      const unavailable = !record.slotDays[slotIndex] || !!slotMeta.type;
      const locked = unavailable || attendanceV2IsLocked(sectionId, monthKey, student.id, slotIndex);
      const shownCode = unavailable ? '?' : code;
      if (!interactive) return `<td class="attendance-cell ${unavailable ? 'is-special-day' : ''}"><span class="attendance-mark ${attendanceV2MarkClass(code)} ${locked ? 'is-locked' : ''}">${shownCode}</span></td>`;
      return `<td class="attendance-cell ${unavailable ? 'is-special-day' : ''}"><button class="attendance-mark ${attendanceV2MarkClass(code)} ${locked ? 'is-locked' : ''}" type="button" data-att-v2-type="attendance" data-att-v2-student="${student.id}" data-att-v2-slot="${slotIndex}" onfocus="setAttendanceV2UiFocus('attendance','${student.id}',${slotIndex})" onkeydown="handleAttendanceV2CellKey(event,'${sectionId}','${monthKey}','${student.id}',${slotIndex})" ${locked ? 'disabled' : ''}>${shownCode}</button></td>`;
    }).join('');
    const indexCell = includeIndex ? `<td class="attendance-export-index">${index + 1}</td>` : '';
    return `<tr data-att-v2-row-student="${student.id}">${indexCell}<td class="attendance-student-col">${escapeHtml(fullName)}</td>${cells}<td class="attendance-total-cell" data-att-v2-total-for="${student.id}">${stats.total}</td><td class="attendance-percent-cell" data-att-v2-percent-for="${student.id}">${stats.percent}%</td></tr>`;
  }).join('');
  const indexHead = includeIndex ? '<th class="attendance-export-index-head" rowspan="2">No.</th>' : '';
  const dayIndexHead = includeIndex ? '<th class="attendance-export-index-head">D</th>' : '';
  const tableTools = interactive
    ? `<div class="attendance-table-tools"><div class="attendance-table-tools-copy"><strong>D?as del registro</strong><span>Agrega o quita columnas junto a la fila de d?as.</span></div><div class="attendance-table-tools-actions"><button class="btn btn-outline btn-sm" data-att-v2-action="add-slot" type="button">+ Agregar d?a</button><button class="btn btn-outline btn-sm attendance-remove-slot-btn" data-att-v2-action="remove-slot" type="button">- Eliminar d?a</button></div></div>`
    : '';
  return `<div class="attendance-book-shell ${interactive ? '' : 'is-export'}"><div class="attendance-book-meta"><div class="attendance-book-pill"><span>Asignatura</span><strong>${escapeHtml(context.subject)}</strong></div><div class="attendance-book-pill"><span>Grado y secci?n</span><strong>${escapeHtml(context.section)}</strong></div><div class="attendance-book-pill"><span>Per?odo</span><strong>${escapeHtml(context.period)}</strong></div><div class="attendance-book-pill"><span>Mes</span><strong>${escapeHtml(context.month)}</strong></div></div>${tableTools}<div class="attendance-grid-wrap"><table class="attendance-grid"><thead><tr>${indexHead}<th class="attendance-sticky-head attendance-name-head" rowspan="2">Estudiante</th>${headers}<th class="attendance-summary-head" rowspan="2">T</th><th class="attendance-summary-head" rowspan="2">%</th></tr><tr>${Array.from({ length: slotCount }, () => '<th class="attendance-subhead">Asist.</th>').join('')}</tr><tr class="attendance-days-row">${dayIndexHead}<th class="attendance-sticky-head attendance-name-head attendance-days-label-head">D?as</th>${dayRow}<th class="attendance-total-cell">${workedCount}</th><th class="attendance-percent-cell">-</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

// Inserta la tabla v2 de forma diferida para mantener la UI fluida cuando la grilla es grande.
function renderAttendanceV2TableAsync(root, sectionId, monthKey) {
  if (!root) return;
  const tableHost = root.querySelector('[data-att-v2-table-host]');
  if (!tableHost) return;
  const renderKey = `${sectionId}::${monthKey}::${Date.now()}`;
  tableHost.dataset.attV2RenderKey = renderKey;
  scheduleNonCriticalTask(() => {
    if (currentPage !== 'asistencia') return;
    if (!tableHost.isConnected) return;
    if (tableHost.dataset.attV2RenderKey !== renderKey) return;
    tableHost.innerHTML = attendanceV2BuildTableMarkup(sectionId, monthKey, { interactive: true });
    restoreAttendanceV2UiFocus();
  }, 60);
}

// Gestiona asistencia v2 exportación base name.
function attendanceV2ExportBaseName(sectionId, monthKey) {
  const raw = `${getGroupLabel(sectionId) || 'asistencia'}-${plannerMonthLabel(monthKey)}`;
  return `asistencia-${normTxt(raw).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'registro'}`;
}

// Gestiona asistencia v2 construir exportación HTML.
function attendanceV2BuildExportHtml(sectionId, monthKey) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Registro de Asistencia</title><style>@page{size:landscape;margin:14mm;} body{font-family:Segoe UI,Arial,sans-serif;color:#17304a;margin:0;background:#fff;} .attendance-book-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px;} .attendance-book-pill{border:1px solid #d5e0eb;border-radius:12px;padding:10px;background:#f8fbff;} .attendance-book-pill span{display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:#607993;margin-bottom:4px;} .attendance-grid{width:100%;border-collapse:collapse;table-layout:fixed;} .attendance-grid th,.attendance-grid td{border:1px solid #7f8ea0;padding:4px;text-align:center;font-size:11px;} .attendance-name-head,.attendance-student-col{text-align:left;padding-left:8px;} .attendance-sticky-head,.attendance-summary-head,.attendance-export-index-head{background:#eef4fb;font-weight:800;} .attendance-col-head,.attendance-subhead{background:#f7fbff;} .attendance-days-row td,.attendance-days-row th{background:#fbfdff;} .attendance-mark{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;font-weight:800;} .attendance-export-index,.attendance-export-index-head{width:42px;min-width:42px;} .is-present{background:#e8f7ef;color:#1f8d53;} .is-late{background:#fff4df;color:#bf7a11;} .is-absent{background:#ffebee;color:#c23a4f;} .is-excused{background:#e9f1ff;color:#2f6ecb;} .is-retired{background:#eceff3;color:#566373;} .attendance-day-slot.is-holiday,.attendance-day-slot.is-suspension,.attendance-day-slot.is-no-school{background:#f4f6f9;}</style></head><body>${attendanceV2BuildTableMarkup(sectionId, monthKey, { interactive: false, includeIndex: true })}</body></html>`;
}

// Exporta la hoja de asistencia v2 a Word usando una version HTML imprimible del registro.
function attendanceV2DownloadWord(sectionId, monthKey) {
  const blob = new Blob(['\ufeff', attendanceV2BuildExportHtml(sectionId, monthKey)], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${attendanceV2ExportBaseName(sectionId, monthKey)}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Abre una version imprimible del registro v2 para que el navegador la convierta o imprima como PDF.
function attendanceV2DownloadPdf(sectionId, monthKey) {
  const blob = new Blob([attendanceV2BuildExportHtml(sectionId, monthKey)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) { toast('El navegador bloque? la ventana del PDF.', true); return; }
  setTimeout(() => { try { w.focus(); w.print(); } catch (_) {} }, 450);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

// Construye y descarga un Excel del mes activo, cargando XLSX bajo demanda si aun no esta disponible.
async function attendanceV2DownloadExcel(sectionId, monthKey) {
  let xlsx = window.XLSX;
  if (!xlsx) {
    try {
      xlsx = await ensureXlsxLibrary();
    } catch (_) {
      toast('No se pudo cargar el generador de Excel.', true);
      return;
    }
  }
  if (typeof xlsx === 'undefined') {
    toast('No se pudo cargar el generador de Excel.', true);
    return;
  }
  const activeGroup = getGroups().find((group) => group.id === sectionId);
  if (!activeGroup) return;
  const record = getAttendanceV2MonthRecord(sectionId, monthKey, true);
  const students = [...studentsInGroup(sectionId)];
  const slotCount = attendanceV2VisibleSlotCount(record);
  const context = attendanceHeaderContext(activeGroup, monthKey);
  const headerRow = ['No.', 'Estudiante'];
  for (let idx = 0; idx < slotCount; idx += 1) headerRow.push(String(idx + 1));
  headerRow.push('T', '%');

  const assistRow = ['', 'Asist.'];
  for (let idx = 0; idx < slotCount; idx += 1) assistRow.push('Asist.');
  assistRow.push('', '');

  const daysRow = ['D', 'D?as'];
  for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
    const dayValue = String(record.slotDays[slotIndex] || '').trim();
    const meta = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
    const reason = meta.reason ? ` (${meta.reason})` : '';
    daysRow.push(meta.type ? `${attendanceV2ExceptionShortLabel(meta.type)}${reason}` : dayValue);
  }
  daysRow.push(String(attendanceV2WorkedSlots(sectionId, monthKey).length), '-');

  const rows = students.map((student, index) => {
    const fullName = attendanceV2StudentFullName(student);
    const stats = summarizeAttendanceV2Month(sectionId, monthKey, student.id);
    const row = [index + 1, fullName];
    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      const code = attendanceV2EffectiveSlotCode(sectionId, monthKey, student.id, slotIndex);
      const slotMeta = normalizeAttendanceV2SlotMeta(record.slotMeta[slotIndex] || '');
      const unavailable = !record.slotDays[slotIndex] || !!slotMeta.type;
      row.push(unavailable ? '' : code);
    }
    row.push(stats.total, `${stats.percent}%`);
    return row;
  });

  const aoa = [
    ['Registro de asistencia'],
    ['Asignatura', context.subject, 'Grado y secci?n', context.section, 'Per?odo', context.period, 'Mes', context.month],
    [],
    headerRow,
    assistRow,
    daysRow,
    ...rows,
  ];

  const ws = xlsx.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 34 },
    ...Array.from({ length: slotCount }, () => ({ wch: 8 })),
    { wch: 8 },
    { wch: 8 },
  ];
  ws['!rows'] = [{ hpt: 24 }, { hpt: 20 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(1, slotCount + 3) } },
  ];

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Asistencia');
  xlsx.writeFile(wb, `${attendanceV2ExportBaseName(sectionId, monthKey)}.xlsx`);
}

// Centraliza los clicks del panel v2 para no registrar listeners repetidos en cada rerender del libro.
function setupAttendanceV2EventDelegation(root) {
  if (!root || root.__attendanceV2Delegated) return;
  root.__attendanceV2Delegated = true;
  root.addEventListener('click', (event) => {
    const sectionId = root.dataset.attSectionId || '';
    const monthKey = root.dataset.attMonthKey || '';
    const actionEl = event.target.closest('[data-att-v2-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.attV2Action || '';
    if (action === 'month-prev') { event.preventDefault(); shiftAttendanceV2Month(-1); return; }
    if (action === 'month-next') { event.preventDefault(); shiftAttendanceV2Month(1); return; }
    if (action === 'apply-weekly') { event.preventDefault(); applyAttendanceV2WeeklySchedule(sectionId, monthKey); return; }
    if (action === 'toggle-schedule-link') {
      event.preventDefault();
      if (actionEl.dataset.attV2Busy === 'true') return;
      const enabled = String(actionEl.dataset.attV2Enabled || '') === 'true';
      const nextEnabled = !enabled;
      actionEl.dataset.attV2Busy = 'true';
      actionEl.disabled = true;
      updateAttendanceV2ScheduleSwitchUi(nextEnabled);
      setAttendanceV2ScheduleLinked(sectionId, monthKey, nextEnabled, { deferProjection: nextEnabled });
      return;
    }
    if (action === 'export-pdf') {
      event.preventDefault();
      attendanceV2DownloadPdf(sectionId, monthKey);
      return;
    }
    if (action === 'export-word') {
      event.preventDefault();
      attendanceV2DownloadWord(sectionId, monthKey);
      return;
    }
    if (action === 'export-excel') {
      event.preventDefault();
      attendanceV2DownloadExcel(sectionId, monthKey);
      return;
    }
    if (action === 'add-slot') {
      event.preventDefault();
      addAttendanceV2VisibleSlot(sectionId, monthKey);
      return;
    }
    if (action === 'remove-slot') {
      event.preventDefault();
      removeAttendanceV2VisibleSlot(sectionId, monthKey);
      return;
    }
    if (action === 'clear-month') { event.preventDefault(); clearAttendanceV2Month(sectionId, monthKey); return; }
  });
}

RENDERS.asistencia = function(c) {
  ensureAttendanceV2State();
  ensureActiveGroup();
  const defaultMonthKey = getCurrentMonthKey();
  if (!attendanceMonthPinned && S.attendance.monthKey !== defaultMonthKey) {
    S.attendance.monthKey = defaultMonthKey;
    const suggestedPeriodId = suggestedAcademicPeriodIdForMonth(defaultMonthKey);
    if (suggestedPeriodId) {
      S.activePeriodId = suggestedPeriodId;
      ensurePeriodBuckets(suggestedPeriodId);
    }
    persist();
  }
  const groups = getGroups();
  const activeGroup = groups.find((group) => group.id === S.activeGroupId) || groups[0] || null;
  if (!activeGroup) {
    c.innerHTML = `<div class="card"><div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">No hay secciones creadas</div><div class="es">Crea una secci?n para poder llevar el registro de asistencia por curso.</div><button class="btn btn-primary" onclick="go('estudiantes')">Ir a estudiantes</button></div></div>`;
    return;
  }
  if (S.activeGroupId !== activeGroup.id) {
    S.activeGroupId = activeGroup.id;
    S.activeCourseId = activeGroup.id;
  }
  const monthKey = normalizeAttendanceMonthKey(S.attendance.monthKey || getCurrentMonthKey());
  const record = getAttendanceV2MonthRecord(activeGroup.id, monthKey, true);
  if (record.scheduleLinked && !ATTENDANCE_V2_DEFERRED_PROJECTION.has(`${activeGroup.id}::${monthKey}`)) {
    attendanceV2EnsureMonthMatchesSchedule(activeGroup.id, monthKey);
  }
  const sectionOptions = groups.map((group) => `<option value="${group.id}" ${group.id === activeGroup.id ? 'selected' : ''}>${escapeHtml(getAttendanceGroupLabel(group))}</option>`).join('');
  const monthOptions = attendanceMonthSelectOptions(monthKey).map((option) => `<option value="${option.key}" ${option.key === monthKey ? 'selected' : ''}>${escapeHtml(option.label)}${option.active ? '' : ' - fuera del calendario'}</option>`).join('');
  const monthStatus = attendanceMonthStatusLabel(monthKey);
  const monthStatusClass = attendanceMonthClass(monthKey);
  const suggestedPeriodId = suggestedAcademicPeriodIdForMonth(monthKey) || S.activePeriodId || 'P1';
  const suggestedPeriodName = periodName(suggestedPeriodId);
  const periodOptions = academicCalendarPeriods().map((period) => `<option value="${period.id}" ${period.id === S.activePeriodId ? 'selected' : ''}>${escapeHtml(`${period.id} - ${period.name}`)}</option>`).join('');
  if (!studentsInGroup(activeGroup.id).length) {
    c.innerHTML = `<div class="card attendance-page-v2"><div class="attendance-toolbar-v2"><label class="attendance-control"><span>Materia / curso</span><select class="sel" onchange="setActiveGroup(this.value)">${sectionOptions}</select></label><div class="attendance-month-nav"><button class="btn btn-outline btn-sm" data-att-v2-action="month-prev" type="button">Mes anterior</button><div class="attendance-month-stack"><div class="attendance-month-chip ${monthStatusClass}">${escapeHtml(attendanceMonthLongLabel(monthKey))}</div><div class="attendance-month-state ${monthStatusClass}">${escapeHtml(monthStatus)}</div></div><button class="btn btn-outline btn-sm" data-att-v2-action="month-next" type="button">Mes siguiente</button></div><label class="attendance-control attendance-control-month"><span>Mes</span><select class="sel" onchange="setAttendanceV2Month(this.value)">${monthOptions}</select></label><label class="attendance-control"><span>Per?odo sugerido</span><select class="sel" onchange="setActivePeriod(this.value)">${periodOptions}</select></label><div class="attendance-period-hint">Asistencia por materia activa: <strong>${escapeHtml(getAttendanceGroupLabel(activeGroup))}</strong>. Mes ${escapeHtml(attendanceMonthLongLabel(monthKey))} - sugerencia autom?tica: <strong>${escapeHtml(suggestedPeriodId)}</strong> (${escapeHtml(suggestedPeriodName)})</div></div><div class="empty" style="padding:32px 24px;"><div class="ei"><i class="ri-team-line"></i></div><div class="et">Esta secci?n todav?a no tiene estudiantes</div><div class="es">Agrega estudiantes a ${escapeHtml(`${activeGroup.gradeName} ${activeGroup.sectionName}`)} para completar el registro de asistencia.</div><button class="btn btn-primary" onclick="go('estudiantes')">Ir a estudiantes</button></div></div>`;
    c.dataset.attSectionId = activeGroup.id;
    c.dataset.attMonthKey = monthKey;
    setupAttendanceV2EventDelegation(c);
    return;
  }
  const scheduleLinked = !!record.scheduleLinked;
  c.innerHTML = `<div class="card attendance-page-v2"><div class="attendance-toolbar-v2"><div class="attendance-toolbar-left"><label class="attendance-control"><span>Materia / curso</span><select class="sel" onchange="setActiveGroup(this.value)">${sectionOptions}</select></label><div class="attendance-month-nav"><button class="btn btn-outline btn-sm" data-att-v2-action="month-prev" type="button">Mes anterior</button><div class="attendance-month-stack"><div class="attendance-month-chip ${monthStatusClass}">${escapeHtml(attendanceMonthLongLabel(monthKey))}</div><div class="attendance-month-state ${monthStatusClass}">${escapeHtml(monthStatus)}</div></div><button class="btn btn-outline btn-sm" data-att-v2-action="month-next" type="button">Mes siguiente</button></div><label class="attendance-control attendance-control-month"><span>Mes</span><select class="sel" onchange="setAttendanceV2Month(this.value)">${monthOptions}</select></label><label class="attendance-control"><span>Per?odo sugerido</span><select class="sel" onchange="setActivePeriod(this.value)">${periodOptions}</select></label></div><div class="attendance-toolbar-right"><div class="attendance-inline-select"><span>Horario y exportaci?n</span><div class="attendance-action-row"><button class="attendance-link-switch ${scheduleLinked ? 'is-linked' : 'is-unlinked'}" data-att-v2-action="toggle-schedule-link" data-att-v2-enabled="${scheduleLinked ? 'true' : 'false'}" type="button" aria-pressed="${scheduleLinked ? 'true' : 'false'}"><span class="attendance-link-switch-track"><span class="attendance-link-switch-thumb"></span></span><span class="attendance-link-switch-copy"><strong>${scheduleLinked ? 'Encendido' : 'Apagado'}</strong><small>${scheduleLinked ? 'Autorrelleno activo' : 'Sin autorrelleno'}</small></span></button><button class="attendance-export-btn" data-att-v2-action="export-pdf" type="button"><img src="/assets/icons/logopdf.png" alt="PDF"><span>PDF</span></button><button class="attendance-export-btn" data-att-v2-action="export-word" type="button"><img src="/assets/icons/logoword.png" alt="Word"><span>Word</span></button><button class="attendance-export-btn" data-att-v2-action="export-excel" type="button"><img src="/assets/icons/logoexcel.png" alt="Excel"><span>Excel</span></button></div></div></div></div><div class="attendance-period-hint">Asistencia por materia activa: <strong>${escapeHtml(getAttendanceGroupLabel(activeGroup))}</strong>. Mes ${escapeHtml(attendanceMonthLongLabel(monthKey))} - sugerencia autom?tica: <strong>${escapeHtml(suggestedPeriodId)}</strong> (${escapeHtml(suggestedPeriodName)}) - retiro: <strong>se calcula hasta la fecha de retiro</strong>${scheduleLinked ? ' - horario semanal vinculado' : ' - horario semanal no vinculado'}</div><div class="attendance-quick-help">${attendanceV2LegendItem('P', 'Presente')}${attendanceV2LegendItem('T', 'Tardanza')}${attendanceV2LegendItem('A', 'Ausente')}${attendanceV2LegendItem('E', 'Excusa')}${attendanceV2LegendItem('R', 'Retirado')}<span class="attendance-shortcut-hint">Teclado: P, T, A, E, R, Delete, flechas y Enter. Los cambios se guardan autom?ticamente.</span></div><div data-att-v2-table-host><div class="attendance-loading-state"><div class="attendance-loading-card">Cargando registro...</div></div></div></div>`;
  c.dataset.attSectionId = activeGroup.id;
  c.dataset.attMonthKey = monthKey;
  setupAttendanceV2EventDelegation(c);
  renderAttendanceV2TableAsync(c, activeGroup.id, monthKey);
};

Object.assign(window, {
  shiftAttendanceV2Month,
  setAttendanceV2RetiredPolicy,
  setAttendanceV2ScheduleLinked,
  addAttendanceV2VisibleSlot,
  applyAttendanceV2WeeklySchedule,
  attendanceV2DownloadPdf,
  attendanceV2DownloadWord,
  attendanceV2DownloadExcel,
  clearAttendanceV2Month,
  cycleAttendanceV2SlotCode,
  setAttendanceV2UiFocus,
  handleAttendanceV2CellKey,
  setAttendanceV2DayValue,
  handleAttendanceV2DayKey,
  commitAttendanceV2DayValue,
  cycleAttendanceV2SlotException,
  setAttendanceV2SlotException,
  setAttendanceV2SlotReason,
});
