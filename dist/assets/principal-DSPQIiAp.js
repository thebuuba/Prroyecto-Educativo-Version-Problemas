import{f as p,x as m,S as i,w as h,C as k,c as y,o as c,B as u,n as x,D as $,k as w,E as R,m as j,v as f,q as E,F as B,G as T,l as z}from"./main-BFkCmjLr.js";function g(){const o=m(i.activeGroupId)||"grupo",t=h()||"periodo",r=`${o}-${t}`;return`reporte-${k(r).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"general"}`}function d(o){return o?Array.from(o.querySelectorAll("tr")).map(t=>Array.from(t.querySelectorAll("th,td")).map(r=>String(r.textContent||"").replace(/\s+/g," ").trim())).filter(t=>t.length>0):[]}function v(o){if(!o.length)return"<table><tbody><tr><td>Sin datos</td></tr></tbody></table>";const[t,...r]=o,e=`<thead><tr>${t.map(s=>`<th>${p(s)}</th>`).join("")}</tr></thead>`,l=`<tbody>${r.map(s=>`<tr>${s.map(n=>`<td>${p(n)}</td>`).join("")}</tr>`).join("")}</tbody>`;return`<table>${e}${l}</table>`}function b(o,t,r){const e=p(o),l=v(t),s=v(r);return`<!doctype html><html><head><meta charset="utf-8"><title>${e}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111827;margin:24px;}
    h1{font-size:20px;margin:0 0 4px;}
    .sub{font-size:12px;color:#6b7280;margin:0 0 14px;}
    h2{font-size:15px;margin:16px 0 8px;color:#1f2937;}
    table{width:100%;border-collapse:collapse;margin-bottom:12px;}
    th,td{border:1px solid #d1d5db;padding:8px;font-size:12px;line-height:1.35;text-align:left;}
    th{background:#f3f4f6;font-weight:700;}
  </style></head><body>
    <h1>${e}</h1>
    <p class="sub">${p(m(i.activeGroupId)||"Sin grupo")} • ${p(h())}</p>
    <h2>Tabla de calificaciones</h2>
    ${l}
    <h2>Resumen anual por estudiante</h2>
    ${s}
  </body></html>`}function L(){window.reportDownloadExcel=()=>{const o=document.querySelector(".reportes-stack table"),t=document.querySelector(".annual-report-table"),r=d(o),e=d(t);if(!r.length&&!e.length){typeof window.toast=="function"&&window.toast("No hay datos para exportar",!0);return}const l=b("Reporte AulaBase",r,e),s=new Blob(["\uFEFF",l],{type:"application/vnd.ms-excel;charset=utf-8"}),n=URL.createObjectURL(s),a=document.createElement("a");a.href=n,a.download=`${g()}.xls`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(n),1200)},window.reportDownloadPdf=async()=>{const o=document.querySelector(".reportes-stack table"),t=document.querySelector(".annual-report-table"),r=d(o),e=d(t);if(!(!r.length&&!e.length))try{const s=b("Reporte AulaBase",r,e).replace("</body>","<script>window.addEventListener('load', function () { setTimeout(function () { try { window.focus(); window.print(); } catch (_) {} }, 180); });<\/script></body>"),n=new Blob([s],{type:"text/html;charset=utf-8"}),a=URL.createObjectURL(n);if(!window.open(a,"_blank")){URL.revokeObjectURL(a),typeof window.toast=="function"&&window.toast("Habilita pop-ups para imprimir.",!0);return}setTimeout(()=>URL.revokeObjectURL(a),6e4)}catch(l){console.error("Error PDF:",l)}},window.reportDownloadWord=()=>{const o=document.querySelector(".reportes-stack table"),t=document.querySelector(".annual-report-table"),r=d(o),e=d(t);if(!r.length&&!e.length)return;const l=b("Reporte AulaBase",r,e),s=new Blob(["\uFEFF",l],{type:"application/msword"}),n=URL.createObjectURL(s),a=document.createElement("a");a.href=n,a.download=`${g()}.doc`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(n),1200)}}function M(){return`
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Centro de Reportes y Descargas</h1>
        <p class="text-slate-500 mt-1">Genera informes académicos oficiales en múltiples formatos.</p>
      </div>
      <div class="flex items-center gap-3">
         <span class="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500">GRUPO: ${m(i.activeGroupId)}</span>
         <span class="px-4 py-2 bg-blue-50 rounded-xl text-xs font-bold text-blue-600">${h()}</span>
      </div>
    </header>
  `}function A(){return`
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
  `}function P(){return`
    <div class="bg-white border border-slate-200 rounded-[2.5rem] p-10 mb-10 shadow-sm relative overflow-hidden">
       <div class="flex items-center gap-2 mb-10 relative z-10">
          <div class="w-2 h-6 bg-blue-600 rounded-full"></div>
          <h3 class="text-xl font-bold text-slate-900">Promedio Global por Competencia</h3>
       </div>
       
       <div class="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
         ${c.map(t=>({lbl:x[t],val:R(t)??0,meta:w(t),color:u[t],norm:$(t)})).map(t=>{const r=t.meta>0?Math.min(t.val/t.meta*100,100):0;return`
              <div class="flex flex-col items-center text-center group">
                <div class="mb-4 text-3xl font-black tabular-nums transition-colors duration-500" style="color: ${t.color}">
                  ${t.val||"---"}
                </div>
                <div class="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl relative overflow-hidden mb-6 flex items-end p-1">
                   <div class="w-full transition-all duration-1000 group-hover:scale-105" style="height: ${r}%; background: ${t.color}; border-radius: 20px 20px 8px 8px; opacity: 0.15"></div>
                   <div class="absolute bottom-1 left-1 right-1 transition-all duration-1000 group-hover:scale-110 origin-bottom" style="height: ${r*.9}%; background: ${t.color}; border-radius: 12px; opacity: 0.8; box-shadow: 0 10px 20px -5px ${t.color}"></div>
                </div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[120px] leading-tight">
                  ${t.lbl} ${t.norm?'<span class="text-blue-400" title="Normalizado">*</span>':""}
                </div>
                <div class="mt-1 text-[9px] font-bold text-slate-300">Escala Meta: ${t.meta}</div>
              </div>
            `}).join("")}
       </div>
       
       <div class="hidden md:block absolute -right-20 -bottom-20 w-80 h-80 bg-slate-50 rounded-full opacity-50"></div>
    </div>
  `}function D(o){if(o.length===0)return`
      <div class="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
        <p class="text-slate-400 italic">No hay estudiantes registrados en este grupo.</p>
      </div>
    `;const t=`
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
              ${c.map(e=>`
                <th class="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div class="flex flex-col items-center gap-1">
                    <span class="text-xl opacity-80 mb-1">${j[e]}</span>
                    <span style="color: ${u[e]}">${x[e]}</span>
                    <span class="text-[9px] font-medium opacity-60 italic">/${w(e)}</span>
                  </div>
                </th>
              `).join("")}
              <th class="p-4 text-center text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/30">Promedio B</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${o.map(e=>{const l=f(e.id);return`
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="p-4 font-bold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200/50 whitespace-nowrap">${e.nombre} ${e.apellido}</td>
                  ${c.map(s=>`<td class="p-4 text-center font-bold text-slate-700">${E(e.id,s)}</td>`).join("")}
                  <td class="p-4 text-center font-black text-lg text-blue-600 bg-blue-50/20">${l??"---"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,r=`
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
              ${["P1","P2","P3","P4"].map(e=>`<th class="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">${e}</th>`).join("")}
              ${c.map(e=>`<th class="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest" style="background: ${u[e]}05">${x[e]}</th>`).join("")}
              <th class="p-4 text-center text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100/50">PROMEDIO</th>
              <th class="p-4 text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/30">% FINAL</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-slate-700">
            ${o.map(e=>{const l=["P1","P2","P3","P4"].map(a=>f(e.id,i.activeGroupId,a)),s=c.map(a=>B(e.id,a,i.activeGroupId)),n=T(e.id,i.activeGroupId);return`
                <tr class="hover:bg-slate-50/50 transition-colors text-sm">
                  <td class="p-4 font-bold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200/50 whitespace-nowrap">${e.nombre} ${e.apellido}</td>
                  ${l.map(a=>`<td class="p-4 text-center">${a??'<span class="opacity-30">?</span>'}</td>`).join("")}
                  ${s.map(a=>`<td class="p-4 text-center font-medium">${a!==null?z(a):'<span class="opacity-30">?</span>'}</td>`).join("")}
                  <td class="p-4 text-center font-black text-slate-900 bg-slate-50/50">${n??"---"}</td>
                  <td class="p-4 text-center font-black text-emerald-600 bg-emerald-50/30">${n!==null?`${n}%`:"---"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;return`
    <div class="reportes-stack">
      ${t}
      ${r}
    </div>
  `}function S(o){const t=y(i.activeGroupId);o.innerHTML=`
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      ${M()}
      ${A()}
      ${P()}
      ${D(t)}
    </div>
  `}function U(){L(),window.RENDERS||(window.RENDERS={}),window.RENDERS.reportes=S}export{U as inicializar,S as renderizarReportsPanel};
