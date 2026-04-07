import { S } from '../core/state.js';
import { 
  REGISTER_RATE_LIMIT, 
  ACCOUNT_MAX_TRUSTED_DEVICES, 
  ACCOUNT_MAX_ACTIVE_SESSIONS, 
  LICENSE_MODEL_VERSION, 
  TERMS_VERSION 
} from '../core/constants.js';
import { 
  uid, 
  nowIso, 
  authEmailKey, 
  formatMsToMinSec, 
  canUseCloudAuth, 
  shouldFallbackToLocalAuth, 
  normalizeAuthAccessMode,
  debugAuthFlow
} from '../core/utils.js';
import { v, toast, openM, closeM, forceCloseM } from '../core/ui.js';
import { 
  persist, 
  persistLocalAuthUsers, 
  applySessionUser, 
  hydrateCloudStateForUser, 
  hydrateLocalWorkspaceForUser 
} from '../core/hydration.js';
import { go } from '../core/routing.js';

/**
 * Authentication Panel Module
 * Handles login, registration, and session initialization.
 */

let REGISTER_PASSWORD_STRENGTH_VISIBLE = false;
let AUTH_CORNER_TOAST_TIMER = 0;

// --- UI Helpers ---

export function setAuthNote(message = '', tone = 'info', options = {}) {
  const note = document.getElementById('auth-note');
  const noteTitle = document.getElementById('auth-note-title');
  const noteText = document.getElementById('auth-note-text');
  if (!note) return;
  const msg = String(message || '').trim();
  if (!msg) {
    note.hidden = true;
    if (noteTitle) noteTitle.textContent = '';
    if (noteText) noteText.textContent = '';
    note.className = 'auth-note';
    return;
  }
  const { title = '' } = options;
  note.hidden = false;
  if (noteTitle) noteTitle.textContent = title;
  if (noteText) noteText.textContent = msg;
  note.className = `auth-note ${tone}`;
}

export function showAuthCornerToast(message = '', title = 'Aviso', tone = 'info') {
  const msg = String(message || '').trim();
  if (!msg) return;
  const safeTone = ['info', 'warn', 'error'].includes(String(tone || '').trim()) ? String(tone || '').trim() : 'info';
  let toastEl = document.getElementById('auth-corner-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'auth-corner-toast';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.innerHTML = `
      <div class="auth-corner-toast-dot" aria-hidden="true">
        <span class="material-symbols-outlined">info</span>
      </div>
      <div class="auth-corner-toast-body">
        <strong class="auth-corner-toast-title"></strong>
        <div class="auth-corner-toast-text"></div>
      </div>`;
    document.body.appendChild(toastEl);
  }
  toastEl.className = `auth-corner-toast tone-${safeTone}`;
  toastEl.dataset.tone = safeTone;
  const titleNode = toastEl.querySelector('.auth-corner-toast-title');
  const textNode = toastEl.querySelector('.auth-corner-toast-text');
  if (titleNode) titleNode.textContent = String(title || 'Aviso').trim();
  if (textNode) textNode.textContent = msg;
  toastEl.classList.remove('show');
  void toastEl.offsetWidth;
  toastEl.classList.add('show');
  if (AUTH_CORNER_TOAST_TIMER) window.clearTimeout(AUTH_CORNER_TOAST_TIMER);
  AUTH_CORNER_TOAST_TIMER = window.setTimeout(() => {
    toastEl.classList.remove('show');
  }, 5000);
}

export function rememberCurrentAuthAccessMode(mode) {
  const normalized = normalizeAuthAccessMode(mode);
  if (!normalized) return;
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  S.profile.authAccessMode = normalized;
}

export function resetRegisterCodeFlow(clearCode = true) {
  const code = document.getElementById('ar-code');
  const registerBtn = document.getElementById('auth-register-submit');
  if (code && clearCode) code.value = '';
  if (registerBtn) {
    registerBtn.innerHTML = 'Registrarse <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
  }
}

// --- Rate Limiting ---

function readRegisterRateState() {
  try {
    const raw = window.localStorage.getItem(REGISTER_RATE_LIMIT.key);
    if (!raw) return { attempts: [], blockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      attempts: Array.isArray(parsed?.attempts) ? parsed.attempts.filter((value) => Number.isFinite(value)) : [],
      blockedUntil: Number(parsed?.blockedUntil) || 0,
    };
  } catch (_) {
    return { attempts: [], blockedUntil: 0 };
  }
}

function persistRegisterRateState(state) {
  try {
    window.localStorage.setItem(REGISTER_RATE_LIMIT.key, JSON.stringify({
      attempts: Array.isArray(state?.attempts) ? state.attempts : [],
      blockedUntil: Number(state?.blockedUntil) || 0,
    }));
  } catch (_) {}
}

function evaluateRegisterRateLimit() {
  const now = Date.now();
  const state = readRegisterRateState();
  const attempts = state.attempts.filter((ts) => now - ts <= REGISTER_RATE_LIMIT.windowMs);
  let blockedUntil = Number(state.blockedUntil) || 0;
  if (blockedUntil <= now) blockedUntil = 0;
  if (!blockedUntil && attempts.length >= REGISTER_RATE_LIMIT.maxAttempts) {
    blockedUntil = now + REGISTER_RATE_LIMIT.blockMs;
  }
  const remainingMs = blockedUntil > now ? blockedUntil - now : 0;
  const blocked = remainingMs > 0;
  persistRegisterRateState({ attempts, blockedUntil });
  return { blocked, remainingMs, attempts };
}

function recordRegisterAttempt(success = false) {
  const now = Date.now();
  if (success) {
    persistRegisterRateState({ attempts: [], blockedUntil: 0 });
    return;
  }
  const state = readRegisterRateState();
  const attempts = state.attempts.filter((ts) => now - ts <= REGISTER_RATE_LIMIT.windowMs);
  attempts.push(now);
  persistRegisterRateState({ attempts, blockedUntil: Number(state.blockedUntil) || 0 });
}

// --- Validation & Crypto ---

function getRegisterStrengthMeta(password = '') {
  const pass = String(password || '');
  if (!pass) return { score: 0, label: '', percent: 0, tone: 'weak' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  const labels = ['Débil', 'Aceptable', 'Buena', 'Fuerte'];
  const tones = ['weak', 'fair', 'good', 'strong'];
  const idx = Math.max(0, Math.min(score - 1, 3));
  return {
    score,
    label: labels[idx] || 'Débil',
    percent: [25, 50, 75, 100][idx] || 0,
    tone: tones[idx] || 'weak',
  };
}

function validateRegisterPassword(password = '') {
  const pass = String(password || '');
  if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) return 'La contraseña debe incluir letras y números.';
  return '';
}

function setRegisterFieldError(fieldId, message = '') {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  const msg = String(message || '').trim();
  if (error) {
    error.textContent = msg;
    error.hidden = !msg;
  }
  if (input) {
    input.classList.toggle('is-invalid', !!msg);
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

function clearRegisterFieldErrors() {
  ['ar-name', 'ar-email', 'ar-pass', 'ar-pass2'].forEach((id) => setRegisterFieldError(id, ''));
  const termsError = document.getElementById('ar-terms-error');
  if (termsError) {
    termsError.hidden = true;
    termsError.textContent = '';
  }
}

function updateRegisterPasswordStrengthUI(password = '') {
  const wrap = document.getElementById('ar-pass-strength');
  const fill = document.getElementById('ar-pass-strength-fill');
  const label = document.getElementById('ar-pass-strength-label');
  if (!wrap || !fill || !label) return;
  const meta = getRegisterStrengthMeta(password);
  if (!REGISTER_PASSWORD_STRENGTH_VISIBLE || !password) {
    wrap.hidden = true;
    fill.style.width = '0%';
    fill.dataset.tone = '';
    label.textContent = 'Débil';
    return;
  }
  wrap.hidden = false;
  fill.style.width = `${meta.percent}%`;
  fill.dataset.tone = meta.tone;
  label.textContent = meta.label;
}

function setupRegisterFieldUX() {
  const passInput = document.getElementById('ar-pass');
  const pass2Input = document.getElementById('ar-pass2');
  const nameInput = document.getElementById('ar-name');
  const emailInput = document.getElementById('ar-email');
  const termsInput = document.getElementById('ar-terms-check');
  if (passInput && passInput.dataset.registerUxBound !== '1') {
    passInput.dataset.registerUxBound = '1';
    passInput.addEventListener('input', () => {
      REGISTER_PASSWORD_STRENGTH_VISIBLE = true;
      setRegisterFieldError('ar-pass', '');
      updateRegisterPasswordStrengthUI(passInput.value || '');
    });
  }
  if (pass2Input && pass2Input.dataset.registerUxBound !== '1') {
    pass2Input.dataset.registerUxBound = '1';
    pass2Input.addEventListener('input', () => setRegisterFieldError('ar-pass2', ''));
  }
  if (nameInput && nameInput.dataset.registerUxBound !== '1') {
    nameInput.dataset.registerUxBound = '1';
    nameInput.addEventListener('input', () => setRegisterFieldError('ar-name', ''));
  }
  if (emailInput && emailInput.dataset.registerUxBound !== '1') {
    emailInput.dataset.registerUxBound = '1';
    emailInput.addEventListener('input', () => setRegisterFieldError('ar-email', ''));
  }
  if (termsInput && termsInput.dataset.registerUxBound !== '1') {
    termsInput.dataset.registerUxBound = '1';
    termsInput.addEventListener('change', () => {
      const termsError = document.getElementById('ar-terms-error');
      if (termsError) {
        termsError.hidden = true;
        termsError.textContent = '';
      }
    });
  }
}

// --- Local Cryptography ---

function createLocalPasswordSalt() {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function hashLocalPassword(password, salt) {
  const raw = `${salt}::${String(password || '')}`;
  if (window.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(raw)));
}

async function createLocalPasswordRecord(password) {
  const salt = createLocalPasswordSalt();
  const hash = await hashLocalPassword(password, salt);
  return { salt, hash };
}

async function resolveLocalAuthUser(email, password) {
  const user = S.authUsers.find((entry) => authEmailKey(entry.email) === authEmailKey(email));
  if (!user) return { user: null, migrated: false };
  const plainPassword = String(password || '');
  if (user.passHash && user.passSalt) {
    const hashed = await hashLocalPassword(plainPassword, user.passSalt);
    return { user: hashed === user.passHash ? user : null, migrated: false };
  }
  const legacyPass = String(user.pass || '');
  if (!legacyPass || legacyPass !== plainPassword) return { user: null, migrated: false };
  const record = await createLocalPasswordRecord(plainPassword);
  user.passHash = record.hash;
  user.passSalt = record.salt;
  user.passAlgo = 'sha256-salted-v1';
  delete user.pass;
  return { user, migrated: true };
}

// --- Auth Flow Logic ---

function currentAuthMode() {
  return document.querySelector('.auth-panel')?.dataset.mode === 'register' ? 'register' : 'login';
}

export function handleAuthLoginTab() {
  if (currentAuthMode() === 'register') {
    setAuthMode('login');
    return;
  }
  loginAuth();
}

export function handleAuthRegisterTab() {
  if (currentAuthMode() !== 'register') {
    setAuthMode('register');
    return;
  }
  registerAuth();
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

export function setAuthMode(mode) {
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
  if (tt) tt.textContent = login ? 'Bienvenido de nuevo' : 'Crear cuenta';
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
  setAuthNote('');
  setupRegisterFieldUX();
  REGISTER_PASSWORD_STRENGTH_VISIBLE = false;
  if (login) {
    clearRegisterFieldErrors();
    updateRegisterPasswordStrengthUI('');
  } else {
    updateRegisterPasswordStrengthUI('');
  }
}

export function handleForgotPassword() {
  const input = document.getElementById('auth-forgot-email');
  if (input) input.value = authEmailKey(v('al-email'));
  setAuthNote(''); // Clear any existing auth note
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
  const profile = S.profile || {};
  return !profile.name || !profile.educationSection || !profile.teachingYear;
}

function finishAuthSession(user, options = {}) {
  const { openSetup = false, isNewAccount = false } = options;
  applySessionUser(user);
  ensureIndividualLicenseModel();
  persist();
  
  if (openSetup) {
    closeM('m-auth');
    openM('m-setup', { fromAuth: true });
  } else {
    closeM('m-auth');
    go('dashboard');
  }
}

// --- Main Auth Actions ---

export async function registerAuth() {
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
      finishAuthSession(user, { openSetup: true, isNewAccount: true });
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
      finishAuthSession(user, { openSetup: true, isNewAccount: true });
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
    finishAuthSession(user, { openSetup: true, isNewAccount: true });
    recordRegisterAttempt(true);
    toast('Cuenta local creada');
  }
}

export async function loginAuth() {
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
      await hydrateCloudStateForUser(user);
      rememberCurrentAuthAccessMode('email');
      ensureIndividualLicenseModel();
      finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth() });
      toast('Bienvenido');
    } catch (error) {
      if (localUser) {
        await hydrateLocalWorkspaceForUser(localUser);
        rememberCurrentAuthAccessMode('local');
        finishAuthSession(localUser, { openSetup: shouldOpenSetupAfterAuth() });
        toast('Entraste en modo local.', 'warning');
        return;
      }
      toast(window.EduGestCloud.friendlyError(error), true);
    }
  } else if (localUser) {
    await hydrateLocalWorkspaceForUser(localUser);
    rememberCurrentAuthAccessMode('local');
    finishAuthSession(localUser, { openSetup: shouldOpenSetupAfterAuth() });
    toast('Bienvenido');
  } else {
    toast('Credenciales incorrectas.', true);
  }
}

export async function authWithProvider(provider) {
  if (!canUseCloudAuth()) {
    toast('Acceso social no disponible en modo local.', true);
    return;
  }
  try {
    const user = await window.EduGestCloud.loginWithProvider(provider);
    if (user?.redirected) return;
    await hydrateCloudStateForUser(user);
    rememberCurrentAuthAccessMode(provider === 'facebook' ? 'facebook' : 'google');
    ensureIndividualLicenseModel();
    finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth(), isNewAccount: !!user?.isNewUser });
    toast('Bienvenido');
  } catch (error) {
    toast(window.EduGestCloud.friendlyError(error), true);
  }
}


/**
 * Initialize modular auth panel and register it to the global routing system.
 */
export function init() {
  window._renderPanel = () => {
    // Current state check
    const mode = S.currentPage === 'auth' ? (S.authMode || 'login') : 'login';
    setAuthMode(mode);
  };
  
  // Register handlers
  setupRegisterFieldUX();
}

// compatibility exports 
window.setAuthMode = setAuthMode;
window.handleAuthLoginTab = handleAuthLoginTab;
window.handleAuthRegisterTab = handleAuthRegisterTab;
window.loginAuth = loginAuth;
window.registerAuth = registerAuth;
window.authWithProvider = authWithProvider;
window.handleForgotPassword = handleForgotPassword;
window.submitForgotPassword = submitForgotPassword;
window.togglePasswordVisibility = (inputId, button) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  if (button) {
    const label = showing ? 'Mostrar contraseña' : 'Ocultar contraseña';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.classList.toggle('is-visible', !showing);
    const icon = button.querySelector('img');
    if (icon) {
      icon.src = showing ? '/assets/icons/vercontrasena.png' : '/assets/icons/ocultarcontrasena.png';
    }
  }
};

// Auto-init if we are currently on the auth page
if (S.currentPage === 'auth' || !window._renderPanel) {
  init();
}
