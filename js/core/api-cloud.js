/**
 * Integracion con Supabase Auth.
 * --------------------------------------------------------------------------
 * Mantiene la fachada `EduGestCloud` que ya usa la app, pero reemplaza la
 * implementacion anterior por Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { EDUGEST_SUPABASE_CONFIG } from './config-supabase.js';

const REQUIRED_KEYS = ['url', 'anonKey'];
let supabaseClientPromise = null;

const DEVICE_ID_STORAGE_KEY = 'eg_v3:device-id';
const DEVICE_SESSION_STORAGE_KEY = 'eg_v3:device-session-id';
const OAUTH_RETURN_STORAGE_KEY = 'eg_v3:oauth-return';

export function getConfig() {
  return EDUGEST_SUPABASE_CONFIG || null;
}

export function isConfigured() {
  const config = getConfig();
  return !!config && REQUIRED_KEYS.every((key) => {
    const value = String(config[key] || '').trim();
    return value && !value.startsWith('REEMPLAZA_');
  });
}

export function friendlyError(error) {
  const code = String(error?.code || error?.status || '').trim();
  const message = String(error?.message || '').trim();
  const lower = message.toLowerCase();
  const mapped = {
    email_exists: 'Ese correo ya esta registrado.',
    user_already_exists: 'Ese correo ya esta registrado.',
    invalid_credentials: 'Credenciales incorrectas.',
    email_not_confirmed: 'Debes confirmar tu correo antes de iniciar sesion.',
    weak_password: 'La contrasena es demasiado debil.',
    validation_failed: 'Revisa los datos e intenta de nuevo.',
    over_email_send_rate_limit: 'Espera un momento antes de pedir otro correo.',
    provider_disabled: 'Este proveedor no esta habilitado en Supabase.',
  };
  if (mapped[code]) return mapped[code];
  if (lower.includes('already registered') || lower.includes('already exists')) return 'Ese correo ya esta registrado.';
  if (lower.includes('invalid login credentials')) return 'Credenciales incorrectas.';
  if (lower.includes('email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesion.';
  if (lower.includes('password')) return message;
  return message || 'Ocurrio un error al conectar con Supabase.';
}

export function normalizeUser(user, options = {}) {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  const name = metadata.full_name || metadata.name || user.email?.split('@')?.[0] || '';
  return {
    id: user.id,
    uid: user.id,
    email: user.email || '',
    name,
    displayName: name,
    emailVerified: !!user.email_confirmed_at || !!user.confirmed_at,
    isNewUser: !!options.isNewUser,
    authMode: 'supabase',
  };
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function randomId(prefix = '') {
  const body = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}${body}`;
}

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

export async function ensureSupabase() {
  if (!isConfigured()) return null;
  if (supabaseClientPromise) return supabaseClientPromise;

  supabaseClientPromise = Promise.resolve(createClient(getConfig().url, getConfig().anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'aulabase:supabase-auth',
    },
    global: {
      headers: { 'x-application-name': 'aulabase' },
    },
  })).catch((error) => {
    console.error('[EduGest][cloud] No se pudo inicializar Supabase', error);
    supabaseClientPromise = null;
    throw error;
  });

  return supabaseClientPromise;
}

export async function saveUserProfile(user, extraProfile = {}) {
  void user;
  void extraProfile;
  return true;
}

export async function sendPasswordReset(email) {
  const supabase = await ensureSupabase();
  if (!supabase) throw new Error('Supabase no esta configurado.');
  const redirectTo = `${window.location.origin}/`;
  const { error } = await supabase.auth.resetPasswordForEmail(String(email || '').trim(), { redirectTo });
  if (error) throw error;
  return true;
}

export async function getSignInMethodsForEmail(email) {
  void email;
  return [];
}

export async function inspectEmailAccount(email) {
  return {
    email: String(email || '').trim(),
    methods: [],
    hasPassword: false,
    hasGoogle: false,
    hasFacebook: false,
    exists: false,
  };
}

export async function registerDeviceSession(options = {}) {
  void options;
  return null;
}

export async function startDeviceVerification(options = {}) {
  void options;
  return null;
}

export async function verifyDeviceVerificationCode(code = '') {
  void code;
  return true;
}

export async function listAccountSecurity() {
  return null;
}

export async function revokeTrustedDevice(deviceIdHash = '') {
  void deviceIdHash;
  return null;
}

export async function terminateSession(sessionId = '') {
  void sessionId;
  return null;
}

export async function reportSuspiciousSignal(payload = {}) {
  void payload;
  return null;
}

export async function createPaddleCheckout(priceId, options = {}) {
  void priceId;
  void options;
  return null;
}

export async function createPaddleCustomerPortal(returnUrl = '') {
  void returnUrl;
  return null;
}

export async function register(email, password, name) {
  const supabase = await ensureSupabase();
  if (!supabase) throw new Error('Supabase no esta configurado.');

  const { data, error } = await supabase.auth.signUp({
    email: String(email || '').trim(),
    password,
    options: {
      data: {
        full_name: String(name || '').trim(),
        name: String(name || '').trim(),
      },
    },
  });
  if (error) throw error;
  return {
    ...normalizeUser(data.user, { isNewUser: true }),
    hasSession: !!data?.session,
    requiresEmailConfirmation: !data?.session,
  };
}

export async function login(email, password) {
  const supabase = await ensureSupabase();
  if (!supabase) throw new Error('Supabase no esta configurado.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || '').trim(),
    password,
  });
  if (error) throw error;
  return normalizeUser(data.user, { isNewUser: false });
}

export async function loginWithProvider(providerName) {
  const supabase = await ensureSupabase();
  if (!supabase) throw new Error('Supabase no esta configurado.');

  const provider = String(providerName || '').trim().toLowerCase();
  if (!['google', 'facebook'].includes(provider)) {
    throw new Error(`Proveedor no soportado: ${providerName}`);
  }

  try {
    window.sessionStorage?.setItem?.(OAUTH_RETURN_STORAGE_KEY, provider);
  } catch (_) {
    // El marcador solo mejora la navegacion post-OAuth; el login sigue funcionando sin storage.
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
    },
  });
  if (error) throw error;
  return { redirected: true, provider };
}

export async function deleteCurrentUser() {
  throw new Error('Eliminar cuentas requiere una ruta segura de backend con service role de Supabase.');
}

export async function logout() {
  const supabase = await ensureSupabase();
  if (!supabase) return false;
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
  return true;
}

export async function getAccessToken() {
  const supabase = await ensureSupabase();
  if (!supabase) return '';
  const { data, error } = await supabase.auth.getSession();
  if (error) return '';
  return String(data?.session?.access_token || '').trim();
}

export async function getCurrentUser() {
  const supabase = await ensureSupabase();
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return normalizeUser(sessionData.session.user);
  return normalizeUser(data.user || sessionData.session.user);
}

export async function bindAuthStateChanged() {
  const supabase = await ensureSupabase();
  if (!supabase) return null;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    window.dispatchEvent(new CustomEvent('supabase:auth-state-changed', {
      detail: { user: normalizeUser(session?.user || null) },
    }));
  });
  return data?.subscription || null;
}
