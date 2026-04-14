/**
 * Módulo del Panel de Reportes (EduGest Reports).
 * --------------------------------------------------------------------------
 * Gestiona la generación de informes académicos oficiales y exportaciones.
 * Permite descargar datos en formatos Excel, PDF y Word, además de 
 * visualizar promedios globales y resúmenes anuales por estudiante.
 */

import { S } from '../core/state.js';
import { BNAME, BICON, BCOLOR } from '../core/config.js';
import { BLOCKS } from '../core/constants.js';
import { 
  fmtNum, 
  getGroupLabel, 
  periodName, 
  globalBlockAvg, 
  blockMeta, 
  doNormalize, 
  studentBlockScore, 
  studentFinal, 
  getGrade,
  studentAnnualBlockAverage, 
  studentAnnualFinal,
  studentsInGroup
} from '../core/domain-utils.js';
import { registerReportsActions } from './reports-actions.js';

/**
 * --- Renderizado de UI ---
 */

/**
 * Renderiza el encabezado del panel de reportes.
 * @private
 * @returns {string} HTML.
 */
function renderReportHeader() {
  return `
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Centro de Reportes y Descargas</h1>
        <p class="text-slate-500 mt-1">Genera informes académicos oficiales en múltiples formatos.</p>
      </div>
      <div class="flex items-center gap-3">
         <span class="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500">GRUPO: ${getGroupLabel(S.activeGroupId)}</span>
         <span class="px-4 py-2 bg-blue-50 rounded-xl text-xs font-bold text-blue-600">${periodName()}</span>
      </div>
    </header>
  `;
}

/**
 * Renderiza las tarjetas bento de exportación (Excel, PDF, Word).
 * @private
 * @returns {string} HTML.
 */
function renderExportCards() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <button onclick="reportDownloadExcel()" class="group bg-white p-8 border border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all">
        <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
          <img src="/assets/icons/logoexcel.png" alt="Excel" class="w-8 h-8 object-contain">
        </div>
        <h3 class="font-bold text-slate-900 mb-1">Exportar Excel</h3>
        <p class="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none">Matriz Detallada</p>
      </button>
      
      <button onclick="reportDownloadPdf()" class="group bg-white p-8 border border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center hover:border-rose-200 hover:shadow-xl hover:shadow-rose-50 transition-all">
        <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
          <img src="/assets/icons/logopdf.png" alt="PDF" class="w-8 h-8 object-contain">
        </div>
        <h3 class="font-bold text-slate-900 mb-1">Descargar PDF</h3>
        <p class="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none">Informe Oficial</p>
      </button>
      
      <button onclick="reportDownloadWord()" class="group bg-white p-8 border border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
          <img src="/assets/icons/logoword.png" alt="Word" class="w-8 h-8 object-contain">
        </div>
        <h3 class="font-bold text-slate-900 mb-1">Editar Word</h3>
        <p class="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none">Versión Editable</p>
      </button>
    </div>
  `;
}

/**
 * Renderiza la sección de promedios globales con barras de progreso estilizadas.
 * @private
 * @returns {string} HTML.
 */
function renderBlockAverages() {
  const chartCols = BLOCKS.map(b => ({
    lbl: BNAME[b],
    val: globalBlockAvg(b) ?? 0,
    meta: blockMeta(b),
    color: BCOLOR[b],
    norm: doNormalize(b),
  }));

  return `
    <div class="bg-white border border-slate-200 rounded-[2.5rem] p-10 mb-10 shadow-sm relative overflow-hidden">
       <div class="flex items-center gap-2 mb-10 relative z-10">
          <div class="w-2 h-6 bg-blue-600 rounded-full"></div>
          <h3 class="text-xl font-bold text-slate-900">Promedio Global por Competencia</h3>
       </div>
       
       <div class="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
         ${chartCols.map(col => {
            const progress = col.meta > 0 ? Math.min((col.val / col.meta) * 100, 100) : 0;
            return `
              <div class="flex flex-col items-center text-center group">
                <div class="mb-4 text-3xl font-black tabular-nums transition-colors duration-500" style="color: ${col.color}">
                  ${col.val || '---'}
                </div>
                <div class="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl relative overflow-hidden mb-6 flex items-end p-1">
                   <div class="w-full transition-all duration-1000 group-hover:scale-105" style="height: ${progress}%; background: ${col.color}; border-radius: 20px 20px 8px 8px; opacity: 0.15"></div>
                   <div class="absolute bottom-1 left-1 right-1 transition-all duration-1000 group-hover:scale-110 origin-bottom" style="height: ${progress * 0.9}%; background: ${col.color}; border-radius: 12px; opacity: 0.8; box-shadow: 0 10px 20px -5px ${col.color}"></div>
                </div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[120px] leading-tight">
                  ${col.lbl} ${col.norm ? '<span class="text-blue-400" title="Normalizado">*</span>' : ''}
                </div>
                <div class="mt-1 text-[9px] font-bold text-slate-300">Escala Meta: ${col.meta}</div>
              </div>
            `;
         }).join('')}
       </div>
       
       <div class="hidden md:block absolute -right-20 -bottom-20 w-80 h-80 bg-slate-50 rounded-full opacity-50"></div>
    </div>
  `;
}

/**
 * Renderiza las tablas de calificaciones por bloque y el resumen anual consolidado.
 * @private
 * @param {Array} ests - Estudiantes registrados en el grupo activo.
 * @returns {string} HTML.
 */
function renderGradesAndAnnual(ests) {
  if (ests.length === 0) {
    return `
      <div class="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
        <p class="text-slate-400 italic">No hay estudiantes registrados en este grupo.</p>
      </div>
    `;
  }

  // Tabla de Calificaciones
  const gradesTableHtml = `
    <div class="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm mb-10">
      <div class="p-6 bg-slate-50/50 border-b border-slate-100">
        <h4 class="font-bold text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          Tabla de Calificaciones por Bloque
        </h4>
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 border-r border-slate-200/50">Estudiante</th>
              ${BLOCKS.map(b => `
                <th class="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div class="flex flex-col items-center gap-1">
                    <span class="text-xl opacity-80 mb-1">${BICON[b]}</span>
                    <span style="color: ${BCOLOR[b]}">${BNAME[b]}</span>
                    <span class="text-[9px] font-medium opacity-60 italic">/${blockMeta(b)}</span>
                  </div>
                </th>
              `).join('')}
              <th class="p-4 text-center text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/30">Promedio B</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${ests.map(e => {
              const fin = studentFinal(e.id);
              return `
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="p-4 font-bold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200/50 whitespace-nowrap">${e.nombre} ${e.apellido}</td>
                  ${BLOCKS.map(b => `<td class="p-4 text-center font-bold text-slate-700">${studentBlockScore(e.id, b)}</td>`).join('')}
                  <td class="p-4 text-center font-black text-lg text-blue-600 bg-blue-50/20">${fin ?? '---'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Tabla de Resumen Anual
  const annualTableHtml = `
    <div class="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
      <div class="p-6 bg-slate-50/50 border-b border-slate-100">
        <h4 class="font-bold text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Resumen Anual del Estudiante
        </h4>
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full border-collapse annual-report-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 border-r border-slate-200/50">Estudiante</th>
              ${['P1', 'P2', 'P3', 'P4'].map(p => `<th class="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">${p}</th>`).join('')}
              ${BLOCKS.map(b => `<th class="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest" style="background: ${BCOLOR[b]}05">${BNAME[b]}</th>`).join('')}
              <th class="p-4 text-center text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100/50">PROMEDIO</th>
              <th class="p-4 text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/30">% FINAL</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-slate-700">
            ${ests.map(e => {
              const vals = ['P1', 'P2', 'P3', 'P4'].map(pid => studentFinal(e.id, S.activeGroupId, pid));
              const annualBlocks = BLOCKS.map(blockId => studentAnnualBlockAverage(e.id, blockId, S.activeGroupId));
              const fin = studentAnnualFinal(e.id, S.activeGroupId);
              return `
                <tr class="hover:bg-slate-50/50 transition-colors text-sm">
                  <td class="p-4 font-bold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200/50 whitespace-nowrap">${e.nombre} ${e.apellido}</td>
                  ${vals.map(v => `<td class="p-4 text-center">${v ?? '<span class="opacity-30">?</span>'}</td>`).join('')}
                  ${annualBlocks.map(v => `<td class="p-4 text-center font-medium">${v !== null ? fmtNum(v) : '<span class="opacity-30">?</span>'}</td>`).join('')}
                  <td class="p-4 text-center font-black text-slate-900 bg-slate-50/50">${fin ?? '---'}</td>
                  <td class="p-4 text-center font-black text-emerald-600 bg-emerald-50/30">${fin !== null ? `${fin}%` : '---'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return `
    <div class="reportes-stack">
      ${gradesTableHtml}
      ${annualTableHtml}
    </div>
  `;
}

/**
 * Punto de entrada principal para renderizar el panel de reportes.
 * @param {HTMLElement} container - Contenedor raíz.
 */
export function renderReportsPanel(container) {
  const ests = studentsInGroup(S.activeGroupId);
  
  container.innerHTML = `
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      ${renderReportHeader()}
      ${renderExportCards()}
      ${renderBlockAverages()}
      ${renderGradesAndAnnual(ests)}
    </div>
  `;
}

export function init() {
  registerReportsActions();
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.reportes = renderReportsPanel;
}
