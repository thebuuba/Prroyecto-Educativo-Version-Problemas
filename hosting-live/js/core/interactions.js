/**
 * Lógica de Interacciones de la Interfaz (UI).
 * --------------------------------------------------------------------------
 * Este módulo gestiona el comportamiento dinámico de la barra lateral (sidebar),
 * las preferencias del usuario, el modo oscuro y la sincronización visual 
 * de la carcasa (shell) de la aplicación.
 */

import { S } from './state.js';
import { applyEducationSectionTheme } from './theme-logic.js';
import { pageTitleWithContext, topbarContext, injectPanelContextControls } from './ui.js';

/** Estado de interacción de la barra lateral */
export const SIDEBAR_INTERACTION = { closeTimer: null, suppressAutoCloseUntil: 0 };

/** Métricas de rendimiento de la barra lateral */
export const SIDEBAR_PERF = { rafId: null };

/** Tiempos y retardos para animaciones y auto-cierre */
export const SIDEBAR_TIMINGS = {
  expandMs: 220,
  collapseMs: 200,
  pointerLeaveCloseDelayMs: 130,
  focusOutCloseDelayMs: 120,
  reopenGraceMs: 150,
};

/**
 * Cancela cualquier temporizador de cierre automático pendiente.
 */
export function clearSidebarCloseTimer() {
  if (!SIDEBAR_INTERACTION.closeTimer) return;
  clearTimeout(SIDEBAR_INTERACTION.closeTimer);
  SIDEBAR_INTERACTION.closeTimer = null;
}

/**
 * Verifica si se debe posponer el cierre automático (ej. tras reapertura rápida).
 */
export function shouldDeferSidebarAutoClose() {
  return Date.now() < SIDEBAR_INTERACTION.suppressAutoCloseUntil;
}

/**
 * Programa el cierre automático de la barra lateral tras un retardo.
 * @param {HTMLElement} sidebar - Referencia al elemento DOM.
 * @param {number} delayMs - Tiempo de espera.
 */
export function scheduleSidebarAutoClose(sidebar, delayMs) {
  if (!sidebar) return;
  if (shouldDeferSidebarAutoClose()) return;
  clearSidebarCloseTimer();
  SIDEBAR_INTERACTION.closeTimer = setTimeout(() => {
    if (sidebar.matches(':hover') || sidebar.matches(':focus-within')) return;
    collapseSidebarIfAllowed();
  }, delayMs);
}

/**
 * Sincroniza el estado del fondo (backdrop) y las clases de overlay del body.
 */
export function syncSidebarOverlayState() {
  const sidebar = document.getElementById('sb');
  const backdrop = document.getElementById('sb-backdrop');
  const isExpanded = !!sidebar?.classList.contains('sb-expanded');
  const overlayOpen = isExpanded;
  document.body.classList.toggle('sb-overlay-open', overlayOpen);
  if (backdrop) {
    backdrop.hidden = !overlayOpen;
    backdrop.setAttribute('aria-hidden', overlayOpen ? 'false' : 'true');
  }
}

/**
 * Expande o contrae visualmente la barra lateral.
 * @param {boolean} expanded - Estado deseado.
 */
export function setSidebarExpanded(expanded) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  if (expanded) {
    SIDEBAR_INTERACTION.suppressAutoCloseUntil = Date.now() + SIDEBAR_TIMINGS.reopenGraceMs;
  }
  sidebar.classList.toggle('sb-expanded', !!expanded);
  syncSidebarOverlayState();
}

/**
 * Fuerza el colapso de la barra lateral si las condiciones lo permiten.
 * Quita el foco de cualquier elemento interno para evitar re-aperturas por accesibilidad.
 */
export function collapseSidebarIfAllowed() {
  clearSidebarCloseTimer();
  const sidebar = document.getElementById('sb');
  const activeEl = document.activeElement;
  if (sidebar && activeEl && sidebar.contains(activeEl) && typeof activeEl.blur === 'function') {
    activeEl.blur();
  }
  setSidebarExpanded(false);
}

/**
 * Verifica si el monitoreo de rendimiento de la barra lateral está activo.
 */
export function isSidebarPerfEnabled() {
  try {
    return window.localStorage?.getItem('edugestPerfSidebar') === '1';
  } catch (_) {
    return false;
  }
}

/**
 * Detiene cualquier sonda de rendimiento activa.
 */
export function stopSidebarPerfProbe() {
  if (SIDEBAR_PERF.rafId) cancelAnimationFrame(SIDEBAR_PERF.rafId);
  SIDEBAR_PERF.rafId = null;
}

/**
 * Inicia una sonda de rendimiento para medir FPS y cuadros caídos durante 
 * las transiciones de la barra lateral.
 * @param {string} phase - Nombre de la fase (ej. "expand", "collapse").
 */
export function startSidebarPerfProbe(phase) {
  if (!isSidebarPerfEnabled()) return;
  stopSidebarPerfProbe();
  const budgetMs = 420;
  const frameTimes = [];
  const longFrames = [];
  let start = 0;
  let prev = 0;
  const loop = (ts) => {
    if (!start) start = ts;
    if (prev) {
      const dt = ts - prev;
      frameTimes.push(dt);
      if (dt > 20) longFrames.push(Number(dt.toFixed(2)));
    }
    prev = ts;
    if (ts - start < budgetMs) {
      SIDEBAR_PERF.rafId = requestAnimationFrame(loop);
      return;
    }
    SIDEBAR_PERF.rafId = null;
    const avg = frameTimes.length ? frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length : 0;
    const fps = avg > 0 ? (1000 / avg) : 0;
    console.info('[EduGest][sidebar-perf]', {
      phase,
      frames: frameTimes.length,
      avgFrameMs: Number(avg.toFixed(2)),
      estimatedFps: Number(fps.toFixed(1)),
      longFramesOver20ms: longFrames.length,
      longFrames,
    });
  };
  SIDEBAR_PERF.rafId = requestAnimationFrame(loop);
}

/**
 * Ajusta la duración de la animación CSS de la barra lateral.
 * @param {number} ms - Milisegundos.
 */
export function setSidebarMotionDuration(ms) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  sidebar.style.setProperty('--sb-width-duration', `${ms}ms`);
}

/**
 * Asegura que el objeto de preferencias del usuario esté inicializado con valores válidos.
 */
export function ensureUserPreferences() {
  if (!S.preferences || typeof S.preferences !== 'object') {
    S.preferences = { density: 'comfortable', animations: true, authLoginAnimation: true, darkMode: false };
  }
  if (!S.preferences.density) S.preferences.density = 'comfortable';
  if (typeof S.preferences.animations !== 'boolean') S.preferences.animations = true;
  if (typeof S.preferences.authLoginAnimation !== 'boolean') S.preferences.authLoginAnimation = true;
  if (typeof S.preferences.darkMode !== 'boolean') S.preferences.darkMode = false;
  if (typeof S.preferences.aiBackendUrl !== 'string') S.preferences.aiBackendUrl = '';
  if (!S.preferences.notifications || typeof S.preferences.notifications !== 'object') {
    S.preferences.notifications = { deadlineReminder: true, lowPerformanceAlert: true, dailySummary: false, syncAlert: true };
  }
  if (!S.preferences.evaluation || typeof S.preferences.evaluation !== 'object') {
    S.preferences.evaluation = { defaultScale: '100', rounding: 'nearest', showDecimals: false, weightPreset: 'balanced' };
  }
}

/**
 * Actualiza los elementos visuales (iconos, etiquetas) del interruptor de modo oscuro.
 */
export function syncDarkModeToggleUI() {
  const darkToggle = document.getElementById('sb-dark-toggle');
  const darkState = document.getElementById('sb-dark-state');
  const darkIcon = document.getElementById('sb-dark-icon');
  const enabled = S.preferences?.darkMode === true;
  if (darkToggle) {
    darkToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    darkToggle.setAttribute('aria-label', enabled ? 'Modo claro' : 'Modo oscuro');
    darkToggle.title = enabled ? 'Desactivar modo oscuro' : 'Activar modo oscuro';
  }
  if (darkIcon) {
    darkIcon.src = enabled ? '/assets/icons/modoclaro.png' : '/assets/icons/modooscuro.png';
  }
  if (darkState) darkState.textContent = enabled ? 'ON' : 'OFF';
}

/**
 * Aplica todas las preferencias de usuario al DOM de la aplicación.
 * Gestiona densidad visual, modo oscuro, animaciones y fijación de sidebar.
 */
export function applyUserPreferences() {
  ensureUserPreferences();
  document.body.classList.toggle('pref-compact', S.preferences.density === 'compact');
  document.body.classList.toggle('pref-reduce-motion', S.preferences.animations === false);
  
  if (typeof window.applyMotionProfile === 'function') window.applyMotionProfile();
  document.body.classList.toggle('theme-dark', S.preferences.darkMode === true);
  if (typeof window.applyEducationSectionTheme === 'function') window.applyEducationSectionTheme();

  const sidebar = document.getElementById('sb');
  if (sidebar && !sidebar.matches(':hover') && !sidebar.matches(':focus-within')) {
    setSidebarExpanded(false);
  }
  syncDarkModeToggleUI();
}

/**
 * Alterna entre modo oscuro y claro.
 */
export function toggleDarkMode() {
  ensureUserPreferences();
  S.preferences.darkMode = !S.preferences.darkMode;
  applyUserPreferences();
  toast(S.preferences.darkMode ? 'Modo oscuro activado' : 'Modo oscuro desactivado');
}

/**
 * Navega al panel de ajustes del usuario.
 */
export function openSettingsPanel() {
  if (typeof window.closeProfileMenu === 'function') window.closeProfileMenu();
  if (typeof window.go === 'function') {
    window.go('settings');
  } else {
    console.warn('[EduGest] Router "go" not found on window.');
  }
}

/**
 * Refresca dinámicamente el encabezado superior (Topbar) y sus contadores.
 * Inyecta los controles de contexto específicos del panel activo.
 */
export function refreshTop() {
  applyEducationSectionTheme();
  const PAGE = window.EduGestConfig?.PAGE || {}; // Fallback para compatibilidad legacy
  const currentPage = S.currentPage || 'dashboard';
  const cfg = PAGE[currentPage];
  if (!cfg) return;

  const topTitle = document.getElementById('tbt');
  const topSubtitle = document.getElementById('tbs');
  const topContext = document.getElementById('tb-context');
  const topActions = document.getElementById('tb-actions');
  const view = document.getElementById('view');

  if (topTitle) topTitle.textContent = pageTitleWithContext(currentPage, cfg.t);
  if (topSubtitle) topSubtitle.textContent = topbarContext();
  if (topContext) topContext.innerHTML = '';
  if (topActions) topActions.innerHTML = '';
  if (view) injectPanelContextControls(view);
}
