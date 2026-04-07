import{S as a,n as R,o as Y,s as T,q as z,t as q,v as U,w as K,k as y,l as x,x as D}from"./main-Dd9jDrfc.js";const b=96,E=["","P","T","A","E","R"],$=["","holiday","suspension","no-school"];function _(){(!a.attendance||typeof a.attendance!="object")&&(a.attendance={monthKey:k(),records:{}}),a.attendance.monthKey||(a.attendance.monthKey=k()),(!a.attendance.records||typeof a.attendance.records!="object")&&(a.attendance.records={}),(!a.attendance.settings||typeof a.attendance.settings!="object")&&(a.attendance.settings={}),(!a.attendance.groupSettings||typeof a.attendance.groupSettings!="object")&&(a.attendance.groupSettings={}),"advanceOnKeyboard"in a.attendance.settings||(a.attendance.settings.advanceOnKeyboard=!0),a.attendance.settings.activeSchoolMonths=[...Y()]}function k(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}function v(t){const s=String(t||"").match(/^(\d{4})-(\d{2})$/);if(!s)return k();const e=parseInt(s[2],10);return e<1||e>12?k():`${s[1]}-${String(e).padStart(2,"0")}`}function B(t){const s=v(t),[e,n]=s.split("-").map(r=>parseInt(r,10));return new Date(e,n-1,1,12,0,0,0)}function W(t,s){const e=B(t);return e.setMonth(e.getMonth()+s),`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}function X(t){return new Intl.DateTimeFormat("es-DO",{month:"long",year:"numeric"}).format(B(t))}function S(t="",s=""){return{type:$.includes(t)?t:"",reason:String(s||"").trim().slice(0,140)}}function C(){return{slotDays:Array(b).fill(""),slotMeta:Array.from({length:b},()=>S()),studentCodes:{},retiredCarryOverrides:{},retiredPolicy:"until-retirement",scheduleLinked:!1,visibleCount:1,__normalized:!0}}function J(t,s=!1){if(_(),!t)return{scheduleLinked:!1};if(!a.attendance.groupSettings[t]){if(!s)return{scheduleLinked:!1};a.attendance.groupSettings[t]={scheduleLinked:!1}}return a.attendance.groupSettings[t]}function f(t,s,e=!1){_();const n=v(s);if(!t)return C();const r=J(t,e);if(!a.attendance.records[t]){if(!e)return C();a.attendance.records[t]={}}if(!a.attendance.records[t][n]){if(!e)return C();a.attendance.records[t][n]={...C(),scheduleLinked:!!r.scheduleLinked}}const o=a.attendance.records[t][n];return o.__normalized||(o.__normalized=!0),o.scheduleLinked=!!r.scheduleLinked,o}function M(t,s,e,n=!1){const r=f(t,s,n);if(!r.studentCodes[e]){if(!n)return Array(b).fill("");r.studentCodes[e]=Array(b).fill("")}return r.studentCodes[e]}function P(t){return Array.isArray(t)&&t.some(s=>String(s||"").trim())}function F(t,s,e){var d,u,c;const n=v(s);if((d=f(t,n,!1).retiredCarryOverrides)!=null&&d[e])return!1;const o=M(t,n,e,!1);if(o.includes("R")||P(o))return!1;const i=(c=(u=a.attendance)==null?void 0:u.records)==null?void 0:c[t];if(!i)return!1;let l=!1;return Object.keys(i).filter(p=>v(p)<n).sort().forEach(p=>{const g=M(t,p,e,!1);g.includes("R")?l=!0:P(g)&&(l=!1)}),l}function j(t,s,e,n){const r=M(t,s,e,!1),o=String(r[n]||"").toUpperCase();return o||(F(t,s,e)?"R":"")}function Q(t,s,e,n,r){if(!t||!e||n<0||n>=b)return;const o=f(t,s,!0),i=String(r||"").toUpperCase();F(t,s,e)&&i!=="R"&&i!==""?o.retiredCarryOverrides[e]=!0:i==="R"&&delete o.retiredCarryOverrides[e];const l=M(t,s,e,!0);if(l[n]=E.includes(i)?i:"",i==="R")for(let d=n+1;d<b;d++)l[d]="";D(t,s)}function H(t){if(_(),!a.activeGroupId){const n=R();n.length&&(a.activeGroupId=n[0].id)}const s=R().find(n=>n.id===a.activeGroupId)||null,e=v(a.attendance.monthKey);if(!s){Z(t);return}I(t,s,e)}function Z(t){t.innerHTML=`
    <div class="flex flex-col items-center justify-center h-full p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div class="w-20 h-20 mb-6 flex items-center justify-center bg-indigo-50 text-indigo-500 rounded-full">
        <span class="material-symbols-outlined text-4xl">inventory_2</span>
      </div>
      <h2 class="text-2xl font-bold text-slate-800 mb-2">No hay secciones creadas</h2>
      <p class="text-slate-500 max-w-md mb-8">Crea una sección para poder llevar el registro de asistencia por curso.</p>
      <button class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200" onclick="go('estudiantes')">
        Ir a estudiantes
      </button>
    </div>
  `}function I(t,s,e){const n=T(s.id).sort((l,d)=>(l.apellido||"").localeCompare(d.apellido||"","es")),r=X(e),o=z(e)?"Lectivo":"Fuera de calendario",i=z(e)?"bg-emerald-50 text-emerald-600":"bg-slate-50 text-slate-500";t.innerHTML=`
    <div class="grid grid-cols-12 gap-6 p-6 overflow-y-auto h-full">
      
      <!-- Tarjeta: Cabecera y Navegación de Mes -->
      <div class="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-800 leading-tight">${r}</h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${i}">${o}</span>
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
            ${r.split(" ")[0]}
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
            <select class="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-slate-700 hover:border-indigo-300 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all cursor-pointer shadow-sm" onchange="setActiveGroup(this.value)">
              ${R().map(l=>`<option value="${l.id}" ${l.id===s.id?"selected":""}>${q(U(l))}</option>`).join("")}
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">unfold_more</span>
          </div>
          
          <button class="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm transition-all shadow-sm" onclick="applyWeeklySchedule()">
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
                ${tt(s.id,e)}
                <th class="sticky right-0 z-20 bg-slate-50 border-b border-l border-slate-100 p-4 text-center font-bold text-xs text-slate-400 uppercase tracking-widest w-20">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${et(s.id,e,n)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,K(()=>at(s.id,e,n),200)}function tt(t,s){const e=f(t,s,!1),n=e.visibleCount||1;let r="";for(let o=0;o<n;o++){const i=e.slotDays[o]||"",l=e.slotMeta[o]||S(),d=!!l.type;r+=`
      <th class="border-b border-slate-100 p-0 min-w-[48px]">
        <div class="flex flex-col items-center py-2 h-full">
          <input type="text" 
                 class="w-10 h-10 text-center font-bold text-sm rounded-lg border-transparent focus:border-indigo-300 focus:ring-0 transition-all ${d?"bg-amber-50 text-amber-600":"bg-white text-slate-700"}" 
                 value="${i}" 
                 placeholder="--"
                 maxlength="2"
                 onblur="commitDayDay(${o}, this.value)">
          <button class="mt-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all" 
                  onclick="cycleException(${o})"
                  title="${l.type||"Marcar especial"}">
            <span class="material-symbols-outlined text-[14px] ${d?"text-amber-500":"text-slate-300"}">
              ${d?"event_busy":"add_circle"}
            </span>
          </button>
        </div>
      </th>
    `}return r}function et(t,s,e){return e.map((n,r)=>`
    <tr class="group hover:bg-indigo-50/20 transition-colors">
      <td class="sticky left-0 z-10 bg-white group-hover:bg-indigo-50/20 border-r border-slate-100 p-4 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
            ${r+1}
          </div>
          <div class="flex flex-col truncate">
            <span class="font-bold text-slate-700 truncate">${n.apellido||""}, ${n.nombre||""}</span>
            <span class="text-[10px] text-slate-400 font-medium tracking-wide">ID: ${n.id.slice(0,8)}</span>
          </div>
        </div>
      </td>
      ${st(t,s,n)}
      <td class="sticky right-0 z-10 bg-white group-hover:bg-indigo-50/20 border-l border-slate-100 p-4 text-center font-bold text-slate-700 transition-colors" id="total-${n.id}">
        0
      </td>
    </tr>
  `).join("")}function st(t,s,e){const n=f(t,s,!1),r=n.visibleCount||1;let o="";for(let i=0;i<r;i++){const l=j(t,s,e.id,i),d=!!n.slotDays[i],u=n.slotMeta[i]||S(),c=!d||!!u.type;o+=`
      <td class="p-1 text-center">
        <button class="w-10 h-10 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center mx-auto
                       ${c?"bg-slate-50 text-slate-200 cursor-not-allowed":nt(l)}"
                ${c?"disabled":`onclick="cycleMark('${e.id}', ${i})"`}>
          ${c?"?":l||""}
        </button>
      </td>
    `}return o}function nt(t){return t==="P"?"bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm shadow-emerald-100/50":t==="A"?"bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm shadow-rose-100/50":t==="T"?"bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm shadow-amber-100/50":t==="E"?"bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-sm shadow-indigo-100/50":t==="R"?"bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm":"bg-white text-slate-300 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"}function at(t,s,e){let n=0,r=0,o=0,i=0;e.forEach(G=>{var O;const A=f(t,s,!1),V=A.visibleCount||1;let w=0;for(let m=0;m<V;m++){const h=j(t,s,G.id,m);!!A.slotDays[m]&&!((O=A.slotMeta[m])!=null&&O.type)&&(h==="P"&&(n++,w++),h==="T"&&(r++,w++),h==="A"&&o++,h==="E"&&w++,h!==""&&i++)}const N=document.getElementById(`total-${G.id}`);N&&(N.textContent=w)});const l=document.getElementById("stat-p"),d=document.getElementById("stat-t"),u=document.getElementById("stat-a"),c=document.getElementById("stat-avg"),p=document.getElementById("stat-bar"),g=n+r,L=i?Math.round(g/(g+o)*100):0;l&&(l.textContent=n),d&&(d.textContent=r),u&&(u.textContent=o),c&&(c.textContent=`${L}%`),p&&(p.style.width=`${L}%`)}window.shiftMonth=t=>{const s=W(a.attendance.monthKey,t);a.attendance.monthKey=s,y(),x("asistencia")};window.setActiveGroup=t=>{a.activeGroupId=t,y(),x("asistencia")};window.cycleMark=(t,s)=>{const e=a.activeGroupId,n=a.attendance.monthKey,r=j(e,n,t,s),o=E.indexOf(r),i=E[(o+1)%E.length];Q(e,n,t,s,i),y(),T(e).find(l=>l.id===t),T(e),x("asistencia")};window.commitDayDay=(t,s)=>{const e=a.activeGroupId,n=a.attendance.monthKey,r=f(e,n,!0),o=String(s||"").replace(/\D/g,"").slice(0,2),i=parseInt(o,10);(!o||i>=1&&i<=31)&&(r.slotDays[t]=o,r.visibleCount=Math.max(r.visibleCount||1,t+1),y(),D(e,n),x("asistencia"))};window.cycleException=t=>{var l;const s=a.activeGroupId,e=a.attendance.monthKey,n=f(s,e,!0),r=((l=n.slotMeta[t])==null?void 0:l.type)||"",o=$.indexOf(r),i=$[(o+1)%$.length];n.slotMeta[t]=S(i),y(),D(s,e),x("asistencia")};window.applyWeeklySchedule=()=>{const t=a.activeGroupId,s=a.attendance.monthKey;console.log("Applying weekly schedule for",t,s),x("asistencia")};function it(){window.RENDERS||(window.RENDERS={}),window.RENDERS.asistencia=t=>{H(t)}}a.currentPage==="asistencia"&&K(()=>{const t=document.getElementById("panel-content");t&&H(t)},50);export{it as init,H as registerAttendancePanel};
