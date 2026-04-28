/** Cliente HTTP base para la API SQL/RDS. */

const DEFAULT_BASE_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:4000';

export function getBaseUrl() {
  const runtime = String(window.localStorage?.getItem('aulabase:sql-api-base-url') || '').trim();
  if (runtime) return runtime.replace(/\/+$/, '');
  return DEFAULT_BASE_URL.replace(/\/+$/, '');
}

export function isEnabled() {
  return !!getBaseUrl();
}

export async function request(path, options = {}) {
  const baseUrl = getBaseUrl();
  const authHeaders = {};
  try {
    const token = await window.EduGestCloud?.getAccessToken?.();
    if (token) authHeaders.Authorization = `Bearer ${token}`;
  } catch (_) {
    // La cookie legacy del backend sigue funcionando como respaldo.
  }
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    const message = String(payload?.message || `SQL API error (${response.status})`).trim();
    throw new Error(message);
  }

  return payload;
}
