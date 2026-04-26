import{c as w,S as x,o as m,h as k,q as n,l as f,v as $,w as E,B as h,m as y,n as A}from"./main-WukIV6bs.js";function z(u){const c=w(x.activeGroupId);if(c.length===0||m()===0){u.innerHTML=`
      <div class="max-w-[1240px] mx-auto p-6 md:p-10">
        ${renderHeader()}
        ${renderEmptyState(c)}
      </div>
    `;return}const g=k(x.activeGroupId),a={};n.forEach(t=>a[t]=g[t].activities);let r=`
    <thead class="bg-white border-b border-slate-200">
      <tr>
        <th rowspan="2" class="sticky left-0 z-30 bg-white p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-r-2 border-slate-100">Estudiante</th>
  `;n.forEach(t=>{const e=a[t].length;e>0&&(r+=`
        <th colspan="${e+1}" class="p-5 text-center border-r border-slate-200/50" style="background: ${h[t]}10; color: ${h[t]}">
          <div class="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
            ${y[t]} ${A[t]}
          </div>
          <div class="text-[9px] font-bold opacity-70 mt-0.5">ESCALA BASE 100</div>
        </th>
      `)}),r+=`
        <th colspan="2" class="p-5 text-center text-xs font-black text-slate-900 border-l-4 border-slate-900 bg-slate-50 uppercase tracking-widest">Resumen Final</th>
      </tr>
      <tr class="bg-slate-50/30">
  `,n.forEach(t=>{a[t].forEach((e,p)=>{r+=`
        <th class="p-3 text-center min-w-[100px] border-r border-slate-200/40">
          <div class="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[80px] mx-auto" title="${e.name}">${e.name}</div>
          <div class="text-[9px] font-medium text-slate-400 mt-0.5">/${f(e.pts)}pt</div>
        </th>
      `}),a[t].length>0&&(r+='<th class="p-3 text-center bg-white/50 border-r border-slate-200 font-black text-[11px] text-slate-900">Total B</th>')}),r+=`
        <th class="p-4 text-center border-l-4 border-slate-900 font-black text-xs text-slate-900">Promedio</th>
        <th class="p-4 text-center border-r border-slate-100 font-black text-xs text-slate-900">% Final</th>
      </tr>
    </thead>
  `;let l='<tbody class="bg-white divide-y divide-slate-50">';c.forEach(t=>{l+=`
      <tr class="hover:bg-blue-50/20 transition-all group/row">
        <td class="sticky left-0 z-20 bg-white group-hover/row:bg-slate-50 p-4 font-bold text-slate-800 border-r-2 border-slate-100 whitespace-nowrap shadow-[4px_0_10px_-4px_rgba(0,0,0,0.02)]">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/row:bg-blue-100 group-hover/row:text-blue-600 transition-colors uppercase">
               ${t.nombre.charAt(0)}${t.apellido.charAt(0)}
             </div>
             ${t.nombre} ${t.apellido}
          </div>
        </td>
    `;const e=[];n.forEach(o=>{if(a[o].forEach(s=>{const d=(x.notas[t.id]||{})[s.id],i=d===0||!!d,b=i?$(d,s.pts):"",v=b.includes("p-green")?"bg-emerald-500":b.includes("p-amber")?"bg-amber-500":b.includes("p-rose")?"bg-rose-500":"bg-slate-200";l+=`
          <td class="p-3 text-center cursor-not-allowed">
            <div class="relative inline-block px-2 py-1 rounded-lg ${i?"bg-slate-50 font-bold text-slate-900":"text-slate-300"}" title="Evaluado vía Panel de Actividades">
               ${i?f(d):'<span class="opacity-30">---</span>'}
               ${i?`<div class="absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-white ${v}"></div>`:""}
            </div>
          </td>
        `}),a[o].length>0){const s=E(t.id,o);e.push(typeof s=="number"?s:0),l+=`<td class="p-3 text-center bg-slate-50/50 font-black text-sm text-slate-900 border-r border-slate-200/60" style="color: ${h[o]}">${s}</td>`}});const p=e.length?Math.round(e.reduce((o,s)=>o+s,0)/e.length):0;l+=`
      <td class="p-4 text-center font-black text-lg text-slate-900 bg-slate-50 border-l-4 border-slate-900/10">
        ${p}
      </td>
      <td class="p-4 text-center font-black text-lg text-blue-600 bg-blue-50/30">
        ${p}%
      </td>
    </tr>`}),l+="</tbody>",u.innerHTML=`
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
            ${r}
            ${l}
          </table>
        </div>
        
        <div class="p-6 bg-slate-50/30 border-t border-slate-50">
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Desliza hacia la derecha para ver todos los bloques y promedios finales</p>
        </div>
      </div>
    </div>
  `}function B(){window.RENDERS||(window.RENDERS={}),window.RENDERS.matriz=renderMatrixPanel}export{B as inicializar,z as renderizarMatrixPanel};
