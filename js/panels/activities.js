/**
 * Módulo del Panel de Actividades (EduGest Activities).
 * --------------------------------------------------------------------------
 * Gestiona la visualización y configuración de las actividades evaluativas.
 * Ofrece tres vistas principales: Vista de Bloques, Matriz de Calificaciones
 * y Configuración de Puntaje/Meta.
 */

import { S } from '../core/state.js';
import { go } from '../core/routing.js';
import { persist } from '../core/hydration.js';
import { 
  BNAME, 
  BICON, 
  BCOLOR 
} from '../core/config.js';
import { 
  BLOCKS, 
  ACT_VIEW_MODE_DEFAULT 
} from '../core/constants.js';
import { 
  fmtNum, 
  round2, 
  uid,
  getGroupCfg,
  studentsInGroup,
  blockRawMax,
  blockMeta,
  findActivity,
  studentFinal,
  studentBlockScore,
  periodName,
  getGroupLabel
} from '../core/domain-utils.js';

/**
 * Obtiene el modo de vista actual del panel de actividades desde el estado.
 * @returns {string} Modo de vista ('blocks', 'matrix' o 'config').
 */
export function getActViewMode() {
  return S.activityViewMode || ACT_VIEW_MODE_DEFAULT;
}

/**
 * Cambia el modo de vista de las actividades y actualiza el estado.
 * @param {string} mode - Nuevo modo de vista.
 */
window.setActView = (mode) => {
  S.activityViewMode = ['blocks', 'matrix', 'config'].includes(mode) ? mode : 'blocks';
  persist();
  go('actividades');
};

/**
 * Renderiza la cabecera del panel de actividades con el selector de vistas.
 * @private
 * @returns {string} HTML de la cabecera.
 */
function renderHeader() {
  const mode = getActViewMode();
  return `
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Actividades y Evaluación</h1>
        <p class="text-slate-500 mt-1">Sigue el progreso de tus estudiantes por competencias.</p>
      </div>
      <div class="flex p-1 bg-slate-100 rounded-2xl shrink-0">
        <button onclick="setActView('blocks')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'blocks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
          Bloques
        </button>
        <button onclick="setActView('matrix')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'matrix' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
          Matriz
        </button>
        <button onclick="setActView('config')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'config' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
          Configuración
        </button>
      </div>
    </header>
  `;
}

/**
 * Renderiza una tarjeta de bloque pedagógico con el resumen de sus actividades.
 * @private
 * @param {string} b - Identificador del bloque (ej. 'B1').
 * @param {Array} acts - Lista de actividades del bloque.
 * @param {Object} cfg - Configuración del bloque.
 * @param {Array} ests - Lista de estudiantes vinculados.
 * @returns {string} HTML de la tarjeta de bloque.
 */
function renderBlockCard(b, acts, cfg, ests) {
  const rawMax = blockRawMax(b);
  const meta = blockMeta(b);
  const color = BCOLOR[b] || 'var(--indigo)';
  const icon = BICON[b] || '📄';
  const name = BNAME[b] || b;
  const progress = meta > 0 ? Math.min((rawMax / meta) * 100, 100) : 0;

  let activityRows = '';
  if (acts.length === 0) {
    activityRows = `
      <div class="flex flex-col items-center justify-center py-10 text-center">
        <div class="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <p class="text-sm text-slate-400">Sin actividades</p>
      </div>
    `;
  } else {
    activityRows = acts.map((a, i) => {
      const vals = ests.map(s => ((S.notas[s.id] || {})[a.id])).filter(x => x !== undefined);
      const avg = vals.length ? round2(vals.reduce((sum, v) => sum + v, 0) / vals.length) : null;
      const linked = a.instrumentId;

      return `
        <div class="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group/row">
          <div class="w-6 text-xs font-bold text-slate-300">${i+1}</div>
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-slate-800 truncate">${a.name}</h5>
            <div class="flex items-center gap-3 mt-1">
               <span class="text-[10px] uppercase font-bold tracking-wider ${linked ? 'text-emerald-500' : 'text-slate-400'}">
                 ${linked ? '✓ Vinculado' : '⚠ Sin instrumento'}
               </span>
               <span class="text-[10px] font-medium text-slate-400">
                 Promedio: ${avg !== null ? `${avg}/${a.pts}` : '---'}
               </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.openApplyInstrumentModal('${a.id}')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Evaluar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <div class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold min-w-[45px] text-center">
              ${a.pts}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  return `
    <div class="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <div class="p-6 border-b border-slate-50">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner" style="background: ${color}20">
              ${icon}
            </div>
            <div>
              <h3 class="font-bold text-slate-900 line-clamp-1">${name}</h3>
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">${b}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-slate-900">${rawMax}/${meta}</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puntos</div>
          </div>
        </div>
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-1000" style="width: ${progress}%; background: ${color}"></div>
        </div>
      </div>
      <div class="p-6 bg-slate-50/30">
        <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          ${activityRows}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza la vista de bloques pedagógicos.
 * @private
 * @returns {string} HTML de los bloques.
 */
function renderBlocksView() {
  const cfg = getGroupCfg(S.activeGroupId);
  const ests = studentsInGroup(S.activeGroupId);

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      ${BLOCKS.map(b => renderBlockCard(b, cfg[b].activities, cfg[b], ests)).join('')}
    </div>
  `;
}

/**
 * Renderiza la matriz interactiva de calificaciones para el grupo activo.
 * @private
 * @returns {string} HTML de la matriz.
 */
function renderMatrixView() {
  const ests = studentsInGroup(S.activeGroupId);
  if (ests.length === 0) {
    return `
      <div class="py-20 text-center bg-white border border-slate-200 rounded-[2rem]">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <h4 class="text-xl font-bold text-slate-800 mb-2">No hay estudiantes</h4>
        <p class="text-slate-500 mb-6">Registra estudiantes para visualizar la matriz de evaluación.</p>
        <button onclick="go('estudiantes')" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Ir a Estudiantes</button>
      </div>
    `;
  }

  const cfg = getGroupCfg(S.activeGroupId);
  const blockActs = {};
  BLOCKS.forEach(b => blockActs[b] = cfg[b].activities);

  // Lógica de construcción de la cabecera de la tabla
  let headerHtml = `
    <thead class="bg-slate-50 border-b border-slate-200">
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Estudiante</th>
  `;

  BLOCKS.forEach(b => {
    const n = blockActs[b].length;
    if (n > 0) {
      headerHtml += `
        <th colspan="${n + 1}" class="p-4 text-center border-r border-slate-200" style="background: ${BCOLOR[b]}10; color: ${BCOLOR[b]}">
          <div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            ${BICON[b]} ${BNAME[b]}
          </div>
        </th>
      `;
    }
  });

  headerHtml += `
        <th class="p-6 text-center text-xs font-bold text-slate-900 border-l-2 border-slate-900 bg-slate-100">Total Final</th>
      </tr>
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-4 border-r border-slate-200"></th>
  `;

  BLOCKS.forEach(b => {
    blockActs[b].forEach((a, idx) => {
      headerHtml += `
        <th class="p-3 text-center min-w-[100px] border-r border-slate-200/50">
          <div class="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px] mx-auto" title="${a.name}">${a.name}</div>
          <div class="text-[9px] font-medium text-slate-400 mt-0.5">/${a.pts}</div>
        </th>
      `;
    });
    if (blockActs[b].length > 0) {
      headerHtml += `<th class="p-3 text-center bg-slate-100/50 border-r border-slate-200 font-bold text-xs">Nota</th>`;
    }
  });

  headerHtml += `<th class="p-4 border-l-2 border-slate-900"></th></tr></thead>`;

  let bodyHtml = '<tbody class="bg-white divide-y divide-slate-100">';
  ests.forEach(e => {
    bodyHtml += `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
          ${e.nombre} ${e.apellido}
        </td>
    `;

    BLOCKS.forEach(b => {
      blockActs[b].forEach(a => {
        const val = (S.notas[e.id] || {})[a.id];
        const hasVal = (val === 0 || !!val);
        bodyHtml += `
          <td class="p-3 text-center cursor-pointer hover:bg-indigo-50 transition-colors" onclick="window.openApplyInstrumentModal('${a.id}', '${e.id}')">
            <span class="text-sm ${hasVal ? 'font-bold text-slate-900' : 'text-slate-300'}">${hasVal ? val : '?'}</span>
          </td>
        `;
      });
      if (blockActs[b].length > 0) {
        bodyHtml += `<td class="p-3 text-center bg-slate-50/30 font-bold text-slate-900 border-r border-slate-200">${studentBlockScore(e.id, b)}</td>`;
      }
    });

    bodyHtml += `<td class="p-4 text-center font-black text-indigo-600 bg-indigo-50/30 border-l-2 border-slate-900">${studentFinal(e.id, S.activeGroupId) ?? '---'}</td></tr>`;
  });
  bodyHtml += '</tbody>';

  return `
    <div class="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div class="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h4 class="font-bold text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z"></path></svg>
          Matriz Operativa ${periodName()}
        </h4>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${getGroupLabel(S.activeGroupId)}</div>
      </div>
      <div class="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <table class="w-full border-collapse">
          ${headerHtml}
          ${bodyHtml}
        </table>
      </div>
    </div>
  `;
}

/**
 * Renderiza la interfaz de configuración de actividades por competencia.
 * @private
 * @returns {string} HTML de la vista de configuración.
 */
function renderConfigView() {
  return `
    <div class="max-w-[1600px] mx-auto animate-in slide-in-from-bottom-4 duration-500">
       <div class="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 mb-10 overflow-hidden relative">
          <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-2">Configuración de Evaluación</h3>
            <p class="text-indigo-100 max-w-md">Ajusta los puntos meta por competencia y normaliza los resultados automáticamente.</p>
          </div>
          <div class="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
       </div>
       
       <div id="cfg-blocks-container" class="space-y-8">
         ${BLOCKS.map(b => renderActivitiesConfigBlock(b)).join('')}
       </div>
    </div>
  `;
}

/**
 * Renderiza un bloque individual en el panel de configuración de actividades.
 * @param {string} b - Identificador del bloque (B1-B4).
 * @returns {string} HTML del componente de bloque.
 */
export function renderActivitiesConfigBlock(b) {
  const cfg = getGroupCfg(S.activeGroupId)[b];
  const acts = cfg.activities;
  const rawMax = blockRawMax(b);
  const meta = blockMeta(b);
  const diff = round2(rawMax - meta);
  const color = BCOLOR[b] || 'var(--indigo)';
  const icon = BICON[b] || '📄';
  const name = BNAME[b] || b;

  const alertCls = diff === 0 ? 'text-emerald-500 bg-emerald-50' : (diff > 0 ? 'text-rose-500 bg-rose-50' : 'text-amber-500 bg-amber-50');
  const alertMsg = diff === 0 
    ? 'Total coincide con la meta' 
    : (diff > 0 ? `Sobran ${fmtNum(diff)} pts` : `Faltan ${fmtNum(Math.abs(diff))} pts`);

  return `
    <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: ${color}15; color: ${color}">
            ${icon}
          </div>
          <div>
            <h4 class="font-bold text-slate-900">${name}</h4>
            <div class="flex items-center gap-2 mt-0.5">
               <span class="text-[10px] font-bold text-slate-400">PUNTOS META:</span>
               <input type="number" value="${meta}" onchange="window.updateBlockMeta('${b}', this.value)" class="w-12 text-[10px] font-black text-indigo-600 bg-indigo-50 border-none rounded-md px-1 py-0.5 text-center focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
           <button onclick="window.addActToBlock('${b}')" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
             + Actividad
           </button>
           <button onclick="window.autoAdjustBlock('${b}')" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
             Autoajustar
           </button>
        </div>
      </div>

      <div class="space-y-4 mb-8">
        ${acts.map((a, i) => `
          <div class="flex items-center gap-4 animate-in fade-in duration-300">
            <div class="w-6 text-[10px] font-black text-slate-300">${i+1}</div>
            <input type="text" value="${a.name}" oninput="window.handleActNameInput('${b}', '${a.id}', this)" placeholder="Nombre actividad..." class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none">
            <div class="flex items-center gap-2 w-[100px]">
              <input type="number" value="${a.pts}" oninput="window.updateActPts('${b}', '${a.id}', this.value)" class="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
              <span class="text-[10px] font-bold text-slate-400">pts</span>
            </div>
            <button onclick="window.removeActFromBlock('${b}', '${a.id}')" class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        `).join('')}
      </div>

      <div class="pt-8 border-t border-slate-50">
        <div class="flex items-center justify-between mb-4">
           <span class="text-sm font-bold text-slate-800">Progreso del Bloque</span>
           <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${alertCls}">
             ${alertMsg}
           </span>
        </div>
        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
           <div class="h-full transition-all duration-700" style="width: ${Math.min((rawMax/meta)*100, 100)}%; background: ${color}"></div>
        </div>
        <div class="flex justify-between mt-3">
           <span class="text-xs font-bold text-slate-400">${fmtNum(rawMax)} registrados</span>
           <span class="text-xs font-bold text-slate-900">${meta} meta</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * --- Controladores de Acción (Expuestos a window para compatibilidad con HTML) ---
 */

/** Actualiza la meta de puntos de un bloque. */
window.updateBlockMeta = (b, val) => {
  const n = parseFloat(val) || 100;
  getGroupCfg(S.activeGroupId)[b].meta = n;
  persist();
  window.go('actividades');
};

/** Sincroniza el cambio de nombre de una actividad con el estado persistente. */
window.handleActNameInput = (b, id, el) => {
  const f = findActivity(id);
  if (f) f.activity.name = el.value;
  persist();
};

/** Actualiza los puntos asignados a una actividad. */
window.updateActPts = (b, id, val) => {
  const n = parseFloat(val) || 0;
  const f = findActivity(id);
  if (f) f.activity.pts = n;
  persist();
};

/** Agrega una nueva actividad a un bloque específico. */
window.addActToBlock = (b) => {
  const activities = getGroupCfg(S.activeGroupId)[b].activities;
  activities.push({
    id: uid(),
    name: `Actividad ${activities.length + 1}`,
    pts: 20,
    courseId: S.activeGroupId,
    periodId: S.activePeriodId,
    instrumentId: null,
    instrumentIds: [],
    instrumentHistory: []
  });
  persist();
  window.go('actividades');
};

/** Elimina una actividad y sus evaluaciones asociadas. */
window.removeActFromBlock = (b, id) => {
  const cfg = getGroupCfg(S.activeGroupId)[b];
  cfg.activities = cfg.activities.filter(a => a.id !== id);
  S.evaluations = S.evaluations.filter(e => !(e.activityId === id && (e.periodId || 'P1') === S.activePeriodId));
  persist();
  window.go('actividades');
};

/** Distribuye equitativamente la meta de puntos entre todas las actividades del bloque. */
window.autoAdjustBlock = (b) => {
  const cfg = getGroupCfg(S.activeGroupId)[b];
  const acts = cfg.activities;
  if (!acts.length) return;
  const target = cfg.meta || 100;
  const base = Math.floor(target / acts.length);
  const extra = target % acts.length;
  acts.forEach((a, i) => {
    a.pts = base + (i < extra ? 1 : 0);
  });
  persist();
  window.go('actividades');
};

/**
 * Función principal de renderizado del Panel de Actividades.
 * @param {HTMLElement} container - Contenedor donde se inyectará el panel.
 */
export function renderActivitiesPanel(container) {
  const mode = getActViewMode();
  container.innerHTML = `
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-500">
      ${renderHeader()}
      <div id="act-content-area">
        ${mode === 'blocks' ? renderBlocksView() : ''}
        ${mode === 'matrix' ? renderMatrixView() : ''}
        ${mode === 'config' ? renderConfigView() : ''}
      </div>
    </div>
  `;
}

// Registro global para el orquestador de paneles
window.RENDERS.actividades = renderActivitiesPanel;
