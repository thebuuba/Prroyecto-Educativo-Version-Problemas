import{S as i,p as u,g as m,c as v,m as I,u as z,A as H,o as j,q as B,r as k,v as h,w as $,x as y,y as E,s as V,B as p,z as N,k as S,d as P,C as R}from"./main-BIxmY14D.js";function T(){window.setActView=t=>{i.activityViewMode=["blocks","matrix","config"].includes(t)?t:"blocks",u(),m("actividades")},window.updateBlockMeta=(t,a)=>{const s=parseFloat(a)||100;v(i.activeGroupId)[t].meta=s,u(),m("actividades")},window.handleActNameInput=(t,a,s)=>{const o=I(a);o&&(o.activity.name=s.value),u()},window.updateActPts=(t,a,s)=>{const o=parseFloat(s)||0,l=I(a);l&&(l.activity.pts=o),u()},window.addActToBlock=t=>{const a=v(i.activeGroupId)[t].activities;a.push({id:z(),name:`Actividad ${a.length+1}`,pts:20,courseId:i.activeGroupId,periodId:i.activePeriodId,instrumentId:null,instrumentIds:[],instrumentHistory:[]}),u(),m("actividades")},window.removeActFromBlock=(t,a)=>{const s=v(i.activeGroupId)[t];s.activities=s.activities.filter(o=>o.id!==a),i.evaluations=i.evaluations.filter(o=>!(o.activityId===a&&(o.periodId||"P1")===i.activePeriodId)),u(),m("actividades")},window.autoAdjustBlock=t=>{const a=v(i.activeGroupId)[t],s=a.activities;if(!s.length)return;const o=a.meta||100,l=Math.floor(o/s.length),e=o%s.length;s.forEach((n,r)=>{n.pts=l+(r<e?1:0)}),u(),m("actividades")}}function C(){return i.activityViewMode||H}function F(){const t=C();return`
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Actividades y Evaluación</h1>
        <p class="text-slate-500 mt-1">Sigue el progreso de tus estudiantes por competencias.</p>
      </div>
      <div class="flex p-1 bg-slate-100 rounded-2xl shrink-0">
        <button onclick="setActView('blocks')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${t==="blocks"?"bg-white text-blue-600 shadow-sm":"text-slate-500 hover:text-slate-700"}">
          Bloques
        </button>
        <button onclick="setActView('matrix')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${t==="matrix"?"bg-white text-blue-600 shadow-sm":"text-slate-500 hover:text-slate-700"}">
          Matriz
        </button>
        <button onclick="setActView('config')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${t==="config"?"bg-white text-blue-600 shadow-sm":"text-slate-500 hover:text-slate-700"}">
          Configuración
        </button>
      </div>
    </header>
  `}function L(t,a,s,o){const l=j(t),e=B(t),n=h[t]||"var(--blue)",r=$[t]||"📄",c=y[t]||t,x=e>0?Math.min(l/e*100,100):0;let b="";return a.length===0?b=`
      <div class="flex flex-col items-center justify-center py-10 text-center">
        <div class="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <p class="text-sm text-slate-400">Sin actividades</p>
      </div>
    `:b=a.map((d,g)=>{const w=o.map(f=>(i.notas[f.id]||{})[d.id]).filter(f=>f!==void 0),A=w.length?E(w.reduce((f,G)=>f+G,0)/w.length):null,M=d.instrumentId;return`
        <div class="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group/row">
          <div class="w-6 text-xs font-bold text-slate-300">${g+1}</div>
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-slate-800 truncate">${d.name}</h5>
            <div class="flex items-center gap-3 mt-1">
               <span class="text-[10px] uppercase font-bold tracking-wider ${M?"text-emerald-500":"text-slate-400"}">
                 ${M?"✓ Vinculado":"⚠ Sin instrumento"}
               </span>
               <span class="text-[10px] font-medium text-slate-400">
                 Promedio: ${A!==null?`${A}/${d.pts}`:"---"}
               </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.openApplyInstrumentModal('${d.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Evaluar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <div class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold min-w-[45px] text-center">
              ${d.pts}
            </div>
          </div>
        </div>
      `}).join(""),`
    <div class="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <div class="p-6 border-b border-slate-50">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner" style="background: ${n}20">
              ${r}
            </div>
            <div>
              <h3 class="font-bold text-slate-900 line-clamp-1">${c}</h3>
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">${t}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-slate-900">${l}/${e}</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puntos</div>
          </div>
        </div>
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-1000" style="width: ${x}%; background: ${n}"></div>
        </div>
      </div>
      <div class="p-6 bg-slate-50/30">
        <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          ${b}
        </div>
      </div>
    </div>
  `}function O(){const t=v(i.activeGroupId),a=V(i.activeGroupId);return`
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      ${p.map(s=>L(s,t[s].activities,t[s],a)).join("")}
    </div>
  `}function D(){const t=V(i.activeGroupId);if(t.length===0)return`
      <div class="py-20 text-center bg-white border border-slate-200 rounded-[2rem]">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <h4 class="text-xl font-bold text-slate-800 mb-2">No hay estudiantes</h4>
        <p class="text-slate-500 mb-6">Registra estudiantes para visualizar la matriz de evaluación.</p>
        <button onclick="go('estudiantes')" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold">Ir a Estudiantes</button>
      </div>
    `;const a=v(i.activeGroupId),s={};p.forEach(e=>s[e]=a[e].activities);let o=`
    <thead class="bg-slate-50 border-b border-slate-200">
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Estudiante</th>
  `;p.forEach(e=>{const n=s[e].length;n>0&&(o+=`
        <th colspan="${n+1}" class="p-4 text-center border-r border-slate-200" style="background: ${h[e]}10; color: ${h[e]}">
          <div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            ${$[e]} ${y[e]}
          </div>
        </th>
      `)}),o+=`
        <th class="p-6 text-center text-xs font-bold text-slate-900 border-l-2 border-slate-900 bg-slate-100">Total Final</th>
      </tr>
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-4 border-r border-slate-200"></th>
  `,p.forEach(e=>{s[e].forEach((n,r)=>{o+=`
        <th class="p-3 text-center min-w-[100px] border-r border-slate-200/50">
          <div class="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px] mx-auto" title="${n.name}">${n.name}</div>
          <div class="text-[9px] font-medium text-slate-400 mt-0.5">/${n.pts}</div>
        </th>
      `}),s[e].length>0&&(o+='<th class="p-3 text-center bg-slate-100/50 border-r border-slate-200 font-bold text-xs">Nota</th>')}),o+='<th class="p-4 border-l-2 border-slate-900"></th></tr></thead>';let l='<tbody class="bg-white divide-y divide-slate-100">';return t.forEach(e=>{l+=`
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
          ${e.nombre} ${e.apellido}
        </td>
    `,p.forEach(n=>{s[n].forEach(r=>{const c=(i.notas[e.id]||{})[r.id],x=c===0||!!c;l+=`
          <td class="p-3 text-center cursor-pointer hover:bg-blue-50 transition-colors" onclick="window.openApplyInstrumentModal('${r.id}', '${e.id}')">
            <span class="text-sm ${x?"font-bold text-slate-900":"text-slate-300"}">${x?c:"?"}</span>
          </td>
        `}),s[n].length>0&&(l+=`<td class="p-3 text-center bg-slate-50/30 font-bold text-slate-900 border-r border-slate-200">${N(e.id,n)}</td>`)}),l+=`<td class="p-4 text-center font-black text-blue-600 bg-blue-50/30 border-l-2 border-slate-900">${S(e.id,i.activeGroupId)??"---"}</td></tr>`}),l+="</tbody>",`
    <div class="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div class="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h4 class="font-bold text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z"></path></svg>
          Matriz Operativa ${P()}
        </h4>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${R(i.activeGroupId)}</div>
      </div>
      <div class="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <table class="w-full border-collapse">
          ${o}
          ${l}
        </table>
      </div>
    </div>
  `}function q(){return`
    <div class="max-w-[1600px] mx-auto animate-in slide-in-from-bottom-4 duration-500">
       <div class="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 mb-10 overflow-hidden relative">
          <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-2">Configuración de Evaluación</h3>
            <p class="text-blue-100 max-w-md">Ajusta los puntos meta por competencia y normaliza los resultados automáticamente.</p>
          </div>
          <div class="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
       </div>
       
       <div id="cfg-blocks-container" class="space-y-8">
         ${p.map(t=>_(t)).join("")}
       </div>
    </div>
  `}function _(t){const s=v(i.activeGroupId)[t].activities,o=j(t),l=B(t),e=E(o-l),n=h[t]||"var(--blue)",r=$[t]||"📄",c=y[t]||t,x=e===0?"text-emerald-500 bg-emerald-50":e>0?"text-rose-500 bg-rose-50":"text-amber-500 bg-amber-50",b=e===0?"Total coincide con la meta":e>0?`Sobran ${k(e)} pts`:`Faltan ${k(Math.abs(e))} pts`;return`
    <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: ${n}15; color: ${n}">
            ${r}
          </div>
          <div>
            <h4 class="font-bold text-slate-900">${c}</h4>
            <div class="flex items-center gap-2 mt-0.5">
               <span class="text-[10px] font-bold text-slate-400">PUNTOS META:</span>
               <input type="number" value="${l}" onchange="window.updateBlockMeta('${t}', this.value)" class="w-12 text-[10px] font-black text-blue-600 bg-blue-50 border-none rounded-md px-1 py-0.5 text-center focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
           <button onclick="window.addActToBlock('${t}')" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
             + Actividad
           </button>
           <button onclick="window.autoAdjustBlock('${t}')" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
             Autoajustar
           </button>
        </div>
      </div>

      <div class="space-y-4 mb-8">
        ${s.map((d,g)=>`
          <div class="flex items-center gap-4 animate-in fade-in duration-300">
            <div class="w-6 text-[10px] font-black text-slate-300">${g+1}</div>
            <input type="text" value="${d.name}" oninput="window.handleActNameInput('${t}', '${d.id}', this)" placeholder="Nombre actividad..." class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none">
            <div class="flex items-center gap-2 w-[100px]">
              <input type="number" value="${d.pts}" oninput="window.updateActPts('${t}', '${d.id}', this.value)" class="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-blue-500 transition-all outline-none">
              <span class="text-[10px] font-bold text-slate-400">pts</span>
            </div>
            <button onclick="window.removeActFromBlock('${t}', '${d.id}')" class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        `).join("")}
      </div>

      <div class="pt-8 border-t border-slate-50">
        <div class="flex items-center justify-between mb-4">
           <span class="text-sm font-bold text-slate-800">Progreso del Bloque</span>
           <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${x}">
             ${b}
           </span>
        </div>
        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
           <div class="h-full transition-all duration-700" style="width: ${Math.min(o/l*100,100)}%; background: ${n}"></div>
        </div>
        <div class="flex justify-between mt-3">
           <span class="text-xs font-bold text-slate-400">${k(o)} registrados</span>
           <span class="text-xs font-bold text-slate-900">${l} meta</span>
        </div>
      </div>
    </div>
  `}function U(t){const a=C();t.innerHTML=`
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-500">
      ${F()}
      <div id="act-content-area">
        ${a==="blocks"?O():""}
        ${a==="matrix"?D():""}
        ${a==="config"?q():""}
      </div>
    </div>
  `}function W(){T(),window.RENDERS||(window.RENDERS={}),window.RENDERS.actividades=U}export{C as getActViewMode,W as init,_ as renderActivitiesConfigBlock,U as renderActivitiesPanel};
