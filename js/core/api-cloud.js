import { EDUGEST_FIREBASE_CONFIG } from './config-firebase.js';

const FIREBASE_VERSION = '12.7.0';
const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'];
let firebasePromise = null;
const DEVICE_ID_STORAGE_KEY = 'eg_v3:device-id';
const DEVICE_SESSION_STORAGE_KEY = 'eg_v3:device-session-id';

// Obtiene get config.
export function getConfig() {
  return EDUGEST_FIREBASE_CONFIG || null;
}

// Comprueba si is configured.
export function isConfigured() {
  const config = getConfig();
  return !!config && REQUIRED_KEYS.every((key) => {
    const value = String(config[key] || '').trim();
    return value && !value.startsWith('REEMPLAZA_');
  });
}

// Gestiona friendly error.
export function friendlyError(error) {
  const code = String(error?.code || '');
  const mapped = {
    'auth/email-already-in-use': 'Ese correo ya esta registrado.',
    'auth/invalid-email': 'El correo no es valido.',
    'auth/invalid-credential': 'Credenciales incorrectas.',
    'auth/invalid-login-credentials': 'Credenciales incorrectas.',
    'auth/user-disabled': 'Tu cuenta esta deshabilitada temporalmente.',
    'auth/configuration-not-found': 'Firebase Auth no esta configurado. Activa Email/Password en Authentication.',
    'auth/operation-not-allowed': 'El acceso con Email/Password no esta habilitado en Firebase.',
    'auth/unauthorized-domain': 'Este dominio no esta autorizado en Firebase Authentication.',
    'auth/invalid-api-key': 'La API key de Firebase no es valida.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Credenciales incorrectas.',
    'auth/weak-password': 'La contrasena es demasiado debil.',
    'auth/network-request-failed': 'No se pudo conectar con Firebase.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de acceso antes de completar el inicio de sesion.',
    'auth/popup-blocked': 'El navegador bloqueo la ventana emergente. Habilita popups e intenta otra vez.',
    'auth/cancelled-popup-request': 'Se cancelo la solicitud de inicio de sesion.',
    'auth/account-exists-with-different-credential': 'Ese correo ya existe con otro metodo de acceso.',
    'auth/operation-not-supported-in-this-environment': 'Este navegador no permite este tipo de inicio de sesion.',
    'permission-denied': 'No tienes permisos para acceder a estos datos.',
    'functions/already-exists': 'Ese correo ya esta registrado.',
    'functions/invalid-argument': 'Revisa los datos e intenta otra vez.',
    'functions/not-found': 'No encontramos una verificacion pendiente para ese correo.',
    'functions/failed-precondition': 'La cuenta no esta lista para esta accion.',
    'functions/resource-exhausted': 'Espera un momento antes de pedir otro codigo.',
    'functions/internal': 'El servicio de envio de codigos no esta configurado todavia. Falta conectar Resend en Firebase Functions.',
    'functions/permission-denied': 'No pudimos autorizar este dispositivo. Revisa tu correo y verifica el codigo.',
    'functions/unavailable': 'Servicio temporalmente no disponible. Intentalo en unos minutos.',
  };
  const message = String(error?.message || '').trim();
  return mapped[code] || message || 'Ocurrio un error al conectar con Firebase.';
}

// Normaliza normalizar usuario.
export function normalizeUser(user, options = {}) {
  if (!user) return null;
  return {
    id: user.uid,
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || '',
    emailVerified: !!user.emailVerified,
    isNewUser: !!options.isNewUser,
  };
}

// Gestiona clone.
export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Gestiona random id.
export function randomId(prefix = '') {
  const body = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}${body}`;
}

// Normaliza normalizar device label.
export function normalizeDeviceLabel(userAgent = '') {
  const ua = String(userAgent || '').toLowerCase();
  const browser = ua.includes('edg/')
    ? 'Edge'
    : ua.includes('chrome/')
      ? 'Chrome'
      : ua.includes('firefox/')
        ? 'Firefox'
        : ua.includes('safari/') && !ua.includes('chrome/')
          ? 'Safari'
          : 'Navegador';
  const os = ua.includes('windows')
    ? 'Windows'
    : ua.includes('android')
      ? 'Android'
      : ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')
        ? 'iOS'
        : ua.includes('mac os')
          ? 'macOS'
          : ua.includes('linux')
            ? 'Linux'
            : 'SO';
  return `${browser} · ${os}`;
}

// Lee read or crear storage valor.
export function readOrCreateStorageValue(storage, key, prefix) {
  try {
    const existing = String(storage?.getItem?.(key) || '').trim();
    if (existing) return existing;
    const created = randomId(prefix);
    storage?.setItem?.(key, created);
    return created;
  } catch (_) {
    return randomId(prefix);
  }
}

// Gestiona sha256 hex.
export async function sha256Hex(value = '') {
  const clean = String(value || '');
  if (window.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(clean);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((part) => part.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let idx = 0; idx < clean.length; idx += 1) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(idx);
    hash |= 0;
  }
  return `legacy-${Math.abs(hash)}`;
}

// Construye construir device contexto.
export async function buildDeviceContext() {
  const deviceId = readOrCreateStorageValue(window.localStorage, DEVICE_ID_STORAGE_KEY, 'dv_');
  const sessionId = readOrCreateStorageValue(window.sessionStorage, DEVICE_SESSION_STORAGE_KEY, 'ss_');
  const userAgent = String(window.navigator?.userAgent || '');
  const language = String(window.navigator?.language || 'es-DO');
  const timezone = String(Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo');
  const fingerprintRaw = [deviceId, userAgent, language, timezone].join('::');
  const deviceIdHash = await sha256Hex(fingerprintRaw);
  return {
    deviceId,
    deviceIdHash,
    sessionId,
    userAgent,
    language,
    timezone,
    deviceLabel: normalizeDeviceLabel(userAgent),
    platform: String(window.navigator?.platform || ''),
  };
}

// Asegura asegurar firebase.
export async function ensureFirebase() {
  if (!isConfigured()) return null;
  if (firebasePromise) return firebasePromise;

  firebasePromise = (async () => {
    const [appMod, authMod] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    ]);

    const app = appMod.initializeApp(getConfig());
    const auth = authMod.getAuth(app);
    auth.languageCode = 'es';
    try {
      await authMod.setPersistence(auth, authMod.browserSessionPersistence);
    } catch (_) {
      await authMod.setPersistence(auth, authMod.inMemoryPersistence);
    }
    void authMod.getRedirectResult(auth).catch(() => null);
    return { appMod, authMod, app, auth };
  })().catch((error) => {
    console.error('[EduGest][cloud] No se pudo inicializar Firebase', error);
    firebasePromise = null;
    throw error;
  });

  return firebasePromise;
}

// Guarda guardar usuario perfil.
export async function saveUserProfile(user, extraProfile = {}) {
  return true;
}

// Gestiona send password reset.
export async function sendPasswordReset(email) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no esta configurado.');

  const { authMod, auth } = services;
  await authMod.sendPasswordResetEmail(auth, email);
  return true;
}

// Obtiene get sign in methods for email.
export async function getSignInMethodsForEmail(email) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no esta configurado.');
  const cleanEmail = String(email || '').trim();
  if (!cleanEmail) return [];
  const { authMod, auth } = services;
  const methods = await authMod.fetchSignInMethodsForEmail(auth, cleanEmail);
  return Array.isArray(methods) ? methods : [];
}

// Gestiona inspect email account.
export async function inspectEmailAccount(email) {
  const methods = await getSignInMethodsForEmail(email);
  const normalized = methods.map((entry) => String(entry || '').trim()).filter(Boolean);
  return {
    email: String(email || '').trim(),
    methods: normalized,
    hasPassword: normalized.includes('password') || normalized.includes('emailLink'),
    hasGoogle: normalized.includes('google.com'),
    hasFacebook: normalized.includes('facebook.com'),
    exists: normalized.length > 0,
  };
}

// Gestiona register device sesión.
export async function registerDeviceSession(options = {}) {
  void options;
  return null;
}

// Gestiona start device verification.
export async function startDeviceVerification(options = {}) {
  void options;
  return null;
}

// Gestiona verify device verification code.
export async function verifyDeviceVerificationCode(code = '') {
  void code;
  return true;
}

// Gestiona lista account security.
export async function listAccountSecurity() {
  return null;
}

// Gestiona revoke trusted device.
export async function revokeTrustedDevice(deviceIdHash = '') {
  void deviceIdHash;
  return null;
}

// Gestiona terminate sesión.
export async function terminateSession(sessionId = '') {
  void sessionId;
  return null;
}

// Registra registrar suspicious signal.
export async function reportSuspiciousSignal(payload = {}) {
  void payload;
  return null;
}

// Crea crear paddle checkout.
export async function createPaddleCheckout(priceId, options = {}) {
  void priceId;
  void options;
  return null;
}

// Crea crear paddle customer portal.
export async function createPaddleCustomerPortal(returnUrl = '') {
  void returnUrl;
  return null;
}

// Gestiona register.
export async function register(email, password, name) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no esta configurado.');

  const { authMod, auth } = services;
  const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await authMod.updateProfile(cred.user, { displayName: name });
  }
  const user = auth.currentUser || cred.user;
  saveUserProfile(user, { name });
  return normalizeUser(user, { isNewUser: true });
}

// Gestiona login.
export async function login(email, password) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no esta configurado.');

  const { authMod, auth } = services;
  try {
    const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
    return normalizeUser(auth.currentUser || cred.user, { isNewUser: false });
  } catch (error) {
    const code = String(error?.code || '').trim();
    const shouldCheckMethods = code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found';
    if (!shouldCheckMethods) throw error;

    const methods = await authMod.fetchSignInMethodsForEmail(auth, String(email || '').trim().toLowerCase());
    if (Array.isArray(methods) && methods.length && !methods.includes('password')) {
      const providerLabel = methods.includes('google.com')
        ? 'Google'
        : methods.includes('facebook.com')
          ? 'Facebook'
          : 'otro método';
      const providerError = new Error(`Esta cuenta está registrada con ${providerLabel}. Inicia sesión usando ese botón.`);
      providerError.code = 'auth/account-exists-with-different-credential';
      throw providerError;
    }
    throw error;
  }
}

// Gestiona login with provider.
export async function loginWithProvider(providerName) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no esta configurado.');

  const { authMod, auth } = services;
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
    saveUserProfile(user, { name: user?.displayName || '' });
    return normalizeUser(user, { isNewUser: !!cred?.additionalUserInfo?.isNewUser });
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

// Elimina eliminar actual usuario.
export async function deleteCurrentUser() {
  const services = await ensureFirebase();
  if (!services) return false;
  const user = services.auth.currentUser;
  if (!user) return true;
  await services.authMod.deleteUser(user);
  return true;
}

// Gestiona logout.
export async function logout() {
  const services = await ensureFirebase();
  if (!services) return false;
  await services.authMod.signOut(services.auth);
  return true;
}

// Obtiene get actual usuario.
export async function getCurrentUser() {
  const services = await ensureFirebase();
  if (!services) return null;
  if (services.auth.currentUser) return normalizeUser(services.auth.currentUser);
  return new Promise((resolve) => {
    const unsubscribe = services.authMod.onAuthStateChanged(
      services.auth,
      (user) => {
        unsubscribe();
        resolve(normalizeUser(user));
      },
      () => {
        unsubscribe();
        resolve(normalizeUser(services.auth.currentUser));
      }
    );
  });
}
