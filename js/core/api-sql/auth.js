/** Endpoints de autenticacion de la API SQL. */

import { request } from './client.js';

export async function registerSqlAuth(email, password, name) {
  const payload = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  return {
    ...(payload?.user || {}),
    id: payload?.user?.id || payload?.user?.uid || '',
    uid: payload?.user?.uid || payload?.user?.id || '',
    name: payload?.user?.name || payload?.user?.displayName || name || '',
    email: payload?.user?.email || email || '',
    isNewUser: true,
    authMode: 'sql',
  };
}

export async function loginSqlAuth(email, password) {
  const payload = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return {
    ...(payload?.user || {}),
    id: payload?.user?.id || payload?.user?.uid || '',
    uid: payload?.user?.uid || payload?.user?.id || '',
    name: payload?.user?.name || payload?.user?.displayName || '',
    email: payload?.user?.email || email || '',
    isNewUser: !!payload?.isNewUser,
    authMode: 'sql',
  };
}

export async function logoutSqlAuth() {
  return request('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });
}

export async function getSqlAuthSession() {
  return request('/api/auth/session');
}

export async function sendSqlPasswordReset(email) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
