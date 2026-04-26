import{s as H,N as D,e as U,$ as Y,a0 as O,S as o,a1 as q,a2 as G,a3 as W,g as X,p as J}from"./main-C46R8mV4.js";function Q(e){const{UI:s,S:t,go:n,persist:a,shiftMonthKey:r,getEffectiveCode:c,getMonthRecord:u,setSlotCode:l,scheduleSqlAttendanceMonthSync:x,ATTENDANCE_V2_CODE_ORDER:b,ATTENDANCE_V2_EXCEPTION_ORDER:i,createSlotMeta:h}=e;window.shiftMonth=f=>{s.attendanceMonthPinned=!0;const d=r(t.attendance.monthKey,f);t.attendance.monthKey=d,a(),n("asistencia")},window.setActiveGroup=f=>{t.activeGroupId=f,a(),n("asistencia")},window.cycleMark=(f,d)=>{const p=t.activeGroupId,m=t.attendance.monthKey,v=c(p,m,f,d),g=b.indexOf(v),y=b[(g+1)%b.length];l(p,m,f,d,y),a(),n("asistencia")},window.commitDayDay=(f,d)=>{const p=t.activeGroupId,m=t.attendance.monthKey,v=u(p,m,!0),g=String(d||"").replace(/\D/g,"").slice(0,2),y=parseInt(g,10);(!g||y>=1&&y<=31)&&(v.slotDays[f]=g,v.visibleCount=Math.max(v.visibleCount||1,f+1),a(),x(p,m),n("asistencia"))},window.cycleException=f=>{var w;const d=t.activeGroupId,p=t.attendance.monthKey,m=u(d,p,!0),v=((w=m.slotMeta[f])==null?void 0:w.type)||"",g=i.indexOf(v),y=i[(g+1)%i.length];m.slotMeta[f]=h(y),a(),x(d,p),n("asistencia")},window.applyWeeklySchedule=()=>{const f=t.activeGroupId,d=t.attendance.monthKey;console.log("Applying weekly schedule for",f,d),n("asistencia")}}function Z(e,s,t,n){const{isAcademicMonthActive:a,getMonthLongLabel:r,getMonthRecord:c,getEffectiveCode:u,createSlotMeta:l,getMarkClass:x}=n,b=H(s.id).sort((d,p)=>(d.apellido||"").localeCompare(p.apellido||"","es")),i=r(t),h=a(t)?"Lectivo":"Fuera de calendario",f=a(t)?"bg-emerald-50 text-emerald-600":"bg-slate-50 text-slate-500";e.innerHTML=`
    <div class="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 p-6 overflow-y-auto h-full">
      <div class="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-800 leading-tight">${i}</h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${f}">${h}</span>
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
            ${i.split(" ")[0]}
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
              ${D().map(d=>`<option value="${d.id}" ${d.id===s.id?"selected":""}>${U(Y(d))}</option>`).join("")}
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
                ${ee(s.id,t,{getMonthRecord:c,createSlotMeta:l})}
                <th class="sticky right-0 z-20 bg-slate-50 border-b border-l border-slate-100 p-4 text-center font-bold text-xs text-slate-400 uppercase tracking-widest w-20">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${te(s.id,t,b,{getMonthRecord:c,getEffectiveCode:u,createSlotMeta:l,getMarkClass:x})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,O(()=>ne(s.id,t,b,{getMonthRecord:c,getEffectiveCode:u}),200)}function I(e){e.innerHTML=`
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
  `}function ee(e,s,t){const{getMonthRecord:n,createSlotMeta:a}=t,r=n(e,s,!1),c=r.visibleCount||1;let u="";for(let l=0;l<c;l+=1){const x=r.slotDays[l]||"",b=r.slotMeta[l]||a(),i=!!b.type;u+=`
      <th class="border-b border-slate-100 p-0 min-w-[48px]">
        <div class="flex flex-col items-center py-2 h-full">
          <input type="text"
                 class="w-10 h-10 text-center font-bold text-sm rounded-lg border-transparent focus:border-blue-300 focus:ring-0 transition-all ${i?"bg-amber-50 text-amber-600":"bg-white text-slate-700"}"
                 value="${x}"
                 placeholder="--"
                 maxlength="2"
                 onblur="commitDayDay(${l}, this.value)">
          <button class="mt-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all"
                  onclick="cycleException(${l})"
                  title="${b.type||"Marcar especial"}">
            <span class="material-symbols-outlined text-[14px] ${i?"text-amber-500":"text-slate-300"}">
              ${i?"event_busy":"add_circle"}
            </span>
          </button>
        </div>
      </th>
    `}return u}function te(e,s,t,n){return t.map((a,r)=>`
    <tr class="group hover:bg-blue-50/20 transition-colors">
      <td class="sticky left-0 z-10 bg-white group-hover:bg-blue-50/20 border-r border-slate-100 p-4 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
            ${r+1}
          </div>
          <div class="flex flex-col truncate">
            <span class="font-bold text-slate-700 truncate">${a.apellido||""}, ${a.nombre||""}</span>
            <span class="text-[10px] text-slate-400 font-medium tracking-wide">ID: ${a.id.slice(0,8)}</span>
          </div>
        </div>
      </td>
      ${se(e,s,a,n)}
      <td class="sticky right-0 z-10 bg-white group-hover:bg-blue-50/20 border-l border-slate-100 p-4 text-center font-bold text-slate-700 transition-colors" id="total-${a.id}">
        0
      </td>
    </tr>
  `).join("")}function se(e,s,t,n){const{getMonthRecord:a,getEffectiveCode:r,createSlotMeta:c,getMarkClass:u}=n,l=a(e,s,!1),x=l.visibleCount||1;let b="";for(let i=0;i<x;i+=1){const h=r(e,s,t.id,i),f=!!l.slotDays[i],d=l.slotMeta[i]||c(),p=!f||!!d.type;b+=`
      <td class="p-1 text-center">
        <button class="w-10 h-10 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center mx-auto
                       ${p?"bg-slate-50 text-slate-200 cursor-not-allowed":u(h)}"
                ${p?"disabled":`onclick="cycleMark('${t.id}', ${i})"`}>
          ${p?"?":h||""}
        </button>
      </td>
    `}return b}function ne(e,s,t,n){const{getMonthRecord:a,getEffectiveCode:r}=n;let c=0,u=0,l=0,x=0;t.forEach(v=>{var N;const g=a(e,s,!1),y=g.visibleCount||1;let w=0;for(let E=0;E<y;E+=1){const M=r(e,s,v.id,E);!!g.slotDays[E]&&!((N=g.slotMeta[E])!=null&&N.type)&&(M==="P"&&(c+=1,w+=1),M==="T"&&(u+=1,w+=1),M==="A"&&(l+=1),M==="E"&&(w+=1),M!==""&&(x+=1))}const j=document.getElementById(`total-${v.id}`);j&&(j.textContent=w)});const b=document.getElementById("stat-p"),i=document.getElementById("stat-t"),h=document.getElementById("stat-a"),f=document.getElementById("stat-avg"),d=document.getElementById("stat-bar"),p=c+u,m=x?Math.round(p/(p+l)*100):0;b&&(b.textContent=c),i&&(i.textContent=u),h&&(h.textContent=l),f&&(f.textContent=`${m}%`),d&&(d.style.width=`${m}%`)}const C=96,P=["","P","T","A","E","R"],z=["","holiday","suspension","no-school"];function _(){(!o.attendance||typeof o.attendance!="object")&&(o.attendance={monthKey:k(),records:{}}),o.attendance.monthKey||(o.attendance.monthKey=k()),(!o.attendance.records||typeof o.attendance.records!="object")&&(o.attendance.records={}),(!o.attendance.settings||typeof o.attendance.settings!="object")&&(o.attendance.settings={}),(!o.attendance.groupSettings||typeof o.attendance.groupSettings!="object")&&(o.attendance.groupSettings={}),"advanceOnKeyboard"in o.attendance.settings||(o.attendance.settings.advanceOnKeyboard=!0),o.attendance.settings.activeSchoolMonths=[...q()]}function k(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}function S(e){const s=String(e||"").match(/^(\d{4})-(\d{2})$/);if(!s)return k();const t=parseInt(s[2],10);return t<1||t>12?k():`${s[1]}-${String(t).padStart(2,"0")}`}function K(e){const s=S(e),[t,n]=s.split("-").map(a=>parseInt(a,10));return new Date(t,n-1,1,12,0,0,0)}function ae(e,s){const t=K(e);return t.setMonth(t.getMonth()+s),`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}function oe(e){return new Intl.DateTimeFormat("es-DO",{month:"long",year:"numeric"}).format(K(e))}function T(e="",s=""){return{type:z.includes(e)?e:"",reason:String(s||"").trim().slice(0,140)}}function $(){return{slotDays:Array(C).fill(""),slotMeta:Array.from({length:C},()=>T()),studentCodes:{},retiredCarryOverrides:{},retiredPolicy:"until-retirement",scheduleLinked:!1,visibleCount:1,__normalized:!0}}function re(e,s=!1){if(_(),!e)return{scheduleLinked:!1};if(!o.attendance.groupSettings[e]){if(!s)return{scheduleLinked:!1};o.attendance.groupSettings[e]={scheduleLinked:!1}}return o.attendance.groupSettings[e]}function A(e,s,t=!1){_();const n=S(s);if(!e)return $();const a=re(e,t);if(!o.attendance.records[e]){if(!t)return $();o.attendance.records[e]={}}if(!o.attendance.records[e][n]){if(!t)return $();o.attendance.records[e][n]={...$(),scheduleLinked:!!a.scheduleLinked}}const r=o.attendance.records[e][n];return r.__normalized||(r.__normalized=!0),r.scheduleLinked=!!a.scheduleLinked,r}function R(e,s,t,n=!1){const a=A(e,s,n);if(!a.studentCodes[t]){if(!n)return Array(C).fill("");a.studentCodes[t]=Array(C).fill("")}return a.studentCodes[t]}function L(e){return Array.isArray(e)&&e.some(s=>String(s||"").trim())}function B(e,s,t){var l,x,b;const n=S(s);if((l=A(e,n,!1).retiredCarryOverrides)!=null&&l[t])return!1;const r=R(e,n,t,!1);if(r.includes("R")||L(r))return!1;const c=(b=(x=o.attendance)==null?void 0:x.records)==null?void 0:b[e];if(!c)return!1;let u=!1;return Object.keys(c).filter(i=>S(i)<n).sort().forEach(i=>{const h=R(e,i,t,!1);h.includes("R")?u=!0:L(h)&&(u=!1)}),u}function F(e,s,t,n){const a=R(e,s,t,!1),r=String(a[n]||"").toUpperCase();return r||(B(e,s,t)?"R":"")}function le(e,s,t,n,a){if(!e||!t||n<0||n>=C)return;const r=A(e,s,!0),c=String(a||"").toUpperCase();B(e,s,t)&&c!=="R"&&c!==""?r.retiredCarryOverrides[t]=!0:c==="R"&&delete r.retiredCarryOverrides[t];const u=R(e,s,t,!0);if(u[n]=P.includes(c)?c:"",c==="R")for(let l=n+1;l<C;l+=1)u[l]="";G(e,s)}function ie(e){return e==="P"?"bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm shadow-emerald-100/50":e==="A"?"bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm shadow-rose-100/50":e==="T"?"bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm shadow-amber-100/50":e==="E"?"bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm shadow-blue-100/50":e==="R"?"bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm":"bg-white text-slate-300 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"}const ce={sectionId:"",monthKey:"",studentIds:[],activeType:"",activeStudentId:"",activeSlotIndex:0,dayDrafts:{},attendanceMonthPinned:!1};function V(e){if(_(),!o.activeGroupId){const n=D();n.length&&(o.activeGroupId=n[0].id)}const s=D().find(n=>n.id===o.activeGroupId)||null,t=S(o.attendance.monthKey);if(!s){I(e);return}Z(e,s,t,{isAcademicMonthActive:W,getMonthLongLabel:oe,getMonthRecord:A,getEffectiveCode:F,createSlotMeta:T,getMarkClass:ie})}function fe(){Q({UI:ce,S:o,go:X,persist:J,shiftMonthKey:ae,getEffectiveCode:F,getMonthRecord:A,setSlotCode:le,scheduleSqlAttendanceMonthSync:G,ATTENDANCE_V2_CODE_ORDER:P,ATTENDANCE_V2_EXCEPTION_ORDER:z,createSlotMeta:T}),window.RENDERS||(window.RENDERS={}),window.RENDERS.asistencia=e=>{V(e)}}o.currentPage==="asistencia"&&O(()=>{const e=document.getElementById("panel-content");e&&V(e)},50);export{fe as init,V as registerAttendancePanel};
