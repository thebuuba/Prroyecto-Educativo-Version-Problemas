import{S as a,p as q,g as z,a as O,b as H,c as S,B as A,d as V,n as C,e as c,s as D}from"./main-DGpyBctX.js";function Y(t){var v,f,w,k,y;const s=((v=a.profile)==null?void 0:v.name)||a.sessionUserName||"Docente",o=new Date().getHours(),i=o<12?"Buen día":o<19?"Buenas tardes":"Buenas noches",n=O(),r=H(),u=new Set(n.map(e=>e.id)),b=r.length,g=n.flatMap(e=>{const d=S(e.id,a.activePeriodId);return A.flatMap(h=>{var $;return((($=d[h])==null?void 0:$.activities)||[]).map(T=>({sectionId:e.id,block:h,activity:T}))})}),p=g.length,P=(a.instruments||[]).filter(e=>!(e!=null&&e.courseId)||u.has(e.courseId)).length,j=g.filter(e=>{var d;return!((d=e.activity)!=null&&d.instrumentId)}).length,E=g.filter(e=>{var d;return!!((d=e.activity)!=null&&d.instrumentId)}).length,M=p?Math.round(E/p*100):0,_=((f=a.schoolYear)==null?void 0:f.name)||"2025-2026",R=V(a.activePeriodId),L=((w=a.profile)==null?void 0:w.inst)||"Configura tu institución",N=new Date().toLocaleDateString("es-DO",{weekday:"long",day:"2-digit",month:"long"}),l=K({courses:n,totalStudents:b,totalActivities:p,pendingInstruments:j,hasPlanning:((k=a.lessonPlans)==null?void 0:k.length)>0})[0],B=String(((y=((l==null?void 0:l.eyebrow)||"").match(/\d+/))==null?void 0:y[0])||"1").padStart(2,"0"),G=[{icon:"person_add",title:"Estudiantes",copy:"Matrícula",action:"window.go('estudiantes')"},{icon:"add_task",title:"Actividades",copy:"Evaluar",action:"window.go('actividades')"},{icon:"grid_view",title:"Matriz",copy:"Calificaciones",action:"window.go('actividades', { activityViewMode: 'matrix' })"},{icon:"description",title:"Reportes",copy:"Exportar",action:"window.go('reportes')"}],m=(n||[]).filter(e=>{const d=C(window.DASHBOARD_COURSE_QUERY||"");return d?C(`${e.grado} ${e.sec} ${e.materia||"General"}`).includes(d):!0});t.innerHTML=`
    <div class="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <!-- Sección de Cabecera (Hero) -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">${i}, ${c(s)}</h1>
          <p class="text-slate-500 dark:text-slate-400 capitalize">${N}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">${c(L)}</span>
          <span class="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-medium">${c(_)}</span>
          <span class="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-medium">${c(R)}</span>
        </div>
      </header>

      <!-- Cuadrícula de KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${x("Cursos",n.length,"school","text-blue-600 bg-blue-50")}
        ${x("Estudiantes",b,"group","text-emerald-600 bg-emerald-50")}
        ${x("Actividades",p,"event_note","text-amber-600 bg-amber-50")}
        ${x("Cobertura",`${M}%`,"analytics","text-rose-600 bg-rose-50")}
      </div>

      <!-- Diseño Bento -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Foco Central -->
        <div class="lg:col-span-2 space-y-6">
          <section class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <span class="material-symbols-outlined text-8xl">${l.icon}</span>
            </div>
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white">Lo que sigue hoy</h2>
              <span class="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded tracking-wider uppercase">Prioritario</span>
            </div>
            
            <div class="flex gap-6 items-start cursor-pointer group" onclick="${l.clickAction}">
              <div class="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-slate-300 dark:text-slate-700">
                ${B}
              </div>
              <div class="flex-1">
                <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">${l.eyebrow}</p>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">${l.title}</h3>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">${l.text}</p>
                ${l.action}
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
              ${m.map(e=>U(e)).join("")}
              ${m.length===0?'<div class="col-span-full py-12 text-center text-slate-400">No se encontraron cursos activos</div>':""}
            </div>
          </section>
        </div>

        <!-- Acciones Laterales -->
        <div class="space-y-6">
          <section class="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none">
            <h2 class="text-xl font-bold mb-6">Accesos rápidos</h2>
            <div class="grid grid-cols-2 gap-3">
              ${G.map(e=>`
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
               ${I("Instrumentos",P,"library_books")}
               ${I("Cursos vacíos",n.filter(e=>D(e.id).length===0).length,"person_off","text-rose-500")}
             </div>
             <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 italic text-slate-400 text-sm text-center">
               "La educación es el arma más poderosa para cambiar el mundo."
             </div>
          </section>
        </div>
      </div>
    </div>
  `}function x(t,s,o,i){return`
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-transform hover:scale-[1.02]">
      <div class="w-12 h-12 rounded-2xl ${i} flex items-center justify-center">
        <span class="material-symbols-outlined">${o}</span>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">${t}</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">${s}</p>
      </div>
    </div>
  `}function U(t){const s=D(t.id).length,o=S(t.id,a.activePeriodId),i=A.flatMap(u=>{var b;return((b=o[u])==null?void 0:b.activities)||[]}),n=i.filter(u=>!!u.instrumentId).length,r=i.length?Math.round(n/i.length*100):0;return`
    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group" 
         onclick="window.openDashboardCourse('${t.id}')">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
             <span class="material-symbols-outlined text-sm">school</span>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800 dark:text-white">${c(t.grado)} ${c(t.sec)}</p>
            <p class="text-[10px] text-slate-500 font-medium">${c(t.materia||"General")} · ${s} est.</p>
          </div>
        </div>
        <span class="text-[10px] font-bold text-blue-600">${r}%</span>
      </div>
      <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-blue-600 transition-all duration-700" style="width: ${r}%"></div>
      </div>
    </div>
  `}function I(t,s,o,i="text-slate-900 dark:text-white"){return`
    <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
          <span class="material-symbols-outlined text-sm">${o}</span>
        </div>
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">${t}</span>
      </div>
      <span class="text-sm font-bold ${i}">${s}</span>
    </div>
  `}function K({courses:t,totalStudents:s,totalActivities:o,pendingInstruments:i,hasPlanning:n}){const r=[];return t.length===0?r.push({tone:"rose",icon:"add_circle",eyebrow:"Paso 1",title:"Crea tu primer curso",text:"Define los grados y secciones que impartirás este año escolar.",clickAction:"window.go('grade-setup')",action:'<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Crear grado</button>'}):s===0?r.push({tone:"aqua",icon:"person_add",eyebrow:"Paso 2",title:"Carga tu matrícula",text:"Agrega los estudiantes a tus secciones para habilitar el registro de asistencia y notas.",clickAction:"window.go('estudiantes')",action:'<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Ir a estudiantes</button>'}):n?o===0?r.push({tone:"amber",icon:"assignment_add",eyebrow:"Paso 4",title:"Define tus actividades",text:"Crea las actividades evaluativas para comenzar a calificar a tus estudiantes.",clickAction:"window.go('actividades')",action:'<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Crear actividades</button>'}):i>0?r.push({tone:"rose",icon:"rule",eyebrow:"Pendiente",title:"Vincula instrumentos",text:`Tienes ${i} actividad(es) sin instrumento de evaluación asignado.`,clickAction:"window.go('instrumentos')",action:'<button class="px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-colors">Vincular instrumentos</button>'}):r.push({tone:"emerald",icon:"verified",eyebrow:"Todo listo",title:"Tu panel está al día",text:"Ya puedes monitorear el progreso de tus secciones y generar reportes periódicos.",clickAction:"window.go('reportes')",action:'<button class="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-colors">Ver reportes</button>'}):r.push({tone:"green",icon:"drafts",eyebrow:"Paso 3",title:"Prepara tu planificación",text:"Organiza las competencias y bloques para el período activo.",clickAction:"window.go('planificaciones')",action:'<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Planificar ahora</button>'}),r}function J(){window.RENDERS||(window.RENDERS={}),window.RENDERS.dashboard=Y,window.openDashboardCourse=t=>{a.activeGroupId=t,a.activeCourseId=t;const s=(a.secciones||[]).find(o=>o.id===t);s!=null&&s.gradeId&&(a.activeGradeId=s.gradeId),q(),z("actividades")}}export{J as init,Y as registerDashboardPanel};
