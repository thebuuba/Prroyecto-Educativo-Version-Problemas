import{c as z,K as R,f as F,Y as V,Z as $,S as a,_ as H,$ as N,a0 as U,g as Y,p as q}from"./main-BFkCmjLr.js";function W(e){const{UI:s,S:t,go:n,persist:r,shiftMonthKey:o,getEffectiveCode:d,getMonthRecord:c,setSlotCode:u,scheduleSqlAttendanceMonthSync:x,ATTENDANCE_V2_CODE_ORDER:b,ATTENDANCE_V2_EXCEPTION_ORDER:f,createSlotMeta:v}=e;window.shiftMonth=l=>{s.attendanceMonthPinned=!0;const i=o(t.attendance.monthKey,l);t.attendance.monthKey=i,r(),n("asistencia")},window.setActiveGroup=l=>{t.activeGroupId=l,r(),n("asistencia")},window.cycleMark=(l,i)=>{const p=t.activeGroupId,h=t.attendance.monthKey,m=d(p,h,l,i),g=b.indexOf(m),w=b[(g+1)%b.length];u(p,h,l,i,w),r(),n("asistencia")},window.commitDayDay=(l,i)=>{const p=t.activeGroupId,h=t.attendance.monthKey,m=c(p,h,!0),g=String(i||"").replace(/\D/g,"").slice(0,2),w=parseInt(g,10);(!g||w>=1&&w<=31)&&(m.slotDays[l]=g,m.visibleCount=Math.max(m.visibleCount||1,l+1),r(),x(p,h),n("asistencia"))},window.cycleException=l=>{var T;const i=t.activeGroupId,p=t.attendance.monthKey,h=c(i,p,!0),m=((T=h.slotMeta[l])==null?void 0:T.type)||"",g=f.indexOf(m),w=f[(g+1)%f.length];h.slotMeta[l]=v(w),r(),x(i,p),n("asistencia")},window.applyWeeklySchedule=()=>{const l=t.activeGroupId,i=t.attendance.monthKey;console.log("Applying weekly schedule for",l,i),n("asistencia")}}function X(e,s,t,n){const{isAcademicMonthActive:r,getMonthLongLabel:o,getMonthRecord:d,getEffectiveCode:c,createSlotMeta:u,getMarkClass:x}=n,b=z(s.id).sort((i,p)=>(i.apellido||"").localeCompare(p.apellido||"","es")),f=o(t),v=r(t)?"Lectivo":"Fuera de calendario",l=r(t)?"bg-emerald-50 text-emerald-600":"bg-slate-50 text-slate-500";e.innerHTML=`
    <div class="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 p-6 overflow-y-auto h-full">
      <div class="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-800 leading-tight">${f}</h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${l}">${v}</span>
              <span class="text-xs text-slate-400">·</span>
              <span class="text-xs text-slate-500 font-medium">${s.gradeName} ${s.sectionName}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button class="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" onclick="shiftMonth(-1)">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <div class="px-4 text-sm font-semibold text-slate-700 min-w-[120px] text-center">
            ${f.split(" ")[0]}
          </div>
          <button class="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" onclick="shiftMonth(1)">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden relative">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Métricas del mes</h3>
          <span class="material-symbols-outlined text-slate-300">analytics</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="text-center">
            <div class="text-2xl font-extrabold text-emerald-500" id="stat-p">--</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase">Presentes</div>
          </div>
          <div class="text-center border-x border-slate-100">
            <div class="text-2xl font-extrabold text-amber-500" id="stat-t">--</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase">Tardanzas</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-extrabold text-rose-500" id="stat-a">--</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase">Ausentes</div>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-50">
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-500">Promedio de asistencia</span>
            <span class="font-bold text-slate-800" id="stat-avg">--%</span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div class="bg-emerald-500 h-full transition-all duration-700" id="stat-bar" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <div class="col-span-12 flex flex-wrap items-center justify-between gap-4 py-2">
        <div class="flex items-center gap-3">
          <div class="relative group">
            <select class="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-slate-700 hover:border-blue-300 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all cursor-pointer shadow-sm" onchange="setActiveGroup(this.value)">
              ${R().map(i=>`<option value="${i.id}" ${i.id===s.id?"selected":""}>${F(V(i))}</option>`).join("")}
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">unfold_more</span>
          </div>

          <button class="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-sm transition-all shadow-sm" onclick="applyWeeklySchedule()">
            <span class="material-symbols-outlined text-lg">auto_fix_high</span>
            Generar dias
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button class="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm" title="Imprimir" onclick="window.print()">
            <span class="material-symbols-outlined text-xl">print</span>
          </button>
          <div class="h-6 w-px bg-slate-200 mx-1"></div>
          <button class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2" onclick="exportToExcel()">
            <img src="/assets/icons/logoexcel.png" class="w-4 h-4" alt=""> Excel
          </button>
          <button class="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center gap-2" onclick="exportToPdf()">
            <img src="/assets/icons/logopdf.png" class="w-4 h-4 invert" alt=""> PDF
          </button>
        </div>
      </div>

      <div class="col-span-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0" id="attendance-table">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-100 p-4 text-left font-bold text-xs text-slate-400 uppercase tracking-widest min-w-[280px]">Estudiante</th>
                ${renderTableHeaders(s.id,t,{getMonthRecord:d,createSlotMeta:u})}
                <th class="sticky right-0 z-20 bg-slate-50 border-b border-l border-slate-100 p-4 text-center font-bold text-xs text-slate-400 uppercase tracking-widest w-20">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${renderTableRows(s.id,t,b,{getMonthRecord:d,getEffectiveCode:c,createSlotMeta:u,getMarkClass:x})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,$(()=>updateStats(s.id,t,b,{getMonthRecord:d,getEffectiveCode:c}),200)}function B(e){e.innerHTML=`
    <div class="flex flex-col items-center justify-center h-full p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div class="w-20 h-20 mb-6 flex items-center justify-center bg-blue-50 text-blue-500 rounded-full">
        <span class="material-symbols-outlined text-4xl">inventory_2</span>
      </div>
      <h2 class="text-2xl font-bold text-slate-800 mb-2">No hay secciones creadas</h2>
      <p class="text-slate-500 max-w-md mb-8">Crea una sección para poder llevar el registro de asistencia por curso.</p>
      <button class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200" onclick="go('estudiantes')">
        Ir a estudiantes
      </button>
    </div>
  `}const y=96,O=["","P","T","A","E","R"],L=["","holiday","suspension","no-school"];function k(){(!a.attendance||typeof a.attendance!="object")&&(a.attendance={monthKey:C(),records:{}}),a.attendance.monthKey||(a.attendance.monthKey=C()),(!a.attendance.records||typeof a.attendance.records!="object")&&(a.attendance.records={}),(!a.attendance.settings||typeof a.attendance.settings!="object")&&(a.attendance.settings={}),(!a.attendance.groupSettings||typeof a.attendance.groupSettings!="object")&&(a.attendance.groupSettings={}),"advanceOnKeyboard"in a.attendance.settings||(a.attendance.settings.advanceOnKeyboard=!0),a.attendance.settings.activeSchoolMonths=[...H()]}function C(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}function S(e){const s=String(e||"").match(/^(\d{4})-(\d{2})$/);if(!s)return C();const t=parseInt(s[2],10);return t<1||t>12?C():`${s[1]}-${String(t).padStart(2,"0")}`}function j(e){const s=S(e),[t,n]=s.split("-").map(r=>parseInt(r,10));return new Date(t,n-1,1,12,0,0,0)}function Z(e,s){const t=j(e);return t.setMonth(t.getMonth()+s),`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}function J(e){return new Intl.DateTimeFormat("es-DO",{month:"long",year:"numeric"}).format(j(e))}function _(e="",s=""){return{type:L.includes(e)?e:"",reason:String(s||"").trim().slice(0,140)}}function M(){return{slotDays:Array(y).fill(""),slotMeta:Array.from({length:y},()=>_()),studentCodes:{},retiredCarryOverrides:{},retiredPolicy:"until-retirement",scheduleLinked:!1,visibleCount:1,__normalized:!0}}function Q(e,s=!1){if(k(),!e)return{scheduleLinked:!1};if(!a.attendance.groupSettings[e]){if(!s)return{scheduleLinked:!1};a.attendance.groupSettings[e]={scheduleLinked:!1}}return a.attendance.groupSettings[e]}function A(e,s,t=!1){k();const n=S(s);if(!e)return M();const r=Q(e,t);if(!a.attendance.records[e]){if(!t)return M();a.attendance.records[e]={}}if(!a.attendance.records[e][n]){if(!t)return M();a.attendance.records[e][n]={...M(),scheduleLinked:!!r.scheduleLinked}}const o=a.attendance.records[e][n];return o.__normalized||(o.__normalized=!0),o.scheduleLinked=!!r.scheduleLinked,o}function E(e,s,t,n=!1){const r=A(e,s,n);if(!r.studentCodes[t]){if(!n)return Array(y).fill("");r.studentCodes[t]=Array(y).fill("")}return r.studentCodes[t]}function D(e){return Array.isArray(e)&&e.some(s=>String(s||"").trim())}function G(e,s,t){var u,x,b;const n=S(s);if((u=A(e,n,!1).retiredCarryOverrides)!=null&&u[t])return!1;const o=E(e,n,t,!1);if(o.includes("R")||D(o))return!1;const d=(b=(x=a.attendance)==null?void 0:x.records)==null?void 0:b[e];if(!d)return!1;let c=!1;return Object.keys(d).filter(f=>S(f)<n).sort().forEach(f=>{const v=E(e,f,t,!1);v.includes("R")?c=!0:D(v)&&(c=!1)}),c}function P(e,s,t,n){const r=E(e,s,t,!1),o=String(r[n]||"").toUpperCase();return o||(G(e,s,t)?"R":"")}function I(e,s,t,n,r){if(!e||!t||n<0||n>=y)return;const o=A(e,s,!0),d=String(r||"").toUpperCase();G(e,s,t)&&d!=="R"&&d!==""?o.retiredCarryOverrides[t]=!0:d==="R"&&delete o.retiredCarryOverrides[t];const c=E(e,s,t,!0);if(c[n]=O.includes(d)?d:"",d==="R")for(let u=n+1;u<y;u+=1)c[u]="";N(e,s)}function ee(e){return e==="P"?"bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm shadow-emerald-100/50":e==="A"?"bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm shadow-rose-100/50":e==="T"?"bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm shadow-amber-100/50":e==="E"?"bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm shadow-blue-100/50":e==="R"?"bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm":"bg-white text-slate-300 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"}const te={sectionId:"",monthKey:"",studentIds:[],activeType:"",activeStudentId:"",activeSlotIndex:0,dayDrafts:{},attendanceMonthPinned:!1};function K(e){if(k(),!a.activeGroupId){const n=R();n.length&&(a.activeGroupId=n[0].id)}const s=R().find(n=>n.id===a.activeGroupId)||null,t=S(a.attendance.monthKey);if(!s){B(e);return}X(e,s,t,{isAcademicMonthActive:U,getMonthLongLabel:J,getMonthRecord:A,getEffectiveCode:P,createSlotMeta:_,getMarkClass:ee})}function ne(){W({UI:te,S:a,go:Y,persist:q,shiftMonthKey:Z,getEffectiveCode:P,getMonthRecord:A,setSlotCode:I,scheduleSqlAttendanceMonthSync:N,ATTENDANCE_V2_CODE_ORDER:O,ATTENDANCE_V2_EXCEPTION_ORDER:L,createSlotMeta:_}),window.RENDERS||(window.RENDERS={}),window.RENDERS.asistencia=e=>{K(e)}}a.currentPage==="asistencia"&&$(()=>{const e=document.getElementById("panel-content");e&&K(e)},50);export{ne as inicializar,K as registrarAttendancePanel};
