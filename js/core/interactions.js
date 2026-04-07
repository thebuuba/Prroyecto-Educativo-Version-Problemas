import { S } from './state.js';
import { persist } from './hydration.js';
import { toast } from './ui.js';
import { applyEducationSectionTheme } from './theme-logic.js';
import { pageTitleWithContext, topbarContext, injectPanelContextControls } from './ui.js';

export const SIDEBAR_INTERACTION = { closeTimer: null, suppressAutoCloseUntil: 0 };
export const SIDEBAR_PERF = { rafId: null };

export const SIDEBAR_TIMINGS = {
  expandMs: 220,
  collapseMs: 200,
  pointerLeaveCloseDelayMs: 130,
  focusOutCloseDelayMs: 120,
  reopenGraceMs: 150,
};

export function setSidebarPinned(pinned) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  const isPinned = !!pinned;
  sidebar.classList.toggle('sb-pinned', isPinned);
  if (isPinned) sidebar.classList.add('sb-expanded');
  syncSidebarOverlayState();
}

export function clearSidebarCloseTimer() {
  if (!SIDEBAR_INTERACTION.closeTimer) return;
  clearTimeout(SIDEBAR_INTERACTION.closeTimer);
  SIDEBAR_INTERACTION.closeTimer = null;
}

export function shouldDeferSidebarAutoClose() {
  return Date.now() < SIDEBAR_INTERACTION.suppressAutoCloseUntil;
}

export function scheduleSidebarAutoClose(sidebar, delayMs) {
  if (!sidebar) return;
  if (shouldKeepSidebarPinned() || shouldDeferSidebarAutoClose()) return;
  clearSidebarCloseTimer();
  SIDEBAR_INTERACTION.closeTimer = setTimeout(() => {
    if (shouldKeepSidebarPinned()) return;
    if (sidebar.matches(':hover') || sidebar.matches(':focus-within')) return;
    collapseSidebarIfAllowed();
  }, delayMs);
}

export function syncSidebarOverlayState() {
  const sidebar = document.getElementById('sb');
  const backdrop = document.getElementById('sb-backdrop');
  const isPinned = shouldKeepSidebarPinned();
  const isExpanded = !!sidebar?.classList.contains('sb-expanded');
  const overlayOpen = isExpanded && !isPinned;
  document.body.classList.toggle('sb-overlay-open', overlayOpen);
  if (backdrop) {
    backdrop.hidden = !overlayOpen;
    backdrop.setAttribute('aria-hidden', overlayOpen ? 'false' : 'true');
  }
}

export function setSidebarExpanded(expanded) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  if (shouldKeepSidebarPinned()) {
    sidebar.classList.add('sb-expanded');
    syncSidebarOverlayState();
    return;
  }
  if (expanded) {
    SIDEBAR_INTERACTION.suppressAutoCloseUntil = Date.now() + SIDEBAR_TIMINGS.reopenGraceMs;
  }
  sidebar.classList.toggle('sb-expanded', !!expanded);
  syncSidebarOverlayState();
}

export function shouldKeepSidebarPinned() {
  return !!S.preferences?.sidebarPinned;
}

export function collapseSidebarIfAllowed() {
  clearSidebarCloseTimer();
  if (shouldKeepSidebarPinned()) {
    setSidebarPinned(true);
    return;
  }
  const sidebar = document.getElementById('sb');
  const activeEl = document.activeElement;
  if (sidebar && activeEl && sidebar.contains(activeEl) && typeof activeEl.blur === 'function') {
    activeEl.blur();
  }
  setSidebarPinned(false);
  setSidebarExpanded(false);
}

// --- Migrated from Monolith ---

export function isSidebarPerfEnabled() {
  try {
    return window.localStorage?.getItem('edugestPerfSidebar') === '1';
  } catch (_) {
    return false;
  }
}

export function stopSidebarPerfProbe() {
  if (SIDEBAR_PERF.rafId) cancelAnimationFrame(SIDEBAR_PERF.rafId);
  SIDEBAR_PERF.rafId = null;
}

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

export function setSidebarMotionDuration(ms) {
  const sidebar = document.getElementById('sb');
  if (!sidebar) return;
  sidebar.style.setProperty('--sb-width-duration', `${ms}ms`);
}

export function ensureUserPreferences() {
  if (!S.preferences || typeof S.preferences !== 'object') {
    S.preferences = { density: 'comfortable', animations: true, authLoginAnimation: true, darkMode: false };
  }
  if (!S.preferences.density) S.preferences.density = 'comfortable';
  if (typeof S.preferences.animations !== 'boolean') S.preferences.animations = true;
  if (typeof S.preferences.authLoginAnimation !== 'boolean') S.preferences.authLoginAnimation = true;
  if (typeof S.preferences.darkMode !== 'boolean') S.preferences.darkMode = false;
  if (typeof S.preferences.sidebarPinned !== 'boolean') S.preferences.sidebarPinned = false;
  if (typeof S.preferences.aiBackendUrl !== 'string') S.preferences.aiBackendUrl = '';
  if (!S.preferences.notifications || typeof S.preferences.notifications !== 'object') {
    S.preferences.notifications = { deadlineReminder: true, lowPerformanceAlert: true, dailySummary: false, syncAlert: true };
  }
  if (!S.preferences.evaluation || typeof S.preferences.evaluation !== 'object') {
    S.preferences.evaluation = { defaultScale: '100', rounding: 'nearest', showDecimals: false, weightPreset: 'balanced' };
  }
}

export function syncDarkModeToggleUI() {
  const darkToggle = document.getElementById('sb-dark-toggle');
  const darkState = document.getElementById('sb-dark-state');
  const darkIcon = document.getElementById('sb-dark-icon');
  const pinToggle = document.getElementById('sb-pin-toggle');
  const enabled = S.preferences?.darkMode === true;
  const pinned = S.preferences?.sidebarPinned === true;
  if (darkToggle) {
    darkToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    darkToggle.setAttribute('aria-label', enabled ? 'Modo claro' : 'Modo oscuro');
    darkToggle.title = enabled ? 'Desactivar modo oscuro' : 'Activar modo oscuro';
  }
  if (darkIcon) {
    darkIcon.src = enabled ? '/assets/icons/modoclaro.png' : '/assets/icons/modooscuro.png';
  }
  if (darkState) darkState.textContent = enabled ? 'ON' : 'OFF';
  if (pinToggle) {
    pinToggle.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    pinToggle.setAttribute('aria-label', pinned ? 'Desfijar barra lateral' : 'Fijar barra lateral');
    pinToggle.title = pinned ? 'Desfijar barra lateral' : 'Fijar barra lateral';
  }
}

export function applyUserPreferences() {
  ensureUserPreferences();
  document.body.classList.toggle('pref-compact', S.preferences.density === 'compact');
  document.body.classList.toggle('pref-reduce-motion', S.preferences.animations === false);
  // Note: applyMotionProfile and applyEducationSectionTheme should be imported or moved if needed
  if (typeof window.applyMotionProfile === 'function') window.applyMotionProfile();
  document.body.classList.toggle('theme-dark', S.preferences.darkMode === true);
  if (typeof window.applyEducationSectionTheme === 'function') window.applyEducationSectionTheme();
  
  const sidebarPinned = S.preferences.sidebarPinned === true;
  setSidebarPinned(sidebarPinned);
  if (sidebarPinned) {
    setSidebarExpanded(true);
  } else {
    const sidebar = document.getElementById('sb');
    if (sidebar && !sidebar.matches(':hover') && !sidebar.matches(':focus-within')) {
      setSidebarExpanded(false);
    }
  }
  syncDarkModeToggleUI();
}

export function toggleSidebarPinnedPreference() {
  ensureUserPreferences();
  S.preferences.sidebarPinned = !S.preferences.sidebarPinned;
  applyUserPreferences();
  persist();
  toast(S.preferences.sidebarPinned ? 'Barra lateral fijada' : 'Barra lateral automática');
}

export function toggleDarkMode() {
  ensureUserPreferences();
  S.preferences.darkMode = !S.preferences.darkMode;
  applyUserPreferences();
  toast(S.preferences.darkMode ? 'Modo oscuro activado' : 'Modo oscuro desactivado');
}

export function openSettingsPanel() {
  if (typeof window.closeProfileMenu === 'function') window.closeProfileMenu();
  if (typeof window.go === 'function') {
    window.go('settings');
  } else {
    console.warn('[EduGest] Router "go" not found on window.');
  }
}

/**
 * Refresca el encabezado superior y sus contadores visibles.
 */
export function refreshTop() {
  applyEducationSectionTheme();
  const PAGE = window.EduGestConfig?.PAGE || {}; // Fallback for legacy access
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
