/**
 * Reports Panel Module
 * Modernized version of the academic reporting system.
 * Handles Excel, PDF, and Word exports with premium UI.
 */

import { S } from '../core/state.js';
import { BNAME, BICON, BCOLOR } from '../core/config.js';
import { BLOCKS } from '../core/constants.js';
import { 
  fmtNum, 
  getGroupLabel, 
  periodName, 
  normTxt, 
  escapeHtml, 
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

/**
 * Export Helpers
 */

function reportExportBaseName() {
  const group = getGroupLabel(S.activeGroupId) || 'grupo';
  const period = periodName() || 'periodo';
  const raw = `${group}-${period}`;
  const slug = normTxt(raw).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `reporte-${slug || 'general'}`;
}

function reportExtractTableMatrix(tableEl) {
  if (!tableEl) return [];
  return Array.from(tableEl.querySelectorAll('tr')).map((row) =>
    Array.from(row.querySelectorAll('th,td')).map((cell) =>
      String(cell.textContent || '').replace(/\s+/g, ' ').trim()
    )
  ).filter((row) => row.length > 0);
}

function reportMatrixToHtmlTable(matrix) {
  if (!matrix.length) return '<table><tbody><tr><td>Sin datos</td></tr></tbody></table>';
  const [head, ...rows] = matrix;
  const thead = `<thead><tr>${head.map((cell)=>`<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map((row)=>`<tr>${row.map((cell)=>`<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

function reportBuildExportHtml(title, calMatrix, annualMatrix) {
  const safeTitle = escapeHtml(title || 'Reporte');
  const calTable = reportMatrixToHtmlTable(calMatrix);
  const annualTable = reportMatrixToHtmlTable(annualMatrix);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111827;margin:24px;}
    h1{font-size:20px;margin:0 0 4px;}
    .sub{font-size:12px;color:#6b7280;margin:0 0 14px;}
    h2{font-size:15px;margin:16px 0 8px;color:#1f2937;}
    table{width:100%;border-collapse:collapse;margin-bottom:12px;}
    th,td{border:1px solid #d1d5db;padding:8px;font-size:12px;line-height:1.35;text-align:left;}
    th{background:#f3f4f6;font-weight:700;}
  </style></head><body>
    <h1>${safeTitle}</h1>
    <p class="sub">${escapeHtml(getGroupLabel(S.activeGroupId) || 'Sin grupo')} ? ${escapeHtml(periodName())}</p>
    <h2>Tabla de calificaciones</h2>
    ${calTable}
    <h2>Resumen anual por estudiante</h2>
    ${annualTable}
  </body></html>`;
}

/**
 * Global Exports
 */

window.reportDownloadExcel = () => {
  const calTable = document.querySelector('.reportes-stack table');
  const annualTable = document.querySelector('.annual-report-table');
  const calMatrix = reportExtractTableMatrix(calTable);
  const annualMatrix = reportExtractTableMatrix(annualTable);
  if (!calMatrix.length && !annualMatrix.length) { 
     if (typeof window.toast === 'function') window.toast('No hay datos para exportar', true); 
     return; 
  }
  const html = reportBuildExportHtml('Reporte AulaBase', calMatrix, annualMatrix);
  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportExportBaseName()}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
};

window.reportDownloadPdf = async () => {
  const calTable = document.querySelector('.reportes-stack table');
  const annualTable = document.querySelector('.annual-report-table');
  const calMatrix = reportExtractTableMatrix(calTable);
  const annualMatrix = reportExtractTableMatrix(annualTable);
  if (!calMatrix.length && !annualMatrix.length) return;
  try {
    const htmlBase = reportBuildExportHtml('Reporte AulaBase', calMatrix, annualMatrix);
    const html = htmlBase.replace('</body>', `<script>window.addEventListener('load', function () { setTimeout(function () { try { window.focus(); window.print(); } catch (_) {} }, 180); });</script></body>`);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      URL.revokeObjectURL(url);
      if (typeof window.toast === 'function') window.toast('Habilita pop-ups para imprimir.', true);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    console.error('Error PDF:', err);
  }
};

window.reportDownloadWord = () => {
  const calTable = document.querySelector('.reportes-stack table');
  const annualTable = document.querySelector('.annual-report-table');
  const calMatrix = reportExtractTableMatrix(calTable);
  const annualMatrix = reportExtractTableMatrix(annualTable);
  if (!calMatrix.length && !annualMatrix.length) return;
  const html = reportBuildExportHtml('Reporte AulaBase', calMatrix, annualMatrix);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportExportBaseName()}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
};

/**
 * UI Rendering
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
         <span class="px-4 py-2 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-600">${periodName()}</span>
      </div>
    </header>
  `;
}

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
      
      <button onclick="reportDownloadWord()" class="group bg-white p-8 border border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all">
        <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
          <img src="/assets/icons/logoword.png" alt="Word" class="w-8 h-8 object-contain">
        </div>
        <h3 class="font-bold text-slate-900 mb-1">Editar Word</h3>
        <p class="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none">Versión Editable</p>
      </button>
    </div>
  `;
}

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
          <div class="w-2 h-6 bg-indigo-600 rounded-full"></div>
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
                  ${col.lbl} ${col.norm ? '<span class="text-indigo-400" title="Normalizado">*</span>' : ''}
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

function renderGradesAndAnnual(ests) {
  if (ests.length === 0) {
    return `
      <div class="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
        <p class="text-slate-400 italic">No hay estudiantes registrados en este grupo.</p>
      </div>
    `;
  }

  // Grades Table
  const gradesTableHtml = `
    <div class="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm mb-10">
      <div class="p-6 bg-slate-50/50 border-b border-slate-100">
        <h4 class="font-bold text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
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
              <th class="p-4 text-center text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/30">Promedio B</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${ests.map(e => {
              const fin = studentFinal(e.id);
              const { c } = getGrade(fin);
              return `
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="p-4 font-bold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200/50 whitespace-nowrap">${e.nombre} ${e.apellido}</td>
                  ${BLOCKS.map(b => `<td class="p-4 text-center font-bold text-slate-700">${studentBlockScore(e.id, b)}</td>`).join('')}
                  <td class="p-4 text-center font-black text-lg text-indigo-600 bg-indigo-50/20">${fin ?? '---'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Annual Summary Table
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
 * Entry Point
 */
export function renderReportsPanel(container) {
  const ests = studentsInGroup(S.activeGroupId);
  
  container.innerHTML = `
    <div class="max-w-[1240px] mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      ${renderReportHeader()}
      ${renderExportCards()}
      ${renderBlockAverages()}
      ${renderGradesAndAnnual(ests)}
    </div>
  `;
}

// Global Registration
window.RENDERS.reportes = renderReportsPanel;
