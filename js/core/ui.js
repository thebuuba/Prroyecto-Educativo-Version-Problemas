import { S } from './state.js';
import { fixMojibakeText } from './utils.js';

/**
 * Core UI helpers for EduGest.
 * These functions manage modals, toasts, and basic DOM interactions.
 */

// --- Basic DOM Helpers ---

/**
 * Gets the trimmed value of an input element by ID.
 * @param {string} id 
 * @returns {string}
 */
export function v(id) {
  return (document.getElementById(id)?.value || '').trim();
}

/**
 * Generates initials from a name string (e.g., "John Doe" -> "JD").
 * @param {string} n 
 * @returns {string}
 */
export function initials(n) {
  return (n || '').split(' ').filter(Boolean).map(w => w[0].toUpperCase()).join('').slice(0, 2);
}

// --- Modal Management ---

/**
 * Opens a modal and applies context.
 * @param {string} id 
 * @param {Object} context 
 */
export function openM(id, context = {}) {
  // Legacy hook for modal creation/initialization
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

  // Legacy enhancements
  if (typeof window.enableWritingAssist === 'function') window.enableWritingAssist(modal);
  if (typeof window.queueRenderedTextRepair === 'function') window.queueRenderedTextRepair(modal);
}

/**
 * Force closes a modal, bypassing mandatory checks.
 * @param {string} id 
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
 * Closes a modal with mandatory check validation.
 * @param {string} id 
 */
export function closeM(id) {
  // Legacy mandatory checks
  if (id === 'm-terms' && typeof window.enforceMandatoryTermsAcceptance === 'function' && window.enforceMandatoryTermsAcceptance()) return;
  if (id === 'm-education-section' && typeof window.enforceMandatoryEducationSelection === 'function' && window.enforceMandatoryEducationSelection()) return;
  if (id === 'm-setup' && typeof window.enforceMandatorySetup === 'function' && window.enforceMandatorySetup()) return;

  forceCloseM(id);
}

// --- Notifications ---

/**
 * Shows a global toast notification.
 * @param {string} msg 
 * @param {boolean|string} err 
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

// --- Compatibility Exports ---

window.v = v;
window.initials = initials;
window.openM = openM;
window.closeM = closeM;
window.forceCloseM = forceCloseM;
window.toast = toast;
