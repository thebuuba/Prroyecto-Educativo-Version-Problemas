/**
 * Integración con Servicios en la Nube (Firebase/Cloud).
 * --------------------------------------------------------------------------
 * Este módulo gestiona la autenticación con Firebase, la verificación de
 * dispositivos, el manejo de sesiones en la nube y la telemetría básica.
 */

import { EDUGEST_FIREBASE_CONFIG } from './config-firebase.js';

/** Versión de la SDK de Firebase utilizada */
const FIREBASE_VERSION = '12.7.0';

/** Claves requeridas para validar la configuración de Firebase */
const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'];

/** Promesa de inicialización única de Firebase */
let firebasePromise = null;

/** Llaves de almacenamiento local para rastreo de dispositivos */
const DEVICE_ID_STORAGE_KEY = 'eg_v3:device-id';
const DEVICE_SESSION_STORAGE_KEY = 'eg_v3:device-session-id';

/**
 * Obtiene la configuración de Firebase activa.
 * @returns {Object|null}
 */
export function getConfig() {
  return EDUGEST_FIREBASE_CONFIG || null;
}

/**
 * Verifica si Firebase está correctamente configurado con credenciales válidas.
 * @returns {boolean}
 */
export function isConfigured() {
  const config = getConfig();
  return !!config && REQUIRED_KEYS.every((key) => {
    const value = String(config[key] || '').trim();
    return value && !value.startsWith('REEMPLAZA_');
  });
}

/**
 * Traduce códigos de error técnicos de Firebase a mensajes amigables en español.
 * @param {Error|Object} error - Error capturado de Firebase.
 * @returns {string} Mensaje traducido.
 */
export function friendlyError(error) {
  const code = String(error?.code || '');
  const mapped = {
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/invalid-email': 'El correo no es válido.',
    'auth/invalid-credential': 'Credenciales incorrectas.',
    'auth/invalid-login-credentials': 'Credenciales incorrectas.',
    'auth/user-disabled': 'Tu cuenta está deshabilitada temporalmente.',
    'auth/configuration-not-found': 'Firebase Auth no está configurado. Activa Email/Password en Authentication.',
    'auth/operation-not-allowed': 'El acceso con Email/Password no está habilitado en Firebase.',
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
    'auth/invalid-api-key': 'La API key de Firebase no es válida.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Credenciales incorrectas.',
    'auth/weak-password': 'La contraseña es demasiado débil.',
    'auth/network-request-failed': 'No se pudo conectar con Firebase.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de acceso antes de completar el inicio de sesión.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Habilita popups e intenta otra vez.',
    'auth/cancelled-popup-request': 'Se canceló la solicitud de inicio de sesión.',
    'auth/account-exists-with-different-credential': 'Ese correo ya existe con otro método de acceso.',
    'auth/operation-not-supported-in-this-environment': 'Este navegador no permite este tipo de inicio de sesión.',
    'permission-denied': 'No tienes permisos para acceder a estos datos.',
    'functions/already-exists': 'Ese correo ya está registrado.',
    'functions/invalid-argument': 'Revisa los datos e intenta otra vez.',
    'functions/not-found': 'No encontramos una verificación pendiente para ese correo.',
    'functions/failed-precondition': 'La cuenta no está lista para esta acción.',
    'functions/resource-exhausted': 'Espera un momento antes de pedir otro código.',
    'functions/internal': 'El servicio de envío de códigos no está configurado todavía. Falta conectar Resend en Firebase Functions.',
    'functions/permission-denied': 'No pudimos autorizar este dispositivo. Revisa tu correo y verifica el código.',
    'functions/unavailable': 'Servicio temporalmente no disponible. Inténtalo en unos minutos.',
  };
  const message = String(error?.message || '').trim();
  return mapped[code] || message || 'Ocurrió un error al conectar con Firebase.';
}

/**
 * Normaliza un objeto de usuario de Firebase a un esquema estándar de EduGest.
 * @param {Object} user - Objeto User de Firebase.
 * @param {Object} [options] - Parámetros adicionales.
 * @returns {Object|null}
 */
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

/**
 * Realiza una copia profunda de un valor.
 * @param {any} value
 * @returns {any}
 */
export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Genera un ID aleatorio basado en el tiempo.
 * @param {string} [prefix=''] - Prefijo opcional.
 * @returns {string}
 */
export function randomId(prefix = '') {
  const body = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}${body}`;
}

/**
 * Normaliza el UserAgent para generar una etiqueta descriptiva del dispositivo.
 * @param {string} userAgent
 * @returns {string} Ej: "Chrome · macOS".
 */
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

/**
 * Recupera un valor de un almacenamiento web o crea uno nuevo si no existe.
 * @param {Storage} storage - localStorage/sessionStorage.
 * @param {string} key - Clave del ítem.
 * @param {string} prefix - Prefijo para generación aleatoria.
 * @returns {string}
 */
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

/**
 * Calcula el hash SHA-256 de una cadena si el navegador lo soporta, o cae a una suma de verificación rápida.
 * @param {string} value - Texto a hashear.
 * @returns {Promise<string>} Hash en hexadecimal.
 */
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

/**
 * Construye el contexto de huella digital del dispositivo local.
 * Útil para seguridad y registro de sesiones.
 * @returns {Promise<Object>}
 */
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

/**
 * Carga dinámicamente la SDK de Firebase e inicializa la aplicación y autenticación.
 * Implementa persistencia de sesión en el navegador.
 * @returns {Object|null} Instancias de Firebase inyectadas.
 */
export async function ensureFirebase() {
  if (!isConfigured()) return null;
  if (firebasePromise) return firebasePromise;

  firebasePromise = (async () => {
    const [appMod, authMod] = await Promise.all([
      import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
      import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    ]);

    const app = appMod.initializeApp(getConfig());
    const auth = authMod.getAuth(app);
    auth.languageCode = 'es';
    try {
      await authMod.setPersistence(auth, authMod.browserLocalPersistence);
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

/**
 * Guarda los metadatos extendidos del perfil del usuario (Placeholder para sincronización).
 */
export async function saveUserProfile(user, extraProfile = {}) {
  return true;
}

/**
 * Envía un correo de recuperación de contraseña vía Firebase.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function sendPasswordReset(email) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no está configurado.');

  const { authMod, auth } = services;
  await authMod.sendPasswordResetEmail(auth, email);
  return true;
}

/**
 * Consulta qué métodos de autenticacion están registrados para un correo.
 * @returns {Promise<Array<string>>}
 */
export async function getSignInMethodsForEmail(email) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no está configurado.');
  const cleanEmail = String(email || '').trim();
  if (!cleanEmail) return [];
  const { authMod, auth } = services;
  const methods = await authMod.fetchSignInMethodsForEmail(auth, cleanEmail);
  return Array.isArray(methods) ? methods : [];
}

/**
 * Realiza una inspección profunda de la cuenta por correo para determinar proveedores disponibles.
 */
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

/**
 * Registra una sesión de dispositivo en el backend (Hook de expansión).
 */
export async function registerDeviceSession(options = {}) {
  void options;
  return null;
}

/**
 * Inicia el proceso de verificación de dispositivo (Hook de expansión).
 */
export async function startDeviceVerification(options = {}) {
  void options;
  return null;
}

/**
 * Verifica un código de dispositivo (Hook de expansión).
 */
export async function verifyDeviceVerificationCode(code = '') {
  void code;
  return true;
}

/**
 * Lista las medidas de seguridad de la cuenta activa (Hook de expansión).
 */
export async function listAccountSecurity() {
  return null;
}

/**
 * Revoca la confianza en un dispositivo.
 */
export async function revokeTrustedDevice(deviceIdHash = '') {
  void deviceIdHash;
  return null;
}

/**
 * Termina una sesión activa de forma remota.
 */
export async function terminateSession(sessionId = '') {
  void sessionId;
  return null;
}

/**
 * Informa sobre señales sospechosas detectadas localmente.
 */
export async function reportSuspiciousSignal(payload = {}) {
  void payload;
  return null;
}

/**
 * Inicia el pago vía Paddle (Hook de expansión).
 */
export async function createPaddleCheckout(priceId, options = {}) {
  void priceId;
  void options;
  return null;
}

/**
 * Abre el portal de gestión de suscripciones de Paddle.
 */
export async function createPaddleCustomerPortal(returnUrl = '') {
  void returnUrl;
  return null;
}

/**
 * Registra un nuevo usuario con correo y contraseña.
 * Actualiza el perfil con el nombre proporcionado.
 * @returns {Promise<Object>} Usuario normalizado.
 */
export async function register(email, password, name) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no está configurado.');

  const { authMod, auth } = services;
  const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await authMod.updateProfile(cred.user, { displayName: name });
  }
  const user = auth.currentUser || cred.user;
  saveUserProfile(user, { name });
  return normalizeUser(user, { isNewUser: true });
}

/**
 * Inicia sesión con correo y contraseña.
 * Realiza una validación cruzada si la cuenta requiere otro proveedor (Google/FB).
 * @returns {Promise<Object>} Usuario normalizado.
 */
export async function login(email, password) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no está configurado.');

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

/**
 * Inicia sesión utilizando un proveedor externo (Google o Facebook).
 * Utiliza ventanas emergentes (Popup) con fallback a redirección.
 * @param {string} providerName - 'google' o 'facebook'.
 * @returns {Promise<Object>}
 */
export async function loginWithProvider(providerName) {
  const services = await ensureFirebase();
  if (!services) throw new Error('Firebase no está configurado.');

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

/**
 * Elimina la cuenta del usuario actualmente autenticado en Firebase.
 */
export async function deleteCurrentUser() {
  const services = await ensureFirebase();
  if (!services) return false;
  const user = services.auth.currentUser;
  if (!user) return true;
  await services.authMod.deleteUser(user);
  return true;
}

/**
 * Cierra la sesión activa en el proveedor de nube.
 */
export async function logout() {
  const services = await ensureFirebase();
  if (!services) return false;
  await services.authMod.signOut(services.auth);
  return true;
}

/**
 * Obtiene el usuario actualmente autenticado esperando a que se resuelva el estado inicial.
 */
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
