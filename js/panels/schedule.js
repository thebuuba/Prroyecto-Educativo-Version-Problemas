/**
 * Módulo de Horario y Calendario Docente (EduGest Schedule).
 * --------------------------------------------------------------------------
 * Versión modernizada de la agenda semanal y el calendario mensual del docente.
 * Incluye: Vista de línea de tiempo, Eventos Oficiales del MINERD y 
 * Asistente de Jornada Escolar.
 */

import { S } from '../core/state.js';
import { persist } from '../core/hydration.js';
import { 
  uid, go, currentPage, 
  attendanceMonthStart, 
  attendanceMonthKey, 
  normalizeAttendanceMonthKey,
  getCurrentMonthKey,
  closeM, openM, toast,
  escapeHtml,
  normalizeEducationLevelName,
  getSortedGrades,
  lessonPlanAreaOptions,
  lessonPlanAreaFromGroup,
  sortCourses,
  curriculumSubjectOptions,
  curriculumOfficialSubjectArea
} from '../core/domain-utils.js';

/**
 * --- Constantes Internas ---
 */

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const DEFAULT_WEEKDAYS = [0, 1, 2, 3, 4];
const BLOCK_TYPES = ['class', 'planning', 'break', 'lunch', 'event'];
const JOURNEY_TYPES = ['extended', 'morning', 'afternoon', 'double', 'custom'];

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
function getPlannerEvents() {
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
 * Retorna los nombres de los días de la semana en español.
 * @returns {string[]}
 */
function getWeekdays() {
  return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
}

/**
 * Convierte un formato HH:mm a minutos totales desde medianoche.
 * @param {string} time - Hora en formato 'HH:mm'.
 * @returns {number|null} Minutos.
 */
function timeToMin(time) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convierte minutos totales internacionales a formato de hora HH:mm.
 * @param {number} min - Minutos.
 * @returns {string} Hora formateada.
 */
function minToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Formatea una hora HH:mm a un formato legible AM/PM.
 * @param {string} time - Hora.
 * @returns {string} Eje: "08:30 AM".
 */
function formatTimeLabel(time) {
    if (!time) return '--:--';
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * --- Renders Principal ---
 */

/**
 * Renderiza el orquestador principal del panel de Horario/Agenda.
 * @param {HTMLElement} container - Contenedor raíz.
 */
export function renderSchedulePanel(container) {
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
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${UI.activeTab === 'schedule' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}">
            Horario Semanal
          </button>
          <button onclick="window.setScheduleTab('calendar')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${UI.activeTab === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}">
            Calendario Escolar
          </button>
        </div>
      </div>

      <div id="schedule-content">
        ${UI.activeTab === 'schedule' ? renderWeeklySchedule() : renderMonthlyCalendar()}
      </div>
    </div>
  `;
}

/**
 * Renderiza la vista de horario semanal con franjas horarias.
 * @private
 * @returns {string} HTML.
 */
function renderWeeklySchedule() {
  const activeDays = S.teacherPlanner.activeWeekdays;
  const rows = S.teacherPlanner.weeklySchedule;
  
  if (rows.length === 0) {
    return `
      <div class="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[3rem] p-16 text-center">
        <div class="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
           <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-800 mb-4">¡Organicemos tu jornada!</h2>
        <p class="text-slate-500 max-w-md mx-auto mb-8 font-medium">Aún no has configurado tu horario. Usa el asistente para generar una base profesional en segundos.</p>
        <button onclick="window.openScheduleWizard()" class="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          Iniciar Asistente de Horario
        </button>
      </div>
    `;
  }

  // Obtener franjas horarias únicas
  const slots = Array.from(new Set(rows.map(r => `${r.startTime}-${r.endTime}`)))
    .sort((a, b) => a.localeCompare(b));

  return `
    <div class="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky left-0 z-10 backdrop-blur-md">Franja Horaria</th>
                        ${activeDays.map(d => `<th class="p-6 text-center text-sm font-black text-slate-700">${getWeekdays()[d]}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${slots.map(slot => {
                        const [start, end] = slot.split('-');
                        return `
                        <tr class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                           <td class="p-6 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10">
                              <div class="text-sm font-black text-slate-800">${formatTimeLabel(start)}</div>
                              <div class="text-[10px] font-bold text-slate-400 mt-1">${formatTimeLabel(end)}</div>
                           </td>
                           ${activeDays.map(d => {
                               const cell = rows.find(r => r.weekday === d && r.startTime === start && r.endTime === end);
                               return renderScheduleCell(cell, d, start, end);
                           }).join('')}
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
           <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
                 <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clase</span>
              </div>
              <div class="flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                 <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Receso/Almuerzo</span>
              </div>
              <div class="flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                 <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planificación</span>
              </div>
           </div>
           
           <button onclick="window.openScheduleWizard()" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Reiniciar horario con el asistente
           </button>
        </div>
    </div>
  `;
}

/**
 * Renderiza una celda específica del horario (un bloque de tiempo).
 * @private
 * @param {Object|null} cell - Objeto con la info del bloque.
 * @param {number} weekday - Día de la semana (0-6).
 * @param {string} start - Hora de inicio HH:mm.
 * @param {string} end - Hora de fin HH:mm.
 * @returns {string} HTML.
 */
function renderScheduleCell(cell, weekday, start, end) {
    if (!cell) {
        return `<td class="p-4"><div class="h-16 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </div></td>`;
    }

    const isBreak = ['break', 'lunch'].includes(cell.blockType);
    const isPlanning = cell.blockType === 'planning';
    const isClass = cell.blockType === 'class';
    
    let bgColor = 'bg-slate-50';
    let textColor = 'text-slate-600';
    let borderColor = 'border-slate-100';
    
    if (isClass) {
        bgColor = 'bg-indigo-50 hover:bg-indigo-100';
        textColor = 'text-indigo-700';
        borderColor = 'border-indigo-100';
    } else if (isBreak) {
        bgColor = 'bg-amber-50 hover:bg-amber-100';
        textColor = 'text-amber-700';
        borderColor = 'border-amber-100';
    } else if (isPlanning) {
        bgColor = 'bg-emerald-50 hover:bg-emerald-100';
        textColor = 'text-emerald-700';
        borderColor = 'border-emerald-100';
    }

    // Gestiona sección.
    const section = (S.secciones || []).find(s => s.id === cell.sectionId);

    return `
      <td class="p-2 min-w-[200px]">
        <div onclick="window.editScheduleCell(${weekday}, '${start}', '${end}')" 
             class="${bgColor} ${borderColor} border rounded-2xl p-4 transition-all cursor-pointer group/card relative">
          <div class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">${cell.blockType === 'class' ? 'Clase' : cell.blockType}</div>
          <div class="text-sm font-black ${textColor} leading-tight">${cell.subject || 'Sin Título'}</div>
          ${section ? `<div class="mt-1 text-[11px] font-bold opacity-70">${section.sec}</div>` : ''}
          ${cell.room ? `<div class="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/5 rounded-md text-[9px] font-bold uppercase tracking-wider opacity-60">Aula: ${cell.room}</div>` : ''}
          
          <div class="absolute top-3 right-3 opacity-0 group-hover/card:opacity-30 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </div>
        </div>
      </td>
    `;
}

/**
 * Renderiza la vista de calendario mensual con cuadrícula de días.
 * @private
 * @returns {string} HTML.
 */
function renderMonthlyCalendar() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <!-- Cuadrícula de Calendario -->
         <div class="lg:col-span-2 space-y-8">
            <div class="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
               <div class="flex items-center justify-between mb-8 px-4">
                  <h3 class="text-xl font-black text-slate-800">${new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(attendanceMonthStart(UI.monthKey))}</h3>
                  <div class="flex gap-2">
                     <button onclick="window.changeCalendarMonth(-1)" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                     </button>
                     <button onclick="window.changeCalendarMonth(1)" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                     </button>
                  </div>
               </div>
               
               <div class="grid grid-cols-7 gap-1 border-t border-slate-50 pt-6">
                  ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<div class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4 mb-2">${d}</div>`).join('')}
                  ${renderCalendarDays()}
               </div>
            </div>
         </div>
         
         <!-- Lista de Eventos -->
         <div class="space-y-8">
            <div class="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div class="relative z-10">
                 <h3 class="text-xl font-bold mb-6 flex items-center gap-3">
                    Próximos Eventos
                    <span class="px-2 py-0.5 bg-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Escolar</span>
                 </h3>
                 <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    ${renderUpcomingEvents()}
                 </div>
               </div>
               <div class="absolute -right-20 -top-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl"></div>
            </div>
            
            <button onclick="window.openAddEventModal()" class="w-full py-5 bg-white border border-slate-200 text-slate-900 font-bold rounded-[2rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
               <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
               Agregar Evento Personal
            </button>
         </div>
      </div>
    `;
}

/**
 * Renderiza la lista de eventos próximos para el sidebar.
 * @private
 * @returns {string} HTML.
 */
function renderUpcomingEvents() {
    const events = getPlannerEvents();
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.date) >= now);
    
    if (upcoming.length === 0) return `<div class="text-slate-500 text-sm font-medium italic">No hay eventos próximos registrados.</div>`;
    
    return upcoming.slice(0, 10).map(e => {
        const date = new Date(e.date + 'T12:00:00');
        const day = date.getDate();
        const month = new Intl.DateTimeFormat('es-DO', { month: 'short' }).format(date).toUpperCase();
        
        let accent = 'bg-slate-800 border-slate-700';
        if (e.type === 'holiday') accent = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
        if (e.type === 'minerd') accent = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';

        return `
          <div class="flex items-center gap-5 p-4 rounded-3xl border border-transparent hover:border-slate-800 hover:bg-white/5 transition-all">
             <div class="flex-shrink-0 w-12 h-14 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                <div class="text-[10px] font-black uppercase tracking-tighter opacity-60">${month}</div>
                <div class="text-lg font-black">${day}</div>
             </div>
             <div>
                <div class="text-sm font-black text-slate-100 leading-snug">${escapeHtml(e.title)}</div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">${e.type === 'holiday' ? 'Festivo' : e.source}</div>
             </div>
          </div>
        `;
    }).join('');
}

/**
 * Renderiza los días individuales del calendario mensual.
 * @private
 * @returns {string} HTML.
 */
function renderCalendarDays() {
  const start = attendanceMonthStart(UI.monthKey);
  const month = start.getMonth();
  const year = start.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (start.getDay() + 6) % 7; // Lunes como inicio
  
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  
  const events = getPlannerEvents();

  return cells.map(d => {
      if (d === null) return `<div class="p-6"></div>`;
      
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateKey);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      
      return `
        <div class="min-h-[100px] p-2 border border-slate-50 hover:bg-slate-50/50 transition-colors relative group">
           <div class="text-sm font-black ${isToday ? 'w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center mx-auto' : 'text-slate-400 text-center'} transition-all">${d}</div>
           <div class="mt-2 space-y-1">
              ${dayEvents.slice(0, 2).map(e => `
                <div class="text-[8px] font-black uppercase tracking-tighter truncate px-1.5 py-0.5 rounded-md ${e.type === 'holiday' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'}" title="${e.title}">
                   ${e.title}
                </div>
              `).join('')}
              ${dayEvents.length > 2 ? `<div class="text-[8px] font-bold text-slate-400 text-center">+ ${dayEvents.length - 2} más</div>` : ''}
           </div>
        </div>
      `;
  }).join('');
}

/**
 * --- Acciones Globales (Windows Hooks) ---
 */

/** Cambia la pestaña activa (Horario <=> Calendario). */
window.setScheduleTab = (tab) => {
    UI.activeTab = tab;
    renderSchedulePanel(document.getElementById('p-content'));
};

/** Cambia el mes visualizado en el calendario. */
window.changeCalendarMonth = (offset) => {
    const d = attendanceMonthStart(UI.monthKey);
    d.setMonth(d.getMonth() + offset);
    UI.monthKey = attendanceMonthKey(d);
    renderSchedulePanel(document.getElementById('p-content'));
};

/** Lanza el asistente de configuración de horario. */
window.openScheduleWizard = () => {
    toast("El asistente de horario modular está cargando...", false);
    // Aquí iría la lógica del modal del asistente.
};

/** Lanza el editor de bloque de horario. */
window.editScheduleCell = (weekday, start, end) => {
    // Lógica para abrir el editor completo.
    toast(`Editando bloque: ${weekday} @ ${start}`, false);
};

/** Abre el modal para agregar eventos personales al calendario. */
window.openAddEventModal = () => {
    toast("Abre el creador de eventos personalizados.", false);
};

/** Registro global de orquestadores de renderizado. */
window.RENDERS.horario = (c) => renderSchedulePanel(c);
window.RENDERS.calendario = (c) => {
    UI.activeTab = 'calendar';
    renderSchedulePanel(c);
};
