/**
 * Módulo de Configuración Inicial (Profile Setup / Onboarding).
 * --------------------------------------------------------------------------
 * Gestiona el modal m-setup para completar el perfil del docente tras el login.
 * Reemplaza la lógica legada que residía en el monolito 00-core-state-and-utils.js.
 */

import { S } from '../../core/state.js';
import { persist } from '../../core/hydration.js';
import { openM, closeM } from '../../core/ui.js';
import { go } from '../../core/routing.js';
import { 
  v, 
  normalizePhoneValue, 
  phoneHasValidDigits, 
  buildProfileFullName, 
  normalizeSchoolName,
  applyEducationSectionTheme,
  escapeHtml
} from '../../core/utils.js';

/**
 * Inicializa el panel de configuración inicial.
 * Registra las funciones globales necesarias para el HTML.
 */
export function inicializar() {
  // Exportar funciones globales para compatibilidad con HTML
  window.saveSetup = guardarSetup;
  window.cancelSetup = cancelSetup;
  window.populateSetupForm = populateSetupForm;
  window.enforceMandatorySetup = enforceMandatorySetup;
  window.handlePhoneInput = manejarPhoneInput;
  window.handleInstitutionInput = manejarInstitutionInput;
  window.handleInstitutionKeydown = manejarInstitutionKeydown;
  window.updateInstitutionInlineHint = actualizarInstitutionInlineHint;
  window.clearInstitutionInlineHint = clearInstitutionInlineHint;
}

/**
 * Rellena el formulario con datos actuales del perfil (S.profile).
 * Se invoca automáticamente al abrir el modal m-setup desde ui.js.
 */
export function populateSetupForm() {
  const p = S.profile || {};
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('s-name', p.firstName || '');
  setVal('s-lastname', p.lastName || '');
  setVal('s-phone', p.phone || '');
  setVal('s-role', p.role || 'Docente');
  setVal('s-inst', p.inst || '');
  setVal('s-year', p.year || S.schoolYear?.name || '2025-2026');
  setVal('s-period', p.period || '1er Período');

  if (typeof window.renderSchoolSuggestions === 'function') {
    window.renderSchoolSuggestions();
  }
}

/**
 * Guarda los datos del formulario de configuración.
 * Valida campos obligatorios y transiciona al usuario al Dashboard.
 */
export async function guardarSetup() {
  const firstName = v('s-name');
  const lastName = v('s-lastname');
  const phone = normalizePhoneValue(v('s-phone'));
  const role = v('s-role');
  const inst = normalizeSchoolName(v('s-inst'));
  const year = v('s-year');
  const pRaw = v('s-period');
  
  // Validaciones críticas
  if (!firstName) { window.toast('Completa tu nombre (ej. María)', true); return; }
  if (!lastName) { window.toast('Completa tu apellido (ej. Rodríguez)', true); return; }
  if (!phoneHasValidDigits(phone)) { window.toast('Escribe un teléfono válido (10 dígitos)', true); return; }
  if (!role) { window.toast('Selecciona tu rol', true); return; }
  if (!inst) { window.toast('Escribe el nombre de tu institución', true); return; }
  if (!year) { window.toast('Selecciona el año escolar', true); return; }
  if (!pRaw) { window.toast('Selecciona el período actual', true); return; }

  const name = buildProfileFullName(firstName, lastName);
  
  // Mapeo simple de Período -> ID (P1..P4)
  const normalizedP = String(pRaw).toLowerCase();
  const pid = normalizedP.includes('1') ? 'P1' : 
              normalizedP.includes('2') ? 'P2' : 
              normalizedP.includes('3') ? 'P3' : 'P4';

  // Actualización del estado raíz S
  if (!S.profile) S.profile = {};
  Object.assign(S.profile, {
    name,
    firstName,
    lastName,
    phone,
    role,
    inst,
    year,
    period: pRaw,
    // Preservar secciones educativas si ya existen
    educationSection: S.profile.educationSection || '',
    educationSections: S.profile.educationSections || [],
    teachingProfile: {
      ...(S.profile.teachingProfile || {}),
      center: inst,
      educationLevels: S.profile.educationSections || []
    }
  });

  S.schoolYear = { id: year, name: year };
  S.activePeriodId = pid;
  S.profile.setupCompleted = true; // Nueva marca para evitar redundancia

  // Persistir cambios inmediatamente
  try {
    await persist({ immediate: true });
    closeM('m-setup');

    // Flujo de seguridad: si no hay nivel educativo, forzar su selección
    if (!S.profile.educationSection) {
      window.toast('Perfil guardado. Ahora selecciona tu nivel educativo.', 'warning');
      if (typeof window.openEducationSectionSetup === 'function') {
        window.openEducationSectionSetup({ fromAuth: true });
      }
      return;
    }

    // Actualizar UI y navegar
    if (typeof window.updateSBUser === 'function') window.updateSBUser();
    go('dashboard'); // Usar 'dashboard' en lugar de 'tablero' para consistencia
    window.toast('¡Perfil configurado correctamente!');
  } catch (error) {
    console.error('[EduGest][setup] Error al guardar:', error);
    window.toast('Hubo un problema al guardar tu perfil.', true);
  }
}

/**
 * Cancela el setup. Si el perfil es obligatorio y está incompleto, cierra sesión.
 */
export function cancelSetup() {
  if (requiresProfileSetupCompletion()) {
    const shouldLogout = window.confirm('Tu perfil está incompleto. ¿Deseas cerrar sesión?');
    if (shouldLogout && typeof window.logoutAuth === 'function') {
      window.logoutAuth();
    }
    return;
  }
  closeM('m-setup');
  go('dashboard');
}

/**
 * Verifica si el perfil ya contiene los datos mínimos de operación.
 */
export function isProfileSetupComplete() {
  const p = S.profile || {};
  if (p.setupCompleted) return true; // Si ya se completó una vez, no forzar
  return !!p.name && !!(p.firstName || p.lastName) && phoneHasValidDigits(p.phone || '') && !!p.role && !!p.inst && !!p.year && !!p.period;
}

/**
 * Indica si el usuario actual sigue obligado a completar su perfil.
 */
export function requiresProfileSetupCompletion() {
  return !!S.sessionUserId && !isProfileSetupComplete();
}

/**
 * Guardia de UI para asegurar que el usuario no pase al panel sin perfil.
 */
export function enforceMandatorySetup(showToast = false) {
  if (!requiresProfileSetupCompletion()) return false;
  openM('m-setup', { fromAuth: true });
  if (showToast) window.toast('Debes completar tu perfil para continuar.', true);
  return true;
}

// --- Manejadores de Eventos del Formulario ---

/**
 * Normaliza el teléfono mientras el usuario escribe.
 */
export function manejarPhoneInput(el) {
  if (!el) return;
  const caretAtEnd = el.selectionStart === el.value.length;
  el.value = normalizePhoneValue(el.value);
  if (caretAtEnd) el.setSelectionRange(el.value.length, el.value.length);
}

/**
 * Gestiona el autocompletado inline del nombre de la institución.
 */
export function actualizarInstitutionInlineHint(inputEl = null) {
  const input = inputEl || document.getElementById('s-inst');
  const prefixEl = document.getElementById('s-inst-ghost-prefix');
  const suffixEl = document.getElementById('s-inst-ghost-suffix');
  if (!input || !prefixEl || !suffixEl) return;

  const typed = normalizeSchoolName(input.value || '');
  if (!typed) {
    clearInstitutionInlineHint();
    return;
  }

  // Buscar en el catálogo (usando EduGestConfig o S.schools)
  const schools = Array.isArray(S.schools) ? S.schools : [];
  const lowerTyped = typed.toLowerCase();
  const suggestion = schools.find(s => s.toLowerCase().startsWith(lowerTyped) && s.toLowerCase() !== lowerTyped);

  if (!suggestion) {
    clearInstitutionInlineHint();
    return;
  }

  const suffix = suggestion.slice(typed.length);
  input.dataset.inlineSuggestion = suggestion;
  prefixEl.textContent = typed;
  suffixEl.textContent = suffix;
}

export function clearInstitutionInlineHint() {
  const input = document.getElementById('s-inst');
  const prefixEl = document.getElementById('s-inst-ghost-prefix');
  const suffixEl = document.getElementById('s-inst-ghost-suffix');
  if (input) input.dataset.inlineSuggestion = '';
  if (prefixEl) prefixEl.textContent = '';
  if (suffixEl) suffixEl.textContent = '';
}

export function manejarInstitutionInput(inputEl) {
  if (!inputEl) return;
  inputEl.value = String(inputEl.value || '').replace(/\s{2,}/g, ' ');
  updateInstitutionInlineHint(inputEl);
}

export function manejarInstitutionKeydown(event) {
  const input = event?.currentTarget || document.getElementById('s-inst');
  if (!input) return;
  if (!['Tab', 'ArrowRight', 'End'].includes(event.key)) return;

  const suggestion = String(input.dataset.inlineSuggestion || '').trim();
  const caretAtEnd = input.selectionStart === input.value.length;
  if (!suggestion || !caretAtEnd) return;

  event.preventDefault();
  input.value = suggestion;
  clearInstitutionInlineHint();
}

// Inyección en window para compatibilidad con HTML onclick e inline scripts
window.saveSetup = guardarSetup;
window.cancelSetup = cancelSetup;
window.populateSetupForm = populateSetupForm;
window.enforceMandatorySetup = enforceMandatorySetup;
window.handlePhoneInput = manejarPhoneInput;
window.handleInstitutionInput = manejarInstitutionInput;
window.handleInstitutionKeydown = manejarInstitutionKeydown;
window.updateInstitutionInlineHint = actualizarInstitutionInlineHint;
window.clearInstitutionInlineHint = clearInstitutionInlineHint;

// Export de compatibilidad para nombres en inglés
export const saveSetup = guardarSetup;
export const handlePhoneInput = manejarPhoneInput;
export const handleInstitutionInput = manejarInstitutionInput;
export const handleInstitutionKeydown = manejarInstitutionKeydown;
export const updateInstitutionInlineHint = actualizarInstitutionInlineHint;

// Auxiliar para volver al registro (cierra sesión)
window.returnSetupToRegister = () => {
  if (typeof window.logoutAuth === 'function') {
    window.logoutAuth();
  } else {
    // Fallback si no hay módulo de auth
    window.location.reload();
  }
};
