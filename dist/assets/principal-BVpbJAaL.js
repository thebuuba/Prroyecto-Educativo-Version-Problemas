import{t as o,R as w,S as h}from"./main-AFE2lkXK.js";function y({FormState:e,subjectsForArea:d,updateGradeGrid:i,updateAreaGrid:a,updateSubjectGrid:l,updateSectionGrid:c,updatePreviews:n}){window.updateGradeSetupField=(r,u)=>{if(e[r]=u,r==="level"&&(e.grade="",e.area="",e.subject="",document.querySelectorAll(".grade-setup-card-btn").forEach(t=>{var b,p,g,m,v,x;t.dataset.level===u?(t.classList.add("border-blue-600","bg-blue-50/50"),t.classList.remove("border-slate-100","bg-slate-50/50"),(b=t.querySelector(".grade-level-title"))==null||b.classList.add("text-blue-700"),(p=t.querySelector(".grade-level-title"))==null||p.classList.remove("text-slate-600"),(g=t.querySelector(".grade-level-check"))==null||g.classList.remove("hidden")):(t.classList.remove("border-blue-600","bg-blue-50/50"),t.classList.add("border-slate-100","bg-slate-50/50"),(m=t.querySelector(".grade-level-title"))==null||m.classList.remove("text-blue-700"),(v=t.querySelector(".grade-level-title"))==null||v.classList.add("text-slate-600"),(x=t.querySelector(".grade-level-check"))==null||x.classList.add("hidden"))}),i(),a()),r==="grade"&&i(),r==="area"){e.subject="",a();const t=d(e.level,e.area);t.length===1&&(e.subject=t[0],l())}r==="subject"&&l(),r==="section"&&c(),n()},window.confirmSaveGrade=async()=>{if(!e.grade){o("Debes seleccionar un grado",!0);return}if(!e.area){o("Selecciona el área curricular",!0);return}if(!e.subject){o("Selecciona la asignatura",!0);return}if(typeof window.saveGrade=="function")try{await window.saveGrade(e)}catch(r){console.error("[EduGest][setup] Fallo al guardar grado:",r),o("Error al guardar el grado",!0)}else o("Error: Motor de guardado no inicializado",!0)}}const s={level:"Primaria",grade:"",section:"A",area:"",subject:"",room:""},f={Inicial:[{area:"Desarrollo Personal y Social",subjects:["Identidad","Autonomía","Convivencia"]},{area:"Comunicación",subjects:["Lengua Oral y Escrita","Expresión Artística"]},{area:"Pensamiento Lógico",subjects:["Relación con el Entorno","Pensamiento Matemático"]}],Primaria:[{area:"Lengua Española",subjects:["Lengua Española"]},{area:"Matemática",subjects:["Matemática"]},{area:"Ciencias Sociales",subjects:["Ciencias Sociales"]},{area:"Ciencias de la Naturaleza",subjects:["Ciencias de la Naturaleza"]},{area:"Educación Artística",subjects:["Educación Artística"]},{area:"Educación Física",subjects:["Educación Física"]},{area:"Formación Integral Humana y Religiosa",subjects:["Formación Integral Humana y Religiosa"]},{area:"Lenguas Extranjeras",subjects:["Inglés","Francés"]}],Secundaria:[{area:"Lengua Española",subjects:["Lengua Española","Lengua y Literatura"]},{area:"Matemática",subjects:["Matemática"]},{area:"Ciencias Sociales",subjects:["Ciencias Sociales","Historia","Geografía","Educación Moral y Cívica","Historia y Geografía"]},{area:"Ciencias de la Naturaleza",subjects:["Ciencias de la Naturaleza","Biología","Química","Física"]},{area:"Educación Artística",subjects:["Educación Artística"]},{area:"Educación Física",subjects:["Educación Física"]},{area:"Formación Integral Humana y Religiosa",subjects:["Formación Integral Humana y Religiosa"]},{area:"Lenguas Extranjeras",subjects:["Inglés","Francés"]},{area:"Informática",subjects:["Informática"]}]};function j(e){return f[e]||f.Primaria}function E(e,d){const i=j(e).find(a=>a.area===d);return i?i.subjects:[]}function k(e){s.level="Primaria",s.grade="",s.section="A",s.area="",s.subject="",s.room="";const d=["Inicial","Primaria","Secundaria"],i=w(h);e.innerHTML=`
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
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Nuevo Grado</h1>
          <p class="text-slate-500 mt-2 text-lg">Define la estructura del curso que vas a gestionar este año.</p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Main Form Column -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- STEP 1: NIVEL -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
              Nivel Educativo
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              ${d.map(a=>{const l=s.level===a,c=i.length>0&&!i.some(n=>n.toLowerCase()===a.toLowerCase());return`
                  <button 
                    onclick="window.updateGradeSetupField('level', '${a}')"
                    data-level="${a}"
                    ${c?"disabled":""}
                    class="grade-setup-card-btn group relative p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${l?"border-blue-600 bg-blue-50/50":"border-slate-100 bg-slate-50/50 hover:border-slate-200"} ${c?"opacity-40 cursor-not-allowed grayscale":""}"
                  >
                    <div class="grade-level-title font-bold text-lg ${l?"text-blue-700":"text-slate-600"}">${a}</div>
                    <div class="text-xs ${l?"text-blue-500":"text-slate-400"} mt-1">${c?"No activo en perfil":"Currículo oficial"}</div>
                    <div class="grade-level-check absolute top-4 right-4 text-blue-600 ${l?"":"hidden"}">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                    </div>
                  </button>
                `}).join("")}
            </div>
          </section>

          <!-- STEP 2: GRADO -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
              Grado Específico
            </h3>
            <div id="grade-selector-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
               <!-- Se llena dinámicamente -->
            </div>
          </section>

          <!-- STEP 3: AREA y ASIGNATURA -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
              Área y Asignatura
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Área Curricular</label>
                <div id="area-selector-grid" class="flex flex-wrap gap-2">
                  <!-- Se llena dinámicamente -->
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Asignatura</label>
                <div id="subject-selector-grid" class="flex flex-wrap gap-2">
                  <span class="text-sm text-slate-400 italic py-2">Selecciona un área primero</span>
                </div>
              </div>
            </div>
          </section>

          <!-- STEP 4: DETALLES -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
               <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">Sección</h3>
               <div id="section-selector-grid" class="grid grid-cols-4 gap-2">
                 ${["A","B","C","D"].map(a=>`
                   <button onclick="window.updateGradeSetupField('section', '${a}')" 
                           class="py-3 rounded-2xl font-bold transition-all ${s.section===a?"bg-slate-900 text-white shadow-lg":"bg-slate-50 text-slate-500 hover:bg-slate-100"}">
                     ${a}
                   </button>
                 `).join("")}
               </div>
               <input type="text" id="custom-section" placeholder="Otra..." 
                      class="w-full mt-4 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      oninput="window.updateGradeSetupField('section', this.value)">
             </section>

             <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
               <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">Aula Física</h3>
               <input type="text" id="gs-room" placeholder="Ej. Aula 102, Lab A..." 
                      class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                      oninput="window.updateGradeSetupField('room', this.value)">
             </section>
          </div>

        </div>

        <!-- Sidebar / Preview Column -->
        <div class="lg:col-span-4">
          <div class="sticky top-8 space-y-6">
            
            <!-- Summary Bento Card -->
            <div class="bg-premium-navy rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div class="relative z-10">
                 <h4 class="text-premium-soft font-bold text-[10px] uppercase tracking-widest mb-6">Resumen del Grado</h4>
                 
                 <div class="space-y-6">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <span class="material-symbols-outlined">school</span>
                      </div>
                      <div>
                        <div class="text-[10px] text-premium-muted font-bold uppercase">Nivel y Grado</div>
                        <div class="text-lg font-black" id="preview-grade-label">Pendiente...</div>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-violet-400">
                        <span class="material-symbols-outlined">menu_book</span>
                      </div>
                      <div>
                        <div class="text-[10px] text-premium-muted font-bold uppercase">Área · Asignatura</div>
                        <div class="text-lg font-black" id="preview-subject-label">Pendiente...</div>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                        <span class="material-symbols-outlined">groups</span>
                      </div>
                      <div>
                        <div class="text-[10px] text-premium-muted font-bold uppercase">Sección</div>
                        <div class="text-lg font-black" id="preview-section-label">Sección ${s.section}</div>
                      </div>
                    </div>
                 </div>

                 <div class="mt-10 pt-8 border-t border-white/5">
                    <button onclick="window.confirmSaveGrade()" id="gs-save-btn" class="w-full py-4 btn-premium-azure disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group">
                      Crear Grado
                      <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button onclick="window.go('estudiantes')" class="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-premium-soft rounded-2xl font-bold transition-all">
                      Cancelar
                    </button>
                 </div>
               </div>

               <!-- Decorations -->
               <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
               <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
            </div>

            <!-- Tip Card -->
            <div class="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
              <div class="text-amber-500 flex-shrink-0">
                <span class="material-symbols-outlined">info</span>
              </div>
              <p class="text-xs text-amber-900/60 leading-relaxed font-medium">
                Al crear el grado, se configurarán automáticamente las áreas y asignaturas según el diseño curricular de la República Dominicana para el nivel <span id="gs-tip-level" class="text-amber-700 font-bold">${s.level}</span>.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  `,updateGradeGrid(),updateAreaGrid(),updateSectionGrid(),updatePreviews()}function G(){y({FormState:s,subjectsForArea:E,updateGradeGrid,updateAreaGrid,updateSubjectGrid,updateSectionGrid,updatePreviews}),window.RENDERS||(window.RENDERS={}),window.RENDERS["grade-setup"]=renderGradeSetupPanel}export{G as inicializar,k as renderizarGradeSetupPanel};
