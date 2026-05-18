/**
 * Registro de acciones globales del panel de horario/calendario.
 * Mantiene la capa `window.*` separada del render principal.
 */

let scheduleActionsDeps = null;

function getScheduleActionsDeps() {
  return scheduleActionsDeps;
}

export function setScheduleTab(tab) {
  const deps = getScheduleActionsDeps();
  if (!deps) return false;
  const { UI } = deps;
  UI.activeTab = tab === 'calendar' ? 'calendar' : 'schedule';
  rerenderSchedule();
  return true;
}

export function changeCalendarMonth(offset) {
  const deps = getScheduleActionsDeps();
  if (!deps) return false;
  const {
    UI,
    attendanceMonthStart,
    attendanceMonthKey,
  } = deps;
  const date = attendanceMonthStart(UI.monthKey);
  date.setMonth(date.getMonth() + offset);
  UI.monthKey = attendanceMonthKey(date);
  rerenderSchedule();
  return true;
}

export function openScheduleWizard() {
  const deps = getScheduleActionsDeps();
  if (!deps) return false;
  deps.toast('El asistente de horario modular está cargando...', false);
  return true;
}

export function editScheduleCell(weekday, start, end) {
  const deps = getScheduleActionsDeps();
  if (!deps) return false;
  deps.toast(`Editando bloque: ${weekday} @ ${start}`, false);
  return true;
}

export function openAddEventModal() {
  const deps = getScheduleActionsDeps();
  if (!deps) return false;
  deps.toast('Abre el creador de eventos personalizados.', false);
  return true;
}

export function generateTeacherScheduleBase() {
  const legacyGenerate = window.generateTeacherScheduleBase;
  if (typeof legacyGenerate === 'function' && legacyGenerate !== generateTeacherScheduleBase) {
    legacyGenerate();
    return true;
  }
  return openScheduleWizard();
}

function rerenderSchedule() {
  const deps = getScheduleActionsDeps();
  if (!deps) return;
  function rerender() {
    const container = document.getElementById('p-content');
    if (container) deps.renderSchedulePanel(container);
  }
  rerender();
}

export function registerScheduleActions(deps) {
  scheduleActionsDeps = deps;
  window.setScheduleTab = setScheduleTab;
  window.changeCalendarMonth = changeCalendarMonth;
  window.openScheduleWizard = openScheduleWizard;
  window.editScheduleCell = editScheduleCell;
  window.openAddEventModal = openAddEventModal;
  window.generateTeacherScheduleBase = generateTeacherScheduleBase;
}
