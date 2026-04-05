// Genera un nombre de archivo consistente para todas las exportaciones del panel de reportes.
function reportExportBaseName() {
  const group = getGroupLabel(S.activeGroupId) || 'grupo';
  const period = periodName() || 'periodo';
  const raw = `${group}-${period}`;
  const slug = normTxt(raw).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `reporte-${slug || 'general'}`;
}
// Extrae una tabla renderizada del DOM a una matriz plana para reutilizar la misma base en Excel, PDF y Word.
function reportExtractTableMatrix(tableEl) {
  if (!tableEl) return [];
  return Array.from(tableEl.querySelectorAll('tr')).map((row) =>
    Array.from(row.querySelectorAll('th,td')).map((cell) =>
      String(cell.textContent || '').replace(/\s+/g, ' ').trim()
    )
  ).filter((row) => row.length > 0);
}
// Convierte la matriz intermedia en una tabla HTML portable para exportaciones imprimibles y editables.
function reportMatrixToHtmlTable(matrix) {
  if (!matrix.length) return '<table><tbody><tr><td>Sin datos</td></tr></tbody></table>';
  const [head, ...rows] = matrix;
  const thead = `<thead><tr>${head.map((cell)=>`<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map((row)=>`<tr>${row.map((cell)=>`<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}
// Construye el documento HTML que sirve como fuente única de exportación para los distintos formatos.
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
// Exporta el reporte visible a Excel usando la misma estructura de tablas que el usuario ve en pantalla.
function reportDownloadExcel() {
  const calTable = document.querySelector('.reportes-stack .tbl');
  const annualTable = document.querySelector('.annual-report-table');
  const calMatrix = reportExtractTableMatrix(calTable);
  const annualMatrix = reportExtractTableMatrix(annualTable);
  if (!calMatrix.length && !annualMatrix.length) { toast('No hay datos para exportar', true); return; }
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
}
// Abre una versión imprimible del reporte para que el navegador la convierta en PDF desde la ventana emergente.
async function reportDownloadPdf() {
  const calTable = document.querySelector('.reportes-stack .tbl');
  const annualTable = document.querySelector('.annual-report-table');
  const calMatrix = reportExtractTableMatrix(calTable);
  const annualMatrix = reportExtractTableMatrix(annualTable);
  if (!calMatrix.length && !annualMatrix.length) { toast('No hay datos para exportar', true); return; }
  try {
    const htmlBase = reportBuildExportHtml('Reporte AulaBase', calMatrix, annualMatrix);
    const html = htmlBase.replace(
      '</body>',
      `<script>
        window.addEventListener('load', function () {
          setTimeout(function () {
            try { window.focus(); window.print(); } catch (_) {}
          }, 180);
        });
      </script></body>`
    );
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      URL.revokeObjectURL(url);
      toast('Tu navegador bloqueó la ventana de impresión. Habilita pop-ups para este sitio.', true);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error('[EduGest][reportes] Error exportando PDF', error);
    toast('No se pudo generar el PDF', true);
  }
}
// Genera una copia editable del reporte en formato Word a partir del HTML consolidado.
function reportDownloadWord() {
  const calTable = document.querySelector('.reportes-stack .tbl');
  const annualTable = document.querySelector('.annual-report-table');
  const calMatrix = reportExtractTableMatrix(calTable);
  const annualMatrix = reportExtractTableMatrix(annualTable);
  if (!calMatrix.length && !annualMatrix.length) { toast('No hay datos para exportar', true); return; }
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
}
// Pinta el panel de reportes con exportaciones, promedios por bloque, detalle por estudiante y resumen anual.
RENDERS.reportes = function(c) {
  const ests = studentsInGroup(S.activeGroupId);
  const chartCols = BLOCKS.map(b=>({
    lbl: BNAME[b],
    val: globalBlockAvg(b) ?? 0,
    meta: blockMeta(b),
    color: BCOLOR[b],
    norm: doNormalize(b),
  }));

  let barH='<div class="chart-bars">';
  chartCols.forEach(col=>{
    const pct = col.meta>0 ? Math.min(col.val/col.meta*100,100) : 0;
    barH+=`<div class="bar-col">
      <div class="bar-val">${col.val||'?'}</div>
      <div class="bar-rect" style="height:${pct*1.3}px;background:${col.color};opacity:.85;"></div>
      <div class="bar-lbl">${col.lbl}${col.norm?'*':''}</div>
    </div>`;
  });
  barH+='</div><div style="font-size:11px;color:var(--mute);margin-top:8px;">* = normalizado a escala meta</div>';

  // student table
  let stbl='';
  if(ests.length===0) stbl=`<div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="es">Sin estudiantes en el grupo seleccionado</div></div>`;
  else {
    stbl=`<div style="overflow-x:auto;"><table class="tbl"><thead><tr><th>Estudiante</th>
      ${BLOCKS.map(b=>`<th style="text-align:center;">${BICON[b]} ${BNAME[b]}<br><span style="font-weight:400;text-transform:none;font-size:10px;">/${blockMeta(b)}</span></th>`).join('')}
      <th style="text-align:center;">Final</th></tr></thead><tbody>`;
    ests.forEach(e=>{
      const scores=BLOCKS.map(b=>studentBlockScore(e.id,b));
      const fin=studentFinal(e.id);
      const {l,c}=getGrade(fin);
      stbl+=`<tr><td style="font-weight:600;">${e.nombre} ${e.apellido}</td>
        ${scores.map((s,i)=>`<td style="text-align:center;font-weight:700;">${s}</td>`).join('')}
        <td style="text-align:center;"><span class="gb ${c}">${fin ?? '—'}</span></td></tr>`;
    });
    stbl+='</tbody></table></div>';
  }
  let annual='';
  if (ests.length===0) {
    annual = `<div class="empty"><div class="es">Sin estudiantes para resumen anual</div></div>`;
  } else {
    annual = `<div style="overflow-x:auto;"><table class="tbl annual-report-table"><thead><tr><th>Estudiante</th><th>P1</th><th>P2</th><th>P3</th><th>P4</th>${BLOCKS.map((blockId) => `<th>${BNAME[blockId]}</th>`).join('')}<th>Promedio anual</th><th>% anual</th></tr></thead><tbody>`;
    ests.forEach(e=>{
      const vals = ['P1','P2','P3','P4'].map(pid=>studentFinal(e.id, S.activeGroupId, pid));
      const annualBlocks = BLOCKS.map((blockId) => studentAnnualBlockAverage(e.id, blockId, S.activeGroupId));
      const fin = studentAnnualFinal(e.id, S.activeGroupId);
      annual += `<tr><td style="font-weight:600;">${e.nombre} ${e.apellido}</td>
        ${vals.map(v=>`<td style="text-align:center;">${v===null?'?':v}</td>`).join('')}
        ${annualBlocks.map(v=>`<td style="text-align:center;">${v===null?'?':fmtNum(v)}</td>`).join('')}
        <td style="text-align:center;font-weight:700;">${fin===null?'?':fin}</td>
        <td style="text-align:center;font-weight:700;">${fin===null?'?':`${fin}%`}</td>
      </tr>`;
    });
    annual += `</tbody></table></div>`;
  }

  c.innerHTML=`
  <div class="g3" style="margin-bottom:18px;">
    <div class="card cp" style="cursor:pointer;text-align:center;" onclick="reportDownloadExcel()"><div style="margin-bottom:8px;"><img src="/assets/icons/logoexcel.png" alt="Excel" style="width:40px;height:40px;object-fit:contain;"></div><div style="font-weight:700;">Excel</div><div style="font-size:12px;color:var(--mute);">Matriz completa</div></div>
    <div class="card cp" style="cursor:pointer;text-align:center;" onclick="reportDownloadPdf()"><div style="margin-bottom:8px;"><img src="/assets/icons/logopdf.png" alt="PDF" style="width:40px;height:40px;object-fit:contain;"></div><div style="font-weight:700;">PDF</div><div style="font-size:12px;color:var(--mute);">Informe listo</div></div>
    <div class="card cp" style="cursor:pointer;text-align:center;" onclick="reportDownloadWord()"><div style="margin-bottom:8px;"><img src="/assets/icons/logoword.png" alt="Word" style="width:40px;height:40px;object-fit:contain;"></div><div style="font-weight:700;">Word</div><div style="font-size:12px;color:var(--mute);">Editable</div></div>
  </div>
  <div id="reportes-export-root">
  <div class="reportes-stack">
    <div class="card"><div class="ch"><span class="ch-title">Promedio por Bloque</span></div><div class="cp">${barH}</div></div>
    <div class="card"><div class="ch"><span class="ch-title">Tabla de Calificaciones</span></div>${stbl}</div>
  </div>
  <div class="card report-export-keep" style="margin-top:16px;"><div class="ch"><span class="ch-title">Resumen anual por estudiante</span></div><div class="cp">${annual}</div></div>
  </div>
  `;
};

const RUBRIC_APPEARANCE_TEMPLATES = {
  academic: {
    label:'Profesional académico',
    theme:{ headerBg:'#0F2C59', headerText:'#FFFFFF', tableBorder:'#C7D2E5', rowAltBg:'#F3F6FB', rowBaseBg:'#FFFFFF', metaColumnBg:'#E5ECF8', levelColors:['#1D4ED8','#16A34A','#F59E0B','#EF4444','#991B1B'] }
  },
  print: {
    label:'Blanco para impresión',
    theme:{ headerBg:'#FFFFFF', headerText:'#111827', tableBorder:'#D1D5DB', rowAltBg:'#FFFFFF', rowBaseBg:'#FFFFFF', metaColumnBg:'#FFFFFF', levelColors:['#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF'] }
  },
  azul_institucional: {
    label:'Azul institucional',
    theme:{ headerBg:'#1E40AF', headerText:'#FFFFFF', tableBorder:'#93C5FD', rowAltBg:'#DBEAFE', rowBaseBg:'#EFF6FF', metaColumnBg:'#BFDBFE', levelColors:['#1D4ED8','#0EA5E9','#14B8A6','#F59E0B','#DC2626'] }
  },
  morado_elegante: {
    label:'Morado elegante',
    theme:{ headerBg:'#6B21A8', headerText:'#FFFFFF', tableBorder:'#C4B5FD', rowAltBg:'#F3E8FF', rowBaseBg:'#FAF5FF', metaColumnBg:'#DDD6FE', levelColors:['#7C3AED','#2563EB','#CA8A04','#DC2626','#7F1D1D'] }
  },
  verde_institucional: {
    label:'Verde institucional',
    theme:{ headerBg:'#065F46', headerText:'#FFFFFF', tableBorder:'#86EFAC', rowAltBg:'#DCFCE7', rowBaseBg:'#ECFDF5', metaColumnBg:'#BBF7D0', levelColors:['#15803D','#16A34A','#0EA5E9','#F59E0B','#DC2626'] }
  },
  gris_moderno: {
    label:'Gris moderno',
    theme:{ headerBg:'#374151', headerText:'#FFFFFF', tableBorder:'#9CA3AF', rowAltBg:'#F3F4F6', rowBaseBg:'#FFFFFF', metaColumnBg:'#E5E7EB', levelColors:['#6B7280','#3B82F6','#F59E0B','#EF4444','#991B1B'] }
  },
  custom: {
    label:'Personalizado',
    theme:{ headerBg:'#1E3A8A', headerText:'#FFFFFF', tableBorder:'#C7D2FE', rowAltBg:'#EEF2FF', rowBaseBg:'#FFFFFF', metaColumnBg:'#E0E7FF', levelColors:['#2563EB','#16A34A','#D97706','#DC2626','#7F1D1D'] }
  }
};

const INST_EDITOR = { mode:'new', draft:null, linkActivityId:null, openPanelId:null, openAppearance:false, _criteriaGapKey:null, invalidChecklistCriteria:new Set(), scaleMaxInputRaw:null };
const APPLY_CTX = { activityId:null, studentId:null, values:{}, criterionComments:{}, teacherCommentGeneral:'' };
window._newInstrumentLinkActivityId = null;
