/**
 * Planning Panel Module
 * 
 * Este módulo implementa la interfaz de diseño curricular basado en una arquitectura
 * de "Bento Grid" para el home y un "Multi-step wizard" para el editor.
 * Consolida la lógica de las antiguas secciones 14, 15, 16 y 23.
 * 
 * Depende de:
 * - ../core/domain-utils.js: Lógica de negocio y cálculos.
 * - ../core/state.js (vía window.S): Estado reactivo simplificado.
 */

import { 
  fmtDate, 
  uid, 
  lessonPlanCreateBlank,
  lessonPlanNormalizePlan,
  lessonPlanDraft,
  lessonPlansForGroup,
  lessonPlanDrafts,
  ensureLessonPlansState,
  lessonPlanRelativeUpdatedAt,
  lessonPlanPersistDraftNow,
  lessonPlanAvailableGrades,
  lessonPlanSectionOptionsForGradeId,
  lessonPlanAreaOptions,
} from '../core/domain-utils.js';

import { 
  LESSON_PLAN_TRANSVERSAL_AXES,
} from '../core/constants.js';

/**
 * Helper para obtener el estado actual asegurando que los contenedores de 
 * planificaciones estén inicializados en window.S.
 * @returns {Object} Referencia al estado global.
 */
function getPlanningState() {
  ensureLessonPlansState();
  return window.S;
}

/**
 * Acción global para crear una nueva planificación.
 * Inicializa un borrador blanco y cambia la UI al modo editor.
 */
window.lessonPlanNew = () => {
  const S = getPlanningState();
  S.lessonPlanDraft = lessonPlanCreateBlank(S.activeGroupId, S.activePeriodId);
  S.lessonPlanUi.mode = 'editor';
  S.lessonPlanUi.activeSectionId = 'general';
  window.go('planificaciones');
};

window.lessonPlanContinue = (id) => {
  const S = getPlanningState();
  const plan = S.lessonPlans.find(p => p.id === id);
  if (plan) {
    S.lessonPlanDraft = JSON.parse(JSON.stringify(plan));
    S.lessonPlanUi.mode = 'editor';
    S.lessonPlanUi.activeSectionId = plan.editorStep || 'general';
    window.go('planificaciones');
  }
};

window.lessonPlanReturnHome = () => {
  const S = getPlanningState();
  S.lessonPlanUi.mode = 'home';
  window.go('planificaciones');
};

window.lessonPlanSetActiveSection = (sectionId) => {
  const S = getPlanningState();
  S.lessonPlanUi.activeSectionId = sectionId;
  lessonPlanPersistDraftNow();
  window.go('planificaciones');
};

/**
 * Field Update Actions
 */
window.lessonPlanSetGeneralField = (field, value) => {
  const draft = lessonPlanDraft();
  const parts = field.split('.');
  if (parts.length === 2) {
    draft[parts[0]][parts[1]] = value;
  } else {
    draft[field] = value;
  }
};

window.lessonPlanSetCurriculumField = (field, value) => {
  const draft = lessonPlanDraft();
  draft.curriculum[field] = value;
};

/**
 * --- Componentes de Renderizado (UI) ---
 */

/**
 * Renderiza el encabezado del panel con contadores de actividad.
 * @param {number} draftsCount - Cantidad de borradores.
 * @param {number} totalCount - Cantidad total de planes.
 * @returns {string} HTML.
 */
function renderHeader(draftsCount, totalCount) {
  return `
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Planificaciones</h1>
        <p class="text-slate-500 mt-1">Gestión académica y diseño curricular modular.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Activas</span>
          <span class="text-lg font-bold text-slate-700">${totalCount}</span>
        </div>
        <div class="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Borradores</span>
          <span class="text-lg font-bold text-amber-600">${draftsCount}</span>
        </div>
      </div>
    </header>
  `;
}

function renderCtaCard() {
  return `
    <div class="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 transition-all hover:shadow-2xl hover:-translate-y-1">
      <div class="relative z-10">
        <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </div>
        <h3 class="text-2xl font-bold mb-2">Nueva Planificación</h3>
        <p class="text-indigo-100 mb-8 max-w-[240px]">Inicia un nuevo diseño curricular guiado paso a paso.</p>
        <button onclick="lessonPlanNew()" class="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg shadow-black/5 hover:bg-slate-50 transition-colors">
          Comenzar ahora
        </button>
      </div>
      <div class="absolute -right-4 -bottom-4 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
    </div>
  `;
}

function renderDraftList(drafts) {
  if (!drafts.length) {
    return `
      <div class="flex flex-col items-center justify-center h-full py-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
        <div class="w-12 h-12 text-slate-300 mb-3">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
        </div>
        <p class="text-slate-500 font-medium">No hay borradores</p>
      </div>
    `;
  }

  return `
    <div class="space-y-3">
      ${drafts.slice(0, 3).map(plan => `
        <div onclick="lessonPlanContinue('${plan.id}')" class="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
          <div class="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-slate-800 truncate">${plan.general?.themeTitle || plan.general?.title || 'Sin título'}</h4>
            <p class="text-xs text-slate-500">${lessonPlanRelativeUpdatedAt(plan.updatedAt)}</p>
          </div>
          <svg class="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPlanCard(plan) {
  return `
    <div class="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:border-slate-300 transition-all group">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">${plan.general.themeTitle || plan.general.title || 'Planificación'}</h4>
            <p class="text-xs text-slate-500">${fmtDate(plan.general.classDate || plan.general.startDate)}</p>
          </div>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="lessonPlanContinue('${plan.id}')" class="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Editar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
        </div>
      </div>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">${plan.general.subject}</span>
          <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">${plan.general.gradeName} ${plan.general.sectionName}</span>
        </div>
        <div class="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            ${plan.classes.length} clases
          </span>
          <span>Actualizado ${lessonPlanRelativeUpdatedAt(plan.updatedAt)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Editor Steps
 */

function renderStepRail(activeId) {
  const steps = [
    { id: 'general', label: 'General', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'curriculum', label: 'Currículo', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'design', label: 'Diseño', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'evaluation', label: 'Evaluación', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'preview', label: 'Vista Final', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' }
  ];

  return `
    <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl mb-8">
      ${steps.map((step) => {
        const isActive = step.id === activeId;
        return `
          <button onclick="lessonPlanSetActiveSection('${step.id}')" class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${isActive ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}">
            <span class="w-5 h-5 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${step.icon}"></path></svg>
            </span>
            <span class="hidden md:inline text-sm">${step.label}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function renderEditorGeneral(draft) {
  const grades = lessonPlanAvailableGrades();
  const sections = lessonPlanSectionOptionsForGradeId(draft.general.gradeId);

  return `
    <div class="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-6">
          <h4 class="text-sm font-bold text-indigo-600 uppercase tracking-widest">Contexto Institucional</h4>
          <div class="space-y-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Centro Educativo</label>
              <input type="text" value="${draft.general.center || ''}" oninput="lessonPlanSetGeneralField('general.center', this.value)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre del Docente</label>
              <input type="text" value="${draft.general.teacher || ''}" oninput="lessonPlanSetGeneralField('general.teacher', this.value)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium">
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <h4 class="text-sm font-bold text-indigo-600 uppercase tracking-widest">Detalles del Curso</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 col-span-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Grado Académico</label>
              <select onchange="lessonPlanSetGeneralField('general.gradeId', this.value)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium appearance-none cursor-pointer">
                <option value="">Seleccionar grado...</option>
                ${grades.map(g => `<option value="${g.id}" ${draft.general.gradeId === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Sección</label>
              <select onchange="lessonPlanSetGeneralField('general.sectionName', this.value)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium appearance-none cursor-pointer">
                <option value="">Seleccionar...</option>
                ${sections.map(s => `<option value="${s.value}" ${draft.general.sectionName === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Período</label>
              <select onchange="lessonPlanSetGeneralField('general.periodId', this.value)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium appearance-none cursor-pointer">
                <option value="P1" ${draft.general.periodId === 'P1' ? 'selected' : ''}>P1</option>
                <option value="P2" ${draft.general.periodId === 'P2' ? 'selected' : ''}>P2</option>
                <option value="P3" ${draft.general.periodId === 'P3' ? 'selected' : ''}>P3</option>
                <option value="P4" ${draft.general.periodId === 'P4' ? 'selected' : ''}>P4</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6 pt-10 border-t border-slate-100">
        <h4 class="text-sm font-bold text-indigo-600 uppercase tracking-widest">Identificación de la Planificación</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Título del Tema o Unidad</label>
            <input type="text" value="${draft.general.themeTitle || draft.general.title || ''}" oninput="lessonPlanSetGeneralField('general.themeTitle', this.value)" placeholder="Ej. Los ecosistemas marinos" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-bold text-lg">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Fecha de Inicio</label>
            <input type="date" value="${draft.general.startDate || ''}" onchange="lessonPlanSetGeneralField('general.startDate', this.value)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Eje Transversal</label>
            <select onchange="lessonPlanSetGeneralField('general.transversalAxis', this.value)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium appearance-none cursor-pointer">
              <option value="">Ninguno</option>
              ${LESSON_PLAN_TRANSVERSAL_AXES.map(axis => `<option value="${axis.value}" ${draft.general.transversalAxis === axis.value ? 'selected' : ''}>${axis.value}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEditorCurriculum(draft) {
  return `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div class="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-start gap-4">
        <div class="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h4 class="font-bold text-indigo-900">Base Curricular</h4>
          <p class="text-sm text-indigo-700/70">Define las competencias y contenidos clave. Estos elementos aparecerán automáticamente en tu plantilla final.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div class="space-y-3">
          <label class="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Competencias Fundamentales</label>
          <textarea oninput="lessonPlanSetCurriculumField('fundamentalCompetencies', this.value)" rows="3" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium leading-relaxed" placeholder="Ej. Ética y Ciudadana, Comunicativa...">${draft.curriculum.fundamentalCompetencies || ''}</textarea>
        </div>

        <div class="space-y-3">
          <label class="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Competencias Específicas</label>
          <textarea oninput="lessonPlanSetCurriculumField('specificCompetencies', this.value)" rows="4" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium leading-relaxed" placeholder="Describe las competencias específicas de la unidad...">${draft.curriculum.specificCompetencies || ''}</textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <label class="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Contenidos Conceptuales</label>
            <textarea oninput="lessonPlanSetCurriculumField('conceptualContents', this.value)" rows="5" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium leading-relaxed">${draft.curriculum.conceptualContents || ''}</textarea>
          </div>
          <div class="space-y-3">
            <label class="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Indicadores de Logro</label>
            <textarea oninput="lessonPlanSetCurriculumField('indicators', this.value)" rows="5" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium leading-relaxed">${draft.curriculum.indicators || ''}</textarea>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEditorDesign(draft) {
  return `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-xl font-bold text-slate-800">Secuencia de Clases</h4>
          <p class="text-sm text-slate-500">Planifica el desarrollo de cada clase diaria.</p>
        </div>
        <button class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Agregar Clase
        </button>
      </div>

      <div class="space-y-6">
        ${draft.classes.map((c, i) => `
          <div class="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden group">
            <div class="p-6 flex items-center justify-between bg-white border-b border-slate-100">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                  ${i + 1}
                </div>
                <div>
                  <h5 class="font-bold text-slate-800">${c.title || `Clase ${i + 1}`}</h5>
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">${fmtDate(c.date) || 'Sin fecha'}</p>
                </div>
              </div>
              <button class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>
            
            <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="space-y-3">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Inicio (15%)</label>
                <textarea rows="4" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm leading-relaxed" placeholder="Introducción, saberes previos...">${c.start?.description || ''}</textarea>
              </div>
              <div class="space-y-3">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Desarrollo (70%)</label>
                <textarea rows="4" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm leading-relaxed" placeholder="Actividades centrales...">${c.development?.description || ''}</textarea>
              </div>
              <div class="space-y-3">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cierre (15%)</label>
                <textarea rows="4" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm leading-relaxed" placeholder="Síntesis y evaluación...">${c.closure?.summary || ''}</textarea>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderEditorEvaluation(draft) {
  return `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div class="p-6 bg-slate-900 rounded-3xl text-white flex items-start gap-6">
        <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
        </div>
        <div>
          <h4 class="text-lg font-bold">Evaluación y Recursos</h4>
          <p class="text-slate-400 text-sm">Define cómo medirás el aprendizaje y qué materiales utilizarás en esta planificación.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-6">
          <div class="space-y-3">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Estrategias de Evaluación</label>
            <textarea oninput="lessonPlanSetGeneralField('strategy.methodology', this.value)" rows="4" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium leading-relaxed">${draft.strategy?.methodology || ''}</textarea>
          </div>
          <div class="space-y-3">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Técnicas e Instrumentos</label>
            <textarea rows="4" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium leading-relaxed" placeholder="Menciona las técnicas (ej. observación) e instrumentos (ej. rúbrica)..."></textarea>
          </div>
        </div>

        <div class="space-y-6">
          <div class="space-y-3">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Recursos Didácticos</label>
            <textarea oninput="lessonPlanSetGeneralField('resources.notes', this.value)" rows="4" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium leading-relaxed">${draft.resources?.notes || ''}</textarea>
          </div>
          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h5 class="text-sm font-bold text-slate-700 mb-3">Sugerencias de Recursos</h5>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 font-medium">Libro de texto</span>
              <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 font-medium">Pizarra digital</span>
              <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 font-medium">Mapas</span>
              <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 font-medium">Videos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEditorPreview(draft) {
  return `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div class="flex items-center justify-between">
        <h4 class="text-xl font-bold text-slate-800">Vista Previa Institucional</h4>
        <button class="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Exportar PDF
        </button>
      </div>

      <div class="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden text-slate-800 font-serif p-10 max-w-[800px] mx-auto text-left">
        <div class="border-b-2 border-slate-900 pb-6 mb-8 text-center">
          <h2 class="text-2xl font-bold uppercase tracking-tight">${draft.general.center || 'CENTRO EDUCATIVO'}</h2>
          <p class="text-sm font-bold mt-1">PLANIFICACIÓN DOCENTE DE UNIDAD / CLASE</p>
        </div>

        <div class="grid grid-cols-2 gap-y-3 text-sm mb-10">
          <div class="flex gap-2"><span class="font-bold">Docente:</span> <span>${draft.general.teacher || '---'}</span></div>
          <div class="flex gap-2"><span class="font-bold">Fecha:</span> <span>${fmtDate(draft.general.startDate) || '---'}</span></div>
          <div class="flex gap-2"><span class="font-bold">Grado/Sección:</span> <span>${draft.general.gradeName || '---'} ${draft.general.sectionName || ''}</span></div>
          <div class="flex gap-2"><span class="font-bold">Asignatura:</span> <span>${draft.general.subject || '---'}</span></div>
        </div>

        <div class="space-y-8">
          <section>
            <h5 class="text-xs font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded w-fit mb-4">I. Tema de la Unidad</h5>
            <p class="text-lg font-bold">${draft.general.themeTitle || draft.general.title || 'Sin completar'}</p>
          </section>

          <section>
            <h5 class="text-xs font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded w-fit mb-4">II. Competencias</h5>
            <div class="grid grid-cols-1 gap-4">
              <div class="text-sm"><span class="font-bold block mb-1">Fundamentales:</span> <p class="whitespace-pre-line">${draft.curriculum.fundamentalCompetencies || '---'}</p></div>
              <div class="text-sm"><span class="font-bold block mb-1">Específicas:</span> <p class="whitespace-pre-line">${draft.curriculum.specificCompetencies || '---'}</p></div>
            </div>
          </section>

          <section>
            <h5 class="text-xs font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded w-fit mb-4">III. Secuencia de Clases</h5>
            <div class="space-y-6">
              ${draft.classes.map((c, i) => `
                <div class="p-4 border border-slate-100 rounded-2xl">
                  <span class="text-xs font-bold text-slate-400">CLASE ${i + 1}: ${c.title || 'Tema diario'}</span>
                  <div class="grid grid-cols-1 gap-2 mt-2 text-sm">
                    <p><span class="font-bold italic">Inicio:</span> ${c.start?.description || '---'}</p>
                    <p><span class="font-bold italic">Desarrollo:</span> ${c.development?.description || '---'}</p>
                    <p><span class="font-bold italic">Cierre:</span> ${c.closure?.summary || '---'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}

/**
 * Main Render Entry Point
 */
export function renderPlanningPanel(container) {
  const S = getPlanningState();
  const mode = S.lessonPlanUi.mode || 'home';
  const drafts = lessonPlanDrafts();
  const plans = lessonPlansForGroup(S.activeGroupId);
  const totalCount = plans.length;
  
  if (mode === 'home') {
    container.innerHTML = `
      <div class="max-w-[1240px] mx-auto p-6 md:p-10 animate-in fade-in duration-500">
        ${renderHeader(drafts.length, totalCount)}
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Main Bento Section -->
          <div class="lg:col-span-8 flex flex-col gap-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              ${renderCtaCard()}
              
              <div class="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-bold text-slate-800">Recientes</h3>
                  <span class="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold uppercase tracking-wider">Borradores</span>
                </div>
                ${renderDraftList(drafts)}
              </div>
            </div>
            
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold text-slate-800">Planificaciones del grupo</h3>
              </div>
              
              ${plans.length ? `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${plans.map(renderPlanCard).join('')}
                </div>
              ` : `
                <div class="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h4 class="text-xl font-bold text-slate-800 mb-2">Comienza a planificar</h4>
                  <p class="text-slate-500 max-w-sm mx-auto">Aún no hay planificaciones completadas en este grupo. Crea una nueva para comenzar.</p>
                </div>
              `}
            </div>
          </div>
          
          <!-- Sidebar Stats Bento Section -->
          <div class="lg:col-span-4 flex flex-col gap-8">
            <div class="bg-slate-900 rounded-[2rem] p-8 text-white">
              <h3 class="text-lg font-bold mb-6">Métricas de Diseño</h3>
              <div class="space-y-6">
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Carga Curricular</span>
                    <span class="text-2xl font-bold">84%</span>
                  </div>
                  <div class="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-400 w-[84%]"></div>
                  </div>
                </div>
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Actividades Unidas</span>
                    <span class="text-2xl font-bold">12</span>
                  </div>
                  <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (mode === 'editor') {
    const draft = S.lessonPlanDraft;
    const activeSectionId = S.lessonPlanUi.activeSectionId || 'general';
    container.innerHTML = `
      <div class="max-w-[1000px] mx-auto p-6 md:p-10 animate-in slide-in-from-bottom-5 duration-500">
        <div class="flex items-center justify-between mb-8">
          <button onclick="lessonPlanReturnHome()" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Volver
          </button>
          <div class="flex gap-3">
            <button onclick="lessonPlanPersistDraftNow()" class="px-7 py-2.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">
              Guardar Borrador
            </button>
          </div>
        </div>

        ${renderStepRail(activeSectionId)}

        <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50">
          ${activeSectionId === 'general' ? renderEditorGeneral(draft) : ''}
          ${activeSectionId === 'curriculum' ? renderEditorCurriculum(draft) : ''}
          ${activeSectionId === 'design' ? renderEditorDesign(draft) : ''}
          ${activeSectionId === 'evaluation' ? renderEditorEvaluation(draft) : ''}
          ${activeSectionId === 'preview' ? renderEditorPreview(draft) : ''}
        </div>
      </div>
    `;
  }
}

// Initial Registration
window.RENDERS.planificaciones = renderPlanningPanel;
