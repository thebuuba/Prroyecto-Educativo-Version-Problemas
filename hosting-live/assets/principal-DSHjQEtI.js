import{t as c,S as u,s as b,b as x,U as m,V as f,T as g,W as p}from"./main-DQL2LPfz.js";function w({FormState:d,updateSync:n}){window.updateStudentEditField=(s,e)=>{if(s==="matricula"){e=e.replace(/\D/g,"").slice(0,9),e.length>2&&(e=`${e.slice(0,2)}-${e.slice(2)}`),e.length>7&&(e=`${e.slice(0,7)}-${e.slice(7)}`);const a=document.getElementById("se-mat");a&&(a.value=e)}d[s]=e,n()},window.handleStudentEditPhoto=s=>{var o;const e=(o=s==null?void 0:s.files)==null?void 0:o[0];if(!e)return;const a=new FileReader;a.onload=i=>{d.photoUrl=i.target.result,n()},a.readAsDataURL(e)},window.confirmSaveEditStudent=async()=>{if(typeof window.saveEditStudent!="function"){c("Error: Motor de edición no disponible",!0);return}try{await window.saveEditStudent()}catch(s){console.error("[EduGest][student-edit] Error:",s),c("Error al actualizar estudiante",!0)}},window.handleDeleteStudent=s=>{typeof window.delEst=="function"?window.delEst(s):c("Motor de eliminación no disponible",!0)}}let l=null;const t={nombre:"",apellido:"",matricula:"",courseId:"",photoUrl:""};function v(d){const n=u.editingStudentId;if(l=u.estudiantes.find(i=>i.id===n),!l){d.innerHTML=`
      <div class="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div class="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-rose-500">error</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Estudiante no encontrado</h2>
        <p class="text-slate-500 max-w-md mb-8">El registro que buscas no existe o ha sido eliminado.</p>
        <button class="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all" onclick="window.go('estudiantes')">Volver a la lista</button>
      </div>
    `;return}t.nombre=l.nombre,t.apellido=l.apellido,t.matricula=l.matricula,t.courseId=l.courseId||l.sectionId||l.seccionId,t.photoUrl=l.photoUrl||"";const s=b(x()),e=m(l.id,t.courseId),{l:a,c:o}=e!==null?f(e):{l:"?",c:"bg-slate-100 text-slate-400"};d.innerHTML=`
    <div class="max-w-[1400px] mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Header / Profile Banner -->
      <header class="mb-10 flex flex-col md:flex-row items-center gap-8 bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
           <!-- Big Avatar Area -->
           <div class="relative group">
              <div class="w-40 h-40 rounded-[2.5rem] overflow-hidden bg-white/10 border-4 border-white shadow-xl">
                 <img id="se-photo-preview" src="${t.photoUrl||g(`${t.nombre} ${t.apellido}`)}" class="w-full h-full object-cover">
              </div>
              <label for="se-photo-file" class="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg">
                 <span class="material-symbols-outlined text-lg">edit</span>
                 <input type="file" id="se-photo-file" class="hidden" accept="image/*" onchange="window.handleStudentEditPhoto(this)">
              </label>
           </div>

           <div class="flex-1 text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
                 <span class="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Perfil de Estudiante</span>
                 <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                 <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Activo</span>
              </div>
              <h1 class="text-4xl md:text-5xl font-black tracking-tight" id="se-header-name">${t.nombre} ${t.apellido}</h1>
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                 <div class="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-sm font-medium border border-white/5">
                    <span class="material-symbols-outlined text-sm text-slate-400">id_card</span>
                    <span id="se-header-mat">${p(t.matricula)}</span>
                 </div>
                 <div class="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-sm font-medium border border-white/5">
                    <span class="material-symbols-outlined text-sm text-slate-400">school</span>
                    <span id="se-header-grade">${getSectionLabel(t.courseId)}</span>
                 </div>
              </div>
           </div>

           <div class="flex flex-col items-center md:items-end gap-3">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Promedio Actual</div>
              <div class="w-20 h-20 rounded-3xl ${o.replace("bg-","bg-opacity-20 ")} bg-blue-500/20 flex flex-col items-center justify-center border-2 border-white/10">
                 <div class="text-2xl font-black text-white">${e!==null?e:"—"}</div>
                 <div class="text-[10px] font-black text-blue-400">${a}</div>
              </div>
           </div>
        </div>

        <!-- Decorations -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
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
                <input type="text" id="se-nom" value="${t.nombre}"
                       class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                       oninput="window.updateStudentEditField('nombre', this.value)">
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Apellidos</label>
                <input type="text" id="se-ape" value="${t.apellido}"
                       class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                       oninput="window.updateStudentEditField('apellido', this.value)">
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Matrícula</label>
                <input type="text" id="se-mat" value="${p(t.matricula)}"
                       class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                       oninput="window.updateStudentEditField('matricula', this.value)">
              </div>
            </div>
          </section>

          <!-- STEP 2: ASIGNACIÓN ACADÉMICA -->
          <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
              Cambio de Curso o Sección
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${s.map(i=>{const r=t.courseId===i.id;return`
                  <button 
                    onclick="window.updateStudentEditField('courseId', '${i.id}')"
                    class="p-4 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-32 ${r?"border-blue-600 bg-blue-50/50":"border-slate-100 bg-slate-50/50 hover:border-slate-200"}"
                  >
                    <div class="font-black text-slate-900 leading-tight">${i.grado} ${i.sec}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">${i.materia}</div>
                    <div class="mt-auto flex items-center justify-between">
                       <span class="text-[10px] text-blue-600 font-bold">${r?"Seleccionado":""}</span>
                       <span class="material-symbols-outlined text-sm ${r?"text-blue-600":"text-slate-200"}">check_circle</span>
                    </div>
                  </button>
                `}).join("")}
            </div>
          </section>

        </div>

        <!-- Sidebar / Actions Column -->
        <div class="lg:col-span-4 translate-y-[-40px] md:translate-y-0">
          <div class="sticky top-8 space-y-6">
            
            <div class="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-xl">
               <h4 class="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">Acciones de Gestión</h4>
               
               <div class="space-y-4">
                  <button onclick="window.confirmSaveEditStudent()" id="se-save-btn" class="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group">
                    <span class="material-symbols-outlined">save</span>
                    Guardar Cambios
                  </button>
                  <button onclick="window.go('estudiantes')" class="w-full py-4 text-slate-500 hover:bg-slate-50 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">close</span>
                    Descartar
                  </button>
                  <div class="pt-6 mt-6 border-t border-slate-100">
                    <button onclick="window.handleDeleteStudent('${l.id}')" class="w-full py-4 text-rose-500 hover:bg-rose-50 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined">delete</span>
                      Eliminar del Sistema
                    </button>
                  </div>
               </div>
            </div>

            <!-- Hint -->
            <div class="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex gap-4">
              <div class="text-blue-500 flex-shrink-0">
                <span class="material-symbols-outlined">info</span>
              </div>
              <p class="text-xs text-blue-900/60 leading-relaxed font-medium">
                Al cambiar la sección, el estudiante conservará su historial pero su rendimiento se recalculará según los criterios del nuevo grupo.
              </p>
            </div>

          </div>
        </div>

      </div>

      <!-- Hidden inputs for legacy logic compatibility -->
      <div class="hidden">
        <input type="hidden" id="ee-id" value="${l.id}">
        <input type="hidden" id="ee-nom">
        <input type="hidden" id="ee-ape">
        <input type="hidden" id="ee-mat">
        <input type="hidden" id="ee-sec">
        <input type="hidden" id="ee-photo-data">
      </div>
    </div>
  `,updateSync()}function y(){w({FormState:t,updateSync}),window.RENDERS||(window.RENDERS={}),window.RENDERS["student-edit"]=renderStudentEditPanel}export{y as inicializar,v as renderizarStudentEditPanel};
