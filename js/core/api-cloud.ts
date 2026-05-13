/**
 * Integracion con Supabase Auth.
 * --------------------------------------------------------------------------
 * Mantiene la fachada `EduGestCloud` que ya usa la app, pero reemplaza la
 * implementacion anterior por Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { EDUGEST_SUPABASE_CONFIG } from './config-supabase.ts';

type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

type AuthUserLike = {
  id?: string;
  email?: string;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

type AuthOptions = {
  isNewUser?: boolean;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'> | null | undefined;
type AnyRecord = Record<string, unknown>;

const REQUIRED_KEYS = ['url', 'anonKey'];
let supabaseClientPromise: Promise<any> | null = null;

const DEVICE_ID_STORAGE_KEY = 'eg_v3:device-id';
const DEVICE_SESSION_STORAGE_KEY = 'eg_v3:device-session-id';
const OAUTH_RETURN_STORAGE_KEY = 'eg_v3:oauth-return';
const PRODUCTION_APP_ORIGIN = 'https://aula-base.vercel.app';
const OAUTH_CALLBACK_PATH = '/auth/callback';

function isLocalAppHost(hostname = ''): boolean {
  const clean = String(hostname || '').trim().toLowerCase();
  return clean === 'localhost' || clean === '127.0.0.1' || clean === '::1';
}

function getOAuthRedirectTo(): string {
  const explicitUrl = String(import.meta.env?.VITE_APP_URL || window.EDUGEST_APP_URL || '').trim();
  if (explicitUrl) {
    try {
      return `${new URL(explicitUrl).origin}${OAUTH_CALLBACK_PATH}`;
    } catch (_) {
      // Si la variable viene mal formada, usamos el origen seguro de abajo.
    }
  }

  const hostname = String(window.location.hostname || '').trim();
  if (isLocalAppHost(hostname)) {
    return `${window.location.origin}${OAUTH_CALLBACK_PATH}`;
  }

  if (hostname === 'aula-base.vercel.app') {
    return `${PRODUCTION_APP_ORIGIN}${OAUTH_CALLBACK_PATH}`;
  }

  return `${window.location.origin}${OAUTH_CALLBACK_PATH}`;
}

export function getConfig(): SupabasePublicConfig | null {
  return EDUGEST_SUPABASE_CONFIG || null;
}

export function isConfigured(): boolean {
  const config = getConfig();
  return !!config && REQUIRED_KEYS.every((key) => {
    const value = String(config[key] || '').trim();
    return value && !value.startsWith('REEMPLAZA_');
  });
}

export function friendlyError(error: any): string {
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

export function normalizeUser(user: AuthUserLike | null | undefined, options: AuthOptions = {}) {
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

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function randomId(prefix = ''): string {
  const body = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}${body}`;
}

export function normalizeDeviceLabel(userAgent = ''): string {
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

export function readOrCreateStorageValue(storage: StorageLike, key: string, prefix: string): string {
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

export async function sha256Hex(value = ''): Promise<string> {
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

export async function buildDeviceContext(): Promise<AnyRecord> {
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

export async function ensureSupabase(): Promise<any | null> {
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

export async function saveUserProfile(user: unknown, extraProfile: AnyRecord = {}): Promise<boolean> {
  void user;
  void extraProfile;
  return true;
}

export async function sendPasswordReset(email: string): Promise<boolean> {
  const supabase = await ensureSupabase();
  if (!supabase) throw new Error('Supabase no esta configurado.');
  const redirectTo = `${window.location.origin}/`;
  const { error } = await supabase.auth.resetPasswordForEmail(String(email || '').trim(), { redirectTo });
  if (error) throw error;
  return true;
}

export async function getSignInMethodsForEmail(email: string): Promise<string[]> {
  void email;
  return [];
}

export async function inspectEmailAccount(email: string): Promise<AnyRecord> {
  return {
    email: String(email || '').trim(),
    methods: [],
    hasPassword: false,
    hasGoogle: false,
    hasFacebook: false,
    exists: false,
  };
}

export async function registerDeviceSession(options: AnyRecord = {}): Promise<null> {
  void options;
  return null;
}

export async function startDeviceVerification(options: AnyRecord = {}): Promise<null> {
  void options;
  return null;
}

export async function verifyDeviceVerificationCode(code = ''): Promise<boolean> {
  void code;
  return true;
}

export async function listAccountSecurity(): Promise<null> {
  return null;
}

export async function revokeTrustedDevice(deviceIdHash = ''): Promise<null> {
  void deviceIdHash;
  return null;
}

export async function terminateSession(sessionId = ''): Promise<null> {
  void sessionId;
  return null;
}

export async function reportSuspiciousSignal(payload: AnyRecord = {}): Promise<null> {
  void payload;
  return null;
}

export async function createPaddleCheckout(priceId: string, options: AnyRecord = {}): Promise<null> {
  void priceId;
  void options;
  return null;
}

export async function createPaddleCustomerPortal(returnUrl = ''): Promise<null> {
  void returnUrl;
  return null;
}

export async function register(email: string, password: string, name: string): Promise<AnyRecord> {
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

export async function login(email: string, password: string) {
  const supabase = await ensureSupabase();
  if (!supabase) throw new Error('Supabase no esta configurado.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || '').trim(),
    password,
  });
  if (error) throw error;
  return normalizeUser(data.user, { isNewUser: false });
}

export async function loginWithProvider(providerName: string): Promise<AnyRecord> {
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
      redirectTo: getOAuthRedirectTo(),
      queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
    },
  });
  if (error) throw error;
  return { redirected: true, provider };
}

export async function deleteCurrentUser(): Promise<never> {
  throw new Error('Eliminar cuentas requiere una ruta segura de backend con service role de Supabase.');
}

export async function logout(): Promise<boolean> {
  const supabase = await ensureSupabase();
  if (!supabase) return false;
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
  return true;
}

export async function getAccessToken(): Promise<string> {
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
  // Para el arranque visual usamos la sesión persistida localmente. `getUser()`
  // valida contra red y puede dejar la SPA en splash varios segundos.
  return normalizeUser(sessionData.session.user);
}

export async function bindAuthStateChanged(): Promise<any | null> {
  const supabase = await ensureSupabase();
  if (!supabase) return null;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    window.dispatchEvent(new CustomEvent('supabase:auth-state-changed', {
      detail: { user: normalizeUser(session?.user || null) },
    }));
  });
  return data?.subscription || null;
}
