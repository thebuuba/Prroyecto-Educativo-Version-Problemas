import{S as t,g as o,f as v,a as m,h as f,s as k,i as S,j as y,e as r}from"./main-DiLCuoHx.js";let h="grid";function G(){return h}function I(){window.setStudentsGradeView=s=>{t.activeGradeId=s,o("estudiantes")},window.setActiveSection=s=>{t.activeGroupId=s,t.activeCourseId=s,o("estudiantes")},window.setStudentsViewMode=s=>{h=s==="table"?"table":"grid",o("estudiantes")},window.setStudentsGlobalSearch=s=>{window.STUDENTS_GLOBAL_QUERY=s,o("estudiantes")},window.openStudentSearchResult=s=>{const a=(t.estudiantes||[]).find(l=>l.id===s);if(!a)return;a.gradeId&&(t.activeGradeId=a.gradeId);const i=a.courseId||a.sectionId||a.seccionId;i&&(t.activeGroupId=i,t.activeCourseId=i),window.STUDENTS_GLOBAL_QUERY="",window.openViewStudent(s)},window.openEditStudent=s=>{t.editingStudentId=s,o("student-edit")}}function E(s){var g,w;const a=v(),i=m();if(a.length===0){s.innerHTML=`
      <div class="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-slate-400">school</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Comienza configurando tus grados</h2>
        <p class="text-slate-500 dark:text-slate-400 max-w-md mb-8">Necesitas registrar al menos un grado académico antes de poder gestionar estudiantes.</p>
        <button class="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all hover:scale-105" onclick="window.go('grade-setup')">+ Crear grado</button>
      </div>
    `;return}f();const l=a.some(e=>e.id===t.activeGradeId)?t.activeGradeId:((g=a[0])==null?void 0:g.id)||null;t.activeGradeId=l;const p=a.find(e=>e.id===l)||a[0],n=k(i.filter(e=>e.gradeId===p.id));n.some(e=>e.id===t.activeGroupId)||(t.activeGroupId=((w=n[0])==null?void 0:w.id)||null);const d=n.find(e=>e.id===t.activeGroupId)||n[0];t.activeGroupId=(d==null?void 0:d.id)||null;const c=d?S(d.id):[],u=window.STUDENTS_GLOBAL_QUERY||"",x=y(u),b=G();s.innerHTML=`
    <div class="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <!-- Barra de Acciones Superior -->
      <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="relative flex-1 max-w-2xl">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span class="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input type="search" id="students-global-search" 
                 class="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all" 
                 placeholder="Buscar estudiante por nombre o matrícula..." 
                 value="${r(u)}"
                 oninput="window.setStudentsGlobalSearch(this.value)">
          
          ${u?`
            <div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div class="p-2 space-y-1">
                ${x.length?x.map(e=>renderSearchResult(e)).join(""):'<div class="p-8 text-center text-slate-400">No se encontraron resultados</div>'}
              </div>
            </div>
          `:""}
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 dark:shadow-none" onclick="window.go('student-create')">+ Estudiante</button>
          <button class="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors" onclick="window.openBulkEstM('${t.activeGroupId}')">Carga Masiva</button>
        </div>
      </header>

      <!-- Pestañas de Grados -->
      <nav class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        ${a.map(e=>`
          <button onclick="window.setStudentsGradeView('${e.id}')" 
                  class="shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${e.id===t.activeGradeId?"bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm":"text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"}">
            ${r(e.name)}
          </button>
        `).join("")}

        <button onclick="window.go('grade-setup')" 
                class="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-2 border-dashed border-blue-100 dark:border-blue-800 ml-1"
                title="Agregar nuevo grado">
          <span class="material-symbols-outlined text-sm font-bold">add</span>
        </button>
      </nav>

      <!-- Espacio de Trabajo Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar: Secciones de la asignatura -->
        <aside class="space-y-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Asignaturas / Secciones</h3>
            <button class="text-blue-600 p-1 hover:bg-blue-50 rounded-lg" onclick="window.go('section-create')">
              <span class="material-symbols-outlined text-sm font-bold">add</span>
            </button>
          </div>
          <div class="space-y-2">
            ${n.map(e=>renderSectionMiniCard(e,d==null?void 0:d.id)).join("")}
            ${n.length===0?'<div class="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">Sin secciones</div>':""}
          </div>
        </aside>

        <!-- Contenido Principal: Lista de Estudiantes -->
        <main class="lg:col-span-3 space-y-6">
          ${d?`
            <div class="flex items-center justify-between">
               <div>
                 <h2 class="text-2xl font-black text-slate-900 dark:text-white">${r(d.materia||"General")}</h2>
                 <p class="text-slate-500 font-medium">${r(p.name)} ${r(d.sec)} · ${c.length} estudiantes</p>
               </div>
               <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                 <button onclick="window.setStudentsViewMode('grid')" class="p-2 rounded-lg ${b==="grid"?"bg-white dark:bg-slate-700 shadow-sm text-blue-600":"text-slate-400 hover:text-slate-600"}">
                   <span class="material-symbols-outlined">grid_view</span>
                 </button>
                 <button onclick="window.setStudentsViewMode('table')" class="p-2 rounded-lg ${b==="table"?"bg-white dark:bg-slate-700 shadow-sm text-blue-600":"text-slate-400 hover:text-slate-600"}">
                   <span class="material-symbols-outlined">list</span>
                 </button>
               </div>
            </div>

            ${b==="grid"?`
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                ${c.map(e=>renderStudentCard(e,d.id)).join("")}
              </div>
            `:`
              <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estudiante</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Matrícula</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Final</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${c.map(e=>renderStudentTableRow(e,d.id)).join("")}
                  </tbody>
                </table>
              </div>
            `}
            
            ${c.length===0?`
              <div class="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <p class="text-slate-400">No hay estudiantes registrados en esta sección.</p>
                <button class="mt-4 text-blue-600 font-bold hover:underline" onclick="window.go('student-create')">Agregar ahora</button>
              </div>
            `:""}
          `:`
            <div class="py-20 text-center">
              <p class="text-slate-400">Selecciona una asignatura para comenzar.</p>
            </div>
          `}
        </main>
      </div>
    </div>
  `}function R(){window.RENDERS||(window.RENDERS={}),window.RENDERS.estudiantes=registerStudentsPanel,I()}export{R as inicializar,E as registrarStudentsPanel};
