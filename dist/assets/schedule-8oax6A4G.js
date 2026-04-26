import{S as u,K as g,L as w,e as k,t as $,M as S}from"./main-xwMOn66X.js";function T(){return["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]}function x(e){if(!e)return"--:--";const[t,a]=e.split(":").map(Number),l=t>=12?"PM":"AM";return`${t%12||12}:${String(a).padStart(2,"0")} ${l}`}function D(e){const{UI:t}=e;return t.activeTab==="schedule"?M(e):E(e)}function M({S:e}){const t=e.teacherPlanner.activeWeekdays,a=e.teacherPlanner.weeklySchedule;if(a.length===0)return`
      <div class="bg-blue-50 border-2 border-dashed border-blue-200 rounded-[3rem] p-16 text-center">
        <div class="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
           <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-800 mb-4">¡Organicemos tu jornada!</h2>
        <p class="text-slate-500 max-w-md mx-auto mb-8 font-medium">Aún no has configurado tu horario. Usa el asistente para generar una base profesional en segundos.</p>
        <button onclick="window.openScheduleWizard()" class="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          Iniciar Asistente de Horario
        </button>
      </div>
    `;const l=Array.from(new Set(a.map(o=>`${o.startTime}-${o.endTime}`))).sort((o,s)=>o.localeCompare(s));return`
    <div class="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky left-0 z-10 backdrop-blur-md">Franja Horaria</th>
              ${t.map(o=>`<th class="p-6 text-center text-sm font-black text-slate-700">${T()[o]}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${l.map(o=>{const[s,i]=o.split("-");return`
                <tr class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td class="p-6 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10">
                    <div class="text-sm font-black text-slate-800">${x(s)}</div>
                    <div class="text-[10px] font-bold text-slate-400 mt-1">${x(i)}</div>
                  </td>
                  ${t.map(r=>{const n=a.find(c=>c.weekday===r&&c.startTime===s&&c.endTime===i);return j(n,r,s,i,e)}).join("")}
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clase</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-amber-400"></div>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Receso/Almuerzo</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planificación</span>
          </div>
        </div>

        <button onclick="window.openScheduleWizard()" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
          Reiniciar horario con el asistente
        </button>
      </div>
    </div>
  `}function j(e,t,a,l,o){if(!e)return`<td class="p-4"><div class="h-16 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
      <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
    </div></td>`;const s=["break","lunch"].includes(e.blockType),i=e.blockType==="planning",r=e.blockType==="class";let n="bg-slate-50",c="text-slate-600",d="border-slate-100";r?(n="bg-blue-50 hover:bg-blue-100",c="text-blue-700",d="border-blue-100"):s?(n="bg-amber-50 hover:bg-amber-100",c="text-amber-700",d="border-amber-100"):i&&(n="bg-emerald-50 hover:bg-emerald-100",c="text-emerald-700",d="border-emerald-100");const v=(o.secciones||[]).find(p=>p.id===e.sectionId);return`
    <td class="p-2 min-w-[200px]">
      <div onclick="window.editScheduleCell(${t}, '${a}', '${l}')"
           class="${n} ${d} border rounded-2xl p-4 transition-all cursor-pointer group/card relative">
        <div class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">${e.blockType==="class"?"Clase":e.blockType}</div>
        <div class="text-sm font-black ${c} leading-tight">${e.subject||"Sin Título"}</div>
        ${v?`<div class="mt-1 text-[11px] font-bold opacity-70">${v.sec}</div>`:""}
        ${e.room?`<div class="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/5 rounded-md text-[9px] font-bold uppercase tracking-wider opacity-60">Aula: ${e.room}</div>`:""}

        <div class="absolute top-3 right-3 opacity-0 group-hover/card:opacity-30 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </div>
      </div>
    </td>
  `}function E({UI:e,getPlannerEvents:t,attendanceMonthStart:a,escapeHtml:l}){return`
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
          <div class="flex items-center justify-between mb-8 px-4">
            <h3 class="text-xl font-black text-slate-800">${new Intl.DateTimeFormat("es-DO",{month:"long",year:"numeric"}).format(a(e.monthKey))}</h3>
            <div class="flex gap-2">
              <button onclick="window.changeCalendarMonth(-1)" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onclick="window.changeCalendarMonth(1)" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1 border-t border-slate-50 pt-6">
            ${["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(o=>`<div class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4 mb-2">${o}</div>`).join("")}
            ${P({UI:e,getPlannerEvents:t,attendanceMonthStart:a})}
          </div>
        </div>
      </div>

      <div class="space-y-8">
        <div class="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-xl font-bold mb-6 flex items-center gap-3">
              Próximos Eventos
              <span class="px-2 py-0.5 bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Escolar</span>
            </h3>
            <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              ${C({getPlannerEvents:t,escapeHtml:l})}
            </div>
          </div>
          <div class="absolute -right-20 -top-20 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        <button onclick="window.openAddEventModal()" class="w-full py-5 bg-white border border-slate-200 text-slate-900 font-bold rounded-[2rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Agregar Evento Personal
        </button>
      </div>
    </div>
  `}function C({getPlannerEvents:e,escapeHtml:t}){const a=e(),l=new Date,o=a.filter(s=>new Date(s.date)>=l);return o.length===0?'<div class="text-slate-500 text-sm font-medium italic">No hay eventos próximos registrados.</div>':o.slice(0,10).map(s=>{const i=new Date(`${s.date}T12:00:00`),r=i.getDate();return`
      <div class="flex items-center gap-5 p-4 rounded-3xl border border-transparent hover:border-slate-800 hover:bg-white/5 transition-all">
        <div class="flex-shrink-0 w-12 h-14 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/5">
          <div class="text-[10px] font-black uppercase tracking-tighter opacity-60">${new Intl.DateTimeFormat("es-DO",{month:"short"}).format(i).toUpperCase()}</div>
          <div class="text-lg font-black">${r}</div>
        </div>
        <div>
          <div class="text-sm font-black text-slate-100 leading-snug">${t(s.title)}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">${s.type==="holiday"?"Festivo":s.source}</div>
        </div>
      </div>
    `}).join("")}function P({UI:e,getPlannerEvents:t,attendanceMonthStart:a}){const l=a(e.monthKey),o=l.getMonth(),s=l.getFullYear(),i=new Date(s,o+1,0).getDate(),r=(l.getDay()+6)%7,n=[];for(let d=0;d<r;d+=1)n.push(null);for(let d=1;d<=i;d+=1)n.push(d);const c=t();return n.map(d=>{if(d===null)return'<div class="p-6"></div>';const v=`${s}-${String(o+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,p=c.filter(b=>b.date===v);return`
      <div class="min-h-[100px] p-2 border border-slate-50 hover:bg-slate-50/50 transition-colors relative group">
        <div class="text-sm font-black ${new Date().toDateString()===new Date(s,o,d).toDateString()?"w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto":"text-slate-400 text-center"} transition-all">${d}</div>
        <div class="mt-2 space-y-1">
          ${p.slice(0,2).map(b=>`
            <div class="text-[8px] font-black uppercase tracking-tighter truncate px-1.5 py-0.5 rounded-md ${b.type==="holiday"?"bg-amber-100 text-amber-700":"bg-blue-50 text-blue-600"}" title="${b.title}">
              ${b.title}
            </div>
          `).join("")}
          ${p.length>2?`<div class="text-[8px] font-bold text-slate-400 text-center">+ ${p.length-2} más</div>`:""}
        </div>
      </div>
    `}).join("")}function I(e){const{UI:t,renderSchedulePanel:a,attendanceMonthStart:l,attendanceMonthKey:o,toast:s}=e;function i(){const r=document.getElementById("p-content");r&&a(r)}window.setScheduleTab=r=>{t.activeTab=r==="calendar"?"calendar":"schedule",i()},window.changeCalendarMonth=r=>{const n=l(t.monthKey);n.setMonth(n.getMonth()+r),t.monthKey=o(n),i()},window.openScheduleWizard=()=>{s("El asistente de horario modular está cargando...",!1)},window.editScheduleCell=(r,n,c)=>{s(`Editando bloque: ${r} @ ${n}`,!1)},window.openAddEventModal=()=>{s("Abre el creador de eventos personalizados.",!1)}}const f=[0,1,2,3,4],h={activeTab:"schedule",editor:{mode:"edit",originalKey:"",weekday:0,startTime:"",endTime:"",draft:null,errors:{}},wizard:{step:1,journeyType:"extended",startTime:"07:30",endTime:"11:55",durationsRaw:"40"},monthKey:g()};function y(){(!u.teacherPlanner||typeof u.teacherPlanner!="object")&&(u.teacherPlanner={monthKey:g(),customEvents:[],weeklySchedule:[],activeWeekdays:[...f],journeyType:"extended"}),u.teacherPlanner.activeWeekdays||(u.teacherPlanner.activeWeekdays=[...f]),u.teacherPlanner.weeklySchedule||(u.teacherPlanner.weeklySchedule=[]),u.teacherPlanner.customEvents||(u.teacherPlanner.customEvents=[])}function A(){var i,r;y();const t=String(((i=u.schoolYear)==null?void 0:i.id)||((r=u.schoolYear)==null?void 0:r.name)||"2025-2026").match(/(\d{4})\D+(\d{4})/),a=t?parseInt(t[1],10):2025,l=t?parseInt(t[2],10):a+1,o=[{id:`minerd-doc-${a}`,date:`${a}-08-04`,title:"Inicio de jornada docente",type:"minerd",source:"MINERD"},{id:`minerd-open-${a}`,date:`${a}-08-25`,title:"Inicio del año escolar",type:"minerd",source:"MINERD"},{id:`holiday-mercedes-${a}`,date:`${a}-09-24`,title:"Día de las Mercedes",type:"holiday"},{id:`holiday-indep-${l}`,date:`${l}-02-27`,title:"Día de la Independencia",type:"holiday"}],s=u.teacherPlanner.customEvents.map(n=>({...n,type:n.type||"custom",source:"Personal"}));return[...o,...s].sort((n,c)=>n.date.localeCompare(c.date))}function m(e){y(),e.innerHTML=`
    <div class="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      <!-- Encabezado y Pestañas -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Agenda Docente</h1>
          <p class="text-slate-500 font-medium">Gestiona tu horario semanal y eventos curriculares.</p>
        </div>
        
        <div class="flex bg-slate-100 p-1.5 rounded-[1.5rem] self-start md:self-auto">
          <button onclick="window.setScheduleTab('schedule')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${h.activeTab==="schedule"?"bg-white shadow-sm text-blue-600":"text-slate-500 hover:text-slate-700"}">
            Horario Semanal
          </button>
          <button onclick="window.setScheduleTab('calendar')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${h.activeTab==="calendar"?"bg-white shadow-sm text-blue-600":"text-slate-500 hover:text-slate-700"}">
            Calendario Escolar
          </button>
        </div>
      </div>

      <div id="schedule-content">
        ${D({S:u,UI:h,getPlannerEvents:A,attendanceMonthStart:w,escapeHtml:k})}
      </div>
    </div>
  `}function z(){I({UI:h,renderSchedulePanel:m,attendanceMonthStart:w,attendanceMonthKey:S,toast:$}),window.RENDERS||(window.RENDERS={}),window.RENDERS.horario=e=>m(e),window.RENDERS.calendario=e=>{h.activeTab="calendar",m(e)}}export{z as init,m as renderSchedulePanel};
