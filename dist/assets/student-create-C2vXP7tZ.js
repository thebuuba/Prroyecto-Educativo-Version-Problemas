import{t as u,i as y,a as E,S as g,a5 as p}from"./main-xwMOn66X.js";function I({FormState:l,updatePreviews:i}){window.updateStudentCreateField=(s,e)=>{if(s==="matricula"){e=e.replace(/\D/g,"").slice(0,9),e.length>2&&(e=`${e.slice(0,2)}-${e.slice(2)}`),e.length>7&&(e=`${e.slice(0,7)}-${e.slice(7)}`);const a=document.getElementById("sc-mat");a&&(a.value=e)}l[s]=e,i()},window.handleStudentCreatePhoto=s=>{var o;const e=(o=s==null?void 0:s.files)==null?void 0:o[0];if(!e){l.photoUrl="",i();return}const a=new FileReader;a.onload=n=>{l.photoUrl=n.target.result,i()},a.readAsDataURL(e)},window.confirmSaveStudent=async(s=!1)=>{if(typeof window.saveEst!="function"){u("Error: Motor de guardado no disponible",!0);return}try{const e=(a,o)=>{const n=document.getElementById(a);n&&(n.value=o)};if(e("e-nom",l.nombre),e("e-ape",l.apellido),e("e-mat",l.matricula),e("e-sec",l.courseId),e("e-photo-data",l.photoUrl),await window.saveEst({keepOpen:s}),s){l.nombre="",l.apellido="",l.matricula="",l.photoUrl="";const a=document.getElementById("sc-nom"),o=document.getElementById("sc-ape"),n=document.getElementById("sc-mat");a&&(a.value="",a.focus()),o&&(o.value=""),n&&(n.value=""),i()}else window.go("estudiantes")}catch(e){console.error("[EduGest][student-create] Error:",e),u("Error al guardar estudiante",!0)}}}const t={nombre:"",apellido:"",matricula:"",courseId:"",photoUrl:""};function k(l){const i=y(E());if(i.length===0){u("Crea una sección antes de registrar estudiantes",!0),setTimeout(()=>window.go("section-create"),500);return}t.courseId||(t.courseId=g.activeGroupId||i[0].id),l.innerHTML=`
    <div class="max-w-[1400px] mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Header -->
      <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <button onclick="window.go('estudiantes')" class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
               <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <span class="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Gestión Escolar</span>
          </div>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Nuevo Estudiante</h1>
          <p class="text-slate-500 mt-2 text-lg">Registra la información básica del alumno para su seguimiento académico.</p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Main Form Column -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- STEP 1: DATOS PERSONALES -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
              Información Personal
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Nombres</label>
                <input type="text" id="sc-nom" placeholder="Ej. Juan Gabriel" 
                       class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                       oninput="window.updateStudentCreateField('nombre', this.value)">
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Apellidos</label>
                <input type="text" id="sc-ape" placeholder="Ej. Pérez Rosario" 
                       class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                       oninput="window.updateStudentCreateField('apellido', this.value)">
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Matrícula</label>
                <input type="text" id="sc-mat" placeholder="00-0000-0" 
                       class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                       oninput="window.updateStudentCreateField('matricula', this.value)">
              </div>
            </div>
          </section>

          <!-- STEP 2: ASIGNACIÓN ACADÉMICA -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
              Curso o Sección
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${i.map(s=>{const e=t.courseId===s.id;return`
                  <button 
                    onclick="window.updateStudentCreateField('courseId', '${s.id}')"
                    class="p-4 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-32 ${e?"border-blue-600 bg-blue-50/50":"border-slate-100 bg-slate-50/50 hover:border-slate-200"}"
                  >
                    <div class="font-black text-slate-900 leading-tight">${s.grado} ${s.sec}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">${s.materia}</div>
                    <div class="mt-auto flex items-center justify-between">
                       <span class="text-[10px] text-blue-600 font-bold">${e?"Seleccionado":""}</span>
                       <span class="material-symbols-outlined text-sm ${e?"text-blue-600":"text-slate-200"}">check_circle</span>
                    </div>
                  </button>
                `}).join("")}
            </div>
          </section>

          <!-- STEP 3: FOTO (Opcional) -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
              Fotografía
            </h3>
            
            <div class="flex flex-col md:flex-row items-center gap-8">
               <div class="relative group">
                 <div class="w-40 h-40 rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                    <img id="sc-photo-preview" src="${p("")}" class="w-full h-full object-cover">
                 </div>
                 <label for="sc-photo-file" class="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg">
                    <span class="material-symbols-outlined text-lg">add_a_photo</span>
                    <input type="file" id="sc-photo-file" class="hidden" accept="image/*" onchange="window.handleStudentCreatePhoto(this)">
                 </label>
               </div>
               
               <div class="flex-1 space-y-4">
                  <p class="text-slate-400 text-sm leading-relaxed">Sube una foto del estudiante para identificarlo fácilmente en las listas y reportes. Si no subes una, se generará un avatar con sus iniciales.</p>
                  <button onclick="document.getElementById('sc-photo-file').click()" class="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">upload</span>
                    Seleccionar Archivo
                  </button>
               </div>
            </div>
          </section>

        </div>

        <!-- Sidebar / Preview Column -->
        <div class="lg:col-span-4">
          <div class="sticky top-8 space-y-6">
            
            <!-- Student ID Card Preview -->
            <div class="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div class="relative z-10">
                 <h4 class="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">Credencial de Estudiante</h4>
                 
                 <div class="flex flex-col items-center text-center">
                    <div class="w-24 h-24 rounded-3xl overflow-hidden bg-white/10 mb-6 border-2 border-white/20">
                       <img id="preview-student-photo" src="${p("")}" class="w-full h-full object-cover">
                    </div>
                    <div class="text-2xl font-black tracking-tight" id="preview-student-name">Nuevo Alumno</div>
                    <div class="text-blue-400 font-bold text-xs mt-1 uppercase tracking-widest" id="preview-student-mat">SIN MATRÍCULA</div>
                    
                    <div class="mt-8 pt-8 border-t border-white/5 w-full grid grid-cols-2 gap-4">
                       <div class="text-left">
                          <div class="text-[9px] text-slate-500 font-bold uppercase">Grado · Sec</div>
                          <div class="text-sm font-bold" id="preview-student-grade">-</div>
                       </div>
                       <div class="text-right">
                          <div class="text-[9px] text-slate-500 font-bold uppercase">Estado</div>
                          <div class="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                             <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                             Activo
                          </div>
                       </div>
                    </div>
                 </div>

                 <div class="mt-10 space-y-3">
                    <button onclick="window.confirmSaveStudent(true)" id="sc-save-bulk-btn" class="w-full py-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined text-lg">playlist_add</span>
                      Guardar y Agregar Otro
                    </button>
                    <button onclick="window.confirmSaveStudent(false)" id="sc-save-btn" class="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group">
                      Registrar Estudiante
                      <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button onclick="window.go('estudiantes')" class="w-full py-3 text-slate-500 hover:text-white rounded-2xl font-bold transition-all text-sm">
                      Cancelar
                    </button>
                 </div>
               </div>

               <!-- Decorations -->
               <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
               <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            <!-- Hint -->
            <div class="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex gap-4">
              <div class="text-blue-500 flex-shrink-0">
                <span class="material-symbols-outlined">lightbulb</span>
              </div>
              <p class="text-xs text-blue-900/60 leading-relaxed font-medium">
                La matrícula debe tener el formato <span class="text-blue-700 font-bold">00-0000-0</span>. El sistema la formateará automáticamente mientras escribes.
              </p>
            </div>

          </div>
        </div>

      </div>

      <!-- Hidden inputs for legacy logic compatibility -->
      <div class="hidden">
        <input type="hidden" id="e-nom">
        <input type="hidden" id="e-ape">
        <input type="hidden" id="e-mat">
        <input type="hidden" id="e-sec">
        <input type="hidden" id="e-photo-data">
      </div>
    </div>
  `,v()}function v(){const l=document.getElementById("preview-student-name"),i=document.getElementById("preview-student-mat"),s=document.getElementById("preview-student-grade"),e=document.getElementById("preview-student-photo"),a=document.getElementById("sc-photo-preview"),o=document.getElementById("sc-save-btn"),n=document.getElementById("sc-save-bulk-btn"),b=[t.nombre,t.apellido].filter(Boolean).join(" "),w=t.matricula||"SIN MATRÍCULA";l&&(l.textContent=b||"Nuevo Alumno"),i&&(i.textContent=w);const r=g.secciones.find(c=>c.id===t.courseId);s&&(s.textContent=r?`${r.grado}${r.sec}`:"-");const m=p(b);e&&(e.src=t.photoUrl||m),a&&(a.src=t.photoUrl||m);const f=t.nombre&&t.apellido&&t.matricula&&t.courseId;o&&(o.disabled=!f),n&&(n.disabled=!f);const d=(c,h)=>{const x=document.getElementById(c);x&&(x.value=h)};d("e-nom",t.nombre),d("e-ape",t.apellido),d("e-mat",t.matricula),d("e-sec",t.courseId),d("e-photo-data",t.photoUrl)}function C(){I({FormState:t,updatePreviews:v}),window.RENDERS||(window.RENDERS={}),window.RENDERS["student-create"]=k}export{C as init,k as renderStudentCreatePanel};
