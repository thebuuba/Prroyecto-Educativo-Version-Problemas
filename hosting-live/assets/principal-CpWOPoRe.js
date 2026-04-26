import{S as s,p as c,g as r,h as u,i as f,u as g,A as y,j as h,k as I,l as w,B as k,m as $,n as B,r as q}from"./main-CaBILF-9.js";async function p(t,o={}){var n,d;if(!t||!((d=(n=window.AulaBaseSqlApi)==null?void 0:n.isEnabled)!=null&&d.call(n))||typeof window.AulaBaseSqlApi.syncSqlActivityCreateOrUpdate!="function")return null;const a={...t,id:t.sqlId||t.id},e=await window.AulaBaseSqlApi.syncSqlActivityCreateOrUpdate(a,o),i=String((e==null?void 0:e.id)||"").trim();return i&&(t.sqlId=i),e}async function S(t,o={}){var e,i;if(!((i=(e=window.AulaBaseSqlApi)==null?void 0:e.isEnabled)!=null&&i.call(e)))return;const a=typeof window.AulaBaseSqlApi.ensureSqlAcademicContext=="function"?await window.AulaBaseSqlApi.ensureSqlAcademicContext():null;a!=null&&a.schoolId&&(typeof window.AulaBaseSqlApi.syncSqlActivityDelete=="function"?await window.AulaBaseSqlApi.syncSqlActivityDelete(t):typeof window.AulaBaseSqlApi.deleteActivity=="function"&&await window.AulaBaseSqlApi.deleteActivity(t,{schoolId:a.schoolId}),typeof window.AulaBaseSqlApi.deleteEvaluations=="function"&&await window.AulaBaseSqlApi.deleteEvaluations({schoolId:a.schoolId,sectionId:o.sectionId||s.activeGroupId||"",periodId:o.periodId||s.activePeriodId||"P1",activityId:t}))}function E(){window.setActView=t=>{s.activityViewMode=["blocks","matrix","config"].includes(t)?t:"blocks",c(),r("actividades")},window.updateBlockMeta=(t,o)=>{const a=parseFloat(o)||100;u(s.activeGroupId)[t].meta=a,c(),r("actividades")},window.handleActNameInput=async(t,o,a)=>{const e=f(o);e&&(e.activity.name=a.value),c(),e!=null&&e.activity&&await p(e.activity,{sectionId:s.activeGroupId,periodId:s.activePeriodId,blockKey:e.block||t}).catch(i=>{console.warn("[EduGest][sql] No se pudo sincronizar el nombre de la actividad",i)})},window.updateActPts=async(t,o,a)=>{const e=parseFloat(a)||0,i=f(o);i&&(i.activity.pts=e),c(),i!=null&&i.activity&&await p(i.activity,{sectionId:s.activeGroupId,periodId:s.activePeriodId,blockKey:i.block||t}).catch(n=>{console.warn("[EduGest][sql] No se pudo sincronizar los puntos de la actividad",n)})},window.addActToBlock=async t=>{const o=u(s.activeGroupId)[t].activities,a={id:g(),name:`Actividad ${o.length+1}`,pts:20,courseId:s.activeGroupId,periodId:s.activePeriodId,instrumentId:null,instrumentIds:[],instrumentHistory:[]};o.push(a),c(),await p(a,{sectionId:s.activeGroupId,periodId:s.activePeriodId,blockKey:t}).catch(e=>{console.warn("[EduGest][sql] No se pudo sincronizar la actividad creada",e)}),r("actividades")},window.removeActFromBlock=async(t,o)=>{const a=u(s.activeGroupId)[t],e=a.activities.find(i=>i.id===o);a.activities=a.activities.filter(i=>i.id!==o),s.evaluations=s.evaluations.filter(i=>!(i.activityId===o&&(i.periodId||"P1")===s.activePeriodId)),c(),await S((e==null?void 0:e.sqlId)||o,{sectionId:s.activeGroupId,periodId:s.activePeriodId}).catch(i=>{console.warn("[EduGest][sql] No se pudo sincronizar la eliminación de la actividad",i)}),r("actividades")},window.autoAdjustBlock=t=>{const o=u(s.activeGroupId)[t],a=o.activities;if(!a.length)return;const e=o.meta||100,i=Math.floor(e/a.length),n=e%a.length;a.forEach((d,v)=>{d.pts=i+(v<n?1:0)}),c(),Promise.all(a.map(d=>p(d,{sectionId:s.activeGroupId,periodId:s.activePeriodId,blockKey:t}))).catch(d=>{console.warn("[EduGest][sql] No se pudo sincronizar el ajuste automático de actividades",d)}),r("actividades")}}function G(){return s.activityViewMode||y}function P(t){const a=u(s.activeGroupId)[t].activities,e=h(t),i=I(t),n=q(e-i),d=k[t]||"var(--blue)",v=$[t]||"📄",x=B[t]||t,m=n===0?"text-emerald-500 bg-emerald-50":n>0?"text-rose-500 bg-rose-50":"text-amber-500 bg-amber-50",b=n===0?"Total coincide con la meta":n>0?`Sobran ${w(n)} pts`:`Faltan ${w(Math.abs(n))} pts`;return`
    <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: ${d}15; color: ${d}">
            ${v}
          </div>
          <div>
            <h4 class="font-bold text-slate-900">${x}</h4>
            <div class="flex items-center gap-2 mt-0.5">
               <span class="text-[10px] font-bold text-slate-400">PUNTOS META:</span>
               <input type="number" value="${i}" onchange="window.updateBlockMeta('${t}', this.value)" class="w-12 text-[10px] font-black text-blue-600 bg-blue-50 border-none rounded-md px-1 py-0.5 text-center focus:ring-2 focus:ring-blue-500">
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
        ${a.map((l,A)=>`
          <div class="flex items-center gap-4 animate-in fade-in duration-300">
            <div class="w-6 text-[10px] font-black text-slate-300">${A+1}</div>
            <input type="text" value="${l.name}" oninput="window.handleActNameInput('${t}', '${l.id}', this)" placeholder="Nombre actividad..." class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none">
            <div class="flex items-center gap-2 w-[100px]">
              <input type="number" value="${l.pts}" oninput="window.updateActPts('${t}', '${l.id}', this.value)" class="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-blue-500 transition-all outline-none">
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
           <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${m}">
             ${b}
           </span>
        </div>
        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
           <div class="h-full transition-all duration-700" style="width: ${Math.min(e/i*100,100)}%; background: ${d}"></div>
        </div>
        <div class="flex justify-between mt-3">
           <span class="text-xs font-bold text-slate-400">${w(e)} registrados</span>
           <span class="text-xs font-bold text-slate-900">${i} meta</span>
        </div>
      </div>
    </div>
  `}function N(t){const o=getActViewMode();t.innerHTML=`
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-500">
      ${renderHeader()}
      <div id="act-content-area">
        ${o==="blocks"?renderBlocksView():""}
        ${o==="matrix"?renderMatrixView():""}
        ${o==="config"?renderConfigView():""}
      </div>
    </div>
  `}function V(){E(),window.RENDERS||(window.RENDERS={}),window.RENDERS.actividades=renderActivitiesPanel}export{V as inicializar,G as obtenerActViewMode,P as renderizarActivitiesConfigBlock,N as renderizarActivitiesPanel};
