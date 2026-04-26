/**
 * Componente: Ítem de Curso
 * --------------------------------------------------------------------------
 * Renderiza un curso individual en la lista de cursos activos del dashboard,
 * mostrando información básica y progreso de evaluación.
 */

import { S } from '../../../core/state.js';
import { getGroupCfg, studentsInGroup } from '../../../core/domain-utils.js';
import { BLOCKS } from '../../../core/constants.js';
import { escapeHtml } from '../../../core/utils.js';

/**
 * Renderiza un ítem compacto para la lista de cursos en el tablero.
 * @param {Object} sec - Objeto de sección/course
 * @returns {string} HTML del ítem de curso
 */
export function renderCourseItem(sec) {
  const count = studentsInGroup(sec.id).length;
  const cfg = getGroupCfg(sec.id, S.activePeriodId);
  const activities = BLOCKS.flatMap(b => cfg[b]?.activities || []);
  const linked = activities.filter(a => !!a.instrumentId).length;
  const prog = activities.length ? Math.round((linked / activities.length) * 100) : 0;

  return `
    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group" 
         onclick="window.openDashboardCourse('${sec.id}')">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
             <span class="material-symbols-outlined text-sm">school</span>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800 dark:text-white">${escapeHtml(sec.grado)} ${escapeHtml(sec.sec)}</p>
            <p class="text-[10px] text-slate-500 font-medium">${escapeHtml(sec.materia || 'General')} · ${count} est.</p>
          </div>
        </div>
        <span class="text-[10px] font-bold text-blue-600">${prog}%</span>
      </div>
      <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-blue-600 transition-all duration-700" style="width: ${prog}%"></div>
      </div>
    </div>
  `;
}

// Export de compatibilidad para nombres en español
export const renderizarCourseItem = renderCourseItem;