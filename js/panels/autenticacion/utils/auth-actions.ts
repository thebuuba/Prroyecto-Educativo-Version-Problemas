type AuthActionEvent = MouseEvent | Event;

function getDatasetValue(element: Element, key: string): string {
  return String((element as HTMLElement).dataset?.[key] || '').trim();
}

function callLegacy(name: string, ...args: unknown[]): boolean {
  const fn = (window as Record<string, unknown>)[name];
  if (typeof fn !== 'function') {
    console.warn(`[EduGest][auth-actions] Acción legacy no disponible: ${name}`);
    return false;
  }
  fn(...args);
  return true;
}

export function handleDeclarativeAuthAction(trigger: Element, event: AuthActionEvent): boolean {
  const action = getDatasetValue(trigger, 'authAction');
  if (!action) return false;

  const context = getDatasetValue(trigger, 'authContext');
  const value = getDatasetValue(trigger, 'authValue');
  const provider = getDatasetValue(trigger, 'authProvider');
  const targetId = getDatasetValue(trigger, 'authTarget') || getDatasetValue(trigger, 'passwordTarget');

  switch (action) {
    case 'login':
      return callLegacy('loginAuth');
    case 'register':
      return callLegacy('registerAuth');
    case 'logout':
      return callLegacy('logoutAuth');
    case 'show-register':
      return callLegacy('setAuthMode', 'register');
    case 'show-login':
      return callLegacy('setAuthMode', 'login');
    case 'recover-password':
      return callLegacy('handleForgotPassword');
    case 'submit-password-reset':
      return callLegacy('submitForgotPassword');
    case 'toggle-password':
      return callLegacy('togglePasswordVisibility', targetId, trigger);
    case 'provider':
      return callLegacy('authWithProvider', provider);
    case 'submit-profile-setup':
      return callLegacy('saveSetup');
    case 'cancel-profile-setup':
      return callLegacy('cancelSetup');
    case 'clear-terms-error':
      return callLegacy('clearTermsAcceptanceError');
    case 'cancel-education-section':
      return callLegacy('cancelEducationSectionSetup');
    case 'pick-education-section':
      return callLegacy('pickSetupEducationSection', value);
    case 'confirm-education-section':
      return callLegacy('confirmSetupEducationSection');
    case 'continue':
      if (context === 'terms') return callLegacy('confirmTermsAcceptance');
      if (context === 'education-section') return callLegacy('confirmSetupEducationSection');
      break;
    case 'back':
      if (context === 'terms') return callLegacy('cancelTermsAcceptance');
      if (context === 'profile-setup') return callLegacy('returnSetupToRegister');
      if (context === 'auth-mode') return callLegacy('setAuthMode', 'login');
      break;
    default:
      break;
  }

  console.warn(`[EduGest][auth-actions] Acción declarativa no soportada: ${action}`, { context });
  return false;
}
