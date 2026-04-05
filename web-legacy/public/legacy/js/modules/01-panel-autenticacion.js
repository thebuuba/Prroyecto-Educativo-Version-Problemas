/* AUTOGENERADO: no editar directamente.
 * Fuente: js/modules/00-core-state-and-utils.js (bloque de autenticación extraído)
 */

// Actualiza set autenticación nota.
function setAuthNote(message = '', tone = 'info', options = {}) {
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
let AUTH_CORNER_TOAST_TIMER = 0;
// Gestiona show autenticación corner toast.
function showAuthCornerToast(message = '', title = 'Aviso', tone = 'info') {
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
// Normaliza normalizar autenticación access mode.
function normalizeAuthAccessMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  if (value === 'google') return 'google';
  if (value === 'facebook') return 'facebook';
  if (value === 'local') return 'local';
  if (value === 'email') return 'email';
  return '';
}
// Gestiona autenticación access mode label.
function authAccessModeLabel(mode) {
  const normalized = normalizeAuthAccessMode(mode);
  if (normalized === 'google') return 'Google';
  if (normalized === 'facebook') return 'Facebook';
  if (normalized === 'local') return 'Local (sincronización limitada)';
  if (normalized === 'email') return 'Email y contraseña';
  return 'No disponible';
}
// Gestiona remember actual autenticación access mode.
function rememberCurrentAuthAccessMode(mode) {
  const normalized = normalizeAuthAccessMode(mode);
  if (!normalized) return;
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  S.profile.authAccessMode = normalized;
}
// Gestiona reset register code flujo.
function resetRegisterCodeFlow(clearCode = true) {
  const code = document.getElementById('ar-code');
  const registerBtn = document.getElementById('auth-register-submit');
  if (code && clearCode) code.value = '';
  if (registerBtn) {
    registerBtn.innerHTML = 'Registrarse <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
  }
}
// Gestiona autenticación email key.
function authEmailKey(email) {
  return String(email || '').trim().toLowerCase();
}
// Gestiona format ms to min sec.
function formatMsToMinSec(ms = 0) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}
// Lee read register rate estado.
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
// Persiste persistir register rate estado.
function persistRegisterRateState(state) {
  try {
    window.localStorage.setItem(REGISTER_RATE_LIMIT.key, JSON.stringify({
      attempts: Array.isArray(state?.attempts) ? state.attempts : [],
      blockedUntil: Number(state?.blockedUntil) || 0,
    }));
  } catch (_) {
    // ignore storage errors
  }
}
// Gestiona evaluate register rate limit.
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
// Gestiona record register attempt.
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
// Obtiene get register strength meta.
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
// Valida validar register password.
function validateRegisterPassword(password = '') {
  const pass = String(password || '');
  if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) return 'La contraseña debe incluir letras y números.';
  return '';
}
// Actualiza set register field error.
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
// Gestiona clear register field errors.
function clearRegisterFieldErrors() {
  ['ar-name', 'ar-email', 'ar-pass', 'ar-pass2'].forEach((id) => setRegisterFieldError(id, ''));
  const termsError = document.getElementById('ar-terms-error');
  if (termsError) {
    termsError.hidden = true;
    termsError.textContent = '';
  }
}
let REGISTER_PASSWORD_STRENGTH_VISIBLE = false;
// Actualiza actualizar register password strength interfaz.
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
// Actualiza configuración inicial register field ux.
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
// Crea crear local password salt.
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
// Comprueba si tiene hash local password.
async function hashLocalPassword(password, salt) {
  const raw = `${salt}::${String(password || '')}`;
  if (window.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(raw)));
}
// Crea crear local password record.
async function createLocalPasswordRecord(password) {
  const salt = createLocalPasswordSalt();
  const hash = await hashLocalPassword(password, salt);
  return { salt, hash };
}
// Resuelve resolver local autenticación usuario.
async function resolveLocalAuthUser(email, password) {
  const user = S.authUsers.find((entry) => authEmailKey(entry.email) === email);
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
// Gestiona actual autenticación mode.
function currentAuthMode() {
  return document.querySelector('.auth-panel')?.dataset.mode === 'register' ? 'register' : 'login';
}
// Procesa procesar autenticación login tab.
function handleAuthLoginTab() {
  if (currentAuthMode() === 'register') {
    setAuthMode('login');
    return;
  }
  loginAuth();
}
// Procesa procesar autenticación register tab.
function handleAuthRegisterTab() {
  if (currentAuthMode() !== 'register') {
    setAuthMode('register');
    return;
  }
  registerAuth();
}
// Gestiona animate autenticación panel.
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
// Gestiona animate autenticación chrome.
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
// Gestiona transition autenticación panels.
function transitionAuthPanels(showLogin) {
  const loginBox = document.getElementById('auth-login-box');
  const registerBox = document.getElementById('auth-register-box');
  if (loginBox) loginBox.style.display = showLogin ? '' : 'none';
  if (registerBox) registerBox.style.display = showLogin ? 'none' : '';
  animateAuthPanel(showLogin ? loginBox : registerBox, showLogin ? 'left' : 'right');
  animateAuthChrome(showLogin ? 'left' : 'right');
}
// Actualiza set autenticación mode.
function setAuthMode(mode) {
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
  if (switchLink) {
    switchLink.textContent = login ? 'Regístrate' : 'Inicia sesión';
    switchLink.onclick = login ? handleAuthRegisterTab : handleAuthLoginTab;
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
// Procesa procesar forgot password.
function handleForgotPassword() {
  openForgotPasswordModal();
}
// Actualiza set forgot password nota.
function setForgotPasswordNote(message = '', tone = 'info', title = '') {
  const note = document.getElementById('auth-forgot-note');
  const noteTitle = document.getElementById('auth-forgot-note-title');
  const noteText = document.getElementById('auth-forgot-note-text');
  if (!note || !noteTitle || !noteText) return;
  const msg = String(message || '').trim();
  if (!msg) {
    note.hidden = true;
    note.className = 'auth-note info';
    noteTitle.textContent = '';
    noteText.textContent = '';
    return;
  }
  note.hidden = false;
  note.className = `auth-note ${tone}`;
  noteTitle.textContent = title || '';
  noteText.textContent = msg;
}
// Abre abrir forgot password modal.
function openForgotPasswordModal() {
  const input = document.getElementById('auth-forgot-email');
  if (input) input.value = authEmailKey(v('al-email'));
  setForgotPasswordNote('');
  openM('m-auth-forgot');
  window.setTimeout(() => input?.focus(), 30);
}
// Cierra cerrar forgot password modal.
function closeForgotPasswordModal() {
  setForgotPasswordNote('');
  closeM('m-auth-forgot');
}
// Gestiona inspect cloud email account.
async function inspectCloudEmailAccount(email) {
  if (!canUseCloudAuth() || !window.EduGestCloud?.inspectEmailAccount) return null;
  try {
    const info = await window.EduGestCloud.inspectEmailAccount(email);
    debugAuthFlow('inspect-email', {
      email,
      methods: info?.methods || [],
      exists: !!info?.exists,
      hasPassword: !!info?.hasPassword,
      hasGoogle: !!info?.hasGoogle,
      hasFacebook: !!info?.hasFacebook,
    });
    return info;
  } catch (error) {
    debugAuthFlow('inspect-email-error', {
      email,
      errorCode: String(error?.code || ''),
      errorMessage: String(error?.message || ''),
    });
    return null;
  }
}
// Gestiona login error mensaje from inspector.
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
// Gestiona register error mensaje from inspector.
function registerErrorMessageFromInspector(accountInfo) {
  if (!accountInfo) {
    return 'No se pudo completar el registro. Inténtalo de nuevo.';
  }
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
// Orquesta la recuperacion de contraseña y normaliza los mensajes para no exponer de mas el estado de la cuenta.
async function submitForgotPassword() {
  const email = authEmailKey(v('auth-forgot-email'));
  if (!email) {
    setForgotPasswordNote('Escribe el correo de tu cuenta para continuar.', 'warn', 'Falta el correo');
    return;
  }
  if (!email.includes('@')) {
    setForgotPasswordNote('Revisa el correo e inténtalo otra vez.', 'warn', 'Correo inválido');
    return;
  }
  if (!canUseCloudAuth()) {
    setForgotPasswordNote('La recuperación automática solo está disponible cuando Firebase está configurado.', 'warn', 'No disponible en modo local');
    return;
  }
  try {
    await window.EduGestCloud.sendPasswordReset(email);
    setForgotPasswordNote(`Te enviamos un enlace de recuperación a ${email}. Revisa también la carpeta de spam.`, 'info', 'Correo enviado');
    toast('Enlace de recuperación enviado');
  } catch (error) {
    const code = String(error?.code || '').trim();
    if (code === 'auth/invalid-email') {
      const message = 'El correo no es válido. Revísalo e inténtalo de nuevo.';
      setForgotPasswordNote(message, 'warn', 'Correo inválido');
      toast(`${message}`, true);
      return;
    }
    if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
      const message = 'La recuperación de contraseña no está configurada todavía en Firebase Authentication.';
      setForgotPasswordNote(message, 'error', 'Configuración pendiente');
      toast(`${message}`, true);
      return;
    }
    // Mensaje neutro anti-enumeración: no bloquea al usuario aunque Firebase no revele estado de cuenta.
    const neutral = `Si ${email} está registrado, recibirás un enlace de recuperación en unos minutos.`;
    setForgotPasswordNote(neutral, 'info', 'Solicitud enviada');
    toast('Revisa tu correo para recuperar acceso');
  }
}
// Usa Firebase Auth directo como plan B cuando el bridge principal no esta disponible en esta build.
async function loginWithProviderFallback(providerName) {
  const config = window.EDUGEST_FIREBASE_CONFIG || null;
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const isConfigured = !!config && requiredKeys.every((key) => {
    const value = String(config[key] || '').trim();
    return value && !value.startsWith('REEMPLAZA_');
  });
  if (!isConfigured) {
    throw new Error('Firebase no esta configurado.');
  }

  const [appMod, authMod] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js'),
  ]);

  const app = appMod.getApps?.().length ? appMod.getApp() : appMod.initializeApp(config);
  const auth = authMod.getAuth(app);
  auth.languageCode = 'es';
  try {
    await authMod.setPersistence(auth, authMod.browserSessionPersistence);
  } catch (_) {
    await authMod.setPersistence(auth, authMod.inMemoryPersistence);
  }
  void authMod.getRedirectResult(auth).catch(() => null);

  const normalized = String(providerName || '').trim().toLowerCase();
  let provider = null;
  if (normalized === 'google') {
    provider = new authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
  } else if (normalized === 'facebook') {
    provider = new authMod.FacebookAuthProvider();
  } else {
    throw new Error(`Proveedor no soportado: ${providerName}`);
  }

  try {
    const cred = await authMod.signInWithPopup(auth, provider);
    const user = auth.currentUser || cred.user;
    return window.EduGestCloud?.normalizeUser ? window.EduGestCloud.normalizeUser(user, { isNewUser: !!cred?.additionalUserInfo?.isNewUser }) : {
      id: user?.uid || '',
      uid: user?.uid || '',
      email: user?.email || '',
      name: user?.displayName || '',
      emailVerified: !!user?.emailVerified,
      isNewUser: !!cred?.additionalUserInfo?.isNewUser,
    };
  } catch (error) {
    const code = String(error?.code || '').trim();
    const shouldRedirect = new Set([
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/operation-not-supported-in-this-environment',
    ]).has(code);
    if (!shouldRedirect) throw error;
    await authMod.signInWithRedirect(auth, provider);
    return { redirected: true, provider: normalized };
  }
}
// Alterna alternar password visibility.
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  if (button) {
    const label = showing ? 'Mostrar contraseña' : 'Ocultar contraseña';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.classList.toggle('is-visible', !showing);
    // Reinicia la microanimacion para que se vea en cada clic.
    button.classList.remove('is-reacting');
    void button.offsetWidth;
    button.classList.add('is-reacting');
    const icon = button.querySelector('img');
    if (icon) {
      icon.src = showing
        ? '/assets/icons/vercontrasena.png'
        : '/assets/icons/ocultarcontrasena.png';
    }
  }
}
// Asegura asegurar individual license model.
function ensureIndividualLicenseModel() {
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  const current = S.profile.accountLicense && typeof S.profile.accountLicense === 'object'
    ? S.profile.accountLicense
    : {};
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
// Actualiza set device verification nota.
function setDeviceVerificationNote(message = '', tone = 'info', title = '') {
  void message;
  void tone;
  void title;
}
// Abre abrir device verification modal.
function openDeviceVerificationModal(copy = '') {
  void copy;
}
// Gestiona clear device verification flujo.
function clearDeviceVerificationFlow() {
  DEVICE_VERIFICATION_FLOW.pendingUser = null;
  DEVICE_VERIFICATION_FLOW.pendingAfterLogin = false;
  DEVICE_VERIFICATION_FLOW.pendingMaskedEmail = '';
  DEVICE_VERIFICATION_FLOW.pendingSource = 'login';
}
// Comprueba si tiene has pending device verification.
function hasPendingDeviceVerification() {
  return !!DEVICE_VERIFICATION_FLOW.pendingUser;
}
// Comprueba si is device verification service unavailable.
function isDeviceVerificationServiceUnavailable(error) {
  const code = String(error?.code || '').trim();
  const message = String(error?.message || '').toLowerCase();
  if (code === 'functions/internal' || code === 'functions/unavailable') return true;
  if (message === 'internal') return true;
  return message.includes('resend')
    || message.includes('servicio de envio de codigos')
    || message.includes('device verification service unavailable');
}
// Gestiona continue sesión after security verification.
async function continueSessionAfterSecurityVerification() {
  clearDeviceVerificationFlow();
}
// Gestiona enforce trusted sesión.
async function enforceTrustedSession(user, options = {}) {
  void user;
  void options;
  return { ok: true, requiresVerification: false };
}
// Gestiona confirm pending device verification.
async function confirmPendingDeviceVerification() {
  clearDeviceVerificationFlow();
}
// Gestiona resend pending device verification code.
async function resendPendingDeviceVerificationCode() {
  clearDeviceVerificationFlow();
}
// Gestiona cancel pending device verification.
async function cancelPendingDeviceVerification() {
  clearDeviceVerificationFlow();
  await logoutAuth();
}
// Cierra el flujo de autenticacion, persiste la sesion y redirige al setup o al dashboard segun el estado del perfil.
function finishAuthSession(user, options = {}) {
  const { openSetup = false, isNewAccount = false } = options;
  applySessionUser(user);
  ensureIndividualLicenseModel();
  debugAuthFlow('session:finish', {
    uid: user?.id || null,
    email: user?.email || '',
    openSetup: !!openSetup,
    isNewAccount: !!isNewAccount,
    hasProfile: !!(S.profile && typeof S.profile === 'object'),
  });
  persist();
  closeProfileMenu();
  if (requiresTermsAcceptance()) {
    TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept = !!openSetup;
    TERMS_ACCEPTANCE_FLOW.revokeOnDecline = !!isNewAccount;
    openM('m-auth');
    setAuthMode('login');
    forceCloseM('m-education-section');
    forceCloseM('m-setup');
    openM('m-terms');
    return;
  }
  if (openSetup) {
    closeM('m-auth');
    openM('m-setup', { fromAuth: true });
    // Failsafe: keep the mandatory order profile -> education level.
    window.setTimeout(() => {
      if (requiresProfileSetupCompletion()) openM('m-setup', { fromAuth: true });
      else if (requiresEducationSectionSelection()) openEducationSectionSetup({ fromAuth: true });
    }, 260);
  } else {
    TERMS_ACCEPTANCE_FLOW.openSetupAfterAccept = false;
    TERMS_ACCEPTANCE_FLOW.revokeOnDecline = false;
    closeM('m-auth');
    closeM('m-education-section');
    closeM('m-setup');
    go('dashboard');
    updateSBUser();
  }
}
// Decide si, tras autenticarse, la cuenta debe completar perfil o seccion educativa antes de entrar al panel.
function shouldOpenSetupAfterAuth() {
  const profile = S.profile && typeof S.profile === 'object' ? S.profile : {};
  const educationSections = normalizeEducationSections(profile.educationSections || profile.educationSection || '');
  return educationSections.length === 0 || !isProfileSetupComplete(profile);
}
// Ejecuta el registro completo: valida campos, crea cuenta en Firebase o local y abre el onboarding requerido.
async function registerAuth() {
  const name = v('ar-name');
  const email = authEmailKey(v('ar-email'));
  const pass = (document.getElementById('ar-pass')?.value || '').trim();
  const pass2 = (document.getElementById('ar-pass2')?.value || '').trim();
  const termsChecked = !!document.getElementById('ar-terms-check')?.checked;
  clearRegisterFieldErrors();
  setupRegisterFieldUX();
  updateRegisterPasswordStrengthUI(pass);
  const limit = evaluateRegisterRateLimit();
  if (limit.blocked) {
    const wait = formatMsToMinSec(limit.remainingMs);
    setAuthNote(`Demasiados intentos de registro. Inténtalo de nuevo en ${wait}.`, 'warn', {
      title: 'Registro temporalmente pausado',
    });
    toast(`Registro temporalmente bloqueado (${wait})`, true);
    return;
  }
  if (!name || !email || !pass || !pass2) {
    if (!name) setRegisterFieldError('ar-name', 'Escribe tu nombre completo.');
    if (!email) setRegisterFieldError('ar-email', 'Escribe un correo válido.');
    if (!pass) setRegisterFieldError('ar-pass', 'Crea una contraseña segura.');
    if (!pass2) setRegisterFieldError('ar-pass2', 'Confirma tu contraseña.');
    showAuthCornerToast('Completa todos los campos para continuar.', 'Faltan datos', 'error');
    return;
  }
  if (!email.includes('@')) {
    setRegisterFieldError('ar-email', 'Revisa el formato del correo.');
    showAuthCornerToast('Revisa el formato del correo e inténtalo otra vez.', 'Correo inválido', 'error');
    return;
  }
  const passwordError = validateRegisterPassword(pass);
  if (passwordError) {
    setRegisterFieldError('ar-pass', passwordError);
    showAuthCornerToast(passwordError, 'Contraseña insegura', 'error');
    return;
  }
  if (pass !== pass2) {
    setRegisterFieldError('ar-pass2', 'Las contraseñas no coinciden.');
    showAuthCornerToast('Las contraseñas no coinciden.', 'Error en la confirmación', 'error');
    return;
  }
  if (!termsChecked) {
    const termsError = document.getElementById('ar-terms-error');
    if (termsError) {
      termsError.hidden = false;
      termsError.textContent = 'Debes aceptar los términos y la política de privacidad.';
    }
    showAuthCornerToast('Acepta los términos para continuar.', 'Términos pendientes', 'error');
    return;
  }
  const acceptedAt = nowIso();
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  S.profile.termsAccepted = true;
  S.profile.termsVersion = TERMS_VERSION;
  S.profile.termsAcceptedAt = acceptedAt;
  S.profile.privacyAcceptedAt = acceptedAt;
  if (canUseCloudAuth()) {
    try {
      debugAuthFlow('register:attempt', { email });
      const user = await window.EduGestCloud.register(email, pass, name);
      const gate = await enforceTrustedSession(user, { source: 'register', pendingAfterLogin: true });
      if (!gate.ok) {
        setAuthNote(
          gate.maskedEmail
            ? `Te enviamos un codigo de seguridad a ${gate.maskedEmail}. Verifica este dispositivo para continuar.`
            : 'Verifica este dispositivo con el codigo enviado a tu correo para continuar.',
          'warn',
          { title: 'Verificacion de dispositivo requerida' }
        );
        return;
      }
      if (gate.degradedSecurity) {
        debugAuthFlow('security:degraded-login', { source: 'login' });
      }
      rememberCurrentAuthAccessMode('email');
      replaceState();
      if (!gate.degradedSecurity) setAuthNote('');
      ensureIndividualLicenseModel();
      finishAuthSession(user, { openSetup: true, isNewAccount: true });
      toast('Cuenta creada');
      hydrateCloudStateForUser(user).catch((error) => {
        console.error('[EduGest][cloud] No se pudo hidratar el estado tras el registro', error);
      });
    } catch (error) {
      debugAuthFlow('register:error', {
        email,
        errorCode: String(error?.code || ''),
        errorMessage: String(error?.message || ''),
      });
      const code = String(error?.code || '').trim();
      if (code === 'auth/email-already-in-use') {
        const accountInfo = await inspectCloudEmailAccount(email);
        const message = registerErrorMessageFromInspector(accountInfo);
        recordRegisterAttempt(false);
        setRegisterFieldError('ar-email', 'Este correo ya está registrado.');
        setAuthNote('');
        showAuthCornerToast(message, 'Correo ya registrado', 'error');
        return;
      }
      if (!shouldFallbackToLocalAuth(error)) {
        recordRegisterAttempt(false);
        toast(`${window.EduGestCloud.friendlyError(error)}`, true);
        setAuthNote(window.EduGestCloud.friendlyError(error), 'error', {
          title: 'No se pudo crear la cuenta',
        });
        return;
      }
      if (S.authUsers.some(u => authEmailKey(u.email) === email)) {
        recordRegisterAttempt(false);
        setRegisterFieldError('ar-email', 'Este correo ya está registrado.');
        setAuthNote('');
        showAuthCornerToast('Ese correo ya está registrado en este dispositivo.', 'Correo ya registrado', 'error');
        return;
      }
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
        termsAccepted: true,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: acceptedAt,
        privacyAcceptedAt: acceptedAt,
      };
      S.authUsers.push(user);
      persistLocalAuthUsers();
      await hydrateLocalWorkspaceForUser(user);
      rememberCurrentAuthAccessMode('local');
      finishAuthSession(user, { openSetup: true, isNewAccount: true });
      recordRegisterAttempt(true);
      toast('Firebase no respondió. Entraste en modo local.', 'warning');
      return;
    }
    recordRegisterAttempt(true);
    return;
  }

  if (S.authUsers.some(u => authEmailKey(u.email) === email)) {
    recordRegisterAttempt(false);
    setRegisterFieldError('ar-email', 'Este correo ya está registrado.');
    setAuthNote('');
    showAuthCornerToast('Este correo ya está registrado. Inicia sesión o usa recuperación de contraseña.', 'Correo ya registrado', 'error');
    return;
  }
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
    termsAccepted: true,
    termsVersion: TERMS_VERSION,
    termsAcceptedAt: acceptedAt,
    privacyAcceptedAt: acceptedAt,
  };
  S.authUsers.push(user);
  persistLocalAuthUsers();
  await hydrateLocalWorkspaceForUser(user);
  rememberCurrentAuthAccessMode('local');
  finishAuthSession(user, { openSetup: true, isNewAccount: true });
  recordRegisterAttempt(true);
  toast('Cuenta creada');
}
// Intenta iniciar sesion por correo/clave y resuelve caidas a modo local cuando el proveedor remoto falla.
async function loginAuth() {
  const email = authEmailKey(v('al-email'));
  const pass = (document.getElementById('al-pass')?.value || '').trim();
  if (!email || !pass) {
    showAuthCornerToast('Completa correo y contraseña para entrar.', 'Faltan datos', 'error');
    return;
  }
  debugAuthFlow('login:attempt', { email });
  const localAuth = await resolveLocalAuthUser(email, pass);
  const localUser = localAuth.user;
  if (localAuth.migrated) persistLocalAuthUsers();

  if (canUseCloudAuth()) {
    let user = null;
    try {
      user = await window.EduGestCloud.login(email, pass);
    } catch (error) {
      debugAuthFlow('login:error', {
        email,
        errorCode: String(error?.code || ''),
        errorMessage: String(error?.message || ''),
      });
      if (localUser) {
        await hydrateLocalWorkspaceForUser(localUser);
        rememberCurrentAuthAccessMode('local');
        finishAuthSession(localUser, { openSetup: shouldOpenSetupAfterAuth() });
        toast('Entraste en modo local con esta cuenta guardada.', 'warning');
        return;
      }
      if (!shouldFallbackToLocalAuth(error)) {
        const code = String(error?.code || '').trim();
        let message = window.EduGestCloud.friendlyError(error);
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          const accountInfo = await inspectCloudEmailAccount(email);
          message = loginErrorMessageFromInspector(accountInfo);
        }
        toast(`${message}`, true);
        setAuthNote(message, 'error', {
          title: 'No se pudo iniciar sesión',
        });
        return;
      }
      if (!localUser) {
        toast('Firebase no respondió y no existe una cuenta local con esos datos.', true);
        return;
      }
      await hydrateLocalWorkspaceForUser(localUser);
      rememberCurrentAuthAccessMode('local');
      finishAuthSession(localUser, { openSetup: shouldOpenSetupAfterAuth() });
      toast('Entraste en modo local porque Firebase no respondió.', 'warning');
      return;
    }
    let gate = null;
    try {
      gate = await enforceTrustedSession(user, { source: 'login', pendingAfterLogin: true });
      if (!gate.ok) {
        setAuthNote(
          gate.maskedEmail
            ? `Te enviamos un codigo de seguridad a ${gate.maskedEmail}. Verifica este dispositivo para continuar.`
            : 'Verifica este dispositivo con el codigo enviado a tu correo para continuar.',
          'warn',
          { title: 'Verificacion de dispositivo requerida' }
        );
        return;
      }
      if (gate.degradedSecurity) {
        debugAuthFlow('security:degraded-register', { source: 'register' });
      }
    } catch (error) {
      const message = window.EduGestCloud.friendlyError(error);
      setAuthNote(message, 'error', {
        title: 'No se pudo validar la seguridad de la sesion',
      });
      toast(`${message}`, true);
      try {
        await window.EduGestCloud.logout();
      } catch (_) {}
      return;
    }
    await hydrateCloudStateForUser(user);
    rememberCurrentAuthAccessMode('email');
    ensureIndividualLicenseModel();
    finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth() });
    if (!gate?.degradedSecurity) setAuthNote('');
    toast('Bienvenido');
    return;
  }

  const user = localUser;
  if (!user) { toast('Credenciales incorrectas', true); return; }
  await hydrateLocalWorkspaceForUser(user);
  rememberCurrentAuthAccessMode('local');
  finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth() });
  toast('Bienvenido');
}
// Maneja el acceso social con Google/Facebook, incluyendo redirect fallback y validaciones post-login.
async function authWithProvider(provider) {
  const providerLabel = provider === 'facebook' ? 'Facebook' : 'Google';
  try {
    toast(`Abriendo acceso con ${providerLabel}...`);
    const cloud = window.EduGestCloud;
    const user = cloud?.loginWithProvider
      ? await cloud.loginWithProvider(provider)
      : await loginWithProviderFallback(provider);
    if (user?.redirected) {
      setAuthNote(`Te redirigimos a ${providerLabel} para continuar con el acceso.`, 'info', {
        title: 'Redirección iniciada',
      });
      return;
    }
    const gate = await enforceTrustedSession(user, { source: `provider:${provider}`, pendingAfterLogin: true });
    if (!gate.ok) {
      setAuthNote(
        gate.maskedEmail
          ? `Te enviamos un codigo de seguridad a ${gate.maskedEmail}. Verifica este dispositivo para continuar.`
          : 'Verifica este dispositivo con el codigo enviado a tu correo para continuar.',
        'warn',
        { title: 'Verificacion de dispositivo requerida' }
      );
      return;
    }
    if (gate.degradedSecurity) {
      debugAuthFlow('security:degraded-provider', { source: `provider:${provider}` });
    }
    await hydrateCloudStateForUser(user);
    rememberCurrentAuthAccessMode(provider === 'facebook' ? 'facebook' : 'google');
    ensureIndividualLicenseModel();
    finishAuthSession(user, { openSetup: shouldOpenSetupAfterAuth(), isNewAccount: !!user?.isNewUser });
    if (!gate?.degradedSecurity) setAuthNote('');
    toast(`Acceso con ${providerLabel} completado`);
  } catch (error) {
    const code = String(error?.code || '').trim();
    const providerConfigError = code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found';
    const message = providerConfigError
      ? `El acceso con ${providerLabel} no está configurado en Firebase Authentication.`
      : (window.EduGestCloud?.friendlyError?.(error) || 'No se pudo iniciar sesión.');
    toast(`${message}`, true);
    setAuthNote(message, 'error', {
      title: `No se pudo iniciar sesión con ${providerLabel}`,
    });
  }
}

Object.assign(window, {
  loginAuth,
  registerAuth,
  authWithProvider,
  handleForgotPassword,
});
