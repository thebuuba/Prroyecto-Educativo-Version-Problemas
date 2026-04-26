import{S as e,H as y,f as p,I as w,t as v,J as b}from"./main-BFkCmjLr.js";function x(t){const{UI:n}=t;return n.activeTab==="schedule"?renderWeeklySchedule(t):renderMonthlyCalendar(t)}function S(t){const{UI:n,renderSchedulePanel:d,attendanceMonthStart:i,attendanceMonthKey:s,toast:r}=t;function l(){const a=document.getElementById("p-content");a&&d(a)}window.setScheduleTab=a=>{n.activeTab=a==="calendar"?"calendar":"schedule",l()},window.changeCalendarMonth=a=>{const o=i(n.monthKey);o.setMonth(o.getMonth()+a),n.monthKey=s(o),l()},window.openScheduleWizard=()=>{r("El asistente de horario modular está cargando...",!1)},window.editScheduleCell=(a,o,u)=>{r(`Editando bloque: ${a} @ ${o}`,!1)},window.openAddEventModal=()=>{r("Abre el creador de eventos personalizados.",!1)}}const m=[0,1,2,3,4],c={activeTab:"schedule",editor:{mode:"edit",originalKey:"",weekday:0,startTime:"",endTime:"",draft:null,errors:{}},wizard:{step:1,journeyType:"extended",startTime:"07:30",endTime:"11:55",durationsRaw:"40"},monthKey:y()};function f(){(!e.teacherPlanner||typeof e.teacherPlanner!="object")&&(e.teacherPlanner={monthKey:y(),customEvents:[],weeklySchedule:[],activeWeekdays:[...m],journeyType:"extended"}),e.teacherPlanner.activeWeekdays||(e.teacherPlanner.activeWeekdays=[...m]),e.teacherPlanner.weeklySchedule||(e.teacherPlanner.weeklySchedule=[]),e.teacherPlanner.customEvents||(e.teacherPlanner.customEvents=[])}function E(){var l,a;f();const n=String(((l=e.schoolYear)==null?void 0:l.id)||((a=e.schoolYear)==null?void 0:a.name)||"2025-2026").match(/(\d{4})\D+(\d{4})/),d=n?parseInt(n[1],10):2025,i=n?parseInt(n[2],10):d+1,s=[{id:`minerd-doc-${d}`,date:`${d}-08-04`,title:"Inicio de jornada docente",type:"minerd",source:"MINERD"},{id:`minerd-open-${d}`,date:`${d}-08-25`,title:"Inicio del año escolar",type:"minerd",source:"MINERD"},{id:`holiday-mercedes-${d}`,date:`${d}-09-24`,title:"Día de las Mercedes",type:"holiday"},{id:`holiday-indep-${i}`,date:`${i}-02-27`,title:"Día de la Independencia",type:"holiday"}],r=e.teacherPlanner.customEvents.map(o=>({...o,type:o.type||"custom",source:"Personal"}));return[...s,...r].sort((o,u)=>o.date.localeCompare(u.date))}function h(t){f(),t.innerHTML=`
    <div class="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      <!-- Encabezado y Pestañas -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Agenda Docente</h1>
          <p class="text-slate-500 font-medium">Gestiona tu horario semanal y eventos curriculares.</p>
        </div>
        
        <div class="flex bg-slate-100 p-1.5 rounded-[1.5rem] self-start md:self-auto">
          <button onclick="window.setScheduleTab('schedule')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${c.activeTab==="schedule"?"bg-white shadow-sm text-blue-600":"text-slate-500 hover:text-slate-700"}">
            Horario Semanal
          </button>
          <button onclick="window.setScheduleTab('calendar')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${c.activeTab==="calendar"?"bg-white shadow-sm text-blue-600":"text-slate-500 hover:text-slate-700"}">
            Calendario Escolar
          </button>
        </div>
      </div>

      <div id="schedule-content">
        ${x({S:e,UI:c,obtenerPlannerEvents:E,attendanceMonthStart:w,escapeHtml:p})}
      </div>
    </div>
  `}function P(){S({UI:c,renderSchedulePanel:h,attendanceMonthStart:w,attendanceMonthKey:b,toast:v}),window.RENDERS||(window.RENDERS={}),window.RENDERS.horario=t=>h(t),window.RENDERS.calendario=t=>{c.activeTab="calendar",h(t)}}export{P as inicializar,h as renderizarSchedulePanel};
