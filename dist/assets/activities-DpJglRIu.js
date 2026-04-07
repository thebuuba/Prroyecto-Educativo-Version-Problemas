import{S as a,A as G,g as u,b as M,a as I,f as w,B as g,c as $,d as k,r as j,s as B,e as p,h as z,i as H,p as N,j as P,k as v,l as S,m as E,u as T}from"./main-Dd9jDrfc.js";function C(){return a.activityViewMode||G}window.setActView=t=>{a.activityViewMode=["blocks","matrix","config"].includes(t)?t:"blocks",v(),S("actividades")};function F(){const t=C();return`
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Actividades y Evaluación</h1>
        <p class="text-slate-500 mt-1">Sigue el progreso de tus estudiantes por competencias.</p>
      </div>
      <div class="flex p-1 bg-slate-100 rounded-2xl shrink-0">
        <button onclick="setActView('blocks')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${t==="blocks"?"bg-white text-indigo-600 shadow-sm":"text-slate-500 hover:text-slate-700"}">
          Bloques
        </button>
        <button onclick="setActView('matrix')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${t==="matrix"?"bg-white text-indigo-600 shadow-sm":"text-slate-500 hover:text-slate-700"}">
          Matriz
        </button>
        <button onclick="setActView('config')" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${t==="config"?"bg-white text-indigo-600 shadow-sm":"text-slate-500 hover:text-slate-700"}">
          Configuración
        </button>
      </div>
    </header>
  `}function L(t,o,s,i){const n=M(t),e=I(t),d=g[t]||"var(--indigo)",r=$[t]||"📄",c=k[t]||t,x=e>0?Math.min(n/e*100,100):0;let f="";return o.length===0?f=`
      <div class="flex flex-col items-center justify-center py-10 text-center">
        <div class="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <p class="text-sm text-slate-400">Sin actividades</p>
      </div>
    `:f=o.map((l,m)=>{const h=i.map(b=>(a.notas[b.id]||{})[l.id]).filter(b=>b!==void 0),y=h.length?j(h.reduce((b,V)=>b+V,0)/h.length):null,A=l.instrumentId;return`
        <div class="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group/row">
          <div class="w-6 text-xs font-bold text-slate-300">${m+1}</div>
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-slate-800 truncate">${l.name}</h5>
            <div class="flex items-center gap-3 mt-1">
               <span class="text-[10px] uppercase font-bold tracking-wider ${A?"text-emerald-500":"text-slate-400"}">
                 ${A?"✓ Vinculado":"⚠ Sin instrumento"}
               </span>
               <span class="text-[10px] font-medium text-slate-400">
                 Promedio: ${y!==null?`${y}/${l.pts}`:"---"}
               </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.openApplyInstrumentModal('${l.id}')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Evaluar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <div class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold min-w-[45px] text-center">
              ${l.pts}
            </div>
          </div>
        </div>
      `}).join(""),`
    <div class="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <div class="p-6 border-b border-slate-50">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner" style="background: ${d}20">
              ${r}
            </div>
            <div>
              <h3 class="font-bold text-slate-900 line-clamp-1">${c}</h3>
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">${t}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-slate-900">${n}/${e}</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puntos</div>
          </div>
        </div>
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-1000" style="width: ${x}%; background: ${d}"></div>
        </div>
      </div>
      <div class="p-6 bg-slate-50/30">
        <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          ${f}
        </div>
      </div>
    </div>
  `}function O(){const t=u(a.activeGroupId),o=B(a.activeGroupId);return`
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      ${p.map(s=>L(s,t[s].activities,t[s],o)).join("")}
    </div>
  `}function R(){const t=B(a.activeGroupId);if(t.length===0)return`
      <div class="py-20 text-center bg-white border border-slate-200 rounded-[2rem]">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <h4 class="text-xl font-bold text-slate-800 mb-2">No hay estudiantes</h4>
        <p class="text-slate-500 mb-6">Registra estudiantes para visualizar la matriz de evaluación.</p>
        <button onclick="go('estudiantes')" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Ir a Estudiantes</button>
      </div>
    `;const o=u(a.activeGroupId),s={};p.forEach(e=>s[e]=o[e].activities);let i=`
    <thead class="bg-slate-50 border-b border-slate-200">
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Estudiante</th>
  `;p.forEach(e=>{const d=s[e].length;d>0&&(i+=`
        <th colspan="${d+1}" class="p-4 text-center border-r border-slate-200" style="background: ${g[e]}10; color: ${g[e]}">
          <div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            ${$[e]} ${k[e]}
          </div>
        </th>
      `)}),i+=`
        <th class="p-6 text-center text-xs font-bold text-slate-900 border-l-2 border-slate-900 bg-slate-100">Total Final</th>
      </tr>
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-4 border-r border-slate-200"></th>
  `,p.forEach(e=>{s[e].forEach((d,r)=>{i+=`
        <th class="p-3 text-center min-w-[100px] border-r border-slate-200/50">
          <div class="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px] mx-auto" title="${d.name}">${d.name}</div>
          <div class="text-[9px] font-medium text-slate-400 mt-0.5">/${d.pts}</div>
        </th>
      `}),s[e].length>0&&(i+='<th class="p-3 text-center bg-slate-100/50 border-r border-slate-200 font-bold text-xs">Nota</th>')}),i+='<th class="p-4 border-l-2 border-slate-900"></th></tr></thead>';let n='<tbody class="bg-white divide-y divide-slate-100">';return t.forEach(e=>{n+=`
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
          ${e.nombre} ${e.apellido}
        </td>
    `,p.forEach(d=>{s[d].forEach(r=>{const c=(a.notas[e.id]||{})[r.id],x=c===0||!!c;n+=`
          <td class="p-3 text-center cursor-pointer hover:bg-indigo-50 transition-colors" onclick="window.openApplyInstrumentModal('${r.id}', '${e.id}')">
            <span class="text-sm ${x?"font-bold text-slate-900":"text-slate-300"}">${x?c:"?"}</span>
          </td>
        `}),s[d].length>0&&(n+=`<td class="p-3 text-center bg-slate-50/30 font-bold text-slate-900 border-r border-slate-200">${z(e.id,d)}</td>`)}),n+=`<td class="p-4 text-center font-black text-indigo-600 bg-indigo-50/30 border-l-2 border-slate-900">${H(e.id,a.activeGroupId)??"---"}</td></tr>`}),n+="</tbody>",`
    <div class="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div class="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h4 class="font-bold text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z"></path></svg>
          Matriz Operativa ${N()}
        </h4>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${P(a.activeGroupId)}</div>
      </div>
      <div class="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <table class="w-full border-collapse">
          ${i}
          ${n}
        </table>
      </div>
    </div>
  `}function D(){return`
    <div class="max-w-[800px] mx-auto animate-in slide-in-from-bottom-4 duration-500">
       <div class="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 mb-10 overflow-hidden relative">
          <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-2">Configuración de Evaluación</h3>
            <p class="text-indigo-100 max-w-md">Ajusta los puntos meta por competencia y normaliza los resultados automáticamente.</p>
          </div>
          <div class="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
       </div>
       
       <div id="cfg-blocks-container" class="space-y-8">
         ${p.map(t=>_(t)).join("")}
       </div>
    </div>
  `}function _(t){const s=u(a.activeGroupId)[t].activities,i=M(t),n=I(t),e=j(i-n),d=g[t]||"var(--indigo)",r=$[t]||"📄",c=k[t]||t,x=e===0?"text-emerald-500 bg-emerald-50":e>0?"text-rose-500 bg-rose-50":"text-amber-500 bg-amber-50",f=e===0?"Total coincide con la meta":e>0?`Sobran ${w(e)} pts`:`Faltan ${w(Math.abs(e))} pts`;return`
    <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: ${d}15; color: ${d}">
            ${r}
          </div>
          <div>
            <h4 class="font-bold text-slate-900">${c}</h4>
            <div class="flex items-center gap-2 mt-0.5">
               <span class="text-[10px] font-bold text-slate-400">PUNTOS META:</span>
               <input type="number" value="${n}" onchange="window.updateBlockMeta('${t}', this.value)" class="w-12 text-[10px] font-black text-indigo-600 bg-indigo-50 border-none rounded-md px-1 py-0.5 text-center focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
           <button onclick="window.addActToBlock('${t}')" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
             + Actividad
           </button>
           <button onclick="window.autoAdjustBlock('${t}')" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
             Autoajustar
           </button>
        </div>
      </div>

      <div class="space-y-4 mb-8">
        ${s.map((l,m)=>`
          <div class="flex items-center gap-4 animate-in fade-in duration-300">
            <div class="w-6 text-[10px] font-black text-slate-300">${m+1}</div>
            <input type="text" value="${l.name}" oninput="window.handleActNameInput('${t}', '${l.id}', this)" placeholder="Nombre actividad..." class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none">
            <div class="flex items-center gap-2 w-[100px]">
              <input type="number" value="${l.pts}" oninput="window.updateActPts('${t}', '${l.id}', this.value)" class="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
              <span class="text-[10px] font-bold text-slate-400">pts</span>
            </div>
            <button onclick="window.removeActFromBlock('${t}', '${l.id}')" class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        `).join("")}
      </div>

      <div class="pt-8 border-t border-slate-50">
        <div class="flex items-center justify-between mb-4">
           <span class="text-sm font-bold text-slate-800">Progreso del Bloque</span>
           <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${x}">
             ${f}
           </span>
        </div>
        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
           <div class="h-full transition-all duration-700" style="width: ${Math.min(i/n*100,100)}%; background: ${d}"></div>
        </div>
        <div class="flex justify-between mt-3">
           <span class="text-xs font-bold text-slate-400">${w(i)} registrados</span>
           <span class="text-xs font-bold text-slate-900">${n} meta</span>
        </div>
      </div>
    </div>
  `}window.updateBlockMeta=(t,o)=>{const s=parseFloat(o)||100;u(a.activeGroupId)[t].meta=s,v(),window.go("actividades")};window.handleActNameInput=(t,o,s)=>{const i=E(o);i&&(i.activity.name=s.value),v()};window.updateActPts=(t,o,s)=>{const i=parseFloat(s)||0,n=E(o);n&&(n.activity.pts=i),v()};window.addActToBlock=t=>{const o=u(a.activeGroupId)[t].activities;o.push({id:T(),name:`Actividad ${o.length+1}`,pts:20,courseId:a.activeGroupId,periodId:a.activePeriodId,instrumentId:null,instrumentIds:[],instrumentHistory:[]}),v(),window.go("actividades")};window.removeActFromBlock=(t,o)=>{const s=u(a.activeGroupId)[t];s.activities=s.activities.filter(i=>i.id!==o),a.evaluations=a.evaluations.filter(i=>!(i.activityId===o&&(i.periodId||"P1")===a.activePeriodId)),v(),window.go("actividades")};window.autoAdjustBlock=t=>{const o=u(a.activeGroupId)[t],s=o.activities;if(!s.length)return;const i=o.meta||100,n=Math.floor(i/s.length),e=i%s.length;s.forEach((d,r)=>{d.pts=n+(r<e?1:0)}),v(),window.go("actividades")};function q(t){const o=C();t.innerHTML=`
    <div class="max-w-[1240px] mx-auto p-6 md:p-10 animate-in fade-in duration-500">
      ${F()}
      <div id="act-content-area">
        ${o==="blocks"?O():""}
        ${o==="matrix"?R():""}
        ${o==="config"?D():""}
      </div>
    </div>
  `}window.RENDERS.actividades=q;export{C as getActViewMode,_ as renderActivitiesConfigBlock,q as renderActivitiesPanel};
