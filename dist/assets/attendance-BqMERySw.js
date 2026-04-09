import{S as a,n as R,o as Y,s as T,q as z,t as q,v as U,w as K,k as y,l as x,x as D}from"./main-DzuOqHLs.js";const p=96,E=["","P","T","A","E","R"],$=["","holiday","suspension","no-school"];function _(){(!a.attendance||typeof a.attendance!="object")&&(a.attendance={monthKey:k(),records:{}}),a.attendance.monthKey||(a.attendance.monthKey=k()),(!a.attendance.records||typeof a.attendance.records!="object")&&(a.attendance.records={}),(!a.attendance.settings||typeof a.attendance.settings!="object")&&(a.attendance.settings={}),(!a.attendance.groupSettings||typeof a.attendance.groupSettings!="object")&&(a.attendance.groupSettings={}),"advanceOnKeyboard"in a.attendance.settings||(a.attendance.settings.advanceOnKeyboard=!0),a.attendance.settings.activeSchoolMonths=[...Y()]}function k(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}function v(e){const s=String(e||"").match(/^(\d{4})-(\d{2})$/);if(!s)return k();const t=parseInt(s[2],10);return t<1||t>12?k():`${s[1]}-${String(t).padStart(2,"0")}`}function B(e){const s=v(e),[t,n]=s.split("-").map(o=>parseInt(o,10));return new Date(t,n-1,1,12,0,0,0)}function W(e,s){const t=B(e);return t.setMonth(t.getMonth()+s),`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}function X(e){return new Intl.DateTimeFormat("es-DO",{month:"long",year:"numeric"}).format(B(e))}function S(e="",s=""){return{type:$.includes(e)?e:"",reason:String(s||"").trim().slice(0,140)}}function C(){return{slotDays:Array(p).fill(""),slotMeta:Array.from({length:p},()=>S()),studentCodes:{},retiredCarryOverrides:{},retiredPolicy:"until-retirement",scheduleLinked:!1,visibleCount:1,__normalized:!0}}function J(e,s=!1){if(_(),!e)return{scheduleLinked:!1};if(!a.attendance.groupSettings[e]){if(!s)return{scheduleLinked:!1};a.attendance.groupSettings[e]={scheduleLinked:!1}}return a.attendance.groupSettings[e]}function f(e,s,t=!1){_();const n=v(s);if(!e)return C();const o=J(e,t);if(!a.attendance.records[e]){if(!t)return C();a.attendance.records[e]={}}if(!a.attendance.records[e][n]){if(!t)return C();a.attendance.records[e][n]={...C(),scheduleLinked:!!o.scheduleLinked}}const r=a.attendance.records[e][n];return r.__normalized||(r.__normalized=!0),r.scheduleLinked=!!o.scheduleLinked,r}function M(e,s,t,n=!1){const o=f(e,s,n);if(!o.studentCodes[t]){if(!n)return Array(p).fill("");o.studentCodes[t]=Array(p).fill("")}return o.studentCodes[t]}function P(e){return Array.isArray(e)&&e.some(s=>String(s||"").trim())}function F(e,s,t){var d,u,c;const n=v(s);if((d=f(e,n,!1).retiredCarryOverrides)!=null&&d[t])return!1;const r=M(e,n,t,!1);if(r.includes("R")||P(r))return!1;const l=(c=(u=a.attendance)==null?void 0:u.records)==null?void 0:c[e];if(!l)return!1;let i=!1;return Object.keys(l).filter(b=>v(b)<n).sort().forEach(b=>{const m=M(e,b,t,!1);m.includes("R")?i=!0:P(m)&&(i=!1)}),i}function j(e,s,t,n){const o=M(e,s,t,!1),r=String(o[n]||"").toUpperCase();return r||(F(e,s,t)?"R":"")}function Q(e,s,t,n,o){if(!e||!t||n<0||n>=p)return;const r=f(e,s,!0),l=String(o||"").toUpperCase();F(e,s,t)&&l!=="R"&&l!==""?r.retiredCarryOverrides[t]=!0:l==="R"&&delete r.retiredCarryOverrides[t];const i=M(e,s,t,!0);if(i[n]=E.includes(l)?l:"",l==="R")for(let d=n+1;d<p;d++)i[d]="";D(e,s)}function H(e){if(_(),!a.activeGroupId){const n=R();n.length&&(a.activeGroupId=n[0].id)}const s=R().find(n=>n.id===a.activeGroupId)||null,t=v(a.attendance.monthKey);if(!s){Z(e);return}I(e,s,t)}function Z(e){e.innerHTML=`
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
  `}function I(e,s,t){const n=T(s.id).sort((i,d)=>(i.apellido||"").localeCompare(d.apellido||"","es")),o=X(t),r=z(t)?"Lectivo":"Fuera de calendario",l=z(t)?"bg-emerald-50 text-emerald-600":"bg-slate-50 text-slate-500";e.innerHTML=`
    <div class="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 p-6 overflow-y-auto h-full">
      
      <!-- Tarjeta: Cabecera y Navegación de Mes -->
      <div class="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-800 leading-tight">${o}</h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${l}">${r}</span>
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
            ${o.split(" ")[0]}
          </div>
          <button class="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" onclick="shiftMonth(1)">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Tarjeta: Resumen de Estadísticas -->
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

      <!-- Card: Toolbar & Actions -->
      <div class="col-span-12 flex flex-wrap items-center justify-between gap-4 py-2">
        <div class="flex items-center gap-3">
          <div class="relative group">
            <select class="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-slate-700 hover:border-blue-300 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all cursor-pointer shadow-sm" onchange="setActiveGroup(this.value)">
              ${R().map(i=>`<option value="${i.id}" ${i.id===s.id?"selected":""}>${q(U(i))}</option>`).join("")}
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

      <!-- Card: Main Attendance Grid -->
      <div class="col-span-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0" id="attendance-table">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-100 p-4 text-left font-bold text-xs text-slate-400 uppercase tracking-widest min-w-[280px]">Estudiante</th>
                ${ee(s.id,t)}
                <th class="sticky right-0 z-20 bg-slate-50 border-b border-l border-slate-100 p-4 text-center font-bold text-xs text-slate-400 uppercase tracking-widest w-20">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${te(s.id,t,n)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,K(()=>ae(s.id,t,n),200)}function ee(e,s){const t=f(e,s,!1),n=t.visibleCount||1;let o="";for(let r=0;r<n;r++){const l=t.slotDays[r]||"",i=t.slotMeta[r]||S(),d=!!i.type;o+=`
      <th class="border-b border-slate-100 p-0 min-w-[48px]">
        <div class="flex flex-col items-center py-2 h-full">
          <input type="text" 
                 class="w-10 h-10 text-center font-bold text-sm rounded-lg border-transparent focus:border-blue-300 focus:ring-0 transition-all ${d?"bg-amber-50 text-amber-600":"bg-white text-slate-700"}" 
                 value="${l}" 
                 placeholder="--"
                 maxlength="2"
                 onblur="commitDayDay(${r}, this.value)">
          <button class="mt-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all" 
                  onclick="cycleException(${r})"
                  title="${i.type||"Marcar especial"}">
            <span class="material-symbols-outlined text-[14px] ${d?"text-amber-500":"text-slate-300"}">
              ${d?"event_busy":"add_circle"}
            </span>
          </button>
        </div>
      </th>
    `}return o}function te(e,s,t){return t.map((n,o)=>`
    <tr class="group hover:bg-blue-50/20 transition-colors">
      <td class="sticky left-0 z-10 bg-white group-hover:bg-blue-50/20 border-r border-slate-100 p-4 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
            ${o+1}
          </div>
          <div class="flex flex-col truncate">
            <span class="font-bold text-slate-700 truncate">${n.apellido||""}, ${n.nombre||""}</span>
            <span class="text-[10px] text-slate-400 font-medium tracking-wide">ID: ${n.id.slice(0,8)}</span>
          </div>
        </div>
      </td>
      ${se(e,s,n)}
      <td class="sticky right-0 z-10 bg-white group-hover:bg-blue-50/20 border-l border-slate-100 p-4 text-center font-bold text-slate-700 transition-colors" id="total-${n.id}">
        0
      </td>
    </tr>
  `).join("")}function se(e,s,t){const n=f(e,s,!1),o=n.visibleCount||1;let r="";for(let l=0;l<o;l++){const i=j(e,s,t.id,l),d=!!n.slotDays[l],u=n.slotMeta[l]||S(),c=!d||!!u.type;r+=`
      <td class="p-1 text-center">
        <button class="w-10 h-10 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center mx-auto
                       ${c?"bg-slate-50 text-slate-200 cursor-not-allowed":ne(i)}"
                ${c?"disabled":`onclick="cycleMark('${t.id}', ${l})"`}>
          ${c?"?":i||""}
        </button>
      </td>
    `}return r}function ne(e){return e==="P"?"bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm shadow-emerald-100/50":e==="A"?"bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm shadow-rose-100/50":e==="T"?"bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm shadow-amber-100/50":e==="E"?"bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm shadow-blue-100/50":e==="R"?"bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm":"bg-white text-slate-300 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"}function ae(e,s,t){let n=0,o=0,r=0,l=0;t.forEach(G=>{var O;const A=f(e,s,!1),V=A.visibleCount||1;let w=0;for(let h=0;h<V;h++){const g=j(e,s,G.id,h);!!A.slotDays[h]&&!((O=A.slotMeta[h])!=null&&O.type)&&(g==="P"&&(n++,w++),g==="T"&&(o++,w++),g==="A"&&r++,g==="E"&&w++,g!==""&&l++)}const N=document.getElementById(`total-${G.id}`);N&&(N.textContent=w)});const i=document.getElementById("stat-p"),d=document.getElementById("stat-t"),u=document.getElementById("stat-a"),c=document.getElementById("stat-avg"),b=document.getElementById("stat-bar"),m=n+o,L=l?Math.round(m/(m+r)*100):0;i&&(i.textContent=n),d&&(d.textContent=o),u&&(u.textContent=r),c&&(c.textContent=`${L}%`),b&&(b.style.width=`${L}%`)}window.shiftMonth=e=>{const s=W(a.attendance.monthKey,e);a.attendance.monthKey=s,y(),x("asistencia")};window.setActiveGroup=e=>{a.activeGroupId=e,y(),x("asistencia")};window.cycleMark=(e,s)=>{const t=a.activeGroupId,n=a.attendance.monthKey,o=j(t,n,e,s),r=E.indexOf(o),l=E[(r+1)%E.length];Q(t,n,e,s,l),y(),T(t).find(i=>i.id===e),T(t),x("asistencia")};window.commitDayDay=(e,s)=>{const t=a.activeGroupId,n=a.attendance.monthKey,o=f(t,n,!0),r=String(s||"").replace(/\D/g,"").slice(0,2),l=parseInt(r,10);(!r||l>=1&&l<=31)&&(o.slotDays[e]=r,o.visibleCount=Math.max(o.visibleCount||1,e+1),y(),D(t,n),x("asistencia"))};window.cycleException=e=>{var i;const s=a.activeGroupId,t=a.attendance.monthKey,n=f(s,t,!0),o=((i=n.slotMeta[e])==null?void 0:i.type)||"",r=$.indexOf(o),l=$[(r+1)%$.length];n.slotMeta[e]=S(l),y(),D(s,t),x("asistencia")};window.applyWeeklySchedule=()=>{const e=a.activeGroupId,s=a.attendance.monthKey;console.log("Applying weekly schedule for",e,s),x("asistencia")};function le(){window.RENDERS||(window.RENDERS={}),window.RENDERS.asistencia=e=>{H(e)}}a.currentPage==="asistencia"&&K(()=>{const e=document.getElementById("panel-content");e&&H(e)},50);export{le as init,H as registerAttendancePanel};
