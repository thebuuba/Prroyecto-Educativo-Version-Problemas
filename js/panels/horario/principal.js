/**
 * Módulo de Horario y Calendario Docente (EduGest Schedule).
 * --------------------------------------------------------------------------
 * Versión modernizada de la agenda semanal y el calendario mensual del docente.
 * Incluye: Vista de línea de tiempo, Eventos Oficiales del MINERD y 
 * Asistente de Jornada Escolar.
 */

import { S } from '../../core/state.js';
import { 
  attendanceMonthStart, 
  attendanceMonthKey, 
  getCurrentMonthKey,
  toast,
  escapeHtml,
} from '../../core/domain-utils.js';
import { renderizarScheduleContent } from './components/vista.js';
import { registerScheduleActions } from './utils/actions.js';

/**
 * --- Constantes Internas ---
 */

const DEFAULT_WEEKDAYS = [0, 1, 2, 3, 4];

/** 
 * Estado de UI local (Solo persiste durante la sesión).
 * @type {Object}
 */
const UI = {
  activeTab: 'schedule', // 'schedule' o 'calendar'
  editor: { mode: 'edit', originalKey: '', weekday: 0, startTime: '', endTime: '', draft: null, errors: {} },
  wizard: { step: 1, journeyType: 'extended', startTime: '07:30', endTime: '11:55', durationsRaw: '40' },
  monthKey: getCurrentMonthKey()
};

/**
 * Asegura que el estado del planificador docente esté inicializado en el Store global.
 * @private
 */
function ensureState() {
  if (!S.teacherPlanner || typeof S.teacherPlanner !== 'object') {
    S.teacherPlanner = { 
        monthKey: getCurrentMonthKey(), 
        customEvents: [], 
        weeklySchedule: [], 
        activeWeekdays: [...DEFAULT_WEEKDAYS], 
        journeyType: 'extended' 
    };
  }
  if (!S.teacherPlanner.activeWeekdays) S.teacherPlanner.activeWeekdays = [...DEFAULT_WEEKDAYS];
  if (!S.teacherPlanner.weeklySchedule) S.teacherPlanner.weeklySchedule = [];
  if (!S.teacherPlanner.customEvents) S.teacherPlanner.customEvents = [];
}

/**
 * --- Lógica y Helpers ---
 */

/**
 * Retorna la lista de eventos del calendario (oficiales MINERD y personalizados).
 * @returns {Array<Object>} Lista de eventos ordenados por fecha.
 */
function obtenerPlannerEvents() {
  ensureState();
  const schoolYearId = String(S.schoolYear?.id || S.schoolYear?.name || '2025-2026');
  const match = schoolYearId.match(/(\d{4})\D+(\d{4})/);
  const startYear = match ? parseInt(match[1], 10) : 2025;
  const endYear = match ? parseInt(match[2], 10) : startYear + 1;

  const official = [
    { id: `minerd-doc-${startYear}`, date: `${startYear}-08-04`, title: 'Inicio de jornada docente', type: 'minerd', source: 'MINERD' },
    { id: `minerd-open-${startYear}`, date: `${startYear}-08-25`, title: 'Inicio del año escolar', type: 'minerd', source: 'MINERD' },
    { id: `holiday-mercedes-${startYear}`, date: `${startYear}-09-24`, title: 'Día de las Mercedes', type: 'holiday' },
    { id: `holiday-indep-${endYear}`, date: `${endYear}-02-27`, title: 'Día de la Independencia', type: 'holiday' },
  ];

  const custom = S.teacherPlanner.customEvents.map(e => ({ ...e, type: e.type || 'custom', source: 'Personal' }));
  return [...official, ...custom].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * --- Renders Principal ---
 */

/**
 * Renderiza el orquestador principal del panel de Horario/Agenda.
 * @param {HTMLElement} container - Contenedor raíz.
 */
export function renderizarSchedulePanel(container) {
  ensureState();
  
  container.innerHTML = `
    <div class="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      <!-- Encabezado y Pestañas -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Agenda Docente</h1>
          <p class="text-slate-500 font-medium">Gestiona tu horario semanal y eventos curriculares.</p>
        </div>
        
        <div class="flex bg-slate-100 p-1.5 rounded-[1.5rem] self-start md:self-auto">
          <button onclick="window.setScheduleTab('schedule')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${UI.activeTab === 'schedule' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}">
            Horario Semanal
          </button>
          <button onclick="window.setScheduleTab('calendar')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${UI.activeTab === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}">
            Calendario Escolar
          </button>
        </div>
      </div>

      <div id="schedule-content">
        ${renderizarScheduleContent({
          S,
          UI,
          getPlannerEvents,
          attendanceMonthStart,
          escapeHtml,
        })}
      </div>
    </div>
  `;
}
export function inicializar() {
  registerScheduleActions({
    UI,
    renderSchedulePanel,
    attendanceMonthStart,
    attendanceMonthKey,
    toast,
  });

  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.horario = (container) => renderSchedulePanel(container);
  window.RENDERS.calendario = (container) => {
    UI.activeTab = 'calendar';
    renderSchedulePanel(container);
  };
}
