/**
 * Conexion de eventos DOM del panel de autenticacion.
 */

import { S } from '../../../core/state.js';
import {
  applySessionUser,
  persistBrowserSession,
  readBrowserSession,
} from '../../../core/hydration.js';
import { forceCloseM } from '../../../core/ui.js';
import { establecerAuthMode } from './auth-mode.js';
import { mostrarTableroAutenticado } from './session-flow.js';

let cloudAuthStateBound = false;

function bindInlineButton(selector, handler) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach((button) => {
    button.removeAttribute('onclick');
    button.addEventListener('click', handler);
  });
  return buttons.length;
}

function bindAuthModeSwitch() {
  const switchLink = document.getElementById('auth-switch-link');
  if (!switchLink || switchLink.dataset.bound) return;
  switchLink.dataset.bound = '1';
  switchLink.addEventListener('click', () => {
    const isCurrentlyLogin = document.querySelector('.auth-panel')?.dataset.mode === 'login';
    establecerAuthMode(isCurrentlyLogin ? 'register' : 'login');
  });
}

function bindCloudAuthState() {
  if (cloudAuthStateBound) return;
  cloudAuthStateBound = true;

  window.EduGestCloud?.bindAuthStateChanged?.().catch((error) => {
    console.warn('[AuthPanel] No se pudo enlazar Supabase Auth:', error);
  });

  window.addEventListener('supabase:auth-state-changed', async (event) => {
    const user = event.detail.user;

    if (user && !S.sessionUserId) {
      try {
        await applySessionUser(user);
        persistBrowserSession();

        if (typeof window.persist === 'function') {
          await window.persist({ immediate: true });
        }

        const authModal = document.getElementById('m-auth');
        if (authModal && authModal.classList.contains('open')) {
          forceCloseM('m-auth');
        }

        mostrarTableroAutenticado();
      } catch (error) {
        console.error('[AuthPanel] Error restaurando sesión:', error);
      }
      return;
    }

    if (user && S.sessionUserId) {
      persistBrowserSession();
      if (document.getElementById('m-auth')?.classList.contains('open')) {
        mostrarTableroAutenticado();
      }
      return;
    }

    if (!user && S.sessionUserId) {
      const browserSession = readBrowserSession();
      if (browserSession?.uid === S.sessionUserId) {
        persistBrowserSession();
        if (document.getElementById('m-auth')?.classList.contains('open')) {
          mostrarTableroAutenticado();
        }
        return;
      }

      if (typeof window.clearBrowserSession === 'function') window.clearBrowserSession();
      S.sessionUserId = null;
      S.sessionUserName = null;
      if (typeof window.persist === 'function') {
        await window.persist({ immediate: true });
      }
    }
  });
}

export function setupAuthButtonListeners({
  autenticarUsuario,
  registrarUsuario,
  autenticarConProveedor,
  manejarForgotPassword,
}) {
  bindInlineButton('button[onclick="loginAuth()"]', autenticarUsuario);
  bindInlineButton('button[onclick="registerAuth()"]', registrarUsuario);
  bindInlineButton('button[onclick="authWithProvider(\'google\')"]', () => autenticarConProveedor('google'));
  bindInlineButton('button[onclick="authWithProvider(\'facebook\')"]', () => autenticarConProveedor('facebook'));
  bindInlineButton('button[onclick="authWithProvider(\'github\')"]', () => autenticarConProveedor('github'));
  bindInlineButton('button[onclick="handleForgotPassword()"]', manejarForgotPassword);
  bindAuthModeSwitch();
  bindCloudAuthState();
}
