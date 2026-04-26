import{f as s,x as m,S as p,y as f,z as h,c as w}from"./main-AFE2lkXK.js";function u(){const t=m(p.activeGroupId)||"grupo",e=f()||"periodo",o=`${t}-${e}`;return`reporte-${h(o).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"general"}`}function i(t){return t?Array.from(t.querySelectorAll("tr")).map(e=>Array.from(e.querySelectorAll("th,td")).map(o=>String(o.textContent||"").replace(/\s+/g," ").trim())).filter(e=>e.length>0):[]}function b(t){if(!t.length)return"<table><tbody><tr><td>Sin datos</td></tr></tbody></table>";const[e,...o]=t,n=`<thead><tr>${e.map(a=>`<th>${s(a)}</th>`).join("")}</tr></thead>`,l=`<tbody>${o.map(a=>`<tr>${a.map(c=>`<td>${s(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;return`<table>${n}${l}</table>`}function d(t,e,o){const n=s(t),l=b(e),a=b(o);return`<!doctype html><html><head><meta charset="utf-8"><title>${n}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111827;margin:24px;}
    h1{font-size:20px;margin:0 0 4px;}
    .sub{font-size:12px;color:#6b7280;margin:0 0 14px;}
    h2{font-size:15px;margin:16px 0 8px;color:#1f2937;}
    table{width:100%;border-collapse:collapse;margin-bottom:12px;}
    th,td{border:1px solid #d1d5db;padding:8px;font-size:12px;line-height:1.35;text-align:left;}
    th{background:#f3f4f6;font-weight:700;}
  </style></head><body>
    <h1>${n}</h1>
    <p class="sub">${s(m(p.activeGroupId)||"Sin grupo")} • ${s(f())}</p>
    <h2>Tabla de calificaciones</h2>
    ${l}
    <h2>Resumen anual por estudiante</h2>
    ${a}
  </body></html>`}function x(){window.reportDownloadExcel=()=>{const t=document.querySelector(".reportes-stack table"),e=document.querySelector(".annual-report-table"),o=i(t),n=i(e);if(!o.length&&!n.length){typeof window.toast=="function"&&window.toast("No hay datos para exportar",!0);return}const l=d("Reporte AulaBase",o,n),a=new Blob(["\uFEFF",l],{type:"application/vnd.ms-excel;charset=utf-8"}),c=URL.createObjectURL(a),r=document.createElement("a");r.href=c,r.download=`${u()}.xls`,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(c),1200)},window.reportDownloadPdf=async()=>{const t=document.querySelector(".reportes-stack table"),e=document.querySelector(".annual-report-table"),o=i(t),n=i(e);if(!(!o.length&&!n.length))try{const a=d("Reporte AulaBase",o,n).replace("</body>","<script>window.addEventListener('load', function () { setTimeout(function () { try { window.focus(); window.print(); } catch (_) {} }, 180); });<\/script></body>"),c=new Blob([a],{type:"text/html;charset=utf-8"}),r=URL.createObjectURL(c);if(!window.open(r,"_blank")){URL.revokeObjectURL(r),typeof window.toast=="function"&&window.toast("Habilita pop-ups para imprimir.",!0);return}setTimeout(()=>URL.revokeObjectURL(r),6e4)}catch(l){console.error("Error PDF:",l)}},window.reportDownloadWord=()=>{const t=document.querySelector(".reportes-stack table"),e=document.querySelector(".annual-report-table"),o=i(t),n=i(e);if(!o.length&&!n.length)return;const l=d("Reporte AulaBase",o,n),a=new Blob(["\uFEFF",l],{type:"application/msword"}),c=URL.createObjectURL(a),r=document.createElement("a");r.href=c,r.download=`${u()}.doc`,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(c),1200)}}function R(t){const e=w(p.activeGroupId);t.innerHTML=`
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      ${renderReportHeader()}
      ${renderExportCards()}
      ${renderBlockAverages()}
      ${renderGradesAndAnnual(e)}
    </div>
  `}function $(){x(),window.RENDERS||(window.RENDERS={}),window.RENDERS.reportes=renderReportsPanel}export{$ as inicializar,R as renderizarReportsPanel};
