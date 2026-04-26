/**
 * Registro de acciones globales del panel de horario/calendario.
 * Mantiene la capa `window.*` separada del render principal.
 */

export function registerScheduleActions(deps) {
  const {
    UI,
    renderSchedulePanel,
    attendanceMonthStart,
    attendanceMonthKey,
    toast,
  } = deps;

  function rerender() {
    const container = document.getElementById('p-content');
    if (container) renderSchedulePanel(container);
  }

  window.setScheduleTab = (tab) => {
    UI.activeTab = tab === 'calendar' ? 'calendar' : 'schedule';
    rerender();
  };

  window.changeCalendarMonth = (offset) => {
    const date = attendanceMonthStart(UI.monthKey);
    date.setMonth(date.getMonth() + offset);
    UI.monthKey = attendanceMonthKey(date);
    rerender();
  };

  window.openScheduleWizard = () => {
    toast('El asistente de horario modular está cargando...', false);
  };

  window.editScheduleCell = (weekday, start, end) => {
    toast(`Editando bloque: ${weekday} @ ${start}`, false);
  };

  window.openAddEventModal = () => {
    toast('Abre el creador de eventos personalizados.', false);
  };
}
