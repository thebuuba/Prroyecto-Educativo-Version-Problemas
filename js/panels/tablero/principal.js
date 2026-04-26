/**
 * Panel de Tablero Principal (Bento Dashboard).
 * --------------------------------------------------------------------------
 * Este módulo gestiona el renderizado del tablero principal de EduGest, que 
 * utiliza un diseño tipo "Bento" para mostrar estadísticas, acciones rápidas 
 * y sugerencias contextuales al docente.
 */

import { S } from '../../core/state.js';
import { go } from '../../core/routing.js';
import { persist } from '../../core/hydration.js';
import { 
  getScopedSections, 
  getScopedStudents, 
  getGroupCfg, 
  periodName, 
  normalizeCourseSearchText 
} from '../../core/domain-utils.js';
import { BLOCKS } from '../../core/constants.js';
import { escapeHtml } from '../../core/utils.js';

// Componentes
import { renderStatCard } from './components/stat-card.js';
import { renderCourseItem } from './components/course-item.js';
import { renderOverviewItem } from './components/overview-item.js';

// Utilidades
import { buildFocusItems } from './utils/focus-items.js';

/**
 * Renderiza el tablero Bento moderno con estadísticas y accesos directos.
 * @param {HTMLElement} c - Contenedor del panel.
 */
export function registerDashboardPanel(c) {
  const teacherName = S.profile?.name || S.sessionUserName || 'Docente';
  const hours = new Date().getHours();
  const greet = hours < 12 ? 'Buen día' : hours < 19 ? 'Buenas tardes' : 'Buenas noches';
  
  const courses = getScopedSections();
  const scopedStudents = getScopedStudents();
  const scopedCourseIds = new Set(courses.map(course => course.id));
  const totalStudents = scopedStudents.length;

  // Cálculo de estadísticas globales
  const allActsList = courses.flatMap(course => {
    const cfg = getGroupCfg(course.id, S.activePeriodId);
    return BLOCKS.flatMap(block => (cfg[block]?.activities || []).map(activity => ({ sectionId: course.id, block, activity })));
  });

  const totalActivities = allActsList.length;
  const totalInstruments = (S.instruments || []).filter(inst => !inst?.courseId || scopedCourseIds.has(inst.courseId)).length;
  const pendingInstruments = allActsList.filter(item => !item.activity?.instrumentId).length;
  const linkedActivities = allActsList.filter(item => !!item.activity?.instrumentId).length;
  const courseCoverage = totalActivities ? Math.round((linkedActivities / totalActivities) * 100) : 0;

  const schoolYear = S.schoolYear?.name || '2025-2026';
  const activePeriod = periodName(S.activePeriodId);
  const institution = S.profile?.inst || 'Configura tu institución';
  const todayDate = new Date().toLocaleDateString('es-DO', { weekday: 'long', day: '2-digit', month: 'long' });

  // Lógica de elementos de enfoque (Focus Items) para guiar al usuario
  const focusItems = construirElementosEnfoque({
    courses, totalStudents, totalActivities, pendingInstruments, hasPlanning: (S.lessonPlans?.length > 0)
  });

  const mainFocus = focusItems[0];
  const stepNum = String((mainFocus?.eyebrow || '').match(/\d+/)?.[0] || '1').padStart(2, '0');

  // Acciones rápidas de la columna lateral
  const quickActions = [
    { icon: 'person_add', title: 'Estudiantes', copy: 'Matrícula', action: "window.go('estudiantes')" },
    { icon: 'add_task', title: 'Actividades', copy: 'Evaluar', action: "window.go('actividades')" },
    { icon: 'grid_view', title: 'Matriz', copy: 'Calificaciones', action: "window.go('actividades', { activityViewMode: 'matrix' })" },
    { icon: 'description', title: 'Reportes', copy: 'Exportar', action: "window.go('reportes')" },
  ];

  const filteredCourses = (courses || []).filter(sec => {
    const query = normalizeCourseSearchText(window.DASHBOARD_COURSE_QUERY || '');
    if (!query) return true;
    const searchTxt = normalizeCourseSearchText(`${sec.grado} ${sec.sec} ${sec.materia || 'General'}`);
    return searchTxt.includes(query);
  });

  const htmlContent = `
    <div class="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <!-- Sección de Cabecera (Hero) -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">${greet}, ${escapeHtml(teacherName)}</h1>
          <p class="text-slate-500 dark:text-slate-400 capitalize">${todayDate}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">${escapeHtml(institution)}</span>
          <span class="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-medium">${escapeHtml(schoolYear)}</span>
          <span class="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-medium">${escapeHtml(activePeriod)}</span>
        </div>
      </header>

      <!-- Cuadrícula de KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderTarjetaEstadistica('Cursos', courses.length, 'school', 'text-blue-600 bg-blue-50')}
        ${renderTarjetaEstadistica('Estudiantes', totalStudents, 'group', 'text-emerald-600 bg-emerald-50')}
        ${renderTarjetaEstadistica('Actividades', totalActivities, 'event_note', 'text-amber-600 bg-amber-50')}
        ${renderTarjetaEstadistica('Cobertura', `${courseCoverage}%`, 'analytics', 'text-rose-600 bg-rose-50')}
      </div>

      <!-- Diseño Bento -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Foco Central -->
        <div class="lg:col-span-2 space-y-6">
          <section class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <span class="material-symbols-outlined text-8xl">${mainFocus.icon}</span>
            </div>
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white">Lo que sigue hoy</h2>
              <span class="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded tracking-wider uppercase">Prioritario</span>
            </div>
            
            <div class="flex gap-6 items-start cursor-pointer group" onclick="${mainFocus.clickAction}">
              <div class="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-slate-300 dark:text-slate-700">
                ${stepNum}
              </div>
              <div class="flex-1">
                <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">${mainFocus.eyebrow}</p>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">${mainFocus.title}</h3>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">${mainFocus.text}</p>
                ${mainFocus.action}
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
              ${filteredCourses.map(sec => renderElementoCurso(sec)).join('')}
              ${filteredCourses.length === 0 ? '<div class="col-span-full py-12 text-center text-slate-400">No se encontraron cursos activos</div>' : ''}
            </div>
          </section>
        </div>

        <!-- Acciones Laterales -->
        <div class="space-y-6">
          <section class="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none">
            <h2 class="text-xl font-bold mb-6">Accesos rápidos</h2>
            <div class="grid grid-cols-2 gap-3">
              ${quickActions.map(action => `
                <button onclick="${action.action}" class="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl border border-white/10 gap-2">
                  <span class="material-symbols-outlined text-2xl">${action.icon}</span>
                  <span class="text-[10px] font-bold uppercase tracking-tighter">${action.title}</span>
                </button>
              `).join('')}
            </div>
          </section>

          <section class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
             <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Matriz de progreso</h2>
             <div class="space-y-4">
               ${renderElementoResumen('Instrumentos', totalInstruments, 'library_books')}
               ${renderElementoResumen('Cursos vacíos', courses.filter(c => studentsInGroup(c.id).length === 0).length, 'person_off', 'text-rose-500')}
             </div>
             <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 italic text-slate-400 text-sm text-center">
               "La educación es el arma más poderosa para cambiar el mundo."
             </div>
          </section>
        </div>
      </div>
    </div>
  `;
  
  c.innerHTML = htmlContent;
}

/**
 * Inicializa el panel de Tablero y lo registra en el orquestador global.
 * Expone puentes de compatibilidad para eventos de UI.
 */
export function init() {
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.dashboard = registerDashboardPanel;
  
  /** Abre un curso específico desde el tablero y navega a actividades. */
  window.openDashboardCourse = (id) => {
    S.activeGroupId = id;
    S.activeCourseId = id;
    const sec = (S.secciones || []).find(s => s.id === id);
    if (sec?.gradeId) S.activeGradeId = sec.gradeId;
    persist();
    go('actividades');
  };
}
