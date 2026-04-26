/**
 * Módulo del Panel de Autenticación (EduGest Auth).
 * --------------------------------------------------------------------------
 * Gestiona el inicio de sesión, registro de usuarios, recuperación de 
 * contraseñas y la inicialización de sesiones locales o en la nube (Firebase).
 * Incluye lógica de limitación de tasa (rate limiting) y validación de seguridad.
 */

import { S } from '../../core/state.js';
import { 
  ACCOUNT_MAX_TRUSTED_DEVICES, 
  ACCOUNT_MAX_ACTIVE_SESSIONS, 
  LICENSE_MODEL_VERSION, 
  TERMS_VERSION 
} from '../../core/constants.js';
import { 
  uid, 
  nowIso, 
  authEmailKey, 
  formatMsToMinSec, 
  canUseCloudAuth, 
  shouldFallbackToLocalAuth, 
  debugAuthFlow
} from '../../core/utils.js';
import { v, toast, openM, closeM, forceCloseM } from '../../core/ui.js';
import { 
  persist, 
  persistLocalAuthUsers, 
  applySessionUser, 
  hydrateCloudStateForUser, 
  hydrateLocalWorkspaceForUser 
} from '../../core/hydration.js';
import { go } from '../../core/routing.js';
import { isProfileSetupComplete } from '../configuracion-inicial/principal.js';
import {
  clearRegisterFieldErrors,
  createLocalPasswordRecord,
  evaluateRegisterRateLimit,
  recordRegisterAttempt,
  rememberCurrentAuthAccessMode,
  resetRegisterCodeFlow,
  resetRegisterStrengthState,
  resolveLocalAuthUser,
  setAuthNote,
  setRegisterFieldError,
  setupRegisterFieldUX,
  showAuthCornerToast,
  togglePasswordVisibility,
  updateRegisterPasswordStrengthUI,
  validateRegisterPassword,
} from './utils/auth-support.js';

// --- Auth Flow Logic ---

function currentAuthMode() {
  return document.querySelector('.auth-panel')?.dataset.mode === 'register' ? 'register' : 'login';
}

export function manejarAuthLoginTab() {
  if (currentAuthMode() === 'register') {
    setAuthMode('login');
    return;
  }
  autenticarUsuario();
}

export function manejarAuthRegisterTab() {
  if (currentAuthMode() !== 'register') {
    setAuthMode('register');
    return;
  }
  registrarUsuario();
}

function animateAuthPanel(panel, direction) {
  if (!panel) return;
  if (S.preferences?.authLoginAnimation === false || S.preferences?.animations === false) {
    panel.classList.remove('is-entering-left', 'is-entering-right');
    return;
  }
  panel.classList.remove('is-entering-left', 'is-entering-right');
  void panel.offsetWidth;
  panel.classList.add(direction === 'left' ? 'is-entering-left' : 'is-entering-right');
}

function animateAuthChrome(direction) {
  if (S.preferences?.authLoginAnimation === false || S.preferences?.animations === false) return;
  const headingNodes = document.querySelectorAll('#auth-title, #auth-subtitle');
  const headingClass = direction === 'left' ? 'is-fading-left' : 'is-fading-right';
  headingNodes.forEach((node) => {
    node.classList.remove('is-fading-left', 'is-fading-right');
    void node.offsetWidth;
    node.classList.add(headingClass);
  });
  const animatedNodes = document.querySelectorAll('.auth-social, .auth-switch-row');
  if (!animatedNodes.length) return;
  const className = direction === 'left' ? 'is-shifting-left' : 'is-shifting-right';
  animatedNodes.forEach((node) => {
    node.classList.remove('is-shifting-left', 'is-shifting-right');
    void node.offsetWidth;
    node.classList.add(className);
  });
}

function transitionAuthPanels(showLogin) {
  const loginBox = document.getElementById('auth-login-box');
  const registerBox = document.getElementById('auth-register-box');
  if (loginBox) loginBox.style.display = showLogin ? '' : 'none';
  if (registerBox) registerBox.style.display = showLogin ? 'none' : '';
  animateAuthPanel(showLogin ? loginBox : registerBox, showLogin ? 'left' : 'right');
  animateAuthChrome(showLogin ? 'left' : 'right');
}

export function establecerAuthMode(mode) {
  const login = mode !== 'register';
  const lb = document.getElementById('auth-login-box');
  const rb = document.getElementById('auth-register-box');
  const panel = document.querySelector('.auth-panel');
  const tt = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const loginSocial = document.querySelector('#m-auth .auth-panel > .auth-social');
  const socialDivider = document.getElementById('auth-social-divider');
  const switchCopy = document.getElementById('auth-switch-copy');
  const switchLink = document.getElementById('auth-switch-link');
  const registerSubmit = document.getElementById('auth-register-submit');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  
  transitionAuthPanels(login);
  if (panel) panel.dataset.mode = login ? 'login' : 'register';
  if (tt) tt.textContent = login ? 'Iniciar sesión' : 'Crear cuenta';
  if (subtitle) subtitle.textContent = login
    ? 'Ingresa tus credenciales para continuar.'
    : 'Únete a la excelencia académica estructurada.';
  if (loginSocial) loginSocial.style.display = login ? '' : 'none';
  if (socialDivider) socialDivider.textContent = login ? 'o usa tu email' : 'o usa tu email';
  if (switchCopy) switchCopy.textContent = login ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?';
  if (switchLink && switchLink.dataset.bound !== '1') {
    switchLink.dataset.bound = '1';
    switchLink.addEventListener('click', () => {
      const isCurrentlyLogin = document.querySelector('.auth-panel')?.dataset.mode === 'login';
      setAuthMode(isCurrentlyLogin ? 'register' : 'login');
    });
  }
  if (switchLink) {
    switchLink.textContent = login ? 'Regístrate' : 'Inicia sesión';
  }
  if (loginTab) {
    loginTab.classList.toggle('is-active', login);
    loginTab.setAttribute('aria-selected', login ? 'true' : 'false');
  }
  if (registerTab) {
    registerTab.classList.toggle('is-active', !login);
    registerTab.setAttribute('aria-selected', login ? 'false' : 'true');
  }
  if (login) resetRegisterCodeFlow();
  else {
    if (registerSubmit) {
      registerSubmit.innerHTML = 'Registrarse <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
    }
  }
  establecerAuthNote('');
  setupRegisterFieldUX();
  resetRegisterStrengthState();
  if (login) {
    clearRegisterFieldErrors();
    updateRegisterPasswordStrengthUI('');
  } else {
    updateRegisterPasswordStrengthUI('');
  }
}

export function manejarForgotPassword() {
  const input = document.getElementById('auth-forgot-email');
  if (input) input.value = authEmailKey(v('al-email'));
  establecerAuthNote(''); // Clear any existing auth note
  openM('m-auth-forgot');
  window.setTimeout(() => input?.focus(), 30);
}

// --- Firebase Auth Proxies ---

async function inspectCloudEmailAccount(email) {
  if (!canUseCloudAuth() || !window.EduGestCloud?.inspectEmailAccount) return null;
  try {
    return await window.EduGestCloud.inspectEmailAccount(email);
  } catch (_) {
    return null;
  }
}

function loginErrorMessageFromInspector(accountInfo) {
  if (!accountInfo) return 'Correo o contraseña incorrectos. Usa "¿Olvidaste tu contraseña?" para recuperar el acceso.';
  if (accountInfo.hasGoogle && !accountInfo.hasPassword) {
    return 'Esta cuenta está asociada a Google. Debes iniciar sesión con Google.';
  }
  if (accountInfo.hasFacebook && !accountInfo.hasPassword) {
    return 'Esta cuenta está asociada a Facebook. Debes iniciar sesión con Facebook.';
  }
  return 'Correo o contraseña incorrectos. Usa "¿Olvidaste tu contraseña?" para recuperar el acceso.';
}

function registerErrorMessageFromInspector(accountInfo) {
  if (!accountInfo) return 'No se pudo completar el registro. Inténtalo de nuevo.';
  if (accountInfo.hasGoogle && !accountInfo.hasPassword) {
    return 'Este correo ya está asociado a Google. Inicia sesión con Google.';
  }
  if (accountInfo.hasFacebook && !accountInfo.hasPassword) {
    return 'Este correo ya está asociado a Facebook. Inicia sesión con Facebook.';
  }
  if (accountInfo.hasPassword) {
    return 'Este correo ya está registrado. Inicia sesión o restablece tu contraseña.';
  }
  return 'Este correo ya está registrado. Inicia sesión o usa recuperación de contraseña.';
}

export async function submitForgotPassword() {
  const email = authEmailKey(v('auth-forgot-email'));
  if (!email || !email.includes('@')) {
    toast('Escribe un correo válido.', true);
    return;
  }
  if (!canUseCloudAuth()) {
    toast('Modo local: no se puede recuperar contraseña.', true);
    return;
  }
  try {
    await window.EduGestCloud.sendPasswordReset(email);
    toast('Enlace de recuperación enviado');
    forceCloseM('m-auth-forgot');
  } catch (error) {
    toast(window.EduGestCloud.friendlyError(error), true);
  }
}

function ensureIndividualLicenseModel() {
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  const current = S.profile.accountLicense || {};
  S.profile.accountLicense = {
    ...current,
    type: 'individual_teacher',
    shareAllowed: false,
    maxTrustedDevices: ACCOUNT_MAX_TRUSTED_DEVICES,
    maxActiveSessions: ACCOUNT_MAX_ACTIVE_SESSIONS,
    policyVersion: LICENSE_MODEL_VERSION,
    updatedAt: nowIso(),
  };
}

function shouldOpenSetupAfterAuth() {
  const setupModalExists = !!document.getElementById('m-setup');
  if (!setupModalExists) return false;
  const profile = S.profile || {};
  if (profile.setupCompleted) return false;
  return !isProfileSetupComplete();
}

function mostrarTableroAutenticado() {
  forceCloseM('m-auth');
  forceCloseM('m-auth-forgot');
  
  document.body?.classList.remove('auth-screen-open');
  
  // FORZAR EL CIERRE DEL MODAL DE AUTH - FIX DEL PROBLEMA
  const authModal = document.getElementById('m-auth');
  if (authModal) {
    authModal.classList.remove('open');
    authModal.style.setProperty('display', 'none', 'important');
  }
  
  // Ocultar manualmente el splash screen si aún está visible
  const splash = document.getElementById('app-boot');
  if (splash) {
    splash.dataset.bootHidden = '1';
    splash.classList.add('is-hidden');
    setTimeout(() => splash.remove(), 280);
  }

  go('tablero');
  
  // Forzar actualización de la UI después de la navegación
  setTimeout(() => {
    if (typeof window.refreshTop === 'function') {
      window.refreshTop();
    }
  }, 100);
}

function finalizarSesionAutenticacion(user, options = {}) {
  const { openSetup = false, isNewAccount = false } = options;
  
  // Si es un usuario existente, no abrir setup siempre ir al dashboard
  const shouldOpenSetup = isNewAccount && openSetup;
  
  applySessionUser(user);
  ensureIndividualLicenseModel();
  persist();
  
  if (shouldOpenSetup) {
    closeM('m-auth');
    openM('m-setup', { fromAuth: true });
  } else {
    mostrarTableroAutenticado();
  }
}

// --- Main Auth Actions ---

/**
 * Ejecuta el proceso de registro de un nuevo usuario.
 * Intenta registro en la nube primero, con caída (fallback) a base de datos local.
 * @async
 */
export async function registrarUsuario() {
  const name = v('ar-name');
  const email = authEmailKey(v('ar-email'));
  const pass = (document.getElementById('ar-pass')?.value || '').trim();
  const pass2 = (document.getElementById('ar-pass2')?.value || '').trim();
  const termsChecked = !!document.getElementById('ar-terms-check')?.checked;
  
  clearRegisterFieldErrors();
  const limit = evaluateRegisterRateLimit();
  if (limit.blocked) {
    const wait = formatMsToMinSec(limit.remainingMs);
    showAuthCornerToast(`Demasiados intentos. Inténtalo en ${wait}.`, 'Bloqueo temporal', 'warn');
    return;
  }
  
  if (!name || !email || !pass || !pass2) {
    if (!name) setRegisterFieldError('ar-name', 'Escribe tu nombre completo.');
    if (!email) setRegisterFieldError('ar-email', 'Escribe un correo válido.');
    if (!pass) setRegisterFieldError('ar-pass', 'Crea una contraseña segura.');
    if (!pass2) setRegisterFieldError('ar-pass2', 'Confirma tu contraseña.');
    return;
  }
  if (!email.includes('@')) {
    setRegisterFieldError('ar-email', 'Revisa el formato del correo.');
    return;
  }
  const passwordError = validateRegisterPassword(pass);
  if (passwordError) {
    setRegisterFieldError('ar-pass', passwordError);
    return;
  }
  if (pass !== pass2) {
    setRegisterFieldError('ar-pass2', 'Las contraseñas no coinciden.');
    return;
  }
  if (!termsChecked) {
    const termsError = document.getElementById('ar-terms-error');
    if (termsError) {
      termsError.hidden = false;
      termsError.textContent = 'Debes aceptar los términos y la política de privacidad.';
    }
    return;
  }
  
  if (canUseCloudAuth()) {
    try {
      const user = await window.EduGestCloud.register(email, pass, name);
      rememberCurrentAuthAccessMode('email');
      ensureIndividualLicenseModel();
      finalizarSesionAutenticacion(user, { openSetup: true, isNewAccount: true });
      recordRegisterAttempt(true);
      toast('Cuenta creada');
      hydrateCloudStateForUser(user).catch(console.error);
    } catch (error) {
      const code = String(error?.code || '').trim();
      if (code === 'auth/email-already-in-use') {
        const info = await inspectCloudEmailAccount(email);
        showAuthCornerToast(registerErrorMessageFromInspector(info), 'Correo ya registrado', 'error');
        return;
      }
      if (!shouldFallbackToLocalAuth(error)) {
        toast(window.EduGestCloud.friendlyError(error), true);
        return;
      }
      // Local fallback
      const passwordRecord = await createLocalPasswordRecord(pass);
      const user = {
        id: uid(),
        name,
        email,
        passHash: passwordRecord.hash,
        passSalt: passwordRecord.salt,
        passAlgo: 'sha256-salted-v1',
        createdAt: nowIso(),
        authMode: 'local',
      };
      S.authUsers.push(user);
      persistLocalAuthUsers();
      await hydrateLocalWorkspaceForUser(user);
      rememberCurrentAuthAccessMode('local');
      finalizarSesionAutenticacion(user, { openSetup: true, isNewAccount: true });
      recordRegisterAttempt(true);
      toast('Firebase no respondió. Entraste en modo local.', 'warning');
    }
  } else {
    // Local flow only
    const passwordRecord = await createLocalPasswordRecord(pass);
    const user = {
      id: uid(),
      name,
      email,
      passHash: passwordRecord.hash,
      passSalt: passwordRecord.salt,
      passAlgo: 'sha256-salted-v1',
      createdAt: nowIso(),
      authMode: 'local',
    };
    S.authUsers.push(user);
    persistLocalAuthUsers();
    await hydrateLocalWorkspaceForUser(user);
    rememberCurrentAuthAccessMode('local');
    finalizarSesionAutenticacion(user, { openSetup: true, isNewAccount: true });
    recordRegisterAttempt(true);
    toast('Cuenta local creada');
  }
}

/**
 * Ejecuta el proceso de inicio de sesión.
 * Valida credenciales contra la nube o el almacenamiento local.
 * @async
 */
export async function autenticarUsuario() {
  const email = authEmailKey(v('al-email'));
  const pass = (document.getElementById('al-pass')?.value || '').trim();
  
  if (!email || !pass) {
    showAuthCornerToast('Completa correo y contraseña.', 'Faltan datos', 'error');
    return;
  }
  
  const localAuth = await resolveLocalAuthUser(email, pass);
  const localUser = localAuth.user;
  if (localAuth.migrated) persistLocalAuthUsers();

  if (canUseCloudAuth()) {
    try {
      const user = await window.EduGestCloud.login(email, pass);
      rememberCurrentAuthAccessMode('email');
      ensureIndividualLicenseModel();
      const isNewUser = !!user?.isNewUser;
      finalizarSesionAutenticacion(user, { openSetup: isNewUser, isNewAccount: isNewUser });
      toast('Bienvenido');
      hydrateCloudStateForUser(user).catch((hydrateError) => {
        console.warn('[EduGest][auth] Fallo al hidratar estado cloud tras login.', hydrateError);
      });
    } catch (error) {
      if (localUser) {
        rememberCurrentAuthAccessMode('local');
        finalizarSesionAutenticacion(localUser, { openSetup: false, isNewAccount: false });
        toast('Entraste en modo local.', 'warning');
        hydrateLocalWorkspaceForUser(localUser).catch((hydrateError) => {
          console.warn('[EduGest][auth] Fallo al hidratar workspace local tras fallback de login.', hydrateError);
        });
        return;
      }
      toast(window.EduGestCloud.friendlyError(error), true);
    }
  } else {
    if (localUser) {
      rememberCurrentAuthAccessMode('local');
      finalizarSesionAutenticacion(localUser, { openSetup: false, isNewAccount: false });
      toast('Bienvenido');
      hydrateLocalWorkspaceForUser(localUser).catch((hydrateError) => {
        console.warn('[EduGest][auth] Fallo al hidratar workspace local tras login.', hydrateError);
      });
    } else {
      toast('Credenciales incorrectas.', true);
    }
  }
}

export async function autenticarConProveedor(provider) {
  if (!canUseCloudAuth()) {
    toast('Acceso social no disponible en modo local.', true);
    return;
  }
  
  try {
    const user = await window.EduGestCloud.loginWithProvider(provider);
    
    if (user?.redirected) {
      return;
    }
    
    rememberCurrentAuthAccessMode(provider === 'facebook' ? 'facebook' : 'google');
    ensureIndividualLicenseModel();
    
    const isNewUser = !!user?.isNewUser;
    finalizarSesionAutenticacion(user, { openSetup: isNewUser, isNewAccount: isNewUser });
    
    toast('Bienvenido');
    
    try {
      await hydrateCloudStateForUser(user);
    } catch (hydrateError) {
      console.warn('[EduGest][auth] Fallo al hidratar estado cloud tras login social.', hydrateError);
    }
  } catch (error) {
    const code = String(error?.code || '').trim();
    const shouldRedirect = new Set([
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/operation-not-supported-in-this-environment',
      'auth/unauthorized-domain',
    ]).has(code);
    if (shouldRedirect) {
      return;
    }
    toast(window.EduGestCloud.friendlyError(error), true);
  }
}




/**
 * Initialize modular auth panel and register it to the global routing system.
 */
export function inicializar() {
  console.log('[AuthPanel] Inicializando panel de auth');
  
  // NO sobrescribir _renderPanel para evitar conflictos con el sistema de routing principal
  // El sistema de routing ya maneja el renderizado de paneles correctamente
  
  // Register handlers
  setupRegisterFieldUX();
  console.log('[AuthPanel] Panel de auth inicializado');
}

// compatibility exports 
window.setAuthMode = setAuthMode;
window.handleAuthLoginTab = handleAuthLoginTab;
window.handleAuthRegisterTab = handleAuthRegisterTab;
window.loginAuth = loginAuth;
window.registerAuth = registerAuth;
window.autenticarConProveedor = autenticarConProveedor;
window.handleForgotPassword = handleForgotPassword;
window.submitForgotPassword = submitForgotPassword;
window.togglePasswordVisibility = togglePasswordVisibility;

// Auto-init if we are currently on the auth page
if (S.currentPage === 'auth') {
  init();
}
