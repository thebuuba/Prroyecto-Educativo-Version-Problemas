/**
 * Módulo del Panel de Matriz General (EduGest Matrix).
 * --------------------------------------------------------------------------
 * Proporciona una vista consolidada y tabular de todo el progreso académico.
 * Muestra el rendimiento de los estudiantes en los 4 bloques (B1-B4), 
 * detallando actividades individuales, totales por bloque y promedios finales.
 */

import { S } from '../core/state.js';
import { BNAME, BICON, BCOLOR } from '../core/config.js';
import { BLOCKS } from '../core/constants.js';
import { 
  fmtNum, 
  getGroupCfg, 
  studentsInGroup, 
  blockMeta, 
  studentBlockScore, 
  studentFinal,
  periodName,
  getGroupLabel,
  scoreClass,
  totalActs
} from '../core/domain-utils.js';

/**
 * --- Componentes de Interfaz ---
 */

/**
 * Renderiza la cabecera del panel con el título y el contexto académico.
 * @private
 * @returns {string} HTML de la cabecera.
 */
function renderHeader() {
  return `
    <header class="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div class="flex items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Matriz General Consolidada</h1>
          <p class="text-slate-500 mt-1">Resumen del progreso académico por bloque y promedios finales.</p>
        </div>
        <div class="hidden md:flex flex-col items-end">
           <div class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">${getGroupLabel(S.activeGroupId)}</div>
           <div class="text-sm font-bold text-blue-600">${periodName()}</div>
        </div>
      </div>
    </header>
  `;
}

/**
 * Renderiza un estado vacío amigable cuando no hay datos para mostrar.
 * @private
 * @param {Array} ests - Lista de estudiantes.
 * @returns {string} HTML del estado vacío.
 */
function renderEmptyState(ests) {
  return `
    <div class="py-20 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm animate-in zoom-in-95 duration-500">
      <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
      </div>
      <h4 class="text-2xl font-bold text-slate-800 mb-3">Matriz en blanco</h4>
      <p class="text-slate-500 mb-8 max-w-sm mx-auto">
        ${ests.length === 0 ? 'Comienza registrando a tus estudiantes para ver sus calificaciones consolidadas.' : 'Define actividades en los bloques para generar esta matriz.'}
      </p>
      <div class="flex items-center justify-center gap-4">
        ${ests.length === 0 ? `<button onclick="window.go('estudiantes')" class="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Registrar Estudiantes</button>` : ''}
        ${totalActs() === 0 ? `<button onclick="window.go('config')" class="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">Configurar Actividades</button>` : ''}
      </div>
    </div>
  `;
}

/**
 * Renderiza el panel de la matriz académica en el contenedor proporcionado.
 * Construye una tabla compleja con cabeceras dinámicas por bloque y actividades.
 * @param {HTMLElement} container - Contenedor del panel.
 */
export function renderMatrixPanel(container) {
  const ests = studentsInGroup(S.activeGroupId);
  
  if (ests.length === 0 || totalActs() === 0) {
    container.innerHTML = `
      <div class="max-w-[1240px] mx-auto p-6 md:p-10">
        ${renderHeader()}
        ${renderEmptyState(ests)}
      </div>
    `;
    return;
  }

  const cfg = getGroupCfg(S.activeGroupId);
  const blockActs = {};
  BLOCKS.forEach(b => blockActs[b] = cfg[b].activities);

  // Lógica de construcción de cabeceras de la tabla
  let headerHtml = `
    <thead class="bg-white border-b border-slate-200">
      <tr>
        <th rowspan="2" class="sticky left-0 z-30 bg-white p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-r-2 border-slate-100">Estudiante</th>
  `;

  BLOCKS.forEach(b => {
    const n = blockActs[b].length;
    if (n > 0) {
      headerHtml += `
        <th colspan="${n + 1}" class="p-5 text-center border-r border-slate-200/50" style="background: ${BCOLOR[b]}10; color: ${BCOLOR[b]}">
          <div class="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
            ${BICON[b]} ${BNAME[b]}
          </div>
          <div class="text-[9px] font-bold opacity-70 mt-0.5">ESCALA BASE 100</div>
        </th>
      `;
    }
  });

  headerHtml += `
        <th colspan="2" class="p-5 text-center text-xs font-black text-slate-900 border-l-4 border-slate-900 bg-slate-50 uppercase tracking-widest">Resumen Final</th>
      </tr>
      <tr class="bg-slate-50/30">
  `;

  BLOCKS.forEach(b => {
    blockActs[b].forEach((a, idx) => {
      headerHtml += `
        <th class="p-3 text-center min-w-[100px] border-r border-slate-200/40">
          <div class="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[80px] mx-auto" title="${a.name}">${a.name}</div>
          <div class="text-[9px] font-medium text-slate-400 mt-0.5">/${fmtNum(a.pts)}pt</div>
        </th>
      `;
    });
    if (blockActs[b].length > 0) {
      headerHtml += `<th class="p-3 text-center bg-white/50 border-r border-slate-200 font-black text-[11px] text-slate-900">Total B</th>`;
    }
  });

  headerHtml += `
        <th class="p-4 text-center border-l-4 border-slate-900 font-black text-xs text-slate-900">Promedio</th>
        <th class="p-4 text-center border-r border-slate-100 font-black text-xs text-slate-900">% Final</th>
      </tr>
    </thead>
  `;

  let bodyHtml = '<tbody class="bg-white divide-y divide-slate-50">';
  ests.forEach(e => {
    bodyHtml += `
      <tr class="hover:bg-blue-50/20 transition-all group/row">
        <td class="sticky left-0 z-20 bg-white group-hover/row:bg-slate-50 p-4 font-bold text-slate-800 border-r-2 border-slate-100 whitespace-nowrap shadow-[4px_0_10px_-4px_rgba(0,0,0,0.02)]">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/row:bg-blue-100 group-hover/row:text-blue-600 transition-colors uppercase">
               ${e.nombre.charAt(0)}${e.apellido.charAt(0)}
             </div>
             ${e.nombre} ${e.apellido}
          </div>
        </td>
    `;

    const totals = [];
    BLOCKS.forEach(b => {
      blockActs[b].forEach(a => {
        const val = (S.notas[e.id] || {})[a.id];
        const hasVal = (val === 0 || !!val);
        const clsValue = hasVal ? scoreClass(val, a.pts) : '';
        const dotColor = clsValue.includes('p-green') ? 'bg-emerald-500' : clsValue.includes('p-amber') ? 'bg-amber-500' : clsValue.includes('p-rose') ? 'bg-rose-500' : 'bg-slate-200';

        bodyHtml += `
          <td class="p-3 text-center cursor-not-allowed">
            <div class="relative inline-block px-2 py-1 rounded-lg ${hasVal ? 'bg-slate-50 font-bold text-slate-900' : 'text-slate-300'}" title="Evaluado vía Panel de Actividades">
               ${hasVal ? fmtNum(val) : '<span class="opacity-30">---</span>'}
               ${hasVal ? `<div class="absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-white ${dotColor}"></div>` : ''}
            </div>
          </td>
        `;
      });
      if (blockActs[b].length > 0) {
        const score = studentBlockScore(e.id, b);
        totals.push(typeof score === 'number' ? score : 0);
        bodyHtml += `<td class="p-3 text-center bg-slate-50/50 font-black text-sm text-slate-900 border-r border-slate-200/60" style="color: ${BCOLOR[b]}">${score}</td>`;
      }
    });

    const avg = totals.length ? Math.round(totals.reduce((s, v) => s + v, 0) / totals.length) : 0;
    bodyHtml += `
      <td class="p-4 text-center font-black text-lg text-slate-900 bg-slate-50 border-l-4 border-slate-900/10">
        ${avg}
      </td>
      <td class="p-4 text-center font-black text-lg text-blue-600 bg-blue-50/30">
        ${avg}%
      </td>
    </tr>`;
  });
  bodyHtml += '</tbody>';

  container.innerHTML = `
    <div class="max-w-full mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      ${renderHeader()}
      
      <div class="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 relative">
        <div class="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
           <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              </div>
              <h4 class="font-bold text-slate-900 tracking-tight">Reporte Consolidado Estudiantil</h4>
           </div>
           <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datos Sincronizados</span>
           </div>
        </div>
        
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full border-collapse border-hidden">
            ${headerHtml}
            ${bodyHtml}
          </table>
        </div>
        
        <div class="p-6 bg-slate-50/30 border-t border-slate-50">
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Desliza hacia la derecha para ver todos los bloques y promedios finales</p>
        </div>
      </div>
    </div>
  `;
}

export function init() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.matriz = renderMatrixPanel;
}
