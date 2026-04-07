/**
 * App Shell Controller
 * Modernized version of the sidebar, profile menu and topbar logic.
 * Handles the "Living Interface" interactions.
 */

import { S, persist } from './state.js';
import { 
  initials,
  periodName,
  getDisplayUserName,
  toggleDarkMode,
  toggleSidebarPinnedPreference,
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
 * --- UI Synchronization ---
 */

export function updateSBUser() {
  const sidebarName = document.getElementById('sb-name');
  const sidebarRole = document.getElementById('sb-role');
  const topName = document.getElementById('top-inline-name');
  const topRole = document.getElementById('top-inline-role');
  const avatar = document.getElementById('sb-av');
  const avatarImg = document.getElementById('sb-av-img');
  
  const displayName = getDisplayUserName();
  const roleText = S.profile ? `${S.profile.role} - ${periodName()}` : (S.sessionUserId ? 'Perfil incompleto' : 'Sin sesión');

  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarRole) sidebarRole.textContent = roleText;
  if (topName) topName.textContent = displayName;
  if (topRole) topRole.textContent = roleText;
  
  if (avatar) avatar.textContent = initials(displayName);
  if (avatarImg) {
    const cleanName = encodeURIComponent(displayName !== 'Sin perfil' ? displayName : 'Usuario');
    avatarImg.src = `https://ui-avatars.com/api/?name=${cleanName}&background=1E293B&color=fff&size=40`;
  }
  
  // Toggle visibility of logout based on session
  const logoutBtn = document.getElementById('sb-logout');
  if (logoutBtn) logoutBtn.style.display = S.sessionUserId ? '' : 'none';
}

export function closeProfileMenu() {
  const toggle = document.getElementById('top-profile-toggle');
  const menu = document.getElementById('top-profile-menu');
  if (toggle && menu) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }
}

/**
 * --- Initialization ---
 */

export function initShell() {
  // Listeners for Navigation Items
  if (STATIC_DOM.navLinks) {
    STATIC_DOM.navLinks.filter(el => el.dataset.p).forEach(el => {
      el.addEventListener('click', () => {
        const requestedPage = el.dataset.p;
        collapseSidebarIfAllowed();
        go(requestedPage, { animatePanelTransition: true });
      });
    });
  }

  // Sidebar Interaction
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

  // Dark Mode
  document.getElementById('sb-dark-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDarkMode();
  });

  // Pin Sidebar
  document.getElementById('sb-pin-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebarPinnedPreference();
  });

  // Backdrop
  document.getElementById('sb-backdrop')?.addEventListener('click', () => {
    collapseSidebarIfAllowed();
  });

  // Global Keydown (Esc)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProfileMenu();
      collapseSidebarIfAllowed();
    }
  });

  // Profile Toggle
  document.getElementById('top-profile-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('top-profile-menu');
    if (menu) menu.hidden = !menu.hidden;
  });

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('top-profile');
    if (wrap && !wrap.contains(e.target)) closeProfileMenu();
  });

  // Initial Sync
  updateSBUser();
  applyUserPreferences();
  
  // Register in window
  window.updateSBUser = updateSBUser;
  window.closeProfileMenu = closeProfileMenu;
}
