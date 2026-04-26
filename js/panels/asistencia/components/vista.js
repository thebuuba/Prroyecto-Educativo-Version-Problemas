import { scheduleNonCriticalTask, escapeHtml } from '../../../core/utils.js';
import { getGroups, studentsInGroup, getAttendanceGroupLabel } from '../../../core/domain-utils.js';

export function renderizarAttendancePanel(container, group, monthKey, deps) {
  const {
    isAcademicMonthActive,
    getMonthLongLabel,
    getMonthRecord,
    getEffectiveCode,
    createSlotMeta,
    getMarkClass,
  } = deps;

  const students = studentsInGroup(group.id).sort((a, b) => (a.apellido || '').localeCompare(b.apellido || '', 'es'));
  const monthLabel = getMonthLongLabel(monthKey);
  const status = isAcademicMonthActive(monthKey) ? 'Lectivo' : 'Fuera de calendario';
  const statusColor = isAcademicMonthActive(monthKey) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500';

  container.innerHTML = `
    <div class="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 p-6 overflow-y-auto h-full">
      <div class="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-800 leading-tight">${monthLabel}</h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">${status}</span>
              <span class="text-xs text-slate-400">·</span>
              <span class="text-xs text-slate-500 font-medium">${group.gradeName} ${group.sectionName}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button class="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" onclick="shiftMonth(-1)">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <div class="px-4 text-sm font-semibold text-slate-700 min-w-[120px] text-center">
            ${monthLabel.split(' ')[0]}
          </div>
          <button class="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" onclick="shiftMonth(1)">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden relative">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Métricas del mes</h3>
          <span class="material-symbols-outlined text-slate-300">analytics</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="text-center">
            <div class="text-2xl font-extrabold text-emerald-500" id="stat-p">--</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase">Presentes</div>
          </div>
          <div class="text-center border-x border-slate-100">
            <div class="text-2xl font-extrabold text-amber-500" id="stat-t">--</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase">Tardanzas</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-extrabold text-rose-500" id="stat-a">--</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase">Ausentes</div>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-50">
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-500">Promedio de asistencia</span>
            <span class="font-bold text-slate-800" id="stat-avg">--%</span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div class="bg-emerald-500 h-full transition-all duration-700" id="stat-bar" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <div class="col-span-12 flex flex-wrap items-center justify-between gap-4 py-2">
        <div class="flex items-center gap-3">
          <div class="relative group">
            <select class="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-slate-700 hover:border-blue-300 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all cursor-pointer shadow-sm" onchange="setActiveGroup(this.value)">
              ${getGroups().map((g) => `<option value="${g.id}" ${g.id === group.id ? 'selected' : ''}>${escapeHtml(getAttendanceGroupLabel(g))}</option>`).join('')}
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">unfold_more</span>
          </div>

          <button class="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-sm transition-all shadow-sm" onclick="applyWeeklySchedule()">
            <span class="material-symbols-outlined text-lg">auto_fix_high</span>
            Generar dias
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button class="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm" title="Imprimir" onclick="window.print()">
            <span class="material-symbols-outlined text-xl">print</span>
          </button>
          <div class="h-6 w-px bg-slate-200 mx-1"></div>
          <button class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2" onclick="exportToExcel()">
            <img src="/assets/icons/logoexcel.png" class="w-4 h-4" alt=""> Excel
          </button>
          <button class="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center gap-2" onclick="exportToPdf()">
            <img src="/assets/icons/logopdf.png" class="w-4 h-4 invert" alt=""> PDF
          </button>
        </div>
      </div>

      <div class="col-span-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0" id="attendance-table">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-100 p-4 text-left font-bold text-xs text-slate-400 uppercase tracking-widest min-w-[280px]">Estudiante</th>
                ${renderTableHeaders(group.id, monthKey, { getMonthRecord, createSlotMeta })}
                <th class="sticky right-0 z-20 bg-slate-50 border-b border-l border-slate-100 p-4 text-center font-bold text-xs text-slate-400 uppercase tracking-widest w-20">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${renderTableRows(group.id, monthKey, students, { getMonthRecord, getEffectiveCode, createSlotMeta, getMarkClass })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  scheduleNonCriticalTask(() => updateStats(group.id, monthKey, students, { getMonthRecord, getEffectiveCode }), 200);
}

export function renderizarAttendanceEmpty(container) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div class="w-20 h-20 mb-6 flex items-center justify-center bg-blue-50 text-blue-500 rounded-full">
        <span class="material-symbols-outlined text-4xl">inventory_2</span>
      </div>
      <h2 class="text-2xl font-bold text-slate-800 mb-2">No hay secciones creadas</h2>
      <p class="text-slate-500 max-w-md mb-8">Crea una sección para poder llevar el registro de asistencia por curso.</p>
      <button class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200" onclick="go('estudiantes')">
        Ir a estudiantes
      </button>
    </div>
  `;
}

function renderizarTableHeaders(sectionId, monthKey, deps) {
  const { getMonthRecord, createSlotMeta } = deps;
  const record = getMonthRecord(sectionId, monthKey, false);
  const slotCount = record.visibleCount || 1;
  let html = '';

  for (let i = 0; i < slotCount; i += 1) {
    const day = record.slotDays[i] || '';
    const meta = record.slotMeta[i] || createSlotMeta();
    const isSpecial = !!meta.type;
    const dayColor = isSpecial ? 'bg-amber-50 text-amber-600' : 'bg-white text-slate-700';

    html += `
      <th class="border-b border-slate-100 p-0 min-w-[48px]">
        <div class="flex flex-col items-center py-2 h-full">
          <input type="text"
                 class="w-10 h-10 text-center font-bold text-sm rounded-lg border-transparent focus:border-blue-300 focus:ring-0 transition-all ${dayColor}"
                 value="${day}"
                 placeholder="--"
                 maxlength="2"
                 onblur="commitDayDay(${i}, this.value)">
          <button class="mt-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all"
                  onclick="cycleException(${i})"
                  title="${meta.type || 'Marcar especial'}">
            <span class="material-symbols-outlined text-[14px] ${isSpecial ? 'text-amber-500' : 'text-slate-300'}">
              ${isSpecial ? 'event_busy' : 'add_circle'}
            </span>
          </button>
        </div>
      </th>
    `;
  }

  return html;
}

function renderizarTableRows(sectionId, monthKey, students, deps) {
  return students.map((student, idx) => `
    <tr class="group hover:bg-blue-50/20 transition-colors">
      <td class="sticky left-0 z-10 bg-white group-hover:bg-blue-50/20 border-r border-slate-100 p-4 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
            ${idx + 1}
          </div>
          <div class="flex flex-col truncate">
            <span class="font-bold text-slate-700 truncate">${student.apellido || ''}, ${student.nombre || ''}</span>
            <span class="text-[10px] text-slate-400 font-medium tracking-wide">ID: ${student.id.slice(0, 8)}</span>
          </div>
        </div>
      </td>
      ${renderAttendanceCells(sectionId, monthKey, student, deps)}
      <td class="sticky right-0 z-10 bg-white group-hover:bg-blue-50/20 border-l border-slate-100 p-4 text-center font-bold text-slate-700 transition-colors" id="total-${student.id}">
        0
      </td>
    </tr>
  `).join('');
}

function renderizarAttendanceCells(sectionId, monthKey, student, deps) {
  const { getMonthRecord, getEffectiveCode, createSlotMeta, getMarkClass } = deps;
  const record = getMonthRecord(sectionId, monthKey, false);
  const slotCount = record.visibleCount || 1;
  let html = '';

  for (let i = 0; i < slotCount; i += 1) {
    const code = getEffectiveCode(sectionId, monthKey, student.id, i);
    const dayActive = !!record.slotDays[i];
    const meta = record.slotMeta[i] || createSlotMeta();
    const isLocked = !dayActive || !!meta.type;

    html += `
      <td class="p-1 text-center">
        <button class="w-10 h-10 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center mx-auto
                       ${isLocked ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : getMarkClass(code)}"
                ${isLocked ? 'disabled' : `onclick="cycleMark('${student.id}', ${i})"`}>
          ${isLocked ? '?' : (code || '')}
        </button>
      </td>
    `;
  }

  return html;
}

function actualizarStats(sectionId, monthKey, students, deps) {
  const { getMonthRecord, getEffectiveCode } = deps;
  let p = 0;
  let t = 0;
  let a = 0;
  let totalMarks = 0;

  students.forEach((student) => {
    const record = getMonthRecord(sectionId, monthKey, false);
    const slots = record.visibleCount || 1;
    let studentTotal = 0;

    for (let i = 0; i < slots; i += 1) {
      const code = getEffectiveCode(sectionId, monthKey, student.id, i);
      const isConfigured = !!record.slotDays[i] && !record.slotMeta[i]?.type;

      if (isConfigured) {
        if (code === 'P') {
          p += 1;
          studentTotal += 1;
        }
        if (code === 'T') {
          t += 1;
          studentTotal += 1;
        }
        if (code === 'A') a += 1;
        if (code === 'E') studentTotal += 1;
        if (code !== '') totalMarks += 1;
      }
    }

    const totalEl = document.getElementById(`total-${student.id}`);
    if (totalEl) totalEl.textContent = studentTotal;
  });

  const pEl = document.getElementById('stat-p');
  const tEl = document.getElementById('stat-t');
  const aEl = document.getElementById('stat-a');
  const avgEl = document.getElementById('stat-avg');
  const barEl = document.getElementById('stat-bar');
  const presence = p + t;
  const avg = totalMarks ? Math.round((presence / (presence + a)) * 100) : 0;

  if (pEl) pEl.textContent = p;
  if (tEl) tEl.textContent = t;
  if (aEl) aEl.textContent = a;
  if (avgEl) avgEl.textContent = `${avg}%`;
  if (barEl) barEl.style.width = `${avg}%`;
}
