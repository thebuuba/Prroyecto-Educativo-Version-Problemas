/**
 * Componente: Ítem de Resumen
 * --------------------------------------------------------------------------
 * Renderiza un renglón de información tipo resumen para la matriz de progreso.
 */

import { escapeHtml } from '../../../core/utils.js';

/**
 * Renderiza un renglón de información tipo resumen.
 * @param {string} label - Etiqueta del ítem
 * @param {string|number} value - Valor a mostrar
 * @param {string} icon - Nombre del icono de Material Symbols
 * @param {string} textClass - Clases CSS para el texto del valor
 * @returns {string} HTML del ítem de resumen
 */
export function renderOverviewItem(label, value, icon, textClass = 'text-slate-900 dark:text-white') {
  return `
    <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
          <span class="material-symbols-outlined text-sm">${icon}</span>
        </div>
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">${label}</span>
      </div>
      <span class="text-sm font-bold ${textClass}">${value}</span>
    </div>
  `;
}

// Export de compatibilidad para nombres en español
export const renderizarOverviewItem = renderOverviewItem;