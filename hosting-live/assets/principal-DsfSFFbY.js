import{S as t,C as i,f as w,D as s,t as f,E as v}from"./main-AFE2lkXK.js";function y(e){const{UI:a}=e;return a.activeTab==="schedule"?renderWeeklySchedule(e):renderMonthlyCalendar(e)}function b(e){const{UI:a,renderSchedulePanel:u,attendanceMonthStart:h,attendanceMonthKey:m,toast:l}=e;function r(){const n=document.getElementById("p-content");n&&u(n)}window.setScheduleTab=n=>{a.activeTab=n==="calendar"?"calendar":"schedule",r()},window.changeCalendarMonth=n=>{const d=h(a.monthKey);d.setMonth(d.getMonth()+n),a.monthKey=m(d),r()},window.openScheduleWizard=()=>{l("El asistente de horario modular está cargando...",!1)},window.editScheduleCell=(n,d,S)=>{l(`Editando bloque: ${n} @ ${d}`,!1)},window.openAddEventModal=()=>{l("Abre el creador de eventos personalizados.",!1)}}const c=[0,1,2,3,4],o={activeTab:"schedule",editor:{mode:"edit",originalKey:"",weekday:0,startTime:"",endTime:"",draft:null,errors:{}},wizard:{step:1,journeyType:"extended",startTime:"07:30",endTime:"11:55",durationsRaw:"40"},monthKey:i()};function x(){(!t.teacherPlanner||typeof t.teacherPlanner!="object")&&(t.teacherPlanner={monthKey:i(),customEvents:[],weeklySchedule:[],activeWeekdays:[...c],journeyType:"extended"}),t.teacherPlanner.activeWeekdays||(t.teacherPlanner.activeWeekdays=[...c]),t.teacherPlanner.weeklySchedule||(t.teacherPlanner.weeklySchedule=[]),t.teacherPlanner.customEvents||(t.teacherPlanner.customEvents=[])}function p(e){x(),e.innerHTML=`
    <div class="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      <!-- Encabezado y Pestañas -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Agenda Docente</h1>
          <p class="text-slate-500 font-medium">Gestiona tu horario semanal y eventos curriculares.</p>
        </div>
        
        <div class="flex bg-slate-100 p-1.5 rounded-[1.5rem] self-start md:self-auto">
          <button onclick="window.setScheduleTab('schedule')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${o.activeTab==="schedule"?"bg-white shadow-sm text-blue-600":"text-slate-500 hover:text-slate-700"}">
            Horario Semanal
          </button>
          <button onclick="window.setScheduleTab('calendar')" 
            class="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${o.activeTab==="calendar"?"bg-white shadow-sm text-blue-600":"text-slate-500 hover:text-slate-700"}">
            Calendario Escolar
          </button>
        </div>
      </div>

      <div id="schedule-content">
        ${y({S:t,UI:o,getPlannerEvents,attendanceMonthStart:s,escapeHtml:w})}
      </div>
    </div>
  `}function T(){b({UI:o,renderSchedulePanel,attendanceMonthStart:s,attendanceMonthKey:v,toast:f}),window.RENDERS||(window.RENDERS={}),window.RENDERS.horario=e=>renderSchedulePanel(e),window.RENDERS.calendario=e=>{o.activeTab="calendar",renderSchedulePanel(e)}}export{T as inicializar,p as renderizarSchedulePanel};
