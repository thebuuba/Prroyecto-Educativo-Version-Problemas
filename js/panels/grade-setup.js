/**
 * Panel de Configuración de Grados (Moderno)
 * --------------------------------------------------------------------------
 * Reemplaza el modal 'm-grade' con una interfaz de pantalla completa basada 
 * en Bento Grid, optimizada para velocidad y estética Premium.
 */

import { S } from '../core/state.js';
import { 
  toast, 
  getActiveEducationSections
} from '../core/domain-utils.js';

// Estado local del formulario para reactividad inmediata sin persistir aún
const FormState = {
  level: 'Primaria',
  grade: '',
  section: 'A',
  area: '',
  subject: '',
  room: ''
};

/* -----------------------------------------------------------------------
   Catálogo curricular embebido (subconjunto del oficial dominicano)
   para alimentar los selectores de área y asignatura sin depender del
   bundle monolito.
----------------------------------------------------------------------- */
const AREA_SUBJECTS = {
  Inicial: [
    { area: 'Desarrollo Personal y Social', subjects: ['Identidad', 'Autonomía', 'Convivencia'] },
    { area: 'Comunicación', subjects: ['Lengua Oral y Escrita', 'Expresión Artística'] },
    { area: 'Pensamiento Lógico', subjects: ['Relación con el Entorno', 'Pensamiento Matemático'] },
  ],
  Primaria: [
    { area: 'Lengua Española', subjects: ['Lengua Española'] },
    { area: 'Matemática', subjects: ['Matemática'] },
    { area: 'Ciencias Sociales', subjects: ['Ciencias Sociales'] },
    { area: 'Ciencias de la Naturaleza', subjects: ['Ciencias de la Naturaleza'] },
    { area: 'Educación Artística', subjects: ['Educación Artística'] },
    { area: 'Educación Física', subjects: ['Educación Física'] },
    { area: 'Formación Integral Humana y Religiosa', subjects: ['Formación Integral Humana y Religiosa'] },
    { area: 'Lenguas Extranjeras', subjects: ['Inglés', 'Francés'] },
  ],
  Secundaria: [
    { area: 'Lengua Española', subjects: ['Lengua Española', 'Lengua y Literatura'] },
    { area: 'Matemática', subjects: ['Matemática'] },
    { area: 'Ciencias Sociales', subjects: ['Ciencias Sociales', 'Historia', 'Geografía', 'Educación Moral y Cívica', 'Historia y Geografía'] },
    { area: 'Ciencias de la Naturaleza', subjects: ['Ciencias de la Naturaleza', 'Biología', 'Química', 'Física'] },
    { area: 'Educación Artística', subjects: ['Educación Artística'] },
    { area: 'Educación Física', subjects: ['Educación Física'] },
    { area: 'Formación Integral Humana y Religiosa', subjects: ['Formación Integral Humana y Religiosa'] },
    { area: 'Lenguas Extranjeras', subjects: ['Inglés', 'Francés'] },
    { area: 'Informática', subjects: ['Informática'] },
  ],
};

function areasForLevel(level) {
  return AREA_SUBJECTS[level] || AREA_SUBJECTS.Primaria;
}

function subjectsForArea(level, areaName) {
  const entry = areasForLevel(level).find(a => a.area === areaName);
  return entry ? entry.subjects : [];
}

/**
 * Renderiza el panel de creación de grados.
 */
export function renderGradeSetupPanel(container) {
  // Resetear estado al entrar
  FormState.level = 'Primaria';
  FormState.grade = '';
  FormState.section = 'A';
  FormState.area = '';
  FormState.subject = '';
  FormState.room = '';

  const levels = ['Inicial', 'Primaria', 'Secundaria'];
  const allowedLevels = getActiveEducationSections(S);
  
  container.innerHTML = `
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
              ${levels.map(level => {
                const isSelected = FormState.level === level;
                const isDisabled = allowedLevels.length > 0 && !allowedLevels.some(al => al.toLowerCase() === level.toLowerCase());
                return `
                  <button 
                    onclick="window.updateGradeSetupField('level', '${level}')"
                    data-level="${level}"
                    ${isDisabled ? 'disabled' : ''}
                    class="grade-setup-card-btn group relative p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${isSelected ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'} ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}"
                  >
                    <div class="grade-level-title font-bold text-lg ${isSelected ? 'text-blue-700' : 'text-slate-600'}">${level}</div>
                    <div class="text-xs ${isSelected ? 'text-blue-500' : 'text-slate-400'} mt-1">${isDisabled ? 'No activo en perfil' : 'Currículo oficial'}</div>
                    <div class="grade-level-check absolute top-4 right-4 text-blue-600 ${isSelected ? '' : 'hidden'}">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                    </div>
                  </button>
                `;
              }).join('')}
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
                 ${['A', 'B', 'C', 'D'].map(sec => `
                   <button onclick="window.updateGradeSetupField('section', '${sec}')" 
                           class="py-3 rounded-2xl font-bold transition-all ${FormState.section === sec ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}">
                     ${sec}
                   </button>
                 `).join('')}
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
                        <div class="text-lg font-black" id="preview-section-label">Sección ${FormState.section}</div>
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
                Al crear el grado, se configurarán automáticamente las áreas y asignaturas según el diseño curricular de la República Dominicana para el nivel <span id="gs-tip-level" class="text-amber-700 font-bold">${FormState.level}</span>.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;

  updateGradeGrid();
  updateAreaGrid();
  updateSectionGrid();
  updatePreviews();
}

/**
 * Actualiza la cuadrícula de grados según el nivel seleccionado.
 */
function updateGradeGrid() {
  const grid = document.getElementById('grade-selector-grid');
  if (!grid) return;

  let grades = [];
  if (FormState.level === 'Inicial') grades = ['Parvulario', 'Pre-Kínder', 'Kínder', 'Pre-Primario'];
  else if (FormState.level === 'Primaria') grades = ['1ero', '2do', '3ero', '4to', '5to', '6to'];
  else if (FormState.level === 'Secundaria') grades = ['1ero', '2do', '3ero', '4to', '5to', '6to'];

  grid.innerHTML = grades.map(g => `
    <button 
      onclick="window.updateGradeSetupField('grade', '${g}')"
      class="py-4 rounded-2xl font-black text-sm transition-all border-2 ${FormState.grade === g ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}"
    >
      ${g}
    </button>
  `).join('');
}

/**
 * Actualiza la cuadrícula de áreas curriculares según el nivel.
 */
function updateAreaGrid() {
  const grid = document.getElementById('area-selector-grid');
  if (!grid) return;

  const areas = areasForLevel(FormState.level);
  grid.innerHTML = areas.map(a => `
    <button 
      onclick="window.updateGradeSetupField('area', '${a.area}')"
      class="px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 ${FormState.area === a.area ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}"
    >
      ${a.area}
    </button>
  `).join('');

  updateSubjectGrid();
}

/**
 * Actualiza la cuadrícula de asignaturas según el área seleccionada.
 */
function updateSubjectGrid() {
  const grid = document.getElementById('subject-selector-grid');
  if (!grid) return;

  if (!FormState.area) {
    grid.innerHTML = '<span class="text-sm text-slate-400 italic py-2">Selecciona un área primero</span>';
    return;
  }

  const subjects = subjectsForArea(FormState.level, FormState.area);
  if (!subjects.length) {
    grid.innerHTML = '<span class="text-sm text-slate-400 italic py-2">No hay asignaturas para esta área</span>';
    return;
  }

  // Auto-select si solo hay una asignatura
  if (subjects.length === 1 && !FormState.subject) {
    FormState.subject = subjects[0];
  }

  grid.innerHTML = subjects.map(s => `
    <button 
      onclick="window.updateGradeSetupField('subject', '${s}')"
      class="px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 ${FormState.subject === s ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}"
    >
      ${s}
    </button>
  `).join('');
}

function updateSectionGrid() {
  const grid = document.getElementById('section-selector-grid');
  if (!grid) return;

  const defaultSections = ['A', 'B', 'C', 'D'];
  grid.innerHTML = defaultSections.map(sec => `
    <button
      onclick="window.updateGradeSetupField('section', '${sec}')"
      class="py-3 rounded-2xl font-bold transition-all ${FormState.section === sec ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}"
    >
      ${sec}
    </button>
  `).join('');

  const customInput = document.getElementById('custom-section');
  if (customInput) {
    customInput.value = defaultSections.includes(FormState.section) ? '' : FormState.section;
  }
}

function updatePreviews() {
  const label = document.getElementById('preview-grade-label');
  const sec = document.getElementById('preview-section-label');
  const subj = document.getElementById('preview-subject-label');
  const tip = document.getElementById('gs-tip-level');
  const saveBtn = document.getElementById('gs-save-btn');

  if (label) label.textContent = FormState.grade ? `${FormState.grade} - ${FormState.level}` : 'Pendiente...';
  if (sec) sec.textContent = `Sección ${FormState.section}`;
  if (subj) {
    if (FormState.subject && FormState.area) {
      subj.textContent = `${FormState.subject}`;
    } else if (FormState.area) {
      subj.textContent = `${FormState.area}`;
    } else {
      subj.textContent = 'Pendiente...';
    }
  }
  if (tip) tip.textContent = FormState.level;

  // Habilitar/deshabilitar botón de guardar según validación
  const isValid = FormState.grade && FormState.area && FormState.subject && FormState.section;
  if (saveBtn) {
    saveBtn.disabled = !isValid;
  }
}

/**
 * Bridge functions
 */
window.updateGradeSetupField = (field, value) => {
  FormState[field] = value;
  if (field === 'level') {
    FormState.grade = ''; // Reset grade on level change
    FormState.area = '';  // Reset area on level change
    FormState.subject = ''; // Reset subject on level change
    
    // Actualizar visual de las cards de nivel
    document.querySelectorAll('.grade-setup-card-btn').forEach(btn => {
      const btnLevel = btn.dataset.level;
      const isSelected = btnLevel === value;
      if (isSelected) {
        btn.classList.add('border-blue-600', 'bg-blue-50/50');
        btn.classList.remove('border-slate-100', 'bg-slate-50/50');
        btn.querySelector('.grade-level-title')?.classList.add('text-blue-700');
        btn.querySelector('.grade-level-title')?.classList.remove('text-slate-600');
        btn.querySelector('.grade-level-check')?.classList.remove('hidden');
      } else {
        btn.classList.remove('border-blue-600', 'bg-blue-50/50');
        btn.classList.add('border-slate-100', 'bg-slate-50/50');
        btn.querySelector('.grade-level-title')?.classList.remove('text-blue-700');
        btn.querySelector('.grade-level-title')?.classList.add('text-slate-600');
        btn.querySelector('.grade-level-check')?.classList.add('hidden');
      }
    });

    updateGradeGrid();
    updateAreaGrid();
  }

  if (field === 'grade') {
    updateGradeGrid();
  }

  if (field === 'area') {
    FormState.subject = ''; // Reset subject when area changes
    updateAreaGrid();
    // Auto-select single subject
    const subjects = subjectsForArea(FormState.level, FormState.area);
    if (subjects.length === 1) {
      FormState.subject = subjects[0];
      updateSubjectGrid();
    }
  }

  if (field === 'subject') {
    updateSubjectGrid();
  }

  if (field === 'section') {
    updateSectionGrid();
  }

  updatePreviews();
};

window.confirmSaveGrade = async () => {
  if (!FormState.grade) {
    toast('Debes seleccionar un grado', true);
    return;
  }
  if (!FormState.area) {
    toast('Selecciona el área curricular', true);
    return;
  }
  if (!FormState.subject) {
    toast('Selecciona la asignatura', true);
    return;
  }

  if (typeof window.saveGrade === 'function') {
    try {
      await window.saveGrade(FormState);
    } catch (err) {
      console.error('[EduGest][setup] Fallo al guardar grado:', err);
      toast('Error al guardar el grado', true);
    }
  } else {
    toast('Error: Motor de guardado no inicializado', true);
  }
};

if (!window.RENDERS) window.RENDERS = {};
window.RENDERS['grade-setup'] = renderGradeSetupPanel;
