/**
 * Módulo del Panel de Autenticación (EduGest Auth).
 * --------------------------------------------------------------------------
 * Gestiona el inicio de sesión, registro de usuarios, recuperación de 
 * contraseñas y la inicialización de sesiones locales o en la nube (Supabase).
 * Incluye lógica de limitación de tasa (rate limiting) y validación de seguridad.
 */

import { S } from '../../core/state.js';
import { 
  uid, 
  nowIso,
  authEmailKey, 
  formatMsToMinSec, 
  canUseCloudAuth, 
  shouldFallbackToLocalAuth
} from '../../core/utils.js';
import { v, toast, openM, forceCloseM } from '../../core/ui.js';
import {
  persistLocalAuthUsers, 
  hydrateCloudStateForUser, 
  hydrateLocalWorkspaceForUser,
} from '../../core/hydration.js';
import {
  isEnabled as canUseSqlAuth,
  loginSqlAuth,
  registerSqlAuth,
  sendSqlPasswordReset,
} from '../../core/api-sql.js';
import {
  currentAuthMode,
  establecerAuthMode,
} from './utils/auth-mode.js';
import {
  ensureIndividualLicenseModel,
  finalizarSesionAutenticacion,
  mostrarTableroAutenticado,
  restoreSqlSessionIfAvailable,
} from './utils/session-flow.js';
import { setupAuthButtonListeners } from './utils/event-bindings.js';
import {
  clearRegisterFieldErrors,
  createLocalPasswordRecord,
  evaluateRegisterRateLimit,
  recordRegisterAttempt,
  rememberCurrentAuthAccessMode,
  resolveLocalAuthUser,
  setAuthNote,
  setRegisterFieldError,
  setupRegisterFieldUX,
  showAuthCornerToast,
  togglePasswordVisibility,
  validateRegisterPassword,
} from './utils/auth-support.js';

export { currentAuthMode, establecerAuthMode } from './utils/auth-mode.js';

// --- Auth Flow Logic ---

export function manejarAuthLoginTab() {
  if (currentAuthMode() === 'register') {
    establecerAuthMode('login');
    return;
  }
  autenticarUsuario();
}

export function manejarAuthRegisterTab() {
  if (currentAuthMode() !== 'register') {
    establecerAuthMode('register');
    return;
  }
  registrarUsuario();
}


export function manejarForgotPassword() {
  const input = document.getElementById('auth-forgot-email');
  if (input) input.value = authEmailKey(v('al-email'));
  setAuthNote(''); // Clear any existing auth note
  openM('m-auth-forgot');
  window.setTimeout(() => input?.focus(), 30);
}

// --- Cloud Auth Proxies ---

async function inspectCloudEmailAccount(email) {
  if (!canUseCloudAuth() || !window.EduGestCloud?.inspectEmailAccount) return null;
  try {
    return await window.EduGestCloud.inspectEmailAccount(email);
  } catch (_) {
    return null;
  }
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
  try {
    if (canUseCloudAuth()) {
      await window.EduGestCloud.sendPasswordReset(email);
    } else if (canUseSqlAuth()) {
      await sendSqlPasswordReset(email);
    } else {
      toast('Modo local: no se puede recuperar contraseña.', true);
      return;
    }
    toast('Enlace de recuperación enviado');
    forceCloseM('m-auth-forgot');
  } catch (error) {
    toast(window.EduGestCloud?.friendlyError?.(error) || error?.message || 'No se pudo iniciar la recuperación.', true);
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
      rememberCurrentAuthAccessMode('supabase');
      ensureIndividualLicenseModel();
      await hydrateCloudStateForUser(user).catch((hydrateError) => {
        console.warn('[EduGest][auth] Fallo al hidratar estado cloud tras registro.', hydrateError);
      });
      finalizarSesionAutenticacion(user, { openSetup: true, isNewAccount: true });
      recordRegisterAttempt(true);
      toast('Cuenta creada');
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
      toast('Supabase no respondió. Entraste en modo local.', 'warning');
    }
  } else if (canUseSqlAuth()) {
    try {
      const user = await registerSqlAuth(email, pass, name);
      rememberCurrentAuthAccessMode('sql');
      ensureIndividualLicenseModel();
      await hydrateCloudStateForUser(user).catch((hydrateError) => {
        console.warn('[EduGest][auth] Fallo al hidratar estado SQL tras registro.', hydrateError);
      });
      finalizarSesionAutenticacion(user, { openSetup: true, isNewAccount: true });
      recordRegisterAttempt(true);
      toast('Cuenta creada');
      return;
    } catch (error) {
      showAuthCornerToast(error?.message || 'No se pudo crear la cuenta.', 'Registro no completado', 'error');
      return;
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
      rememberCurrentAuthAccessMode('supabase');
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
  } else if (canUseSqlAuth()) {
    try {
      const user = await loginSqlAuth(email, pass);
      rememberCurrentAuthAccessMode('sql');
      ensureIndividualLicenseModel();
      const isNewUser = !!user?.isNewUser;
      finalizarSesionAutenticacion(user, { openSetup: isNewUser, isNewAccount: isNewUser });
      toast('Bienvenido');
      hydrateCloudStateForUser(user).catch((hydrateError) => {
        console.warn('[EduGest][auth] Fallo al hidratar estado SQL tras login.', hydrateError);
      });
      return;
    } catch (error) {
      if (!localUser) {
        showAuthCornerToast(error?.message || 'Credenciales incorrectas.', 'No pudimos iniciar sesión', 'error');
        return;
      }
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
      mostrarTableroAutenticado();
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
  restoreSqlSessionIfAvailable();
  
  // NO sobrescribir _renderPanel para evitar conflictos con el sistema de routing principal
  // El sistema de routing ya maneja el renderizado de paneles correctamente
  
  // Register handlers - intentar inmediatamente y también en DOMContentLoaded
  const setupHandlers = () => {
    if (document.getElementById('ar-pass') || document.getElementById('al-email')) {
      setupRegisterFieldUX();
    }
    
    setupAuthButtonListeners({
      autenticarUsuario,
      registrarUsuario,
      autenticarConProveedor,
      manejarForgotPassword,
    });
  };
  
  setupHandlers();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHandlers, { once: true });
  }
  
  // IMPORTANTE: Conectar botones también cuando el HTML de auth se monte dinámicamente
  window.addEventListener('aulabase:auth-mounted', () => {
    setTimeout(() => {
      setupRegisterFieldUX();
      setupAuthButtonListeners({
        autenticarUsuario,
        registrarUsuario,
        autenticarConProveedor,
        manejarForgotPassword,
      });
    }, 100);
  });
}

// compatibility exports - asignar al final del archivo cuando todas las funciones estén definidas
window.setAuthMode = establecerAuthMode;
window.establecerAuthMode = establecerAuthMode;
window.handleAuthLoginTab = manejarAuthLoginTab;
window.handleAuthRegisterTab = manejarAuthRegisterTab;
window.loginAuth = autenticarUsuario;
window.registerAuth = registrarUsuario;
window.autenticarConProveedor = autenticarConProveedor;
window.authWithProvider = autenticarConProveedor;
window.handleForgotPassword = manejarForgotPassword;
window.submitForgotPassword = submitForgotPassword;
window.togglePasswordVisibility = togglePasswordVisibility;
