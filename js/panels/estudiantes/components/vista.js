/**
 * Módulo del Panel de Estudiantes (EduGest Students).
 * --------------------------------------------------------------------------
 * Proporciona la interfaz principal para la gestión de alumnos.
 * Incluye visualización en cuadrícula (grid) y tabla, filtrado por grados 
 * y secciones, y un motor de búsqueda global integrado.
 */

import { S } from '../../../core/state.js';
import { 
  getScopedSections, 
  getScopedStudents, 
  getScopedGrades,
  studentsInGroup,
  studentFinal,
  getGrade,
  normalizeCourseSearchText,
  getStudentSearchResults,
  ensureActiveContext
} from '../../../core/domain-utils.js';
import { sortCourses, escapeHtml } from '../../../core/utils.js';
import { getStudentsViewMode } from '../utils/actions.js';

/**
 * Renderiza el panel bento moderno de gestión de estudiantes.
 * @param {HTMLElement} c - Elemento contenedor.
 */
export function registrarStudentsPanel(c) {
  const scopedGrades = getScopedGrades();
  const scopedSections = getScopedSections();
  
  if (scopedGrades.length === 0) {
    c.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-slate-400">school</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Comienza configurando tus grados</h2>
        <p class="text-slate-500 dark:text-slate-400 max-w-md mb-8">Necesitas registrar al menos un grado académico antes de poder gestionar estudiantes.</p>
        <button class="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all hover:scale-105" onclick="window.go('grade-setup')">+ Crear grado</button>
      </div>
    `;
    return;
  }

  ensureActiveContext();
  const selectedGradeId = scopedGrades.some(g => g.id === S.activeGradeId) ? S.activeGradeId : scopedGrades[0]?.id || null;
  S.activeGradeId = selectedGradeId;
  const activeGrade = scopedGrades.find(g => g.id === selectedGradeId) || scopedGrades[0];
  const gradeSections = sortCourses(scopedSections.filter(s => s.gradeId === activeGrade.id));
  
  if (!gradeSections.some(sec => sec.id === S.activeGroupId)) {
    S.activeGroupId = gradeSections[0]?.id || null;
  }
  const selectedSection = gradeSections.find(sec => sec.id === S.activeGroupId) || gradeSections[0];
  S.activeGroupId = selectedSection?.id || null;

  const tableStudents = selectedSection ? studentsInGroup(selectedSection.id) : [];
  const searchQuery = window.STUDENTS_GLOBAL_QUERY || '';
  const searchResults = getStudentSearchResults(searchQuery);
  const studentsViewMode = getStudentsViewMode();

  c.innerHTML = `
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
                 value="${escapeHtml(searchQuery)}"
                 oninput="window.setStudentsGlobalSearch(this.value)">
          
          ${searchQuery ? `
            <div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div class="p-2 space-y-1">
                ${searchResults.length ? searchResults.map(res => renderSearchResult(res)).join('') : '<div class="p-8 text-center text-slate-400">No se encontraron resultados</div>'}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 dark:shadow-none" onclick="window.go('student-create')">+ Estudiante</button>
          <button class="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors" onclick="window.openBulkEstM('${S.activeGroupId}')">Carga Masiva</button>
        </div>
      </header>

      <!-- Pestañas de Grados -->
      <nav class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        ${scopedGrades.map(gr => `
          <button onclick="window.setStudentsGradeView('${gr.id}')" 
                  class="shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${gr.id === S.activeGradeId ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}">
            ${escapeHtml(gr.name)}
          </button>
        `).join('')}

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
            ${gradeSections.map(sec => renderSectionMiniCard(sec, selectedSection?.id)).join('')}
            ${gradeSections.length === 0 ? '<div class="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">Sin secciones</div>' : ''}
          </div>
        </aside>

        <!-- Contenido Principal: Lista de Estudiantes -->
        <main class="lg:col-span-3 space-y-6">
          ${selectedSection ? `
            <div class="flex items-center justify-between">
               <div>
                 <h2 class="text-2xl font-black text-slate-900 dark:text-white">${escapeHtml(selectedSection.materia || 'General')}</h2>
                 <p class="text-slate-500 font-medium">${escapeHtml(activeGrade.name)} ${escapeHtml(selectedSection.sec)} · ${tableStudents.length} estudiantes</p>
               </div>
               <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                 <button onclick="window.setStudentsViewMode('grid')" class="p-2 rounded-lg ${studentsViewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}">
                   <span class="material-symbols-outlined">grid_view</span>
                 </button>
                 <button onclick="window.setStudentsViewMode('table')" class="p-2 rounded-lg ${studentsViewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}">
                   <span class="material-symbols-outlined">list</span>
                 </button>
               </div>
            </div>

            ${studentsViewMode === 'grid' ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                ${tableStudents.map(st => renderStudentCard(st, selectedSection.id)).join('')}
              </div>
            ` : `
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
                    ${tableStudents.map(st => renderStudentTableRow(st, selectedSection.id)).join('')}
                  </tbody>
                </table>
              </div>
            `}
            
            ${tableStudents.length === 0 ? `
              <div class="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <p class="text-slate-400">No hay estudiantes registrados en esta sección.</p>
                <button class="mt-4 text-blue-600 font-bold hover:underline" onclick="window.go('student-create')">Agregar ahora</button>
              </div>
            ` : ''}
          ` : `
            <div class="py-20 text-center">
              <p class="text-slate-400">Selecciona una asignatura para comenzar.</p>
            </div>
          `}
        </main>
      </div>
    </div>
  `;
}

/**
 * Renderiza una mini tarjeta lateral para una sección/asignatura.
 * @private
 */
function renderizarSectionMiniCard(sec, selectedId) {
  const isActive = sec.id === selectedId;
  const count = studentsInGroup(sec.id).length;
  return `
    <button onclick="window.setActiveSection('${sec.id}')" 
            class="w-full p-4 text-left rounded-2xl border transition-all ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none translate-x-1' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'}">
      <div class="font-bold text-sm mb-1">${escapeHtml(sec.materia || 'General')}</div>
      <div class="flex items-center justify-between opacity-80 decoration-inherit">
        <span class="text-[10px] font-bold uppercase tracking-wider">${escapeHtml(sec.sec)}</span>
        <span class="text-[10px] font-bold uppercase tracking-wider">${count} est.</span>
      </div>
    </button>
  `;
}

/**
 * Renderiza una tarjeta de estudiante (modo Grid).
 * @private
 */
function renderizarStudentCard(st, sectionId) {
  const final = studentFinal(st.id, sectionId);
  const { l, c } = final !== null ? getGrade(final) : { l: '?', c: 'bg-slate-100 dark:bg-slate-800 text-slate-400' };
  
  // Lógica de estados basados en la calificación final
  const statusLabel = final === null ? 'Pendiente' : final >= 75 ? 'Aprobado' : final >= 60 ? 'En riesgo' : 'Reprobado';
  const statusColor = final === null ? 'bg-slate-100 text-slate-500' : final >= 75 ? 'bg-emerald-50 text-emerald-600' : final >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600';

  return `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden" ondblclick="window.openViewStudent('${st.id}')">
      <div class="flex justify-between items-start mb-4">
        <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button class="p-2 text-slate-400 hover:text-blue-600" onclick="window.openEditStudent('${st.id}')"><span class="material-symbols-outlined text-sm">edit</span></button>
           <button class="p-2 text-slate-400 hover:text-rose-500" onclick="window.delEst('${st.id}')"><span class="material-symbols-outlined text-sm">delete</span></button>
        </div>
      </div>
      <div>
        <h4 class="font-bold text-slate-900 dark:text-white mb-1 truncate leading-tight">${escapeHtml(st.nombre)} ${escapeHtml(st.apellido)}</h4>
        <p class="text-xs font-medium text-slate-400 mb-4 tracking-wide">${escapeHtml(st.matricula || 'SIN MATRÍCULA')}</p>
      </div>
      <div class="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
        <span class="px-2 py-1 ${statusColor} text-[10px] font-black uppercase rounded tracking-wider">${statusLabel}</span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Promedio</span>
          <span class="w-8 h-8 rounded-lg ${c.replace('g','bg-').replace('A','emerald-500').replace('B','blue-500').replace('C','amber-500').replace('D','rose-500')} flex items-center justify-center text-xs font-black text-white">
            ${final !== null ? final : '?'}
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza una fila de estudiante en la tabla (modo Table).
 * @private
 */
function renderizarStudentTableRow(st, sectionId) {
  const final = studentFinal(st.id, sectionId);
  const statusLabel = final === null ? 'Pendiente' : final >= 75 ? 'Aprobado' : final >= 60 ? 'En riesgo' : 'Reprobado';
  const statusColor = final === null ? 'bg-slate-100 text-slate-500' : final >= 75 ? 'bg-emerald-100 text-emerald-700' : final >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';

  return `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" ondblclick="window.openViewStudent('${st.id}')">
      <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">${escapeHtml(st.nombre)} ${escapeHtml(st.apellido)}</td>
      <td class="px-6 py-4 text-xs font-medium text-slate-400">${escapeHtml(st.matricula || '-')}</td>
      <td class="px-6 py-4 text-center">
        <span class="font-black text-sm ${final >= 75 ? 'text-emerald-600' : final >= 60 ? 'text-amber-600' : 'text-rose-600'}">${final !== null ? final : '?'}</span>
      </td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 ${statusColor} text-[10px] font-bold uppercase rounded-md tracking-wider">${statusLabel}</span>
      </td>
      <td class="px-6 py-4 text-right">
        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button class="p-1 hover:text-blue-600" onclick="window.openEditStudent('${st.id}')"><span class="material-symbols-outlined text-sm">edit</span></button>
           <button class="p-1 hover:text-rose-500" onclick="window.delEst('${st.id}')"><span class="material-symbols-outlined text-sm">delete</span></button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Renderiza un resultado individual de búsqueda enriquecido.
 * @private
 */
function renderizarSearchResult(res) {
  return `
    <button onclick="window.openStudentSearchResult('${res.id}')" 
            class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div>
          <div class="font-bold text-slate-900 dark:text-white">${escapeHtml(res.fullName)}</div>
          <div class="text-[10px] text-slate-500 font-medium tracking-tight">${escapeHtml(res.gradeLabel)} ${escapeHtml(res.sectionLabel)} · ${escapeHtml(res.matricula)}</div>
        </div>
      </div>
      <div class="shrink-0 text-right">
         <div class="text-xs font-black text-blue-600">${res.final !== null ? res.final : '?'}</div>
         <div class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Final</div>
      </div>
    </button>
  `;
}
