/**
 * Componente: Tarjeta de Estadística KPI
 * --------------------------------------------------------------------------
 * Renderiza una tarjeta compacta con icono, etiqueta y valor para mostrar
 * métricas clave en el dashboard.
 */

import { escapeHtml } from '../../../core/utils.js';

/**
 * Renderiza una tarjeta de estadística tipo KPI.
 * @param {string} label - Etiqueta de la estadística
 * @param {string|number} value - Valor a mostrar
 * @param {string} icon - Nombre del icono de Material Symbols
 * @param {string} iconClass - Clases CSS para el estilo del icono
 * @returns {string} HTML de la tarjeta
 */
export function renderStatCard(label, value, icon, iconClass) {
  return `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-transform hover:scale-[1.02]">
      <div class="w-12 h-12 rounded-2xl ${iconClass} flex items-center justify-center">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">${label}</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">${value}</p>
      </div>
    </div>
  `;
}