import{t as l,a as d,S as r}from"./main-BFkCmjLr.js";const t={gradeId:"",section:"A",area:"",subject:"",room:""};function n(a){const s=d();if(s.length===0){l("Crea un grado antes de agregar asignaturas",!0),setTimeout(()=>window.go("grade-setup"),500);return}t.gradeId||(t.gradeId=r.activeGradeId||s[0].id),a.innerHTML=`
    <div class="max-w-[1400px] mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Header -->
      <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <button onclick="window.go('estudiantes')" class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
               <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <span class="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Configuración Académica</span>
          </div>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Nueva Asignatura</h1>
          <p class="text-slate-500 mt-2 text-lg">Agrega una nueva materia a la sección o curso correspondiente.</p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Main Form Column -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- STEP 1: GRADO -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
              Grado y Sección
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${s.map(e=>{const i=t.gradeId===e.id;return`
                  <button 
                    onclick="window.updateSectionCreateField('gradeId', '${e.id}')"
                    class="p-4 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-24 ${i?"border-blue-600 bg-blue-50/50":"border-slate-100 bg-slate-50/50 hover:border-slate-200"}"
                  >
                    <div class="font-black text-slate-900 text-lg">${e.name}</div>
                    <div class="mt-auto flex items-center justify-between">
                       <span class="text-[10px] text-blue-600 font-bold">${i?"Activo":""}</span>
                       <span class="material-symbols-outlined text-sm ${i?"text-blue-600":"text-slate-200"}">check_circle</span>
                    </div>
                  </button>
                `}).join("")}
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2 mb-2">Letra de Sección</label>
                <div class="grid grid-cols-4 gap-2">
                  ${["A","B","C","D"].map(e=>`
                    <button onclick="window.updateSectionCreateField('section', '${e}')" 
                            class="py-3 rounded-2xl font-bold transition-all ${t.section===e?"bg-slate-900 text-white shadow-lg":"bg-slate-50 text-slate-500 hover:bg-slate-100"}">
                      ${e}
                    </button>
                  `).join("")}
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2 mb-2">Aula (Opcional)</label>
                <input type="text" id="sec-room-input" placeholder="Ej. Aula 102" value="${t.room}"
                       class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                       oninput="window.updateSectionCreateField('room', this.value)">
              </div>
            </div>
          </section>

          <!-- STEP 2: ASIGNATURA -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
              Área y Materia
            </h3>
            
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Área Curricular</label>
                <div class="flex flex-wrap gap-2">
                  ${getAreaCatalogForCurrentGrade().map(e=>`
                    <button 
                      onclick="window.updateSectionCreateField('area', '${e.area}')"
                      class="px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 ${t.area===e.area?"bg-violet-600 border-violet-600 text-white shadow-lg":"bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"}"
                    >
                      ${e.area}
                    </button>
                  `).join("")}
                </div>
              </div>
              
              <div id="subject-selector-wrapper">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nombre de la Asignatura</label>
                <div class="flex flex-wrap gap-2" id="subject-grid">
                  <span class="text-xs text-slate-400 italic">Selecciona un área curricular...</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- Sidebar / Preview Column -->
        <div class="lg:col-span-4">
          <div class="sticky top-8 space-y-6">
            
            <!-- Summary Card -->
            <div class="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div class="relative z-10">
                 <h4 class="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">Resumen de la Asignatura</h4>
                 
                 <div class="space-y-6">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <span class="material-symbols-outlined">school</span>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase">Grado y Sección</div>
                        <div class="text-lg font-black" id="preview-grade-label">Pendiente...</div>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-violet-400">
                        <span class="material-symbols-outlined">menu_book</span>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase">Asignatura</div>
                        <div class="text-lg font-black" id="preview-subject-label">Pendiente...</div>
                      </div>
                    </div>
                 </div>

                 <div class="mt-10 pt-8 border-t border-white/5 space-y-4">
                    <button onclick="window.confirmSaveSection()" id="sec-save-btn" class="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group">
                      Crear Asignatura
                      <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button onclick="window.go('estudiantes')" class="w-full py-3 text-slate-500 hover:text-white rounded-2xl font-bold transition-all text-sm">
                      Cancelar
                    </button>
                 </div>
               </div>

               <!-- Decorations -->
               <div class="absolute -right-20 -top-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
               <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
            </div>

            <!-- Tip -->
            <div class="bg-violet-50 rounded-3xl p-6 border border-violet-100 flex gap-4">
              <div class="text-violet-500 flex-shrink-0">
                <span class="material-symbols-outlined">info</span>
              </div>
              <p class="text-xs text-violet-900/60 leading-relaxed font-medium">
                Al crear una materia, se activará automáticamente el registro de calificaciones y asistencia para esa combinación de grado y sección.
              </p>
            </div>

          </div>
        </div>

      </div>

      <!-- Hidden inputs for legacy logic compatibility -->
      <div class="hidden">
        <input type="hidden" id="sec-g">
        <input type="hidden" id="sec-s">
        <input type="hidden" id="sec-m">
        <input type="hidden" id="sec-area">
        <input type="hidden" id="sec-room-data">
      </div>
    </div>
  `,updateSubjectGrid(),updatePreviews()}function c(){window.updateSectionCreateField=(a,s)=>{if(t[a]=s,a==="gradeId"&&(t.area="",t.subject="",updateSubjectGrid()),a==="area"){t.subject="",updateSubjectGrid();const e=getAreaCatalogForCurrentGrade().find(i=>i.area===s);e&&e.subjects.length===1&&(t.subject=e.subjects[0],updateSubjectGrid())}updatePreviews()},window.confirmSaveSection=async()=>{if(typeof window.saveSec!="function"){l("Error: Motor de guardado no disponible",!0);return}try{const a=(s,e)=>{const i=document.getElementById(s);i&&(i.value=e)};a("sec-g",t.gradeId),a("sec-s",t.section),a("sec-m",t.subject),a("sec-area",t.area),a("sec-room-data",t.room),await window.saveSec()}catch(a){console.error("[EduGest][section-create] Error:",a),l("Error al guardar asignatura",!0)}},window.RENDERS||(window.RENDERS={}),window.RENDERS["section-create"]=renderSectionCreatePanel}export{c as inicializar,n as renderizarSectionCreatePanel};
