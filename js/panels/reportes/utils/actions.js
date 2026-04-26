import { S } from '../../../core/state.js';
import { getGroupLabel, periodName, normTxt, escapeHtml } from '../../../core/domain-utils.js';

function reportExportBaseName() {
  const group = getGroupLabel(S.activeGroupId) || 'grupo';
  const period = periodName() || 'periodo';
  const raw = `${group}-${period}`;
  const slug = normTxt(raw).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `reporte-${slug || 'general'}`;
}

function reportExtractTableMatrix(tableEl) {
  if (!tableEl) return [];
  return Array.from(tableEl.querySelectorAll('tr'))
    .map((row) => Array.from(row.querySelectorAll('th,td')).map((cell) => String(cell.textContent || '').replace(/\s+/g, ' ').trim()))
    .filter((row) => row.length > 0);
}

function reportMatrixToHtmlTable(matrix) {
  if (!matrix.length) return '<table><tbody><tr><td>Sin datos</td></tr></tbody></table>';
  const [head, ...rows] = matrix;
  const thead = `<thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
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
    <p class="sub">${escapeHtml(getGroupLabel(S.activeGroupId) || 'Sin grupo')} • ${escapeHtml(periodName())}</p>
    <h2>Tabla de calificaciones</h2>
    ${calTable}
    <h2>Resumen anual por estudiante</h2>
    ${annualTable}
  </body></html>`;
}

export function registerReportsActions() {
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportExportBaseName()}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportExportBaseName()}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  };
}
