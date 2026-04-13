/**
 * Controlador de la Carcasa de la Aplicación (App Shell).
 * --------------------------------------------------------------------------
 * Versión modernizada de la lógica de barra lateral, menú de perfil y topbar.
 * Gestiona las interacciones de la "Interfaz Viva" y la sincronización del 
 * estado de sesión con los elementos visuales persistentes.
 */

import { S } from './state.js';
import { persist } from './hydration.js';
import { 
  initials,
  periodName,
  getDisplayUserName,
  toggleDarkMode,
  applyUserPreferences,
  collapseSidebarIfAllowed,
  setSidebarExpanded,
  clearSidebarCloseTimer,
  scheduleSidebarAutoClose,
  go,
  openM,
  toast,
  STATIC_DOM,
  INTERACTION_ENHANCEMENTS,
  SIDEBAR_TIMINGS,
  hasActiveBrowserSession,
  resetToSignedOutState
} from './domain-utils.js';

/**
 * --- Sincronización de UI ---
 */

/**
 * Actualiza la información del usuario en la barra lateral y el encabezado.
 * Sincroniza nombres, roles, iniciales y avatar basado en el estado actual.
 */
export function updateSBUser() {
  const sidebarName = document.getElementById('sb-name');
  const sidebarRole = document.getElementById('sb-role');
  const sidebarEmail = document.getElementById('sb-email');
  const topName = document.getElementById('top-inline-name');
  const topRole = document.getElementById('top-inline-role');
  const avatar = document.getElementById('sb-av');
  const avatarImg = document.getElementById('sb-av-img');
  const dropdownAvatarImg = document.getElementById('sb-pd-av-img');
  
  const displayName = getDisplayUserName();
  const displayEmail = S.sessionUserName || S.profile?.email || (S.sessionUserId ? 'usuario@aulabase.edu' : 'sin.correo@aulabase.edu');
  const roleText = S.profile ? `${S.profile.role} - ${periodName()}` : (S.sessionUserId ? 'Perfil incompleto' : 'Sin sesión');

  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarRole) sidebarRole.textContent = roleText;
  if (sidebarEmail) sidebarEmail.textContent = displayEmail;
  if (topName) topName.textContent = displayName;
  if (topRole) topRole.textContent = roleText;
  
  if (avatar) avatar.textContent = initials(displayName);
  
  const avatarUrl = (name) => {
    const cleanName = encodeURIComponent(name !== 'Sin perfil' ? name : 'Usuario');
    return `https://ui-avatars.com/api/?name=${cleanName}&background=1E293B&color=fff&size=48`;
  };

  if (avatarImg) avatarImg.src = avatarUrl(displayName);
  if (dropdownAvatarImg) dropdownAvatarImg.src = avatarUrl(displayName);
  
  // Alternar visibilidad del botón de cierre de sesión según la sesión activa
  const logoutBtns = [
    document.getElementById('sb-logout-compact'),
    document.getElementById('sb-logout')
  ];
  logoutBtns.forEach(btn => {
    if (btn) btn.style.display = S.sessionUserId ? '' : 'none';
  });
}

/**
 * Sincroniza el estado visual de la navegación lateral con la página activa.
 */
export function syncSidebarNavState(activePage = S.currentPage || 'dashboard') {
  STATIC_DOM.navLinks.forEach((el) => {
    const isActive = el.dataset.p === activePage;
    el.classList.toggle('on', isActive);
    if (isActive) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
}

/**
 * Cierra el menú desplegable del perfil de usuario en la parte superior.
 */
export function closeProfileMenu() {
  const toggle = document.getElementById('top-profile-toggle');
  const menu = document.getElementById('top-profile-menu');
  if (toggle && menu) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }
}

/**
 * --- Inicialización ---
 */

/**
 * Inicializa todos los escuchadores de eventos (listeners) de la carcasa.
 * Configura la navegación, el comportamiento de la barra lateral, modo oscuro,
 * fijación de paneles y clics fuera de menús.
 */
export function initShell() {
  // Listeners para Elementos de Navegación
  if (STATIC_DOM.navLinks) {
    STATIC_DOM.navLinks.filter(el => el.dataset.p).forEach(el => {
      el.addEventListener('click', () => {
        const requestedPage = el.dataset.p;
        collapseSidebarIfAllowed();
        go(requestedPage, { animatePanelTransition: true });
      });
    });
  }

  // Interacción de la Barra Lateral (Hover y Auto-cierre)
  const sidebarEl = document.getElementById('sb');
  if (sidebarEl) {
    sidebarEl.addEventListener('mouseenter', () => {
       clearSidebarCloseTimer();
       setSidebarExpanded(true);
    });
    sidebarEl.addEventListener('mouseleave', () => {
       scheduleSidebarAutoClose(sidebarEl, SIDEBAR_TIMINGS.pointerLeaveCloseDelayMs);
    });
  }

  // Alternar Modo Oscuro
  document.getElementById('sb-dark-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDarkMode();
  });

  // Click en Fondo (Backdrop) para cerrar
  document.getElementById('sb-backdrop')?.addEventListener('click', () => {
    collapseSidebarIfAllowed();
  });

  // Atajos de Teclado Globales (Esc para cerrar todo)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProfileMenu();
      collapseSidebarIfAllowed();
    }
  });

  // Alternar Menú de Perfil
  document.getElementById('top-profile-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('top-profile-menu');
    if (menu) menu.hidden = !menu.hidden;
  });

  // Cerrar menús al hacer clic fuera del contenedor de perfil
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('top-profile');
    if (wrap && !wrap.contains(e.target)) closeProfileMenu();
  });

  // Sincronización Inicial
  updateSBUser();
  syncSidebarNavState(S.currentPage || 'dashboard');
  applyUserPreferences();
  
  // Registro en el objeto window para compatibilidad legacy
  window.updateSBUser = updateSBUser;
  window.closeProfileMenu = closeProfileMenu;
  window.syncSidebarNavState = syncSidebarNavState;

  // Inicialización de la IA Copilot
  initAICopilot();
}

/**
 * Inicializa el botón flotante de la IA Copilot.
 */
export function initAICopilot() {
  const aiFab = document.getElementById('ai-copilot-fab');
  if (aiFab) {
    aiFab.addEventListener('click', () => {
      toast('🤖 EduGest AI Copilot: ¿En qué puedo ayudarte hoy?', 'info');
      console.log('[EduGest][AI] Copilot activado. Esperando comandos...');
      
      // Animación de feedback al hacer clic
      aiFab.classList.add('ai-active');
      setTimeout(() => aiFab.classList.remove('ai-active'), 1000);
    });
  }
}
