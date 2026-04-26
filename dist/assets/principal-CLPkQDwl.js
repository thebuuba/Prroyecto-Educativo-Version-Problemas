import{S as t,p as T,g as _,a as B,b as G,c as H,B as q,d as z,n as w,e as l}from"./main-DiLCuoHx.js";function O(i){var g,b,m,h,v;const o=((g=t.profile)==null?void 0:g.name)||t.sessionUserName||"Docente",d=new Date().getHours(),k=d<12?"Buen día":d<19?"Buenas tardes":"Buenas noches",r=B(),y=G(),$=new Set(r.map(e=>e.id)),p=y.length,c=r.flatMap(e=>{const s=H(e.id,t.activePeriodId);return q.flatMap(u=>{var f;return(((f=s[u])==null?void 0:f.activities)||[]).map(P=>({sectionId:e.id,block:u,activity:P}))})}),n=c.length,E=(t.instruments||[]).filter(e=>!(e!=null&&e.courseId)||$.has(e.courseId)).length,C=c.filter(e=>{var s;return!((s=e.activity)!=null&&s.instrumentId)}).length,I=c.filter(e=>{var s;return!!((s=e.activity)!=null&&s.instrumentId)}).length,S=n?Math.round(I/n*100):0,D=((b=t.schoolYear)==null?void 0:b.name)||"2025-2026",R=z(t.activePeriodId),j=((m=t.profile)==null?void 0:m.inst)||"Configura tu institución",A=new Date().toLocaleDateString("es-DO",{weekday:"long",day:"2-digit",month:"long"}),a=construirElementosEnfoque({courses:r,totalStudents:p,totalActivities:n,pendingInstruments:C,hasPlanning:((h=t.lessonPlans)==null?void 0:h.length)>0})[0],M=String(((v=((a==null?void 0:a.eyebrow)||"").match(/\d+/))==null?void 0:v[0])||"1").padStart(2,"0"),L=[{icon:"person_add",title:"Estudiantes",copy:"Matrícula",action:"window.go('estudiantes')"},{icon:"add_task",title:"Actividades",copy:"Evaluar",action:"window.go('actividades')"},{icon:"grid_view",title:"Matriz",copy:"Calificaciones",action:"window.go('actividades', { activityViewMode: 'matrix' })"},{icon:"description",title:"Reportes",copy:"Exportar",action:"window.go('reportes')"}],x=(r||[]).filter(e=>{const s=w(window.DASHBOARD_COURSE_QUERY||"");return s?w(`${e.grado} ${e.sec} ${e.materia||"General"}`).includes(s):!0}),N=`
    <div class="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <!-- Sección de Cabecera (Hero) -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">${k}, ${l(o)}</h1>
          <p class="text-slate-500 dark:text-slate-400 capitalize">${A}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">${l(j)}</span>
          <span class="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-medium">${l(D)}</span>
          <span class="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-medium">${l(R)}</span>
        </div>
      </header>

      <!-- Cuadrícula de KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderTarjetaEstadistica("Cursos",r.length,"school","text-blue-600 bg-blue-50")}
        ${renderTarjetaEstadistica("Estudiantes",p,"group","text-emerald-600 bg-emerald-50")}
        ${renderTarjetaEstadistica("Actividades",n,"event_note","text-amber-600 bg-amber-50")}
        ${renderTarjetaEstadistica("Cobertura",`${S}%`,"analytics","text-rose-600 bg-rose-50")}
      </div>

      <!-- Diseño Bento -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Foco Central -->
        <div class="lg:col-span-2 space-y-6">
          <section class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <span class="material-symbols-outlined text-8xl">${a.icon}</span>
            </div>
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white">Lo que sigue hoy</h2>
              <span class="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded tracking-wider uppercase">Prioritario</span>
            </div>
            
            <div class="flex gap-6 items-start cursor-pointer group" onclick="${a.clickAction}">
              <div class="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-slate-300 dark:text-slate-700">
                ${M}
              </div>
              <div class="flex-1">
                <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">${a.eyebrow}</p>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">${a.title}</h3>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">${a.text}</p>
                ${a.action}
              </div>
            </div>
          </section>

          <!-- Listado de Mis Cursos -->
          <section class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white">Mis cursos activos</h2>
              <button class="text-blue-600 text-sm font-semibold hover:underline" onclick="window.go('estudiantes')">Gestionar todos</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${x.map(e=>renderElementoCurso(e)).join("")}
              ${x.length===0?'<div class="col-span-full py-12 text-center text-slate-400">No se encontraron cursos activos</div>':""}
            </div>
          </section>
        </div>

        <!-- Acciones Laterales -->
        <div class="space-y-6">
          <section class="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none">
            <h2 class="text-xl font-bold mb-6">Accesos rápidos</h2>
            <div class="grid grid-cols-2 gap-3">
              ${L.map(e=>`
                <button onclick="${e.action}" class="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl border border-white/10 gap-2">
                  <span class="material-symbols-outlined text-2xl">${e.icon}</span>
                  <span class="text-[10px] font-bold uppercase tracking-tighter">${e.title}</span>
                </button>
              `).join("")}
            </div>
          </section>

          <section class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
             <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Matriz de progreso</h2>
             <div class="space-y-4">
               ${renderElementoResumen("Instrumentos",E,"library_books")}
               ${renderElementoResumen("Cursos vacíos",r.filter(e=>studentsInGroup(e.id).length===0).length,"person_off","text-rose-500")}
             </div>
             <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 italic text-slate-400 text-sm text-center">
               "La educación es el arma más poderosa para cambiar el mundo."
             </div>
          </section>
        </div>
      </div>
    </div>
  `;i.innerHTML=N}function K(){window.RENDERS||(window.RENDERS={}),window.RENDERS.dashboard=O,window.openDashboardCourse=i=>{t.activeGroupId=i,t.activeCourseId=i;const o=(t.secciones||[]).find(d=>d.id===i);o!=null&&o.gradeId&&(t.activeGradeId=o.gradeId),T(),_("actividades")}}export{K as init,O as registerDashboardPanel};
