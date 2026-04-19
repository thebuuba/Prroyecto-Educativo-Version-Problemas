import{s as k,S as b,D as v,c as $,B as c,r as f,E as y,z as E,v as h,C as z,d as C,w as A,x as R}from"./main-C6L_ZSjG.js";function g(){return`
    <header class="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div class="flex items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Matriz General Consolidada</h1>
          <p class="text-slate-500 mt-1">Resumen del progreso académico por bloque y promedios finales.</p>
        </div>
        <div class="hidden md:flex flex-col items-end">
           <div class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">${z(b.activeGroupId)}</div>
           <div class="text-sm font-bold text-blue-600">${C()}</div>
        </div>
      </div>
    </header>
  `}function j(d){return`
    <div class="py-20 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm animate-in zoom-in-95 duration-500">
      <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
      </div>
      <h4 class="text-2xl font-bold text-slate-800 mb-3">Matriz en blanco</h4>
      <p class="text-slate-500 mb-8 max-w-sm mx-auto">
        ${d.length===0?"Comienza registrando a tus estudiantes para ver sus calificaciones consolidadas.":"Define actividades en los bloques para generar esta matriz."}
      </p>
      <div class="flex items-center justify-center gap-4">
        ${d.length===0?`<button onclick="window.go('estudiantes')" class="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Registrar Estudiantes</button>`:""}
        ${v()===0?`<button onclick="window.go('config')" class="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">Configurar Actividades</button>`:""}
      </div>
    </div>
  `}function B(d){const p=k(b.activeGroupId);if(p.length===0||v()===0){d.innerHTML=`
      <div class="max-w-[1240px] mx-auto p-6 md:p-10">
        ${g()}
        ${j(p)}
      </div>
    `;return}const m=$(b.activeGroupId),a={};c.forEach(t=>a[t]=m[t].activities);let l=`
    <thead class="bg-white border-b border-slate-200">
      <tr>
        <th rowspan="2" class="sticky left-0 z-30 bg-white p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-r-2 border-slate-100">Estudiante</th>
  `;c.forEach(t=>{const e=a[t].length;e>0&&(l+=`
        <th colspan="${e+1}" class="p-5 text-center border-r border-slate-200/50" style="background: ${h[t]}10; color: ${h[t]}">
          <div class="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
            ${A[t]} ${R[t]}
          </div>
          <div class="text-[9px] font-bold opacity-70 mt-0.5">ESCALA BASE 100</div>
        </th>
      `)}),l+=`
        <th colspan="2" class="p-5 text-center text-xs font-black text-slate-900 border-l-4 border-slate-900 bg-slate-50 uppercase tracking-widest">Resumen Final</th>
      </tr>
      <tr class="bg-slate-50/30">
  `,c.forEach(t=>{a[t].forEach((e,x)=>{l+=`
        <th class="p-3 text-center min-w-[100px] border-r border-slate-200/40">
          <div class="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[80px] mx-auto" title="${e.name}">${e.name}</div>
          <div class="text-[9px] font-medium text-slate-400 mt-0.5">/${f(e.pts)}pt</div>
        </th>
      `}),a[t].length>0&&(l+='<th class="p-3 text-center bg-white/50 border-r border-slate-200 font-black text-[11px] text-slate-900">Total B</th>')}),l+=`
        <th class="p-4 text-center border-l-4 border-slate-900 font-black text-xs text-slate-900">Promedio</th>
        <th class="p-4 text-center border-r border-slate-100 font-black text-xs text-slate-900">% Final</th>
      </tr>
    </thead>
  `;let r='<tbody class="bg-white divide-y divide-slate-50">';p.forEach(t=>{r+=`
      <tr class="hover:bg-blue-50/20 transition-all group/row">
        <td class="sticky left-0 z-20 bg-white group-hover/row:bg-slate-50 p-4 font-bold text-slate-800 border-r-2 border-slate-100 whitespace-nowrap shadow-[4px_0_10px_-4px_rgba(0,0,0,0.02)]">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/row:bg-blue-100 group-hover/row:text-blue-600 transition-colors uppercase">
               ${t.nombre.charAt(0)}${t.apellido.charAt(0)}
             </div>
             ${t.nombre} ${t.apellido}
          </div>
        </td>
    `;const e=[];c.forEach(o=>{if(a[o].forEach(s=>{const i=(b.notas[t.id]||{})[s.id],n=i===0||!!i,u=n?y(i,s.pts):"",w=u.includes("p-green")?"bg-emerald-500":u.includes("p-amber")?"bg-amber-500":u.includes("p-rose")?"bg-rose-500":"bg-slate-200";r+=`
          <td class="p-3 text-center cursor-not-allowed">
            <div class="relative inline-block px-2 py-1 rounded-lg ${n?"bg-slate-50 font-bold text-slate-900":"text-slate-300"}" title="Evaluado vía Panel de Actividades">
               ${n?f(i):'<span class="opacity-30">---</span>'}
               ${n?`<div class="absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-white ${w}"></div>`:""}
            </div>
          </td>
        `}),a[o].length>0){const s=E(t.id,o);e.push(typeof s=="number"?s:0),r+=`<td class="p-3 text-center bg-slate-50/50 font-black text-sm text-slate-900 border-r border-slate-200/60" style="color: ${h[o]}">${s}</td>`}});const x=e.length?Math.round(e.reduce((o,s)=>o+s,0)/e.length):0;r+=`
      <td class="p-4 text-center font-black text-lg text-slate-900 bg-slate-50 border-l-4 border-slate-900/10">
        ${x}
      </td>
      <td class="p-4 text-center font-black text-lg text-blue-600 bg-blue-50/30">
        ${x}%
      </td>
    </tr>`}),r+="</tbody>",d.innerHTML=`
    <div class="max-w-full mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      ${g()}
      
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
            ${l}
            ${r}
          </table>
        </div>
        
        <div class="p-6 bg-slate-50/30 border-t border-slate-50">
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Desliza hacia la derecha para ver todos los bloques y promedios finales</p>
        </div>
      </div>
    </div>
  `}function S(){window.RENDERS||(window.RENDERS={}),window.RENDERS.matriz=B}export{S as init,B as renderMatrixPanel};
