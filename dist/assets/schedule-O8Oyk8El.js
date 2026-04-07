import{S as i,V as f,W as b,X as k,y as m,t as $}from"./main-Dd9jDrfc.js";const g=[0,1,2,3,4],u={activeTab:"schedule",monthKey:f()};function w(){(!i.teacherPlanner||typeof i.teacherPlanner!="object")&&(i.teacherPlanner={monthKey:f(),customEvents:[],weeklySchedule:[],activeWeekdays:[...g],journeyType:"extended"}),i.teacherPlanner.activeWeekdays||(i.teacherPlanner.activeWeekdays=[...g]),i.teacherPlanner.weeklySchedule||(i.teacherPlanner.weeklySchedule=[]),i.teacherPlanner.customEvents||(i.teacherPlanner.customEvents=[])}function y(){var l,n;w();const a=String(((l=i.schoolYear)==null?void 0:l.id)||((n=i.schoolYear)==null?void 0:n.name)||"2025-2026").match(/(\d{4})\D+(\d{4})/),o=a?parseInt(a[1],10):2025,t=a?parseInt(a[2],10):o+1,s=[{id:`minerd-doc-${o}`,date:`${o}-08-04`,title:"Inicio de jornada docente",type:"minerd",source:"MINERD"},{id:`minerd-open-${o}`,date:`${o}-08-25`,title:"Inicio del año escolar",type:"minerd",source:"MINERD"},{id:`holiday-mercedes-${o}`,date:`${o}-09-24`,title:"Día de las Mercedes",type:"holiday"},{id:`holiday-indep-${t}`,date:`${t}-02-27`,title:"Día de la Independencia",type:"holiday"}],d=i.teacherPlanner.customEvents.map(r=>({...r,type:r.type||"custom",source:"Personal"}));return[...s,...d].sort((r,c)=>r.date.localeCompare(c.date))}function S(){return["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]}function x(e){if(!e)return"--:--";const[a,o]=e.split(":").map(Number),t=a>=12?"PM":"AM";return`${a%12||12}:${String(o).padStart(2,"0")} ${t}`}function h(e){w(),e.innerHTML=`
    <div class="p-6 md:p-10 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      <!-- Encabezado y Pestañas -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Agenda Docente</h1>
          <p class="text-slate-500 font-medium">Gestiona tu horario semanal y eventos curriculares.</p>
        </div>
        
        <div class="flex bg-slate-100 p-1.5 rounded-[1.5rem] self-start md:self-auto">
          <button onclick="window.setScheduleTab('schedule')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${u.activeTab==="schedule"?"bg-white shadow-sm text-indigo-600":"text-slate-500 hover:text-slate-700"}">
            Horario Semanal
          </button>
          <button onclick="window.setScheduleTab('calendar')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${u.activeTab==="calendar"?"bg-white shadow-sm text-indigo-600":"text-slate-500 hover:text-slate-700"}">
            Calendario Escolar
          </button>
        </div>
      </div>

      <div id="schedule-content">
        ${u.activeTab==="schedule"?D():M()}
      </div>
    </div>
  `}function D(){const e=i.teacherPlanner.activeWeekdays,a=i.teacherPlanner.weeklySchedule;if(a.length===0)return`
      <div class="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[3rem] p-16 text-center">
        <div class="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
           <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-800 mb-4">¡Organicemos tu jornada!</h2>
        <p class="text-slate-500 max-w-md mx-auto mb-8 font-medium">Aún no has configurado tu horario. Usa el asistente para generar una base profesional en segundos.</p>
        <button onclick="window.openScheduleWizard()" class="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          Iniciar Asistente de Horario
        </button>
      </div>
    `;const o=Array.from(new Set(a.map(t=>`${t.startTime}-${t.endTime}`))).sort((t,s)=>t.localeCompare(s));return`
    <div class="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky left-0 z-10 backdrop-blur-md">Franja Horaria</th>
                        ${e.map(t=>`<th class="p-6 text-center text-sm font-black text-slate-700">${S()[t]}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${o.map(t=>{const[s,d]=t.split("-");return`
                        <tr class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                           <td class="p-6 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10">
                              <div class="text-sm font-black text-slate-800">${x(s)}</div>
                              <div class="text-[10px] font-bold text-slate-400 mt-1">${x(d)}</div>
                           </td>
                           ${e.map(l=>{const n=a.find(r=>r.weekday===l&&r.startTime===s&&r.endTime===d);return j(n,l,s,d)}).join("")}
                        </tr>
                        `}).join("")}
                </tbody>
            </table>
        </div>
        
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
           <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
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
           
           <button onclick="window.openScheduleWizard()" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Reiniciar horario con el asistente
           </button>
        </div>
    </div>
  `}function j(e,a,o,t){if(!e)return`<td class="p-4"><div class="h-16 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </div></td>`;const s=["break","lunch"].includes(e.blockType),d=e.blockType==="planning",l=e.blockType==="class";let n="bg-slate-50",r="text-slate-600",c="border-slate-100";l?(n="bg-indigo-50 hover:bg-indigo-100",r="text-indigo-700",c="border-indigo-100"):s?(n="bg-amber-50 hover:bg-amber-100",r="text-amber-700",c="border-amber-100"):d&&(n="bg-emerald-50 hover:bg-emerald-100",r="text-emerald-700",c="border-emerald-100");const v=(i.secciones||[]).find(p=>p.id===e.sectionId);return`
      <td class="p-2 min-w-[200px]">
        <div onclick="window.editScheduleCell(${a}, '${o}', '${t}')" 
             class="${n} ${c} border rounded-2xl p-4 transition-all cursor-pointer group/card relative">
          <div class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">${e.blockType==="class"?"Clase":e.blockType}</div>
          <div class="text-sm font-black ${r} leading-tight">${e.subject||"Sin Título"}</div>
          ${v?`<div class="mt-1 text-[11px] font-bold opacity-70">${v.sec}</div>`:""}
          ${e.room?`<div class="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/5 rounded-md text-[9px] font-bold uppercase tracking-wider opacity-60">Aula: ${e.room}</div>`:""}
          
          <div class="absolute top-3 right-3 opacity-0 group-hover/card:opacity-30 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </div>
        </div>
      </td>
    `}function M(){return`
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <!-- Cuadrícula de Calendario -->
         <div class="lg:col-span-2 space-y-8">
            <div class="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
               <div class="flex items-center justify-between mb-8 px-4">
                  <h3 class="text-xl font-black text-slate-800">${new Intl.DateTimeFormat("es-DO",{month:"long",year:"numeric"}).format(b(u.monthKey))}</h3>
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
                  ${["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(e=>`<div class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4 mb-2">${e}</div>`).join("")}
                  ${T()}
               </div>
            </div>
         </div>
         
         <!-- Lista de Eventos -->
         <div class="space-y-8">
            <div class="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div class="relative z-10">
                 <h3 class="text-xl font-bold mb-6 flex items-center gap-3">
                    Próximos Eventos
                    <span class="px-2 py-0.5 bg-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Escolar</span>
                 </h3>
                 <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    ${E()}
                 </div>
               </div>
               <div class="absolute -right-20 -top-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl"></div>
            </div>
            
            <button onclick="window.openAddEventModal()" class="w-full py-5 bg-white border border-slate-200 text-slate-900 font-bold rounded-[2rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
               <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
               Agregar Evento Personal
            </button>
         </div>
      </div>
    `}function E(){const e=y(),a=new Date,o=e.filter(t=>new Date(t.date)>=a);return o.length===0?'<div class="text-slate-500 text-sm font-medium italic">No hay eventos próximos registrados.</div>':o.slice(0,10).map(t=>{const s=new Date(t.date+"T12:00:00"),d=s.getDate(),l=new Intl.DateTimeFormat("es-DO",{month:"short"}).format(s).toUpperCase();return t.type,t.type,`
          <div class="flex items-center gap-5 p-4 rounded-3xl border border-transparent hover:border-slate-800 hover:bg-white/5 transition-all">
             <div class="flex-shrink-0 w-12 h-14 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                <div class="text-[10px] font-black uppercase tracking-tighter opacity-60">${l}</div>
                <div class="text-lg font-black">${d}</div>
             </div>
             <div>
                <div class="text-sm font-black text-slate-100 leading-snug">${$(t.title)}</div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">${t.type==="holiday"?"Festivo":t.source}</div>
             </div>
          </div>
        `}).join("")}function T(){const e=b(u.monthKey),a=e.getMonth(),o=e.getFullYear(),t=new Date(o,a+1,0).getDate(),s=(e.getDay()+6)%7,d=[];for(let n=0;n<s;n++)d.push(null);for(let n=1;n<=t;n++)d.push(n);const l=y();return d.map(n=>{if(n===null)return'<div class="p-6"></div>';const r=`${o}-${String(a+1).padStart(2,"0")}-${String(n).padStart(2,"0")}`,c=l.filter(p=>p.date===r);return`
        <div class="min-h-[100px] p-2 border border-slate-50 hover:bg-slate-50/50 transition-colors relative group">
           <div class="text-sm font-black ${new Date().toDateString()===new Date(o,a,n).toDateString()?"w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center mx-auto":"text-slate-400 text-center"} transition-all">${n}</div>
           <div class="mt-2 space-y-1">
              ${c.slice(0,2).map(p=>`
                <div class="text-[8px] font-black uppercase tracking-tighter truncate px-1.5 py-0.5 rounded-md ${p.type==="holiday"?"bg-amber-100 text-amber-700":"bg-indigo-50 text-indigo-600"}" title="${p.title}">
                   ${p.title}
                </div>
              `).join("")}
              ${c.length>2?`<div class="text-[8px] font-bold text-slate-400 text-center">+ ${c.length-2} más</div>`:""}
           </div>
        </div>
      `}).join("")}window.setScheduleTab=e=>{u.activeTab=e,h(document.getElementById("p-content"))};window.changeCalendarMonth=e=>{const a=b(u.monthKey);a.setMonth(a.getMonth()+e),u.monthKey=k(a),h(document.getElementById("p-content"))};window.openScheduleWizard=()=>{m("El asistente de horario modular está cargando...",!1)};window.editScheduleCell=(e,a,o)=>{m(`Editando bloque: ${e} @ ${a}`,!1)};window.openAddEventModal=()=>{m("Abre el creador de eventos personalizados.",!1)};window.RENDERS.horario=e=>h(e);window.RENDERS.calendario=e=>{u.activeTab="calendar",h(e)};export{h as renderSchedulePanel};
