import{S as l,p as u,g as m,c as p,m as E,u as z,A as N,o as M,q as S,r as k,v as h,w as $,x as A,y as q,s as j,B as x,z as P,k as V,d as H,C as R}from"./main-BqMwzFXj.js";async function w(t,o={}){var i,n;if(!t||!((n=(i=window.AulaBaseSqlApi)==null?void 0:i.isEnabled)!=null&&n.call(i))||typeof window.AulaBaseSqlApi.syncSqlActivityCreateOrUpdate!="function")return null;const a={...t,id:t.sqlId||t.id},e=await window.AulaBaseSqlApi.syncSqlActivityCreateOrUpdate(a,o),s=String((e==null?void 0:e.id)||"").trim();return s&&(t.sqlId=s),e}async function O(t,o={}){var e,s;if(!((s=(e=window.AulaBaseSqlApi)==null?void 0:e.isEnabled)!=null&&s.call(e)))return;const a=typeof window.AulaBaseSqlApi.ensureSqlAcademicContext=="function"?await window.AulaBaseSqlApi.ensureSqlAcademicContext():null;a!=null&&a.schoolId&&(typeof window.AulaBaseSqlApi.syncSqlActivityDelete=="function"?await window.AulaBaseSqlApi.syncSqlActivityDelete(t):typeof window.AulaBaseSqlApi.deleteActivity=="function"&&await window.AulaBaseSqlApi.deleteActivity(t,{schoolId:a.schoolId}),typeof window.AulaBaseSqlApi.deleteEvaluations=="function"&&await window.AulaBaseSqlApi.deleteEvaluations({schoolId:a.schoolId,sectionId:o.sectionId||l.activeGroupId||"",periodId:o.periodId||l.activePeriodId||"P1",activityId:t}))}function T(){window.setActView=t=>{l.activityViewMode=["blocks","matrix","config"].includes(t)?t:"blocks",u(),m("actividades")},window.updateBlockMeta=(t,o)=>{const a=parseFloat(o)||100;p(l.activeGroupId)[t].meta=a,u(),m("actividades")},window.handleActNameInput=async(t,o,a)=>{const e=E(o);e&&(e.activity.name=a.value),u(),e!=null&&e.activity&&await w(e.activity,{sectionId:l.activeGroupId,periodId:l.activePeriodId,blockKey:e.block||t}).catch(s=>{console.warn("[EduGest][sql] No se pudo sincronizar el nombre de la actividad",s)})},window.updateActPts=async(t,o,a)=>{const e=parseFloat(a)||0,s=E(o);s&&(s.activity.pts=e),u(),s!=null&&s.activity&&await w(s.activity,{sectionId:l.activeGroupId,periodId:l.activePeriodId,blockKey:s.block||t}).catch(i=>{console.warn("[EduGest][sql] No se pudo sincronizar los puntos de la actividad",i)})},window.addActToBlock=async t=>{const o=p(l.activeGroupId)[t].activities,a={id:z(),name:`Actividad ${o.length+1}`,pts:20,courseId:l.activeGroupId,periodId:l.activePeriodId,instrumentId:null,instrumentIds:[],instrumentHistory:[]};o.push(a),u(),await w(a,{sectionId:l.activeGroupId,periodId:l.activePeriodId,blockKey:t}).catch(e=>{console.warn("[EduGest][sql] No se pudo sincronizar la actividad creada",e)}),m("actividades")},window.removeActFromBlock=async(t,o)=>{const a=p(l.activeGroupId)[t],e=a.activities.find(s=>s.id===o);a.activities=a.activities.filter(s=>s.id!==o),l.evaluations=l.evaluations.filter(s=>!(s.activityId===o&&(s.periodId||"P1")===l.activePeriodId)),u(),await O((e==null?void 0:e.sqlId)||o,{sectionId:l.activeGroupId,periodId:l.activePeriodId}).catch(s=>{console.warn("[EduGest][sql] No se pudo sincronizar la eliminación de la actividad",s)}),m("actividades")},window.autoAdjustBlock=t=>{const o=p(l.activeGroupId)[t],a=o.activities;if(!a.length)return;const e=o.meta||100,s=Math.floor(e/a.length),i=e%a.length;a.forEach((n,r)=>{n.pts=s+(r<i?1:0)}),u(),Promise.all(a.map(n=>w(n,{sectionId:l.activeGroupId,periodId:l.activePeriodId,blockKey:t}))).catch(n=>{console.warn("[EduGest][sql] No se pudo sincronizar el ajuste automático de actividades",n)}),m("actividades")}}function G(){return l.activityViewMode||N}function F(){const t=G();return`
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
  `}function D(t,o,a,e){const s=M(t),i=S(t),n=h[t]||"var(--blue)",r=$[t]||"📄",c=A[t]||t,v=i>0?Math.min(s/i*100,100):0;let b="";return o.length===0?b=`
      <div class="flex flex-col items-center justify-center py-10 text-center">
        <div class="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <p class="text-sm text-slate-400">Sin actividades</p>
      </div>
    `:b=o.map((d,g)=>{const y=e.map(f=>(l.notas[f.id]||{})[d.id]).filter(f=>f!==void 0),I=y.length?q(y.reduce((f,C)=>f+C,0)/y.length):null,B=d.instrumentId;return`
        <div class="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group/row">
          <div class="w-6 text-xs font-bold text-slate-300">${g+1}</div>
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-slate-800 truncate">${d.name}</h5>
            <div class="flex items-center gap-3 mt-1">
               <span class="text-[10px] uppercase font-bold tracking-wider ${B?"text-emerald-500":"text-slate-400"}">
                 ${B?"✓ Vinculado":"⚠ Sin instrumento"}
               </span>
               <span class="text-[10px] font-medium text-slate-400">
                 Promedio: ${I!==null?`${I}/${d.pts}`:"---"}
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
            <div class="text-lg font-bold text-slate-900">${s}/${i}</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puntos</div>
          </div>
        </div>
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-1000" style="width: ${v}%; background: ${n}"></div>
        </div>
      </div>
      <div class="p-6 bg-slate-50/30">
        <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          ${b}
        </div>
      </div>
    </div>
  `}function L(){const t=p(l.activeGroupId),o=j(l.activeGroupId);return`
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      ${x.map(a=>D(a,t[a].activities,t[a],o)).join("")}
    </div>
  `}function K(){const t=j(l.activeGroupId);if(t.length===0)return`
      <div class="py-20 text-center bg-white border border-slate-200 rounded-[2rem]">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <h4 class="text-xl font-bold text-slate-800 mb-2">No hay estudiantes</h4>
        <p class="text-slate-500 mb-6">Registra estudiantes para visualizar la matriz de evaluación.</p>
        <button onclick="go('estudiantes')" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold">Ir a Estudiantes</button>
      </div>
    `;const o=p(l.activeGroupId),a={};x.forEach(i=>a[i]=o[i].activities);let e=`
    <thead class="bg-slate-50 border-b border-slate-200">
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Estudiante</th>
  `;x.forEach(i=>{const n=a[i].length;n>0&&(e+=`
        <th colspan="${n+1}" class="p-4 text-center border-r border-slate-200" style="background: ${h[i]}10; color: ${h[i]}">
          <div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            ${$[i]} ${A[i]}
          </div>
        </th>
      `)}),e+=`
        <th class="p-6 text-center text-xs font-bold text-slate-900 border-l-2 border-slate-900 bg-slate-100">Total Final</th>
      </tr>
      <tr>
        <th class="sticky left-0 z-20 bg-slate-50 p-4 border-r border-slate-200"></th>
  `,x.forEach(i=>{a[i].forEach((n,r)=>{e+=`
        <th class="p-3 text-center min-w-[100px] border-r border-slate-200/50">
          <div class="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px] mx-auto" title="${n.name}">${n.name}</div>
          <div class="text-[9px] font-medium text-slate-400 mt-0.5">/${n.pts}</div>
        </th>
      `}),a[i].length>0&&(e+='<th class="p-3 text-center bg-slate-100/50 border-r border-slate-200 font-bold text-xs">Nota</th>')}),e+='<th class="p-4 border-l-2 border-slate-900"></th></tr></thead>';let s='<tbody class="bg-white divide-y divide-slate-100">';return t.forEach(i=>{s+=`
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
          ${i.nombre} ${i.apellido}
        </td>
    `,x.forEach(n=>{a[n].forEach(r=>{const c=(l.notas[i.id]||{})[r.id],v=c===0||!!c;s+=`
          <td class="p-3 text-center cursor-pointer hover:bg-blue-50 transition-colors" onclick="window.openApplyInstrumentModal('${r.id}', '${i.id}')">
            <span class="text-sm ${v?"font-bold text-slate-900":"text-slate-300"}">${v?c:"?"}</span>
          </td>
        `}),a[n].length>0&&(s+=`<td class="p-3 text-center bg-slate-50/30 font-bold text-slate-900 border-r border-slate-200">${P(i.id,n)}</td>`)}),s+=`<td class="p-4 text-center font-black text-blue-600 bg-blue-50/30 border-l-2 border-slate-900">${V(i.id,l.activeGroupId)??"---"}</td></tr>`}),s+="</tbody>",`
    <div class="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div class="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h4 class="font-bold text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z"></path></svg>
          Matriz Operativa ${H()}
        </h4>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${R(l.activeGroupId)}</div>
      </div>
      <div class="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <table class="w-full border-collapse">
          ${e}
          ${s}
        </table>
      </div>
    </div>
  `}function U(){return`
    <div class="max-w-[1600px] mx-auto animate-in slide-in-from-bottom-4 duration-500">
       <div class="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 mb-10 overflow-hidden relative">
          <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-2">Configuración de Evaluación</h3>
            <p class="text-blue-100 max-w-md">Ajusta los puntos meta por competencia y normaliza los resultados automáticamente.</p>
          </div>
          <div class="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
       </div>
       
       <div id="cfg-blocks-container" class="space-y-8">
         ${x.map(t=>_(t)).join("")}
       </div>
    </div>
  `}function _(t){const a=p(l.activeGroupId)[t].activities,e=M(t),s=S(t),i=q(e-s),n=h[t]||"var(--blue)",r=$[t]||"📄",c=A[t]||t,v=i===0?"text-emerald-500 bg-emerald-50":i>0?"text-rose-500 bg-rose-50":"text-amber-500 bg-amber-50",b=i===0?"Total coincide con la meta":i>0?`Sobran ${k(i)} pts`:`Faltan ${k(Math.abs(i))} pts`;return`
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
               <input type="number" value="${s}" onchange="window.updateBlockMeta('${t}', this.value)" class="w-12 text-[10px] font-black text-blue-600 bg-blue-50 border-none rounded-md px-1 py-0.5 text-center focus:ring-2 focus:ring-blue-500">
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
        ${a.map((d,g)=>`
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
           <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${v}">
             ${b}
           </span>
        </div>
        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
           <div class="h-full transition-all duration-700" style="width: ${Math.min(e/s*100,100)}%; background: ${n}"></div>
        </div>
        <div class="flex justify-between mt-3">
           <span class="text-xs font-bold text-slate-400">${k(e)} registrados</span>
           <span class="text-xs font-bold text-slate-900">${s} meta</span>
        </div>
      </div>
    </div>
  `}function W(t){const o=G();t.innerHTML=`
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-500">
      ${F()}
      <div id="act-content-area">
        ${o==="blocks"?L():""}
        ${o==="matrix"?K():""}
        ${o==="config"?U():""}
      </div>
    </div>
  `}function Q(){T(),window.RENDERS||(window.RENDERS={}),window.RENDERS.actividades=W}export{G as getActViewMode,Q as init,_ as renderActivitiesConfigBlock,W as renderActivitiesPanel};
