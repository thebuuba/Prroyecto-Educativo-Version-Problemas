function getWeekdays() {
  return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
}

function formatTimeLabel(time) {
  if (!time) return '--:--';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function renderScheduleContent(deps) {
  const { UI } = deps;
  return UI.activeTab === 'schedule'
    ? renderWeeklySchedule(deps)
    : renderMonthlyCalendar(deps);
}

function renderWeeklySchedule({ S }) {
  const activeDays = S.teacherPlanner.activeWeekdays;
  const rows = S.teacherPlanner.weeklySchedule;

  if (rows.length === 0) {
    return `
      <div class="bg-blue-50 border-2 border-dashed border-blue-200 rounded-[3rem] p-16 text-center">
        <div class="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
           <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-800 mb-4">¡Organicemos tu jornada!</h2>
        <p class="text-slate-500 max-w-md mx-auto mb-8 font-medium">Aún no has configurado tu horario. Usa el asistente para generar una base profesional en segundos.</p>
        <button onclick="window.openScheduleWizard()" class="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          Iniciar Asistente de Horario
        </button>
      </div>
    `;
  }

  const slots = Array.from(new Set(rows.map((row) => `${row.startTime}-${row.endTime}`))).sort((a, b) => a.localeCompare(b));

  return `
    <div class="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky left-0 z-10 backdrop-blur-md">Franja Horaria</th>
              ${activeDays.map((day) => `<th class="p-6 text-center text-sm font-black text-slate-700">${getWeekdays()[day]}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${slots.map((slot) => {
              const [start, end] = slot.split('-');
              return `
                <tr class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td class="p-6 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10">
                    <div class="text-sm font-black text-slate-800">${formatTimeLabel(start)}</div>
                    <div class="text-[10px] font-bold text-slate-400 mt-1">${formatTimeLabel(end)}</div>
                  </td>
                  ${activeDays.map((day) => {
                    const cell = rows.find((row) => row.weekday === day && row.startTime === start && row.endTime === end);
                    return renderScheduleCell(cell, day, start, end, S);
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
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
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

        <button onclick="window.openScheduleWizard()" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
          Reiniciar horario con el asistente
        </button>
      </div>
    </div>
  `;
}

function renderScheduleCell(cell, weekday, start, end, S) {
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
    bgColor = 'bg-blue-50 hover:bg-blue-100';
    textColor = 'text-blue-700';
    borderColor = 'border-blue-100';
  } else if (isBreak) {
    bgColor = 'bg-amber-50 hover:bg-amber-100';
    textColor = 'text-amber-700';
    borderColor = 'border-amber-100';
  } else if (isPlanning) {
    bgColor = 'bg-emerald-50 hover:bg-emerald-100';
    textColor = 'text-emerald-700';
    borderColor = 'border-emerald-100';
  }

  const section = (S.secciones || []).find((item) => item.id === cell.sectionId);

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

function renderMonthlyCalendar({ UI, getPlannerEvents, attendanceMonthStart, escapeHtml }) {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
            ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => `<div class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4 mb-2">${day}</div>`).join('')}
            ${renderCalendarDays({ UI, getPlannerEvents, attendanceMonthStart })}
          </div>
        </div>
      </div>

      <div class="space-y-8">
        <div class="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-xl font-bold mb-6 flex items-center gap-3">
              Próximos Eventos
              <span class="px-2 py-0.5 bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Escolar</span>
            </h3>
            <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              ${renderUpcomingEvents({ getPlannerEvents, escapeHtml })}
            </div>
          </div>
          <div class="absolute -right-20 -top-20 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        <button onclick="window.openAddEventModal()" class="w-full py-5 bg-white border border-slate-200 text-slate-900 font-bold rounded-[2rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Agregar Evento Personal
        </button>
      </div>
    </div>
  `;
}

function renderUpcomingEvents({ getPlannerEvents, escapeHtml }) {
  const events = getPlannerEvents();
  const now = new Date();
  const upcoming = events.filter((event) => new Date(event.date) >= now);

  if (upcoming.length === 0) return `<div class="text-slate-500 text-sm font-medium italic">No hay eventos próximos registrados.</div>`;

  return upcoming.slice(0, 10).map((event) => {
    const date = new Date(`${event.date}T12:00:00`);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('es-DO', { month: 'short' }).format(date).toUpperCase();

    return `
      <div class="flex items-center gap-5 p-4 rounded-3xl border border-transparent hover:border-slate-800 hover:bg-white/5 transition-all">
        <div class="flex-shrink-0 w-12 h-14 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/5">
          <div class="text-[10px] font-black uppercase tracking-tighter opacity-60">${month}</div>
          <div class="text-lg font-black">${day}</div>
        </div>
        <div>
          <div class="text-sm font-black text-slate-100 leading-snug">${escapeHtml(event.title)}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">${event.type === 'holiday' ? 'Festivo' : event.source}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCalendarDays({ UI, getPlannerEvents, attendanceMonthStart }) {
  const start = attendanceMonthStart(UI.monthKey);
  const month = start.getMonth();
  const year = start.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (start.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  const events = getPlannerEvents();

  return cells.map((day) => {
    if (day === null) return `<div class="p-6"></div>`;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter((event) => event.date === dateKey);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

    return `
      <div class="min-h-[100px] p-2 border border-slate-50 hover:bg-slate-50/50 transition-colors relative group">
        <div class="text-sm font-black ${isToday ? 'w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto' : 'text-slate-400 text-center'} transition-all">${day}</div>
        <div class="mt-2 space-y-1">
          ${dayEvents.slice(0, 2).map((event) => `
            <div class="text-[8px] font-black uppercase tracking-tighter truncate px-1.5 py-0.5 rounded-md ${event.type === 'holiday' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}" title="${event.title}">
              ${event.title}
            </div>
          `).join('')}
          ${dayEvents.length > 2 ? `<div class="text-[8px] font-bold text-slate-400 text-center">+ ${dayEvents.length - 2} más</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}
