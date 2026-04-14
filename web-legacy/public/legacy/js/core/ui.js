/**
 * Utilidades de Interfaz de Usuario (UI) de EduGest.
 * --------------------------------------------------------------------------
 * Este módulo contiene funciones auxiliares para la gestión de modales, 
 * notificaciones (toasts), manipulación básica del DOM y controles de 
 * contexto académico del Topbar.
 */

import { S } from './state.js';
import { fixMojibakeText } from './utils.js';
import { DEFAULT_PERIODS } from './constants.js';
import { getGroupLabel, getGroups, ensureActiveContext } from './academic-context-logic.js';

/**
 * --- Ayudantes Básicos del DOM ---
 */

/**
 * Obtiene el valor limpio (trimmed) de un elemento input por su ID.
 * @param {string} id - ID del elemento.
 * @returns {string} Valor de texto.
 */
export function v(id) {
  return (document.getElementById(id)?.value || '').trim();
}

/**
 * Genera iniciales a partir de un nombre compuesto.
 * @param {string} n - Nombre completo.
 * @returns {string} Iniciales (ej. "Juan Perez" -> "JP").
 */
export function initials(n) {
  return (n || '').split(' ').filter(Boolean).map(w => w[0].toUpperCase()).join('').slice(0, 2);
}

/**
 * --- Gestión de Modales ---
 */

/**
 * Abre un modal y aplica las clases de contexto necesarias.
 * @param {string} id - ID del modal.
 * @param {Object} [context={}] - Datos de contexto (ej. para configuración inicial).
 */
export function openM(id, context = {}) {
  // Gancho para inicialización legacy
  if (typeof window.onOpenCreateModal === 'function') {
    window.onOpenCreateModal(id, context);
  }

  const modal = document.getElementById(id);
  if (!modal) return;

  if (id === 'm-setup') {
    modal.classList.toggle('auth-setup', !!context.fromAuth);
    modal.classList.toggle('from-education', !!context.fromEducation);
    if (typeof window.populateSetupForm === 'function') window.populateSetupForm();
  }

  modal.classList.add('open');
  
  if (id === 'm-auth') document.body.classList.add('auth-screen-open');
  
  if (id === 'm-terms') {
    const checkbox = document.getElementById('terms-accept-check');
    if (checkbox) checkbox.checked = false;
    if (typeof window.clearTermsAcceptanceError === 'function') window.clearTermsAcceptanceError();
  }

  // Mejoras de accesibilidad y reparaciones legacy
  if (typeof window.enableWritingAssist === 'function') window.enableWritingAssist(modal);
  if (typeof window.queueRenderedTextRepair === 'function') window.queueRenderedTextRepair(modal);
}

/**
 * Cierra un modal de forma forzada, saltándose las validaciones de obligatoriedad.
 * @param {string} id - ID del modal.
 */
export function forceCloseM(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.remove('open');
  if (id === 'm-setup') {
    modal.classList.remove('auth-setup');
    modal.classList.remove('from-education');
  }
  if (id === 'm-auth') document.body.classList.remove('auth-screen-open');
  
  if (typeof window.onCloseModal === 'function') window.onCloseModal(id);
}

/**
 * Cierra un modal validando si existen acciones obligatorias pendientes (Términos, Setup, etc).
 * @param {string} id - ID del modal.
 */
export function closeM(id) {
  // Validaciones obligatorias de lógica de negocio (Legacy)
  if (id === 'm-terms' && typeof window.enforceMandatoryTermsAcceptance === 'function' && window.enforceMandatoryTermsAcceptance()) return;
  if (id === 'm-education-section' && typeof window.enforceMandatoryEducationSelection === 'function' && window.enforceMandatoryEducationSelection()) return;
  if (id === 'm-setup' && typeof window.enforceMandatorySetup === 'function' && window.enforceMandatorySetup()) return;

  forceCloseM(id);
}

/**
 * --- Notificaciones (Toasts) ---
 */

/**
 * Muestra una notificación flotante (Toast) en la pantalla.
 * Soporta diferentes tonos (error, advertencia, información) y temas.
 * @param {string} msg - Mensaje a mostrar.
 * @param {boolean|string} [err=false] - Tipo de error o booleano de fallo.
 */
export function toast(msg, err = false) {
  const t = document.getElementById('toast');
  if (!t) return;

  t.textContent = fixMojibakeText(msg);
  const tone = (err === true || err === 'error') ? 'error' : ((err === 'warn' || err === 'warning') ? 'warn' : 'info');
  
  t.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  t.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
  t.setAttribute('aria-atomic', 'true');
  
  const isDarkTheme = document.body.classList.contains('theme-dark') || S.preferences?.darkMode;
  
  t.style.background = tone === 'error'
    ? 'var(--rose)'
    : (tone === 'warn' ? 'var(--amber)' : (isDarkTheme ? 'rgba(10, 20, 34, .94)' : 'var(--ink)'));
  
  t.style.color = tone === 'warn' ? '#111827' : (isDarkTheme ? '#edf4ff' : '#fff');
  t.style.transform = 'translateY(0)';
  t.style.opacity = '1';
  
  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.style.transform = 'translateY(70px)';
    t.style.opacity = '0';
  }, 3200);
}

// Registro en el objeto global window para asegurar compatibilidad con paneles legacy
window.v = v;
window.initials = initials;
window.openM = openM;
window.closeM = closeM;
window.forceCloseM = forceCloseM;
window.toast = toast;

/**
 * --- Ayudantes de Contexto Académico en UI ---
 */

/**
 * Retorna el nombre legible del período activo (P1-P4).
 * @param {string} [periodId=S.activePeriodId] - ID del período.
 * @returns {string} Nombre formateado.
 */
export function periodName(periodId = S.activePeriodId) {
  const p = (S.periods || DEFAULT_PERIODS).find(p => p.id === periodId);
  const rawName = p?.name || periodId || 'P1';
  return fixMojibakeText(String(rawName || '').trim()).replace(/^Periodo\b/i, 'Período');
}

/**
 * Determina si la página actual requiere mostrar los controles de contexto (Curso/Período).
 */
export function shouldShowAcademicContext(pageId = S.currentPage) {
  return ['actividades', 'matriz', 'reportes'].includes(pageId);
}

/**
 * Genera la etiqueta descriptiva del contexto activo (Grado + Sección + Período).
 */
export function activeContextLabel(groupId = S.activeGroupId, periodId = S.activePeriodId) {
  const courseLabel = getGroupLabel(groupId);
  const periodCode = periodId || S.activePeriodId || 'P1';
  return `${courseLabel} - Período ${periodCode}`;
}

/**
 * Formatea el título de la página inyectando el contexto académico si es necesario.
 */
export function pageTitleWithContext(pageId = S.currentPage, baseTitle = '') {
  if (!shouldShowAcademicContext(pageId)) return baseTitle;
  return `${baseTitle} - ${activeContextLabel()}`;
}

/**
 * Genera la cadena de texto descriptiva para el Topbar (Institución + Año + Período).
 */
export function topbarContext() {
  const institution = S.profile?.inst || 'Institución por configurar';
  const year = S.schoolYear?.name || S.profile?.year || '2025-2026';
  const period = periodName();
  return `${institution} - ${year} - ${period}`;
}

/**
 * Renderiza el HTML de los controles selectores de contexto del Topbar.
 * @returns {string} Fragmento HTML.
 */
export function renderTopbarContextControls() {
  ensureActiveContext();
  const groups = getGroups();
  const groupOptions = groups
    .map((group) => `<option value="${group.id}" ${group.id===S.activeGroupId?'selected':''}>${group.gradeName} ${group.sectionName} — ${group.materia||'General'}</option>`)
    .join('');
  const periodOptions = (S.periods || DEFAULT_PERIODS)
    .map((period) => `<option value="${period.id}" ${period.id===S.activePeriodId?'selected':''}>${period.name}</option>`)
    .join('');
  
  return `
    <div class="tb-context-controls panel-context-controls">
      <div class="tb-context-mini">
        <select class="tb-context-select" onchange="setActiveGroup(this.value)" aria-label="Seleccionar curso">${groupOptions || '<option value="">Sin cursos</option>'}</select>
        <select class="tb-context-select" onchange="setActivePeriod(this.value)" aria-label="Seleccionar período">${periodOptions}</select>
      </div>
    </div>
  `;
}

/**
 * Inyecta los controles de contexto en un panel de vista dinámico.
 * @param {HTMLElement} view - Contenedor de la vista.
 */
export function injectPanelContextControls(view) {
  if (!view) return;
  const existing = view.querySelector('.panel-context-host');
  if (existing) existing.remove();
  if (!shouldShowAcademicContext(S.currentPage)) return;
  const host = document.createElement('div');
  host.className = 'panel-context-host';
  host.innerHTML = renderTopbarContextControls();
  view.prepend(host);
}
